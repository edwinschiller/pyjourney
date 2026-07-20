"use client"

import { CheckCircle2, Circle, ListChecks, Loader2, XCircle } from "lucide-react"
import { useState, useTransition } from "react"

import { PythonRunner } from "@/components/editor/python-runner"
import { Button } from "@/components/ui/button"
import { completeLessonAction } from "@/lib/lessons/actions"
import type { LessonContent } from "@/lib/lessons/schema"
import {
  DEFAULT_RUN_TIMEOUT_MS,
  getPyodideClient,
  type LessonTestResult,
} from "@/lib/pyodide"
import { cn } from "@/lib/utils"

type LessonWorkspaceProps = {
  lessonId: string
  conceptTitle: string
  status: "active" | "completed" | "abandoned"
  content: LessonContent
}

export const LessonWorkspace = ({
  lessonId,
  conceptTitle,
  status,
  content,
}: LessonWorkspaceProps) => {
  const [code, setCode] = useState(content.starterCode)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [checkRevealed, setCheckRevealed] = useState(false)
  const [testResults, setTestResults] = useState<LessonTestResult[] | null>(
    null
  )
  const [testsBusy, setTestsBusy] = useState(false)
  const [testsError, setTestsError] = useState<string | null>(null)
  const [lessonStatus, setLessonStatus] = useState(status)
  const [completePending, startCompleteTransition] = useTransition()

  const comprehension = content.comprehensionCheck
  const isCorrect =
    selectedOption !== null &&
    selectedOption === comprehension.correctIndex

  const allPassed =
    testResults !== null &&
    testResults.length > 0 &&
    testResults.every((result) => result.passed)

  const handleCheckAnswer = () => {
    if (selectedOption === null) {
      return
    }
    setCheckRevealed(true)
  }

  const handleRunTests = async () => {
    setTestsBusy(true)
    setTestsError(null)
    try {
      const client = getPyodideClient()
      const result = await client.runTests(code, content.tests, {
        timeoutMs: DEFAULT_RUN_TIMEOUT_MS,
      })
      setTestResults(result.results)
      if (result.error && !result.results.some((row) => row.passed)) {
        setTestsError(result.error)
      }
      if (result.ok && lessonStatus === "active") {
        startCompleteTransition(async () => {
          const complete = await completeLessonAction(lessonId)
          if (complete.ok) {
            setLessonStatus("completed")
          }
        })
      }
    } catch (error) {
      setTestsError(
        error instanceof Error ? error.message : "Could not run tests."
      )
    } finally {
      setTestsBusy(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:gap-5">
      <aside className="flex max-h-[42vh] shrink-0 flex-col gap-4 overflow-y-auto lg:max-h-none lg:w-[min(100%,380px)] lg:shrink-0">
        <header className="shrink-0">
          <p className="text-xs font-medium tracking-wide text-[var(--app-muted)] uppercase">
            {conceptTitle}
            {lessonStatus === "completed" ? " · Completed" : ""}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            {content.title}
          </h1>
          <p className="mt-1 text-sm text-[var(--app-muted)]">
            {content.objective}
          </p>
        </header>

        <section className="flex flex-col gap-2" aria-labelledby="explain-heading">
          <h2
            id="explain-heading"
            className="text-sm font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
          >
            Explanation
          </h2>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--app-muted)]">
            {content.explanation}
          </div>
        </section>

        <section className="flex flex-col gap-2" aria-labelledby="example-heading">
          <h2
            id="example-heading"
            className="text-sm font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
          >
            Example
          </h2>
          <pre className="overflow-x-auto rounded-lg bg-[var(--app-bg)] p-3 font-mono text-xs leading-relaxed text-[var(--app-fg)]">
            {content.example}
          </pre>
        </section>

        <section
          className="flex flex-col gap-3"
          aria-labelledby="comprehension-heading"
        >
          <h2
            id="comprehension-heading"
            className="text-sm font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
          >
            Quick check
          </h2>
          <p className="text-sm text-[var(--app-muted)]">
            {comprehension.question}
          </p>
          <ul className="flex flex-col gap-2">
            {comprehension.options.map((option, index) => {
              const selected = selectedOption === index
              return (
                <li key={option}>
                  <button
                    type="button"
                    tabIndex={0}
                    aria-label={`Option ${index + 1}: ${option}`}
                    aria-pressed={selected}
                    onClick={() => {
                      setSelectedOption(index)
                      setCheckRevealed(false)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        setSelectedOption(index)
                        setCheckRevealed(false)
                      }
                    }}
                    className={cn(
                      "w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                      selected
                        ? "border-[var(--brand-blue)] bg-[var(--app-accent-soft)] text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
                        : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)] hover:border-[var(--brand-blue)]/40"
                    )}
                  >
                    {option}
                  </button>
                </li>
              )
            })}
          </ul>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={selectedOption === null}
            onClick={handleCheckAnswer}
            aria-label="Check comprehension answer"
          >
            Check answer
          </Button>
          {checkRevealed ? (
            <p
              className={cn(
                "text-sm",
                isCorrect ? "text-[var(--brand-blue)]" : "text-destructive"
              )}
              role="status"
            >
              {isCorrect ? "Correct. " : "Not quite. "}
              {comprehension.explanation}
            </p>
          ) : null}
        </section>

        <section className="flex flex-col gap-2" aria-labelledby="exercise-heading">
          <h2
            id="exercise-heading"
            className="text-sm font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
          >
            Exercise
          </h2>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--app-muted)]">
            {content.exercise}
          </div>
          {content.visibleExamples.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {content.visibleExamples.map((example) => (
                <li
                  key={example}
                  className="font-mono text-xs text-[var(--brand-blue)]"
                >
                  {example}
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="flex flex-col gap-2" aria-labelledby="tests-heading">
          <h2
            id="tests-heading"
            className="text-sm font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
          >
            Tests
          </h2>
          <ul className="flex flex-col gap-2">
            {content.tests.map((test) => {
              const result = testResults?.find((row) => row.id === test.id)
              return (
                <li
                  key={test.id}
                  className="flex items-start gap-2 text-sm text-[var(--app-muted)]"
                >
                  {result == null ? (
                    <Circle className="mt-0.5 size-4 shrink-0" aria-hidden />
                  ) : result.passed ? (
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0 text-[var(--brand-blue)]"
                      aria-hidden
                    />
                  ) : (
                    <XCircle
                      className="mt-0.5 size-4 shrink-0 text-destructive"
                      aria-hidden
                    />
                  )}
                  <span>
                    {test.description}
                    {result?.error ? (
                      <span className="mt-0.5 block font-mono text-xs text-destructive">
                        {result.error}
                      </span>
                    ) : null}
                  </span>
                </li>
              )
            })}
          </ul>
          {testsError ? (
            <p className="text-sm text-destructive" role="alert">
              {testsError}
            </p>
          ) : null}
          {allPassed ? (
            <p className="text-sm text-[var(--brand-blue)]" role="status">
              All tests passed
              {completePending ? " · saving…" : ""}
              {lessonStatus === "completed" ? " · lesson complete" : ""}
            </p>
          ) : null}
        </section>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <PythonRunner
          fillHeight
          code={code}
          onCodeChange={setCode}
          toolbarLeading={
            <span className="text-sm font-semibold text-[var(--app-fg)]">
              Your solution
            </span>
          }
          toolbarExtra={
            <Button
              size="sm"
              type="button"
              variant="outline"
              disabled={testsBusy}
              onClick={() => void handleRunTests()}
              aria-label="Check exercise against tests"
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
    </div>
  )
}
