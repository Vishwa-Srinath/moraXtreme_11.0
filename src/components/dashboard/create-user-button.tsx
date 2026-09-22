"use client"

import { UserPlusIcon } from "lucide-react"

import { useModal } from "@/components/modals/useModal"
import { Button } from "@/components/ui/button"

export function CreateUserButton() {
  const { openModal } = useModal()

  return (
    <Button onClick={() => openModal("createUser", {})}>
      <UserPlusIcon />
      Create user
    </Button>
  )
}
