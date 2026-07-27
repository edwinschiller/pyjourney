import type { ComponentType } from "react"
import {
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  Code2,
  GraduationCap,
  Lightbulb,
  Route,
  Sparkles,
  Users,
} from "lucide-react"
import Link from "next/link"

import { PyJourneyLogo } from "@/components/brand/pyjourney-logo"
import { Button } from "@/components/ui/button"

type FeatureItem = {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
}

const learningFeatures: FeatureItem[] = [
  {
    icon: Route,
    title: "Adaptive learning path",
    description:
      "Lessons follow a competency graph and adapt to each student’s mastery.",
  },
  {
    icon: Code2,
    title: "Python in the browser",
    description:
      "Monaco editor and Pyodide — write and run code with no install.",
  },
  {
    icon: Brain,
    title: "Coding process analysis",
    description:
      "Periodic snapshots capture how students code, not just the final answer.",
  },
  {
    icon: Lightbulb,
    title: "Staged hints",
    description:
      "Guided help in five levels — support without spoiling the solution early.",
  },
]

const teachingFeatures: FeatureItem[] = [
  {
    icon: Users,
    title: "Classroom management",
    description:
      "Create classes, share join codes, and keep students organized.",
  },
  {
    icon: BarChart3,
    title: "Student & class insights",
    description:
      "See misconceptions, hint use, and where the class needs support.",
  },
  {
    icon: Sparkles,
    title: "Evidence-based feedback",
    description:
      "Insights stay grounded in mastery, tests, and analysis confidence.",
  },
  {
    icon: GraduationCap,
    title: "Roles that fit school",
    description:
      "Clear student, teacher, and admin access — enforced on the server.",
  },
]

const pathPreview = [
  { label: "Variables", state: "done" as const },
  { label: "Types", state: "active" as const },
  { label: "Conditions", state: "locked" as const },
  { label: "Loops", state: "locked" as const },
]

const FeatureGrid = ({
  title,
  subtitle,
  items,
}: {
  title: string
  subtitle: string
  items: FeatureItem[]
}) => (
  <section className="space-y-5">
    <div>
      <h3 className="text-lg font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
        {title}
      </h3>
      <p className="mt-1 text-sm text-[var(--app-muted)]">{subtitle}</p>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <article
            key={item.title}
            className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--app-accent-soft)] text-[var(--brand-blue)]">
                <Icon className="h-4 w-4" aria-hidden />
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
          <Button asChild size="sm" variant="outline">
            <Link href="/login" aria-label="Sign in">
              Sign in
            </Link>
          </Button>
        </header>

        <main className="flex flex-1 flex-col gap-16 py-12 md:gap-20 md:py-16">
          <section className="grid items-center gap-10 md:grid-cols-2 md:gap-12">
            <div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-[var(--brand-navy)] dark:text-[var(--app-fg)] md:text-4xl">
                Adaptive Python learning for real classrooms
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-[var(--app-muted)]">
                Students get lessons that match their mastery. Teachers see
                where the class struggles — with evidence from coding, not
                guesswork.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/login?mode=register" aria-label="Get started">
                    Get started
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/login" aria-label="Sign in to your account">
                    Sign in
                  </Link>
                </Button>
              </div>
            </div>

            <div className="app-surface rounded-2xl p-6 md:p-8">
              <p className="text-sm font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                Competency path preview
              </p>
              <div className="mt-6 flex items-center justify-between gap-1 px-1">
                {pathPreview.map((node, index) => {
                  const done = node.state === "done"
                  const active = node.state === "active"
                  return (
                    <div
                      key={node.label}
                      className="flex flex-1 items-center justify-center"
                    >
                      {index > 0 && (
                        <span
                          className={`mx-1 h-0.5 max-w-[2rem] flex-1 rounded-full ${
                            pathPreview[index - 1]?.state === "done"
                              ? "bg-[var(--brand-yellow)]"
                              : "bg-[var(--app-border)]"
                          }`}
                          aria-hidden
                        />
                      )}
                      <span
                        className={`flex size-11 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                          done
                            ? "border-[var(--brand-yellow)] bg-[var(--brand-yellow)] text-[var(--brand-navy)]"
                            : active
                              ? "border-[var(--brand-blue)] bg-[var(--app-accent-soft)] text-[var(--brand-blue)]"
                              : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)]"
                        }`}
                        aria-label={`${node.label}: ${node.state}`}
                      >
                        {done ? <Check className="h-4 w-4" aria-hidden /> : index + 1}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 grid grid-cols-4 gap-1 text-center">
                {pathPreview.map((node) => (
                  <p
                    key={node.label}
                    className="truncate text-[11px] font-medium text-[var(--app-muted)]"
                  >
                    {node.label}
                  </p>
                ))}
              </div>
              <p className="mt-5 text-center text-xs font-medium text-[var(--app-muted)]">
                Mastery unlocks the next concept — assignments can override
              </p>
            </div>
          </section>

          <section aria-labelledby="features-heading" className="space-y-10">
            <div className="max-w-2xl">
              <h2
                id="features-heading"
                className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)] md:text-3xl"
              >
                Built for how coding is learned
              </h2>
              <p className="mt-2 text-base text-[var(--app-muted)]">
                Adaptive lessons, live analysis, and teacher insight — one
                platform for students and classrooms.
              </p>
            </div>

            <FeatureGrid
              title="For students"
              subtitle="Learn with a path that reacts to your code and progress."
              items={learningFeatures}
            />
            <FeatureGrid
              title="For teachers"
              subtitle="Run classes and intervene where evidence shows it matters."
              items={teachingFeatures}
            />
          </section>

          <section aria-labelledby="how-heading">
            <div className="mb-8 max-w-2xl">
              <h2
                id="how-heading"
                className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)] md:text-3xl"
              >
                How it works
              </h2>
              <p className="mt-2 text-base text-[var(--app-muted)]">
                A short loop from first lesson to insight.
              </p>
            </div>
            <ol className="grid gap-4 md:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Start from zero",
                  text: "Every learner begins with mastery at 0 on every concept.",
                },
                {
                  step: "2",
                  title: "Learn and code",
                  text: "Adaptive lessons, deterministic checks, and open apply tasks.",
                },
                {
                  step: "3",
                  title: "See what matters",
                  text: "Students and teachers get evidence-based insights.",
                },
              ].map((item) => (
                <li
                  key={item.step}
                  className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--app-accent-soft)] text-sm font-bold text-[var(--brand-blue)]">
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
                Ready to start learning?
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-base text-[var(--app-muted)]">
                Create an account to begin — classrooms and insights come with
                the same login.
              </p>
              <div className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
                <Button asChild size="lg" className="sm:flex-1">
                  <Link href="/login?mode=register" aria-label="Create an account">
                    Create account
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="sm:flex-1">
                  <Link href="/login" aria-label="Sign in">
                    Sign in
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-[var(--app-border)] py-6 text-center text-sm text-[var(--app-muted)]">
          © {new Date().getFullYear()} PyJourney. All rights reserved.
        </footer>
      </div>
    </div>
  )
}
