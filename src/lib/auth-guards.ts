import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"

type Session = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>

export function isAdmin(session: Session | null): session is Session {
  const roles = session?.user.role?.split(",") ?? []
  return roles.includes("admin")
}

/** For route handlers: the session if it belongs to an admin, otherwise an error response. */
export async function getAdminSessionOrError(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session) {
    return {
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  if (!isAdmin(session)) {
    return { error: Response.json({ error: "Forbidden" }, { status: 403 }) }
  }

  return { session }
}

/** For server components: redirects anyone who is not a signed-in admin. */
export async function requireAdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!isAdmin(session)) redirect("/login")

  return session
}
