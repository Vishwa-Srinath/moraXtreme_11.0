"use client"

import { startTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import type { ModalComponentProps } from "./modal-registry"
import Form from "@/components/form/Form"
import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"

type BanUserData = { user: { id: string; name: string } }
type BanUserValues = { reason: string }

export function BanUserModal({
  data,
  closeModal,
}: ModalComponentProps<BanUserData>) {
  const router = useRouter()
  const form = useForm<BanUserValues>({ defaultValues: { reason: "" } })

  async function banUser({ reason }: BanUserValues) {
    const { error } = await authClient.admin.banUser({
      userId: data.user.id,
      banReason: reason.trim() || undefined,
    })
    if (error) throw new Error(error.message)

    toast.success(`${data.user.name} has been banned`)
    closeModal()
    startTransition(() => router.refresh())
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Ban {data.user.name}?</DialogTitle>
        <DialogDescription>
          This prevents sign-in and immediately revokes all active sessions.
        </DialogDescription>
      </DialogHeader>

      <Form
        id="ban-user-form"
        form={form}
        onFinish={(values) =>
          void toast.promise(banUser(values as BanUserValues), {
            loading: "Banning user...",
            error: (error) =>
              error instanceof Error ? error.message : "Could not ban user",
          })
        }
      >
        <Form.Item
          name="reason"
          label="Reason"
          helperText="Optional. This is stored with the user's account."
        >
          <Input placeholder="Reason for the ban" />
        </Form.Item>
      </Form>

      <DialogFooter>
        <Button variant="outline" onClick={closeModal}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="ban-user-form"
          variant="destructive"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Banning..." : "Ban user"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
