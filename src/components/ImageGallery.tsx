"use client";

import React, { useState } from "react";
import type { GalleryImage, ImageGalleryProps } from "@/types/gallery";

export const GALLERY_COLORS = {
  bgPage: "#000000",
  bgSection: "#060A10",
  bgCard: "#0B1119",
  border: "#0D2543",
  blueDeep: "#163E70",
  blueBright: "#0074FF",
  blueLight: "#3390FF",
  textHeadline: "#FFFFFF",
  textBody: "#E8ECF1",
  textSecondary: "#9AA5B4",
} as const;


// COMPONENT
export default function ImageGallery({
  images,
  title,
  subtitle,
  columns = 3,
  bgColor,
}: ImageGalleryProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const gridColsClass: Record<number, string> = {
    2: "gallery-grid-2",
    3: "gallery-grid-3",
    4: "gallery-grid-4",
  };

  const c = GALLERY_COLORS;

  return (
    <>
      <style>{`
        .mx-gallery-wrapper {
          background-color: ${bgColor ?? c.bgSection};
          padding: 5rem 1.5rem;
          position: relative;
          overflow: hidden;
          font-family: var(--font-sans, 'Inter', sans-serif);
        }

        /* Radial atmosphere glow — deep blue at 45% fading to black */
        .mx-gallery-wrapper::before {
          content: '';
          position: absolute;
          top: -20%;
          left: 50%;
          transform: translateX(-50%);
          width: 70%;
          height: 60%;
          background: radial-gradient(ellipse at center,
            rgba(22,62,112,0.45) 0%,
            rgba(0,0,0,0) 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* Film-grain overlay (brand spec §7: 4-6% opacity) */
        .mx-gallery-wrapper::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          background-size: 180px 180px;
          opacity: 0.05;
          pointer-events: none;
          z-index: 0;
        }

        .mx-gallery-inner {
          position: relative;
          z-index: 1;
          max-width: 1280px;
          margin: 0 auto;
        }

        .mx-gallery-header {
          text-align: center;
          margin-bottom: 3.5rem;
        }

        .mx-gallery-eyebrow {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: ${c.blueBright};
          margin-bottom: 0.75rem;
        }

        .mx-gallery-eyebrow::before {
          content: '';
          display: block;
          width: 2rem;
          height: 1px;
          background: linear-gradient(to right,
            rgba(0,116,255,0) 0%,
            rgba(0,116,255,1) 50%,
            rgba(0,116,255,0) 100%);
          margin: 0 auto 0.75rem;
        }

        .mx-gallery-title {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 700;
          color: ${c.textHeadline};
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin: 0 0 1rem;
        }

        .mx-gallery-subtitle {
          font-size: 1rem;
          color: ${c.textSecondary};
          max-width: 560px;
          margin: 0 auto;
          line-height: 1.7;
        }

        .mx-gallery-grid {
          display: grid;
          gap: 1.25rem;
          grid-template-columns: 1fr;
        }

        @media (min-width: 640px) {
          .gallery-grid-2 { grid-template-columns: repeat(2, 1fr); }
          .gallery-grid-3 { grid-template-columns: repeat(2, 1fr); }
          .gallery-grid-4 { grid-template-columns: repeat(2, 1fr); }
        }

        @media (min-width: 1024px) {
          .gallery-grid-2 { grid-template-columns: repeat(2, 1fr); }
          .gallery-grid-3 { grid-template-columns: repeat(3, 1fr); }
          .gallery-grid-4 { grid-template-columns: repeat(4, 1fr); }
        }

        .mx-gallery-item {
          position: relative;
          border-radius: 0.875rem;
          overflow: hidden;
          border: 1px solid ${c.border};
          background: ${c.bgCard};
          cursor: pointer;
          aspect-ratio: 4 / 3;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .mx-gallery-item:hover {
          border-color: rgba(0,116,255,0.45);
          box-shadow:
            0 0 0 1px rgba(0,116,255,0.25),
            0 8px 32px rgba(0,116,255,0.15),
            0 2px 8px rgba(0,0,0,0.6);
        }

        .mx-gallery-item:focus-visible {
          outline: 2px solid ${c.blueBright};
          outline-offset: 3px;
        }

        .mx-gallery-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94),
                      opacity 0.35s ease;
          transform-origin: center center;
        }

        .mx-gallery-item:hover .mx-gallery-img {
          transform: scale(1.08);
          opacity: 0.5;
        }

        .mx-gallery-caption {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 1.25rem;
          background: linear-gradient(
            to top,
            rgba(22,62,112,0.92) 0%,
            rgba(11,17,25,0.6) 40%,
            rgba(0,0,0,0) 75%);
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.35s ease, transform 0.35s ease;
          pointer-events: none;
        }

        .mx-gallery-item:hover .mx-gallery-caption {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .mx-gallery-badge {
          position: absolute;
          top: 0.85rem;
          left: 0.85rem;
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: ${c.blueBright};
          background: rgba(0,0,0,0.55);
          border: 1px solid rgba(0,116,255,0.35);
          border-radius: 99px;
          padding: 0.2rem 0.65rem;
          backdrop-filter: blur(6px);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .mx-gallery-item:hover .mx-gallery-badge {
          opacity: 1;
        }

        .mx-gallery-caption-title {
          font-size: 1rem;
          font-weight: 600;
          color: ${c.textHeadline};
          margin: 0 0 0.35rem;
          line-height: 1.3;
        }

        .mx-gallery-caption-title::before {
          content: '';
          display: block;
          width: 1.75rem;
          height: 2px;
          background: ${c.blueBright};
          margin-bottom: 0.55rem;
          border-radius: 2px;
        }

        .mx-gallery-caption-desc {
          font-size: 0.8rem;
          color: ${c.textSecondary};
          line-height: 1.55;
          margin: 0;
        }

        .mx-gallery-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg,
            ${c.bgCard} 0%,
            ${c.blueDeep} 100%);
          color: ${c.textSecondary};
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
      `}</style>

      <section className="mx-gallery-wrapper" aria-label={title ?? "Image Gallery"}>
        <div className="mx-gallery-inner">
          {(title || subtitle) && (
            <header className="mx-gallery-header">
              {title && <span className="mx-gallery-eyebrow">Gallery</span>}
              {title && <h2 className="mx-gallery-title">{title}</h2>}
              {subtitle && <p className="mx-gallery-subtitle">{subtitle}</p>}
            </header>
          )}

          <div
            className={`mx-gallery-grid ${gridColsClass[columns]}`}
            role="list"
          >
            {images.map((image, idx) => (
              <article
                key={idx}
                className="mx-gallery-item"
                role="listitem"
                tabIndex={0}
                aria-label={image.caption}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onFocus={() => setHoveredIdx(idx)}
                onBlur={() => setHoveredIdx(null)}
              >
                {image.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="mx-gallery-img"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="mx-gallery-placeholder">
                    <span>Image</span>
                  </div>
                )}

                <span className="mx-gallery-badge" aria-hidden="true">View</span>

                <div className="mx-gallery-caption">
                  <p className="mx-gallery-caption-title">{image.caption}</p>
                  {image.description && (
                    <p className="mx-gallery-caption-desc">{image.description}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
