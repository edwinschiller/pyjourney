import { JoinClassroomForm } from "@/components/student/join-classroom-form"
import { ACADEMY_CLASS_NAME, ACADEMY_JOIN_CODE } from "@/lib/db/constants"
import { requireRole } from "@/lib/auth/session"
import { listStudentClassrooms } from "@/lib/classrooms/queries"

export const dynamic = "force-dynamic"

const StudentDashboardPage = async () => {
  const user = await requireRole(["student"])
  const classrooms = await listStudentClassrooms(user.id)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          Student dashboard
        </h1>
        <p className="text-base text-[var(--app-muted)]">
          Welcome{user.displayName ? `, ${user.displayName}` : ""}. You’re in{" "}
          {ACADEMY_CLASS_NAME} — join a teacher class with a code when you have
          one.
        </p>
      </header>

      <JoinClassroomForm />

      <section className="flex flex-col gap-3" aria-labelledby="my-classes">
        <h2
          id="my-classes"
          className="text-lg font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
        >
          My classes ({classrooms.length})
        </h2>
        {classrooms.length === 0 ? (
          <div className="app-surface rounded-xl p-5 text-sm text-[var(--app-muted)]">
            No class memberships yet. Academy enrollment happens automatically
            after sign-up.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {classrooms.map((classroom) => {
              const isAcademy = classroom.joinCode === ACADEMY_JOIN_CODE
              const teacherLabel =
                classroom.teacherDisplayName?.trim() ||
                classroom.teacherEmail ||
                "Teacher"

              return (
                <li
                  key={classroom.id}
                  className="app-surface rounded-xl p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                        {classroom.name}
                      </p>
                      <p className="mt-1 text-sm text-[var(--app-muted)]">
                        {isAcademy
                          ? "Default learning community"
                          : `Teacher: ${teacherLabel}`}
                      </p>
                    </div>
                    {classroom.archivedAt ? (
                      <span className="rounded-md bg-[var(--app-accent-soft)] px-2 py-0.5 text-xs font-medium text-[var(--brand-blue)]">
                        Archived
                      </span>
                    ) : isAcademy ? (
                      <span className="rounded-md bg-[var(--app-highlight-soft)] px-2 py-0.5 text-xs font-medium text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                        Academy
                      </span>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

export default StudentDashboardPage
