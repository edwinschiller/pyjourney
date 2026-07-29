import type {
  LessonEvent,
  LessonSession,
  TopicProgress,
} from "@/lib/ai/schemas/lesson-blocks"
import { effectiveMasteryChecks, getTopicSpec } from "@/lib/lesson-engine/curricula"

export type LessonIntent =
  | "explain"
  | "quiz"
  | "practice"
  | "remediate"
  | "apply"
  | "complete"

const clampConfidence = (value: number) =>
  Math.max(0, Math.min(100, Math.round(value)))

export const masteredCount = (topics: TopicProgress[]) =>
  topics.filter((topic) => topic.status === "mastered" && !topic.needsRecheck)
    .length

export const allTopicsMastered = (topics: TopicProgress[]) =>
  topics.length > 0 &&
  topics.every(
    (topic) => topic.status === "mastered" && !topic.needsRecheck
  )

export const nextPendingTopic = (topics: TopicProgress[]) =>
  topics.find(
    (topic) =>
      topic.status === "pending" ||
      topic.status === "introduced" ||
      topic.status === "checking"
  ) ?? null

export const topicNeedingRecheck = (topics: TopicProgress[]) =>
  topics.find((topic) => topic.needsRecheck) ?? null

export const strugglingTopic = (topics: TopicProgress[]) =>
  [...topics]
    .filter((topic) => topic.status !== "mastered")
    .sort((a, b) => b.failChecks - a.failChecks)[0] ?? null

/** Topic is mastered only with enough checks AND quiz+practice breadth. */
export const topicReadyToMaster = (
  topic: TopicProgress,
  conceptSlug: string
) => {
  const spec = getTopicSpec(conceptSlug, topic.id)
  const needed = effectiveMasteryChecks(spec?.masteryChecks, topic.failChecks)
  const quizNeeded = topic.failChecks > 0 ? 2 : Math.min(2, needed)
  const practiceNeeded = 1
  return (
    topic.correctChecks >= needed &&
    topic.quizPasses >= quizNeeded &&
    topic.practicePasses >= practiceNeeded
  )
}

/** Push a point into the analytics trail (kept on the lesson session). */
export const pushAnalytics = (
  session: LessonSession,
  note?: string
): LessonSession => ({
  ...session,
  analytics: [
    ...session.analytics,
    {
      at: new Date().toISOString(),
      confidence: session.confidence,
      phase: session.phase,
      topicsMastered: masteredCount(session.topics),
      topicsTotal: session.topics.length,
      note,
    },
  ].slice(-40),
})

export const applyEventToCoverage = (
  session: LessonSession,
  event: LessonEvent
): LessonSession => {
  const latency = event.latencyMs ?? 15_000
  let pace = session.pace
  if (latency < 8_000) pace = "fast"
  else if (latency > 25_000) pace = "slow"
  else if (session.pace === "fast" && latency > 12_000) pace = "steady"

  let confidence = session.confidence
  if (event.kind === "apply") {
    confidence = event.passed
      ? Math.max(confidence, 100)
      : clampConfidence(confidence - 5)
    return pushAnalytics(
      {
        ...session,
        pace,
        confidence,
        applyPassed: event.passed ? true : session.applyPassed,
        phase: event.passed ? "done" : session.phase,
        events: [...session.events, event],
      },
      event.passed ? "apply:pass" : "apply:fail"
    )
  }

  if (event.passed) {
    confidence += pace === "fast" ? 8 : 5
  } else {
    confidence -= pace === "slow" ? 10 : 8
  }
  confidence = clampConfidence(confidence)

  const topicId = event.topicId
  const topics = session.topics.map((topic) => {
    if (!topicId || topic.id !== topicId) return topic

    if (!event.passed) {
      // Wrong answer: wipe progress — must rebuild quiz + practice evidence.
      return {
        ...topic,
        failChecks: topic.failChecks + 1,
        correctChecks: 0,
        quizPasses: 0,
        practicePasses: 0,
        needsRecheck: true,
        status: "checking" as const,
      }
    }

    const quizPasses =
      event.kind === "quiz" ? topic.quizPasses + 1 : topic.quizPasses
    const practicePasses =
      event.kind === "practice"
        ? topic.practicePasses + 1
        : topic.practicePasses
    const correctChecks = topic.correctChecks + 1
    const updated: TopicProgress = {
      ...topic,
      correctChecks,
      quizPasses,
      practicePasses,
    }
    const ready = topicReadyToMaster(updated, session.conceptSlug)
    return {
      ...updated,
      needsRecheck: ready ? false : topic.needsRecheck || topic.failChecks > 0,
      status: ready ? ("mastered" as const) : ("checking" as const),
    }
  })

  let next: LessonSession = {
    ...session,
    pace,
    confidence,
    topics,
    events: [...session.events, event],
  }

  if (allTopicsMastered(topics) && confidence >= 85 && next.phase === "teach") {
    next = { ...next, phase: "apply", confidence: Math.max(next.confidence, 90) }
  }

  return pushAnalytics(
    next,
    event.passed ? `pass:${event.kind}` : `fail:${event.kind}`
  )
}

