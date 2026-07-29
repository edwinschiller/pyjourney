import Link from "next/link"
import type { PropsWithChildren } from "react"

import { PyJourneyLogo } from "@/components/brand/pyjourney-logo"
import { SiteFooter } from "@/components/layout/site-footer"
import { ThemeToggle } from "@/components/theme/theme-toggle"

export const LegalPage = ({
  title,
  children,
}: PropsWithChildren<{ title: string }>) => {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-fg)]">
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-10">
        <header className="mb-10 flex items-center justify-between gap-4">
          <Link href="/" aria-label="PyJourney home">
            <PyJourneyLogo variant="compact" />
          </Link>
          <ThemeToggle />
        </header>

        <main className="pb-12">
          <Link
            href="/"
            className="text-sm font-medium text-[var(--app-accent)] hover:underline"
          >
            ← Back to home
          </Link>

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            {title}
          </h1>

          <div className="mt-8 space-y-6 text-sm leading-relaxed text-[var(--app-muted)]">
            {children}
          </div>
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}

export const LegalSection = ({
  title,
  children,
}: PropsWithChildren<{ title: string }>) => {
  return (
    <section>
      <h2 className="text-base font-bold text-[var(--app-fg)]">{title}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  )
}
