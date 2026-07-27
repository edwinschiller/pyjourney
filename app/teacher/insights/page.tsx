import Link from "next/link"

import { requireRole } from "@/lib/auth/session"
import { listTeacherClassrooms } from "@/lib/classrooms/queries"

export const dynamic = "force-dynamic"

const TeacherInsightsIndexPage = async () => {
  const user = await requireRole(["teacher"])
  const classrooms = await listTeacherClassrooms(user.id)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          Insights
        </h1>
        <p className="text-base text-[var(--app-muted)]">
          Open a class to see shared struggle topics and per-student evidence.
        </p>
      </header>

      {classrooms.length === 0 ? (
        <div className="app-surface rounded-xl p-5 text-sm text-[var(--app-muted)]">
          No classes yet.{" "}
          <Link
            href="/teacher/classes"
            className="font-medium text-[var(--brand-blue)] hover:underline"
          >
            Create a class
          </Link>{" "}
          first.
        </div>
      ) : (
        <ul className="app-surface divide-y divide-[var(--app-border)] rounded-xl">
          {classrooms.map((classroom) => (
            <li
              key={classroom.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
            >
              <div>
                <p className="font-medium text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                  {classroom.name}
                </p>
                <p className="text-sm text-[var(--app-muted)]">
                  {classroom.memberCount} student
                  {classroom.memberCount === 1 ? "" : "s"}
                  {classroom.archivedAt ? " · Archived" : ""}
                </p>
              </div>
              <Link
                href={`/teacher/classes/${classroom.id}/insights`}
                className="text-sm font-medium text-[var(--brand-blue)] hover:underline"
                aria-label={`Open insights for ${classroom.name}`}
              >
                View insights
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default TeacherInsightsIndexPage
