import type { TopicProgress } from "@/lib/ai/schemas/lesson-blocks"
import { CONDITIONS_BLUEPRINT } from "@/lib/lesson-engine/curricula/conditions"
import { DATA_TYPES_BLUEPRINT } from "@/lib/lesson-engine/curricula/data_types"
import { DEBUGGING_BLUEPRINT } from "@/lib/lesson-engine/curricula/debugging"
import { FUNCTIONS_BLUEPRINT } from "@/lib/lesson-engine/curricula/functions"
import { LISTS_BLUEPRINT } from "@/lib/lesson-engine/curricula/lists"
import { LOOPS_BLUEPRINT } from "@/lib/lesson-engine/curricula/loops"
import { VARIABLES_BLUEPRINT } from "@/lib/lesson-engine/curricula/variables"
import {
  toSessionTopics,
  type LessonBlueprint,
  type TopicSpec,
} from "@/lib/lesson-engine/curricula/types"

export type { ApplySpec, LessonBlueprint, TopicSpec } from "@/lib/lesson-engine/curricula/types"
export { effectiveMasteryChecks, toSessionTopics } from "@/lib/lesson-engine/curricula/types"

/**
 * Registry of lesson blueprints keyed by concept slug.
 * Add new lessons as `curricula/<slug>.ts` and register here.
 */
export const BLUEPRINTS: Record<string, LessonBlueprint> = {
  variables: VARIABLES_BLUEPRINT,
  data_types: DATA_TYPES_BLUEPRINT,
  conditions: CONDITIONS_BLUEPRINT,
  loops: LOOPS_BLUEPRINT,
  functions: FUNCTIONS_BLUEPRINT,
  lists: LISTS_BLUEPRINT,
  debugging: DEBUGGING_BLUEPRINT,
}

export const getBlueprint = (slug: string): LessonBlueprint | null =>
  BLUEPRINTS[slug] ?? null

export const getCurriculum = (slug: string) => {
  const blueprint = getBlueprint(slug)
  return blueprint ? { blueprint } : null
}

export const getTopicSpec = (
  slug: string,
  topicId: string
): TopicSpec | null => {
  const blueprint = getBlueprint(slug)
  return blueprint?.topics.find((topic) => topic.id === topicId) ?? null
}

export const topicsFromBlueprint = (slug: string): TopicProgress[] | null => {
  const blueprint = getBlueprint(slug)
  if (!blueprint) return null
  return toSessionTopics(blueprint)
}

/** Prompt-friendly slice of a topic for OpenAI / debugging. */
export const topicTeachingBrief = (topic: TopicSpec) => ({
  id: topic.id,
  title: topic.title,
  teachingGoal: topic.teachingGoal,
  mustCover: topic.mustCover,
  misconceptions: topic.misconceptions,
  examples: topic.examples,
  checkIdeas: topic.checkIdeas,
  masteryChecks: topic.masteryChecks,
})
