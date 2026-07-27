import Link from "next/link"

import { JoinClassroomForm } from "@/components/student/join-classroom-form"
import { Button } from "@/components/ui/button"
import { requireRole } from "@/lib/auth/session"
import { listStudentClassrooms } from "@/lib/classrooms/queries"
import {
  loadCurriculumGraph,
  resolveNextConceptForStudent,
} from "@/lib/curriculum"
import { ACADEMY_CLASS_NAME, ACADEMY_JOIN_CODE } from "@/lib/db/constants"
import {
  getMasteryScoreMapForStudent,
  listMasteryForStudent,
  scoreToBand,
} from "@/lib/mastery"
import { listCompletedConceptIds } from "@/lib/lessons/queries"

export const dynamic = "force-dynamic"

const bandLabel = (band: string) => {
  if (band === "mastered") return "Mastered"
  if (band === "proficient") return "Proficient"
  if (band === "developing") return "Developing"
  return "Learning"
}

const StudentDashboardPage = async () => {
  const user = await requireRole(["student"])
  const [classrooms, masteryRecords, masteryMap, graph, completedIds] =
    await Promise.all([
      listStudentClassrooms(user.id),
      listMasteryForStudent(user.id),
      getMasteryScoreMapForStudent(user.id),
      loadCurriculumGraph(),
      listCompletedConceptIds(user.id),
    ])
  const next = await resolveNextConceptForStudent(user.id, masteryMap, {
    completedConceptIds: completedIds,
  })

  const masteryRows = masteryRecords
    .map((record) => {
      const concept = graph.conceptById.get(record.conceptId)
      if (!concept) {
        return null
      }
      return { record, concept }
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .sort((a, b) => a.concept.orderIndex - b.concept.orderIndex)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          Student dashboard
        </h1>
        <p className="text-base text-[var(--app-muted)]">
          Welcome{user.displayName ? `, ${user.displayName}` : ""}. You’re in{" "}
          {ACADEMY_CLASS_NAME}.
        </p>
      </header>

      <section
        className="app-surface flex flex-col gap-4 rounded-xl p-5 sm:flex-row sm:items-center sm:justify-between"
        aria-labelledby="next-concept"
      >
        <div className="min-w-0">
          <p
            id="next-concept"
            className="text-xs font-medium tracking-wide text-[var(--app-muted)] uppercase"
          >
            Next up
          </p>
          {next ? (
            <>
              <h2 className="mt-1 text-xl font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                {next.concept.title}
              </h2>
              <p className="mt-1 text-sm text-[var(--app-muted)]">
                {next.concept.description}
                {next.reason === "assignment_override"
                  ? " · Assigned by your teacher"
                  : ""}
              </p>
            </>
          ) : (
            <>
              <h2 className="mt-1 text-xl font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                Path complete for now
              </h2>
              <p className="mt-1 text-sm text-[var(--app-muted)]">
                You have mastered the unlocked concepts in the current catalog.
              </p>
            </>
          )}
        </div>
        {next ? (
          <Button asChild size="lg">
            <Link
              href="/student/learn"
              aria-label={`Continue learning ${next.concept.title}`}
            >
              Continue learning
            </Link>
          </Button>
        ) : (
          <Button size="lg" disabled aria-label="No next concept available">
            Continue learning
          </Button>
        )}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="mastery-heading">
        <h2
          id="mastery-heading"
          className="text-lg font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
        >
          Your mastery
        </h2>
        {masteryRows.length === 0 ? (
          <div className="app-surface rounded-xl p-5 text-sm text-[var(--app-muted)]">
            No mastery scores yet. Complete a lesson to get started — everyone
            begins at 0.
          </div>
        ) : (
          <ul className="app-surface divide-y divide-[var(--app-border)] rounded-xl">
            {masteryRows.map(({ record, concept }) => (
              <li
                key={record.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
              >
                <div>
                  <p className="font-medium text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                    {concept.title}
                  </p>
                  <p className="text-sm text-[var(--app-muted)]">
                    {bandLabel(scoreToBand(record.score))}
                  </p>
                </div>
                <p className="font-mono text-sm font-semibold text-[var(--brand-blue)]">
                  {record.score}/100
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

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
                <li key={classroom.id} className="app-surface rounded-xl p-4">
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
