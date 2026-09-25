const WHY_JOIN_ITEMS = [
  {
    title: "Elite Problem Solving",
    body: "Tackle complex algorithmic and mathematical puzzles in a highly competitive, time-sensitive environment.",
  },
  {
    title: "Skill Amplification",
    body: "Sharpen your competitive coding agility, logical reasoning, and strategic team collaboration under pressure.",
  },
  {
    title: "Global Preparation",
    body: "Gain the ultimate tactical proving ground and preparatory experience for the 24-hour global IEEEXtreme competition.",
  },
] as const

export default function WhyJoinSection() {
  return (
    <section id="why-join" className="relative w-full py-12 md:py-24">
      <div className="flex w-full flex-col justify-center items-center">
        <div className="z-10 flex w-full max-w-6xl flex-col gap-12 px-6 sm:px-10">
          {/* Heading */}
          <div className="flex flex-col items-center text-center gap-6">
            <h2 className="font-[family-name:var(--font-space)] text-4xl font-bold text-white drop-shadow-md md:text-5xl">
              Why <span className="text-[#0074FF]">Participate?</span>
            </h2>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#0074FF] to-transparent"></div>
          </div>

          {/* Cards */}
          <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-3">
            {WHY_JOIN_ITEMS.map(({ title, body }) => (
              <div
                key={title}
                className="group border-t-2 border-[#163E70] pt-6 md:border-l-2 md:border-t-0 md:pl-8 md:pt-0 transition-colors duration-500 hover:border-white"
              >
                <h4 className="mb-3 font-[family-name:var(--font-space)] text-2xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.7)] transition-all duration-500 group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,1)]">
                  {title}
                </h4>
                <p className="text-lg leading-relaxed font-light text-neutral-400">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
