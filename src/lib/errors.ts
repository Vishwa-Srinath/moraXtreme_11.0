import { z } from "zod"

/** A message tied to one form field, e.g. { path: "member1.email", ... }. */
export type FieldError = { path: string; message: string }

/** An error whose message is safe to show to the person making the request. */
export class PublicError extends Error {
  constructor(
    message: string,
    readonly status = 400,
    /** Optional per-field details so the form can highlight the exact input. */
    readonly fieldErrors: FieldError[] = []
  ) {
    super(message)
    this.name = "PublicError"
  }
}

/**
 * Turns a caught error into a JSON response without leaking internals: only
 * `PublicError` and validation messages reach the client, anything else is
 * logged and replaced with `fallbackMessage`.
 */
export function errorResponse(error: unknown, fallbackMessage: string) {
  if (error instanceof PublicError) {
    return Response.json(
      {
        error: error.message,
        ...(error.fieldErrors.length > 0 && { fieldErrors: error.fieldErrors }),
      },
      { status: error.status }
    )
  }

  if (error instanceof z.ZodError) {
    const message = error.issues[0]?.message ?? "Invalid request"
    return Response.json({ error: message }, { status: 400 })
  }

  // request.json() throws a SyntaxError on a malformed body.
  if (error instanceof SyntaxError) {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  console.error(error)
  return Response.json({ error: fallbackMessage }, { status: 500 })
}
