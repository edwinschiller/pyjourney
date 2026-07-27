import { createOpenAI } from "@ai-sdk/openai"
import { generateText, Output } from "ai"

import {
  applyReviewSchema,
  parseLessonSession,
  pyjoNextOutputSchema,
  sessionTurnCount,
  type ApplyReview,
  type LessonEvent,
  type LessonSession,
  type PyjoNextOutput,
} from "@/lib/ai/schemas/lesson-blocks"
import {
  applyTopicHintsFromBlocks,
  buildBlocksForIntent,
  emptySessionFromBlueprint,
} from "@/lib/pyjo/bank"
import {
  getBlueprint,
  getTopicSpec,
  topicTeachingBrief,
} from "@/lib/pyjo/curricula"
import {
  applyEventToCoverage,
  choosePyjoIntent,
  pushAnalytics,
} from "@/lib/pyjo/policy"

const isAiConfigured = () => Boolean(process.env.OPENAI_API_KEY?.trim())

export type PyjoNextRequest = {
  session: LessonSession
  event?: LessonEvent
  bootstrap?: boolean
  /** Cross-lesson struggle topics (from learner memory rollups). */
  struggleTopicIds?: string[]
}

export type PyjoNextResult = {
  session: LessonSession
  output: PyjoNextOutput
  source: "openai" | "rules"
}

const appendBlocks = (
  session: LessonSession,
  blocks: LessonSession["blocks"]
) => {
  const ids = new Set(session.blocks.map((block) => block.id))
  const unique = blocks.filter((block) => !ids.has(block.id))
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
  output: PyjoNextOutput,
  source: "openai" | "rules"
): PyjoNextResult => {
  // Don't duplicate an apply/complete block that is already on the trail.
  const filtered = output.blocks.filter((block) => {
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

  if (filtered.length === 0) {
    const turns = sessionTurnCount(session) + 1
    return {
      session: {
        ...session,
        lastCoachSpeak: output.speak,
        turnCount: turns,
      },
      output: { ...output, blocks: [] },
      source,
    }
  }

  let next = appendBlocks(session, filtered)
  next = applyTopicHintsFromBlocks(next, filtered)
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
    cursor: Math.max(0, next.blocks.length - filtered.length),
  }
  next = pushAnalytics(next, `turn:${output.intent}:${source}`)
  return { session: next, output: { ...output, blocks: filtered }, source }
}

const runRules = (
  session: LessonSession,
  bootstrap: boolean,
  struggleTopicIds?: string[]
): PyjoNextResult => {
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

  const { intent, topicId } = choosePyjoIntent(session, { struggleTopicIds })
  const output = buildBlocksForIntent(intent, session, topicId)
  return finalizeTurn(session, output, "rules")
}

const runOpenAi = async (
  session: LessonSession,
  bootstrap: boolean,
  struggleTopicIds?: string[]
): Promise<PyjoNextResult | null> => {
  if (!isAiConfigured()) return null

  const { intent, topicId } = bootstrap
    ? { intent: "explain" as const, topicId: session.topics[0]?.id }
    : choosePyjoIntent(session, { struggleTopicIds })

  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const modelId = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini"
  const focus = session.topics.find((topic) => topic.id === topicId)
  const topicSpec =
    topicId != null ? getTopicSpec(session.conceptSlug, topicId) : null
  const blueprint = getBlueprint(session.conceptSlug)

  try {
    const result = await generateText({
      model: openai(modelId),
      output: Output.object({ schema: pyjoNextOutputSchema }),
      system: `You are the PyJourney lesson engine. Fill block SLOTS only — do not invent new curriculum topics.
Allowed kinds: explain (body markdown; put code in \`\`\`python fences), quiz (prompt, choices, correctId), practice, apply (open task + criteria, empty starterCode), complete.
Cover mustCover points for the focus topic. Address misconceptions when remediating.
Respect suggested intent and topicId. Never repeat usedFingerprints. English, short speak.
For apply: use the lesson apply criteria only, NO full solution code.`,
      prompt: JSON.stringify({
        bootstrap,
        suggestedIntent: bootstrap ? "explain" : intent,
        topicId,
        topicProgress: focus,
        topicCurriculum: topicSpec ? topicTeachingBrief(topicSpec) : null,
        objective: session.objective,
        apply: blueprint?.apply ?? null,
        confidence: session.confidence,
        phase: session.phase,
        pace: session.pace,
        topics: session.topics,
        struggleTopicIds: struggleTopicIds ?? [],
        usedFingerprints: session.usedFingerprints.slice(-30),
        recentEvents: session.events.slice(-6),
      }),
    })

    const output = result.output
    if (!output?.blocks?.length) return null
    return finalizeTurn(session, output, "openai")
  } catch (error) {
    console.error("Lesson next (OpenAI) failed", error)
    return null
  }
}

export const runPyjoNext = async (
  request: PyjoNextRequest
): Promise<PyjoNextResult> => {
  let session = parseLessonSession(request.session)

  if (request.event) {
    session = applyEventToCoverage(session, request.event)
  }

  const bootstrap = Boolean(request.bootstrap) || session.blocks.length === 0
  const struggleTopicIds = request.struggleTopicIds
  // Bootstrap always uses the rules path so every lesson starts explain → quiz.
  if (bootstrap) return runRules(session, true, struggleTopicIds)

  const ai = await runOpenAi(session, false, struggleTopicIds)
  if (ai) return ai
  return runRules(session, false, struggleTopicIds)
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
        output: Output.object({ schema: applyReviewSchema }),
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
        return { review: result.output, source: "openai" }
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

export const hasPyjoLessonForSlug = (slug: string) =>
  Boolean(emptySessionFromBlueprint(slug))
