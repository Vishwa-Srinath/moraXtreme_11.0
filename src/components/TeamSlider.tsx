"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import type { TeamSliderProps } from "@/types/team";

// ─────────────────────────────────────────────────────────────────────────────
// COLOUR TOKENS — MoraXtreme 11.0
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  bgPage:     "#000000",
  bgSection:  "#060A10",
  bgCard:     "#0B1119",
  border:     "#0D2543",
  blueDeep:   "#163E70",
  blueBright: "#0074FF",
  blueLight:  "#3390FF",
  textHead:   "#FFFFFF",
  textBody:   "#E8ECF1",
  textMuted:  "#9AA5B4",
} as const;

// Card dimensions (centre card)
const CARD_W  = 340; // px
const CARD_H  = 460; // px

// ─────────────────────────────────────────────────────────────────────────────
// Coverflow transform per offset index
// ─────────────────────────────────────────────────────────────────────────────
function cardStyle(offset: number): React.CSSProperties {
  const abs = Math.abs(offset);
  if (abs > 2) return { display: "none" };

  const sign = Math.sign(offset) || 1;

  const translateX = offset * 320; // px from centre
  const scale      = abs === 0 ? 1 : abs === 1 ? 0.78 : 0.57;
  const rotateY    = abs === 0 ? 0 : sign * -(abs === 1 ? 22 : 34);
  const translateZ = abs === 0 ? 0 : abs === 1 ? -80 : -180;
  const opacity    = abs === 0 ? 1 : abs === 1 ? 0.72 : 0.4;
  const zIndex     = 10 - abs * 3;

  return {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: CARD_W,
    height: CARD_H,
    transform: [
      `translateX(calc(-50% + ${translateX}px))`,
      `translateY(-50%)`,
      `scale(${scale})`,
      `rotateY(${rotateY}deg)`,
      `translateZ(${translateZ}px)`,
    ].join(" "),
    opacity,
    zIndex,
    transition:
      "transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.5s ease",
    cursor: abs === 0 ? "default" : "pointer",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
export default function TeamSlider({
  members,
  title,
  subtitle,
  autoInterval = 4000,
  bgColor,
  eyebrow = "Team",
}: TeamSliderProps) {
  const n = members.length;
  const [active, setActive] = useState(0);
  const isHovered    = useRef(false);
  const scrollGuard  = useRef(false); // throttle wheel
  const viewportRef  = useRef<HTMLDivElement>(null);

  // circular index helper
  const mod = useCallback((i: number) => ((i % n) + n) % n, [n]);

  const goNext = useCallback(() => setActive((a) => mod(a + 1)), [mod]);
  const goPrev = useCallback(() => setActive((a) => mod(a - 1)), [mod]);
  const goTo   = useCallback((i: number) => setActive(mod(i)), [mod]);

  // ── Auto-advance ───────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      if (!isHovered.current) goNext();
    }, autoInterval);
    return () => clearInterval(id);
  }, [autoInterval, goNext]);

  // ── Non-passive wheel listener (must be attached via ref) ─────────────────
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (!isHovered.current) return;
      e.preventDefault();
      if (scrollGuard.current) return;
      scrollGuard.current = true;
      if (e.deltaY > 0) goNext(); else goPrev();
      setTimeout(() => { scrollGuard.current = false; }, 650);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [goNext, goPrev]);

  // ── Offset for each card (circular shortest-path) ─────────────────────────
  const getOffset = (idx: number) => {
    let off = idx - active;
    if (off >  n / 2) off -= n;
    if (off < -n / 2) off += n;
    return off;
  };

  return (
    <>
      <style>{`
        /* ── Wrapper ─────────────────────────────────────────────────────── */
        .ps-wrapper {
          background: ${bgColor ?? C.bgSection};
          padding: 5rem 0;
          position: relative;
          overflow: hidden;
          font-family: var(--font-sans, 'Inter', sans-serif);
        }

        /* Atmosphere glow */
        .ps-wrapper::before {
          content: '';
          position: absolute;
          top: -10%;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 55%;
          background: radial-gradient(ellipse at center,
            rgba(22,62,112,0.45) 0%, rgba(0,0,0,0) 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* Film grain */
        .ps-wrapper::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          background-size: 180px 180px;
          opacity: 0.05;
          pointer-events: none;
          z-index: 0;
        }

        /* ── Header ──────────────────────────────────────────────────────── */
        .ps-header {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 0 1.5rem 3.5rem;
        }

        .ps-eyebrow {
          display: inline-block;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: ${C.blueBright};
          margin-bottom: 0.75rem;
        }

        .ps-eyebrow::before {
          content: '';
          display: block;
          width: 2rem;
          height: 1px;
          background: linear-gradient(to right,
            rgba(0,116,255,0) 0%, rgba(0,116,255,1) 50%, rgba(0,116,255,0) 100%);
          margin: 0 auto 0.75rem;
        }

        .ps-title {
          font-size: clamp(2rem, 5vw, 3.25rem);
          font-weight: 700;
          color: ${C.textHead};
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin: 0 0 1rem;
        }

        .ps-subtitle {
          font-size: 1rem;
          color: ${C.textMuted};
          max-width: 520px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* ── Stage (3-D perspective container) ───────────────────────────── */
        .ps-stage {
          position: relative;
          z-index: 1;
          height: ${CARD_H + 40}px;
          perspective: 1100px;
          perspective-origin: 50% 50%;
          overflow: hidden;
        }

        /* ── Card ────────────────────────────────────────────────────────── */
        .ps-card {
          border-radius: 1.125rem;
          overflow: hidden;
          border: 1px solid ${C.border};
          background: ${C.bgCard};
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          will-change: transform, opacity;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .ps-card[data-active="true"] {
          border-color: rgba(0,116,255,0.45);
          box-shadow:
            0 0 0 1px rgba(0,116,255,0.22),
            0 24px 56px rgba(0,116,255,0.18),
            0 6px 16px rgba(0,0,0,0.7);
        }

        /* Top edge glow on active card */
        .ps-card[data-active="true"]::before {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(to right,
            rgba(0,116,255,0) 0%, rgba(0,116,255,0.8) 50%, rgba(0,116,255,0) 100%);
          z-index: 3;
        }

        /* ── Photo ───────────────────────────────────────────────────────── */
        .ps-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          display: block;
          transition: transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94),
                      opacity 0.4s ease;
        }

        .ps-card[data-active="true"]:hover .ps-photo {
          transform: scale(1.04);
          opacity: 0.65;
        }

        .ps-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          background: linear-gradient(160deg,
            ${C.bgCard} 0%,
            ${C.blueDeep} 100%);
          color: ${C.textMuted};
        }

        .ps-placeholder-initial {
          width: 5rem;
          height: 5rem;
          border-radius: 50%;
          background: rgba(0,116,255,0.1);
          border: 1px solid rgba(0,116,255,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 700;
          color: rgba(0,116,255,0.7);
          letter-spacing: -0.02em;
        }

        /* ── Overlay gradient ────────────────────────────────────────────── */
        .ps-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(6,10,16,0.97)  0%,
            rgba(11,17,25,0.55) 40%,
            rgba(0,0,0,0)       68%
          );
          z-index: 1;
          pointer-events: none;
        }

        /* ── Info block ──────────────────────────────────────────────────── */
        .ps-info {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1.5rem 1.5rem 1.75rem;
          z-index: 2;
        }

        .ps-accent {
          width: 1.75rem;
          height: 2px;
          background: ${C.blueBright};
          border-radius: 2px;
          margin-bottom: 0.65rem;
          transition: width 0.4s ease;
        }

        .ps-card[data-active="true"] .ps-accent { width: 2.75rem; }

        .ps-name {
          font-size: 1.2rem;
          font-weight: 700;
          color: ${C.textHead};
          margin: 0 0 0.2rem;
          line-height: 1.2;
          letter-spacing: -0.01em;
        }

        .ps-role {
          font-size: 0.67rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: ${C.blueBright};
          margin: 0 0 0.2rem;
        }

        .ps-org {
          font-size: 0.76rem;
          color: ${C.textMuted};
          margin: 0 0 0.4rem;
          line-height: 1.4;
        }

        /* Contact details — only visible on active card hover */
        .ps-contacts {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: max-height 0.4s ease, opacity 0.4s ease;
        }

        .ps-card[data-active="true"]:hover .ps-contacts {
          max-height: 4rem;
          opacity: 1;
        }

        .ps-contact-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.72rem;
          color: ${C.textMuted};
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .ps-contact-item:hover { color: ${C.textBody}; }

        /* ── Dot navigation ──────────────────────────────────────────────── */
        .ps-controls {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding-top: 2.5rem;
        }

        .ps-arrow {
          width: 2.75rem;
          height: 2.75rem;
          border-radius: 50%;
          border: 1px solid ${C.border};
          background: ${C.bgCard};
          color: ${C.textMuted};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition:
            border-color 0.25s ease,
            background 0.25s ease,
            color 0.25s ease,
            transform 0.2s ease,
            box-shadow 0.25s ease;
          flex-shrink: 0;
        }

        .ps-arrow:hover {
          border-color: ${C.blueBright};
          background: rgba(0,116,255,0.1);
          color: ${C.textHead};
          transform: scale(1.1);
          box-shadow: 0 0 0 1px rgba(0,116,255,0.3), 0 4px 16px rgba(0,116,255,0.2);
        }

        .ps-arrow:active { transform: scale(0.94); }

        /* Dots */
        .ps-dots {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0 0.5rem;
        }

        .ps-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${C.border};
          border: none;
          padding: 0;
          cursor: pointer;
          transition: background 0.3s ease, width 0.3s ease, border-radius 0.3s ease;
          flex-shrink: 0;
        }

        .ps-dot[data-active="true"] {
          background: ${C.blueBright};
          width: 22px;
          border-radius: 3px;
        }

        .ps-dot:hover:not([data-active="true"]) {
          background: ${C.textMuted};
        }

        /* ── Responsive ──────────────────────────────────────────────────── */
        @media (max-width: 600px) {
          .ps-stage { height: 400px; }
        }
      `}</style>

      <section className="ps-wrapper" aria-label={title ?? "Team"}>
        {/* Header */}
        {(title || subtitle) && (
          <header className="ps-header">
            <span className="ps-eyebrow">{eyebrow}</span>
            {title    && <h2 className="ps-title">{title}</h2>}
            {subtitle && <p className="ps-subtitle">{subtitle}</p>}
          </header>
        )}

        {/* 3-D Stage */}
        <div
          className="ps-stage"
          ref={viewportRef}
          onMouseEnter={() => { isHovered.current = true; }}
          onMouseLeave={() => { isHovered.current = false; }}
          role="region"
          aria-label="Person carousel"
        >
          {members.map((person, idx) => {
            const offset   = getOffset(idx);
            const isActive = offset === 0;
            const initials = person.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={idx}
                className="ps-card"
                style={cardStyle(offset)}
                data-active={isActive.toString()}
                aria-hidden={!isActive}
                onClick={() => !isActive && goTo(idx)}
              >
                {/* Photo or initials placeholder */}
                {person.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={person.photo}
                    alt={person.alt ?? person.name}
                    className="ps-photo"
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div className="ps-placeholder">
                    <div className="ps-placeholder-initial">{initials}</div>
                  </div>
                )}

                {/* Gradient */}
                <div className="ps-overlay" aria-hidden="true" />

                {/* Info */}
                <div className="ps-info">
                  <div className="ps-accent" aria-hidden="true" />
                  <h3 className="ps-name">{person.name}</h3>
                  <p className="ps-role">{person.role}</p>
                  {person.organisation && (
                    <p className="ps-org">{person.organisation}</p>
                  )}

                  {/* Email + phone — slide in on active hover */}
                  {isActive && (person.email || person.phone) && (
                    <div className="ps-contacts">
                      {person.email && (
                        <a
                          href={`mailto:${person.email}`}
                          className="ps-contact-item"
                          aria-label={`Email ${person.name}`}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                            strokeLinejoin="round" aria-hidden="true">
                            <rect x="2" y="4" width="20" height="16" rx="2"/>
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                          </svg>
                          {person.email}
                        </a>
                      )}
                      {person.phone && (
                        <a
                          href={`tel:${person.phone.replace(/\s/g, "")}`}
                          className="ps-contact-item"
                          aria-label={`Call ${person.name}`}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                            strokeLinejoin="round" aria-hidden="true">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.1 12.09a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 1.84h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17z"/>
                          </svg>
                          {person.phone}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="ps-controls">
          <button className="ps-arrow" aria-label="Previous person" onClick={goPrev}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          <div className="ps-dots" role="tablist" aria-label="Select person">
            {members.map((_, i) => (
              <button
                key={i}
                className="ps-dot"
                data-active={(i === active).toString()}
                role="tab"
                aria-selected={i === active}
                aria-label={`Go to ${members[i].name}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>

          <button className="ps-arrow" aria-label="Next person" onClick={goNext}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </section>
    </>
  );
}
