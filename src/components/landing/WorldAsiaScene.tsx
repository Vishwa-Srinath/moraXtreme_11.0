'use client'

import { useEffect, useRef } from 'react'
import styles from './WorldAsiaScene.module.css'

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value))
}

/** Map a value from [start..end] → [0..1] */
function segment(progress: number, start: number, end: number): number {
  return clamp((progress - start) / (end - start))
}

/** Smooth Hermite interpolation: slow-fast-slow easing */
function smoothstep(t: number): number {
  const x = clamp(t)
  return x * x * (3 - 2 * x)
}

export default function WorldAsiaScene({ children }: { children?: React.ReactNode }) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<HTMLImageElement>(null)
  const asiaRef = useRef<HTMLImageElement>(null)
  const sriLankaRef = useRef<HTMLImageElement>(null)
  const worldVintageRef = useRef<HTMLImageElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const scrollHintRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let rafId = 0

    const tick = () => {
      rafId = 0

      const rect = scene.getBoundingClientRect()
      // We want the zoom/fade animation to complete over the first 3.5 viewports of scrolling (slower)
      const animScrollable = window.innerHeight * 3.5
      // progress: 0 = scene top at viewport top, 1 = scrolled 2.5vh
      const progress = clamp(-rect.top / animScrollable)

      // ── Phase 4: Sri Lanka Zoom (triggered by Highlights section)
      let sriLankaZoom = 0
      const highlightsEl = document.getElementById('highlights')
      if (highlightsEl) {
        const hRect = highlightsEl.getBoundingClientRect()
        // Start earlier and spread over a larger distance to make the transition slower
        // Start earlier and spread over a larger distance to make the transition slower
        const startOffset = window.innerHeight * 3.0
        const distance = window.innerHeight * 3.0
        sriLankaZoom = smoothstep(clamp((startOffset - hRect.top) / distance))
      }

      // ── Phase 5: Inside Sri Lanka (triggered by Timeline section)
      let timelineZoom = 0
      const timelineEl = document.getElementById('timeline')
      if (timelineEl) {
        const tRect = timelineEl.getBoundingClientRect()
        const startOffset = window.innerHeight * 1.5
        const distance = window.innerHeight * 2.0
        timelineZoom = smoothstep(clamp((startOffset - tRect.top) / distance))
      }

      // ── Phase 6: Zoom out to World Map (triggered by Why Participate section)
      let worldZoomOut = 0
      const whyJoinEl = document.getElementById('why-join')
      if (whyJoinEl) {
        const wRect = whyJoinEl.getBoundingClientRect()
        // Increase startOffset and distance drastically to make the transition very slow and smooth
        // Increase startOffset and distance drastically to make the transition very slow and smooth
        const startOffset = window.innerHeight * 4.5
        const distance = window.innerHeight * 3.5
        worldZoomOut = smoothstep(clamp((startOffset - wRect.top) / distance))
      }

      // ── Phase 7: Deep dive into Western Province (triggered by Crew section)
      let deepZoom = 0
      const crewEl = document.getElementById('crew')
      if (crewEl) {
        const cRect = crewEl.getBoundingClientRect()
        // Start as crew section approaches
        // Start as crew section approaches, spread over long distance
        const startOffset = window.innerHeight * 2.5
        const distance = window.innerHeight * 2.5
        deepZoom = smoothstep(clamp((startOffset - cRect.top) / distance))
      }

      // ── Phase 1: World zooms in toward Asia (0% → 60%)
      const approach = smoothstep(segment(progress, 0.0, 0.60))
      // ── Phase 2: Asia map fades in while world fades out (45% → 82%)
      const asiaReveal = smoothstep(segment(progress, 0.45, 0.82))
      // ── Phase 3: Hero text fades/rises early (0% → 45%)
      const heroExit = smoothstep(segment(progress, 0.08, 0.45))
      // ── Scroll hint fades immediately on scroll start (0% → 15%)
      const scrollHintFade = smoothstep(segment(progress, 0.0, 0.15))

      // World: scale 1 → 2.4, drift slightly toward Asia region (upper-right)
      const worldScale = reduceMotion ? 1 : 1 + approach * 1.4
      const worldDriftX = reduceMotion ? 0 : approach * 8   // % drift right
      const worldDriftY = reduceMotion ? 0 : approach * -5  // % drift up
      const worldRotate = reduceMotion ? 0 : approach * -3  // degrees
      // World fades out completely (to 0 opacity) as Asia fades in
      const worldOpacity = 1 - asiaReveal

      // Asia map: scales up 0.85 → 1.05 as it fades in, then zooms massively to Sri Lanka
      const asiaScale = 0.85 + asiaReveal * 0.20 + (sriLankaZoom * 7.5) // Increased zoom
      // Adjusted drift to better target Sri Lanka
      const asiaDriftX = sriLankaZoom * 45 // push right 
      const asiaDriftY = sriLankaZoom * -52 // push up 
      // Add a 3D dive angle to the Asia map as it zooms
      const asiaRotateX = sriLankaZoom * 35 // Tilt back
      const asiaRotateZ = sriLankaZoom * -5 // Slight spin
      
      // ── Phase 5: Sri Lanka map cross-fade and 3D tilt
      // Triggers in the second half of the Phase 4 Sri Lanka zoom
      const slMapReveal = smoothstep(segment(sriLankaZoom, 0.4, 1.0))
      
      // Asia map fades out as Sri Lanka map fades in
      const asiaOpacity = ((asiaReveal * 0.35) + (sriLankaZoom * 0.15)) * (1 - slMapReveal)
      
      // Sri Lanka map opacity: fades out for Phase 6, fades back in for Phase 7
      const slOpacity = Math.max(
        (slMapReveal * 0.4 - (timelineZoom * 0.25)) * (1 - worldZoomOut),
        deepZoom * 0.6
      )
      
      // Sri Lanka scale & transforms
      const slBaseScale = 0.8 + slMapReveal * 0.3 + (timelineZoom * 6.0)
      const slScale = slBaseScale * (1 - deepZoom) + (deepZoom * 32.0) // ultra massive zoom into Colombo
      
      const slBaseRotateX = 35 + (timelineZoom * -15)
      const slRotateX = slBaseRotateX * (1 - deepZoom) + (deepZoom * 50) // tilt back more for depth
      
      const slBaseRotateZ = -5 + (timelineZoom * 5)
      const slRotateZ = slBaseRotateZ * (1 - deepZoom) + (deepZoom * -5)
      
      const slTranslateX = -50 + (deepZoom * 55) // move map significantly right to target West Coast
      const slTranslateY = -50 + (deepZoom * -35) // move map up slightly to target Colombo

      // ── Phase 6: Zoom Out to Vintage World Map
      // Fades out when Phase 7 deep zoom starts
      const wvOpacity = worldZoomOut * 0.5 * (1 - deepZoom)
      // Start very zoomed in (6.0), scale down to 2.0 (so it doesn't fully zoom out)
      const wvScale = 6.0 - (worldZoomOut * 4.0)
      // Start tilted, flatten out
      const wvRotateX = 35 - (worldZoomOut * 35)

      // Hero content: translates upward and fades out
      const heroOpacity = 1 - heroExit
      const heroTranslateY = heroExit * -60 // px

      // Write directly to DOM for maximum performance (no React re-renders)
      if (worldRef.current) {
        worldRef.current.style.transform = `translate(calc(-50% + ${worldDriftX}%), calc(-50% + ${worldDriftY}%)) scale(${worldScale}) rotate(${worldRotate}deg)`
        worldRef.current.style.opacity = String(worldOpacity)
      }

      if (asiaRef.current) {
        asiaRef.current.style.transform = `perspective(1000px) translate(calc(-50% + ${asiaDriftX}%), calc(-50% + ${asiaDriftY}%)) rotateX(${asiaRotateX}deg) rotateZ(${asiaRotateZ}deg) scale(${asiaScale})`
        asiaRef.current.style.opacity = String(asiaOpacity)
      }
      
      if (sriLankaRef.current) {
        // Apply a perspective wrapper via transform to get a nice 3D tilt
        sriLankaRef.current.style.transform = `perspective(1000px) translate(${slTranslateX}%, ${slTranslateY}%) rotateX(${slRotateX}deg) rotateZ(${slRotateZ}deg) scale(${slScale})`
        sriLankaRef.current.style.opacity = String(slOpacity)
        // Make the Sri Lanka map a bit glowing white
        sriLankaRef.current.style.filter = 'brightness(1.6) contrast(1.3) drop-shadow(0 0 15px rgba(255,255,255,0.4))'
      }

      if (worldVintageRef.current) {
        worldVintageRef.current.style.transform = `perspective(1000px) translate(-50%, -50%) rotateX(${wvRotateX}deg) scale(${wvScale})`
        worldVintageRef.current.style.opacity = String(wvOpacity)
        // Screen blend mode removes the pure black background from the image!
        worldVintageRef.current.style.mixBlendMode = 'screen'
      }

      if (heroRef.current) {
        heroRef.current.style.opacity = String(heroOpacity)
        heroRef.current.style.transform = `translateY(${heroTranslateY}px)`
      }

      if (scrollHintRef.current) {
        scrollHintRef.current.style.opacity = String(1 - scrollHintFade)
      }
    }

    const scheduleRender = () => {
      if (!rafId) rafId = requestAnimationFrame(tick)
    }

    // Run once on mount to set initial state
    scheduleRender()

    window.addEventListener('scroll', scheduleRender, { passive: true })
    window.addEventListener('resize', scheduleRender)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', scheduleRender)
      window.removeEventListener('resize', scheduleRender)
    }
  }, [])

  return (
    <div ref={sceneRef} className={styles.scene}>
      <div className={styles.stickyStage}>

        {/* The rotating world globe */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={worldRef}
          src="/earth.gif"
          alt=""
          aria-hidden="true"
          className={styles.world}
          loading="eager"
        />

        {/* The Asia map that zooms into view */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={asiaRef}
          src="/asia-sketch.png"
          alt=""
          aria-hidden="true"
          className={styles.asia}
          loading="eager"
        />

        {/* Phase 5: Sri Lanka Map (cross-fades with Asia and tilts) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={sriLankaRef}
          src="/srilanka-sketch.png"
          alt=""
          aria-hidden="true"
          className={styles.sriLanka}
          loading="eager"
        />

        {/* Phase 6: Vintage World Map */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={worldVintageRef}
          src="/world-map.png"
          alt=""
          aria-hidden="true"
          className={styles.sriLanka} // reuse same absolute positioning class
          loading="eager"
        />

        {/* Edge vignette for cinematic depth */}
        <div className={styles.vignette} aria-hidden="true" />

        {/* Hero content: title, badges, buttons */}
        <div ref={heroRef} className={styles.heroContent}>
          <div className="flex flex-col items-center justify-center text-center">
            {/* Live badge */}
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-[#163E70] bg-black/60 px-5 py-2 font-mono text-xs font-semibold tracking-widest text-[#0074FF] backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span
                  className="absolute inline-flex h-full w-full rounded-full bg-[#0074FF] opacity-75"
                  style={{ animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }}
                />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0074FF]" />
              </span>
              REGISTRATIONS OPEN
            </div>

            {/* Main title */}
            <div className="mb-8 flex flex-col items-center justify-center gap-4">
              <p className="font-mono text-lg font-bold tracking-[0.3em] text-white uppercase drop-shadow-[0_0_15px_rgba(0,116,255,0.8)] md:text-xl">
                Welcome to
              </p>
              <h1
                className="flex flex-wrap justify-center gap-x-2 font-[family-name:var(--font-space)] text-6xl font-bold tracking-tighter text-white drop-shadow-2xl md:gap-x-4 md:text-8xl lg:text-[7rem]"
              >
                <span className="flex">
                  {['M','o','r','a','X','t','r','e','m','e'].map((letter, i) => (
                    <span
                      key={i}
                      style={{
                        display: 'inline-block',
                        opacity: 0,
                        animation: `textReveal 0.9s cubic-bezier(0.16,1,0.3,1) ${0.08 + i * 0.04}s forwards`,
                      }}
                    >
                      {letter}
                    </span>
                  ))}
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    opacity: 0,
                    animation: 'textReveal 1.1s cubic-bezier(0.16,1,0.3,1) 0.58s forwards',
                  }}
                >
                  <span className="bg-gradient-to-br from-[#0074FF] to-[#163E70] bg-clip-text text-transparent">
                    11.0
                  </span>
                </span>
              </h1>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col gap-5 sm:flex-row">
              {/* Register Button with Dynamic Pulsing Aura */}
              <div className="group relative">
                {/* Glowing pulsing aura behind the button */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-white/60 via-[#0074FF]/80 to-white/60 opacity-80 blur-xl animate-pulse group-hover:opacity-100 group-hover:blur-2xl transition duration-500"></div>
                
                <a
                  href="/register"
                  className="relative inline-flex overflow-hidden rounded-full border border-white/60 bg-[#0074FF]/20 px-12 py-6 font-[family-name:var(--font-space)] text-base font-black tracking-[0.25em] text-white uppercase shadow-[0_0_20px_rgba(255,255,255,0.4),inset_0_0_20px_rgba(255,255,255,0.3)] backdrop-blur-xl transition-all duration-500 group-hover:-translate-y-1 group-hover:border-white group-hover:bg-[#0074FF]/40 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.8),inset_0_0_30px_rgba(255,255,255,0.6)] items-center md:text-lg"
                >
                  <span className="relative z-10 flex items-center gap-4 drop-shadow-[0_0_15px_rgba(255,255,255,1)] transition-all duration-500 group-hover:drop-shadow-[0_0_25px_rgba(255,255,255,1)]">
                    Register Now
                    <svg className="h-6 w-6 transition-transform duration-500 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 z-0 -translate-x-full bg-white/20 transition-transform duration-500 ease-out group-hover:translate-x-0" />
                </a>
              </div>

              <a
                href="#about"
                className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/10 bg-transparent px-10 py-5 font-[family-name:var(--font-space)] text-sm font-bold tracking-[0.2em] text-neutral-400 uppercase backdrop-blur-md transition-all duration-300 hover:border-white/30 hover:bg-white/5 hover:text-white"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div ref={scrollHintRef} className={styles.scrollHint} aria-hidden="true">
          <span className={styles.scrollHintText}>Scroll</span>
          <span className={styles.scrollHintLine} />
        </div>
      </div>

      {/* Spacer to allow the scroll animation to play before content comes up */}
      <div style={{ height: '250vh' }} />

      {/* Content wrapper that will scroll up over the sticky background */}
      <div className="relative z-10 flex w-full flex-col items-center">
        {children}
      </div>
    </div>
  )
}
