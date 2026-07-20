"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { LessonBlock } from "@/lib/ai/schemas/lesson-blocks"
import {
  isStepComplete,
  type LessonStepState,
} from "@/lib/lessons/validate-step"
import { cn } from "@/lib/utils"

type BlockViewProps = {
  block: LessonBlock
  stepState: LessonStepState
  onStepStateChange: (state: LessonStepState) => void
  onChecked?: (passed: boolean) => void
}

export const BlockView = ({
  block,
  stepState,
  onStepStateChange,
  onChecked,
}: BlockViewProps) => {
  const [feedback, setFeedback] = useState<string | null>(null)
  const [passed, setPassed] = useState<boolean | null>(null)

  const patch = (partial: Partial<LessonStepState>) => {
    setFeedback(null)
    setPassed(null)
    onStepStateChange({ ...stepState, ...partial })
  }

  if (block.kind === "intro") {
    return (
      <article className="flex flex-col gap-3">
        {block.title ? (
          <h2 className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            {block.title}
          </h2>
        ) : null}
        <div className="space-y-2 border-l-2 border-[var(--brand-blue)]/30 pl-4">
          {block.lines.map((line) => (
            <p key={line} className="text-[15px] text-[var(--app-muted)]">
              {line}
            </p>
          ))}
        </div>
      </article>
    )
  }

  if (
    block.kind === "multipleChoice" ||
    block.kind === "prediction" ||
    block.kind === "debug"
  ) {
    return (
      <article className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          {block.prompt}
        </h2>
        {"code" in block && block.code ? (
          <pre className="overflow-x-auto rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-3 font-mono text-sm">
            {block.code}
          </pre>
        ) : null}
        <ul className="flex flex-col gap-2">
          {block.choices.map((choice) => (
            <li key={choice.id}>
              <button
                type="button"
                tabIndex={0}
                aria-pressed={stepState.selectedChoiceId === choice.id}
                aria-label={choice.label}
                disabled={
                  stepState.choiceSubmitted &&
                  stepState.selectedChoiceId === block.correctId
                }
                onClick={() => {
                  if (stepState.choiceSubmitted) return
                  patch({ selectedChoiceId: choice.id })
                }}
                className={cn(
                  "w-full rounded-xl border px-3 py-2.5 text-left text-sm",
                  stepState.selectedChoiceId === choice.id
                    ? "border-[var(--brand-blue)] bg-[var(--app-accent-soft)]"
                    : "border-[var(--app-border)]"
                )}
              >
                {choice.label}
              </button>
            </li>
          ))}
        </ul>
        {feedback ? (
          <p
            role="status"
            className={cn(
              "text-sm",
              passed ? "text-[var(--brand-blue)]" : "text-destructive"
            )}
          >
            {feedback}
          </p>
        ) : null}
        {!stepState.choiceSubmitted && stepState.selectedChoiceId ? (
          <Button
            type="button"
            onClick={() => {
              const ok = stepState.selectedChoiceId === block.correctId
              const next = {
                ...stepState,
                choiceSubmitted: true,
                attempts: stepState.attempts + 1,
              }
              onStepStateChange(next)
              setPassed(ok)
              setFeedback(ok ? block.feedback.correct : block.feedback.wrong)
              onChecked?.(ok)
            }}
            aria-label="Check answer"
          >
            Check
          </Button>
        ) : null}
        {stepState.choiceSubmitted &&
        !isStepComplete(block, stepState) ? (
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              patch({ selectedChoiceId: null, choiceSubmitted: false })
            }
            aria-label="Try again"
          >
            Try again
          </Button>
        ) : null}
      </article>
    )
  }

  if (block.kind === "fillBlank") {
    const parts = block.template.split("___")
    return (
      <article className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          {block.prompt}
        </h2>
        <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4 font-mono text-sm">
          <span>{parts[0]}</span>
          <Input
            value={stepState.fillValue}
            onChange={(event) =>
              patch({ fillValue: event.target.value, fillSubmitted: false })
            }
            placeholder={block.placeholder ?? "…"}
            className="mx-1 inline-flex h-9 w-36 font-mono"
            aria-label="Fill blank"
          />
          {parts[1] ? <span>{parts[1]}</span> : null}
        </div>
        {feedback ? (
          <p
            role="status"
            className={cn(
              "text-sm",
              passed ? "text-[var(--brand-blue)]" : "text-destructive"
            )}
          >
            {feedback}
          </p>
        ) : null}
        {!stepState.fillSubmitted ? (
          <Button
            type="button"
            disabled={!stepState.fillValue.trim()}
            onClick={() => {
              const next = {
                ...stepState,
                fillSubmitted: true,
                attempts: stepState.attempts + 1,
              }
              const ok = isStepComplete(block, next)
              onStepStateChange(next)
              setPassed(ok)
              setFeedback(ok ? block.feedback.correct : block.feedback.wrong)
              onChecked?.(ok)
            }}
            aria-label="Check fill"
          >
            Check
          </Button>
        ) : null}
      </article>
    )
  }

  if (block.kind === "miniEdit") {
    return (
      <article className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          {block.prompt}
        </h2>
        <ul className="space-y-1 text-sm text-[var(--app-muted)]">
          {block.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <textarea
          value={stepState.miniEditCode}
          onChange={(event) =>
            patch({
              miniEditCode: event.target.value,
              miniEditChecked: false,
            })
          }
          rows={6}
          spellCheck={false}
          aria-label="Mini edit"
          className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]"
        />
        {feedback ? (
          <p
            role="status"
            className={cn(
              "text-sm",
              passed ? "text-[var(--brand-blue)]" : "text-destructive"
            )}
          >
            {feedback}
          </p>
        ) : null}
        <Button
          type="button"
          onClick={() => {
            const next = {
              ...stepState,
              miniEditChecked: true,
              attempts: stepState.attempts + 1,
            }
            const ok = isStepComplete(block, next)
            onStepStateChange(next)
            setPassed(ok)
            setFeedback(ok ? block.feedback.correct : block.feedback.wrong)
            onChecked?.(ok)
          }}
          aria-label="Check mini edit"
        >
          Check
        </Button>
      </article>
    )
  }

  if (block.kind === "complete") {
    return (
      <article className="flex flex-col gap-2 py-2">
        <p className="text-xs font-medium tracking-wide text-[var(--brand-blue)] uppercase">
          Complete
        </p>
        <h2 className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          {block.title}
        </h2>
        {block.lines.map((line) => (
          <p key={line} className="text-[var(--app-muted)]">
            {line}
          </p>
        ))}
      </article>
    )
  }

  return null
}
