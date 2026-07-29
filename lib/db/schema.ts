import { sql } from "drizzle-orm"
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

export const userRoleEnum = pgEnum("user_role", ["student", "teacher", "admin"])
export const userStatusEnum = pgEnum("user_status", ["active", "disabled"])
export const masteryBandEnum = pgEnum("mastery_band", [
  "learning",
  "developing",
  "proficient",
  "mastered",
])
export const lessonStatusEnum = pgEnum("lesson_status", [
  "active",
  "completed",
  "abandoned",
])
export const codingSessionModeEnum = pgEnum("coding_session_mode", [
  "lesson",
  "free",
])
export const analysisStatusEnum = pgEnum("analysis_status", [
  "pending",
  "running",
  "succeeded",
  "failed",
  "stale",
])
export const assignmentStatusEnum = pgEnum("assignment_recipient_status", [
  "assigned",
  "in_progress",
  "completed",
])
export const savedProgramSourceEnum = pgEnum("saved_program_source", [
  "ide",
  "lesson",
])
export const learnerEventSourceEnum = pgEnum("learner_event_source", [
  "quiz",
  "practice",
  "apply",
  "lesson_complete",
])
export const learnerEventOutcomeEnum = pgEnum("learner_event_outcome", [
  "pass",
  "fail",
])

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}

/** App user keyed by Neon Auth user id (no FK into neon_auth.*) */
export const profiles = pgTable(
  "profiles",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    displayName: text("display_name"),
    role: userRoleEnum("role").notNull().default("student"),
    status: userStatusEnum("status").notNull().default("active"),
    onboarding: jsonb("onboarding"),
    ...timestamps,
  },
  (table) => [
    index("profiles_role_idx").on(table.role),
    index("profiles_status_idx").on(table.status),
    uniqueIndex("profiles_email_lower_idx").on(sql`lower(${table.email})`),
  ]
)

export const classrooms = pgTable(
  "classrooms",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    joinCode: text("join_code").notNull(),
    teacherId: text("teacher_id")
      .notNull()
      .references(() => profiles.id),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("classrooms_join_code_idx").on(table.joinCode),
    index("classrooms_teacher_id_idx").on(table.teacherId),
  ]
)

export const classroomMemberships = pgTable(
  "classroom_memberships",
  {
    classroomId: uuid("classroom_id")
      .notNull()
      .references(() => classrooms.id, { onDelete: "cascade" }),
    studentId: text("student_id")
      .notNull()
      .references(() => profiles.id),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.classroomId, table.studentId] }),
    index("classroom_memberships_student_id_idx").on(table.studentId),
  ]
)

export const concepts = pgTable(
  "concepts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    orderIndex: integer("order_index").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [uniqueIndex("concepts_slug_idx").on(table.slug)]
)

export const conceptPrerequisites = pgTable(
  "concept_prerequisites",
  {
    conceptId: uuid("concept_id")
      .notNull()
      .references(() => concepts.id, { onDelete: "cascade" }),
    prerequisiteId: uuid("prerequisite_id")
      .notNull()
      .references(() => concepts.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.conceptId, table.prerequisiteId] }),
  ]
)

export const conceptMastery = pgTable(
  "concept_mastery",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => profiles.id),
    conceptId: uuid("concept_id")
      .notNull()
      .references(() => concepts.id),
    score: integer("score").notNull().default(0),
    band: masteryBandEnum("band").notNull().default("learning"),
    evidenceCount: integer("evidence_count").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("concept_mastery_student_concept_idx").on(
      table.studentId,
      table.conceptId
    ),
    index("concept_mastery_student_id_idx").on(table.studentId),
  ]
)

export const assignments = pgTable(
  "assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    classroomId: uuid("classroom_id")
      .notNull()
      .references(() => classrooms.id, { onDelete: "cascade" }),
    createdBy: text("created_by")
      .notNull()
      .references(() => profiles.id),
    title: text("title").notNull(),
    conceptId: uuid("concept_id").references(() => concepts.id),
    customPrompt: text("custom_prompt"),
    dueAt: timestamp("due_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index("assignments_classroom_id_idx").on(table.classroomId),
    index("assignments_created_by_idx").on(table.createdBy),
  ]
)

