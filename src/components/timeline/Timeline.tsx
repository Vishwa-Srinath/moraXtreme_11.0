"use client"

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react"

const MOBILE_BREAKPOINT = 768 // px — below this, switch to vertical layout

export interface Milestone {
  reel?: string
  title: string
  date: string
  desc?: string
  image?: string
}

export interface FilmReelTimelineProps {
  milestones?: Milestone[]
}

const DEFAULT_MILESTONES: Milestone[] = [
  {
    reel: "01",
    title: "Registrations Open",
    date: "24 September",
    desc: "Sign-ups go live for MoraXtreme 11.0.",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900&q=80",
  },
  {
    reel: "02",
    title: "Awareness Session",
    date: "25 September",
    desc: "Kickoff briefing on rules, format and scoring.",
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&q=80",
  },
  {
    reel: "03",
    title: "Registrations Close",
    date: "30 September",
    desc: "Last call — team sign-ups lock.",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=80",
  },
  {
    reel: "04",
    title: "Workshop 01",
    date: "First week of October",
    desc: "Foundations — algorithmic problem solving.",
    image:
      "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=900&q=80",
  },
  {
    reel: "05",
    title: "Elimination Round",
    date: "11 October",
    desc: "The qualifying round. Only the fastest advance.",
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=900&q=80",
  },
  {
    reel: "06",
    title: "IEEEXtreme 20.0",
    date: "31 October",
    desc: "The 24-hour global main event.",
    image:
      "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=900&q=80",
  },
  {
    reel: "07",
    title: "Workshop 02",
    date: "First week of November",
    desc: "Advanced techniques ahead of the final stretch.",
    image:
      "https://images.unsplash.com/photo-1550439062-609e1531270e?w=900&q=80",
  },
  {
    reel: "08",
    title: "Final Round",
    date: "Second week of November",
    desc: "The top teams face off for the title.",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=900&q=80",
  },
]

