import type { LessonBlueprint } from "@/lib/pyjo/curricula/types"

/**
 * Variables lesson — expanded from legacy `variablen-datentypen` +
 * print-combining skills from `strings-vertieft` (comma / + / f-strings).
 *
 * Scope decision: this concept owns assignment, core types (str/int/float/bool),
 * and combining values in print. The follow-up `data_types` lesson goes deeper
 * (type(), None, casting, arithmetic, input-as-str).
 */
export const VARIABLES_BLUEPRINT: LessonBlueprint = {
  slug: "variables",
  title: "Variables",
  objective:
    "Create variables with =, choose the right type (str, int, float, bool), and combine values in print using commas, +, or f-strings.",
  rationale:
    "Legacy bundled variables + data types into one entry lesson and finished with a profile card. Learners also need explicit practice combining types in output — otherwise they only ever print one value at a time.",
  topics: [
    {
      id: "assignment",
      title: "Store a value with =",
      teachingGoal: "Create a variable: name = value. One = stores; == compares.",
      mustCover: [
        "A variable is a name that points to a value.",
        "Use one = to assign; == compares and does not store.",
        "After assignment, the name stands for the stored value.",
      ],
      misconceptions: [
        "Thinking == creates a variable.",
        "Believing print(name) prints the word name instead of the value.",
      ],
      examples: ['score = 10', 'learner = "PyJourney"', "print(score)"],
      checkIdeas: [
        "Which line assigns vs compares?",
        "What does x = 5 do?",
      ],
      masteryChecks: 3,
    },
    {
      id: "names",
      title: "Valid variable names",
      teachingGoal: "Use letters, digits, and _; no leading digit; names are case-sensitive.",
      mustCover: [
        "Names may use letters, digits, and underscore; must not start with a digit.",
        "Hyphens and spaces are illegal (mein-name is wrong).",
        "Names are case-sensitive: Alter and alter are different.",
        "Avoid reserved words like class as names.",
      ],
      misconceptions: [
        "Assuming 2name or mein-name is allowed.",
        "Ignoring case (Alter vs alter).",
      ],
      examples: ["mein_name = \"Ada\"", "Alter = 15", "alter = 16"],
      checkIdeas: [
        "Which name is valid?",
        "Are Alter and alter the same variable?",
      ],
      masteryChecks: 3,
    },
    {
      id: "data_types",
      title: "Types: str, int, float, bool",
      teachingGoal: "Recognize text, whole numbers, decimals, and True/False.",
      mustCover: [
        "int — whole numbers: 15, 0, -3 (no quotes).",
        "float — decimals: 1.75, 0.5.",
        "str — text in quotes: \"Berlin\".",
        "bool — True or False (capital T/F, no quotes).",
        "Each value has a type; mixing types later needs care.",
      ],
      misconceptions: [
        "Putting numbers in quotes and thinking they are still ints.",
        "Writing true/false in lowercase.",
        "Treating Berlin without quotes as a string.",
      ],
      examples: [
        'name = "Max"',
        "age = 15",
        "height = 1.75",
        "likes_python = True",
      ],
      checkIdeas: [
        "Match type to example value.",
        "Which literal is a float?",
        "Which is a bool?",
      ],
      masteryChecks: 4,
    },
    {
      id: "strings_quotes",
      title: "Text needs quotes",
      teachingGoal: "Wrap text in quotes; without quotes Python looks for a variable name.",
      mustCover: [
        "Text must be wrapped in \"...\" or '...'.",
        "Without quotes, Python looks for another variable with that name.",
        "Numbers used as text are strings too: \"15\" is not the int 15.",
      ],
      misconceptions: [
        "city = Berlin is fine.",
        '"15" and 15 behave the same.',
      ],
      examples: ['city = "Berlin"', "# city = Berlin  → NameError"],
      checkIdeas: [
        "What is wrong with city = Berlin?",
        "Is \"15\" an int?",
      ],
      masteryChecks: 3,
    },
    {
      id: "reassign",
      title: "Change a stored value",
      teachingGoal: "Assign again to overwrite; copies are snapshots of the old value.",
      mustCover: [
        "Assigning again replaces the old value.",
        "Copying with b = a copies the value at that moment; later changes to a do not update b.",
      ],
      misconceptions: [
        "Thinking variables stay linked after b = a.",
        "Believing the first assignment is permanent.",
      ],
      examples: ["age = 14\nage = 15\nprint(age)  # 15", "a = 2\nb = a\na = 9\nprint(b)  # 2"],
      checkIdeas: [
        "After age = 14 then age = 15, what does print(age) show?",
        "After a = 2; b = a; a = 9, what is b?",
      ],
      masteryChecks: 3,
    },
    {
      id: "print_value",
      title: "print shows the value",
      teachingGoal: "print(age) prints what is stored — not the word age.",
      mustCover: [
        "print(age) shows the number stored in age.",
        "You can print literals and variables.",
        "A bare print(\"age\") prints the text age, not the variable.",
      ],
      misconceptions: [
        "print(age) prints the word age.",
        "You must write print(\"age\") to see the number.",
      ],
      examples: ['age = 16\nprint(age)  # 16', 'print("age")  # age'],
      checkIdeas: [
        "What does print(age) show after age = 16?",
        "Difference between print(age) and print(\"age\")?",
      ],
      masteryChecks: 3,
    },
    {
      id: "print_combine",
      title: "Combine values in print",
      teachingGoal: "Mix text and numbers with commas, +, or f-strings — and know when each works.",
      mustCover: [
        "Comma form: print(name, \"is\", age) — mixes types safely; adds spaces.",
        "Plus form: only same types. \"Hi \" + name works; \"age \" + age fails unless str(age).",
        "f-string form: print(f\"{name} is {age}\") — put an f before the quotes and {names} inside.",
        "Prefer f-strings or commas for mixed text + numbers; use + when you intentionally build strings.",
      ],
      misconceptions: [
        "print(\"Hi \" + age) works with an int age.",
        "f\"{name}\" works without the leading f.",
        "Commas require all arguments to be strings.",
      ],
      examples: [
        'name = "Ada"\nage = 16\nprint(name, "is", age)',
        'print("Hi " + name)',
        'print("Age: " + str(age))',
        'print(f"{name} is {age}")',
      ],
      checkIdeas: [
        "Which print mixes str and int safely?",
        "Why does \"Hi \" + 16 fail?",
        "Which line is a valid f-string?",
        "What does f\"{name} is {age}\" print?",
      ],
      masteryChecks: 4,
    },
  ],
  apply: {
    title: "My profile card",
    brief:
      "Write a short program that builds a mini profile: store several facts in variables of different types, then print at least one readable sentence that combines text and a number (comma form or f-string). Also print your other values.",
    criteria: [
      "Defines at least three variables using at least three different types among str, int, float, bool",
      "Uses quotes correctly for every string",
      "Prints a combined sentence that mixes text and a number (comma-separated print or an f-string)",
      "Prints the other stored values as well",
      "Runs without errors",
    ],
    hints: [
      'name = "Ada" stores text (str).',
      "age = 16 stores a whole number (int).",
      "height = 1.75 stores a decimal (float).",
      "likes_python = True stores a boolean (bool).",
      'Combine with print(name, "is", age) or print(f"{name} is {age}").',
      'Remember: "Age: " + age needs str(age) — or use an f-string instead.',
    ],
    evaluationGuide:
      "Pass if the learner defines ≥3 variables covering ≥3 distinct types among str/int/float/bool, quotes strings correctly, prints a mixed text+number sentence via commas or f-string (or + with str()), prints remaining values somehow, and the program would run without errors. Do not require specific variable names. Do not demand all four types if three distinct types are present. Reject if they only print literals with no variables, or if mixed concat uses + on an int without str().",
  },
}
