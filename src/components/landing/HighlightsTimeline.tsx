'use client'

import React, { useEffect, useRef } from 'react'

const HIGHLIGHTS = [
  {
    id: 1,
    title: "Award-Winning Organizers",
    description: "Driven by the IEEE Student Branch of the University of Moratuwa, officially recognized as the Most Outstanding Student Branch in IEEE Region 10 – Asia-Pacific (2025).",
    image: "/highlights/organizers.png",
    icon: (
      <svg className="h-7 w-7 text-[#0074FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    )
  },
  {
    id: 2,
    title: "Massive Scale",
    description: "Operating on a monumental scale, with previous iterations engaging over 450 teams and 1,500+ elite competitors.",
    image: "/highlights/scale.png",
    icon: (
      <svg className="h-7 w-7 text-[#0074FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    id: 3,
    title: "Comprehensive Training",
    description: "Equipping competitors through dedicated awareness sessions and rigorous skill-building workshops prior to the arena.",
    image: "/highlights/training.png",
    icon: (
      <svg className="h-7 w-7 text-[#0074FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  },
  {
    id: 4,
    title: "Proven Legacy",
    description: "Maintaining a dominant track record of elevating regional talent directly into the IEEEXtreme Global Top 500.",
    image: "/highlights/legacy.png",
    icon: (
      <svg className="h-7 w-7 text-[#0074FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  }
]

export default function HighlightsTimeline() {
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-x-0')
          entry.target.classList.remove('opacity-0', '-translate-x-12', 'translate-x-12')
        }
      })
    }, {
      threshold: 0.2,
      rootMargin: "0px 0px -100px 0px"
    })

    const elements = document.querySelectorAll('.animate-slide')
    elements.forEach(el => observerRef.current?.observe(el))

    return () => {
      elements.forEach(el => observerRef.current?.unobserve(el))
      observerRef.current?.disconnect()
    }
  }, [])

  return (
    <div className="relative w-full max-w-6xl mx-auto py-12 z-20 overflow-hidden">
      <div className="text-left mb-12 md:text-center md:mb-24">
        <h2 className="font-[family-name:var(--font-space)] text-[clamp(2.8rem,4vw,3.8rem)] font-black leading-[0.88] tracking-[-0.03em] text-white drop-shadow-xl">
          The Event <br className="hidden lg:block" />{" "}
          <span className="bg-gradient-to-r from-[#0074FF] to-[#005BD6] bg-clip-text text-transparent">
            Highlights
          </span>
        </h2>
        <div className="mt-6 h-1 w-20 bg-gradient-to-r from-transparent via-[#0074FF] to-transparent md:mx-auto"></div>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed font-light text-neutral-400 md:mx-auto">
          Discover what makes MoraXtreme the ultimate algorithmic proving ground in the South Asian region.
        </p>
      </div>

      <div className="relative">
        {/* Central Vertical Line */}
        <div className="absolute left-[3rem] md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-[#0074FF]/30 to-transparent transform md:-translate-x-1/2"></div>

        {/* The Timeline Items */}
        <div className="flex flex-col gap-16 md:gap-32">
          {HIGHLIGHTS.map((highlight, index) => {
            const isEven = index % 2 === 0
            return (
              <div
                key={highlight.id}
                className={`group relative flex flex-col md:flex-row items-center gap-8 md:gap-16 ${
                  isEven ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Timeline Dot (Now the Icon) */}
                <div className="absolute left-[3rem] md:left-1/2 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#0074FF]/20 bg-[#000000] shadow-[0_0_20px_rgba(0,116,255,0.2)] transform -translate-x-1/2 md:-translate-x-1/2 z-10 transition-all duration-500 group-hover:scale-110 group-hover:border-[#0074FF]/60 group-hover:bg-[#163E70]/40">
                  {highlight.icon}
                </div>

                {/* Content Side (Text) */}
                <div className={`animate-slide w-full md:w-1/2 pl-24 md:pl-0 opacity-0 transition-all duration-1000 ease-out ${
                  isEven ? 'md:pr-16 text-left md:text-right translate-x-12' : 'md:pl-16 text-left -translate-x-12'
                }`}>
                  <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-white/10 to-transparent p-[1px] shadow-2xl transition-colors duration-500 hover:from-[#0074FF]/50">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,116,255,0.2),_transparent_60%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100"></div>
                    <div className="relative h-full rounded-2xl border border-white/5 bg-[#000000]/90 p-8 backdrop-blur-xl">
                      <h4 className="mb-3 font-[family-name:var(--font-space)] text-2xl font-bold text-white transition-colors duration-300 group-hover:text-[#0074FF]">
                        {highlight.title}
                      </h4>
                      <p className="leading-relaxed font-light text-neutral-400">
                        {highlight.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Image Side */}
                <div className={`animate-slide w-full md:w-1/2 pl-24 md:pl-0 opacity-0 transition-all duration-1000 ease-out delay-200 ${
                  isEven ? 'md:pl-16 -translate-x-12' : 'md:pr-16 translate-x-12'
                }`}>
                  <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-white/10 group-hover:border-[#0074FF]/40 transition-colors duration-500 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={highlight.image}
                      alt={highlight.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        // Fallback to placeholder if actual image is missing
                        (e.target as HTMLImageElement).src = `https://placehold.co/800x600/0a1128/0074FF?text=${highlight.title.replace(' ', '+')}`
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
