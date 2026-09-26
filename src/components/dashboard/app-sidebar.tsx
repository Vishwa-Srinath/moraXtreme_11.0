"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  KeyRoundIcon,
  LayoutDashboardIcon,
  LoaderCircleIcon,
  LogOutIcon,
  Settings2Icon,
  UserCogIcon,
  UsersIcon,
} from "lucide-react"
import { toast } from "sonner"

import { useModal } from "@/components/modals/useModal"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"

const navigation = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboardIcon },
  { title: "Settings", href: "/dashboard/settings", icon: Settings2Icon },
  { title: "Teams", href: "/dashboard/teams", icon: UsersIcon },
  { title: "Users", href: "/dashboard/users", icon: UserCogIcon },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { openModal } = useModal()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function signOut() {
    setIsSigningOut(true)

    try {
      const { error } = await authClient.signOut()

      if (error) {
        toast.error(error.message || "Unable to log out. Please try again.")
        return
      }

      router.replace("/login")
      router.refresh()
    } catch {
      toast.error("Unable to log out. Please try again.")
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="MoraXtreme 11"
              render={<Link href="/dashboard" />}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-foreground text-background">
                <span className="font-mono text-xs font-bold">MX</span>
              </div>
              <div className="min-w-0 leading-tight">
                <span className="block truncate font-semibold">
                  MoraXtreme 11
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  Command center
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={
                      pathname === item.href ||
                      (item.href !== "/dashboard" &&
                        pathname.startsWith(`${item.href}/`))
                    }
                    tooltip={item.title}
                    render={<Link href={item.href} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Change password"
              onClick={() => openModal("changePassword", {})}
            >
              <KeyRoundIcon />
              <span>Change password</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              disabled={isSigningOut}
              tooltip="Log out"
              onClick={() => void signOut()}
            >
              {isSigningOut ? (
                <LoaderCircleIcon className="animate-spin" />
              ) : (
                <LogOutIcon />
              )}
              <span>{isSigningOut ? "Logging out..." : "Log out"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
