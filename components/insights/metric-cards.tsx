import { InsightsCollapsible } from "@/components/insights/insights-collapsible"

type MetricCardsProps = {
  totalEvents: number
  passRate: number | null
  passCount: number
  failCount: number
  struggleCount: number
  lessonSnapshotCount: number
  freeSnapshotCount: number
}

const MetricCard = ({
  label,
  value,
  detail,
  explain,
}: {
  label: string
  value: string
  detail?: string
  explain: string
}) => (
  <div className="app-surface flex flex-col gap-2 rounded-2xl p-4">
    <p className="text-[10px] font-semibold tracking-[0.14em] text-[var(--app-muted)] uppercase">
      {label}
    </p>
    <p className="text-2xl font-bold tabular-nums text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
      {value}
    </p>
    {detail ? (
      <p className="text-xs text-[var(--app-muted)]">{detail}</p>
    ) : null}
    <p className="text-xs leading-relaxed text-[var(--app-muted)]">{explain}</p>
  </div>
)

export const MetricCards = ({
  totalEvents,
  passRate,
  passCount,
  failCount,
  struggleCount,
  lessonSnapshotCount,
  freeSnapshotCount,
}: MetricCardsProps) => (
  <section className="space-y-3" aria-label="Learning activity summary">
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        label="Lesson checks"
        value={String(totalEvents)}
        detail={`${passCount} passed · ${failCount} failed`}
        explain="Counted each time you submit a quiz, practice, or apply step."
      />
      <MetricCard
        label="Pass rate"
        value={passRate == null ? "—" : `${passRate}%`}
        detail="Not a grade — a practice signal"
        explain="High is good, but fails are useful: they point to topics worth revisiting."
      />
      <MetricCard
        label="Struggle topics"
        value={String(struggleCount)}
        detail="Topics with at least one fail"
        explain="Sorted by how often you miss them. Expand “Where you struggle” for actions."
      />
      <MetricCard
        label="Coding snapshots"
        value={String(lessonSnapshotCount + freeSnapshotCount)}
        detail={`${lessonSnapshotCount} lesson · ${freeSnapshotCount} IDE`}
        explain="Saved while you code. Only some are AI-analyzed to keep costs low."
      />
    </div>

    <InsightsCollapsible
      id="metrics-explained"
      title="What these numbers mean"
      summary="A quick legend so the cards above are not a black box."
    >
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-[var(--app-fg)]">Pass rate</dt>
          <dd className="mt-1 text-[var(--app-muted)]">
            Formula: passes ÷ (passes + fails). A 80% rate with many attempts
            usually means solid progress with room to polish weak spots.
          </dd>
        </div>
        <div>
          <dt className="font-medium text-[var(--app-fg)]">Struggle topics</dt>
          <dd className="mt-1 text-[var(--app-muted)]">
            Built from lesson check history. Free IDE work shows up in snapshots,
            not in this count — unless it feeds mastery via analysis.
          </dd>
        </div>
        <div>
          <dt className="font-medium text-[var(--app-fg)]">Lesson vs IDE</dt>
          <dd className="mt-1 text-[var(--app-muted)]">
            Lesson snapshots come from coding steps on the path. IDE snapshots
            come from free practice programs.
          </dd>
        </div>
        <div>
          <dt className="font-medium text-[var(--app-fg)]">AI analysis</dt>
          <dd className="mt-1 text-[var(--app-muted)]">
            Not every snapshot is analyzed. stderr, bigger edits, and spacing
            rules decide which ones get a short coaching note.
          </dd>
        </div>
      </dl>
    </InsightsCollapsible>
  </section>
)
