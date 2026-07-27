"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useEffectEvent, useRef, useState } from "react"

import { PythonRunner } from "@/components/editor/python-runner"
import {
  BlockView,
  type BlockViewHandle,
} from "@/components/lessons/player/block-view"
import { ConfidenceMeter } from "@/components/lessons/player/confidence-meter"
import { LessonCta } from "@/components/lessons/player/lesson-cta"
import { StepFeedback } from "@/components/lessons/player/step-feedback"
import { useLessonKeyboard } from "@/components/lessons/player/use-lesson-keyboard"
import type {
  LessonBlock,
  LessonEvent,
  LessonSession,
} from "@/lib/ai/schemas/lesson-blocks"
import {
  reviewApplyAction,
  syncLessonProgressAction,
} from "@/lib/lessons/actions"
import {
  canAdvance,
  createInitialStepState,
  type LessonStepState,
} from "@/lib/lessons/validate-step"
import { cn } from "@/lib/utils"

type LessonPlayerProps = {
  lessonId: string
  conceptTitle: string
  initialSession: LessonSession
  status: "active" | "completed" | "abandoned"
}

export const LessonPlayer = ({
  lessonId,
  conceptTitle,
  initialSession,
  status,
}: LessonPlayerProps) => {
  const router = useRouter()
  const blockRef = useRef<BlockViewHandle>(null)
  const [session, setSession] = useState(initialSession)
  const [stepIndex, setStepIndex] = useState(initialSession.cursor)
  const current = session.blocks[stepIndex] as LessonBlock | undefined
  const [stepState, setStepState] = useState<LessonStepState>(() =>
    createInitialStepState(current ?? session.blocks[0]!)
  )
  const [code, setCode] = useState(
    current?.kind === "apply" ? current.starterCode : ""
  )
  const [criteriaNotes, setCriteriaNotes] = useState<
    Array<{ criterion: string; met: boolean; note?: string }> | null
  >(null)
  const [reviewBusy, setReviewBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(status === "completed")
  const [syncing, setSyncing] = useState(false)
  const [canCheck, setCanCheck] = useState(false)
  const [canRetry, setCanRetry] = useState(false)
  const [choiceCount, setChoiceCount] = useState(0)
  const [stepKey, setStepKey] = useState(0)
  const busyRef = useRef(false)
  const syncLabelRef = useRef("Continue")

  useEffect(() => {
    if (!current) return
    setStepState(createInitialStepState(current))
    setCriteriaNotes(null)
    setCanCheck(false)
    setCanRetry(false)
    setChoiceCount(current.kind === "quiz" ? current.choices.length : 0)
    setStepKey((value) => value + 1)
    busyRef.current = false
    if (current.kind === "apply") setCode(current.starterCode || "")
  }, [current?.id])

  useEffect(() => {
    if (stepIndex >= session.blocks.length) {
      setStepIndex(Math.max(session.blocks.length - 1, 0))
    }
  }, [session.blocks.length, stepIndex])

  const persist = async (input: {
    cursor?: number
    event?: LessonEvent
    requestNext?: boolean
    completeLesson?: boolean
  }): Promise<boolean> => {
    setSyncing(true)
    try {
      const result = await syncLessonProgressAction({
        lessonId,
        cursor: input.cursor ?? stepIndex,
        event: input.event,
        requestNext: input.requestNext,
        completeLesson: input.completeLesson,
      })
      if (!result?.ok || !result.session) {
        setError(result?.error ?? "Could not sync lesson.")
        return false
      }
      setSession(result.session)
      if (typeof result.session.cursor === "number") {
        setStepIndex(result.session.cursor)
      }
      if (result.completed) setDone(true)
      return true
    } catch {
      setError("Could not sync lesson.")
      return false
    } finally {
      setSyncing(false)
      busyRef.current = false
    }
  }

  const handleContinue = useEffectEvent(async () => {
    if (!current || done || busyRef.current || syncing) return
    syncLabelRef.current = current.kind === "complete" ? "Finish" : "Continue"
    if (current.kind === "complete") {
      busyRef.current = true
      const ok = await persist({ completeLesson: true })
      if (ok) router.push("/student/learn")
      return
    }
    if (!canAdvance(current, stepState)) return

    busyRef.current = true
    const atEnd = stepIndex >= session.blocks.length - 1
    if (atEnd) {
      await persist({ cursor: stepIndex, requestNext: true })
      return
    }
    const next = stepIndex + 1
    setStepIndex(next)
    await persist({ cursor: next })
  })

  const handleChecked = useEffectEvent(async (passed: boolean) => {
    if (!current || busyRef.current) return
    syncLabelRef.current = "Check"
    const event: LessonEvent = {
      at: new Date().toISOString(),
      blockId: current.id,
      kind: current.kind,
      passed,
      topicId: current.topicId,
      latencyMs: Date.now() - stepState.startedAt,
      attempts: stepState.attempts + 1,
      detail: current.kind,
    }
    busyRef.current = true
    // Fail → remediating next block. Pass → stay; user continues manually.
    await persist({ event, requestNext: !passed })
  })

  const handleCheck = useEffectEvent(() => {
    if (busyRef.current || syncing) return
    syncLabelRef.current = "Check"
    blockRef.current?.check()
  })

  const handleRetry = useEffectEvent(() => {
    blockRef.current?.retry()
  })

  const handleBack = useEffectEvent(async () => {
    if (stepIndex <= 0 || busyRef.current || syncing) return
    syncLabelRef.current = "Back"
    busyRef.current = true
    const prev = stepIndex - 1
    setStepIndex(prev)
    await persist({ cursor: prev })
  })

  const handleReviewApply = useEffectEvent(async () => {
    if (!current || current.kind !== "apply" || reviewBusy || syncing) return
    syncLabelRef.current = "Review code"
    setReviewBusy(true)
    setError(null)
    try {
      const result = await reviewApplyAction({
        lessonId,
        code,
        cursor: stepIndex,
      })
      if (!result?.ok || !result.session) {
        setError(result?.error ?? "Could not review your code.")
        return
      }
      setSession(result.session)
      if (result.criteriaResults) setCriteriaNotes(result.criteriaResults)
      if (result.passed) {
        setStepState((state) => ({ ...state, applyPassed: true }))
        if (typeof result.session.cursor === "number") {
          setStepIndex(result.session.cursor)
        }
      }
      if (result.completed) setDone(true)
    } catch (reviewError) {
      setError(
        reviewError instanceof Error ? reviewError.message : "Review failed."
      )
    } finally {
      setReviewBusy(false)
    }
  })

  const isApply = current?.kind === "apply"
  const isComplete = current?.kind === "complete"
  const isExplain = current?.kind === "explain"
  const canContinueNow = Boolean(
    current &&
      !syncing &&
      !busyRef.current &&
      (isComplete ||
        (canAdvance(current, stepState) &&
          !canCheck &&
          (isExplain ||
            current.kind === "quiz" ||
            current.kind === "practice" ||
            (isApply && stepState.applyPassed))))
  )

  useLessonKeyboard({
    enabled: !done && !syncing && !reviewBusy,
    canContinue: canContinueNow,
    canBack: stepIndex > 0 && !isApply,
    canSubmit: canCheck || (Boolean(isApply) && !stepState.applyPassed),
    choiceCount,
    onContinue: () => {
      void handleContinue()
    },
    onBack: () => {
      void handleBack()
    },
    onSubmit: () => {
      if (isApply) {
        void handleReviewApply()
        return
      }
      handleCheck()
    },
    onChoice: (index) => blockRef.current?.selectChoice(index),
  })

  if (!current) {
    return (
      <p className="text-sm text-destructive" role="alert">
        Waiting for next step…
      </p>
    )
  }

  const footerBusy = syncing || reviewBusy

  const footerPrimary = (() => {
    if (done) return null
    // Freeze a single loading CTA while syncing — avoids Check/Continue/Back
    // swapping mid-request (and backdrop-blur ghost trails).
    if (footerBusy) {
      return (
        <LessonCta
          tone={syncLabelRef.current === "Review code" ? "accent" : "primary"}
          loading
          aria-busy
          aria-label={syncLabelRef.current}
        >
          {syncLabelRef.current}
        </LessonCta>
      )
    }
    if (isApply && !stepState.applyPassed) {
      return (
        <LessonCta
          tone="accent"
          onClick={() => void handleReviewApply()}
          aria-label="Review my code"
        >
          Review code
        </LessonCta>
      )
    }
    if (canCheck) {
      return (
        <LessonCta onClick={handleCheck} aria-label="Check answer">
          Check
        </LessonCta>
      )
    }
    if (canRetry) {
      return (
        <LessonCta tone="ghost" onClick={handleRetry} aria-label="Try again">
          Try again
        </LessonCta>
      )
    }
    return (
      <LessonCta
        tone={isComplete ? "accent" : "primary"}
        disabled={!canAdvance(current, stepState) && !isComplete}
        onClick={() => void handleContinue()}
        aria-label={isComplete ? "Finish lesson" : "Continue"}
      >
        {isComplete ? "Finish" : "Continue"}
      </LessonCta>
    )
  })()

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col gap-3">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <Link
          href="/student/learn"
          aria-label="Back to path"
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-[var(--app-muted)] transition hover:bg-[var(--app-surface-hover)] hover:text-[var(--app-fg)]"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Path
        </Link>
        <p className="text-xs font-medium tracking-wide text-[var(--app-muted)]">
          {conceptTitle}
        </p>
        <span
          className={cn(
            "size-4",
            syncing &&
              "animate-spin rounded-full border-2 border-[var(--brand-blue)] border-t-transparent"
          )}
          aria-hidden={!syncing}
          aria-label={syncing ? "Syncing" : undefined}
        />
      </div>

      <ConfidenceMeter
        confidence={session.confidence}
        topics={session.topics}
      />

      <div
        key={stepKey}
        className="lesson-step-enter min-h-0 flex-1 overflow-y-auto pb-2"
      >
        {isApply ? (
          <div className="flex min-h-[480px] flex-col gap-3">
            <div>
              <h2 className="text-xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                {current.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--app-muted)]">
                {current.brief}
              </p>
              <ul className="mt-3 space-y-1.5">
                {current.criteria.map((criterion) => (
                  <li
                    key={criterion}
                    className="flex gap-2 text-sm text-[var(--app-muted)]"
                  >
                    <span className="text-[var(--brand-blue)]" aria-hidden>
                      ·
                    </span>
                    {criterion}
                  </li>
                ))}
              </ul>
            </div>
            <div className="min-h-[400px] flex-1 overflow-hidden rounded-xl border border-[var(--app-border)]">
              <PythonRunner
                fillHeight
                code={code}
                onCodeChange={setCode}
                className="min-h-[400px]"
                toolbarLeading={
                  <span className="text-sm font-medium">Your solution</span>
                }
              />
            </div>
            {criteriaNotes ? (
              <ul className="flex flex-col gap-2">
                {criteriaNotes.map((row) => (
                  <li key={row.criterion}>
                    <StepFeedback
                      passed={row.met}
                      message={
                        row.note
                          ? `${row.criterion} — ${row.note}`
                          : row.criterion
                      }
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <BlockView
            ref={blockRef}
            block={current}
            stepState={stepState}
            onStepStateChange={setStepState}
            onChecked={(passed) => {
              void handleChecked(passed)
            }}
            hideInlineCheck
            onActionStateChange={(state) => {
              setCanCheck(state.canCheck)
              setCanRetry(state.canRetry)
              setChoiceCount(state.choiceCount)
            }}
          />
        )}
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <footer className="sticky bottom-0 z-10 isolate shrink-0 overflow-hidden border-t border-[var(--app-border)] bg-[var(--app-bg)] pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {done ? (
          <div className="flex flex-wrap justify-end gap-2">
            <LessonCta
              onClick={() => router.push("/student/learn")}
              aria-label="Back to path"
            >
              Back to path
            </LessonCta>
            <LessonCta
              tone="ghost"
              onClick={() => router.push("/student")}
              aria-label="Dashboard"
            >
              Dashboard
            </LessonCta>
          </div>
        ) : (
          <div
            key={
              footerBusy
                ? `busy:${syncLabelRef.current}`
                : `idle:${canCheck}:${canRetry}:${isComplete}:${stepIndex}`
            }
            className="flex items-center justify-end gap-2"
          >
            {stepIndex > 0 && !isApply && !footerBusy ? (
              <LessonCta
                tone="ghost"
                onClick={() => void handleBack()}
                aria-label="Previous step"
              >
                Back
              </LessonCta>
            ) : null}
            {footerPrimary}
          </div>
        )}
      </footer>
    </div>
  )
}
