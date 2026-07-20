"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { requireRole } from "@/lib/auth/session"
import { getDb, profiles } from "@/lib/db"
import { bootstrapMasteryFromExperience } from "@/lib/mastery"

import { isOnboardingComplete, parseOnboardingFormData } from "./parse"
import type { StudentOnboarding } from "./types"

export type OnboardingActionState = {
  ok: boolean
  error?: string
  redirectTo?: string
} | null

export const completeOnboardingAction = async (
  _prev: OnboardingActionState,
  formData: FormData
): Promise<OnboardingActionState> => {
  const user = await requireRole(["student"])

  if (isOnboardingComplete(user.onboarding)) {
    return { ok: true, redirectTo: "/student" }
  }

  const parsed = parseOnboardingFormData(formData)
  if (!parsed.ok) {
    return { ok: false, error: parsed.error }
  }

  const onboarding: StudentOnboarding = {
    ...parsed.data,
    completedAt: new Date().toISOString(),
  }

  try {
    const db = getDb()
    await db
      .update(profiles)
      .set({
        onboarding,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, user.id))

    await bootstrapMasteryFromExperience(
      user.id,
      parsed.data.priorExperience
    )

    revalidatePath("/student")
    revalidatePath("/student/learn")
    revalidatePath("/onboarding")

    return { ok: true, redirectTo: "/student" }
  } catch (error) {
    console.error("completeOnboardingAction", error)
    return {
      ok: false,
      error: "Could not save onboarding. Try again.",
    }
  }
}
