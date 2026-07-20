"use client"

import { ArrowDown, ArrowUp, GripVertical } from "lucide-react"
import { useCallback, useMemo, useState, type ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { LessonBlock } from "@/lib/ai/schemas/lesson-blocks"
import {
  isInteractiveStepComplete,
  type LessonStepState,
} from "@/lib/lessons/validate-step"
import { cn } from "@/lib/utils"

type BlockViewProps = {
  block: LessonBlock
  stepState: LessonStepState
  onStepStateChange: (state: LessonStepState) => void
}

const CodeSnippet = ({ code }: { code: string }) => (
  <pre className="overflow-x-auto rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-3 font-mono text-sm leading-relaxed text-[var(--app-fg)]">
    {code}
  </pre>
)

const FeedbackBanner = ({
  passed,
  message,
}: {
  passed: boolean
  message: string
}) => (
  <p
    role="status"
    className={cn(
      "rounded-lg px-3 py-2 text-sm",
      passed
        ? "bg-[var(--app-accent-soft)] text-[var(--brand-blue)]"
        : "bg-destructive/10 text-destructive"
    )}
  >
    {message}
  </p>
)

const ChoiceList = ({
  choices,
  selectedId,
  submitted,
  correctId,
  onSelect,
}: {
  choices: { id: string; label: string }[]
  selectedId: string | null
  submitted: boolean
  correctId: string
  onSelect: (id: string) => void
}) => (
  <ul className="flex flex-col gap-2">
    {choices.map((choice) => {
      const selected = selectedId === choice.id
      const showCorrect = submitted && choice.id === correctId
      const showWrong = submitted && selected && choice.id !== correctId
      return (
        <li key={choice.id}>
          <button
            type="button"
            tabIndex={0}
            aria-label={choice.label}
            aria-pressed={selected}
            disabled={submitted && selectedId === correctId}
            onClick={() => onSelect(choice.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                onSelect(choice.id)
              }
            }}
            className={cn(
              "w-full rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
              selected &&
                !submitted &&
                "border-[var(--brand-blue)] bg-[var(--app-accent-soft)]",
              !selected &&
                !submitted &&
                "border-[var(--app-border)] bg-[var(--app-surface)] hover:border-[var(--brand-blue)]/40",
              showCorrect &&
                "border-[var(--brand-blue)] bg-[var(--app-accent-soft)] text-[var(--brand-blue)]",
              showWrong && "border-destructive bg-destructive/10 text-destructive",
              submitted && !selected && !showCorrect && "opacity-60"
            )}
          >
            {choice.label}
          </button>
        </li>
      )
    })}
  </ul>
)

