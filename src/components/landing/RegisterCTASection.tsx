export default function RegisterCTASection() {
  return (
    <section id="register" className="relative mb-20 w-full scroll-mt-32 py-16">
      <div className="group relative w-full overflow-hidden rounded-[3rem] border border-white/5 bg-[#000000]/60 shadow-[0_0_80px_rgba(0,116,255,0.15)] backdrop-blur-2xl">
        {/* Background radial glow */}
        <div className="absolute top-0 left-1/2 h-full w-full -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,_rgba(0,116,255,0.25)_0%,_transparent_60%)]"></div>

        {/* Top glowing edge */}
        <div className="absolute top-0 left-1/2 h-[2px] w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#0074FF] to-transparent opacity-50 shadow-[0_0_20px_#0074FF]"></div>

        <div className="relative z-10 flex min-h-[300px] flex-col items-center justify-center py-16 text-center md:px-8 md:py-24">
          {/* Gateway content area - ready for new content */}
        </div>
      </div>
    </section>
  )
}
