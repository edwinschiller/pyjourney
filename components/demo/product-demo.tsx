"use client"

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Code2,
  EyeOff,
  GraduationCap,
  Lightbulb,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { PyJourneyLogo } from "@/components/brand/pyjourney-logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const demoSteps = [
  {
    eyebrow: "Student attempt",
    title: "A one-character mistake",
    shortTitle: "Make the mistake",
    icon: Code2,
  },
  {
    eyebrow: "Learning loop",
    title: "Evidence becomes a next step",
    shortTitle: "Replay the learning",
    icon: Sparkles,
  },
  {
    eyebrow: "Teacher view",
    title: "One moment becomes a class signal",
    shortTitle: "Act on the pattern",
    icon: BarChart3,
  },
] as const

const Signal = ({
  label,
  value,
  tone = "blue",
}: {
  label: string
  value: string
  tone?: "blue" | "yellow" | "green"
}) => {
  const tones = {
    blue: "bg-[var(--app-accent-soft)] text-[var(--brand-blue)]",
    yellow: "bg-[var(--app-highlight-soft)] text-amber-800 dark:text-amber-200",
    green: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  }

  return (
    <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3">
      <p className="text-[10px] font-bold tracking-[0.14em] text-[var(--app-muted)] uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 w-fit rounded-md px-2 py-1 text-xs font-semibold",
          tones[tone]
        )}
      >
        {value}
      </p>
    </div>
  )
}

const CodeWindow = ({
  corrected = false,
  compact = false,
}: {
  corrected?: boolean
  compact?: boolean
}) => (
  <div className="overflow-hidden rounded-xl border border-slate-700 bg-[#132433] text-slate-100 shadow-xl shadow-slate-950/10">
    <div className="flex items-center justify-between border-b border-slate-700 bg-[#1b3041] px-4 py-2.5">
      <div className="flex gap-1.5" aria-hidden>
        <span className="size-2 rounded-full bg-[#ff6b6b]" />
        <span className="size-2 rounded-full bg-[#fec42c]" />
        <span className="size-2 rounded-full bg-[#51cf66]" />
      </div>
      <span className="font-mono text-[10px] text-slate-400">
        variables.py
      </span>
    </div>
    <div
      className={cn(
        "grid grid-cols-[2rem_1fr] font-mono text-sm leading-7",
        compact ? "px-3 py-4" : "px-4 py-6 sm:grid-cols-[2.5rem_1fr]"
      )}
    >
      <span className="select-none text-right text-slate-400">1</span>
      <code className="pl-4">
        <span className="text-sky-300">student_name</span>{" "}
        <mark
          className={cn(
            "rounded px-1 font-bold text-inherit",
            corrected
              ? "bg-emerald-400/20 text-emerald-300"
              : "bg-amber-400/20 text-amber-300"
          )}
        >
          {corrected ? "=" : "=="}
        </mark>{" "}
        <span className="text-yellow-200">&quot;Maya&quot;</span>
      </code>
      <span className="select-none text-right text-slate-400">2</span>
      <code className="pl-4">
        <span className="text-violet-300">print</span>
        <span className="text-slate-300">(student_name)</span>
      </code>
    </div>
  </div>
)

const StudentAttempt = ({ onRun }: { onRun: () => void }) => (
  <section
    aria-labelledby="student-attempt-heading"
    className="grid gap-6 lg:grid-cols-[0.76fr_1.24fr] lg:items-stretch"
  >
    <div className="flex flex-col justify-between rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 sm:p-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--brand-blue)]">
          <GraduationCap className="size-4" aria-hidden />
          Maya · Variables · Practice 2
        </div>
        <h2
          id="student-attempt-heading"
          className="mt-4 text-2xl font-bold tracking-tight text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
        >
          Store your name in a variable
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--app-muted)]">
          Create <code className="font-mono text-[var(--app-fg)]">student_name</code>,
          store <strong className="font-semibold text-[var(--app-fg)]">Maya</strong>,
          then print it.
        </p>
      </div>

      <div className="mt-8 rounded-xl bg-[var(--app-accent-soft)] p-4">
        <p className="text-xs font-bold tracking-wide text-[var(--python-blue-dark)] uppercase dark:text-sky-300">
          What PyJourney can observe
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
          The checked result and how the code changed between attempts—not
          just the final answer.
        </p>
      </div>
    </div>

    <div className="app-surface flex min-h-[25rem] flex-col rounded-2xl p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[var(--app-fg)]">Code editor</p>
          <p className="mt-0.5 text-xs text-[var(--app-muted)]">
            Maya thinks comparison stores the value.
          </p>
        </div>
        <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold text-amber-800 dark:text-amber-200">
          Attempt 1
        </span>
      </div>

      <CodeWindow />

      <div
        role="status"
        className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-950 dark:text-amber-100"
      >
        <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>
          Ready to check. The requested variable has not been created yet.
        </p>
      </div>

      <div className="mt-auto flex justify-end pt-5">
        <Button
          size="lg"
          onClick={onRun}
          className="h-11 px-5"
          aria-label="Run the synthetic student attempt"
        >
          <Play className="size-4" aria-hidden />
          Run this attempt
        </Button>
      </div>
    </div>
  </section>
)

