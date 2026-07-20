import Link from "next/link"
import { redirect } from "next/navigation"

import { PyJourneyLogo } from "@/components/brand/pyjourney-logo"
import { OnboardingForm } from "@/components/student/onboarding-form"
import { requireRole } from "@/lib/auth/session"
import { isOnboardingComplete } from "@/lib/onboarding"

export const dynamic = "force-dynamic"

const OnboardingPage = async () => {
  const user = await requireRole(["student"])

  if (isOnboardingComplete(user.onboarding)) {
    redirect("/student")
  }

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div
          className="absolute -left-20 top-10 h-64 w-64 rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--brand-blue)" }}
        />
        <div
          className="absolute -right-16 bottom-20 h-56 w-56 rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--brand-yellow)" }}
        />
      </div>

      <header className="flex flex-col gap-4">
        <Link href="/" aria-label="PyJourney home">
          <PyJourneyLogo variant="compact" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            Set up your learning path
          </h1>
          <p className="mt-2 text-base text-[var(--app-muted)]">
            Welcome{user.displayName ? `, ${user.displayName}` : ""}. A few
            quick choices help us place you on the right concepts.
          </p>
        </div>
      </header>

      <OnboardingForm />
    </div>
  )
}

export default OnboardingPage
