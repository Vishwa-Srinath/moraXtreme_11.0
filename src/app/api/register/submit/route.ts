import { submitRegistration } from "@/lib/registration/db"

function errorResponse(error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : "Submission failed"
  return Response.json({ error: message }, { status })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const registration = await submitRegistration(body)
    return Response.json({ registration })
  } catch (error) {
    return errorResponse(error)
  }
}
