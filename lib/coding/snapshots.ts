import { and, desc, eq, sql } from "drizzle-orm"

import {
  ANALYSIS_FORCE_ON_STDERR,
  ANALYSIS_MAX_PER_SESSION,
  ANALYSIS_MIN_DIFF_CHARS,
  ANALYSIS_MIN_INTERVAL_MS,
} from "@/lib/coding/constants"
import { diffMagnitude, hashCode } from "@/lib/coding/hash"
import { touchCodingSession } from "@/lib/coding/sessions"
import { getDb } from "@/lib/db"
import { codeSnapshots, codingSessions, snapshotAnalyses } from "@/lib/db/schema"

export type RecordSnapshotInput = {
  studentId: string
  sessionId: string
  mode: "lesson" | "free"
  lessonId?: string | null
  code: string
  prevCode?: string | null
  elapsedMs?: number
  stdout?: string | null
  stderr?: string | null
  hintCount?: number
  learningObjective?: string | null
}

export const recordSnapshotIfChanged = async (input: RecordSnapshotInput) => {
  const codeHash = hashCode(input.code)
  const db = getDb()

  try {
    // Ownership first: session must belong to this student before insert.
    const sessionRows = await db
      .select({
        id: codingSessions.id,
        lessonId: codingSessions.lessonId,
        mode: codingSessions.mode,
      })
      .from(codingSessions)
      .where(
        and(
          eq(codingSessions.id, input.sessionId),
          eq(codingSessions.studentId, input.studentId)
        )
      )
      .limit(1)

    if (!sessionRows[0]) {
      return { snapshot: null, created: false, shouldAnalyze: false }
    }

    const sessionLessonId = sessionRows[0].lessonId
    const lessonId =
      sessionRows[0].mode === "lesson"
        ? sessionLessonId
        : (input.lessonId ?? null)

    const inserted = await db
      .insert(codeSnapshots)
      .values({
        sessionId: input.sessionId,
        studentId: input.studentId,
        lessonId,
        mode: input.mode,
        code: input.code,
        prevCode: input.prevCode ?? null,
        codeHash,
        elapsedMs: input.elapsedMs ?? 0,
        stdout: input.stdout ?? null,
        stderr: input.stderr ?? null,
        hintCount: input.hintCount ?? 0,
        learningObjective: input.learningObjective ?? null,
      })
      .onConflictDoNothing()
      .returning()

    if (!inserted[0]) {
      // Same codeHash: still refresh stdout/stderr when the learner re-runs.
      if (input.stdout != null || input.stderr != null) {
        await db
          .update(codeSnapshots)
          .set({
            stdout: input.stdout ?? null,
            stderr: input.stderr ?? null,
            elapsedMs: input.elapsedMs ?? 0,
          })
          .where(
            and(
              eq(codeSnapshots.sessionId, input.sessionId),
              eq(codeSnapshots.codeHash, codeHash),
              eq(codeSnapshots.studentId, input.studentId)
            )
          )
      }
      return { snapshot: null, created: false, shouldAnalyze: false }
    }

    await touchCodingSession(input.sessionId, input.studentId)

    const shouldAnalyze = await shouldAnalyzeSnapshot({
      sessionId: input.sessionId,
      snapshotId: inserted[0].id,
      prevCode: input.prevCode,
      code: input.code,
      stderr: input.stderr,
    })

    if (shouldAnalyze) {
      await db.insert(snapshotAnalyses).values({
        snapshotId: inserted[0].id,
        status: "pending",
      })
    }

    return {
      snapshot: inserted[0],
      created: true,
      shouldAnalyze,
    }
  } catch (error) {
    console.error("recordSnapshotIfChanged", error)
    return { snapshot: null, created: false, shouldAnalyze: false }
  }
}

