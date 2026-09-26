"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ExternalLink, MessageCircle } from "lucide-react"
import { useEffect, useRef, useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import Image from "next/image"
import Link from "next/link"
import Form from "@/components/form/Form"
import { REGISTRATION_STORAGE_KEY } from "@/lib/registration/constants"
import {
  defaultRegistrationValues,
  registrationSchema,
  type RegistrationValues,
  type SubmittedRegistration,
} from "@/lib/registration/schema"

import {
  getRegistrationSteps,
  STEP_FIELDS,
  type StepId,
} from "./_components/registration-config"
import { RegistrationStepContent } from "./_components/registration-steps"
import { ProgressLine, WizardFooter } from "./_components/registration-ui"

async function readResponse<T>(response: Response): Promise<T> {
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Request failed")
  }

  return data
}

export function RegistrationWizard() {
  const form = useForm<RegistrationValues, unknown, RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: defaultRegistrationValues,
    mode: "onBlur",
  })

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [highestStepIndex, setHighestStepIndex] = useState(0)
  const [stepError, setStepError] = useState<string | null>(null)
  const [submittedRegistration, setSubmittedRegistration] =
    useState<SubmittedRegistration | null>(null)
  const [isPending, startTransition] = useTransition()
  const hasHydrated = useRef(false)
  const resetForm = form.reset
  const subscribeToForm = form.watch

  const values = form.watch()
  const steps = getRegistrationSteps(Number(values.teamSize) || 1)
  const currentStep = steps[currentStepIndex] ?? steps[0]

  useEffect(() => {
    if (hasHydrated.current) return
    hasHydrated.current = true

    const stored = window.localStorage.getItem(REGISTRATION_STORAGE_KEY)

    if (stored) {
      try {
        resetForm({ ...defaultRegistrationValues, ...JSON.parse(stored) })
      } catch {
        window.localStorage.removeItem(REGISTRATION_STORAGE_KEY)
      }
    }
  }, [resetForm])

  useEffect(() => {
    const subscription = subscribeToForm((draft) => {
      if (!hasHydrated.current) return

      // Drafts stay in this browser only; the server stores a team on submit.
      window.localStorage.setItem(
        REGISTRATION_STORAGE_KEY,
        JSON.stringify(draft)
      )
    })

    return () => subscription.unsubscribe()
  }, [subscribeToForm])

  useEffect(() => {
    if (currentStepIndex >= steps.length) {
      setCurrentStepIndex(steps.length - 1)
    }
  }, [currentStepIndex, steps.length])

  async function validateCurrentStep() {
    if (currentStep.id === "review") return true

    setStepError(null)
    return form.trigger(STEP_FIELDS[currentStep.id], { shouldFocus: true })
  }

  async function goNext() {
    const valid = await validateCurrentStep()
    if (!valid) return

    const nextIndex = Math.min(currentStepIndex + 1, steps.length - 1)
    setCurrentStepIndex(nextIndex)
    setHighestStepIndex((value) => Math.max(value, nextIndex))
  }

  function goBack() {
    setStepError(null)
    setCurrentStepIndex((index) => Math.max(index - 1, 0))
  }

  function jumpToStep(index: number) {
    if (index > highestStepIndex) return

    setStepError(null)
    setCurrentStepIndex(index)
  }

  function editStep(stepId: StepId) {
    const stepIndex = steps.findIndex((step) => step.id === stepId)
    if (stepIndex >= 0) setCurrentStepIndex(stepIndex)
  }

  function submit() {
    setStepError(null)
    startTransition(async () => {
      const handleSubmit = form.handleSubmit(async (data) => {
        const response = await fetch("/api/register/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        const { registration } = await readResponse<{
          registration: SubmittedRegistration
        }>(response)

        setSubmittedRegistration(registration)
        window.localStorage.removeItem(REGISTRATION_STORAGE_KEY)
      })

      try {
        await handleSubmit()
      } catch (error) {
        setStepError(
          error instanceof Error ? error.message : "Submission failed"
        )
      }
    })
  }

  return (
    <div className="flex min-h-dvh w-full flex-col lg:flex-row">
      <aside className="relative flex w-full shrink-0 flex-col justify-center overflow-hidden border-r border-[#163E70]/30 bg-[#000000] p-8 text-white lg:w-[40%] lg:p-16 xl:w-[45%]">
        <div className="absolute top-6 left-6 z-40">
          <Link
            href="/"
            className="inline-flex h-9 items-center justify-center rounded-md border border-white/20 bg-transparent px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          >
            Home
          </Link>
        </div>
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,116,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,116,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
          <div className="absolute top-[10%] left-[20%] z-10 h-96 w-96 rounded-full bg-[#0074FF] opacity-10 mix-blend-screen blur-[150px] filter" />
        </div>

        <div className="relative z-30 mt-16 space-y-6 lg:mt-0">
          <p className="text-sm font-bold tracking-[0.25em] text-[#0074FF] uppercase drop-shadow-md">
            Register your team
          </p>
          <Image
            src="/logo.png"
            alt="MoraXtreme 11 Logo"
            width={420}
            height={150}
            className="mb-4"
          />
          <p className="mt-4 font-mono text-xl tracking-widest text-white/90 uppercase">
            while seats are available !
          </p>
          <div className="my-10 h-[2px] w-24 bg-[#0074FF] shadow-[0_0_15px_#0074FF]"></div>
          <p className="max-w-xl text-lg leading-relaxed text-neutral-300 drop-shadow-sm">
            A focused registration flow for the 12-hour online competition. The
            group leader should complete this form for the full team.
          </p>
        </div>
      </aside>

      <div className="dark relative flex w-full flex-1 flex-col items-center justify-center overflow-y-auto bg-[#000000] p-6 sm:p-10 lg:p-16">
        <div className="relative z-10 mx-auto w-full max-w-4xl">
          {submittedRegistration ? (
            <div className="relative overflow-hidden rounded-2xl border border-[#163E70]/50 bg-[#030710] p-[clamp(1.75rem,5vw,4rem)] text-center text-white shadow-[0_0_40px_rgba(0,116,255,0.12)]">
              <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#0074FF]/20 blur-[120px]" />
              <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center">
                <div className="flex size-16 items-center justify-center rounded-full border border-[#0074FF]/60 bg-[#0074FF]/15 shadow-[0_0_30px_rgba(0,116,255,0.3)]">
                  <Check className="size-8 text-[#0074FF]" strokeWidth={3} />
                </div>
                <p className="mt-7 text-xs font-bold tracking-[0.24em] text-[#0074FF] uppercase">
                  Registration complete
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Welcome, {submittedRegistration.teamName}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-neutral-400">
                  Your team is registered for MoraXtreme 11. Join the official
                  WhatsApp group for competition updates and announcements.
                </p>

                <div className="mt-7 rounded-lg border border-[#163E70]/50 bg-[#060d1a] px-5 py-3">
                  <p className="text-xs tracking-wider text-neutral-500 uppercase">
                    Registration code
                  </p>
                  <p className="mt-1 font-mono text-lg font-bold tracking-[0.16em] text-white">
                    {submittedRegistration.registrationCode}
                  </p>
                </div>

                <a
                  href={submittedRegistration.whatsappGroupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#0074FF] px-6 text-sm font-bold text-white shadow-[0_0_24px_rgba(0,116,255,0.28)] transition-colors hover:bg-[#1680ff] focus-visible:ring-2 focus-visible:ring-[#0074FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030710] focus-visible:outline-none sm:w-auto"
                >
                  <MessageCircle className="size-5" />
                  Join WhatsApp group
                  <ExternalLink className="size-4 opacity-70" />
                </a>
              </div>
            </div>
          ) : (
            <>
              <ProgressLine
                steps={steps}
                currentStepIndex={currentStepIndex}
                highestStepIndex={highestStepIndex}
                onJump={jumpToStep}
              />

              <Form
                form={form}
                className="@container mt-12"
                onFinish={() => undefined}
              >
                <div className="overflow-hidden rounded-2xl border border-[#163E70]/40 bg-[#030710] text-white shadow-xl transition-all duration-500 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  <div className="relative overflow-hidden border-b border-[#163E70]/40 bg-[#060d1a] px-[clamp(1.5rem,3vw,2.5rem)] py-4">
                    <div className="pointer-events-none absolute -top-20 -right-20 h-96 w-96 rounded-full bg-[#0074FF] opacity-20 mix-blend-screen blur-[100px] filter"></div>
                    <div className="relative z-10 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <div>
                        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                          {currentStep.title}
                        </h2>
                        <p className="mt-1 text-sm text-neutral-400">
                          {currentStep.description}
                        </p>
                      </div>
                      <span className="inline-block shrink-0 self-start rounded bg-[#0074FF] px-3 py-1 text-xs font-bold tracking-wider text-white sm:self-auto">
                        STEP 0{currentStepIndex + 1} OF 0{steps.length}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#030710] p-[clamp(1.5rem,3vw,2.5rem)]">
                    {stepError && (
                      <div className="mb-6 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {stepError}
                      </div>
                    )}

                    <RegistrationStepContent
                      step={currentStep}
                      form={form}
                      values={values}
                      steps={steps}
                      onEdit={editStep}
                    />
                  </div>

                  <div className="border-t border-[#163E70]/40 bg-[#030710] p-[clamp(1rem,3vw,2rem)]">
                    <WizardFooter
                      currentStepId={currentStep.id}
                      currentStepIndex={currentStepIndex}
                      isPending={isPending}
                      onBack={goBack}
                      onNext={goNext}
                      onSubmit={submit}
                    />
                  </div>
                </div>
              </Form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
