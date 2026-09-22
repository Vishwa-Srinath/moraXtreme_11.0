import {
  forwardRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
} from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  COUNTRY_OPTIONS,
  DEFAULT_COUNTRY,
  countryFlag,
  formatNationalNumber,
  getCountryByCode,
  getCountryFromPhone,
  getNationalNumber,
  type CountryCode,
} from "./phone-input-config"

type PhoneInputProps = Omit<ComponentProps<"input">, "onChange" | "value"> & {
  value?: string
  onChange?: (value: string) => void
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput(
    { className, disabled, id, name, onBlur, onChange, value = "", ...props },
    ref
  ) {
    const [selectedCode, setSelectedCode] =
      useState<CountryCode>(DEFAULT_COUNTRY.code)
    const selectedCountry = value
      ? getCountryFromPhone(value)
      : getCountryByCode(selectedCode)
    const nationalNumber = getNationalNumber(
      value,
      selectedCountry.dialCode
    )

    function handleCountryChange(event: ChangeEvent<HTMLSelectElement>) {
      const country = getCountryByCode(event.target.value as CountryCode)
      setSelectedCode(country.code)
      onChange?.(nationalNumber ? `${country.dialCode}${nationalNumber}` : "")
    }

    function handleNumberChange(event: ChangeEvent<HTMLInputElement>) {
      const maxLength = 16 - selectedCountry.dialCode.length
      const digits = event.target.value
        .replace(/\D/g, "")
        .replace(/^0/, "")
        .slice(0, maxLength)

      onChange?.(digits ? `${selectedCountry.dialCode}${digits}` : "")
    }

    return (
      <div
        className={cn(
          "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-[input[aria-invalid=true]]:border-destructive has-[input[aria-invalid=true]]:ring-3 has-[input[aria-invalid=true]]:ring-destructive/20 dark:bg-input/30",
          className
        )}
      >
        <select
          aria-label="Country code"
          className="h-full w-24 shrink-0 rounded-l-md border-r bg-transparent px-2.5 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          value={selectedCountry.code}
          onChange={handleCountryChange}
        >
          {COUNTRY_OPTIONS.map((country) => (
            <option key={country.code} value={country.code}>
              {countryFlag(country.code)} {country.dialCode}
            </option>
          ))}
        </select>
        <Input
          {...props}
          ref={ref}
          id={id}
          name={name}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          disabled={disabled}
          value={formatNationalNumber(nationalNumber, selectedCountry.groups)}
          className="h-full min-w-0 flex-1 rounded-l-none border-0 shadow-none focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent"
          onBlur={onBlur}
          onChange={handleNumberChange}
        />
      </div>
    )
  }
)
