"use server"

import { requireRole } from "@/lib/auth/session"

export type OnboardingActionState = {
  ok: boolean
  error?: string
  redirectTo?: string
} | null

/** Onboarding removed — keep action as a no-op redirect for any stale forms. */
export const completeOnboardingAction = async (
  _prev: OnboardingActionState,
  _formData: FormData
): Promise<OnboardingActionState> => {
  await requireRole(["student"])
  return { ok: true, redirectTo: "/student" }
}
