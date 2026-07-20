import {
  parseLessonSession,
  type LessonSession,
} from "@/lib/ai/schemas/lesson-blocks"
import { block, fb, resetBlockIdCounter } from "@/lib/lessons/block-builders"

/**
 * Spine for Variables.
 * Adaptive sessions omit `complete` — the director appends it after coding passes.
 * Linear (non-adaptive) sessions include complete at the end.
 */
export const buildVariablesSpine = (options?: {
  includeComplete?: boolean
}) => {
  resetBlockIdCounter(0)
  const includeComplete = options?.includeComplete ?? false

  const spine = [
    block.intro(
      [
        "A variable is a name that points to a value.",
        'Create one with a single equals sign: name = "Ada"',
        "Later you can reuse that name in print() or other expressions.",
      ],
      "Variables",
      "var-intro-1"
    ),
    block.predict(
      "What does print(age) show?",
      "age = 16\nprint(age)",
      [
        { id: "16", label: "16" },
        { id: "age", label: "age" },
        { id: "err", label: "An error" },
        { id: "str", label: '"16"' },
      ],
      "16",
      fb(
        "print shows the value stored in age — the number 16.",
        "print(age) prints the value, not the variable name."
      ),
      "var-predict-1"
    ),
    block.mc(
      "Which line correctly stores the text Hello?",
      [
        { id: "a", label: 'msg = "Hello"' },
        { id: "b", label: 'msg == "Hello"' },
        { id: "c", label: 'print("Hello")' },
        { id: "d", label: "Hello = msg" },
      ],
      "a",
      fb(
        "Single = assigns. Double == compares.",
        "Use one equals sign to create a variable."
      ),
      undefined,
      "var-mc-1"
    ),
    block.fill(
      "Store your city in a variable.",
      'city = "___"',
      [],
      fb(
        "Nice — that string is stored in city.",
        'Put text in quotes: city = "Berlin"'
      ),
      "Berlin",
      "var-fill-1"
    ),
    block.debug(
      "What is wrong with this line?",
      "city = Berlin",
      [
        { id: "quotes", label: 'Text needs quotes: "Berlin"' },
        { id: "equals", label: "The = sign is wrong" },
        { id: "ok", label: "Nothing — it is fine" },
      ],
      "quotes",
      fb(
        'Without quotes, Python looks for a variable named Berlin.',
        'Always wrap text in quotes.'
      ),
      "var-debug-1"
    ),
    block.miniEdit(
      "Add a second variable and print it.",
      [
        "Keep the existing name variable.",
        'Add level = 1 and print both values.',
      ],
      'name = "Ada"\nprint(name)',
      ["level", "print"],
      fb(
        "You created another variable and printed it.",
        "Add level = 1 and a print that uses it."
      ),
      "var-mini-1"
    ),
    block.coding({
      id: "var-coding-1",
      title: "Say hello with variables",
      lines: [
        'Create learner with the string "PyJourney".',
        "Create level with the number 1.",
        'Print exactly: PyJourney is on level 1',
      ],
      starterCode: `learner = ""
level = 0

# Print: PyJourney is on level 1
`,
      successCriteria: 'Printed line contains "PyJourney is on level 1".',
      tests: [
        {
          id: "learner-value",
          description: 'learner equals "PyJourney"',
          assertion:
            'assert learner == "PyJourney", f"Expected learner to be \'PyJourney\', got {learner!r}"',
        },
        {
          id: "level-value",
          description: "level equals 1",
          assertion:
            'assert level == 1, f"Expected level to be 1, got {level!r}"',
        },
        {
          id: "output-sentence",
          description: 'stdout includes "PyJourney is on level 1"',
          expectsStdoutIncludes: "PyJourney is on level 1",
        },
      ],
    }),
  ]

  if (includeComplete) {
    spine.push(
      block.complete(
        "Variables unlocked",
        [
          "You can store values and reuse them.",
          "Next concepts will build on this.",
        ],
        "var-complete-1"
      )
    )
  }

  return spine
}

export const buildVariablesLessonSession = (options?: {
  adaptive?: boolean
}): LessonSession => {
  const adaptive = options?.adaptive ?? true
  const blocks = buildVariablesSpine({ includeComplete: !adaptive })

  return parseLessonSession({
    version: 2,
    title: "Variables: store and reuse values",
    objective:
      "Create variables, assign values, and use them in print statements.",
    conceptSlug: "variables",
    adaptive,
    blocks,
    cursor: 0,
    events: [],
    codingPassed: false,
    adaptationCount: 0,
  })
}

export const TEMPLATE_SESSIONS_BY_SLUG: Record<
  string,
  (options?: { adaptive?: boolean }) => LessonSession
> = {
  variables: buildVariablesLessonSession,
}

export const getTemplateSessionForSlug = (
  slug: string,
  options?: { adaptive?: boolean }
) => {
  const builder = TEMPLATE_SESSIONS_BY_SLUG[slug]
  if (!builder) return null
  return builder(options)
}

export const hasTemplateLessonForSlug = (slug: string) =>
  Boolean(TEMPLATE_SESSIONS_BY_SLUG[slug])

/** Remediation packs the director can inject for Variables. */
export const VARIABLES_REMEDIATION = {
  assignBasics: () => {
    resetBlockIdCounter(800)
    return [
      block.intro(
        [
          "Remember: name = value stores something.",
          'Text needs quotes. Numbers do not: age = 16',
        ],
        "Quick review",
        "var-rem-intro"
      ),
      block.mc(
        "Pick the correct assignment.",
        [
          { id: "a", label: 'city = "Oslo"' },
          { id: "b", label: 'city == "Oslo"' },
          { id: "c", label: "city -> Oslo" },
        ],
        "a",
        fb("Yes — single = assigns.", "Try again with a single equals sign."),
        undefined,
        "var-rem-mc"
      ),
    ]
  },
  codingScaffold: () => {
    resetBlockIdCounter(900)
    return [
      block.miniEdit(
        "Warm-up before the challenge",
        [
          'Set learner to "PyJourney" and level to 1.',
          "You do not need the full sentence yet.",
        ],
        `learner = ""
level = 0
`,
        ['"PyJourney"', "1"],
        fb(
          "Ready for the full exercise.",
          'Set learner = "PyJourney" and level = 1.'
        ),
        "var-rem-mini"
      ),
    ]
  },
  complete: () => {
    resetBlockIdCounter(950)
    return [
      block.complete(
        "Variables unlocked",
        [
          "You stored values and printed with them.",
          "The path ahead builds on this skill.",
        ],
        "var-complete-adapt"
      ),
    ]
  },
}
