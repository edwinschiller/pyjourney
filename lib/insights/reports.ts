import { createOpenAI } from "@ai-sdk/openai"
import { generateText, Output } from "ai"
import { and, desc, eq } from "drizzle-orm"
import { z } from "zod"

import { listSnapshotEvidenceForStudent } from "@/lib/coding/snapshots"
import { getDb } from "@/lib/db"
import {
  classInsightReports,
  classroomMemberships,
  studentInsightReports,
} from "@/lib/db/schema"
import {
  getClassInsightsSummary,
  getStudentInsightsSummary,
} from "@/lib/memory"

const reportSchema = z.object({
  headline: z.string().min(1).max(160),
  summary: z.string().min(1).max(800),
  strengths: z.array(z.string().min(1)).max(5),
  focusAreas: z.array(z.string().min(1)).max(5),
  recommendedNextSteps: z.array(z.string().min(1)).max(5),
  lessonTips: z.array(z.string().min(1)).max(4),
  freePracticeTips: z.array(z.string().min(1)).max(4),
  examples: z
    .array(
      z.object({
        title: z.string().min(1).max(80),
        explanation: z.string().min(1).max(280),
      })
    )
    .max(3),
})

export type InsightReportContent = z.infer<typeof reportSchema>

/** Stored reports may predate newer fields — read leniently. */
export type InsightReportContentView = {
  headline?: string
  summary?: string
  strengths?: string[]
  focusAreas?: string[]
  recommendedNextSteps?: string[]
  lessonTips?: string[]
  freePracticeTips?: string[]
  examples?: Array<{ title: string; explanation: string }>
}

