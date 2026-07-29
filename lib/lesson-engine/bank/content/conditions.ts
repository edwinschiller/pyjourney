import type { ConceptContentBank } from "@/lib/lesson-engine/bank/content/variables"

const fb = (correct: string, wrong: string) => ({ correct, wrong })

/**
 * Slot fillers for the Conditions blueprint.
 * Keys MUST match TopicSpec.id in curricula/conditions.ts.
 */
export const CONDITIONS_CONTENT: ConceptContentBank = {
  why_branch: {
    explains: [
      {
        title: "Programs need choices",
        body: `Real programs react to **different situations**. Not every user, score, or password should get the same output.

\`\`\`python
score = 72
if score >= 60:
    print("Pass")
\`\`\`

Without branching, you could only print one fixed message — no pass/fail, no login, no inventory checks.`,
      },
      {
        title: "Decisions everywhere",
        body: `Apps use decisions constantly:

\`\`\`python
logged_in = True
if logged_in:
    print("Welcome back")

temperature = 35
if temperature > 30:
    print("Hot day — drink water")
\`\`\`

Branching turns a straight script into something that **responds** to data.`,
      },
      {
        title: "The if statement preview",
        body: `The basic shape you will use all lesson:

\`\`\`python
if condition:
    # indented body — runs only when condition is True
    print("Do this")
\`\`\`

**Condition** → True or False. **Body** → runs or skipped. That is the core of every decision in Python.`,
      },
    ],
    quizzes: [
      {
        prompt: "Why do programs need branching?",
        choices: [
          { id: "a", label: "To run different code for different situations" },
          { id: "b", label: "To make code run faster always" },
          { id: "c", label: "To avoid using variables" },
        ],
        correctId: "a",
        feedback: fb(
          "Branches react to data — pass/fail, logged in/out, etc.",
          "Branching is about different paths, not speed or skipping variables."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Which situation needs a decision?",
        choices: [
          { id: "pass", label: "Print Pass only when score >= 60" },
          { id: "hello", label: "Always print Hello once" },
          { id: "name", label: "Store name = \"Ada\" in a variable" },
        ],
        correctId: "pass",
        feedback: fb(
          "Pass/fail depends on score — that is branching.",
          "Fixed prints and assignment do not need if by themselves."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What happens when the condition is False?",
        choices: [
          { id: "skip", label: "The if body is skipped" },
          { id: "run", label: "The if body still runs" },
          { id: "crash", label: "Python always crashes" },
        ],
        correctId: "skip",
        feedback: fb(
          "False → skip the indented block.",
          "The body runs only on True."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Which is a decision branch?",
        code: "score = 55",
        choices: [
          { id: "a", label: "if score >= 60:\n    print('Pass')" },
          { id: "b", label: "print(score)" },
          { id: "c", label: "score = 60" },
        ],
        correctId: "a",
        feedback: fb(
          "if ...: chooses whether to print Pass.",
          "print and assignment alone are not branching."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Complete the keyword that starts a decision.",
        template: "___ score >= 60:\n    print('Pass')",
        answers: ["if"],
        placeholder: "…",
        feedback: fb(
          "if starts a conditional block.",
          "The decision keyword is if."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Add an if so Pass prints only when score is at least 60.",
        lines: [
          "Keep score = 72.",
          "Wrap print in if score >= 60:",
        ],
        starterCode: "score = 72\nprint('Pass')\n",
        mustContain: ["if score >= 60:", "print('Pass')"],
        feedback: fb(
          "Pass prints only when the condition holds.",
          "Use if score >= 60: before the print, indented."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Change score so the if body does NOT run (condition False).",
        lines: [
          "Keep the if score >= 60: block.",
          "Set score below 60.",
        ],
        starterCode: "score = 72\nif score >= 60:\n    print('Pass')\n",
        mustContain: ["if score >= 60:"],
        mustMatchAny: ["score = 5", "score = 59", "score = 0"],
        feedback: fb(
          "Low score → condition False → body skipped.",
          "Set score to something under 60, e.g. score = 55."
        ),
      },
    ],
  },

  comparisons: {
    explains: [
      {
        title: "= stores, == compares",
        body: `Two symbols that look similar — totally different jobs:

\`\`\`python
x = 5       # assignment — store 5 in x
print(x == 5)  # comparison — True
\`\`\`

**Never** use a single \`=\` inside \`if\` when you mean "is equal to". Use \`==\`.`,
      },
      {
        title: "Comparison operators",
        body: `Comparisons produce **bool** values:

\`\`\`python
print(5 == 5)   # True  — equal
print(5 != 3)   # True  — not equal
print(10 > 7)   # True  — greater
print(3 <= 3)   # True  — less or equal
\`\`\`

Use them inside \`if\` or store in a variable: \`ok = age >= 18\`.`,
      },
      {
        title: "Read comparisons aloud",
        body: `Say the operator in English to avoid mix-ups:

\`\`\`python
if score >= 60:   # "if score is greater than or equal to 60"
    print("Pass")

if name != "":     # "if name is not equal to empty string"
    print("Hi")
\`\`\`

Comparisons never change the variables — they only **ask** a question.`,
      },
    ],
    quizzes: [
      {
        prompt: "Which operator compares two values?",
        choices: [
          { id: "eq", label: "==" },
          { id: "assign", label: "=" },
          { id: "plus", label: "+" },
        ],
        correctId: "eq",
        feedback: fb(
          "== asks 'are these equal?'",
          "= assigns; it does not compare in conditions."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What does print(7 > 9) show?",
        code: "print(7 > 9)",
        choices: [
          { id: "false", label: "False" },
          { id: "true", label: "True" },
          { id: "7", label: "7" },
        ],
        correctId: "false",
        feedback: fb(
          "7 is not greater than 9.",
          "7 > 9 is False."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What is the difference between x = 5 and x == 5?",
        choices: [
          { id: "a", label: "= assigns; == compares and gives True/False" },
          { id: "b", label: "They do the same thing" },
          { id: "c", label: "== assigns; = compares" },
        ],
        correctId: "a",
        feedback: fb(
          "Single = stores; double == checks equality.",
          "Do not swap them — if x = 5 is illegal."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Which expression is True?",
        choices: [
          { id: "a", label: "10 >= 10" },
          { id: "b", label: "5 != 5" },
          { id: "c", label: "3 > 10" },
        ],
        correctId: "a",
        feedback: fb(
          "10 equals 10, so >= is True.",
          "!= 5==5 is False; 3>10 is False."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Fill in the comparison operator for equality.",
        template: "print(5 ___ 5)",
        answers: ["=="],
        placeholder: "…",
        feedback: fb(
          "== checks equality.",
          "Use == not = for comparing."
        ),
      },
      {
        mode: "fillBlank",
        prompt: "Fill in the operator meaning 'greater than'.",
        template: "ready = age ___ 18",
        answers: [">="],
        placeholder: "…",
        feedback: fb(
          ">= means at least 18.",
          "For '18 or older' use >=."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix the if line: use == to compare, not =.",
        lines: [
          "Change = to == in the condition.",
          "Keep the print body.",
        ],
        starterCode: "score = 60\nif score = 60:\n    print('Exact')\n",
        mustContain: ["if score == 60:", "print('Exact')"],
        mustNotContain: ["if score = 60"],
        feedback: fb(
          "== compares; = would be a syntax error in if.",
          "Write if score == 60:"
        ),
      },
    ],
  },

  if_basics: {
    explains: [
      {
        title: "if condition:",
        body: `An \`if\` statement has two parts: **header** and **body**.

\`\`\`python
age = 16
if age >= 18:
    print("Adult")
\`\`\`

The header ends with a **colon**. The body is **indented** (usually 4 spaces). Run the body only when the condition is True.`,
      },
      {
        title: "False means skip",
        body: `\`\`\`python
score = 45
if score >= 60:
    print("Pass")
print("Done")
\`\`\`

When \`score >= 60\` is False, Python **skips** the print inside the if — but still runs \`print("Done")\` after the block.`,
      },
      {
        title: "Any bool condition",
        body: `The condition can be a comparison **or** a bool variable:

\`\`\`python
ready = True
if ready:
    print("Go")

if 5 > 3:          # comparison → True
    print("Yes")
\`\`\`

Indentation tells Python what belongs inside the if.`,
      },
    ],
    quizzes: [
      {
        prompt: "What must follow if age >= 18?",
        choices: [
          { id: "colon", label: "A colon :" },
          { id: "semi", label: "A semicolon ;" },
          { id: "nothing", label: "Nothing — start print on same line" },
        ],
        correctId: "colon",
        feedback: fb(
          "Python if headers end with :.",
          "Missing colon → SyntaxError."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What happens when the condition is False?",
        choices: [
          { id: "skip", label: "Indented body is skipped" },
          { id: "run", label: "Body runs anyway" },
          { id: "error", label: "IndentationError always" },
        ],
        correctId: "skip",
        feedback: fb(
          "False → skip only the if body.",
          "Later unindented lines still run."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Which block is valid?",
        choices: [
          { id: "a", label: "if x > 0:\n    print(x)" },
          { id: "b", label: "if x > 0\n    print(x)" },
          { id: "c", label: "if x > 0: print(x)\nprint(y)  # y always at same indent as if" },
        ],
        correctId: "a",
        feedback: fb(
          "Colon + indented body.",
          "Need : after condition; body must indent."
        ),
        difficulty: "hard",
      },
      {
        prompt: "What does this print?",
        code: "n = 3\nif n > 5:\n    print('big')\nprint('end')",
        choices: [
          { id: "end", label: "end" },
          { id: "both", label: "big then end" },
          { id: "big", label: "big" },
        ],
        correctId: "end",
        feedback: fb(
          "3 > 5 is False — skip big, print end.",
          "Only the indented line is conditional."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Complete the if header (include the colon).",
        template: "___ age >= 18:",
        answers: ["if"],
        placeholder: "…",
        feedback: fb(
          "if starts the block.",
          "Keyword is if."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Indent the print so it belongs inside the if.",
        lines: [
          "Body must be indented under if.",
        ],
        starterCode: "score = 90\nif score >= 60:\nprint('Pass')\n",
        mustContain: ["if score >= 60:", "    print('Pass')"],
        mustNotContain: ["if score >= 60:\nprint"],
        feedback: fb(
          "Indented print runs only when condition True.",
          "Add 4 spaces before print('Pass')."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Add missing colon after the if condition.",
        lines: [
          "if score >= 60 needs a trailing :",
        ],
        starterCode: "score = 70\nif score >= 60\n    print('Pass')\n",
        mustContain: ["if score >= 60:"],
        feedback: fb(
          "Colon completes the if header.",
          "Write if score >= 60: with colon."
        ),
      },
    ],
  },

  else_branch: {
    explains: [
      {
        title: "Two paths with else",
        body: `\`else\` handles the **opposite** case — when the \`if\` condition was False:

\`\`\`python
age = 15
if age >= 18:
    print("Adult")
else:
    print("Minor")
\`\`\`

Exactly **one** of the two blocks runs, never both.`,
      },
      {
        title: "else has no condition",
        body: `\`else:\` is not \`else if\`. There is **no** test on the else line:

\`\`\`python
if score >= 60:
    print("Pass")
else:
    print("Fail")
\`\`\`

Python already knows: if we reached \`else\`, the \`if\` was False.`,
      },
      {
        title: "Same indentation as if",
        body: `\`else\` lines up with its \`if\`; both bodies indent one level deeper:

\`\`\`python
if logged_in:
    print("Dashboard")
else:
    print("Please log in")
\`\`\`

Mixing indentation breaks the pairing.`,
      },
    ],
    quizzes: [
      {
        prompt: "When does the else block run?",
        choices: [
          { id: "false", label: "When the if condition is False" },
          { id: "true", label: "When the if condition is True" },
          { id: "always", label: "Always, together with if" },
        ],
        correctId: "false",
        feedback: fb(
          "else is the False path.",
          "if True runs if-body only; else is for False."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Can if and else both run in one execution?",
        choices: [
          { id: "no", label: "No — exactly one branch" },
          { id: "yes", label: "Yes — always both" },
          { id: "maybe", label: "Yes — if you indent twice" },
        ],
        correctId: "no",
        feedback: fb(
          "Mutually exclusive paths.",
          "One condition → one outcome."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Which is valid?",
        choices: [
          { id: "a", label: "if x:\n    ...\nelse:\n    ..." },
          { id: "b", label: "if x:\n    ...\nelse if x:\n    ..." },
          { id: "c", label: "else:\n    ...\nif x:\n    ..." },
        ],
        correctId: "a",
        feedback: fb(
          "else pairs with if; use elif for extra tests.",
          "else if is elif in Python; else must follow if."
        ),
        difficulty: "hard",
      },
      {
        prompt: "What prints?",
        code: "score = 80\nif score >= 90:\n    print('A')\nelse:\n    print('Not A')",
        choices: [
          { id: "nota", label: "Not A" },
          { id: "a", label: "A" },
          { id: "both", label: "A then Not A" },
        ],
        correctId: "nota",
        feedback: fb(
          "80 >= 90 is False → else runs.",
          "Only else body prints."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Complete the keyword for the False branch.",
        template: "if score >= 60:\n    print('Pass')\n___:\n    print('Fail')",
        answers: ["else"],
        placeholder: "…",
        feedback: fb(
          "else catches the False case.",
          "Keyword is else."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Add else to print Fail when score is below 60.",
        lines: [
          "Keep if score >= 60: print('Pass').",
          "Add else: with indented print('Fail').",
        ],
        starterCode: "score = 55\nif score >= 60:\n    print('Pass')\n",
        mustContain: ["else:", "print('Fail')"],
        feedback: fb(
          "Pass or Fail — two clear paths.",
          "Add else:\\n    print('Fail')"
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix: remove the illegal condition on else.",
        lines: [
          "else: must have no condition.",
        ],
        starterCode: "age = 20\nif age >= 18:\n    print('Adult')\nelse age < 18:\n    print('Minor')\n",
        mustContain: ["else:", "print('Minor')"],
        mustNotContain: ["else age"],
        feedback: fb(
          "else alone — no test.",
          "Write else: not else age < 18:"
        ),
      },
    ],
  },

  elif_chain: {
    explains: [
      {
        title: "elif — else if",
        body: `More than two outcomes? Chain **elif** (else if):

\`\`\`python
if score >= 90:
    print("A")
elif score >= 80:
    print("B")
elif score >= 70:
    print("C")
else:
    print("Below C")
\`\`\`

Checked **top to bottom**. First True branch wins.`,
      },
      {
        title: "Only one branch runs",
        body: `\`\`\`python
score = 85
if score >= 90:
    print("A")
elif score >= 80:
    print("B")    # this runs
elif score >= 70:
    print("C")    # skipped — already matched
\`\`\`

After one branch runs, the rest of the chain is **skipped**.`,
      },
      {
        title: "Order matters",
        body: `Put **stricter / higher** checks first:

\`\`\`python
# Good: 90 before 80
if score >= 90:
    band = "A"
elif score >= 80:
    band = "B"

# Bad: 80 before 90 — everyone with 95 gets B!
\`\`\`

Think: first match stops the ladder.`,
      },
    ],
    quizzes: [
      {
        prompt: "What does elif mean?",
        choices: [
          { id: "a", label: "Else if — another test if previous branches failed" },
          { id: "b", label: "Every branch runs in order" },
          { id: "c", label: "End if" },
        ],
        correctId: "a",
        feedback: fb(
          "elif is checked only when earlier if/elif were False.",
          "Only the first True branch runs."
        ),
        difficulty: "easy",
      },
      {
        prompt: "score is 85. Which branch runs?",
        code: "score = 85\nif score >= 90:\n    print('A')\nelif score >= 80:\n    print('B')\nelif score >= 70:\n    print('C')",
        choices: [
          { id: "b", label: "B" },
          { id: "a", label: "A" },
          { id: "c", label: "C" },
        ],
        correctId: "b",
        feedback: fb(
          "85 >= 80 and not >= 90 → B.",
          "First True is elif >= 80."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Why check >= 90 before >= 80?",
        choices: [
          { id: "order", label: "Otherwise high scores match the lower branch first" },
          { id: "syntax", label: "Python requires random order" },
          { id: "speed", label: "90 is faster to compute" },
        ],
        correctId: "order",
        feedback: fb(
          "First match wins — highest threshold first.",
          "Wrong order gives wrong grades."
        ),
        difficulty: "hard",
      },
      {
        prompt: "How many elif bodies run when score = 95?",
        code: "if score >= 90: ...\nelif score >= 80: ...\nelif score >= 70: ...",
        choices: [
          { id: "one", label: "Exactly one" },
          { id: "three", label: "All three" },
          { id: "two", label: "Two" },
        ],
        correctId: "one",
        feedback: fb(
          "First True branch only.",
          "Chain stops after first match."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Complete the keyword for the second branch.",
        template: "if score >= 90:\n    print('A')\n___ score >= 80:\n    print('B')",
        answers: ["elif"],
        placeholder: "…",
        feedback: fb(
          "elif links the next case.",
          "Use elif not else if."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Add elif so 80–89 prints B between A and the rest.",
        lines: [
          "Keep if score >= 90: print('A').",
          "Insert elif score >= 80: print('B').",
        ],
        starterCode: "score = 85\nif score >= 90:\n    print('A')\nelse:\n    print('Other')\n",
        mustContain: ["elif score >= 80:", "print('B')"],
        feedback: fb(
          "B band sits between A and Other.",
          "Add elif score >= 80: before else."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix order: check >= 90 before >= 80 so 95 gets A.",
        lines: [
          "Higher threshold must come first.",
        ],
        starterCode: "score = 95\nif score >= 80:\n    print('B')\nelif score >= 90:\n    print('A')\n",
        mustContain: ["if score >= 90:", "elif score >= 80:"],
        feedback: fb(
          "95 now hits A first.",
          "Swap: if >= 90 then elif >= 80."
        ),
      },
    ],
  },

  bool_logic: {
    explains: [
      {
        title: "and — both must pass",
        body: `\`and\` combines conditions; **both** must be True:

\`\`\`python
age = 15
if age >= 13 and age <= 19:
    print("Teen")
\`\`\`

If either side is False, the whole \`and\` is False.`,
      },
      {
        title: "or — at least one",
        body: `\`or\` is True when **at least one** side is True:

\`\`\`python
day = "Sat"
if day == "Sat" or day == "Sun":
    print("Weekend")
\`\`\`

Both False → whole \`or\` is False.`,
      },
      {
        title: "not — flip",
        body: `\`not\` inverts True ↔ False:

\`\`\`python
logged_in = False
if not logged_in:
    print("Please sign in")
\`\`\`

Use parentheses when mixing: \`if (a or b) and not c:\``,
      },
    ],
    quizzes: [
      {
        prompt: "When is (a and b) True?",
        choices: [
          { id: "both", label: "When both a and b are True" },
          { id: "one", label: "When at least one is True" },
          { id: "never", label: "Never" },
        ],
        correctId: "both",
        feedback: fb(
          "and needs both True.",
          "or is for at least one; and needs both."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What does not False evaluate to?",
        choices: [
          { id: "true", label: "True" },
          { id: "false", label: "False" },
          { id: "none", label: "None" },
        ],
        correctId: "true",
        feedback: fb(
          "not flips False → True.",
          "not inverts booleans."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What prints?",
        code: "x = 5\nif x > 0 and x < 10:\n    print('mid')",
        choices: [
          { id: "mid", label: "mid" },
          { id: "none", label: "Nothing" },
          { id: "err", label: "Error" },
        ],
        correctId: "mid",
        feedback: fb(
          "5 is between 0 and 10.",
          "Both sides True → body runs."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Which condition is True?",
        choices: [
          { id: "or", label: "False or True" },
          { id: "and", label: "True and False" },
          { id: "not", label: "not True" },
        ],
        correctId: "or",
        feedback: fb(
          "or with one True → True.",
          "and needs both; not True is False."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Fill in the operator meaning 'both conditions'.",
        template: "if age >= 13 ___ age <= 19:\n    print('Teen')",
        answers: ["and"],
        placeholder: "…",
        feedback: fb(
          "and requires both bounds.",
          "Use and to combine."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Use or so either Sat or Sun prints Weekend.",
        lines: [
          "Combine day == 'Sat' or day == 'Sun'.",
        ],
        starterCode: "day = 'Sat'\nif day == 'Sat':\n    print('Weekend')\n",
        mustContain: ["or day == 'Sun'", "print('Weekend')"],
        feedback: fb(
          "One if with or covers both days.",
          "if day == 'Sat' or day == 'Sun':"
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Use not so the message prints when logged_in is False.",
        lines: [
          "Replace if logged_in with if not logged_in.",
        ],
        starterCode: "logged_in = False\nif logged_in:\n    print('Please sign in')\n",
        mustContain: ["if not logged_in:", "print('Please sign in')"],
        feedback: fb(
          "not logged_in is True when logged_in is False.",
          "Write if not logged_in:"
        ),
      },
    ],
  },

  truthiness: {
    explains: [
      {
        title: "Falsey values",
        body: `In an \`if\`, Python treats some values as **False** without \`==\`:

\`\`\`python
# Falsey (intro level):
# False, None, 0, 0.0, "", [], {}

count = 0
if count:
    print("Has items")   # skipped
\`\`\`

Zero and empty string → condition acts False.`,
      },
      {
        title: "Truthy values",
        body: `Most other values are **truthy** — non-empty strings, non-zero numbers:

\`\`\`python
name = "Ada"
if name:
    print("Hello", name)   # runs

text = "0"    # string with digit zero — still non-empty → truthy!
if text:
    print("Truthy")
\`\`\``,
      },
      {
        title: "if name: pattern",
        body: `Common shortcut for "has text":

\`\`\`python
name = ""
if name:
    print("Hi", name)
else:
    print("Name missing")
\`\`\`

For clarity you can write \`if name != "":\` — same idea for beginners.`,
      },
    ],
    quizzes: [
      {
        prompt: "Is \"\" truthy or falsey?",
        choices: [
          { id: "falsey", label: "Falsey" },
          { id: "truthy", label: "Truthy" },
          { id: "error", label: "SyntaxError" },
        ],
        correctId: "falsey",
        feedback: fb(
          "Empty string is falsey.",
          '"" has no characters → acts False in if.'
        ),
        difficulty: "easy",
      },
      {
        prompt: "Is \"0\" (the string) truthy or falsey?",
        choices: [
          { id: "truthy", label: "Truthy — non-empty string" },
          { id: "falsey", label: "Falsey — looks like zero" },
          { id: "none", label: "None" },
        ],
        correctId: "truthy",
        feedback: fb(
          "Non-empty str is truthy even if characters are digits.",
          "Only empty \"\" is falsey among strings here."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What runs?",
        code: "count = 0\nif count:\n    print('yes')\nelse:\n    print('no')",
        choices: [
          { id: "no", label: "no" },
          { id: "yes", label: "yes" },
          { id: "both", label: "yes then no" },
        ],
        correctId: "no",
        feedback: fb(
          "0 is falsey → else.",
          "count = 0 fails the if test."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Which value is falsey?",
        choices: [
          { id: "zero", label: "0" },
          { id: "one", label: "1" },
          { id: "text", label: '"hello"' },
        ],
        correctId: "zero",
        feedback: fb(
          "0 is falsey; 1 and non-empty str are truthy.",
          "Check the intro falsey list."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Which int is falsey in if checks?",
        template: "count = ___\nif count:\n    print('empty')",
        answers: ["0"],
        placeholder: "…",
        feedback: fb(
          "0 is falsey.",
          "Use 0 for empty count."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Use if name: so Hi prints only when name is non-empty.",
        lines: [
          "Keep name = 'Ada'.",
          "Guard print with if name:",
        ],
        starterCode: "name = 'Ada'\nprint('Hi', name)\n",
        mustContain: ["if name:", "print('Hi', name)"],
        feedback: fb(
          "Non-empty name → truthy → print runs.",
          "Wrap print in if name:"
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Set name to empty so the else branch runs.",
        lines: [
          "Keep if name: / else structure.",
          "Make name falsey.",
        ],
        starterCode: "name = 'Ada'\nif name:\n    print('Hi')\nelse:\n    print('Missing')\n",
        mustContain: ["else:", "print('Missing')"],
        mustMatchAny: ['name = ""', "name = ''"],
        feedback: fb(
          "Empty name → else → Missing.",
          'Set name = "".'
        ),
      },
    ],
  },

  nest_vs_flat: {
    explains: [
      {
        title: "Nested if",
        body: `Put an \`if\` **inside** another branch when the inner question only matters after the outer one:

\`\`\`python
if role == "admin":
    if logged_in:
        print("Admin panel")
    else:
        print("Admin — please log in")
\`\`\`

Inner block runs only when \`role == "admin"\`.`,
      },
      {
        title: "Flat elif ladder",
        body: `When cases are **peers** (A / B / C grades), use one flat chain:

\`\`\`python
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
\`\`\`

Easier to read than stacking unrelated nested ifs.`,
      },
      {
        title: "When to choose which",
        body: `**Nest** when the inner check depends on the outer result.
**Flatten** when exactly one of several equal-priority cases should win.

Too much nesting → hard to read. If elif can express it, prefer elif.`,
      },
    ],
    quizzes: [
      {
        prompt: "When is nesting appropriate?",
        choices: [
          { id: "a", label: "Inner check only applies after outer condition is True" },
          { id: "b", label: "Always — never use elif" },
          { id: "c", label: "Only for syntax errors" },
        ],
        correctId: "a",
        feedback: fb(
          "Nest when inner logic is scoped to outer case.",
          "Peer cases → elif ladder."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Grade A/B/C from score — best shape?",
        choices: [
          { id: "elif", label: "Flat if / elif / elif ladder" },
          { id: "nest", label: "if inside if inside if for same score" },
          { id: "print", label: "Three separate ifs with no elif" },
        ],
        correctId: "elif",
        feedback: fb(
          "Mutually exclusive bands → elif.",
          "Separate ifs can all fire; deep nest is messy."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What is wrong with 5 levels of nested if?",
        choices: [
          { id: "read", label: "Hard to read and maintain" },
          { id: "fast", label: "Python forbids it" },
          { id: "mem", label: "Uses too much memory always" },
        ],
        correctId: "read",
        feedback: fb(
          "Deep nesting hurts clarity — refactor to elif or functions later.",
          "Legal but ugly; prefer flat when possible."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Which uses nesting correctly?",
        choices: [
          { id: "a", label: "if admin:\n    if logged_in:\n        open_panel()" },
          { id: "b", label: "if score>=90:\n    if score>=80:\n        grade='B'" },
          { id: "c", label: "if A:\n    elif B:\n        ..." },
        ],
        correctId: "a",
        feedback: fb(
          "Login check only matters for admin.",
          "B nests wrong thresholds; elif goes inside if wrongly."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Complete the peer-case keyword (not nested else-if text).",
        template: "if score >= 90:\n    print('A')\n___ score >= 80:\n    print('B')",
        answers: ["elif"],
        placeholder: "…",
        feedback: fb(
          "Flat ladder uses elif.",
          "elif for second peer case."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Flatten: replace nested if score>=80 inside if score>=90 with elif.",
        lines: [
          "Use if >= 90 then elif >= 80.",
        ],
        starterCode: "score = 85\nif score >= 90:\n    print('A')\nif score >= 80:\n    print('B')\n",
        mustContain: ["if score >= 90:", "elif score >= 80:"],
        mustNotContain: ["if score >= 90:\n    print('A')\nif score >= 80"],
        feedback: fb(
          "elif makes bands mutually exclusive.",
          "Second if should become elif score >= 80:"
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Add inner if logged_in under if role == 'admin'.",
        lines: [
          "Outer: role == 'admin'.",
          "Inner: if logged_in: print('Panel').",
        ],
        starterCode: "role = 'admin'\nlogged_in = True\nif role == 'admin':\n    print('Panel')\n",
        mustContain: ["if logged_in:", "print('Panel')"],
        feedback: fb(
          "Panel only for admin who is logged in.",
          "Nest if logged_in: inside admin block."
        ),
      },
    ],
  },

  compare_types: {
    explains: [
      {
        title: "int vs str",
        body: `Same digits, different types — **not equal**:

\`\`\`python
print(15 == 15)     # True
print(15 == "15")   # False — int vs str
\`\`\`

Compare numbers to numbers. Cast digit-strings first: \`int(text)\`.`,
      },
      {
        title: "String ordering surprises",
        body: `\`>\` on strings compares **character by character** (lexicographic), not as numbers:

\`\`\`python
print("10" > "2")   # True — "1" vs "2" at first char
print(10 > 2)       # True — numeric compare
\`\`\`

Use \`int()\` when you mean numeric order.`,
      },
      {
        title: "Fix mismatched compares",
        body: `\`\`\`python
age = 16          # int from earlier code
# if age == "16":   # False — wrong type

if age == 16:     # correct
    print("Sweet sixteen")
\`\`\`

When comparisons feel wrong, check types with \`type()\`.`,
      },
    ],
    quizzes: [
      {
        prompt: "Is 5 == \"5\" True?",
        choices: [
          { id: "false", label: "False — different types" },
          { id: "true", label: "True" },
          { id: "error", label: "TypeError" },
        ],
        correctId: "false",
        feedback: fb(
          "int 5 and str \"5\" are not equal with ==.",
          "Cast or compare like types."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Why might score == \"100\" fail when score is 100?",
        choices: [
          { id: "types", label: "int 100 vs str \"100\" — == is False" },
          { id: "syntax", label: "Quotes are illegal" },
          { id: "100", label: "100 cannot be compared" },
        ],
        correctId: "types",
        feedback: fb(
          "Type mismatch → False, not TypeError.",
          "Use score == 100 or int(text)."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What does print(\"10\" > \"2\") show?",
        code: 'print("10" > "2")',
        choices: [
          { id: "true", label: "True" },
          { id: "false", label: "False" },
          { id: "err", label: "TypeError" },
        ],
        correctId: "true",
        feedback: fb(
          "String compare: \"1\" < \"2\" at first character.",
          "Not numeric — lexicographic order."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Safe compare after simulated input?",
        choices: [
          { id: "a", label: "age = int(typed) then age == 16" },
          { id: "b", label: "typed == 16 when typed is \"16\"" },
          { id: "c", label: "Never compare" },
        ],
        correctId: "a",
        feedback: fb(
          "Cast str input to int before numeric compare.",
          "\"16\" == 16 is False."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Cast typed before comparing to int 16.",
        template: 'typed = "16"\nif ___(typed) == 16:\n    print("OK")',
        answers: ["int"],
        placeholder: "…",
        feedback: fb(
          "int(typed) makes numeric compare work.",
          "Use int() on the string."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix comparison: compare age to int 16, not string \"16\".",
        lines: [
          "age is int — compare to 16 without quotes.",
        ],
        starterCode: "age = 16\nif age == \"16\":\n    print('Match')\n",
        mustContain: ["if age == 16:", "print('Match')"],
        mustNotContain: ['age == "16"'],
        feedback: fb(
          "int vs int → True.",
          "Write if age == 16:"
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Use int() so numeric compare works on text score.",
        lines: [
          'Keep score_text = "85".',
          "Compare int(score_text) >= 80.",
        ],
        starterCode: 'score_text = "85"\nif score_text >= 80:\n    print("B")\n',
        mustContain: ["int(score_text)", ">= 80"],
        mustNotContain: ["score_text >= 80"],
        feedback: fb(
          "Cast before >= on digit-string.",
          "if int(score_text) >= 80:"
        ),
      },
    ],
  },

  multi_conditions: {
    explains: [
      {
        title: "Combine with and / or",
        body: `When checks belong together, one \`if\` line is fine:

\`\`\`python
if age >= 13 and age <= 19:
    print("Teen")

if day == "Sat" or day == "Sun":
    print("Weekend")
\`\`\`

Both conditions evaluated; \`and\` / \`or\` combine the bool results.`,
      },
      {
        title: "Chained comparisons",
        body: `Python allows readable chains:

\`\`\`python
if 0 <= age <= 120:
    print("Valid age")

if 0 <= score <= 100:
    print("Valid score")
\`\`\`

Same meaning as \`age >= 0 and age <= 120\` — often clearer.`,
      },
      {
        title: "Name intermediate bools",
        body: `Long conditions? Store sub-results:

\`\`\`python
in_range = 0 <= score <= 100
has_name = name != ""
if in_range and has_name:
    print("OK")
\`\`\`

Easier to debug than one giant line.`,
      },
    ],
    quizzes: [
      {
        prompt: "What does 0 <= x <= 10 mean?",
        choices: [
          { id: "a", label: "x is between 0 and 10 inclusive" },
          { id: "b", label: "x equals exactly 0 or 10 only" },
          { id: "c", label: "SyntaxError" },
        ],
        correctId: "a",
        feedback: fb(
          "Chained comparison — both bounds inclusive.",
          "Same as x >= 0 and x <= 10."
        ),
        difficulty: "easy",
      },
      {
        prompt: "When to use and on one line?",
        choices: [
          { id: "a", label: "When both checks must pass together" },
          { id: "b", label: "Never — always nest" },
          { id: "c", label: "Only for strings" },
        ],
        correctId: "a",
        feedback: fb(
          "and merges related requirements.",
          "Nest when inner only applies sometimes."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Which is equivalent to age >= 0 and age <= 120?",
        choices: [
          { id: "chain", label: "0 <= age <= 120" },
          { id: "or", label: "age >= 0 or age <= 120" },
          { id: "wrong", label: "0 <= age >= 120" },
        ],
        correctId: "chain",
        feedback: fb(
          "Standard chained comparison.",
          "or would almost always be True."
        ),
        difficulty: "hard",
      },
      {
        prompt: "What prints?",
        code: "x = 5\nif 0 <= x <= 10:\n    print('ok')",
        choices: [
          { id: "ok", label: "ok" },
          { id: "no", label: "Nothing" },
          { id: "err", label: "Error" },
        ],
        correctId: "ok",
        feedback: fb(
          "5 is in range.",
          "Chain True → body runs."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Fill the upper bound operator in the chained comparison.",
        template: "if 0 <= score ___ 100:\n    print('Valid')",
        answers: ["<="],
        placeholder: "…",
        feedback: fb(
          "0 <= score <= 100 includes both boundaries.",
          "Use <= before 100."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Combine two ifs into one if with and.",
        lines: [
          "Single if: age >= 13 and age <= 19.",
        ],
        starterCode: "age = 15\nif age >= 13:\n    if age <= 19:\n        print('Teen')\n",
        mustContain: ["if age >= 13 and age <= 19:", "print('Teen')"],
        feedback: fb(
          "One line with and — same logic, flatter.",
          "Replace nested ifs with and."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Add has_name and use and with in_range.",
        lines: [
          "has_name = name != ''",
          "if in_range and has_name:",
        ],
        starterCode: "name = 'Ada'\nscore = 85\nin_range = 0 <= score <= 100\nif in_range:\n    print('OK')\n",
        mustContain: ["has_name", "if in_range and has_name:", "print('OK')"],
        feedback: fb(
          "Both flags required.",
          "Define has_name and combine with and."
        ),
      },
    ],
  },

  common_bugs: {
    explains: [
      {
        title: "= vs == in if",
        body: `\`\`\`python
# Bug — SyntaxError:
# if score = 60:

# Fix:
if score == 60:
    print("Exact")
\`\`\`

Assignment (\`=\`) is not allowed in the condition expression.`,
      },
      {
        title: "True / False spelling",
        body: `\`\`\`python
# Bug — NameError:
# if ready == true:

# Fix:
if ready == True:   # or simply: if ready:
    print("Go")
\`\`\`

Booleans are \`True\` and \`False\` — capital letters, no quotes.`,
      },
      {
        title: "Indentation",
        body: `Mixed tabs/spaces or missing indent → \`IndentationError\` or wrong logic:

\`\`\`python
if score >= 60:
    print("Pass")    # must align consistently
\`\`\`

Copy-paste often breaks indentation — check the if body is **deeper** than the header.`,
      },
    ],
    quizzes: [
      {
        prompt: "Why is if x = 3 illegal?",
        choices: [
          { id: "syntax", label: "Assignment is not allowed in if condition" },
          { id: "ok", label: "It is legal Python" },
          { id: "indent", label: "Only indentation matters" },
        ],
        correctId: "syntax",
        feedback: fb(
          "Use == to compare.",
          "= assigns; if needs a bool expression."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What error does true give?",
        choices: [
          { id: "name", label: "NameError — use True" },
          { id: "type", label: "TypeError" },
          { id: "none", label: "No error" },
        ],
        correctId: "name",
        feedback: fb(
          "true is not defined — capital T.",
          "Python bools: True / False."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Which line is the bug?",
        code: "score = 70\nif score >= 60\n    print('Pass')",
        choices: [
          { id: "colon", label: "Missing : after if score >= 60" },
          { id: "print", label: "print is wrong keyword" },
          { id: "score", label: "score should be a string" },
        ],
        correctId: "colon",
        feedback: fb(
          "Header needs colon before body.",
          "Add : at end of if line."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Which condition is valid?",
        choices: [
          { id: "a", label: "if logged_in:" },
          { id: "b", label: "if logged_in = True:" },
          { id: "c", label: "if true:" },
        ],
        correctId: "a",
        feedback: fb(
          "Bool variable alone is fine.",
          "B assigns in if; C uses undefined true."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Spell the bool literal correctly.",
        template: "ready = ___",
        answers: ["True"],
        placeholder: "…",
        feedback: fb(
          "True with capital T.",
          "Not true or \"True\"."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix if line: == not =.",
        lines: [
          "Compare score to 60.",
        ],
        starterCode: "score = 60\nif score = 60:\n    print('Exact')\n",
        mustContain: ["if score == 60:"],
        mustNotContain: ["if score = 60"],
        feedback: fb(
          "== compares safely.",
          "Replace = with == in if."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix NameError: use True not true.",
        lines: [
          "Capital T on True.",
        ],
        starterCode: "flag = true\nif flag:\n    print('Go')\n",
        mustContain: ["flag = True"],
        mustNotContain: ["flag = true"],
        feedback: fb(
          "True is the bool literal.",
          "Write flag = True."
        ),
      },
    ],
  },

  decision_patterns: {
    explains: [
      {
        title: "Grade band ladder",
        body: `Model letter grades with ordered \`elif\`:

\`\`\`python
score = 85
if score >= 90:
    band = "A"
elif score >= 80:
    band = "B"
elif score >= 70:
    band = "C"
elif score >= 60:
    band = "D"
else:
    band = "F"
print(score, band)
\`\`\`

Higher thresholds **first**.`,
      },
      {
        title: "Boundaries: >= vs >",
        body: `Decide inclusive or exclusive edges:

\`\`\`python
# >= 60 means 60 counts as pass
if score >= 60:
    print("Pass")

# > 60 means exactly 60 fails
if score > 60:
    print("Strict pass")
\`\`\`

Pick one rule and stick to it in the ladder.`,
      },
      {
        title: "Assign then print once",
        body: `Set a result inside branches, print after the chain:

\`\`\`python
if tickets <= 0:
    status = "Sold out"
elif tickets < 5:
    status = "Almost gone"
else:
    status = "Available"
print(status)
\`\`\`

Cleaner than many prints scattered in each branch.`,
      },
    ],
    quizzes: [
      {
        prompt: "What band for score 85 with standard A≥90, B≥80 ladder?",
        choices: [
          { id: "b", label: "B" },
          { id: "a", label: "A" },
          { id: "c", label: "C" },
        ],
        correctId: "b",
        feedback: fb(
          "85 >= 80 but not >= 90.",
          "Check thresholds top-down."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Why test >= 90 before >= 80?",
        choices: [
          { id: "first", label: "First match wins — high scores must hit high band" },
          { id: "rand", label: "Python randomizes order" },
          { id: "ascii", label: "A comes before B in ASCII" },
        ],
        correctId: "first",
        feedback: fb(
          "Wrong order traps 95 in B branch.",
          "Descending thresholds in elif chain."
        ),
        difficulty: "easy",
      },
      {
        prompt: "score = 60 with if score >= 60: Pass — pass or fail?",
        choices: [
          { id: "pass", label: "Pass — 60 is included" },
          { id: "fail", label: "Fail" },
          { id: "err", label: "Error" },
        ],
        correctId: "pass",
        feedback: fb(
          ">= includes the boundary.",
          "60 >= 60 is True."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Best pattern for many bands?",
        choices: [
          { id: "elif", label: "if / elif ladder assigning one band variable" },
          { id: "many", label: "Separate unrelated if blocks each printing" },
          { id: "nest", label: "if inside if inside if for same variable" },
        ],
        correctId: "elif",
        feedback: fb(
          "One ladder, one result variable.",
          "elif keeps cases exclusive and readable."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Complete the first threshold for grade A.",
        template: "if score ___ 90:\n    band = 'A'",
        answers: [">="],
        placeholder: "…",
        feedback: fb(
          ">= 90 includes 90.",
          "Use >= for inclusive band."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Build A/B/else: A if >=90, B if >=80, else Other.",
        lines: [
          "Order: 90 before 80.",
          "Set band variable in each branch.",
        ],
        starterCode: "score = 85\nband = ''\n# add if / elif / else\nprint(band)\n",
        mustContain: ["if score >= 90:", "elif score >= 80:", "else:", "band ="],
        feedback: fb(
          "85 → band B printed.",
          "Add full elif ladder before print(band)."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Add elif >= 60 for D before else F (complete A–F style middle).",
        lines: [
          "Keep A and B branches.",
          "Insert elif score >= 60: band = 'D'.",
        ],
        starterCode: "score = 65\nband = ''\nif score >= 90:\n    band = 'A'\nelif score >= 80:\n    band = 'B'\nelse:\n    band = 'F'\nprint(band)\n",
        mustContain: ["elif score >= 60:", "band = 'D'"],
        feedback: fb(
          "65 maps to D not F.",
          "Add elif for D between B and else."
        ),
      },
    ],
  },
}
