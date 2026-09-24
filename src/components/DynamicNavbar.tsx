"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function DynamicNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("home")
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // 1. Background transition logic
      setScrolled(window.scrollY > 50)
      
      // 2. Scroll Spy logic
      const sections = ["home", "about", "highlights", "legacy", "timeline", "why-join", "rules","gallery", "team", "register"]
      
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
          ? "bg-[#000000]/80 backdrop-blur-xl border-b border-[#163E70] py-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)]" 
          : "bg-transparent py-6"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between transition-all duration-300">
        
        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Image src="/logo.png" alt="Logo" width={90} height={36} className="object-contain" unoptimized />
        </div>
        
        {/* Navigation Links - desktop */}
        <ul className="hidden md:flex items-center gap-8 lg:gap-10 text-xs font-mono tracking-[0.2em] uppercase text-neutral-400">
          {["home", "about", "highlights", "legacy", "timeline", "why-join", "gallery", "team"].map((item) => (
            <li key={item}>
              <a 
                href={`#${item}`} 
                className={cn(
                  "transition-colors duration-300 relative",
                  activeSection === item ? "text-white font-bold" : "hover:text-[#0074FF]"
                )}
              >
                {item}
                {/* Glowing Active Indicator */}
                <span 
                  className={cn(
                    "absolute -bottom-3 left-1/2 -translate-x-1/2 h-[2px] bg-[#0074FF] shadow-[0_0_10px_#0074FF] transition-all duration-300",
                    activeSection === item ? "w-full opacity-100" : "w-0 opacity-0"
                  )}
                ></span>
              </a>
            </li>
          ))}
        </ul>
        
        {/* Right side: Register + Hamburger */}
        <div className="flex items-center gap-3">
          <a href="/register" className={cn(
            buttonVariants({ variant: "outline" }),
            "font-mono uppercase tracking-[0.2em] transition-all duration-500 text-xs px-3 sm:px-4",
            scrolled 
              ? "border-[#0074FF] text-[#0074FF] hover:bg-[#0074FF] hover:text-white"
              : "border-white/50 text-white hover:bg-white hover:text-black hover:border-white bg-white/5 backdrop-blur-sm"
          )}>
            Register
          </a>

          {/* Mobile hamburger */}
          <button
            className="flex md:hidden flex-col gap-1.5 p-2 rounded-md border border-white/10 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span className={cn("block h-0.5 w-5 bg-white transition-all duration-300", mobileOpen && "rotate-45 translate-y-2")} />
            <span className={cn("block h-0.5 w-5 bg-white transition-all duration-300", mobileOpen && "opacity-0")} />
            <span className={cn("block h-0.5 w-5 bg-white transition-all duration-300", mobileOpen && "-rotate-45 -translate-y-2")} />
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#163E70]/50 bg-black/90 backdrop-blur-xl px-4 py-4">
          <ul className="flex flex-col gap-4 font-mono text-xs tracking-[0.2em] uppercase">
            {["home", "about", "highlights", "legacy", "timeline", "why-join", "gallery", "team"].map((item) => (
              <li key={item}>
                <a
                  href={`#${item}`}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block py-2 transition-colors duration-200",
                    activeSection === item ? "text-[#0074FF] font-bold" : "text-neutral-300 hover:text-white"
                  )}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  )
}
