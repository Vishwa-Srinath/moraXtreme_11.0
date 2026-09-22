import { updateRegistrationSettings } from "@/lib/registration/settings"

export async function PUT(request: Request) {
  try {
    const settings = await updateRegistrationSettings(await request.json())
    return Response.json({ settings })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed"
    return Response.json({ error: message }, { status: 400 })
  }
}
