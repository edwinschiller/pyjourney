import { and, desc, eq } from "drizzle-orm"

import { getDb } from "@/lib/db"
import { assistantConversations } from "@/lib/db/schema"

export type StoredAssistantMessage = {
  id: string
  role: "user" | "assistant"
  text: string
  createdAt?: string
}

const asMessages = (value: unknown): StoredAssistantMessage[] => {
  if (!Array.isArray(value)) return []
  return value.filter(
    (row): row is StoredAssistantMessage =>
      Boolean(row) &&
      typeof row === "object" &&
      typeof (row as StoredAssistantMessage).id === "string" &&
      ((row as StoredAssistantMessage).role === "user" ||
        (row as StoredAssistantMessage).role === "assistant") &&
      typeof (row as StoredAssistantMessage).text === "string"
  )
}

export const getLatestConversation = async (
  studentId: string,
  scopeKey: string
) => {
  const db = getDb()
  const rows = await db
    .select()
    .from(assistantConversations)
    .where(
      and(
        eq(assistantConversations.studentId, studentId),
        eq(assistantConversations.scopeKey, scopeKey)
      )
    )
    .orderBy(desc(assistantConversations.updatedAt))
    .limit(1)
  const row = rows[0]
  if (!row) return null
  return {
    id: row.id,
    scope: row.scope,
    scopeKey: row.scopeKey,
    title: row.title,
    messages: asMessages(row.messages),
    updatedAt: row.updatedAt,
  }
}

export const createConversation = async (input: {
  studentId: string
  scope: string
  scopeKey: string
  title?: string
}) => {
  const db = getDb()
  const created = await db
    .insert(assistantConversations)
    .values({
      studentId: input.studentId,
      scope: input.scope,
      scopeKey: input.scopeKey,
      title: input.title ?? "Chat",
      messages: [],
    })
    .returning()
  return created[0]!
}

export const saveConversationMessages = async (input: {
  conversationId: string
  studentId: string
  messages: StoredAssistantMessage[]
  title?: string
}) => {
  const db = getDb()
  await db
    .update(assistantConversations)
    .set({
      messages: input.messages,
      ...(input.title ? { title: input.title } : {}),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(assistantConversations.id, input.conversationId),
        eq(assistantConversations.studentId, input.studentId)
      )
    )
}

export const listConversations = async (
  studentId: string,
  scopeKey: string,
  limit = 12
) => {
  const db = getDb()
  const rows = await db
    .select({
      id: assistantConversations.id,
      title: assistantConversations.title,
      messages: assistantConversations.messages,
      updatedAt: assistantConversations.updatedAt,
    })
    .from(assistantConversations)
    .where(
      and(
        eq(assistantConversations.studentId, studentId),
        eq(assistantConversations.scopeKey, scopeKey)
      )
    )
    .orderBy(desc(assistantConversations.updatedAt))
    .limit(limit)

  return rows.map((row) => {
    const messages = asMessages(row.messages)
    const last = messages[messages.length - 1]
    return {
      id: row.id,
      title: row.title,
      messageCount: messages.length,
      preview: last?.text?.slice(0, 120) ?? null,
      updatedAt: row.updatedAt.toISOString(),
    }
  })
}

export const getConversationForStudent = async (
  conversationId: string,
  studentId: string
) => {
  const db = getDb()
  const rows = await db
    .select()
    .from(assistantConversations)
    .where(
      and(
        eq(assistantConversations.id, conversationId),
        eq(assistantConversations.studentId, studentId)
      )
    )
    .limit(1)
  const row = rows[0]
  if (!row) return null
  return {
    id: row.id,
    scope: row.scope,
    scopeKey: row.scopeKey,
    title: row.title,
    messages: asMessages(row.messages),
    updatedAt: row.updatedAt,
  }
}

export const deleteConversation = async (
  conversationId: string,
  studentId: string
) => {
  const db = getDb()
  await db
    .delete(assistantConversations)
    .where(
      and(
        eq(assistantConversations.id, conversationId),
        eq(assistantConversations.studentId, studentId)
      )
    )
}
