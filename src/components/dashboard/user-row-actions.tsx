"use client"

import { startTransition, useState } from "react"
import { BanIcon, MoreHorizontalIcon, ShieldCheckIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { useModal } from "@/components/modals/useModal"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authClient } from "@/lib/auth-client"

export type ManagedUser = {
  id: string
  name: string
  role?: string | null
  banned?: boolean | null
}

export function UserRowActions({ user }: { user: ManagedUser }) {
  const router = useRouter()
  const { openModal } = useModal()
  const [isUpdating, setIsUpdating] = useState(false)

  async function setRole(role: "user" | "admin") {
    if (user.role === role) return
    setIsUpdating(true)
    const { error } = await authClient.admin.setRole({ userId: user.id, role })
    setIsUpdating(false)

    if (error) throw new Error(error.message)
    startTransition(() => router.refresh())
  }

  async function unbanUser() {
    setIsUpdating(true)
    const { error } = await authClient.admin.unbanUser({ userId: user.id })
    setIsUpdating(false)

    if (error) throw new Error(error.message)
    startTransition(() => router.refresh())
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isUpdating}
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${user.name}`}
          />
        }
      >
        <MoreHorizontalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <ShieldCheckIcon />
            Change role
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuCheckboxItem
              checked={(user.role ?? "user") === "user"}
              onClick={() =>
                void toast.promise(setRole("user"), {
                  loading: "Changing role...",
                  success: "Role changed to user",
                  error: (error) =>
                    error instanceof Error
                      ? error.message
                      : "Could not change role",
                })
              }
            >
              User
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={user.role === "admin"}
              onClick={() =>
                void toast.promise(setRole("admin"), {
                  loading: "Changing role...",
                  success: "Role changed to admin",
                  error: (error) =>
                    error instanceof Error
                      ? error.message
                      : "Could not change role",
                })
              }
            >
              Admin
            </DropdownMenuCheckboxItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        {user.banned ? (
          <DropdownMenuItem
            onClick={() =>
              void toast.promise(unbanUser(), {
                loading: "Unbanning user...",
                success: `${user.name} can sign in again`,
                error: (error) =>
                  error instanceof Error
                    ? error.message
                    : "Could not unban user",
              })
            }
          >
            <ShieldCheckIcon />
            Unban user
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            variant="destructive"
            onClick={() => openModal("banUser", { user })}
          >
            <BanIcon />
            Ban user
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
