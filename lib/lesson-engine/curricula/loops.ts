import type { LessonBlueprint } from "@/lib/lesson-engine/curricula/types"

/**
 * Loops — repeat with for/while, range, accumulate, break/continue at intro level.
 *
 * Builds on variables and data types. Learners should already know print,
 * assignment, and basic int/str before this lesson.
 */
export const LOOPS_BLUEPRINT: LessonBlueprint = {
  slug: "loops",
  title: "Loops",
  objective:
    "Repeat with for and while, use range, accumulate totals, handle break/continue at intro level, and avoid infinite loops.",
  rationale:
    "Copy-pasting print lines does not scale. Loops are the first real control-flow power tool — but wrong conditions or missing updates trap beginners in infinite loops or off-by-one bugs.",
  topics: [
    {
      id: "why_loops",
      title: "Why loops?",
      teachingGoal:
        "Recognize when repetition is needed instead of writing the same line many times.",
      mustCover: [
        "Some tasks repeat the same action many times (count, print a list, add up scores).",
        "Copy-pasting the same line is fragile — change the count and you rewrite everything.",
        "A loop runs a block of code repeatedly until a condition or sequence is done.",
      ],
      misconceptions: [
        "You must always unroll every repetition by hand.",
        "Loops are only for printing numbers.",
      ],
      examples: [
        "# Without a loop — tedious",
        'print("Hi")',
        'print("Hi")',
        'print("Hi")',
        "# With a loop — one pattern, many runs",
        "for _ in range(3):",
        '    print("Hi")',
      ],
      checkIdeas: [
        "When is a loop better than copy-paste?",
        "What problem does repetition solve?",
      ],
      masteryChecks: 3,
    },
    {
      id: "while_basics",
      title: "while — repeat while true",
      teachingGoal:
        "Write a while loop that runs its body while a condition stays True.",
      mustCover: [
        "while condition: runs the indented block while condition is True.",
        "The condition is checked before each iteration.",
        "When the condition becomes False, the loop stops.",
        "The body must eventually make the condition False (or you get an infinite loop).",
      ],
      misconceptions: [
        "while runs exactly once like if.",
        "The condition is checked only at the end.",
        "while True: is the same as while 1: (both always true — but still need a way out).",
      ],
      examples: [
        "n = 3",
        "while n > 0:",
        "    print(n)",
        "    n = n - 1",
        "print('done')",
      ],
      checkIdeas: [
        "When does a while loop stop?",
        "What prints if n starts at 3 and decreases each time?",
      ],
      masteryChecks: 4,
    },
    {
      id: "while_counter",
      title: "while with a counter",
      teachingGoal:
        "Use a counter variable that you update inside the loop body.",
      mustCover: [
        "Start with an initial value (e.g. i = 0).",
        "Check the counter in the while condition (e.g. while i < 5).",
        "Update the counter inside the body (e.g. i = i + 1).",
        "This pattern counts 0, 1, 2, … up to but not including the limit.",
      ],
      misconceptions: [
        "The counter updates automatically.",
        "while i < 5 runs exactly 5 times starting at i = 1 without setup.",
        "i = i + 1 and i += 1 are different concepts (same effect here).",
      ],
      examples: [
        "i = 0",
        "while i < 5:",
        "    print(i)",
        "    i = i + 1",
        "# prints 0, 1, 2, 3, 4",
      ],
      checkIdeas: [
        "What values does i take if we start at 0 and stop when i < 5?",
        "Where must i = i + 1 live — inside or outside the loop?",
      ],
      masteryChecks: 4,
    },
    {
      id: "infinite_risk",
      title: "Infinite loop risk",
      teachingGoal:
        "Spot missing updates and wrong conditions that never become False.",
      mustCover: [
        "If the condition never becomes False, the loop runs forever (infinite loop).",
        "Common bug: forget to update the counter inside the body.",
        "Common bug: wrong comparison (while i > 0 when i starts negative and grows).",
        "Fix: ensure each pass moves toward making the condition False.",
      ],
      misconceptions: [
        "Python stops a while loop after 100 runs automatically.",
        "An infinite loop is harmless in practice.",
        "Changing the condition variable outside the loop is enough — no update inside needed.",
      ],
      examples: [
        "# BUG — n never changes",
        "n = 3",
        "while n > 0:",
        "    print(n)  # forgot n = n - 1",
        "",
        "# FIXED",
        "n = 3",
        "while n > 0:",
        "    print(n)",
        "    n = n - 1",
      ],
      checkIdeas: [
        "Why does while n > 0 with no n update hang?",
        "How do you fix a loop that never stops?",
      ],
      masteryChecks: 4,
    },
    {
      id: "for_in_sequence",
      title: "for x in sequence",
      teachingGoal:
        "Iterate over a string or list with for item in sequence.",
      mustCover: [
        "for x in seq: assigns x to each item in seq, one at a time.",
        "Works on strings character by character: for ch in \"hi\".",
        "Works on lists: for item in [1, 2, 3].",
        "The loop variable (x) changes each iteration — you do not manually increment for simple walks.",
      ],
      misconceptions: [
        "for only works with range.",
        "for x in \"hi\" gives you \"hi\" once, not h then i.",
        "You must write while to loop over a list.",
      ],
      examples: [
        'for ch in "hi":',
        "    print(ch)",
        "# h, then i",
        "",
        "for n in [10, 20, 30]:",
        "    print(n)",
      ],
      checkIdeas: [
        "What does for ch in \"Ada\" print?",
        "When is for better than while for walking a sequence?",
      ],
      masteryChecks: 3,
    },
    {
      id: "range_basics",
      title: "range() — counted for loops",
      teachingGoal:
        "Use range(n), range(a, b), and range(a, b, step) to repeat a fixed number of times.",
      mustCover: [
        "range(n) produces 0, 1, …, n-1 (n numbers, stops before n).",
        "range(a, b) starts at a, stops before b.",
        "range(a, b, step) steps by step (can count down with negative step).",
        "for i in range(5): is the idiomatic counted loop.",
      ],
      misconceptions: [
        "range(5) includes 5.",
        "range(1, 5) includes 5.",
        "range is a list (in Python 3 it is a lazy range object — for our level: think 'numbers to loop over').",
      ],
      examples: [
        "for i in range(5):",
        "    print(i)  # 0..4",
        "",
        "for i in range(2, 6):",
        "    print(i)  # 2, 3, 4, 5",
        "",
        "for i in range(10, 0, -2):",
        "    print(i)  # 10, 8, 6, 4, 2",
      ],
      checkIdeas: [
        "What numbers does range(3) produce?",
        "What is the last value in range(2, 6)?",
        "How do you count down with range?",
      ],
      masteryChecks: 4,
    },
    {
      id: "accumulate",
      title: "Accumulate in a loop",
      teachingGoal:
        "Use a running total or count variable updated each iteration.",
      mustCover: [
        "Initialize before the loop: total = 0 or count = 0.",
        "Inside the loop, update: total = total + value (or total += value).",
        "After the loop, total holds the sum of all values processed.",
        "Same pattern for counting: count += 1 when something happens.",
      ],
      misconceptions: [
        "You can sum without initializing total.",
        "total = total + x creates a new loop each time (confusion with assignment).",
        "print inside the loop is the same as accumulating.",
      ],
      examples: [
        "total = 0",
        "for n in [1, 2, 3, 4]:",
        "    total = total + n",
        "print(total)  # 10",
        "",
        "count = 0",
        "for _ in range(5):",
        "    count = count + 1",
        "print(count)  # 5",
      ],
      checkIdeas: [
        "Why start total at 0 before summing?",
        "What is total after adding 1, 2, 3 in a loop?",
      ],
      masteryChecks: 4,
    },
    {
      id: "nest_loops_intro",
      title: "Nested loops (intro)",
      teachingGoal:
        "Run an inner loop completely for each step of an outer loop.",
      mustCover: [
        "A loop inside another loop: outer runs once, inner runs fully, outer again, inner fully…",
        "Classic tiny example: multiplication table row — for i in range(1, 4): for j in range(1, 4): print(i * j).",
        "Inner loop variable is separate from outer (different names help readability).",
        "Total iterations = outer count × inner count.",
      ],
      misconceptions: [
        "Inner and outer loops must use the same variable name.",
        "Nested loops run interleaved one step at a time (they do not — inner completes each outer step).",
        "Two loops always mean infinite loop.",
      ],
      examples: [
        "for i in range(1, 4):",
        "    for j in range(1, 4):",
        "        print(i, j, i * j)",
        "",
        "# 3 outer × 3 inner = 9 prints",
      ],
      checkIdeas: [
        "How many times does the inner body run if outer is 3 and inner is 3?",
        "What does a nested loop print for a tiny table?",
      ],
      masteryChecks: 3,
    },
    {
      id: "break_continue",
      title: "break and continue",
      teachingGoal:
        "Use break to exit a loop early and continue to skip the rest of one iteration.",
      mustCover: [
        "break stops the entire loop immediately.",
        "continue skips to the next iteration (rest of body skipped for this round).",
        "Use sparingly at intro level — prefer clear conditions when possible.",
        "break/continue only affect the innermost loop they sit in.",
      ],
      misconceptions: [
        "continue exits the whole loop (that is break).",
        "break stops the whole program.",
        "You need break in every loop.",
      ],
      examples: [
        "for n in range(10):",
        "    if n == 5:",
        "        break",
        "    print(n)  # 0..4",
        "",
        "for n in range(5):",
        "    if n == 2:",
        "        continue",
        "    print(n)  # 0, 1, 3, 4",
      ],
      checkIdeas: [
        "What prints with break at n == 3?",
        "What is the difference between break and continue?",
      ],
      masteryChecks: 3,
    },
    {
      id: "loop_vs_repeat_code",
      title: "Loops vs copy-paste",
      teachingGoal:
        "Choose a loop when count or data length may change.",
      mustCover: [
        "Three print lines work for three items; fifty items need a loop.",
        "One loop + range(len(items)) or for item in items scales.",
        "Changing the limit means editing one number, not many lines.",
        "Loops reduce bugs when the repeat count changes.",
      ],
      misconceptions: [
        "Copy-paste is fine for any size program.",
        "Loops are harder to read than repeated lines (usually the opposite at scale).",
      ],
      examples: [
        "# Brittle",
        "print(scores[0])",
        "print(scores[1])",
        "print(scores[2])",
        "",
        "# Flexible",
        "for s in scores:",
        "    print(s)",
      ],
      checkIdeas: [
        "Why is for s in scores better than three print lines?",
        "What changes if scores grows from 3 to 30 items?",
      ],
      masteryChecks: 3,
    },
    {
      id: "off_by_one",
      title: "Off-by-one with range",
      teachingGoal:
        "Remember range stops before the end; while < n runs n times from 0.",
      mustCover: [
        "range(5) → 0,1,2,3,4 — five numbers, last is 4 not 5.",
        "range(1, 6) → 1..5 if you want 1 through 5.",
        "while i < 5 with i starting at 0 runs 5 times; while i <= 5 runs 6 times.",
        "Think: how many iterations? Count start, stop (exclusive), step.",
      ],
      misconceptions: [
        "range(n) includes n.",
        "while i <= 5 and while i < 5 are the same.",
        "The last index of range(5) is 5.",
      ],
      examples: [
        "print(list(range(5)))     # [0, 1, 2, 3, 4]",
        "print(list(range(1, 6)))  # [1, 2, 3, 4, 5]",
        "",
        "i = 0",
        "while i < 5:  # 5 times",
        "    i += 1",
      ],
      checkIdeas: [
        "Does range(5) include 5?",
        "How many times does while i < 3 run starting at i = 0?",
      ],
      masteryChecks: 4,
    },
    {
      id: "loop_patterns",
      title: "Common loop patterns",
      teachingGoal:
        "Recognize countdown, collect-and-print, and repeat-N patterns.",
      mustCover: [
        "Countdown: while n > 0: print(n); n -= 1 or for i in range(n, 0, -1).",
        "Collect prints: build a line in a loop or print each item on its own line.",
        "Repeat N times: for _ in range(N): (underscore when you do not need the index).",
        "Combine patterns: accumulate + print at the end vs print each step.",
      ],
      misconceptions: [
        "You must always use the loop variable in the body.",
        "Countdown requires while — for with negative step works too.",
        "_ is a special illegal name (it is a valid throwaway name).",
      ],
      examples: [
        "# Repeat 4 times — ignore index",
        "for _ in range(4):",
        '    print("go")',
        "",
        "# Countdown",
        "for n in range(3, 0, -1):",
        "    print(n)",
        'print("lift off")',
      ],
      checkIdeas: [
        "When do you use _ in for _ in range(n)?",
        "How do you print a countdown from 3 to 1?",
      ],
      masteryChecks: 3,
    },
  ],
  apply: {
    title: "Score accumulator",
    brief:
      "Build a score accumulator: loop over a list of point values, add them to a running total, print each round's subtotal, then print the final total. Use at least one for loop with range or for-in, and avoid infinite loops.",
    criteria: [
      "Defines a list of numeric scores (at least three values)",
      "Initializes a total (or accumulator) before the loop",
      "Uses a for loop to process each score or index",
      "Updates the running total inside the loop",
      "Prints meaningful output (per-round and/or final total)",
      "Runs without errors and does not use an infinite while",
    ],
    hints: [
      "Start with total = 0 before the loop.",
      "for score in scores: is simpler than indexing.",
      "total = total + score adds each value.",
      "Print total after the loop for the final sum.",
      "If you use while, make sure the counter moves toward the stop condition.",
    ],
    evaluationGuide:
      "Pass if the learner (1) has a list of at least three numeric scores, (2) initializes an accumulator before looping, (3) uses for (preferred) or a safe while with counter update, (4) adds each score to the total inside the loop, (5) prints at least once (subtotals or final total), (6) runs without obvious infinite-loop risk (while must update its counter). Do not require specific variable names. A pattern-print exercise using range is acceptable if it clearly accumulates or repeats with a counter — but prefer score summation when present.",
  },
}
