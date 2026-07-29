import { createOpenAI } from "@ai-sdk/openai"
import { generateText, Output } from "ai"

import {
  applyReviewAiSchema,
  coerceApplyReview,
  coerceLessonNextOutput,
  lessonNextAiOutputSchema,
  parseLessonSession,
  sessionTurnCount,
  type ApplyReview,
  type LessonEvent,
  type LessonSession,
  type LessonNextOutput,
} from "@/lib/ai/schemas/lesson-blocks"
import {
  applyTopicHintsFromBlocks,
  buildBlocksForIntent,
  emptySessionFromBlueprint,
} from "@/lib/lesson-engine/bank"
import { getTopicContent } from "@/lib/lesson-engine/bank/content"
import {
  getBlueprint,
  getTopicSpec,
  topicTeachingBrief,
} from "@/lib/lesson-engine/curricula"
import {
  applyEventToCoverage,
  chooseLessonIntent,
  nextPendingTopic,
  pushAnalytics,
  topicNeedingRecheck,
} from "@/lib/lesson-engine/policy"
import { isUsableQuizBlock } from "@/lib/lessons/quiz-quality"
import {
  expandCollapsedPython,
  normalizeMarkdownFences,
} from "@/lib/markdown/fences"

const isAiConfigured = () => Boolean(process.env.OPENAI_API_KEY?.trim())

export type LessonNextRequest = {
  session: LessonSession
  event?: LessonEvent
  bootstrap?: boolean
  /** Cross-lesson struggle topics (from learner memory rollups). */
  struggleTopicIds?: string[]
}

export type LessonNextResult = {
  session: LessonSession
  output: LessonNextOutput
  source: "openai" | "rules"
}

const isUsableLessonBlock = (block: LessonSession["blocks"][number]) => {
  if (block.kind === "practice" && block.mode === "miniEdit") {
    const lines = (block.lines ?? []).map((line) => line.trim()).filter(Boolean)
    const hasMust = (block.mustContain ?? []).some((item) => item.trim())
    if (lines.length === 0 && !hasMust) return false
    if (lines.length > 4) return false
    if (/accomplishes the following|write a (complete )?program/i.test(block.prompt)) {
      return false
    }
    if ((block.starterCode ?? "").split("\n").length > 12) return false
    return true
  }
  if (block.kind === "apply") {
    return block.brief.trim().length > 0 && block.criteria.length >= 2
  }
  if (block.kind === "explain") {
    return block.body.trim().length > 0
  }
  if (block.kind === "quiz") {
    return isUsableQuizBlock(block)
  }
  return true
}

const normalizeStoredBlock = (
  block: LessonSession["blocks"][number]
): LessonSession["blocks"][number] => {
  if (block.kind === "explain" || block.kind === "complete") {
    return { ...block, body: normalizeMarkdownFences(block.body) }
  }
  if (block.kind === "quiz" && block.code) {
    return { ...block, code: expandCollapsedPython(block.code) }
  }
  return block
}

export const healSessionBlocks = (session: LessonSession): LessonSession => {
  const blocks = session.blocks
    .filter(isUsableLessonBlock)
    .map(normalizeStoredBlock)
  const unchanged =
    blocks.length === session.blocks.length &&
    blocks.every((block, index) => block === session.blocks[index])
  if (unchanged) return session
  return {
    ...session,
    blocks,
    cursor: Math.max(0, Math.min(session.cursor, Math.max(blocks.length - 1, 0))),
  }
}

const appendBlocks = (
  session: LessonSession,
  blocks: LessonSession["blocks"]
) => {
  const ids = new Set(session.blocks.map((block) => block.id))
  // Remint colliding ids so OpenAI/rules never silently drop a new step.
  const unique = blocks.map((block, index) => {
    if (!ids.has(block.id)) {
      ids.add(block.id)
      return block
    }
    const freshId = `lesson-${block.kind}-${Date.now().toString(36)}-${index}`
    ids.add(freshId)
    return { ...block, id: freshId }
  })
  const fingerprints = [
    ...session.usedFingerprints,
    ...unique
      .map((block) => block.fingerprint)
      .filter((value): value is string => Boolean(value)),
  ]
  return {
    ...session,
    blocks: [...session.blocks, ...unique],
    usedFingerprints: fingerprints,
  }
}

