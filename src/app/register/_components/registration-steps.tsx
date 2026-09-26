"use client"

import { useEffect, useRef, useState } from "react"
import { Controller, useFormContext, useWatch } from "react-hook-form"

import { PhoneInput } from "@/components/form-inputs/PhoneInput"
import {
  formatNationalNumber,
  getCountryFromPhone,
  getNationalNumber,
  type CountryCode,
} from "@/components/form-inputs/phone-input-config"
import Form from "@/components/form/Form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  COUNTRY_OPTIONS,
  GENDER_OPTIONS,
  getOptionLabel,
  OTHER_UNIVERSITY_ID,
  TEAM_SIZE_OPTIONS,
  UNIVERSITY_OPTIONS,
  YEAR_OF_STUDY_OPTIONS,
} from "@/lib/registration/constants"
import { suggestEmailCorrection } from "@/lib/registration/email-suggestion"
import {
  registrationSchema,
  type RegistrationValues,
} from "@/lib/registration/schema"
import { cn } from "@/lib/utils"

import {
  getUniversityLabel,
  type ParticipantPrefix,
  type RegistrationForm,
  type RegistrationStep,
  type StepId,
} from "./registration-config"

export function RegistrationStepContent({
  step,
  form,
  values,
  steps,
  onEdit,
}: {
  step: RegistrationStep
  form: RegistrationForm
  values: RegistrationValues
  steps: RegistrationStep[]
  onEdit: (stepId: StepId) => void
}) {
  switch (step.id) {
    case "team":
      return <TeamDetailsStep form={form} />
    case "leader":
    case "member1":
    case "member2":
      return <ParticipantStep prefix={step.id} roleLabel={step.title} />
    case "review":
      return <ReviewStep values={values} steps={steps} onEdit={onEdit} />
  }
}

