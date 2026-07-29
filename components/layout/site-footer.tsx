import Link from "next/link"

import { cn } from "@/lib/utils"

const OWNER_SITE = "https://edwinschiller.com"

type SiteFooterProps = {
  className?: string
}

export const SiteFooter = ({ className }: SiteFooterProps) => {
  return (
    <footer
      className={cn(
        "border-t border-[var(--app-border)] py-6 text-center text-xs text-[var(--app-muted)]",
        className
      )}
    >
      <p>© {new Date().getFullYear()} PyJourney</p>
      <p className="mt-2">
        <Link
          href="/privacy"
          className="font-medium text-[var(--app-accent)] hover:underline"
        >
          Privacy
        </Link>
        <span className="mx-1.5 text-[var(--app-border)]" aria-hidden>
          ·
        </span>
        <a
          href={OWNER_SITE}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[var(--app-accent)] hover:underline"
        >
          Edwin Schiller
        </a>
        <span className="mx-1.5 text-[var(--app-border)]" aria-hidden>
          ·
        </span>
        <a
          href={`${OWNER_SITE}/#contact`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[var(--app-accent)] hover:underline"
        >
          Contact
        </a>
      </p>
    </footer>
  )
}
