import type {
  LessonBlock,
  LessonEvent,
  LessonSession,
  TopicProgress,
} from "@/lib/ai/schemas/lesson-blocks"
import { effectiveMasteryChecks } from "@/lib/lesson-engine/curricula/types"

export type StepEvidence = {
  label: "Learn" | "Revisit" | "Quick check" | "Practice" | "Apply" | "Complete"
  summary: string
  facts: string[]
  misconception?: string
  tone: "default" | "attention" | "success"
  defaultOpen: boolean
}

export type TopicEvidenceContext = {
  masteryChecks?: number
  misconception?: string
}

type StepEvidenceInput = {
  block: LessonBlock
  session: LessonSession
  stepIndex: number
  topicEvidence?: Record<string, TopicEvidenceContext>
}

const checkLabel = (kind: string) => {
  if (kind === "quiz") return "quiz"
  if (kind === "practice") return "practice"
  return "check"
}

const responseFromEvent = (event: LessonEvent) => {
  if (event.passed || !event.detail || typeof event.detail !== "object") {
    return null
  }
  if (Array.isArray(event.detail)) return null

  const response = Reflect.get(event.detail, "response")
  if (typeof response !== "string") return null

  const compact = response.trim().replace(/\s+/g, " ")
  if (!compact) return null
  return compact.length > 88 ? `${compact.slice(0, 85)}…` : compact
}

const relevantFailure = (
  session: LessonSession,
  block: LessonBlock,
  stepIndex: number
) => {
  if (!block.topicId) return null

  const blockIndexes = new Map(
    session.blocks.map((sessionBlock, index) => [sessionBlock.id, index])
  )

  return (
    [...session.events].reverse().find((event) => {
      const sourceIndex = blockIndexes.get(event.blockId)
      return (
        !event.passed &&
        event.topicId === block.topicId &&
        sourceIndex !== undefined &&
        sourceIndex < stepIndex
      )
    }) ?? null
  )
}

const topicFacts = (
  topic: TopicProgress,
  session: LessonSession,
  failure: LessonEvent | null,
  masteryChecks?: number
) => {
  const requiredChecks = effectiveMasteryChecks(
    masteryChecks,
    topic.failChecks
  )
  const facts: string[] = []

  if (failure) {
    const attempt =
      failure.attempts && failure.attempts > 0
        ? ` on attempt ${failure.attempts}`
        : ""
    facts.push(
      `The latest ${checkLabel(failure.kind)} on “${topic.title}” did not pass${attempt}.`
    )

    const response = responseFromEvent(failure)
    if (response) facts.push(`Your submitted response was “${response}”.`)
  }

  facts.push(
    `${topic.correctChecks}/${requiredChecks} successful checks · ${topic.quizPasses}/2 quiz · ${topic.practicePasses}/1 practice`
  )

  if (failure) {
    facts.push(
      "After a miss, PyJourney asks for fresh quiz and practice evidence before marking the topic understood."
    )
  } else if (session.pace === "fast" && topic.failChecks === 0) {
    facts.push("Recent checks were quick, so the lesson can keep the pace brisk.")
  }

  return facts
}

export const buildStepEvidence = ({
  block,
  session,
  stepIndex,
  topicEvidence = {},
}: StepEvidenceInput): StepEvidence => {
  const topic = block.topicId
    ? session.topics.find((item) => item.id === block.topicId)
    : null
  const failure = topic
    ? relevantFailure(session, block, stepIndex)
    : null
  const topicContext = topic ? topicEvidence[topic.id] : undefined
  const misconception = failure ? topicContext?.misconception : undefined

  if (block.kind === "apply") {
    const mastered = session.topics.filter(
      (item) => item.status === "mastered" && !item.needsRecheck
    ).length
    return {
      label: "Apply",
      summary:
        "The topic checks are ready. This open challenge tests whether you can combine them without a prescribed solution.",
      facts: [
        `${mastered}/${session.topics.length} topics have the required learning evidence.`,
        `Current confidence is ${session.confidence}%; this challenge adds real application evidence.`,
      ],
      tone: "success",
      defaultOpen: false,
    }
  }

  if (block.kind === "complete") {
    return {
      label: "Complete",
      summary:
        "Your checks and application are complete, so the lesson can close with a recorded result.",
      facts: [
        `${session.topics.filter((item) => item.status === "mastered" && !item.needsRecheck).length}/${session.topics.length} topics understood.`,
        `Final lesson confidence: ${session.confidence}%.`,
      ],
      tone: "success",
      defaultOpen: false,
    }
  }

  if (!topic) {
    return {
      label: block.kind === "practice" ? "Practice" : "Learn",
      summary: "This step continues the current lesson objective.",
      facts: [`Lesson objective: ${session.objective}`],
      tone: "default",
      defaultOpen: false,
    }
  }

  const facts = topicFacts(
    topic,
    session,
    failure,
    topicContext?.masteryChecks
  )

  if (block.kind === "explain" && failure) {
    return {
      label: "Revisit",
      summary: `Your previous ${checkLabel(failure.kind)} showed that “${topic.title}” needs another angle before the next check.`,
      facts,
      misconception,
      tone: "attention",
      defaultOpen: true,
    }
  }

  if (block.kind === "quiz") {
    return {
      label: "Quick check",
      summary: failure
        ? `A fresh question checks whether “${topic.title}” is clear after the revisit.`
        : `You have seen “${topic.title}”. A short question now adds evidence before hands-on practice.`,
      facts,
      misconception,
      tone: failure ? "attention" : "default",
      defaultOpen: Boolean(failure),
    }
  }

  if (block.kind === "practice") {
    return {
      label: "Practice",
      summary: failure
        ? `This hands-on step rebuilds practical evidence for “${topic.title}” after the earlier miss.`
        : `A hands-on step checks that you can use “${topic.title}”, not only recognize it.`,
      facts,
      misconception,
      tone: failure ? "attention" : "default",
      defaultOpen: Boolean(failure),
    }
  }

  return {
    label: "Learn",
    summary: `“${topic.title}” is the next uncovered learning goal, so PyJourney introduces it before asking you to use it.`,
    facts,
    tone: "default",
    defaultOpen: false,
  }
}