const finalizeTurn = (
  session: LessonSession,
  output: LessonNextOutput,
  source: "openai" | "rules"
): LessonNextResult => {
  // Don't duplicate an apply/complete block that is already on the trail.
  const filtered = output.blocks.filter((block) => {
    if (!isUsableLessonBlock(block)) return false
    if (block.kind === "apply" && session.blocks.some((b) => b.kind === "apply")) {
      return false
    }
    if (
      block.kind === "complete" &&
      session.blocks.some((b) => b.kind === "complete")
    ) {
      return false
    }
    return true
  })

  const previousLength = session.blocks.length
  let next = appendBlocks(session, filtered)
  const addedCount = next.blocks.length - previousLength

  // Nothing new on the trail (filtered empty, or all ids already present).
  if (addedCount === 0) {
    return {
      session: {
        ...session,
        lastCoachSpeak: output.speak,
        turnCount: sessionTurnCount(session) + 1,
      },
      output: { ...output, blocks: [] },
      source,
    }
  }

  const added = next.blocks.slice(previousLength)
  next = applyTopicHintsFromBlocks(next, added)
  if (output.intent === "apply") {
    next = { ...next, phase: "apply" }
  }
  if (output.intent === "complete" && session.applyPassed) {
    next = { ...next, phase: "done" }
  }
  next = {
    ...next,
    turnCount: sessionTurnCount(next) + 1,
    lastCoachSpeak: output.speak,
    // Always land on the first newly appended block.
    cursor: previousLength,
  }
  next = pushAnalytics(next, `turn:${output.intent}:${source}`)
  return { session: next, output: { ...output, blocks: added }, source }
}

const runRules = (
  session: LessonSession,
  bootstrap: boolean,
  struggleTopicIds?: string[]
): LessonNextResult => {
  if (bootstrap || sessionTurnCount(session) === 0) {
    const firstTopic = session.topics[0]
    const explain = buildBlocksForIntent("explain", session, firstTopic?.id)
    // Bootstrap = explain + quiz in one turn
    const afterExplain = appendBlocks(session, explain.blocks)
    const withHints = applyTopicHintsFromBlocks(afterExplain, explain.blocks)
    const quiz = buildBlocksForIntent(
      "quiz",
      withHints,
      firstTopic?.id
    )
    const merged = {
      speak: `${explain.speak} Then a quick check.`,
      intent: "quiz" as const,
      topicId: firstTopic?.id,
      reason: "bootstrap:explain+quiz",
      blocks: [...explain.blocks, ...quiz.blocks],
    }
    return finalizeTurn(session, merged, "rules")
  }

  const { intent, topicId } = chooseLessonIntent(session, { struggleTopicIds })
  const output = buildBlocksForIntent(intent, session, topicId)
  return finalizeTurn(session, output, "rules")
}

