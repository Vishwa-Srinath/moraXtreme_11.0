"use client";

import React, { useState } from "react";
import type { GalleryImage, ImageGalleryProps } from "@/types/gallery";

// ─────────────────────────────────────────────────────────────────────────────
// MoraXtreme 11.0 colour tokens
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  bgPage:        "#000000",
  bgSection:     "#05080E",
  bgCard:        "#0A0F18",
  border:        "rgba(13,37,67,0.8)",
  blueDeep:      "#163E70",
  blueBright:    "#0074FF",
  blueLight:     "rgba(0,116,255,0.18)",
  textHeadline:  "#FFFFFF",
  textBody:      "#E8ECF1",
  textMuted:     "#6B7B8D",
  textSecondary: "#9AA5B4",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Hero slot — first image, cinematic overlay */
function HeroSlot({ image }: { image: GalleryImage }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="ig-hero"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {image.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image.src}
          alt={image.alt}
          className={`ig-hero-img${hovered ? " ig-hero-img--zoomed" : ""}`}
          loading="eager"
          decoding="async"
        />
      ) : (
        <div className="ig-placeholder" />
      )}

      {/* Dark gradient overlay */}
      <div className="ig-hero-overlay" />

      {/* Content */}
      <div className="ig-hero-content">
        <div className="ig-hero-eyebrow">
          <span className="ig-hero-event">MORAXTREME 10.0</span>
          <span className="ig-hero-divider">·</span>
          <span className="ig-hero-sub">ALGORITHM CHALLENGE</span>
        </div>

        <h2 className="ig-hero-headline">
          <span className="ig-hero-hl-white">MORAEXTREME</span>
          <br />
          <span className="ig-hero-hl-blue">10.0</span>
        </h2>

        <p className="ig-hero-tagline">
          Where algorithms become instinct.<br />
          Where minutes disappear.<br />
          Where problems become battles.
        </p>
      </div>

      {/* Scroll hint */}
      <div className="ig-hero-scrollhint" aria-hidden="true">
        <span>SCROLL</span>
        <span className="ig-hero-scrollarrow">↓</span>
      </div>

      {/* Corner tag */}
      <div className="ig-hero-corner" aria-hidden="true">MORA — 2025</div>
    </div>
  );
}

/** Stats bar */
function StatsBar({ count }: { count: number }) {
  return (
    <div className="ig-stats">
      <div className="ig-stat">
        <span className="ig-stat-number">02</span>
        <span className="ig-stat-label">ROUNDS</span>
      </div>
      <div className="ig-stat-sep" />
      <div className="ig-stat">
        <span className="ig-stat-number">24+</span>
        <span className="ig-stat-label">HOURS</span>
      </div>
      <div className="ig-stat-sep" />
      <div className="ig-stat">
        <span className="ig-stat-number">100+</span>
        <span className="ig-stat-label">TEAMS</span>
      </div>
    </div>
  );
}

/** Individual numbered grid card */
function GridCard({ image, index }: { image: GalleryImage; index: number }) {
  const [hovered, setHovered] = useState(false);
  const num = String(index + 1).padStart(2, "0");

  return (
    <article
      className="ig-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      aria-label={image.caption}
    >
      {image.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image.src}
          alt={image.alt}
          className={`ig-card-img${hovered ? " ig-card-img--zoomed" : ""}`}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="ig-placeholder ig-placeholder--card" />
      )}

      {/* Always-visible gradient + number + title */}
      <div className="ig-card-overlay">
        <div className="ig-card-number">{num}</div>
        <div className="ig-card-info">
          <p className="ig-card-title">{image.caption?.toUpperCase()}</p>
          <p className={`ig-card-desc${hovered ? " ig-card-desc--visible" : ""}`}>
            {image.description}
          </p>
        </div>
      </div>
    </article>
  );
}

