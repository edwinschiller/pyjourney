"use client"

import { useRouter } from "next/navigation"
import { useActionState, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  completeOnboardingAction,
  EXPERIENCE_OPTIONS,
  GOAL_OPTIONS,
  INTEREST_TAG_OPTIONS,
  MAX_INTEREST_TAGS,
  PACE_OPTIONS,
  type OnboardingActionState,
} from "@/lib/onboarding"
import { cn } from "@/lib/utils"

const initialState: OnboardingActionState = null

export const OnboardingForm = () => {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(
    completeOnboardingAction,
    initialState
  )
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  useEffect(() => {
    if (!state?.ok || !state.redirectTo) {
      return
    }
    router.push(state.redirectTo)
    router.refresh()
  }, [state, router])

  const handleInterestToggle = (id: string) => {
    setSelectedInterests((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id)
      }
      if (current.length >= MAX_INTEREST_TAGS) {
        return current
      }
      return [...current, id]
    })
  }

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <fieldset className="flex flex-col gap-3">
        <legend className="text-lg font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          Your experience
        </legend>
        <p className="text-sm text-[var(--app-muted)]">
          This sets your starting mastery for early concepts.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {EXPERIENCE_OPTIONS.map((option) => (
            <label
              key={option.id}
              className="app-surface flex cursor-pointer flex-col gap-1 rounded-xl p-4 has-[:checked]:border-[var(--brand-blue)] has-[:checked]:bg-[var(--app-accent-soft)]"
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="priorExperience"
                  value={option.id}
                  required
                  disabled={pending}
                  className="size-4 accent-[var(--brand-blue)]"
                  aria-label={option.label}
                />
                <span className="font-medium">{option.label}</span>
              </span>
              <span className="pl-6 text-sm text-[var(--app-muted)]">
                {option.description}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-lg font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          Your goal
        </legend>
        <div className="grid gap-2">
          {GOAL_OPTIONS.map((option) => (
            <label
              key={option.id}
              className="app-surface flex cursor-pointer items-center gap-3 rounded-xl p-4 has-[:checked]:border-[var(--brand-blue)] has-[:checked]:bg-[var(--app-accent-soft)]"
            >
              <input
                type="radio"
                name="goal"
                value={option.id}
                required
                disabled={pending}
                className="size-4 accent-[var(--brand-blue)]"
                aria-label={option.label}
              />
              <span className="text-sm font-medium">{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-lg font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          Interests
        </legend>
        <p className="text-sm text-[var(--app-muted)]">
          Pick up to {MAX_INTEREST_TAGS}. These help shape later lessons.
        </p>
        <div className="flex flex-wrap gap-2">
          {INTEREST_TAG_OPTIONS.map((option) => {
            const checked = selectedInterests.includes(option.id)
            const disabled =
              pending ||
              (!checked && selectedInterests.length >= MAX_INTEREST_TAGS)

            return (
              <label
                key={option.id}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm",
                  checked &&
                    "border-[var(--brand-blue)] bg-[var(--app-accent-soft)]",
                  disabled && !checked && "opacity-50"
                )}
              >
                <input
                  type="checkbox"
                  name="interestTags"
                  value={option.id}
                  checked={checked}
                  disabled={disabled}
                  onChange={() => handleInterestToggle(option.id)}
                  className="size-4 accent-[var(--brand-blue)]"
                  aria-label={option.label}
                />
                {option.label}
              </label>
            )
          })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-lg font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          Learning pace
        </legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {PACE_OPTIONS.map((option) => (
            <label
              key={option.id}
              className="app-surface flex cursor-pointer flex-col gap-1 rounded-xl p-4 has-[:checked]:border-[var(--brand-blue)] has-[:checked]:bg-[var(--app-accent-soft)]"
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pace"
                  value={option.id}
                  required
                  defaultChecked={option.id === "normal"}
                  disabled={pending}
                  className="size-4 accent-[var(--brand-blue)]"
                  aria-label={option.label}
                />
                <span className="font-medium">{option.label}</span>
              </span>
              <span className="pl-6 text-sm text-[var(--app-muted)]">
                {option.description}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label className="sr-only" htmlFor="onboarding-submit">
          Finish onboarding
        </Label>
        <Button
          id="onboarding-submit"
          type="submit"
          size="lg"
          disabled={pending || selectedInterests.length === 0}
          aria-label="Finish onboarding and go to dashboard"
        >
          {pending ? "Saving…" : "Start learning"}
        </Button>
      </div>
    </form>
  )
}
