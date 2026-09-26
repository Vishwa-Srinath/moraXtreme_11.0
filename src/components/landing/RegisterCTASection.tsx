export default function RegisterCTASection() {
  return (
    <section id="register" className="relative mb-20 w-full scroll-mt-32 py-16">
      <div className="group relative w-full overflow-hidden rounded-[3rem] border border-white/5 bg-[#000000]/60 shadow-[0_0_80px_rgba(0,116,255,0.15)] backdrop-blur-2xl">
        {/* Background radial glow */}
        <div className="absolute top-0 left-1/2 h-full w-full -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,_rgba(0,116,255,0.25)_0%,_transparent_60%)]"></div>

        {/* Top glowing edge */}
        <div className="absolute top-0 left-1/2 h-[2px] w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#0074FF] to-transparent opacity-50 shadow-[0_0_20px_#0074FF]"></div>

        <div className="relative z-10 flex flex-col items-center py-16 text-center md:px-8 md:py-24">
          {/* Status Badge */}
          <div className="mb-10 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
            <span className="font-mono text-[11px] font-semibold tracking-[0.25em] text-neutral-200 uppercase">
              Registrations Are Open
            </span>
          </div>

          <div className="mb-12 w-full text-left md:text-center">
            <h2 className="font-[family-name:var(--font-sans)] text-[clamp(2.8rem,4vw,3.8rem)] font-black leading-[0.88] tracking-[-0.03em] text-white uppercase drop-shadow-xl">
              The Gateway to <br className="md:hidden" />
              <span className="bg-gradient-to-r from-[#0074FF] to-[#005BD6] bg-clip-text text-transparent">
                MoraXtreme 11.0
              </span>
            </h2>
          </div>

          {/* CTA Button */}
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
            {/* Hover fill */}
            <div className="absolute inset-0 z-0 -translate-x-full bg-[#0074FF] transition-transform duration-500 ease-out group-hover/btn:translate-x-0"></div>
          </a>
        </div>
      </div>
    </section>
  )
}
