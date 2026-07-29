import { getTopicSpec } from "@/lib/lesson-engine/curricula"

/** Pick a stable struggle label for a failed topic check. */
export const resolveMisconceptionTag = (input: {
  conceptSlug?: string | null
  topicId?: string | null
  fallbackSignal?: string
}) => {
  const { conceptSlug, topicId, fallbackSignal } = input
  if (!conceptSlug || !topicId) {
    return fallbackSignal ?? null
  }

  const spec = getTopicSpec(conceptSlug, topicId)
  const first = spec?.misconceptions[0]?.trim()
  if (first) return first.slice(0, 160)

  if (spec?.title) return `Struggle: ${spec.title}`
  return `topic:${topicId}`
}

export const sourceFromBlockKind = (
  kind: string
): "quiz" | "practice" | "apply" | null => {
  if (kind === "quiz") return "quiz"
  if (kind === "practice") return "practice"
  if (kind === "apply") return "apply"
  return null
}
