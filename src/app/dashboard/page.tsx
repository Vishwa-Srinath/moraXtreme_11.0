import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  return (
    <section className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">
        Command center
      </p>
      <h2 className="text-3xl font-semibold tracking-tight">Dashboard</h2>
      <p className="max-w-2xl text-muted-foreground">
        Manage registration availability and review submitted teams.
      </p>
      <div className="pt-4">
        <Button>Click me</Button>
      </div>
    </section>
  )
}