export const assignmentRecipients = pgTable(
  "assignment_recipients",
  {
    assignmentId: uuid("assignment_id")
      .notNull()
      .references(() => assignments.id, { onDelete: "cascade" }),
    studentId: text("student_id")
      .notNull()
      .references(() => profiles.id),
    status: assignmentStatusEnum("status").notNull().default("assigned"),
    assignedAt: timestamp("assigned_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    primaryKey({ columns: [table.assignmentId, table.studentId] }),
    index("assignment_recipients_student_id_idx").on(table.studentId),
  ]
)

export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => profiles.id),
    conceptId: uuid("concept_id")
      .notNull()
      .references(() => concepts.id),
    assignmentId: uuid("assignment_id").references(() => assignments.id),
    schemaVersion: integer("schema_version").notNull().default(1),
    content: jsonb("content").notNull(),
    status: lessonStatusEnum("status").notNull().default("active"),
    ...timestamps,
  },
  (table) => [
    index("lessons_student_created_idx").on(table.studentId, table.createdAt),
  ]
)

export const codingSessions = pgTable(
  "coding_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => profiles.id),
    mode: codingSessionModeEnum("mode").notNull(),
    lessonId: uuid("lesson_id").references(() => lessons.id),
    conceptId: uuid("concept_id").references(() => concepts.id),
    startedAt: timestamp("started_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    activeSeconds: integer("active_seconds").notNull().default(0),
  },
  (table) => [
    index("coding_sessions_student_id_idx").on(table.studentId),
  ]
)

export const codeSnapshots = pgTable(
  "code_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => codingSessions.id, { onDelete: "cascade" }),
    studentId: text("student_id")
      .notNull()
      .references(() => profiles.id),
    lessonId: uuid("lesson_id").references(() => lessons.id),
    mode: codingSessionModeEnum("mode").notNull(),
    code: text("code").notNull(),
    prevCode: text("prev_code"),
    codeHash: text("code_hash").notNull(),
    elapsedMs: integer("elapsed_ms").notNull().default(0),
    stdout: text("stdout"),
    stderr: text("stderr"),
    testResults: jsonb("test_results"),
    hintCount: integer("hint_count").notNull().default(0),
    learningObjective: text("learning_objective"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("code_snapshots_session_hash_idx").on(
      table.sessionId,
      table.codeHash
    ),
    index("code_snapshots_session_created_idx").on(
      table.sessionId,
      table.createdAt
    ),
    index("code_snapshots_student_created_idx").on(
      table.studentId,
      table.createdAt
    ),
  ]
)

export const snapshotAnalyses = pgTable(
  "snapshot_analyses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    snapshotId: uuid("snapshot_id")
      .notNull()
      .references(() => codeSnapshots.id, { onDelete: "cascade" }),
    status: analysisStatusEnum("status").notNull().default("pending"),
    deterministic: jsonb("deterministic"),
    ai: jsonb("ai"),
    error: text("error"),
    model: text("model"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("snapshot_analyses_snapshot_id_idx").on(table.snapshotId),
  ]
)

export const exerciseAttempts = pgTable(
  "exercise_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => profiles.id),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    conceptId: uuid("concept_id")
      .notNull()
      .references(() => concepts.id),
    code: text("code").notNull(),
    testResults: jsonb("test_results"),
    passed: boolean("passed").notNull().default(false),
    hintLevelReached: integer("hint_level_reached").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("exercise_attempts_student_id_idx").on(table.studentId),
    index("exercise_attempts_lesson_id_idx").on(table.lessonId),
  ]
)

export const hints = pgTable(
  "hints",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => profiles.id),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    exerciseAttemptId: uuid("exercise_attempt_id").references(
      () => exerciseAttempts.id,
      { onDelete: "set null" }
    ),
    level: integer("level").notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("hints_student_id_idx").on(table.studentId),
    index("hints_lesson_id_idx").on(table.lessonId),
  ]
)

export const studentInsightReports = pgTable(
  "student_insight_reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => profiles.id),
    content: jsonb("content").notNull(),
    sourceStats: jsonb("source_stats"),
    evidence: jsonb("evidence"),
    model: text("model"),
    generatedAt: timestamp("generated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("student_insight_reports_student_id_idx").on(table.studentId),
  ]
)

