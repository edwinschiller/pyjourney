import type { LessonBlueprint } from "@/lib/lesson-engine/curricula/types"

/**
 * Debugging — read tracebacks, classify common errors, print-debug, fix systematically.
 *
 * Builds on Variables and Data Types where learners already saw NameError and TypeError
 * in passing. This lesson owns the full error taxonomy and a repeatable fix workflow.
 */
export const DEBUGGING_BLUEPRINT: LessonBlueprint = {
  slug: "debugging",
  title: "Debugging",
  objective:
    "Read tracebacks, classify SyntaxError/NameError/TypeError/IndexError/IndentationError, use print-debugging, and fix bugs systematically.",
  rationale:
    "Learners who only copy working code panic at the first red traceback. Teaching error classes and a fix loop (reproduce → read bottom line → change one thing → retest) prevents random edits and helplessness.",
  topics: [
    {
      id: "why_debug",
      title: "Why debugging matters",
      teachingGoal:
        "Bugs are normal; errors are messages, not personal failure.",
      mustCover: [
        "Every programmer hits bugs — fixing them is a core skill.",
        "A traceback is Python telling you where it stopped and why.",
        "Reading the error beats guessing random edits.",
        "Small, testable changes beat rewriting everything.",
      ],
      misconceptions: [
        "A red error means you are bad at coding.",
        "The fix is always at the top line of the traceback.",
        "Changing many lines at once is faster than one change at a time.",
      ],
      examples: [
        "# print(score)  # NameError if score was never assigned",
        "# print(2 + \"3\")  # TypeError — types do not mix",
        "print(\"Program finished\")  # goal: reach here after fixes",
      ],
      checkIdeas: [
        "What is a traceback for?",
        "Is an error message the same as a personal grade?",
      ],
      masteryChecks: 3,
    },
    {
      id: "read_traceback",
      title: "Read the traceback",
      teachingGoal:
        "Start at the bottom line: error type + message; then scan upward for your file and line.",
      mustCover: [
        "The last line names the error class (SyntaxError, NameError, …) and a short message.",
        "Lines above show the call stack — where Python was when it crashed.",
        "Find the frame in *your* file (not library code) and the line number.",
        "The caret (^) or line snippet often points at the exact token.",
      ],
      misconceptions: [
        "Only the first line of the traceback matters.",
        "Library frames are always the bug (ignore your own code).",
        "The message is optional fluff — only the line number counts.",
      ],
      examples: [
        "# Traceback (most recent call last):",
        "#   File \"game.py\", line 4, in <module>",
        "#     print(total)",
        "# NameError: name 'total' is not defined",
        "# → bottom: NameError; your line 4 uses total before defining it",
      ],
      checkIdeas: [
        "Which line of a traceback names the error type?",
        "How do you find your file in the stack?",
      ],
      masteryChecks: 4,
    },
    {
      id: "syntax_errors",
      title: "SyntaxError",
      teachingGoal:
        "Recognize SyntaxError as invalid Python grammar before run completes.",
      mustCover: [
        "SyntaxError: Python cannot parse the file — often a missing quote, colon, or parenthesis.",
        "Common causes: unmatched quotes, print( without ), missing : after if/for/def.",
        "The error line may be slightly *after* the real mistake (missing closing quote).",
        "Fix grammar first — the program will not run until SyntaxError is gone.",
      ],
      misconceptions: [
        "SyntaxError means a variable is wrong.",
        "Adding print fixes SyntaxError.",
        "SyntaxError only happens on the line Python highlights.",
      ],
      examples: [
        'print("Hello"   # SyntaxError — missing closing quote',
        "if x > 0   # SyntaxError — missing colon",
        "print(score   # SyntaxError — missing )",
      ],
      checkIdeas: [
        "What kind of problem is SyntaxError?",
        "What often causes SyntaxError with strings?",
      ],
      masteryChecks: 3,
    },
    {
      id: "name_errors",
      title: "NameError",
      teachingGoal:
        "Fix NameError: name is not defined — typo, wrong case, or used before assignment.",
      mustCover: [
        "NameError: Python looked up a name and could not find it.",
        "Typos: score vs scroe; case: Alter vs alter.",
        "Using a variable before you assign it.",
        "Forgetting quotes on a string does not cause NameError — that is usually SyntaxError or a different issue.",
      ],
      misconceptions: [
        "NameError means the variable type is wrong.",
        "Python auto-creates variables when you print them.",
        "Import errors are always NameError (often ImportError instead).",
      ],
      examples: [
        "print(score)   # NameError if score never assigned",
        "alter = 15\nprint(Alter)  # NameError — case mismatch",
        "total = lives + bonus  # NameError if bonus missing",
      ],
      checkIdeas: [
        "What does NameError usually mean?",
        "Why does print(Alter) fail after alter = 15?",
      ],
      masteryChecks: 4,
    },
    {
      id: "type_errors",
      title: "TypeError",
      teachingGoal:
        "Fix TypeError when an operation does not support the types you passed.",
      mustCover: [
        "TypeError: wrong type for an operation (e.g. str + int, calling a non-callable).",
        "Classic: \"5\" + 1 or \"Age: \" + age when age is int without str().",
        "Also: len(42), indexing a number, using + on None.",
        "Fix: convert types, pick a different operation, or check with type() first.",
      ],
      misconceptions: [
        "TypeError means you misspelled a variable name.",
        "Python always converts strings to numbers automatically.",
        "TypeError and ValueError are the same thing.",
      ],
      examples: [
        'print("2" + 3)        # TypeError',
        'print("Hi " + 16)     # TypeError — need str(16)',
        "print(len(15))        # TypeError — len wants a sequence/str",
      ],
      checkIdeas: [
        "Why does \"2\" + 3 raise TypeError?",
        "How do you fix \"Age: \" + age when age is int?",
      ],
      masteryChecks: 4,
    },
    {
      id: "index_errors",
      title: "IndexError",
      teachingGoal:
        "Fix IndexError when a list/string index is out of range.",
      mustCover: [
        "Valid indices for length n are 0 .. n-1 (negative indices count from the end).",
        "IndexError: index out of range — index too big or empty sequence.",
        "Off-by-one: range(len(items)) vs accessing items[len(items)].",
        "Check len() before assuming an index exists.",
      ],
      misconceptions: [
        "Index  len(list) is valid for the last element.",
        "IndexError is a NameError for list names.",
        "Empty lists never cause IndexError (they do if you index them).",
      ],
      examples: [
        'items = ["a", "b"]\nprint(items[2])   # IndexError',
        "nums = []\nprint(nums[0])           # IndexError",
        "print(items[len(items)])  # IndexError — one past end",
      ],
      checkIdeas: [
        "When is items[2] invalid?",
        "What indices are valid for a list of length 3?",
      ],
      masteryChecks: 3,
    },
    {
      id: "indentation_errors",
      title: "IndentationError",
      teachingGoal:
        "Fix IndentationError and unexpected indent — blocks must align consistently.",
      mustCover: [
        "Python uses indentation for blocks (after if, for, def, etc.).",
        "IndentationError: expected an indented block or inconsistent spaces/tabs.",
        "All lines in the same block need the same indent level.",
        "Mixing tabs and spaces causes hard-to-see errors — pick spaces (4) and stick to it.",
      ],
      misconceptions: [
        "Indentation is only for appearance — Python ignores it.",
        "You can align blocks with random spaces.",
        "IndentationError always means you forgot a colon.",
      ],
      examples: [
        "if score > 0:\nprint(\"win\")  # IndentationError",
        "for i in range(3):\n  print(i)\n print(i)  # inconsistent indent",
      ],
      checkIdeas: [
        "What triggers IndentationError after if ...:?",
        "Why mix tabs and spaces?",
      ],
      masteryChecks: 3,
    },
    {
      id: "logic_bugs",
      title: "Logic bugs",
      teachingGoal:
        "Recognize when code runs but produces the wrong result — no traceback.",
      mustCover: [
        "Logic bug: no crash, but output or behavior is wrong.",
        "Examples: wrong operator (+ vs *), wrong variable, off-by-one, reversed condition.",
        "Compare actual output to what you expected; trace values by hand or with prints.",
        "A green run does not mean the answer is correct.",
      ],
      misconceptions: [
        "If there is no error, the program must be right.",
        "Logic bugs show up as SyntaxError.",
        "Rewriting the whole file is the first step.",
      ],
      examples: [
        "total = price + price  # forgot tax — runs, wrong total",
        "print(2 + 3 * 4)  # expected 20? precedence gives 14",
        "if score = 10:  # SyntaxError — but score == 0 typo is logic bug",
      ],
      checkIdeas: [
        "What is a logic bug?",
        "How do you notice a logic bug if Python does not crash?",
      ],
      masteryChecks: 4,
    },
    {
      id: "print_debug",
      title: "Print debugging",
      teachingGoal:
        "Insert strategic print() calls to see values and flow; remove or comment them after.",
      mustCover: [
        "Print variables before and after the suspicious line.",
        "Label prints: print(\"total=\", total) so output is readable.",
        "Print inside loops sparingly to see iteration values.",
        "Remove debug prints once fixed — or use comments # DEBUG.",
      ],
      misconceptions: [
        "More prints everywhere always helps (noise hides the signal).",
        "print debugging is cheating / unprofessional at learner level.",
        "You must use a debugger before print works.",
      ],
      examples: [
        'print("DEBUG lives=", lives)',
        "print(type(raw), raw)  # inspect type + value",
        "for i in range(3):\n    print(\"i=\", i)",
      ],
      checkIdeas: [
        "Why label a debug print?",
        "What should you print when a sum looks wrong?",
      ],
      masteryChecks: 3,
    },
    {
      id: "bisect_fix",
      title: "Change one thing, retest",
      teachingGoal:
        "Bisect: make one small change, run again, observe — avoid shotgun edits.",
      mustCover: [
        "After reading the error, form one hypothesis.",
        "Change one thing (one line or one variable), then rerun.",
        "If still broken, read the *new* traceback — the error may have moved.",
        "Undo or note what failed so you do not repeat the same guess.",
      ],
      misconceptions: [
        "Fix ten things at once to save time.",
        "If the first fix fails, random edits are fine.",
        "Retesting is optional if you are confident.",
      ],
      examples: [
        "# Hypothesis: total undefined → add total = 0 before use",
        "# Hypothesis: str+int → try str(age) once, rerun",
        "# Keep a short comment: # tried str(age) — fixed TypeError",
      ],
      checkIdeas: [
        "Why change only one thing at a time?",
        "What do you do after a fix attempt?",
      ],
      masteryChecks: 3,
    },
    {
      id: "reproduce_minimal",
      title: "Shrink the failing case",
      teachingGoal:
        "Reproduce the bug in the smallest snippet possible to isolate cause.",
      mustCover: [
        "Copy the failing lines into a tiny script or comment out unrelated code.",
        "Remove features until the error still happens with less code.",
        "Minimal example makes asking for help and searching docs easier.",
        "Once fixed in minimal code, apply the same fix back to the full program.",
      ],
      misconceptions: [
        "You must always debug the entire 200-line file.",
        "Commenting out code changes the bug magically without thinking.",
        "Minimal reproduction is only for experts.",
      ],
      examples: [
        "# Full game crashes → test only: print(items[3]) with same list",
        "# Comment out unrelated prints and input while isolating",
      ],
      checkIdeas: [
        "Why make a minimal failing example?",
        "What do you do after fixing the small snippet?",
      ],
      masteryChecks: 3,
    },
    {
      id: "debug_habits",
      title: "Debug checklist",
      teachingGoal:
        "Use a habit loop before asking for help: reproduce, read bottom line, classify, one fix, retest.",
      mustCover: [
        "1) Reproduce reliably. 2) Read last traceback line. 3) Classify error type.",
        "4) Find your line in the stack. 5) One hypothesis → one change → rerun.",
        "6) If stuck: minimal example, debug prints, note what you tried.",
        "When asking for help: error text, line of code, what you expected vs got.",
      ],
      misconceptions: [
        "Ask immediately without reading the message.",
        "Paste only \"it doesn't work\" with no error text.",
        "Skip retesting after a fix.",
      ],
      examples: [
        "# Checklist: error type? my line? one fix? retest?",
        "# Help template: NameError on line 7, expected total to exist",
      ],
      checkIdeas: [
        "What should you include when asking for help?",
        "What is step one on the debug checklist?",
      ],
      masteryChecks: 4,
    },
  ],
  apply: {
    title: "Fix the broken script",
    brief:
      "A small score-report script is full of planted bugs. Read each traceback, classify the error, fix one issue at a time, and end with a program that runs and prints sensible output (player name, score total, and a short summary line) — no crashes.",
    criteria: [
      "Fixes all SyntaxError issues (quotes, parentheses, colons as needed)",
      "Fixes NameError issues (typos, wrong case, missing assignments)",
      "Fixes at least one TypeError (e.g. str + int) with conversion or f-strings",
      "Fixes IndexError or off-by-one list access if present in the starter",
      "Fixes IndentationError if present (consistent block indent)",
      "Corrects at least one logic bug so numeric output matches intent (not just crash-free)",
      "Uses print debugging or comments showing you read tracebacks while fixing",
      "Final script runs without errors and prints name, score-related values, and a summary",
    ],
    hints: [
      "Start at the bottom of the traceback — what error class is it?",
      "SyntaxError: look for missing \", ), or : before worrying about logic.",
      "NameError: search for the name in the file — was it spelled differently elsewhere?",
      "TypeError with + often means convert with str() or use print(..., x) / an f-string.",
      "IndexError: print len(your_list) and check the index against 0 .. len-1.",
      "Change one line, run again — the next error tells you what to fix next.",
    ],
    evaluationGuide:
      "Pass if the submitted script (1) runs without SyntaxError, NameError, TypeError, IndexError, or IndentationError, (2) clearly had multiple bug classes in the starter that the learner addressed — expect fixes for undefined names (e.g. scroe→score, missing bonus/total init), str+int concat, bad list index, bad indent under if/for, and at least one logic fix such as wrong operator or wrong variable in a sum, (3) prints player/name and score-related numbers that are internally consistent (e.g. total = base + bonus, not nonsense), (4) shows evidence of systematic fixing (debug prints, commented fixes, or sensible structure) rather than a unrelated rewrite. Do not require specific variable names beyond what the starter implies. Partial credit is fail — must run clean. Do not paste a full model solution in feedback.",
  },
}
