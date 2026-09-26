import AnimatedCounter from "@/components/AnimatedCounter"
import { LEGACY_STATS } from "@/data/stats"

export default function LegacySection() {
  return (
    <section id="legacy" className="relative w-full py-12 md:py-24">
      <div className="group relative w-full">
        <div className="relative z-10 flex flex-col items-center p-12 md:p-24">
          {/* Heading */}
          <div className="mb-8 flex w-full flex-col items-start gap-3 text-left md:mb-16 md:items-center md:text-center">
            <h2 className="font-[family-name:var(--font-space)] text-[clamp(2.8rem,4vw,3.8rem)] font-black leading-[0.88] tracking-[-0.03em] text-white drop-shadow-xl">
              Our{" "}
              <span className="bg-gradient-to-r from-[#0074FF] to-[#005BD6] bg-clip-text text-transparent">
                Legacy
              </span>
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-transparent via-[#0074FF] to-transparent"></div>
            <span className="mt-2 font-mono text-xs font-bold tracking-[0.3em] text-neutral-400 uppercase">
              MoraXtreme 10.0
            </span>
          </div>

          {/* Stats Grid */}
          <div className="flex w-full flex-col items-center justify-around gap-16 divide-y divide-[#163E70]/50 md:flex-row md:gap-8 md:divide-x md:divide-y-0">
            {LEGACY_STATS.map(({ value, label, prefix, suffix }, i) => (
              <div
                key={label}
                className={`group/stat flex w-full flex-col items-center px-4 text-center md:px-8 ${
                  i > 0 ? "pt-16 md:pt-0" : ""
                }`}
              >
                <div className="mb-6 bg-gradient-to-b from-white to-[#0074FF] bg-clip-text font-[family-name:var(--font-space)] text-5xl font-black text-transparent drop-shadow-[0_0_20px_rgba(0,116,255,0.4)] transition-transform duration-500 group-hover/stat:scale-110 md:text-7xl">
                  {prefix && (
                    <span className="mr-2 align-middle text-2xl md:text-4xl">
                      {prefix}
                    </span>
                  )}
                  <AnimatedCounter value={value} />
                  {suffix && (
                    <span className="text-[#0074FF] drop-shadow-[0_0_15px_#0074FF]">
                      {suffix}
                    </span>
                  )}
                </div>
                <div className="font-mono text-xs tracking-[0.3em] text-neutral-400 uppercase md:text-sm">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
