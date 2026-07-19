import { PlaceholderPage } from "@/components/layout/placeholder-page"
import { getSessionUser } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

const StudentDashboardPage = async () => {
  const user = await getSessionUser()

  return (
    <PlaceholderPage
      title="Student dashboard"
      description={`Welcome${user?.displayName ? `, ${user.displayName}` : ""}. You’re in PyJourney Academy — adaptive lessons and insights come next.`}
    />
  )
}

export default StudentDashboardPage
