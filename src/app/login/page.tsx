import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react"

import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Sign in | MoraXtreme 11",
  description: "Sign in to the MoraXtreme 11 administration dashboard.",
}

export default function LoginPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-black text-white selection:bg-[#0074FF]/40">
      <div
        aria-hidden="true"
        className="absolute inset-0 [background-image:linear-gradient(to_right,#163E70_1px,transparent_1px),linear-gradient(to_bottom,#163E70_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_80%_75%_at_50%_50%,#000_35%,transparent_100%)] [background-size:4rem_4rem] opacity-20"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_48%,rgba(0,116,255,0.2),transparent_31%),radial-gradient(circle_at_82%_25%,rgba(22,62,112,0.16),transparent_25%)]"
      />
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#0074FF] to-transparent shadow-[0_0_20px_#0074FF]"
      />

      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 sm:px-8 lg:px-12 lg:py-7">
        <Link
          href="/"
          aria-label="MoraXtreme home"
          className="transition-opacity hover:opacity-80"
        >
          <Image
            src="/logo.png"
            alt="MoraXtreme 11.0"
            width={120}
            height={48}
            className="h-auto w-24 object-contain sm:w-28"
            priority
          />
        </Link>
        <Link
          href="/"
          className="group flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.2em] text-neutral-400 uppercase transition-colors hover:text-white sm:text-xs"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
          Back to event
        </Link>
      </header>

      <div className="relative z-10 mx-auto grid min-h-dvh w-full max-w-7xl items-center gap-12 px-5 pt-28 pb-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(26rem,0.72fr)] lg:px-12 lg:pt-32 lg:pb-16">
        <section className="relative hidden min-h-[34rem] flex-col justify-center lg:flex">
          <video
            src="/earth.webm"
            aria-hidden="true"
            autoPlay
            loop
            muted
            playsInline
            className="pointer-events-none absolute top-1/2 -left-40 w-[44rem] -translate-y-1/2 object-contain opacity-45 mix-blend-screen"
            style={{ backgroundColor: '#000' }}
          />

          <div className="relative z-10 max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-[#163E70] bg-black/60 px-4 py-2 font-mono text-[10px] font-bold tracking-[0.24em] text-[#0074FF] uppercase backdrop-blur-md">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#0074FF] opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-[#0074FF]" />
              </span>
              Admin command center
            </div>
            <h1 className="font-[family-name:var(--font-space)] text-5xl leading-[1.02] font-bold tracking-[-0.045em] text-white xl:text-7xl">
              Competition control,
              <span className="block bg-gradient-to-r from-[#0074FF] via-[#4da0ff] to-white bg-clip-text text-transparent">
                secured.
              </span>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-neutral-400 xl:text-lg">
              Manage registrations, teams, and event operations for South
              Asia&apos;s next generation of competitive programmers.
            </p>
          </div>

          <div className="relative z-10 mt-14 flex max-w-lg items-center gap-4 border-t border-[#163E70]/60 pt-5">
            <span className="grid size-9 place-items-center rounded-full border border-[#0074FF]/30 bg-[#0074FF]/10 text-[#0074FF]">
              <ShieldCheck className="size-4" />
            </span>
            <div>
              <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-white uppercase">
                Secure access protocol
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Password authentication enabled
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#030710]/80 p-6 shadow-[0_0_80px_rgba(0,116,255,0.16)] backdrop-blur-2xl sm:p-9">
            <div
              aria-hidden="true"
              className="absolute top-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#0074FF] to-transparent shadow-[0_0_16px_#0074FF]"
            />
            <div
              aria-hidden="true"
              className="absolute -top-28 left-1/2 size-64 -translate-x-1/2 rounded-full bg-[#0074FF]/10 blur-3xl"
            />

            <div className="relative mb-8">
              <span className="mb-6 grid size-11 place-items-center rounded-xl border border-[#0074FF]/30 bg-[#0074FF]/10 text-[#0074FF] shadow-[0_0_20px_rgba(0,116,255,0.16)]">
                <LockKeyhole className="size-5" />
              </span>
              <p className="font-mono text-[10px] font-bold tracking-[0.25em] text-[#0074FF] uppercase">
                Authorized access only
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-space)] text-3xl font-bold tracking-[-0.035em] text-white sm:text-4xl">
                Welcome back
              </h2>
              <p className="mt-3 text-sm leading-6 text-neutral-400">
                Sign in with your administrator account to continue.
              </p>
            </div>

            <div className="relative">
              <LoginForm />
            </div>

            <p className="relative mt-7 border-t border-white/8 pt-6 text-center text-[11px] leading-5 text-neutral-500">
              Restricted to event administrators. Contact the event lead for
              account access.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
