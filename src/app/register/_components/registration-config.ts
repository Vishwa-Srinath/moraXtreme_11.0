import type { FieldPath, UseFormReturn } from "react-hook-form"

import {
  OTHER_UNIVERSITY_ID,
  UNIVERSITY_OPTIONS,
} from "@/lib/registration/constants"
import {
  registrationSchema,
  type RegistrationValues,
} from "@/lib/registration/schema"

export type StepId = "team" | "leader" | "member1" | "member2" | "review"
export type ParticipantPrefix = "leader" | "member1" | "member2"
export type RegistrationForm = UseFormReturn<
  RegistrationValues,
  unknown,
  RegistrationValues
>

export type RegistrationStep = {
  id: StepId
  title: string
  description: string
}

const BASE_STEPS: RegistrationStep[] = [
  {
    id: "team",
    title: "Team Details",
    description: "Enter your team, country, and university details.",
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

export const STEP_FIELDS: Record<
  Exclude<StepId, "review">,
  FieldPath<RegistrationValues>[]
> = {
  team: [
    "country",
    "teamName",
    "universityId",
    "otherUniversityName",
    "teamSize",
  ],
  leader: ["leader.fullName", "leader.email", "leader.whatsappNumber"],
  member1: ["member1.fullName", "member1.email", "member1.whatsappNumber"],
  member2: ["member2.fullName", "member2.email", "member2.whatsappNumber"],
}

export function getRegistrationSteps(teamSize: number) {
  return BASE_STEPS.filter((step) => {
    if (step.id === "member1") return teamSize >= 2
    if (step.id === "member2") return teamSize >= 3
    return true
  })
}

/**
 * The step to reopen a restored draft on: the step the person was last on,
 * but never past the first step whose saved data no longer validates.
 */
export function getResumeStepIndex(
  values: RegistrationValues,
  savedStepIndex: number
) {
  const steps = getRegistrationSteps(Number(values.teamSize) || 1)
  let resumeIndex = Math.min(savedStepIndex, steps.length - 1)

  const result = registrationSchema.safeParse(values)
  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = String(issue.path[0])
      const stepId =
        field === "leader" || field === "member1" || field === "member2"
          ? field
          : "team"
      const stepIndex = steps.findIndex((step) => step.id === stepId)
      if (stepIndex >= 0) resumeIndex = Math.min(resumeIndex, stepIndex)
    }
  }

  return Math.max(resumeIndex, 0)
}

export function getUniversityLabel(values: RegistrationValues) {
  if (values.universityId === OTHER_UNIVERSITY_ID) {
    return values.otherUniversityName || "Other university"
  }

  return (
    UNIVERSITY_OPTIONS.find((option) => option.id === values.universityId)
      ?.name || "Not selected"
  )
}
