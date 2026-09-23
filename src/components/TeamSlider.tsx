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
  bg:         "#04080F",
  bgCard:     "#070D16",
  border:     "rgba(13,37,67,0.7)",
  borderAct:  "#0074FF",
  blueDeep:   "#163E70",
  blueBright: "#0074FF",
  textHead:   "#FFFFFF",
  textBody:   "#E8ECF1",
  textMuted:  "#6B7B8D",
  textRole:   "#0074FF",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Coverflow math
// ─────────────────────────────────────────────────────────────────────────────
interface CardTransform {
  translateX: number; // px offset from centre
  scale: number;
  rotateY: number;   // deg
  translateZ: number; // px
  opacity: number;
  zIndex: number;
  visible: boolean;
}

function getCardTransform(offset: number): CardTransform {
  const abs = Math.abs(offset);
  if (abs > 2) return { translateX: 0, scale: 0, rotateY: 0, translateZ: 0, opacity: 0, zIndex: 0, visible: false };

  const sign = Math.sign(offset) || 1;
  return {
    translateX: offset * 290,
    scale:      abs === 0 ? 1 : abs === 1 ? 0.8 : 0.62,
    rotateY:    abs === 0 ? 0 : sign * -(abs === 1 ? 20 : 32),
    translateZ: abs === 0 ? 0 : abs === 1 ? -60 : -160,
    opacity:    abs === 0 ? 1 : abs === 1 ? 0.75 : 0.45,
    zIndex:     10 - abs * 3,
    visible:    true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function TeamSlider({
  members,
  title,
  subtitle,
  autoInterval = 4500,
}: TeamSliderProps) {
  const n            = members.length;
  const [active, setActive] = useState(0);
  const isHovered    = useRef(false);
  const scrollGuard  = useRef(false);
  const viewportRef  = useRef<HTMLDivElement>(null);

  const mod    = useCallback((i: number) => ((i % n) + n) % n, [n]);
  const goNext = useCallback(() => setActive((a) => mod(a + 1)), [mod]);
  const goPrev = useCallback(() => setActive((a) => mod(a - 1)), [mod]);
  const goTo   = useCallback((i: number) => setActive(mod(i)), [mod]);

  // Auto-advance
  useEffect(() => {
    const id = setInterval(() => { if (!isHovered.current) goNext(); }, autoInterval);
    return () => clearInterval(id);
  }, [autoInterval, goNext]);

  // Non-passive wheel listener (scroll hijack)
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!isHovered.current) return;
      e.preventDefault();
      if (scrollGuard.current) return;
      scrollGuard.current = true;
      setTimeout(() => { scrollGuard.current = false; }, 700);
      if (e.deltaY > 0) goNext(); else goPrev();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [goNext, goPrev]);

  const activeMember = members[active];

  return (
    <>
      <style>{`
        /* ── Section wrapper ── */
        .ts-section {
          position: relative;
          background: ${C.bg};
          overflow: hidden;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: var(--font-sans, 'Inter', 'Helvetica Neue', sans-serif);
        }

        /* Background radial glow */
        .ts-section::before {
          content: '';
          position: absolute;
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 70%;
          background: radial-gradient(ellipse at center,
            rgba(0, 116, 255, 0.12) 0%,
            rgba(22, 62, 112, 0.06) 40%,
            transparent 75%);
          pointer-events: none;
          z-index: 0;
        }

        /* ── Top meta bar ── */
        .ts-topbar {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.4rem 2.5rem;
          border-bottom: 1px solid ${C.border};
        }
        .ts-topbar-left {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: ${C.textMuted};
          text-transform: uppercase;
        }
        .ts-topbar-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: ${C.blueBright};
          flex-shrink: 0;
        }
        .ts-topbar-line {
          width: 3rem;
          height: 1px;
          background: ${C.border};
        }
        .ts-topbar-count {
          color: ${C.textHead};
          border: 1px solid ${C.border};
          padding: 0.15rem 0.6rem;
          border-radius: 3px;
          font-size: 0.58rem;
          letter-spacing: 0.14em;
        }
        .ts-topbar-right {
          font-size: 0.58rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          color: ${C.textMuted};
          text-align: right;
          line-height: 1.7;
          text-transform: uppercase;
        }

        /* ── Body: left headline + carousel ── */
        .ts-body {
          position: relative;
          z-index: 1;
          flex: 1;
          display: grid;
          grid-template-columns: 320px 1fr;
          align-items: center;
          padding: 3rem 2.5rem 2rem;
          gap: 2rem;
        }
        @media (max-width: 900px) {
          .ts-body {
            grid-template-columns: 1fr;
            padding: 2rem 1.5rem 1.5rem;
          }
          .ts-headline { text-align: center; margin-bottom: 2rem; }
        }

        /* ── Left headline block ── */
        .ts-headline {
          padding-right: 0;
        }
        .ts-eyebrow {
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.28em;
          color: ${C.blueBright};
          text-transform: uppercase;
          margin-bottom: 0.6rem;
        }
        .ts-title {
          font-size: clamp(2.8rem, 5vw, 4.5rem);
          font-weight: 900;
          line-height: 0.9;
          letter-spacing: -0.02em;
          margin: 0 0 1.25rem;
        }
        .ts-title-white { color: ${C.textHead}; display: block; }
        .ts-title-blue  { color: ${C.blueBright}; display: block; }
        .ts-subtitle {
          font-size: 0.82rem;
          color: ${C.textMuted};
          line-height: 1.7;
          max-width: 220px;
          margin: 0;
        }

        /* ── Carousel viewport ── */
        .ts-viewport {
          position: relative;
          height: 520px;
          perspective: 1100px;
          perspective-origin: center center;
        }

        /* ── Individual card ── */
        .ts-card {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 260px;
          height: 400px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid ${C.border};
          background: ${C.bgCard};
          transition:
            transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94),
            opacity 0.45s ease,
            border-color 0.3s ease;
          cursor: pointer;
          will-change: transform;
          display: flex;
          flex-direction: column;
        }
        .ts-card--active {
          border-color: ${C.borderAct};
          box-shadow:
            0 0 0 1px rgba(0,116,255,0.3),
            0 0 40px rgba(0,116,255,0.2),
            0 20px 60px rgba(0,0,0,0.6);
          cursor: default;
        }

        /* Photo */
        .ts-card-photo {
          flex: 1;
          position: relative;
          overflow: hidden;
          background: ${C.blueDeep};
        }
        .ts-card-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
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
          letter-spacing: -0.04em;
        }

        /* Card number badge */
        .ts-card-num {
          position: absolute;
          top: 0.7rem;
          left: 0.8rem;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.5);
          z-index: 2;
        }
        .ts-card--active .ts-card-num {
          color: ${C.blueBright};
        }

        /* Photo gradient */
        .ts-card-photo::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 55%;
          background: linear-gradient(to top, rgba(4,8,15,0.98) 0%, transparent 100%);
          pointer-events: none;
        }

        /* Card info block */
        .ts-card-info {
          padding: 0.85rem 1rem 1rem;
          flex-shrink: 0;
        }
        .ts-card-role {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: ${C.blueBright};
          text-transform: uppercase;
          margin-bottom: 0.2rem;
        }
        .ts-card-name {
          font-size: 1rem;
          font-weight: 800;
          color: ${C.textHead};
          line-height: 1.2;
          margin: 0 0 0.2rem;
          letter-spacing: -0.01em;
        }
        .ts-card--active .ts-card-name {
          font-size: 1.25rem;
        }
        .ts-card-org {
          font-size: 0.62rem;
          color: ${C.textMuted};
          line-height: 1.4;
          margin: 0 0 0.5rem;
        }
        .ts-card-quote {
          font-size: 0.65rem;
          color: ${C.textMuted};
          font-style: italic;
          line-height: 1.5;
          margin: 0.4rem 0 0;
          opacity: 0;
          transition: opacity 0.3s ease 0.1s;
        }
        .ts-card--active .ts-card-quote {
          opacity: 1;
        }

        /* ── Blue bar at top of active card ── */
        .ts-card-topbar {
          width: 0;
          height: 2px;
          background: ${C.blueBright};
          position: absolute;
          top: 0;
          left: 0;
          transition: width 0.4s ease 0.15s;
          z-index: 3;
        }
        .ts-card--active .ts-card-topbar {
          width: 100%;
        }

        /* Arrow on active card */
        .ts-card-arrow {
          position: absolute;
          bottom: 0.9rem;
          right: 0.9rem;
          font-size: 0.9rem;
          color: ${C.blueBright};
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          z-index: 2;
        }
        .ts-card--active .ts-card-arrow {
          opacity: 1;
        }

        /* ── Bottom control bar ── */
        .ts-bottom {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.2rem 2.5rem 1.4rem;
          border-top: 1px solid ${C.border};
        }
        .ts-bottom-brand {
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.22em;
          color: ${C.blueBright};
          text-transform: uppercase;
        }
        .ts-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .ts-arrow-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid ${C.border};
          background: transparent;
          color: ${C.textHead};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
        }
        .ts-arrow-btn:hover {
          border-color: ${C.blueBright};
          background: rgba(0,116,255,0.12);
          color: ${C.blueBright};
        }
        .ts-dots {
          display: flex;
          gap: 0.4rem;
          align-items: center;
        }
        .ts-dot {
          width: 20px;
          height: 2px;
          border-radius: 2px;
          background: ${C.border};
          border: none;
          padding: 0;
          cursor: pointer;
          transition: background 0.25s ease, width 0.25s ease;
        }
        .ts-dot[data-active="true"] {
          background: ${C.blueBright};
          width: 32px;
        }
        .ts-bottom-right {
          font-size: 0.55rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          color: ${C.textMuted};
          text-transform: uppercase;
          text-align: right;
        }
      `}</style>

      <section
        className="ts-section"
        aria-label="Team section"
        ref={viewportRef}
        onMouseEnter={() => { isHovered.current = true; }}
        onMouseLeave={() => { isHovered.current = false; }}
      >
        {/* ── Top meta bar ── */}
        <div className="ts-topbar">
          <div className="ts-topbar-left">
            <span className="ts-topbar-dot" />
            <span>MoraXtreme 11.0</span>
            <span>/</span>
            <span>Organizing Committee</span>
            <span className="ts-topbar-line" />
          </div>
          <div className="ts-topbar-right">
            Same Vision.<br />
            Different Roles.<br />
            One Team.
          </div>
        </div>

        {/* ── Body ── */}
        <div className="ts-body">
          {/* Left headline */}
          <div className="ts-headline">
            <h2 className="ts-title">
              <span className="ts-title-white">THE</span>
              <span className="ts-title-blue">CREW</span>
            </h2>
            <p className="ts-subtitle">
              {subtitle ?? "The minds, hands and hearts that make MoraXtreme possible."}
            </p>
          </div>

          {/* Carousel */}
          <div
            className="ts-viewport"
            role="region"
            aria-label="Team member carousel"
            aria-live="polite"
          >
            {members.map((member, idx) => {
              const rawOffset = idx - active;
              // Circular offset: bring to [-n/2, n/2]
              const offset = ((rawOffset + Math.round(n / 2)) % n) - Math.round(n / 2);
              const t = getCardTransform(offset);
              if (!t.visible) return null;

              const isActive = offset === 0;
              const initials = member.name.split(" ").map((w) => w[0]).join("").slice(0, 2);

              return (
                <div
                  key={idx}
                  className={`ts-card${isActive ? " ts-card--active" : ""}`}
                  style={{
                    transform: [
                      `translateX(calc(-50% + ${t.translateX}px))`,
                      `translateY(-50%)`,
                      `scale(${t.scale})`,
                      `rotateY(${t.rotateY}deg)`,
                      `translateZ(${t.translateZ}px)`,
                    ].join(" "),
                    opacity: t.opacity,
                    zIndex:  t.zIndex,
                  }}
                  onClick={() => !isActive && goTo(idx)}
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

        {/* ── Bottom bar ── */}
        <div className="ts-bottom">
          <span className="ts-bottom-brand">MoraXtreme 11.0</span>

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

          <span className="ts-bottom-right">
            University of Moratuwa
          </span>
        </div>
      </section>
    </>
  );
}
