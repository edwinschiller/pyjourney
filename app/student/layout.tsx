import { PlatformShell } from "@/components/layout/platform-shell"
import { requireRole } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

const StudentLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const user = await requireRole(["student"])
  return <PlatformShell user={user}>{children}</PlatformShell>
}

export default StudentLayout
