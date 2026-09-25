import Image from "next/image"

export default function Footer() {
  return (
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
  )
}
