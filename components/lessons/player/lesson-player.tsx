"use client"

import { ArrowLeft, ArrowRight, ListChecks, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"

import { PythonRunner } from "@/components/editor/python-runner"
import { BlockView } from "@/components/lessons/player/block-view"
import { PyjoCoach } from "@/components/lessons/player/pyjo-coach"
import { Button } from "@/components/ui/button"
import type {
  LessonBlock,
  LessonEvent,
  LessonSession,
} from "@/lib/ai/schemas/lesson-blocks"
import { syncLessonProgressAction } from "@/lib/lessons/actions"
import {
  canAdvance,
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
  const current = session.blocks[stepIndex] as LessonBlock | undefined
  const [stepState, setStepState] = useState<LessonStepState>(() =>
    createInitialStepState(current ?? session.blocks[0]!)
  )
  const [code, setCode] = useState(
    current?.kind === "coding" ? current.starterCode : ""
  )
  const [testResults, setTestResults] = useState<LessonTestResult[] | null>(
    null
  )
  const [testsBusy, setTestsBusy] = useState(false)
  const [coachSpeak, setCoachSpeak] = useState(
    initialSession.lastCoachSpeak ??
      "I'm PyJo — I'll guide this lesson based on how you answer."
  )
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(status === "completed")
  const [syncing, startSync] = useTransition()

  useEffect(() => {
    if (!current) return
    setStepState(createInitialStepState(current))
    setTestResults(null)
    if (current.kind === "coding") setCode(current.starterCode)
  }, [current?.id])

  useEffect(() => {
    if (stepIndex >= session.blocks.length) {
      setStepIndex(Math.max(session.blocks.length - 1, 0))
    }
  }, [session.blocks.length, stepIndex])

  const persist = (input: {
    cursor?: number
    event?: LessonEvent
    requestNext?: boolean
    completeLesson?: boolean
  }) => {
    startSync(async () => {
      const result = await syncLessonProgressAction({
        lessonId,
        cursor: input.cursor ?? stepIndex,
        event: input.event,
        requestNext: input.requestNext,
        completeLesson: input.completeLesson,
      })
      if (!result?.ok || !result.session) {
        setError(result?.error ?? "Could not sync with PyJo.")
        return
      }
      setSession(result.session)
      if (result.coachSpeak) setCoachSpeak(result.coachSpeak)
      if (typeof result.session.cursor === "number") {
        setStepIndex(result.session.cursor)
      }
      if (result.completed) setDone(true)
    })
  }

  const handleChecked = (passed: boolean) => {
    if (!current) return
    const event: LessonEvent = {
      at: new Date().toISOString(),
      blockId: current.id,
      kind: current.kind,
      passed,
      latencyMs: Date.now() - stepState.startedAt,
      attempts: stepState.attempts + 1,
      detail: current.kind,
    }
    // Failures ask PyJo for remediation immediately; passes wait for Continue
    if (!passed) {
      persist({ event, requestNext: true })
    } else {
      persist({ event, requestNext: false })
    }
  }

  const handleContinue = () => {
    if (!current) return
    if (current.kind === "complete") {
      persist({ completeLesson: true })
      return
    }
    if (!canAdvance(current, stepState)) return

    const atEnd = stepIndex >= session.blocks.length - 1
    if (atEnd) {
      persist({
        cursor: stepIndex,
        requestNext: true,
      })
      return
    }
    const next = stepIndex + 1
    setStepIndex(next)
    persist({ cursor: next })
  }

  const handleRunTests = async () => {
    if (!current || current.kind !== "coding") return
    setTestsBusy(true)
    setError(null)
    try {
      const result = await getPyodideClient().runTests(code, current.tests, {
        timeoutMs: DEFAULT_RUN_TIMEOUT_MS,
      })
      setTestResults(result.results)
      const passed = result.ok
      setStepState((state) => ({
        ...state,
        codingTestsPassed: passed,
        attempts: state.attempts + 1,
      }))
      const event: LessonEvent = {
        at: new Date().toISOString(),
        blockId: current.id,
        kind: "coding",
        passed,
        latencyMs: Date.now() - stepState.startedAt,
        attempts: stepState.attempts + 1,
        detail: { tests: result.results },
      }
      persist({ event, requestNext: true })
    } catch (runError) {
      setError(
        runError instanceof Error ? runError.message : "Could not run tests."
      )
    } finally {
      setTestsBusy(false)
    }
  }

  if (!current) {
    return (
      <p className="text-sm text-destructive" role="alert">
        Waiting for PyJo…
      </p>
    )
  }

  const isCoding = current.kind === "coding"
  const isComplete = current.kind === "complete"

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-4">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/student/learn" aria-label="Back to path">
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

      <PyjoCoach speak={coachSpeak} pace={session.learner.pace} />

      <div className="flex shrink-0 items-center justify-between text-xs text-[var(--app-muted)]">
        <span>
          Step {stepIndex + 1}
          {session.blocks.length ? ` · ${session.blocks.length} revealed` : ""}
        </span>
        <span>
          confidence {Math.round(session.learner.confidence * 100)}%
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isCoding ? (
          <div className="flex min-h-[520px] flex-col gap-3">
            <div>
              <h2 className="text-xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                {current.title}
              </h2>
              <ul className="mt-2 space-y-1 text-sm text-[var(--app-muted)]">
                {current.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              {current.successCriteria ? (
                <p className="mt-2 text-xs text-[var(--brand-blue)]">
                  Success: {current.successCriteria}
                </p>
              ) : null}
            </div>
            <div className="min-h-[420px] flex-1">
              <PythonRunner
                fillHeight
                code={code}
                onCodeChange={setCode}
                className="min-h-[420px]"
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
            </div>
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
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <BlockView
            block={current}
            stepState={stepState}
            onStepStateChange={setStepState}
            onChecked={handleChecked}
          />
        )}
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {done ? (
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/student/learn">Back to path</Link>
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push("/student")}
          >
            Dashboard
          </Button>
        </div>
      ) : (
        <div className="flex shrink-0 justify-end border-t border-[var(--app-border)] pt-3">
          <Button
            type="button"
            size="sm"
            disabled={!canAdvance(current, stepState) && !isComplete}
            onClick={handleContinue}
            aria-label={isComplete ? "Finish with PyJo" : "Continue"}
          >
            {isComplete ? "Finish" : "Continue"}
            <ArrowRight />
          </Button>
        </div>
      )}
    </div>
  )
}
