"use client";

import React, { useState } from "react";
import type { GalleryImage, ImageGalleryProps } from "@/types/gallery";

// Facebook album link
const FB_ALBUM_URL =
  "https://www.facebook.com/media/set/?vanity=ieeesbuom&set=a.1293608876132086";

// ─────────────────────────────────────────────────────────────────────────────
// Regular bento photo card
// ─────────────────────────────────────────────────────────────────────────────
function BentoCard({
  image,
  index,
  className = "",
}: {
  image: GalleryImage;
  index: number;
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const num = String(index + 1).padStart(2, "0");

  return (
    <article
      className={`ig-bento-card ${className}`}
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
          className={`ig-bento-img${hovered ? " ig-bento-img--zoomed" : ""}`}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="ig-bento-placeholder" />
      )}

      {/* Gradient overlay */}
      <div className="ig-bento-overlay" />

      {/* Number + caption */}
      <div className="ig-bento-meta">
        <span className="ig-bento-num">{num}</span>
        <span className="ig-bento-sep" />
        <span className="ig-bento-caption">{image.caption?.toUpperCase()}</span>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// "View Full Album" card (8th slot)
// ─────────────────────────────────────────────────────────────────────────────
function AlbumCard({ bgImage }: { bgImage?: GalleryImage }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={FB_ALBUM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`ig-bento-card ig-album-card${hovered ? " ig-album-card--hovered" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="View full album on Facebook"
    >
      {/* Background image — absolutely positioned to fill the full card */}
      {bgImage?.src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bgImage.src}
          alt={bgImage.alt}
          className={`ig-album-bg-img${hovered ? " ig-bento-img--zoomed" : ""}`}
          loading="lazy"
          decoding="async"
        />
      )}

      {/* Dark overlay — stronger than regular cards */}
      <div className="ig-album-overlay" />

      {/* Centred content */}
      <div className="ig-album-content">
        {/* Facebook "f" logo mark */}
        <div className="ig-album-fb-icon">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            width="22"
            height="22"
            aria-hidden="true"
          >
            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.884v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
          </svg>
        </div>

        <p className="ig-album-label">View Full Album</p>
        <p className="ig-album-sub">on Facebook</p>
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
  subtitle,
}: ImageGalleryProps) {
  if (!images || images.length === 0) return null;

  // Layout:
  //   Row 1 (top):    hero[0]  | small[1]  | small[2]
  //   Row 2 (middle): hero[0]  | small[3]  | small[4]   ← hero spans rows 1+2
  //   Row 3 (bottom): small[5] | small[6]  | AlbumCard
  //
  // We need images 0-6 (7 photos) + the album card as the 8th slot.
  // Slice defensively but the placeholder already has 9 items.
  const photos = images.slice(0, 7);   // indices 0-6

  return (
    <>
      <style>{`
        /* ── Section wrapper ── */
        .ig-section {
          position: relative;
          z-index: 10;
          width: 100%;
          padding: 5rem 3rem;
          font-family: var(--font-sans, 'Inter', 'Helvetica Neue', sans-serif);
          background: transparent;
        }

        /* ── Inner layout: fixed left column + right bento ── */
        .ig-inner {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          /*
           * Left panel is fixed 260 px and does NOT overlap the grid.
           * 'align-items: start' keeps the panel flush with the bento top.
           */
          grid-template-columns: 260px 1fr;
          gap: 3.5rem;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .ig-inner {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        /* ── Left panel ── */
        .ig-left {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          padding-top: 0.25rem;
          position: sticky;
          top: 6rem;
          /* Stays entirely within its grid column — no overflow */
          overflow: visible;
        }

        /* Eyebrow */
        .ig-eyebrow {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .ig-eyebrow-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #0074FF;
          flex-shrink: 0;
        }
        .ig-eyebrow-text {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.22em;
          color: #6B7B8D;
          text-transform: uppercase;
        }
        .ig-eyebrow-sep { font-size: 0.6rem; color: #6B7B8D; opacity: 0.5; }

        /* Headline */
        .ig-headline {
          /* Ceiling reduced to 3.8rem so a 5-char word fits the 260px panel.
           * At 3.8rem (≈61px), "SHOTS" with Inter 900 ≈ 245px — safely within 260px. */
          font-size: clamp(2.8rem, 4vw, 3.8rem);
          font-weight: 900;
          line-height: 0.88;
          letter-spacing: -0.03em;
          margin: 0 0 1.5rem;
          max-width: 100%;
        }
        .ig-headline-white { display: block; color: #FFFFFF; }
        /* Hard guard: never let the blue word wrap regardless of viewport */
        .ig-headline-blue  { display: block; color: #0074FF; white-space: nowrap; }


        /* Description */
        .ig-desc {
          font-size: 0.82rem;
          color: #9AA5B4;
          line-height: 1.8;
          margin: 0 0 2rem;
          max-width: 220px;
        }

        /* ── CTA "View All Moments" ── */
        .ig-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: #FFFFFF;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          transition: color 0.2s ease;
        }
        .ig-cta:hover { color: #0074FF; }

        /* Circle icon — using an images-stack glyph instead of arrow */
        .ig-cta-circle {
          width: 36px; height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.22);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .ig-cta:hover .ig-cta-circle {
          border-color: #0074FF;
          background: rgba(0,116,255,0.12);
        }
        .ig-cta-circle svg {
          width: 15px; height: 15px;
          color: #FFFFFF;
          transition: color 0.2s ease;
          flex-shrink: 0;
        }
        .ig-cta:hover .ig-cta-circle svg { color: #0074FF; }

        .ig-cta-line {
          width: 2rem; height: 1px;
          background: rgba(255,255,255,0.2);
          transition: background 0.2s ease;
        }
        .ig-cta:hover .ig-cta-line { background: #0074FF; }

        /* ─────────────────────────────────────────────────────────────────────
         * Bento grid
         *
         * Layout (desktop):
         *   col 1 (2fr)  col 2 (1fr)  col 3 (1fr)
         *   [  HERO   ]  [  img 2  ]  [  img 3  ]   row 1
         *   [  HERO   ]  [  img 4  ]  [  img 5  ]   row 2
         *   [  img 6  ]  [  img 7  ]  [  ALBUM  ]   row 3
         *
         * All three rows share the same height so the 2-row hero is exactly
         * as tall as the two smaller rows combined (gap included).
         * ──────────────────────────────────────────────────────────────────── */
        .ig-bento {
          display: grid;
          grid-template-columns: 11fr 12fr 12fr;
          /*
           * Three equal-height rows — hero spans rows 1+2, everything lines up.
           * We use a fixed row height derived from the hero's desired aspect
           * ratio so the grid self-sizes correctly.
           * Hero aspect roughly 3:4 split across 2 rows → each row ≈ 3:2.
           */
          grid-template-rows: repeat(3, auto);
          gap: 0.4rem;
          /* Ensure bento fills its grid column */
          width: 100%;
        }

        /* Hero card spans rows 1+2, column 1 */
        .ig-bento-hero {
          grid-row: 1 / 3;
          grid-column: 1 / 2;
          /*
           * aspect-ratio drives the height of rows 1+2 combined.
           * 2 rows + 1 gap (0.4rem) ≈ height.  We pick 3:4 to match portrait.
           */
          aspect-ratio: 3 / 4;
        }

        /* Side cards in rows 1 and 2 */
        .ig-bento-card:not(.ig-bento-hero):not(.ig-album-card) {
          aspect-ratio: 16 / 9;
        }

        /* Row 3 cards (imgs 6+7 and album) — same 16:9 */
        .ig-bento-row3 { aspect-ratio: 16 / 9; }

        /* Shared card styles */
        .ig-bento-card {
          position: relative;
          overflow: hidden;
          cursor: pointer;
          background: rgba(10,15,24,0.6);
          border: 1px solid rgba(13,37,67,0.4);
          border-radius: 6px;
          outline: none;
          text-decoration: none;
          display: block;
          transition: border-color 0.3s ease;
        }
        .ig-bento-card:hover,
        .ig-bento-card:focus-visible {
          border-color: rgba(0,116,255,0.45);
        }

        .ig-bento-img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .ig-bento-img--zoomed { transform: scale(1.07); }

        .ig-bento-placeholder {
          width: 100%; height: 100%;
          background: linear-gradient(135deg, #0A0F18 0%, #163E70 100%);
        }

        /* Gradient overlay on regular cards */
        .ig-bento-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0,0,0,0.85) 0%,
            rgba(0,0,0,0.18) 45%,
            rgba(0,0,0,0) 100%
          );
          pointer-events: none;
        }

        /* Number + caption */
        .ig-bento-meta {
          position: absolute;
          bottom: 0.75rem; left: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          pointer-events: none;
          z-index: 2;
        }
        .ig-bento-num {
          font-size: 0.65rem;
          font-weight: 800;
          color: rgba(255,255,255,0.55);
          letter-spacing: 0.05em;
          line-height: 1;
        }
        .ig-bento-sep {
          width: 16px; height: 1px;
          background: rgba(255,255,255,0.25);
          flex-shrink: 0;
        }
        .ig-bento-caption {
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: rgba(255,255,255,0.75);
          text-transform: uppercase;
        }
        /* Hero card — slightly larger meta */
        .ig-bento-hero .ig-bento-num   { font-size: 0.75rem; }
        .ig-bento-hero .ig-bento-caption { font-size: 0.65rem; }
        .ig-bento-hero .ig-bento-meta  { bottom: 1rem; left: 1.1rem; }

        /* ── Album card (8th slot) ── */
        .ig-album-card {
          position: relative;
          overflow: hidden;
          border-radius: 6px;
          border: 1px solid rgba(0,116,255,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          text-decoration: none;
          aspect-ratio: 16 / 9;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .ig-album-card:hover,
        .ig-album-card--hovered {
          border-color: rgba(0,116,255,0.7);
          box-shadow: 0 0 28px rgba(0,116,255,0.25);
        }

        /* Stronger dark overlay so the text pops */
        .ig-album-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 6, 20, 0.78);
          pointer-events: none;
          transition: background 0.3s ease;
        }
        .ig-album-card:hover .ig-album-overlay {
          background: rgba(0, 6, 20, 0.68);
        }

        /* Background image fills the full album card */
        .ig-album-bg-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .ig-bento-img--zoomed.ig-album-bg-img,
        .ig-album-bg-img.ig-bento-img--zoomed { transform: scale(1.07); }

        /* Centred content block */
        .ig-album-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.45rem;
          text-align: center;
          padding: 0 1rem;
        }

        /* Facebook icon circle */
        .ig-album-fb-icon {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: #1877F2;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          margin-bottom: 0.35rem;
          box-shadow: 0 0 18px rgba(24,119,242,0.5);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .ig-album-card:hover .ig-album-fb-icon {
          transform: scale(1.1);
          box-shadow: 0 0 28px rgba(24,119,242,0.7);
        }

        .ig-album-label {
          font-size: 0.75rem;
          font-weight: 800;
          color: #FFFFFF;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin: 0;
          line-height: 1.2;
        }
        .ig-album-sub {
          font-size: 0.6rem;
          font-weight: 600;
          color: #1877F2;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin: 0;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .ig-bento {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto;
          }
          .ig-bento-hero {
            grid-row: auto;
            grid-column: 1 / -1;
            aspect-ratio: 16 / 9;
          }
          .ig-bento-card:not(.ig-bento-hero) { aspect-ratio: 4 / 3; }
          .ig-album-card { aspect-ratio: 4 / 3; }
        }
        @media (max-width: 500px) {
          .ig-bento { grid-template-columns: 1fr; }
          .ig-bento-hero { grid-column: auto; }
        }
      `}</style>

      <section
        className="ig-section"
        id="gallery"
        aria-label={title ?? "Image Gallery"}
      >
        <div className="ig-inner">
          {/* ── Left editorial panel ── */}
          <div className="ig-left">
            <div className="ig-eyebrow">
              <span className="ig-eyebrow-dot" />
              <span className="ig-eyebrow-text">MoraXtreme 11.0</span>
              <span className="ig-eyebrow-sep">/</span>
              <span className="ig-eyebrow-text">Highlights</span>
            </div>

            <h2 className="ig-headline">
              <span className="ig-headline-white">THE</span>
              <span className="ig-headline-blue">SHOTS</span>
            </h2>

            <p className="ig-desc">
              {subtitle ??
                "A glimpse into the ideas, energy, and innovation that define the MoraXtreme experience."}
            </p>

            {/* CTA — photo stack icon instead of arrow */}
            <a
              href={FB_ALBUM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ig-cta"
              aria-label="View all moments on Facebook"
            >
              <span className="ig-cta-circle">
                {/* Photo / images icon */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </span>
              <span className="ig-cta-line" />
              <span>View All Moments</span>
            </a>
          </div>

          {/* ── Right bento grid ── */}
          <div className="ig-bento" role="list" aria-label="Highlights gallery">

            {/* ── Row 1 + 2 ── */}
            {/* Hero: image[0] spans rows 1+2 */}
            {photos[0] && (
              <BentoCard
                image={photos[0]}
                index={0}
                className="ig-bento-hero"
              />
            )}

            {/* Row 1, cols 2+3: images 1 & 2 */}
            {photos[1] && <BentoCard image={photos[1]} index={1} />}
            {photos[2] && <BentoCard image={photos[2]} index={2} />}

            {/* Row 2, cols 2+3: images 3 & 4 */}
            {photos[3] && <BentoCard image={photos[3]} index={3} />}
            {photos[4] && <BentoCard image={photos[4]} index={4} />}

            {/* ── Row 3: images 5, 6 + Album card ── */}
            {photos[5] && (
              <BentoCard image={photos[5]} index={5} className="ig-bento-row3" />
            )}
            {photos[6] && (
              <BentoCard image={photos[6]} index={6} className="ig-bento-row3" />
            )}

            {/* 8th slot: "View Full Album" card */}
            <AlbumCard bgImage={photos[6]} />

          </div>
        </div>
      </section>
    </>
  );
}
