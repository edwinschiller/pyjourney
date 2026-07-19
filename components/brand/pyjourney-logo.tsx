import Image from "next/image"

import { cn } from "@/lib/utils"

type PyJourneyLogoProps = {
  className?: string
  variant?: "full" | "compact"
}

const FULL_LOGO_WIDTH = 220
const FULL_LOGO_HEIGHT = 68

/** Full PyJourney logo with wordmark (transparent background) */
export const PyJourneyLogo = ({
  className,
  variant = "full",
}: PyJourneyLogoProps) => {
  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2.5", className)}>
        <Image
          src="/brand/icon.svg"
          alt=""
          width={40}
          height={40}
          className="shrink-0"
          aria-hidden
          priority
        />
        <div>
          <p className="text-sm font-bold leading-tight text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
            PyJourney
          </p>
          <p className="text-[11px] text-[var(--app-muted)]">Learn Python</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Image
        src="/brand/pyjourney-logo.svg"
        alt="PyJourney – Learn Python"
        width={FULL_LOGO_WIDTH}
        height={FULL_LOGO_HEIGHT}
        className={cn("h-auto w-auto max-w-[220px] dark:hidden", className)}
        priority
      />
      <Image
        src="/brand/pyjourney-logo-dark.svg"
        alt="PyJourney – Learn Python"
        width={FULL_LOGO_WIDTH}
        height={FULL_LOGO_HEIGHT}
        className={cn("hidden h-auto w-auto max-w-[220px] dark:block", className)}
        priority
      />
    </>
  )
}
