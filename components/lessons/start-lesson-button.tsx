"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { startLessonForConceptAction } from "@/lib/lessons/actions"

type StartLessonButtonProps = {
  conceptId: string
  label?: string
  size?: "default" | "sm" | "lg"
  className?: string
}

export const StartLessonButton = ({
  conceptId,
  label = "Start lesson",
  size = "default",
  className,
}: StartLessonButtonProps) => {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleClick = () => {
    setError(null)
    startTransition(async () => {
      const result = await startLessonForConceptAction(conceptId)
      if (!result?.ok) {
        setError(result?.error ?? "Could not start lesson.")
        return
      }
      if (result.redirectTo) {
        router.push(result.redirectTo)
      }
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        size={size}
        className={className}
        disabled={pending}
        onClick={handleClick}
        aria-label={label}
      >
        {pending ? <Loader2 className="animate-spin" /> : null}
        {label}
      </Button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
