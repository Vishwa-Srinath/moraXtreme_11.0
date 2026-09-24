"use client"

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react"

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
  const cardRefs = useRef<Array<HTMLElement | null>>([])
  const scrollerRef = useRef<HTMLElement | Window | null>(null)
  const rafId = useRef<number | null>(null)

  const targetProgress = useRef(0)
  const shownProgress = useRef(0)

  const [maxShift, setMaxShift] = useState(0)
  const [initialOffset, setInitialOffset] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

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

    // Center coordinates relative to strip container
    const firstCenter = firstCard.offsetLeft + firstCard.offsetWidth / 2
    const lastCenter = lastCard.offsetLeft + lastCard.offsetWidth / 2

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
    if (reducedMotion) return

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

      // ── 3D Cylindrical Spool Curvature with Center Focus Deadzone ─────────
      const viewportCenter = window.innerWidth / 2
      cardRefs.current.forEach((card) => {
        if (!card) return
        const rect = card.getBoundingClientRect()
        const cardCenter = rect.left + rect.width / 2
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
  }, [reducedMotion, maxShift, initialOffset])

  // Increased pinHeight to stretch out the scroll and make it slower/smoother
  const pinHeight = 200 + Math.max(160, milestones.length * 45)

  return (
    <section
      ref={sectionRef}
      id="timeline"
      className="relative w-full"
      style={!reducedMotion ? { height: `${pinHeight}vh` } : undefined}
      aria-label="Event Timeline"
    >
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
        {/* Ambient light leak */}
        {!reducedMotion && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-1/4 -top-1/3 h-[140%] animate-[leak_22s_ease-in-out_infinite] opacity-[0.16] mix-blend-screen"
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
            className="pointer-events-none absolute inset-0 z-30 opacity-[0.05] mix-blend-overlay"
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
            className="pointer-events-none absolute inset-x-[-100%] top-1/2 h-[400px] -translate-y-1/2 border-y border-[#6fd3ff]/10 bg-[#02040a]/40 opacity-30 blur-[6px] mix-blend-screen"
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
                className="group relative aspect-[4/5] w-[180px] flex-none snap-start rounded-lg bg-[#070b13] p-2 sm:p-3 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.85)] ring-1 ring-[#6fd3ff]/25 will-change-transform [backface-visibility:hidden] sm:w-[220px] lg:w-[260px]"
              >
                {/* Genially-style Red Date Pin */}
                <div className="absolute -top-14 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center drop-shadow-[0_6px_16px_rgba(220,38,38,0.6)]">
                  <div className="flex items-center justify-center rounded-full bg-[#cc1a1a] px-5 py-2 shadow-[inset_0_0_10px_rgba(0,0,0,0.3)] ring-1 ring-[#ff4d4d]/30">
                    <span className="whitespace-nowrap text-sm font-bold tracking-wider text-white">
                      {m.date.toUpperCase()}
                    </span>
                  </div>
                  <div className="h-4 w-4 -translate-y-2.5 rotate-45 bg-[#cc1a1a]" />
                </div>

                {/* Film frame cell number stamp */}
                <div className="mb-2 flex items-center justify-between font-mono text-[10px] font-bold tracking-widest text-[#6fd3ff]/70 uppercase">
                  <span>FRAME #{m.reel ?? String(i + 1).padStart(2, "0")}</span>
                  <span className="font-semibold text-[#3d8dff]">
                    ▶▶ 24 FPS
                  </span>
                </div>

                {/* Inner Cell / Photograph */}
                <div className="relative flex h-[calc(100%-24px)] w-full flex-col overflow-hidden rounded border border-white/10 bg-[#0c1220] shadow-inner">
                  {/* Photo area */}
                  <div className="relative h-3/5 w-full overflow-hidden bg-black">
                    {m.image ? (
                      <img
                        src={m.image}
                        alt={m.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(160deg,_#0f1a2e,_#0b1120)]">
                        <span className="font-mono text-[10px] tracking-[0.2em] text-[#6fd3ff]/40">
                          NO SIGNAL
                        </span>
                      </div>
                    )}
                    {/* Cinematic overlay grades */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c1220] via-transparent to-transparent opacity-90" />
                    <div className="absolute inset-0 bg-[#1f8fff] opacity-15 mix-blend-color" />
                    <span className="absolute top-2.5 left-2.5 rounded border border-white/10 bg-black/60 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-[#6fd3ff] backdrop-blur-md">
                      ROLL {m.reel ?? String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Caption area */}
                  <div className="flex flex-1 flex-col justify-between bg-[#0c1220] p-4">
                    <div>
                      <h3 className="text-base font-black tracking-tight text-[#f5f8ff] sm:text-lg leading-tight">
                        {m.title}
                      </h3>
                      <span className="mt-0.5 inline-block font-mono text-[10px] sm:text-xs font-medium text-[#6fd3ff]">
                        {m.date}
                      </span>
                      {m.desc && (
                        <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-[#94a3b8]">
                          {m.desc}
                        </p>
                      )}
                    </div>
                    {/* Frame alignment tick */}
                    <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2 font-mono text-[9px] text-[#475569]">
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

      <style>{`
        @keyframes leak {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(18vw, 10vh); }
        }
      `}</style>
    </section>
  )
}