const runOpenAi = async (
  session: LessonSession,
  bootstrap: boolean,
  struggleTopicIds?: string[]
): Promise<LessonNextResult | null> => {
  if (!isAiConfigured()) return null

  const { intent, topicId } = bootstrap
    ? { intent: "explain" as const, topicId: session.topics[0]?.id }
    : chooseLessonIntent(session, { struggleTopicIds })

  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const modelId = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini"
  const focus = session.topics.find((topic) => topic.id === topicId)
  const topicSpec =
    topicId != null ? getTopicSpec(session.conceptSlug, topicId) : null
  const blueprint = getBlueprint(session.conceptSlug)
  const topicPack =
    topicId != null ? getTopicContent(session.conceptSlug, topicId) : null

  const struggleDetails = (struggleTopicIds ?? [])
    .map((id) => {
      const progress = session.topics.find((topic) => topic.id === id)
      const spec = getTopicSpec(session.conceptSlug, id)
      if (!progress && !spec) return null
      return {
        topicId: id,
        title: progress?.title ?? spec?.title ?? id,
        failChecks: progress?.failChecks ?? 0,
        needsRecheck: progress?.needsRecheck ?? false,
        misconceptions: spec?.misconceptions ?? [],
        teachingGoal: spec?.teachingGoal ?? progress?.teachingGoal ?? null,
      }
    })
    .filter(Boolean)

  const recentFails = session.events
    .filter((event) => !event.passed)
    .slice(-5)
    .map((event) => ({
      kind: event.kind,
      topicId: event.topicId ?? null,
      attempts: event.attempts ?? null,
    }))

  const practiceStyleExamples = (topicPack?.practices ?? [])
    .filter((item) => item.mode === "miniEdit")
    .slice(0, 2)
    .map((item) => ({
      prompt: item.prompt,
      lines: item.lines,
      starterCode: item.starterCode,
      mustContain: item.mustContain,
    }))

  const quizStyleExamples = (topicPack?.quizzes ?? []).slice(0, 2).map((item) => ({
    prompt: item.prompt,
    choices: item.choices,
    correctId: item.correctId,
    code: item.code,
  }))

  try {
    const result = await generateText({
      model: openai(modelId),
      output: Output.object({ schema: lessonNextAiOutputSchema }),
      system: `You are the PyJourney lesson engine. Fill block SLOTS only — do not invent new curriculum topics.

SIZE RULES (critical):
- practice miniEdit = TINY. One small edit to short starterCode (usually 2–6 lines). Prompt is one concrete sentence. lines = 2–3 short bullets. mustContain = 1–3 short substrings.
- NEVER turn practice into a full project (no grade-band / multi-branch design / "write a complete program that accomplishes…"). That scope is ONLY for apply.
- apply = ONLY when suggestedIntent is apply. Copy the provided apply.title/brief/criteria — do not invent a bigger challenge.
- quiz = ONE concrete question the learner can answer without guessing. Prompt MUST state what is being asked (e.g. "Which operator checks equality?" or "What does this print?"). FORBIDDEN prompts: "Choose the correct answer", "Select the right option", or any prompt that only says to pick without naming the concept/code.
- quiz choices must be meaningful alternatives; include a code snippet in \`code\` when the question is about output/behavior. Use Python operators only (!= not !==). Vary which choice is correct — do NOT always put the right answer first.
- explain = short markdown teaching the focus topic (mustCover + examples).
- For explain code samples: ALWAYS use a real multi-line fenced block on its own lines, never a single-line fence. Example:
\`\`\`python
age = 18
if age < 18:
    print("minor")
elif age == 18:
    print("just adult")
else:
    print("adult")
\`\`\`
  Do not write \`\`\`python age = 18 if age…\`\`\` on one line. Prefer short inline \`code\` for single tokens.

Struggle targeting:
- When remediating or the learner is struggling, address listed misconceptions and recentFails for that topic.
- Prefer practice/quiz that probes the failing idea, not a new unrelated challenge.

Style:
- Match practiceStyleExamples and quizStyleExamples closely (tone, length, how questions are worded).
- English, short speak. Never repeat usedFingerprints.
- practice fillBlank: template must include ___ and answers must be set.
- For apply: empty starterCode, NO full solution.`,
      prompt: JSON.stringify({
        bootstrap,
        suggestedIntent: bootstrap ? "explain" : intent,
        topicId,
        topicProgress: focus,
        topicCurriculum: topicSpec ? topicTeachingBrief(topicSpec) : null,
        practiceStyleExamples,
        quizStyleExamples,
        applyReference: blueprint?.apply
          ? {
              title: blueprint.apply.title,
              brief: blueprint.apply.brief,
              criteria: blueprint.apply.criteria,
              note: "Final challenge only — do NOT use this size for practice blocks.",
            }
          : null,
        objective: session.objective,
        confidence: session.confidence,
        phase: session.phase,
        pace: session.pace,
        topics: session.topics,
        struggleTopicIds: struggleTopicIds ?? [],
        struggleDetails,
        recentFails,
        usedFingerprints: session.usedFingerprints.slice(-30),
        recentEvents: session.events.slice(-6),
      }),
    })

    const raw = result.output
    if (!raw?.blocks?.length) return null
    const output = coerceLessonNextOutput(raw)
    return finalizeTurn(session, output, "openai")
  } catch (error) {
    console.error("Lesson next (OpenAI) failed", error)
    return null
  }
}

