import type { LessonBlueprint } from "@/lib/lesson-engine/curricula/types"

/**
 * Conditions — branch with if / elif / else after Variables + Data Types.
 *
 * Owns: comparisons, boolean logic, truthiness, nested vs flat branches,
 * type pitfalls in comparisons, and common decision patterns (grade bands).
 */
export const CONDITIONS_BLUEPRINT: LessonBlueprint = {
  slug: "conditions",
  title: "Conditions",
  objective:
    "Branch with if / elif / else, comparisons, boolean logic (and/or/not), truthiness, nested vs flat branches.",
  rationale:
    "Programs must react to different situations. Learners who confuse = with == or skip indentation write branches that never run or always run. This lesson builds reliable decision-making before loops.",
  topics: [
    {
      id: "why_branch",
      title: "Why branch?",
      teachingGoal:
        "Explain why programs need decisions instead of one straight line.",
      mustCover: [
        "Not every run of the program should do the same thing.",
        "Decisions let code react to data: scores, passwords, inventory.",
        "Branching is the first step from 'script' to 'interactive program'.",
      ],
      misconceptions: [
        "You can always solve problems with one print() chain.",
        "Conditions are only for games — not everyday apps.",
      ],
      examples: [
        "if score >= 60:\n    print('Pass')",
        "if logged_in:\n    print('Welcome back')",
        "if temperature > 30:\n    print('Hot day')",
      ],
      checkIdeas: [
        "Give a real-life situation that needs a decision.",
        "Why can't one fixed print() handle every user?",
      ],
      masteryChecks: 3,
    },
    {
      id: "comparisons",
      title: "Comparisons",
      teachingGoal:
        "Use == != < > <= >=; know that = assigns and == compares.",
      mustCover: [
        "== checks equality; != checks inequality.",
        "< > <= >= compare ordering (numbers and strings lexically).",
        "Single = assigns; double == compares — mixing them is a classic bug.",
        "Comparisons produce True or False (bool).",
      ],
      misconceptions: [
        "Using = inside if when you mean ==.",
        "Thinking == works like math 'equals' for every type without surprises.",
      ],
      examples: [
        "print(5 == 5)   # True",
        "print(5 != 3)   # True",
        "print(10 > 7)   # True",
        "print(3 <= 3)   # True",
      ],
      checkIdeas: [
        "Which operator compares?",
        "What is the difference between x = 5 and x == 5?",
      ],
      masteryChecks: 4,
    },
    {
      id: "if_basics",
      title: "if basics",
      teachingGoal:
        "Write if condition: with an indented body that runs only when True.",
      mustCover: [
        "if condition: ends with a colon.",
        "The body is indented (usually 4 spaces).",
        "If the condition is False, the body is skipped.",
        "The condition is any expression that evaluates to True or False.",
      ],
      misconceptions: [
        "Forgetting the colon after the condition.",
        "Body not indented — IndentationError or wrong scope.",
      ],
      examples: [
        "age = 16\nif age >= 18:\n    print('Adult')",
        "score = 90\nif score >= 60:\n    print('Pass')",
        "ready = True\nif ready:\n    print('Go')",
      ],
      checkIdeas: [
        "What happens when the condition is False?",
        "Where does the colon go?",
      ],
      masteryChecks: 4,
    },
    {
      id: "else_branch",
      title: "else",
      teachingGoal:
        "Add else: for the path when the if condition is False.",
      mustCover: [
        "else: attaches to the nearest if — no condition on else.",
        "Exactly one of if-body or else-body runs (not both).",
        "else body is indented like the if body.",
        "Use when there are only two outcomes.",
      ],
      misconceptions: [
        "Writing else if in Python (that is elif, not else).",
        "Putting a condition on else: else if x > 5.",
      ],
      examples: [
        "if age >= 18:\n    print('Adult')\nelse:\n    print('Minor')",
        "if score >= 60:\n    print('Pass')\nelse:\n    print('Fail')",
      ],
      checkIdeas: [
        "When does the else block run?",
        "Can if and else both run in one execution?",
      ],
      masteryChecks: 3,
    },
    {
      id: "elif_chain",
      title: "elif chains",
      teachingGoal:
        "Chain elif for three or more mutually exclusive cases.",
      mustCover: [
        "elif means 'else if' — checked only if previous branches failed.",
        "First True branch wins; later branches are skipped.",
        "Optional final else catches everything left.",
        "Order matters when ranges overlap.",
      ],
      misconceptions: [
        "Thinking every elif runs even after one matched.",
        "Using separate if blocks when elif was meant (multiple branches firing).",
      ],
      examples: [
        "if score >= 90:\n    print('A')\nelif score >= 80:\n    print('B')\nelif score >= 70:\n    print('C')\nelse:\n    print('Below C')",
        "if temp < 0:\n    print('Freezing')\nelif temp < 15:\n    print('Cold')\nelse:\n    print('OK')",
      ],
      checkIdeas: [
        "What happens after the first True elif?",
        "Why order score >= 90 before score >= 80?",
      ],
      masteryChecks: 4,
    },
    {
      id: "bool_logic",
      title: "and / or / not",
      teachingGoal:
        "Combine or invert conditions with and, or, and not.",
      mustCover: [
        "and — both sides must be True.",
        "or — at least one side True.",
        "not flips True ↔ False.",
        "Use parentheses when mixing and/or for readability.",
      ],
      misconceptions: [
        "Using & or | instead of and/or (different operators).",
        "Thinking or means XOR (exclusive) — in Python or is inclusive.",
      ],
      examples: [
        "if age >= 13 and age <= 19:\n    print('Teen')",
        "if day == 'Sat' or day == 'Sun':\n    print('Weekend')",
        "if not logged_in:\n    print('Please sign in')",
      ],
      checkIdeas: [
        "When is (a and b) True?",
        "What does not False evaluate to?",
      ],
      masteryChecks: 4,
    },
    {
      id: "truthiness",
      title: "Truthiness",
      teachingGoal:
        "Know that empty/zero/None values are falsey; most others truthy.",
      mustCover: [
        "False, None, 0, 0.0, \"\", [], {} are falsey in if checks.",
        "Non-empty strings and non-zero numbers are truthy.",
        "if name: runs when name is non-empty (common pattern).",
        "Explicit comparison (name != \"\") is clearer for beginners sometimes.",
      ],
      misconceptions: [
        "Thinking 0 and False are unrelated in conditions.",
        "Believing \"0\" is falsey — it is a non-empty string (truthy).",
      ],
      examples: [
        "name = ''\nif name:\n    print('Hi')  # skipped",
        "count = 0\nif count:\n    print('Has items')  # skipped",
        'text = "0"\nif text:\n    print("Truthy")  # runs',
      ],
      checkIdeas: [
        "Is \"\" truthy or falsey?",
        "Is \"0\" truthy or falsey?",
      ],
      masteryChecks: 3,
    },
    {
      id: "nest_vs_flat",
      title: "Nested vs flat",
      teachingGoal:
        "Choose nested if inside a branch vs flat elif chains.",
      mustCover: [
        "Nested if: decision inside another branch — good when inner check only matters in outer case.",
        "Flat elif: one ladder of mutually exclusive top-level cases.",
        "Deep nesting hurts readability — prefer elif when cases are peers.",
        "Same indentation level = same block; deeper indent = nested body.",
      ],
      misconceptions: [
        "Nesting when elif would be clearer and shorter.",
        "Flat elif when inner logic only applies after one outer condition.",
      ],
      examples: [
        "# nested\nif role == 'admin':\n    if logged_in:\n        print('Admin panel')",
        "# flat\nif score >= 90:\n    grade = 'A'\nelif score >= 80:\n    grade = 'B'",
      ],
      checkIdeas: [
        "When is nesting appropriate?",
        "What is wrong with 5 levels of nested if?",
      ],
      masteryChecks: 3,
    },
    {
      id: "compare_types",
      title: "Comparing types",
      teachingGoal:
        "Avoid comparing ints to digit-strings; cast or compare like types.",
      mustCover: [
        "15 == \"15\" is False — different types.",
        "Compare numbers to numbers: int(input(...)) or int(text).",
        "Sorting strings uses lexicographic order: \"10\" < \"2\" can surprise.",
        "Use type() or cast when comparisons feel wrong.",
      ],
      misconceptions: [
        "if age == \"16\": when age is int 16.",
        "Assuming == coerces types automatically.",
      ],
      examples: [
        "print(15 == 15)    # True",
        'print(15 == "15")  # False',
        'print("10" > "2")  # True (string compare, not numeric)',
      ],
      checkIdeas: [
        "Is 5 == \"5\" True?",
        "Why might score == \"100\" fail when score is 100?",
      ],
      masteryChecks: 4,
    },
    {
      id: "multi_conditions",
      title: "Combining checks",
      teachingGoal:
        "Write readable multi-part conditions without spaghetti.",
      mustCover: [
        "Combine related checks with and / or on one line when clear.",
        "Split into nested if when the second check only applies sometimes.",
        "Name intermediate bools for clarity: in_range = lo <= x <= hi.",
        "Chained comparisons work: 0 <= age <= 120.",
      ],
      misconceptions: [
        "Repeating the same outer if for many inner checks instead of and.",
        "Giant one-liner that nobody can read or debug.",
      ],
      examples: [
        "if 0 <= age <= 120:\n    print('Valid age')",
        "valid = name != '' and age >= 0\nif valid:\n    print('OK')",
        "if (day == 'Sat' or day == 'Sun') and not holiday:\n    print('Weekend plan')",
      ],
      checkIdeas: [
        "Rewrite two nested ifs as one and when appropriate.",
        "What does 0 <= x <= 10 mean?",
      ],
      masteryChecks: 4,
    },
    {
      id: "common_bugs",
      title: "Common bugs",
      teachingGoal:
        "Spot indentation errors, = vs ==, and True/False spelling mistakes.",
      mustCover: [
        "IndentationError / logic bugs from mixed tabs and spaces or missing indent.",
        "if x = 5: is SyntaxError — assignment in condition.",
        "true/false lowercase are NameErrors; use True/False.",
        ":= walrus is advanced — do not confuse with = in beginner drills.",
      ],
      misconceptions: [
        "Copy-paste broke indentation but 'looks fine'.",
        "Writing if flag == True: when if flag: suffices (style, not always wrong).",
      ],
      examples: [
        "# Bug: if score = 60:\nif score == 60:\n    print('Exact')",
        "# Bug: if ready == true:\nif ready == True:\n    print('Go')",
      ],
      checkIdeas: [
        "Why is if x = 3 illegal?",
        "What error does true give?",
      ],
      masteryChecks: 3,
    },
    {
      id: "decision_patterns",
      title: "Decision patterns",
      teachingGoal:
        "Model grade bands and range checks with ordered elif ladders.",
      mustCover: [
        "Range checks: test higher thresholds first (>= 90 before >= 80).",
        "Boundary values: decide inclusive (>=) vs exclusive (>).",
        "Default else for 'none of the above'.",
        "Assign a result variable inside branches, then print once at end.",
      ],
      misconceptions: [
        "Checking >= 80 before >= 90 — everyone gets B or lower.",
        "Off-by-one at boundaries (79 vs 80).",
      ],
      examples: [
        "if score >= 90:\n    band = 'A'\nelif score >= 80:\n    band = 'B'\nelif score >= 70:\n    band = 'C'\nelse:\n    band = 'F'\nprint(band)",
        "if tickets <= 0:\n    print('Sold out')\nelif tickets < 5:\n    print('Almost gone')\nelse:\n    print('Available')",
      ],
      checkIdeas: [
        "What grade for score 85 with standard ladder?",
        "Why test >= 90 first?",
      ],
      masteryChecks: 4,
    },
  ],
  apply: {
    title: "Grade band",
    brief:
      "Write a grade band program: given an integer score (0–100), use if / elif / else to assign a letter band (A ≥ 90, B ≥ 80, C ≥ 70, D ≥ 60, else F), store the band in a variable, and print a clear message with both score and band — no syntax errors.",
    criteria: [
      "Uses a score variable (int, 0–100)",
      "Uses if / elif / else (or equivalent ladder) for at least four bands",
      "Tests thresholds in sensible order (higher grades first)",
      "Stores the letter in a variable and prints score and band",
      "Runs without errors",
    ],
    hints: [
      "Start with if score >= 90: band = \"A\".",
      "Each elif checks the next lower threshold.",
      "Use else: for F when score < 60.",
      "print(f\"Score {score}: band {band}\") keeps output readable.",
      "Simulate input with score = 85 if you are not using input().",
    ],
    evaluationGuide:
      "Pass if (1) a numeric score variable exists, (2) an if/elif/else ladder assigns a letter band with at least A/B/C/D/F style thresholds where higher bands are checked first, (3) a variable holds the band string, (4) output mentions both score and band, (5) code runs without SyntaxError/IndentationError. Accept minor threshold wording differences if ordering is correct. Do not require input(). Do not require functions. Partial ladders with only two branches fail.",
  },
}
