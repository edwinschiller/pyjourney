"use client"

import { ArrowLeft, Lightbulb, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react"

import { AssistantShell } from "@/components/assistant/assistant-shell"
import { PythonRunner } from "@/components/editor/python-runner"
import {
  BlockView,
  type BlockViewHandle,
} from "@/components/lessons/player/block-view"
import { ConfidenceMeter } from "@/components/lessons/player/confidence-meter"
import { LessonCta } from "@/components/lessons/player/lesson-cta"
import { StepFeedback } from "@/components/lessons/player/step-feedback"
import { StepRationale } from "@/components/lessons/player/step-rationale"
import { useLessonKeyboard } from "@/components/lessons/player/use-lesson-keyboard"
import { useCodeSnapshots } from "@/hooks/use-code-snapshots"
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
  buildStepEvidence,
  type TopicEvidenceContext,
} from "@/lib/lessons/step-evidence"
import {
  canAdvance,
  createInitialStepState,
  isStepComplete,
  type LessonStepState,
} from "@/lib/lessons/validate-step"
import {
  slideBodyForBlock,
  slidePromptForBlock,
} from "@/lib/lessons/slide-context"
import { isUsableQuizBlock } from "@/lib/lessons/quiz-quality"
import { cn } from "@/lib/utils"

type LessonPlayerProps = {
  lessonId: string
  conceptId: string
  conceptSlug: string
  conceptTitle: string
  initialSession: LessonSession
  status: "active" | "completed" | "abandoned"
  topicEvidence?: Record<string, TopicEvidenceContext>
  aiConfigured?: boolean
}

