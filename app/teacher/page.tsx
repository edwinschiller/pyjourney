import { PlaceholderPage } from "@/components/layout/placeholder-page"
import { getSessionUser } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

const TeacherDashboardPage = async () => {
  const user = await getSessionUser()

  return (
    <PlaceholderPage
      title="Teacher dashboard"
      description={`Welcome${user?.displayName ? `, ${user.displayName}` : ""}. Create classes and follow student progress from here.`}
    />
  )
}

export default TeacherDashboardPage
