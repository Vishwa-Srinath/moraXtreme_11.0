export const COUNTRY_OPTIONS = [
  { code: "LK", dialCode: "+94", groups: [2, 3, 4] },
  { code: "IN", dialCode: "+91", groups: [5, 5] },
  { code: "BD", dialCode: "+880", groups: [3, 3, 4] },
  { code: "PK", dialCode: "+92", groups: [3, 7] },
  { code: "NP", dialCode: "+977", groups: [2, 3, 4] },
  { code: "MV", dialCode: "+960", groups: [3, 4] },
  { code: "SG", dialCode: "+65", groups: [4, 4] },
  { code: "MY", dialCode: "+60", groups: [2, 3, 4] },
  { code: "AE", dialCode: "+971", groups: [2, 3, 4] },
  { code: "SA", dialCode: "+966", groups: [2, 3, 4] },
  { code: "QA", dialCode: "+974", groups: [4, 4] },
  { code: "GB", dialCode: "+44", groups: [4, 3, 4] },
  { code: "US", dialCode: "+1", groups: [3, 3, 4] },
  { code: "AU", dialCode: "+61", groups: [3, 3, 3] },
  { code: "NZ", dialCode: "+64", groups: [2, 3, 4] },
  { code: "DE", dialCode: "+49", groups: [3, 3, 4] },
  { code: "FR", dialCode: "+33", groups: [1, 2, 2, 2, 2] },
  { code: "NL", dialCode: "+31", groups: [2, 3, 4] },
  { code: "IT", dialCode: "+39", groups: [3, 3, 4] },
  { code: "JP", dialCode: "+81", groups: [2, 4, 4] },
] as const

export type CountryCode = (typeof COUNTRY_OPTIONS)[number]["code"]

export const DEFAULT_COUNTRY = COUNTRY_OPTIONS[0]

const COUNTRIES_BY_DIAL_CODE_LENGTH = [...COUNTRY_OPTIONS].sort(
  (a, b) => b.dialCode.length - a.dialCode.length
)

export function getCountryFromPhone(value: string) {
  return (
    COUNTRIES_BY_DIAL_CODE_LENGTH.find((country) =>
      value.startsWith(country.dialCode)
    ) ?? DEFAULT_COUNTRY
  )
}

export function getCountryByCode(code: CountryCode) {
  return (
    COUNTRY_OPTIONS.find((country) => country.code === code) ?? DEFAULT_COUNTRY
  )
}

export function getNationalNumber(value: string, dialCode: string) {
  return value.startsWith(dialCode)
    ? value.slice(dialCode.length)
    : value.replace(/\D/g, "")
}

export function countryFlag(code: string) {
  return String.fromCodePoint(
    ...code.split("").map((character) => 127397 + character.charCodeAt(0))
  )
}

export function formatNationalNumber(
  value: string,
  groups: readonly number[]
) {
  const parts: string[] = []
  let offset = 0

  for (const size of groups) {
    if (offset >= value.length) break
    parts.push(value.slice(offset, offset + size))
    offset += size
  }

  if (offset < value.length) parts.push(value.slice(offset))
  return parts.join(" ")
}
