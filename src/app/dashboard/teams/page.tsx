import { ExportTeamsCsv } from "@/components/dashboard/export-teams-csv"
import { TeamRowActions } from "@/components/dashboard/team-row-actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { requireAdminPage } from "@/lib/auth-guards"
import { getRegisteredTeams } from "@/lib/registration/admin"

function formatSubmittedAt(value: string | null) {
  if (!value) return "Not available"
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default async function RegisteredTeamsPage() {
  await requireAdminPage()
  const teams = await getRegisteredTeams()

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Registration
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            Registered teams
          </h2>
          <p className="text-muted-foreground">
            Review every team that completed registration.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg border bg-muted/30 px-4 py-2 text-sm">
            <span className="font-semibold">{teams.length}</span>{" "}
            <span className="text-muted-foreground">
              team{teams.length === 1 ? "" : "s"}
            </span>
          </div>
          <ExportTeamsCsv teams={teams} />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {teams.length === 0 ? (
          <div className="grid min-h-64 place-items-center p-8 text-center">
            <div>
              <h3 className="font-semibold">No registered teams yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Submitted registrations will appear here.
              </p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Team</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="pl-4 font-medium">
                    {team.teamName}
                  </TableCell>
                  <TableCell>{team.country}</TableCell>
                  <TableCell>{team.universityName}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {team.registrationCode ?? "Pending"}
                  </TableCell>
                  <TableCell>{team.members.length}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatSubmittedAt(team.submittedAt)}
                  </TableCell>
                  <TableCell>
                    <TeamRowActions team={team} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