function TeamDetailsStep({ form }: { form: RegistrationForm }) {
  const country = form.watch("country")
  const universityId = form.watch("universityId")
  const isSriLanka = country === "Sri Lanka"
  // The Sri Lankan university picked before switching to another country, so
  // switching back restores it instead of leaving "Other" selected.
  const sriLankanUniversityId = useRef("")

  function handleCountryChange(nextCountry: RegistrationValues["country"]) {
    const nextIsSriLanka = nextCountry === "Sri Lanka"
    form.setValue("country", nextCountry, { shouldDirty: true })

    if (isSriLanka && !nextIsSriLanka) {
      sriLankanUniversityId.current = form.getValues("universityId")
      form.setValue("universityId", OTHER_UNIVERSITY_ID, { shouldDirty: true })
    } else if (!isSriLanka && nextIsSriLanka) {
      form.setValue("universityId", sriLankanUniversityId.current, {
        shouldDirty: true,
      })
    }

    // Don't flag the university fields before the person has touched them.
    form.clearErrors(["universityId", "otherUniversityName"])
  }

  // Safety net for restored drafts: non-Sri Lankan teams always use "Other".
  useEffect(() => {
    if (!isSriLanka && universityId !== OTHER_UNIVERSITY_ID) {
      form.setValue("universityId", OTHER_UNIVERSITY_ID)
    }
  }, [form, isSriLanka, universityId])

  return (
    <div className="grid gap-4 @2xl:grid-cols-2">
      <Form.Item name="teamName" label="Team Name" className="@2xl:col-span-2">
        <Input placeholder="Enter your team name" />
      </Form.Item>

      <Controller
        control={form.control}
        name="country"
        render={(controller) => (
          <Form.CustomController {...controller} label="Country">
            <Select
              value={controller.field.value}
              onValueChange={(value) =>
                handleCountryChange(value as RegistrationValues["country"])
              }
            >
              <SelectTrigger
                aria-invalid={controller.fieldState.invalid}
                className={
                  controller.fieldState.invalid
                    ? "border-destructive ring-destructive/20"
                    : ""
                }
              >
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_OPTIONS.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Form.CustomController>
        )}
      />

      {isSriLanka ? (
        <Controller
          control={form.control}
          name="universityId"
          render={(controller) => (
            <Form.CustomController
              {...controller}
              label="University"
              helperText="Search the list or choose Other."
            >
              <UniversityCombobox
                value={controller.field.value}
                onChange={(universityId) => {
                  controller.field.onChange(universityId)
                  // Clear a "Select a university" error left by an earlier Next.
                  void form.trigger("universityId")
                }}
              />
            </Form.CustomController>
          )}
        />
      ) : (
        // Outside Sri Lanka there is no list: universityId is always "other"
        // behind the scenes and the typed name is the university.
        <Form.Item
          name="otherUniversityName"
          label="University"
          helperText="Enter the full name, not an abbreviation."
        >
          <Input placeholder="Enter your university name" />
        </Form.Item>
      )}

      {isSriLanka && universityId === OTHER_UNIVERSITY_ID && (
        <Form.Item
          name="otherUniversityName"
          label="University Name"
          helperText="Enter the full name, not an abbreviation."
          className="@2xl:col-span-2"
        >
          <Input placeholder="Specify your university" />
        </Form.Item>
      )}

      <Controller
        control={form.control}
        name="teamSize"
        render={(controller) => (
          <Form.CustomController
            {...controller}
            label="Choose the number of members in the team."
            className="@2xl:col-span-2"
          >
            <div className="grid gap-2 sm:grid-cols-3">
              {TEAM_SIZE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    "rounded-lg border px-4 py-3 text-left text-sm transition hover:bg-muted",
                    Number(controller.field.value) === option.value &&
                      "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                  onClick={() => controller.field.onChange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Form.CustomController>
        )}
      />
    </div>
  )
}

const COUNTRY_DIAL_CODES: Record<RegistrationValues["country"], CountryCode> = {
  "Sri Lanka": "LK",
  India: "IN",
  Bangladesh: "BD",
  Pakistan: "PK",
  Nepal: "NP",
  Bhutan: "BT",
  Maldives: "MV",
  Afghanistan: "AF",
}

function ParticipantStep({
  prefix,
  roleLabel,
}: {
  prefix: ParticipantPrefix
  roleLabel: string
}) {
  const { setValue } = useFormContext<RegistrationValues>()
  const country = useWatch<RegistrationValues, "country">({ name: "country" })
  const email = useWatch<RegistrationValues, `${ParticipantPrefix}.email`>({
    name: `${prefix}.email`,
  })
  const emailSuggestion = suggestEmailCorrection(email ?? "")

  return (
    <div className="space-y-5">
      <div className="rounded-lg border bg-muted/35 p-4 text-sm text-muted-foreground">
        Enter the participant details exactly as they should appear on the
        certificate. Check the WhatsApp country code before entering the number.
      </div>
      <div className="grid gap-4 @2xl:grid-cols-2">
        <Form.Item
          name={`${prefix}.fullName`}
          label="Full Name (To be printed on the certificate)"
          className="@2xl:col-span-2"
        >
          <Input placeholder={`${roleLabel} full name`} />
        </Form.Item>
        <div>
          <Form.Item name={`${prefix}.email`} label="Email Address">
            <Input type="email" placeholder="name@example.com" />
          </Form.Item>
          {emailSuggestion && (
            <p className="mt-1.5 text-xs text-amber-400">
              Did you mean{" "}
              <button
                type="button"
                className="font-medium underline underline-offset-2"
                onClick={() =>
                  setValue(`${prefix}.email`, emailSuggestion, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                {emailSuggestion}
              </button>
              ?
            </p>
          )}
        </div>
        <Form.Item
          name={`${prefix}.whatsappNumber`}
          label="WhatsApp Number"
          helperText="Choose the country code, then enter the rest of the number."
        >
          <PhoneInput defaultCountry={COUNTRY_DIAL_CODES[country]} />
        </Form.Item>
        <OptionSelect
          name={`${prefix}.gender`}
          label="Gender"
          placeholder="Select gender"
          helperText={`Choose "Prefer not to say" if you'd rather not share this.`}
          options={GENDER_OPTIONS}
        />
        <OptionSelect
          name={`${prefix}.yearOfStudy`}
          label="Year of Study"
          placeholder="Select year of study"
          options={YEAR_OF_STUDY_OPTIONS}
        />
      </div>
    </div>
  )
}

function OptionSelect({
  name,
  label,
  placeholder,
  helperText,
  options,
}: {
  name: `${ParticipantPrefix}.gender` | `${ParticipantPrefix}.yearOfStudy`
  label: string
  placeholder: string
  helperText?: string
  options: readonly { value: string; label: string }[]
}) {
  const { trigger } = useFormContext<RegistrationValues>()

  return (
    <Controller<RegistrationValues, typeof name>
      name={name}
      render={(controller) => (
        <Form.CustomController
          {...controller}
          label={label}
          helperText={helperText}
        >
          <Select
            items={options}
            value={controller.field.value || null}
            onValueChange={(value) => {
              controller.field.onChange(value ?? "")
              // Clear an error shown by an earlier Next once a choice is made.
              if (controller.fieldState.invalid) void trigger(name)
            }}
          >
            <SelectTrigger
              aria-invalid={controller.fieldState.invalid}
              className={cn(
                "w-full",
                controller.fieldState.invalid &&
                  "border-destructive ring-destructive/20"
              )}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Form.CustomController>
      )}
    />
  )
}

function UniversityCombobox({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const selected = UNIVERSITY_OPTIONS.find((option) => option.id === value)
  const filtered = UNIVERSITY_OPTIONS.filter((option) =>
    option.name.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    setQuery(selected?.name ?? "")
  }, [selected?.name])

  return (
    <div className="relative">
      <Input
        value={query}
        placeholder="Search university"
        onChange={(event) => {
          setQuery(event.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && (
        <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg">
          {filtered.length > 0 ? (
            filtered.map((option) => (
              <button
                key={option.id}
                type="button"
                className={cn(
                  "block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted",
                  option.id === value && "bg-muted font-medium"
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(option.id)
                  setQuery(option.name)
                  setIsOpen(false)
                }}
              >
                {option.name}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No universities found. Choose Other to specify manually.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ReviewStep({
  values,
  steps,
  onEdit,
}: {
  values: RegistrationValues
  steps: RegistrationStep[]
  onEdit: (stepId: StepId) => void
}) {
  const cards = [
    {
      id: "team" as const,
      title: "Team Details",
      rows: [
        ["Country", values.country],
        ["Team Name", values.teamName],
        ["University", getUniversityLabel(values)],
        [
          "Team Size",
          `${values.teamSize} ${values.teamSize === 1 ? "member" : "members"}`,
        ],
      ],
    },
    {
      id: "leader" as const,
      title: "Team Leader",
      rows: participantRows(values.leader),
    },
    ...(values.teamSize >= 2
      ? [
          {
            id: "member1" as const,
            title: "Team Member 1",
            rows: participantRows(values.member1),
          },
        ]
      : []),
    ...(values.teamSize >= 3
      ? [
          {
            id: "member2" as const,
            title: "Team Member 2",
            rows: participantRows(values.member2),
          },
        ]
      : []),
  ]

  // Steps can be revisited and edited out of order (Edit buttons, progress
  // bar), so re-check everything here and point at the card that needs fixing.
  const issuesByCard = getReviewIssues(values)

  return (
    <div className="space-y-4">
      {cards.map((card) => (
        <div
          key={card.id}
          className={cn(
            "rounded-xl border p-4",
            issuesByCard[card.id] && "border-destructive/60"
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold">{card.title}</h3>
            {steps.some((step) => step.id === card.id) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEdit(card.id)}
              >
                Edit
              </Button>
            )}
          </div>
          {issuesByCard[card.id] && (
            <ul className="mt-2 space-y-1 text-sm text-destructive">
              {issuesByCard[card.id]?.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          )}
          <dl className="mt-3 grid gap-3 text-sm @2xl:grid-cols-2">
            {card.rows.map(([label, value]) => (
              <Fact key={label} label={label} value={value || "Not entered"} />
            ))}
          </dl>
        </div>
      ))}
      <p className="text-sm text-muted-foreground">
        Names are printed on certificates exactly as shown above. Once you
        submit, these details can&apos;t be changed here.
      </p>
    </div>
  )
}

type ReviewCardId = "team" | ParticipantPrefix

function getReviewIssues(values: RegistrationValues) {
  const result = registrationSchema.safeParse(values)
  const issues: Partial<Record<ReviewCardId, string[]>> = {}
  if (result.success) return issues

  for (const issue of result.error.issues) {
    const field = String(issue.path[0])
    const cardId: ReviewCardId =
      field === "leader" || field === "member1" || field === "member2"
        ? field
        : "team"
    const messages = (issues[cardId] ??= [])
    if (!messages.includes(issue.message)) messages.push(issue.message)
  }

  return issues
}

/** "+94771234567" -> "+94 77 123 4567", using the country's digit grouping. */
function formatWhatsappNumber(value: string) {
  if (!value) return ""
  const country = getCountryFromPhone(value)
  const national = getNationalNumber(value, country.dialCode)
  return `${country.dialCode} ${formatNationalNumber(national, country.groups)}`
}

function participantRows(participant: RegistrationValues["leader"]) {
  return [
    ["Full Name", participant.fullName],
    ["Email", participant.email],
    ["WhatsApp", formatWhatsappNumber(participant.whatsappNumber)],
    ["Gender", getOptionLabel(GENDER_OPTIONS, participant.gender)],
    [
      "Year of Study",
      getOptionLabel(YEAR_OF_STUDY_OPTIONS, participant.yearOfStudy),
    ],
  ]
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium break-words">{value}</dd>
    </div>
  )
}
