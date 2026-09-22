"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { KeyRound, LoaderCircle, LogIn } from "lucide-react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import Form from "@/components/form/Form"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
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
  const [isPasskeyPending, setIsPasskeyPending] = useState(false)
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  })

  const isPasswordPending = form.formState.isSubmitting
  const isPending = isPasswordPending || isPasskeyPending

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

  async function signInWithPasskey() {
    setErrorMessage(null)
    setIsPasskeyPending(true)

    try {
      const { error } = await authClient.signIn.passkey({ autoFill: false })

      if (error) {
        setErrorMessage(
          error.message || "Passkey authentication was not completed."
        )
        return
      }

      finishSignIn()
    } catch {
      setErrorMessage("Passkey authentication was not completed.")
    } finally {
      setIsPasskeyPending(false)
    }
  }

  return (
    <div className="space-y-6">
      <Form
        form={form}
        onFinish={(values) => signInWithPassword(values as LoginValues)}
        className="space-y-1"
      >
        <Form.Item name="email" label="Email address">
          <Input
            type="email"
            autoComplete="username webauthn"
            placeholder="admin@example.com"
            className="h-11"
          />
        </Form.Item>

        <Form.Item name="password" label="Password">
          <Input
            type="password"
            autoComplete="current-password webauthn"
            placeholder="Enter your password"
            className="h-11"
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
              />
              <Label
                htmlFor="remember-me"
                className="text-sm font-normal text-muted-foreground"
              >
                Keep me signed in
              </Label>
            </div>
          )}
        />

        {errorMessage ? (
          <p
            role="alert"
            className="mb-4 rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          >
            {errorMessage}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="h-11 w-full"
          disabled={isPending}
        >
          {isPasswordPending ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <LogIn />
          )}
          {isPasswordPending ? "Signing in..." : "Sign in"}
        </Button>
      </Form>

      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          or
        </span>
        <Separator className="flex-1" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-11 w-full"
        disabled={isPending}
        onClick={signInWithPasskey}
      >
        {isPasskeyPending ? (
          <LoaderCircle className="animate-spin" />
        ) : (
          <KeyRound />
        )}
        {isPasskeyPending ? "Waiting for passkey..." : "Sign in with a passkey"}
      </Button>
    </div>
  )
}
