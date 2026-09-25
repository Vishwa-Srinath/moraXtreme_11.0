"use client";

import React, { useState } from "react";
import type { GalleryImage, ImageGalleryProps } from "@/types/gallery";
import { GALLERY_PLACEHOLDER_IMAGES } from "@/data/gallery.placeholder";
import styles from "./ImageGallery.module.css";

const FB_ALBUM_URL =
  "https://www.facebook.com/media/set/?vanity=ieeesbuom&set=a.1293608876132086";

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
      className={`${styles["bento-card"]} ${className}`}
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
          className={`${styles["bento-img"]}${hovered ? ` ${styles["bento-img--zoomed"]}` : ""}`}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className={styles["bento-placeholder"]} />
      )}

      {/* Gradient overlay */}
      <div className={styles["bento-overlay"]} />

      {/* Number + caption */}
      <div className={styles["bento-meta"]}>
        <span className={styles["bento-num"]}>{num}</span>
        <span className={styles["bento-sep"]} />
        <span className={styles["bento-caption"]}>{image.caption?.toUpperCase()}</span>
      </div>
    </article>
  );
}

function AlbumCard({ bgImage }: { bgImage?: GalleryImage }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={FB_ALBUM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles["bento-card"]} ${styles["album-card"]}${hovered ? ` ${styles["album-card--hovered"]}` : ""}`}
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
          className={`${styles["album-bg-img"]}${hovered ? ` ${styles["bento-img--zoomed"]}` : ""}`}
          loading="lazy"
          decoding="async"
        />
      )}

      {/* Dark overlay — stronger than regular cards */}
      <div className={styles["album-overlay"]} />

      {/* Centred content */}
      <div className={styles["album-content"]}>
        {/* Facebook "f" logo mark */}
        <div className={styles["album-fb-icon"]}>
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

        <p className={styles["album-label"]}>View Full Album</p>
        <p className={styles["album-sub"]}>on Facebook</p>
      </div>
    </a>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function ImageGallery({
  images = GALLERY_PLACEHOLDER_IMAGES,
  title,
  subtitle,
}: ImageGalleryProps) {
  if (!images || images.length === 0) return null;

  const photos = images.slice(0, 7); 

  return (
    <>
      

      <section
        className={styles.section}
        id="gallery"
        aria-label={title ?? "Image Gallery"}
      >
        <div className={styles.inner}>
          {/* ── Left editorial panel ── */}
          <div className={styles.left}>
            <div className={styles.eyebrow}>
              <span className={styles["eyebrow-dot"]} />
              <span className={styles["eyebrow-text"]}>MoraXtreme 11.0</span>
              <span className={styles["eyebrow-sep"]}>/</span>
              <span className={styles["eyebrow-text"]}>Highlights</span>
            </div>

            <h2 className={styles.headline}>
              <span className={styles["headline-white"]}>THE</span>
              <span className={styles["headline-blue"]}>SHOTS</span>
            </h2>

            <p className={styles.desc}>
              {subtitle ??
                "A glimpse into the ideas, energy, and innovation that define the MoraXtreme experience."}
            </p>

            {/* CTA — photo stack icon instead of arrow */}
            <a
              href={FB_ALBUM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.cta}
              aria-label="View all moments on Facebook"
            >
              <span className={styles["cta-circle"]}>
                {/* Photo / images icon */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </span>
              <span className={styles["cta-line"]} />
              <span>View All Moments</span>
            </a>
          </div>

          {/* ── Right bento grid ── */}
          <div className={styles.bento} role="list" aria-label="Highlights gallery">

            {/* ── Row 1 + 2 ── */}
            {/* Hero: image[0] spans rows 1+2 */}
            {photos[0] && (
              <BentoCard
                image={photos[0]}
                index={0}
                className={styles["bento-hero"]}
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
              <BentoCard image={photos[5]} index={5} className={styles["bento-row3"]} />
            )}
            {photos[6] && (
              <BentoCard image={photos[6]} index={6} className={styles["bento-row3"]} />
            )}

            {/* 8th slot: "View Full Album" card */}
            <AlbumCard bgImage={photos[6]} />

          </div>
        </div>
      </section>
    </>
  );
}
