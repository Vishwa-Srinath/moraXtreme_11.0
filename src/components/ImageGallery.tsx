"use client";

import React, { useState } from "react";
import type { GalleryImage, ImageGalleryProps } from "@/types/gallery";

// ─────────────────────────────────────────────────────────────────────────────
// Individual bento photo card
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
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function ImageGallery({
  images,
  title,
  subtitle,
}: ImageGalleryProps) {
  // We need at least 1 image; display up to 6 in the bento grid
  if (!images || images.length === 0) return null;

  const displayImages = images.slice(0, 6);

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

        /* ── Inner layout: left column + right bento ── */
        .ig-inner {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 3rem;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .ig-inner {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
        }

        /* ── Left panel ── */
        .ig-left {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          padding-top: 0.5rem;
          position: sticky;
          top: 6rem;
        }

        /* Eyebrow breadcrumb */
        .ig-eyebrow {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .ig-eyebrow-dot {
          width: 6px;
          height: 6px;
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
        .ig-eyebrow-sep {
          font-size: 0.6rem;
          color: #6B7B8D;
          opacity: 0.5;
        }

        /* Headline */
        .ig-headline {
          font-size: clamp(3rem, 6vw, 5.5rem);
          font-weight: 900;
          line-height: 0.88;
          letter-spacing: -0.03em;
          margin: 0 0 1.5rem;
        }
        .ig-headline-white {
          display: block;
          color: #FFFFFF;
        }
        .ig-headline-blue {
          display: block;
          color: #0074FF;
        }

        /* Description */
        .ig-desc {
          font-size: 0.82rem;
          color: #9AA5B4;
          line-height: 1.8;
          margin: 0 0 2rem;
          max-width: 240px;
        }

        /* CTA link */
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
        .ig-cta:hover {
          color: #0074FF;
        }
        .ig-cta-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          color: #FFFFFF;
          transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
          flex-shrink: 0;
        }
        .ig-cta:hover .ig-cta-circle {
          border-color: #0074FF;
          background: rgba(0,116,255,0.12);
          color: #0074FF;
        }
        .ig-cta-line {
          width: 2rem;
          height: 1px;
          background: rgba(255,255,255,0.2);
          transition: background 0.2s ease;
        }
        .ig-cta:hover .ig-cta-line {
          background: #0074FF;
        }

        /* ── Right bento grid ── */
        .ig-bento {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          grid-template-rows: auto auto;
          gap: 0.4rem;
        }
        @media (max-width: 768px) {
          .ig-bento {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto;
          }
        }
        @media (max-width: 500px) {
          .ig-bento {
            grid-template-columns: 1fr;
          }
        }

        /* Hero card spans 2 rows */
        .ig-bento-hero {
          grid-row: 1 / 3;
          grid-column: 1 / 2;
        }
        .ig-bento-card {
          position: relative;
          overflow: hidden;
          cursor: pointer;
          background: rgba(10,15,24,0.6);
          border: 1px solid rgba(13,37,67,0.4);
          border-radius: 4px;
          outline: none;
          transition: border-color 0.3s ease;
        }
        .ig-bento-hero { aspect-ratio: 16 / 13; }
        .ig-bento-card:not(.ig-bento-hero) { aspect-ratio: 16 / 9; }

        @media (max-width: 768px) {
          .ig-bento-hero {
            grid-row: auto;
            grid-column: auto;
            aspect-ratio: 16 / 9;
          }
        }

        .ig-bento-card:hover,
        .ig-bento-card:focus-visible {
          border-color: rgba(0,116,255,0.4);
        }

        .ig-bento-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .ig-bento-img--zoomed {
          transform: scale(1.07);
        }
        .ig-bento-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #0A0F18 0%, #163E70 100%);
        }

        /* Always-on gradient overlay */
        .ig-bento-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0,0,0,0.85) 0%,
            rgba(0,0,0,0.2) 45%,
            rgba(0,0,0,0) 100%
          );
          pointer-events: none;
        }

        /* Number + label in bottom-left */
        .ig-bento-meta {
          position: absolute;
          bottom: 0.75rem;
          left: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          pointer-events: none;
        }
        .ig-bento-num {
          font-size: 0.65rem;
          font-weight: 800;
          color: rgba(255,255,255,0.55);
          letter-spacing: 0.05em;
          line-height: 1;
        }
        .ig-bento-sep {
          width: 16px;
          height: 1px;
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

        /* Hero card has larger meta text */
        .ig-bento-hero .ig-bento-num {
          font-size: 0.75rem;
        }
        .ig-bento-hero .ig-bento-caption {
          font-size: 0.65rem;
        }
        .ig-bento-hero .ig-bento-meta {
          bottom: 1rem;
          left: 1.1rem;
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
              <span className="ig-headline-blue">MOMENTS</span>
            </h2>

            <p className="ig-desc">
              {subtitle ??
                "A glimpse into the energy, challenge, and community that make MoraXtreme more than just a competition."}
            </p>

            <a
              href="https://www.facebook.com/media/set/?vanity=ieeesbuom&set=a.1293608876132086"
              target="_blank"
              rel="noopener noreferrer"
              className="ig-cta"
            >
              <span className="ig-cta-circle">→</span>
              <span className="ig-cta-line" />
              <span>View All Moments</span>
            </a>
          </div>

          {/* ── Right bento grid ── */}
          <div className="ig-bento" role="list" aria-label="Highlights gallery">
            {displayImages.map((img, i) => (
              <BentoCard
                key={i}
                image={img}
                index={i}
                className={i === 0 ? "ig-bento-hero" : ""}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
