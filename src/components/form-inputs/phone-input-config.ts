type MobileRule = {
  /** Exact number of digits after the dial code. */
  length: number
  /** First digit(s) of a mobile number, which is what WhatsApp needs. */
  prefix: RegExp
}

// Registration countries (South Asia) get exact mobile-number rules so a
// number typed under the wrong dial code is caught. Other codes are accepted
// for participants who use a foreign WhatsApp number, with a loose length check.
export const COUNTRY_OPTIONS = [
  {
    code: "LK",
    name: "Sri Lanka",
    dialCode: "+94",
    groups: [2, 3, 4],
    example: "77 123 4567",
    mobile: { length: 9, prefix: /^7/ },
  },
  {
    code: "IN",
    name: "India",
    dialCode: "+91",
    groups: [5, 5],
    example: "98765 43210",
    mobile: { length: 10, prefix: /^[6-9]/ },
  },
  {
    code: "BD",
    name: "Bangladesh",
    dialCode: "+880",
    groups: [3, 3, 4],
    example: "171 234 5678",
    mobile: { length: 10, prefix: /^(?:1|64)/ },
  },
  {
    code: "PK",
    name: "Pakistan",
    dialCode: "+92",
    groups: [3, 7],
    example: "301 2345678",
    mobile: { length: 10, prefix: /^3/ },
  },
  {
    code: "NP",
    name: "Nepal",
    dialCode: "+977",
    groups: [3, 3, 4],
    example: "984 123 4567",
    mobile: { length: 10, prefix: /^9/ },
  },
  {
    code: "BT",
    name: "Bhutan",
    dialCode: "+975",
    groups: [2, 3, 3],
    example: "17 123 456",
    mobile: { length: 8, prefix: /^[178]/ },
  },
  {
    code: "MV",
    name: "Maldives",
    dialCode: "+960",
    groups: [3, 4],
    example: "771 2345",
    mobile: { length: 7, prefix: /^(?:[79]|46)/ },
  },
  {
    code: "AF",
    name: "Afghanistan",
    dialCode: "+93",
    groups: [2, 3, 4],
    example: "70 123 4567",
    mobile: { length: 9, prefix: /^7/ },
  },
  {
    code: "SG",
    name: "Singapore",
    dialCode: "+65",
    groups: [4, 4],
    example: "8123 4567",
  },
  {
    code: "MY",
    name: "Malaysia",
    dialCode: "+60",
    groups: [2, 3, 4],
    example: "12 345 6789",
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    dialCode: "+971",
    groups: [2, 3, 4],
    example: "50 123 4567",
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    dialCode: "+966",
    groups: [2, 3, 4],
    example: "50 123 4567",
  },
  {
    code: "QA",
    name: "Qatar",
    dialCode: "+974",
    groups: [4, 4],
    example: "3312 3456",
  },
  {
    code: "GB",
    name: "United Kingdom",
    dialCode: "+44",
    groups: [4, 3, 3],
    example: "7400 123 456",
  },
  {
    code: "US",
    name: "United States",
    dialCode: "+1",
    groups: [3, 3, 4],
    example: "201 555 0123",
  },
  {
    code: "AU",
    name: "Australia",
    dialCode: "+61",
    groups: [3, 3, 3],
    example: "412 345 678",
  },
  {
    code: "NZ",
    name: "New Zealand",
    dialCode: "+64",
    groups: [2, 3, 4],
    example: "21 123 4567",
  },
  {
    code: "DE",
    name: "Germany",
    dialCode: "+49",
    groups: [3, 3, 4],
    example: "151 234 5678",
  },
  {
    code: "FR",
    name: "France",
    dialCode: "+33",
    groups: [1, 2, 2, 2, 2],
    example: "6 12 34 56 78",
  },
  {
    code: "NL",
    name: "Netherlands",
    dialCode: "+31",
    groups: [1, 4, 4],
    example: "6 1234 5678",
  },
  {
    code: "IT",
    name: "Italy",
    dialCode: "+39",
    groups: [3, 3, 4],
    example: "312 345 6789",
  },
  {
    code: "JP",
    name: "Japan",
    dialCode: "+81",
    groups: [2, 4, 4],
    example: "90 1234 5678",
  },
] as const satisfies readonly {
  code: string
  name: string
  dialCode: string
  groups: readonly number[]
  example: string
  mobile?: MobileRule
}[]

export type CountryCode = (typeof COUNTRY_OPTIONS)[number]["code"]

export const DEFAULT_COUNTRY = COUNTRY_OPTIONS[0]

const COUNTRIES_BY_DIAL_CODE_LENGTH = [...COUNTRY_OPTIONS].sort(
  (a, b) => b.dialCode.length - a.dialCode.length
)

function findCountryByPhone(value: string) {
  return COUNTRIES_BY_DIAL_CODE_LENGTH.find((country) =>
    value.startsWith(country.dialCode)
  )
}

export function getCountryFromPhone(value: string) {
  return findCountryByPhone(value) ?? DEFAULT_COUNTRY
}

/**
 * Validates a full number such as "+94771234567". Returns an error message, or
 * null when the number is valid. Shared by the form and the server schema.
 */
export function getPhoneNumberError(value: string) {
  const country = findCountryByPhone(value)
  if (!country) return "Select a country code and enter the number."

  const digits = value.slice(country.dialCode.length)
  if (!/^\d+$/.test(digits)) return "Enter the number using digits only."

  const expected = `Enter a valid ${country.name} WhatsApp number (${country.dialCode}), e.g. ${country.example}.`

  if ("mobile" in country) {
    const { length, prefix } = country.mobile
    return digits.length === length && prefix.test(digits) ? null : expected
  }

  return digits.length >= 6 && digits.length <= 12 ? null : expected
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

export function formatNationalNumber(value: string, groups: readonly number[]) {
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
