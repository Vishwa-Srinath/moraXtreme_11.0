import { Toaster } from "sonner"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ModalProvider } from "@/components/modals/modal-provider"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { requireAdminPage } from "@/lib/auth-guards"

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdminPage()

  return (
    <ModalProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
      <Toaster richColors />
    </ModalProvider>
  )
}