export const BlockView = ({
  block,
  stepState,
  onStepStateChange,
}: BlockViewProps) => {
  const [feedback, setFeedback] = useState<{
    passed: boolean
    message: string
  } | null>(null)

  const patchState = useCallback(
    (patch: Partial<LessonStepState>) => {
      setFeedback(null)
      onStepStateChange({ ...stepState, ...patch })
    },
    [onStepStateChange, stepState]
  )

  const matchRights = useMemo(() => {
    if (block.kind !== "match") return []
    return [...new Set(block.pairs.map((pair) => pair.right))].sort(
      () => Math.random() - 0.5
    )
  }, [block])

  if (block.kind === "intro") {
    return (
      <article className="flex flex-col gap-4">
        {block.title ? (
          <h2 className="text-2xl font-bold tracking-tight text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            {block.title}
          </h2>
        ) : null}
        <div className="space-y-2.5 border-l-2 border-[var(--brand-blue)]/30 pl-4">
          {block.lines.map((line) => (
            <p
              key={line}
              className="text-[15px] leading-relaxed text-[var(--app-muted)]"
            >
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
        {"code" in block && block.code ? <CodeSnippet code={block.code} /> : null}
        <ChoiceList
          choices={block.choices}
          selectedId={stepState.selectedChoiceId}
          submitted={stepState.choiceSubmitted}
          correctId={block.correctId}
          onSelect={(id) => {
            if (stepState.choiceSubmitted) return
            patchState({ selectedChoiceId: id })
          }}
        />
        {feedback ? (
          <FeedbackBanner passed={feedback.passed} message={feedback.message} />
        ) : null}
        {!stepState.choiceSubmitted && stepState.selectedChoiceId ? (
          <Button
            type="button"
            onClick={() => {
              const passed = stepState.selectedChoiceId === block.correctId
              patchState({ choiceSubmitted: true })
              setFeedback({
                passed,
                message: passed ? block.feedback.correct : block.feedback.wrong,
              })
            }}
            aria-label="Check answer"
          >
            Check
          </Button>
        ) : null}
        {stepState.choiceSubmitted &&
        !isInteractiveStepComplete(block, stepState) ? (
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              patchState({ selectedChoiceId: null, choiceSubmitted: false })
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
              patchState({
                fillValue: event.target.value,
                fillSubmitted: false,
              })
            }
            placeholder={block.placeholder ?? "…"}
            className="mx-1 inline-flex h-9 w-36 font-mono"
            aria-label="Fill in the blank"
            disabled={
              stepState.fillSubmitted &&
              isInteractiveStepComplete(block, stepState)
            }
          />
          {parts[1] ? <span>{parts[1]}</span> : null}
        </div>
        {feedback ? (
          <FeedbackBanner passed={feedback.passed} message={feedback.message} />
        ) : null}
        {!stepState.fillSubmitted ? (
          <Button
            type="button"
            disabled={!stepState.fillValue.trim()}
            onClick={() => {
              const next = { ...stepState, fillSubmitted: true }
              const passed = isInteractiveStepComplete(block, next)
              onStepStateChange(next)
              setFeedback({
                passed,
                message: passed ? block.feedback.correct : block.feedback.wrong,
              })
            }}
            aria-label="Check fill answer"
          >
            Check
          </Button>
        ) : null}
      </article>
    )
  }

  if (block.kind === "dragOrder") {
    const move = (from: number, direction: -1 | 1) => {
      const to = from + direction
      if (to < 0 || to >= stepState.dragOrder.length) return
      const next = [...stepState.dragOrder]
      ;[next[from], next[to]] = [next[to]!, next[from]!]
      patchState({ dragOrder: next, dragChecked: false })
    }

    return (
      <article className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          {block.prompt}
        </h2>
        <ul className="flex flex-col gap-2">
          {stepState.dragOrder.map((blockIndex, position) => (
            <li
              key={`${blockIndex}-${position}`}
              className="flex items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2"
            >
              <GripVertical
                className="size-4 text-[var(--app-muted)]"
                aria-hidden
              />
              <span className="flex-1 font-mono text-sm">
                {block.blocks[blockIndex]}
              </span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => move(position, -1)}
                aria-label="Move up"
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => move(position, 1)}
                aria-label="Move down"
              >
                <ArrowDown className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
        {feedback ? (
          <FeedbackBanner passed={feedback.passed} message={feedback.message} />
        ) : null}
        <Button
          type="button"
          onClick={() => {
            const passed = stepState.dragOrder.every(
              (index, position) => index === block.correctOrder[position]
            )
            patchState({ dragChecked: true })
            setFeedback({
              passed,
              message: passed ? block.feedback.correct : block.feedback.wrong,
            })
          }}
          aria-label="Check order"
        >
          Check
        </Button>
      </article>
    )
  }

  if (block.kind === "match") {
    const handlePickLeft = (left: string) => {
      if (stepState.matchedPairs.has(left)) return
      patchState({ selectedMatchLeft: left })
    }

    const handlePickRight = (right: string) => {
      const left = stepState.selectedMatchLeft
      if (!left) return
      const pair = block.pairs.find((item) => item.left === left)
      if (!pair || pair.right !== right) {
        setFeedback({ passed: false, message: block.feedback.wrong })
        patchState({ selectedMatchLeft: null })
        return
      }
      const next = new Map(stepState.matchedPairs)
      next.set(left, right)
      const done = next.size === block.pairs.length
      onStepStateChange({
        ...stepState,
        matchedPairs: next,
        selectedMatchLeft: null,
      })
      setFeedback({
        passed: true,
        message: done ? block.feedback.correct : "Matched — keep going.",
      })
    }

    return (
      <article className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          {block.prompt}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ul className="flex flex-col gap-2">
            {block.pairs.map((pair) => {
              const matched = stepState.matchedPairs.has(pair.left)
              return (
                <li key={pair.left}>
                  <button
                    type="button"
                    tabIndex={0}
                    disabled={matched}
                    aria-label={`Match ${pair.left}`}
                    aria-pressed={stepState.selectedMatchLeft === pair.left}
                    onClick={() => handlePickLeft(pair.left)}
                    className={cn(
                      "w-full rounded-xl border px-3 py-2 text-left text-sm",
                      matched && "opacity-40",
                      stepState.selectedMatchLeft === pair.left
                        ? "border-[var(--brand-blue)] bg-[var(--app-accent-soft)]"
                        : "border-[var(--app-border)]"
                    )}
                  >
                    {pair.left}
                  </button>
                </li>
              )
            })}
          </ul>
          <ul className="flex flex-col gap-2">
            {matchRights.map((right) => {
              const used = [...stepState.matchedPairs.values()].includes(right)
              return (
                <li key={right}>
                  <button
                    type="button"
                    tabIndex={0}
                    disabled={used || !stepState.selectedMatchLeft}
                    aria-label={`Pair with ${right}`}
                    onClick={() => handlePickRight(right)}
                    className={cn(
                      "w-full rounded-xl border border-[var(--app-border)] px-3 py-2 text-left text-sm",
                      used && "opacity-40"
                    )}
                  >
                    {right}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
        {feedback ? (
          <FeedbackBanner passed={feedback.passed} message={feedback.message} />
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
            patchState({
              miniEditCode: event.target.value,
              miniEditChecked: false,
            })
          }
          rows={6}
          spellCheck={false}
          aria-label="Mini edit code"
          className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-3 font-mono text-sm leading-relaxed text-[var(--app-fg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]"
        />
        {feedback ? (
          <FeedbackBanner passed={feedback.passed} message={feedback.message} />
        ) : null}
        <Button
          type="button"
          onClick={() => {
            const next = { ...stepState, miniEditChecked: true }
            const passed = isInteractiveStepComplete(block, next)
            onStepStateChange(next)
            setFeedback({
              passed,
              message: passed ? block.feedback.correct : block.feedback.wrong,
            })
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
      <article className="flex flex-col items-start gap-3 py-4">
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

  return null as ReactNode
}
