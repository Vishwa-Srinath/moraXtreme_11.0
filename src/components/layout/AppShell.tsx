import Link from "next/link"
import type { ReactNode } from "react"

import { buttonVariants } from "@/components/ui/button"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-backdrop-filter:bg-background/70">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-[clamp(1rem,4vw,3rem)]">
          <Link href="/" className="flex min-w-0 flex-col leading-tight">
            <span className="text-sm font-semibold tracking-[0.22em] uppercase">
              MoraXtreme 11
            </span>
            <span className="text-xs text-muted-foreground">
              12-hour online coding competition
            </span>
          </Link>
          <Link
            href="/"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Home
          </Link>
        </div>
      </header>
      {children}
    </div>
  )
}
