import type {
  ClassInsightsSummary,
  ClassMisconception,
  ClassStruggleTopic,
} from "./types"

type ClassInterventionInput = Pick<
  ClassInsightsSummary,
  | "memberCount"
  | "totalEvents"
  | "failCount"
  | "struggleTopics"
  | "misconceptions"
>

export type ClassIntervention =
  | {
      state:
        | "empty-class"
        | "awaiting-evidence"
        | "unmapped-evidence"
        | "no-intervention"
      title: string
      description: string
    }
  | {
      state: "ready"
      topic: ClassStruggleTopic
      affectedStudents: number
      affectedPercent: number
      signalLabel: "Early signal" | "Shared need" | "Repeated shared need"
      reason: string
      action: string
      watchFor: ClassMisconception | null
    }

const compareText = (a: string, b: string) => {
  if (a === b) return 0
  return a < b ? -1 : 1
}

const rankTopics = (topics: ClassStruggleTopic[]) =>
  [...topics]
    .filter((topic) => topic.studentCount > 0 && topic.totalFails > 0)
    .sort(
      (a, b) =>
        b.studentCount - a.studentCount ||
        b.totalFails - a.totalFails ||
        compareText(a.conceptTitle, b.conceptTitle) ||
        compareText(a.topicTitle, b.topicTitle) ||
        compareText(a.topicId, b.topicId)
    )

const rankMisconceptions = (misconceptions: ClassMisconception[]) =>
  [...misconceptions]
    .filter(
      (misconception) =>
        misconception.studentCount > 0 && misconception.totalCount > 0
    )
    .sort(
      (a, b) =>
        b.studentCount - a.studentCount ||
        b.totalCount - a.totalCount ||
        compareText(a.tag, b.tag)
    )

export const deriveClassIntervention = (
  insights: ClassInterventionInput
): ClassIntervention => {
  const memberCount = Math.max(0, Math.floor(insights.memberCount))
  const totalEvents = Math.max(0, Math.floor(insights.totalEvents))
  const failCount = Math.max(0, Math.floor(insights.failCount))

  if (memberCount === 0) {
    return {
      state: "empty-class",
      title: "Add students to build a class signal",
      description:
        "The radar only recommends a teaching move from aggregated class evidence.",
    }
  }

  if (totalEvents === 0) {
    return {
      state: "awaiting-evidence",
      title: "Waiting for check evidence",
      description:
        "A recommendation will appear after students complete lesson checks.",
    }
  }

  const topic = rankTopics(insights.struggleTopics)[0]
  if (!topic) {
    if (failCount > 0) {
      return {
        state: "unmapped-evidence",
        title: "No teachable topic signal yet",
        description:
          "Some checks were missed, but they are not attached to a shared topic. The radar will not guess.",
      }
    }

    return {
      state: "no-intervention",
      title: "No intervention signal right now",
      description:
        "Current checks do not show a shared struggle topic. Keep teaching and watch for new evidence.",
    }
  }

  const affectedStudents = Math.min(
    memberCount,
    Math.max(0, Math.floor(topic.studentCount))
  )
  const affectedPercent = Math.round((affectedStudents / memberCount) * 100)
  const totalFails = Math.max(0, Math.floor(topic.totalFails))
  const hasThinEvidence =
    memberCount < 3 ||
    affectedStudents < 2 ||
    totalEvents < Math.max(5, memberCount)
  const isRepeatedSharedNeed =
    !hasThinEvidence &&
    affectedPercent >= 50 &&
    totalFails >= affectedStudents * 2

  const signalLabel = hasThinEvidence
    ? "Early signal"
    : isRepeatedSharedNeed
      ? "Repeated shared need"
      : "Shared need"

  let action: string
  if (affectedStudents < 2) {
    action = `Keep the class sequence. Add a private check-in or one targeted practice item on ${topic.topicTitle}, then look for a second signal before changing whole-class instruction.`
  } else if (affectedPercent >= 50) {
    action = `Start the next lesson with a 10-minute re-teach of ${topic.topicTitle}. Model one worked example, then run one no-stakes check before moving on.`
  } else {
    action = `Use a 7-minute warm-up on ${topic.topicTitle}. Pair one worked example with a no-stakes check, then re-teach only if the pattern persists.`
  }

  return {
    state: "ready",
    topic,
    affectedStudents,
    affectedPercent,
    signalLabel,
    reason: `${affectedStudents} of ${memberCount} ${memberCount === 1 ? "student" : "students"} recorded ${totalFails} check ${totalFails === 1 ? "miss" : "misses"} on this topic. It ranks first by class reach, with repeated misses as the tie-breaker.`,
    action,
    watchFor: rankMisconceptions(insights.misconceptions)[0] ?? null,
  }
}
