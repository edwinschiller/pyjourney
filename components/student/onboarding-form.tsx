"use client"

import { useRouter } from "next/navigation"
import {
  useActionState,
  useEffect,
  useState,
  type KeyboardEvent,
} from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  completeOnboardingAction,
  CUSTOM_GOAL_VALUE,
  EXPERIENCE_OPTIONS,
  GOAL_OPTIONS,
  INTEREST_TAG_OPTIONS,
  MAX_GOAL_LENGTH,
  MAX_INTEREST_LENGTH,
  MAX_INTEREST_TAGS,
  PACE_OPTIONS,
  type OnboardingActionState,
} from "@/lib/onboarding"
import { cn } from "@/lib/utils"

const initialState: OnboardingActionState = null

type InterestItem =
  | { kind: "preset"; id: string; label: string }
  | { kind: "custom"; label: string }

export const OnboardingForm = () => {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(
    completeOnboardingAction,
    initialState
  )
  const [goalChoice, setGoalChoice] = useState<string>("")
  const [customGoal, setCustomGoal] = useState("")
  const [selectedInterests, setSelectedInterests] = useState<InterestItem[]>([])
  const [customInterestDraft, setCustomInterestDraft] = useState("")

  useEffect(() => {
    if (!state?.ok || !state.redirectTo) {
      return
    }
    router.push(state.redirectTo)
    router.refresh()
  }, [state, router])

  const handlePresetInterestToggle = (id: string, label: string) => {
    setSelectedInterests((current) => {
      const exists = current.some(
        (item) => item.kind === "preset" && item.id === id
      )
      if (exists) {
        return current.filter(
          (item) => !(item.kind === "preset" && item.id === id)
        )
      }
      if (current.length >= MAX_INTEREST_TAGS) {
        return current
      }
      return [...current, { kind: "preset", id, label }]
    })
  }

  const handleAddCustomInterest = () => {
    const label = customInterestDraft.trim().replace(/\s+/g, " ")
    if (label.length < 2 || label.length > MAX_INTEREST_LENGTH) {
      return
    }
    setSelectedInterests((current) => {
      if (current.length >= MAX_INTEREST_TAGS) {
        return current
      }
      const duplicate = current.some(
        (item) => item.label.toLowerCase() === label.toLowerCase()
      )
      if (duplicate) {
        return current
      }
      return [...current, { kind: "custom", label }]
    })
    setCustomInterestDraft("")
  }

  const handleRemoveInterest = (label: string) => {
    setSelectedInterests((current) =>
      current.filter((item) => item.label !== label)
    )
  }

  const handleCustomInterestKeyDown = (
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key !== "Enter") {
      return
    }
    event.preventDefault()
    handleAddCustomInterest()
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
                checked={goalChoice === option.id}
                onChange={() => setGoalChoice(option.id)}
                disabled={pending}
                className="size-4 accent-[var(--brand-blue)]"
                aria-label={option.label}
              />
              <span className="text-sm font-medium">{option.label}</span>
            </label>
          ))}
          <label className="app-surface flex cursor-pointer flex-col gap-3 rounded-xl p-4 has-[:checked]:border-[var(--brand-blue)] has-[:checked]:bg-[var(--app-accent-soft)]">
            <span className="flex items-center gap-3">
              <input
                type="radio"
                name="goal"
                value={CUSTOM_GOAL_VALUE}
                required
                checked={goalChoice === CUSTOM_GOAL_VALUE}
                onChange={() => setGoalChoice(CUSTOM_GOAL_VALUE)}
                disabled={pending}
                className="size-4 accent-[var(--brand-blue)]"
                aria-label="Something else"
              />
              <span className="text-sm font-medium">Something else</span>
            </span>
            {goalChoice === CUSTOM_GOAL_VALUE ? (
              <div className="flex flex-col gap-2 pl-7">
                <Label htmlFor="custom-goal">Your goal</Label>
                <Input
                  id="custom-goal"
                  name="customGoal"
                  value={customGoal}
                  onChange={(event) => setCustomGoal(event.target.value)}
                  maxLength={MAX_GOAL_LENGTH}
                  required
                  placeholder="e.g. Automate spreadsheets for my club"
                  disabled={pending}
                  aria-label="Custom learning goal"
                />
              </div>
            ) : null}
          </label>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-lg font-semibold text-[var(--brand-navy)] dark:text-[var(--app-fg)]">
          Interests
        </legend>
        <p className="text-sm text-[var(--app-muted)]">
          Pick or add up to {MAX_INTEREST_TAGS}. These help shape later lessons.
        </p>
        <div className="flex flex-wrap gap-2">
          {INTEREST_TAG_OPTIONS.map((option) => {
            const checked = selectedInterests.some(
              (item) => item.kind === "preset" && item.id === option.id
            )
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
                  checked={checked}
                  disabled={disabled}
                  onChange={() =>
                    handlePresetInterestToggle(option.id, option.label)
                  }
                  className="size-4 accent-[var(--brand-blue)]"
                  aria-label={option.label}
                />
                {option.label}
              </label>
            )
          })}
        </div>

        {selectedInterests.map((item) => (
          <input
            key={`${item.kind}-${item.label}`}
            type="hidden"
            name="interestTags"
            value={item.kind === "preset" ? item.id : item.label}
          />
        ))}

        {selectedInterests.some((item) => item.kind === "custom") ? (
          <div className="flex flex-wrap gap-2">
            {selectedInterests
              .filter((item) => item.kind === "custom")
              .map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleRemoveInterest(item.label)}
                  disabled={pending}
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--brand-blue)] bg-[var(--app-accent-soft)] px-3 py-1.5 text-sm"
                  aria-label={`Remove interest ${item.label}`}
                >
                  {item.label}
                  <span aria-hidden>×</span>
                </button>
              ))}
          </div>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Label htmlFor="custom-interest">Add your own interest</Label>
            <Input
              id="custom-interest"
              value={customInterestDraft}
              onChange={(event) => setCustomInterestDraft(event.target.value)}
              onKeyDown={handleCustomInterestKeyDown}
              maxLength={MAX_INTEREST_LENGTH}
              placeholder="e.g. Robotics"
              disabled={
                pending || selectedInterests.length >= MAX_INTEREST_TAGS
              }
              aria-label="Custom interest"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddCustomInterest}
            disabled={
              pending ||
              selectedInterests.length >= MAX_INTEREST_TAGS ||
              customInterestDraft.trim().length < 2
            }
            aria-label="Add custom interest"
          >
            Add
          </Button>
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
          disabled={pending || selectedInterests.length === 0 || !goalChoice}
          aria-label="Finish onboarding and go to dashboard"
        >
          {pending ? "Saving…" : "Start learning"}
        </Button>
      </div>
    </form>
  )
}
