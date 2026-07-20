"use client"

import { ArrowLeft, ArrowRight, ListChecks, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState, useTransition } from "react"

import { PythonRunner } from "@/components/editor/python-runner"
import { BlockView } from "@/components/lessons/player/block-view"
import { LessonProgressBar } from "@/components/lessons/player/progress-bar"
import { Button } from "@/components/ui/button"
import type {
  LessonBlock,
  LessonEvent,
  LessonSession,
} from "@/lib/ai/schemas/lesson-blocks"
import { syncLessonProgressAction } from "@/lib/lessons/actions"
import type { AdaptTrigger } from "@/lib/lessons/adapt/rules"
import {
  canAdvanceFromStep,
  createInitialStepState,
  type LessonStepState,
} from "@/lib/lessons/validate-step"
import {
  DEFAULT_RUN_TIMEOUT_MS,
  getPyodideClient,
  type LessonTestResult,
} from "@/lib/pyodide"
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
  const [session, setSession] = useState(initialSession)
  const [stepIndex, setStepIndex] = useState(initialSession.cursor)
  const currentBlock = session.blocks[stepIndex] as LessonBlock | undefined
  const [stepState, setStepState] = useState<LessonStepState>(() =>
    createInitialStepState(currentBlock ?? session.blocks[0]!)
  )
  const [code, setCode] = useState(
    currentBlock?.kind === "coding" ? currentBlock.starterCode : ""
  )
  const [testResults, setTestResults] = useState<LessonTestResult[] | null>(
    null
  )
  const [testsBusy, setTestsBusy] = useState(false)
  const [adaptMessage, setAdaptMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [syncing, startSync] = useTransition()
  const [done, setDone] = useState(status === "completed")

  useEffect(() => {
    if (!currentBlock) return
    setStepState(createInitialStepState(currentBlock))
    setTestResults(null)
    setAdaptMessage(null)
    if (currentBlock.kind === "coding") {
      setCode(currentBlock.starterCode)
    }
  }, [currentBlock?.id])

  const canAdvance = currentBlock
    ? canAdvanceFromStep(currentBlock, stepState)
    : false

  const persist = useCallback(
    (input: {
      cursor: number
      event?: LessonEvent
      adaptTrigger?: AdaptTrigger
      completeLesson?: boolean
      nextSession?: LessonSession
    }) => {
      startSync(async () => {
        const result = await syncLessonProgressAction({
          lessonId,
          cursor: input.cursor,
          event: input.event,
          adaptTrigger: input.adaptTrigger,
          completeLesson: input.completeLesson,
        })
        if (!result?.ok || !result.session) {
          setError(result?.error ?? "Could not save progress.")
          return
        }
        setSession(result.session)
        if (typeof result.session.cursor === "number") {
          setStepIndex(result.session.cursor)
        }
        if (result.adaptMessage) {
          setAdaptMessage(result.adaptMessage)
        }
        if (result.completed) {
          setDone(true)
        }
      })
    },
    [lessonId]
  )

  const recordEvent = (
    passed: boolean,
    detail?: unknown,
    adaptTrigger?: AdaptTrigger
  ) => {
    if (!currentBlock) return
    const event: LessonEvent = {
      at: new Date().toISOString(),
      blockId: currentBlock.id,
      kind: currentBlock.kind,
      passed,
      detail,
    }
    persist({
      cursor: stepIndex,
      event,
      adaptTrigger,
    })
  }

  const handleContinue = () => {
    if (!currentBlock) return

    if (currentBlock.kind === "complete") {
      persist({
        cursor: stepIndex,
        completeLesson: true,
      })
      return
    }

    if (!canAdvance) return

    const nextIndex = Math.min(stepIndex + 1, session.blocks.length - 1)
    if (nextIndex === stepIndex && currentBlock.kind !== "coding") {
      // Waiting for adaptation to append more blocks
      return
    }

    setStepIndex(nextIndex)
    persist({ cursor: nextIndex })
  }

  const handleBack = () => {
    if (stepIndex <= 0) return
    const nextIndex = stepIndex - 1
    setStepIndex(nextIndex)
    persist({ cursor: nextIndex })
  }

  const handleRunTests = async () => {
    if (!currentBlock || currentBlock.kind !== "coding") return
    setTestsBusy(true)
    setError(null)
    try {
      const client = getPyodideClient()
      const result = await client.runTests(code, currentBlock.tests, {
        timeoutMs: DEFAULT_RUN_TIMEOUT_MS,
      })
      setTestResults(result.results)
      const passed = result.ok
      setStepState((current) => ({ ...current, codingTestsPassed: passed }))

      if (passed) {
        recordEvent(true, { tests: result.results }, "coding_passed")
      } else {
        recordEvent(false, { tests: result.results }, "coding_failed")
      }
    } catch (runError) {
      setError(
        runError instanceof Error ? runError.message : "Could not run tests."
      )
    } finally {
      setTestsBusy(false)
    }
  }

  // After failed check on choice, notify director if user clicks try-again path repeatedly via Check fail
  useEffect(() => {
    if (!currentBlock) return
    if (
      (currentBlock.kind === "multipleChoice" ||
        currentBlock.kind === "prediction" ||
        currentBlock.kind === "debug") &&
      stepState.choiceSubmitted &&
      stepState.selectedChoiceId &&
      stepState.selectedChoiceId !== currentBlock.correctId
    ) {
      recordEvent(false, { choiceId: stepState.selectedChoiceId }, "step_failed")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on submit flip
  }, [stepState.choiceSubmitted])

  // When adaptation appends blocks after current cursor, stay put so Continue reveals them
  useEffect(() => {
    if (stepIndex >= session.blocks.length) {
      setStepIndex(Math.max(session.blocks.length - 1, 0))
    }
  }, [session.blocks.length, stepIndex])

  if (!currentBlock) {
    return (
      <p className="text-sm text-destructive" role="alert">
        Lesson has no blocks.
      </p>
    )
  }

  const isCoding = currentBlock.kind === "coding"
  const isComplete = currentBlock.kind === "complete"

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-4">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/student/learn" aria-label="Back to learning path">
            <ArrowLeft />
            Path
          </Link>
        </Button>
        <p className="text-xs font-medium tracking-wide text-[var(--app-muted)] uppercase">
          {conceptTitle}
        </p>
        {syncing ? (
          <Loader2 className="size-4 animate-spin text-[var(--app-muted)]" />
        ) : (
          <span className="w-4" aria-hidden />
        )}
      </div>

      <LessonProgressBar
        current={stepIndex + 1}
        total={session.blocks.length}
      />

      <div
        key={currentBlock.id}
        className="min-h-0 flex-1 overflow-y-auto"
      >
        {isCoding ? (
          <div className="flex min-h-0 flex-col gap-3">
            <div>
              <h2 className="text-xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                {currentBlock.title}
              </h2>
              <ul className="mt-2 space-y-1 text-sm text-[var(--app-muted)]">
                {currentBlock.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              {currentBlock.successCriteria ? (
                <p className="mt-2 text-xs text-[var(--brand-blue)]">
                  Success: {currentBlock.successCriteria}
                </p>
              ) : null}
            </div>
            <PythonRunner
              fillHeight
              code={code}
              onCodeChange={setCode}
              toolbarLeading={
                <span className="text-sm font-semibold">Your code</span>
              }
              toolbarExtra={
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  disabled={testsBusy || done}
                  onClick={() => void handleRunTests()}
                  aria-label="Check tests"
                >
                  {testsBusy ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <ListChecks />
                  )}
                  Check tests
                </Button>
              }
            />
            {testResults ? (
              <ul className="flex flex-col gap-1 text-sm">
                {testResults.map((result) => (
                  <li
                    key={result.id}
                    className={cn(
                      result.passed
                        ? "text-[var(--brand-blue)]"
                        : "text-destructive"
                    )}
                  >
                    {result.passed ? "✓" : "✗"} {result.description}
                    {result.error ? (
                      <span className="mt-0.5 block font-mono text-xs">
                        {result.error}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <BlockView
            block={currentBlock}
            stepState={stepState}
            onStepStateChange={setStepState}
          />
        )}
      </div>

      {adaptMessage ? (
        <p className="text-sm text-[var(--brand-blue)]" role="status">
          {adaptMessage}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {done ? (
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/student/learn" aria-label="Return to path">
              Back to path
            </Link>
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push("/student")}
            aria-label="Go to dashboard"
          >
            Dashboard
          </Button>
        </div>
      ) : (
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[var(--app-border)] pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={stepIndex === 0 || isCoding}
            onClick={handleBack}
            aria-label="Previous step"
          >
            <ArrowLeft />
            Back
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!canAdvance && !isComplete}
            onClick={handleContinue}
            aria-label={isComplete ? "Finish lesson" : "Continue"}
          >
            {isComplete ? "Finish" : "Continue"}
            <ArrowRight />
          </Button>
        </div>
      )}
    </div>
  )
}
