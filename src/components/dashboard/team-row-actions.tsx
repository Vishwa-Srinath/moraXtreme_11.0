"use client"

import { MoreHorizontalIcon, UsersIcon } from "lucide-react"

import { useModal } from "@/components/modals/useModal"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { RegisteredTeam } from "@/lib/registration/admin"

export function TeamRowActions({ team }: { team: RegisteredTeam }) {
  const { openModal } = useModal()

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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
