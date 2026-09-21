import { inArray } from "drizzle-orm"

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
  const defaults: RegistrationAvailability = {
    isOpen: true,
    openAt: null,
    closeAt: null,
    forceClosed: false,
    message: "Registration is currently closed.",
  }

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
      defaults.message

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
  } catch {
    return defaults
  }
}
