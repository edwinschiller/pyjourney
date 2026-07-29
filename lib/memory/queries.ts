import { and, desc, eq, inArray, sql } from "drizzle-orm"

import { getDb } from "@/lib/db"
import {
  classroomMemberships,
  conceptMastery,
  concepts,
  learnerEvents,
  learnerMisconceptionStats,
  learnerTopicStats,
  profiles,
} from "@/lib/db/schema"

import type {
  ClassInsightsSummary,
  ClassMemberInsight,
  ClassMisconception,
  ClassStruggleTopic,
  MisconceptionStatRow,
  RecentLearnerEvent,
  StudentInsightsSummary,
  TopicStatRow,
} from "./types"

export const listTopicStatsForStudent = async (
  studentId: string,
  options?: { strugglingOnly?: boolean; limit?: number }
): Promise<TopicStatRow[]> => {
  const db = getDb()
  const strugglingOnly = options?.strugglingOnly ?? false
  const limit = options?.limit

  const rows = await db
    .select({
      conceptId: learnerTopicStats.conceptId,
      conceptSlug: concepts.slug,
      conceptTitle: concepts.title,
      topicId: learnerTopicStats.topicId,
      topicTitle: learnerTopicStats.topicTitle,
      attempts: learnerTopicStats.attempts,
      passes: learnerTopicStats.passes,
      fails: learnerTopicStats.fails,
      totalLatencyMs: learnerTopicStats.totalLatencyMs,
      lastOutcome: learnerTopicStats.lastOutcome,
      lastSeenAt: learnerTopicStats.lastSeenAt,
    })
    .from(learnerTopicStats)
    .innerJoin(concepts, eq(concepts.id, learnerTopicStats.conceptId))
    .where(
      strugglingOnly
        ? and(
            eq(learnerTopicStats.studentId, studentId),
            sql`${learnerTopicStats.fails} > 0`
          )
        : eq(learnerTopicStats.studentId, studentId)
    )
    .orderBy(desc(learnerTopicStats.fails), desc(learnerTopicStats.lastSeenAt))
    .limit(limit ?? 100)

  return rows.map((row) => ({
    conceptId: row.conceptId,
    conceptSlug: row.conceptSlug,
    conceptTitle: row.conceptTitle,
    topicId: row.topicId,
    topicTitle: row.topicTitle,
    attempts: row.attempts,
    passes: row.passes,
    fails: row.fails,
    avgLatencyMs:
      row.attempts > 0 ? Math.round(row.totalLatencyMs / row.attempts) : null,
    lastOutcome: row.lastOutcome,
    lastSeenAt: row.lastSeenAt,
  }))
}

export const listMisconceptionStatsForStudent = async (
  studentId: string,
  limit = 12
): Promise<MisconceptionStatRow[]> => {
  const db = getDb()
  const rows = await db
    .select({
      tag: learnerMisconceptionStats.tag,
      count: learnerMisconceptionStats.count,
      conceptId: learnerMisconceptionStats.conceptId,
      conceptTitle: concepts.title,
      lastSeenAt: learnerMisconceptionStats.lastSeenAt,
    })
    .from(learnerMisconceptionStats)
    .leftJoin(concepts, eq(concepts.id, learnerMisconceptionStats.conceptId))
    .where(eq(learnerMisconceptionStats.studentId, studentId))
    .orderBy(
      desc(learnerMisconceptionStats.count),
      desc(learnerMisconceptionStats.lastSeenAt)
    )
    .limit(limit)

  return rows.map((row) => ({
    tag: row.tag,
    count: row.count,
    conceptId: row.conceptId,
    conceptTitle: row.conceptTitle,
    lastSeenAt: row.lastSeenAt,
  }))
}

export const listRecentEventsForStudent = async (
  studentId: string,
  limit = 20
): Promise<RecentLearnerEvent[]> => {
  const db = getDb()
  const rows = await db
    .select({
      id: learnerEvents.id,
      conceptTitle: concepts.title,
      topicId: learnerEvents.topicId,
      source: learnerEvents.source,
      outcome: learnerEvents.outcome,
      signal: learnerEvents.signal,
      misconceptionTag: learnerEvents.misconceptionTag,
      createdAt: learnerEvents.createdAt,
    })
    .from(learnerEvents)
    .innerJoin(concepts, eq(concepts.id, learnerEvents.conceptId))
    .where(eq(learnerEvents.studentId, studentId))
    .orderBy(desc(learnerEvents.createdAt))
    .limit(limit)

  return rows
}

