import type { ComponentType } from "react"
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ClipboardList,
  Code2,
  MessageCircle,
  Route,
  UserRoundSearch,
  Users,
} from "lucide-react"
import Link from "next/link"

import { PyJourneyLogo } from "@/components/brand/pyjourney-logo"
import { SiteFooter } from "@/components/layout/site-footer"
import {
  PathNodeMark,
  pathNodeConnectorClassName,
  type PathNodeVisualState,
} from "@/components/lessons/path/path-node"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type FeatureItem = {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
}

const studentFeatures: FeatureItem[] = [
  {
    icon: Route,
    title: "Adaptive learning path",
    description:
      "Seven concepts with prerequisites. Mastery unlocks what comes next.",
  },
  {
    icon: BookOpen,
    title: "Guided lessons",
    description:
      "Explain, quiz, practice, and apply — with a clear “Why this step?”",
  },
  {
    icon: Code2,
    title: "Python in the browser",
    description:
      "Monaco + Pyodide for lessons and free coding. No install needed.",
  },
  {
    icon: MessageCircle,
    title: "In-app help",
    description:
      "Ask for a hint or open the assistant without leaving the lesson.",
  },
]

const teacherFeatures: FeatureItem[] = [
  {
    icon: Users,
    title: "Classrooms",
    description: "Create a class, share a join code, and see who’s enrolled.",
  },
  {
    icon: ClipboardList,
    title: "Assignments",
    description: "Point a class at a concept as their next focus.",
  },
  {
    icon: BarChart3,
    title: "Intervention radar",
    description:
      "Aggregated struggle patterns and a concrete next teaching move.",
  },
  {
    icon: UserRoundSearch,
    title: "Student insights",
    description:
      "Open any learner for mastery, coding evidence, and an AI coaching report.",
  },
]

const pathPreview: Array<{
  label: string
  state: PathNodeVisualState
  meta: string
}> = [
  { label: "Variables", state: "completed", meta: "100/100" },
  { label: "Data types", state: "completed", meta: "67/100" },
  { label: "Conditions", state: "active", meta: "In progress" },
  { label: "Loops", state: "locked", meta: "Locked" },
]

const PathPreview = () => (
  <div className="app-surface rounded-2xl p-6 md:p-8">
    <p className="text-xs font-medium tracking-wide text-[var(--app-muted)] uppercase">
      Learning path
    </p>
    <p className="mt-1 text-sm font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
      Python with PyJourney
    </p>

    <div className="mt-5 flex flex-col gap-1.5">
      <div className="flex justify-between text-xs text-[var(--app-muted)]">
        <span>Progress</span>
        <span className="tabular-nums">2/7 · 29%</span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-[var(--app-border)]"
        role="progressbar"
        aria-valuenow={29}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Path progress"
      >
        <div
          className="h-full rounded-full bg-[var(--brand-blue)]"
          style={{ width: "29%" }}
        />
      </div>
    </div>

    <div className="mt-6 flex items-start justify-between gap-1 px-1">
      {pathPreview.map((node, index) => (
        <div
          key={node.label}
          className="flex min-w-0 flex-1 flex-col items-center"
        >
          <div className="flex w-full items-center">
            {index > 0 ? (
              <span
                className={cn(
                  "mx-1 h-0.5 min-w-2 flex-1 rounded-full",
                  pathNodeConnectorClassName(
                    pathPreview[index - 1]?.state === "completed"
                  )
                )}
                aria-hidden
              />
            ) : (
              <span className="mx-1 min-w-2 flex-1" aria-hidden />
            )}
            <PathNodeMark
              state={node.state}
              index={index + 1}
              aria-label={`${node.label}: ${node.meta}`}
            />
            {index < pathPreview.length - 1 ? (
              <span
                className={cn(
                  "mx-1 h-0.5 min-w-2 flex-1 rounded-full",
                  pathNodeConnectorClassName(node.state === "completed")
                )}
                aria-hidden
              />
            ) : (
              <span className="mx-1 min-w-2 flex-1" aria-hidden />
            )}
          </div>
          <p
            className={cn(
              "mt-3 max-w-full truncate text-center text-[11px] font-semibold",
              node.state === "locked" || node.state === "soon"
                ? "text-[var(--app-muted)]"
                : "text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
            )}
          >
            {node.label}
          </p>
          <p className="mt-0.5 text-center text-[10px] text-[var(--app-muted)]">
            {node.meta}
          </p>
        </div>
      ))}
    </div>
  </div>
)

