export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative w-full py-12 md:py-24 flex flex-col justify-center"
    >
      <div className="grid items-center gap-8 lg:gap-16 lg:grid-cols-2">
        {/* Left Column: Description */}
        <div className="z-10 flex flex-col gap-12">
          <div>
            <div className="mb-6 inline-flex items-center gap-3">
              <div className="h-px w-10 bg-[#0074FF]"></div>
              <span className="font-mono text-xs font-bold tracking-[0.3em] text-[#0074FF] uppercase">
                Intelligence Briefing
              </span>
            </div>
            <h2 className="mb-6 font-[family-name:var(--font-space)] text-4xl font-bold text-white md:text-5xl">
              About MoraXtreme 11.0
            </h2>
            <p className="text-lg leading-relaxed text-neutral-300">
              MoraXtreme is Sri Lanka&apos;s premier annual algorithmic coding
              competition, organized by the IEEE Student Branch and the IEEE
              Computer Society Student Branch Chapter of the University of
              Moratuwa. Expanding beyond Sri Lanka, MoraXtreme 11.0 brings together
              talented coders from across South Asia. It is designed to foster competitive
              programming skills and prepare participants for the
              international stage. The challenge consists of a rigorous
              12-hour online elimination round, followed by an intense 8-hour
              physical Grand Finale.
            </p>
          </div>
        </div>

        {/* Right Column: Who Can Participate */}
        <div className="z-10 flex flex-col gap-12 lg:mt-12">
          <div className="rounded-l-2xl border-r-4 border-[#0074FF] bg-gradient-to-l from-[#163E70]/20 to-transparent p-8 shadow-[inset_0_0_20px_rgba(22,62,112,0.1)]">
            <h3 className="mb-4 font-[family-name:var(--font-space)] text-2xl font-bold text-white">
              Who Can Participate?
            </h3>
            <p className="leading-relaxed text-neutral-400">
              For its 11th edition, MoraXtreme expands its battlefield beyond
              borders, allowing participants to compete individually or form
              teams of up to three members. This elite open division is built
              specifically for undergraduate students currently enrolled in
              Sri Lanka, alongside university undergraduates across the entire
              South Asian region.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