export const generateStudentInsightReport = async (studentId: string) => {
  const [stats, snapshots] = await Promise.all([
    getStudentInsightsSummary(studentId),
    listSnapshotEvidenceForStudent(studentId, 12),
  ])

  const sourceStats = {
    totalEvents: stats.totalEvents,
    passRate: stats.passRate,
    strugglingTopics: stats.strugglingTopics.slice(0, 5),
    misconceptions: stats.topMisconceptions.slice(0, 5),
    mastery: stats.mastery.slice(0, 8),
  }

  const evidence = {
    recentSnapshots: snapshots.map((row) => ({
      id: row.id,
      mode: row.mode,
      createdAt: row.createdAt,
      analysisStatus: row.analysisStatus,
      analysis: row.analysisAi,
      hadStderr: Boolean(row.hadStderr),
    })),
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim()
  let content: InsightReportContent
  let model: string | null = null

  if (!apiKey) {
    content = {
      headline: "Progress snapshot",
      summary:
        stats.totalEvents === 0
          ? "No lesson checks yet. Start a concept on the learning path."
          : `You have ${stats.totalEvents} recorded checks with a ${stats.passRate ?? 0}% pass rate. Keep practicing weak topics and use Help when stuck.`,
      strengths: stats.mastery
        .filter((row) => row.score >= 70)
        .slice(0, 3)
        .map((row) => `${row.conceptTitle} (${row.score})`),
      focusAreas: stats.strugglingTopics
        .slice(0, 3)
        .map((row) => `${row.topicTitle} in ${row.conceptTitle}`),
      recommendedNextSteps: [
        "Finish the next unlocked concept on your path",
        "Use Help for one stuck step instead of guessing",
        "Re-run small code changes often in the IDE",
      ],
      lessonTips: [
        "Retry the weakest topic quiz once you understand the hint",
        "Read the fail feedback before guessing again",
      ],
      freePracticeTips: [
        "Build a tiny program that only uses your weak topic",
        "Print intermediate values when debugging",
      ],
      examples: [
        {
          title: "How pass rate works",
          explanation:
            "Each quiz, practice, and apply check counts as one attempt. Pass rate is passes ÷ all checks.",
        },
      ],
    }
  } else {
    const openai = createOpenAI({ apiKey })
    model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini"
    const result = await generateText({
      model: openai(model),
      output: Output.object({ schema: reportSchema }),
      system: `Write a supportive student learning insight report for a school Python app.
English, concrete, no shame. Use evidence from stats and coding snapshot analyses.
Separate lesson tips (path quizzes/practice/apply) from free-practice tips (IDE).
In examples, explain one concrete Python idea tied to their struggles (short, beginner-friendly).`,
      prompt: JSON.stringify({ sourceStats, evidence }),
      temperature: 0.4,
    })
    if (!result.output) throw new Error("Empty insight report")
    content = result.output
  }

  const db = getDb()
  const created = await db
    .insert(studentInsightReports)
    .values({
      studentId,
      content,
      sourceStats,
      evidence,
      model,
    })
    .returning()

  return created[0]!
}

export const generateClassInsightReport = async (classroomId: string) => {
  const stats = await getClassInsightsSummary(classroomId)
  const sourceStats = {
    memberCount: stats.memberCount,
    totalEvents: stats.totalEvents,
    passCount: stats.passCount,
    failCount: stats.failCount,
    passRate:
      stats.totalEvents > 0
        ? Math.round((stats.passCount / stats.totalEvents) * 100)
        : null,
    struggleTopics: stats.struggleTopics.slice(0, 8),
    misconceptions: stats.misconceptions.slice(0, 8),
    membersNeedingSupport: stats.members
      .slice()
      .sort((a, b) => b.failCount - a.failCount)
      .slice(0, 6)
      .map((member) => ({
        failCount: member.failCount,
        passCount: member.passCount,
        topStruggleTopic: member.topStruggleTopic,
      })),
  }

  const evidence = {
    note: "Aggregate class evidence only — avoid naming individual students.",
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim()
  let content: InsightReportContent
  let model: string | null = null

  if (!apiKey) {
    content = {
      headline: "Class overview",
      summary: `${stats.memberCount} learners · ${stats.totalEvents} checks · ${
        sourceStats.passRate ?? 0
      }% pass rate. Focus teaching time on the top struggle topics below.`,
      strengths:
        sourceStats.passRate != null && sourceStats.passRate >= 70
          ? [`Solid class pass rate (${sourceStats.passRate}%)`]
          : [],
      focusAreas: stats.struggleTopics
        .slice(0, 4)
        .map(
          (row) =>
            `${row.topicTitle} in ${row.conceptTitle} (${row.totalFails} fails · ${row.studentCount} student${row.studentCount === 1 ? "" : "s"})`
        ),
      recommendedNextSteps: [
        "Open with a 5-minute reteach on the top struggle topic",
        "Assign a short practice that targets the top misconception tag",
        "Check individual student insight pages for outliers needing 1:1 support",
      ],
      lessonTips: [
        "Warm up with a worked example on the #1 struggle topic",
        "Have learners explain one elif branch out loud before coding",
      ],
      freePracticeTips: [
        "Offer an optional IDE mini-challenge on the shared weak topic",
        "Ask students to print types when debugging input()/casting issues",
      ],
      examples: [
        {
          title: "Shared fails → whole-class reteach",
          explanation:
            "Topics with many fails across students are good candidates for a short whole-class reteach before new content.",
        },
        {
          title: "How pass rate helps planning",
          explanation:
            "Pass rate is passes ÷ all lesson checks. Use it with struggle topics — a high pass rate can still hide one sticky concept.",
        },
      ],
    }
  } else {
    const openai = createOpenAI({ apiKey })
    model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini"
    const result = await generateText({
      model: openai(model),
      output: Output.object({ schema: reportSchema }),
      system: `Write a teacher-facing class insight report for a school Python app.
English, actionable, privacy-aware (do NOT name individual students).
Be concrete for lesson planning: what to reteach, how to structure 5–15 minutes, and optional IDE practice.
Always fill lessonTips, freePracticeTips, and 2–3 short examples teachers can reuse.
Separate path/lesson guidance from free-practice IDE tips.`,
      prompt: JSON.stringify({ sourceStats, evidence }),
      temperature: 0.4,
    })
    if (!result.output) throw new Error("Empty class insight report")
    content = result.output
  }

  const db = getDb()
  const created = await db
    .insert(classInsightReports)
    .values({
      classroomId,
      content,
      sourceStats,
      evidence: {
        memberCount: stats.memberCount,
        ...evidence,
      },
      model,
    })
    .returning()

  return created[0]!
}

export const getLatestStudentInsightReport = async (studentId: string) => {
  const db = getDb()
  const rows = await db
    .select()
    .from(studentInsightReports)
    .where(eq(studentInsightReports.studentId, studentId))
    .orderBy(desc(studentInsightReports.generatedAt))
    .limit(1)
  return rows[0] ?? null
}

export const getLatestClassInsightReport = async (classroomId: string) => {
  const db = getDb()
  const rows = await db
    .select()
    .from(classInsightReports)
    .where(eq(classInsightReports.classroomId, classroomId))
    .orderBy(desc(classInsightReports.generatedAt))
    .limit(1)
  return rows[0] ?? null
}

export const studentIsInClassroom = async (
  studentId: string,
  classroomId: string
) => {
  const db = getDb()
  const rows = await db
    .select({ studentId: classroomMemberships.studentId })
    .from(classroomMemberships)
    .where(
      and(
        eq(classroomMemberships.studentId, studentId),
        eq(classroomMemberships.classroomId, classroomId)
      )
    )
    .limit(1)
  return Boolean(rows[0])
}
