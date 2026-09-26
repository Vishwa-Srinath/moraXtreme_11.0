import {
  forwardRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
} from "react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

import { CountryFlag } from "./CountryFlag"
import {
  COUNTRY_OPTIONS,
  DEFAULT_COUNTRY,
  formatNationalNumber,
  getCountryByCode,
  getCountryFromPhone,
  getNationalNumber,
  type CountryCode,
} from "./phone-input-config"

type PhoneInputProps = Omit<ComponentProps<"input">, "onChange" | "value"> & {
  value?: string
  onChange?: (value: string) => void
  /** Country code shown while the field is empty and none has been picked. */
  defaultCountry?: CountryCode
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput(
    {
      className,
      defaultCountry = DEFAULT_COUNTRY.code,
      disabled,
      id,
      name,
      onBlur,
      onChange,
      placeholder,
      value = "",
      ...props
    },
    ref
  ) {
    const [selectedCode, setSelectedCode] = useState<CountryCode | null>(null)
    const selectedCountry = value
      ? getCountryFromPhone(value)
      : getCountryByCode(selectedCode ?? defaultCountry)
    const nationalNumber = getNationalNumber(value, selectedCountry.dialCode)

    function handleCountryChange(code: CountryCode) {
      const country = getCountryByCode(code)
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
        <Select
          value={selectedCountry.code}
          disabled={disabled}
          onValueChange={(code) => {
            if (code) handleCountryChange(code as CountryCode)
          }}
        >
          <SelectTrigger
            aria-label="Country code"
            className="h-full shrink-0 rounded-l-md rounded-r-none border-0 border-r bg-transparent pl-2.5 shadow-none focus-visible:ring-0 data-[size=default]:h-full dark:bg-transparent"
          >
            <SelectValue>
              {(code: CountryCode) => (
                <>
                  <CountryFlag code={code} />
                  {getCountryByCode(code).dialCode}
                </>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent
            align="start"
            alignItemWithTrigger={false}
            className="w-auto min-w-64"
          >
            {COUNTRY_OPTIONS.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <CountryFlag code={country.code} />
                <span className="flex-1">{country.name}</span>
                <span className="text-muted-foreground">
                  {country.dialCode}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          {...props}
          ref={ref}
          id={id}
          name={name}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          disabled={disabled}
          placeholder={placeholder ?? selectedCountry.example}
          value={formatNationalNumber(nationalNumber, selectedCountry.groups)}
          className="h-full min-w-0 flex-1 rounded-l-none border-0 shadow-none focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent"
          onBlur={onBlur}
          onChange={handleNumberChange}
        />
      </div>
    )
  }
)
