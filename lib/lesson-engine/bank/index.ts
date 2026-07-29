import type {
  LessonBlock,
  LessonSession,
  LessonNextOutput,
} from "@/lib/ai/schemas/lesson-blocks"
import { getTopicContent } from "@/lib/lesson-engine/bank/content"
import {
  getBlueprint,
  getTopicSpec,
  toSessionTopics,
} from "@/lib/lesson-engine/curricula"
import type { LessonIntent } from "@/lib/lesson-engine/policy"
import { withShuffledQuizChoices } from "@/lib/lessons/quiz-quality"

export type {
  ConceptContentBank,
  ExplainVariant,
  PracticeVariant,
  QuizVariant,
  TopicContentPack,
} from "@/lib/lesson-engine/bank/content/variables"

let seq = 0
const nid = (prefix: string) => {
  seq += 1
  return `lesson-${prefix}-${Date.now().toString(36)}-${seq}`
}

const fingerprint = (parts: string[]) =>
  parts.join("|").toLowerCase().replace(/\s+/g, " ").slice(0, 160)

const pickUnused = <T extends { fingerprint: string }>(
  items: T[],
  used: Set<string>
): T | null => {
  for (const item of items) {
    if (!used.has(item.fingerprint)) return item
  }
  return null
}

/** Prefer unused content; if exhausted, reuse with a fresh fingerprint (no remediate loop). */
const pickUnusedOrReuse = <T extends { fingerprint: string }>(
  items: T[],
  used: Set<string>
): T | null => {
  if (items.length === 0) return null
  const fresh = pickUnused(items, used)
  if (fresh) return fresh
  const base = items[Math.floor(Math.random() * items.length)]!
  return {
    ...base,
    fingerprint: fingerprint([base.fingerprint, "reuse", String(Date.now())]),
  }
}

const markTopic = (
  session: LessonSession,
  topicId: string,
  status: LessonSession["topics"][number]["status"]
): LessonSession => ({
  ...session,
  topics: session.topics.map((topic) =>
    topic.id === topicId ? { ...topic, status } : topic
  ),
})

export const applyTopicHintsFromBlocks = (
  session: LessonSession,
  blocks: LessonBlock[]
): LessonSession => {
  let next = session
  for (const block of blocks) {
    if (!block.topicId) continue
    const topic = next.topics.find((item) => item.id === block.topicId)
    if (!topic) continue
    if (block.kind === "explain" && topic.status === "pending") {
      next = markTopic(next, block.topicId, "introduced")
    }
    if (
      (block.kind === "quiz" || block.kind === "practice") &&
      (topic.status === "pending" || topic.status === "introduced")
    ) {
      next = markTopic(next, block.topicId, "checking")
    }
  }
  return next
}

const fallbackExplain = (topicId: string, goal: string) => ({
  title: "Let's cover this",
  body: `${goal}

(Topic: \`${topicId}\`)`,
  fingerprint: fingerprint(["explain", topicId, "fallback", goal]),
})

