import { redirect } from "next/navigation"

import { requireRole } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

/** Onboarding removed — mastery starts at 0; send students to the dashboard. */
const OnboardingPage = async () => {
  await requireRole(["student"])
  redirect("/student")
}

export default OnboardingPage
