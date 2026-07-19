import { requireRole } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

const StudentHomePage = async () => {
  const user = await requireRole(["student"])

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-3 px-6 py-16">
      <h1 className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
        Student area
      </h1>
      <p className="text-[var(--app-muted)]">
        Signed in as {user.email}. You’re in PyJourney Academy by default.
        Dashboard comes in a later commit.
      </p>
    </main>
  )
}

export default StudentHomePage