const shouldAnalyzeSnapshot = async (input: {
  sessionId: string
  snapshotId: string
  prevCode?: string | null
  code: string
  stderr?: string | null
}) => {
  const db = getDb()
  const [stats] = await db
    .select({
      count: sql<number>`count(*)::int`,
      lastCreatedAt: sql<Date | null>`max(${snapshotAnalyses.createdAt})`,
    })
    .from(snapshotAnalyses)
    .innerJoin(codeSnapshots, eq(codeSnapshots.id, snapshotAnalyses.snapshotId))
    .where(eq(codeSnapshots.sessionId, input.sessionId))

  const analyzedCount = stats?.count ?? 0
  if (analyzedCount >= ANALYSIS_MAX_PER_SESSION) return false

  if (stats?.lastCreatedAt) {
    const lastAt =
      stats.lastCreatedAt instanceof Date
        ? stats.lastCreatedAt
        : new Date(stats.lastCreatedAt)
    const age = Date.now() - lastAt.getTime()
    const forceStderr =
      ANALYSIS_FORCE_ON_STDERR && Boolean(input.stderr?.trim())
    if (age < ANALYSIS_MIN_INTERVAL_MS && !forceStderr) return false
  }

  const magnitude = diffMagnitude(input.prevCode, input.code)
  if (
    magnitude < ANALYSIS_MIN_DIFF_CHARS &&
    !input.stderr?.trim() &&
    analyzedCount > 0
  ) {
    return false
  }

  return true
}

export type StudentSnapshotListItem = {
  id: string
  mode: "lesson" | "free"
  lessonId: string | null
  learningObjective: string | null
  code: string
  stdout: string | null
  stderr: string | null
  hintCount: number
  elapsedMs: number
  createdAt: Date
  analysisStatus: string | null
  analysisAi: unknown
  analysisDeterministic: unknown
  analysisModel: string | null
}

export const listRecentSnapshotsForStudent = async (
  studentId: string,
  limit = 20
): Promise<StudentSnapshotListItem[]> => {
  const db = getDb()
  return db
    .select({
      id: codeSnapshots.id,
      mode: codeSnapshots.mode,
      lessonId: codeSnapshots.lessonId,
      learningObjective: codeSnapshots.learningObjective,
      code: codeSnapshots.code,
      stdout: codeSnapshots.stdout,
      stderr: codeSnapshots.stderr,
      hintCount: codeSnapshots.hintCount,
      elapsedMs: codeSnapshots.elapsedMs,
      createdAt: codeSnapshots.createdAt,
      analysisStatus: snapshotAnalyses.status,
      analysisAi: snapshotAnalyses.ai,
      analysisDeterministic: snapshotAnalyses.deterministic,
      analysisModel: snapshotAnalyses.model,
    })
    .from(codeSnapshots)
    .leftJoin(
      snapshotAnalyses,
      eq(snapshotAnalyses.snapshotId, codeSnapshots.id)
    )
    .where(eq(codeSnapshots.studentId, studentId))
    .orderBy(desc(codeSnapshots.createdAt))
    .limit(limit)
}

/** Metadata-only snapshots for AI/report prompts — avoids shipping full code. */
export const listSnapshotEvidenceForStudent = async (
  studentId: string,
  limit = 12
) => {
  const db = getDb()
  return db
    .select({
      id: codeSnapshots.id,
      mode: codeSnapshots.mode,
      createdAt: codeSnapshots.createdAt,
      hadStderr: sql<boolean>`coalesce(length(${codeSnapshots.stderr}) > 0, false)`,
      analysisStatus: snapshotAnalyses.status,
      analysisAi: snapshotAnalyses.ai,
    })
    .from(codeSnapshots)
    .leftJoin(
      snapshotAnalyses,
      eq(snapshotAnalyses.snapshotId, codeSnapshots.id)
    )
    .where(eq(codeSnapshots.studentId, studentId))
    .orderBy(desc(codeSnapshots.createdAt))
    .limit(limit)
}

export const getSnapshotOwnedByStudent = async (
  snapshotId: string,
  studentId: string
) => {
  const db = getDb()
  const rows = await db
    .select()
    .from(codeSnapshots)
    .where(
      and(
        eq(codeSnapshots.id, snapshotId),
        eq(codeSnapshots.studentId, studentId)
      )
    )
    .limit(1)
  return rows[0] ?? null
}
