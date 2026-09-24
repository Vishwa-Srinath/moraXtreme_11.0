"use client"

import { startTransition } from "react"
import { MoreHorizontalIcon, Trash2Icon, UsersIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { useModal } from "@/components/modals/useModal"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { RegisteredTeam } from "@/lib/registration/admin"

export function TeamRowActions({ team }: { team: RegisteredTeam }) {
  const router = useRouter()
  const { openModal } = useModal()

  async function deleteTeam() {
    const response = await fetch(
      `/api/dashboard/teams/${encodeURIComponent(team.id)}`,
      { method: "DELETE" }
    )
    const result = (await response.json()) as { error?: string }

    if (!response.ok) {
      throw new Error(result.error ?? "Could not remove the team")
    }

    toast.success(`${team.teamName} has been removed`)
    startTransition(() => router.refresh())
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${team.teamName}`}
          />
        }
      >
        <MoreHorizontalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48" align="end">
        <DropdownMenuItem onClick={() => openModal("teamMembers", { team })}>
          <UsersIcon />
          View members
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() =>
            openModal("confirm", {
              title: `Remove ${team.teamName}?`,
              description:
                "This permanently removes the team and all of its member records. This action cannot be undone.",
              confirmLabel: "Remove team",
              variant: "destructive",
              onConfirm: deleteTeam,
            })
          }
        >
          <Trash2Icon />
          Remove team
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
