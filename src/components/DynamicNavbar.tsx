"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "highlights", label: "Highlights" },
  { id: "legacy", label: "Legacy" },
  { id: "timeline", label: "Timeline" },
  { id: "why-join", label: "Why Join ?" },
  { id: "gallery", label: "Gallery" },
  { id: "team", label: "Contact Us" },
]

export default function DynamicNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("home")
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // 1. Background transition logic
      setScrolled(window.scrollY > 50)

      // 2. Scroll Spy logic
      const sections = [
        "home",
        "about",
        "highlights",
        "legacy",
        "timeline",
        "why-join",
        "rules",
        "gallery",
        "team",
        "register",
      ]

      if (window.scrollY < 100) {
        setActiveSection("home")
        return
      }

      // Check from bottom to top to find the first section that is actively in view
      for (const section of sections.reverse()) {
        const el = document.getElementById(section)
        if (el) {
          const rect = el.getBoundingClientRect()
          // If the top of the section is near or above the top third of the viewport
          if (rect.top <= 200) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Trigger on mount
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500",
        scrolled
          ? "border-b border-[#163E70] bg-[#000000]/80 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          : "bg-transparent py-6"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-300 sm:px-6">
        {/* Logo */}
        <div className="flex flex-shrink-0 items-center gap-3">
          <Image
            src="/logo.png"
            alt="Logo"
            width={90}
            height={36}
            className="object-contain"
            unoptimized
          />
        </div>

        {/* Navigation Links - desktop */}
        <ul className="hidden items-center gap-6 font-mono text-sm tracking-[0.2em] uppercase md:flex lg:gap-8">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "relative font-black text-white transition-all duration-300 [-webkit-text-stroke:0.5px_#163E70]",
                  activeSection === item.id
                    ? "opacity-100"
                    : "opacity-60 hover:opacity-100"
                )}
              >
                {item.label}
                {/* Glowing Active Indicator */}
                <span
                  className={cn(
                    "absolute -bottom-3 left-1/2 h-[2px] -translate-x-1/2 bg-[#0074FF] shadow-[0_0_10px_#0074FF] transition-all duration-300",
                    activeSection === item.id
                      ? "w-full opacity-100"
                      : "w-0 opacity-0"
                  )}
                ></span>
              </a>
            </li>
          ))}
        </ul>

        {/* Right side: Register + Hamburger */}
        <div className="flex items-center gap-3">
          <a
            href="/register"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "px-3 font-[family-name:var(--font-space)] text-xs font-extrabold tracking-widest uppercase transition-all duration-500 sm:px-4",
              scrolled
                ? "border-[#0074FF] text-[#0074FF] hover:bg-[#0074FF] hover:text-white"
                : "border-white/50 bg-white/5 text-white backdrop-blur-sm hover:border-white hover:bg-white hover:text-black"
            )}
          >
            Register
          </a>

          {/* Mobile hamburger */}
          <button
            className="flex flex-col gap-1.5 rounded-md border border-white/10 bg-black/30 p-2 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span
              className={cn(
                "block h-0.5 w-5 bg-white transition-all duration-300",
                mobileOpen && "translate-y-2 rotate-45"
              )}
            />
            <span
              className={cn(
                "block h-0.5 w-5 bg-white transition-all duration-300",
                mobileOpen && "opacity-0"
              )}
            />
            <span
              className={cn(
                "block h-0.5 w-5 bg-white transition-all duration-300",
                mobileOpen && "-translate-y-2 -rotate-45"
              )}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="border-t border-[#163E70]/50 bg-black/90 px-4 py-4 backdrop-blur-xl md:hidden">
          <ul className="flex flex-col gap-4 font-[family-name:var(--font-space)] text-xs font-bold tracking-widest uppercase">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block py-2 transition-colors duration-200",
                    activeSection === item.id
                      ? "font-bold text-[#0074FF]"
                      : "text-neutral-300 hover:text-white"
                  )}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  )
}
