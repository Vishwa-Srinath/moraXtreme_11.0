export const LEGACY_STATS: {
  value: number
  label: string
  prefix?: string
  suffix?: string
}[] = [
    { value: 1500, label: "Competitors", suffix: "+" },
    { value: 500, label: "Teams Battling", suffix: "+" },
    // Shown as "LKR 100K": the full "LKR 100,000" overflows the column at this size.
    { value: 100, label: "Prize Pool", prefix: "LKR", suffix: "K" },
  ]
