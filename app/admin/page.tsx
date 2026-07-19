import { PlaceholderPage } from "@/components/layout/placeholder-page"
import { getSessionUser } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

const AdminDashboardPage = async () => {
  const user = await getSessionUser()

  return (
    <PlaceholderPage
      title="Admin dashboard"
      description={`Signed in as ${user?.email ?? "admin"}. Manage users, classes, and curriculum.`}
    />
  )
}

export default AdminDashboardPage
