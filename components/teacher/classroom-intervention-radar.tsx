import type { ClassInsightsSummary } from "@/lib/memory"
import { deriveClassIntervention } from "@/lib/memory/class-intervention"

type ClassroomInterventionRadarProps = {
  insights: ClassInsightsSummary
}

export const ClassroomInterventionRadar = ({
  insights,
}: ClassroomInterventionRadarProps) => {
  const intervention = deriveClassIntervention(insights)

  return (
    <section aria-labelledby="intervention-radar-heading">
      <div className="app-surface overflow-hidden rounded-2xl">
        <div className="border-b border-[var(--app-border)] bg-[var(--app-highlight-soft)] px-5 py-4 sm:px-6">
          <p className="text-xs font-semibold tracking-[0.16em] text-[var(--brand-navy)] uppercase dark:text-[var(--app-fg)]">
            Intervention radar
          </p>
          <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2
                id="intervention-radar-heading"
                className="text-xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
              >
                Teach this next
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-[var(--app-muted)]">
                A deterministic recommendation from aggregated class check
                evidence.
              </p>
            </div>
            {intervention.state === "ready" ? (
              <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-1 text-xs font-semibold text-[var(--brand-blue)]">
                {intervention.signalLabel}
              </span>
            ) : null}
          </div>
        </div>

        {intervention.state === "ready" ? (
          <>
            <div className="grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="p-5 sm:p-6">
                <p className="text-xs font-medium tracking-wide text-[var(--app-muted)] uppercase">
                  Priority topic
                </p>
                <h3 className="mt-1 text-xl font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                  {intervention.topic.topicTitle}
                </h3>
                <p className="mt-1 text-sm text-[var(--app-muted)]">
                  {intervention.topic.conceptTitle}
                </p>

                <dl className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[var(--app-accent-soft)] p-3">
                    <dt className="text-xs font-medium text-[var(--app-muted)]">
                      Class reach
                    </dt>
                    <dd className="mt-1 text-lg font-bold tabular-nums text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                      {intervention.affectedStudents} of {insights.memberCount}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-[var(--app-accent-soft)] p-3">
                    <dt className="text-xs font-medium text-[var(--app-muted)]">
                      Class coverage
                    </dt>
                    <dd className="mt-1 text-lg font-bold tabular-nums text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                      {intervention.affectedPercent}%
                    </dd>
                  </div>
                </dl>

                <div className="mt-5">
                  <p className="text-xs font-medium tracking-wide text-[var(--app-muted)] uppercase">
                    Why this topic
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--app-fg)]">
                    {intervention.reason}
                  </p>
                </div>
              </div>

              <div className="border-t border-[var(--app-border)] bg-[var(--app-accent-soft)]/45 p-5 sm:p-6 md:border-t-0 md:border-l">
                <p className="text-xs font-semibold tracking-wide text-[var(--brand-blue)] uppercase">
                  Next teaching move
                </p>
                <p className="mt-2 text-base leading-7 font-medium text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                  {intervention.action}
                </p>

                {intervention.watchFor ? (
                  <div className="mt-5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
                    <p className="text-xs font-medium tracking-wide text-[var(--app-muted)] uppercase">
                      Also watch for
                    </p>
                    <p className="mt-1 text-sm font-medium text-[var(--app-fg)]">
                      {intervention.watchFor.tag}
                    </p>
                    <p className="mt-1 text-xs text-[var(--app-muted)]">
                      Separate class-wide pattern ·{" "}
                      {intervention.watchFor.studentCount} student
                      {intervention.watchFor.studentCount === 1 ? "" : "s"} ·{" "}
                      {intervention.watchFor.totalCount} observation
                      {intervention.watchFor.totalCount === 1 ? "" : "s"}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
            <p className="border-t border-[var(--app-border)] px-5 py-3 text-xs leading-5 text-[var(--app-muted)] sm:px-6">
              Method: widest student reach first, then repeated check misses.
              Early signals stay targeted until more evidence arrives.
            </p>
          </>
        ) : (
          <div className="px-5 py-6 sm:px-6">
            <h3 className="font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
              {intervention.title}
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--app-muted)]">
              {intervention.description}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
