import { and, eq, inArray, or } from "drizzle-orm"

import { db } from "@/lib/db"
import { appSettings, teamMembers, teams, universities } from "@/lib/db/schema"

import { KNOWN_UNIVERSITIES, OTHER_UNIVERSITY_ID } from "./constants"
import {
  getParticipants,
  normalizeEmail,
  normalizeWhatsappNumber,
  registrationSchema,
  type RegistrationValues,
  type SubmittedRegistration,
} from "./schema"
import {
  getRegistrationAvailability,
  REGISTRATION_SETTING_KEYS,
} from "./settings"

function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`
}

async function ensureKnownUniversities(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0]
) {
  await tx
    .insert(universities)
    .values(
      KNOWN_UNIVERSITIES.map((university) => ({
        ...university,
        country: "Sri Lanka",
        type: "public" as const,
        isActive: true,
      }))
    )
    .onConflictDoNothing()
}

function getUniversityFields(values: RegistrationValues) {
  if (values.universityId === OTHER_UNIVERSITY_ID) {
    return {
      universityId: null,
      customUniversityName: values.otherUniversityName?.trim() ?? null,
    }
  }

  return { universityId: values.universityId, customUniversityName: null }
}

async function insertTeamMembers(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  teamId: string,
  values: RegistrationValues
) {
  const participants = getParticipants(values)

  await tx.insert(teamMembers).values(
    participants.map((participant) => ({
      id: createId("member"),
      teamId,
      role: participant.role,
      memberOrder: participant.memberOrder,
      fullName: participant.fullName,
      email: normalizeEmail(participant.email),
      whatsappNumber: normalizeWhatsappNumber(participant.whatsappNumber),
    }))
  )
}

async function insertSubmittedTeam(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  values: RegistrationValues,
  registrationCode: string,
  submittedAt: Date
) {
  await ensureKnownUniversities(tx)

  const teamId = createId("team")

  await tx.insert(teams).values({
    id: teamId,
    country: values.country,
    teamName: values.teamName.trim(),
    teamSize: values.teamSize,
    status: "submitted",
    registrationCode,
    submittedAt,
    ...getUniversityFields(values),
  })

  await insertTeamMembers(tx, teamId, values)
}

async function createRegistrationCode(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0]
) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = `MX11-${crypto
      .randomUUID()
      .replace(/-/g, "")
      .slice(0, 6)
      .toUpperCase()}`

    const existing = await tx
      .select({ id: teams.id })
      .from(teams)
      .where(eq(teams.registrationCode, code))
      .limit(1)

    if (existing.length === 0) return code
  }

  throw new Error("Could not generate a registration code")
}

async function assertNoSubmittedParticipantConflicts(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  values: RegistrationValues
) {
  const participants = getParticipants(values)
  const emails = participants.map((participant) =>
    normalizeEmail(participant.email)
  )
  const phones = participants.map((participant) =>
    normalizeWhatsappNumber(participant.whatsappNumber)
  )

  const conflicts = await tx
    .select({
      email: teamMembers.email,
      whatsappNumber: teamMembers.whatsappNumber,
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(
      and(
        eq(teams.status, "submitted"),
        or(
          inArray(teamMembers.email, emails),
          inArray(teamMembers.whatsappNumber, phones)
        )
      )
    )
    .limit(1)

  if (conflicts.length > 0) {
    throw new Error(
      "One or more participant emails or WhatsApp numbers are already registered."
    )
  }
}

export async function submitRegistration(
  input: unknown
): Promise<SubmittedRegistration> {
  const availability = await getRegistrationAvailability()

  if (!availability.isOpen) {
    throw new Error(availability.message)
  }

  const values = registrationSchema.parse(input)

  return db.transaction(async (tx) => {
    await assertNoSubmittedParticipantConflicts(tx, values)

    const registrationCode = await createRegistrationCode(tx)
    const submittedAt = new Date()

    await insertSubmittedTeam(tx, values, registrationCode, submittedAt)

    return {
      teamName: values.teamName.trim(),
      registrationCode,
      submittedAt: submittedAt.toISOString(),
      members: getParticipants(values).map(
        (participant) => participant.fullName
      ),
    }
  })
}

export async function ensureRegistrationSettingsDefaults() {
  await db
    .insert(appSettings)
    .values([
      {
        key: REGISTRATION_SETTING_KEYS.openAt,
        value: null,
        valueType: "timestamp",
        description: "UTC timestamp when registration opens.",
      },
      {
        key: REGISTRATION_SETTING_KEYS.closeAt,
        value: null,
        valueType: "timestamp",
        description: "UTC timestamp when registration closes.",
      },
      {
        key: REGISTRATION_SETTING_KEYS.forceClosed,
        value: false,
        valueType: "boolean",
        description: "Manual override that closes registration immediately.",
      },
      {
        key: REGISTRATION_SETTING_KEYS.closedMessage,
        value: "Registration is currently closed.",
        valueType: "string",
        description: "Message shown when registration is unavailable.",
      },
    ])
    .onConflictDoNothing()
}
