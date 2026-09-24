import type { FieldPath, UseFormReturn } from "react-hook-form"

import {
  OTHER_UNIVERSITY_ID,
  UNIVERSITY_OPTIONS,
} from "@/lib/registration/constants"
import type { RegistrationValues } from "@/lib/registration/schema"

export type StepId = "team" | "leader" | "member1" | "member2" | "review"
export type ParticipantPrefix = "leader" | "member1" | "member2"
export type RegistrationForm = UseFormReturn<
  RegistrationValues,
  unknown,
  RegistrationValues
>

export type SaveStatus =
  | "saved_local"
  | "syncing"
  | "synced"
  | "sync_failed"
  | "existing_loaded"
  | "submitted"

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

export const SAVE_STATUS_LABELS: Record<SaveStatus, string> = {
  saved_local: "Saved locally",
  syncing: "Syncing draft...",
  synced: "Synced",
  sync_failed: "Sync failed; final submit will retry",
  existing_loaded: "Existing draft loaded",
  submitted: "Submitted",
}

export function getRegistrationSteps(teamSize: number) {
  return BASE_STEPS.filter((step) => {
    if (step.id === "member1") return teamSize >= 2
    if (step.id === "member2") return teamSize >= 3
    return true
  })
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
