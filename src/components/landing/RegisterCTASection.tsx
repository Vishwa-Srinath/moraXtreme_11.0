export default function RegisterCTASection() {
  return (
    <section id="register" className="relative mb-20 w-full scroll-mt-32 py-16">
      {/* Our Partners Heading (Above the box) */}
      <div className="mb-10 flex w-full flex-col items-center text-center gap-6 md:mb-12">
        <h2 className="font-[family-name:var(--font-sans)] text-[clamp(2.8rem,4vw,3.8rem)] font-black leading-[0.88] tracking-[-0.03em] text-white uppercase drop-shadow-xl">
          Our{" "}
          <span className="bg-gradient-to-r from-[#0074FF] to-[#005BD6] bg-clip-text text-transparent">
            Partners
          </span>
        </h2>
        <div className="h-1 w-20 bg-gradient-to-r from-transparent via-[#0074FF] to-transparent"></div>
      </div>

      {/* Box for Partner Images */}
      <div className="group relative w-full overflow-hidden rounded-[3rem] border border-white/5 bg-[#000000]/60 shadow-[0_0_80px_rgba(0,116,255,0.15)] backdrop-blur-2xl">
        {/* Background radial glow */}
        <div className="absolute top-0 left-1/2 h-full w-full -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,_rgba(0,116,255,0.25)_0%,_transparent_60%)]"></div>

        {/* Top glowing edge */}
        <div className="absolute top-0 left-1/2 h-[2px] w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#0074FF] to-transparent opacity-50 shadow-[0_0_20px_#0074FF]"></div>

        <div className="relative z-10 flex min-h-[300px] flex-col items-center justify-center py-16 text-center md:px-8 md:py-24">
          {/* Partner images container - ready for partner logos */}
        </div>
      </div>
    </section>
  )
}