const nextCheckIntentForTopic = (
  session: LessonSession,
  topic: TopicProgress
): "quiz" | "practice" => {
  const quizNeeded = topic.failChecks > 0 ? 2 : 2
  if (topic.quizPasses < quizNeeded) return "quiz"
  if (topic.practicePasses < 1) return "practice"
  const last = [...session.events]
    .reverse()
    .find((event) => event.topicId === topic.id && event.passed)
  if (last?.kind === "quiz") return "practice"
  return "quiz"
}

/**
 * Decide the next coaching move from coverage + last result.
 * Failed topics always get remediate → then rebuild quiz+practice evidence.
 */
export const chooseLessonIntent = (
  session: LessonSession,
  options?: { struggleTopicIds?: string[] }
): {
  intent: LessonIntent
  topicId?: string
} => {
  if (session.phase === "done" || session.applyPassed) {
    return { intent: "complete" }
  }

  if (session.phase === "apply") {
    if (session.applyPassed) return { intent: "complete" }
    return { intent: "apply" }
  }

  const recheck = topicNeedingRecheck(session.topics)
  if (recheck) {
    const lastBlock = session.blocks.at(-1)
    const last = session.events.at(-1)
    // After a fail: explain first, then rebuild checks.
    if (last && !last.passed && last.topicId === recheck.id) {
      if (
        lastBlock &&
        lastBlock.topicId === recheck.id &&
        (lastBlock.kind === "explain" || lastBlock.kind === "practice")
      ) {
        return {
          intent: nextCheckIntentForTopic(session, recheck),
          topicId: recheck.id,
        }
      }
      return { intent: "remediate", topicId: recheck.id }
    }
    if (
      lastBlock &&
      lastBlock.topicId === recheck.id &&
      lastBlock.kind === "explain"
    ) {
      return {
        intent: nextCheckIntentForTopic(session, recheck),
        topicId: recheck.id,
      }
    }
    return {
      intent: nextCheckIntentForTopic(session, recheck),
      topicId: recheck.id,
    }
  }

  const last = session.events.at(-1)

  if (last && !last.passed && last.kind !== "apply") {
    const topic =
      (last.topicId &&
        session.topics.find((item) => item.id === last.topicId)) ||
      strugglingTopic(session.topics)
    const lastBlock = session.blocks.at(-1)
    if (
      lastBlock &&
      lastBlock.topicId === topic?.id &&
      (lastBlock.kind === "explain" || lastBlock.kind === "practice")
    ) {
      return {
        intent: topic
          ? nextCheckIntentForTopic(session, topic)
          : "quiz",
        topicId: topic?.id,
      }
    }
    return { intent: "remediate", topicId: topic?.id }
  }

  if (allTopicsMastered(session.topics) && session.confidence >= 85) {
    return { intent: "apply" }
  }

  const struggleSet = new Set(options?.struggleTopicIds ?? [])
  const memoryStruggle = session.topics.find(
    (topic) =>
      struggleSet.has(topic.id) &&
      topic.status !== "mastered" &&
      !topic.needsRecheck
  )

  const focus = memoryStruggle ?? nextPendingTopic(session.topics)
  if (!focus) {
    return { intent: "apply" }
  }

  if (focus.status === "pending") {
    return { intent: "explain", topicId: focus.id }
  }

  if (focus.status === "introduced") {
    return { intent: "quiz", topicId: focus.id }
  }

  // Checking: alternate quiz/practice until mastery breadth is met.
  if (focus.status === "checking") {
    return {
      intent: nextCheckIntentForTopic(session, focus),
      topicId: focus.id,
    }
  }

  if (session.pace === "fast" && focus.failChecks === 0) {
    return { intent: "practice", topicId: focus.id }
  }

  return { intent: "quiz", topicId: focus.id }
}
