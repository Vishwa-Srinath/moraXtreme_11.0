"use client"

import { useEffect, useRef, useState } from "react"

export default function CustomCursor() {
  const cursorDotRef = useRef<HTMLDivElement>(null)
  const cursorRingRef = useRef<HTMLDivElement>(null)
  
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  
  const requestRef = useRef<number>()
  const previousTimeRef = useRef<number>()

  // Keep track of positions independently for buttery smooth math (Lerp)
  const mouse = useRef({ x: -100, y: -100 })
  const circle = useRef({ x: -100, y: -100 })

  useEffect(() => {
    // Hide default cursor completely across the site
    document.documentElement.style.cursor = 'none'

    const updatePosition = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY }
      if (!isVisible) setIsVisible(true)
    }

    const updateHoverState = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Detect if we are hovering over an interactive element
      const isInteractive = 
        window.getComputedStyle(target).cursor === 'pointer' || 
        target.tagName.toLowerCase() === 'button' || 
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') !== null ||
        target.closest('a') !== null

      setIsHovering(isInteractive)
    }
    
    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    window.addEventListener("mousemove", updatePosition)
    window.addEventListener("mouseover", updateHoverState)
    window.addEventListener("mouseleave", handleMouseLeave)

    // The Animation Loop for buttery smooth trailing
    const animate = (time: number) => {
      if (previousTimeRef.current != undefined) {
        // Mathematical interpolation (Lerp): Moves the circle 15% of the distance to the mouse every frame
        circle.current.x += (mouse.current.x - circle.current.x) * 0.15
        circle.current.y += (mouse.current.y - circle.current.y) * 0.15

        if (cursorDotRef.current) {
          // Hardware accelerated transform for the dot
          cursorDotRef.current.style.transform = `translate3d(${mouse.current.x}px, ${mouse.current.y}px, 0) translate(-50%, -50%) scale(${isHovering ? 0 : 1})`
        }
        
        if (cursorRingRef.current) {
          // Hardware accelerated transform for the trailing ring
          cursorRingRef.current.style.transform = `translate3d(${circle.current.x}px, ${circle.current.y}px, 0) translate(-50%, -50%) scale(${isHovering ? 1.5 : 1})`
        }
      }
      previousTimeRef.current = time
      requestRef.current = requestAnimationFrame(animate)
    }

    requestRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("mousemove", updatePosition)
      window.removeEventListener("mouseover", updateHoverState)
      window.removeEventListener("mouseleave", handleMouseLeave)
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
      document.documentElement.style.cursor = 'auto'
    }
  }, [isVisible, isHovering])

  // Don't render until the mouse moves to avoid it spawning in the top left corner
  if (!isVisible && typeof window !== 'undefined') return null

  return (
    <>
      <style>{`
        * { cursor: none !important; }
      `}</style>

      {/* Center Solid Dot (Bright Blue) */}
      <div 
        ref={cursorDotRef}
        className="pointer-events-none fixed top-0 left-0 z-[100] h-2 w-2 rounded-full bg-[#0074FF] shadow-[0_0_12px_#0074FF] transition-transform duration-200 ease-out"
        style={{ opacity: isVisible ? 1 : 0 }}
      />
      
      {/* Outer Rotating Dashed Ring Container */}
      <div 
        ref={cursorRingRef}
        className="pointer-events-none fixed top-0 left-0 z-[99] flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ease-out"
        style={{ opacity: isVisible ? 1 : 0 }}
      >
        {/* The rotating dashed border itself */}
        <div 
          className={`absolute inset-0 rounded-full border border-dashed transition-all duration-500 ${
            isHovering 
              ? 'border-[#0074FF] animate-[spin_2s_linear_infinite] shadow-[0_0_20px_rgba(0,116,255,0.5)] opacity-100' 
              : 'border-[#163E70] animate-[spin_8s_linear_infinite] opacity-60'
          }`}
        ></div>
        
        {/* Subtle inner fill when hovering over something clickable */}
        <div className={`absolute inset-0 rounded-full transition-opacity duration-300 ${isHovering ? 'bg-[#0074FF]/10' : 'bg-transparent'}`}></div>
      </div>
    </>
  )
}
