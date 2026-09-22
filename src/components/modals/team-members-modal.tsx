"use client"

import type { RegisteredTeam } from "@/lib/registration/admin"
import type { ModalComponentProps } from "./modal-registry"
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function TeamMembersModal({
  data,
}: ModalComponentProps<{ team: RegisteredTeam }>) {
  return (
    <DialogContent className="sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle>{data.team.teamName} members</DialogTitle>
        <DialogDescription>
          {data.team.members.length} registered participant
          {data.team.members.length === 1 ? "" : "s"} in this team.
        </DialogDescription>
      </DialogHeader>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>WhatsApp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.team.members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.fullName}</TableCell>
                <TableCell className="capitalize">{member.role}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.whatsappNumber}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DialogContent>
  )
}
