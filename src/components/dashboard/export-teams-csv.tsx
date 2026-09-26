"use client"

import { DownloadIcon } from "lucide-react"
import Papa from "papaparse"

import { Button } from "@/components/ui/button"
import type {
  RegisteredTeam,
  RegisteredTeamMember,
} from "@/lib/registration/admin"

const columns = [
  "team_id",
  "team_name",
  "country",
  "university",
  "team_size",
  "registration_code",
  "submitted_at",
  "leader_name",
  "leader_email",
  "leader_whatsapp",
  "leader_gender",
  "leader_year_of_study",
  "member_1_name",
  "member_1_email",
  "member_1_whatsapp",
  "member_1_gender",
  "member_1_year_of_study",
  "member_2_name",
  "member_2_email",
  "member_2_whatsapp",
  "member_2_gender",
  "member_2_year_of_study",
] as const

function memberFields(member?: RegisteredTeamMember) {
  return [
    member?.fullName ?? "",
    member?.email ?? "",
    member?.whatsappNumber ?? "",
    member?.gender ?? "",
    member?.yearOfStudy ?? "",
  ]
}

export function ExportTeamsCsv({ teams }: { teams: RegisteredTeam[] }) {
  function exportCsv() {
    const rows = teams.map((team) => {
      const leader = team.members.find((member) => member.role === "leader")
      const members = team.members
        .filter((member) => member.role === "member")
        .sort((a, b) => a.memberOrder - b.memberOrder)

      return [
        team.id,
        team.teamName,
        team.country,
        team.universityName,
        team.teamSize,
        team.registrationCode,
        team.submittedAt,
        ...memberFields(leader),
        ...memberFields(members[0]),
        ...memberFields(members[1]),
      ]
    })
    const csv = Papa.unparse(
      { fields: [...columns], data: rows },
      { escapeFormulae: true, newline: "\r\n", quotes: true }
    )
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = `registered-teams-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="outline" onClick={exportCsv} disabled={teams.length === 0}>
      <DownloadIcon />
      Export CSV
    </Button>
  )
}
