import { createOpenAI } from "@ai-sdk/openai"
import { generateText, Output } from "ai"
import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { getDb } from "@/lib/db"
import { codeSnapshots, codingSessions, snapshotAnalyses } from "@/lib/db/schema"

const analysisSchema = z.object({
  summary: z.string().min(1).max(400),
  strengths: z.array(z.string().min(1)).max(4),
  struggles: z.array(z.string().min(1)).max(4),
  nextStep: z.string().min(1).max(240),
  misconceptionTags: z.array(z.string().min(1)).max(5),
  masteryDelta: z.number().min(-5).max(5),
  confidence: z.number().min(0).max(1),
})

export type SnapshotAiAnalysis = z.infer<typeof analysisSchema>

const deterministicSummary = (input: {
  code: string
  prevCode?: string | null
  stderr?: string | null
  stdout?: string | null
}) => {
  const lines = input.code.split("\n").length
  const changed = Boolean(input.prevCode && input.prevCode !== input.code)
  return {
    lines,
    changed,
    hasStderr: Boolean(input.stderr?.trim()),
    hasStdout: Boolean(input.stdout?.trim()),
    charCount: input.code.length,
  }
}

export const processPendingSnapshotAnalysis = async (snapshotId: string) => {
  const db = getDb()
  const rows = await db
    .select({
      analysisId: snapshotAnalyses.id,
      status: snapshotAnalyses.status,
      snapshot: codeSnapshots,
      conceptId: codingSessions.conceptId,
    })
    .from(snapshotAnalyses)
    .innerJoin(codeSnapshots, eq(codeSnapshots.id, snapshotAnalyses.snapshotId))
    .leftJoin(codingSessions, eq(codingSessions.id, codeSnapshots.sessionId))
    .where(eq(snapshotAnalyses.snapshotId, snapshotId))
    .limit(1)

  const row = rows[0]
  if (!row || row.status !== "pending") return null

  // Atomic claim: only one worker proceeds from pending → running.
  const claimed = await db
    .update(snapshotAnalyses)
    .set({ status: "running" })
    .where(
      and(
        eq(snapshotAnalyses.id, row.analysisId),
        eq(snapshotAnalyses.status, "pending")
      )
    )
    .returning({ id: snapshotAnalyses.id })

  if (!claimed[0]) return null

  const deterministic = deterministicSummary({
    code: row.snapshot.code,
    prevCode: row.snapshot.prevCode,
    stderr: row.snapshot.stderr,
    stdout: row.snapshot.stdout,
  })

  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) {
    await db
      .update(snapshotAnalyses)
      .set({
        status: "succeeded",
        deterministic,
        ai: {
          summary: "Rule-based snapshot summary (no AI key configured).",
          strengths: [],
          struggles: deterministic.hasStderr ? ["Runtime/stderr present"] : [],
          nextStep: "Keep iterating and re-run after small changes.",
          misconceptionTags: [],
          masteryDelta: 0,
          confidence: 0,
        },
        model: null,
        completedAt: new Date(),
      })
      .where(eq(snapshotAnalyses.id, row.analysisId))
    return { source: "rules" as const }
  }

  try {
    const openai = createOpenAI({ apiKey })
    const modelId = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini"
    const result = await generateText({
      model: openai(modelId),
      output: Output.object({ schema: analysisSchema }),
      system: `You analyze short coding snapshots for a school Python learning app.
Be concise. Do not provide full solutions. Tag misconceptions with short snake_case labels.
masteryDelta is a small score hint (-5..5) only when evidence is clear.`,
      prompt: JSON.stringify({
        objective: row.snapshot.learningObjective,
        mode: row.snapshot.mode,
        deterministic,
        code: row.snapshot.code.slice(0, 6000),
        prevCode: row.snapshot.prevCode?.slice(0, 4000) ?? null,
        stdout: row.snapshot.stdout?.slice(0, 2000) ?? null,
        stderr: row.snapshot.stderr?.slice(0, 2000) ?? null,
      }),
    })

    const ai = result.output
    if (!ai) throw new Error("Empty analysis output")

    await db
      .update(snapshotAnalyses)
      .set({
        status: "succeeded",
        deterministic,
        ai,
        model: modelId,
        completedAt: new Date(),
        error: null,
      })
      .where(eq(snapshotAnalyses.id, row.analysisId))

    return { source: "openai" as const, ai }
  } catch (error) {
    console.error("snapshot analysis failed", error)
    await db
      .update(snapshotAnalyses)
      .set({
        status: "failed",
        deterministic,
        error: error instanceof Error ? error.message : "analysis failed",
        completedAt: new Date(),
      })
      .where(eq(snapshotAnalyses.id, row.analysisId))
    return null
  }
}

export const claimAndAnalyzePending = async (limit = 3) => {
  const db = getDb()
  const pending = await db
    .select({ snapshotId: snapshotAnalyses.snapshotId })
    .from(snapshotAnalyses)
    .where(eq(snapshotAnalyses.status, "pending"))
    .limit(limit)

  const results = []
  for (const row of pending) {
    results.push(await processPendingSnapshotAnalysis(row.snapshotId))
  }
  return results
}