export const runLessonNext = async (
  request: LessonNextRequest
): Promise<LessonNextResult> => {
  let session = healSessionBlocks(parseLessonSession(request.session))

  if (request.event) {
    session = applyEventToCoverage(session, request.event)
  }

  const bootstrap = Boolean(request.bootstrap) || session.blocks.length === 0
  const struggleTopicIds = request.struggleTopicIds
  // Bootstrap always uses the rules path so every lesson starts explain → quiz.
  if (bootstrap) return runRules(session, true, struggleTopicIds)

  const ai = await runOpenAi(session, false, struggleTopicIds)
  // Empty trail advance (filtered/dupes) must fall through to rules — otherwise
  // the player finishes "loading" and stays on the same last step.
  if (ai && ai.output.blocks.length > 0) return ai

  const rules = runRules(session, false, struggleTopicIds)
  if (rules.output.blocks.length > 0) return rules

  // Last resort: always append a usable explain so Continue never no-ops.
  const topic =
    nextPendingTopic(session.topics) ??
    topicNeedingRecheck(session.topics) ??
    session.topics.find((item) => item.status !== "mastered") ??
    session.topics[0]
  const forced = buildBlocksForIntent("explain", session, topic?.id)
  const forcedResult = finalizeTurn(session, forced, "rules")
  if (forcedResult.output.blocks.length > 0) return forcedResult

  // Absolute fallback — mint a tiny explain even if bank/curriculum is empty.
  return finalizeTurn(
    session,
    {
      speak: "Let's keep going with a short recap.",
      intent: "explain",
      topicId: topic?.id,
      reason: "forced-fallback-explain",
      blocks: [
        {
          id: `lesson-explain-fallback-${Date.now().toString(36)}`,
          kind: "explain",
          topicId: topic?.id,
          title: topic?.title ?? "Keep going",
          body:
            topic?.teachingGoal ??
            "Review the last idea, then continue when you are ready.",
        },
      ],
    },
    "rules"
  )
}

