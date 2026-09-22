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
    <div className="grid gap-[clamp(2rem,5vw,5rem)] lg:grid-cols-[minmax(16rem,0.7fr)_minmax(0,1.3fr)] lg:items-start">
      <aside className="lg:sticky lg:top-24">
        <div className="space-y-4">
          <p className="text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">
            Register your team
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            MoraXtreme 11 team registration
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground">
            A focused registration flow for the 12-hour online competition. The
            group leader should complete this form for the full team.
          </p>
        </div>

        <EventFacts availability={availability} />
      </aside>

      <div className="min-w-0">
        <ProgressLine
          steps={steps}
          currentStepIndex={currentStepIndex}
          highestStepIndex={highestStepIndex}
          onJump={jumpToStep}
        />

        <Form form={form} className="@container" onFinish={() => undefined}>
          <div className="rounded-2xl border bg-card text-card-foreground shadow-sm">
            <div className="border-b p-[clamp(1rem,3vw,2rem)]">
              <p className="text-sm text-muted-foreground">
                Step {currentStepIndex + 1} of {steps.length}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                {currentStep.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {currentStep.description}
              </p>
            </div>

            <div className="p-[clamp(1rem,3vw,2rem)]">
              {stepError && (
                <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
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
        </Form>
      </div>
    </div>
  )
}
