import { Button } from "@/components/ui/button"
import Image from "next/image"
import DynamicNavbar from "@/components/DynamicNavbar"

export default async function Home() {
  // Add a 5-second delay to show off the cool loading screen!
  await new Promise((resolve) => setTimeout(resolve, 5000))

  return (
    <main className="relative flex flex-col items-center bg-[#000000]">
      <DynamicNavbar />

      {/* Background Video (Fixed behind everything) */}
      <div className="fixed inset-0 z-0 h-screen w-full">
        <video autoPlay loop muted playsInline className="h-full w-full object-cover opacity-90">
          <source src="/bg-video.mp4" type="video/mp4" />
        </video>
        {/* Overlay to fade out video nicely at the very bottom edge */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#000000]/40 to-[#000000]"></div>
      </div>

      {/* Hero Section */}
      <section id="home" className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center p-6 md:p-24 text-center scroll-mt-20 pt-20">
        
        {/* The Animated GIF acting as a backdrop behind the text */}
        <div className="absolute top-[50%] left-1/2 -z-20 w-[80vw] md:w-[50vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 aspect-square opacity-40 mix-blend-screen pointer-events-none">
          <Image 
            src="/earth.gif" 
            alt="Spinning Earth"
            fill
            className="object-contain"
            unoptimized
          />
        </div>

        {/* Subtle dark gradient behind text for perfect readability */}
        <div className="absolute top-1/2 left-1/2 -z-10 h-[80%] w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.8)_0%,_transparent_70%)] pointer-events-none"></div>

        {/* Top Radar Badge */}
        <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-[#163E70] bg-[#000000]/60 px-5 py-2 text-xs font-mono font-semibold tracking-widest text-[#0074FF] backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0074FF] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0074FF]"></span>
          </span>
          REGISTRATIONS OPEN
        </div>

        {/* Main Title */}
        <div className="flex flex-col items-center justify-center gap-4 mb-8">
          <h2 className="font-mono text-lg md:text-xl font-medium tracking-[0.3em] text-[#0074FF] uppercase drop-shadow-md">
            Welcome to
          </h2>
          <h1 className="font-[family-name:var(--font-space)] text-6xl md:text-8xl lg:text-[7rem] font-bold tracking-tighter text-white drop-shadow-2xl">
            MoraXtreme <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#0074FF] to-[#163E70]">11.0</span>
          </h1>
        </div>

        <p className="max-w-2xl text-center text-lg md:text-xl text-neutral-300 leading-relaxed font-light drop-shadow-lg font-[family-name:var(--font-space)]">
          The ultimate <strong className="text-white font-semibold">12-hour</strong> online algorithmic coding competition. <br className="hidden md:block" />
          Step into the arena and run it all from one secure workspace.
        </p>
        
        {/* Sleek Modern Buttons */}
        <div className="mt-14 flex flex-col sm:flex-row gap-6 z-20">
          
          {/* Primary Showstopper Button */}
          <Button asChild size="lg" className="group relative px-10 py-7 text-sm font-[family-name:var(--font-space)] font-bold tracking-[0.2em] uppercase text-[#0074FF] hover:text-white bg-[#000000]/80 transition-all duration-500 rounded-full overflow-hidden shadow-[0_0_30px_rgba(0,116,255,0.2)] hover:shadow-[0_0_50px_rgba(0,116,255,0.5)] hover:-translate-y-1 border border-[#0074FF]/50 hover:border-[#0074FF] backdrop-blur-xl">
            <a href="#register">
              <span className="relative z-10 flex items-center gap-3 drop-shadow-[0_0_8px_rgba(0,116,255,0.8)] group-hover:drop-shadow-none transition-all duration-500">
                Initiate Sequence
                <svg className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
              {/* Solid Blue Fill that slides in on hover */}
              <div className="absolute inset-0 bg-[#0074FF] -translate-x-full transition-transform duration-500 ease-out group-hover:translate-x-0 z-0"></div>
            </a>
          </Button>

          {/* Secondary Button */}
          <Button asChild size="lg" variant="outline" className="group px-10 py-7 text-sm font-[family-name:var(--font-space)] font-bold tracking-[0.2em] uppercase text-neutral-400 hover:text-white bg-transparent hover:bg-white/5 transition-all duration-300 rounded-full backdrop-blur-md border border-white/10 hover:border-white/30 hidden sm:flex">
            <a href="#about" className="flex items-center gap-2">
              Learn More
            </a>
          </Button>
          
        </div>
      </section>

      {/* New Content Sections */}
      <div className="relative z-10 w-full max-w-6xl px-6 py-24 flex flex-col gap-32 text-white">
        
        {/* About Section */}
        <section id="about" className="grid lg:grid-cols-2 gap-16 items-center scroll-mt-32">
          
          {/* Left Column: Content */}
          <div className="flex flex-col gap-12 z-10">
            <div>
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="h-px w-10 bg-[#0074FF]"></div>
                <span className="text-[#0074FF] font-mono text-xs tracking-[0.3em] uppercase font-bold">Intelligence Briefing</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-[family-name:var(--font-space)] font-bold text-white mb-6">About MoraXtreme 11.0</h2>
              <p className="text-neutral-300 leading-relaxed text-lg">
                MoraXtreme is Sri Lanka’s premier annual algorithmic coding competition, organized by the IEEE Student Branch and the IEEE Computer Society Student Branch Chapter of the University of Moratuwa. Serving as a national adaptation of the global IEEEXtreme competition, it is designed to foster competitive programming skills and prepare participants for the international stage. The challenge consists of a rigorous 12-hour online elimination round, followed by an intense 8-hour physical Grand Finale.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-[#163E70]/20 to-transparent border-l-4 border-[#0074FF] p-8 rounded-r-2xl shadow-[inset_0_0_20px_rgba(22,62,112,0.1)]">
              <h3 className="text-2xl font-[family-name:var(--font-space)] font-bold text-white mb-4">Who Can Participate?</h3>
              <p className="text-neutral-400 leading-relaxed">
                For its 11th edition, MoraXtreme expands its battlefield beyond borders, allowing participants to compete individually or form teams of up to three members. This elite open division is built specifically for undergraduate students currently enrolled in Sri Lanka, alongside university undergraduates across the entire South Asian region.
              </p>
            </div>
          </div>

          {/* Right Column: Animated Cyber Radar Visual */}
          <div className="relative w-full aspect-square max-h-[500px] flex items-center justify-center hidden lg:flex">
            {/* Glowing background aura */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,116,255,0.15)_0%,_transparent_60%)] rounded-full animate-pulse"></div>
            
            {/* Outer rotating dashed ring */}
            <div className="absolute w-full h-full max-w-[400px] max-h-[400px] rounded-full border-[2px] border-dashed border-[#163E70]/60 animate-[spin_20s_linear_infinite]"></div>
            
            {/* Middle counter-rotating ring */}
            <div className="absolute w-3/4 h-3/4 max-w-[300px] max-h-[300px] rounded-full border border-[#0074FF]/40 animate-[spin_15s_linear_infinite_reverse]">
              {/* Node blip */}
              <div className="absolute top-0 left-1/2 w-3 h-3 bg-[#0074FF] rounded-full shadow-[0_0_20px_#0074FF] -translate-x-1/2 -translate-y-1/2"></div>
            </div>
            
            {/* Inner Core */}
            <div className="relative w-1/2 h-1/2 max-w-[200px] max-h-[200px] bg-[#000000]/80 backdrop-blur-md rounded-full border-2 border-[#0074FF] shadow-[0_0_50px_rgba(0,116,255,0.4)] flex flex-col items-center justify-center">
              <span className="font-[family-name:var(--font-space)] text-4xl font-bold text-white drop-shadow-[0_0_15px_#0074FF]">12H</span>
              <span className="font-mono text-xs text-[#0074FF] tracking-[0.2em] mt-2">ELIMINATION</span>
            </div>

            {/* Floating Info Panels */}
            <div className="absolute top-[10%] right-[5%] bg-[#000000]/80 border border-[#163E70] backdrop-blur-md px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg animate-[bounce_4s_ease-in-out_infinite]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#0074FF] animate-pulse shadow-[0_0_8px_#0074FF]"></div>
              <span className="font-mono text-xs text-neutral-300 leading-tight">ALGORITHMIC<br/>CORE ACTIVE</span>
            </div>
            <div className="absolute bottom-[15%] left-[5%] bg-[#000000]/80 border border-[#163E70] backdrop-blur-md px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg animate-[bounce_5s_ease-in-out_infinite_reverse]">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
              <span className="font-mono text-xs text-neutral-300 leading-tight">REGION 10<br/>VERIFIED</span>
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section id="highlights" className="scroll-mt-32 relative w-full py-12">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20 items-start">
            
            {/* Sticky Header Column */}
            <div className="lg:sticky lg:top-40 flex flex-col items-start z-10">
              <h2 className="text-4xl md:text-5xl font-[family-name:var(--font-space)] font-bold text-white drop-shadow-xl">
                The Event <br className="hidden lg:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0074FF] to-[#005BD6]">Highlights</span>
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-[#0074FF] to-transparent mt-6"></div>
              <p className="mt-6 text-neutral-400 font-light max-w-sm leading-relaxed hidden lg:block text-lg">
                Discover what makes MoraXtreme the ultimate algorithmic proving ground in the South Asian region.
              </p>
            </div>
            
            {/* Vertical Stack of Cards */}
            <div className="flex flex-col gap-8 w-full">
              
              {/* Card 1: Organizers */}
              <div className="group relative p-[1px] rounded-2xl overflow-hidden bg-gradient-to-b from-white/10 to-transparent hover:from-[#0074FF]/50 transition-colors duration-500 shadow-2xl w-full">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,116,255,0.2),_transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="relative h-full bg-[#000000]/90 backdrop-blur-xl p-8 rounded-2xl flex flex-col md:flex-row items-start gap-6 border border-white/5">
                  <div className="shrink-0 w-14 h-14 rounded-xl bg-[#163E70]/20 border border-[#0074FF]/20 flex items-center justify-center group-hover:scale-110 group-hover:border-[#0074FF]/60 group-hover:bg-[#0074FF]/20 transition-all duration-500 shadow-[inset_0_0_15px_rgba(0,116,255,0.1)]">
                    <svg className="w-7 h-7 text-[#0074FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-2xl font-[family-name:var(--font-space)] font-bold text-white group-hover:text-[#0074FF] transition-colors duration-300 mb-3">Award-Winning Organizers</h4>
                    <p className="text-neutral-400 leading-relaxed font-light">Driven by the University of Moratuwa IEEE Student Branch - officially crowned the Best Student Branch in the IEEE Region 10 - Asia-Pacific (2025).</p>
                  </div>
                </div>
              </div>

              {/* Card 2: Scale */}
              <div className="group relative p-[1px] rounded-2xl overflow-hidden bg-gradient-to-b from-white/10 to-transparent hover:from-[#0074FF]/50 transition-colors duration-500 shadow-2xl w-full">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,116,255,0.2),_transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="relative h-full bg-[#000000]/90 backdrop-blur-xl p-8 rounded-2xl flex flex-col md:flex-row items-start gap-6 border border-white/5">
                  <div className="shrink-0 w-14 h-14 rounded-xl bg-[#163E70]/20 border border-[#0074FF]/20 flex items-center justify-center group-hover:scale-110 group-hover:border-[#0074FF]/60 group-hover:bg-[#0074FF]/20 transition-all duration-500 shadow-[inset_0_0_15px_rgba(0,116,255,0.1)]">
                    <svg className="w-7 h-7 text-[#0074FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-2xl font-[family-name:var(--font-space)] font-bold text-white group-hover:text-[#0074FF] transition-colors duration-300 mb-3">Massive Scale</h4>
                    <p className="text-neutral-400 leading-relaxed font-light">Operating on a monumental scale, with previous iterations engaging over 450 teams and 1,500+ elite competitors.</p>
                  </div>
                </div>
              </div>

              {/* Card 3: Training */}
              <div className="group relative p-[1px] rounded-2xl overflow-hidden bg-gradient-to-b from-white/10 to-transparent hover:from-[#0074FF]/50 transition-colors duration-500 shadow-2xl w-full">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,116,255,0.2),_transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="relative h-full bg-[#000000]/90 backdrop-blur-xl p-8 rounded-2xl flex flex-col md:flex-row items-start gap-6 border border-white/5">
                  <div className="shrink-0 w-14 h-14 rounded-xl bg-[#163E70]/20 border border-[#0074FF]/20 flex items-center justify-center group-hover:scale-110 group-hover:border-[#0074FF]/60 group-hover:bg-[#0074FF]/20 transition-all duration-500 shadow-[inset_0_0_15px_rgba(0,116,255,0.1)]">
                    <svg className="w-7 h-7 text-[#0074FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-2xl font-[family-name:var(--font-space)] font-bold text-white group-hover:text-[#0074FF] transition-colors duration-300 mb-3">Comprehensive Training</h4>
                    <p className="text-neutral-400 leading-relaxed font-light">Equipping competitors through dedicated awareness sessions and rigorous skill-building workshops prior to the arena.</p>
                  </div>
                </div>
              </div>

              {/* Card 4: Legacy */}
              <div className="group relative p-[1px] rounded-2xl overflow-hidden bg-gradient-to-b from-white/10 to-transparent hover:from-[#0074FF]/50 transition-colors duration-500 shadow-2xl w-full">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,116,255,0.2),_transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="relative h-full bg-[#000000]/90 backdrop-blur-xl p-8 rounded-2xl flex flex-col md:flex-row items-start gap-6 border border-white/5">
                  <div className="shrink-0 w-14 h-14 rounded-xl bg-[#163E70]/20 border border-[#0074FF]/20 flex items-center justify-center group-hover:scale-110 group-hover:border-[#0074FF]/60 group-hover:bg-[#0074FF]/20 transition-all duration-500 shadow-[inset_0_0_15px_rgba(0,116,255,0.1)]">
                    <svg className="w-7 h-7 text-[#0074FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-2xl font-[family-name:var(--font-space)] font-bold text-white group-hover:text-[#0074FF] transition-colors duration-300 mb-3">Proven Legacy</h4>
                    <p className="text-neutral-400 leading-relaxed font-light">Maintaining a dominant track record of elevating regional talent directly into the IEEEXtreme Global Top 500.</p>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </section>

        {/* Stats / Legacy */}
        <section id="legacy" className="scroll-mt-32 relative w-full py-16">
          <div className="relative w-full rounded-[2.5rem] overflow-hidden bg-[#000000]/70 backdrop-blur-xl border border-[#163E70]/50 shadow-[0_0_50px_rgba(0,116,255,0.15)] group">
            
            {/* Background effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,116,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,116,255,0.07)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[2px] bg-gradient-to-r from-transparent via-[#0074FF] to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-1000 shadow-[0_0_20px_#0074FF]"></div>

            <div className="relative p-12 md:p-24 z-10 flex flex-col items-center">
              <div className="inline-flex items-center gap-4 mb-16">
                <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-[#0074FF]"></div>
                <h2 className="text-sm font-mono tracking-[0.4em] uppercase text-[#0074FF] font-bold">Our Legacy</h2>
                <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-[#0074FF]"></div>
              </div>

              <div className="flex flex-col md:flex-row w-full justify-around items-center gap-16 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-[#163E70]/50">
                
                {/* Stat 1 */}
                <div className="flex flex-col items-center text-center px-4 md:px-8 w-full group/stat">
                  <div className="text-6xl md:text-8xl font-[family-name:var(--font-space)] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-[#0074FF] drop-shadow-[0_0_20px_rgba(0,116,255,0.4)] mb-6 group-hover/stat:scale-110 transition-transform duration-500">
                    1,500<span className="text-[#0074FF] drop-shadow-[0_0_15px_#0074FF]">+</span>
                  </div>
                  <div className="text-neutral-400 font-mono text-xs md:text-sm tracking-[0.3em] uppercase">Competitors</div>
                </div>

                {/* Stat 2 */}
                <div className="flex flex-col items-center text-center px-4 md:px-8 w-full pt-16 md:pt-0 group/stat">
                  <div className="text-6xl md:text-8xl font-[family-name:var(--font-space)] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-[#0074FF] drop-shadow-[0_0_20px_rgba(0,116,255,0.4)] mb-6 group-hover/stat:scale-110 transition-transform duration-500">
                    450<span className="text-[#0074FF] drop-shadow-[0_0_15px_#0074FF]">+</span>
                  </div>
                  <div className="text-neutral-400 font-mono text-xs md:text-sm tracking-[0.3em] uppercase">Teams Battling</div>
                </div>

                {/* Stat 3 */}
                <div className="flex flex-col items-center text-center px-4 md:px-8 w-full pt-16 md:pt-0 group/stat">
                  <div className="text-6xl md:text-8xl font-[family-name:var(--font-space)] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-[#0074FF] drop-shadow-[0_0_20px_rgba(0,116,255,0.4)] mb-6 group-hover/stat:scale-110 transition-transform duration-500">
                    150<span className="text-[#0074FF] drop-shadow-[0_0_15px_#0074FF]">+</span>
                  </div>
                  <div className="text-neutral-400 font-mono text-xs md:text-sm tracking-[0.3em] uppercase">Active Members</div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* Why Participate & Rules - Zig-Zag Layout */}
        <section id="rules" className="flex flex-col gap-32 scroll-mt-32 w-full py-16">
          
          {/* Row 1: Why Participate (Animation Left, Text Right) */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Side: Energy Core Animation */}
            <div className="relative w-full aspect-square max-h-[450px] flex items-center justify-center hidden lg:flex rounded-[3rem] bg-[#000000]/40 border border-[#163E70]/30 overflow-hidden shadow-[inset_0_0_80px_rgba(22,62,112,0.15)] group">
              {/* Scanning beam */}
              <div className="absolute top-0 left-0 w-full h-1 bg-[#0074FF] shadow-[0_0_20px_#0074FF] animate-[scanline_4s_linear_infinite] opacity-50"></div>
              
              {/* Central Glowing Orb */}
              <div className="relative z-10 w-40 h-40 rounded-full border-4 border-dashed border-[#0074FF]/60 animate-[spin_10s_linear_infinite] flex items-center justify-center shadow-[0_0_40px_rgba(0,116,255,0.2)]">
                <div className="w-28 h-28 rounded-full bg-[#163E70]/40 backdrop-blur-md flex items-center justify-center border border-[#0074FF]/50 animate-[spin_5s_linear_infinite_reverse]">
                   <svg className="w-10 h-10 text-[#0074FF] drop-shadow-[0_0_15px_#0074FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              
              {/* Floating Data Bars */}
              <div className="absolute inset-0 flex flex-col justify-between p-16 opacity-30 pointer-events-none">
                <div className="w-3/4 h-2 bg-[#0074FF] rounded-full animate-pulse blur-[1px]"></div>
                <div className="w-1/2 h-2 bg-[#0074FF] rounded-full animate-pulse delay-100 blur-[1px]"></div>
                <div className="w-full h-2 bg-[#0074FF] rounded-full animate-pulse delay-200 blur-[1px]"></div>
                <div className="w-5/6 h-2 bg-[#0074FF] rounded-full animate-pulse delay-300 blur-[1px]"></div>
              </div>
            </div>

            {/* Right Side: Text Content */}
            <div className="flex flex-col gap-10 z-10">
              <div className="inline-flex items-center gap-6 mb-2">
                <h2 className="text-4xl md:text-5xl font-[family-name:var(--font-space)] font-bold text-white drop-shadow-md">Why <span className="text-[#0074FF]">Participate?</span></h2>
                <div className="h-px w-24 bg-gradient-to-r from-[#0074FF] to-transparent"></div>
              </div>
              
              <div className="space-y-10">
                <div className="group border-l-2 border-[#163E70] pl-8 hover:border-[#0074FF] transition-colors duration-500">
                  <h4 className="text-2xl font-[family-name:var(--font-space)] font-bold text-white mb-3 group-hover:text-[#0074FF] transition-colors">Elite Problem Solving</h4>
                  <p className="text-neutral-400 font-light leading-relaxed text-lg">Tackle complex algorithmic and mathematical puzzles in a highly competitive, time-sensitive environment.</p>
                </div>
                <div className="group border-l-2 border-[#163E70] pl-8 hover:border-[#0074FF] transition-colors duration-500">
                  <h4 className="text-2xl font-[family-name:var(--font-space)] font-bold text-white mb-3 group-hover:text-[#0074FF] transition-colors">Skill Amplification</h4>
                  <p className="text-neutral-400 font-light leading-relaxed text-lg">Sharpen your competitive coding agility, logical reasoning, and strategic team collaboration under pressure.</p>
                </div>
                <div className="group border-l-2 border-[#163E70] pl-8 hover:border-[#0074FF] transition-colors duration-500">
                  <h4 className="text-2xl font-[family-name:var(--font-space)] font-bold text-white mb-3 group-hover:text-[#0074FF] transition-colors">Global Preparation</h4>
                  <p className="text-neutral-400 font-light leading-relaxed text-lg">Gain the ultimate tactical proving ground and preparatory experience for the 24-hour global IEEEXtreme competition.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Rules & Guidelines (Text Left, Animation Right) */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Side: Rules Panel */}
            <div className="bg-gradient-to-br from-[#163E70]/20 to-[#000000]/80 border border-[#163E70]/50 rounded-[2.5rem] p-10 md:p-14 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#0074FF] to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-1000 shadow-[0_0_15px_#0074FF]"></div>
              
              <h2 className="text-4xl font-[family-name:var(--font-space)] font-bold text-white mb-10 drop-shadow-md">Rules & <span className="text-[#0074FF]">Guidelines</span></h2>
              
              <ul className="space-y-8">
                <li className="flex gap-5">
                  <div className="mt-2.5 w-2 h-2 rounded-full bg-[#0074FF] shadow-[0_0_10px_#0074FF] shrink-0"></div>
                  <div>
                    <span className="font-bold text-white text-lg">Team Composition:</span> <span className="text-neutral-400 font-light text-lg leading-relaxed block mt-1">Squads are capped at a maximum of three members. Cross-institutional teams are strictly prohibited; all members must exclusively represent the same university.</span>
                  </div>
                </li>
                <li className="flex gap-5">
                  <div className="mt-2.5 w-2 h-2 rounded-full bg-[#0074FF] shadow-[0_0_10px_#0074FF] shrink-0"></div>
                  <div>
                    <span className="font-bold text-white text-lg">Platform Operations:</span> <span className="text-neutral-400 font-light text-lg leading-relaxed block mt-1">The entire competition infrastructure is hosted on HackerRank. Teams must compete using a single, designated account following the precise format: <code className="bg-[#163E70]/40 text-[#0074FF] px-2 py-1 rounded text-sm font-mono border border-[#0074FF]/30 ml-1">MX11_&#123;TEAM_NAME&#125;</code>.</span>
                  </div>
                </li>
                <li className="flex gap-5">
                  <div className="mt-2.5 w-2 h-2 rounded-full bg-[#0074FF] shadow-[0_0_10px_#0074FF] shrink-0"></div>
                  <div>
                    <span className="font-bold text-white text-lg">Absolute Integrity:</span> <span className="text-neutral-400 font-light text-lg leading-relaxed block mt-1">We enforce a strict zero-tolerance policy against plagiarism, external collaboration, and multiple account usage. All submissions undergo rigorous evaluation via automated plagiarism detection tools.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Right Side: Security Hex Animation */}
            <div className="relative w-full aspect-square max-h-[450px] flex items-center justify-center hidden lg:flex">
              {/* Outer Shield Rings */}
              <div className="absolute w-[80%] h-[80%] rounded-full border-[1.5px] border-dashed border-[#163E70] animate-[spin_30s_linear_infinite]"></div>
              <div className="absolute w-[60%] h-[60%] rounded-full border-[2px] border-[#163E70]/40 animate-[spin_20s_linear_infinite_reverse]"></div>
              
              {/* Glowing Hexagon Core */}
              <div className="relative w-44 h-44 bg-[#000000]/80 backdrop-blur-2xl border-[3px] border-[#0074FF] shadow-[0_0_60px_rgba(0,116,255,0.3)] flex items-center justify-center" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                <svg className="w-14 h-14 text-[#0074FF] drop-shadow-[0_0_20px_#0074FF] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              
              {/* Floating Security Nodes */}
              <div className="absolute top-[18%] right-[10%] bg-[#000000]/90 border border-[#163E70] px-4 py-2 rounded-lg flex items-center gap-3 animate-[bounce_4s_ease-in-out_infinite] shadow-lg">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]"></div>
                <span className="font-mono text-[11px] text-neutral-300 font-bold tracking-widest">ANTI-CHEAT ON</span>
              </div>
              <div className="absolute bottom-[20%] left-[8%] bg-[#000000]/90 border border-[#163E70] px-4 py-2 rounded-lg flex items-center gap-3 animate-[bounce_3s_ease-in-out_infinite_reverse] shadow-lg">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                <span className="font-mono text-[11px] text-neutral-300 font-bold tracking-widest">INTEGRITY VERIFIED</span>
              </div>
            </div>

          </div>
        </section>

        {/* Call to Action (Final Gateway) */}
        <section id="register" className="relative w-full py-16 scroll-mt-32 mb-20">
          <div className="relative w-full rounded-[3rem] overflow-hidden bg-[#000000]/60 backdrop-blur-2xl border border-white/5 shadow-[0_0_80px_rgba(0,116,255,0.15)] group">
            
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_rgba(0,116,255,0.25)_0%,_transparent_60%)]"></div>
            
            {/* Top glowing edge */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-[#0074FF] to-transparent opacity-50 shadow-[0_0_20px_#0074FF]"></div>
            
            <div className="relative z-10 px-8 py-24 md:py-32 flex flex-col items-center text-center">
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-[#0074FF]/40 bg-[#0074FF]/10 backdrop-blur-md mb-10 shadow-[0_0_15px_rgba(0,116,255,0.2)]">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></div>
                <span className="font-mono text-[11px] text-white tracking-[0.3em] uppercase font-bold">Registration Gateway Open</span>
              </div>

              <h2 className="text-4xl md:text-6xl font-[family-name:var(--font-space)] font-bold mb-8 text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                The Gateway to <br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0074FF] to-white">IEEEXtreme 20.0</span>
              </h2>
              
              <p className="text-neutral-400 max-w-3xl mx-auto mb-14 leading-relaxed text-lg md:text-xl font-light">
                MoraXtreme serves as your exclusive launchpad for IEEEXtreme, a prestigious 24-hour global programming challenge spanning 65 countries. Top global performers compete for <strong className="text-white font-semibold">fully-funded trips to an IEEE conference</strong> of their choice anywhere in the world.
              </p>
              
              <h3 className="text-lg md:text-2xl font-mono font-bold text-[#0074FF] mb-12 tracking-[0.2em] uppercase drop-shadow-[0_0_15px_rgba(0,116,255,0.5)]">
                The Ultimate Coding Showdown Awaits.
              </h3>
              
              {/* Massive CTA Button */}
              <Button asChild size="lg" className="group relative px-12 py-8 text-lg font-[family-name:var(--font-space)] font-bold tracking-[0.25em] uppercase text-[#0074FF] hover:text-white bg-[#000000] transition-all duration-500 rounded-full overflow-hidden shadow-[0_0_40px_rgba(0,116,255,0.4)] hover:shadow-[0_0_60px_rgba(0,116,255,0.6)] hover:-translate-y-2 border border-[#0074FF]/50 hover:border-[#0074FF] backdrop-blur-xl">
                <a href="#register">
                  <span className="relative z-10 flex items-center gap-4 drop-shadow-[0_0_8px_rgba(0,116,255,0.8)] group-hover:drop-shadow-none transition-all duration-500">
                    Register Now
                    <svg className="w-6 h-6 transition-transform duration-500 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                  {/* Hover Fill */}
                  <div className="absolute inset-0 bg-[#0074FF] -translate-x-full transition-transform duration-500 ease-out group-hover:translate-x-0 z-0"></div>
                </a>
              </Button>
            </div>
          </div>
        </section>
        
      </div>
    </main>
  )
}
