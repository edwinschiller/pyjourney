import { InsightsCollapsible } from "@/components/insights/insights-collapsible"
import type {
  MisconceptionStatRow,
  TopicStatRow,
} from "@/lib/memory/types"

type StrugglePanelProps = {
  topics: TopicStatRow[]
  misconceptions: MisconceptionStatRow[]
}

const humanizeTag = (tag: string) =>
  tag
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())

export const StrugglePanel = ({
  topics,
  misconceptions,
}: StrugglePanelProps) => (
  <div className="space-y-3">
    <InsightsCollapsible
      id="struggle-topics"
      title="Where you struggle"
      summary="Lesson topics with fails — use these as your practice shortlist."
      badge={topics.length > 0 ? String(topics.length) : undefined}
      defaultOpen={topics.length > 0}
    >
      {topics.length === 0 ? (
        <p className="text-sm text-[var(--app-muted)]">
          No repeated fails yet. Keep checking answers in lessons — struggle
          topics appear when a topic shows fails.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--app-border)] overflow-hidden rounded-xl border border-[var(--app-border)]">
          {topics.map((row) => {
            const total = row.passes + row.fails
            const failShare =
              total > 0 ? Math.round((row.fails / total) * 100) : 0
            return (
              <li
                key={`${row.conceptId}:${row.topicId}`}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                    {row.topicTitle}
                  </p>
                  <p className="text-sm text-[var(--app-muted)]">
                    {row.conceptTitle} · {failShare}% of attempts failed
                  </p>
                  <p className="mt-1 text-xs text-[var(--app-muted)]">
                    Tip: reopen the concept, read the fail feedback, then retry
                    once with a smaller change.
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-[var(--brand-blue)]">
                  {row.fails} fail{row.fails === 1 ? "" : "s"} · {row.passes}{" "}
                  pass{row.passes === 1 ? "" : "es"}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </InsightsCollapsible>

    <InsightsCollapsible
      id="patterns"
      title="Recurring patterns"
      summary="Curriculum tags linked to failed checks — common mix-ups to watch for."
      badge={
        misconceptions.length > 0 ? String(misconceptions.length) : undefined
      }
    >
      {misconceptions.length === 0 ? (
        <p className="text-sm text-[var(--app-muted)]">
          Patterns appear after failed checks that map to known misconceptions
          (for example comparing a string from{" "}
          <code className="rounded bg-[var(--app-bg)] px-1 py-0.5 text-xs">
            input()
          </code>{" "}
          to an int without{" "}
          <code className="rounded bg-[var(--app-bg)] px-1 py-0.5 text-xs">
            int(...)
          </code>
          ).
        </p>
      ) : (
        <ul className="divide-y divide-[var(--app-border)] overflow-hidden rounded-xl border border-[var(--app-border)]">
          {misconceptions.map((row) => (
            <li
              key={row.tag}
              className="flex flex-wrap items-start justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-medium text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                  {humanizeTag(row.tag)}
                </p>
                {row.conceptTitle ? (
                  <p className="text-sm text-[var(--app-muted)]">
                    Seen in {row.conceptTitle}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-[var(--app-muted)]">
                  When this pops up, pause and check types, indentation, or the
                  exact comparison you are making.
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-[var(--brand-blue)]">
                ×{row.count}
              </p>
            </li>
          ))}
        </ul>
      )}
    </InsightsCollapsible>
  </div>
)