/** End-card — closer tile */
function EndCard({ title }: { title: string }) {
  return (
    <a href="https://www.facebook.com/media/set/?vanity=ieeesbuom&set=a.1293608876132086" target="_blank" rel="noopener noreferrer" className="ig-end-card">
      <div className="ig-end-bg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/moraxtreme-10.0-1.jpg" alt="Facebook Album Background" />
      </div>
      <div className="ig-end-content">
        <p className="ig-end-label">{title?.toUpperCase()}</p>
        <p className="ig-end-sub">VIEW FULL ALBUM VIA FACEBOOK</p>
        <span className="ig-end-arrow">↗</span>
      </div>
    </a>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function ImageGallery({
  images,
  title,
}: ImageGalleryProps) {
  const [hero, ...rest] = images;
  if (!hero) return null;

  const gridItems = rest;
  const remainder = gridItems.length % 3;
  const showEndCard = remainder !== 0 ? 3 - remainder >= 1 : true;

  return (
    <>
      <style>{`
        .ig-wrapper {
          background: #05080E;
          font-family: var(--font-sans, 'Inter', 'Helvetica Neue', sans-serif);
          position: relative;
          overflow: hidden;
        }

        /* ── Hero ── */
        .ig-hero {
          position: relative;
          width: 100%;
          height: clamp(320px, 56vw, 620px);
          overflow: hidden;
          cursor: crosshair;
        }
        .ig-hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 8s ease, opacity 0.4s ease;
          transform-origin: center center;
        }
        .ig-hero-img--zoomed {
          transform: scale(1.04);
          opacity: 0.85;
        }
        .ig-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #0A0F18 0%, #163E70 100%);
        }
        .ig-placeholder--card {
          background: linear-gradient(135deg, #0A0F18 0%, #0D2543 100%);
        }
        .ig-hero-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to right, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.05) 100%),
            linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%);
          pointer-events: none;
        }
        .ig-hero-content {
          position: absolute;
          bottom: 0;
          left: 0;
          padding: clamp(1.5rem, 4vw, 3.5rem);
          max-width: 520px;
        }
        .ig-hero-eyebrow {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .ig-hero-event {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.22em;
          color: #0074FF;
          text-transform: uppercase;
        }
        .ig-hero-divider { color: #6B7B8D; font-size: 0.65rem; }
        .ig-hero-sub {
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.18em;
          color: #6B7B8D;
          text-transform: uppercase;
        }
        .ig-hero-headline {
          margin: 0 0 1rem;
          line-height: 0.88;
          font-weight: 900;
        }
        .ig-hero-hl-white {
          display: block;
          font-size: clamp(3.5rem, 10vw, 7.5rem);
          color: #FFFFFF;
          letter-spacing: -0.03em;
        }
        .ig-hero-hl-blue {
          display: block;
          font-size: clamp(3.5rem, 10vw, 7.5rem);
          color: #0074FF;
          letter-spacing: -0.03em;
        }
        .ig-hero-tagline {
          font-size: clamp(0.7rem, 1.5vw, 0.82rem);
          color: #9AA5B4;
          line-height: 1.9;
          margin: 0;
          letter-spacing: 0.02em;
        }
        .ig-hero-scrollhint {
          position: absolute;
          top: 50%;
          right: 1.5rem;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.55rem;
          font-weight: 700;
          letter-spacing: 0.22em;
          color: #6B7B8D;
          writing-mode: vertical-rl;
        }
        .ig-hero-scrollarrow {
          writing-mode: horizontal-tb;
          font-size: 0.9rem;
          color: #0074FF;
          animation: ig-bounce 1.6s ease infinite;
        }
        @keyframes ig-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
        .ig-hero-corner {
          position: absolute;
          top: 1.2rem;
          right: 1.2rem;
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          color: #6B7B8D;
          text-transform: uppercase;
        }

        /* ── Stats bar ── */
        .ig-stats {
          display: flex;
          align-items: center;
          gap: 0;
          background: #0A0F18;
          border-top: 1px solid rgba(13,37,67,0.8);
          border-bottom: 1px solid rgba(13,37,67,0.8);
          padding: 0.9rem clamp(1.5rem, 4vw, 3.5rem);
        }
        .ig-stat {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }
        .ig-stat-number {
          font-size: clamp(1.3rem, 3vw, 1.9rem);
          font-weight: 800;
          color: #FFFFFF;
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .ig-stat-label {
          font-size: 0.58rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          color: #6B7B8D;
          text-transform: uppercase;
        }
        .ig-stat-sep {
          width: 1px;
          height: 2rem;
          background: rgba(13,37,67,0.8);
          margin: 0 2rem;
          flex-shrink: 0;
        }

        /* ── Grid ── */
        .ig-grid-section {
          padding: clamp(1.5rem, 3vw, 2.5rem) clamp(1rem, 3vw, 2.5rem);
        }
        .ig-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.5rem;
        }
        @media (min-width: 640px) {
          .ig-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 900px) {
          .ig-grid { grid-template-columns: repeat(3, 1fr); }
        }

        /* ── Grid card ── */
        .ig-card {
          position: relative;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          background: #0A0F18;
          cursor: pointer;
          outline: none;
        }
        .ig-card:focus-visible {
          box-shadow: inset 0 0 0 2px #0074FF;
        }
        .ig-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                      filter 0.4s ease;
        }
        .ig-card-img--zoomed {
          transform: scale(1.07);
          filter: brightness(0.55);
        }
        .ig-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0,0,0,0.92) 0%,
            rgba(0,0,0,0.4) 35%,
            rgba(0,0,0,0) 65%
          );
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 1rem 1.1rem;
          pointer-events: none;
        }
        .ig-card-number {
          position: absolute;
          top: 0.8rem;
          left: 0.9rem;
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #6B7B8D;
        }
        .ig-card-info { margin-top: auto; }
        .ig-card-title {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #FFFFFF;
          margin: 0 0 0.25rem;
          line-height: 1.3;
        }
        .ig-card-desc {
          font-size: 0.68rem;
          color: #9AA5B4;
          line-height: 1.5;
          margin: 0;
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: max-height 0.35s ease, opacity 0.3s ease;
        }
        .ig-card-desc--visible {
          max-height: 4rem;
          opacity: 1;
        }

        /* ── End card ── */
        .ig-end-card {
          aspect-ratio: 4 / 3;
          background: #0B1119;
          border: 1px solid rgba(13,37,67,0.8);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          text-decoration: none;
          cursor: pointer;
          transition: border-color 0.3s ease;
        }
        .ig-end-card:hover {
          border-color: #0074FF;
        }
        .ig-end-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          background: #000;
        }
        .ig-end-bg img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.3;
          transition: transform 0.6s ease, opacity 0.3s ease;
        }
        .ig-end-card:hover .ig-end-bg img {
          opacity: 0.5;
          transform: scale(1.05);
        }
        .ig-end-content {
          position: relative;
          z-index: 1;
        }
        .ig-end-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 30% 60%, rgba(0,116,255,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .ig-end-label {
          font-size: clamp(0.65rem, 2vw, 0.85rem);
          font-weight: 800;
          letter-spacing: 0.16em;
          color: #FFFFFF;
          line-height: 1.3;
          margin: 0 0 0.5rem;
        }
        .ig-end-sub {
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          color: #6B7B8D;
          margin: 0;
          text-transform: uppercase;
        }
        .ig-end-arrow {
          position: absolute;
          bottom: 1.2rem;
          right: 1.4rem;
          font-size: 1.3rem;
          color: #0074FF;
        }
      `}</style>

      <section className="ig-wrapper" aria-label={title ?? "Image Gallery"}>
        <HeroSlot image={hero} />
        <StatsBar count={images.length} />
        <div className="ig-grid-section">
          <div className="ig-grid">
            {gridItems.map((img, i) => (
              <GridCard key={i} image={img} index={i} />
            ))}
            {showEndCard && <EndCard title={title ?? "MoraXtreme 10.0"} />}
          </div>
        </div>
      </section>
    </>
  );
}