export const buildBlocksForIntent = (
  intent: LessonIntent,
  session: LessonSession,
  topicId?: string
): LessonNextOutput => {
  const used = new Set(session.usedFingerprints)
  const topic =
    session.topics.find((item) => item.id === topicId) ??
    session.topics.find((item) => item.status !== "mastered")

  const pack = topic
    ? getTopicContent(session.conceptSlug, topic.id)
    : null
  const spec = topic
    ? getTopicSpec(session.conceptSlug, topic.id)
    : null

  const speak = (() => {
    switch (intent) {
      case "explain":
        return `Let's cover: ${topic?.title ?? "the next idea"}.`
      case "quiz":
        return session.pace === "fast"
          ? "Quick check — you've been moving fast."
          : "Quick check on what we just covered."
      case "practice":
        return "Try a tiny practice before we move on."
      case "remediate":
        return "No worries — I'll explain that bit another way."
      case "apply":
        return "You've got the building blocks. Time for one open challenge."
      case "complete":
        return "Lesson complete — nice work."
      default:
        return "Let's continue."
    }
  })()

  const blocks: LessonBlock[] = []

  if ((intent === "explain" || intent === "remediate") && topic) {
    const variants = (pack?.explains ?? []).map((variant) => ({
      ...variant,
      fingerprint: fingerprint([
        "explain",
        topic.id,
        variant.title,
        variant.body,
      ]),
    }))
    const picked =
      pickUnusedOrReuse(variants, used) ??
      (variants[0]
        ? {
            ...variants[0],
            fingerprint: fingerprint([
              "explain",
              topic.id,
              "retry",
              String(Date.now()),
            ]),
          }
        : fallbackExplain(topic.id, topic.teachingGoal))

    blocks.push({
      id: nid("explain"),
      kind: "explain",
      topicId: topic.id,
      fingerprint: picked.fingerprint,
      title: picked.title,
      body: picked.body,
    })
  }

  if (intent === "quiz" && topic) {
    const base = pack?.quizzes ?? []
    if (base.length === 0) {
      return buildBlocksForIntent("practice", session, topic.id)
    }
    const topicProgress = session.topics.find((item) => item.id === topic.id)
    const preferHard =
      (topicProgress?.failChecks ?? 0) > 0 || session.pace === "fast"
    const preferred = preferHard
      ? [...base].sort((a, b) =>
          a.difficulty === b.difficulty ? 0 : a.difficulty === "hard" ? -1 : 1
        )
      : base
    const variants = preferred.map((variant) => ({
      ...variant,
      fingerprint: fingerprint([
        "quiz",
        topic.id,
        variant.prompt,
        variant.correctId,
      ]),
    }))
    const picked = pickUnusedOrReuse(variants, used)
    if (!picked) {
      return buildBlocksForIntent("practice", session, topic.id)
    }
    blocks.push(
      withShuffledQuizChoices({
        id: nid("quiz"),
        kind: "quiz" as const,
        topicId: topic.id,
        fingerprint: picked.fingerprint,
        prompt: picked.prompt,
        code: picked.code,
        choices: picked.choices,
        correctId: picked.correctId,
        feedback: picked.feedback,
        difficulty: picked.difficulty,
      })
    )
  }

  if (intent === "practice" && topic) {
    const practices = pack?.practices ?? []
    const variants = practices.map((variant, index) => ({
      ...variant,
      fingerprint: fingerprint([
        "practice",
        topic.id,
        variant.mode,
        variant.prompt,
        String(index),
      ]),
    }))
    const picked = pickUnusedOrReuse(variants, used)
    if (!picked) {
      // Exhausted practices — quiz again instead of remediating forever.
      return buildBlocksForIntent("quiz", session, topic.id)
    }

    if (picked.mode === "fillBlank") {
      blocks.push({
        id: nid("practice"),
        kind: "practice",
        topicId: topic.id,
        fingerprint: picked.fingerprint,
        mode: "fillBlank",
        prompt: picked.prompt,
        template: picked.template,
        answers: picked.answers,
        placeholder: picked.placeholder,
        feedback: picked.feedback,
      })
    } else {
      blocks.push({
        id: nid("practice"),
        kind: "practice",
        topicId: topic.id,
        fingerprint: picked.fingerprint,
        mode: "miniEdit",
        prompt: picked.prompt,
        lines: picked.lines,
        starterCode: picked.starterCode,
        mustContain: picked.mustContain,
        mustNotContain: picked.mustNotContain,
        mustMatchAny: picked.mustMatchAny,
        feedback: picked.feedback,
      })
    }
  }

  if (intent === "apply") {
    const blueprint = getBlueprint(session.conceptSlug)
    const apply = blueprint?.apply
    blocks.push({
      id: nid("apply"),
      kind: "apply",
      fingerprint: fingerprint(["apply", session.conceptSlug]),
      title: apply?.title ?? "Application challenge",
      brief:
        apply?.brief ??
        "Use what you learned in one short program. Write it yourself — no full starter solution.",
      criteria: apply?.criteria ?? [
        "Uses variables",
        "Runs without errors",
        "Shows output with print",
      ],
      starterCode: "",
    })
  }

  if (intent === "complete") {
    blocks.push({
      id: nid("complete"),
      kind: "complete",
      title: "You're done",
      body: `Confidence ${session.confidence}%. Topics mastered: ${session.topics.filter((t) => t.status === "mastered").length}/${session.topics.length}.`,
    })
  }

  if (blocks.length === 0 && topic) {
    // Prefer explain using curriculum mustCover if bank missing
    if (spec && intent !== "complete" && intent !== "apply") {
      blocks.push({
        id: nid("explain"),
        kind: "explain",
        topicId: topic.id,
        fingerprint: fingerprint(["explain", topic.id, "spec", spec.teachingGoal]),
        title: topic.title,
        body: [
          spec.teachingGoal,
          "",
          ...spec.mustCover.map((point) => `- ${point}`),
          "",
          "Examples:",
          "",
          "```python",
          ...spec.examples,
          "```",
        ].join("\n"),
      })
    } else {
      return buildBlocksForIntent("explain", session, topic.id)
    }
  }

  if (blocks.length === 0) {
    blocks.push({
      id: nid("complete"),
      kind: "complete",
      title: "Caught up",
      body: "Nothing more to teach in this session.",
    })
  }

  return {
    speak,
    intent,
    topicId: topic?.id,
    reason: `${intent}:${topic?.id ?? "none"}:conf=${session.confidence}`,
    blocks,
  }
}

export const emptySessionFromBlueprint = (
  slug: string
): LessonSession | null => {
  const blueprint = getBlueprint(slug)
  if (!blueprint) return null
  return {
    version: 4,
    title: blueprint.title,
    objective: blueprint.objective,
    conceptSlug: blueprint.slug,
    topics: toSessionTopics(blueprint),
    confidence: 0,
    phase: "teach",
    pace: "steady",
    blocks: [],
    cursor: 0,
    events: [],
    usedFingerprints: [],
    analytics: [],
    applyPassed: false,
    turnCount: 0,
  }
}