// Crisp 35mm rounded-rectangle sprocket hole SVG pattern
const SPROCKET_PATTERN_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="28" viewBox="0 0 40 28">
      <!-- Sprocket hole cut-out with inner depth border -->
      <rect x="11" y="4" width="18" height="20" rx="3.5" fill="#030509" stroke="rgba(111,211,255,0.28)" stroke-width="1.2"/>
      <!-- Film track guide tick -->
      <line x1="0" y1="14" x2="3" y2="14" stroke="rgba(111,211,255,0.18)" stroke-width="1"/>
    </svg>`
  )

// Base64 fractal-noise tile for the cinematic grain overlay
const GRAIN_DATA_URI =
  "data:image/svg+xml;base64," +
  (typeof btoa !== "undefined"
    ? btoa(
        '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">' +
          '<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/></filter>' +
          '<rect width="100%" height="100%" filter="url(#n)"/></svg>'
      )
    : "")

function getScrollParent(el: HTMLElement): HTMLElement | Window {
  let node: HTMLElement | null = el.parentElement
  while (node) {
    const { overflowY } = window.getComputedStyle(node)
    if (
      /(auto|scroll)/.test(overflowY) &&
      node.scrollHeight > node.clientHeight
    ) {
      return node
    }
    node = node.parentElement
  }
  return window
}

function getScrollInfo(
  section: HTMLElement,
  scroller: HTMLElement | Window
): { scrollTop: number; sectionOffset: number } {
  if (scroller instanceof Window) {
    return {
      scrollTop: window.scrollY,
      sectionOffset: section.getBoundingClientRect().top + window.scrollY,
    }
  }
  const scrollerRect = scroller.getBoundingClientRect()
  const sectionRect = section.getBoundingClientRect()
  return {
    scrollTop: scroller.scrollTop,
    sectionOffset: sectionRect.top - scrollerRect.top + scroller.scrollTop,
  }
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export default function Timeline({
  milestones = DEFAULT_MILESTONES,
}: FilmReelTimelineProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const stripRef = useRef<HTMLDivElement | null>(null)
  const sprocketTopHolesRef = useRef<HTMLDivElement | null>(null)
  const sprocketBottomHolesRef = useRef<HTMLDivElement | null>(null)
  const edgeTopTextRef = useRef<HTMLDivElement | null>(null)
  const edgeBottomTextRef = useRef<HTMLDivElement | null>(null)
  const distantTopSprocketRef = useRef<HTMLDivElement | null>(null)
  const distantBottomSprocketRef = useRef<HTMLDivElement | null>(null)
  const progressBarRef = useRef<HTMLDivElement | null>(null)
  const roadBgRef = useRef<HTMLDivElement | null>(null)
  const cardRefs = useRef<Array<HTMLElement | null>>([])
  const cardCenters = useRef<number[]>([])
  const scrollerRef = useRef<HTMLElement | Window | null>(null)
  const rafId = useRef<number | null>(null)

  const targetProgress = useRef(0)
  const shownProgress = useRef(0)

  const [maxShift, setMaxShift] = useState(0)
  const [initialOffset, setInitialOffset] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile on mount and on resize
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  // ── Measure exact center-to-center travel ────────────────────────────────
  const measure = useCallback(() => {
    if (!stripRef.current || cardRefs.current.length === 0) return
    const firstCard = cardRefs.current[0]
    const lastCard = cardRefs.current[cardRefs.current.length - 1]
    if (!firstCard || !lastCard) return

    // Pre-calculate card centers relative to strip to avoid layout thrashing in rAF
    cardCenters.current = cardRefs.current.map((card) => {
      if (!card) return 0
      return card.offsetLeft + card.offsetWidth / 2
    })

    // Center coordinates relative to strip container
    const firstCenter = cardCenters.current[0] || 0
    const lastCenter = cardCenters.current[cardCenters.current.length - 1] || 0

    // Total travel required from first card centered to last card centered
    const totalShift = lastCenter - firstCenter
    // Add 400px of extra padding so the final card scrolls fully into view and stays there briefly
    setMaxShift(totalShift + 400)

    // Offset needed so card 1 starts directly at viewport center
    setInitialOffset(window.innerWidth / 2 - firstCenter)
  }, [])

  useLayoutEffect(() => {
    measure()
  }, [measure, milestones])

  useEffect(() => {
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [measure])

  useEffect(() => {
    if (reducedMotion) return

    const scroller = sectionRef.current
      ? getScrollParent(sectionRef.current)
      : window
    scrollerRef.current = scroller

    const onScroll = () => {
      const section = sectionRef.current
      if (!section) return

      const { scrollTop, sectionOffset } = getScrollInfo(section, scroller)
      const sectionHeight = section.offsetHeight
      const viewportH =
        scroller instanceof Window
          ? window.innerHeight
          : (scroller as HTMLElement).clientHeight

      const total = sectionHeight - viewportH
      if (total <= 0) {
        targetProgress.current = 0
        return
      }

      const scrolled = scrollTop - sectionOffset
      targetProgress.current = clamp(scrolled / total, 0, 1)
    }

    const target = scroller instanceof Window ? window : scroller
    target.addEventListener("scroll", onScroll, { passive: true })
    onScroll()

    return () => target.removeEventListener("scroll", onScroll)
  }, [reducedMotion])

  // ── Continuous 60/120fps rAF Loop ────────────────────────────────────────
  useEffect(() => {
    // On mobile, don't run the horizontal rAF loop at all
    if (reducedMotion || isMobile) return

    const tick = () => {
      rafId.current = requestAnimationFrame(tick)

      shownProgress.current = lerp(
        shownProgress.current,
        targetProgress.current,
        0.035
      )

      // Exact scroll translation: from 1st card centered to last card centered
      const translateX = initialOffset - shownProgress.current * maxShift

      if (stripRef.current) {
        stripRef.current.style.transform = `translate3d(${translateX}px, 0, 0)`
      }

      // Continuous infinite sprocket pattern animation
      if (sprocketTopHolesRef.current) {
        sprocketTopHolesRef.current.style.backgroundPosition = `${translateX}px center`
      }
      if (sprocketBottomHolesRef.current) {
        sprocketBottomHolesRef.current.style.backgroundPosition = `${translateX}px center`
      }

      // Edge markings movement
      if (edgeTopTextRef.current) {
        edgeTopTextRef.current.style.transform = `translate3d(${translateX}px, 0, 0)`
      }
      if (edgeBottomTextRef.current) {
        edgeBottomTextRef.current.style.transform = `translate3d(${translateX}px, 0, 0)`
      }

      // Distant background parallax
      if (distantTopSprocketRef.current) {
        distantTopSprocketRef.current.style.backgroundPosition = `${translateX * -0.4}px center`
      }
      if (distantBottomSprocketRef.current) {
        distantBottomSprocketRef.current.style.backgroundPosition = `${translateX * -0.4}px center`
      }

      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${shownProgress.current * 100}%`
      }

      // Road background fade-in: 0→full opacity in first 25% of scroll, then hold
      if (roadBgRef.current) {
        const roadOpacity = clamp(shownProgress.current / 0.25, 0, 1)
        roadBgRef.current.style.opacity = String(roadOpacity * 0.55)
      }

      // ── 3D Cylindrical Spool Curvature with Center Focus Deadzone ─────────
      const viewportCenter = window.innerWidth / 2
      cardRefs.current.forEach((card, i) => {
        if (!card) return
        // Use cached center to prevent layout thrashing (getBoundingClientRect)
        const cardCenter = (cardCenters.current[i] || 0) + translateX
        const signedDist = cardCenter - viewportCenter
        const dist = Math.abs(signedDist)

        // Center deadzone: cards within the middle 20% remain 100% sharp and flat
        const focusThreshold = window.innerWidth * 0.1
        const effectiveDist = Math.max(0, dist - focusThreshold)
        const norm = clamp(effectiveDist / (window.innerWidth * 0.42), 0, 1)
        const sign = dist === 0 ? 0 : signedDist / dist

        // Smooth spool roll-off as card moves towards the edge
        const spoolCurve = Math.pow(norm, 1.4)
        const rotateY = sign * (spoolCurve * 52) // curves around spool axis
        const rotateZ = -sign * (spoolCurve * 4) // subtle reel tension tilt
        const translateZ = -(spoolCurve * 320) // wraps deep into spool cavity
        const rise = -(spoolCurve * 18)
        const scale = lerp(1, 0.82, spoolCurve)
        const opacity = lerp(1, 0.25, Math.pow(norm, 1.3))
        const blur = spoolCurve * 3.2

        card.style.transform = `translate3d(0, ${rise}px, ${translateZ}px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`
        card.style.opacity = String(opacity)
        card.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none"
      })
    }

    rafId.current = requestAnimationFrame(tick)
    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current)
    }
  }, [reducedMotion, maxShift, initialOffset, isMobile])

  // Increased pinHeight to stretch out the scroll and make it slower/smoother
  const pinHeight = 200 + Math.max(160, milestones.length * 45)

  return (
    <section
      ref={sectionRef}
      id="timeline"
      className="relative w-full"
      style={!reducedMotion && !isMobile ? { height: `${pinHeight}vh` } : undefined}
      aria-label="Event Timeline"
    >
      {/* ── MOBILE VERTICAL LAYOUT (<768px) ──────────────────────────── */}
      {isMobile && (
        <div className="relative w-full px-4 py-16">
          {/* Header */}
          <div className="mb-10 px-2">
            <div className="flex items-center gap-3 mb-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#3d8dff]" />
              <span className="font-mono text-xs tracking-[0.25em] text-[#6fd3ff]/80 uppercase">35mm Film Archive</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black tracking-tight text-white">EVENT</span>
              <span className="text-4xl font-black tracking-tight text-[#3d8dff]">TIMELINE</span>
            </div>
          </div>

          {/* Vertical line */}
          <div className="absolute left-[2.15rem] top-[9rem] bottom-8 w-[2px] bg-gradient-to-b from-[#0074FF]/80 via-[#6fd3ff]/40 to-transparent" />

          {/* Cards stacked vertically */}
          <div className="flex flex-col gap-10 pl-10">
            {milestones.map((m, i) => (
              <div key={m.title + i} className="relative">
                {/* Timeline dot */}
                <div className="absolute -left-[2.65rem] top-6 flex h-5 w-5 items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-[#0074FF] shadow-[0_0_10px_rgba(0,116,255,0.8)] ring-2 ring-[#0074FF]/30" />
                </div>

                {/* Date badge */}
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#cc1a1a] px-4 py-1.5 shadow-[0_4px_15px_rgba(220,38,38,0.5)]">
                  <span className="font-mono text-xs font-black tracking-widest text-white uppercase">{m.date.toUpperCase()}</span>
                </div>

                {/* Card */}
                <div className="rounded-lg border border-[#6fd3ff]/20 bg-[#070b13] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.6)] ring-1 ring-[#6fd3ff]/15">
                  <div className="mb-2 flex items-center justify-between font-mono text-[9px] font-bold tracking-widest text-[#6fd3ff]/60 uppercase">
                    <span>FRAME #{m.reel ?? String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[#3d8dff]">▶▶ 24 FPS</span>
                  </div>
                  <div className="rounded border border-white/10 bg-[#0c1220] p-3">
                    <h3 className="text-base font-black tracking-tight text-[#f5f8ff] leading-tight">{m.title}</h3>
                    {m.desc && (
                      <p className="mt-1.5 text-sm leading-relaxed text-[#94a3b8]">{m.desc}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 font-mono text-[9px] text-[#475569]">
                      <span>EXP. 2026</span>
                      <span>SEC. 0{i + 1}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DESKTOP HORIZONTAL FILM REEL (≥768px) — unchanged ─────────── */}
      {!isMobile && (
        <div
          className={
            reducedMotion
              ? "relative py-24"
              : "sticky top-0 flex h-screen flex-col overflow-hidden " +
                "bg-[radial-gradient(ellipse_at_20%_15%,_rgba(31,143,255,0.18),_transparent_55%)," +
                "radial-gradient(ellipse_at_80%_85%,_rgba(111,211,255,0.12),_transparent_50%)] " +
                "backdrop-blur-sm"
          }
        >
        {/* ── WINDING ROAD BACKGROUND ────────────────────────────────────── */}
        {!reducedMotion && (
          <div
            ref={roadBgRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
            style={{ opacity: 0, transition: "opacity 0.1s linear" }}
          >
            <svg
              viewBox="0 0 1200 600"
              xmlns="http://www.w3.org/2000/svg"
              className="h-full w-full"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <filter id="road-glow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              {/* Main winding road path */}
              <path
                d="M -100 480 C 80 470, 150 380, 300 340 S 480 200, 600 220 S 750 320, 900 260 S 1080 100, 1300 120"
                fill="none"
                stroke="rgba(0,116,255,0.35)"
                strokeWidth="28"
                strokeLinecap="round"
                filter="url(#road-glow)"
              />
              {/* Road center dashed line */}
              <path
                d="M -100 480 C 80 470, 150 380, 300 340 S 480 200, 600 220 S 750 320, 900 260 S 1080 100, 1300 120"
                fill="none"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="30 22"
              />
              {/* Road edge highlight */}
              <path
                d="M -100 480 C 80 470, 150 380, 300 340 S 480 200, 600 220 S 750 320, 900 260 S 1080 100, 1300 120"
                fill="none"
                stroke="rgba(111,211,255,0.2)"
                strokeWidth="32"
                strokeLinecap="round"
              />
              {/* Milestone dots along path */}
              <circle cx="140" cy="412" r="8" fill="none" stroke="rgba(0,116,255,0.5)" strokeWidth="2" />
              <circle cx="140" cy="412" r="3" fill="rgba(0,116,255,0.6)" />
              <circle cx="300" cy="340" r="8" fill="none" stroke="rgba(0,116,255,0.5)" strokeWidth="2" />
              <circle cx="300" cy="340" r="3" fill="rgba(0,116,255,0.6)" />
              <circle cx="480" cy="218" r="8" fill="none" stroke="rgba(0,116,255,0.5)" strokeWidth="2" />
              <circle cx="480" cy="218" r="3" fill="rgba(0,116,255,0.6)" />
              <circle cx="600" cy="220" r="8" fill="none" stroke="rgba(0,116,255,0.5)" strokeWidth="2" />
              <circle cx="600" cy="220" r="3" fill="rgba(0,116,255,0.6)" />
              <circle cx="760" cy="290" r="8" fill="none" stroke="rgba(0,116,255,0.5)" strokeWidth="2" />
              <circle cx="760" cy="290" r="3" fill="rgba(0,116,255,0.6)" />
              <circle cx="900" cy="260" r="8" fill="none" stroke="rgba(0,116,255,0.5)" strokeWidth="2" />
              <circle cx="900" cy="260" r="3" fill="rgba(0,116,255,0.6)" />
              <circle cx="1060" cy="118" r="8" fill="none" stroke="rgba(0,116,255,0.5)" strokeWidth="2" />
              <circle cx="1060" cy="118" r="3" fill="rgba(0,116,255,0.6)" />
              {/* Stem lines from dots upward */}
              <line x1="140" y1="404" x2="140" y2="340" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 3" />
              <line x1="300" y1="332" x2="300" y2="268" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 3" />
              <line x1="480" y1="210" x2="480" y2="146" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 3" />
              <line x1="600" y1="212" x2="600" y2="148" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 3" />
              <line x1="760" y1="282" x2="760" y2="218" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 3" />
              <line x1="900" y1="252" x2="900" y2="188" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 3" />
              <line x1="1060" y1="110" x2="1060" y2="46" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 3" />
            </svg>
          </div>
        )}

        {/* Ambient light leak */}
        {!reducedMotion && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-1/4 -top-1/3 h-[140%] animate-[leak_22s_ease-in-out_infinite] opacity-[0.12]"
            style={{
              background:
                "radial-gradient(closest-side, rgba(111,211,255,0.9), transparent 70%)",
              width: "38vw",
            }}
          />
        )}

        {/* Grain overlay */}
        {GRAIN_DATA_URI && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-30 opacity-[0.04]"
            style={{
              backgroundImage: `url(${GRAIN_DATA_URI})`,
              backgroundRepeat: "repeat",
            }}
          />
        )}

        {/* Header */}
        <div className="relative z-20 mb-3 shrink-0 px-6 sm:px-10 md:mb-6 lg:px-16">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#3d8dff]" />
            <span className="font-mono text-xs tracking-[0.25em] text-[#6fd3ff]/80 uppercase">
              35mm Film Archive
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              EVENT
            </span>
            <span className="text-4xl font-black tracking-tight text-[#3d8dff] sm:text-5xl lg:text-6xl">
              TIMELINE
            </span>
          </div>
        </div>

        {/* ── FILM REEL STRIP CONTAINER ─────────────────────────────────── */}
        <div
          className="relative flex flex-1 flex-col justify-center overflow-hidden border-y border-[#6fd3ff]/20 bg-black/40 shadow-[inset_0_0_60px_rgba(0,0,0,0.85)]"
          style={{ perspective: "1400px" }}
        >
          {/* ── DISTANT BACKGROUND FILM ROLL ──────────────────────────────── */}
          <div
            className="pointer-events-none absolute inset-x-[-100%] top-1/2 h-[400px] -translate-y-1/2 border-y border-[#6fd3ff]/10 bg-[#02040a]/40 opacity-40 blur-[6px]"
            style={{ transform: "translateZ(-800px) rotateY(-15deg) rotateZ(-4deg)" }}
          >
            <div
              ref={distantTopSprocketRef}
              className="absolute inset-x-0 top-0 h-[30px]"
              style={{ backgroundImage: `url('${SPROCKET_PATTERN_URI}')`, backgroundRepeat: "repeat-x" }}
            />
            <div
              ref={distantBottomSprocketRef}
              className="absolute inset-x-0 bottom-0 h-[30px]"
              style={{ backgroundImage: `url('${SPROCKET_PATTERN_URI}')`, backgroundRepeat: "repeat-x" }}
            />
          </div>

          {/* Subtle glossy film sheen across the track */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1/2 bg-gradient-to-b from-white/[0.035] to-transparent" />

          {/* ── TOP SPROCKET & EDGE CODE TRACK (FULL-WIDTH & CONTINUOUS) ── */}
          <div className="relative z-10 w-full overflow-hidden border-b border-[#6fd3ff]/20 bg-black/50 shadow-sm select-none">
            {/* Edge code markings */}
            <div
              ref={edgeTopTextRef}
              className="flex w-max items-center px-8 pt-1.5 font-mono text-[9px] font-semibold tracking-[0.3em] whitespace-nowrap text-[#6fd3ff]/60 uppercase will-change-transform"
            >
              {milestones.map((_, i) => (
                <div key={i} className="mr-16 flex items-center gap-8">
                  <span>▶ KODAK VISION3 500T</span>
                  <span className="hidden sm:inline">SAFETY FILM • 5219</span>
                  <span>ISO 500 / 28°</span>
                  <span className="hidden md:inline">COLOR NEGATIVE</span>
                  <span>▶ 35MM REEL {String(i + 1).padStart(2, "0")}A</span>
                </div>
              ))}
            </div>

            {/* Seamless Sprocket Perforations */}
            <div
              ref={sprocketTopHolesRef}
              className="h-[30px] w-full will-change-[background-position]"
              style={{
                backgroundImage: `url('${SPROCKET_PATTERN_URI}')`,
                backgroundRepeat: "repeat-x",
                backgroundPosition: "0px center",
              }}
              aria-hidden="true"
            />
          </div>

          {/* ── LEFT SPOOL DRUM SILHOUETTE & CURVED SHADOW ──────────────── */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-20 w-28 sm:w-48"
            style={{
              background:
                "radial-gradient(ellipse 100% 120% at 0% 50%, rgba(4,6,12,0.98) 35%, rgba(4,6,12,0.75) 65%, transparent 100%)",
            }}
          >
            <div className="absolute inset-y-8 left-0 w-[2px] rounded-r-full bg-gradient-to-b from-transparent via-[#6fd3ff]/25 to-transparent shadow-[0_0_15px_rgba(111,211,255,0.35)]" />
          </div>

          {/* ── RIGHT SPOOL DRUM SILHOUETTE & CURVED SHADOW ─────────────── */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-20 w-28 sm:w-48"
            style={{
              background:
                "radial-gradient(ellipse 100% 120% at 100% 50%, rgba(4,6,12,0.98) 35%, rgba(4,6,12,0.75) 65%, transparent 100%)",
            }}
          >
            <div className="absolute inset-y-8 right-0 w-[2px] rounded-l-full bg-gradient-to-b from-transparent via-[#6fd3ff]/25 to-transparent shadow-[0_0_15px_rgba(111,211,255,0.35)]" />
          </div>

          {/* ── MAIN HORIZONTAL FILM CELLS ──────────────────────────────── */}
          <div
            ref={stripRef}
            style={{ transformStyle: "preserve-3d" }}
            className={
              "relative z-[15] flex gap-6 py-6 will-change-transform sm:gap-10 sm:py-8 " +
              (reducedMotion
                ? "snap-x snap-proximity overflow-x-auto px-8"
                : "")
            }
          >
            {milestones.map((m, i) => (
              <article
                key={m.title + i}
                ref={(el) => {
                  cardRefs.current[i] = el
                }}
                className="group relative w-[220px] sm:w-[280px] flex-none snap-start rounded-lg bg-[#070b13] p-2 sm:p-3 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.85)] ring-1 ring-[#6fd3ff]/25 will-change-transform [backface-visibility:hidden]"
              >
                {/* Genially-style Red Date Pin */}
                <div className="absolute -top-16 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center drop-shadow-[0_8px_20px_rgba(220,38,38,0.7)]">
                  <div className="flex items-center justify-center rounded-full bg-[#cc1a1a] px-6 py-2.5 sm:px-8 sm:py-3 shadow-[inset_0_0_15px_rgba(0,0,0,0.4)] ring-1 ring-[#ff4d4d]/30">
                    <span className="whitespace-nowrap text-base sm:text-lg font-black tracking-widest text-white">
                      {m.date.toUpperCase()}
                    </span>
                  </div>
                  <div className="h-5 w-5 -translate-y-3.5 rotate-45 bg-[#cc1a1a]" />
                </div>

                {/* Film frame cell number stamp */}
                <div className="mb-2 flex items-center justify-between font-mono text-[10px] font-bold tracking-widest text-[#6fd3ff]/70 uppercase">
                  <span>FRAME #{m.reel ?? String(i + 1).padStart(2, "0")}</span>
                  <span className="font-semibold text-[#3d8dff]">
                    ▶▶ 24 FPS
                  </span>
                </div>

                {/* Inner Cell / Content */}
                <div className="relative flex w-full flex-col overflow-hidden rounded border border-white/10 bg-[#0c1220] shadow-inner">
                  {/* Caption area */}
                  <div className="flex flex-col justify-between p-4 sm:p-5">
                    <div>
                      <h3 className="text-lg font-black tracking-tight text-[#f5f8ff] sm:text-xl leading-tight">
                        {m.title}
                      </h3>
                      {m.desc && (
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#94a3b8]">
                          {m.desc}
                        </p>
                      )}
                    </div>
                    {/* Frame alignment tick */}
                    <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 font-mono text-[10px] text-[#475569]">
                      <span>EXP. 2026</span>
                      <span>SEC. 0{i + 1}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* ── BOTTOM SPROCKET & AUDIO / BARCODE TRACK (FULL-WIDTH & CONTINUOUS) ── */}
          <div className="relative z-10 w-full overflow-hidden border-t border-[#6fd3ff]/20 bg-black/50 shadow-sm select-none">
            {/* Seamless Sprocket Perforations */}
            <div
              ref={sprocketBottomHolesRef}
              className="h-[30px] w-full will-change-[background-position]"
              style={{
                backgroundImage: `url('${SPROCKET_PATTERN_URI}')`,
                backgroundRepeat: "repeat-x",
                backgroundPosition: "0px center",
              }}
              aria-hidden="true"
            />

            {/* Bottom edge markings extending across the full reel */}
            <div
              ref={edgeBottomTextRef}
              className="flex w-max items-center px-8 pb-1.5 font-mono text-[9px] font-semibold tracking-[0.25em] whitespace-nowrap text-[#6fd3ff]/60 uppercase will-change-transform"
            >
              {milestones.map((_, i) => (
                <div key={i} className="mr-16 flex items-center gap-8">
                  <span>|||| | ||| |||| | (BARCODE)</span>
                  <span>• EASTMAN FILM •</span>
                  <span className="hidden sm:inline">
                    SOUNDTRACK OPTICAL TRACK
                  </span>
                  <span>MORA-XTREME 11.0</span>
                  <span>SEC {String(i + 1).padStart(2, "0")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PROGRESS BAR ────────────────────────────────────────────── */}
        {!reducedMotion && (
          <div className="relative z-20 shrink-0 px-6 pt-4 pb-6 sm:px-10 lg:px-16">
            <div className="mb-1 flex items-center justify-between font-mono text-[10px] tracking-wider text-[#6fd3ff]/60">
              <span>REEL SCAN PROGRESS</span>
              <span>100% EXPOSURE</span>
            </div>
            <div className="h-[3px] w-full overflow-hidden rounded-full bg-[#6fd3ff]/15">
              <div
                ref={progressBarRef}
                className="h-full bg-gradient-to-r from-[#1f8fff] via-[#6fd3ff] to-[#a5f3fc]"
                style={{ width: "0%" }}
              />
            </div>
          </div>
        )}
      </div>

      )} {/* end !isMobile desktop block */}

      <style>{`
        @keyframes leak {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(18vw, 10vh); }
        }
      `}</style>
    </section>
  )
}
