"use client"

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"

import { LessonCta } from "@/components/lessons/player/lesson-cta"
import { StepFeedback } from "@/components/lessons/player/step-feedback"
import { SimpleMarkdown } from "@/components/markdown/simple-markdown"
import { Input } from "@/components/ui/input"
import type { LessonBlock } from "@/lib/ai/schemas/lesson-blocks"
import {
  isStepComplete,
  type LessonStepState,
} from "@/lib/lessons/validate-step"
import { shuffleWithSeed } from "@/lib/lessons/quiz-quality"
import { cn } from "@/lib/utils"

const orderedQuizChoices = (
  block: Extract<LessonBlock, { kind: "quiz" }>
) =>
  shuffleWithSeed(
    block.choices,
    `${block.id}:${block.correctId}:${block.choices.map((choice) => choice.id).join(",")}`
  )

export type BlockViewHandle = {
  check: () => boolean
  selectChoice: (index: number) => void
  retry: () => void
}

export type BlockActionState = {
  canCheck: boolean
  canRetry: boolean
  choiceCount: number
  feedback: { passed: boolean; message: string } | null
  justPassed: boolean
}

type BlockViewProps = {
  block: LessonBlock
  stepState: LessonStepState
  onStepStateChange: (state: LessonStepState) => void
  onChecked?: (passed: boolean) => void
  onActionStateChange?: (state: BlockActionState) => void
  /** Hide inline Check — parent footer owns the CTA. */
  hideInlineCheck?: boolean
}

