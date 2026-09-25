"use client"

import { useEffect, useRef } from "react"
import type { LucideIcon } from "lucide-react"
import {
  CalendarCheck,
  CalendarX,
  CodeXml,
  Flag,
  Globe2,
  Megaphone,
  Presentation,
  Trophy,
} from "lucide-react"

export interface Milestone {
  reel?: string
  title: string
  date: string
  desc?: string
  image?: string
}

export interface FilmReelTimelineProps {
  milestones?: Milestone[]
}

const DEFAULT_MILESTONES: Milestone[] = [
  {
    reel: "01",
    title: "Registrations Open",
    date: "24 September",
    desc: "Sign-ups go live for MoraXtreme 11.0.",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900&q=80",
  },
  {
    reel: "02",
    title: "Awareness Session",
    date: "25 September",
    desc: "Kickoff briefing on rules, format and scoring.",
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&q=80",
  },
  {
    reel: "03",
    title: "Registrations Close",
    date: "30 September",
    desc: "Last call — team sign-ups lock.",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=80",
  },
  {
    reel: "04",
    title: "Workshop 01",
    date: "First week of October",
    desc: "Foundations — algorithmic problem solving.",
    image:
      "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=900&q=80",
  },
  {
    reel: "05",
    title: "Elimination Round",
    date: "11 October",
    desc: "The qualifying round. Only the fastest advance.",
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=900&q=80",
  },
  {
    reel: "06",
    title: "IEEEXtreme 20.0",
    date: "31 October",
    desc: "The 24-hour global main event.",
    image:
      "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=900&q=80",
  },
  {
    reel: "07",
    title: "Workshop 02",
    date: "First week of November",
    desc: "Advanced techniques ahead of the final stretch.",
    image:
      "https://images.unsplash.com/photo-1550439062-609e1531270e?w=900&q=80",
  },
  {
    reel: "08",
    title: "Final Round",
    date: "Second week of November",
    desc: "The top teams face off for the title.",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=900&q=80",
  },
]

const MILESTONE_ICONS: LucideIcon[] = [
  CalendarCheck,
  Megaphone,
  CalendarX,
  Presentation,
  CodeXml,
  Globe2,
  Presentation,
  Trophy,
]

export default function Timeline({
  milestones = DEFAULT_MILESTONES,
}: FilmReelTimelineProps) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (
      !section ||
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }

    const entries = section.querySelectorAll<HTMLElement>(".timeline-entry")
    const observer = new IntersectionObserver(
      (observedEntries) => {
        observedEntries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.setAttribute("data-visible", "true")
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.08, rootMargin: "0px 0px -5% 0px" }
    )

    entries.forEach((entry) => observer.observe(entry))
    section.setAttribute("data-animated", "true")

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="timeline"
      className="relative w-full overflow-hidden px-4 py-24 sm:px-8 md:py-32"
      aria-labelledby="timeline-heading"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,_rgba(0,116,255,0.15),_transparent_65%)]"
      />

      <div className="relative mx-auto max-w-5xl">
        <header className="relative mb-16 text-center md:mb-20">
          <h2
            id="timeline-heading"
            className="font-[family-name:var(--font-space)] text-4xl font-bold text-white drop-shadow-xl md:text-5xl"
          >
            Event{" "}
            <span className="bg-gradient-to-r from-[#0074FF] to-[#005BD6] bg-clip-text text-transparent">
              Timeline
            </span>
          </h2>
          <span className="mx-auto mt-6 block h-1 w-20 bg-gradient-to-r from-transparent via-[#0074FF] to-transparent" />
        </header>

        <div className="space-y-8 md:space-y-10">
          {milestones.map((milestone, index) => {
            const Icon = MILESTONE_ICONS[index % MILESTONE_ICONS.length] ?? Flag

            return (
              <article
                key={`${milestone.title}-${index}`}
                className="timeline-entry grid grid-cols-[2.75rem_minmax(0,1fr)] items-start md:grid-cols-[11rem_4.5rem_minmax(0,1fr)]"
              >
                <p className="col-start-2 mb-3 font-mono text-base font-bold tracking-[0.12em] text-white uppercase md:col-start-1 md:row-start-1 md:mb-0 md:pt-4 md:pr-5 md:text-right md:text-lg">
                  {milestone.date}
                </p>

                <div className="relative col-start-1 row-span-2 row-start-1 flex h-full justify-center md:col-start-2">
                  <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#3d8dff] bg-[#050b16] text-[#6fd3ff] shadow-[0_0_0_6px_rgba(0,116,255,0.08),0_0_22px_rgba(0,116,255,0.25)]">
                    <Icon
                      aria-hidden="true"
                      className="h-[18px] w-[18px]"
                      strokeWidth={1.8}
                    />
                  </div>
                  {index < milestones.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute top-11 -bottom-10 w-px bg-gradient-to-b from-[#3d8dff] via-[#0074FF]/55 to-[#0074FF]/20 md:-bottom-12"
                    />
                  )}
                </div>

                <div className="group relative col-start-2 row-start-2 rounded-sm border border-white/10 bg-[#090e18]/95 px-5 py-5 shadow-[0_16px_45px_rgba(0,0,0,0.32)] transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-[#3d8dff]/45 hover:shadow-[0_18px_55px_rgba(0,83,184,0.18)] md:col-start-3 md:row-start-1 md:px-7 md:py-6">
                  <span
                    aria-hidden="true"
                    className="absolute top-5 -left-3 hidden h-6 w-3 bg-[#090e18] [clip-path:polygon(100%_0,0_50%,100%_100%)] md:block"
                  />

                  <h3 className="font-[family-name:var(--font-space)] text-2xl font-black tracking-tight text-white [-webkit-text-stroke:1px_#163E70] md:text-3xl">
                    {milestone.title}
                  </h3>
                  {milestone.desc && (
                    <p className="mt-2 text-sm leading-6 text-neutral-400 md:text-base">
                      {milestone.desc}
                    </p>
                  )}

                </div>
              </article>
            )
          })}
        </div>
      </div>

      <style>{`
        #timeline[data-animated="true"] .timeline-entry {
          opacity: 0;
          transform: translateY(3rem) scale(0.98);
          filter: blur(6px);
          transition: opacity 700ms ease-out, transform 700ms ease-out, filter 700ms ease-out;
        }

        #timeline[data-animated="true"] .timeline-entry[data-visible="true"] {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }
      `}</style>
    </section>
  )
}
