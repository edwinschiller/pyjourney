import { CreateAssignmentForm } from "@/components/teacher/create-assignment-form"
import { requireRole } from "@/lib/auth/session"
import {
  listActiveConceptsForAssign,
  listTeacherAssignments,
} from "@/lib/assignments"
import { listTeacherClassrooms } from "@/lib/classrooms/queries"

export const dynamic = "force-dynamic"

const formatWhen = (date: Date) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)

const TeacherAssignmentsPage = async () => {
  const user = await requireRole(["teacher"])
  const [classrooms, concepts, assignmentRows] = await Promise.all([
    listTeacherClassrooms(user.id),
    listActiveConceptsForAssign(),
    listTeacherAssignments(user.id),
  ])

  const activeClassrooms = classrooms
    .filter((row) => !row.archivedAt)
    .map((row) => ({
      id: row.id,
      name: row.name,
      memberCount: row.memberCount,
    }))

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          Assignments
        </h1>
        <p className="text-base text-[var(--app-muted)]">
          Point a class at a concept. Students see it as “Next up” until they
          complete that lesson.
        </p>
      </header>

      <CreateAssignmentForm
        classrooms={activeClassrooms}
        concepts={concepts.map((row) => ({ id: row.id, title: row.title }))}
      />

      <section className="flex flex-col gap-3" aria-labelledby="assignment-list">
        <h2
          id="assignment-list"
          className="text-lg font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
        >
          Recent ({assignmentRows.length})
        </h2>
        {assignmentRows.length === 0 ? (
          <div className="app-surface rounded-xl p-5 text-sm text-[var(--app-muted)]">
            No assignments yet. Create one above to steer the class path.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {assignmentRows.map((row) => (
              <li key={row.id} className="app-surface rounded-xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                      {row.title}
                    </p>
                    <p className="mt-1 text-sm text-[var(--app-muted)]">
                      {row.classroomName}
                      {row.conceptTitle ? ` · ${row.conceptTitle}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-[var(--app-muted)]">
                      {formatWhen(row.createdAt)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm text-[var(--app-muted)]">
                    {row.completedCount}/{row.recipientCount} completed
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default TeacherAssignmentsPage
