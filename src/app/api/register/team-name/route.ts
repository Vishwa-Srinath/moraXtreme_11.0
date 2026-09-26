import { z } from "zod"

import { errorResponse } from "@/lib/errors"
import { checkRateLimit } from "@/lib/rate-limit"
import { getTeamNameAvailability } from "@/lib/registration/db"

// Early "is this team name taken?" check for Step 1. Team names are not
// personal data (they appear on the leaderboard), unlike emails and phone
// numbers, which are only checked on submit so they can't be probed.
const TEAM_NAME_RATE_LIMIT = {
  name: "register-team-name",
  limit: 30,
  windowSeconds: 10 * 60,
}

const querySchema = z.object({ name: z.string().trim().min(1).max(120) })

export async function GET(request: Request) {
  try {
    const { allowed, retryAfterSeconds } = await checkRateLimit(
      request,
      TEAM_NAME_RATE_LIMIT
    )

    if (!allowed) {
      return Response.json(
        { error: "Too many checks. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
      )
    }

    const { name } = querySchema.parse({
      name: new URL(request.url).searchParams.get("name") ?? "",
    })

    return Response.json(await getTeamNameAvailability(name))
  } catch (error) {
    return errorResponse(error, "Could not check the team name.")
  }
}
