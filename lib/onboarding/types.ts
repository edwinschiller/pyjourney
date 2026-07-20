import type { PriorExperience } from "@/lib/mastery"

export type LearningPace = "slow" | "normal" | "fast"

export type StudentOnboarding = {
  completedAt: string
  priorExperience: PriorExperience
  goal: string
  interestTags: string[]
  pace: LearningPace
}

export const INTEREST_TAG_OPTIONS = [
  { id: "games", label: "Games" },
  { id: "data", label: "Data & charts" },
  { id: "automation", label: "Automation" },
  { id: "web", label: "Web basics" },
  { id: "ai", label: "AI curiosity" },
  { id: "school", label: "School projects" },
] as const

export const GOAL_OPTIONS = [
  { id: "first_steps", label: "Take my first steps in Python" },
  { id: "school", label: "Keep up with school or classwork" },
  { id: "projects", label: "Build small projects on my own" },
  { id: "confident", label: "Feel confident reading and writing code" },
] as const

export const EXPERIENCE_OPTIONS: Array<{
  id: PriorExperience
  label: string
  description: string
}> = [
  {
    id: "none",
    label: "None",
    description: "I am completely new to programming.",
  },
  {
    id: "little",
    label: "A little",
    description: "I have tried a few tutorials or lessons.",
  },
  {
    id: "some",
    label: "Some",
    description: "I know basic ideas like variables and prints.",
  },
  {
    id: "confident",
    label: "Confident",
    description: "I can write small programs with help.",
  },
]

export const PACE_OPTIONS: Array<{
  id: LearningPace
  label: string
  description: string
}> = [
  {
    id: "slow",
    label: "Steady",
    description: "Shorter steps, more practice.",
  },
  {
    id: "normal",
    label: "Balanced",
    description: "A mix of explanation and coding.",
  },
  {
    id: "fast",
    label: "Challenging",
    description: "Move quicker when I am ready.",
  },
]

export const MAX_INTEREST_TAGS = 3
export const MAX_GOAL_LENGTH = 120
export const MAX_INTEREST_LENGTH = 40
export const CUSTOM_GOAL_VALUE = "custom"
