import Link from "next/link"

import { Button } from "@/components/ui/button"
import { requireRole } from "@/lib/auth/session"
import {
  countActiveTeacherClassrooms,
  listTeacherClassrooms,
} from "@/lib/classrooms/queries"

export const dynamic = "force-dynamic"

const TeacherDashboardPage = async () => {
  const user = await requireRole(["teacher"])
  const activeCount = await countActiveTeacherClassrooms(user.id)
  const classrooms = await listTeacherClassrooms(user.id)
  const recent = classrooms.filter((item) => !item.archivedAt).slice(0, 3)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          Teacher dashboard
        </h1>
        <p className="text-base text-[var(--app-muted)]">
          Welcome{user.displayName ? `, ${user.displayName}` : ""}. Create
          classes and share join codes with your students.
        </p>
      </header>

      <div className="app-surface flex flex-col gap-4 rounded-xl p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[var(--app-muted)]">Active classes</p>
          <p className="text-3xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            {activeCount}
          </p>
        </div>
        <Button asChild>
          <Link href="/teacher/classes" aria-label="Manage classes">
            Manage classes
          </Link>
        </Button>
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="recent-classes">
        <h2
          id="recent-classes"
          className="text-lg font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
        >
          Your classes
        </h2>
        {recent.length === 0 ? (
          <div className="app-surface rounded-xl p-5 text-sm text-[var(--app-muted)]">
            You have no classes yet.{" "}
            <Link
              href="/teacher/classes"
              className="font-medium text-[var(--brand-blue)] hover:underline"
            >
              Create your first class
            </Link>
            .
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {recent.map((classroom) => (
              <li key={classroom.id}>
                <Link
                  href={`/teacher/classes/${classroom.id}`}
                  className="app-surface flex items-center justify-between gap-4 rounded-xl p-4 transition-colors hover:bg-[var(--app-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]"
                  aria-label={`Open class ${classroom.name}`}
                >
                  <div>
                    <p className="font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                      {classroom.name}
                    </p>
                    <p className="mt-1 font-mono text-sm text-[var(--app-muted)]">
                      {classroom.joinCode}
                    </p>
                  </div>
                  <span className="text-sm text-[var(--app-muted)]">
                    {classroom.memberCount}{" "}
                    {classroom.memberCount === 1 ? "student" : "students"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default TeacherDashboardPage
