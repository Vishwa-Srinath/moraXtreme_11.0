import { inArray, sql } from "drizzle-orm"
import { connection } from "next/server"
import { z } from "zod"

import { db } from "@/lib/db"
import { appSettings } from "@/lib/db/schema"

export const REGISTRATION_SETTING_KEYS = {
  openAt: "registrationOpenAt",
  closeAt: "registrationCloseAt",
  forceClosed: "registrationForceClosed",
  closedMessage: "registrationCloseMessage",
} as const

export type RegistrationAvailability = {
  isOpen: boolean
  openAt: string | null
  closeAt: string | null
  forceClosed: boolean
  message: string
}

export const registrationSettingsSchema = z
  .object({
    openAt: z.iso.datetime().nullable(),
    closeAt: z.iso.datetime().nullable(),
    forceClosed: z.boolean(),
    closedMessage: z.string().trim().min(1).max(300),
  })
  .refine(
    ({ openAt, closeAt }) =>
      !openAt || !closeAt || Date.parse(closeAt) > Date.parse(openAt),
    {
      message: "Closing time must be after opening time.",
      path: ["closeAt"],
    }
  )

export type RegistrationSettings = z.infer<typeof registrationSettingsSchema>

function readSettingValue(settings: Map<string, unknown>, key: string) {
  const value = settings.get(key)
  return typeof value === "string" ? value : null
}

function readBooleanSetting(settings: Map<string, unknown>, key: string) {
  const value = settings.get(key)
  return typeof value === "boolean" ? value : false
}

function parseTimestamp(value: string | null) {
  if (!value) return null

  const time = Date.parse(value)
  return Number.isNaN(time) ? null : time
}

export async function getRegistrationAvailability(): Promise<RegistrationAvailability> {
  await connection()

  // Used only when the settings cannot be read: fail closed so a database
  // hiccup can never reopen registration after it has been closed.
  const unavailable: RegistrationAvailability = {
    isOpen: false,
    openAt: null,
    closeAt: null,
    forceClosed: false,
    message:
      "Registration is temporarily unavailable. Please try again in a few minutes.",
  }
  const defaultClosedMessage = "Registration is currently closed."

  try {
    const rows = await db
      .select({ key: appSettings.key, value: appSettings.value })
      .from(appSettings)
      .where(inArray(appSettings.key, Object.values(REGISTRATION_SETTING_KEYS)))

    const settings = new Map(rows.map((row) => [row.key, row.value]))
    const openAt = readSettingValue(settings, REGISTRATION_SETTING_KEYS.openAt)
    const closeAt = readSettingValue(
      settings,
      REGISTRATION_SETTING_KEYS.closeAt
    )
    const forceClosed = readBooleanSetting(
      settings,
      REGISTRATION_SETTING_KEYS.forceClosed
    )
    const message =
      readSettingValue(settings, REGISTRATION_SETTING_KEYS.closedMessage) ??
      defaultClosedMessage

    const now = Date.now()
    const openTime = parseTimestamp(openAt)
    const closeTime = parseTimestamp(closeAt)
    const startsOpen = openTime === null || now >= openTime
    const beforeClose = closeTime === null || now <= closeTime

    return {
      isOpen: !forceClosed && startsOpen && beforeClose,
      openAt,
      closeAt,
      forceClosed,
      message,
    }
  } catch (error) {
    console.error("Could not read registration settings", error)
    return unavailable
  }
}

export async function updateRegistrationSettings(input: unknown) {
  const settings = registrationSettingsSchema.parse(input)

  await db
    .insert(appSettings)
    .values([
      {
        key: REGISTRATION_SETTING_KEYS.openAt,
        value: settings.openAt,
        valueType: "timestamp" as const,
        description: "UTC timestamp when registration opens.",
      },
      {
        key: REGISTRATION_SETTING_KEYS.closeAt,
        value: settings.closeAt,
        valueType: "timestamp" as const,
        description: "UTC timestamp when registration closes.",
      },
      {
        key: REGISTRATION_SETTING_KEYS.forceClosed,
        value: settings.forceClosed,
        valueType: "boolean" as const,
        description: "Manual override that closes registration immediately.",
      },
      {
        key: REGISTRATION_SETTING_KEYS.closedMessage,
        value: settings.closedMessage,
        valueType: "string" as const,
        description: "Message shown when registration is unavailable.",
      },
    ])
    .onConflictDoUpdate({
      target: appSettings.key,
      set: {
        value: sql`excluded.value`,
        valueType: sql`excluded.value_type`,
        description: sql`excluded.description`,
        updatedAt: new Date(),
      },
    })

  return settings
}
