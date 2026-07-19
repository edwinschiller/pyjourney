import { requireRole } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

const AdminHomePage = async () => {
  const user = await requireRole(["admin"])

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-3 px-6 py-16">
      <h1 className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
        Admin area
      </h1>
      <p className="text-[var(--app-muted)]">
        Signed in as {user.email}. User and curriculum tools come later.
      </p>
    </main>
  )
}

export default AdminHomePage
