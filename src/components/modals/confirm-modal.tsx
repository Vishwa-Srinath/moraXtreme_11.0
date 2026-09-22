"use client"

import { useState } from "react"

import type { ModalComponentProps } from "./modal-registry"
import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export type ConfirmModalData = {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "default" | "destructive"
  onConfirm: () => void | Promise<void>
}

export function ConfirmModal({
  data,
  closeModal,
}: ModalComponentProps<ConfirmModalData>) {
  const [isPending, setIsPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function confirm() {
    setIsPending(true)
    setErrorMessage(null)

    try {
      await data.onConfirm()
      closeModal()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The action could not be completed."
      )
      setIsPending(false)
    }
  }

  return (
    <DialogContent showCloseButton={!isPending}>
      <DialogHeader>
        <DialogTitle>{data.title}</DialogTitle>
        {data.description ? (
          <DialogDescription>{data.description}</DialogDescription>
        ) : null}
      </DialogHeader>

      {errorMessage ? (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}

      <DialogFooter>
        <Button variant="outline" disabled={isPending} onClick={closeModal}>
          {data.cancelLabel ?? "Cancel"}
        </Button>
        <Button
          variant={data.variant ?? "default"}
          disabled={isPending}
          onClick={() => void confirm()}
        >
          {isPending ? "Please wait..." : (data.confirmLabel ?? "Confirm")}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
