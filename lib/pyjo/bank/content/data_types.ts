import type { ConceptContentBank } from "@/lib/pyjo/bank/content/variables"

const fb = (correct: string, wrong: string) => ({ correct, wrong })

/**
 * Slot fillers for the Data Types blueprint.
 * Keys MUST match TopicSpec.id in curricula/data_types.ts.
 */
export const DATA_TYPES_CONTENT: ConceptContentBank = {
  why_types: {
    explains: [
      {
        title: "Every value has a type",
        body: `In Python, every value carries a **type**. The type decides which operations are legal.

\`\`\`python
print(2 + 3)       # 5   — numbers add
print("2" + "3")   # 23  — text joins
# print("2" + 3)   # TypeError — str and int do not mix with +
\`\`\`

Same symbol \`+\`, different meaning — because the types differ.`,
      },
      {
        title: "Looks like a number ≠ is a number",
        body: `What you **see on screen** can mislead you:

\`\`\`python
n = 10      # int — math works: n + 1 → 11
s = "10"    # str — looks numeric, but it is text
\`\`\`

If you treat text like a number (or the reverse), you get \`TypeError\` or surprising joins like \`"10" + "1"\` → \`"101"\`.`,
      },
      {
        title: "Why care before coding further?",
        body: `Types show up everywhere next: conditions, input, casting, and debugging.

**Rule of thumb:** before you compute, ask — *is this an int, a float, or a string?*

\`\`\`python
# Safe mental checklist
# 1. What type is this value?
# 2. Does this operation allow that type?
# 3. Do I need to convert first?
\`\`\``,
      },
    ],
    quizzes: [
      {
        prompt: "What is the difference between 2 + 3 and \"2\" + \"3\"?",
        choices: [
          { id: "a", label: "Numbers add to 5; strings join to \"23\"" },
          { id: "b", label: "Both produce 5" },
          { id: "c", label: "Both produce \"23\"" },
        ],
        correctId: "a",
        feedback: fb(
          "Same + symbol, different type → different behavior.",
          "Ints add; digit-strings concatenate."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Why does \"2\" + 3 crash?",
        code: 'print("2" + 3)',
        choices: [
          { id: "type", label: "TypeError — cannot + str and int" },
          { id: "syntax", label: "SyntaxError — quotes are illegal" },
          { id: "ok", label: "It does not crash; it prints 5" },
        ],
        correctId: "type",
        feedback: fb(
          "Mixed str + int with + raises TypeError.",
          "Convert first, or use commas / an f-string."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Which statement is true?",
        choices: [
          { id: "a", label: "Operations depend on the value's type" },
          { id: "b", label: "All values behave the same with +" },
          { id: "c", label: "If it prints digits, it must be an int" },
        ],
        correctId: "a",
        feedback: fb(
          "Type decides what + / - / * mean.",
          "Digit text is still str; + is not always math."
        ),
        difficulty: "hard",
      },
      {
        prompt: "What does this print?",
        code: 'print("10" + "1")',
        choices: [
          { id: "101", label: '"101"' },
          { id: "11", label: "11" },
          { id: "err", label: "TypeError" },
        ],
        correctId: "101",
        feedback: fb(
          "Both sides are str → join, not add.",
          "No math happens when both operands are strings."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "What does \"2\" + \"3\" produce? (include quotes)",
        template: 'result = "___"',
        answers: ["23"],
        placeholder: "…",
        feedback: fb(
          "String + string joins the text.",
          "Digit-strings concatenate: \"2\" + \"3\" → \"23\"."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix the TypeError so the program prints a joined result safely — convert the int with str().",
        lines: [
          "Keep the string \"Score: \".",
          "Convert points with str(...) before +.",
        ],
        starterCode: 'points = 10\nprint("Score: " + points)\n',
        mustContain: ["str(points)", "print("],
        mustNotContain: ['"Score: " + points)'],
        feedback: fb(
          "You converted before joining — TypeError gone.",
          'Use print("Score: " + str(points)).'
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Change the second value so + does math (ints), not text join.",
        lines: [
          "Both operands should be ints.",
          "Print the sum.",
        ],
        starterCode: 'a = 2\nb = "3"\nprint(a + b)\n',
        mustContain: ["b = 3", "print(a + b)"],
        mustNotContain: ['b = "3"'],
        feedback: fb(
          "Both ints → addition works.",
          "Set b = 3 (no quotes) so a + b is math."
        ),
      },
    ],
  },

  type_function: {
    explains: [
      {
        title: "Ask Python with type()",
        body: `\`type(value)\` tells you what Python thinks a value is.

\`\`\`python
print(type(15))      # <class 'int'>
print(type("15"))    # <class 'str'>
print(type(1.5))     # <class 'float'>
print(type(True))    # <class 'bool'>
\`\`\`

It **inspects** — it does not change the value.`,
      },
      {
        title: "Works on variables too",
        body: `Pass a name; \`type\` reports the type of whatever is currently stored:

\`\`\`python
age = 15
label = "15"
print(type(age))    # <class 'int'>
print(type(label))  # <class 'str'>
\`\`\`

Same-looking digits, different types — \`type()\` makes that obvious when debugging.`,
      },
      {
        title: "Read the output carefully",
        body: `\`print(type(x))\` prints something like \`<class 'int'>\` — not the word \"type\", and not the value itself.

\`\`\`python
x = 42
print(x)         # 42
print(type(x))   # <class 'int'>
\`\`\`

Use \`type()\` **before** you convert or compute when something feels wrong.`,
      },
    ],
    quizzes: [
      {
        prompt: "What does type(15) report?",
        code: "print(type(15))",
        choices: [
          { id: "int", label: "<class 'int'>" },
          { id: "str", label: "<class 'str'>" },
          { id: "15", label: "15" },
        ],
        correctId: "int",
        feedback: fb(
          "15 without quotes is an int.",
          "type() reports the class, not the number itself."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Are type(15) and type(\"15\") the same?",
        choices: [
          { id: "no", label: "No — int vs str" },
          { id: "yes", label: "Yes — both look like fifteen" },
          { id: "maybe", label: "Only if you print them" },
        ],
        correctId: "no",
        feedback: fb(
          "Quotes make \"15\" a string.",
          "Appearance on screen is not the type."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What does type() do to the value?",
        choices: [
          { id: "inspect", label: "Only inspects — does not change it" },
          { id: "convert", label: "Converts it to a string named type" },
          { id: "delete", label: "Deletes the value" },
        ],
        correctId: "inspect",
        feedback: fb(
          "type() is read-only inspection.",
          "Conversion needs int(), float(), str(), etc."
        ),
        difficulty: "hard",
      },
      {
        prompt: "What does this print?",
        code: 'x = True\nprint(type(x))',
        choices: [
          { id: "bool", label: "<class 'bool'>" },
          { id: "true", label: "True" },
          { id: "str", label: "<class 'str'>" },
        ],
        correctId: "bool",
        feedback: fb(
          "True (no quotes) is a bool.",
          "type(x) prints the class, not the value True."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "miniEdit",
        prompt: "Inspect each value with type() instead of printing the raw values.",
        lines: [
          "Keep the four assignments.",
          "Print type(...) for each variable.",
        ],
        starterCode:
          'name = "Ada"\nage = 16\nheight = 1.7\nready = True\nprint(name)\nprint(age)\nprint(height)\nprint(ready)\n',
        mustContain: [
          "type(name)",
          "type(age)",
          "type(height)",
          "type(ready)",
        ],
        mustNotContain: ["print(name)", "print(age)", "print(height)", "print(ready)"],
        feedback: fb(
          "You asked Python for the types — perfect.",
          "Replace print(x) with print(type(x)) for each variable."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Add type() checks that prove 15 and \"15\" are different types.",
        lines: [
          "Print type(n) and type(s).",
        ],
        starterCode: 'n = 15\ns = "15"\n',
        mustContain: ["type(n)", "type(s)", "print("],
        feedback: fb(
          "type() makes the int/str difference visible.",
          "Use print(type(n)) and print(type(s))."
        ),
      },
      {
        mode: "fillBlank",
        prompt: "Complete the call that inspects the type of height.",
        template: "print(___(height))",
        answers: ["type"],
        placeholder: "…",
        feedback: fb(
          "type(height) inspects without changing height.",
          "The function name is type."
        ),
      },
    ],
  },

  int_deep: {
    explains: [
      {
        title: "int — whole numbers",
        body: `An **int** is a whole number: no decimal point.

\`\`\`python
lives = 3
temperature = -2
zero = 0
print(lives + 1)  # 4
\`\`\`

Negatives and zero are still ints.`,
      },
      {
        title: "No quotes, no dot",
        body: `Two common traps:

\`\`\`python
n = 42       # int
s = "42"     # str — not an int
f = 3.0      # float — not an int (has a decimal point)
\`\`\`

If you want an int for math, write the number **without** quotes and **without** a trailing \`.0\`.`,
      },
      {
        title: "Ints and arithmetic",
        body: `Adding, subtracting, and multiplying ints usually stays int:

\`\`\`python
print(3 + 2)   # 5  (int)
print(3 * 2)   # 6  (int)
print(3 / 2)   # 1.5 (float — true division)
\`\`\`

\`/\` is the exception beginners notice first: it yields a **float**.`,
      },
    ],
    quizzes: [
      {
        prompt: "Which value is an int?",
        choices: [
          { id: "a", label: "-3" },
          { id: "b", label: "3.0" },
          { id: "c", label: '"42"' },
        ],
        correctId: "a",
        feedback: fb(
          "Whole numbers (including negatives) are ints.",
          "3.0 is float; \"42\" is str."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Is 3.0 an int?",
        choices: [
          { id: "no", label: "No — the decimal point makes it a float" },
          { id: "yes", label: "Yes — it represents a whole amount" },
          { id: "both", label: "Both int and float" },
        ],
        correctId: "no",
        feedback: fb(
          "Writing 3.0 creates a float.",
          "\"Looks whole\" is not enough — check the literal."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What type is zero here?",
        code: "n = 0\nprint(type(n))",
        choices: [
          { id: "int", label: "int" },
          { id: "none", label: "None" },
          { id: "bool", label: "bool" },
        ],
        correctId: "int",
        feedback: fb("0 is an int.", "None and False are different values."),
        difficulty: "hard",
      },
      {
        prompt: "Which assignment creates an int?",
        choices: [
          { id: "a", label: "lives = 3" },
          { id: "b", label: 'lives = "3"' },
          { id: "c", label: "lives = 3.0" },
        ],
        correctId: "a",
        feedback: fb(
          "Bare whole number → int.",
          "Quotes → str; trailing .0 → float."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Store a whole number of lives (no quotes, no decimal).",
        template: "lives = ___",
        answers: ["3", "1", "5", "0", "10", "2", "4", "100"],
        placeholder: "…",
        feedback: fb(
          "That's an int assignment.",
          "Use a whole number like 3 — no quotes, no dot."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix temperature so it is a negative int, then print it.",
        lines: [
          "Remove the quotes.",
          "Keep the minus sign.",
        ],
        starterCode: 'temperature = "-2"\nprint(temperature)\n',
        mustContain: ["temperature = -2", "print(temperature)"],
        mustNotContain: ['"-2"'],
        feedback: fb(
          "Negative ints need no quotes.",
          "Use temperature = -2."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Change count from a float-looking literal to a true int, then add 1.",
        lines: ["Replace 3.0 with 3.", "Print count + 1."],
        starterCode: "count = 3.0\nprint(count)\n",
        mustContain: ["count = 3", "print(count + 1)"],
        mustNotContain: ["3.0"],
        feedback: fb(
          "Whole number without a dot is an int.",
          "Set count = 3 and print(count + 1)."
        ),
      },
    ],
  },

  float_deep: {
    explains: [
      {
        title: "float — decimals",
        body: `A **float** has a decimal part:

\`\`\`python
height = 1.75
price = 0.5
delta = -0.25
\`\`\`

Use floats for measurements, money-ish amounts (for learning), distances, and ratios.`,
      },
      {
        title: "Division always yields float",
        body: `In Python 3, \`/\` is **true division** and the result is a float — even when it \"comes out even\":

\`\`\`python
print(4 / 2)         # 2.0
print(type(4 / 2))   # <class 'float'>
\`\`\`

Writing \`3.0\` also makes a float, even if the fraction is zero.`,
      },
      {
        title: "Spot the float literal",
        body: `If you see a decimal point in the literal, it is a float:

\`\`\`python
print(type(3))     # int
print(type(3.0))   # float
print(type(3.14))  # float
\`\`\`

Ints and floats can mix in arithmetic; the result often becomes float.`,
      },
    ],
    quizzes: [
      {
        prompt: "What type is 4 / 2?",
        code: "print(type(4 / 2))",
        choices: [
          { id: "float", label: "float (2.0)" },
          { id: "int", label: "int (2)" },
          { id: "str", label: "str" },
        ],
        correctId: "float",
        feedback: fb(
          "/ always gives a float in Python 3.",
          "Even 4 / 2 is 2.0, not int 2."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Which literal is a float?",
        choices: [
          { id: "a", label: "1.75" },
          { id: "b", label: "175" },
          { id: "c", label: '"1.75"' },
        ],
        correctId: "a",
        feedback: fb(
          "Decimal point without quotes → float.",
          "175 is int; \"1.75\" is str."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What is type(3.0)?",
        choices: [
          { id: "float", label: "float" },
          { id: "int", label: "int" },
          { id: "both", label: "Both, because it is whole" },
        ],
        correctId: "float",
        feedback: fb(
          "The .0 makes it a float literal.",
          "\"Whole-looking\" floats are still floats."
        ),
        difficulty: "hard",
      },
      {
        prompt: "What does this print?",
        code: "print(7 / 2)",
        choices: [
          { id: "a", label: "3.5" },
          { id: "b", label: "3" },
          { id: "c", label: "3.0" },
        ],
        correctId: "a",
        feedback: fb(
          "True division keeps the fractional part.",
          "Use // if you want floor division."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Store a height as a float (include a decimal point).",
        template: "height = ___",
        answers: ["1.75", "1.7", "1.8", "1.65", "2.0", "0.5"],
        placeholder: "…",
        feedback: fb(
          "Decimal literal → float.",
          "Use something like 1.75 with a dot."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Print the type of a true-division result.",
        lines: [
          "Keep 4 / 2.",
          "Wrap it in type(...) inside print.",
        ],
        starterCode: "print(4 / 2)\n",
        mustContain: ["type(4 / 2)"],
        feedback: fb(
          "You confirmed / yields float.",
          "Use print(type(4 / 2))."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Change price to a float literal and print it.",
        lines: ["Add a decimal point (e.g. 2.5)."],
        starterCode: "price = 2\nprint(price)\n",
        mustContain: ["price =", ".", "print(price)"],
        mustNotContain: ["price = 2\n"],
        feedback: fb(
          "A dotted literal is a float.",
          "Set price to something like 2.5."
        ),
      },
    ],
  },

  str_deep: {
    explains: [
      {
        title: "str — text in quotes",
        body: `A **str** is text wrapped in quotes:

\`\`\`python
city = "Berlin"
greeting = 'hi'
empty = ""
\`\`\`

Single or double quotes both work. Empty quotes still make a string.`,
      },
      {
        title: "Digit strings are still text",
        body: `"15" looks numeric but is **not** an int:

\`\`\`python
code = "15"
print(code + "A")   # 15A
# print(code + 1)   # TypeError
\`\`\`

Convert with \`int(code)\` before doing math.`,
      },
      {
        title: "Join, repeat, and length",
        body: `Useful string operations:

\`\`\`python
print("ha" * 3)      # hahaha
print("Py" + "Jo")   # PyJo
print(len("Ada"))    # 3
\`\`\`

\`len\` counts characters. \`len(15)\` does **not** work the same way on numbers.`,
      },
    ],
    quizzes: [
      {
        prompt: 'Is "15" an int?',
        choices: [
          { id: "no", label: "No — quotes make it a str" },
          { id: "yes", label: "Yes — the characters are digits" },
          { id: "auto", label: "Python auto-converts it to int" },
        ],
        correctId: "no",
        feedback: fb(
          "Quotes always mean string.",
          "Use int(\"15\") when you need a number."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What does \"ha\" * 3 print?",
        code: 'print("ha" * 3)',
        choices: [
          { id: "a", label: "hahaha" },
          { id: "b", label: "ha3" },
          { id: "c", label: "Error" },
        ],
        correctId: "a",
        feedback: fb(
          "str * int repeats the text.",
          "It repeats, it does not append the digit 3."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What is len(\"Ada\")?",
        code: 'print(len("Ada"))',
        choices: [
          { id: "3", label: "3" },
          { id: "1", label: "1" },
          { id: "err", label: "Error" },
        ],
        correctId: "3",
        feedback: fb(
          "len counts characters: A, d, a.",
          "Three letters → 3."
        ),
        difficulty: "hard",
      },
      {
        prompt: "What does this print?",
        code: 'print("15" + "A")',
        choices: [
          { id: "a", label: "15A" },
          { id: "b", label: "16" },
          { id: "c", label: "TypeError" },
        ],
        correctId: "a",
        feedback: fb(
          "Both sides are str → join.",
          "No numeric add happens here."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Complete the repeat so it prints hahaha.",
        template: 'print("ha" * ___)',
        answers: ["3"],
        placeholder: "…",
        feedback: fb(
          "\"ha\" * 3 → hahaha.",
          "Multiply the string by 3."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Print the length of name with len().",
        lines: ["Use len(name) inside print."],
        starterCode: 'name = "Ada"\nprint(name)\n',
        mustContain: ["len(name)"],
        mustNotContain: ["print(name)"],
        feedback: fb(
          "len counts characters.",
          "Use print(len(name))."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Join code with the letter A using + (keep code as a string).",
        lines: ['Print code + "A".'],
        starterCode: 'code = "15"\nprint(code)\n',
        mustContain: ['code + "A"'],
        feedback: fb(
          "String join keeps digit text as text.",
          'Use print(code + "A").'
        ),
      },
    ],
  },

  bool_deep: {
    explains: [
      {
        title: "True and False",
        body: `A **bool** is exactly one of two values: \`True\` or \`False\`.

\`\`\`python
ready = True
done = False
\`\`\`

Capital **T** / **F**, **no quotes**. \`"True"\` is a string. \`true\` (lowercase) is a NameError.`,
      },
      {
        title: "Comparisons produce bools",
        body: `Comparison operators return bools:

\`\`\`python
print(5 > 3)     # True
print(10 == 10)  # True
print(7 > 9)     # False
\`\`\`

Later, bools drive \`if\` decisions. For now: store them, print them, recognize them.`,
      },
      {
        title: "Not the same as text or 1",
        body: `Common mix-ups:

\`\`\`python
ok = True       # bool
label = "True"  # str
flag = 1        # int (truthy later, but not a bool literal)
\`\`\`

When you need a real boolean flag, write \`True\` / \`False\`.`,
      },
    ],
    quizzes: [
      {
        prompt: "Which spelling is a valid bool?",
        choices: [
          { id: "a", label: "True" },
          { id: "b", label: "true" },
          { id: "c", label: '"True"' },
        ],
        correctId: "a",
        feedback: fb(
          "Capital True/False, no quotes.",
          "true is a NameError; \"True\" is a string."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What does print(5 > 3) show?",
        code: "print(5 > 3)",
        choices: [
          { id: "true", label: "True" },
          { id: "yes", label: "yes" },
          { id: "5", label: "5" },
        ],
        correctId: "true",
        feedback: fb(
          "Comparisons print True or False.",
          "Not yes/no text — actual bools."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What is wrong with: ready = true",
        choices: [
          { id: "case", label: "Must be True with capital T" },
          { id: "quotes", label: "Needs quotes around true" },
          { id: "eq", label: "Should use ==" },
        ],
        correctId: "case",
        feedback: fb(
          "Python bools are True/False.",
          "Lowercase true is not a keyword."
        ),
        difficulty: "hard",
      },
      {
        prompt: "What does this print?",
        code: "print(10 == 10)",
        choices: [
          { id: "t", label: "True" },
          { id: "10", label: "10" },
          { id: "eq", label: "==" },
        ],
        correctId: "t",
        feedback: fb(
          "== compares; the result is a bool.",
          "Equal values → True."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Store a boolean flag that means \"yes, ready\".",
        template: "ready = ___",
        answers: ["True"],
        placeholder: "…",
        feedback: fb(
          "Capital True — that's a bool.",
          "Use True (capital T, no quotes)."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix the invalid bool spelling, then print it.",
        lines: ["Change true → True."],
        starterCode: "ready = true\nprint(ready)\n",
        mustContain: ["ready = True", "print(ready)"],
        mustNotContain: ["ready = true"],
        feedback: fb(
          "True with capital T is the keyword.",
          "Replace true with True."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Print the bool result of comparing score to 10 (use >).",
        lines: ["Keep score.", "Print score > 10."],
        starterCode: "score = 12\nprint(score)\n",
        mustContain: ["score > 10"],
        mustNotContain: ["print(score)"],
        feedback: fb(
          "Comparisons produce True/False.",
          "Use print(score > 10)."
        ),
      },
    ],
  },

  none_value: {
    explains: [
      {
        title: "None means no value yet",
        body: `\`None\` is a special singleton: **absence of a value**.

\`\`\`python
answer = None
print(answer)        # None
print(type(answer))  # <class 'NoneType'>
\`\`\`

Useful as a placeholder before you assign something real.`,
      },
      {
        title: "None is not 0, False, or \"\"",
        body: `These are **different** values:

\`\`\`python
print(None)   # None
print(0)      # 0
print(False)  # False
print("")     # (empty string)
\`\`\`

Do not treat them as interchangeable — each has its own type and meaning.`,
      },
      {
        title: "Overwrite when ready",
        body: `Start with \`None\`, then reassign later:

\`\`\`python
answer = None
# ... later ...
answer = 42
print(answer)  # 42
\`\`\`

That pattern shows \"not set yet\" clearly in longer programs.`,
      },
    ],
    quizzes: [
      {
        prompt: "Is None the same as 0?",
        choices: [
          { id: "no", label: "No — None means no value; 0 is an int" },
          { id: "yes", label: "Yes — both mean empty" },
          { id: "almost", label: "Only in print()" },
        ],
        correctId: "no",
        feedback: fb(
          "None ≠ 0 ≠ False ≠ \"\".",
          "They look \"empty\" in English, not in Python."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What type is None?",
        code: "print(type(None))",
        choices: [
          { id: "nonetype", label: "NoneType" },
          { id: "int", label: "int" },
          { id: "bool", label: "bool" },
        ],
        correctId: "nonetype",
        feedback: fb(
          "type(None) is NoneType.",
          "None is its own type, not int or bool."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Is None equal to False?",
        choices: [
          { id: "no", label: "No — different values and types" },
          { id: "yes", label: "Yes — both are \"falsey\" so they are equal" },
          { id: "str", label: "None equals \"\"" },
        ],
        correctId: "no",
        feedback: fb(
          "Being falsey in if later ≠ being equal.",
          "None, False, 0, and \"\" are distinct."
        ),
        difficulty: "hard",
      },
      {
        prompt: "After these lines, what does print(answer) show?",
        code: "answer = None\nanswer = 42\nprint(answer)",
        choices: [
          { id: "42", label: "42" },
          { id: "none", label: "None" },
          { id: "err", label: "Error" },
        ],
        correctId: "42",
        feedback: fb(
          "Reassignment overwrites None.",
          "The last assignment wins."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Create a placeholder with no value yet.",
        template: "answer = ___",
        answers: ["None"],
        placeholder: "…",
        feedback: fb(
          "None is the placeholder singleton.",
          "Assign None (capital N)."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Start with None, then reassign answer to 42 and print it.",
        lines: [
          "Keep answer = None.",
          "Add answer = 42 before the print.",
        ],
        starterCode: "answer = None\nprint(answer)\n",
        mustContain: ["answer = None", "answer = 42", "print(answer)"],
        feedback: fb(
          "Placeholder then real value — classic None pattern.",
          "After None, set answer = 42 before printing."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Print the type of the placeholder (use type).",
        lines: ["Print type(answer)."],
        starterCode: "answer = None\nprint(answer)\n",
        mustContain: ["type(answer)"],
        mustNotContain: ["print(answer)"],
        feedback: fb(
          "NoneType shows up via type(answer).",
          "Use print(type(answer))."
        ),
      },
    ],
  },

  casting: {
    explains: [
      {
        title: "Convert with int / float / str / bool",
        body: `Casting builds a **new** value of another type:

\`\`\`python
print(int("15"))      # 15
print(float("1.5"))   # 1.5
print(str(42))        # "42"
print(bool(0))        # False
\`\`\`

You choose the conversion deliberately — Python will not always guess for you.`,
      },
      {
        title: "Truncation and failures",
        body: `Important edge cases:

\`\`\`python
print(int(3.9))       # 3  — truncates toward zero (does not round)
# print(int("3.9"))   # ValueError — digit-dot string is not int text
print(float("3.9"))   # 3.9
print(int(float("3.9")))  # 3
\`\`\`

\`int(\"abc\")\` also raises \`ValueError\`.`,
      },
      {
        title: "bool casting rules (MVP)",
        body: `\`bool(...)\` treats some values as False:

\`\`\`python
print(bool(0))     # False
print(bool(""))    # False
print(bool(None))  # False
print(bool(1))     # True
print(bool("hi"))  # True
\`\`\`

Most non-empty / non-zero values become \`True\`.`,
      },
    ],
    quizzes: [
      {
        prompt: "What is int(3.9)?",
        code: "print(int(3.9))",
        choices: [
          { id: "3", label: "3" },
          { id: "4", label: "4" },
          { id: "3.9", label: "3.9" },
        ],
        correctId: "3",
        feedback: fb(
          "int() truncates toward zero — no rounding.",
          "int(3.9) is 3, not 4."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Does int(\"3.9\") work?",
        choices: [
          { id: "no", label: "No — ValueError (use float first)" },
          { id: "yes", label: "Yes — becomes 3" },
          { id: "yes4", label: "Yes — becomes 4" },
        ],
        correctId: "no",
        feedback: fb(
          "int() rejects dotted digit-strings.",
          "float(\"3.9\") then int(...), or float only."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What is bool(\"\")?",
        choices: [
          { id: "f", label: "False" },
          { id: "t", label: "True" },
          { id: "err", label: "Error" },
        ],
        correctId: "f",
        feedback: fb(
          "Empty string is False under bool().",
          "Non-empty strings are True."
        ),
        difficulty: "hard",
      },
      {
        prompt: "What does str(42) produce?",
        choices: [
          { id: "s", label: 'The string "42"' },
          { id: "i", label: "Still the int 42" },
          { id: "err", label: "Error" },
        ],
        correctId: "s",
        feedback: fb(
          "str() builds text from the number.",
          "Useful before joining with +."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "miniEdit",
        prompt: "Convert the digit-string \"15\" with int() and print the number.",
        lines: [
          "Use int(raw).",
          "Print the converted value.",
        ],
        starterCode: 'raw = "15"\nprint(raw)\n',
        mustContain: ["int(raw)", "print("],
        mustNotContain: ["print(raw)"],
        feedback: fb(
          "int(\"15\") → 15 for real math.",
          "Use print(int(raw))."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Convert price text to float, then print it.",
        lines: ['Use float(text).'],
        starterCode: 'text = "1.5"\nprint(text)\n',
        mustContain: ["float(text)"],
        mustNotContain: ["print(text)"],
        feedback: fb(
          "float() parses decimal text.",
          "Use print(float(text))."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix the failing cast: convert via float first, then to int.",
        lines: [
          "Do not call int() directly on \"3.9\".",
          "Use int(float(...)).",
        ],
        starterCode: 'raw = "3.9"\nn = int(raw)\nprint(n)\n',
        mustContain: ["float(raw)", "int("],
        mustNotContain: ["int(raw)"],
        feedback: fb(
          "float then int handles dotted digit-strings.",
          "Use n = int(float(raw))."
        ),
      },
    ],
  },

  arithmetic: {
    explains: [
      {
        title: "The basic four and more",
        body: `Number operators you need:

\`\`\`python
print(7 + 2)   # 9
print(7 - 2)   # 5
print(7 * 2)   # 14
print(7 / 2)   # 3.5  (true division → float)
\`\`\`

Then the power tools: \`//\`, \`%\`, \`**\`.`,
      },
      {
        title: "Floor division, modulo, power",
        body: `\`\`\`python
print(7 // 2)   # 3   — floor division (whole times)
print(17 % 5)   # 2   — remainder (modulo)
print(2 ** 3)   # 8   — power (2³)
\`\`\`

\`%\` is **not** percent. \`/\` and \`//\` are easy to mix up — check which you need.`,
      },
      {
        title: "Pick the right operator",
        body: `- **/** when you want a precise quotient (float)
- **//** when you want whole groups
- **%** when you care about the leftover
- **\*\*** when you raise to a power

\`\`\`python
print(17 // 5)  # 3 groups of 5
print(17 % 5)   # 2 left over
\`\`\``,
      },
    ],
    quizzes: [
      {
        prompt: "What is 17 % 5?",
        code: "print(17 % 5)",
        choices: [
          { id: "2", label: "2" },
          { id: "3", label: "3" },
          { id: "3.4", label: "3.4" },
        ],
        correctId: "2",
        feedback: fb(
          "Modulo is the remainder: 15 + 2.",
          "% is not percent and not floor division."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What is 2 ** 3?",
        choices: [
          { id: "8", label: "8" },
          { id: "6", label: "6" },
          { id: "9", label: "9" },
        ],
        correctId: "8",
        feedback: fb("** means power: 2³ = 8.", "** is not multiply-twice."),
        difficulty: "easy",
      },
      {
        prompt: "What is 7 // 2 vs 7 / 2?",
        code: "print(7 // 2)\nprint(7 / 2)",
        choices: [
          { id: "a", label: "3 and 3.5" },
          { id: "b", label: "3.5 and 3" },
          { id: "c", label: "Both 3" },
        ],
        correctId: "a",
        feedback: fb(
          "// floors; / keeps the fraction as float.",
          "Remember: // → 3, / → 3.5."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Which expression uses modulo?",
        choices: [
          { id: "a", label: "17 % 5" },
          { id: "b", label: "17 / 5" },
          { id: "c", label: "17 ** 5" },
        ],
        correctId: "a",
        feedback: fb("% is modulo (remainder).", "/ divides; ** powers."),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "miniEdit",
        prompt: "Print the remainder of 17 divided by 5 using %.",
        lines: ["Use the % operator."],
        starterCode: "print(17 / 5)\n",
        mustContain: ["17 % 5"],
        mustNotContain: ["17 / 5"],
        feedback: fb(
          "17 % 5 → 2 remainder.",
          "Replace / with %."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Print 2 to the power of 3 using **.",
        lines: ["Use ** not *."],
        starterCode: "print(2 * 3)\n",
        mustContain: ["2 ** 3"],
        mustNotContain: ["2 * 3"],
        feedback: fb(
          "2 ** 3 → 8.",
          "Write print(2 ** 3)."
        ),
      },
      {
        mode: "fillBlank",
        prompt: "Complete floor division so the result is 3.",
        template: "print(7 ___ 2)",
        answers: ["//"],
        placeholder: "…",
        feedback: fb(
          "7 // 2 → 3.",
          "Floor division uses //."
        ),
      },
    ],
  },

  precedence: {
    explains: [
      {
        title: "Some operators bind tighter",
        body: `Python does **not** always go left-to-right blindly.

Priority (high → low):

1. \`**\`
2. \`* / // %\`
3. \`+ -\`

\`\`\`python
print(2 + 3 * 4)    # 14  — multiply first
print((2 + 3) * 4)  # 20  — parentheses first
\`\`\``,
      },
      {
        title: "Parentheses override order",
        body: `When in doubt, **add parentheses** — they document intent and force order:

\`\`\`python
print(2 ** 3 * 2)     # 16  — power first: (2**3)*2
print(2 ** (3 * 2))   # 64  — you forced multiply inside
\`\`\`

Clear code beats clever code.`,
      },
      {
        title: "Common surprise",
        body: `Beginners often expect \`2 + 3 * 4\` to be \`20\`. It is \`14\`:

\`\`\`python
# Mental parse:
# 3 * 4 = 12
# 2 + 12 = 14
print(2 + 3 * 4)
\`\`\`

If you want addition first, write \`(2 + 3) * 4\`.`,
      },
    ],
    quizzes: [
      {
        prompt: "What is 2 + 3 * 4?",
        code: "print(2 + 3 * 4)",
        choices: [
          { id: "14", label: "14" },
          { id: "20", label: "20" },
          { id: "9", label: "9" },
        ],
        correctId: "14",
        feedback: fb(
          "* before + → 2 + 12 = 14.",
          "Not left-to-right: multiply first."
        ),
        difficulty: "easy",
      },
      {
        prompt: "How do you force addition first?",
        choices: [
          { id: "a", label: "(2 + 3) * 4" },
          { id: "b", label: "2 + 3 * 4" },
          { id: "c", label: "2 + (3) * 4" },
        ],
        correctId: "a",
        feedback: fb(
          "Parentheses around the sum force order.",
          "2 + 3 * 4 still multiplies first."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What is 2 ** 3 * 2?",
        code: "print(2 ** 3 * 2)",
        choices: [
          { id: "16", label: "16" },
          { id: "64", label: "64" },
          { id: "12", label: "12" },
        ],
        correctId: "16",
        feedback: fb(
          "** before * → 8 * 2 = 16.",
          "Use 2 ** (3 * 2) if you want 64."
        ),
        difficulty: "hard",
      },
      {
        prompt: "What does (2 + 3) * 4 equal?",
        choices: [
          { id: "20", label: "20" },
          { id: "14", label: "14" },
          { id: "24", label: "24" },
        ],
        correctId: "20",
        feedback: fb(
          "Parentheses make the sum happen first: 5 * 4.",
          "Without them it would be 14."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "miniEdit",
        prompt: "Fix the expression so addition happens before multiplication (result 20).",
        lines: ["Add parentheses around 2 + 3."],
        starterCode: "print(2 + 3 * 4)\n",
        mustContain: ["(2 + 3)", "* 4"],
        mustNotContain: ["print(2 + 3 * 4)"],
        feedback: fb(
          "Parentheses forced the sum first.",
          "Use print((2 + 3) * 4)."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Force the multiply inside the power: make it 2 ** (3 * 2).",
        lines: ["Wrap 3 * 2 in parentheses."],
        starterCode: "print(2 ** 3 * 2)\n",
        mustContain: ["2 ** (3 * 2)"],
        mustNotContain: ["2 ** 3 * 2)"],
        feedback: fb(
          "Now the exponent is 6 → 64.",
          "Write print(2 ** (3 * 2))."
        ),
      },
      {
        mode: "fillBlank",
        prompt: "Add parentheses so the printed value is 20.",
        template: "print(___)",
        answers: ["(2 + 3) * 4", "(2+3)*4"],
        placeholder: "…",
        feedback: fb(
          "Grouped addition then multiply.",
          "Fill with (2 + 3) * 4."
        ),
      },
    ],
  },

  mix_safely: {
    explains: [
      {
        title: "Unlike types need a plan",
        body: `\`+\` between \`str\` and \`int\` raises \`TypeError\`:

\`\`\`python
age = 16
# print("Age: " + age)      # TypeError
print("Age: " + str(age))   # Age: 16
print(f"Age: {age}")        # Age: 16
print("Age:", age)          # Age: 16
\`\`\`

Convert, use an f-string, or use comma \`print\`.`,
      },
      {
        title: "Numbers can mix",
        body: `\`int\` + \`float\` is fine — result is float:

\`\`\`python
print(2 + 1.5)         # 3.5
print(type(2 + 1.5))   # <class 'float'>
\`\`\`

The danger zone is mostly **text + number** with \`+\`.`,
      },
      {
        title: "Convert early when stuck",
        body: `When debugging mixes:

1. \`print(type(x))\`
2. Convert: \`n = int(text)\` or \`label = str(n)\`
3. Then compute / join

\`\`\`python
text = "10"
n = int(text)
print(n + 1)  # 11
\`\`\``,
      },
    ],
    quizzes: [
      {
        prompt: "How do you fix \"Age: \" + 16?",
        choices: [
          { id: "a", label: 'Use str(16), an f-string, or print commas' },
          { id: "b", label: "Python will auto-convert the int" },
          { id: "c", label: "Remove the quotes from Age:" },
        ],
        correctId: "a",
        feedback: fb(
          "Convert or avoid + for mixed types.",
          "No silent str/int conversion with +."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What type is 2 + 1.5?",
        code: "print(type(2 + 1.5))",
        choices: [
          { id: "float", label: "float" },
          { id: "int", label: "int" },
          { id: "err", label: "TypeError" },
        ],
        correctId: "float",
        feedback: fb(
          "int + float → float.",
          "Number mixes are allowed; str + int is not."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Why does this fail?",
        code: 'print("Hi " + 16)',
        choices: [
          { id: "type", label: "TypeError — str + int with +" },
          { id: "hi", label: "Hi needs to be lowercase" },
          { id: "print", label: "print cannot show numbers" },
        ],
        correctId: "type",
        feedback: fb(
          "Convert with str(16) or use f\"Hi {16}\".",
          "+ only joins strings to strings."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Which line is safe?",
        code: "age = 16",
        choices: [
          { id: "a", label: 'print(f"Age: {age}")' },
          { id: "b", label: 'print("Age: " + age)' },
          { id: "c", label: 'print("Age: " + 16)' },
        ],
        correctId: "a",
        feedback: fb(
          "f-strings embed values safely.",
          "Raw + with int still TypeErrors."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "miniEdit",
        prompt: "Fix the TypeError using str(age).",
        lines: [
          'Keep the "Age: " prefix.',
          "Convert age before +.",
        ],
        starterCode: 'age = 16\nprint("Age: " + age)\n',
        mustContain: ["str(age)"],
        mustNotContain: ['"Age: " + age)'],
        feedback: fb(
          "str(age) makes + legal.",
          'Use print("Age: " + str(age)).'
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix the TypeError with an f-string instead of +.",
        lines: [
          "Use f\"...{age}...\".",
          "Remove the broken + expression.",
        ],
        starterCode: 'age = 16\nprint("Age: " + age)\n',
        mustContain: ['f"'],
        mustMatchAny: [
          String.raw`print\s*\(\s*f["'][^"']*\{age\}`,
        ],
        mustNotContain: ['"Age: " + age'],
        feedback: fb(
          "f-strings mix text and numbers cleanly.",
          'Try print(f"Age: {age}").'
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Convert text to int before adding 1.",
        lines: [
          "Use int(text).",
          "Then print n + 1.",
        ],
        starterCode: 'text = "10"\nprint(text + 1)\n',
        mustContain: ["int(text)", "+ 1"],
        mustNotContain: ["text + 1"],
        feedback: fb(
          "Convert early, then do math.",
          "n = int(text) then print(n + 1)."
        ),
      },
    ],
  },

  input_is_str: {
    explains: [
      {
        title: "input() always returns str",
        body: `Whatever the user types, \`input(...)\` gives you a **string**:

\`\`\`python
# typed = input("Age: ")  → always str, even if they type 15
typed = "15"   # simulate input in exercises
print(type(typed))  # <class 'str'>
\`\`\`

Digits on the keyboard do **not** make an int automatically.`,
      },
      {
        title: "Cast before math",
        body: `Convert, then compute:

\`\`\`python
typed = "15"          # simulate input
age = int(typed)
print(age + 1)        # 16
\`\`\`

Or in one step: \`age = int(input("Age: "))\`.

Without casting, \`typed + 1\` TypeErrors (or you accidentally concatenate strings).`,
      },
      {
        title: "Simulate input in drills",
        body: `In lesson practices you often **assign a string** instead of calling real \`input()\`:

\`\`\`python
typed = "15"
age = int(typed)
print(age + 1)
\`\`\`

Same skill: remember the value started as text.`,
      },
    ],
    quizzes: [
      {
        prompt: "What type does input() return?",
        choices: [
          { id: "str", label: "Always str" },
          { id: "int", label: "int when the user types digits" },
          { id: "auto", label: "Whatever matches the prompt text" },
        ],
        correctId: "str",
        feedback: fb(
          "input() is always text.",
          "You must cast with int() / float() for math."
        ),
        difficulty: "easy",
      },
      {
        prompt: "How do you add 1 to an age from input?",
        choices: [
          { id: "a", label: "age = int(typed) then age + 1" },
          { id: "b", label: "Just do typed + 1" },
          { id: "c", label: "input already returns int" },
        ],
        correctId: "a",
        feedback: fb(
          "Cast the string, then do math.",
          "typed + 1 fails or concatenates wrongly."
        ),
        difficulty: "easy",
      },
      {
        prompt: "After typed = \"15\", what is type(typed)?",
        code: 'typed = "15"\nprint(type(typed))',
        choices: [
          { id: "str", label: "str" },
          { id: "int", label: "int" },
          { id: "float", label: "float" },
        ],
        correctId: "str",
        feedback: fb(
          "Simulated input is still a string.",
          "Quotes → str until you cast."
        ),
        difficulty: "hard",
      },
      {
        prompt: "What goes wrong here?",
        code: 'typed = "5"\nprint(typed + 1)',
        choices: [
          { id: "type", label: "TypeError — str + int" },
          { id: "six", label: "It prints 6" },
          { id: "51", label: "It prints 51" },
        ],
        correctId: "type",
        feedback: fb(
          "Need int(typed) first.",
          "Mixing str and int with + crashes."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "miniEdit",
        prompt: "Simulate input: convert typed to int, then print age + 1.",
        lines: [
          'Keep typed = "15".',
          "age = int(typed)",
          "print(age + 1)",
        ],
        starterCode: 'typed = "15"\nprint(typed)\n',
        mustContain: ["int(typed)", "age =", "age + 1"],
        mustNotContain: ["print(typed)"],
        feedback: fb(
          "Cast then math — the input() lesson in one drill.",
          "Write age = int(typed) and print(age + 1)."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix the broken add: cast typed before adding 1.",
        lines: ["Use int(typed) in the expression or via a new variable."],
        starterCode: 'typed = "5"\nprint(typed + 1)\n',
        mustContain: ["int(typed)"],
        mustNotContain: ["typed + 1"],
        feedback: fb(
          "int(typed) + 1 works.",
          "Replace typed + 1 with int(typed) + 1 (or assign first)."
        ),
      },
      {
        mode: "fillBlank",
        prompt: "Cast the simulated input string to an int.",
        template: 'typed = "15"\nage = ___(typed)',
        answers: ["int"],
        placeholder: "…",
        feedback: fb(
          "int(typed) turns digit text into a number.",
          "The converter is int."
        ),
      },
    ],
  },
}
