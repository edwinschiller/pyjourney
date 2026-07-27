"use client"

import { CheckCircle2, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"

type StepFeedbackProps = {
  passed: boolean
  message: string
  className?: string
}

export const StepFeedback = ({
  passed,
  message,
  className,
}: StepFeedbackProps) => (
  <div
    role="status"
    className={cn(
      "lesson-pop flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm font-medium",
      passed
        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
        : "lesson-shake border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-100",
      className
    )}
  >
    {passed ? (
      <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden />
    ) : (
      <XCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
    )}
    <p className="leading-relaxed">{message}</p>
  </div>
)
