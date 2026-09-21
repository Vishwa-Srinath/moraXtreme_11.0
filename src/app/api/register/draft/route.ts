import { z } from "zod"

import {
  getDraftByLeaderEmail,
  syncRegistrationDraft,
} from "@/lib/registration/db"

const draftQuerySchema = z.object({
  leaderEmail: z.email(),
})

function errorResponse(error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : "Request failed"
  return Response.json({ error: message }, { status })
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const result = draftQuerySchema.safeParse({
    leaderEmail: url.searchParams.get("leaderEmail"),
  })

  if (!result.success) {
    return errorResponse(new Error("Enter a valid leader email"))
  }

  try {
    const draft = await getDraftByLeaderEmail(result.data.leaderEmail)
    return Response.json({ draft })
  } catch (error) {
    return errorResponse(error, 500)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const draft = await syncRegistrationDraft(body)
    return Response.json({ draft })
  } catch (error) {
    return errorResponse(error)
  }
}
