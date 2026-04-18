import { CitizenModules } from "@/app/(dashboard)/dashboard/_components/citizen-modules"
import { EnterpriseModules } from "@/app/(dashboard)/dashboard/_components/enterprise-modules"
import { requireCurrentUser } from "@/lib/auth/auth"

export default async function DashboardPage() {
  const user = await requireCurrentUser()

  if (user.userType === "normal") {
    return <CitizenModules />
  }

  return (
    <EnterpriseModules subscriptionActive={Boolean(user.enterpriseSubscriptionActive)} />
  )
}
