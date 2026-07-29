"use client"

import { ArrowRight, Terminal } from "lucide-react"
import { useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type PythonInputDialogProps = {
  open: boolean
  prompt: string
  value: string
  inputIndex?: number
  inputTotal?: number
  onValueChange: (value: string) => void
  onSubmit: () => void
  onCancel: () => void
}

export const PythonInputDialog = ({
  open,
  prompt,
  value,
  inputIndex = 0,
  inputTotal = 1,
  onValueChange,
  onSubmit,
  onCancel,
}: PythonInputDialogProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80)
    return () => window.clearTimeout(timer)
  }, [open, prompt, inputIndex])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onCancel()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onCancel])

  if (!open) return null

  const displayPrompt = prompt.trim()
  const hasPrompt = displayPrompt.length > 0
  const isLastStep = inputIndex >= inputTotal - 1

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      onSubmit()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="python-input-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40 supports-backdrop-filter:backdrop-blur-xs"
        aria-label="Cancel input"
        onClick={onCancel}
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-[420px] overflow-hidden rounded-2xl border border-[var(--app-border)]",
          "bg-[var(--app-surface)] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.35)]"
        )}
      >
        <div className="border-b border-[var(--app-border)] px-5 pt-5 pb-4">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)]/60 text-[var(--app-accent)]">
              <Terminal className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-[var(--app-muted)] uppercase">
                Program input
              </p>
              <h2
                id="python-input-title"
                className="text-lg leading-tight font-semibold text-[var(--app-fg)]"
              >
                {inputTotal > 1
                  ? `Step ${inputIndex + 1} of ${inputTotal}`
                  : "Your input"}
              </h2>
            </div>
          </div>

          {inputTotal > 1 ? (
            <div
              className="mt-4 flex gap-1.5"
              role="progressbar"
              aria-valuenow={inputIndex + 1}
              aria-valuemin={1}
              aria-valuemax={inputTotal}
            >
              {Array.from({ length: inputTotal }).map((_, step) => (
                <div
                  key={step}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-all duration-300",
                    step <= inputIndex
                      ? "bg-[var(--app-accent)]"
                      : "bg-[var(--app-border)]"
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="space-y-2">
            <p className="text-xs font-medium text-[var(--app-muted)]">
              Call in code
            </p>
            <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)]/90 px-4 py-3 font-mono text-sm leading-relaxed">
              <span className="text-[var(--app-accent)]">input</span>
              <span className="text-[var(--app-muted)]">(</span>
              {hasPrompt ? (
                <span className="text-[var(--app-fg)]">
                  &quot;{displayPrompt}&quot;
                </span>
              ) : null}
              <span className="text-[var(--app-muted)]">)</span>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="python-input-field"
              className="text-xs font-medium text-[var(--app-muted)]"
            >
              {hasPrompt ? displayPrompt : "Enter a value"}
            </label>
            <Input
              id="python-input-field"
              ref={inputRef}
              value={value}
              onChange={(event) => onValueChange(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type here…"
              className="h-12 rounded-xl border-[var(--app-border)] bg-[var(--app-bg)] font-mono text-base"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--app-border)] bg-[var(--app-bg)]/40 px-5 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="text-[var(--app-muted)] hover:text-[var(--app-fg)]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-10 min-w-[120px] gap-2 rounded-xl px-4"
            onClick={onSubmit}
          >
            {isLastStep ? "OK" : "Next"}
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  )
}
