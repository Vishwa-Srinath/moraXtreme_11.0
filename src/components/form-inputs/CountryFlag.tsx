import {
  AE,
  AF,
  AU,
  BD,
  BT,
  DE,
  FR,
  GB,
  IN,
  IT,
  JP,
  LK,
  MV,
  MY,
  NL,
  NP,
  NZ,
  PK,
  QA,
  SA,
  SG,
  US,
} from "country-flag-icons/react/3x2"

import { cn } from "@/lib/utils"

import type { CountryCode } from "./phone-input-config"

// SVG flags instead of emoji: Windows has no emoji flags and shows "LK", "IN".
// Typed as a Record so adding a country code without a flag fails typecheck.
const FLAGS: Record<CountryCode, typeof LK> = {
  LK,
  IN,
  BD,
  PK,
  NP,
  BT,
  MV,
  AF,
  SG,
  MY,
  AE,
  SA,
  QA,
  GB,
  US,
  AU,
  NZ,
  DE,
  FR,
  NL,
  IT,
  JP,
}

export function CountryFlag({
  code,
  className,
}: {
  code: CountryCode
  className?: string
}) {
  const Flag = FLAGS[code]

  return (
    <Flag
      aria-hidden
      className={cn(
        "h-3.5 w-auto shrink-0 rounded-[2px] ring-1 ring-black/10",
        className
      )}
    />
  )
}
