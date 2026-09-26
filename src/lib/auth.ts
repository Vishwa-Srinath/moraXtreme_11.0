import { drizzleAdapter } from "@better-auth/drizzle-adapter"
import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { admin } from "better-auth/plugins"

import { db } from "@/lib/db"
import * as schema from "@/lib/db/schema"

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    // Admin accounts are created from the dashboard or `npm run admin:create`.
    disableSignUp: true,
    minPasswordLength: 12,
  },
  // Only admins sign in, so keep sessions short: an idle session expires after
  // 12 hours (default 7 days). Active use renews it at most once an hour.
  session: {
    expiresIn: 60 * 60 * 12,
    updateAge: 60 * 60,
  },
  // Stored in Postgres (the `auth_rate_limits` table) so limits hold across
  // server instances. Keyed by client IP from X-Forwarded-For.
  rateLimit: {
    enabled: true,
    storage: "database",
    modelName: "authRateLimit",
    customRules: {
      // Default is 3 per 10s, which still allows ~26k guesses a day per IP.
      "/sign-in/email": { window: 15 * 60, max: 10 },
    },
  },
  plugins: [admin(), nextCookies()],
})
