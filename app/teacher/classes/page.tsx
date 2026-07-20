import Link from "next/link"

import { CreateClassroomForm } from "@/components/teacher/create-classroom-form"
import { requireRole } from "@/lib/auth/session"
import { listTeacherClassrooms } from "@/lib/classrooms/queries"

export const dynamic = "force-dynamic"

const TeacherClassesPage = async () => {
  const user = await requireRole(["teacher"])
  const classrooms = await listTeacherClassrooms(user.id)
  const active = classrooms.filter((item) => !item.archivedAt)
  const archived = classrooms.filter((item) => item.archivedAt)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          Classes
        </h1>
        <p className="text-base text-[var(--app-muted)]">
          Create classrooms, share join codes, and manage members.
        </p>
      </header>

      <CreateClassroomForm />

      <section className="flex flex-col gap-3" aria-labelledby="active-classes">
        <h2
          id="active-classes"
          className="text-lg font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
        >
          Active ({active.length})
        </h2>
        {active.length === 0 ? (
          <div className="app-surface rounded-xl p-5 text-sm text-[var(--app-muted)]">
            No active classes yet. Create one above to get a join code.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {active.map((classroom) => (
              <li key={classroom.id}>
                <Link
                  href={`/teacher/classes/${classroom.id}`}
                  className="app-surface flex items-center justify-between gap-4 rounded-xl p-4 transition-colors hover:bg-[var(--app-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]"
                  aria-label={`Open class ${classroom.name}`}
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                      {classroom.name}
                    </p>
                    <p className="mt-1 font-mono text-sm tracking-wide text-[var(--app-muted)]">
                      {classroom.joinCode}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm text-[var(--app-muted)]">
                    {classroom.memberCount}{" "}
                    {classroom.memberCount === 1 ? "student" : "students"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {archived.length > 0 ? (
        <section
          className="flex flex-col gap-3"
          aria-labelledby="archived-classes"
        >
          <h2
            id="archived-classes"
            className="text-lg font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
          >
            Archived ({archived.length})
          </h2>
          <ul className="flex flex-col gap-3">
            {archived.map((classroom) => (
              <li key={classroom.id}>
                <Link
                  href={`/teacher/classes/${classroom.id}`}
                  className="app-surface flex items-center justify-between gap-4 rounded-xl p-4 opacity-80 transition-colors hover:bg-[var(--app-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]"
                  aria-label={`Open archived class ${classroom.name}`}
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                      {classroom.name}
                    </p>
                    <p className="mt-1 text-sm text-[var(--app-muted)]">
                      Archived · {classroom.joinCode}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm text-[var(--app-muted)]">
                    {classroom.memberCount}{" "}
                    {classroom.memberCount === 1 ? "student" : "students"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

export default TeacherClassesPage
