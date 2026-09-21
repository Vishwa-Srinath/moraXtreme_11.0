import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { CreateUserButton } from "@/components/dashboard/create-user-button"
import { UserRowActions } from "@/components/dashboard/user-row-actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { auth } from "@/lib/auth"

function formatCreatedAt(value: Date | string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default async function UsersPage() {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })

  if (!session) redirect("/login")

  const roles = session.user.role?.split(",") ?? []
  if (!roles.includes("admin")) redirect("/dashboard")

  const result = await auth.api.listUsers({
    headers: requestHeaders,
    query: { limit: 10_000, sortBy: "createdAt", sortDirection: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Administration
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            User management
          </h2>
          <p className="text-muted-foreground">
            Create accounts, assign roles, and control access.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg border bg-muted/30 px-4 py-2 text-sm">
            <span className="font-semibold">{result.total}</span>{" "}
            <span className="text-muted-foreground">
              user{result.total === 1 ? "" : "s"}
            </span>
          </div>
          <CreateUserButton />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {result.users.length === 0 ? (
          <div className="grid min-h-64 place-items-center p-8 text-center">
            <div>
              <h3 className="font-semibold">No users yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create the first user to get started.
              </p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <div className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold uppercase">
                        {user.name.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium">{user.name}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize">
                      {user.role ?? "user"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        user.banned
                          ? "inline-flex rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"
                          : "inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400"
                      }
                    >
                      {user.banned ? "Banned" : "Active"}
                    </span>
                    {user.banned && user.banReason ? (
                      <div className="mt-1 max-w-48 truncate text-xs text-muted-foreground">
                        {user.banReason}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatCreatedAt(user.createdAt)}
                  </TableCell>
                  <TableCell>
                    <UserRowActions user={user} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
