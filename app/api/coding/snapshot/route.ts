import { z } from "zod"
import { after } from "next/server"

import { claimAndAnalyzePending } from "@/lib/coding/analyze"
import { recordSnapshotIfChanged } from "@/lib/coding/snapshots"
import { requireRole } from "@/lib/auth/session"

export const runtime = "nodejs"

const bodySchema = z.object({
  sessionId: z.string().uuid(),
  mode: z.enum(["lesson", "free"]),
  lessonId: z.string().uuid().nullable().optional(),
  code: z.string(),
  prevCode: z.string().nullable().optional(),
  elapsedMs: z.number().int().nonnegative().optional(),
  stdout: z.string().nullable().optional(),
  stderr: z.string().nullable().optional(),
  hintCount: z.number().int().nonnegative().optional(),
  learningObjective: z.string().nullable().optional(),
  analyzeNow: z.boolean().optional(),
})

export const POST = async (request: Request) => {
  try {
    const user = await requireRole(["student"])
    const parsed = bodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return Response.json({ error: "Invalid request." }, { status: 400 })
    }

    // Skip if unchanged vs prev (client should already gate, but double-check).
    if (
      parsed.data.prevCode != null &&
      parsed.data.prevCode === parsed.data.code
    ) {
      return Response.json({ created: false, skipped: true })
    }

    const result = await recordSnapshotIfChanged({
      studentId: user.id,
      sessionId: parsed.data.sessionId,
      mode: parsed.data.mode,
      lessonId: parsed.data.lessonId,
      code: parsed.data.code,
      prevCode: parsed.data.prevCode,
      elapsedMs: parsed.data.elapsedMs,
      stdout: parsed.data.stdout,
      stderr: parsed.data.stderr,
      hintCount: parsed.data.hintCount,
      learningObjective: parsed.data.learningObjective,
    })

    if (result.shouldAnalyze || parsed.data.analyzeNow) {
      // Keep analysis on the same invocation after the response (serverless-safe).
      after(() =>
        claimAndAnalyzePending(2).catch((error) =>
          console.error("analyze batch", error)
        )
      )
    }

    return Response.json({
      created: result.created,
      snapshotId: result.snapshot?.id ?? null,
      queuedAnalysis: result.shouldAnalyze,
    })
  } catch (error) {
    console.error("coding snapshot", error)
    return Response.json({ error: "Could not save snapshot." }, { status: 500 })
  }
}
