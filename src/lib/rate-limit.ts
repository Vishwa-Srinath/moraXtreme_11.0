import { lt, sql } from "drizzle-orm"

import { db } from "@/lib/db"
import { rateLimits } from "@/lib/db/schema"

type RateLimitOptions = {
  /** Namespace for the counter, e.g. "register-submit". */
  name: string
  limit: number
  windowSeconds: number
}

/**
 * The client IP as reported by the hosting proxy. Only trustworthy when the app
 * runs behind a proxy that overwrites these headers (Vercel, Cloudflare, nginx).
 */
export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]
  return (
    forwarded?.trim() || request.headers.get("x-real-ip")?.trim() || "unknown"
  )
}

/**
 * Counts a request against a fixed window stored in Postgres, so the limit holds
 * across server instances and restarts. Returns whether the request is allowed.
 */
export async function checkRateLimit(
  request: Request,
  { name, limit, windowSeconds }: RateLimitOptions
) {
  const key = `${name}:${getClientIp(request)}`
  const windowExpired = sql`${rateLimits.windowStart} <= now() - make_interval(secs => ${windowSeconds})`

  const [row] = await db
    .insert(rateLimits)
    .values({ key, count: 1, windowStart: sql`now()` })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`case when ${windowExpired} then 1 else ${rateLimits.count} + 1 end`,
        windowStart: sql`case when ${windowExpired} then now() else ${rateLimits.windowStart} end`,
      },
    })
    .returning({ count: rateLimits.count, windowStart: rateLimits.windowStart })

  // Occasionally prune stale counters so the table stays small.
  if (Math.random() < 0.01) {
    await db
      .delete(rateLimits)
      .where(lt(rateLimits.windowStart, sql`now() - interval '1 day'`))
  }

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil(
      (row.windowStart.getTime() + windowSeconds * 1000 - Date.now()) / 1000
    )
  )

  return { allowed: row.count <= limit, retryAfterSeconds }
}
