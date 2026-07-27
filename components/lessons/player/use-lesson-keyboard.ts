"use client"

import { useEffect } from "react"

type LessonKeyboardHandlers = {
  onContinue?: () => void
  onBack?: () => void
  onSubmit?: () => void
  onChoice?: (index: number) => void
  canContinue?: boolean
  canBack?: boolean
  canSubmit?: boolean
  choiceCount?: number
  enabled?: boolean
}

/** Lesson shortcuts: Enter, ←/→, 1–9. Never steal Enter inside textareas. */
export const useLessonKeyboard = ({
  onContinue,
  onBack,
  onSubmit,
  onChoice,
  canContinue = false,
  canBack = false,
  canSubmit = false,
  choiceCount = 0,
  enabled = true,
}: LessonKeyboardHandlers) => {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const tag = target?.tagName?.toLowerCase()
      const isTextarea = tag === "textarea"
      const isInput = tag === "input"
      const isEditable = Boolean(target?.isContentEditable)
      const isTyping = isTextarea || isInput || isEditable

      // Multi-line editors: Enter = newline only (never check / continue).
      if (isTextarea || (isEditable && event.key === "Enter")) {
        if (event.key === "Enter") return
        if (isTyping) return
      }

      if (event.key === "Enter" && !event.shiftKey) {
        // Single-line inputs may submit a check, but never advance the lesson.
        if (isInput) {
          if (canSubmit && onSubmit) {
            event.preventDefault()
            onSubmit()
          }
          return
        }
        if (canSubmit && onSubmit) {
          event.preventDefault()
          onSubmit()
          return
        }
        if (canContinue && onContinue) {
          event.preventDefault()
          onContinue()
        }
        return
      }

      if (isTyping) return

      if (event.key === "ArrowRight" && canContinue && onContinue) {
        event.preventDefault()
        onContinue()
      }

      if (event.key === "ArrowLeft" && canBack && onBack) {
        event.preventDefault()
        onBack()
      }

      const num = Number(event.key)
      if (
        num >= 1 &&
        num <= 9 &&
        choiceCount >= num &&
        onChoice &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        event.preventDefault()
        onChoice(num - 1)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    enabled,
    onContinue,
    onBack,
    onSubmit,
    onChoice,
    canContinue,
    canBack,
    canSubmit,
    choiceCount,
  ])
}
