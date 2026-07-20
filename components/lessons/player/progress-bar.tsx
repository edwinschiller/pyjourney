"use client"

type LessonProgressBarProps = {
  current: number
  total: number
}

export const LessonProgressBar = ({
  current,
  total,
}: LessonProgressBarProps) => {
  const safeTotal = Math.max(total, 1)
  const clamped = Math.min(Math.max(current, 0), safeTotal)
  const percent = Math.round((clamped / safeTotal) * 100)

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs font-medium text-[var(--app-muted)]">
        <span>
          Step {clamped} of {safeTotal}
        </span>
        <span>{percent}%</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-[var(--app-border)]"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Lesson progress"
      >
        <div
          className="h-full rounded-full bg-[var(--brand-blue)] transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
