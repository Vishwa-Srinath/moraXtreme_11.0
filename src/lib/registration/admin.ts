import { and, asc, desc, eq } from "drizzle-orm"
import { connection } from "next/server"

import { db } from "@/lib/db"
import { teamMembers, teams, universities } from "@/lib/db/schema"
import {
  GENDER_OPTIONS,
  getOptionLabel,
  YEAR_OF_STUDY_OPTIONS,
} from "@/lib/registration/constants"

export type RegisteredTeamMember = {
  id: string
  role: "leader" | "member"
  memberOrder: number
  fullName: string
  email: string
  whatsappNumber: string
  /** Display labels; "Not provided" for teams registered before these fields. */
  gender: string
  yearOfStudy: string
}

export type RegisteredTeam = {
  id: string
  teamName: string
  country: string
  universityName: string
  teamSize: number
  registrationCode: string | null
  submittedAt: string | null
  members: RegisteredTeamMember[]
}

export async function getRegisteredTeams(): Promise<RegisteredTeam[]> {
  await connection()

  const rows = await db
    .select({
      id: teams.id,
      teamName: teams.teamName,
      country: teams.country,
      universityName: universities.name,
      customUniversityName: teams.customUniversityName,
      teamSize: teams.teamSize,
      registrationCode: teams.registrationCode,
      submittedAt: teams.submittedAt,
      memberId: teamMembers.id,
      role: teamMembers.role,
      memberOrder: teamMembers.memberOrder,
      fullName: teamMembers.fullName,
      email: teamMembers.email,
      whatsappNumber: teamMembers.whatsappNumber,
      gender: teamMembers.gender,
      yearOfStudy: teamMembers.yearOfStudy,
    })
    .from(teams)
    .leftJoin(universities, eq(teams.universityId, universities.id))
    .innerJoin(teamMembers, eq(teamMembers.teamId, teams.id))
    .where(eq(teams.status, "submitted"))
    .orderBy(desc(teams.submittedAt), asc(teamMembers.memberOrder))

  const registeredTeams = new Map<string, RegisteredTeam>()

  for (const row of rows) {
    const team = registeredTeams.get(row.id) ?? {
      id: row.id,
      teamName: row.teamName,
      country: row.country ?? "Not specified",
      universityName:
        row.universityName ?? row.customUniversityName ?? "Not specified",
      teamSize: row.teamSize,
      registrationCode: row.registrationCode,
      submittedAt: row.submittedAt?.toISOString() ?? null,
      members: [],
    }

    team.members.push({
      id: row.memberId,
      role: row.role,
      memberOrder: row.memberOrder,
      fullName: row.fullName,
      email: row.email,
      whatsappNumber: row.whatsappNumber,
      gender:
        (row.gender && getOptionLabel(GENDER_OPTIONS, row.gender)) ||
        "Not provided",
      yearOfStudy:
        (row.yearOfStudy &&
          getOptionLabel(YEAR_OF_STUDY_OPTIONS, row.yearOfStudy)) ||
        "Not provided",
    })
    registeredTeams.set(row.id, team)
  }

  return Array.from(registeredTeams.values())
}

export async function deleteRegisteredTeam(teamId: string) {
  const [deletedTeam] = await db
    .delete(teams)
    .where(and(eq(teams.id, teamId), eq(teams.status, "submitted")))
    .returning({ id: teams.id })

  return Boolean(deletedTeam)
}
