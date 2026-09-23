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
      // We want the zoom/fade animation to complete over the first 2.5 viewports of scrolling
      const animScrollable = window.innerHeight * 2.5
      // progress: 0 = scene top at viewport top, 1 = scrolled 2.5vh
      const progress = clamp(-rect.top / animScrollable)

      // ── Phase 4: Sri Lanka Zoom (triggered by Highlights section)
      let sriLankaZoom = 0
      const highlightsEl = document.getElementById('highlights-section')
      if (highlightsEl) {
        const hRect = highlightsEl.getBoundingClientRect()
        // Trigger as soon as highlights section enters viewport, finish when it reaches center
        const distance = window.innerHeight * 0.8
        sriLankaZoom = smoothstep(clamp((window.innerHeight - hRect.top) / distance))
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
      const asiaScale = 0.85 + asiaReveal * 0.20 + (sriLankaZoom * 4.5)
      // Adjusted drift to better target Sri Lanka (down and left on the map -> move map UP and RIGHT)
      const asiaDriftX = sriLankaZoom * 32 // push right 
      const asiaDriftY = sriLankaZoom * -38 // push up 
      // Add a 3D dive angle to the Asia map as it zooms
      const asiaRotateX = sriLankaZoom * 35 // Tilt back
      const asiaRotateZ = sriLankaZoom * -5 // Slight spin
      
      // ── Phase 5: Sri Lanka map cross-fade and 3D tilt
      // Triggers in the second half of the Phase 4 Sri Lanka zoom
      const slMapReveal = smoothstep(segment(sriLankaZoom, 0.4, 1.0))
      
      // Asia map fades out as Sri Lanka map fades in
      const asiaOpacity = ((asiaReveal * 0.35) + (sriLankaZoom * 0.15)) * (1 - slMapReveal)
      
      const slOpacity = slMapReveal * 0.4 // Max opacity for Sri Lanka map
      const slScale = 0.8 + slMapReveal * 0.3
      // RotateX reduced from 55 to 35 so it doesn't get too flat/unrecognizable
      const slRotateX = 35
      const slRotateZ = -5

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
        sriLankaRef.current.style.transform = `perspective(1000px) translate(-50%, -50%) rotateX(${slRotateX}deg) rotateZ(${slRotateZ}deg) scale(${slScale})`
        sriLankaRef.current.style.opacity = String(slOpacity)
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
              <p className="font-mono text-lg font-medium tracking-[0.3em] text-[#0074FF] uppercase drop-shadow-md md:text-xl">
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

            <p className="max-w-2xl font-[family-name:var(--font-space)] text-lg leading-relaxed font-light text-neutral-300 drop-shadow-lg md:text-xl">
              The ultimate <strong className="font-semibold text-white">12-hour</strong> online
              algorithmic coding competition.{' '}
              <br className="hidden md:block" />
              Step into the arena and run it all from one secure workspace.
            </p>

            {/* CTA Buttons */}
            <div className="mt-14 flex flex-col gap-5 sm:flex-row">
              <a
                href="/register"
                className="group relative inline-flex overflow-hidden rounded-full border border-[#0074FF]/50 bg-black/80 px-10 py-5 font-[family-name:var(--font-space)] text-sm font-bold tracking-[0.2em] text-[#0074FF] uppercase shadow-[0_0_30px_rgba(0,116,255,0.2)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-[#0074FF] hover:text-white hover:shadow-[0_0_50px_rgba(0,116,255,0.5)] items-center"
              >
                <span className="relative z-10 flex items-center gap-3 drop-shadow-[0_0_8px_rgba(0,116,255,0.8)] transition-all duration-500 group-hover:drop-shadow-none">
                  Register Now
                  <svg className="h-5 w-5 transition-transform duration-500 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
                <div className="absolute inset-0 z-0 -translate-x-full bg-[#0074FF] transition-transform duration-500 ease-out group-hover:translate-x-0" />
              </a>

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
