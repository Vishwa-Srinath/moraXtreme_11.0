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

    try {
      const { error } = await authClient.admin.setRole({
        userId: user.id,
        role,
      })
      if (error) throw new Error(error.message)

      toast.success(
        `${user.name} is now ${role === "admin" ? "an admin" : "a user"}`
      )
      startTransition(() => router.refresh())
    } finally {
      setIsUpdating(false)
    }
  }

  function confirmRoleChange(role: "user" | "admin") {
    if ((user.role ?? "user") === role) return

    openModal("confirm", {
      title: `Change ${user.name}'s role?`,
      description: `This will change the account role from ${user.role ?? "user"} to ${role}.`,
      confirmLabel: `Change to ${role}`,
      onConfirm: () => setRole(role),
    })
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
      <DropdownMenuContent className="w-48" align="end">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <ShieldCheckIcon />
            Change role
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuCheckboxItem
              checked={(user.role ?? "user") === "user"}
              disabled={(user.role ?? "user") === "user"}
              onClick={() => confirmRoleChange("user")}
            >
              User
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={user.role === "admin"}
              disabled={user.role === "admin"}
              onClick={() => confirmRoleChange("admin")}
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
