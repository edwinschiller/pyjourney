import { requireRole } from "@/lib/auth/session"
import { listAdminCurriculum } from "@/lib/admin"
import { getBlueprint } from "@/lib/lesson-engine/curricula"

export const dynamic = "force-dynamic"

const AdminCurriculumPage = async () => {
  await requireRole(["admin"])
  const concepts = await listAdminCurriculum()

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          Curriculum
        </h1>
        <p className="text-base text-[var(--app-muted)]">
          Competency graph used by the adaptive lesson engine. Concepts without
          a lesson template stay locked on the student path.
        </p>
      </header>

      <ol className="flex flex-col gap-3">
        {concepts.map((concept, index) => {
          const templateReady = Boolean(getBlueprint(concept.slug))
          return (
            <li key={concept.id} className="app-surface rounded-xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium tracking-wide text-[var(--app-muted)] uppercase">
                    #{index + 1} · {concept.slug}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                    {concept.title}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--app-muted)]">
                    {concept.description}
                  </p>
                  {concept.prerequisiteTitles.length > 0 ? (
                    <p className="mt-3 text-xs text-[var(--app-muted)]">
                      Prerequisites: {concept.prerequisiteTitles.join(", ")}
                    </p>
                  ) : (
                    <p className="mt-3 text-xs text-[var(--app-muted)]">
                      No prerequisites
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={
                      concept.isActive
                        ? "rounded-md bg-[var(--app-accent-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--brand-blue)] uppercase"
                        : "rounded-md bg-[var(--app-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--app-muted)] uppercase"
                    }
                  >
                    {concept.isActive ? "Active" : "Inactive"}
                  </span>
                  <span
                    className={
                      templateReady
                        ? "rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 uppercase dark:text-emerald-200"
                        : "rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-800 uppercase dark:text-amber-200"
                    }
                  >
                    {templateReady ? "Lesson ready" : "No template"}
                  </span>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default AdminCurriculumPage
