"use client"

import { useEffect, useRef } from "react"
import styles from "./WorldAsiaScene.module.css"

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

export default function WorldAsiaScene({
  children,
}: {
  children?: React.ReactNode
}) {
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

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    let rafId = 0

    // For smooth interpolation (lerp)
    let currentScrollY = window.scrollY
    let targetScrollY = window.scrollY

    const tick = () => {
      // Lerp the scroll position (10% closer to target each frame)
      currentScrollY += (targetScrollY - currentScrollY) * 0.1

      // If we are close enough, snap to target to stop animating
      if (Math.abs(targetScrollY - currentScrollY) < 0.5) {
        currentScrollY = targetScrollY
        rafId = 0
      } else {
        rafId = requestAnimationFrame(tick)
      }

      // Calculate rect top using the lerped scroll position
      // We assume scene starts at the top of the page, or we offset it.
      // Since scene is at the top, its rect.top is exactly -currentScrollY
      const sceneTop = -currentScrollY

      // We want the zoom/fade animation to complete faster (over 1.8 viewports)
      const animScrollable = window.innerHeight * 1.8
      // progress: 0 = scene top at viewport top, 1 = scrolled 1.8vh
      const progress = clamp(-sceneTop / animScrollable)

      // ── Phase 4: Sri Lanka Zoom (triggered by Highlights section)
      let sriLankaZoom = 0
      const highlightsEl = document.getElementById("highlights")
      if (highlightsEl) {
        // Calculate original top relative to document, then apply lerped scroll
        const docTop = highlightsEl.getBoundingClientRect().top + window.scrollY
        const lerpedRectTop = docTop - currentScrollY
        // Start animation when highlights section is just about to enter the viewport (1.2vh)
        // and complete it over 1.5vh of scrolling
        const startOffset = window.innerHeight * 1.2
        const distance = window.innerHeight * 1.5
        sriLankaZoom = smoothstep(
          clamp((startOffset - lerpedRectTop) / distance)
        )
      }

      // ── Phase 5: Inside Sri Lanka (triggered by Timeline section)
      let timelineZoom = 0
      const timelineEl = document.getElementById("timeline")
      if (timelineEl) {
        const docTop = timelineEl.getBoundingClientRect().top + window.scrollY
        const lerpedRectTop = docTop - currentScrollY
        const startOffset = window.innerHeight * 1.2
        const distance = window.innerHeight * 1.5
        timelineZoom = smoothstep(
          clamp((startOffset - lerpedRectTop) / distance)
        )
      }

      // ── Phase 6: Zoom out to World Map (triggered by Why Participate section)
      let worldZoomOut = 0
      const whyJoinEl = document.getElementById("why-join")
      if (whyJoinEl) {
        const docTop = whyJoinEl.getBoundingClientRect().top + window.scrollY
        const lerpedRectTop = docTop - currentScrollY
        // Start transitioning as Why Participate comes into view
        const startOffset = window.innerHeight * 1.2
        const distance = window.innerHeight * 2.0
        worldZoomOut = smoothstep(
          clamp((startOffset - lerpedRectTop) / distance)
        )
      }

      // ── Phase 7: Deep dive into Western Province (triggered by Crew section)
      let deepZoom = 0
      const crewEl = document.getElementById("crew")
      if (crewEl) {
        const docTop = crewEl.getBoundingClientRect().top + window.scrollY
        const lerpedRectTop = docTop - currentScrollY
        // Start as crew section approaches
        const startOffset = window.innerHeight * 1.2
        const distance = window.innerHeight * 1.5
        deepZoom = smoothstep(clamp((startOffset - lerpedRectTop) / distance))
      }

      // ── Phase 1: World zooms in toward Asia (0% → 60%)
      const approach = smoothstep(segment(progress, 0.0, 0.6))
      // ── Phase 2: Asia map fades in while world fades out (45% → 82%)
      const asiaReveal = smoothstep(segment(progress, 0.45, 0.82))
      // ── Phase 3: Hero text fades/rises early (0% → 45%)
      const heroExit = smoothstep(segment(progress, 0.08, 0.45))
      // ── Scroll hint fades immediately on scroll start (0% → 15%)
      const scrollHintFade = smoothstep(segment(progress, 0.0, 0.15))

      // World: scale 1 → 2.4, drift slightly toward Asia region (upper-right)
      const worldScale = reduceMotion ? 1 : 1 + approach * 1.4
      const worldDriftX = reduceMotion ? 0 : approach * 8 // % drift right
      const worldDriftY = reduceMotion ? 0 : approach * -5 // % drift up
      const worldRotate = reduceMotion ? 0 : approach * -3 // degrees
      // World fades out completely (to 0 opacity) as Asia fades in
      const worldOpacity = 1 - asiaReveal

      // Asia map: scales up 0.85 → 1.05 as it fades in, then zooms massively to Sri Lanka
      const asiaScale = 0.85 + asiaReveal * 0.2 + sriLankaZoom * 7.5 // Increased zoom
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
      const asiaOpacity =
        (asiaReveal * 0.35 + sriLankaZoom * 0.15) * (1 - slMapReveal)

      // Sri Lanka map opacity: fades out for Phase 6, fades back in for Phase 7
      const slOpacity = Math.max(
        (slMapReveal * 0.4 - timelineZoom * 0.25) * (1 - worldZoomOut),
        deepZoom * 0.6
      )

      // Sri Lanka scale & transforms
      const slBaseScale = 0.8 + slMapReveal * 0.3 + timelineZoom * 6.0
      const slScale = slBaseScale * (1 - deepZoom) + deepZoom * 32.0 // ultra massive zoom into Colombo

      const slBaseRotateX = 35 + timelineZoom * -15
      const slRotateX = slBaseRotateX * (1 - deepZoom) + deepZoom * 50 // tilt back more for depth

      const slBaseRotateZ = -5 + timelineZoom * 5
      const slRotateZ = slBaseRotateZ * (1 - deepZoom) + deepZoom * -5

      const slTranslateX = -50 + deepZoom * 55 // move map significantly right to target West Coast
      const slTranslateY = -50 + deepZoom * -35 // move map up slightly to target Colombo

      // ── Phase 6: Zoom Out to Vintage World Map
      // Fades out when Phase 7 deep zoom starts
      const wvOpacity = worldZoomOut * 0.5 * (1 - deepZoom)
      // Start very zoomed in (6.0), scale down to 2.0 (so it doesn't fully zoom out)
      const wvScale = 6.0 - worldZoomOut * 4.0
      // Start tilted, flatten out
      const wvRotateX = 35 - worldZoomOut * 35

      // Hero content: translates upward and fades out
      const heroOpacity = 1 - heroExit
      const heroTranslateY = heroExit * -60 // px

      // Write directly to DOM for maximum performance (no React re-renders)
      if (worldRef.current) {
        worldRef.current.style.transform = `translate3d(calc(-50% + ${worldDriftX}%), calc(-50% + ${worldDriftY}%), 0) scale(${worldScale}) rotate(${worldRotate}deg)`
        worldRef.current.style.opacity = String(worldOpacity)
      }

      if (asiaRef.current) {
        asiaRef.current.style.transform = `perspective(1000px) translate3d(calc(-50% + ${asiaDriftX}%), calc(-50% + ${asiaDriftY}%), 0) rotateX(${asiaRotateX}deg) rotateZ(${asiaRotateZ}deg) scale(${asiaScale})`
        asiaRef.current.style.opacity = String(asiaOpacity)
      }

      if (sriLankaRef.current) {
        // Apply a perspective wrapper via transform to get a nice 3D tilt
        sriLankaRef.current.style.transform = `perspective(1000px) translate3d(${slTranslateX}%, ${slTranslateY}%, 0) rotateX(${slRotateX}deg) rotateZ(${slRotateZ}deg) scale(${slScale})`
        sriLankaRef.current.style.opacity = String(slOpacity)
        // Removed drop-shadow for scroll performance
        sriLankaRef.current.style.filter = "brightness(1.6) contrast(1.3)"
      }

      if (worldVintageRef.current) {
        worldVintageRef.current.style.transform = `perspective(1000px) translate3d(-50%, -50%, 0) rotateX(${wvRotateX}deg) scale(${wvScale})`
        worldVintageRef.current.style.opacity = String(wvOpacity)
        // Screen blend mode removes the pure black background from the image!
        worldVintageRef.current.style.mixBlendMode = "screen"
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
      targetScrollY = window.scrollY
      if (!rafId) rafId = requestAnimationFrame(tick)
    }

    // Run once on mount to set initial state
    scheduleRender()

    window.addEventListener("scroll", scheduleRender, { passive: true })
    window.addEventListener("resize", scheduleRender)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener("scroll", scheduleRender)
      window.removeEventListener("resize", scheduleRender)
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
            <div className="mb-8 flex flex-col items-center justify-center gap-4">
              <p className="font-mono text-xl font-black tracking-[0.3em] text-white uppercase [-webkit-text-stroke:1px_#163E70] md:text-2xl">
                Welcome to
              </p>
              <h1 className="flex flex-wrap justify-center gap-x-1 font-[family-name:var(--font-space)] text-5xl font-bold tracking-tighter text-white drop-shadow-2xl sm:gap-x-2 sm:text-6xl md:gap-x-4 md:text-8xl lg:text-[7rem]">
                <span className="flex">
                  {["M", "o", "r", "a", "X", "t", "r", "e", "m", "e"].map(
                    (letter, i) => (
                      <span
                        key={i}
                        style={{
                          display: "inline-block",
                          opacity: 0,
                          animation: `textReveal 0.9s cubic-bezier(0.16,1,0.3,1) ${0.08 + i * 0.04}s forwards`,
                        }}
                      >
                        {letter}
                      </span>
                    )
                  )}
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    opacity: 0,
                    animation:
                      "textReveal 1.1s cubic-bezier(0.16,1,0.3,1) 0.58s forwards",
                  }}
                >
                  <span className="text-white [-webkit-text-stroke:2px_#163E70]">
                    11.0
                  </span>
                </span>
              </h1>
            </div>

            {/* CTA Buttons - Row 1: Register + Delegate Booklet */}
            <div className="mt-8 flex flex-col gap-5 sm:flex-row">
              {/* Register Button with Dynamic Pulsing Aura */}
              <div className="group relative">
                {/* Glowing pulsing aura behind the button */}
                <div className="absolute -inset-1 animate-pulse rounded-full bg-gradient-to-r from-white/60 via-[#0074FF]/80 to-white/60 opacity-80 blur-xl transition duration-500 group-hover:opacity-100 group-hover:blur-2xl"></div>

                <a
                  href="/register"
                  className="relative inline-flex items-center overflow-hidden rounded-full border border-white/60 bg-[#0074FF]/20 px-8 py-4 font-[family-name:var(--font-space)] text-sm font-black tracking-[0.25em] text-white uppercase shadow-[0_0_20px_rgba(255,255,255,0.4),inset_0_0_20px_rgba(255,255,255,0.3)] backdrop-blur-xl transition-all duration-500 group-hover:-translate-y-1 group-hover:border-white group-hover:bg-[#0074FF]/40 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.8),inset_0_0_30px_rgba(255,255,255,0.6)] sm:px-12 sm:py-6 sm:text-base md:text-lg"
                >
                  <span className="relative z-10 flex items-center gap-4 drop-shadow-[0_0_15px_rgba(255,255,255,1)] transition-all duration-500 group-hover:drop-shadow-[0_0_25px_rgba(255,255,255,1)]">
                    Register Now
                    <svg
                      className="h-6 w-6 transition-transform duration-500 group-hover:translate-x-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </span>
                  <div className="absolute inset-0 z-0 -translate-x-full bg-white/20 transition-transform duration-500 ease-out group-hover:translate-x-0" />
                </a>
              </div>

              {/* Delegate Booklet Button — same premium weight as Register Now */}
              <div className="group relative">
                {/* Glowing pulsing aura behind the button */}
                <div className="absolute -inset-1 animate-pulse rounded-full bg-gradient-to-r from-[#0074FF]/40 via-white/30 to-[#0074FF]/40 opacity-60 blur-xl transition duration-500 group-hover:opacity-90 group-hover:blur-2xl"></div>

                <a
                  href="https://drive.google.com/file/d/1fcevOIbL9cJAg1jOY3Hgah9lsvpqwdry/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative inline-flex items-center overflow-hidden rounded-full border border-white/40 bg-white/5 px-8 py-4 font-[family-name:var(--font-space)] text-sm font-black tracking-[0.25em] text-white uppercase shadow-[0_0_20px_rgba(255,255,255,0.2),inset_0_0_20px_rgba(255,255,255,0.1)] backdrop-blur-xl transition-all duration-500 group-hover:-translate-y-1 group-hover:border-white/70 group-hover:bg-white/15 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.5),inset_0_0_30px_rgba(255,255,255,0.3)] sm:px-12 sm:py-6 sm:text-base md:text-lg"
                >
                  <span className="relative z-10 flex items-center gap-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.7)] transition-all duration-500 group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,1)]">
                    {/* Book / Document icon */}
                    <svg
                      className="h-6 w-6 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    Delegate Booklet
                  </span>
                  <div className="absolute inset-0 z-0 -translate-x-full bg-white/10 transition-transform duration-500 ease-out group-hover:translate-x-0" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
<div
  ref={scrollHintRef}
  className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4"
  aria-hidden="true"
>
  <span className="font-mono text-xs font-semibold tracking-[0.5em] text-cyan-100/80 [text-shadow:0_0_20px_rgba(56,213,255,0.5)]">
    SCROLL DOWN
  </span>

  <div className="relative flex h-9 w-6 items-start justify-center rounded-full border border-cyan-200/40 shadow-[0_0_15px_rgba(56,213,255,0.25)]">
    <span className="mt-2 h-2 w-[3px] rounded-full bg-cyan-300 shadow-[0_0_8px_2px_rgba(56,213,255,0.8)] animate-[mouseDot_1.8s_ease-in-out_infinite]" />
  </div>
</div>
      </div>

      {/* Spacer to allow the scroll animation to play before content comes up */}
      {/* Mobile gets more height so the animation isn't rushed */}
      <div className="h-[80vh] sm:h-[60vh]" style={{ minHeight: "60vh" }} />

      {/* Content wrapper that will scroll up over the sticky background */}
      <div className="relative z-10 flex w-full flex-col items-center">
        {children}
      </div>
    </div>
  )
}
