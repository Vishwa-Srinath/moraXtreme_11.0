// components/LoaderContainer.tsx
"use client"

import type { LucideIcon } from "lucide-react"
import { Loader2 } from "lucide-react"

type LoaderContainerProps = {
  /** Optional message under the icon */
  message?: string
  /** Swap the default Loader2 with any Lucide icon */
  Icon?: LucideIcon
  /** Extra classes for the outer container */
  className?: string
}

export default function FullSizeLoader({
  message = "Loading…",
  Icon = Loader2,
  className = "",
}: LoaderContainerProps) {
  return (
    <div
      role="status"
      aria-label={message}
      className={`flex h-full min-h-screen w-full items-center justify-center ${className}`}
    >
      <div className="flex flex-col items-center gap-3">
        <Icon
          className="h-8 w-8 animate-spin text-gray-600"
          aria-hidden="true"
        />
        {message && <p className="text-sm text-gray-500">{message}</p>}
      </div>
      <span className="sr-only">{message}</span>
    </div>
  )
}
