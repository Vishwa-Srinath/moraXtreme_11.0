import Image from "next/image"

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

        <div className="relative z-10 flex min-h-[340px] w-full flex-col items-start justify-center py-12 px-8 sm:py-16 sm:px-12 md:px-16 md:py-20">
          <div className="flex w-full flex-col items-center sm:items-start sm:flex-row sm:flex-wrap justify-start gap-12 sm:gap-16 md:gap-20">
            {/* Title Partner: CIO Education */}
            <div className="flex flex-col items-center text-center">
              <div className="relative flex h-44 w-44 items-center justify-center transition-transform duration-300 hover:scale-105 sm:h-52 sm:w-52 md:h-60 md:w-60">
                <Image
                  src="/partners/cio-education.png"
                  alt="CIO Education"
                  fill
                  className="object-contain drop-shadow-[0_0_30px_rgba(0,116,255,0.35)]"
                  sizes="(max-width: 640px) 176px, (max-width: 768px) 208px, 240px"
                  unoptimized
                />
              </div>
              <div className="mt-5 flex flex-col items-center gap-2">
                <span className="font-[family-name:var(--font-space)] text-sm sm:text-base font-bold tracking-[0.22em] text-white uppercase drop-shadow-[0_0_10px_rgba(0,116,255,0.6)]">
                  Title Partner
                </span>
                <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-[#0074FF] to-transparent"></div>
              </div>
            </div>

            {/* Silver Partner: Asia Pacific Technology Systems */}
            <div className="flex flex-col items-center text-center">
              <div className="relative flex h-44 w-44 items-center justify-center transition-transform duration-300 hover:scale-105 sm:h-52 sm:w-52 md:h-60 md:w-60">
                <Image
                  src="/partners/apts.png"
                  alt="Asia Pacific Technology Systems"
                  fill
                  className="object-contain drop-shadow-[0_0_30px_rgba(0,116,255,0.3)]"
                  sizes="(max-width: 640px) 176px, (max-width: 768px) 208px, 240px"
                  unoptimized
                />
              </div>
              <div className="mt-5 flex flex-col items-center gap-2">
                <span className="font-[family-name:var(--font-space)] text-sm sm:text-base font-bold tracking-[0.22em] text-white uppercase drop-shadow-[0_0_10px_rgba(0,116,255,0.6)]">
                  Silver Partner
                </span>
                <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-[#0074FF] to-transparent"></div>
              </div>
            </div>

            {/* Banner Partner: QACERT */}
            <div className="flex flex-col items-center text-center">
              <div className="relative flex h-44 w-24 items-center justify-center transition-transform duration-300 hover:scale-105 sm:h-52 sm:w-28 md:h-60 md:w-32">
                <Image
                  src="/partners/qacert.jpg"
                  alt="QACERT"
                  fill
                  className="rounded-xl object-contain drop-shadow-[0_0_30px_rgba(0,116,255,0.35)]"
                  sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 128px"
                  unoptimized
                />
              </div>
              <div className="mt-5 flex flex-col items-center gap-2">
                <span className="font-[family-name:var(--font-space)] text-sm sm:text-base font-bold tracking-[0.22em] text-white uppercase drop-shadow-[0_0_10px_rgba(0,116,255,0.6)]">
                  Banner Partner
                </span>
                <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-[#0074FF] to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