const reviewVariablesApply = (input: {
  code: string
  stderr?: string
  criteria: string[]
}): ApplyReview => {
  const code = input.code
  const hasString = /=\s*["']/.test(code)
  const hasInt = /=\s*-?\d+(?!\.)\b/.test(code)
  const hasFloat = /=\s*-?\d+\.\d+/.test(code)
  const hasBool = /=\s*(True|False)\b/.test(code)
  const distinctTypes = [hasString, hasInt, hasFloat, hasBool].filter(
    Boolean
  ).length

  const hasPrint = /print\s*\(/.test(code)
  const hasFString = /print\s*\(\s*f["']/.test(code)
  const hasCommaMix =
    /print\s*\([^)]*,[^)]*\)/.test(code) &&
    (hasString || /["']/.test(code)) &&
    (hasInt || hasFloat || /\b\d+\b/.test(code))
  const hasPlusStr =
    /\+\s*str\s*\(/.test(code) || /str\s*\([^)]*\)\s*\+/.test(code)
  const combined = hasFString || hasCommaMix || hasPlusStr
  const noStderr = !input.stderr?.trim()
  const assignCount = (code.match(/^\s*[A-Za-z_]\w*\s*=/gm) ?? []).length

  const results = [
    {
      criterion: input.criteria[0] ?? "Three variables, three types",
      met: assignCount >= 3 && distinctTypes >= 3,
      note:
        assignCount >= 3 && distinctTypes >= 3
          ? undefined
          : "Need ≥3 variables across ≥3 of str / int / float / bool.",
    },
    {
      criterion: input.criteria[1] ?? "Strings quoted",
      met: hasString,
      note: hasString ? undefined : "Store text with quotes, e.g. name = \"Ada\".",
    },
    {
      criterion: input.criteria[2] ?? "Combined sentence",
      met: combined,
      note: combined
        ? undefined
        : 'Use print(name, "is", age) or print(f"{name} is {age}").',
    },
    {
      criterion: input.criteria[3] ?? "Print other values",
      met: hasPrint && (code.match(/print\s*\(/g) ?? []).length >= 2,
      note:
        hasPrint && (code.match(/print\s*\(/g) ?? []).length >= 2
          ? undefined
          : "Print the combined sentence and the other values too.",
    },
    {
      criterion: input.criteria[4] ?? "Runs cleanly",
      met: noStderr,
      note: noStderr ? undefined : "Fix the runtime/syntax error first.",
    },
  ]

  const passed = results.every((row) => row.met)
  return {
    passed,
    speak: passed
      ? "That hits the criteria — great mix of types and combined output."
      : "Not quite yet — check the criteria list and tweak your program.",
    criteriaResults: results,
  }
}

const reviewDataTypesApply = (input: {
  code: string
  stderr?: string
  criteria: string[]
}): ApplyReview => {
  const code = input.code
  const hasInt = /=\s*-?\d+(?!\.)\b/.test(code)
  const hasFloat = /=\s*-?\d+\.\d+/.test(code)
  const hasString = /=\s*["']/.test(code)
  const hasBool = /=\s*(True|False)\b/.test(code)
  const hasNone = /=\s*None\b/.test(code)
  const typeCalls = (code.match(/\btype\s*\(/g) ?? []).length
  const castsDigitString =
    /(?:int|float)\s*\(\s*["']\d+(?:\.\d+)?["']\s*\)/.test(code) ||
    /(?:int|float)\s*\(\s*[A-Za-z_]\w*\s*\)/.test(code)
  const hasAdvancedOp = /\/{2}|\*\*|%/.test(code)
  const unsafeConcat = /["'][^"']*["']\s*\+\s*[A-Za-z_]\w*(?!\s*\()/.test(
    code
  )
  const safeMixedPrint =
    /print\s*\(\s*f["']/.test(code) ||
    /print\s*\([^)]*,/.test(code) ||
    /\bstr\s*\(/.test(code) ||
    !unsafeConcat
  const noStderr = !input.stderr?.trim()
  const hasPrint = /print\s*\(/.test(code)

  const results = [
    {
      criterion: input.criteria[0] ?? "int, float, str, bool, None",
      met: hasInt && hasFloat && hasString && hasBool && hasNone,
      note:
        hasInt && hasFloat && hasString && hasBool && hasNone
          ? undefined
          : "Include variables for int, float, str, bool, and None.",
    },
    {
      criterion: input.criteria[1] ?? "type() twice",
      met: typeCalls >= 2,
      note: typeCalls >= 2 ? undefined : "Call type(...) at least twice.",
    },
    {
      criterion: input.criteria[2] ?? "Convert digit-string",
      met: castsDigitString,
      note: castsDigitString
        ? undefined
        : 'Convert a digit string with int("12") / float(...) or int(raw).',
    },
    {
      criterion: input.criteria[3] ?? "Use //, %, or **",
      met: hasAdvancedOp,
      note: hasAdvancedOp
        ? undefined
        : "Use at least one of //, %, or ** in your arithmetic.",
    },
    {
      criterion: input.criteria[4] ?? "Safe mixed output",
      met: hasPrint && safeMixedPrint,
      note:
        hasPrint && safeMixedPrint
          ? undefined
          : 'Print with f-strings, commas, or str() — avoid "text" + number.',
    },
    {
      criterion: input.criteria[5] ?? "Runs cleanly",
      met: noStderr,
      note: noStderr ? undefined : "Fix the runtime/syntax error first.",
    },
  ]

  const passed = results.every((row) => row.met)
  return {
    passed,
    speak: passed
      ? "Solid number lab — types, conversions, and arithmetic look good."
      : "Close — check each criterion and tighten the types/conversions.",
    criteriaResults: results,
  }
}

const reviewApplyWithRules = (input: {
  session: LessonSession
  code: string
  stderr?: string
  criteria: string[]
}): ApplyReview => {
  if (input.session.conceptSlug === "data_types") {
    return reviewDataTypesApply(input)
  }
  return reviewVariablesApply(input)
}

export const reviewApplySubmission = async (input: {
  session: LessonSession
  code: string
  stdout?: string
  stderr?: string
}): Promise<{ review: ApplyReview; source: "openai" | "rules" }> => {
  const apply = [...input.session.blocks]
    .reverse()
    .find((block) => block.kind === "apply")

  const blueprint = getBlueprint(input.session.conceptSlug)
  const criteria =
    apply && apply.kind === "apply"
      ? apply.criteria
      : (blueprint?.apply.criteria ?? [
          "Uses variables",
          "Prints output",
          "Runs without errors",
        ])

  if (isAiConfigured()) {
    try {
      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const modelId = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini"
      const result = await generateText({
        model: openai(modelId),
        output: Output.object({ schema: applyReviewAiSchema }),
        system: `You are reviewing a student Python solution for PyJourney against criteria.
Be fair: pass if criteria are essentially met. Do not demand a specific variable name unless stated.
Follow evaluationGuide strictly when provided. Return passed=true only if every criterion is met.`,
        prompt: JSON.stringify({
          objective: input.session.objective,
          criteria,
          evaluationGuide: blueprint?.apply.evaluationGuide ?? null,
          hints: blueprint?.apply.hints ?? [],
          code: input.code,
          stdout: input.stdout ?? "",
          stderr: input.stderr ?? "",
        }),
      })
      if (result.output) {
        return { review: coerceApplyReview(result.output), source: "openai" }
      }
    } catch (error) {
      console.error("Apply review failed", error)
    }
  }

  return {
    source: "rules",
    review: reviewApplyWithRules({
      session: input.session,
      code: input.code,
      stderr: input.stderr,
      criteria,
    }),
  }
}

export const createInitialSessionForSlug = (slug: string) =>
  emptySessionFromBlueprint(slug)

export const hasLessonForSlug = (slug: string) =>
  Boolean(emptySessionFromBlueprint(slug))
