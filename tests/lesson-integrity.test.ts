import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { LessonSession } from "@/lib/ai/schemas/lesson-blocks"
import {
  assertLessonCompletable,
  LessonIntegrityError,
  verifyLessonEvent,
} from "@/lib/lessons/verify-event"

const baseSession = (): LessonSession => ({
  version: 4,
  title: "Variables",
  objective: "Learn variables",
  conceptSlug: "variables",
  topics: [
    {
      id: "assign",
      title: "Assignment",
      teachingGoal: "Use = to assign",
      status: "checking",
      correctChecks: 0,
      failChecks: 0,
      quizPasses: 0,
      practicePasses: 0,
      needsRecheck: false,
    },
  ],
  confidence: 40,
  phase: "teach",
  pace: "steady",
  blocks: [
    {
      id: "quiz-1",
      kind: "quiz",
      topicId: "assign",
      prompt: "Pick the assignment",
      difficulty: "easy",
      choices: [
        { id: "a", label: "x == 1" },
        { id: "b", label: "x = 1" },
      ],
      correctId: "b",
      feedback: { correct: "Yes", wrong: "No" },
    },
    {
      id: "practice-1",
      kind: "practice",
      topicId: "assign",
      mode: "miniEdit",
      prompt: "Assign x",
      starterCode: "x = 0",
      mustContain: ["x = 1"],
      feedback: { correct: "Yes", wrong: "No" },
    },
    {
      id: "complete-1",
      kind: "complete",
      title: "Done",
      body: "Nice work",
    },
  ],
  cursor: 0,
  events: [],
  usedFingerprints: [],
  analytics: [],
  applyPassed: false,
})

describe("verifyLessonEvent", () => {
  it("rejects forged quiz passes without the correct choice", () => {
    const session = baseSession()
    const verified = verifyLessonEvent(session, {
      at: new Date().toISOString(),
      blockId: "quiz-1",
      kind: "quiz",
      passed: true,
      topicId: "assign",
      detail: { choiceId: "a" },
    })
    assert.equal(verified.passed, false)
  })

  it("accepts a real correct quiz choice", () => {
    const session = baseSession()
    const verified = verifyLessonEvent(session, {
      at: new Date().toISOString(),
      blockId: "quiz-1",
      kind: "quiz",
      passed: false,
      topicId: "assign",
      detail: { choiceId: "b" },
    })
    assert.equal(verified.passed, true)
  })

  it("rejects apply events on the sync path", () => {
    const session = baseSession()
    assert.throws(
      () =>
        verifyLessonEvent(session, {
          at: new Date().toISOString(),
          blockId: "quiz-1",
          kind: "apply",
          passed: true,
        }),
      LessonIntegrityError
    )
  })

  it("requires editor code for miniEdit practice", () => {
    const session = baseSession()
    assert.throws(
      () =>
        verifyLessonEvent(session, {
          at: new Date().toISOString(),
          blockId: "practice-1",
          kind: "practice",
          passed: true,
          detail: { interaction: "miniEdit" },
        }),
      LessonIntegrityError
    )
  })
})

describe("assertLessonCompletable", () => {
  it("blocks finish before the complete step / apply pass", () => {
    const session = baseSession()
    assert.throws(() => assertLessonCompletable(session), LessonIntegrityError)
  })

  it("allows finish on the complete step after applyPassed", () => {
    const session = {
      ...baseSession(),
      cursor: 2,
      applyPassed: true,
      phase: "done" as const,
    }
    assert.doesNotThrow(() => assertLessonCompletable(session))
  })
})
