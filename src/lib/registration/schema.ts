import { z } from "zod"

import {
  COUNTRY_OPTIONS,
  KNOWN_UNIVERSITIES,
  OTHER_UNIVERSITY_ID,
} from "./constants"

const knownUniversityIds = new Set(KNOWN_UNIVERSITIES.map((item) => item.id))

export type ParticipantRole = "leader" | "member"

export type ParticipantValues = {
  fullName: string
  email: string
  whatsappNumber: string
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

export function normalizeWhatsappNumber(value: string) {
  return value.replace(/[\s().-]/g, "").trim()
}

// Upper bounds keep oversized payloads out of the database.
const MAX_NAME_LENGTH = 100
const MAX_TEAM_NAME_LENGTH = 60
const MAX_UNIVERSITY_NAME_LENGTH = 150
const MAX_EMAIL_LENGTH = 254

const emailSchema = z
  .email("Enter a valid email address")
  .max(MAX_EMAIL_LENGTH, "Email address is too long")
  .transform(normalizeEmail)

const whatsappSchema = z
  .string()
  .trim()
  .min(1, "WhatsApp number is required")
  .transform(normalizeWhatsappNumber)
  .pipe(
    z
      .string()
      .regex(/^\+[1-9]\d{7,14}$/, "Use international format, e.g. +94771234567")
  )

export const participantSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(
      MAX_NAME_LENGTH,
      `Full name must be at most ${MAX_NAME_LENGTH} characters`
    ),
  email: emailSchema,
  whatsappNumber: whatsappSchema,
})

// Unused member slots are not validated in detail, but are still bounded.
const looseParticipantSchema = z.object({
  fullName: z.string().max(MAX_NAME_LENGTH * 2),
  email: z.string().max(MAX_EMAIL_LENGTH * 2),
  whatsappNumber: z.string().max(64),
})

const baseRegistrationSchema = z.object({
  country: z.enum(COUNTRY_OPTIONS, "Select a country"),
  teamName: z
    .string()
    .trim()
    .min(2, "Team name is required")
    .max(
      MAX_TEAM_NAME_LENGTH,
      `Team name must be at most ${MAX_TEAM_NAME_LENGTH} characters`
    ),
  universityId: z.string().min(1, "Select a university").max(100),
  otherUniversityName: z
    .string()
    .trim()
    .max(
      MAX_UNIVERSITY_NAME_LENGTH,
      `University name must be at most ${MAX_UNIVERSITY_NAME_LENGTH} characters`
    )
    .optional(),
  teamSize: z.number().int().min(1).max(3),
  leader: participantSchema,
  member1: looseParticipantSchema,
  member2: looseParticipantSchema,
})

function addParticipantIssues(
  ctx: z.RefinementCtx,
  path: "member1" | "member2",
  value: ParticipantValues
) {
  const result = participantSchema.safeParse(value)

  if (result.success) return

  for (const issue of result.error.issues) {
    ctx.addIssue({ ...issue, path: [path, ...issue.path] })
  }
}

function addDuplicateIssues(
  ctx: z.RefinementCtx,
  participants: ParticipantValues[]
) {
  const emails = new Map<string, number>()
  const phones = new Map<string, number>()

  participants.forEach((participant, index) => {
    const email = normalizeEmail(participant.email)
    const phone = normalizeWhatsappNumber(participant.whatsappNumber)

    if (email) {
      const firstIndex = emails.get(email)
      if (firstIndex !== undefined) {
        ctx.addIssue({
          code: "custom",
          message: "This email is already used by another participant",
          path: [index === 0 ? "leader" : `member${index}`, "email"],
        })
      }
      emails.set(email, index)
    }

    if (phone) {
      const firstIndex = phones.get(phone)
      if (firstIndex !== undefined) {
        ctx.addIssue({
          code: "custom",
          message:
            "This WhatsApp number is already used by another participant",
          path: [index === 0 ? "leader" : `member${index}`, "whatsappNumber"],
        })
      }
      phones.set(phone, index)
    }
  })
}

export const registrationSchema = baseRegistrationSchema.superRefine(
  (values, ctx) => {
    if (
      values.country !== "Sri Lanka" &&
      values.universityId !== OTHER_UNIVERSITY_ID
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Universities outside Sri Lanka must be entered as Other",
        path: ["universityId"],
      })
    }

    if (
      values.universityId !== OTHER_UNIVERSITY_ID &&
      !knownUniversityIds.has(
        values.universityId as (typeof KNOWN_UNIVERSITIES)[number]["id"]
      )
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Select a valid university",
        path: ["universityId"],
      })
    }

    if (
      values.universityId === OTHER_UNIVERSITY_ID &&
      !values.otherUniversityName?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Enter the university name",
        path: ["otherUniversityName"],
      })
    }

    if (values.teamSize >= 2) {
      addParticipantIssues(ctx, "member1", values.member1)
    }

    if (values.teamSize >= 3) {
      addParticipantIssues(ctx, "member2", values.member2)
    }

    addDuplicateIssues(ctx, [
      values.leader,
      ...(values.teamSize >= 2 ? [values.member1] : []),
      ...(values.teamSize >= 3 ? [values.member2] : []),
    ])
  }
)

export type RegistrationValues = z.infer<typeof registrationSchema>

export type SubmittedRegistration = {
  teamName: string
  /** Only ever sent to a team that has just registered successfully. */
  whatsappGroupUrl: string
  registrationCode: string
  submittedAt: string
  members: string[]
}

export function getParticipants(values: RegistrationValues) {
  return [
    { ...values.leader, role: "leader" as const, memberOrder: 0 },
    ...(values.teamSize >= 2
      ? [
          {
            ...participantSchema.parse(values.member1),
            role: "member" as const,
            memberOrder: 1,
          },
        ]
      : []),
    ...(values.teamSize >= 3
      ? [
          {
            ...participantSchema.parse(values.member2),
            role: "member" as const,
            memberOrder: 2,
          },
        ]
      : []),
  ]
}

export const defaultRegistrationValues = {
  country: "Sri Lanka",
  teamName: "",
  universityId: "",
  otherUniversityName: "",
  teamSize: 3,
  leader: { fullName: "", email: "", whatsappNumber: "" },
  member1: { fullName: "", email: "", whatsappNumber: "" },
  member2: { fullName: "", email: "", whatsappNumber: "" },
} satisfies RegistrationValues
