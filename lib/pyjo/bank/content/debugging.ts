import type { ConceptContentBank } from "@/lib/pyjo/bank/content/variables"

const fb = (correct: string, wrong: string) => ({ correct, wrong })

/**
 * Slot fillers for the Debugging blueprint.
 * Keys MUST match TopicSpec.id in curricula/debugging.ts.
 */
export const DEBUGGING_CONTENT: ConceptContentBank = {
  why_debug: {
    explains: [
      {
        title: "Bugs happen to everyone",
        body: `Hitting a bug does **not** mean you failed — it means Python reached something it cannot execute or your logic does not match your goal.

\`\`\`python
# Even simple lines can crash:
# print(score)     # NameError if score was never set
# print(2 + "3")   # TypeError — types clash
\`\`\`

**Debugging** is the skill of turning that red text into a fix.`,
      },
      {
        title: "Errors are messages, not grades",
        body: `A traceback is Python's way of saying *where* it stopped and *what* went wrong.

\`\`\`python
lives = 3
print(lives + bonus)  # NameError: name 'bonus' is not defined
\`\`\`

Read the message — it is a clue, not a comment on you as a person.`,
      },
      {
        title: "Fix with a loop, not panic",
        body: `Professional debugging looks like a loop:

1. Run the code
2. Read the error
3. Change **one** thing
4. Run again

\`\`\`python
# Goal line — celebrate when you reach it cleanly:
print("Done!")
\`\`\`

Small steps beat rewriting the whole file in frustration.`,
      },
    ],
    quizzes: [
      {
        prompt: "What is a traceback mainly for?",
        choices: [
          { id: "a", label: "Showing where Python stopped and why" },
          { id: "b", label: "Grading your coding ability" },
          { id: "c", label: "Deleting your file" },
        ],
        correctId: "a",
        feedback: fb(
          "Tracebacks are diagnostic messages.",
          "They explain the crash — they are not personal feedback."
        ),
        difficulty: "easy",
      },
      {
        prompt: "When you see an error, what is a good first habit?",
        choices: [
          { id: "read", label: "Read the error message carefully" },
          { id: "rewrite", label: "Rewrite the entire program from scratch" },
          { id: "ignore", label: "Ignore it and hope it passes" },
        ],
        correctId: "read",
        feedback: fb(
          "The message names the problem class.",
          "Random rewrites hide what actually broke."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Which statement is true?",
        choices: [
          { id: "a", label: "Every programmer debugs — it is normal" },
          { id: "b", label: "Errors mean you should stop coding" },
          { id: "c", label: "Only beginners get tracebacks" },
        ],
        correctId: "a",
        feedback: fb(
          "Debugging is a core skill, not shame.",
          "Experienced devs read tracebacks daily."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Why change one thing at a time when fixing?",
        choices: [
          { id: "a", label: "You know which change fixed or broke things" },
          { id: "b", label: "Python requires single-line edits" },
          { id: "c", label: "Multiple fixes always cancel out" },
        ],
        correctId: "a",
        feedback: fb(
          "One change → clear cause and effect.",
          "Shotgun edits make the next error harder to read."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Complete the term for Python's crash report text.",
        template: "Read the ___ carefully before editing code.",
        answers: ["traceback", "error message", "error"],
        placeholder: "…",
        feedback: fb(
          "The traceback / error text is your map.",
          "Look for the word traceback or read the error message."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Add the missing assignment so print(score) does not NameError.",
        lines: [
          "Define score before you print it.",
        ],
        starterCode: 'print(score)\n',
        mustContain: ["score =", "print(score)"],
        feedback: fb(
          "Name exists before use — good.",
          "Add a line like score = 10 above print(score)."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix the TypeError so the program prints 5 (ints, not str + int).",
        lines: [
          "Make both operands ints.",
        ],
        starterCode: 'print(2 + "3")\n',
        mustContain: ["print(2 + 3)", "print(5)"],
        mustNotContain: ['"3"'],
        feedback: fb(
          "Same types → math works.",
          "Use 3 without quotes: print(2 + 3)."
        ),
      },
    ],
  },

  read_traceback: {
    explains: [
      {
        title: "Bottom line first",
        body: `The **last line** of a traceback names the error **class** and a short **message**:

\`\`\`python
# Traceback (most recent call last):
#   File "game.py", line 4, in <module>
#     print(total)
# NameError: name 'total' is not defined
# ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
# Read this first: NameError + "total" is not defined
\`\`\`

That tells you *what kind* of problem you have.`,
      },
      {
        title: "Find your file and line",
        body: `Scan **upward** for a frame in **your** script (not library internals):

\`\`\`python
#   File "my_script.py", line 7, in <module>
#     result = price + tax
#                              ^^^^^^^^^^^^^
\`\`\`

Line **7** in **my_script.py** is where *your* code triggered the crash.`,
      },
      {
        title: "Use the caret and snippet",
        body: `Python often reprints the offending line and a caret \`^\`:

\`\`\`python
#   File "app.py", line 2
#     print("Hello"
#                 ^
# SyntaxError: '(' was never closed
\`\`\`

The caret points near the token that confused the parser — here, a missing \`)\`.`,
      },
    ],
    quizzes: [
      {
        prompt: "Which part of a traceback usually names the error type?",
        choices: [
          { id: "bottom", label: "The last line (e.g. NameError: ...)" },
          { id: "top", label: "The very first line only" },
          { id: "middle", label: "Always line 1 of your file" },
        ],
        correctId: "bottom",
        feedback: fb(
          "Bottom line = error class + message.",
          "Scroll to the end of the traceback first."
        ),
        difficulty: "easy",
      },
      {
        prompt: "You see File \"quiz.py\", line 12 — what does that tell you?",
        choices: [
          { id: "a", label: "Python failed while running line 12 in quiz.py" },
          { id: "b", label: "Line 12 is always a SyntaxError" },
          { id: "c", label: "quiz.py is corrupted and must be deleted" },
        ],
        correctId: "a",
        feedback: fb(
          "Frame = file + line where execution was.",
          "Open that line and read what it does."
        ),
        difficulty: "easy",
      },
      {
        prompt: "NameError: name 'total' is not defined — best next step?",
        choices: [
          { id: "a", label: "Find where total is used vs defined in your file" },
          { id: "b", label: "Ignore the message — only the line number matters" },
          { id: "c", label: "Add import total" },
        ],
        correctId: "a",
        feedback: fb(
          "Message + your line = hypothesis.",
          "Search for total — typo or missing assignment?"
        ),
        difficulty: "hard",
      },
      {
        prompt: "Why look for YOUR file in the stack, not library frames?",
        choices: [
          { id: "a", label: "Your line is what you can edit" },
          { id: "b", label: "Library code is always the bug" },
          { id: "c", label: "Library frames hide the error type" },
        ],
        correctId: "a",
        feedback: fb(
          "Fix your script first unless you know the library is wrong.",
          "The bottom message still applies — find your triggering line."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Complete the error class shown at the bottom of this traceback.",
        template: "NameError: name 'score' is not ___",
        answers: ["defined"],
        placeholder: "…",
        feedback: fb(
          "Standard NameError wording.",
          "The message ends with 'not defined'."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix line 2 so the NameError on total goes away (define total before use).",
        lines: [
          "Assign total before print(total).",
        ],
        starterCode: 'print(total)\ntotal = 10\n',
        mustContain: ["total =", "print(total)"],
        mustNotContain: ["print(total)\ntotal"],
        feedback: fb(
          "Definition before use — traceback would point at print(total).",
          "Move total = 10 above print(total)."
        ),
      },
      {
        mode: "fillBlank",
        prompt: "What error class appears when Python cannot parse your syntax?",
        template: "___: invalid syntax",
        answers: ["SyntaxError"],
        placeholder: "…",
        feedback: fb(
          "Grammar problems → SyntaxError.",
          "The class name is SyntaxError."
        ),
      },
    ],
  },

  syntax_errors: {
    explains: [
      {
        title: "Invalid grammar",
        body: `\`SyntaxError\` means Python could not even **parse** your file — the grammar is broken.

\`\`\`python
print("Hello"   # SyntaxError — missing closing quote
if x > 0       # SyntaxError — missing :
print(score    # SyntaxError — missing )
\`\`\`

Fix punctuation and structure before anything else runs.`,
      },
      {
        title: "Quotes and parentheses",
        body: `Unmatched delimiters are the top beginner SyntaxErrors:

\`\`\`python
msg = "Hi'        # mixed or missing quote
print((score)     # extra ( without )
\`\`\`

The highlighted line may be **after** the real mistake — check the line above for an open quote.`,
      },
      {
        title: "Colons for blocks",
        body: `\`if\`, \`for\`, \`while\`, \`def\`, and \`else\` need a trailing colon:

\`\`\`python
if score > 10   # SyntaxError — need :
    print("win")

for i in range(3):   # good
    print(i)
\`\`\`

No colon → SyntaxError before the block runs.`,
      },
    ],
    quizzes: [
      {
        prompt: "What does SyntaxError mean?",
        choices: [
          { id: "a", label: "Python cannot parse the code's grammar" },
          { id: "b", label: "A variable name is misspelled" },
          { id: "c", label: "You used the wrong type in +" },
        ],
        correctId: "a",
        feedback: fb(
          "Syntax = structure of the language.",
          "Misspelled names are usually NameError; bad + is TypeError."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Which line causes SyntaxError?",
        code: 'print("Hello"',
        choices: [
          { id: "a", label: 'print("Hello" — missing closing quote' },
          { id: "b", label: "print(Hello) — NameError, not syntax" },
          { id: "c", label: 'print("Hello") — valid' },
        ],
        correctId: "a",
        feedback: fb(
          "Unclosed string → SyntaxError.",
          "Hello without quotes would be NameError; this string is unclosed."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Why might SyntaxError point at line 5 when the bug is on line 4?",
        choices: [
          { id: "a", label: "An unclosed quote on line 4 confuses the parser on line 5" },
          { id: "b", label: "Python randomizes error lines" },
          { id: "c", label: "Line numbers start at zero" },
        ],
        correctId: "a",
        feedback: fb(
          "Parser may not recover until the next line.",
          "Check the previous line for open quotes or parens."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Which needs a colon to avoid SyntaxError?",
        choices: [
          { id: "if", label: "if score > 0:" },
          { id: "pr", label: "print(score)" },
          { id: "as", label: "score = 5" },
        ],
        correctId: "if",
        feedback: fb(
          "Compound statements like if require : before the block.",
          "Assignment and print do not use a trailing colon."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "miniEdit",
        prompt: "Close the string so SyntaxError disappears.",
        lines: [
          "Add the missing quote and parenthesis.",
        ],
        starterCode: 'print("Hello"\n',
        mustContain: ['print("Hello")'],
        feedback: fb(
          "Balanced quotes and parens — valid syntax.",
          'Use print("Hello") with both closing " and ).'
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Add the missing colon after the if condition.",
        lines: [
          "if needs : before the indented block.",
        ],
        starterCode: "score = 15\nif score > 10\n    print(\"high\")\n",
        mustContain: ["if score > 10:", 'print("high")'],
        feedback: fb(
          "Colon + indent — block is valid.",
          "Change to if score > 10:"
        ),
      },
      {
        mode: "fillBlank",
        prompt: "What error class do missing quotes usually trigger?",
        template: "___",
        answers: ["SyntaxError"],
        placeholder: "…",
        feedback: fb(
          "Grammar problems are SyntaxError.",
          "The class is SyntaxError."
        ),
      },
    ],
  },

  name_errors: {
    explains: [
      {
        title: "Name not defined",
        body: `\`NameError: name 'x' is not defined\` means Python looked up **x** and found nothing.

\`\`\`python
print(score)   # NameError if score was never assigned
\`\`\`

Create the name with \`=\` before you use it.`,
      },
      {
        title: "Typos and case",
        body: `Python names are **case-sensitive**:

\`\`\`python
alter = 15
print(Alter)   # NameError — Alter ≠ alter

scroe = 10     # typo
print(score)   # NameError — score was never defined
\`\`\`

Search your file for the spelling Python mentions in the message.`,
      },
      {
        title: "Used before assignment",
        body: `Order matters:

\`\`\`python
total = lives + bonus   # NameError if bonus missing
bonus = 2               # too late if above line ran first
\`\`\`

Define **bonus** before the line that uses it.`,
      },
    ],
    quizzes: [
      {
        prompt: "What does NameError usually mean?",
        choices: [
          { id: "a", label: "Python cannot find that variable name" },
          { id: "b", label: "You used + on a str and int" },
          { id: "c", label: "Your indentation is wrong" },
        ],
        correctId: "a",
        feedback: fb(
          "Name lookup failed.",
          "str+int is TypeError; bad indent is IndentationError."
        ),
        difficulty: "easy",
      },
      {
        prompt: "After alter = 15, why does print(Alter) fail?",
        code: "alter = 15\nprint(Alter)",
        choices: [
          { id: "case", label: "Alter and alter are different names" },
          { id: "type", label: "15 is the wrong type" },
          { id: "syntax", label: "print is invalid syntax" },
        ],
        correctId: "case",
        feedback: fb(
          "Case matters — only alter exists.",
          "Use print(alter) or assign Alter = 15."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Which fix resolves print(score) NameError?",
        choices: [
          { id: "a", label: "Add score = 10 before the print" },
          { id: "b", label: "Change print to prnt" },
          { id: "c", label: "Wrap score in quotes in the print only" },
        ],
        correctId: "a",
        feedback: fb(
          "Define the name first.",
          "Quotes would print the word score, not fix the variable."
        ),
        difficulty: "hard",
      },
      {
        prompt: "total = lives + bonus — NameError on bonus. Best fix?",
        choices: [
          { id: "a", label: "Assign bonus = ... before that line" },
          { id: "b", label: "Rename lives to bonus" },
          { id: "c", label: "Delete the line" },
        ],
        correctId: "a",
        feedback: fb(
          "Missing name → define it or fix the typo.",
          "If bonus should exist, assign it before use."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "miniEdit",
        prompt: "Fix the typo so print(score) works.",
        lines: [
          "Use one consistent spelling for score.",
        ],
        starterCode: "scroe = 10\nprint(score)\n",
        mustContain: ["score =", "print(score)"],
        mustNotContain: ["scroe"],
        feedback: fb(
          "Same spelling everywhere — NameError gone.",
          "Change scroe to score in the assignment."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix the case mismatch (Alter vs alter).",
        lines: [
          "Print the name you actually assigned.",
        ],
        starterCode: "alter = 15\nprint(Alter)\n",
        mustContain: ["print(alter)"],
        mustNotContain: ["print(Alter)"],
        feedback: fb(
          "Matching case — good.",
          "Use print(alter) with lowercase a."
        ),
      },
      {
        mode: "fillBlank",
        prompt: "Complete the error class for an undefined name.",
        template: "___: name 'x' is not defined",
        answers: ["NameError"],
        placeholder: "…",
        feedback: fb(
          "Undefined names → NameError.",
          "The class is NameError."
        ),
      },
    ],
  },

  type_errors: {
    explains: [
      {
        title: "Wrong type for the operation",
        body: `\`TypeError\` means you asked Python to do something that type does not support:

\`\`\`python
print("2" + 3)        # TypeError — cannot add str and int
print(len(15))        # TypeError — len wants a sequence/str
\`\`\`

Check types with \`type()\` when \`+\` or \`len\` surprises you.`,
      },
      {
        title: "Classic str + int",
        body: `Joining text and numbers needs conversion:

\`\`\`python
age = 16
print("Age: " + age)           # TypeError
print("Age: " + str(age))      # OK
print("Age:", age)             # OK — comma print
print(f"Age: {age}")           # OK — f-string
\`\`\``,
      },
      {
        title: "Not the same as ValueError",
        body: `\`TypeError\` = wrong **type** for the operation.

\`ValueError\` = right type, bad **value** (e.g. \`int("abc")\`).

\`\`\`python
int("15")    # OK
int("abc")   # ValueError — str type is fine, content is not a number
"2" + 3      # TypeError — str and int with +
\`\`\``,
      },
    ],
    quizzes: [
      {
        prompt: "Why does print(\"2\" + 3) raise TypeError?",
        code: 'print("2" + 3)',
        choices: [
          { id: "a", label: "+ cannot combine str and int" },
          { id: "b", label: "3 must be in quotes" },
          { id: "c", label: "print only accepts one argument" },
        ],
        correctId: "a",
        feedback: fb(
          "Mixed types with + on str/int.",
          "Convert with int(\"2\") or str(3), or use separate args."
        ),
        difficulty: "easy",
      },
      {
        prompt: "How fix print(\"Score: \" + points) when points is int?",
        choices: [
          { id: "a", label: 'Use str(points) or an f-string' },
          { id: "b", label: "Rename points to \"points\"" },
          { id: "c", label: "Remove the print" },
        ],
        correctId: "a",
        feedback: fb(
          "Convert or format — TypeError solved.",
          "str(points) or f\"Score: {points}\" works."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What does len(42) do?",
        choices: [
          { id: "a", label: "TypeError — int has no length" },
          { id: "b", label: "Prints 2" },
          { id: "c", label: "NameError" },
        ],
        correctId: "a",
        feedback: fb(
          "len expects str/list/etc., not int.",
          "Use len on a string like len(\"42\")."
        ),
        difficulty: "hard",
      },
      {
        prompt: "TypeError vs ValueError — which fits int(\"abc\")?",
        choices: [
          { id: "val", label: "ValueError — str type OK, content not a number" },
          { id: "type", label: "TypeError — abc is wrong type" },
          { id: "name", label: "NameError" },
        ],
        correctId: "val",
        feedback: fb(
          "int() accepts str but rejects non-numeric text.",
          "TypeError is for wrong types in operations like +."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "miniEdit",
        prompt: "Fix the TypeError using str() so the label prints.",
        lines: [
          "Convert points before + with a string.",
        ],
        starterCode: 'points = 10\nprint("Score: " + points)\n',
        mustContain: ["str(points)", "print("],
        mustNotContain: ['"Score: " + points)'],
        feedback: fb(
          "Converted before join — clean run.",
          'Use print("Score: " + str(points)).'
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix the addition to use ints, not str + int.",
        lines: [
          "Make the second operand an int.",
        ],
        starterCode: 'print("5" + 1)\n',
        mustContain: ["print(6)", "print(5 + 1)"],
        mustNotContain: ['"5" + 1'],
        feedback: fb(
          "int + int → math.",
          "Use print(5 + 1) or int(\"5\") + 1."
        ),
      },
      {
        mode: "fillBlank",
        prompt: "Complete the error class for str + int.",
        template: "___",
        answers: ["TypeError"],
        placeholder: "…",
        feedback: fb(
          "Wrong type for + → TypeError.",
          "The class name is TypeError."
        ),
      },
    ],
  },

  index_errors: {
    explains: [
      {
        title: "Index out of range",
        body: `\`IndexError\` means you asked for a position that does not exist:

\`\`\`python
items = ["a", "b"]
print(items[2])   # IndexError — valid: 0, 1 only
\`\`\`

For length \`n\`, valid indices are \`0\` through \`n - 1\`.`,
      },
      {
        title: "Empty and off-by-one",
        body: `\`\`\`python
nums = []
print(nums[0])              # IndexError — empty

letters = ["x", "y", "z"]
print(letters[len(letters)])  # IndexError — one past the end
# last valid: letters[len(letters) - 1]  or  letters[-1]
\`\`\``,
      },
      {
        title: "Check len first",
        body: `When indexing feels risky, inspect size:

\`\`\`python
items = ["apple", "berry"]
print(len(items))   # 2 → indices 0 and 1 only
if len(items) > 2:
    print(items[2])
\`\`\`

Loop with \`for i in range(len(items))\` or \`for item in items\` to stay safe.`,
      },
    ],
    quizzes: [
      {
        prompt: "items = [\"a\", \"b\"] — which index raises IndexError?",
        choices: [
          { id: "2", label: "items[2]" },
          { id: "0", label: "items[0]" },
          { id: "1", label: "items[1]" },
        ],
        correctId: "2",
        feedback: fb(
          "Length 2 → indices 0 and 1 only.",
          "Index 2 is one past the end."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Why does nums[0] fail on nums = []?",
        choices: [
          { id: "a", label: "Empty list has no index 0" },
          { id: "b", label: "NameError on nums" },
          { id: "c", label: "SyntaxError on []" },
        ],
        correctId: "a",
        feedback: fb(
          "Zero elements → no valid index.",
          "Check len(nums) before indexing."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Valid indices for a list of length 3?",
        choices: [
          { id: "a", label: "0, 1, 2" },
          { id: "b", label: "1, 2, 3" },
          { id: "c", label: "0, 1, 2, 3" },
        ],
        correctId: "a",
        feedback: fb(
          "Zero-based: last index is len-1.",
          "Index 3 would be out of range for length 3."
        ),
        difficulty: "hard",
      },
      {
        prompt: "letters[len(letters)] — why IndexError?",
        choices: [
          { id: "a", label: "len(letters) is one past the last valid index" },
          { id: "b", label: "len is not allowed on lists" },
          { id: "c", label: "letters must be a string" },
        ],
        correctId: "a",
        feedback: fb(
          "Last valid index is len-1, or use [-1].",
          "len gives count, not a valid index."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "miniEdit",
        prompt: "Change the index so items[?] prints \"b\" without IndexError.",
        lines: [
          "List has two elements — indices 0 and 1.",
        ],
        starterCode: 'items = ["a", "b"]\nprint(items[2])\n',
        mustContain: ["items[1]"],
        mustNotContain: ["items[2]"],
        feedback: fb(
          "Index 1 → \"b\" — in range.",
          "Use items[1] for the second element."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Guard the access: only print items[2] if the list is long enough.",
        lines: [
          "Use if len(items) > 2: before indexing.",
        ],
        starterCode: 'items = ["a", "b"]\nprint(items[2])\n',
        mustContain: ["if len(items)", "items[2]"],
        feedback: fb(
          "Checked length — no crash on short lists.",
          "Wrap in if len(items) > 2: ..."
        ),
      },
      {
        mode: "fillBlank",
        prompt: "For a list of length n, the last valid index is n minus …",
        template: "last_index = n - ___",
        answers: ["1"],
        placeholder: "…",
        feedback: fb(
          "Zero-based indexing: last is n-1.",
          "Subtract 1 from the length."
        ),
      },
    ],
  },

  indentation_errors: {
    explains: [
      {
        title: "Blocks need indent",
        body: `After \`if\`, \`for\`, \`while\`, \`def\`, the **next lines must be indented**:

\`\`\`python
if score > 0:
print("win")   # IndentationError — expected an indented block
\`\`\`

\`\`\`python
if score > 0:
    print("win")   # OK — 4 spaces (common style)
\`\`\``,
      },
      {
        title: "Stay consistent",
        body: `All lines in the same block need the **same** indent level:

\`\`\`python
for i in range(3):
    print(i)
 print(i)   # IndentationError — inconsistent
\`\`\`

Pick spaces (often 4) and match them line for line.`,
      },
      {
        title: "Tabs vs spaces",
        body: `Mixing tabs and spaces looks aligned in some editors but crashes in Python:

\`\`\`python
if True:
\tprint("tab")    # tab
    print("spaces")  # spaces — IndentationError
\`\`\`

Stick to **spaces only** in exercises unless your teacher says otherwise.`,
      },
    ],
    quizzes: [
      {
        prompt: "What causes IndentationError after if x > 0:?",
        choices: [
          { id: "a", label: "The next line is not indented" },
          { id: "b", label: "x is not defined" },
          { id: "c", label: "Missing quotes around x" },
        ],
        correctId: "a",
        feedback: fb(
          "Block body must be indented.",
          "Name issues are NameError; quotes are SyntaxError."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Which block is valid?",
        choices: [
          { id: "a", label: "if True:\\n    print(1)" },
          { id: "b", label: "if True:\\nprint(1)" },
          { id: "c", label: "if True print(1)" },
        ],
        correctId: "a",
        feedback: fb(
          "Colon + indented body.",
          "Body must indent; colon required after if True."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Why avoid mixing tabs and spaces?",
        choices: [
          { id: "a", label: "Python sees them as different indent widths" },
          { id: "b", label: "Tabs are illegal in Python 3" },
          { id: "c", label: "Spaces are slower" },
        ],
        correctId: "a",
        feedback: fb(
          "Invisible mismatch → IndentationError.",
          "Use one style consistently — usually 4 spaces."
        ),
        difficulty: "hard",
      },
      {
        prompt: "IndentationError always means you forgot a colon?",
        choices: [
          { id: "no", label: "No — bad/missing indent also causes it" },
          { id: "yes", label: "Yes — always a missing colon" },
        ],
        correctId: "no",
        feedback: fb(
          "Missing colon is often SyntaxError; wrong indent is IndentationError.",
          "Both matter, but they are different error classes."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "miniEdit",
        prompt: "Indent print so it belongs inside the if block.",
        lines: [
          "Add 4 spaces before print.",
        ],
        starterCode: 'score = 10\nif score > 0:\nprint("win")\n',
        mustContain: ['if score > 0:', '    print("win")'],
        feedback: fb(
          "Indented block — valid.",
          'Indent print: if score > 0:\\n    print("win")'
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix the for-loop body indent so both prints align.",
        lines: [
          "Both print lines need the same indent inside for.",
        ],
        starterCode: "for i in range(2):\n    print(i)\n print(i)\n",
        mustContain: ["for i in range(2):", "    print(i)"],
        mustNotContain: ["\n print(i)"],
        feedback: fb(
          "Consistent indent in the loop body.",
          "Indent the second print with four spaces like the first."
        ),
      },
      {
        mode: "fillBlank",
        prompt: "Complete the error class for a mis-indented block.",
        template: "___",
        answers: ["IndentationError"],
        placeholder: "…",
        feedback: fb(
          "Bad indent → IndentationError.",
          "The class is IndentationError."
        ),
      },
    ],
  },

  logic_bugs: {
    explains: [
      {
        title: "Runs but wrong",
        body: `A **logic bug** does not crash — the output is just wrong:

\`\`\`python
price = 10
total = price + price   # forgot tax — runs, wrong total
print(total)            # 20, not what you meant
\`\`\`

No traceback does **not** mean the program is correct.`,
      },
      {
        title: "Wrong operator or variable",
        body: `Common logic slips:

\`\`\`python
print(2 + 3 * 4)    # 14 — if you expected 20, add parentheses
area = w + h        # wrong formula — runs, wrong answer
\`\`\`

Compare **expected vs actual** output line by line.`,
      },
      {
        title: "Find logic bugs with prints",
        body: `When nothing crashes, print intermediate values:

\`\`\`python
base = 10
bonus = 3
total = base + bonus
print("DEBUG base=", base, "bonus=", bonus, "total=", total)
\`\`\`

If \`total\` looks wrong, trace which input or operator is off.`,
      },
    ],
    quizzes: [
      {
        prompt: "What is a logic bug?",
        choices: [
          { id: "a", label: "Code runs but gives the wrong result" },
          { id: "b", label: "Python stops with SyntaxError" },
          { id: "c", label: "The computer is broken" },
        ],
        correctId: "a",
        feedback: fb(
          "Silent wrong behavior — no crash required.",
          "SyntaxError stops execution; logic bugs do not."
        ),
        difficulty: "easy",
      },
      {
        prompt: "print(2 + 3 * 4) prints 14. You wanted 20. What happened?",
        choices: [
          { id: "a", label: "Operator precedence — need (2 + 3) * 4" },
          { id: "b", label: "TypeError" },
          { id: "c", label: "Python cannot multiply" },
        ],
        correctId: "a",
        feedback: fb(
          "* before + — logic/precedence issue.",
          "Use parentheses to force the order you intend."
        ),
        difficulty: "easy",
      },
      {
        prompt: "How do you notice a logic bug if there is no error?",
        choices: [
          { id: "a", label: "Compare output to what you expected" },
          { id: "b", label: "Wait for a traceback" },
          { id: "c", label: "Add more SyntaxErrors" },
        ],
        correctId: "a",
        feedback: fb(
          "Expected vs actual reveals logic bugs.",
          "Tracebacks appear for crashes, not wrong answers."
        ),
        difficulty: "hard",
      },
      {
        prompt: "total = price + price instead of price + tax is…",
        choices: [
          { id: "a", label: "A logic bug — wrong formula, still runs" },
          { id: "b", label: "A NameError" },
          { id: "c", label: "A SyntaxError" },
        ],
        correctId: "a",
        feedback: fb(
          "Wrong variable in expression — runs, wrong math.",
          "Names exist; the formula is the bug."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "miniEdit",
        prompt: "Fix the formula so total is price + tax (logic bug).",
        lines: [
          "Use tax in the sum, not price twice.",
        ],
        starterCode: "price = 10\ntax = 2\ntotal = price + price\nprint(total)\n",
        mustContain: ["price + tax", "print(total)"],
        mustNotContain: ["price + price"],
        feedback: fb(
          "Correct formula — output 12.",
          "Change to total = price + tax."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Add parentheses so the expression prints 20, not 14.",
        lines: [
          "Force addition before multiplication.",
        ],
        starterCode: "print(2 + 3 * 4)\n",
        mustContain: ["(2 + 3) * 4", "print(20)"],
        feedback: fb(
          "(2 + 3) * 4 → 20.",
          "Use print((2 + 3) * 4)."
        ),
      },
      {
        mode: "fillBlank",
        prompt: "A bug where the program runs but the answer is wrong is called a ___ bug.",
        template: "___ bug",
        answers: ["logic"],
        placeholder: "…",
        feedback: fb(
          "Logic bug — no crash needed.",
          "The word is logic."
        ),
      },
    ],
  },

  print_debug: {
    explains: [
      {
        title: "See what Python sees",
        body: `\`print()\` is your window into running code:

\`\`\`python
lives = 3
bonus = 2
print("DEBUG lives=", lives, "bonus=", bonus)
total = lives + bonus
print("DEBUG total=", total)
\`\`\`

When a value looks wrong, print it **before** the suspicious line.`,
      },
      {
        title: "Label your prints",
        body: `Bare prints are hard to read in busy output:

\`\`\`python
print(score)        # which score? when?
print("after bonus, score=", score)   # clearer
\`\`\`

Use tags like \`DEBUG\` or descriptive text so you can find lines later.`,
      },
      {
        title: "Clean up after",
        body: `Debug prints are temporary tools:

\`\`\`python
# print("DEBUG total=", total)   # comment out when fixed
print("Final total:", total)
\`\`\`

Remove or comment noise before you submit — keep one clear final print if needed.`,
      },
    ],
    quizzes: [
      {
        prompt: "Why label a debug print?",
        choices: [
          { id: "a", label: "So you know which value and when it printed" },
          { id: "b", label: "Python requires labels" },
          { id: "c", label: "Labels fix TypeError" },
        ],
        correctId: "a",
        feedback: fb(
          "Readable logs speed debugging.",
          "Labels do not change types — they help you read output."
        ),
        difficulty: "easy",
      },
      {
        prompt: "A sum looks wrong. Best print-debug move?",
        choices: [
          { id: "a", label: "Print each part before the sum line" },
          { id: "b", label: "Delete the sum line" },
          { id: "c", label: "Print hello world" },
        ],
        correctId: "a",
        feedback: fb(
          "Inspect operands — find which part is off.",
          "Print the inputs to the calculation."
        ),
        difficulty: "easy",
      },
      {
        prompt: "print(type(raw), raw) helps when…",
        choices: [
          { id: "a", label: "You suspect a TypeError from wrong type" },
          { id: "b", label: "You have SyntaxError only" },
          { id: "c", label: "The file is empty" },
        ],
        correctId: "a",
        feedback: fb(
          "Shows type + value together.",
          "Great before int() or math on input-like strings."
        ),
        difficulty: "hard",
      },
      {
        prompt: "After fixing the bug, debug prints should…",
        choices: [
          { id: "a", label: "Be removed or commented out" },
          { id: "b", label: "Stay forever in every line" },
          { id: "c", label: "Replace all final output" },
        ],
        correctId: "a",
        feedback: fb(
          "Reduce noise — keep clear final output.",
          "Comment # DEBUG lines when done."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "miniEdit",
        prompt: "Add a labeled debug print showing lives before computing total.",
        lines: [
          "Print lives with a DEBUG label before total = ...",
        ],
        starterCode: "lives = 3\nbonus = 2\ntotal = lives + bonus\nprint(total)\n",
        mustContain: ["DEBUG", "lives", "print("],
        feedback: fb(
          "You can see lives before the sum — good debug habit.",
          'Add print("DEBUG lives=", lives) before total = ...'
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Add print(type(age), age) to inspect a suspicious value.",
        lines: [
          "Print type and value before using age in math.",
        ],
        starterCode: 'age = "16"\nprint(age + 1)\n',
        mustContain: ["type(age)", "print("],
        feedback: fb(
          "Type visible — explains str + int if it crashes.",
          "Insert print(type(age), age) before age + 1."
        ),
      },
      {
        mode: "fillBlank",
        prompt: "Complete the function used to reveal values while debugging.",
        template: "___(\"DEBUG score=\", score)",
        answers: ["print"],
        placeholder: "…",
        feedback: fb(
          "print shows values at runtime.",
          "Use the print function."
        ),
      },
    ],
  },

  bisect_fix: {
    explains: [
      {
        title: "One hypothesis, one edit",
        body: `After reading the traceback, pick **one** theory:

\`\`\`python
# NameError on total → hypothesis: never assigned
total = 0          # single change
print(total)       # rerun
\`\`\`

If it still fails, read the **new** error — you learned something.`,
      },
      {
        title: "Retest every time",
        body: `A fix you do not run is a guess:

\`\`\`python
# Fixed TypeError with str(age) — run again immediately
age = 16
print("Age: " + str(age))
\`\`\`

The next traceback (or clean run) tells you what to do next.`,
      },
      {
        title: "Note what you tried",
        body: `Avoid repeating failed guesses:

\`\`\`python
# tried str(age) — fixed TypeError on line 3
# tried items[2] — still IndexError; checking len next
\`\`\`

Short comments save time on the second pass.`,
      },
    ],
    quizzes: [
      {
        prompt: "Why change only one thing before rerunning?",
        choices: [
          { id: "a", label: "You know which change helped or hurt" },
          { id: "b", label: "Python crashes if you edit two lines" },
          { id: "c", label: "It is slower but required by law" },
        ],
        correctId: "a",
        feedback: fb(
          "Clear experiments → clear learning.",
          "Multiple edits obscure cause and effect."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Your first fix fails with a different error. You should…",
        choices: [
          { id: "a", label: "Read the new traceback and adjust" },
          { id: "b", label: "Stop — different error means hopeless" },
          { id: "c", label: "Never run again" },
        ],
        correctId: "a",
        feedback: fb(
          "Errors often chain — fix one layer at a time.",
          "A new error can mean progress — read it fresh."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Best workflow after reading NameError on bonus?",
        choices: [
          { id: "a", label: "Assign or fix bonus once, rerun" },
          { id: "b", label: "Rewrite entire file" },
          { id: "c", label: "Change ten variable names" },
        ],
        correctId: "a",
        feedback: fb(
          "Targeted single fix → retest.",
          "One hypothesis about bonus, one edit, run."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Retesting after a fix is…",
        choices: [
          { id: "a", label: "Required — confirms or refutes your hypothesis" },
          { id: "b", label: "Optional if you feel confident" },
          { id: "c", label: "Only for teachers" },
        ],
        correctId: "a",
        feedback: fb(
          "Run is the experiment's observation.",
          "Always rerun to see the next error or success."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "miniEdit",
        prompt: "Make ONE fix for the NameError (define score), then the print should work.",
        lines: [
          "Add only score = ... — do not rewrite everything.",
        ],
        starterCode: 'print("Score:", score)\n',
        mustContain: ["score =", 'print("Score:", score)'],
        feedback: fb(
          "Single assignment fix — bisect style.",
          "Add one line: score = 10 (or similar) before print."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix ONLY the TypeError on one line (str conversion), keep the rest.",
        lines: [
          "One change: str(points) in the print.",
        ],
        starterCode: 'points = 7\nlabel = "Points: "\nprint(label + points)\n',
        mustContain: ["str(points)"],
        mustNotContain: ["label + points)"],
        feedback: fb(
          "One-line type fix — rerun would show next issue or success.",
          "Change to print(label + str(points))."
        ),
      },
      {
        mode: "fillBlank",
        prompt: "After one fix, always ___ the program again.",
        template: "___ the program again",
        answers: ["run", "rerun", "test"],
        placeholder: "…",
        feedback: fb(
          "Rerun to verify the fix.",
          "Use run or rerun."
        ),
      },
    ],
  },

  reproduce_minimal: {
    explains: [
      {
        title: "Smallest failing example",
        body: `Big programs hide the real cause. **Shrink** until the bug still happens:

\`\`\`python
# Full game crashes on items[3]
# Minimal test:
items = ["a", "b", "c"]
print(items[3])   # still IndexError — same bug, less noise
\`\`\``,
      },
      {
        title: "Comment out unrelated code",
        body: `Temporarily disable parts that are not needed for the crash:

\`\`\`python
# input_name = input("Name: ")
# long_animation()
score = 10
print(scroe)   # isolate NameError on scroe
\`\`\`

Bring pieces back after the core bug is fixed.`,
      },
      {
        title: "Apply fix back to the full script",
        body: `Fix in the tiny snippet, then mirror the same change in the big file:

\`\`\`python
# Minimal: scroe → score
# Full game: rename every scroe to score
\`\`\`

The minimal case proves **what** to fix; the full file is where you apply it.`,
      },
    ],
    quizzes: [
      {
        prompt: "Why build a minimal failing example?",
        choices: [
          { id: "a", label: "Isolate the bug with less code to read" },
          { id: "b", label: "Python requires files under 5 lines" },
          { id: "c", label: "To delete the original program" },
        ],
        correctId: "a",
        feedback: fb(
          "Less code → clearer cause.",
          "Shrink until the same error appears."
        ),
        difficulty: "easy",
      },
      {
        prompt: "You fixed IndexError in a 3-line test. Next step?",
        choices: [
          { id: "a", label: "Apply the same index fix in the full program" },
          { id: "b", label: "Throw away the full program" },
          { id: "c", label: "Never open the big file again" },
        ],
        correctId: "a",
        feedback: fb(
          "Minimal fix transfers to the real script.",
          "Same bug, same kind of fix — scale back up."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Commenting out unrelated code while debugging helps you…",
        choices: [
          { id: "a", label: "Focus on lines that trigger the error" },
          { id: "b", label: "Permanently remove features" },
          { id: "c", label: "Create SyntaxError on purpose" },
        ],
        correctId: "a",
        feedback: fb(
          "Temporary isolation — not final deletion.",
          "Reduce distractions; restore later."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Minimal reproduction is useful when asking for help because…",
        choices: [
          { id: "a", label: "Others can see the exact error in few lines" },
          { id: "b", label: "Longer code is always clearer" },
          { id: "c", label: "Help forums ban tracebacks" },
        ],
        correctId: "a",
        feedback: fb(
          "Short example + error text = fast help.",
          "Include error message and tiny repro."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "miniEdit",
        prompt: "Strip to minimal lines: keep only what causes IndexError on items[2].",
        lines: [
          "Use a two-item list and the bad index only.",
        ],
        starterCode: 'name = "Ada"\nitems = ["a", "b"]\nprint("hi")\nprint(items[2])\nprint("bye")\n',
        mustContain: ["items[2]", 'items = ["a", "b"]'],
        feedback: fb(
          "Minimal repro — list + bad index.",
          "Comment out name/hi/bye or keep only items and items[2]."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix the typo in the minimal snippet (scroe → score).",
        lines: [
          "One spelling fix proves the NameError cause.",
        ],
        starterCode: "scroe = 5\nprint(scroe)\n",
        mustContain: ["score =", "print(score)"],
        mustNotContain: ["scroe"],
        feedback: fb(
          "Minimal NameError fix — apply same rename elsewhere.",
          "Use score consistently."
        ),
      },
      {
        mode: "fillBlank",
        prompt: "To isolate a bug, ___ the failing case until few lines still crash.",
        template: "___ the failing case",
        answers: ["shrink", "minimize", "reduce"],
        placeholder: "…",
        feedback: fb(
          "Shrink/minimize — core debugging move.",
          "Think shrink or minimize the example."
        ),
      },
    ],
  },

  debug_habits: {
    explains: [
      {
        title: "The checklist",
        body: `Before you spin wheels, run the habit loop:

1. **Reproduce** — same steps, same error?
2. **Read** the bottom traceback line
3. **Classify** — Syntax, Name, Type, Index, Indent, or logic?
4. **Locate** your file + line
5. **One fix** → **retest**`,
      },
      {
        title: "When stuck",
        body: `Still blocked after two careful tries?

- Shrink to a **minimal** example
- Add **labeled** debug prints
- Write what you **already tried**

\`\`\`python
# tried str(age) — still wrong output; checking bonus next
\`\`\``,
      },
      {
        title: "Asking for help well",
        body: `Include:

- Full **error type + message** (copy the last line)
- The **line of code** you think triggered it
- What you **expected** vs what you **got**

\`\`\`python
# Bad:  "it doesn't work"
# Good: NameError on line 7 for total; expected total = base + bonus
\`\`\``,
      },
    ],
    quizzes: [
      {
        prompt: "Step one on the debug checklist?",
        choices: [
          { id: "a", label: "Reproduce the bug reliably" },
          { id: "b", label: "Rewrite from scratch" },
          { id: "c", label: "Ask for help with no error text" },
        ],
        correctId: "a",
        feedback: fb(
          "Same steps → same clue.",
          "If it is flaky, you cannot trust the next fix."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What should you send when asking for help?",
        choices: [
          { id: "a", label: "Error text, relevant line, expected vs actual" },
          { id: "b", label: "Only \"fix my code\"" },
          { id: "c", label: "A screenshot with no message" },
        ],
        correctId: "a",
        feedback: fb(
          "Context speeds useful answers.",
          "Copy the last traceback line and your hypothesis."
        ),
        difficulty: "easy",
      },
      {
        prompt: "After classifying TypeError, you should…",
        choices: [
          { id: "a", label: "Check types and conversions on that line" },
          { id: "b", label: "Add random imports" },
          { id: "c", label: "Assume it is SyntaxError" },
        ],
        correctId: "a",
        feedback: fb(
          "Classification picks the fix strategy.",
          "TypeError → types, str(), int(), etc."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Skipping retest after a fix is bad because…",
        choices: [
          { id: "a", label: "You might still crash or have logic bugs" },
          { id: "b", label: "Python deletes your file" },
          { id: "c", label: "Retest removes comments" },
        ],
        correctId: "a",
        feedback: fb(
          "Verify clean run and correct output.",
          "Always rerun — next error or success tells the story."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Complete the checklist step: read the bottom ___ line.",
        template: "Read the bottom ___ line first.",
        answers: ["traceback", "error"],
        placeholder: "…",
        feedback: fb(
          "Bottom traceback line names the error.",
          "Use traceback or error."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Add a short comment documenting what error you fixed (debug habit).",
        lines: [
          "Comment what was wrong after fixing NameError.",
        ],
        starterCode: "score = 10\nprint(score)\n",
        mustContain: ["#", "score"],
        feedback: fb(
          "Documenting tries helps future you.",
          "Add e.g. # fixed: assigned score before print"
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix the bug AND add one DEBUG print before the final output (full habit loop).",
        lines: [
          "Define total, debug print, then final print.",
        ],
        starterCode: 'print("Total:", total)\n',
        mustContain: ["total =", "DEBUG", "print("],
        feedback: fb(
          "Assign + debug + output — checklist complete.",
          "Add total = ..., print DEBUG line, then final print."
        ),
      },
    ],
  },
}
