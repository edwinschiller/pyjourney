export type LearnerEventSource =
  | "quiz"
  | "practice"
  | "apply"
  | "lesson_complete"

export type LearnerEventOutcome = "pass" | "fail"

export type RecordLearnerEventInput = {
  studentId: string
  conceptId: string
  lessonId?: string | null
  topicId?: string | null
  topicTitle?: string | null
  conceptSlug?: string | null
  source: LearnerEventSource
  outcome: LearnerEventOutcome
  signal: string
  misconceptionTag?: string | null
  latencyMs?: number | null
  payload?: unknown
}

export type TopicStatRow = {
  conceptId: string
  conceptSlug: string
  conceptTitle: string
  topicId: string
  topicTitle: string
  attempts: number
  passes: number
  fails: number
  avgLatencyMs: number | null
  lastOutcome: LearnerEventOutcome | null
  lastSeenAt: Date
}

export type MisconceptionStatRow = {
  tag: string
  count: number
  conceptId: string | null
  conceptTitle: string | null
  lastSeenAt: Date
}

export type RecentLearnerEvent = {
  id: string
  conceptTitle: string
  topicId: string | null
  source: LearnerEventSource
  outcome: LearnerEventOutcome
  signal: string
  misconceptionTag: string | null
  createdAt: Date
}

export type StudentInsightsSummary = {
  totalEvents: number
  passCount: number
  failCount: number
  passRate: number | null
  strugglingTopics: TopicStatRow[]
  topMisconceptions: MisconceptionStatRow[]
  recentEvents: RecentLearnerEvent[]
  mastery: Array<{
    conceptId: string
    conceptTitle: string
    score: number
    band: string
  }>
}

export type ClassStruggleTopic = {
  topicId: string
  topicTitle: string
  conceptTitle: string
  studentCount: number
  totalFails: number
}

export type ClassMisconception = {
  tag: string
  studentCount: number
  totalCount: number
}

export type ClassMemberInsight = {
  studentId: string
  displayName: string | null
  email: string
  failCount: number
  passCount: number
  topStruggleTopic: string | null
}

export type ClassInsightsSummary = {
  memberCount: number
  totalEvents: number
  failCount: number
  passCount: number
  struggleTopics: ClassStruggleTopic[]
  misconceptions: ClassMisconception[]
  members: ClassMemberInsight[]
}
