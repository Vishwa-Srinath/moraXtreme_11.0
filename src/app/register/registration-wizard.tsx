"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ExternalLink, MessageCircle } from "lucide-react"
import { useEffect, useRef, useState, useTransition } from "react"
import { useForm, type FieldErrors, type FieldPath } from "react-hook-form"

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
  getResumeStepIndex,
  STEP_FIELDS,
  type StepId,
} from "./_components/registration-config"
import { RegistrationStepContent } from "./_components/registration-steps"
import { ProgressLine, WizardFooter } from "./_components/registration-ui"

const STEP_STORAGE_KEY = `${REGISTRATION_STORAGE_KEY}:step`

type ServerFieldError = { path: string; message: string }

/** A failed request, with per-field details when the server provides them. */
class RequestError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: ServerFieldError[] = []
  ) {
    super(message)
  }
}

async function readResponse<T>(response: Response): Promise<T> {
  const data = await response.json()

  if (!response.ok) {
    throw new RequestError(data.error || "Request failed", data.fieldErrors)
  }

  return data
}

/**
 * Early team-name check for Step 1. Returns the "taken" message, or null when
 * the name is free or the check couldn't run (submit re-checks anyway).
 */
async function getTeamNameTakenMessage(teamName: string) {
  try {
    const response = await fetch(
      `/api/register/team-name?name=${encodeURIComponent(teamName)}`
    )
    if (!response.ok) return null
    const data = (await response.json()) as {
      available: boolean
      message: string | null
    }
    return data.available ? null : data.message
  } catch {
    return null
  }
}