export const BlockView = forwardRef<BlockViewHandle, BlockViewProps>(
  function BlockView(
    {
      block,
      stepState,
      onStepStateChange,
      onChecked,
      onActionStateChange,
      hideInlineCheck = true,
    },
    ref
  ) {
    const [feedback, setFeedback] = useState<{
      passed: boolean
      message: string
    } | null>(null)

    const stepStateRef = useRef(stepState)
    const blockRefLocal = useRef(block)
    stepStateRef.current = stepState
    blockRefLocal.current = block

    const patch = (partial: Partial<LessonStepState>) => {
      setFeedback(null)
      onStepStateChange({ ...stepStateRef.current, ...partial })
    }

    const runQuizCheck = () => {
      const currentBlock = blockRefLocal.current
      const state = stepStateRef.current
      if (currentBlock.kind !== "quiz" || !state.selectedChoiceId) return false
      if (state.choiceSubmitted) return false
      const ok = state.selectedChoiceId === currentBlock.correctId
      const next = {
        ...state,
        choiceSubmitted: true,
        attempts: state.attempts + 1,
      }
      onStepStateChange(next)
      setFeedback({
        passed: ok,
        message: ok
          ? currentBlock.feedback.correct
          : currentBlock.feedback.wrong,
      })
      onChecked?.(ok)
      return ok
    }

    const runPracticeCheck = () => {
      const currentBlock = blockRefLocal.current
      const state = stepStateRef.current
      if (currentBlock.kind !== "practice") return false
      if (currentBlock.mode === "fillBlank") {
        if (!state.fillValue.trim() || state.fillSubmitted) return false
        const next = {
          ...state,
          fillSubmitted: true,
          attempts: state.attempts + 1,
        }
        const ok = isStepComplete(currentBlock, next)
        onStepStateChange(next)
        setFeedback({
          passed: ok,
          message: ok
            ? currentBlock.feedback.correct
            : currentBlock.feedback.wrong,
        })
        onChecked?.(ok)
        return ok
      }
      if (state.miniEditChecked) return false
      const next = {
        ...state,
        miniEditChecked: true,
        attempts: state.attempts + 1,
      }
      const ok = isStepComplete(currentBlock, next)
      onStepStateChange(next)
      setFeedback({
        passed: ok,
        message: ok
          ? currentBlock.feedback.correct
          : currentBlock.feedback.wrong,
      })
      onChecked?.(ok)
      return ok
    }

    useImperativeHandle(ref, () => ({
      check: () => {
        const currentBlock = blockRefLocal.current
        if (currentBlock.kind === "quiz") return runQuizCheck()
        if (currentBlock.kind === "practice") return runPracticeCheck()
        return false
      },
      selectChoice: (index: number) => {
        const currentBlock = blockRefLocal.current
        const state = stepStateRef.current
        if (currentBlock.kind !== "quiz") return
        if (state.choiceSubmitted) return
        const choice = orderedQuizChoices(currentBlock)[index]
        if (!choice) return
        setFeedback(null)
        onStepStateChange({ ...state, selectedChoiceId: choice.id })
      },
      retry: () => {
        const currentBlock = blockRefLocal.current
        if (currentBlock.kind === "quiz") {
          patch({ selectedChoiceId: null, choiceSubmitted: false })
          return
        }
        if (currentBlock.kind === "practice" && currentBlock.mode === "fillBlank") {
          patch({ fillSubmitted: false })
          return
        }
        if (currentBlock.kind === "practice") {
          patch({ miniEditChecked: false })
        }
      },
    }))

    useEffect(() => {
      setFeedback(null)
    }, [block.id])

    useEffect(() => {
      if (!onActionStateChange) return

      if (block.kind === "quiz") {
        const canCheck =
          Boolean(stepState.selectedChoiceId) && !stepState.choiceSubmitted
        const canRetry =
          stepState.choiceSubmitted && !isStepComplete(block, stepState)
        onActionStateChange({
          canCheck,
          canRetry,
          choiceCount: block.choices.length,
          feedback,
          justPassed: Boolean(feedback?.passed),
        })
        return
      }

      if (block.kind === "practice") {
        if (block.mode === "fillBlank") {
          const canCheck =
            Boolean(stepState.fillValue.trim()) && !stepState.fillSubmitted
          const canRetry =
            stepState.fillSubmitted && !isStepComplete(block, stepState)
          onActionStateChange({
            canCheck,
            canRetry,
            choiceCount: 0,
            feedback,
            justPassed: Boolean(feedback?.passed),
          })
          return
        }
        const canCheck = !stepState.miniEditChecked
        const canRetry =
          stepState.miniEditChecked && !isStepComplete(block, stepState)
        onActionStateChange({
          canCheck,
          canRetry,
          choiceCount: 0,
          feedback,
          justPassed: Boolean(feedback?.passed),
        })
        return
      }

      onActionStateChange({
        canCheck: false,
        canRetry: false,
        choiceCount: 0,
        feedback: null,
        justPassed: false,
      })
    }, [
      block,
      stepState,
      feedback,
      onActionStateChange,
    ])

    if (block.kind === "explain") {
      return (
        <article className="flex flex-col gap-3">
          {block.title ? (
            <h2 className="text-xl font-bold tracking-tight text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
              {block.title}
            </h2>
          ) : null}
          <div className="border-l-2 border-[var(--brand-blue)]/40 pl-4">
            <SimpleMarkdown content={block.body} />
          </div>
        </article>
      )
    }

    if (block.kind === "quiz") {
      const choices = orderedQuizChoices(block)
      return (
        <article className="flex flex-col gap-4">
          <h2 className="text-xl font-black tracking-tight text-[var(--brand-navy)] dark:text-[var(--app-fg)] sm:text-2xl">
            {block.prompt}
          </h2>
          {block.code ? (
            <pre className="overflow-x-auto rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4 font-mono text-sm leading-relaxed whitespace-pre">
              {block.code}
            </pre>
          ) : null}
          <ul
            className="grid gap-2.5 sm:grid-cols-2"
            role="listbox"
            aria-label="Answer choices"
          >
            {choices.map((choice, index) => {
              const isSelected = stepState.selectedChoiceId === choice.id
              const showResult = stepState.choiceSubmitted && isSelected
              const isCorrect = choice.id === block.correctId
              return (
                <li key={choice.id}>
                  <button
                    type="button"
                    role="option"
                    tabIndex={0}
                    aria-selected={isSelected}
                    aria-label={`${index + 1}: ${choice.label}`}
                    disabled={
                      stepState.choiceSubmitted &&
                      stepState.selectedChoiceId === block.correctId
                    }
                    onClick={() => {
                      if (stepState.choiceSubmitted) return
                      patch({ selectedChoiceId: choice.id })
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3.5 text-left text-sm font-semibold transition-all duration-150",
                      "border-[var(--app-border)] bg-[var(--app-surface)] hover:border-[var(--brand-blue)]/45",
                      isSelected &&
                        !stepState.choiceSubmitted &&
                        "border-[var(--brand-blue)] bg-[var(--app-accent-soft)] ring-2 ring-[var(--brand-blue)]/25",
                      showResult &&
                        isCorrect &&
                        "border-emerald-500 bg-emerald-500/10",
                      showResult &&
                        !isCorrect &&
                        "lesson-shake border-amber-500 bg-amber-500/10"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-black",
                        isSelected && !stepState.choiceSubmitted
                          ? "bg-[var(--brand-blue)] text-white"
                          : "bg-[var(--app-bg)] text-[var(--app-muted)]"
                      )}
                      aria-hidden
                    >
                      {index + 1}
                    </span>
                    <span className="text-[var(--app-fg)]">{choice.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
          {feedback ? (
            <StepFeedback passed={feedback.passed} message={feedback.message} />
          ) : null}
          {!hideInlineCheck &&
          !stepState.choiceSubmitted &&
          stepState.selectedChoiceId ? (
            <LessonCta
              onClick={() => runQuizCheck()}
              aria-label="Check answer"
            >
              Check
            </LessonCta>
          ) : null}
          {!hideInlineCheck &&
          stepState.choiceSubmitted &&
          !isStepComplete(block, stepState) ? (
            <LessonCta
              tone="ghost"
              onClick={() =>
                patch({ selectedChoiceId: null, choiceSubmitted: false })
              }
              aria-label="Try again"
            >
              Try again
            </LessonCta>
          ) : null}
        </article>
      )
    }

    if (block.kind === "practice") {
      if (block.mode === "fillBlank") {
        const parts = (block.template ?? "___").split("___")
        // Never hint the accepted answer in the input placeholder.
        const fillPlaceholder = (() => {
          const raw = block.placeholder?.trim()
          if (!raw) return "…"
          const needle = raw.toLowerCase()
          const leaks = (block.answers ?? []).some((answer) => {
            const a = answer.trim().toLowerCase()
            return a === needle || a === `"${needle}"` || a === `'${needle}'`
          })
          return leaks ? "…" : raw
        })()
        return (
          <article className="flex flex-col gap-4">
            <h2 className="text-xl font-black tracking-tight text-[var(--brand-navy)] dark:text-[var(--app-fg)] sm:text-2xl">
              {block.prompt}
            </h2>
            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-5 font-mono text-sm leading-relaxed shadow-inner">
              <span>{parts[0]}</span>
              <Input
                value={stepState.fillValue}
                onChange={(event) =>
                  patch({
                    fillValue: event.target.value,
                    fillSubmitted: false,
                  })
                }
                placeholder={fillPlaceholder}
                className="mx-1 inline-flex h-10 w-40 rounded-xl border-[var(--brand-blue)]/30 font-mono"
                aria-label="Fill blank"
              />
              {parts[1] ? <span>{parts[1]}</span> : null}
            </div>
            {feedback ? (
              <StepFeedback
                passed={feedback.passed}
                message={feedback.message}
              />
            ) : null}
            {!hideInlineCheck ? (
              <LessonCta
                disabled={!stepState.fillValue.trim()}
                onClick={() => runPracticeCheck()}
              >
                Check
              </LessonCta>
            ) : null}
          </article>
        )
      }

      const requirementLines =
        (block.lines ?? []).filter((line) => line.trim()).length > 0
          ? (block.lines ?? []).filter((line) => line.trim())
          : (block.mustContain ?? []).map((item) => `Include: \`${item}\``)

      return (
        <article className="flex flex-col gap-4">
          <h2 className="text-xl font-black tracking-tight text-[var(--brand-navy)] dark:text-[var(--app-fg)] sm:text-2xl">
            {block.prompt}
          </h2>
          {requirementLines.length > 0 ? (
            <ul className="space-y-1.5 text-sm text-[var(--app-muted)]">
              {requirementLines.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="text-[var(--brand-blue)]" aria-hidden>
                    •
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--app-muted)]" role="status">
              Edit the starter code to match the task above.
            </p>
          )}
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
            aria-label="Practice editor"
            className="w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4 font-mono text-sm outline-none transition focus-visible:border-[var(--brand-blue)] focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]/30"
          />
          {feedback ? (
            <StepFeedback
              passed={feedback.passed}
              message={feedback.message}
            />
          ) : null}
          {!hideInlineCheck ? (
            <LessonCta onClick={() => runPracticeCheck()}>
              Check
            </LessonCta>
          ) : null}
        </article>
      )
    }

    if (block.kind === "complete") {
      return (
        <article className="flex flex-col items-center gap-4 py-6 text-center">
          <div
            className="lesson-pop flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--python-blue)] to-[var(--python-yellow)] text-3xl font-black text-white shadow-[var(--app-shadow)]"
            aria-hidden
          >
            ✓
          </div>
          <p className="text-xs font-bold tracking-[0.16em] text-[var(--brand-blue)] uppercase">
            Lesson complete
          </p>
          <h2 className="text-3xl font-black tracking-tight text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            {block.title}
          </h2>
          <SimpleMarkdown
            content={block.body}
            className="max-w-md"
            proseClassName="text-center"
          />
        </article>
      )
    }

    return null
  }
)
