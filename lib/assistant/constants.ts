export const IDE_ASSISTANT_SCOPE = "python-ide" as const

export const ASSISTANT_MAX_MESSAGES = 30
export const ASSISTANT_CONTEXT_MESSAGES = 12
export const ASSISTANT_MAX_QUESTION_CHARS = 4000
export const ASSISTANT_MAX_CODE_CHARS = 80_000
export const ASSISTANT_MAX_TERMINAL_CHARS = 12_000

export const ASSISTANT_PANEL = {
  storageKey: "pyjourney-assistant-width",
  defaultWidth: 360,
  minWidth: 280,
  maxWidth: 560,
} as const

export const LESSON_QUICK_PROMPTS = [
  "I'm stuck — where should I start?",
  "Explain the error in my code",
  "Just a small hint, please",
] as const

export const IDE_QUICK_PROMPTS = [
  "What does the terminal error mean?",
  "How can I improve this code?",
  "Just a small hint, please",
] as const
