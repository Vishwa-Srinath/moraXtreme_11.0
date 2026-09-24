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

async function findDraftTeamIdByLeaderEmail(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  leaderEmail: string
) {
  const [draft] = await tx
    .select({ teamId: teams.id })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(
      and(
        eq(teams.status, "draft"),
        eq(teamMembers.role, "leader"),
        eq(teamMembers.email, leaderEmail)
      )
    )
    .limit(1)

  return draft?.teamId ?? null
}

async function writeDraftMembers(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  teamId: string,
  values: RegistrationValues
) {
  const participants = getParticipants(values)

  await tx.delete(teamMembers).where(eq(teamMembers.teamId, teamId))

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

async function upsertDraftTeam(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  values: RegistrationValues
) {
  await ensureKnownUniversities(tx)

  const leaderEmail = normalizeEmail(values.leader.email)
  const existingTeamId = await findDraftTeamIdByLeaderEmail(tx, leaderEmail)
  const universityFields = getUniversityFields(values)

  if (existingTeamId) {
    await tx
      .update(teams)
      .set({
        country: values.country,
        teamName: values.teamName.trim(),
        teamSize: values.teamSize,
        ...universityFields,
      })
      .where(eq(teams.id, existingTeamId))

    await writeDraftMembers(tx, existingTeamId, values)
    return existingTeamId
  }

  const teamId = createId("team")

  await tx.insert(teams).values({
    id: teamId,
    country: values.country,
    teamName: values.teamName.trim(),
    teamSize: values.teamSize,
    status: "draft",
    ...universityFields,
  })

  await writeDraftMembers(tx, teamId, values)
  return teamId
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

export async function syncRegistrationDraft(input: unknown) {
  const values = registrationSchema.parse(input)

  return db.transaction(async (tx) => {
    const teamId = await upsertDraftTeam(tx, values)
    return { teamId }
  })
}

export async function getDraftByLeaderEmail(leaderEmailInput: string) {
  const leaderEmail = normalizeEmail(leaderEmailInput)

  const rows = await db
    .select({
      teamId: teams.id,
      country: teams.country,
      teamName: teams.teamName,
      universityId: teams.universityId,
      customUniversityName: teams.customUniversityName,
      teamSize: teams.teamSize,
      fullName: teamMembers.fullName,
      email: teamMembers.email,
      whatsappNumber: teamMembers.whatsappNumber,
      role: teamMembers.role,
      memberOrder: teamMembers.memberOrder,
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(and(eq(teams.status, "draft"), eq(teamMembers.email, leaderEmail)))

  const leaderRow = rows.find((row) => row.role === "leader")
  if (!leaderRow) return null

  const allRows = await db
    .select({
      fullName: teamMembers.fullName,
      email: teamMembers.email,
      whatsappNumber: teamMembers.whatsappNumber,
      role: teamMembers.role,
      memberOrder: teamMembers.memberOrder,
    })
    .from(teamMembers)
    .where(eq(teamMembers.teamId, leaderRow.teamId))

  const leader = allRows.find((row) => row.role === "leader")
  const member1 = allRows.find((row) => row.memberOrder === 1)
  const member2 = allRows.find((row) => row.memberOrder === 2)

  return {
    country: leaderRow.country ?? "Sri Lanka",
    teamName: leaderRow.teamName,
    universityId: leaderRow.universityId ?? OTHER_UNIVERSITY_ID,
    otherUniversityName: leaderRow.customUniversityName ?? "",
    teamSize: leaderRow.teamSize,
    leader: {
      fullName: leader?.fullName ?? "",
      email: leader?.email ?? leaderEmail,
      whatsappNumber: leader?.whatsappNumber ?? "",
    },
    member1: {
      fullName: member1?.fullName ?? "",
      email: member1?.email ?? "",
      whatsappNumber: member1?.whatsappNumber ?? "",
    },
    member2: {
      fullName: member2?.fullName ?? "",
      email: member2?.email ?? "",
      whatsappNumber: member2?.whatsappNumber ?? "",
    },
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

    const teamId = await upsertDraftTeam(tx, values)
    const registrationCode = await createRegistrationCode(tx)
    const submittedAt = new Date()

    await tx
      .update(teams)
      .set({
        status: "submitted",
        submittedAt,
        registrationCode,
      })
      .where(eq(teams.id, teamId))

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
