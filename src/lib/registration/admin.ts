import { asc, desc, eq } from "drizzle-orm"
import { connection } from "next/server"

import { db } from "@/lib/db"
import { teamMembers, teams, universities } from "@/lib/db/schema"

export type RegisteredTeamMember = {
  id: string
  role: "leader" | "member"
  memberOrder: number
  fullName: string
  email: string
  whatsappNumber: string
}

export type RegisteredTeam = {
  id: string
  teamName: string
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
    })
    registeredTeams.set(row.id, team)
  }

  return Array.from(registeredTeams.values())
}
