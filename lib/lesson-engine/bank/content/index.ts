import { CONDITIONS_CONTENT } from "@/lib/lesson-engine/bank/content/conditions"
import { DATA_TYPES_CONTENT } from "@/lib/lesson-engine/bank/content/data_types"
import { DEBUGGING_CONTENT } from "@/lib/lesson-engine/bank/content/debugging"
import { FUNCTIONS_CONTENT } from "@/lib/lesson-engine/bank/content/functions"
import { LISTS_CONTENT } from "@/lib/lesson-engine/bank/content/lists"
import { LOOPS_CONTENT } from "@/lib/lesson-engine/bank/content/loops"
import { VARIABLES_CONTENT } from "@/lib/lesson-engine/bank/content/variables"
import type { TopicContentPack } from "@/lib/lesson-engine/bank/content/variables"

const BANKS: Record<string, Record<string, TopicContentPack>> = {
  variables: VARIABLES_CONTENT,
  data_types: DATA_TYPES_CONTENT,
  conditions: CONDITIONS_CONTENT,
  loops: LOOPS_CONTENT,
  functions: FUNCTIONS_CONTENT,
  lists: LISTS_CONTENT,
  debugging: DEBUGGING_CONTENT,
}

export const getTopicContent = (
  conceptSlug: string,
  topicId: string
): TopicContentPack | null => BANKS[conceptSlug]?.[topicId] ?? null

export type { TopicContentPack } from "@/lib/lesson-engine/bank/content/variables"