const LearningLoop = ({
  replayed,
  onReplay,
  onContinue,
}: {
  replayed: boolean
  onReplay: () => void
  onContinue: () => void
}) => (
  <section aria-labelledby="learning-loop-heading" className="space-y-5">
    <div className="grid gap-4 lg:grid-cols-[0.86fr_1.14fr]">
      <div className="app-surface rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-[var(--brand-blue)] uppercase">
              Evidence packet
            </p>
            <h2
              id="learning-loop-heading"
              className="mt-2 text-xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
            >
              Diagnose before explaining
            </h2>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-200">
            High confidence
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <Signal
            label="Deterministic check"
            value="student_name is undefined"
          />
          <Signal
            label="Process signal"
            value="== entered after identifier"
            tone="yellow"
          />
          <Signal
            label="Active curriculum node"
            value="Variables · assignment"
            tone="green"
          />
        </div>

        <div className="mt-5 flex items-start gap-3 border-t border-[var(--app-border)] pt-5">
          <ShieldCheck
            className="mt-0.5 size-5 shrink-0 text-[var(--brand-blue)]"
            aria-hidden
          />
          <div>
            <p className="text-sm font-bold text-[var(--app-fg)]">
              Curriculum boundary applied
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--app-muted)]">
              Use names, strings, and assignment. Do not introduce conditions
              or loops just to fix this moment.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--brand-blue)]/25 bg-gradient-to-br from-[var(--app-accent-soft)] to-[var(--app-surface)] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-yellow)] text-[var(--brand-navy)]">
            <Lightbulb className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-[var(--brand-blue)] uppercase">
              Focused remediation
            </p>
            <h3 className="mt-1 text-xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
              Store or compare?
            </h3>
          </div>
        </div>

        <p className="mt-5 text-sm leading-6 text-[var(--app-muted)]">
          A single <code className="font-mono font-bold text-[var(--app-fg)]">=</code>{" "}
          stores a value. Two{" "}
          <code className="font-mono font-bold text-[var(--app-fg)]">==</code>{" "}
          ask whether two values already match.
        </p>

        <div className="mt-5">
          <CodeWindow corrected={replayed} compact />
        </div>

        <div
          aria-live="polite"
          className={cn(
            "mt-4 min-h-[4.5rem] rounded-xl border p-3 text-sm",
            replayed
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100"
              : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)]"
          )}
        >
          {replayed ? (
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
              <p>
                <strong className="font-semibold">Attempt 2 passes.</strong>{" "}
                Maya changed one character after the targeted contrast.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2.5">
              <RotateCcw className="mt-0.5 size-4 shrink-0" aria-hidden />
              <p>
                Replay the next edit to see whether the intervention transfers.
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          {replayed ? (
            <Button size="lg" onClick={onContinue} className="h-11 px-5">
              Open teacher view
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          ) : (
            <Button size="lg" onClick={onReplay} className="h-11 px-5">
              <RotateCcw className="size-4" aria-hidden />
              Replay the correction
            </Button>
          )}
        </div>
      </div>
    </div>

    <div className="grid gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
      <div>
        <p className="text-[10px] font-bold tracking-wider text-[var(--app-muted)] uppercase">
          Attempt
        </p>
        <p className="mt-1 font-mono text-xs text-amber-700 dark:text-amber-300">
          student_name == &quot;Maya&quot;
        </p>
      </div>
      <ArrowRight
        className="hidden size-4 text-[var(--app-muted)] sm:block"
        aria-hidden
      />
      <div>
        <p className="text-[10px] font-bold tracking-wider text-[var(--app-muted)] uppercase">
          Intervention
        </p>
        <p className="mt-1 text-xs font-semibold text-[var(--app-fg)]">
          One concept · one contrast
        </p>
      </div>
      <ArrowRight
        className="hidden size-4 text-[var(--app-muted)] sm:block"
        aria-hidden
      />
      <div>
        <p className="text-[10px] font-bold tracking-wider text-[var(--app-muted)] uppercase">
          Evidence
        </p>
        <p className="mt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          Corrected on next attempt
        </p>
      </div>
    </div>
  </section>
)

const ClassDotGrid = () => (
  <div
    className="grid grid-cols-12 gap-1.5"
    role="img"
    aria-label="24 synthetic students: 8 show the assignment versus comparison pattern"
  >
    {Array.from({ length: 24 }, (_, index) => (
      <span
        key={index}
        className={cn(
          "aspect-square rounded-[0.22rem]",
          index < 8
            ? "bg-[var(--brand-yellow)] ring-1 ring-amber-500/50"
            : "bg-[var(--app-accent-soft)]"
        )}
        aria-hidden
      />
    ))}
  </div>
)

const TeacherView = ({
  interventionOpen,
  onToggleIntervention,
  onReplayStory,
}: {
  interventionOpen: boolean
  onToggleIntervention: () => void
  onReplayStory: () => void
}) => (
  <section aria-labelledby="teacher-view-heading" className="space-y-5">
    <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
      <div className="app-surface rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--brand-blue)]">
              <Users className="size-4" aria-hidden />
              Python 8A · Variables
            </div>
            <h2
              id="teacher-view-heading"
              className="mt-2 text-2xl font-bold tracking-tight text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
            >
              A shared misconception is emerging
            </h2>
          </div>
          <span className="rounded-full bg-[var(--app-highlight-soft)] px-2.5 py-1 text-[11px] font-bold text-amber-800 dark:text-amber-200">
            Review this lesson
          </span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-[var(--app-highlight-soft)] p-4">
            <p className="text-2xl font-bold tabular-nums text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
              8 / 24
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-700 dark:text-slate-200">
              learners showed this pattern
            </p>
          </div>
          <div className="rounded-xl bg-[var(--app-accent-soft)] p-4">
            <p className="text-2xl font-bold tabular-nums text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
              14
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-700 dark:text-slate-200">
              checked occurrences
            </p>
          </div>
          <div className="rounded-xl bg-emerald-500/10 p-4">
            <p className="text-2xl font-bold tabular-nums text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
              6 / 8
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-700 dark:text-slate-200">
              corrected next attempt
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 rounded-xl border border-[var(--app-border)] p-4 sm:grid-cols-[0.7fr_1.3fr] sm:items-center">
          <ClassDotGrid />
          <div>
            <p className="text-sm font-bold text-[var(--app-fg)]">
              Assignment vs. comparison
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--app-muted)]">
              The pattern spans multiple learners, so it is more useful than
              another isolated wrong-answer count.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-[var(--app-muted)]">
          <EyeOff className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            Aggregated learning evidence is shown here. No raw student code is
            exposed in this class view.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--brand-blue)]/30 bg-gradient-to-br from-[var(--app-accent-soft)] via-[var(--app-surface)] to-[var(--app-highlight-soft)] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-blue)] text-white">
            <Target className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-[var(--brand-blue)] uppercase">
              Suggested intervention · 3 min
            </p>
            <h3 className="mt-1 text-xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
              Contrast before the next concept
            </h3>
          </div>
        </div>

        <p className="mt-5 text-sm leading-6 text-[var(--app-muted)]">
          Put <code className="font-mono font-semibold">=</code> and{" "}
          <code className="font-mono font-semibold">==</code> side by side.
          Ask learners to predict which one stores a value, then rerun one
          example.
        </p>

        <div
          aria-live="polite"
          className={cn(
            "mt-5 overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] transition-all",
            interventionOpen ? "max-h-64 p-4 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <ol className="space-y-3">
            {[
              "Predict: Which line creates the variable?",
              "Contrast: Change only one character.",
              "Check: Ask for the value of student_name.",
            ].map((item, index) => (
              <li key={item} className="flex gap-3 text-sm">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--app-accent-soft)] text-xs font-bold text-[var(--brand-blue)]">
                  {index + 1}
                </span>
                <span className="pt-0.5 text-[var(--app-muted)]">{item}</span>
              </li>
            ))}
          </ol>
        </div>

        <Button
          size="lg"
          variant={interventionOpen ? "outline" : "default"}
          onClick={onToggleIntervention}
          className="mt-5 h-11 w-full"
          aria-expanded={interventionOpen}
        >
          {interventionOpen ? (
            <>
              <Check className="size-4" aria-hidden />
              Intervention ready
            </>
          ) : (
            <>
              <Lightbulb className="size-4" aria-hidden />
              Preview intervention
            </>
          )}
        </Button>
      </div>
    </div>

    <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 text-center sm:flex-row sm:text-left">
      <div>
        <p className="font-bold text-[var(--app-fg)]">
          That is the PyJourney loop.
        </p>
        <p className="mt-1 text-sm text-[var(--app-muted)]">
          Attempt → bounded learning step → classroom action.
        </p>
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <Button variant="outline" size="lg" onClick={onReplayStory}>
          <RotateCcw className="size-4" aria-hidden />
          Replay story
        </Button>
        <Button asChild size="lg">
          <Link href="/login?mode=register">
            Try PyJourney
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  </section>
)

