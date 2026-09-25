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
  role: z.enum(["user", "admin"]),
})

type CreateUserValues = z.infer<typeof createUserSchema>

export function CreateUserModal({
  closeModal,
}: ModalComponentProps<Record<string, never>>) {
  const router = useRouter()
  const form = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", email: "", password: "", role: "user" },
  })

  async function createUser(values: CreateUserValues) {
    const { error } = await authClient.admin.createUser(values)
    if (error) throw new Error(error.message)

    toast.success("User created")
    closeModal()
    startTransition(() => router.refresh())
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create user</DialogTitle>
        <DialogDescription>
          Add a user with password credentials and an initial role.
        </DialogDescription>
      </DialogHeader>

      <Form
        id="create-user-form"
        form={form}
        className="space-y-4"
        onFinish={(values) =>
          void toast.promise(createUser(values as CreateUserValues), {
            loading: "Creating user...",
            error: (error) =>
              error instanceof Error ? error.message : "Could not create user",
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
        <Form.Item name="role" label="Role">
          <select className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
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
          {form.formState.isSubmitting ? "Creating..." : "Create user"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
