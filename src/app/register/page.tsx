import Link from "next/link"
import { connection } from "next/server"

import { buttonVariants } from "@/components/ui/button"
import { getRegistrationAvailability } from "@/lib/registration/settings"

import { RegistrationWizard } from "./registration-wizard"

export default async function RegisterPage() {
  await connection()

  const availability = await getRegistrationAvailability()
  const whatsappGroupUrl = process.env.WHATSAPP_GROUP_URL ?? ""

  return (
    <main className="flex min-h-dvh w-full flex-col bg-background text-foreground">
      {availability.isOpen ? (
        <RegistrationWizard whatsappGroupUrl={whatsappGroupUrl} />
      ) : (
        <div className="mx-auto mt-12 mb-12 max-w-2xl rounded-2xl border bg-card p-[clamp(1.5rem,4vw,3rem)] text-card-foreground shadow-sm">
          <p className="text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">
            MoraXtreme 11 Registration
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Registration is not open right now.
          </h1>
          <p className="mt-3 text-muted-foreground">{availability.message}</p>
          <Link
            href="/"
            className={buttonVariants({
              variant: "outline",
              className: "mt-8",
            })}
          >
            Back to home
          </Link>
        </div>
      )}
    </main>
  )
}
