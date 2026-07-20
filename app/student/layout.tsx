import { PlatformShell } from "@/components/layout/platform-shell"
import { requireStudentWithOnboarding } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

const StudentLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const user = await requireStudentWithOnboarding()
  return <PlatformShell user={user}>{children}</PlatformShell>
}

export default StudentLayout
