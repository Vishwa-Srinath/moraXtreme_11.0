import {
  forwardRef,
  useLayoutEffect,
  useRef,
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
    const formattedNumber = formatNationalNumber(
      nationalNumber,
      selectedCountry.groups
    )

    // Re-formatting ("771234567" -> "77 123 4567") replaces the input's text,
    // which moves the caret to the end. Remember how many digits were before
    // the caret and restore it after that many digits once React re-renders.
    const inputRef = useRef<HTMLInputElement | null>(null)
    const pendingCaretDigits = useRef<number | null>(null)

    useLayoutEffect(() => {
      const input = inputRef.current
      const digitsBefore = pendingCaretDigits.current
      if (!input || digitsBefore === null) return
      pendingCaretDigits.current = null

      let position = 0
      let seen = 0
      while (position < formattedNumber.length && seen < digitsBefore) {
        if (/\d/.test(formattedNumber[position])) seen++
        position++
      }
      input.setSelectionRange(position, position)
    })

    function setInputRef(element: HTMLInputElement | null) {
      inputRef.current = element
      if (typeof ref === "function") ref(element)
      else if (ref) ref.current = element
    }

    function handleCountryChange(code: CountryCode) {
      const country = getCountryByCode(code)
      setSelectedCode(country.code)
      onChange?.(nationalNumber ? `${country.dialCode}${nationalNumber}` : "")
    }

    function handleNumberChange(event: ChangeEvent<HTMLInputElement>) {
      const maxLength = 16 - selectedCountry.dialCode.length
      const rawDigits = event.target.value.replace(/\D/g, "")
      const digits = rawDigits.replace(/^0/, "").slice(0, maxLength)

      const caret = event.target.selectionStart ?? event.target.value.length
      let digitsBeforeCaret = event.target.value
        .slice(0, caret)
        .replace(/\D/g, "").length
      // A stripped leading 0 was before the caret, so it no longer counts.
      if (rawDigits.startsWith("0") && digitsBeforeCaret > 0) {
        digitsBeforeCaret--
      }
      pendingCaretDigits.current = Math.min(digitsBeforeCaret, digits.length)

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
          ref={setInputRef}
          id={id}
          name={name}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          disabled={disabled}
          placeholder={placeholder ?? selectedCountry.example}
          value={formattedNumber}
          className="h-full min-w-0 flex-1 rounded-l-none border-0 shadow-none focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent"
          onBlur={onBlur}
          onChange={handleNumberChange}
        />
      </div>
    )
  }
)
