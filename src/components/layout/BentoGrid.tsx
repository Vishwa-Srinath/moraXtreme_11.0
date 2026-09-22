import type { ComponentPropsWithoutRef } from "react"

import { cn } from "@/lib/utils"

export function BentoGrid({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "@container grid gap-[clamp(0.75rem,2vw,1.5rem)] @2xl:grid-cols-2 @5xl:grid-cols-3",
        className
      )}
      {...props}
    />
  )
}
