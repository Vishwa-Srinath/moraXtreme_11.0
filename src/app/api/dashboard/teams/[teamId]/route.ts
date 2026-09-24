import { auth } from "@/lib/auth"
import { deleteRegisteredTeam } from "@/lib/registration/admin"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

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
