import { Button } from "@/components/ui/button"
import Image from "next/image"

export default async function Home() {
  // Add a 2-second delay to show off the cool loading screen!
  await new Promise((resolve) => setTimeout(resolve, 2000))

  return (
    <main className="relative flex flex-col items-center bg-[#000000]">
      {/* Background Video (Fixed behind everything) */}
      <div className="fixed inset-0 z-0 h-screen w-full">
        <video autoPlay loop muted playsInline className="h-full w-full object-cover opacity-90">
          <source src="/bg-video.mp4" type="video/mp4" />
        </video>
        {/* Overlay to fade out video nicely at the very bottom edge */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#000000]/40 to-[#000000]"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center p-24 text-center">
        {/* The Animated GIF acting as a backdrop behind the text */}
        <div className="absolute top-1/2 left-1/2 -z-10 w-[50vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 aspect-square opacity-60 mix-blend-screen drop-shadow-[0_0_30px_rgba(0,116,255,0.6)]">
          <Image 
            src="/earth.gif" 
            alt="Spinning Earth"
            fill
            className="object-contain pointer-events-none"
            unoptimized
          />
        </div>

        <h1 className="font-mono text-5xl font-bold text-white drop-shadow-2xl">
          Welcome to MoraXtreme 11
        </h1>
        <p className="mt-8 mb-8 max-w-lg text-center text-xl font-medium text-white drop-shadow-xl">
          The ultimate 12-hour online coding competition. Run it all from one secure workspace.
        </p>
        <Button size="lg" className="px-8 text-lg shadow-2xl relative z-20">Get Started</Button>
      </section>

      {/* New Content Sections */}
      <div className="relative z-10 w-full max-w-6xl px-6 py-24 flex flex-col gap-32 text-white">
        
        {/* About Section */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-mono font-bold text-[#0074FF] mb-6">About MoraXtreme 11.0</h2>
            <p className="text-neutral-300 leading-relaxed text-lg">
              MoraXtreme is Sri Lanka’s premier annual algorithmic coding competition, organized by the IEEE Student Branch and the IEEE Computer Society Student Branch Chapter of the University of Moratuwa. Serving as a national adaptation of the global IEEEXtreme competition, it is designed to foster competitive programming skills and prepare participants for the international stage. The challenge consists of a rigorous 12-hour online elimination round, followed by an intense 8-hour physical Grand Finale.
            </p>
          </div>
          <div className="bg-[#163E70]/20 border border-[#0074FF]/30 p-8 rounded-2xl backdrop-blur-md shadow-[0_0_30px_rgba(22,62,112,0.3)]">
            <h3 className="text-2xl font-mono font-bold text-white mb-4">Who Can Participate?</h3>
            <p className="text-neutral-300 leading-relaxed">
              For its 11th edition, MoraXtreme expands its battlefield beyond borders, allowing participants to compete individually or form teams of up to three members. This elite open division is built specifically for undergraduate students currently enrolled in Sri Lanka, alongside university undergraduates across the entire South Asian region.
            </p>
          </div>
        </section>

        {/* Highlights */}
        <section>
          <h2 className="text-4xl font-mono font-bold text-center mb-16">The Event <span className="text-[#0074FF]">Highlights</span></h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-8 border border-[#163E70] bg-[#000000]/60 rounded-xl hover:border-[#0074FF] hover:bg-[#163E70]/20 transition-all duration-300 cursor-default">
              <h4 className="text-xl font-bold text-[#0074FF] mb-4">Award-Winning Organizers</h4>
              <p className="text-sm text-neutral-400 leading-relaxed">Driven by the University of Moratuwa IEEE Student Branch - officially crowned the Best Student Branch in the IEEE Region 10 - Asia-Pacific (2025).</p>
            </div>
            <div className="p-8 border border-[#163E70] bg-[#000000]/60 rounded-xl hover:border-[#0074FF] hover:bg-[#163E70]/20 transition-all duration-300 cursor-default">
              <h4 className="text-xl font-bold text-[#0074FF] mb-4">Massive Scale</h4>
              <p className="text-sm text-neutral-400 leading-relaxed">Operating on a monumental scale, with previous iterations engaging over 450 teams and 1,500+ elite competitors.</p>
            </div>
            <div className="p-8 border border-[#163E70] bg-[#000000]/60 rounded-xl hover:border-[#0074FF] hover:bg-[#163E70]/20 transition-all duration-300 cursor-default">
              <h4 className="text-xl font-bold text-[#0074FF] mb-4">Comprehensive Training</h4>
              <p className="text-sm text-neutral-400 leading-relaxed">Equipping competitors through dedicated awareness sessions and rigorous skill-building workshops prior to the arena.</p>
            </div>
            <div className="p-8 border border-[#163E70] bg-[#000000]/60 rounded-xl hover:border-[#0074FF] hover:bg-[#163E70]/20 transition-all duration-300 cursor-default">
              <h4 className="text-xl font-bold text-[#0074FF] mb-4">Proven Legacy</h4>
              <p className="text-sm text-neutral-400 leading-relaxed">Maintaining a dominant track record of elevating regional talent directly into the IEEEXtreme Global Top 500.</p>
            </div>
          </div>
        </section>

        {/* Stats / Legacy */}
        <section className="bg-gradient-to-r from-[#163E70]/40 to-transparent p-12 md:p-16 rounded-3xl border-l-4 border-[#0074FF] shadow-2xl">
          <h2 className="text-3xl font-mono font-bold mb-10">Our Legacy</h2>
          <div className="flex flex-wrap gap-12 md:gap-24">
            <div>
              <div className="text-6xl font-black text-[#0074FF] mb-2 drop-shadow-[0_0_15px_rgba(0,116,255,0.4)]">1,500+</div>
              <div className="text-neutral-400 uppercase tracking-widest text-sm font-bold">Competitors</div>
            </div>
            <div>
              <div className="text-6xl font-black text-[#0074FF] mb-2 drop-shadow-[0_0_15px_rgba(0,116,255,0.4)]">450+</div>
              <div className="text-neutral-400 uppercase tracking-widest text-sm font-bold">Teams Battling</div>
            </div>
            <div>
              <div className="text-6xl font-black text-[#0074FF] mb-2 drop-shadow-[0_0_15px_rgba(0,116,255,0.4)]">150+</div>
              <div className="text-neutral-400 uppercase tracking-widest text-sm font-bold">Active Members</div>
            </div>
          </div>
        </section>

        {/* Why Participate & Rules */}
        <section className="grid md:grid-cols-2 gap-20">
          <div>
            <h2 className="text-3xl font-mono font-bold mb-10 text-[#0074FF]">Why Participate?</h2>
            <div className="space-y-8">
              <div>
                <h4 className="text-xl font-bold mb-3 text-white">Elite Problem Solving</h4>
                <p className="text-neutral-400 leading-relaxed">Tackle complex algorithmic and mathematical puzzles in a highly competitive, time-sensitive environment.</p>
              </div>
              <div>
                <h4 className="text-xl font-bold mb-3 text-white">Skill Amplification</h4>
                <p className="text-neutral-400 leading-relaxed">Sharpen your competitive coding agility, logical reasoning, and strategic team collaboration under pressure.</p>
              </div>
              <div>
                <h4 className="text-xl font-bold mb-3 text-white">Global Preparation</h4>
                <p className="text-neutral-400 leading-relaxed">Gain the ultimate tactical proving ground and preparatory experience for the 24-hour global IEEEXtreme competition.</p>
              </div>
            </div>
          </div>
          <div className="bg-[#163E70]/10 p-8 rounded-2xl border border-[#163E70]">
            <h2 className="text-3xl font-mono font-bold mb-10 text-[#0074FF]">Rules & Guidelines</h2>
            <ul className="space-y-8 text-neutral-400">
              <li className="flex gap-4">
                <div className="mt-2 h-2.5 w-2.5 bg-[#0074FF] rounded-full shrink-0 shadow-[0_0_8px_#0074FF]"></div>
                <p className="leading-relaxed"><strong className="text-white">Team Composition:</strong> Squads are capped at a maximum of three members. Cross-institutional teams are strictly prohibited; all members must exclusively represent the same university.</p>
              </li>
              <li className="flex gap-4">
                <div className="mt-2 h-2.5 w-2.5 bg-[#0074FF] rounded-full shrink-0 shadow-[0_0_8px_#0074FF]"></div>
                <p className="leading-relaxed"><strong className="text-white">Platform Operations:</strong> The entire competition infrastructure is hosted on HackerRank. Teams must compete using a single, designated account following the precise format: <code className="text-[#0074FF] bg-[#163E70]/30 px-1 py-0.5 rounded">MX11_&#123;TEAM NAME&#125;</code>.</p>
              </li>
              <li className="flex gap-4">
                <div className="mt-2 h-2.5 w-2.5 bg-[#0074FF] rounded-full shrink-0 shadow-[0_0_8px_#0074FF]"></div>
                <p className="leading-relaxed"><strong className="text-white">Absolute Integrity:</strong> We enforce a strict zero-tolerance policy against plagiarism, external collaboration, and multiple account usage. All submissions undergo rigorous evaluation via automated plagiarism detection tools.</p>
              </li>
            </ul>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-[#163E70]/20 py-24 rounded-3xl border border-[#0074FF]/30 relative overflow-hidden shadow-[0_0_50px_rgba(22,62,112,0.5)]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#0074FF_0,_transparent_70%)] opacity-10"></div>
          <div className="relative z-10 px-6">
            <h2 className="text-4xl md:text-5xl font-mono font-bold mb-8 text-white">The Gateway to IEEEXtreme 20.0</h2>
            <p className="text-neutral-300 max-w-3xl mx-auto mb-12 leading-relaxed text-lg">
              MoraXtreme serves as your exclusive launchpad for IEEEXtreme, a prestigious 24-hour global programming challenge spanning 65 countries. Top global performers compete for fully-funded trips to an IEEE conference of their choice anywhere in the world.
            </p>
            <h3 className="text-2xl font-bold text-[#0074FF] mb-12 tracking-wide">THE ULTIMATE CODING SHOWDOWN AWAITS.</h3>
            <Button size="lg" className="px-14 py-8 text-xl bg-[#0074FF] hover:bg-[#0074FF]/80 text-white font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(0,116,255,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,116,255,0.6)]">
              Register Now
            </Button>
          </div>
        </section>
        
      </div>
    </main>
  )
}
