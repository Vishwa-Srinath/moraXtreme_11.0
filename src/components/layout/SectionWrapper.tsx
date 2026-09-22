import type { ComponentPropsWithoutRef } from "react"

import { cn } from "@/lib/utils"

export function SectionWrapper({
  className,
  ...props
}: ComponentPropsWithoutRef<"section">) {
  return (
    <section
      className={cn("py-[clamp(2rem,6vw,5rem)]", className)}
      {...props}
    />
  )
}
