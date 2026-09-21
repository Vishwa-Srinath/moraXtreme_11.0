"use client"

import Link from "next/link"
import { useEffect, useRef, useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, Loader2 } from "lucide-react"
import {
  Controller,
  type FieldPath,
  type UseFormReturn,
  useForm,
} from "react-hook-form"

import Form from "@/components/form/Form"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  REGISTRATION_STORAGE_KEY,
  TEAM_SIZE_OPTIONS,
  UNIVERSITY_OPTIONS,
  OTHER_UNIVERSITY_ID,
} from "@/lib/registration/constants"
import {
  defaultRegistrationValues,
  registrationSchema,
  type RegistrationValues,
  type SubmittedRegistration,
} from "@/lib/registration/schema"
import type { RegistrationAvailability } from "@/lib/registration/settings"

type StepId = "team" | "leader" | "member1" | "member2" | "review"

type SaveStatus =
  | "saved_local"
  | "syncing"
  | "synced"
  | "sync_failed"
  | "existing_loaded"
  | "submitted"

type Step = {
  id: StepId
  title: string
  description: string
}

const baseSteps: Step[] = [
  {
    id: "team",
    title: "Team Details",
    description: "Name your team and select the university.",
  },
  {
    id: "leader",
    title: "Team Leader",
    description: "This should be filled by the group leader.",
  },
  {
    id: "member1",
    title: "Team Member 1",
    description:
      "Add the second participant when your team has 2 or 3 members.",
  },
  {
    id: "member2",
    title: "Team Member 2",
    description: "Add the third participant when your team has 3 members.",
  },
  {
    id: "review",
    title: "Review & Submit",
    description: "Check every detail before submitting the registration.",
  },
]

const stepFields: Record<
  Exclude<StepId, "review">,
  FieldPath<RegistrationValues>[]
> = {
  team: ["teamName", "universityId", "otherUniversityName", "teamSize"],
  leader: ["leader.fullName", "leader.email", "leader.whatsappNumber"],
  member1: ["member1.fullName", "member1.email", "member1.whatsappNumber"],
  member2: ["member2.fullName", "member2.email", "member2.whatsappNumber"],
}

function getSteps(teamSize: number) {
  return baseSteps.filter((step) => {
    if (step.id === "member1") return teamSize >= 2
    if (step.id === "member2") return teamSize >= 3
    return true
  })
}

