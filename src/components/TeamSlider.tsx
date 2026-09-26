"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Mail, Phone } from "lucide-react";
import type { TeamSliderProps } from "@/types/team";
import styles from "./TeamSlider.module.css";
import { TEAM_PLACEHOLDER } from "@/data/team.placeholder";

const C = {
  border: "rgba(13,37,67,0.5)",
  borderAct: "#0074FF",
  blueBright: "#0074FF",
  blueDeep: "#163E70",
  textHead: "#FFFFFF",
  textMuted: "#6B7B8D",
} as const;

const CARD_W = 250;  
const CARD_GAP = 20;  
const SCALE_ACTIVE = 1.13;
const SCALE_NEAR = 0.87;

const NAV_OFFSET = CARD_W / 2 + CARD_GAP / 2 + 20; 


export default function TeamSlider({
  members = TEAM_PLACEHOLDER,
  subtitle,
  autoInterval = 7000,
}: TeamSliderProps) {
  const n = members.length;
  const tripled = [...members, ...members, ...members];
  const startIndex = n;

  const [rawIndex, setRawIndex] = useState(startIndex);
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
  const goTo = useCallback(
    (t: number) => setRawIndex(startIndex + t),
    [startIndex],
  );

  // Auto-advance (slower when hovered or fast, adjusted to be readable)
  useEffect(() => {
    const currentInterval = isHovered ? 2500 : autoInterval;
    const id = setInterval(() => { goNext(); }, currentInterval);
    return () => clearInterval(id);
  }, [autoInterval, goNext, isHovered]);


  const trackX = rawIndex * (CARD_W + CARD_GAP) + CARD_W / 2;

  return (
    <>
      

      <section
        className={styles.section}
        id="team"
        aria-label="Organizing Committee"
        ref={sectionRef}
        onMouseEnter={() => { setIsHovered(true); }}
        onMouseLeave={() => { setIsHovered(false); }}
      >
        <div className={styles["card-bg"]}>
          <div className={styles.inner}>

            {/* ── Left: editorial panel ── */}
            <div className={styles.left}>
              <div className={styles.eyebrow}>
                <span className={styles["eyebrow-dot"]} />
                <span className={styles["eyebrow-text"]}>MoraXtreme 11.0</span>
                <span className={styles["eyebrow-sep"]}>/</span>
                <span className={styles["eyebrow-text"]}>Organizing Committee</span>
              </div>

              <h2 className={styles.headline}>
                <span className={styles["headline-white"]}>CONTACT</span>
                <span className={styles["headline-blue"]}>US</span>
              </h2>

              <p className={styles.subtitle}>
                {subtitle ??
                  "The people behind MoraXtreme 11.0. Different roles. Same vision. One team."}
              </p>

              {/* Dot indicators */}
              <div className={styles.controls}>
                <div className={styles.dots} role="tablist" aria-label="Select team member">
                  {members.map((_, i) => (
                    <button
                      key={i}
                      className={styles.dot}
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
            <div className={styles["viewport-wrap"]}>

              {/* < — sits in the gap between the left side card and the centre card */}
              <button
                className={`${styles["nav-btn"]} ${styles["nav-btn--prev"]}`}
                onClick={goPrev}
                aria-label="Previous member"
              >
                {"<"}
              </button>

              <div
                className={styles.viewport}
                role="region"
                aria-label="Team member carousel"
                aria-live="polite"
              >
                <div
                  className={`${styles.track}${isAnimating ? ` ${styles["track--animated"]}` : ""}`}
                  style={{
                    transform: `translate(-${trackX}px, -50%)`,
                  }}
                >
                  {tripled.map((member, idx) => {
                    const dist = idx - rawIndex;
                    const isActive = dist === 0;
                    const isNear = Math.abs(dist) === 1;
                    const cardClass = isActive
                      ? styles["card--active"]
                      : isNear
                        ? styles["card--near"]
                        : styles["card--far"];

                    const initials = member.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2);

                    return (
                      <div
                        key={idx}
                        className={`${styles.card} ${cardClass}`}
                        onClick={() => {
                          if (!isActive) setRawIndex((prev) => prev + dist);
                        }}
                        aria-label={member.name}
                        tabIndex={isActive || isNear ? 0 : -1}
                      >
                        {/* Blue top bar */}
                        <div className={styles["card-topbar"]} />

                        {/* Photo */}
                        <div className={styles["card-photo"]}>
                          {member.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={member.photo} alt={member.alt ?? member.name} />
                          ) : (
                            <div className={styles["card-photo-placeholder"]}>{initials}</div>
                          )}
                        </div>

                        {/* Info */}
                        <div className={styles["card-info"]}>
                          <p className={styles["card-role"]}>{member.role}</p>
                          <p className={styles["card-name"]}>{member.name}</p>
                          {member.organisation && (
                            <p className={styles["card-org"]}>{member.organisation}</p>
                          )}
                          {(member.email || member.phone) && (
                            <div className={styles["card-contact"]}>
                              {member.email && (
                                <a
                                  href={`mailto:${member.email}`}
                                  className={styles["card-contact-link"]}
                                  title={member.email}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Mail className={styles["card-contact-icon"]} strokeWidth={2} />
                                  <span>{member.email}</span>
                                </a>
                              )}
                              {member.phone && (
                                <a
                                  href={`tel:${member.phone.replace(/\s+/g, "")}`}
                                  className={styles["card-contact-link"]}
                                  title={member.phone}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Phone className={styles["card-contact-icon"]} strokeWidth={2} />
                                  <span>{member.phone}</span>
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* > — sits in the gap between the centre card and the right side card */}
              <button
                className={`${styles["nav-btn"]} ${styles["nav-btn--next"]}`}
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
