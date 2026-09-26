import { and, eq, inArray, or, sql } from "drizzle-orm"

import { db } from "@/lib/db"
import { PublicError, type FieldError } from "@/lib/errors"
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
  normalizeTeamName,
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

type DbExecutor =
  typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0]

/**
 * Team names are unique among submitted teams, ignoring case, spacing and
 * zero-width joiners (the SQL mirrors teamNameKey).
 */
async function teamNameTaken(executor: DbExecutor, teamName: string) {
  const [taken] = await executor
    .select({ id: teams.id })
    .from(teams)
    .where(
      and(
        eq(teams.status, "submitted"),
        sql`lower(translate(regexp_replace(trim(${teams.teamName}), '\\s+', ' ', 'g'), ${TEXT_JOINERS}, '')) = ${teamNameKey(teamName)}`
      )
    )
    .limit(1)

  return Boolean(taken)
}

function teamNameTakenMessage(teamName: string) {
  return `The team name "${teamName}" is already taken. Please choose a different name.`
}

/** Used by the wizard's early check on Step 1 (team names aren't personal data). */
export async function getTeamNameAvailability(teamNameInput: string) {
  const teamName = normalizeTeamName(teamNameInput)
  const taken = teamName.length > 0 && (await teamNameTaken(db, teamName))
  return {
    available: !taken,
    message: taken ? teamNameTakenMessage(teamName) : null,
  }
}

async function assertTeamNameAvailable(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  teamName: string
) {
  if (await teamNameTaken(tx, teamName)) {
    const message = teamNameTakenMessage(teamName)
    throw new PublicError(message, 409, [{ path: "teamName", message }])
  }
}

const PARTICIPANT_PREFIXES = ["leader", "member1", "member2"] as const

/**
 * Rejects emails or WhatsApp numbers already used by a submitted team, naming
 * the exact participant and field so the wizard can highlight it. This only
 * runs on submit; there is deliberately no endpoint to probe it earlier.
 */
async function assertNoSubmittedParticipantConflicts(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  values: RegistrationValues
) {
  const participants = getParticipants(values).map((participant) => ({
    ...participant,
    prefix: PARTICIPANT_PREFIXES[participant.memberOrder],
    email: normalizeEmail(participant.email),
    whatsappNumber: normalizeWhatsappNumber(participant.whatsappNumber),
  }))

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
          inArray(
            teamMembers.email,
            participants.map((participant) => participant.email)
          ),
          inArray(
            teamMembers.whatsappNumber,
            participants.map((participant) => participant.whatsappNumber)
          )
        )
      )
    )

  if (conflicts.length === 0) return

  const takenEmails = new Set(conflicts.map((conflict) => conflict.email))
  const takenPhones = new Set(
    conflicts.map((conflict) => conflict.whatsappNumber)
  )
  const fieldErrors: FieldError[] = []

  for (const participant of participants) {
    if (takenEmails.has(participant.email)) {
      fieldErrors.push({
        path: `${participant.prefix}.email`,
        message: "This email is already registered in another team.",
      })
    }
    if (takenPhones.has(participant.whatsappNumber)) {
      fieldErrors.push({
        path: `${participant.prefix}.whatsappNumber`,
        message: "This WhatsApp number is already registered in another team.",
      })
    }
  }

  const names = [
    ...new Set(
      participants
        .filter((participant) =>
          fieldErrors.some((error) =>
            error.path.startsWith(`${participant.prefix}.`)
          )
        )
        .map((participant) => participant.fullName)
    ),
  ]

  throw new PublicError(
    `Already registered in another team: ${names.join(", ")}. Check the highlighted email or WhatsApp number.`,
    409,
    fieldErrors
  )
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
