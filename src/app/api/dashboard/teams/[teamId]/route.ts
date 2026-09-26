import { getAdminSessionOrError } from "@/lib/auth-guards"
import { deleteRegisteredTeam } from "@/lib/registration/admin"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { error } = await getAdminSessionOrError(request)
  if (error) return error

  const { teamId } = await params
  const deleted = await deleteRegisteredTeam(teamId)

  if (!deleted) {
    return Response.json(
      { error: "Registered team not found" },
      { status: 404 }
    )
  }

  return Response.json({ success: true })
}
