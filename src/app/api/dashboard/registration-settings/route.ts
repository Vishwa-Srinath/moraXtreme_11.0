import { getAdminSessionOrError } from "@/lib/auth-guards"
import { errorResponse } from "@/lib/errors"
import { updateRegistrationSettings } from "@/lib/registration/settings"

export async function PUT(request: Request) {
  const { error } = await getAdminSessionOrError(request)
  if (error) return error

  try {
    const settings = await updateRegistrationSettings(await request.json())
    return Response.json({ settings })
  } catch (error) {
    return errorResponse(error, "Settings could not be saved.")
  }
}
