import { InsightsCollapsible } from "@/components/insights/insights-collapsible"

export const HowInsightsWork = () => (
  <InsightsCollapsible
    id="how-insights-work"
    title="How insights work"
    summary="What we track, why numbers move, and how to use this page."
    badge="Guide"
  >
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          Lesson checks
        </h3>
        <p className="text-sm leading-relaxed text-[var(--app-muted)]">
          Every quiz, practice, and apply step records a pass or fail. Pass rate
          is simply{" "}
          <span className="font-medium text-[var(--app-fg)]">
            passes ÷ all checks
          </span>
          . Struggle topics are places where fails keep showing up.
        </p>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          Coding snapshots
        </h3>
        <p className="text-sm leading-relaxed text-[var(--app-muted)]">
          While you code in a lesson or the free IDE, we save a snapshot about
          every 15 seconds when the code changes. Some snapshots get a short AI
          note (sparingly, to control cost). Expand a snapshot to see code,
          errors, and next-step hints.
        </p>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <h3 className="text-sm font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          AI coaching report
        </h3>
        <p className="text-sm leading-relaxed text-[var(--app-muted)]">
          The report combines check stats with recent snapshot analyses. It is a
          coach, not a grade — regenerate after more practice to refresh it.
          Tips are split into lesson path vs free practice so you know where to
          act next.
        </p>
      </div>
    </div>
  </InsightsCollapsible>
)
