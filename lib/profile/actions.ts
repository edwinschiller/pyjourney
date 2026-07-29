"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { getSessionUser } from "@/lib/auth/session"
import { getDb, profiles } from "@/lib/db"

export type UpdateDisplayNameResult =
  | { ok: true; displayName: string }
  | { ok: false; error: string }

export const updateDisplayNameAction = async (
  rawName: string
): Promise<UpdateDisplayNameResult> => {
  const user = await getSessionUser()
  if (!user || user.status !== "active") {
    return { ok: false, error: "You must be signed in." }
  }

  const displayName = rawName.trim().replace(/\s+/g, " ")
  if (displayName.length < 2) {
    return { ok: false, error: "Display name needs at least 2 characters." }
  }
  if (displayName.length > 80) {
    return { ok: false, error: "Display name must be at most 80 characters." }
  }

  const db = getDb()
  await db
    .update(profiles)
    .set({ displayName, updatedAt: new Date() })
    .where(eq(profiles.id, user.id))

  revalidatePath("/", "layout")
  return { ok: true, displayName }
}