function getUniversityLabel(values: RegistrationValues) {
  if (values.universityId === OTHER_UNIVERSITY_ID) {
    return values.otherUniversityName || "Other university"
  }

  return (
    UNIVERSITY_OPTIONS.find((option) => option.id === values.universityId)
      ?.name || "Not selected"
  )
}

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

  const teamSize = form.watch("teamSize")
  const values = form.watch()
  const steps = getSteps(Number(teamSize) || 1)
  const currentStep = steps[currentStepIndex] ?? steps[0]
  const completedParticipants = [
    values.leader,
    ...(Number(teamSize) >= 2 ? [values.member1] : []),
    ...(Number(teamSize) >= 3 ? [values.member2] : []),
  ].filter(
    (participant) =>
      participant.fullName && participant.email && participant.whatsappNumber
  ).length

  useEffect(() => {
    const stored = window.localStorage.getItem(REGISTRATION_STORAGE_KEY)

    if (stored) {
      try {
        form.reset({ ...defaultRegistrationValues, ...JSON.parse(stored) })
      } catch {
        window.localStorage.removeItem(REGISTRATION_STORAGE_KEY)
      }
    }

    hasHydrated.current = true
  }, [form])

  useEffect(() => {
    const subscription = form.watch((draft) => {
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
  }, [form, submitted])

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

    const valid = await form.trigger(stepFields[currentStep.id], {
      shouldFocus: true,
    })

    if (!valid) {
      setStepError("Fix the highlighted fields before continuing.")
      return false
    }

    setStepError(null)
    return true
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
    if (index <= highestStepIndex) {
      setStepError(null)
      setCurrentStepIndex(index)
    }
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
    <>
      <div className="grid gap-[clamp(1rem,3vw,2rem)] lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="min-w-0">
          <div className="mb-6 space-y-3">
            <p className="text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">
              Register your team
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              MoraXtreme 11 team registration
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              A focused registration flow for the 12-hour online competition.
              The group leader should complete this form for the full team.
            </p>
          </div>

          <MobileProgress
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

                {currentStep.id === "team" && <TeamDetailsStep form={form} />}
                {currentStep.id === "leader" && (
                  <ParticipantStep prefix="leader" roleLabel="Team Leader" />
                )}
                {currentStep.id === "member1" && (
                  <ParticipantStep prefix="member1" roleLabel="Team Member 1" />
                )}
                {currentStep.id === "member2" && (
                  <ParticipantStep prefix="member2" roleLabel="Team Member 2" />
                )}
                {currentStep.id === "review" && (
                  <ReviewStep
                    values={values}
                    steps={steps}
                    onEdit={(stepId) =>
                      setCurrentStepIndex(
                        steps.findIndex((step) => step.id === stepId)
                      )
                    }
                  />
                )}
              </div>

              <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t bg-card/95 p-4 backdrop-blur sm:static sm:p-[clamp(1rem,3vw,2rem)]">
                <div className="text-xs text-muted-foreground">
                  <SaveStatusLabel status={saveStatus} />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={currentStepIndex === 0 || isPending}
                    onClick={goBack}
                  >
                    Back
                  </Button>
                  {currentStep.id === "review" ? (
                    <Button type="button" disabled={isPending} onClick={submit}>
                      {isPending && <Loader2 className="animate-spin" />}
                      Submit
                    </Button>
                  ) : (
                    <Button type="button" disabled={isPending} onClick={goNext}>
                      Next
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Form>
        </div>

        <RegistrationSidePanel
          availability={availability}
          steps={steps}
          currentStepIndex={currentStepIndex}
          highestStepIndex={highestStepIndex}
          values={values}
          completedParticipants={completedParticipants}
          onJump={jumpToStep}
        />
      </div>
    </>
  )
}

function TeamDetailsStep({
  form,
}: {
  form: UseFormReturn<RegistrationValues, unknown, RegistrationValues>
}) {
  const universityId = form.watch("universityId")

  return (
    <div className="grid gap-4 @2xl:grid-cols-2">
      <Form.Item name="teamName" label="Team Name" className="@2xl:col-span-2">
        <Input placeholder="Enter your team name" />
      </Form.Item>

      <Controller
        control={form.control}
        name="universityId"
        render={(controller) => (
          <Form.CustomController
            {...controller}
            label="University"
            helperText="Search the list or choose Other."
            className="@2xl:col-span-2"
          >
            <UniversityCombobox
              value={controller.field.value}
              onChange={controller.field.onChange}
            />
          </Form.CustomController>
        )}
      />

      <Form.Item
        name="otherUniversityName"
        label="University Name"
        hidden={universityId !== OTHER_UNIVERSITY_ID}
        className="@2xl:col-span-2"
      >
        <Input placeholder="Specify your university" />
      </Form.Item>

      <Controller
        control={form.control}
        name="teamSize"
        render={(controller) => (
          <Form.CustomController
            {...controller}
            label="Choose the number of members in the team."
            className="@2xl:col-span-2"
          >
            <div className="grid gap-2 sm:grid-cols-3">
              {TEAM_SIZE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    "rounded-lg border px-4 py-3 text-left text-sm transition hover:bg-muted",
                    Number(controller.field.value) === option.value &&
                      "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                  onClick={() => controller.field.onChange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Form.CustomController>
        )}
      />
    </div>
  )
}

function ParticipantStep({
  prefix,
  roleLabel,
}: {
  prefix: "leader" | "member1" | "member2"
  roleLabel: string
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-lg border bg-muted/35 p-4 text-sm text-muted-foreground">
        Enter the participant details exactly as they should appear on the
        certificate. WhatsApp numbers must include the country code.
      </div>
      <div className="grid gap-4 @2xl:grid-cols-2">
        <Form.Item
          name={`${prefix}.fullName`}
          label="Full Name (To be printed on the certificate)"
          className="@2xl:col-span-2"
        >
          <Input placeholder={`${roleLabel} full name`} />
        </Form.Item>
        <Form.Item name={`${prefix}.email`} label="Email Address">
          <Input type="email" placeholder="name@example.com" />
        </Form.Item>
        <Form.Item name={`${prefix}.whatsappNumber`} label="WhatsApp Number">
          <Input type="tel" placeholder="+94771234567" />
        </Form.Item>
      </div>
    </div>
  )
}

function UniversityCombobox({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const selected = UNIVERSITY_OPTIONS.find((option) => option.id === value)
  const filtered = UNIVERSITY_OPTIONS.filter((option) =>
    option.name.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    setQuery(selected?.name ?? "")
  }, [selected?.name])

  return (
    <div className="relative">
      <Input
        value={query}
        placeholder="Search university"
        onChange={(event) => {
          setQuery(event.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && (
        <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg">
          {filtered.length > 0 ? (
            filtered.map((option) => (
              <button
                key={option.id}
                type="button"
                className={cn(
                  "block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted",
                  option.id === value && "bg-muted font-medium"
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(option.id)
                  setQuery(option.name)
                  setIsOpen(false)
                }}
              >
                {option.name}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No universities found. Choose Other to specify manually.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RegistrationSidePanel({
  availability,
  steps,
  currentStepIndex,
  highestStepIndex,
  values,
  completedParticipants,
  onJump,
}: {
  availability: RegistrationAvailability
  steps: Step[]
  currentStepIndex: number
  highestStepIndex: number
  values: RegistrationValues
  completedParticipants: number
  onJump: (index: number) => void
}) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24">
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="font-semibold">Event facts</h2>
        <dl className="mt-4 grid gap-3 text-sm">
          <Fact label="Event" value="MoraXtreme 11" />
          <Fact label="Duration" value="12 hours" />
          <Fact label="Mode" value="Online" />
          <Fact label="Team size" value="Maximum 3 members" />
          {availability.closeAt && (
            <Fact label="Closes" value={availability.closeAt} />
          )}
        </dl>
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-sm max-lg:hidden">
        <h2 className="font-semibold">Progress</h2>
        <StepList
          steps={steps}
          currentStepIndex={currentStepIndex}
          highestStepIndex={highestStepIndex}
          onJump={onJump}
        />
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="font-semibold">Live summary</h2>
        <dl className="mt-4 grid gap-3 text-sm">
          <Fact label="Team" value={values.teamName || "Not entered"} />
          <Fact label="University" value={getUniversityLabel(values)} />
          <Fact label="Team size" value={`${values.teamSize} member(s)`} />
          <Fact
            label="Participants"
            value={`${completedParticipants} of ${values.teamSize} complete`}
          />
        </dl>
      </div>
    </aside>
  )
}

function MobileProgress({
  steps,
  currentStepIndex,
  highestStepIndex,
  onJump,
}: {
  steps: Step[]
  currentStepIndex: number
  highestStepIndex: number
  onJump: (index: number) => void
}) {
  return (
    <div className="mb-5 overflow-auto rounded-2xl border bg-card p-3 lg:hidden">
      <div className="flex min-w-max gap-2">
        {steps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            disabled={index > highestStepIndex}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs whitespace-nowrap",
              index === currentStepIndex &&
                "border-primary bg-primary text-primary-foreground",
              index !== currentStepIndex && "text-muted-foreground",
              index > highestStepIndex && "opacity-50"
            )}
            onClick={() => onJump(index)}
          >
            {step.title}
          </button>
        ))}
      </div>
    </div>
  )
}

function StepList({
  steps,
  currentStepIndex,
  highestStepIndex,
  onJump,
}: {
  steps: Step[]
  currentStepIndex: number
  highestStepIndex: number
  onJump: (index: number) => void
}) {
  return (
    <ol className="mt-4 space-y-2">
      {steps.map((step, index) => (
        <li key={step.id}>
          <button
            type="button"
            disabled={index > highestStepIndex}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition",
              index === currentStepIndex &&
                "bg-primary text-primary-foreground",
              index !== currentStepIndex && "hover:bg-muted",
              index > highestStepIndex && "cursor-not-allowed opacity-50"
            )}
            onClick={() => onJump(index)}
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full border text-xs">
              {index + 1}
            </span>
            {step.title}
          </button>
        </li>
      ))}
    </ol>
  )
}

function ReviewStep({
  values,
  steps,
  onEdit,
}: {
  values: RegistrationValues
  steps: Step[]
  onEdit: (stepId: StepId) => void
}) {
  const cards = [
    {
      id: "team" as const,
      title: "Team Details",
      rows: [
        ["Team Name", values.teamName],
        ["University", getUniversityLabel(values)],
        ["Team Size", `${values.teamSize} member(s)`],
      ],
    },
    {
      id: "leader" as const,
      title: "Team Leader",
      rows: participantRows(values.leader),
    },
    ...(values.teamSize >= 2
      ? [
          {
            id: "member1" as const,
            title: "Team Member 1",
            rows: participantRows(values.member1),
          },
        ]
      : []),
    ...(values.teamSize >= 3
      ? [
          {
            id: "member2" as const,
            title: "Team Member 2",
            rows: participantRows(values.member2),
          },
        ]
      : []),
  ]

  return (
    <div className="space-y-4">
      {cards.map((card) => (
        <div key={card.id} className="rounded-xl border p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold">{card.title}</h3>
            {steps.some((step) => step.id === card.id) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEdit(card.id)}
              >
                Edit
              </Button>
            )}
          </div>
          <dl className="mt-3 grid gap-3 text-sm @2xl:grid-cols-2">
            {card.rows.map(([label, value]) => (
              <Fact key={label} label={label} value={value || "Not entered"} />
            ))}
          </dl>
        </div>
      ))}
    </div>
  )
}

function participantRows(participant: {
  fullName: string
  email: string
  whatsappNumber: string
}) {
  return [
    ["Full Name", participant.fullName],
    ["Email", participant.email],
    ["WhatsApp", participant.whatsappNumber],
  ]
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium break-words">{value}</dd>
    </div>
  )
}

function SaveStatusLabel({ status }: { status: SaveStatus }) {
  const labels: Record<SaveStatus, string> = {
    saved_local: "Saved locally",
    syncing: "Syncing draft...",
    synced: "Synced",
    sync_failed: "Sync failed; final submit will retry",
    existing_loaded: "Existing draft loaded",
    submitted: "Submitted",
  }

  return labels[status]
}

function SubmittedState({
  registration,
}: {
  registration: SubmittedRegistration
}) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-[clamp(1.5rem,4vw,3rem)] text-card-foreground shadow-sm">
      <CheckCircle2 className="size-10 text-primary" />
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        Registration confirmed
      </h1>
      <p className="mt-3 text-muted-foreground">
        {registration.teamName} has been registered for MoraXtreme 11.
      </p>
      <div className="mt-6 rounded-xl border bg-muted/35 p-4">
        <p className="text-xs text-muted-foreground">Registration code</p>
        <p className="mt-1 font-mono text-2xl font-semibold">
          {registration.registrationCode}
        </p>
      </div>
      <Link href="/" className={buttonVariants({ className: "mt-8" })}>
        Back to home
      </Link>
    </div>
  )
}

function SuccessDialog({
  open,
  onOpenChange,
  registration,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  registration: SubmittedRegistration
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registration successful</DialogTitle>
          <DialogDescription>
            {registration.teamName} is confirmed for MoraXtreme 11.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/35 p-4">
            <p className="text-xs text-muted-foreground">Registration code</p>
            <p className="mt-1 font-mono text-xl font-semibold">
              {registration.registrationCode}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Submitted members</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {registration.members.map((member) => (
                <li key={member}>{member}</li>
              ))}
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Link href="/" className={buttonVariants()}>
            Back to home
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