function stepIdForField(field: string): StepId {
  const group = field.split(".")[0]
  return group === "leader" || group === "member1" || group === "member2"
    ? group
    : "team"
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
        const saved = JSON.parse(stored)
        // Merge participants field by field so drafts saved before a field
        // existed (e.g. gender) still get its default instead of undefined.
        const draft = {
          ...defaultRegistrationValues,
          ...saved,
          leader: { ...defaultRegistrationValues.leader, ...saved.leader },
          member1: { ...defaultRegistrationValues.member1, ...saved.member1 },
          member2: { ...defaultRegistrationValues.member2, ...saved.member2 },
        }
        resetForm(draft)

        const savedStepIndex = Number(
          window.localStorage.getItem(STEP_STORAGE_KEY)
        )
        if (savedStepIndex > 0) {
          const resumeIndex = getResumeStepIndex(draft, savedStepIndex)
          setCurrentStepIndex(resumeIndex)
          setHighestStepIndex(resumeIndex)
        }
      } catch {
        window.localStorage.removeItem(REGISTRATION_STORAGE_KEY)
        window.localStorage.removeItem(STEP_STORAGE_KEY)
      }
    }
  }, [resetForm])

  // Must stay after the hydration effect so the saved step is read first.
  useEffect(() => {
    if (!hasHydrated.current || submittedRegistration) return
    window.localStorage.setItem(STEP_STORAGE_KEY, String(currentStepIndex))
  }, [currentStepIndex, submittedRegistration])

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

    if (currentStep.id === "team") {
      const takenMessage = await getTeamNameTakenMessage(
        form.getValues("teamName")
      )
      if (takenMessage) {
        form.setError(
          "teamName",
          { type: "server", message: takenMessage },
          { shouldFocus: true }
        )
        return
      }
    }

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

  /** Opens the first step containing any of these fields and shows `message`. */
  function openFirstStepWithErrors(fields: string[], message: string) {
    const invalidStepIds = fields.map(stepIdForField)
    const index = steps.findIndex((step) => invalidStepIds.includes(step.id))
    if (index >= 0) setCurrentStepIndex(index)
    setStepError(message)
  }

  // Client-side validation failed on submit: the errors belong to fields on
  // other steps, so open the first of those steps instead of doing nothing.
  function showFirstInvalidStep(errors: FieldErrors<RegistrationValues>) {
    openFirstStepWithErrors(
      Object.keys(errors),
      "Some details need to be fixed before you can submit. Check the highlighted fields."
    )
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
        window.localStorage.removeItem(STEP_STORAGE_KEY)
      }, showFirstInvalidStep)

      try {
        await handleSubmit()
      } catch (error) {
        // Server-side conflicts (team name, email, WhatsApp number already
        // registered) name the exact fields: highlight them and open that step.
        if (error instanceof RequestError && error.fieldErrors.length > 0) {
          for (const fieldError of error.fieldErrors) {
            form.setError(fieldError.path as FieldPath<RegistrationValues>, {
              type: "server",
              message: fieldError.message,
            })
          }
          openFirstStepWithErrors(
            error.fieldErrors.map((fieldError) => fieldError.path),
            error.message
          )
          return
        }

        setStepError(
          error instanceof Error ? error.message : "Submission failed"
        )
      }
    })
  }

  return (
    <div className="flex min-h-dvh w-full flex-col lg:flex-row">
      {/* Desktop: one viewport tall and sticky, so the intro stays centred on
          screen instead of drifting down as long steps stretch the row. */}
      <aside className="relative flex w-full shrink-0 flex-col justify-center overflow-hidden border-r border-[#163E70]/30 bg-[#000000] p-8 text-white lg:sticky lg:top-0 lg:h-dvh lg:w-[40%] lg:self-start lg:p-16 xl:w-[45%]">
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

        <div className="relative z-30 mt-12 flex flex-col items-center text-center lg:mt-0">
          <p className="text-[10px] font-bold tracking-[0.25em] text-[#0074FF] uppercase drop-shadow-md md:text-xs">
            Register your team
          </p>
          <Image
            src="/logo.png"
            alt="MoraXtreme 11 Logo"
            width={300}
            height={90}
            className="mt-1 mb-2 w-full max-w-[280px] object-contain"
          />
          <h2 className="text-sm font-semibold tracking-wide text-white/90">
            While Seats Are Available!
          </h2>
          <div className="my-3 h-[1px] w-full max-w-[160px] bg-gradient-to-r from-transparent via-[#0074FF] to-transparent opacity-70"></div>
          <p className="max-w-sm text-[13px] leading-relaxed text-neutral-400 drop-shadow-sm">
            A focused registration flow for the 12-hour online competition. The
            group leader should complete this form for the full team.
          </p>

          <div className="mt-5 flex w-full flex-col items-center gap-4 border-t border-white/10 pt-5">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[9px] font-bold tracking-[0.25em] text-neutral-500 uppercase">
                Awareness Session
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#0074FF]/30 bg-[#0074FF]/10 px-3 py-1 text-[10px] font-bold tracking-wider text-blue-200 shadow-[0_0_15px_rgba(0,116,255,0.15)]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0074FF] opacity-75"></span>
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#3d8dff]"></span>
                </span>
                OCT 3 • 7:00 PM • ZOOM
              </span>
            </div>
            
            <div className="flex flex-wrap items-stretch justify-center gap-5 sm:gap-6">
              {[
                {
                  name: "Mr. Sandil Ranasinghe",
                  avatar: "/speakers/sandil.png",
                  role: "Senior Software Engineer",
                  company: "HeyMilo AI",
                },
                {
                  name: "Mr. Shaveen Silva",
                  avatar: "/speakers/shaveen.png",
                  role: "CSE Undergraduate",
                  company: "University of Moratuwa",
                },
              ].map((speaker, idx) => (
                <div
                  key={idx}
                  className="group relative flex w-[170px] flex-col overflow-hidden rounded-2xl p-[1.5px] shadow-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,116,255,0.2)] sm:w-[180px]"
                >
                  {/* Animated glowing border background */}
                  <div 
                    className="absolute inset-[-150%] z-0 animate-spin bg-[conic-gradient(from_90deg_at_50%_50%,#162947_0%,#162947_70%,#0074FF_90%,#ffffff_100%)] opacity-60 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ animationDuration: '4s' }}
                  />
                  
                  {/* Inner card container that acts as a mask */}
                  <div className="relative z-10 flex h-full w-full flex-col overflow-hidden rounded-[14.5px] bg-gradient-to-b from-[#0a1426] to-[#030710]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,116,255,0.15)_0%,_transparent_60%)] opacity-30 transition-opacity duration-500 group-hover:opacity-100"></div>
                    
                    <div className="relative flex h-36 w-full shrink-0 items-end justify-center overflow-hidden pt-3 sm:h-40">
                      <img
                        src={speaker.avatar}
                        alt={speaker.name}
                        className="relative z-10 h-full w-full object-contain object-bottom opacity-90 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100"
                        style={{
                          maskImage:
                            "linear-gradient(to bottom, black 70%, transparent 100%)",
                          WebkitMaskImage:
                            "linear-gradient(to bottom, black 70%, transparent 100%)",
                        }}
                      />
                    </div>
                    <div className="relative z-20 flex h-full flex-col items-center justify-start px-3 pb-5 pt-2 text-center">
                      <span className="text-[11px] font-black tracking-wider text-white uppercase drop-shadow-md sm:text-xs">
                        {speaker.name}
                      </span>
                      <span className="mt-1.5 text-[8px] font-bold tracking-widest text-[#8ba3c7] uppercase sm:text-[9px]">
                        {speaker.role}
                      </span>
                      <div className="mt-auto pt-3">
                        <span className="text-[7.5px] font-black tracking-widest text-[#0074FF] uppercase sm:text-[8px]">
                          {speaker.company}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
                      // In a transition so Next stays disabled (isPending)
                      // while the Step 1 team-name check is in flight.
                      onNext={() => startTransition(goNext)}
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