export const getStudentInsightsSummary = async (
  studentId: string
): Promise<StudentInsightsSummary> => {
  const db = getDb()

  const [countRows, topicStats, misconceptions, recentEvents, masteryRows] =
    await Promise.all([
      db
        .select({
          total: sql<number>`count(*)::int`,
          passes: sql<number>`count(*) filter (where ${learnerEvents.outcome} = 'pass')::int`,
          fails: sql<number>`count(*) filter (where ${learnerEvents.outcome} = 'fail')::int`,
        })
        .from(learnerEvents)
        .where(eq(learnerEvents.studentId, studentId)),
      listTopicStatsForStudent(studentId, { strugglingOnly: true, limit: 8 }),
      listMisconceptionStatsForStudent(studentId, 8),
      listRecentEventsForStudent(studentId),
      db
        .select({
          conceptId: conceptMastery.conceptId,
          conceptTitle: concepts.title,
          score: conceptMastery.score,
          band: conceptMastery.band,
        })
        .from(conceptMastery)
        .innerJoin(concepts, eq(concepts.id, conceptMastery.conceptId))
        .where(eq(conceptMastery.studentId, studentId))
        .orderBy(concepts.orderIndex),
    ])

  const counts = countRows[0]
  const totalEvents = counts?.total ?? 0
  const passCount = counts?.passes ?? 0
  const failCount = counts?.fails ?? 0

  return {
    totalEvents,
    passCount,
    failCount,
    passRate: totalEvents > 0 ? Math.round((passCount / totalEvents) * 100) : null,
    strugglingTopics: topicStats,
    topMisconceptions: misconceptions,
    recentEvents,
    mastery: masteryRows.map((row) => ({
      conceptId: row.conceptId,
      conceptTitle: row.conceptTitle,
      score: row.score,
      band: row.band,
    })),
  }
}

/** Topics with the most fails — used to bias remediation across lessons. */
export const listStruggleTopicIdsForStudent = async (
  studentId: string,
  conceptId: string,
  limit = 5
): Promise<string[]> => {
  const db = getDb()
  const rows = await db
    .select({
      topicId: learnerTopicStats.topicId,
      fails: learnerTopicStats.fails,
    })
    .from(learnerTopicStats)
    .where(
      and(
        eq(learnerTopicStats.studentId, studentId),
        eq(learnerTopicStats.conceptId, conceptId)
      )
    )
    .orderBy(desc(learnerTopicStats.fails))
    .limit(limit)

  return rows.filter((row) => row.fails > 0).map((row) => row.topicId)
}

