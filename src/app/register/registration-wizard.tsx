"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useRef, useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import Image from "next/image"
import Form from "@/components/form/Form"
import { REGISTRATION_STORAGE_KEY } from "@/lib/registration/constants"
import {
  defaultRegistrationValues,
  registrationSchema,
  type RegistrationValues,
  type SubmittedRegistration,
} from "@/lib/registration/schema"
import type { RegistrationAvailability } from "@/lib/registration/settings"

import {
  getRegistrationSteps,
  STEP_FIELDS,
  type SaveStatus,
  type StepId,
} from "./_components/registration-config"
import { RegistrationStepContent } from "./_components/registration-steps"
import {
  EventFacts,
  ProgressLine,
  SubmittedState,
  SuccessDialog,
  WizardFooter,
} from "./_components/registration-ui"

async function readResponse<T>(response: Response): Promise<T> {
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Request failed")
  }

  return data
}

export function RegistrationWizard({
  availability,
}: {
  availability: RegistrationAvailability
}) {
  const form = useForm<RegistrationValues, unknown, RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: defaultRegistrationValues,
    mode: "onBlur",
  })

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [highestStepIndex, setHighestStepIndex] = useState(0)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved_local")
  const [stepError, setStepError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState<SubmittedRegistration | null>(null)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const serverSyncEnabled = useRef(false)
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
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
      if (!hasHydrated.current || submitted) return

      window.localStorage.setItem(
        REGISTRATION_STORAGE_KEY,
        JSON.stringify(draft)
      )

      if (!serverSyncEnabled.current) {
        setSaveStatus("saved_local")
        return
      }

      if (syncTimer.current) clearTimeout(syncTimer.current)
      syncTimer.current = setTimeout(() => {
        syncDraft(draft as RegistrationValues)
      }, 900)
    })

    return () => {
      subscription.unsubscribe()
      if (syncTimer.current) clearTimeout(syncTimer.current)
    }
  }, [subscribeToForm, submitted])

  useEffect(() => {
    if (currentStepIndex >= steps.length) {
      setCurrentStepIndex(steps.length - 1)
    }
  }, [currentStepIndex, steps.length])

  async function syncDraft(draft: RegistrationValues) {
    setSaveStatus("syncing")

    try {
      await readResponse<{ draft: { teamId: string } }>(
        await fetch("/api/register/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        })
      )
      setSaveStatus("synced")
    } catch {
      setSaveStatus("sync_failed")
    }
  }

  async function loadExistingDraft(leaderEmail: string) {
    const response = await fetch(
      `/api/register/draft?leaderEmail=${encodeURIComponent(leaderEmail)}`
    )
    const data = await readResponse<{ draft: RegistrationValues | null }>(
      response
    )

    if (!data.draft) return false

    form.reset(data.draft)
    window.localStorage.setItem(
      REGISTRATION_STORAGE_KEY,
      JSON.stringify(data.draft)
    )
    setSaveStatus("existing_loaded")
    return true
  }

  async function validateCurrentStep() {
    if (currentStep.id === "review") return true

    setStepError(null)
    return form.trigger(STEP_FIELDS[currentStep.id], { shouldFocus: true })
  }

  async function goNext() {
    const valid = await validateCurrentStep()
    if (!valid) return

    if (currentStep.id === "leader") {
      try {
        const loaded = await loadExistingDraft(form.getValues("leader.email"))
        serverSyncEnabled.current = true
        if (!loaded) await syncDraft(form.getValues())
      } catch {
        serverSyncEnabled.current = true
        setSaveStatus("sync_failed")
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

  function submit() {
    setStepError(null)
    startTransition(async () => {
      const handleSubmit = form.handleSubmit(async (data) => {
        const response = await fetch("/api/register/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        const result = await readResponse<{
          registration: SubmittedRegistration
        }>(response)

        setSubmitted(result.registration)
        setSaveStatus("submitted")
        window.localStorage.removeItem(REGISTRATION_STORAGE_KEY)
        setIsSuccessOpen(true)
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

  if (submitted) {
    return (
      <>
        <SubmittedState registration={submitted} />
        <SuccessDialog
          open={isSuccessOpen}
          onOpenChange={setIsSuccessOpen}
          registration={submitted}
        />
      </>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100dvh-4rem)] w-full">
      <aside className="relative flex flex-col justify-center w-full lg:w-[40%] xl:w-[45%] p-8 lg:p-16 overflow-hidden bg-[#000000] text-white shrink-0 border-r border-[#163E70]/30">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,116,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,116,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
          <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-[#0074FF] rounded-full mix-blend-screen filter blur-[150px] opacity-10 z-10" />
        </div>

        <div className="relative z-30 space-y-6">
          <p className="text-sm font-bold tracking-[0.25em] text-[#0074FF] uppercase drop-shadow-md">
            Register your team
          </p>
          <Image src="/logo.png" alt="MoraXtreme 11 Logo" width={280} height={100} className="mb-2" />
          <p className="text-xl text-white/90 font-mono tracking-widest uppercase mt-4">
            while seats are available !
          </p>
          <div className="h-[2px] w-24 bg-[#0074FF] my-8 shadow-[0_0_15px_#0074FF]"></div>
          <p className="max-w-xl text-base leading-relaxed text-neutral-300 drop-shadow-sm">
            A focused registration flow for the 12-hour online competition. The
            group leader should complete this form for the full team.
          </p>
          <div className="pt-6">
            <EventFacts availability={availability} />
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col items-center justify-center bg-[#000000] p-6 sm:p-10 lg:p-16 relative overflow-y-auto w-full dark">
        <div className="max-w-4xl w-full mx-auto relative z-10">
          <ProgressLine
            steps={steps}
            currentStepIndex={currentStepIndex}
            highestStepIndex={highestStepIndex}
            onJump={jumpToStep}
          />

          <Form form={form} className="@container mt-12" onFinish={() => undefined}>
            <div className="rounded-2xl border border-[#163E70]/40 bg-[#030710] text-white shadow-xl hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] overflow-hidden transition-all duration-500">
              <div className="relative border-b border-[#163E70]/40 bg-[#060d1a] p-[clamp(1.5rem,3vw,2.5rem)] overflow-hidden">
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#0074FF] rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none"></div>
                <div className="relative z-10">
                  <span className="inline-block bg-[#0074FF] text-white text-xs font-bold px-3 py-1 rounded mb-4 tracking-wider">
                    STEP 0{currentStepIndex + 1} OF 0{steps.length}
                  </span>
                  <h2 className="text-3xl font-semibold tracking-tight text-white">
                    {currentStep.title}
                  </h2>
                  <p className="mt-2 text-base text-neutral-400">
                    {currentStep.description}
                  </p>
                </div>
              </div>

              <div className="p-[clamp(1.5rem,3vw,2.5rem)] bg-[#030710]">
                {stepError && (
                  <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
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

              <div className="bg-[#030710] border-t border-[#163E70]/40 p-[clamp(1rem,3vw,2rem)]">
                <WizardFooter
                  currentStepId={currentStep.id}
                  currentStepIndex={currentStepIndex}
                  saveStatus={saveStatus}
                  isPending={isPending}
                  onBack={goBack}
                  onNext={goNext}
                  onSubmit={submit}
                />
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}
