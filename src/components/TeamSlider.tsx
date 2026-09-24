"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import type { TeamSliderProps } from "@/types/team";

// ─────────────────────────────────────────────────────────────────────────────
// COLOUR TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  border:     "rgba(13,37,67,0.5)",
  borderAct:  "#0074FF",
  blueBright: "#0074FF",
  blueDeep:   "#163E70",
  textHead:   "#FFFFFF",
  textMuted:  "#6B7B8D",
} as const;

// ── Card dimensions ──────────────────────────────────────────────────────────
const CARD_W      = 250;  // px — DOM width (same for all cards)
const CARD_GAP    = 20;   // px gap between cards
const SCALE_ACTIVE = 1.13;
const SCALE_NEAR   = 0.87;

// Nav button dimensions — button is 40 px wide / tall
// We want each button centred in the gap between the side card and the centre card.
// Gap runs from:  (viewport_centre - CARD_W/2 - CARD_GAP)  to  (viewport_centre - CARD_W/2)
// Gap centre:     viewport_centre - CARD_W/2 - CARD_GAP/2
// Button left edge (using left: calc(50% - X)):
//   X = CARD_W/2 + CARD_GAP/2 + BTN_HALF  = 125 + 10 + 20 = 155 px
const NAV_OFFSET = CARD_W / 2 + CARD_GAP / 2 + 20; // 155 px from 50 %

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function TeamSlider({
  members,
  subtitle,
  autoInterval = 7000,
}: TeamSliderProps) {
  const n          = members.length;
  const tripled    = [...members, ...members, ...members];
  const startIndex = n;

  const [rawIndex,    setRawIndex]    = useState(startIndex);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const active = ((rawIndex - startIndex) % n + n) % n;

  // Silent jump back to middle copy when near edge
  useEffect(() => {
    if (rawIndex < n / 2 || rawIndex > n * 2 + n / 2) {
      const id = setTimeout(() => {
        setIsAnimating(false);
        setRawIndex((prev) => ((prev - startIndex + n * 1000) % n) + startIndex);
      }, 650);
      return () => clearTimeout(id);
    }
  }, [rawIndex, n, startIndex]);

  // Re-enable animation after silent jump
  useEffect(() => {
    if (!isAnimating) {
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => setIsAnimating(true))
      );
      return () => cancelAnimationFrame(id);
    }
  }, [isAnimating]);

  const goNext = useCallback(() => setRawIndex((i) => i + 1), []);
  const goPrev = useCallback(() => setRawIndex((i) => i - 1), []);
  const goTo   = useCallback(
    (t: number) => setRawIndex(startIndex + t),
    [startIndex],
  );

  // Auto-advance (faster when hovered)
  useEffect(() => {
    const currentInterval = isHovered ? 800 : autoInterval;
    const id = setInterval(() => { goNext(); }, currentInterval);
    return () => clearInterval(id);
  }, [autoInterval, goNext, isHovered]);

  // ── Key fix: track uses position:absolute + left:50% so "50%" refers to the
  //    VIEWPORT width (the nearest positioned ancestor), not the track itself.
  //    We then translate left by the active card's centre offset from the
  //    track's origin (which is now sitting at viewport centre).
  //
  //    result: active card centre == viewport centre  ✓
  const trackX = rawIndex * (CARD_W + CARD_GAP) + CARD_W / 2;

  return (
    <>
      <style>{`
        /* ── Section ── */
        .ts-section {
          position: relative;
          z-index: 10;
          width: 100%;
          padding: 4rem 2.5rem;
          font-family: var(--font-sans, 'Inter', 'Helvetica Neue', sans-serif);
          background: transparent;
          scroll-margin-top: 6rem;
        }

        /* ── Glassmorphism container ── */
        .ts-card-bg {
          position: relative;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          border-radius: 3rem;
          border: 1px solid rgba(255,255,255,0.05);
          background: rgba(0,0,0,0.60);
          box-shadow: 0 0 80px rgba(0,116,255,0.15);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          overflow: hidden;
          padding: 4rem 3.5rem;
        }
        .ts-card-bg::before {
          content: '';
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 100%; height: 100%;
          background: radial-gradient(ellipse at top, rgba(0,116,255,0.25) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }
        .ts-card-bg::after {
          content: '';
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 75%; height: 2px;
          background: linear-gradient(to right, transparent, #0074FF, transparent);
          opacity: 0.55;
          box-shadow: 0 0 20px #0074FF;
          pointer-events: none;
          z-index: 1;
        }

        /* ── Inner two-column grid ── */
        .ts-inner {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 3rem;
          align-items: center;
        }
        @media (max-width: 1024px) {
          .ts-inner   { grid-template-columns: 1fr; gap: 2.5rem; }
          .ts-card-bg { padding: 3rem 2rem; }
        }
        @media (max-width: 640px) {
          .ts-card-bg { padding: 2rem 1rem; border-radius: 1.5rem; }
          .ts-section { padding: 2rem 1rem; }
        }

        /* ── Left editorial panel ── */
        .ts-left {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }
        .ts-eyebrow {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .ts-eyebrow-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: ${C.blueBright};
          flex-shrink: 0;
        }
        .ts-eyebrow-text {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.22em;
          color: ${C.textMuted};
          text-transform: uppercase;
        }
        .ts-eyebrow-sep { font-size: 0.6rem; color: ${C.textMuted}; opacity: 0.5; }

        .ts-headline {
          font-size: clamp(3rem, 5vw, 5rem);
          font-weight: 900;
          line-height: 0.88;
          letter-spacing: -0.03em;
          margin: 0 0 1.5rem;
        }
        .ts-headline-white { display: block; color: ${C.textHead}; }
        .ts-headline-blue  { display: block; color: ${C.blueBright}; }

        .ts-subtitle {
          font-size: 0.82rem;
          color: ${C.textMuted};
          line-height: 1.8;
          margin: 0 0 2.5rem;
          max-width: 240px;
        }

        /* Dot indicators */
        .ts-controls { display: flex; align-items: center; }
        .ts-dots     { display: flex; gap: 0.35rem; align-items: center; }
        .ts-dot {
          height: 2px;
          border-radius: 2px;
          background: rgba(255,255,255,0.18);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: background 0.3s ease, width 0.3s ease;
          width: 16px;
        }
        .ts-dot[data-active="true"] {
          background: ${C.blueBright};
          width: 30px;
        }

        /* ── Viewport wrapper (relative so nav buttons can anchor to it) ── */
        .ts-viewport-wrap {
          position: relative;
          /* Vertical padding gives breathing room for the scaled-up centre card */
          padding: 2rem 0;
        }

        /* ── Nav < > buttons ── */
        .ts-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.22);
          background: rgba(5,12,28,0.80);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          color: ${C.textHead};
          font-size: 1.05rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition:
            border-color 0.2s ease,
            background   0.2s ease,
            color        0.2s ease,
            box-shadow   0.2s ease;
        }
        /* Left button: centred in the gap on the left of the active card */
        .ts-nav-btn--prev { left:  calc(50% - ${NAV_OFFSET}px); }
        /* Right button: centred in the gap on the right of the active card */
        .ts-nav-btn--next { right: calc(50% - ${NAV_OFFSET}px); }
        .ts-nav-btn:hover {
          border-color: ${C.blueBright};
          background: rgba(0,116,255,0.18);
          color: ${C.blueBright};
          box-shadow: 0 0 16px rgba(0,116,255,0.45);
        }

        /* ── Viewport ── */
        .ts-viewport {
          position: relative;
          overflow: hidden;
          height: 500px;
        }
        @media (max-width: 480px) {
          .ts-viewport {
            height: 420px;
          }
        }

        /* ── Track: absolute + left:50% so the left edge starts at the
               viewport's horizontal centre.  The inline translateX then
               shifts it left by the active card's centre offset, making
               that card sit exactly at the centre of the viewport.         ── */
        .ts-track {
          position: absolute;
          left: 50%;
          top: 50%;
          display: flex;
          gap: ${CARD_GAP}px;
          align-items: center;
          will-change: transform;
        }
        .ts-track--animated {
          transition: transform 0.65s cubic-bezier(0.32, 0.72, 0, 1);
        }

        /* ── Individual card ── */
        .ts-card {
          position: relative;
          flex-shrink: 0;
          width: ${CARD_W}px;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid ${C.border};
          background: rgba(4,8,15,0.7);
          backdrop-filter: blur(6px);
          display: flex;
          flex-direction: column;
          transition:
            transform     0.55s cubic-bezier(0.32, 0.72, 0, 1),
            opacity       0.45s ease,
            border-color  0.4s  ease,
            box-shadow    0.4s  ease,
            filter        0.4s  ease;
        }

        /* Centre card — larger, fully lit, blue border + glow */
        .ts-card--active {
          transform: scale(${SCALE_ACTIVE});
          opacity: 1;
          filter: brightness(1);
          border-color: ${C.borderAct};
          box-shadow:
            0 0 0 1px rgba(0,116,255,0.25),
            0 0 45px rgba(0,116,255,0.25),
            0 24px 56px rgba(0,0,0,0.65);
          cursor: default;
          z-index: 3;
        }

        /* Adjacent neighbours — smaller, dimmed */
        .ts-card--near {
          transform: scale(${SCALE_NEAR});
          opacity: 0.58;
          filter: brightness(0.70);
          cursor: pointer;
          z-index: 2;
        }
        .ts-card--near:hover {
          opacity: 0.78;
          filter: brightness(0.88);
        }

        /* Everything else — invisible (still in DOM for seamless looping) */
        .ts-card--far {
          transform: scale(0.72);
          opacity: 0;
          pointer-events: none;
          z-index: 1;
        }

        /* Blue top bar (active only) */
        .ts-card-topbar {
          position: absolute;
          top: 0; left: 0;
          height: 2px;
          background: ${C.blueBright};
          z-index: 3;
          width: 0;
          transition: width 0.5s ease 0.2s;
        }
        .ts-card--active .ts-card-topbar { width: 100%; }

        /* Photo */
        .ts-card-photo {
          position: relative;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          background: ${C.blueDeep};
          flex-shrink: 0;
        }
        .ts-card-photo img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: top center;
          display: block;
          transition: transform 0.6s ease;
        }
        .ts-card--active .ts-card-photo img { transform: scale(1.04); }
        .ts-card-photo-placeholder {
          width: 100%; height: 100%;
          background: linear-gradient(160deg, ${C.blueDeep} 0%, #020509 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          color: rgba(0,116,255,0.3);
          font-weight: 900;
        }
        .ts-card-photo::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 45%;
          background: linear-gradient(to top, rgba(4,8,15,0.98) 0%, transparent 100%);
          pointer-events: none;
        }

        /* Card info */
        .ts-card-info {
          padding: 0.85rem 1rem 1.1rem;
          flex-shrink: 0;
        }
        .ts-card-role {
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: ${C.blueBright};
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }
        .ts-card-name {
          font-size: 1.05rem;
          font-weight: 800;
          color: ${C.textHead};
          line-height: 1.15;
          margin: 0 0 0.2rem;
          letter-spacing: -0.01em;
        }
        .ts-card-org {
          font-size: 0.62rem;
          color: ${C.textMuted};
          line-height: 1.4;
          margin: 0;
        }
      `}</style>

      <section
        className="ts-section"
        id="team"
        aria-label="Organizing Committee"
        ref={sectionRef}
        onMouseEnter={() => { setIsHovered(true); }}
        onMouseLeave={() => { setIsHovered(false); }}
      >
        <div className="ts-card-bg">
          <div className="ts-inner">

            {/* ── Left: editorial panel ── */}
            <div className="ts-left">
              <div className="ts-eyebrow">
                <span className="ts-eyebrow-dot" />
                <span className="ts-eyebrow-text">MoraXtreme 11.0</span>
                <span className="ts-eyebrow-sep">/</span>
                <span className="ts-eyebrow-text">Organizing Committee</span>
              </div>

              <h2 className="ts-headline">
                <span className="ts-headline-white">THE</span>
                <span className="ts-headline-blue">CREW</span>
              </h2>

              <p className="ts-subtitle">
                {subtitle ??
                  "The people behind MoraXtreme 11.0. Different roles. Same vision. One team."}
              </p>

              {/* Dot indicators */}
              <div className="ts-controls">
                <div className="ts-dots" role="tablist" aria-label="Select team member">
                  {members.map((_, i) => (
                    <button
                      key={i}
                      className="ts-dot"
                      data-active={(i === active).toString()}
                      role="tab"
                      aria-selected={i === active}
                      aria-label={`Go to ${members[i].name}`}
                      onClick={() => goTo(i)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: coverflow slider ── */}
            <div className="ts-viewport-wrap">

              {/* < — sits in the gap between the left side card and the centre card */}
              <button
                className="ts-nav-btn ts-nav-btn--prev"
                onClick={goPrev}
                aria-label="Previous member"
              >
                {"<"}
              </button>

              <div
                className="ts-viewport"
                role="region"
                aria-label="Team member carousel"
                aria-live="polite"
              >
                {/*
                 * Track sits at left:50%, top:50% of the viewport (its nearest
                 * positioned ancestor).  The translateX then pulls it left by
                 * the active card's centre offset so that card lands exactly
                 * at the viewport's horizontal centre.
                 */}
                <div
                  className={`ts-track${isAnimating ? " ts-track--animated" : ""}`}
                  style={{
                    transform: `translate(-${trackX}px, -50%)`,
                  }}
                >
                  {tripled.map((member, idx) => {
                    const dist     = idx - rawIndex;
                    const isActive = dist === 0;
                    const isNear   = Math.abs(dist) === 1;
                    const cardClass = isActive
                      ? "ts-card--active"
                      : isNear
                      ? "ts-card--near"
                      : "ts-card--far";

                    const initials = member.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2);

                    return (
                      <div
                        key={idx}
                        className={`ts-card ${cardClass}`}
                        onClick={() => {
                          if (!isActive) setRawIndex((prev) => prev + dist);
                        }}
                        aria-label={member.name}
                        tabIndex={isActive || isNear ? 0 : -1}
                      >
                        {/* Blue top bar */}
                        <div className="ts-card-topbar" />

                        {/* Photo */}
                        <div className="ts-card-photo">
                          {member.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={member.photo} alt={member.alt ?? member.name} />
                          ) : (
                            <div className="ts-card-photo-placeholder">{initials}</div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="ts-card-info">
                          <p className="ts-card-role">{member.role}</p>
                          <p className="ts-card-name">{member.name}</p>
                          {member.organisation && (
                            <p className="ts-card-org">{member.organisation}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* > — sits in the gap between the centre card and the right side card */}
              <button
                className="ts-nav-btn ts-nav-btn--next"
                onClick={goNext}
                aria-label="Next member"
              >
                {">"}
              </button>

            </div>

          </div>
        </div>
      </section>
    </>
  );
}
