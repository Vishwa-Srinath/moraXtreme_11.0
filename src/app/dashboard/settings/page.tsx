import { RegistrationSettingsForm } from "@/components/dashboard/registration-settings-form"
import { requireAdminPage } from "@/lib/auth-guards"
import { getRegistrationAvailability } from "@/lib/registration/settings"

export default async function RegistrationSettingsPage() {
  await requireAdminPage()
  const settings = await getRegistrationAvailability()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Registration
        </p>
        <h2 className="text-3xl font-semibold tracking-tight">
          Global settings
        </h2>
        <p className="text-muted-foreground">
          Control the registration window and the message shown when it is
          closed.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm md:p-7">
        <div className="mb-6 flex items-center justify-between gap-4 border-b pb-5">
          <div>
            <h3 className="font-semibold">Registration availability</h3>
            <p className="text-sm text-muted-foreground">
              Times are entered in your current local timezone.
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              settings.isOpen
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "bg-red-500/10 text-red-700 dark:text-red-400"
            }`}
          >
            {settings.isOpen ? "Open now" : "Closed now"}
          </span>
        </div>
        <RegistrationSettingsForm settings={settings} />
      </div>
    </div>
  )
}
