import { requireRole } from "@/lib/auth/session"
import { listAdminClassrooms } from "@/lib/admin"

export const dynamic = "force-dynamic"

const formatWhen = (date: Date) =>
  new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date)

const AdminClassesPage = async () => {
  await requireRole(["admin"])
  const classrooms = await listAdminClassrooms()
  const active = classrooms.filter((row) => !row.archivedAt)
  const archived = classrooms.filter((row) => row.archivedAt)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          Classes
        </h1>
        <p className="text-base text-[var(--app-muted)]">
          Platform-wide classroom overview. Teachers manage members and
          insights from their own workspace.
        </p>
      </header>

      <ClassList
        headingId="active-classes"
        title={`Active (${active.length})`}
        rows={active}
        empty="No active classrooms."
      />

      {archived.length > 0 ? (
        <ClassList
          headingId="archived-classes"
          title={`Archived (${archived.length})`}
          rows={archived}
          empty="No archived classrooms."
        />
      ) : null}
    </div>
  )
}

type ClassListProps = {
  headingId: string
  title: string
  rows: Awaited<ReturnType<typeof listAdminClassrooms>>
  empty: string
}

const ClassList = ({ headingId, title, rows, empty }: ClassListProps) => (
  <section className="flex flex-col gap-3" aria-labelledby={headingId}>
    <h2
      id={headingId}
      className="text-lg font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
    >
      {title}
    </h2>
    {rows.length === 0 ? (
      <div className="app-surface rounded-xl p-5 text-sm text-[var(--app-muted)]">
        {empty}
      </div>
    ) : (
      <ul className="flex flex-col gap-3">
        {rows.map((classroom) => {
          const teacher =
            classroom.teacherDisplayName?.trim() || classroom.teacherEmail
          return (
            <li key={classroom.id} className="app-surface rounded-xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                    {classroom.name}
                  </p>
                  <p className="mt-1 font-mono text-sm tracking-wide text-[var(--app-muted)]">
                    {classroom.joinCode}
                  </p>
                  <p className="mt-2 text-sm text-[var(--app-muted)]">
                    Teacher: {teacher} · created {formatWhen(classroom.createdAt)}
                  </p>
                </div>
                <p className="shrink-0 text-sm text-[var(--app-muted)]">
                  {classroom.memberCount}{" "}
                  {classroom.memberCount === 1 ? "student" : "students"}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    )}
  </section>
)

export default AdminClassesPage
