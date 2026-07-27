import Link from "next/link"

import { ClassroomMemberRow } from "@/components/teacher/classroom-member-row"
import { ClassroomSettingsPanel } from "@/components/teacher/classroom-settings-panel"
import { requireRole } from "@/lib/auth/session"
import { requireOwnedClassroomOrRedirect } from "@/lib/classrooms/access"
import { listClassroomMembers } from "@/lib/classrooms/queries"

export const dynamic = "force-dynamic"

type TeacherClassroomDetailPageProps = {
  params: Promise<{ id: string }>
}

const TeacherClassroomDetailPage = async ({
  params,
}: TeacherClassroomDetailPageProps) => {
  const { id } = await params
  const user = await requireRole(["teacher"])
  const classroom = await requireOwnedClassroomOrRedirect(user.id, id)
  const members = await listClassroomMembers(classroom.id)
  const archived = Boolean(classroom.archivedAt)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Link
          href="/teacher/classes"
          className="w-fit text-sm font-medium text-[var(--brand-blue)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]"
          aria-label="Back to classes"
        >
          ← Back to classes
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            {classroom.name}
          </h1>
          {archived ? (
            <span className="rounded-md bg-[var(--app-accent-soft)] px-2 py-0.5 text-xs font-medium text-[var(--brand-blue)]">
              Archived
            </span>
          ) : null}
        </div>
        <p className="text-base text-[var(--app-muted)]">
          Manage the join code and students in this class.
        </p>
        <Link
          href={`/teacher/classes/${classroom.id}/insights`}
          className="w-fit text-sm font-medium text-[var(--brand-blue)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]"
          aria-label={`View insights for ${classroom.name}`}
        >
          View class insights →
        </Link>
      </header>

      <ClassroomSettingsPanel
        classroomId={classroom.id}
        name={classroom.name}
        joinCode={classroom.joinCode}
        archived={archived}
      />

      <section className="flex flex-col gap-3" aria-labelledby="members-heading">
        <h2
          id="members-heading"
          className="text-lg font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
        >
          Students ({members.length})
        </h2>
        <div className="app-surface rounded-xl px-5">
          {members.length === 0 ? (
            <p className="py-5 text-sm text-[var(--app-muted)]">
              No students yet. Share the join code so they can enroll.
            </p>
          ) : (
            <ul>
              {members.map((member) => (
                <ClassroomMemberRow
                  key={member.studentId}
                  classroomId={classroom.id}
                  studentId={member.studentId}
                  displayName={member.displayName}
                  email={member.email}
                  joinedLabel={new Intl.DateTimeFormat("en", {
                    dateStyle: "medium",
                  }).format(member.joinedAt)}
                />
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}

export default TeacherClassroomDetailPage
