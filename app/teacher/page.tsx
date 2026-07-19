import { requireRole } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

const TeacherHomePage = async () => {
  const user = await requireRole(["teacher", "admin"])

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-3 px-6 py-16">
      <h1 className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
        Teacher area
      </h1>
      <p className="text-[var(--app-muted)]">
        Signed in as {user.email} ({user.role}). Create and manage your own
        classes in the next teacher commit — your teacher role is ready.
      </p>
    </main>
  )
}

export default TeacherHomePage