export const classInsightReports = pgTable(
  "class_insight_reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    classroomId: uuid("classroom_id")
      .notNull()
      .references(() => classrooms.id, { onDelete: "cascade" }),
    content: jsonb("content").notNull(),
    sourceStats: jsonb("source_stats"),
    evidence: jsonb("evidence"),
    model: text("model"),
    generatedAt: timestamp("generated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("class_insight_reports_classroom_id_idx").on(table.classroomId),
  ]
)

export const savedPrograms = pgTable(
  "saved_programs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => profiles.id),
    title: text("title").notNull(),
    code: text("code").notNull(),
    source: savedProgramSourceEnum("source").notNull().default("ide"),
    ...timestamps,
  },
  (table) => [
    index("saved_programs_student_id_idx").on(table.studentId),
    index("saved_programs_student_updated_idx").on(
      table.studentId,
      table.updatedAt
    ),
  ]
)

/** Persisted PyJourney Assistant chats (lesson or IDE scope). */
export const assistantConversations = pgTable(
  "assistant_conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => profiles.id),
    /** lesson | ide */
    scope: text("scope").notNull(),
    /** lessonId or python-ide */
    scopeKey: text("scope_key").notNull(),
    title: text("title").notNull().default("Chat"),
    messages: jsonb("messages").notNull().default([]),
    ...timestamps,
  },
  (table) => [
    index("assistant_conversations_student_scope_idx").on(
      table.studentId,
      table.scopeKey,
      table.updatedAt
    ),
  ]
)

export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorId: text("actor_id").references(() => profiles.id),
    action: text("action").notNull(),
    targetType: text("target_type").notNull(),
    targetId: text("target_id"),
    meta: jsonb("meta"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("audit_events_actor_id_idx").on(table.actorId)]
)

/**
 * Append-only learning signals (quiz/practice/apply checks).
 * Source of truth for insights; session JSON remains the live lesson state.
 */
export const learnerEvents = pgTable(
  "learner_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => profiles.id),
    conceptId: uuid("concept_id")
      .notNull()
      .references(() => concepts.id),
    lessonId: uuid("lesson_id").references(() => lessons.id, {
      onDelete: "set null",
    }),
    topicId: text("topic_id"),
    source: learnerEventSourceEnum("source").notNull(),
    outcome: learnerEventOutcomeEnum("outcome").notNull(),
    /** Short machine signal, e.g. quiz_fail, criterion_miss. */
    signal: text("signal").notNull(),
    /** Optional curriculum misconception / struggle label. */
    misconceptionTag: text("misconception_tag"),
    latencyMs: integer("latency_ms"),
    payload: jsonb("payload"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("learner_events_student_created_idx").on(
      table.studentId,
      table.createdAt
    ),
    index("learner_events_student_concept_idx").on(
      table.studentId,
      table.conceptId
    ),
    index("learner_events_misconception_idx").on(
      table.studentId,
      table.misconceptionTag
    ),
  ]
)

/** Per-student rollup of attempts on a concept topic. */
export const learnerTopicStats = pgTable(
  "learner_topic_stats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => profiles.id),
    conceptId: uuid("concept_id")
      .notNull()
      .references(() => concepts.id),
    topicId: text("topic_id").notNull(),
    topicTitle: text("topic_title").notNull().default(""),
    attempts: integer("attempts").notNull().default(0),
    passes: integer("passes").notNull().default(0),
    fails: integer("fails").notNull().default(0),
    totalLatencyMs: integer("total_latency_ms").notNull().default(0),
    lastOutcome: learnerEventOutcomeEnum("last_outcome"),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("learner_topic_stats_unique_idx").on(
      table.studentId,
      table.conceptId,
      table.topicId
    ),
    index("learner_topic_stats_student_idx").on(table.studentId),
    index("learner_topic_stats_fails_idx").on(table.studentId, table.fails),
  ]
)

/** Per-student counts of recurring misconception / struggle tags. */
export const learnerMisconceptionStats = pgTable(
  "learner_misconception_stats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => profiles.id),
    conceptId: uuid("concept_id").references(() => concepts.id),
    tag: text("tag").notNull(),
    count: integer("count").notNull().default(0),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("learner_misconception_stats_unique_idx").on(
      table.studentId,
      table.tag
    ),
    index("learner_misconception_stats_student_idx").on(table.studentId),
    index("learner_misconception_stats_count_idx").on(
      table.studentId,
      table.count
    ),
  ]
)
