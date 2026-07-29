"use server"

import { and, eq, ne } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { requireRole, type UserRole } from "@/lib/auth/session"
import { countAdmins } from "@/lib/admin/queries"
import { SYSTEM_ACADEMY_TEACHER_ID } from "@/lib/db/constants"
import { getDb } from "@/lib/db"
import { profiles } from "@/lib/db/schema"

export type AdminActionState = {
  ok: boolean
  error?: string
} | null

const ROLES: UserRole[] = ["student", "teacher", "admin"]
const STATUSES = ["active", "disabled"] as const

export const updateUserRoleAction = async (
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> => {
  const admin = await requireRole(["admin"])
  const userId = String(formData.get("userId") ?? "").trim()
  const role = String(formData.get("role") ?? "").trim() as UserRole

  if (!userId || !ROLES.includes(role)) {
    return { ok: false, error: "Invalid role update." }
  }

  if (userId === SYSTEM_ACADEMY_TEACHER_ID) {
    return { ok: false, error: "The system academy account cannot be changed." }
  }

  if (userId === admin.id && role !== "admin") {
    return { ok: false, error: "You cannot remove your own admin role." }
  }

  const db = getDb()
  const rows = await db
    .select({
      id: profiles.id,
      role: profiles.role,
      status: profiles.status,
    })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1)

  const target = rows[0]
  if (!target) return { ok: false, error: "User not found." }

  if (target.role === "admin" && role !== "admin") {
    const admins = await countAdmins()
    if (admins <= 1) {
      return { ok: false, error: "Keep at least one active admin." }
    }
  }

  await db
    .update(profiles)
    .set({ role, updatedAt: new Date() })
    .where(eq(profiles.id, userId))

  revalidatePath("/admin")
  revalidatePath("/admin/users")
  return { ok: true }
}

export const updateUserStatusAction = async (
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> => {
  const admin = await requireRole(["admin"])
  const userId = String(formData.get("userId") ?? "").trim()
  const status = String(formData.get("status") ?? "").trim() as
    | "active"
    | "disabled"

  if (!userId || !STATUSES.includes(status)) {
    return { ok: false, error: "Invalid status update." }
  }

  if (userId === SYSTEM_ACADEMY_TEACHER_ID) {
    return { ok: false, error: "The system academy account cannot be changed." }
  }

  if (userId === admin.id && status === "disabled") {
    return { ok: false, error: "You cannot disable your own account." }
  }

  const db = getDb()
  const rows = await db
    .select({
      id: profiles.id,
      role: profiles.role,
      status: profiles.status,
    })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1)

  const target = rows[0]
  if (!target) return { ok: false, error: "User not found." }

  if (target.role === "admin" && status === "disabled") {
    const otherAdmins = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(
        and(
          eq(profiles.role, "admin"),
          eq(profiles.status, "active"),
          ne(profiles.id, userId)
        )
      )
      .limit(1)
    if (!otherAdmins[0]) {
      return { ok: false, error: "Keep at least one active admin." }
    }
  }

  await db
    .update(profiles)
    .set({ status, updatedAt: new Date() })
    .where(eq(profiles.id, userId))

  revalidatePath("/admin")
  revalidatePath("/admin/users")
  return { ok: true }
}
