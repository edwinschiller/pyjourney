import { getAuth, isNeonAuthConfigured } from "@/lib/auth/server"
import {
  ensureProfile,
  type SessionUser,
  type UserRole,
} from "@/lib/auth/session"
import { ensureAcademyMembership } from "@/lib/db/academy"

export type BootstrapRole = Extract<UserRole, "student" | "teacher">

export const bootstrapAppUser = async (input: {
  role?: BootstrapRole
}): Promise<SessionUser | null> => {
  if (!isNeonAuthConfigured()) {
    return null
  }

  const result = await getAuth().getSession()
  const user = result.data?.user

  if (!user?.id || !user.email) {
    return null
  }

  if (user.emailVerified === false) {
    return null
  }

  const profile = await ensureProfile({
    id: user.id,
    email: user.email,
    displayName: user.name ?? null,
    role: input.role,
  })

  if (profile.role === "student") {
    await ensureAcademyMembership(profile.id)
  }

  return profile
}
