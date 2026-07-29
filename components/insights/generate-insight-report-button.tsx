"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { LessonCta } from "@/components/lessons/player/lesson-cta"
import {
  generateClassInsightReportAction,
  generateMyInsightReportAction,
  generateStudentInsightReportAction,
} from "@/lib/insights/actions"

type GenerateInsightReportButtonProps = {
  kind: "student-self" | "student" | "class"
  studentId?: string
  classroomId?: string
  label?: string
}

export const GenerateInsightReportButton = ({
  kind,
  studentId,
  classroomId,
  label = "Generate AI report",
}: GenerateInsightReportButtonProps) => {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const handleClick = () => {
    setError(null)
    startTransition(async () => {
      const result =
        kind === "student-self"
          ? await generateMyInsightReportAction()
          : kind === "class"
            ? await generateClassInsightReportAction(classroomId!)
            : await generateStudentInsightReportAction(
                studentId!,
                classroomId
              )
      if (!result.ok) {
        setError(result.error ?? "Could not generate report.")
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <LessonCta
        tone="primary"
        className="!min-h-9 !px-3 !text-xs"
        loading={pending}
        onClick={handleClick}
        aria-label={label}
      >
        {label}
      </LessonCta>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
