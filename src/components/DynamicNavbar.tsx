"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function DynamicNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("home")

  useEffect(() => {
    const handleScroll = () => {
      // 1. Background transition logic
      setScrolled(window.scrollY > 50)
      
      // 2. Scroll Spy logic
      const sections = ["home", "about", "highlights", "legacy", "rules", "register"]
      
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
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between transition-all duration-300">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo" width={100} height={40} className="object-contain" unoptimized />
        </div>
        
        {/* Navigation Links */}
        <ul className="hidden md:flex items-center gap-10 text-xs font-mono tracking-[0.2em] uppercase text-neutral-400">
          {["home", "about", "highlights", "legacy", "rules"].map((item) => (
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
        
        {/* Register Button */}
        <a href="#register" className={cn(
          buttonVariants({ variant: "outline" }),
          "font-mono uppercase tracking-[0.2em] transition-all duration-500",
          scrolled 
            ? "border-[#0074FF] text-[#0074FF] hover:bg-[#0074FF] hover:text-white"
            : "border-white/50 text-white hover:bg-white hover:text-black hover:border-white bg-white/5 backdrop-blur-sm"
        )}>
          Register
        </a>
      </div>
    </nav>
  )
}
