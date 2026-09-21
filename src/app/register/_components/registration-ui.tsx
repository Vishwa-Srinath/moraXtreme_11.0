"use client"

import { CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { SubmittedRegistration } from "@/lib/registration/schema"
import type { RegistrationAvailability } from "@/lib/registration/settings"
import { cn } from "@/lib/utils"

import {
  SAVE_STATUS_LABELS,
  type RegistrationStep,
  type SaveStatus,
  type StepId,
} from "./registration-config"

export function EventFacts({
  availability,
}: {
  availability: RegistrationAvailability
}) {
  return (
    <div className="mt-8 hidden rounded-2xl border bg-card p-6 shadow-sm lg:block">
      <h2 className="text-lg font-semibold">Event facts</h2>
      <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 text-sm">
        <Fact label="Event" value="MoraXtreme 11" />
        <Fact label="Duration" value="12 hours" />
        <Fact label="Mode" value="Online" />
        <Fact label="Team size" value="Maximum 3 members" />
        {availability.closeAt && (
          <div className="col-span-2">
            <Fact label="Closes" value={availability.closeAt} />
          </div>
        )}
      </dl>
    </div>
  )
}

export function ProgressLine({
  steps,
  currentStepIndex,
  highestStepIndex,
  onJump,
}: {
  steps: RegistrationStep[]
  currentStepIndex: number
  highestStepIndex: number
  onJump: (index: number) => void
}) {
  return (
    <nav className="mb-5" aria-label="Registration progress">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
            Registration progress
          </p>
          <p className="mt-1 font-medium">{steps[currentStepIndex]?.title}</p>
        </div>
        <p className="shrink-0 text-sm text-muted-foreground">
          {currentStepIndex + 1} / {steps.length}
        </p>
      </div>
      <ol className="mt-4 flex gap-1.5">
        {steps.map((step, index) => (
          <li key={step.id} className="flex-1">
            <button
              type="button"
              disabled={index > highestStepIndex}
              aria-current={index === currentStepIndex ? "step" : undefined}
              aria-label={`Step ${index + 1}: ${step.title}`}
              className={cn(
                "flex h-6 w-full items-center",
                index <= highestStepIndex &&
                  index !== currentStepIndex &&
                  "group",
                index > highestStepIndex && "cursor-not-allowed"
              )}
              onClick={() => onJump(index)}
            >
              <span
                className={cn(
                  "h-1.5 w-full rounded-full bg-muted transition-colors",
                  index <= currentStepIndex && "bg-primary",
                  index <= highestStepIndex &&
                    index !== currentStepIndex &&
                    "group-hover:bg-primary/70"
                )}
              />
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function WizardFooter({
  currentStepId,
  currentStepIndex,
  saveStatus,
  isPending,
  onBack,
  onNext,
  onSubmit,
}: {
  currentStepId: StepId
  currentStepIndex: number
  saveStatus: SaveStatus
  isPending: boolean
  onBack: () => void
  onNext: () => void
  onSubmit: () => void
}) {
  return (
    <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t bg-card/95 p-4 backdrop-blur sm:static sm:p-[clamp(1rem,3vw,2rem)]">
      <p className="text-xs text-muted-foreground">
        {SAVE_STATUS_LABELS[saveStatus]}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={currentStepIndex === 0 || isPending}
          onClick={onBack}
        >
          Back
        </Button>
        {currentStepId === "review" ? (
          <Button type="button" disabled={isPending} onClick={onSubmit}>
            {isPending && <Loader2 className="animate-spin" />}
            Submit
          </Button>
        ) : (
          <Button type="button" disabled={isPending} onClick={onNext}>
            Next
          </Button>
        )}
      </div>
    </div>
  )
}

export function SubmittedState({
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

export function SuccessDialog({
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

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium break-words">{value}</dd>
    </div>
  )
}
