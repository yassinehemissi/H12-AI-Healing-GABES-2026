import type { ReactNode } from "react"

import { DashboardShell } from "@/app/(dashboard)/dashboard/_components/dashboard-shell"
import { requireCurrentUser } from "@/lib/auth/auth"

export default async function RSELayout({
  children,
}: {
  children: ReactNode
}) {
  const user = await requireCurrentUser()
  return <DashboardShell user={user}>{children}</DashboardShell>
}
