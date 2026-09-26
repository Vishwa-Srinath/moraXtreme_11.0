// Common personal email domains. A domain within two edits of one of these
// (e.g. "gmial.com", "gmail.con", "yaho.com") is probably a typo.
const COMMON_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "protonmail.com",
  "proton.me",
  "ymail.com",
]

// Real providers that happen to be close to a common domain; never "correct" them.
const OTHER_REAL_DOMAINS = [
  "mail.com",
  "gmx.com",
  "aol.com",
  "msn.com",
  "zoho.com",
  "yandex.com",
  "rediffmail.com",
  "yahoo.co.in",
  "yahoo.in",
  "outlook.in",
  "hotmail.co.uk",
]

function editDistance(a: string, b: string) {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index)

  for (let i = 1; i <= a.length; i++) {
    let diagonal = previous[0]
    previous[0] = i

    for (let j = 1; j <= b.length; j++) {
      const above = previous[j]
      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
      diagonal = above
    }
  }

  return previous[b.length]
}

/**
 * Returns a corrected address when the domain looks like a typo of a common
 * provider, otherwise null. Only a hint: unusual domains (e.g. university
 * addresses) are never flagged as wrong.
 */
export function suggestEmailCorrection(email: string) {
  const [localPart, domain, ...rest] = email.trim().toLowerCase().split("@")
  if (!localPart || !domain || rest.length > 0) return null
  if (COMMON_DOMAINS.includes(domain) || OTHER_REAL_DOMAINS.includes(domain)) {
    return null
  }

  let best: { domain: string; distance: number } | null = null
  for (const candidate of COMMON_DOMAINS) {
    const distance = editDistance(domain, candidate)
    if (distance <= 2 && (!best || distance < best.distance)) {
      best = { domain: candidate, distance }
    }
  }

  return best ? `${localPart}@${best.domain}` : null
}
