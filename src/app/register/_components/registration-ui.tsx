"use client"

import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { RegistrationAvailability } from "@/lib/registration/settings"
import { cn } from "@/lib/utils"

import { type RegistrationStep, type StepId } from "./registration-config"

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
  isPending,
  onBack,
  onNext,
  onSubmit,
}: {
  currentStepId: StepId
  currentStepIndex: number
  isPending: boolean
  onBack: () => void
  onNext: () => void
  onSubmit: () => void
}) {
  return (
    <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t bg-card/95 p-4 backdrop-blur sm:static sm:p-[clamp(1rem,3vw,2rem)]">
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

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium break-words">{value}</dd>
    </div>
  )
}
