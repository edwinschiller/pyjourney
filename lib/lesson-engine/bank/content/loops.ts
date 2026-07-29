import type { ConceptContentBank } from "@/lib/lesson-engine/bank/content/variables"

const fb = (correct: string, wrong: string) => ({ correct, wrong })

/**
 * Slot fillers for the Loops blueprint.
 * Keys MUST match TopicSpec.id in curricula/loops.ts.
 */
export const LOOPS_CONTENT: ConceptContentBank = {
  why_loops: {
    explains: [
      {
        title: "Same action, many times",
        body: `Some tasks repeat. Printing "Hi" three times could mean three identical lines — but what about three **hundred**?

\`\`\`python
# Works for 3, painful for 300
print("Hi")
print("Hi")
print("Hi")
\`\`\`

A **loop** runs one block of code again and again until a condition or sequence is finished.`,
      },
      {
        title: "One pattern, many runs",
        body: `With a loop you write the pattern **once** and tell Python how many times (or over what data):

\`\`\`python
for _ in range(3):
    print("Hi")
\`\`\`

Change \`3\` to \`300\` — same two lines, different count. That is why loops exist.`,
      },
      {
        title: "When to reach for a loop",
        body: `Use a loop when you:

- Count or repeat a fixed number of times
- Walk every item in a list or character in a string
- Add up values one by one

\`\`\`python
scores = [10, 20, 30]
for s in scores:
    print(s)
\`\`\`

If the list grows, the loop still works — no extra copy-paste.`,
      },
    ],
    quizzes: [
      {
        prompt: "When is a loop better than copy-paste?",
        choices: [
          { id: "a", label: "When the repeat count or data length may change" },
          { id: "b", label: "Never — copy-paste is always clearer" },
          { id: "c", label: "Only when printing exactly three lines" },
        ],
        correctId: "a",
        feedback: fb(
          "Loops scale when count or data grows.",
          "Copy-paste breaks when you need more repetitions."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What problem do loops mainly solve?",
        choices: [
          { id: "a", label: "Repeating a block without rewriting it many times" },
          { id: "b", label: "Storing values in variables" },
          { id: "c", label: "Converting strings to ints" },
        ],
        correctId: "a",
        feedback: fb(
          "Loops automate repetition.",
          "Variables store; loops repeat actions."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Which task clearly needs a loop?",
        choices: [
          { id: "a", label: "Print every score in a list of 20 numbers" },
          { id: "b", label: "Store one username in a variable" },
          { id: "c", label: "Convert \"15\" to int once" },
        ],
        correctId: "a",
        feedback: fb(
          "Walking 20 items is a classic loop job.",
          "Single assign or cast does not need repetition."
        ),
        difficulty: "hard",
      },
      {
        prompt: "How many print lines change if you go from 3 to 10 greetings with a loop?",
        code: "for _ in range(3):\n    print('Hi')",
        choices: [
          { id: "a", label: "Only the number in range(...) — not the print line count" },
          { id: "b", label: "You must add 7 more print('Hi') lines" },
          { id: "c", label: "You must rewrite the whole program" },
        ],
        correctId: "a",
        feedback: fb(
          "Change range(3) to range(10) — same body.",
          "That is the power of loops vs unrolling."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Repeat printing once using range(3).",
        template: "for _ in range(___):\n    print('go')",
        answers: ["3"],
        placeholder: "…",
        feedback: fb(
          "range(3) runs the body three times.",
          "Put the count inside range(...)."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Replace three copy-pasted prints with one for loop over range(3).",
        lines: [
          "Remove the duplicate print lines.",
          "Use for _ in range(3): with an indented print.",
        ],
        starterCode: 'print("Hi")\nprint("Hi")\nprint("Hi")\n',
        mustContain: ["for ", "range(3)", "print("],
        mustNotContain: ['print("Hi")\nprint("Hi")'],
        feedback: fb(
          "One loop, three runs — scalable pattern.",
          "Write for _ in range(3): then indent one print."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Loop over scores and print each value.",
        lines: ["Use for s in scores:"],
        starterCode: "scores = [10, 20, 30]\nprint(scores)\n",
        mustContain: ["for s in scores", "print(s)"],
        mustNotContain: ["print(scores)"],
        feedback: fb(
          "for-in walks each item — nice.",
          "Use for s in scores: and print(s) inside."
        ),
      },
    ],
  },

  while_basics: {
    explains: [
      {
        title: "while condition:",
        body: `A \`while\` loop repeats its **indented block** while the condition is \`True\`:

\`\`\`python
n = 3
while n > 0:
    print(n)
    n = n - 1
print("done")
\`\`\`

Python checks \`n > 0\` **before** each run. When \`n\` hits 0, the condition is \`False\` and the loop stops.`,
      },
      {
        title: "Check before each iteration",
        body: `Unlike "run exactly N times" by magic, \`while\` asks a question every time:

\`\`\`python
ready = True
while ready:
    print("working")
    ready = False  # stop after one pass
\`\`\`

**Flow:** check condition → run body → check again → … until \`False\`.`,
      },
      {
        title: "The body must move toward False",
        body: `If nothing in the body ever makes the condition \`False\`, the loop **never stops**:

\`\`\`python
# DANGER — n never changes
# n = 3
# while n > 0:
#     print(n)
\`\`\`

Always update variables that appear in the condition (here: \`n = n - 1\`).`,
      },
    ],
    quizzes: [
      {
        prompt: "When does a while loop stop?",
        choices: [
          { id: "a", label: "When the condition becomes False" },
          { id: "b", label: "After exactly one iteration always" },
          { id: "c", label: "When Python reaches the last line of the file" },
        ],
        correctId: "a",
        feedback: fb(
          "False condition → exit the loop.",
          "while repeats until the condition fails."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What does this print?",
        code: "n = 3\nwhile n > 0:\n    print(n)\n    n = n - 1",
        choices: [
          { id: "a", label: "3, then 2, then 1 (each on its own line)" },
          { id: "b", label: "3 forever" },
          { id: "c", label: "Nothing" },
        ],
        correctId: "a",
        feedback: fb(
          "n counts down: 3, 2, 1 then stops.",
          "Each pass prints n then subtracts 1."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Where is the condition checked?",
        choices: [
          { id: "a", label: "Before each iteration" },
          { id: "b", label: "Only once, after the loop finishes" },
          { id: "c", label: "Never — while always runs once" },
        ],
        correctId: "a",
        feedback: fb(
          "while re-checks at the top each time.",
          "That is why an unchanging True condition loops forever."
        ),
        difficulty: "hard",
      },
      {
        prompt: "What is missing for this to finish?",
        code: "n = 3\nwhile n > 0:\n    print(n)",
        choices: [
          { id: "a", label: "n = n - 1 (or similar) inside the body" },
          { id: "b", label: "Another print after the loop" },
          { id: "c", label: "Change while to for" },
        ],
        correctId: "a",
        feedback: fb(
          "Without updating n, n > 0 stays True forever.",
          "Decrement n inside the body."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Complete the while header that runs while n is positive.",
        template: "n = 3\nwhile n ___ 0:\n    print(n)\n    n = n - 1",
        answers: [">"],
        placeholder: "…",
        feedback: fb(
          "n > 0 keeps going while n is 3, 2, 1.",
          "Use > so it stops when n hits 0."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix the infinite loop by updating n inside the body.",
        lines: ["Add n = n - 1 inside the while block."],
        starterCode: "n = 3\nwhile n > 0:\n    print(n)\n",
        mustContain: ["n = n - 1"],
        feedback: fb(
          "n decreases each pass — loop can finish.",
          "Indent n = n - 1 under the while."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Write a while loop that prints 2 then 1 (start n at 2).",
        lines: [
          "Start with n = 2.",
          "while n > 0: print and decrement.",
        ],
        starterCode: "n = 2\n",
        mustContain: ["while n > 0", "print(n)", "n = n - 1"],
        feedback: fb(
          "Countdown with while — well done.",
          "Loop while n > 0, print n, then n = n - 1."
        ),
      },
    ],
  },

  while_counter: {
    explains: [
      {
        title: "The counter pattern",
        body: `Count with \`while\` using three pieces:

1. **Start:** \`i = 0\`
2. **Condition:** \`while i < 5\`
3. **Update:** \`i = i + 1\` inside the body

\`\`\`python
i = 0
while i < 5:
    print(i)
    i = i + 1
# prints 0, 1, 2, 3, 4
\`\`\``,
      },
      {
        title: "i += 1 is the same idea",
        body: `These update the counter the same way:

\`\`\`python
i = i + 1
i += 1
\`\`\`

Both add 1 to \`i\`. Pick one style and stay consistent in a project.`,
      },
      {
        title: "Where the update lives",
        body: `The update **must** be inside the loop body (indented under \`while\`):

\`\`\`python
i = 0
while i < 3:
    print(i)
    i += 1      # inside — good
# i += 1 here would run only once after the loop
\`\`\`

Putting the update outside by mistake often causes off-by-one or infinite loops.`,
      },
    ],
    quizzes: [
      {
        prompt: "What values does i print with i = 0 and while i < 5?",
        code: "i = 0\nwhile i < 5:\n    print(i)\n    i += 1",
        choices: [
          { id: "a", label: "0, 1, 2, 3, 4" },
          { id: "b", label: "1, 2, 3, 4, 5" },
          { id: "c", label: "0, 1, 2, 3, 4, 5" },
        ],
        correctId: "a",
        feedback: fb(
          "Starts at 0; stops before 5.",
          "i < 5 means last print is 4."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Where must i = i + 1 go?",
        choices: [
          { id: "a", label: "Inside the while body (indented)" },
          { id: "b", label: "Before i = 0" },
          { id: "c", label: "Nowhere — i updates automatically" },
        ],
        correctId: "a",
        feedback: fb(
          "Update runs each iteration inside the loop.",
          "Without an inner update, i never reaches the limit."
        ),
        difficulty: "easy",
      },
      {
        prompt: "How many times does the body run?",
        code: "i = 0\nwhile i < 4:\n    print(i)\n    i += 1",
        choices: [
          { id: "4", label: "4 times" },
          { id: "5", label: "5 times" },
          { id: "3", label: "3 times" },
        ],
        correctId: "4",
        feedback: fb(
          "i takes 0,1,2,3 — four values.",
          "i < 4 stops when i becomes 4."
        ),
        difficulty: "hard",
      },
      {
        prompt: "What happens if you forget i += 1 inside?",
        code: "i = 0\nwhile i < 5:\n    print(i)",
        choices: [
          { id: "a", label: "Infinite loop printing 0 forever" },
          { id: "b", label: "Prints 0 once" },
          { id: "c", label: "Prints 0 through 4" },
        ],
        correctId: "a",
        feedback: fb(
          "i stays 0; i < 5 never becomes False.",
          "Always update the counter in the body."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Complete the counter update inside the while loop.",
        template: "i = 0\nwhile i < 3:\n    print(i)\n    i = i ___ 1",
        answers: ["+"],
        placeholder: "…",
        feedback: fb(
          "i = i + 1 bumps the counter.",
          "Use + to add 1 each pass."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Add a while counter that prints 0, 1, 2.",
        lines: [
          "Start i at 0.",
          "Loop while i < 3, print i, then increment.",
        ],
        starterCode: "# print 0, 1, 2\n",
        mustContain: ["i = 0", "while i < 3", "print(i)", "i = i + 1"],
        feedback: fb(
          "Classic counter loop — nice.",
          "i = 0, while i < 3, print, i = i + 1."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Move the misplaced update so the loop prints 0 and 1 only.",
        lines: ["i += 1 must be inside the while body."],
        starterCode: "i = 0\nwhile i < 2:\n    print(i)\ni += 1\n",
        mustContain: ["    i += 1"],
        mustNotContain: ["while i < 2:\n    print(i)\ni += 1"],
        feedback: fb(
          "Update inside — loop behaves correctly.",
          "Indent i += 1 under while."
        ),
      },
    ],
  },

  infinite_risk: {
    explains: [
      {
        title: "When the condition never becomes False",
        body: `An **infinite loop** keeps running because the \`while\` condition stays \`True\`:

\`\`\`python
n = 3
while n > 0:
    print(n)
    # forgot: n = n - 1  → prints 3 forever
\`\`\`

Your program hangs until you stop it manually.`,
      },
      {
        title: "Missing update inside the body",
        body: `The #1 beginner bug: the variable in the condition never changes **inside** the loop:

\`\`\`python
i = 0
while i < 5:
    print(i)
    # missing i += 1
\`\`\`

**Fix:** add the update where it runs every iteration.`,
      },
      {
        title: "Wrong direction or comparison",
        body: `Updates that move the **wrong way** never reach the stop:

\`\`\`python
count = 10
while count > 0:
    print(count)
    count = count + 1   # grows — never hits 0
\`\`\`

Opposite bug — condition false from the start:

\`\`\`python
i = 0
while i > 0:    # never True — body never runs
    print(i)
\`\`\`

**Checklist:** start value, condition, update moves toward False.`,
      },
    ],
    quizzes: [
      {
        prompt: "Why does this hang?",
        code: "n = 3\nwhile n > 0:\n    print(n)",
        choices: [
          { id: "a", label: "n never decreases — n > 0 stays True" },
          { id: "b", label: "print is not allowed in while" },
          { id: "c", label: "n starts too high" },
        ],
        correctId: "a",
        feedback: fb(
          "No n = n - 1 → infinite 3s.",
          "Update the condition variable inside the body."
        ),
        difficulty: "easy",
      },
      {
        prompt: "How do you fix an infinite while loop?",
        choices: [
          { id: "a", label: "Ensure the body updates so the condition eventually becomes False" },
          { id: "b", label: "Add more print statements" },
          { id: "c", label: "Python auto-stops after 1000 runs" },
        ],
        correctId: "a",
        feedback: fb(
          "Move toward False each iteration.",
          "Python does not auto-stop infinite loops."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Which loop is infinite?",
        choices: [
          { id: "a", label: "i = 0\\nwhile i < 3:\\n    print(i)" },
          { id: "b", label: "i = 0\\nwhile i < 3:\\n    print(i)\\n    i += 1" },
          { id: "c", label: "for i in range(3):\\n    print(i)" },
        ],
        correctId: "a",
        feedback: fb(
          "Missing i += 1 in (a).",
          "(b) and for-range loops terminate safely."
        ),
        difficulty: "hard",
      },
      {
        prompt: "What is wrong here?",
        code: "count = 10\nwhile count > 0:\n    print(count)\n    count = count + 1",
        choices: [
          { id: "a", label: "count grows — never reaches 0" },
          { id: "b", label: "while cannot use count" },
          { id: "c", label: "Nothing — it prints 10 to 1" },
        ],
        correctId: "a",
        feedback: fb(
          "count + 1 moves away from 0, not toward it.",
          "Use count = count - 1 for a countdown."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "miniEdit",
        prompt: "Fix the infinite loop — decrement n each pass.",
        lines: ["Add n = n - 1 inside the while."],
        starterCode: "n = 3\nwhile n > 0:\n    print(n)\n",
        mustContain: ["n = n - 1"],
        feedback: fb(
          "n counts down — loop can exit.",
          "Indent n = n - 1 under while."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix the counter — it should count up toward the limit, not down forever wrong.",
        lines: [
          "Change count = count + 1 to count = count - 1 for a countdown.",
          "Or fix the condition if you meant count-up.",
        ],
        starterCode: "count = 10\nwhile count > 0:\n    print(count)\n    count = count + 1\n",
        mustContain: ["count = count - 1"],
        mustNotContain: ["count = count + 1"],
        feedback: fb(
          "Countdown needs subtract, not add.",
          "Use count = count - 1 when stopping at 0."
        ),
      },
      {
        mode: "fillBlank",
        prompt: "Add the missing update so the loop terminates.",
        template: "i = 0\nwhile i < 3:\n    print(i)\n    i = i ___ 1",
        answers: ["+"],
        placeholder: "…",
        feedback: fb(
          "i += 1 eventually makes i < 3 false.",
          "Without +1, i stays 0 forever."
        ),
      },
    ],
  },

  for_in_sequence: {
    explains: [
      {
        title: "for item in sequence",
        body: `\`for\` walks a **sequence** one piece at a time:

\`\`\`python
for ch in "hi":
    print(ch)
# h
# i
\`\`\`

Each turn, \`ch\` is the next character. You do not manually index 0, 1, 2 for simple walks.`,
      },
      {
        title: "Strings and lists",
        body: `Same pattern for lists:

\`\`\`python
for n in [10, 20, 30]:
    print(n)
\`\`\`

The loop variable (\`n\`, \`ch\`, \`item\`) is just a name — pick something meaningful.`,
      },
      {
        title: "for vs while for walking data",
        body: `When you already have items to visit, \`for item in items\` is clearer than index math:

\`\`\`python
names = ["Ada", "Lin", "Sam"]
for name in names:
    print(name)
\`\`\`

Use \`while\` when you repeat until a condition changes; use \`for\` when you have a sequence to consume.`,
      },
    ],
    quizzes: [
      {
        prompt: "What does for ch in \"Ada\" print?",
        choices: [
          { id: "a", label: "A, then d, then a (each on its own line)" },
          { id: "b", label: "Ada once" },
          { id: "c", label: "Nothing" },
        ],
        correctId: "a",
        feedback: fb(
          "Strings iterate character by character.",
          "Three chars → three prints."
        ),
        difficulty: "easy",
      },
      {
        prompt: "When is for x in seq best?",
        choices: [
          { id: "a", label: "When visiting every item in a string or list" },
          { id: "b", label: "Only when x is always an int" },
          { id: "c", label: "Never — always use while" },
        ],
        correctId: "a",
        feedback: fb(
          "for-in is made for sequences.",
          "while is for condition-driven repetition."
        ),
        difficulty: "easy",
      },
      {
        prompt: "How many times does the body run?",
        code: 'for ch in "go":\n    print(ch)',
        choices: [
          { id: "2", label: "2" },
          { id: "3", label: "3" },
          { id: "1", label: "1" },
        ],
        correctId: "2",
        feedback: fb(
          '"go" has two characters.',
          "One iteration per character."
        ),
        difficulty: "hard",
      },
      {
        prompt: "What is x after the loop?",
        code: "for x in [1, 2, 3]:\n    pass\nprint(x)",
        choices: [
          { id: "3", label: "3 (last value assigned)" },
          { id: "1", label: "1" },
          { id: "err", label: "NameError — x never existed" },
        ],
        correctId: "3",
        feedback: fb(
          "Loop variable keeps last assigned value.",
          "After the loop, x is 3."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Complete the for-in loop over a string.",
        template: 'for ch in "___":\n    print(ch)',
        answers: ["hi", "go", "Ada", "Py"],
        placeholder: "…",
        feedback: fb(
          "Any string works — you loop its characters.",
          "Put a short string literal inside quotes."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Print each number in nums using for (not print(nums)).",
        lines: ["Use for n in nums:"],
        starterCode: "nums = [1, 2, 3]\nprint(nums)\n",
        mustContain: ["for n in nums", "print(n)"],
        mustNotContain: ["print(nums)"],
        feedback: fb(
          "Each value on its own line — correct walk.",
          "for n in nums: then print(n)."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Print each letter of \"Py\" on its own line.",
        lines: ["for ch in \"Py\": print(ch)"],
        starterCode: 'word = "Py"\nprint(word)\n',
        mustContain: ['for ch in "Py"', "print(ch)"],
        mustNotContain: ['print("Py")'],
        feedback: fb(
          "Character-by-character output.",
          "Loop for ch in \"Py\" and print(ch)."
        ),
      },
    ],
  },

  range_basics: {
    explains: [
      {
        title: "range(n) — start at 0, stop before n",
        body: `\`range(n)\` gives \`n\` numbers starting at 0, ending at \`n - 1\`:

\`\`\`python
for i in range(5):
    print(i)
# 0, 1, 2, 3, 4
\`\`\`

**It does not include \`n\` itself.**`,
      },
      {
        title: "range(a, b) — custom start",
        body: `\`range(a, b)\` starts at \`a\`, stops **before** \`b\`:

\`\`\`python
for i in range(2, 6):
    print(i)
# 2, 3, 4, 5
\`\`\`

Want 1 through 5? Use \`range(1, 6)\`.`,
      },
      {
        title: "range(a, b, step)",
        body: `The third argument is the **step** (jump size):

\`\`\`python
for i in range(0, 10, 2):
    print(i)   # 0, 2, 4, 6, 8

for i in range(5, 0, -1):
    print(i)   # 5, 4, 3, 2, 1  countdown
\`\`\`

Negative step counts backward.`,
      },
    ],
    quizzes: [
      {
        prompt: "What numbers does range(3) produce?",
        choices: [
          { id: "a", label: "0, 1, 2" },
          { id: "b", label: "1, 2, 3" },
          { id: "c", label: "0, 1, 2, 3" },
        ],
        correctId: "a",
        feedback: fb(
          "Starts 0, stops before 3.",
          "Three numbers: 0, 1, 2."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What is the last value in range(2, 6)?",
        choices: [
          { id: "5", label: "5" },
          { id: "6", label: "6" },
          { id: "2", label: "2" },
        ],
        correctId: "5",
        feedback: fb(
          "Stop before 6 → last is 5.",
          "range end is exclusive."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What does this print?",
        code: "for i in range(1, 4):\n    print(i)",
        choices: [
          { id: "a", label: "1, 2, 3" },
          { id: "b", label: "1, 2, 3, 4" },
          { id: "c", label: "0, 1, 2, 3" },
        ],
        correctId: "a",
        feedback: fb(
          "Start 1, stop before 4.",
          "Four would need range(1, 5)."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Which range counts down 3, 2, 1?",
        choices: [
          { id: "a", label: "range(3, 0, -1)" },
          { id: "b", label: "range(3, 1)" },
          { id: "c", label: "range(0, 3, -1)" },
        ],
        correctId: "a",
        feedback: fb(
          "Start 3, stop before 0, step -1.",
          "Negative step goes backward."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Print 0 through 4 using range.",
        template: "for i in range(___):\n    print(i)",
        answers: ["5"],
        placeholder: "…",
        feedback: fb(
          "range(5) → 0..4.",
          "Use 5 to get five numbers starting at 0."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Print a pattern with range: output 2, 4, 6 using range(2, 8, 2).",
        lines: ["Use the given range with step 2."],
        starterCode: "for i in range(2, 8, 2):\n    pass\n",
        mustContain: ["print(i)"],
        mustNotContain: ["pass"],
        feedback: fb(
          "Step-2 range prints evens — nice pattern.",
          "Replace pass with print(i)."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Print 1, 2, 3 using range with the right start and stop.",
        lines: ["Stop before 4, start at 1."],
        starterCode: "for i in range(5):\n    print(i)\n",
        mustContain: ["range(1, 4)"],
        mustNotContain: ["range(5)"],
        feedback: fb(
          "range(1, 4) gives 1, 2, 3.",
          "Adjust start/stop — not range(5)."
        ),
      },
    ],
  },

  accumulate: {
    explains: [
      {
        title: "Running total pattern",
        body: `To **sum** values in a loop:

1. Set \`total = 0\` **before** the loop
2. Add each value: \`total = total + n\`
3. After the loop, \`total\` holds the sum

\`\`\`python
total = 0
for n in [1, 2, 3, 4]:
    total = total + n
print(total)  # 10
\`\`\``,
      },
      {
        title: "total += n shorthand",
        body: `These mean the same:

\`\`\`python
total = total + n
total += n
\`\`\`

Both add \`n\` to whatever \`total\` already holds.`,
      },
      {
        title: "Counting occurrences",
        body: `Same idea for **how many**:

\`\`\`python
count = 0
for _ in range(5):
    count = count + 1
print(count)  # 5
\`\`\`

Initialize → update in loop → use result after.`,
      },
    ],
    quizzes: [
      {
        prompt: "Why start total at 0 before summing?",
        choices: [
          { id: "a", label: "So the first addition works (0 + first value)" },
          { id: "b", label: "Python requires total to be 0 always" },
          { id: "c", label: "To print zero first" },
        ],
        correctId: "a",
        feedback: fb(
          "Neutral start for addition.",
          "Without init, total would be undefined."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What is total after the loop?",
        code: "total = 0\nfor n in [1, 2, 3]:\n    total = total + n\n# print(total)",
        choices: [
          { id: "6", label: "6" },
          { id: "3", label: "3" },
          { id: "0", label: "0" },
        ],
        correctId: "6",
        feedback: fb(
          "0+1+2+3 = 6.",
          "Each n adds to total inside the loop."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What is wrong?",
        code: "for n in [1, 2, 3]:\n    total = total + n",
        choices: [
          { id: "a", label: "total was never initialized before the loop" },
          { id: "b", label: "for cannot add numbers" },
          { id: "c", label: "Nothing" },
        ],
        correctId: "a",
        feedback: fb(
          "Need total = 0 before the loop.",
          "First total + n needs an existing total."
        ),
        difficulty: "hard",
      },
      {
        prompt: "After count loop, what is count?",
        code: "count = 0\nfor _ in range(4):\n    count += 1",
        choices: [
          { id: "4", label: "4" },
          { id: "0", label: "0" },
          { id: "1", label: "1" },
        ],
        correctId: "4",
        feedback: fb(
          "Four iterations → four increments.",
          "count += 1 runs once per loop pass."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Initialize the accumulator before summing.",
        template: "___ = 0\nfor n in [1, 2, 3]:\n    total = total + n",
        answers: ["total"],
        placeholder: "…",
        feedback: fb(
          "total = 0 before the loop.",
          "Name the running sum total."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Score accumulator: sum [10, 20, 30] and print the final total.",
        lines: [
          "total = 0 before the loop.",
          "Add each score, print total after.",
        ],
        starterCode: "scores = [10, 20, 30]\n",
        mustContain: ["total = 0", "for ", "total = total +", "print(total)"],
        feedback: fb(
          "Running total of scores — great.",
          "Init total, loop scores, add, print final."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix the accumulator — initialize total before the loop.",
        lines: ["Add total = 0 above the for."],
        starterCode: "for n in [5, 5]:\n    total = total + n\nprint(total)\n",
        mustContain: ["total = 0"],
        feedback: fb(
          "Initialized — sum works.",
          "Put total = 0 before the for loop."
        ),
      },
    ],
  },

  nest_loops_intro: {
    explains: [
      {
        title: "Loop inside a loop",
        body: `A **nested** loop puts one loop inside another:

\`\`\`python
for i in range(1, 3):
    for j in range(1, 3):
        print(i, j)
\`\`\`

For each \`i\`, the **entire** inner loop runs (all \`j\` values), then \`i\` moves on.`,
      },
      {
        title: "Multiplication table lite",
        body: `Tiny times-table row:

\`\`\`python
for i in range(1, 4):
    for j in range(1, 4):
        print(i, "*", j, "=", i * j)
\`\`\`

Outer \`i\` = which row; inner \`j\` = which column.`,
      },
      {
        title: "How many inner runs?",
        body: `If outer runs \`A\` times and inner runs \`B\` times **per outer step**, the inner body runs \`A × B\` times total.

\`\`\`python
# 2 outer × 3 inner = 6 prints
for i in range(2):
    for j in range(3):
        print(i, j)
\`\`\`

Use different names (\`i\`, \`j\`) to keep track.`,
      },
    ],
    quizzes: [
      {
        prompt: "How many times does print run?",
        code: "for i in range(2):\n    for j in range(3):\n        print(i, j)",
        choices: [
          { id: "6", label: "6 (2 × 3)" },
          { id: "5", label: "5" },
          { id: "3", label: "3" },
        ],
        correctId: "6",
        feedback: fb(
          "Inner completes fully for each outer i.",
          "Multiply outer count by inner count."
        ),
        difficulty: "easy",
      },
      {
        prompt: "When does j change vs i?",
        choices: [
          { id: "a", label: "j runs through all values for each fixed i" },
          { id: "b", label: "i and j advance together one step at a time" },
          { id: "c", label: "j never changes in nested loops" },
        ],
        correctId: "a",
        feedback: fb(
          "Inner loop finishes before outer i increments.",
          "Not interleaved one step each."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What is a good use of nested loops at intro level?",
        choices: [
          { id: "a", label: "A small grid or multiplication table pattern" },
          { id: "b", label: "Storing one variable" },
          { id: "c", label: "Converting int to str once" },
        ],
        correctId: "a",
        feedback: fb(
          "Grid/table = outer row, inner column.",
          "Nested loops handle 2D repetition."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Must inner and outer use the same variable name?",
        choices: [
          { id: "no", label: "No — different names (i, j) are clearer" },
          { id: "yes", label: "Yes — must both be i" },
          { id: "maybe", label: "Only for while loops" },
        ],
        correctId: "no",
        feedback: fb(
          "Separate names avoid shadowing confusion.",
          "Same name would overwrite each iteration."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "miniEdit",
        prompt: "Complete the inner loop: print i * j for a 2×2 table (range 1..2).",
        lines: ["Inner: for j in range(1, 3): print(i * j)"],
        starterCode: "for i in range(1, 3):\n    pass\n",
        mustContain: ["for j in range(1, 3)", "print(i * j)"],
        mustNotContain: ["pass"],
        feedback: fb(
          "Nested table cell — well done.",
          "Add inner for j and print i * j."
        ),
      },
      {
        mode: "fillBlank",
        prompt: "Fill the inner range for three j values (1, 2, 3).",
        template: "for i in range(1, 3):\n    for j in range(1, ___):\n        print(i, j)",
        answers: ["4"],
        placeholder: "…",
        feedback: fb(
          "range(1, 4) → 1, 2, 3.",
          "Stop before 4 for three j values."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Print a 2×3 grid of stars: outer 2 rows, inner 3 cols.",
        lines: [
          "Outer range(2), inner range(3).",
          "print('*', end=' ') inner, print() after inner.",
        ],
        starterCode: "# 2 rows, 3 stars each\n",
        mustContain: ["for ", "range(2)", "range(3)", "print"],
        feedback: fb(
          "Nested pattern printed — nice grid.",
          "Double loop: 2 outer × 3 inner prints."
        ),
      },
    ],
  },

  break_continue: {
    explains: [
      {
        title: "break — exit the loop now",
        body: `\`break\` jumps **out** of the innermost loop immediately:

\`\`\`python
for n in range(10):
    if n == 5:
        break
    print(n)
# 0, 1, 2, 3, 4 — then stop
\`\`\`

Nothing after \`break\` in that iteration runs; the loop is done.`,
      },
      {
        title: "continue — skip to next iteration",
        body: `\`continue\` skips the **rest of this round** and goes to the next item:

\`\`\`python
for n in range(5):
    if n == 2:
        continue
    print(n)
# 0, 1, 3, 4 — 2 is skipped
\`\`\`

The loop keeps going; only this pass is cut short.`,
      },
      {
        title: "Use carefully at intro level",
        body: `Prefer a clear \`for\` or \`while\` condition when you can. \`break\` / \`continue\` help when:

- You found what you need early (\`break\`)
- One case should be ignored (\`continue\`)

They only affect the **innermost** loop they sit in.`,
      },
    ],
    quizzes: [
      {
        prompt: "What is the difference between break and continue?",
        choices: [
          { id: "a", label: "break exits the loop; continue skips to the next iteration" },
          { id: "b", label: "They do the same thing" },
          { id: "c", label: "continue exits the whole program" },
        ],
        correctId: "a",
        feedback: fb(
          "break = stop loop; continue = next round.",
          "continue does not stop the whole loop."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What prints?",
        code: "for n in range(5):\n    if n == 3:\n        break\n    print(n)",
        choices: [
          { id: "a", label: "0, 1, 2" },
          { id: "b", label: "0, 1, 2, 3, 4" },
          { id: "c", label: "0, 1, 2, 3" },
        ],
        correctId: "a",
        feedback: fb(
          "break at 3 — 3 never prints.",
          "Stops before printing 3."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What prints with continue at 2?",
        code: "for n in range(5):\n    if n == 2:\n        continue\n    print(n)",
        choices: [
          { id: "a", label: "0, 1, 3, 4" },
          { id: "b", label: "0, 1, 2" },
          { id: "c", label: "3, 4" },
        ],
        correctId: "a",
        feedback: fb(
          "2 skipped; loop continues.",
          "continue skips print only for n==2."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Does break stop the entire Python program?",
        choices: [
          { id: "no", label: "No — only the innermost loop containing break" },
          { id: "yes", label: "Yes — interpreter exits" },
          { id: "maybe", label: "Only in while loops" },
        ],
        correctId: "no",
        feedback: fb(
          "Code after the loop still runs.",
          "break leaves one loop, not the whole script."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Stop the loop when n reaches 3.",
        template: "for n in range(10):\n    if n == 3:\n        ___\n    print(n)",
        answers: ["break"],
        placeholder: "…",
        feedback: fb(
          "break exits at n == 3.",
          "Use break to leave the loop early."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Skip printing when n is 0 using continue.",
        lines: ["if n == 0: continue before print."],
        starterCode: "for n in range(3):\n    print(n)\n",
        mustContain: ["if n == 0", "continue"],
        feedback: fb(
          "Zero skipped — continue works.",
          "Add if n == 0: continue above print."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Print 0,1,2 only — break before n becomes 3.",
        lines: ["break when n == 3."],
        starterCode: "for n in range(10):\n    print(n)\n",
        mustContain: ["if n == 3", "break"],
        feedback: fb(
          "Early exit at 3 — clean.",
          "if n == 3: break before printing 3."
        ),
      },
    ],
  },

  loop_vs_repeat_code: {
    explains: [
      {
        title: "Three lines break at thirty",
        body: `Printing three scores manually:

\`\`\`python
print(scores[0])
print(scores[1])
print(scores[2])
\`\`\`

Works until the list has **30** scores. Then you need 30 lines — easy to miscount or forget an index.`,
      },
      {
        title: "One loop scales",
        body: `\`\`\`python
for s in scores:
    print(s)
\`\`\`

Three items or three hundred — **same two lines**. Change the data, not the code structure.`,
      },
      {
        title: "Edit one place, not many",
        body: `Need a different action? With copy-paste you hunt every duplicate. With a loop you change **one** indented block:

\`\`\`python
for s in scores:
    print("Score:", s)  # one edit applies to all
\`\`\`

Loops reduce bugs when requirements change.`,
      },
    ],
    quizzes: [
      {
        prompt: "Why is for s in scores better than three print lines?",
        choices: [
          { id: "a", label: "It works when the list length changes without rewriting" },
          { id: "b", label: "It runs faster on exactly three items only" },
          { id: "c", label: "Python forbids repeated print lines" },
        ],
        correctId: "a",
        feedback: fb(
          "One pattern scales with data.",
          "Copy-paste does not grow gracefully."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Scores grows from 3 to 30 items. What changes with a for loop?",
        choices: [
          { id: "a", label: "Nothing in the loop code — only the list data" },
          { id: "b", label: "You must add 27 more print lines" },
          { id: "c", label: "You must switch to while always" },
        ],
        correctId: "a",
        feedback: fb(
          "Loop body stays; data grows.",
          "That is the maintenance win."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Which is more fragile for 10 greet lines?",
        choices: [
          { id: "a", label: "Ten separate print('Hi') lines" },
          { id: "b", label: "for _ in range(10): print('Hi')" },
          { id: "c", label: "Both equally — no difference ever" },
        ],
        correctId: "a",
        feedback: fb(
          "Ten copies — change count means edit many lines.",
          "Loop changes one number."
        ),
        difficulty: "hard",
      },
      {
        prompt: "When might copy-paste be OK?",
        choices: [
          { id: "a", label: "Rarely — only for 1–2 truly unique lines that will never repeat" },
          { id: "b", label: "Always — loops are never readable" },
          { id: "c", label: "When the list has 100 items" },
        ],
        correctId: "a",
        feedback: fb(
          "Tiny unique sequences exist — but repetition wants loops.",
          "100 items definitely need a loop."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "miniEdit",
        prompt: "Replace three indexed prints with for item in items.",
        lines: ["Remove print(items[0]) style lines."],
        starterCode: "items = ['a', 'b', 'c']\nprint(items[0])\nprint(items[1])\nprint(items[2])\n",
        mustContain: ["for item in items", "print(item)"],
        mustNotContain: ["items[0]", "items[1]", "items[2]"],
        feedback: fb(
          "for-in replaces manual indexing.",
          "Use for item in items: print(item)."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Change range(3) to range(6) without adding more print lines.",
        lines: ["Only edit the number in range."],
        starterCode: "for _ in range(3):\n    print('tick')\n",
        mustContain: ["range(6)"],
        mustNotContain: ["range(3)"],
        feedback: fb(
          "One number change — six ticks.",
          "That beats adding three more prints."
        ),
      },
      {
        mode: "fillBlank",
        prompt: "Walk every score with for-in instead of indexing.",
        template: "scores = [1, 2, 3]\nfor s in ___:\n    print(s)",
        answers: ["scores"],
        placeholder: "…",
        feedback: fb(
          "for s in scores visits each value.",
          "Put the list name after in."
        ),
      },
    ],
  },

  off_by_one: {
    explains: [
      {
        title: "range stops before the end",
        body: `\`range(5)\` is **not** 1,2,3,4,5. It is 0,1,2,3,4 — five numbers, last is **4**:

\`\`\`python
print(list(range(5)))   # [0, 1, 2, 3, 4]
\`\`\`

The stop value is **exclusive** (not included).`,
      },
      {
        title: "while i < n vs i <= n",
        body: `\`\`\`python
i = 0
while i < 5:   # 5 iterations: i = 0..4
    i += 1

i = 0
while i <= 5:  # 6 iterations: i = 0..5
    i += 1
\`\`\`

\`<\` vs \`<=\` changes the count by one — classic **off-by-one**.`,
      },
      {
        title: "Want 1 through 5?",
        body: `Use \`range(1, 6)\` — start 1, stop before 6:

\`\`\`python
for i in range(1, 6):
    print(i)  # 1, 2, 3, 4, 5
\`\`\`

Ask: *How many iterations?* Count from start to stop (exclusive).`,
      },
    ],
    quizzes: [
      {
        prompt: "Does range(5) include 5?",
        choices: [
          { id: "no", label: "No — stops before 5" },
          { id: "yes", label: "Yes — 0 through 5" },
          { id: "maybe", label: "Only in while loops" },
        ],
        correctId: "no",
        feedback: fb(
          "Last value is 4.",
          "Stop is exclusive in range."
        ),
        difficulty: "easy",
      },
      {
        prompt: "How many times does this run?",
        code: "i = 0\nwhile i < 3:\n    print(i)\n    i += 1",
        choices: [
          { id: "3", label: "3 times" },
          { id: "4", label: "4 times" },
          { id: "2", label: "2 times" },
        ],
        correctId: "3",
        feedback: fb(
          "i = 0, 1, 2 then i < 3 fails.",
          "Three iterations, not four."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Which produces 1, 2, 3, 4, 5?",
        choices: [
          { id: "a", label: "range(1, 6)" },
          { id: "b", label: "range(1, 5)" },
          { id: "c", label: "range(5)" },
        ],
        correctId: "a",
        feedback: fb(
          "Stop before 6 to include 5.",
          "range(1,5) stops at 4."
        ),
        difficulty: "hard",
      },
      {
        prompt: "What is the last i from range(2, 6)?",
        choices: [
          { id: "5", label: "5" },
          { id: "6", label: "6" },
          { id: "2", label: "2" },
        ],
        correctId: "5",
        feedback: fb(
          "Stop before 6 → 5 is last.",
          "6 is never included."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Print 1 through 5 using range start/stop.",
        template: "for i in range(1, ___):\n    print(i)",
        answers: ["6"],
        placeholder: "…",
        feedback: fb(
          "range(1, 6) → 1..5.",
          "Stop before 6 to include 5."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix off-by-one: should print 0,1,2,3,4 not 0..5.",
        lines: ["Use range(5) or while i < 5."],
        starterCode: "for i in range(6):\n    print(i)\n",
        mustContain: ["range(5)"],
        mustNotContain: ["range(6)"],
        feedback: fb(
          "Five numbers 0..4 — fixed.",
          "range(5) not range(6)."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix while to run exactly 3 times (0, 1, 2).",
        lines: ["Change <= to < or adjust start."],
        starterCode: "i = 0\nwhile i <= 3:\n    print(i)\n    i += 1\n",
        mustContain: ["while i < 3"],
        mustNotContain: ["while i <= 3"],
        feedback: fb(
          "i < 3 gives three passes.",
          "<= 3 runs four times — off by one."
        ),
      },
    ],
  },

  loop_patterns: {
    explains: [
      {
        title: "Repeat N times with _",
        body: `When you **do not need** the index, use \`_\` as the loop variable:

\`\`\`python
for _ in range(4):
    print("go")
# four lines of go
\`\`\`

\`_\` is a normal name meaning "I ignore this value."`,
      },
      {
        title: "Countdown pattern",
        body: `Count down to a finale:

\`\`\`python
for n in range(3, 0, -1):
    print(n)
print("lift off")
# 3, 2, 1, lift off
\`\`\`

Or with \`while\`: start high, subtract until zero.`,
      },
      {
        title: "Collect vs print each step",
        body: `Two styles:

\`\`\`python
# Print each step
for n in range(3):
    print(n)

# Accumulate, print once at end
total = 0
for n in [1, 2, 3]:
    total += n
print(total)
\`\`\`

Pick based on what the task asks — per-round output or final result.`,
      },
    ],
    quizzes: [
      {
        prompt: "When do you use for _ in range(n)?",
        choices: [
          { id: "a", label: "When you repeat N times but do not need the index" },
          { id: "b", label: "When _ is a Python keyword that stops errors" },
          { id: "c", label: "Never — _ is illegal" },
        ],
        correctId: "a",
        feedback: fb(
          "_ means discard the counter value.",
          "_ is a valid throwaway name."
        ),
        difficulty: "easy",
      },
      {
        prompt: "How print countdown 3, 2, 1?",
        choices: [
          { id: "a", label: "for n in range(3, 0, -1): print(n)" },
          { id: "b", label: "for n in range(1, 3): print(n)" },
          { id: "c", label: "range(3) prints 3, 2, 1 automatically" },
        ],
        correctId: "a",
        feedback: fb(
          "Start 3, step -1, stop before 0.",
          "range(1,3) gives 1, 2 only."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What prints last?",
        code: "for n in range(2, 0, -1):\n    print(n)\nprint('done')",
        choices: [
          { id: "done", label: "2, then 1, then done" },
          { id: "n", label: "done, then 2, then 1" },
          { id: "err", label: "Error" },
        ],
        correctId: "done",
        feedback: fb(
          "Loop finishes, then one done print.",
          "Countdown then after-loop line."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Which pattern collects a final total?",
        choices: [
          { id: "a", label: "total = 0; loop adds; print(total) after" },
          { id: "b", label: "print inside loop only — no accumulator" },
          { id: "c", label: "total = 0 with no loop" },
        ],
        correctId: "a",
        feedback: fb(
          "Accumulator + single final print.",
          "Printing each step shows steps, not one total."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "miniEdit",
        prompt: "Print a pattern: four dashes using for _ in range(4).",
        lines: ["Ignore index with _."],
        starterCode: "print('-')\n",
        mustContain: ["for _ in range(4)", "print('-')"],
        mustNotContain: ["print('-')\nprint('-')"],
        feedback: fb(
          "Repeat-N with _ — clean pattern.",
          "for _ in range(4): print('-')."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Countdown: print 3, 2, 1 then 'go'.",
        lines: ["Use range(3, 0, -1) or similar."],
        starterCode: "# countdown\n",
        mustContain: ["for ", "print(", "print('go')"],
        mustMatchAny: [
          String.raw`range\s*\(\s*3\s*,\s*0\s*,\s*-1\s*\)`,
          String.raw`while\s+\w+\s*>\s*0`,
        ],
        feedback: fb(
          "Countdown then go — classic pattern.",
          "Loop 3..1 with negative range or while countdown."
        ),
      },
      {
        mode: "fillBlank",
        prompt: "Use _ when the loop index is unused.",
        template: "for ___ in range(5):\n    print('tick')",
        answers: ["_"],
        placeholder: "…",
        feedback: fb(
          "_ is the throwaway loop variable.",
          "Use _ when you only need repeat count."
        ),
      },
    ],
  },
}
