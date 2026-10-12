"use client"

import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"

export const FINALIST_TEAMS = [
  "Hehe",
  "Ayyo Exception",
  "SheSaaS",
  "Zybots",
  "Syntax Samurai",
  "WeBall",
  "Knurdz.exe",
  "Knurdz Decoherence",
  "MaveRIX",
  "Error 404",
  "ByteCrafters",
  "Warriors",
  "TheByteForce",
  "Byte Kings",
  "Obsedian",
  "ENPULSE",
  "Bug Slayers",
  "Quantumites",
  "Rookies",
  "CodeBuddies",
]

export default function FinalistsOverlay() {
  const [isOpen, setIsOpen] = useState(false)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleOpen = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setIsOpen(true)
  }

  const handleScheduleClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }
    // Generous delay to allow smooth mouse movement between button and dropdown
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 380)
  }

  const handleCancelClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleOpen}
      onMouseLeave={handleScheduleClose}
    >
      {/* Finalists Button - Responsive padding and sizing */}
      <button
        type="button"
        onClick={() => {
          if (isOpen) {
            setIsOpen(false)
          } else {
            handleOpen()
          }
        }}
        aria-expanded={isOpen}
        aria-label="View Finalists"
        className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-[#3d8dff] bg-[#050b16] px-4 py-1.5 font-[family-name:var(--font-space)] text-[11px] font-black tracking-[0.2em] text-[#6fd3ff] uppercase shadow-[0_0_0_3px_rgba(0,116,255,0.18),0_0_24px_rgba(0,116,255,0.45)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.04] hover:border-[#6fd3ff] hover:bg-[#0074FF]/25 hover:text-white hover:shadow-[0_0_0_4px_rgba(61,141,255,0.3),0_0_35px_rgba(0,116,255,0.7)] cursor-pointer select-none sm:px-6 sm:py-2.5 sm:text-xs md:px-7 md:py-3 md:text-sm"
      >
        {/* Glowing pulse aura behind button */}
        <span
          aria-hidden="true"
          className="absolute -inset-0.5 -z-10 rounded-full bg-gradient-to-r from-[#0074FF]/40 via-[#3d8dff]/60 to-[#0074FF]/40 opacity-80 blur-sm transition-opacity duration-300 group-hover:opacity-100"
        />

        <span>Finalists</span>
      </button>

      {/* Blurred Background Overlay + Finalists Dropdown */}
      {isOpen && (
        <>
          {/* Fullscreen Backdrop: Blurs background */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Finalists Container: No outer box, team boxes appear directly on blurred background */}
          <div
            className="fixed inset-x-3 top-20 z-50 mx-auto max-w-lg transition-all duration-300 max-h-[calc(100vh-90px)] overflow-y-auto sm:px-2 md:absolute md:inset-auto md:right-0 md:top-full md:mt-3 md:w-[620px] md:max-w-2xl md:max-h-none md:overflow-visible"
            onMouseEnter={handleCancelClose}
            onMouseLeave={handleScheduleClose}
            role="dialog"
            aria-modal="true"
            aria-label="Finalist Teams"
          >
            {/* Floating Header */}
            <div className="relative z-10 mb-3 flex items-center justify-between gap-3 px-1 sm:mb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-[#3d8dff]/40 bg-[#0074FF]/15 px-2.5 py-0.5 font-[family-name:var(--font-space)] text-[9px] font-bold tracking-widest text-[#6fd3ff] uppercase sm:text-xs">
                  Elimination Round
                </span>
                <h3 className="font-[family-name:var(--font-space)] text-lg font-black tracking-tight text-white uppercase sm:text-xl md:text-2xl">
                  Top 20{" "}
                  <span className="bg-gradient-to-r from-[#6fd3ff] via-[#3d8dff] to-[#0074FF] bg-clip-text text-transparent">
                    Finalists
                  </span>
                </h3>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close"
                aria-label="Close finalists overlay"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/40 text-neutral-300 backdrop-blur-md transition-colors hover:border-white/50 hover:bg-white/20 hover:text-white sm:h-8 sm:w-8"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 20 Teams Grid (Floating directly on blurred background) */}
            <div className="relative z-10">
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:gap-2.5">
                {FINALIST_TEAMS.map((teamName) => (
                  <div
                    key={teamName}
                    className="group relative flex items-center gap-2 overflow-hidden rounded-lg border border-[#3d8dff]/35 bg-[#050b16]/90 px-2.5 py-1.5 shadow-[0_0_12px_rgba(0,116,255,0.08)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3d8dff] hover:bg-[#0074FF]/25 hover:shadow-[0_0_20px_rgba(0,116,255,0.35)] sm:rounded-xl sm:px-3 sm:py-2 md:px-3.5 md:py-2.5"
                  >
                    {/* Glowing Cyan Node */}
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#6fd3ff] shadow-[0_0_8px_#6fd3ff] transition-transform duration-300 group-hover:scale-125 sm:h-2 sm:w-2"
                    />

                    {/* Team Name */}
                    <span className="font-[family-name:var(--font-space)] text-[10px] font-bold tracking-wide text-white transition-colors duration-200 group-hover:text-[#6fd3ff] truncate xs:text-[11px] sm:text-xs md:text-sm">
                      {teamName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
