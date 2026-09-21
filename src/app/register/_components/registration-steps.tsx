"use client"

import { useEffect, useState } from "react"
import { Controller } from "react-hook-form"

import { PhoneInput } from "@/components/form-inputs/PhoneInput"
import Form from "@/components/form/Form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  OTHER_UNIVERSITY_ID,
  TEAM_SIZE_OPTIONS,
  UNIVERSITY_OPTIONS,
} from "@/lib/registration/constants"
import type { RegistrationValues } from "@/lib/registration/schema"
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
  const universityId = form.watch("universityId")

  return (
    <div className="grid gap-4 @2xl:grid-cols-2">
      <Form.Item name="teamName" label="Team Name" className="@2xl:col-span-2">
        <Input placeholder="Enter your team name" />
      </Form.Item>

      <Controller
        control={form.control}
        name="universityId"
        render={(controller) => (
          <Form.CustomController
            {...controller}
            label="University"
            helperText="Search the list or choose Other."
            className="@2xl:col-span-2"
          >
            <UniversityCombobox
              value={controller.field.value}
              onChange={controller.field.onChange}
            />
          </Form.CustomController>
        )}
      />

      <Form.Item
        name="otherUniversityName"
        label="University Name"
        hidden={universityId !== OTHER_UNIVERSITY_ID}
        className="@2xl:col-span-2"
      >
        <Input placeholder="Specify your university" />
      </Form.Item>

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

function ParticipantStep({
  prefix,
  roleLabel,
}: {
  prefix: ParticipantPrefix
  roleLabel: string
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-lg border bg-muted/35 p-4 text-sm text-muted-foreground">
        Enter the participant details exactly as they should appear on the
        certificate. Select the country before entering the WhatsApp number.
      </div>
      <div className="grid gap-4 @2xl:grid-cols-2">
        <Form.Item
          name={`${prefix}.fullName`}
          label="Full Name (To be printed on the certificate)"
          className="@2xl:col-span-2"
        >
          <Input placeholder={`${roleLabel} full name`} />
        </Form.Item>
        <Form.Item name={`${prefix}.email`} label="Email Address">
          <Input type="email" placeholder="name@example.com" />
        </Form.Item>
        <Form.Item
          name={`${prefix}.whatsappNumber`}
          label="WhatsApp Number"
          helperText="Enter the number without the country code."
        >
          <PhoneInput placeholder="77 123 4567" />
        </Form.Item>
      </div>
    </div>
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
        ["Team Name", values.teamName],
        ["University", getUniversityLabel(values)],
        ["Team Size", `${values.teamSize} member(s)`],
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

  return (
    <div className="space-y-4">
      {cards.map((card) => (
        <div key={card.id} className="rounded-xl border p-4">
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
          <dl className="mt-3 grid gap-3 text-sm @2xl:grid-cols-2">
            {card.rows.map(([label, value]) => (
              <Fact key={label} label={label} value={value || "Not entered"} />
            ))}
          </dl>
        </div>
      ))}
    </div>
  )
}

function participantRows(participant: {
  fullName: string
  email: string
  whatsappNumber: string
}) {
  return [
    ["Full Name", participant.fullName],
    ["Email", participant.email],
    ["WhatsApp", participant.whatsappNumber],
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
