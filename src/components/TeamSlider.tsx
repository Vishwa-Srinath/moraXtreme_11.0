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

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function TeamSlider({
  members,
  subtitle,
  autoInterval = 4500,
}: TeamSliderProps) {
  const n = members.length;
  const [active, setActive] = useState(0);
  const isHovered = useRef(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const mod    = useCallback((i: number) => ((i % n) + n) % n, [n]);
  const goNext = useCallback(() => setActive((a) => mod(a + 1)), [mod]);
  const goPrev = useCallback(() => setActive((a) => mod(a - 1)), [mod]);
  const goTo   = useCallback((i: number) => setActive(mod(i)), [mod]);

  // Auto-advance
  useEffect(() => {
    const id = setInterval(() => {
      if (!isHovered.current) goNext();
    }, autoInterval);
    return () => clearInterval(id);
  }, [autoInterval, goNext]);

  // Show prev, active, and next (3 visible cards)
  const visibleIndices = [mod(active - 1), active, mod(active + 1)];

  return (
    <>
      <style>{`
        /* ── Section wrapper ── */
        .ts-section {
          position: relative;
          z-index: 10;
          width: 100%;
          padding: 5rem 3rem;
          font-family: var(--font-sans, 'Inter', 'Helvetica Neue', sans-serif);
          background: transparent;
        }

        /* ── Inner layout: left column + right slider ── */
        .ts-inner {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 3rem;
          align-items: center;
        }
        @media (max-width: 1024px) {
          .ts-inner {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
        }

        /* ── Left editorial panel ── */
        .ts-left {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }

        /* Eyebrow */
        .ts-eyebrow {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .ts-eyebrow-dot {
          width: 6px;
          height: 6px;
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
        .ts-eyebrow-sep {
          font-size: 0.6rem;
          color: ${C.textMuted};
          opacity: 0.5;
        }

        /* Headline */
        .ts-headline {
          font-size: clamp(3rem, 6vw, 5.5rem);
          font-weight: 900;
          line-height: 0.88;
          letter-spacing: -0.03em;
          margin: 0 0 1.5rem;
        }
        .ts-headline-white {
          display: block;
          color: ${C.textHead};
        }
        .ts-headline-blue {
          display: block;
          color: ${C.blueBright};
        }

        /* Subtitle */
        .ts-subtitle {
          font-size: 0.82rem;
          color: ${C.textMuted};
          line-height: 1.8;
          margin: 0 0 2.5rem;
          max-width: 240px;
        }

        /* Controls in left panel */
        .ts-controls {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }
        .ts-arrow-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.04);
          color: ${C.textHead};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
          flex-shrink: 0;
        }
        .ts-arrow-btn:hover {
          border-color: ${C.blueBright};
          background: rgba(0,116,255,0.12);
          color: ${C.blueBright};
        }
        .ts-dots {
          display: flex;
          gap: 0.35rem;
          align-items: center;
        }
        .ts-dot {
          height: 2px;
          border-radius: 2px;
          background: rgba(255,255,255,0.15);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: background 0.25s ease, width 0.25s ease;
          width: 16px;
        }
        .ts-dot[data-active="true"] {
          background: ${C.blueBright};
          width: 28px;
        }

        /* ── Right: horizontal card slider ── */
        .ts-right {
          overflow: hidden;
          position: relative;
        }
        .ts-track {
          display: flex;
          gap: 1rem;
          justify-content: center;
          align-items: stretch;
        }

        /* ── Individual card ── */
        .ts-card {
          position: relative;
          flex-shrink: 0;
          width: 280px;
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid ${C.border};
          background: rgba(7,13,22,0.65);
          backdrop-filter: blur(8px);
          transition:
            transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94),
            opacity 0.4s ease,
            border-color 0.3s ease,
            box-shadow 0.3s ease;
          cursor: pointer;
          display: flex;
          flex-direction: column;
        }
        .ts-card--side {
          opacity: 0.55;
          transform: scale(0.92);
          cursor: pointer;
        }
        .ts-card--active {
          opacity: 1;
          transform: scale(1);
          border-color: ${C.borderAct};
          box-shadow:
            0 0 0 1px rgba(0,116,255,0.25),
            0 0 35px rgba(0,116,255,0.18),
            0 16px 48px rgba(0,0,0,0.5);
          cursor: default;
        }

        /* Blue top bar that animates in for active card */
        .ts-card-topbar {
          position: absolute;
          top: 0;
          left: 0;
          height: 2px;
          background: ${C.blueBright};
          z-index: 3;
          width: 0;
          transition: width 0.4s ease 0.1s;
        }
        .ts-card--active .ts-card-topbar {
          width: 100%;
        }

        /* Photo area */
        .ts-card-photo {
          position: relative;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          background: ${C.blueDeep};
          flex-shrink: 0;
        }
        .ts-card-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          display: block;
          transition: transform 0.5s ease;
        }
        .ts-card--active .ts-card-photo img {
          transform: scale(1.03);
        }
        .ts-card-photo-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(160deg, ${C.blueDeep} 0%, #020509 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          color: rgba(0,116,255,0.3);
          font-weight: 900;
        }
        /* Subtle gradient at bottom of photo */
        .ts-card-photo::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 45%;
          background: linear-gradient(to top, rgba(7,13,22,0.98) 0%, transparent 100%);
          pointer-events: none;
        }

        /* Card info block */
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

        /* Arrow on active card */
        .ts-card-arrow {
          position: absolute;
          bottom: 0.9rem;
          right: 0.9rem;
          font-size: 0.85rem;
          color: ${C.blueBright};
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          z-index: 2;
        }
        .ts-card--active .ts-card-arrow {
          opacity: 1;
        }
      `}</style>

      <section
        className="ts-section"
        id="team"
        aria-label="Organizing Committee"
        ref={sectionRef}
        onMouseEnter={() => { isHovered.current = true; }}
        onMouseLeave={() => { isHovered.current = false; }}
      >
        <div className="ts-inner">
          {/* ── Left editorial panel ── */}
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

            {/* Navigation controls */}
            <div className="ts-controls">
              <button
                className="ts-arrow-btn"
                onClick={goPrev}
                aria-label="Previous member"
              >
                ←
              </button>

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

              <button
                className="ts-arrow-btn"
                onClick={goNext}
                aria-label="Next member"
              >
                →
              </button>
            </div>
          </div>

          {/* ── Right: horizontal 3-card slider ── */}
          <div className="ts-right" role="region" aria-label="Team member carousel" aria-live="polite">
            <div className="ts-track">
              {visibleIndices.map((memberIdx, position) => {
                const member = members[memberIdx];
                const isActive = position === 1; // middle card
                const initials = member.name.split(" ").map((w) => w[0]).join("").slice(0, 2);

                return (
                  <div
                    key={`${memberIdx}-${position}`}
                    className={`ts-card${isActive ? " ts-card--active" : " ts-card--side"}`}
                    onClick={() => !isActive && goTo(memberIdx)}
                    aria-label={member.name}
                    tabIndex={isActive ? 0 : -1}
                  >
                    {/* Top active bar */}
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

                    {/* Arrow hint (active only) */}
                    <span className="ts-card-arrow" aria-hidden="true">→</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
