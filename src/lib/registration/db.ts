import { and, eq, inArray, or, sql } from "drizzle-orm"

import { db } from "@/lib/db"
import { PublicError } from "@/lib/errors"
import { appSettings, teamMembers, teams, universities } from "@/lib/db/schema"

import {
  KNOWN_UNIVERSITIES,
  OTHER_UNIVERSITY_ID,
  type Gender,
  type YearOfStudy,
} from "./constants"
import {
  getParticipants,
  normalizeEmail,
  normalizeWhatsappNumber,
  registrationSchema,
  TEXT_JOINERS,
  teamNameKey,
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
      // Validated against the option lists by registrationSchema.
      gender: participant.gender as Gender,
      yearOfStudy: participant.yearOfStudy as YearOfStudy,
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

/**
 * Serializes submissions that share any email or WhatsApp number. The locks are
 * held until the transaction ends, so a concurrent submission waits and then
 * sees the committed members in its conflict check. Keys are sorted so two
 * transactions always lock in the same order and cannot deadlock.
 */
async function lockParticipantIdentifiers(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  values: RegistrationValues
) {
  const keys = getParticipants(values)
    .flatMap((participant) => [
      `email:${normalizeEmail(participant.email)}`,
      `phone:${normalizeWhatsappNumber(participant.whatsappNumber)}`,
    ])
    .concat(`team:${teamNameKey(values.teamName)}`)
    .sort()

  for (const key of keys) {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtextextended(${key}, 0))`
    )
  }
}

/**
 * Team names are unique among submitted teams, ignoring case, spacing and
 * zero-width joiners (the SQL mirrors teamNameKey).
 */
async function assertTeamNameAvailable(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  teamName: string
) {
  const [taken] = await tx
    .select({ id: teams.id })
    .from(teams)
    .where(
      and(
        eq(teams.status, "submitted"),
        sql`lower(translate(regexp_replace(trim(${teams.teamName}), '\\s+', ' ', 'g'), ${TEXT_JOINERS}, '')) = ${teamNameKey(teamName)}`
      )
    )
    .limit(1)

  if (taken) {
    throw new PublicError(
      `The team name "${teamName}" is already taken. Please choose a different name.`,
      409
    )
  }
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
    throw new PublicError(
      "One or more participant emails or WhatsApp numbers are already registered.",
      409
    )
  }
}

export async function submitRegistration(
  input: unknown
): Promise<SubmittedRegistration> {
  const availability = await getRegistrationAvailability()

  if (!availability.isOpen) {
    throw new PublicError(availability.message, 403)
  }

  const whatsappGroupUrl = process.env.WHATSAPP_GROUP_URL
  if (!whatsappGroupUrl) {
    console.error("WHATSAPP_GROUP_URL is not set")
    throw new PublicError(
      "Registration is temporarily unavailable. Please try again later.",
      503
    )
  }

  const values = registrationSchema.parse(input)

  return db.transaction(async (tx) => {
    await lockParticipantIdentifiers(tx, values)
    await assertTeamNameAvailable(tx, values.teamName)
    await assertNoSubmittedParticipantConflicts(tx, values)

    const registrationCode = await createRegistrationCode(tx)
    const submittedAt = new Date()

    await insertSubmittedTeam(tx, values, registrationCode, submittedAt)

    return {
      teamName: values.teamName.trim(),
      whatsappGroupUrl,
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
