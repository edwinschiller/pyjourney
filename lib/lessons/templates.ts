import type { LessonContent } from "@/lib/ai/schemas/lesson"

/** Hand-authored template used until AI generation (Commit 11). */
export const VARIABLES_LESSON_TEMPLATE: LessonContent = {
  title: "Variables: store and reuse values",
  objective:
    "Create variables, assign values, and use them in print statements.",
  explanation: `In Python, a variable is a name that points to a value.

You create one with \`=\`:

\`\`\`python
name = "Ada"
age = 16
\`\`\`

You can then reuse those names later in your program. Variable names should be clear and usually use snake_case (like \`favorite_color\`).`,
  example: `city = "Berlin"
print("I live in", city)

score = 10
score = score + 5
print(score)`,
  comprehensionCheck: {
    question: "Which line correctly creates a variable holding the text Hello?",
    options: [
      'msg = "Hello"',
      'msg == "Hello"',
      'print("Hello")',
      "Hello = msg",
    ],
    correctIndex: 0,
    explanation:
      "Use a single equals sign to assign. Double equals (==) compares values.",
  },
  exercise: `Create two variables:
1. \`learner\` with the string value \`"PyJourney"\`
2. \`level\` with the number \`1\`

Then print exactly:
\`PyJourney is on level 1\`

Tip: you can build the sentence with an f-string:
\`print(f"{learner} is on level {level}")\``,
  starterCode: `learner = ""
level = 0

# Print: PyJourney is on level 1
`,
  visibleExamples: ['name = "Ada"', 'print(f"Hello, {name}")'],
  tests: [
    {
      id: "learner-value",
      description: 'Variable learner equals "PyJourney"',
      assertion:
        'assert learner == "PyJourney", f"Expected learner to be \'PyJourney\', got {learner!r}"',
    },
    {
      id: "level-value",
      description: "Variable level equals 1",
      assertion:
        'assert level == 1, f"Expected level to be 1, got {level!r}"',
    },
    {
      id: "output-sentence",
      description: 'Printed output contains "PyJourney is on level 1"',
      expectsStdoutIncludes: "PyJourney is on level 1",
    },
  ],
}

export const TEMPLATE_LESSONS_BY_SLUG: Record<string, LessonContent> = {
  variables: VARIABLES_LESSON_TEMPLATE,
}

export const getTemplateLessonForSlug = (slug: string) =>
  TEMPLATE_LESSONS_BY_SLUG[slug] ?? null

export const hasTemplateLessonForSlug = (slug: string) =>
  Boolean(TEMPLATE_LESSONS_BY_SLUG[slug])
