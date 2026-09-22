"use client"

import { usePathname } from "next/navigation"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const titles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/settings": "Registration settings",
  "/dashboard/teams": "Registered teams",
  "/dashboard/users": "User management",
}

export function DashboardHeader() {
  const pathname = usePathname()

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b px-4 md:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />
      <h1 className="text-sm font-medium">{titles[pathname] ?? "Dashboard"}</h1>
    </header>
  )
}