export const LessonPlayer = ({
  lessonId,
  conceptId,
  conceptSlug,
  conceptTitle,
  initialSession,
  status,
  topicEvidence = {},
  aiConfigured = true,
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
    current?.kind === "apply"
      ? current.starterCode
      : current?.kind === "practice" && current.mode === "miniEdit"
        ? (current.starterCode ?? "")
        : ""
  )
  const [terminal, setTerminal] = useState({ stdout: "", stderr: "" })
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
  const [hintBusy, setHintBusy] = useState(false)
  const [hintMessage, setHintMessage] = useState<string | null>(null)
  const [hintLevel, setHintLevel] = useState(0)
  const [practiceFeedback, setPracticeFeedback] = useState<{
    passed: boolean
    message: string
  } | null>(null)
  const busyRef = useRef(false)
  const syncLabelRef = useRef("Continue")

  const isMiniEdit =
    current?.kind === "practice" && current.mode === "miniEdit"
  const isApply = current?.kind === "apply"
  const isCodingStep = Boolean(isApply || isMiniEdit)

  const focusTopic =
    session.topics.find((topic) => topic.id === current?.topicId) ??
    session.topics.find(
      (topic) => topic.status !== "mastered" || topic.needsRecheck
    ) ??
    session.topics[0]

  const assistantCode =
    current?.kind === "apply" ||
    (current?.kind === "practice" && current.mode === "miniEdit")
      ? code
      : current?.kind === "practice" && current.mode === "fillBlank"
        ? stepState.fillValue
        : current?.kind === "quiz" && current.code
          ? current.code
          : ""

  useCodeSnapshots({
    enabled:
      !done &&
      (current?.kind === "apply" ||
        (current?.kind === "practice" && current.mode === "miniEdit")),
    mode: "lesson",
    lessonId,
    conceptId,
    code: assistantCode,
    stdout: terminal.stdout,
    stderr: terminal.stderr || null,
    hintCount: hintLevel,
    learningObjective:
      focusTopic?.teachingGoal ?? session.objective ?? conceptTitle,
  })

  useEffect(() => {
    if (!current) return
    setStepState(createInitialStepState(current))
    setCriteriaNotes(null)
    setPracticeFeedback(null)
    setCanRetry(false)
    setChoiceCount(current.kind === "quiz" ? current.choices.length : 0)
    setStepKey((value) => value + 1)
    setHintMessage(null)
    busyRef.current = false
    if (current.kind === "apply") {
      setCode(current.starterCode || "")
      setCanCheck(false)
    } else if (current.kind === "practice" && current.mode === "miniEdit") {
      setCode(current.starterCode || "")
      setCanCheck(true)
    } else {
      setCanCheck(false)
    }
  }, [current?.id])

  useEffect(() => {
    if (stepIndex >= session.blocks.length) {
      setStepIndex(Math.max(session.blocks.length - 1, 0))
    }
  }, [session.blocks.length, stepIndex])

  useEffect(() => {
    if (!current || syncing || busyRef.current) return
    const brokenMiniEdit =
      current.kind === "practice" &&
      current.mode === "miniEdit" &&
      (!(current.lines ?? []).some((line) => line.trim()) &&
        !(current.mustContain ?? []).some((item) => item.trim()) ||
        (current.lines ?? []).filter((line) => line.trim()).length > 4 ||
        /accomplishes the following|write a (complete )?program/i.test(
          current.prompt
        ))
    const brokenApply =
      current.kind === "apply" &&
      (!current.brief.trim() || current.criteria.length < 2)
    const brokenQuiz =
      current.kind === "quiz" && !isUsableQuizBlock(current)
    if (!brokenMiniEdit && !brokenApply && !brokenQuiz) return
    busyRef.current = true
    void persist({ cursor: stepIndex, requestNext: true })
  }, [current?.id])

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
      if (
        input.requestNext &&
        result.session.blocks.length <= session.blocks.length &&
        result.session.cursor === stepIndex
      ) {
        setError("Could not load the next step. Try Continue again.")
        return false
      }
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
    if (!canAdvance(current, stepState, { stderr: terminal.stderr })) return

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
    const detail = (() => {
      if (current.kind === "quiz") {
        const choiceId = stepState.selectedChoiceId
        const response = current.choices.find(
          (choice) => choice.id === choiceId
        )?.label
        return {
          interaction: "choice",
          ...(choiceId ? { choiceId } : {}),
          ...(response ? { response: response.slice(0, 160) } : {}),
        }
      }
      if (current.kind === "practice" && current.mode === "fillBlank") {
        const response = stepState.fillValue.trim()
        return {
          interaction: "fillBlank",
          ...(response ? { response: response.slice(0, 160) } : {}),
        }
      }
      return {
        interaction: "miniEdit",
        code: code.slice(0, 12_000),
        ...(terminal.stderr.trim()
          ? { stderr: terminal.stderr.slice(0, 2_000) }
          : {}),
      }
    })()
    const event: LessonEvent = {
      at: new Date().toISOString(),
      blockId: current.id,
      kind: current.kind,
      passed,
      topicId: current.topicId,
      latencyMs: Date.now() - stepState.startedAt,
      attempts: stepState.attempts + 1,
      detail,
    }
    busyRef.current = true
    // Fail → remediating next block. Pass → stay; user continues manually.
    await persist({ event, requestNext: !passed })
  })

  const handleRequestHint = useEffectEvent(async () => {
    if (hintBusy || done || syncing) return
    if (
      !current ||
      (current.kind !== "quiz" &&
        current.kind !== "practice" &&
        current.kind !== "apply")
    ) {
      return
    }
    setHintBusy(true)
    setError(null)
    try {
      const response = await fetch("/api/hints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          slideKind: current.kind,
          topicId: current.topicId ?? focusTopic?.id ?? null,
          code: assistantCode,
        }),
      })
      const data = (await response.json()) as {
        level?: number
        message?: string
        error?: string
      }
      if (!response.ok) {
        setError(data.error ?? "Could not get a hint.")
        return
      }
      setHintLevel(data.level ?? hintLevel + 1)
      setHintMessage(data.message ?? null)
    } catch {
      setError("Could not get a hint.")
    } finally {
      setHintBusy(false)
    }
  })

  const handleCheckMiniEdit = useEffectEvent(() => {
    if (
      !current ||
      current.kind !== "practice" ||
      current.mode !== "miniEdit" ||
      busyRef.current ||
      syncing
    ) {
      return
    }
    syncLabelRef.current = "Check"
    const nextState = {
      ...stepState,
      miniEditCode: code,
      miniEditChecked: true,
      attempts: stepState.attempts + 1,
    }
    const passed = isStepComplete(current, nextState, {
      stderr: terminal.stderr,
    })
    setStepState(nextState)
    setPracticeFeedback({
      passed,
      message: passed
        ? current.feedback.correct
        : /IndentationError|SyntaxError|TabError/i.test(terminal.stderr)
          ? "Your code still has a syntax/indentation error — fix that first, then Check again."
          : current.feedback.wrong,
    })
    setCanCheck(false)
    setCanRetry(!passed)
    void handleChecked(passed)
  })

  const handleCheck = useEffectEvent(() => {
    if (busyRef.current || syncing) return
    syncLabelRef.current = "Check"
    if (isMiniEdit) {
      handleCheckMiniEdit()
      return
    }
    blockRef.current?.check()
  })

  const handleRetry = useEffectEvent(() => {
    if (isMiniEdit) {
      setPracticeFeedback(null)
      setStepState((state) => ({ ...state, miniEditChecked: false }))
      setCanCheck(true)
      setCanRetry(false)
      return
    }
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

  const isComplete = current?.kind === "complete"
  const isExplain = current?.kind === "explain"
  const canContinueNow = Boolean(
    current &&
      !syncing &&
      !busyRef.current &&
      (isComplete ||
        (canAdvance(current, stepState, { stderr: terminal.stderr }) &&
          !canCheck &&
          (isExplain ||
            current.kind === "quiz" ||
            current.kind === "practice" ||
            (isApply && stepState.applyPassed))))
  )

  useLessonKeyboard({
    enabled: !done && !syncing && !reviewBusy,
    canContinue: canContinueNow,
    canBack: stepIndex > 0 && !isCodingStep,
    canSubmit:
      canCheck || (Boolean(isApply) && !stepState.applyPassed) || Boolean(isMiniEdit && canCheck),
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

  const stepEvidence = useMemo(() => {
    if (!current || done) return null
    return buildStepEvidence({
      block: current,
      session,
      stepIndex,
      topicEvidence,
    })
  }, [
    current,
    done,
    session.confidence,
    session.events.length,
    session.topics,
    stepIndex,
    topicEvidence,
  ])

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
        disabled={!canAdvance(current, stepState, { stderr: terminal.stderr }) && !isComplete}
        onClick={() => void handleContinue()}
        aria-label={isComplete ? "Finish lesson" : "Continue"}
      >
        {isComplete ? "Finish" : "Continue"}
      </LessonCta>
    )
  })()

  return (
    <AssistantShell
      contextLabel={`${conceptTitle}${focusTopic ? ` · ${focusTopic.title}` : ""}`}
      studentCode={assistantCode}
      aiConfigured={aiConfigured}
      context={{
        scope: "lesson",
        conceptSlug,
        conceptTitle,
        lessonId,
        topicId: focusTopic?.id ?? current?.topicId ?? null,
        topicTitle: focusTopic?.title ?? null,
        teachingGoal: focusTopic?.teachingGoal ?? null,
        slideKind: current?.kind ?? null,
        slidePrompt: current ? slidePromptForBlock(current) : null,
        slideBody: current ? slideBodyForBlock(current) : null,
        objective: session.objective,
      }}
    >
    <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col gap-3 px-4 py-4 md:px-6 md:py-6">
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

      {stepEvidence ? (
        <StepRationale key={current?.id} evidence={stepEvidence} />
      ) : null}

      {!done &&
      current &&
      (current.kind === "quiz" ||
        current.kind === "practice" ||
        current.kind === "apply") ? (
        <div className="flex flex-wrap items-center gap-2">
          <LessonCta
            tone="ghost"
            className="!min-h-8 !px-3 !text-xs"
            disabled={hintBusy || syncing}
            onClick={() => void handleRequestHint()}
            aria-label="Get a staged hint"
          >
            {hintBusy ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            ) : (
              <Lightbulb className="size-3.5" aria-hidden />
            )}
            Hint{hintLevel > 0 ? ` (${hintLevel})` : ""}
          </LessonCta>
          {hintMessage ? (
            <p className="text-xs text-[var(--app-muted)]" role="status">
              {hintMessage}
            </p>
          ) : null}
        </div>
      ) : null}
      <div
        key={stepKey}
        className="lesson-step-enter min-h-0 flex-1 overflow-y-auto pb-2"
      >
        {isCodingStep && current.kind === "apply" ? (
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
                onTerminalChange={setTerminal}
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
        ) : isCodingStep &&
          current.kind === "practice" &&
          current.mode === "miniEdit" ? (
          <div className="flex min-h-[480px] flex-col gap-3">
            <div>
              <h2 className="text-xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                {current.prompt}
              </h2>
              <ul className="mt-3 space-y-1.5">
                {(current.lines ?? []).map((line) => (
                  <li
                    key={line}
                    className="flex gap-2 text-sm text-[var(--app-muted)]"
                  >
                    <span className="text-[var(--brand-blue)]" aria-hidden>
                      ·
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <div className="min-h-[400px] flex-1 overflow-hidden rounded-xl border border-[var(--app-border)]">
              <PythonRunner
                fillHeight
                code={code}
                onCodeChange={(next) => {
                  setCode(next)
                  setStepState((state) => ({
                    ...state,
                    miniEditCode: next,
                    miniEditChecked: false,
                  }))
                  setPracticeFeedback(null)
                  setCanCheck(true)
                  setCanRetry(false)
                }}
                onTerminalChange={setTerminal}
                className="min-h-[400px]"
                toolbarLeading={
                  <span className="text-sm font-medium">Practice editor</span>
                }
              />
            </div>
            {practiceFeedback ? (
              <StepFeedback
                passed={practiceFeedback.passed}
                message={practiceFeedback.message}
              />
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
    </AssistantShell>
  )
}
