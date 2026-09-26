"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

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

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z
      .string()
      .min(12, "Password must be at least 12 characters.")
      .max(128, "Password must be at most 128 characters."),
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    path: ["newPassword"],
    message: "Choose a password different from the current one.",
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  })

type ChangePasswordValues = z.infer<typeof changePasswordSchema>

export function ChangePasswordModal({
  closeModal,
}: ModalComponentProps<Record<string, never>>) {
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  // Signing out other sessions means anyone who knew the temporary password
  // loses access as soon as it is replaced.
  async function changePassword(values: ChangePasswordValues) {
    const { error } = await authClient.changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      revokeOtherSessions: true,
    })
    if (error) throw new Error(error.message)

    toast.success("Password changed")
    closeModal()
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Change password</DialogTitle>
        <DialogDescription>
          Your other devices will be logged out.
        </DialogDescription>
      </DialogHeader>

      <Form
        id="change-password-form"
        form={form}
        className="space-y-4"
        onFinish={(values) =>
          void toast.promise(changePassword(values as ChangePasswordValues), {
            loading: "Changing password...",
            error: (error) =>
              error instanceof Error
                ? error.message
                : "Could not change password",
          })
        }
      >
        <Form.Item name="currentPassword" label="Current password">
          <Input type="password" autoComplete="current-password" />
        </Form.Item>
        <Form.Item name="newPassword" label="New password">
          <Input type="password" autoComplete="new-password" />
        </Form.Item>
        <Form.Item name="confirmPassword" label="Confirm new password">
          <Input type="password" autoComplete="new-password" />
        </Form.Item>
      </Form>

      <DialogFooter>
        <Button variant="outline" onClick={closeModal}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="change-password-form"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Changing..." : "Change password"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
