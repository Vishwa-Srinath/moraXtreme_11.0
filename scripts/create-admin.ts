/**
 * Creates an admin account. Public sign-up is disabled, so use this for the
 * first admin; later admins can be created from /dashboard/users.
 *
 * Usage: npm run admin:create -- <email> "<full name>"
 * A random password is generated and printed once.
 */
import { randomBytes } from "node:crypto"

import { auth } from "@/lib/auth"

const [email, name] = process.argv.slice(2)

if (!email || !name) {
  console.error('Usage: npm run admin:create -- <email> "<full name>"')
  process.exit(1)
}

const password = randomBytes(18).toString("base64url")

try {
  const { user } = await auth.api.createUser({
    body: { email, name, password, role: "admin" },
  })

  console.log(`Created admin ${user.email}`)
  console.log(`Password: ${password}`)
  console.log("Store it in a password manager; it will not be shown again.")
  process.exit(0)
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
