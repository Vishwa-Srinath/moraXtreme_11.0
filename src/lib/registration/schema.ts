import { z } from "zod"

import { getPhoneNumberError } from "@/components/form-inputs/phone-input-config"

import {
  COUNTRY_OPTIONS,
  GENDER_VALUES,
  KNOWN_UNIVERSITIES,
  OTHER_UNIVERSITY_ID,
  YEAR_OF_STUDY_VALUES,
} from "./constants"

const knownUniversityIds = new Set(KNOWN_UNIVERSITIES.map((item) => item.id))

export type ParticipantRole = "leader" | "member"

export type ParticipantValues = {
  fullName: string
  email: string
  whatsappNumber: string
  gender: string
  yearOfStudy: string
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
const MIN_UNIVERSITY_NAME_LENGTH = 3
const MAX_UNIVERSITY_NAME_LENGTH = 150
const MAX_EMAIL_LENGTH = 254

// Emoji (including flags, skin tones, keycaps and the joiners that combine
// them) plus invisible/control characters, which would otherwise let two
// names look identical. Used for team and participant names; ordinary
// keyboard symbols stay allowed.
const DISALLOWED_NAME_CHARACTERS =
  /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}\u20E3\uFE0E\uFE0F\p{Cc}\p{Cf}]/u

// Zero-width (non-)joiners are required to spell some Sinhala and Tamil
// letters (e.g. ශ්\u200Dරී), so they are allowed; emoji built with joiners are
// still rejected by the pictographic check.
export const TEXT_JOINERS = "\u200C\u200D"
const TEXT_JOINER_PATTERN = /[\u200C\u200D]/g

// Person names: letters in any script plus their combining marks (Sinhala and
// Tamil vowel signs are marks), spaces, dots for initials, hyphens, and
// straight or curly apostrophes (D'Souza). No digits, symbols or emoji.
const PERSON_NAME_PATTERN = /^[\p{L}\p{M}\s.'\u{2019}-]+$/u

/** True when the text contains emoji or hidden characters (joiners excepted). */
function hasDisallowedCharacters(value: string) {
  return DISALLOWED_NAME_CHARACTERS.test(value.replace(TEXT_JOINER_PATTERN, ""))
}

/** Trims and collapses runs of whitespace: "  Code   Warriors " -> "Code Warriors". */
export function normalizeTeamName(value: string) {
  return value.trim().replace(/\s+/g, " ")
}

/** Comparison key for uniqueness: case- and joiner-insensitive. */
export function teamNameKey(teamName: string) {
  return normalizeTeamName(teamName)
    .replace(TEXT_JOINER_PATTERN, "")
    .toLowerCase()
}

const emailSchema = z
  .email("Enter a valid email address")
  .max(MAX_EMAIL_LENGTH, "Email address is too long")
  .transform(normalizeEmail)

const whatsappSchema = z
  .string()
  .trim()
  .min(1, "WhatsApp number is required")
  .transform(normalizeWhatsappNumber)
  .superRefine((value, ctx) => {
    const message = getPhoneNumberError(value)
    if (message) ctx.addIssue({ code: "custom", message })
  })

const GENDER_REQUIRED_MESSAGE =
  'Select an option, or choose "Prefer not to say"'
const YEAR_REQUIRED_MESSAGE = "Select the year of study"

function optionSchema(values: readonly string[], message: string) {
  return z
    .string({ error: message })
    .refine((value) => values.includes(value), message)
}

export const participantSchema = z.object({
  fullName: z
    .string()
    .transform(normalizeTeamName)
    .pipe(
      z
        .string()
        .min(2, "Full name must be at least 2 characters")
        .max(
          MAX_NAME_LENGTH,
          `Full name must be at most ${MAX_NAME_LENGTH} characters`
        )
        .refine(
          (value) =>
            PERSON_NAME_PATTERN.test(value.replace(TEXT_JOINER_PATTERN, "")),
          "Names can only contain letters, spaces, dots (.), hyphens (-) and apostrophes (')"
        )
        // Dots count as breaks so initials work: "A.B.C.Perera", "R.Kumar".
        .refine(
          (value) => value.split(/[\s.]+/).filter(Boolean).length >= 2,
          "Enter your full name (at least two words), e.g. Kasun Perera or R. Kumar"
        )
    ),
  email: emailSchema,
  whatsappNumber: whatsappSchema,
  // Strings (not enums) so an unanswered field can default to "" in the form.
  // The same message is used when the value is missing entirely, so users
  // never see Zod's generic "expected string, received undefined".
  gender: optionSchema(GENDER_VALUES, GENDER_REQUIRED_MESSAGE),
  yearOfStudy: optionSchema(YEAR_OF_STUDY_VALUES, YEAR_REQUIRED_MESSAGE),
})

// Unused member slots are not validated in detail, but are still bounded. A
// missing value counts as empty so a hidden slot can never block submission.
const looseParticipantSchema = z.object({
  fullName: z.string().max(MAX_NAME_LENGTH * 2),
  email: z.string().max(MAX_EMAIL_LENGTH * 2),
  whatsappNumber: z.string().max(64),
  gender: z.string().max(32).catch(""),
  yearOfStudy: z.string().max(32).catch(""),
})

const baseRegistrationSchema = z.object({
  country: z.enum(COUNTRY_OPTIONS, "Select a country"),
  teamName: z
    .string()
    .transform(normalizeTeamName)
    .pipe(
      z
        .string()
        .min(2, "Team name is required")
        .max(
          MAX_TEAM_NAME_LENGTH,
          `Team name must be at most ${MAX_TEAM_NAME_LENGTH} characters`
        )
        .refine(
          (value) => !hasDisallowedCharacters(value),
          "Team names can't include emoji or hidden characters"
        )
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

    // Only required (and length-checked) when the university is typed in.
    const universityName = values.otherUniversityName?.trim() ?? ""
    if (values.universityId === OTHER_UNIVERSITY_ID) {
      if (!universityName) {
        ctx.addIssue({
          code: "custom",
          message: "Enter the university name",
          path: ["otherUniversityName"],
        })
      } else if (universityName.length < MIN_UNIVERSITY_NAME_LENGTH) {
        ctx.addIssue({
          code: "custom",
          message: `University name must be at least ${MIN_UNIVERSITY_NAME_LENGTH} characters`,
          path: ["otherUniversityName"],
        })
      }
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
  leader: emptyParticipant(),
  member1: emptyParticipant(),
  member2: emptyParticipant(),
} satisfies RegistrationValues

function emptyParticipant(): ParticipantValues {
  return {
    fullName: "",
    email: "",
    whatsappNumber: "",
    gender: "",
    yearOfStudy: "",
  }
}
