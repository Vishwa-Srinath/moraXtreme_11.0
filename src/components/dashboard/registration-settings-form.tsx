"use client"

import { startTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import Form from "@/components/form/Form"
import { CheckboxInput } from "@/components/form-inputs/Checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { RegistrationAvailability } from "@/lib/registration/settings"

const formSchema = z
  .object({
    openAt: z.string(),
    closeAt: z.string(),
    forceClosed: z.boolean(),
    closedMessage: z.string().trim().min(1, "Enter a closed message.").max(300),
  })
  .refine(
    ({ openAt, closeAt }) =>
      !openAt || !closeAt || Date.parse(closeAt) > Date.parse(openAt),
    {
      message: "Closing time must be after opening time.",
      path: ["closeAt"],
    }
  )

type FormValues = z.infer<typeof formSchema>

function toLocalDateTime(value: string | null) {
  if (!value) return ""

  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export function RegistrationSettingsForm({
  settings,
}: {
  settings: RegistrationAvailability
}) {
  const router = useRouter()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      openAt: toLocalDateTime(settings.openAt),
      closeAt: toLocalDateTime(settings.closeAt),
      forceClosed: settings.forceClosed,
      closedMessage: settings.message,
    },
  })

  async function save(values: FormValues) {
    const response = await fetch("/api/dashboard/registration-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        openAt: values.openAt ? new Date(values.openAt).toISOString() : null,
        closeAt: values.closeAt ? new Date(values.closeAt).toISOString() : null,
      }),
    })
    const result = (await response.json()) as { error?: string }

    if (!response.ok) throw new Error(result.error ?? "Could not save settings")

    toast.success("Registration settings saved")
    startTransition(() => router.refresh())
  }

  return (
    <Form
      form={form}
      className="space-y-6"
      onFinish={(values) =>
        toast.promise(save(values as FormValues), {
          loading: "Saving settings...",
          error: (error) =>
            error instanceof Error ? error.message : "Could not save settings",
        })
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Form.Item
          name="openAt"
          label="Registration opens"
          helperText="Leave blank to allow registration immediately."
        >
          <Input type="datetime-local" />
        </Form.Item>
        <Form.Item
          name="closeAt"
          label="Registration closes"
          helperText="Leave blank to keep registration open indefinitely."
        >
          <Input type="datetime-local" />
        </Form.Item>
      </div>

      <Controller
        control={form.control}
        name="forceClosed"
        render={({ field, fieldState, formState }) => (
          <Form.CustomController
            field={field}
            fieldState={fieldState}
            formState={formState}
          >
            <div className="rounded-lg border bg-muted/30 p-4">
              <CheckboxInput
                field={field}
                label={
                  <span>
                    <span className="block font-medium">
                      Force registration closed
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      Overrides the opening and closing schedule immediately.
                    </span>
                  </span>
                }
              />
            </div>
          </Form.CustomController>
        )}
      />

      <Form.Item
        name="closedMessage"
        label="Closed message"
        helperText="Shown on the registration page whenever registration is unavailable."
      >
        <Textarea rows={4} />
      </Form.Item>

      <div className="flex justify-end border-t pt-6">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Save settings"}
        </Button>
      </div>
    </Form>
  )
}
