import TeamSlider from "@/components/TeamSlider"
import { TEAM_PLACEHOLDER } from "@/data/team.placeholder"
import Image from "next/image"
import DynamicNavbar from "@/components/DynamicNavbar"
import WorldAsiaScene from "@/components/landing/WorldAsiaScene"
import HighlightsTimeline from "@/components/landing/HighlightsTimeline"
import Timeline from "@/components/timeline/Timeline"
import ImageGallery from "@/components/ImageGallery"
import { GALLERY_PLACEHOLDER_IMAGES } from "@/data/gallery.placeholder"

export default async function Home() {
  // Add a 2-second delay to show off the cool loading screen!
  await new Promise((resolve) => setTimeout(resolve, 2000))

  return (
    <main className="relative flex flex-col items-center bg-[#000000]">
      <DynamicNavbar />
      <WorldAsiaScene>
        {/* New Content Sections */}
      <div className="relative z-10 flex w-full max-w-6xl flex-col gap-32 px-6 py-24 text-white">
        {/* About Section */}
        <section
          id="about"
          className="relative w-full h-[200vh]"
        >
          <div className="sticky top-0 flex h-screen w-full flex-col justify-center">
            <div className="grid items-center gap-16 lg:grid-cols-2">
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
                MoraXtreme is Sri Lanka’s premier annual algorithmic coding
                competition, organized by the IEEE Student Branch and the IEEE
                Computer Society Student Branch Chapter of the University of
                Moratuwa. Serving as a national adaptation of the global
                IEEEXtreme competition, it is designed to foster competitive
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
          </div>
        </section>

        {/* Highlights */}
        <section id="highlights" className="relative w-full h-[200vh]">
          <div className="sticky top-0 flex h-screen w-full flex-col justify-center">
            <HighlightsTimeline />
          </div>
        </section>

        {/* Stats / Legacy */}
        <section id="legacy" className="relative w-full h-[200vh]">
          <div className="sticky top-0 flex h-screen w-full flex-col justify-center">
            <div className="group relative w-full overflow-hidden rounded-[2.5rem] border border-[#163E70]/50 bg-[#000000]/70 shadow-[0_0_50px_rgba(0,116,255,0.15)] backdrop-blur-xl">
            {/* Background effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,116,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,116,255,0.07)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_50%,#000_70%,transparent_100%)] bg-[size:3rem_3rem]"></div>
            <div className="absolute top-0 left-1/2 h-[2px] w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#0074FF] to-transparent opacity-50 shadow-[0_0_20px_#0074FF] transition-opacity duration-1000 group-hover:opacity-100"></div>

            <div className="relative z-10 flex flex-col items-center p-12 md:p-24">
              <div className="mb-16 inline-flex items-center gap-4">
                <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-[#0074FF]"></div>
                <h2 className="font-mono text-sm font-bold tracking-[0.4em] text-[#0074FF] uppercase">
                  Our Legacy
                </h2>
                <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-[#0074FF]"></div>
              </div>

              <div className="flex w-full flex-col items-center justify-around gap-16 divide-y divide-[#163E70]/50 md:flex-row md:gap-8 md:divide-x md:divide-y-0">
                {/* Stat 1 */}
                <div className="group/stat flex w-full flex-col items-center px-4 text-center md:px-8">
                  <div className="mb-6 bg-gradient-to-b from-white to-[#0074FF] bg-clip-text font-[family-name:var(--font-space)] text-6xl font-black text-transparent drop-shadow-[0_0_20px_rgba(0,116,255,0.4)] transition-transform duration-500 group-hover/stat:scale-110 md:text-8xl">
                    1,500
                    <span className="text-[#0074FF] drop-shadow-[0_0_15px_#0074FF]">
                      +
                    </span>
                  </div>
                  <div className="font-mono text-xs tracking-[0.3em] text-neutral-400 uppercase md:text-sm">
                    Competitors
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="group/stat flex w-full flex-col items-center px-4 pt-16 text-center md:px-8 md:pt-0">
                  <div className="mb-6 bg-gradient-to-b from-white to-[#0074FF] bg-clip-text font-[family-name:var(--font-space)] text-6xl font-black text-transparent drop-shadow-[0_0_20px_rgba(0,116,255,0.4)] transition-transform duration-500 group-hover/stat:scale-110 md:text-8xl">
                    450
                    <span className="text-[#0074FF] drop-shadow-[0_0_15px_#0074FF]">
                      +
                    </span>
                  </div>
                  <div className="font-mono text-xs tracking-[0.3em] text-neutral-400 uppercase md:text-sm">
                    Teams Battling
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="group/stat flex w-full flex-col items-center px-4 pt-16 text-center md:px-8 md:pt-0">
                  <div className="mb-6 bg-gradient-to-b from-white to-[#0074FF] bg-clip-text font-[family-name:var(--font-space)] text-6xl font-black text-transparent drop-shadow-[0_0_20px_rgba(0,116,255,0.4)] transition-transform duration-500 group-hover/stat:scale-110 md:text-8xl">
                    150
                    <span className="text-[#0074FF] drop-shadow-[0_0_15px_#0074FF]">
                      +
                    </span>
                  </div>
                  <div className="font-mono text-xs tracking-[0.3em] text-neutral-400 uppercase md:text-sm">
                    Active Members
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </section>

        <Timeline />

        {/* Why Participate - Centered Layout */}
        <section
          id="why-join"
          className="relative w-full h-[200vh]"
        >
          <div className="sticky top-0 flex h-screen w-full flex-col justify-center items-center">
            {/* Centered Text Content */}
            <div className="z-10 flex w-full max-w-6xl flex-col gap-12 px-6 sm:px-10">
            <div className="flex flex-col items-center text-center gap-6">
              <h2 className="font-[family-name:var(--font-space)] text-4xl font-bold text-white drop-shadow-md md:text-5xl">
                Why <span className="text-[#0074FF]">Participate?</span>
              </h2>
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#0074FF] to-transparent"></div>
            </div>

            {/* 3 Column Grid for Facts */}
            <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-3">
              <div className="group border-t-2 border-[#163E70] pt-6 md:border-l-2 md:border-t-0 md:pl-8 md:pt-0 transition-colors duration-500 hover:border-white">
                <h4 className="mb-3 font-[family-name:var(--font-space)] text-2xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.7)] transition-all duration-500 group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,1)]">
                  Elite Problem Solving
                </h4>
                <p className="text-lg leading-relaxed font-light text-neutral-400">
                  Tackle complex algorithmic and mathematical puzzles in a
                  highly competitive, time-sensitive environment.
                </p>
              </div>
              <div className="group border-t-2 border-[#163E70] pt-6 md:border-l-2 md:border-t-0 md:pl-8 md:pt-0 transition-colors duration-500 hover:border-white">
                <h4 className="mb-3 font-[family-name:var(--font-space)] text-2xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.7)] transition-all duration-500 group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,1)]">
                  Skill Amplification
                </h4>
                <p className="text-lg leading-relaxed font-light text-neutral-400">
                  Sharpen your competitive coding agility, logical reasoning,
                  and strategic team collaboration under pressure.
                </p>
              </div>
              <div className="group border-t-2 border-[#163E70] pt-6 md:border-l-2 md:border-t-0 md:pl-8 md:pt-0 transition-colors duration-500 hover:border-white">
                <h4 className="mb-3 font-[family-name:var(--font-space)] text-2xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.7)] transition-all duration-500 group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,1)]">
                  Global Preparation
                </h4>
                <p className="text-lg leading-relaxed font-light text-neutral-400">
                  Gain the ultimate tactical proving ground and preparatory
                  experience for the 24-hour global IEEEXtreme competition.
                </p>
              </div>
            </div>
            </div>
          </div>
        </section>

        {/* Call to Action (Final Gateway) */}
        <section
          id="register"
          className="relative mb-20 w-full scroll-mt-32 py-16"
        >
          <div className="group relative w-full overflow-hidden rounded-[3rem] border border-white/5 bg-[#000000]/60 shadow-[0_0_80px_rgba(0,116,255,0.15)] backdrop-blur-2xl">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 h-full w-full -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,_rgba(0,116,255,0.25)_0%,_transparent_60%)]"></div>

            {/* Top glowing edge */}
            <div className="absolute top-0 left-1/2 h-[2px] w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#0074FF] to-transparent opacity-50 shadow-[0_0_20px_#0074FF]"></div>

            <div className="relative z-10 flex flex-col items-center px-8 py-16 text-center md:py-24">
              {/* Status Badge */}
              <div className="mb-10 inline-flex items-center gap-3 rounded-full border border-[#0074FF]/40 bg-[#0074FF]/10 px-5 py-2.5 shadow-[0_0_15px_rgba(0,116,255,0.2)] backdrop-blur-md">
                <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></div>
                <span className="font-mono text-[11px] font-bold tracking-[0.3em] text-white uppercase">
                  Registration Gateway Open
                </span>
              </div>

              <h2 className="mb-12 font-[family-name:var(--font-space)] text-4xl font-bold text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] md:text-6xl">
                The Gateway to <br className="md:hidden" />
                <span className="bg-gradient-to-r from-[#0074FF] to-white bg-clip-text text-transparent">
                  IEEEXtreme 20.0
                </span>
              </h2>

              {/* Massive CTA Button */}
              <a
                href="https://ieeextreme.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn relative inline-block overflow-hidden rounded-full border border-[#0074FF]/50 bg-[#000000] px-12 py-5 font-[family-name:var(--font-space)] text-lg font-bold tracking-[0.25em] text-[#0074FF] uppercase shadow-[0_0_40px_rgba(0,116,255,0.4)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-[#0074FF] hover:text-white hover:shadow-[0_0_60px_rgba(0,116,255,0.6)]"
              >
                <span className="relative z-10 flex items-center gap-4 drop-shadow-[0_0_8px_rgba(0,116,255,0.8)] transition-all duration-500 group-hover/btn:drop-shadow-none">
                  Register Now
                  <svg
                    className="h-6 w-6 transition-transform duration-500 group-hover/btn:translate-x-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </span>
                {/* Hover Fill */}
                <div className="absolute inset-0 z-0 -translate-x-full bg-[#0074FF] transition-transform duration-500 ease-out group-hover/btn:translate-x-0"></div>
              </a>
            </div>
          </div>
        </section>
      </div>


      <ImageGallery
        images={GALLERY_PLACEHOLDER_IMAGES}
        title="MoraXtreme 10.0 Highlights"
        subtitle="A glimpse into the ideas, energy, and innovation that define the MoraXtreme experience."
        columns={3}
      />

      {/* Spacer for transition to Sri Lanka Deep Dive */}
      <div className="h-[40vh] w-full" aria-hidden="true" />

      <TeamSlider
        members={TEAM_PLACEHOLDER}
        title="Meet the Team"
        subtitle="The people behind MoraXtreme 11.0"
        eyebrow="Leadership"
        autoInterval={4500}
      />

      {/* Footer */}
      <footer className="relative z-10 mt-20 flex w-full flex-col items-center justify-center gap-8 border-t border-[#163E70]/30 bg-black/40 py-24 backdrop-blur-md">
        <Image
          src="/logo.png"
          alt="MoraXtreme 11.0"
          width={280}
          height={100}
          className="object-contain opacity-90"
          unoptimized
        />
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="font-[family-name:var(--font-space)] text-lg font-bold text-white drop-shadow-md md:text-xl">
            Sri Lanka&apos;s Largest Algorithmic Coding Competition
          </p>
          <p className="font-mono text-xs tracking-[0.2em] text-neutral-400">
            Copyright &copy; 2026 - All rights reserved
          </p>
        </div>
      </footer>
      </WorldAsiaScene>
    </main>
  )
}
