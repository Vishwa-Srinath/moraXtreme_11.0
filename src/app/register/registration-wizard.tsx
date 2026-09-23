"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useRef, useState, useTransition } from "react"
import { useForm } from "react-hook-form"

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
      <aside className="relative flex flex-col justify-center w-full lg:w-[40%] xl:w-[45%] p-8 lg:p-16 overflow-hidden bg-[#020813] text-white shrink-0">
        {/* Dynamic Blurred Background using site theme colors */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[#000000] z-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0074FF]/10 to-[#163E70]/30 backdrop-blur-3xl z-20" />
          <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-[#0074FF] rounded-full mix-blend-screen filter blur-[150px] opacity-40 z-10 animate-pulse" />
          <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-[#163E70] rounded-full mix-blend-screen filter blur-[160px] opacity-60 z-10" />
          <div className="absolute top-[60%] left-[-10%] w-72 h-72 bg-[#004bb5] rounded-full mix-blend-screen filter blur-[120px] opacity-30 z-10" />
        </div>

        <div className="relative z-30 space-y-6">
          <p className="text-sm font-bold tracking-[0.25em] text-[#0074FF] uppercase drop-shadow-md">
            Register your team
          </p>
          <h1 className="text-5xl font-black tracking-tighter text-white uppercase drop-shadow-xl sm:text-6xl lg:text-7xl">
            MoraXtreme 11 <br />
          </h1>
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

      <div className="flex-1 flex flex-col items-center justify-center bg-neutral-50 dark:bg-background p-6 sm:p-10 lg:p-16 relative overflow-y-auto w-full">
        <div className="max-w-4xl w-full mx-auto relative z-10">
          <ProgressLine
            steps={steps}
            currentStepIndex={currentStepIndex}
            highestStepIndex={highestStepIndex}
            onJump={jumpToStep}
          />

          <Form form={form} className="@container mt-12" onFinish={() => undefined}>
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800/60 bg-white dark:bg-card text-card-foreground shadow-2xl overflow-hidden transition-all duration-300">
              <div className="border-b border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-muted/20 p-[clamp(1.5rem,3vw,2.5rem)]">
                <p className="text-xs font-medium tracking-[0.15em] text-muted-foreground uppercase mb-2">
                  Step {currentStepIndex + 1} of {steps.length}
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  {currentStep.title}
                </h2>
                <p className="mt-2 text-base text-muted-foreground">
                  {currentStep.description}
                </p>
              </div>

              <div className="p-[clamp(1.5rem,3vw,2.5rem)] bg-white dark:bg-card">
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

              <div className="bg-neutral-50 dark:bg-muted/10 border-t border-neutral-100 dark:border-neutral-800/60 p-[clamp(1rem,3vw,2rem)]">
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
