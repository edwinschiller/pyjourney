import type { ConceptContentBank } from "@/lib/lesson-engine/bank/content/variables"

const fb = (correct: string, wrong: string) => ({ correct, wrong })

/**
 * Slot fillers for the Lists blueprint.
 * Keys MUST match TopicSpec.id in curricula/lists.ts.
 */
export const LISTS_CONTENT: ConceptContentBank = {
  why_lists: {
    explains: [
      {
        title: "Many values, one name",
        body: `A **list** stores an ordered sequence of values under one variable name.

\`\`\`python
scores = [10, 14, 8]
print(scores)  # [10, 14, 8]
\`\`\`

Instead of \`score1\`, \`score2\`, \`score3\`, you keep one collection that can grow.`,
      },
      {
        title: "Order is part of the data",
        body: `Lists remember **position**. The first item you put in stays first until you change it.

\`\`\`python
queue = ["Ada", "Lin", "Sam"]
print(queue[0])  # Ada — still first
\`\`\`

Order matters for scoreboards, turn order, and step-by-step recipes.`,
      },
      {
        title: "When to reach for a list",
        body: `Use a list when you have **zero or more similar things** to track together:

\`\`\`python
inventory = ["sword", "potion", "key"]
high_scores = [980, 1200, 750]
\`\`\`

One lone value? A plain variable is fine. A growing collection? A list.`,
      },
    ],
    quizzes: [
      {
        prompt: "Why use a list instead of three separate variables?",
        choices: [
          { id: "a", label: "One name can hold many ordered values" },
          { id: "b", label: "Lists are faster than variables" },
          { id: "c", label: "Python requires lists for numbers" },
        ],
        correctId: "a",
        feedback: fb(
          "Lists group related values with order preserved.",
          "Separate vars work but do not scale or loop easily."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Does list order matter?",
        choices: [
          { id: "yes", label: "Yes — index 0 is always the first item stored" },
          { id: "no", label: "No — Python shuffles lists automatically" },
          { id: "maybe", label: "Only for strings inside the list" },
        ],
        correctId: "yes",
        feedback: fb(
          "Lists are ordered sequences.",
          "Order stays until you mutate or reorder."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Which variable best models three quiz scores?",
        choices: [
          { id: "list", label: "scores = [7, 9, 8]" },
          { id: "one", label: "score = 7" },
          { id: "str", label: 'scores = "7, 9, 8"' },
        ],
        correctId: "list",
        feedback: fb(
          "A list keeps separate numeric items you can index and loop.",
          "A string of digits is text, not three numbers."
        ),
        difficulty: "hard",
      },
      {
        prompt: "What does this print?",
        code: 'items = ["first", "second"]\nprint(items[0])',
        choices: [
          { id: "first", label: "first" },
          { id: "second", label: "second" },
          { id: "zero", label: "0" },
        ],
        correctId: "first",
        feedback: fb(
          "Index 0 is the first stored item.",
          "0-based indexing — not 1-based."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Complete the list with a second team name.",
        template: 'team = ["Ada", ___]',
        answers: ['"Lin"', "'Lin'", '"Sam"', "'Sam'"],
        placeholder: "…",
        feedback: fb(
          "Square brackets + comma-separated items = list.",
          'Add a quoted string: e.g. "Lin".'
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Print the first score from the list (index 0).",
        lines: ["Keep the list as-is.", "Print scores[0]."],
        starterCode: "scores = [10, 14, 8]\nprint(scores)\n",
        mustContain: ["scores[0]"],
        mustNotContain: ["scores[1]"],
        feedback: fb(
          "First item → index 0.",
          "Use scores[0], not scores[1]."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Replace the single score variable with a list of three scores.",
        lines: [
          "Use one list with three numbers.",
          "Print the whole list.",
        ],
        starterCode: "score = 10\nprint(score)\n",
        mustContain: ["scores = [", "print(scores)"],
        mustNotContain: ["score = 10"],
        feedback: fb(
          "One list holds all three values.",
          "Assign scores = [10, 14, 8] (or similar) and print it."
        ),
      },
    ],
  },

  create_lists: {
    explains: [
      {
        title: "Square brackets + commas",
        body: `Create a list with \`[\` and \`]\`. Separate items with commas:

\`\`\`python
inventory = ["sword", "potion", "key"]
levels = [1, 2, 3]
\`\`\`

Each item can be any value — numbers, strings, bools, even other lists later.`,
      },
      {
        title: "Mixed types — allowed, use carefully",
        body: `Python lists **may** mix types. It is valid, but can confuse beginners:

\`\`\`python
mixed = [1, "two", 3.0, True]
print(mixed)  # [1, 'two', 3.0, True]
\`\`\`

In exercises, prefer lists where every item is the same kind (all scores, all names).`,
      },
      {
        title: "Empty list []",
        body: `\`[]\` is a valid empty list — a common starting point before you append items:

\`\`\`python
bag = []
bag.append("coin")
print(bag)  # ['coin']
\`\`\`

A trailing comma after the last item is fine: \`[1, 2,]\`.`,
      },
    ],
    quizzes: [
      {
        prompt: "Which syntax creates a list?",
        choices: [
          { id: "a", label: '[1, 2, 3]' },
          { id: "b", label: "(1, 2, 3)" },
          { id: "c", label: "{1, 2, 3}" },
        ],
        correctId: "a",
        feedback: fb(
          "Square brackets make a list.",
          "Parentheses → tuple; braces → set/dict context."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Is [1, \"a\", True] valid Python?",
        choices: [
          { id: "yes", label: "Yes — lists can hold mixed types" },
          { id: "no", label: "No — all items must be the same type" },
          { id: "syntax", label: "No — SyntaxError on mixing types" },
        ],
        correctId: "yes",
        feedback: fb(
          "Mixed-type lists are legal (just use thoughtfully).",
          "Python does not require homogeneous lists."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What is the value of empty?",
        code: "empty = []\nprint(len(empty))",
        choices: [
          { id: "zero", label: "0" },
          { id: "none", label: "None" },
          { id: "err", label: "Error" },
        ],
        correctId: "zero",
        feedback: fb(
          "Empty list has length 0.",
          "[] is valid — len is 0."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Which creates an empty list?",
        choices: [
          { id: "a", label: "items = []" },
          { id: "b", label: "items = ()" },
          { id: "c", label: "items = None" },
        ],
        correctId: "a",
        feedback: fb(
          "[] is the empty list literal.",
          "() is an empty tuple; None is not a list."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Fill in three comma-separated integers inside the brackets.",
        template: "nums = [___]",
        answers: ["1, 2, 3", "0, 1, 2", "10, 20, 30"],
        placeholder: "…",
        feedback: fb(
          "Three comma-separated ints inside [ ].",
          "Example: 1, 2, 3 inside the brackets."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Add a third item to the inventory list literal.",
        lines: ["Include \"key\" as the third string."],
        starterCode: 'inventory = ["sword", "potion"]\nprint(inventory)\n',
        mustContain: ['"key"'],
        feedback: fb(
          "Three-item list created.",
          'Add "key": inventory = ["sword", "potion", "key"].'
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Start with an empty list, then append one item.",
        lines: [
          "bag = []",
          'bag.append("coin")',
          "print(bag)",
        ],
        starterCode: 'bag = ["sword"]\nprint(bag)\n',
        mustContain: ["bag = []", 'append("coin")'],
        mustNotContain: ['bag = ["sword"]'],
        feedback: fb(
          "Empty start + append builds the list.",
          "Set bag = [] then bag.append(\"coin\")."
        ),
      },
    ],
  },

  indexing: {
    explains: [
      {
        title: "Zero-based indexing",
        body: `The **first** item lives at index **0**, not 1:

\`\`\`python
fruits = ["apple", "banana", "cherry"]
print(fruits[0])  # apple
print(fruits[1])  # banana
print(fruits[2])  # cherry
\`\`\`

If you use an index that does not exist, Python raises \`IndexError\`.`,
      },
      {
        title: "Negative indices (lite)",
        body: `\`-1\` means the **last** item, \`-2\` the second-to-last:

\`\`\`python
items = [10, 20, 30]
print(items[-1])  # 30
print(items[-2])  # 20
\`\`\`

Handy when you want the end without writing \`len(items) - 1\`.`,
      },
      {
        title: "Index vs length",
        body: `For a list with 3 items, valid indices are **0, 1, 2** — not 3.

\`\`\`python
scores = [8, 9, 10]
last = scores[len(scores) - 1]  # 10
also_last = scores[-1]          # 10
\`\`\`

\`len(scores)\` is 3, but index 3 is out of range.`,
      },
    ],
    quizzes: [
      {
        prompt: "What index is the first item?",
        choices: [
          { id: "zero", label: "0" },
          { id: "one", label: "1" },
          { id: "minus", label: "-1" },
        ],
        correctId: "zero",
        feedback: fb(
          "Python lists are 0-based.",
          "First item is items[0]."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What does items[-1] return?",
        code: 'items = ["a", "b", "c"]\nprint(items[-1])',
        choices: [
          { id: "c", label: '"c"' },
          { id: "a", label: '"a"' },
          { id: "err", label: "IndexError" },
        ],
        correctId: "c",
        feedback: fb(
          "-1 indexes from the end — last item.",
          "Negative indices are valid in Python."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What happens here?",
        code: "nums = [1, 2, 3]\nprint(nums[3])",
        choices: [
          { id: "err", label: "IndexError — index 3 is out of range" },
          { id: "three", label: "Prints 3" },
          { id: "none", label: "Prints None" },
        ],
        correctId: "err",
        feedback: fb(
          "Valid indices: 0, 1, 2 only.",
          "len is 3; last index is 2."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Which expression gets the second item?",
        code: 'names = ["Ada", "Lin", "Sam"]',
        choices: [
          { id: "one", label: "names[1]" },
          { id: "two", label: "names[2]" },
          { id: "zero", label: "names[0]" },
        ],
        correctId: "one",
        feedback: fb(
          "Second item → index 1.",
          "Index 0 is first; index 1 is second."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Fill in the index for the first fruit.",
        template: 'fruits = ["apple", "banana"]\nprint(fruits[___])',
        answers: ["0"],
        placeholder: "…",
        feedback: fb(
          "First item → index 0.",
          "Use fruits[0]."
        ),
      },
      {
        mode: "fillBlank",
        prompt: "Use a negative index for the last item.",
        template: "nums = [10, 20, 30]\nprint(nums[___])",
        answers: ["-1"],
        placeholder: "…",
        feedback: fb(
          "-1 is the last element.",
          "nums[-1] prints 30."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix the IndexError — print the last item safely.",
        lines: [
          "Last valid index is 2 (or use -1).",
        ],
        starterCode: "items = [5, 6, 7]\nprint(items[3])\n",
        mustMatchAny: ["items\\[2\\]", "items\\[-1\\]"],
        mustNotContain: ["items[3]"],
        feedback: fb(
          "In-range index — no crash.",
          "Replace items[3] with items[2] or items[-1]."
        ),
      },
    ],
  },

  len_empty: {
    explains: [
      {
        title: "Count with len()",
        body: `\`len(items)\` tells you **how many** items are in the list:

\`\`\`python
scores = [10, 20, 30]
print(len(scores))  # 3
\`\`\`

Same function works on strings — but here we focus on lists.`,
      },
      {
        title: "Empty list length is 0",
        body: `\`[]\` is not an error. Its length is zero:

\`\`\`python
bag = []
print(len(bag))  # 0
\`\`\`

You can still append later — empty is a normal starting state.`,
      },
      {
        title: "Last index = len - 1",
        body: `If \`len(items)\` is 5, valid indices are 0 through 4:

\`\`\`python
items = ["a", "b", "c", "d", "e"]
print(len(items))           # 5
print(items[len(items) - 1])  # e
# print(items[5])           # IndexError
\`\`\`

**Never** use \`items[len(items)]\` for the last item.`,
      },
    ],
    quizzes: [
      {
        prompt: "What is len([\"a\", \"b\"])?",
        choices: [
          { id: "two", label: "2" },
          { id: "one", label: "1" },
          { id: "ab", label: '"ab"' },
        ],
        correctId: "two",
        feedback: fb(
          "Two items → len 2.",
          "len counts elements, not characters."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What is the last valid index of a 3-item list?",
        choices: [
          { id: "two", label: "2" },
          { id: "three", label: "3" },
          { id: "one", label: "1" },
        ],
        correctId: "two",
        feedback: fb(
          "Indices 0, 1, 2 for len 3.",
          "Last index is always len - 1."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What does this print?",
        code: "print(len([]))",
        choices: [
          { id: "zero", label: "0" },
          { id: "err", label: "Error" },
          { id: "none", label: "None" },
        ],
        correctId: "zero",
        feedback: fb(
          "Empty list → length 0.",
          "[] is valid."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Which index is out of range?",
        code: "items = [1, 2, 3]",
        choices: [
          { id: "three", label: "items[3]" },
          { id: "two", label: "items[2]" },
          { id: "zero", label: "items[0]" },
        ],
        correctId: "three",
        feedback: fb(
          "len 3 → max index 2.",
          "items[3] raises IndexError."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Print how many items are in scores.",
        template: "scores = [8, 9, 10]\nprint(___(scores))",
        answers: ["len"],
        placeholder: "…",
        feedback: fb(
          "len(scores) returns 3.",
          "The counting function is len."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Print the last item using len(items) - 1.",
        lines: ["Keep the list.", "Use items[len(items) - 1]."],
        starterCode: 'items = ["a", "b", "c"]\nprint(items[0])\n',
        mustContain: ["len(items) - 1"],
        feedback: fb(
          "len - 1 targets the last index.",
          "print(items[len(items) - 1])."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Create an empty list and print its length.",
        lines: ["bag = []", "print(len(bag))"],
        starterCode: 'bag = ["coin"]\nprint(bag)\n',
        mustContain: ["bag = []", "len(bag)"],
        feedback: fb(
          "Empty list reports length 0.",
          "Set bag = [] and print len(bag)."
        ),
      },
    ],
  },

  mutate_append: {
    explains: [
      {
        title: "append adds to the end",
        body: `\`.append(x)\` mutates the list by adding \`x\` at the **end**:

\`\`\`python
bag = ["key"]
bag.append("coin")
print(bag)  # ['key', 'coin']
\`\`\`

The list grows — you do not reassign \`bag = ...\` for append.`,
      },
      {
        title: "Replace with index assignment",
        body: `\`items[i] = new\` replaces the item at index \`i\`:

\`\`\`python
scores = [8, 9, 10]
scores[0] = 11
print(scores)  # [11, 9, 10]
\`\`\`

Length stays the same — only that slot changes.`,
      },
      {
        title: "append returns None",
        body: `Do **not** expect a new list from \`append\`:

\`\`\`python
items = [1]
result = items.append(2)
print(result)  # None
print(items)   # [1, 2]
\`\`\`

\`append\` changes the original list **in place**.`,
      },
    ],
    quizzes: [
      {
        prompt: "What does bag.append(\"coin\") do?",
        choices: [
          { id: "a", label: "Adds \"coin\" to the end of bag" },
          { id: "b", label: "Returns a new list with \"coin\"" },
          { id: "c", label: "Inserts \"coin\" at index 0" },
        ],
        correctId: "a",
        feedback: fb(
          "append mutates in place at the end.",
          "It does not return the list."
        ),
        difficulty: "easy",
      },
      {
        prompt: "How do you replace the first item?",
        code: 'items = ["a", "b"]',
        choices: [
          { id: "a", label: 'items[0] = "x"' },
          { id: "b", label: 'items.append("x")' },
          { id: "c", label: 'items = "x"' },
        ],
        correctId: "a",
        feedback: fb(
          "Index assignment replaces in place.",
          "append adds; reassignment to items alone loses the list."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What does this print?",
        code: "nums = [1]\nx = nums.append(2)\nprint(x)\nprint(nums)",
        choices: [
          { id: "none_list", label: "None then [1, 2]" },
          { id: "list_list", label: "[1, 2] then [1, 2]" },
          { id: "none_one", label: "None then [1]" },
        ],
        correctId: "none_list",
        feedback: fb(
          "append returns None; nums is mutated.",
          "Check append's return value."
        ),
        difficulty: "hard",
      },
      {
        prompt: "After these lines, what is bag?",
        code: 'bag = ["a"]\nbag.append("b")\nbag[0] = "z"',
        choices: [
          { id: "zb", label: '["z", "b"]' },
          { id: "ab", label: '["a", "b"]' },
          { id: "z", label: '["z"]' },
        ],
        correctId: "zb",
        feedback: fb(
          "append then replace index 0.",
          "Trace: [\"a\"] → [\"a\",\"b\"] → [\"z\",\"b\"]."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Append \"potion\" to inventory.",
        template: 'inventory = ["sword"]\ninventory.___("potion")',
        answers: ["append"],
        placeholder: "…",
        feedback: fb(
          "append adds to the end.",
          "Method name is append."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Replace the first score with 100 using index assignment.",
        lines: ["scores[0] = 100", "print(scores)"],
        starterCode: "scores = [8, 9, 10]\nprint(scores[1])\n",
        mustContain: ["scores[0] = 100"],
        feedback: fb(
          "Index 0 replaced.",
          "Add scores[0] = 100."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Build the list by starting empty and appending two items.",
        lines: [
          "bag = []",
          'bag.append("key")',
          'bag.append("coin")',
        ],
        starterCode: 'bag = ["key", "coin"]\nprint(bag)\n',
        mustContain: ["bag = []", "append"],
        mustNotContain: ['bag = ["key", "coin"]'],
        feedback: fb(
          "Empty + two appends.",
          "Start with [] and append twice."
        ),
      },
    ],
  },

  slice_intro: {
    explains: [
      {
        title: "start:stop — stop is exclusive",
        body: `A slice \`items[start:stop]\` takes from \`start\` up to **but not including** \`stop\`:

\`\`\`python
nums = [10, 20, 30, 40]
print(nums[1:3])  # [20, 30]
\`\`\`

Index 3 is **not** included.`,
      },
      {
        title: "Omitted start or stop",
        body: `Leave off \`start\` to begin at 0; leave off \`stop\` to go through the end:

\`\`\`python
nums = [10, 20, 30, 40]
print(nums[:2])   # [10, 20]
print(nums[2:])   # [30, 40]
print(nums[:])    # whole copy [10, 20, 30, 40]
\`\`\``,
      },
      {
        title: "Slicing does not mutate",
        body: `The original list stays unchanged:

\`\`\`python
items = [1, 2, 3]
chunk = items[0:2]
print(chunk)  # [1, 2]
print(items)  # [1, 2, 3] — unchanged
\`\`\`

To change the list, use assignment or \`append\`, not slicing alone.`,
      },
    ],
    quizzes: [
      {
        prompt: "What does [1:3] include from [10, 20, 30, 40]?",
        choices: [
          { id: "a", label: "[20, 30]" },
          { id: "b", label: "[20, 30, 40]" },
          { id: "c", label: "[10, 20]" },
        ],
        correctId: "a",
        feedback: fb(
          "Indices 1 and 2 — stop 3 is exclusive.",
          "Stop index is not included."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Does slicing change the original list?",
        choices: [
          { id: "no", label: "No — it returns a new sub-list" },
          { id: "yes", label: "Yes — items are removed" },
          { id: "maybe", label: "Only if the slice is empty" },
        ],
        correctId: "no",
        feedback: fb(
          "Slicing is non-mutating read.",
          "Original stays intact."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What does nums[:2] produce?",
        code: "nums = [5, 6, 7, 8]",
        choices: [
          { id: "a", label: "[5, 6]" },
          { id: "b", label: "[6, 7]" },
          { id: "c", label: "[5, 6, 7]" },
        ],
        correctId: "a",
        feedback: fb(
          "From start through index 1.",
          "Missing start means 0."
        ),
        difficulty: "hard",
      },
      {
        prompt: "What does nums[2:] produce?",
        code: "nums = [1, 2, 3, 4]",
        choices: [
          { id: "a", label: "[3, 4]" },
          { id: "b", label: "[2, 3, 4]" },
          { id: "c", label: "[1, 2]" },
        ],
        correctId: "a",
        feedback: fb(
          "From index 2 to the end.",
          "Index 2 is 3; rest is 4."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Set the stop index so the slice includes 20 and 30 (start is 1).",
        template: "nums = [10, 20, 30, 40]\nchunk = nums[1:___]",
        answers: ["3"],
        placeholder: "…",
        feedback: fb(
          "nums[1:3] → [20, 30].",
          "Stop is exclusive — use 3."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Print the first two items using a slice.",
        lines: ["Use nums[:2] or nums[0:2]."],
        starterCode: "nums = [1, 2, 3, 4]\nprint(nums[0])\n",
        mustMatchAny: ["nums[:2]", "nums[0:2]"],
        feedback: fb(
          "Slice from the start.",
          "print(nums[:2])."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Print items from index 2 to the end.",
        lines: ["Use nums[2:]."],
        starterCode: "nums = [1, 2, 3, 4]\nprint(nums)\n",
        mustContain: ["nums[2:]"],
        feedback: fb(
          "Open-ended stop reaches the end.",
          "print(nums[2:])."
        ),
      },
    ],
  },

  for_each_item: {
    explains: [
      {
        title: "for item in items",
        body: `Loop over **each value** in order:

\`\`\`python
scores = [8, 9, 10]
for s in scores:
    print(s)
\`\`\`

Output: 8, then 9, then 10 — one line per iteration.`,
      },
      {
        title: "The loop variable is the value",
        body: `\`for x in items\` assigns **x** to each item — not the index:

\`\`\`python
names = ["Ada", "Lin"]
for name in names:
    print(name)
\`\`\`

To also need indices, use \`range(len(...))\` later — not required here.`,
      },
      {
        title: "Empty list → zero iterations",
        body: `If the list is empty, the loop body **never runs**:

\`\`\`python
items = []
for x in items:
    print(x)  # never executed
print("done")
\`\`\`

Watch indentation — only indented lines belong to the loop.`,
      },
    ],
    quizzes: [
      {
        prompt: "What does for x in items assign each time?",
        choices: [
          { id: "value", label: "Each item's value" },
          { id: "index", label: "The index 0, 1, 2, ..." },
          { id: "copy", label: "A copy of the whole list" },
        ],
        correctId: "value",
        feedback: fb(
          "for x in ... binds x to each element.",
          "Indices need range(len(...)) or enumerate."
        ),
        difficulty: "easy",
      },
      {
        prompt: "How many times does the loop run for a 3-item list?",
        choices: [
          { id: "three", label: "3" },
          { id: "two", label: "2" },
          { id: "four", label: "4" },
        ],
        correctId: "three",
        feedback: fb(
          "Once per item.",
          "Three items → three iterations."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What prints?",
        code: "for n in [1, 2]:\n    print(n * 2)",
        choices: [
          { id: "a", label: "2 then 4 on separate lines" },
          { id: "b", label: "1 then 2" },
          { id: "c", label: "Nothing" },
        ],
        correctId: "a",
        feedback: fb(
          "Each n doubled inside the loop.",
          "Body runs per item."
        ),
        difficulty: "hard",
      },
      {
        prompt: "What prints last?",
        code: "items = []\nfor x in items:\n    print(x)\nprint(\"done\")",
        choices: [
          { id: "done", label: "done" },
          { id: "nothing", label: "Nothing — error" },
          { id: "empty", label: "An empty line only" },
        ],
        correctId: "done",
        feedback: fb(
          "Empty list skips loop body; done still prints.",
          "Zero iterations is valid."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Complete the loop header (variable name is s).",
        template: "scores = [8, 9, 10]\n___ s in scores:",
        answers: ["for"],
        placeholder: "…",
        feedback: fb(
          "for s in scores: is the pattern.",
          "Start the line with for."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Print each name on its own line with a for-loop.",
        lines: ["for name in names:", "    print(name)"],
        starterCode: 'names = ["Ada", "Lin"]\nprint(names)\n',
        mustContain: ["for ", " in names", "print(name)"],
        feedback: fb(
          "Loop prints each element.",
          "for name in names: then indented print(name)."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Double each score inside the loop and print the result.",
        lines: ["for s in scores:", "    print(s * 2)"],
        starterCode: "scores = [3, 4]\nprint(scores)\n",
        mustContain: ["for s in scores", "s * 2"],
        feedback: fb(
          "Transform inside the loop body.",
          "Loop and print s * 2 each time."
        ),
      },
    ],
  },

  membership: {
    explains: [
      {
        title: "in checks presence",
        body: `\`value in items\` is \`True\` if the value appears anywhere in the list:

\`\`\`python
tags = ["python", "lists"]
print("python" in tags)   # True
print("java" in tags)     # False
\`\`\`

It compares **values**, not index numbers.`,
      },
      {
        title: "not in",
        body: `\`not in\` is the opposite:

\`\`\`python
allowed = ["sword", "potion"]
print("key" not in allowed)  # True
\`\`\`

Handy before \`append\` when you want to skip duplicates (simple pattern).`,
      },
      {
        title: "Membership vs indexing",
        body: `\`in\` answers "is this value here?" — it does **not** tell you where:

\`\`\`python
items = [10, 20, 30]
print(20 in items)    # True
# print(items[20])    # IndexError — 20 is not an index here
\`\`\`

Use indexing when you know the position; use \`in\` for a yes/no search.`,
      },
    ],
    quizzes: [
      {
        prompt: "What does \"a\" in [\"a\", \"b\"] return?",
        choices: [
          { id: "true", label: "True" },
          { id: "false", label: "False" },
          { id: "zero", label: "0" },
        ],
        correctId: "true",
        feedback: fb(
          "\"a\" is in the list.",
          "in returns a bool."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Difference between in and indexing?",
        choices: [
          { id: "a", label: "in tests value presence; [i] accesses by position" },
          { id: "b", label: "They are the same" },
          { id: "c", label: "in returns the index" },
        ],
        correctId: "a",
        feedback: fb(
          "Search vs access by index.",
          "in does not return an index (use .index() later)."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What does this print?",
        code: 'items = ["sword", "potion"]\nprint("key" not in items)',
        choices: [
          { id: "true", label: "True" },
          { id: "false", label: "False" },
          { id: "key", label: '"key"' },
        ],
        correctId: "true",
        feedback: fb(
          "\"key\" is absent → not in is True.",
          "not in flips the membership result."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Which avoids adding a duplicate (simple pattern)?",
        choices: [
          { id: "a", label: "if item not in bag: bag.append(item)" },
          { id: "b", label: "bag.append(item not in bag)" },
          { id: "c", label: "if item in bag: bag.append(item)" },
        ],
        correctId: "a",
        feedback: fb(
          "Check first, append only if missing.",
          "Guard append with not in."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Test whether \"sword\" is in inventory.",
        template: 'inventory = ["sword", "potion"]\nprint("sword" ___ inventory)',
        answers: ["in"],
        placeholder: "…",
        feedback: fb(
          "value in list → bool.",
          "Operator is in."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Print True only if \"key\" is NOT in the list.",
        lines: ['Use print("key" not in items).'],
        starterCode: 'items = ["sword", "potion"]\nprint("key" in items)\n',
        mustContain: ["not in"],
        feedback: fb(
          "not in checks absence.",
          'print("key" not in items).'
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Append \"coin\" only if it is not already in bag.",
        lines: [
          'if "coin" not in bag:',
          '    bag.append("coin")',
        ],
        starterCode: 'bag = ["coin"]\nbag.append("coin")\nprint(bag)\n',
        mustContain: ["not in", "append"],
        mustNotContain: ['bag.append("coin")\nprint'],
        feedback: fb(
          "Guarded append skips duplicate.",
          "Wrap append in if ... not in ..."
        ),
      },
    ],
  },

  nest_lists_lite: {
    explains: [
      {
        title: "List of lists",
        body: `Each item in a list can itself be a list:

\`\`\`python
matrix = [[1, 2], [3, 4]]
print(matrix)  # [[1, 2], [3, 4]]
\`\`\`

Think rows in a grid or rounds on a scoreboard.`,
      },
      {
        title: "Double indexing",
        body: `First index picks the **row**; second picks the **column** inside that row:

\`\`\`python
board = [["X", "O"], [" ", "X"]]
print(board[0])     # ['X', 'O']
print(board[0][0])  # X
print(board[1][1])  # X
\`\`\``,
      },
      {
        title: "Read-only intro",
        body: `For now, **read** nested data — no need to mutate inner lists:

\`\`\`python
scores_by_round = [[10, 12], [8, 15]]
print(scores_by_round[0][1])  # 12
\`\`\`

Nested lists model tables, tic-tac-toe boards, and multi-level scoreboards.`,
      },
    ],
    quizzes: [
      {
        prompt: "How do you get the first item of the second inner list?",
        code: "m = [[1, 2], [3, 4]]",
        choices: [
          { id: "a", label: "m[1][0]" },
          { id: "b", label: "m[0][1]" },
          { id: "c", label: "m[1, 0]" },
        ],
        correctId: "a",
        feedback: fb(
          "Row 1, column 0 → 3.",
          "Two separate [ ] indexes."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What type is matrix[0]?",
        code: "matrix = [[1, 2], [3, 4]]",
        choices: [
          { id: "list", label: "list" },
          { id: "int", label: "int" },
          { id: "str", label: "str" },
        ],
        correctId: "list",
        feedback: fb(
          "First element is [1, 2] — a list.",
          "Outer list holds inner lists."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What does this print?",
        code: 'board = [["A", "B"], ["C", "D"]]\nprint(board[1][0])',
        choices: [
          { id: "c", label: '"C"' },
          { id: "a", label: '"A"' },
          { id: "d", label: '"D"' },
        ],
        correctId: "c",
        feedback: fb(
          "Second row, first column.",
          "Index [1] then [0]."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Which represents a 2×2 grid of numbers?",
        choices: [
          { id: "a", label: "[[1, 2], [3, 4]]" },
          { id: "b", label: "[1, 2, 3, 4]" },
          { id: "c", label: "[[1, 2, 3, 4]]" },
        ],
        correctId: "a",
        feedback: fb(
          "Two rows, two columns each.",
          "Flat list is not a 2×2 grid."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Use the row index to reach the inner list containing 4.",
        template: "matrix = [[1, 2], [3, 4]]\nprint(matrix[___][1])",
        answers: ["1"],
        placeholder: "…",
        feedback: fb(
          "Row 1, col 1 → matrix[1][1].",
          "Second row is index 1."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Print the top-left cell of the board.",
        lines: ["Use board[0][0]."],
        starterCode: 'board = [["X", "O"], [" ", "X"]]\nprint(board[0])\n',
        mustContain: ["board[0][0]"],
        feedback: fb(
          "Double index to one character.",
          "print(board[0][0])."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Create a nested list for two rounds of scores and print the second score of round 1.",
        lines: [
          "e.g. rounds = [[10, 12], [8, 15]]",
          "print(rounds[0][1])",
        ],
        starterCode: "scores = [10, 12, 8, 15]\nprint(scores[1])\n",
        mustMatchAny: ["\\[\\[.*\\].*\\]", "rounds\\[0\\]\\[1\\]", "scores_by_round\\[0\\]\\[1\\]"],
        feedback: fb(
          "Nested structure + double index.",
          "Use [[..., ...], [..., ...]] and print [0][1]."
        ),
      },
    ],
  },

  list_vs_str: {
    explains: [
      {
        title: "Similar access, different mutability",
        body: `Both lists and strings support \`len\`, indexing, slicing, and \`for\` loops:

\`\`\`python
word = "hi"
items = ["h", "i"]
print(word[0], items[0])  # h h
\`\`\`

But only the **list** lets you change an element in place.`,
      },
      {
        title: "Strings are immutable",
        body: `You **cannot** assign into a string:

\`\`\`python
word = "hi"
# word[0] = "H"  → TypeError
\`\`\`

To change text, build a **new** string (replace, join, f-string) — not in-place char edit.`,
      },
      {
        title: "list(\"abc\") splits text",
        body: `\`list(s)\` turns a string into single-character strings:

\`\`\`python
chars = list("hi")
print(chars)  # ['h', 'i']
chars[0] = "H"
print("".join(chars))  # Hi  (join later — optional preview)
\`\`\`

\`str([1, 2])\` prints a list repr — not the same as joining items.`,
      },
    ],
    quizzes: [
      {
        prompt: "Can you change one character in a string with s[0] = \"X\"?",
        choices: [
          { id: "no", label: "No — strings are immutable" },
          { id: "yes", label: "Yes — same as lists" },
          { id: "sometimes", label: "Only for single-char strings" },
        ],
        correctId: "no",
        feedback: fb(
          "str assignment to index raises TypeError.",
          "Lists mutate; strings do not."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What does list(\"ab\") produce?",
        choices: [
          { id: "a", label: '["a", "b"]' },
          { id: "b", label: '"ab"' },
          { id: "c", label: "['ab']" },
        ],
        correctId: "a",
        feedback: fb(
          "Each character becomes its own str item.",
          "list splits iterables into elements."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Which line is legal?",
        choices: [
          { id: "list", label: 'chars = ["h", "i"]; chars[0] = "H"' },
          { id: "str", label: 'word = "hi"; word[0] = "H"' },
          { id: "both", label: "Both are legal" },
        ],
        correctId: "list",
        feedback: fb(
          "List item assignment OK.",
          "String index assignment fails."
        ),
        difficulty: "hard",
      },
      {
        prompt: "What do lists and strings both support?",
        choices: [
          { id: "a", label: "len, indexing, slicing, for-loops" },
          { id: "b", label: "append and in-place mutation" },
          { id: "c", label: "Only print()" },
        ],
        correctId: "a",
        feedback: fb(
          "Shared sequence operations — different mutability.",
          "append is list-only."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Split the string into a list of characters.",
        template: 'word = "hi"\nchars = ___(word)',
        answers: ["list"],
        placeholder: "…",
        feedback: fb(
          "list(word) → ['h', 'i'].",
          "Constructor is list."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Change the first character in the list (not the string).",
        lines: [
          "chars = list(\"hi\")",
          'chars[0] = "H"',
        ],
        starterCode: 'word = "hi"\nword[0] = "H"\nprint(word)\n',
        mustContain: ["list(", "chars[0]"],
        mustNotContain: ["word[0] ="],
        feedback: fb(
          "Mutate a list copy of chars.",
          "Use list(\"hi\") then chars[0] = \"H\"."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Loop over a string the same way as a list — print each character.",
        lines: ["for ch in word:", "    print(ch)"],
        starterCode: 'word = "Py"\nprint(word)\n',
        mustContain: ["for ch in word", "print(ch)"],
        feedback: fb(
          "Strings are iterable in for-loops.",
          "for ch in word: print(ch)."
        ),
      },
    ],
  },

  common_list_bugs: {
    explains: [
      {
        title: "IndexError out of range",
        body: `Using an index ≥ \`len(items)\` or too negative crashes:

\`\`\`python
items = ["a", "b"]
# print(items[2])   # IndexError
# print(items[-3])  # IndexError (len is 2)
\`\`\`

Valid indices: 0 .. len-1, or -1 .. -len.`,
      },
      {
        title: "Off-by-one with len",
        body: `A common mistake: \`items[len(items)]\` for the "last" item:

\`\`\`python
scores = [10, 20, 30]
# print(scores[len(scores)])  # IndexError — index 3
print(scores[len(scores) - 1])  # 30 ✓
\`\`\`

Remember: **last index = len - 1**.`,
      },
      {
        title: "Empty list has no index 0",
        body: `\`[]\` has length 0 — **no** valid positive index:

\`\`\`python
bag = []
# print(bag[0])  # IndexError
print(len(bag) == 0)  # True — check before indexing
\`\`\`

When unsure, check \`len\` first or use a loop instead of hard-coded indices.`,
      },
    ],
    quizzes: [
      {
        prompt: "Why does items[3] fail on a 3-item list?",
        choices: [
          { id: "a", label: "Valid indices are 0, 1, 2 only" },
          { id: "b", label: "Lists cannot have three items" },
          { id: "c", label: "Index 3 is reserved" },
        ],
        correctId: "a",
        feedback: fb(
          "len 3 → max index 2.",
          "0-based + length boundary."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What is the last valid index when len is 5?",
        choices: [
          { id: "four", label: "4" },
          { id: "five", label: "5" },
          { id: "three", label: "3" },
        ],
        correctId: "four",
        feedback: fb(
          "Indices 0–4 for len 5.",
          "Last = len - 1."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Which line raises IndexError?",
        code: "items = [1, 2, 3]",
        choices: [
          { id: "a", label: "print(items[len(items)])" },
          { id: "b", label: "print(items[-1])" },
          { id: "c", label: "print(items[2])" },
        ],
        correctId: "a",
        feedback: fb(
          "len(items) is 3 — index 3 is out of range.",
          "Use len(items) - 1 or -1."
        ),
        difficulty: "hard",
      },
      {
        prompt: "What happens?",
        code: "bag = []\nprint(bag[0])",
        choices: [
          { id: "err", label: "IndexError" },
          { id: "none", label: "Prints None" },
          { id: "empty", label: "Prints []" },
        ],
        correctId: "err",
        feedback: fb(
          "Empty list — no index 0.",
          "Check len before indexing."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Safe last index using len.",
        template: "items = [1, 2, 3]\nlast = items[len(items) - ___]",
        answers: ["1"],
        placeholder: "…",
        feedback: fb(
          "Subtract 1 from len.",
          "len(items) - 1 is the last index."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix the IndexError when printing the last item.",
        lines: ["Use index 2 or -1, not 3."],
        starterCode: "scores = [8, 9, 10]\nprint(scores[3])\n",
        mustMatchAny: ["scores[2]", "scores[-1]", "len(scores) - 1"],
        mustNotContain: ["scores[3]"],
        feedback: fb(
          "In-range index.",
          "scores[2] or scores[-1]."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Guard against empty: only print items[0] if len(items) > 0.",
        lines: [
          "if len(items) > 0:",
          "    print(items[0])",
        ],
        starterCode: "items = []\nprint(items[0])\n",
        mustContain: ["if len(items)", "items[0]"],
        mustNotContain: ["print(items[0])\n"],
        feedback: fb(
          "Length check prevents crash on [].",
          "Wrap in if len(items) > 0:."
        ),
      },
    ],
  },

  list_patterns: {
    explains: [
      {
        title: "Start with result = []",
        body: `To **build** a new list in a loop, start empty and append:

\`\`\`python
doubled = []
for n in [1, 2, 3]:
    doubled.append(n * 2)
print(doubled)  # [2, 4, 6]
\`\`\`

You do not need to know the final size ahead of time.`,
      },
      {
        title: "Filter lite with if",
        body: `Keep only items that pass a test:

\`\`\`python
high = []
for s in [8, 12, 6, 15]:
    if s >= 10:
        high.append(s)
print(high)  # [12, 15]
\`\`\`

This previews list comprehensions — explicit loops first.`,
      },
      {
        title: "Collect transforms",
        body: `You can append **transformed** values, not just originals:

\`\`\`python
labels = []
for name in ["Ada", "Lin"]:
    labels.append(name + "!")
print(labels)  # ['Ada!', 'Lin!']
\`\`\`

Same pattern works for numbers, strings, or bools from a condition.`,
      },
    ],
    quizzes: [
      {
        prompt: "How do you build a list of only high scores?",
        choices: [
          { id: "a", label: "result = []; loop; if score high: result.append(score)" },
          { id: "b", label: "result = None; print scores" },
          { id: "c", label: "high = scores[10]" },
        ],
        correctId: "a",
        feedback: fb(
          "Empty start + conditional append.",
          "Filter pattern uses loop + if + append."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Why start with result = []?",
        choices: [
          { id: "a", label: "An empty list is ready to grow with append" },
          { id: "b", label: "Python requires None first" },
          { id: "c", label: "To crash if nothing matches" },
        ],
        correctId: "a",
        feedback: fb(
          "Collect pattern begins empty.",
          "Append adds items one by one."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What is evens after this loop?",
        code: "evens = []\nfor n in [1, 2, 3, 4]:\n    if n % 2 == 0:\n        evens.append(n)",
        choices: [
          { id: "a", label: "[2, 4]" },
          { id: "b", label: "[1, 3]" },
          { id: "c", label: "[2, 3, 4]" },
        ],
        correctId: "a",
        feedback: fb(
          "Only even n appended.",
          "Filter keeps 2 and 4."
        ),
        difficulty: "hard",
      },
      {
        prompt: "What is doubled after the loop?",
        code: "doubled = []\nfor n in [1, 2, 3]:\n    doubled.append(n * 2)",
        choices: [
          { id: "a", label: "[2, 4, 6]" },
          { id: "b", label: "[1, 2, 3]" },
          { id: "c", label: "[3, 6, 9]" },
        ],
        correctId: "a",
        feedback: fb(
          "Each n doubled on append.",
          "Transform during collect."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Append n to result inside the filter.",
        template: "result = []\nfor n in [1, 2, 3, 4]:\n    if n % 2 == 0:\n        result.___(n)",
        answers: ["append"],
        placeholder: "…",
        feedback: fb(
          "append adds matching items.",
          "Method is append."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Collect scores >= 10 into winners.",
        lines: [
          "winners = []",
          "for s in scores:",
          "    if s >= 10:",
          "        winners.append(s)",
        ],
        starterCode: "scores = [8, 12, 6, 15]\nprint(scores)\n",
        mustContain: ["winners = []", "if s >= 10", "winners.append"],
        feedback: fb(
          "Filter-lite pattern complete.",
          "Empty list + loop + if + append."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Build doubled with a loop — each source number times 2.",
        lines: [
          "doubled = []",
          "for n in nums:",
          "    doubled.append(n * 2)",
        ],
        starterCode: "nums = [1, 2, 3]\nprint(nums)\n",
        mustContain: ["doubled = []", "append(n * 2)"],
        feedback: fb(
          "Collect transformed values.",
          "Loop and append n * 2."
        ),
      },
    ],
  },
}
