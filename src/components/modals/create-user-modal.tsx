"use client"

import { startTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
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

const createUserSchema = z.object({
  name: z.string().trim().min(1, "Enter the user's name."),
  email: z.email("Enter a valid email address."),
  password: z.string().min(12, "Password must be at least 12 characters."),
})

type CreateUserValues = z.infer<typeof createUserSchema>

export function CreateUserModal({
  closeModal,
}: ModalComponentProps<Record<string, never>>) {
  const router = useRouter()
  const form = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", email: "", password: "" },
  })

  // Only admins can use the dashboard, so every account created here is one.
  async function createUser(values: CreateUserValues) {
    const { error } = await authClient.admin.createUser({
      ...values,
      role: "admin",
    })
    if (error) throw new Error(error.message)

    toast.success("Admin created")
    closeModal()
    startTransition(() => router.refresh())
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create admin</DialogTitle>
        <DialogDescription>
          Add an admin with a temporary password. Share it privately; they can
          replace it from &quot;Change password&quot; in the sidebar after
          logging in.
        </DialogDescription>
      </DialogHeader>

      <Form
        id="create-user-form"
        form={form}
        className="space-y-4"
        onFinish={(values) =>
          void toast.promise(createUser(values as CreateUserValues), {
            loading: "Creating admin...",
            error: (error) =>
              error instanceof Error ? error.message : "Could not create admin",
          })
        }
      >
        <Form.Item name="name" label="Name">
          <Input autoComplete="name" placeholder="Jane Doe" />
        </Form.Item>
        <Form.Item name="email" label="Email">
          <Input
            type="email"
            autoComplete="email"
            placeholder="jane@example.com"
          />
        </Form.Item>
        <Form.Item name="password" label="Temporary password">
          <Input type="password" autoComplete="new-password" />
        </Form.Item>
      </Form>

      <DialogFooter>
        <Button variant="outline" onClick={closeModal}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="create-user-form"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Creating..." : "Create admin"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
