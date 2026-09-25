import { checkRateLimit } from "@/lib/rate-limit"
import { submitRegistration } from "@/lib/registration/db"

// Generous because many Sri Lankan mobile users and university networks share
// one public IP (CGNAT); this stops scripted floods, not busy campuses.
const SUBMIT_RATE_LIMIT = {
  name: "register-submit",
  limit: 10,
  windowSeconds: 10 * 60,
}

function errorResponse(error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : "Submission failed"
  return Response.json({ error: message }, { status })
}

export async function POST(request: Request) {
  try {
    const { allowed, retryAfterSeconds } = await checkRateLimit(
      request,
      SUBMIT_RATE_LIMIT
    )

    if (!allowed) {
      return Response.json(
        {
          error: `Too many registration attempts. Please try again in ${Math.ceil(retryAfterSeconds / 60)} minute(s).`,
        },
        { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
      )
    }

    const body = await request.json()
    const registration = await submitRegistration(body)
    return Response.json({ registration })
  } catch (error) {
    return errorResponse(error)
  }
}
