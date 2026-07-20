import Link from "next/link"

import { Button } from "@/components/ui/button"
import { requireStudentWithOnboarding } from "@/lib/auth/session"
import {
  listUnlockedConcepts,
  loadCurriculumGraph,
  resolveNextConceptForStudent,
} from "@/lib/curriculum"
import {
  getMasteryForConcept,
  getMasteryScoreMapForStudent,
  scoreToBand,
} from "@/lib/mastery"

export const dynamic = "force-dynamic"

const StudentLearnPage = async () => {
  const user = await requireStudentWithOnboarding()
  const masteryMap = await getMasteryScoreMapForStudent(user.id)
  const graph = await loadCurriculumGraph()
  const next = await resolveNextConceptForStudent(user.id, masteryMap)

  const currentMastery = next
    ? await getMasteryForConcept(user.id, next.concept.id)
    : null

  const unlocked = listUnlockedConcepts(graph, masteryMap)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          Learn
        </h1>
        <p className="text-base text-[var(--app-muted)]">
          Your adaptive path follows mastery and prerequisites. Interactive
          lessons arrive in the next feature commits.
        </p>
      </header>

      <section className="app-surface flex flex-col gap-4 rounded-xl p-5">
        <p className="text-xs font-medium tracking-wide text-[var(--app-muted)] uppercase">
          Current focus
        </p>
        {next ? (
          <>
            <h2 className="text-xl font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
              {next.concept.title}
            </h2>
            <p className="text-sm text-[var(--app-muted)]">
              {next.concept.description}
            </p>
            <p className="text-sm text-[var(--app-muted)]">
              Mastery:{" "}
              <span className="font-medium text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                {currentMastery
                  ? `${currentMastery.score}/100 · ${scoreToBand(currentMastery.score)}`
                  : "0/100 · learning"}
              </span>
              {next.reason === "assignment_override"
                ? " · Teacher assignment"
                : " · Adaptive recommendation"}
            </p>
            <div className="rounded-lg bg-[var(--app-accent-soft)] p-4 text-sm text-[var(--app-muted)]">
              The lesson workspace (explanation, checks, and coding exercises)
              will open here once the editor and lesson engine are ready.
            </div>
          </>
        ) : (
          <p className="text-sm text-[var(--app-muted)]">
            No next concept right now — you have cleared the unlocked catalog.
          </p>
        )}
        <Button asChild variant="outline">
          <Link href="/student" aria-label="Back to dashboard">
            Back to dashboard
          </Link>
        </Button>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="path-heading">
        <h2
          id="path-heading"
          className="text-lg font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
        >
          Unlocked path ({unlocked.length})
        </h2>
        <ul className="app-surface divide-y divide-[var(--app-border)] rounded-xl">
          {unlocked.map((concept) => {
            const score = masteryMap.get(concept.id) ?? 0
            const isNext = next?.concept.id === concept.id
            return (
              <li
                key={concept.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
              >
                <div>
                  <p className="font-medium text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
                    {concept.title}
                    {isNext ? (
                      <span className="ml-2 text-xs font-medium text-[var(--brand-blue)]">
                        Next
                      </span>
                    ) : null}
                  </p>
                  <p className="text-sm text-[var(--app-muted)]">
                    {concept.description}
                  </p>
                </div>
                <p className="font-mono text-sm text-[var(--app-muted)]">
                  {score}/100
                </p>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

export default StudentLearnPage
