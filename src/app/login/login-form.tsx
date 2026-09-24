"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle, LogIn } from "lucide-react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import Form from "@/components/form/Form"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
  rememberMe: z.boolean(),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  })

  const isPasswordPending = form.formState.isSubmitting

  function finishSignIn() {
    router.replace("/dashboard")
    router.refresh()
  }

  async function signInWithPassword(values: LoginValues) {
    setErrorMessage(null)

    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      rememberMe: values.rememberMe,
    })

    if (error) {
      setErrorMessage(error.message || "Unable to sign in. Please try again.")
      return
    }

    finishSignIn()
  }

  return (
    <Form
      form={form}
      onFinish={(values) => signInWithPassword(values as LoginValues)}
      className="space-y-1"
    >
      <Form.Item
        name="email"
        label="Email address"
        className="[&_[data-slot=label]]:font-mono [&_[data-slot=label]]:text-xs [&_[data-slot=label]]:font-bold [&_[data-slot=label]]:tracking-[0.12em] [&_[data-slot=label]]:text-neutral-300 [&_[data-slot=label]]:uppercase [&>p]:text-neutral-500"
      >
        <Input
          type="email"
          autoComplete="username"
          placeholder="admin@example.com"
          className="h-12 rounded-xl border-[#163E70]/70 bg-black/40 px-4 text-white shadow-none placeholder:text-neutral-600 focus-visible:border-[#0074FF] focus-visible:shadow-[0_0_18px_rgba(0,116,255,0.18)] focus-visible:ring-[#0074FF]/20"
        />
      </Form.Item>

      <Form.Item
        name="password"
        label="Password"
        className="[&_[data-slot=label]]:font-mono [&_[data-slot=label]]:text-xs [&_[data-slot=label]]:font-bold [&_[data-slot=label]]:tracking-[0.12em] [&_[data-slot=label]]:text-neutral-300 [&_[data-slot=label]]:uppercase [&>p]:text-neutral-500"
      >
        <Input
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          className="h-12 rounded-xl border-[#163E70]/70 bg-black/40 px-4 text-white shadow-none placeholder:text-neutral-600 focus-visible:border-[#0074FF] focus-visible:shadow-[0_0_18px_rgba(0,116,255,0.18)] focus-visible:ring-[#0074FF]/20"
        />
      </Form.Item>

      <Controller
        control={form.control}
        name="rememberMe"
        render={({ field }) => (
          <div className="flex items-center gap-2.5 pb-5">
            <Checkbox
              id="remember-me"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              onBlur={field.onBlur}
              ref={field.ref}
              className="border-[#163E70] bg-black/50 text-white focus-visible:border-[#0074FF] focus-visible:ring-[#0074FF]/20 data-checked:border-[#0074FF] data-checked:bg-[#0074FF]"
            />
            <Label
              htmlFor="remember-me"
              className="text-xs font-normal text-neutral-400"
            >
              Keep me signed in
            </Label>
          </div>
        )}
      />

      {errorMessage ? (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-sm text-red-300"
        >
          {errorMessage}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full rounded-xl bg-[#0074FF] font-[family-name:var(--font-space)] font-bold tracking-[0.08em] text-white shadow-[0_0_24px_rgba(0,116,255,0.28)] hover:bg-[#2488ff] hover:shadow-[0_0_32px_rgba(0,116,255,0.42)]"
        disabled={isPasswordPending}
      >
        {isPasswordPending ? (
          <LoaderCircle className="animate-spin" />
        ) : (
          <LogIn />
        )}
        {isPasswordPending ? "Signing in..." : "Sign in"}
      </Button>
    </Form>
  )
}