export const ProductDemo = () => {
  const [step, setStep] = useState(0)
  const [replayed, setReplayed] = useState(false)
  const [interventionOpen, setInterventionOpen] = useState(false)

  const goToStep = (nextStep: number) => {
    setStep(nextStep)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const replayStory = () => {
    setReplayed(false)
    setInterventionOpen(false)
    goToStep(0)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--app-bg)] text-[var(--app-fg)]">
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <div className="absolute -left-40 -top-40 size-[32rem] rounded-full bg-[var(--brand-blue)] opacity-[0.08] blur-3xl" />
        <div className="absolute -right-40 top-1/3 size-[28rem] rounded-full bg-[var(--brand-yellow)] opacity-[0.12] blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="Back to PyJourney home">
            <PyJourneyLogo className="max-w-[170px] sm:max-w-[190px]" />
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <ArrowLeft className="size-3.5" aria-hidden />
              <span className="hidden sm:inline">Back to overview</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </Button>
        </header>

        <main className="flex-1 py-8 sm:py-10">
          <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-[var(--brand-yellow)] px-3 py-1 text-[11px] font-bold tracking-wide text-[var(--brand-navy)] uppercase">
                  Guided product demo · ~75 sec
                </span>
                <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-1 text-[11px] font-semibold text-[var(--app-muted)]">
                  Synthetic scenario and data
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--brand-navy)] dark:text-[var(--app-fg)] sm:text-4xl">
                Learn from the mistake—not just the answer.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--app-muted)] sm:text-base">
                Follow one Python misconception from a student&apos;s editor to
                a focused learning moment and a teacher&apos;s next move.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-xs text-[var(--app-muted)] lg:self-auto">
              <span className="size-2 rounded-full bg-emerald-500" aria-hidden />
              No account, database, or live learner data
            </div>
          </div>

          <nav aria-label="Demo progress" className="mb-5">
            <ol className="grid gap-2 sm:grid-cols-3">
              {demoSteps.map((item, index) => {
                const Icon = item.icon
                const active = index === step
                const complete = index < step
                return (
                  <li key={item.shortTitle}>
                    <button
                      type="button"
                      onClick={() => goToStep(index)}
                      aria-current={active ? "step" : undefined}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)] focus-visible:ring-offset-2",
                        active
                          ? "border-[var(--brand-blue)] bg-[var(--app-accent-soft)]"
                          : "border-[var(--app-border)] bg-[var(--app-surface)] hover:bg-[var(--app-surface-hover)]"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg",
                          complete
                            ? "bg-emerald-500 text-white"
                            : active
                              ? "bg-[var(--brand-blue)] text-white"
                              : "bg-[var(--app-accent-soft)] text-[var(--brand-blue)]"
                        )}
                      >
                        {complete ? (
                          <Check className="size-4" aria-hidden />
                        ) : (
                          <Icon className="size-4" aria-hidden />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[10px] font-bold tracking-wider text-slate-600 uppercase dark:text-slate-300">
                          Step {index + 1}
                        </span>
                        <span className="block truncate text-xs font-bold text-[var(--app-fg)] sm:text-sm">
                          {item.shortTitle}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </nav>

          <div className="mb-5 flex items-center gap-3" aria-live="polite">
            <span className="text-xs font-bold tracking-[0.14em] text-[var(--brand-blue)] uppercase">
              {demoSteps[step].eyebrow}
            </span>
            <span className="h-px flex-1 bg-[var(--app-border)]" aria-hidden />
            <span className="text-xs tabular-nums text-[var(--app-muted)]">
              {step + 1} / {demoSteps.length}
            </span>
          </div>

          <div key={step} className="lesson-step-enter">
            {step === 0 ? (
              <StudentAttempt onRun={() => goToStep(1)} />
            ) : step === 1 ? (
              <LearningLoop
                replayed={replayed}
                onReplay={() => setReplayed(true)}
                onContinue={() => goToStep(2)}
              />
            ) : (
              <TeacherView
                interventionOpen={interventionOpen}
                onToggleIntervention={() =>
                  setInterventionOpen((current) => !current)
                }
                onReplayStory={replayStory}
              />
            )}
          </div>
        </main>

        <footer className="flex flex-col gap-2 border-t border-[var(--app-border)] py-5 text-xs text-[var(--app-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>PyJourney · adaptive Python learning for real classrooms</p>
          <p>This walkthrough uses fictional learners and synthetic metrics.</p>
        </footer>
      </div>
    </div>
  )
}
