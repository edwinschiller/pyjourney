import type {
  LessonBlock,
  LessonSession,
  PyjoNextOutput,
} from "@/lib/ai/schemas/lesson-blocks"
import type { PyjoIntent } from "@/lib/pyjo/policy"

let seq = 0
const id = (prefix: string) => {
  seq += 1
  return `pyjo-${prefix}-${Date.now().toString(36)}-${seq}`
}

const fb = (correct: string, wrong: string) => ({ correct, wrong })

/** Deterministic block bank for Variables when AI is offline. */
export const buildVariablesBlocksForIntent = (
  intent: PyjoIntent,
  session: LessonSession
): PyjoNextOutput => {
  const speakFor = (intent: PyjoIntent): string => {
    switch (intent) {
      case "explain":
        return "Hey — I'm PyJo. Let's lock in how variables work."
      case "quiz_easy":
        return "Quick check — take your time."
      case "quiz_hard":
        return "You're moving fast. Here's a tougher one."
      case "remediate":
        return "No stress — that trip-up is common. Here's a clearer take."
      case "scaffold":
        return "Let's warm up with a smaller edit, then retry the challenge."
      case "coding":
        return "Time to write it yourself. I'll check with real tests."
      case "complete":
        return "Nice work — variables are unlocked for you."
      default:
        return "Let's keep going."
    }
  }

  const blocks: LessonBlock[] = []

  if (intent === "explain" || intent === "remediate") {
    blocks.push({
      id: id("intro"),
      kind: "intro",
      title: intent === "remediate" ? "Quick review" : "Variables",
      lines:
        intent === "remediate"
          ? [
              "A single = assigns a value. Double == compares.",
              'Text needs quotes: city = "Berlin"',
              "Numbers do not: level = 1",
            ]
          : [
              "A variable is a name that points to a value.",
              'Create one with: name = "Ada"',
              "Reuse that name later in print() or expressions.",
            ],
    })
  }

  if (intent === "quiz_easy" || intent === "explain") {
    blocks.push({
      id: id("mc-easy"),
      kind: "multipleChoice",
      prompt: "Which line stores the text Hello?",
      choices: [
        { id: "a", label: 'msg = "Hello"' },
        { id: "b", label: 'msg == "Hello"' },
        { id: "c", label: 'print("Hello")' },
      ],
      correctId: "a",
      feedback: fb(
        "Single = assigns. Nice.",
        "Use one equals sign to assign."
      ),
    })
  }

  if (intent === "quiz_hard") {
    blocks.push({
      id: id("predict-hard"),
      kind: "prediction",
      prompt: "What does this print?",
      code: 'a = 2\nb = a\na = 5\nprint(b)',
      choices: [
        { id: "2", label: "2" },
        { id: "5", label: "5" },
        { id: "err", label: "Error" },
      ],
      correctId: "2",
      feedback: fb(
        "b still holds the old value 2 — assignment copies the value.",
        "b was set to 2 before a changed."
      ),
    })
  }

  if (intent === "remediate" && blocks.length < 2) {
    blocks.push({
      id: id("debug"),
      kind: "debug",
      prompt: "What is wrong here?",
      code: "city = Berlin",
      choices: [
        { id: "quotes", label: 'Needs quotes: "Berlin"' },
        { id: "ok", label: "Nothing" },
      ],
      correctId: "quotes",
      feedback: fb(
        "Without quotes Python looks for a variable named Berlin.",
        "Wrap text in quotes."
      ),
    })
  }

  if (intent === "scaffold") {
    blocks.push({
      id: id("mini"),
      kind: "miniEdit",
      prompt: "Warm-up: set the two values",
      lines: [
        'Set learner to "PyJourney" and level to 1.',
      ],
      starterCode: `learner = ""\nlevel = 0\n`,
      mustContain: ['"PyJourney"', "1"],
      feedback: fb(
        "Ready for the full challenge.",
        'Need learner = "PyJourney" and level = 1.'
      ),
    })
  }

  if (intent === "coding") {
    blocks.push({
      id: id("coding"),
      kind: "coding",
      title: "Say hello with variables",
      lines: [
        'Create learner = "PyJourney"',
        "Create level = 1",
        'Print exactly: PyJourney is on level 1',
      ],
      starterCode: `learner = ""\nlevel = 0\n\n# Print: PyJourney is on level 1\n`,
      successCriteria: 'Stdout includes "PyJourney is on level 1"',
      tests: [
        {
          id: "learner",
          description: 'learner == "PyJourney"',
          assertion:
            'assert learner == "PyJourney", f"got {learner!r}"',
        },
        {
          id: "level",
          description: "level == 1",
          assertion: "assert level == 1, f\"got {level!r}\"",
        },
        {
          id: "out",
          description: "printed sentence",
          expectsStdoutIncludes: "PyJourney is on level 1",
        },
      ],
    })
  }

  if (intent === "complete") {
    blocks.push({
      id: id("complete"),
      kind: "complete",
      title: "Variables unlocked",
      lines: [
        "You can store and reuse values.",
        `Pace: ${session.learner.pace} · confidence ${Math.round(session.learner.confidence * 100)}%`,
      ],
    })
  }

  if (blocks.length === 0) {
    blocks.push({
      id: id("fallback-mc"),
      kind: "multipleChoice",
      prompt: "Pick a valid assignment.",
      choices: [
        { id: "a", label: "x = 3" },
        { id: "b", label: "x == 3" },
      ],
      correctId: "a",
      feedback: fb("Yes.", "Use = to assign."),
    })
  }

  return {
    speak: speakFor(intent),
    intent,
    reason: `rules:${intent}:pace=${session.learner.pace}:conf=${session.learner.confidence.toFixed(2)}`,
    blocks,
    masteryDeltaSuggestion:
      intent === "complete"
        ? 8
        : intent === "coding"
          ? 0
          : session.learner.pace === "fast"
            ? 2
            : 0,
  }
}

export const emptyVariablesSession = (): LessonSession => ({
  version: 3,
  title: "Variables with PyJo",
  objective:
    "Create variables, assign values, and use them in print statements.",
  conceptSlug: "variables",
  coachName: "PyJo",
  blocks: [],
  cursor: 0,
  events: [],
  learner: {
    pace: "steady",
    confidence: 0.5,
    struggleTopics: [],
    correctStreak: 0,
    failStreak: 0,
    stepsCompleted: 0,
  },
  codingPassed: false,
  pyjoTurns: 0,
})
