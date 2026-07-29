export type ExplainVariant = {
  title: string
  body: string
}

export type QuizVariant = {
  prompt: string
  code?: string
  choices: { id: string; label: string }[]
  correctId: string
  feedback: { correct: string; wrong: string }
  difficulty: "easy" | "hard"
}

export type PracticeVariant = {
  mode: "fillBlank" | "miniEdit"
  prompt: string
  template?: string
  answers?: string[]
  lines?: string[]
  starterCode?: string
  mustContain?: string[]
  mustNotContain?: string[]
  mustMatchAny?: string[]
  feedback: { correct: string; wrong: string }
  placeholder?: string
}

export type TopicContentPack = {
  explains: ExplainVariant[]
  quizzes: QuizVariant[]
  practices: PracticeVariant[]
}

export type ConceptContentBank = Record<string, TopicContentPack>

const fb = (correct: string, wrong: string) => ({ correct, wrong })

/**
 * Slot fillers for the Variables blueprint.
 * Keys MUST match TopicSpec.id in curricula/variables.ts.
 */
export const VARIABLES_CONTENT: ConceptContentBank = {
  assignment: {
    explains: [
      {
        title: "Assignment",
        body: `A variable is a name that points to a value.

Create one with a **single** equals sign:

\`\`\`python
score = 10
\`\`\`

Remember: \`=\` stores. \`==\` compares.`,
      },
      {
        title: "Names store values",
        body: `Think of a variable like a labeled box:

\`\`\`python
lives = 3
learner = "PyJourney"
\`\`\`

Later, the name means whatever is currently in that box.`,
      },
    ],
    quizzes: [
      {
        prompt: "Which line correctly stores Hello in msg?",
        choices: [
          { id: "a", label: 'msg = "Hello"' },
          { id: "b", label: 'msg == "Hello"' },
          { id: "c", label: 'print("Hello")' },
        ],
        correctId: "a",
        feedback: fb("Single = assigns.", "Use one = to assign."),
        difficulty: "easy",
      },
      {
        prompt: "What does x = 5 do?",
        choices: [
          { id: "a", label: "Stores 5 in x" },
          { id: "b", label: "Checks if x equals 5" },
          { id: "c", label: "Prints 5" },
        ],
        correctId: "a",
        feedback: fb("Assignment stores the value.", "== would compare."),
        difficulty: "easy",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Store your favorite number in points.",
        template: "points = ___",
        answers: ["7", "10", "42", "0", "100"],
        placeholder: "number",
        feedback: fb("Nice — that's an assignment.", "Use points = <number> with one =."),
      },
    ],
  },

  names: {
    explains: [
      {
        title: "Valid names",
        body: `Variable names can use letters, digits, and \`_\`.

They **must not** start with a digit. Hyphens and spaces are illegal.

\`\`\`python
mein_name = "Ada"   # good
# 2name = "Ada"     # bad — starts with a digit
# mein-name = "Ada" # bad — hyphen
\`\`\``,
      },
      {
        title: "Case matters",
        body: `Python treats \`Alter\` and \`alter\` as **different** names:

\`\`\`python
alter = 15
print(Alter)  # NameError — Alter was never created
\`\`\`

Also avoid reserved words like \`class\` as variable names.`,
      },
    ],
    quizzes: [
      {
        prompt: "Which is a valid variable name?",
        choices: [
          { id: "a", label: "mein_name" },
          { id: "b", label: "2name" },
          { id: "c", label: "mein-name" },
          { id: "d", label: "class" },
        ],
        correctId: "a",
        feedback: fb(
          "Letters + underscore, not starting with a digit.",
          "2name, hyphens, and class are invalid or reserved."
        ),
        difficulty: "easy",
      },
      {
        prompt: "After alter = 15, what does print(Alter) do?",
        code: "alter = 15\nprint(Alter)",
        choices: [
          { id: "err", label: "NameError (Alter is a different name)" },
          { id: "15", label: "Prints 15" },
          { id: "alter", label: 'Prints "alter"' },
        ],
        correctId: "err",
        feedback: fb(
          "Names are case-sensitive.",
          "Alter and alter are not the same variable."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "miniEdit",
        prompt: "Fix the illegal name so the program runs.",
        lines: ["Use a valid name instead of 2score."],
        starterCode: '2score = 10\nprint(2score)\n',
        mustContain: ["score =", "print(score)"],
        mustNotContain: ["2score"],
        feedback: fb(
          "Nice — valid names cannot start with a digit.",
          "Rename to something like score = 10 and print(score)."
        ),
      },
    ],
  },

  data_types: {
    explains: [
      {
        title: "Four core types",
        body: `Python values have types:

- **int** — whole numbers: \`15\`, \`0\`, \`-3\`
- **float** — decimals: \`1.75\`, \`0.5\`
- **str** — text in quotes: \`"Berlin"\`
- **bool** — \`True\` or \`False\` (capital T/F)

\`\`\`python
name = "Max"           # str
age = 15               # int
height = 1.75          # float
likes_python = True    # bool
\`\`\``,
      },
      {
        title: "Look at the literal",
        body: `You can often spot the type from how you write it:

\`\`\`python
42        # int
3.14      # float
"42"      # str (quotes!)
False     # bool
\`\`\`

Quotes turn numbers into text. \`True\`/\`False\` are not strings.`,
      },
    ],
    quizzes: [
      {
        prompt: "What type is 1.75?",
        choices: [
          { id: "float", label: "float" },
          { id: "int", label: "int" },
          { id: "str", label: "str" },
          { id: "bool", label: "bool" },
        ],
        correctId: "float",
        feedback: fb("Decimals are floats.", "Whole numbers without a dot are ints."),
        difficulty: "easy",
      },
      {
        prompt: "Which value is a bool?",
        choices: [
          { id: "a", label: "True" },
          { id: "b", label: '"True"' },
          { id: "c", label: "1" },
          { id: "d", label: "yes" },
        ],
        correctId: "a",
        feedback: fb(
          "True/False (no quotes) are booleans.",
          '"True" is a string; yes is a name.'
        ),
        difficulty: "easy",
      },
      {
        prompt: "Match: which line creates a str?",
        choices: [
          { id: "a", label: 'city = "Berlin"' },
          { id: "b", label: "city = Berlin" },
          { id: "c", label: "city = 12" },
        ],
        correctId: "a",
        feedback: fb("Quotes make strings.", "Bare Berlin is a name; 12 is an int."),
        difficulty: "hard",
      },
      {
        prompt: "How many different types are in this code?",
        code: 'n = "Ada"\na = 16\nh = 1.7\nok = True',
        choices: [
          { id: "4", label: "4 (str, int, float, bool)" },
          { id: "3", label: "3" },
          { id: "2", label: "2" },
          { id: "1", label: "1" },
        ],
        correctId: "4",
        feedback: fb(
          "Four different literals → four types.",
          "Count quotes, dots, and True carefully."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "miniEdit",
        prompt: "Add one float and one bool variable, then print all four.",
        lines: [
          "Keep name and age.",
          "Add height (float) and likes_python (bool).",
          "Print each variable.",
        ],
        starterCode: 'name = "Max"\nage = 15\n',
        mustContain: ["print", ".", "True"],
        feedback: fb(
          "You mixed several types — nice.",
          "Add a decimal (e.g. 1.75) and True/False, then print."
        ),
      },
    ],
  },

  strings_quotes: {
    explains: [
      {
        title: "Text needs quotes",
        body: `Text (strings) must be wrapped in quotes:

\`\`\`python
city = "Berlin"
\`\`\`

Without quotes, Python looks for another variable named Berlin — and usually crashes with \`NameError\`.`,
      },
      {
        title: "Quoted numbers are still text",
        body: `"15" is a **string**, not an int:

\`\`\`python
age = 15      # int — you can do age + 1
label = "15"  # str — "15" + 1 fails
\`\`\``,
      },
    ],
    quizzes: [
      {
        prompt: "What is wrong with: city = Berlin",
        choices: [
          { id: "quotes", label: "Missing quotes around Berlin" },
          { id: "equals", label: "Should use ==" },
          { id: "ok", label: "Nothing" },
        ],
        correctId: "quotes",
        feedback: fb(
          "Bare Berlin is treated as a variable name.",
          'Use city = "Berlin".'
        ),
        difficulty: "easy",
      },
      {
        prompt: 'Is "15" an int?',
        choices: [
          { id: "no", label: "No — quotes make it a str" },
          { id: "yes", label: "Yes — it looks like a number" },
          { id: "both", label: "Both int and str" },
        ],
        correctId: "no",
        feedback: fb(
          "Quotes always mean string.",
          "Only 15 without quotes is an int."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Store your name as a string.",
        template: 'name = "___"',
        answers: [],
        placeholder: "…",
        feedback: fb(
          "Quotes wrap the text — perfect.",
          "Put the text inside quotes."
        ),
      },
    ],
  },

  reassign: {
    explains: [
      {
        title: "Overwrite the value",
        body: `Assigning again replaces what was stored:

\`\`\`python
age = 14
age = 15
print(age)  # 15
\`\`\``,
      },
      {
        title: "Copy is a snapshot",
        body: `\`b = a\` copies the **current** value. Later changes to \`a\` do not update \`b\`:

\`\`\`python
a = 2
b = a
a = 9
print(b)  # 2
\`\`\``,
      },
    ],
    quizzes: [
      {
        prompt: "What does this print?",
        code: "age = 14\nage = 15\nprint(age)",
        choices: [
          { id: "15", label: "15" },
          { id: "14", label: "14" },
          { id: "both", label: "14 then 15" },
        ],
        correctId: "15",
        feedback: fb(
          "The last assignment wins.",
          "age was overwritten with 15."
        ),
        difficulty: "easy",
      },
      {
        prompt: "After these lines, what is in b?",
        code: "a = 2\nb = a\na = 9",
        choices: [
          { id: "2", label: "2" },
          { id: "9", label: "9" },
          { id: "a", label: "a" },
        ],
        correctId: "2",
        feedback: fb(
          "b copied 2 before a changed.",
          "Assignment copies the value at that moment."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "miniEdit",
        prompt: "Reassign age so the print shows 15.",
        lines: ["Keep one reassignment of age."],
        starterCode: "age = 14\nprint(age)\n",
        mustContain: ["age = 15"],
        mustNotContain: ["age = 14"],
        feedback: fb("Reassignment updated age.", "Add age = 15 before printing."),
      },
    ],
  },

  print_value: {
    explains: [
      {
        title: "print shows the value",
        body: `\`print\` shows the **value**, not the variable name:

\`\`\`python
age = 16
print(age)
\`\`\`

This prints \`16\`.`,
      },
      {
        title: "Value vs text",
        body: `Compare carefully:

\`\`\`python
age = 16
print(age)     # 16  (the value)
print("age")   # age (the text)
\`\`\``,
      },
    ],
    quizzes: [
      {
        prompt: "What does print(age) show?",
        code: "age = 16\nprint(age)",
        choices: [
          { id: "16", label: "16" },
          { id: "age", label: "age" },
          { id: "err", label: "Error" },
        ],
        correctId: "16",
        feedback: fb("print shows the stored value.", "It prints 16, not age."),
        difficulty: "easy",
      },
      {
        prompt: 'What does print("age") show after age = 16?',
        code: 'age = 16\nprint("age")',
        choices: [
          { id: "age", label: "age" },
          { id: "16", label: "16" },
          { id: "err", label: "Error" },
        ],
        correctId: "age",
        feedback: fb(
          "Quotes mean the literal text age.",
          "print(age) without quotes would show 16."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "miniEdit",
        prompt: "Print the value stored in city (not the word city).",
        lines: ["Use the variable, not a quoted label."],
        starterCode: 'city = "Berlin"\nprint("city")\n',
        mustContain: ["print(city)"],
        feedback: fb(
          "You printed the stored value.",
          "Use print(city) without quotes around city."
        ),
      },
    ],
  },

  print_combine: {
    explains: [
      {
        title: "Combine with commas",
        body: `\`print\` can take several arguments separated by commas.
Python inserts spaces and **allows mixed types**:

\`\`\`python
name = "Ada"
age = 16
print(name, "is", age)
# Ada is 16
\`\`\`

This is the safest everyday way to mix text and numbers.`,
      },
      {
        title: "Combine with +",
        body: `\`+\` joins **strings only**. Numbers must be converted with \`str(...)\`:

\`\`\`python
name = "Ada"
age = 16
print("Hi " + name)           # works
print("Age: " + str(age))     # works
# print("Age: " + age)        # TypeError
\`\`\``,
      },
      {
        title: "Combine with f-strings",
        body: `Put \`f\` before the quotes and \`{variable}\` inside:

\`\`\`python
name = "Ada"
age = 16
print(f"{name} is {age}")
# Ada is 16
\`\`\`

Without the leading \`f\`, braces stay literal: \`"{name} is {age}"\`.`,
      },
      {
        title: "Which style when?",
        body: `- **Commas** — quick mixed output, very beginner-friendly
- **f-strings** — readable sentences with many values
- **+** — when you deliberately build one string (remember \`str()\`)

\`\`\`python
print(name, "· level", level)
print(f"{name} · level {level}")
print(name + " · level " + str(level))
\`\`\``,
      },
    ],
    quizzes: [
      {
        prompt: "Which print mixes str and int safely?",
        code: 'name = "Ada"\nage = 16',
        choices: [
          { id: "a", label: 'print(name, "is", age)' },
          { id: "b", label: 'print("Hi " + age)' },
          { id: "c", label: 'print(name + age)' },
        ],
        correctId: "a",
        feedback: fb(
          "Commas allow mixed types.",
          "+ needs strings on both sides (or str(age))."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Why does this fail?",
        code: 'print("Age: " + 16)',
        choices: [
          { id: "type", label: "Cannot + str and int without str(16)" },
          { id: "print", label: "print cannot show numbers" },
          { id: "quotes", label: "Age: needs no quotes" },
        ],
        correctId: "type",
        feedback: fb(
          "Use str(16), commas, or an f-string.",
          "+ only joins strings."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Which line is a valid f-string?",
        choices: [
          { id: "a", label: 'f"Hallo {name}"' },
          { id: "b", label: '"Hallo {name}"' },
          { id: "c", label: "f Hallo {name}" },
        ],
        correctId: "a",
        feedback: fb(
          "The f must sit right before the quotes.",
          "Without f, {name} is plain text."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What does this print?",
        code: 'name = "Ada"\nage = 16\nprint(f"{name} is {age}")',
        choices: [
          { id: "out", label: "Ada is 16" },
          { id: "raw", label: "{name} is {age}" },
          { id: "err", label: "Error" },
        ],
        correctId: "out",
        feedback: fb(
          "f-strings substitute the values.",
          "The leading f enables {name} / {age}."
        ),
        difficulty: "hard",
      },
      {
        prompt: 'What does print("{name}") show if name = "Ada"?',
        code: 'name = "Ada"\nprint("{name}")',
        choices: [
          { id: "raw", label: "{name}" },
          { id: "ada", label: "Ada" },
          { id: "err", label: "Error" },
        ],
        correctId: "raw",
        feedback: fb(
          "No leading f → braces stay as text.",
          "Use f\"{name}\" to insert Ada."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "miniEdit",
        prompt: "Print one sentence that uses both name and age.",
        lines: [
          "Use commas OR an f-string.",
          "Do not use + with the raw int.",
        ],
        starterCode: 'name = "Ada"\nage = 16\n',
        mustContain: ["print("],
        mustMatchAny: [
          String.raw`print\s*\(\s*name\s*,[\s\S]*\bage\b`,
          String.raw`print\s*\(\s*age\s*,[\s\S]*\bname\b`,
          String.raw`print\s*\(\s*f["'][^"']*\{name\}[^"']*\{age\}`,
          String.raw`print\s*\(\s*f["'][^"']*\{age\}[^"']*\{name\}`,
          String.raw`print\s*\(\s*["'][^"']*["']\s*\+\s*str\s*\(\s*age`,
        ],
        feedback: fb(
          "You combined text and a number — great.",
          'Try print(name, "is", age) or print(f"{name} is {age}").'
        ),
      },
    ],
  },
}
