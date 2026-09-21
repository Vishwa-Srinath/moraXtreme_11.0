import type { Metadata } from "next"
import Link from "next/link"
import { Code2, ShieldCheck } from "lucide-react"

import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Sign in | MoraXtreme 11",
  description: "Sign in to the MoraXtreme 11 administration dashboard.",
}

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh bg-background lg:grid-cols-[minmax(22rem,0.9fr)_minmax(34rem,1.1fr)]">
      <section className="relative hidden overflow-hidden border-r bg-foreground p-10 text-background lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:3rem_3rem]"
        />
        <Link
          href="/"
          className="relative flex w-fit items-center gap-3 font-semibold tracking-[0.18em] uppercase"
        >
          <span className="grid size-10 place-items-center rounded-xl border border-background/25 bg-background/10">
            <Code2 className="size-5" />
          </span>
          MoraXtreme 11
        </Link>

        <div className="relative max-w-xl pb-8">
          <p className="mb-5 font-mono text-xs tracking-[0.22em] text-background/55 uppercase">
            Admin command center
          </p>
          <h1 className="text-4xl leading-[1.08] font-semibold tracking-[-0.04em] xl:text-6xl">
            Run the competition from one secure workspace.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-background/65">
            Manage registration windows, teams, and event operations for the
            12-hour online coding competition.
          </p>
        </div>

        <div className="relative flex items-center gap-3 border-t border-background/15 pt-6 text-sm text-background/60">
          <ShieldCheck className="size-4" />
          Protected by password and passkey authentication
        </div>
      </section>

      <section className="flex min-h-dvh items-center justify-center px-[clamp(1.25rem,6vw,5rem)] py-10">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-12 flex w-fit items-center gap-3 font-semibold tracking-[0.18em] uppercase lg:hidden"
          >
            <span className="grid size-9 place-items-center rounded-lg bg-foreground text-background">
              <Code2 className="size-4" />
            </span>
            MoraXtreme 11
          </Link>

          <div className="mb-8">
            <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
              Authorized access
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              Welcome back
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Sign in with your administrator account to continue.
            </p>
          </div>

          <LoginForm />

          <p className="mt-8 text-center text-xs leading-5 text-muted-foreground">
            Access is restricted to event administrators. Contact the event
            lead if you need an account.
          </p>
        </div>
      </section>
    </main>
  )
}
