import TeamSlider from "@/components/TeamSlider"
import { TEAM_PLACEHOLDER } from "@/data/team.placeholder"
import Image from "next/image"
import DynamicNavbar from "@/components/DynamicNavbar"
import WorldAsiaScene from "@/components/landing/WorldAsiaScene"
import HighlightsTimeline from "@/components/landing/HighlightsTimeline"
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
          className="grid scroll-mt-32 items-center gap-16 lg:grid-cols-2"
        >
          {/* Left Column: Content */}
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

            <div className="rounded-r-2xl border-l-4 border-[#0074FF] bg-gradient-to-r from-[#163E70]/20 to-transparent p-8 shadow-[inset_0_0_20px_rgba(22,62,112,0.1)]">
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

          {/* Right Column: Animated Cyber Radar Visual */}
          <div className="relative flex hidden aspect-square max-h-[500px] w-full items-center justify-center lg:flex">
            {/* Glowing background aura */}
            <div className="absolute inset-0 animate-pulse rounded-full bg-[radial-gradient(circle_at_center,_rgba(0,116,255,0.15)_0%,_transparent_60%)]"></div>

            {/* Outer rotating dashed ring */}
            <div className="absolute h-full max-h-[400px] w-full max-w-[400px] animate-[spin_20s_linear_infinite] rounded-full border-[2px] border-dashed border-[#163E70]/60"></div>

            {/* Middle counter-rotating ring */}
            <div className="absolute h-3/4 max-h-[300px] w-3/4 max-w-[300px] animate-[spin_15s_linear_infinite_reverse] rounded-full border border-[#0074FF]/40">
              {/* Node blip */}
              <div className="absolute top-0 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0074FF] shadow-[0_0_20px_#0074FF]"></div>
            </div>

            {/* Inner Core */}
            <div className="relative flex h-1/2 max-h-[200px] w-1/2 max-w-[200px] flex-col items-center justify-center rounded-full border-2 border-[#0074FF] bg-[#000000]/80 shadow-[0_0_50px_rgba(0,116,255,0.4)] backdrop-blur-md">
              <span className="font-[family-name:var(--font-space)] text-4xl font-bold text-white drop-shadow-[0_0_15px_#0074FF]">
                12H
              </span>
              <span className="mt-2 font-mono text-xs tracking-[0.2em] text-[#0074FF]">
                ELIMINATION
              </span>
            </div>

            {/* Floating Info Panels */}
            <div className="absolute top-[10%] right-[5%] flex animate-[bounce_4s_ease-in-out_infinite] items-center gap-3 rounded-xl border border-[#163E70] bg-[#000000]/80 px-4 py-3 shadow-lg backdrop-blur-md">
              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#0074FF] shadow-[0_0_8px_#0074FF]"></div>
              <span className="font-mono text-xs leading-tight text-neutral-300">
                ALGORITHMIC
                <br />
                CORE ACTIVE
              </span>
            </div>
            <div className="absolute bottom-[15%] left-[5%] flex animate-[bounce_5s_ease-in-out_infinite_reverse] items-center gap-3 rounded-xl border border-[#163E70] bg-[#000000]/80 px-4 py-3 shadow-lg backdrop-blur-md">
              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
              <span className="font-mono text-xs leading-tight text-neutral-300">
                REGION 10
                <br />
                VERIFIED
              </span>
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section id="highlights-section" className="w-full">
          <HighlightsTimeline />
        </section>

        {/* Stats / Legacy */}
        <section id="legacy" className="relative w-full scroll-mt-32 py-16">
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
        </section>

        {/* Why Participate & Rules - Zig-Zag Layout */}
        <section
          id="rules"
          className="flex w-full scroll-mt-32 flex-col gap-32 py-16"
        >
          {/* Row 1: Why Participate (Animation Left, Text Right) */}
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Left Side: Energy Core Animation */}
            <div className="group relative flex hidden aspect-square max-h-[450px] w-full items-center justify-center overflow-hidden rounded-[3rem] border border-[#163E70]/30 bg-[#000000]/40 shadow-[inset_0_0_80px_rgba(22,62,112,0.15)] lg:flex">
              {/* Scanning beam */}
              <div className="absolute top-0 left-0 h-1 w-full animate-[scanline_4s_linear_infinite] bg-[#0074FF] opacity-50 shadow-[0_0_20px_#0074FF]"></div>

              {/* Central Glowing Orb */}
              <div className="relative z-10 flex h-40 w-40 animate-[spin_10s_linear_infinite] items-center justify-center rounded-full border-4 border-dashed border-[#0074FF]/60 shadow-[0_0_40px_rgba(0,116,255,0.2)]">
                <div className="flex h-28 w-28 animate-[spin_5s_linear_infinite_reverse] items-center justify-center rounded-full border border-[#0074FF]/50 bg-[#163E70]/40 backdrop-blur-md">
                  <svg
                    className="h-10 w-10 text-[#0074FF] drop-shadow-[0_0_15px_#0074FF]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              </div>

              {/* Floating Data Bars */}
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-16 opacity-30">
                <div className="h-2 w-3/4 animate-pulse rounded-full bg-[#0074FF] blur-[1px]"></div>
                <div className="h-2 w-1/2 animate-pulse rounded-full bg-[#0074FF] blur-[1px] delay-100"></div>
                <div className="h-2 w-full animate-pulse rounded-full bg-[#0074FF] blur-[1px] delay-200"></div>
                <div className="h-2 w-5/6 animate-pulse rounded-full bg-[#0074FF] blur-[1px] delay-300"></div>
              </div>
            </div>

            {/* Right Side: Text Content */}
            <div className="z-10 flex flex-col gap-10">
              <div className="mb-2 inline-flex items-center gap-6">
                <h2 className="font-[family-name:var(--font-space)] text-4xl font-bold text-white drop-shadow-md md:text-5xl">
                  Why <span className="text-[#0074FF]">Participate?</span>
                </h2>
                <div className="h-px w-24 bg-gradient-to-r from-[#0074FF] to-transparent"></div>
              </div>

              <div className="space-y-10">
                <div className="group border-l-2 border-[#163E70] pl-8 transition-colors duration-500 hover:border-[#0074FF]">
                  <h4 className="mb-3 font-[family-name:var(--font-space)] text-2xl font-bold text-white transition-colors group-hover:text-[#0074FF]">
                    Elite Problem Solving
                  </h4>
                  <p className="text-lg leading-relaxed font-light text-neutral-400">
                    Tackle complex algorithmic and mathematical puzzles in a
                    highly competitive, time-sensitive environment.
                  </p>
                </div>
                <div className="group border-l-2 border-[#163E70] pl-8 transition-colors duration-500 hover:border-[#0074FF]">
                  <h4 className="mb-3 font-[family-name:var(--font-space)] text-2xl font-bold text-white transition-colors group-hover:text-[#0074FF]">
                    Skill Amplification
                  </h4>
                  <p className="text-lg leading-relaxed font-light text-neutral-400">
                    Sharpen your competitive coding agility, logical reasoning,
                    and strategic team collaboration under pressure.
                  </p>
                </div>
                <div className="group border-l-2 border-[#163E70] pl-8 transition-colors duration-500 hover:border-[#0074FF]">
                  <h4 className="mb-3 font-[family-name:var(--font-space)] text-2xl font-bold text-white transition-colors group-hover:text-[#0074FF]">
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

          {/* Row 2: Rules & Guidelines (Text Left, Animation Right) */}
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Left Side: Rules Panel */}
            <div className="group relative overflow-hidden rounded-[2.5rem] border border-[#163E70]/50 bg-gradient-to-br from-[#163E70]/20 to-[#000000]/80 p-10 shadow-2xl backdrop-blur-xl md:p-14">
              <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#0074FF] to-transparent opacity-30 shadow-[0_0_15px_#0074FF] transition-opacity duration-1000 group-hover:opacity-100"></div>

              <h2 className="mb-10 font-[family-name:var(--font-space)] text-4xl font-bold text-white drop-shadow-md">
                Rules & <span className="text-[#0074FF]">Guidelines</span>
              </h2>

              <ul className="space-y-8">
                <li className="flex gap-5">
                  <div className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-[#0074FF] shadow-[0_0_10px_#0074FF]"></div>
                  <div>
                    <span className="text-lg font-bold text-white">
                      Team Composition:
                    </span>{" "}
                    <span className="mt-1 block text-lg leading-relaxed font-light text-neutral-400">
                      Squads are capped at a maximum of three members.
                      Cross-institutional teams are strictly prohibited; all
                      members must exclusively represent the same university.
                    </span>
                  </div>
                </li>
                <li className="flex gap-5">
                  <div className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-[#0074FF] shadow-[0_0_10px_#0074FF]"></div>
                  <div>
                    <span className="text-lg font-bold text-white">
                      Platform Operations:
                    </span>{" "}
                    <span className="mt-1 block text-lg leading-relaxed font-light text-neutral-400">
                      The entire competition infrastructure is hosted on
                      HackerRank. Teams must compete using a single, designated
                      account following the precise format:{" "}
                      <code className="ml-1 rounded border border-[#0074FF]/30 bg-[#163E70]/40 px-2 py-1 font-mono text-sm text-[#0074FF]">
                        MX11_&#123;TEAM_NAME&#125;
                      </code>
                      .
                    </span>
                  </div>
                </li>
                <li className="flex gap-5">
                  <div className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-[#0074FF] shadow-[0_0_10px_#0074FF]"></div>
                  <div>
                    <span className="text-lg font-bold text-white">
                      Absolute Integrity:
                    </span>{" "}
                    <span className="mt-1 block text-lg leading-relaxed font-light text-neutral-400">
                      We enforce a strict zero-tolerance policy against
                      plagiarism, external collaboration, and multiple account
                      usage. All submissions undergo rigorous evaluation via
                      automated plagiarism detection tools.
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Right Side: Security Hex Animation */}
            <div className="relative flex hidden aspect-square max-h-[450px] w-full items-center justify-center lg:flex">
              {/* Outer Shield Rings */}
              <div className="absolute h-[80%] w-[80%] animate-[spin_30s_linear_infinite] rounded-full border-[1.5px] border-dashed border-[#163E70]"></div>
              <div className="absolute h-[60%] w-[60%] animate-[spin_20s_linear_infinite_reverse] rounded-full border-[2px] border-[#163E70]/40"></div>

              {/* Glowing Hexagon Core */}
              <div
                className="relative flex h-44 w-44 items-center justify-center border-[3px] border-[#0074FF] bg-[#000000]/80 shadow-[0_0_60px_rgba(0,116,255,0.3)] backdrop-blur-2xl"
                style={{
                  clipPath:
                    "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                }}
              >
                <svg
                  className="h-14 w-14 animate-pulse text-[#0074FF] drop-shadow-[0_0_20px_#0074FF]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>

              {/* Floating Security Nodes */}
              <div className="absolute top-[18%] right-[10%] flex animate-[bounce_4s_ease-in-out_infinite] items-center gap-3 rounded-lg border border-[#163E70] bg-[#000000]/90 px-4 py-2 shadow-lg">
                <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]"></div>
                <span className="font-mono text-[11px] font-bold tracking-widest text-neutral-300">
                  ANTI-CHEAT ON
                </span>
              </div>
              <div className="absolute bottom-[20%] left-[8%] flex animate-[bounce_3s_ease-in-out_infinite_reverse] items-center gap-3 rounded-lg border border-[#163E70] bg-[#000000]/90 px-4 py-2 shadow-lg">
                <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                <span className="font-mono text-[11px] font-bold tracking-widest text-neutral-300">
                  INTEGRITY VERIFIED
                </span>
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

            <div className="relative z-10 flex flex-col items-center px-8 py-24 text-center md:py-32">
              {/* Status Badge */}
              <div className="mb-10 inline-flex items-center gap-3 rounded-full border border-[#0074FF]/40 bg-[#0074FF]/10 px-5 py-2.5 shadow-[0_0_15px_rgba(0,116,255,0.2)] backdrop-blur-md">
                <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></div>
                <span className="font-mono text-[11px] font-bold tracking-[0.3em] text-white uppercase">
                  Registration Gateway Open
                </span>
              </div>

              <h2 className="mb-8 font-[family-name:var(--font-space)] text-4xl font-bold text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] md:text-6xl">
                The Gateway to <br className="md:hidden" />
                <span className="bg-gradient-to-r from-[#0074FF] to-white bg-clip-text text-transparent">
                  IEEEXtreme 20.0
                </span>
              </h2>

              <p className="mx-auto mb-14 max-w-3xl text-lg leading-relaxed font-light text-neutral-400 md:text-xl">
                MoraXtreme serves as your exclusive launchpad for IEEEXtreme, a
                prestigious 24-hour global programming challenge spanning 65
                countries. Top global performers compete for{" "}
                <strong className="font-semibold text-white">
                  fully-funded trips to an IEEE conference
                </strong>{" "}
                of their choice anywhere in the world.
              </p>

              <h3 className="mb-12 font-mono text-lg font-bold tracking-[0.2em] text-[#0074FF] uppercase drop-shadow-[0_0_15px_rgba(0,116,255,0.5)] md:text-2xl">
                The Ultimate Coding Showdown Awaits.
              </h3>

              {/* Massive CTA Button */}
              <a
                href="/register"
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
      <TeamSlider
        members={TEAM_PLACEHOLDER}
        title="Meet the Team"
        subtitle="The people behind MoraXtreme 11.0"
        eyebrow="Leadership"
        autoInterval={4500}
      />
      </WorldAsiaScene>
    </main>
  )
}