const FeatureGrid = ({
  title,
  items,
}: {
  title: string
  items: FeatureItem[]
}) => (
  <section className="space-y-4">
    <h3 className="text-lg font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
      {title}
    </h3>
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <article
            key={item.title}
            className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
                <Icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-[var(--app-fg)]">
                  {item.title}
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-[var(--app-muted)]">
                  {item.description}
                </p>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  </section>
)

export const LandingPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--app-bg)] text-[var(--app-fg)]">
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <div
          className="absolute -left-32 top-0 h-[480px] w-[480px] rounded-full opacity-25 blur-3xl"
          style={{ background: "var(--brand-blue)" }}
        />
        <div
          className="absolute -right-24 top-1/3 h-[400px] w-[400px] rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--brand-yellow)" }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 md:px-8 md:py-10">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="PyJourney home">
            <PyJourneyLogo />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              asChild
              variant="outline"
              className="h-8 border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-[var(--app-fg)] hover:bg-[var(--app-surface-hover)]"
            >
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-16 py-12 md:gap-20 md:py-16">
          <section className="grid items-center gap-10 md:grid-cols-2 md:gap-12">
            <div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-[var(--brand-navy)] dark:text-[var(--app-fg)] md:text-4xl">
                Adaptive Python learning for real classrooms
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-[var(--app-muted)]">
                Students learn on a mastery path. Teachers see class patterns —
                without digging through raw code.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/login?mode=register">
                    Get started
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
            </div>

            <PathPreview />
          </section>

          <section aria-labelledby="features-heading" className="space-y-10">
            <div className="max-w-2xl">
              <h2
                id="features-heading"
                className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)] md:text-3xl"
              >
                What’s in PyJourney
              </h2>
              <p className="mt-2 text-base text-[var(--app-muted)]">
                The features that ship today — for learners and teachers.
              </p>
            </div>
            <FeatureGrid title="For students" items={studentFeatures} />
            <FeatureGrid title="For teachers" items={teacherFeatures} />
          </section>

          <section aria-labelledby="how-heading">
            <div className="mb-8 max-w-2xl">
              <h2
                id="how-heading"
                className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)] md:text-3xl"
              >
                How it works
              </h2>
            </div>
            <ol className="grid gap-4 md:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Attempt",
                  text: "Students practice in lessons or free coding.",
                },
                {
                  step: "2",
                  title: "Evidence",
                  text: "Checks and edits become the next learning step.",
                },
                {
                  step: "3",
                  title: "Action",
                  text: "Teachers get class patterns they can act on.",
                },
              ].map((item) => (
                <li
                  key={item.step}
                  className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5"
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-[var(--app-accent-soft)] text-sm font-bold text-[var(--app-accent)]">
                    {item.step}
                  </span>
                  <h3 className="mt-4 text-base font-bold text-[var(--app-fg)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--app-muted)]">
                    {item.text}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <section
            className="app-surface overflow-hidden rounded-2xl"
            aria-labelledby="cta-heading"
          >
            <div className="bg-gradient-to-br from-[var(--app-accent-soft)] via-[var(--app-surface)] to-[var(--app-highlight-soft)] px-6 py-10 text-center md:px-12 md:py-12">
              <h2
                id="cta-heading"
                className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)] md:text-3xl"
              >
                Ready to try it?
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-base text-[var(--app-muted)]">
                Create an account and start with the Python learning path.
              </p>
              <div className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
                <Button asChild size="lg" className="sm:flex-1">
                  <Link href="/login?mode=register">
                    Create account
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="sm:flex-1"
                >
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}