export const getClassInsightsSummary = async (
  classroomId: string
): Promise<ClassInsightsSummary> => {
  const db = getDb()

  const members = await db
    .select({
      studentId: classroomMemberships.studentId,
      displayName: profiles.displayName,
      email: profiles.email,
    })
    .from(classroomMemberships)
    .innerJoin(profiles, eq(profiles.id, classroomMemberships.studentId))
    .where(eq(classroomMemberships.classroomId, classroomId))

  const studentIds = members.map((member) => member.studentId)
  if (studentIds.length === 0) {
    return {
      memberCount: 0,
      totalEvents: 0,
      failCount: 0,
      passCount: 0,
      struggleTopics: [],
      misconceptions: [],
      members: [],
    }
  }

  const [eventCounts, struggleRows, misconceptionRows, perStudent, topTopicByStudent] =
    await Promise.all([
      db
        .select({
          total: sql<number>`count(*)::int`,
          passes: sql<number>`count(*) filter (where ${learnerEvents.outcome} = 'pass')::int`,
          fails: sql<number>`count(*) filter (where ${learnerEvents.outcome} = 'fail')::int`,
        })
        .from(learnerEvents)
        .where(inArray(learnerEvents.studentId, studentIds))
        .then((rows) => rows[0]),
      db
        .select({
          topicId: learnerTopicStats.topicId,
          topicTitle: learnerTopicStats.topicTitle,
          conceptTitle: concepts.title,
          studentCount: sql<number>`count(distinct ${learnerTopicStats.studentId})::int`,
          totalFails: sql<number>`sum(${learnerTopicStats.fails})::int`,
        })
        .from(learnerTopicStats)
        .innerJoin(concepts, eq(concepts.id, learnerTopicStats.conceptId))
        .where(
          and(
            inArray(learnerTopicStats.studentId, studentIds),
            sql`${learnerTopicStats.fails} > 0`
          )
        )
        .groupBy(
          learnerTopicStats.topicId,
          learnerTopicStats.topicTitle,
          concepts.title
        )
        .orderBy(sql`sum(${learnerTopicStats.fails}) desc`)
        .limit(8),
      db
        .select({
          tag: learnerMisconceptionStats.tag,
          studentCount: sql<number>`count(distinct ${learnerMisconceptionStats.studentId})::int`,
          totalCount: sql<number>`sum(${learnerMisconceptionStats.count})::int`,
        })
        .from(learnerMisconceptionStats)
        .where(inArray(learnerMisconceptionStats.studentId, studentIds))
        .groupBy(learnerMisconceptionStats.tag)
        .orderBy(sql`sum(${learnerMisconceptionStats.count}) desc`)
        .limit(8),
      db
        .select({
          studentId: learnerEvents.studentId,
          passes: sql<number>`count(*) filter (where ${learnerEvents.outcome} = 'pass')::int`,
          fails: sql<number>`count(*) filter (where ${learnerEvents.outcome} = 'fail')::int`,
        })
        .from(learnerEvents)
        .where(inArray(learnerEvents.studentId, studentIds))
        .groupBy(learnerEvents.studentId),
      db
        .select({
          studentId: learnerTopicStats.studentId,
          topicTitle: learnerTopicStats.topicTitle,
          fails: learnerTopicStats.fails,
        })
        .from(learnerTopicStats)
        .where(
          and(
            inArray(learnerTopicStats.studentId, studentIds),
            sql`${learnerTopicStats.fails} > 0`
          )
        )
        .orderBy(
          learnerTopicStats.studentId,
          desc(learnerTopicStats.fails)
        ),
    ])

  const struggleTopicLookup = new Map<string, string>()
  for (const row of topTopicByStudent) {
    if (!struggleTopicLookup.has(row.studentId)) {
      struggleTopicLookup.set(row.studentId, row.topicTitle)
    }
  }

  const countByStudent = new Map(
    perStudent.map((row) => [row.studentId, row] as const)
  )

  const memberInsights: ClassMemberInsight[] = members.map((member) => {
    const counts = countByStudent.get(member.studentId)
    return {
      studentId: member.studentId,
      displayName: member.displayName,
      email: member.email,
      passCount: counts?.passes ?? 0,
      failCount: counts?.fails ?? 0,
      topStruggleTopic: struggleTopicLookup.get(member.studentId) ?? null,
    }
  })

  memberInsights.sort((a, b) => b.failCount - a.failCount)

  const struggleTopics: ClassStruggleTopic[] = struggleRows.map((row) => ({
    topicId: row.topicId,
    topicTitle: row.topicTitle,
    conceptTitle: row.conceptTitle,
    studentCount: row.studentCount,
    totalFails: row.totalFails,
  }))

  const misconceptions: ClassMisconception[] = misconceptionRows.map((row) => ({
    tag: row.tag,
    studentCount: row.studentCount,
    totalCount: row.totalCount,
  }))

  return {
    memberCount: members.length,
    totalEvents: eventCounts?.total ?? 0,
    passCount: eventCounts?.passes ?? 0,
    failCount: eventCounts?.fails ?? 0,
    struggleTopics,
    misconceptions,
    members: memberInsights,
  }
}

export const assertStudentInClassroom = async (
  classroomId: string,
  studentId: string
) => {
  const db = getDb()
  const rows = await db
    .select({ studentId: classroomMemberships.studentId })
    .from(classroomMemberships)
    .where(
      and(
        eq(classroomMemberships.classroomId, classroomId),
        eq(classroomMemberships.studentId, studentId)
      )
    )
    .limit(1)
  return Boolean(rows[0])
}
