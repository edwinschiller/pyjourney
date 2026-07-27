import type { LessonBlueprint } from "@/lib/pyjo/curricula/types"

/**
 * Data types — deep dive after Variables.
 *
 * Variables already introduced str / int / float / bool recognition and print
 * combining. This lesson owns: type(), None, casting, arithmetic, precedence,
 * mixing types safely, and the fact that input() always returns str.
 *
 * Inspired by legacy module-01: variablen-datentypen, zahlen-arithmetik,
 * benutzereingabe, plus strings-vertieft type-adjacent skills (len / digit strings).
 */
export const DATA_TYPES_BLUEPRINT: LessonBlueprint = {
  slug: "data_types",
  title: "Data types",
  objective:
    "Inspect types with type(), use None, convert with int/float/str/bool, do arithmetic (+ - * / // % **), respect precedence, and convert input strings before math.",
  rationale:
    "Learners who only match literals still smash into TypeError when they mix \"10\" + 1 or forget int(input()). This lesson builds durable type fluency before conditions.",
  topics: [
    {
      id: "why_types",
      title: "Why types matter",
      teachingGoal:
        "Every value has a type; operations depend on that type.",
      mustCover: [
        "Values are not just 'data' — they have a type that decides what you can do.",
        "Adding numbers and joining text look similar but are different operations.",
        "Wrong type → TypeError or surprising results.",
      ],
      misconceptions: [
        "All values behave the same in +, -, and print.",
        "If it looks like a number on screen, it is an int.",
      ],
      examples: [
        "print(2 + 3)      # 5  (numbers)",
        'print("2" + "3")  # "23" (text join)',
        '# print("2" + 3)  → TypeError',
      ],
      checkIdeas: [
        "What is the difference between 2 + 3 and \"2\" + \"3\"?",
        "Why might \"2\" + 3 crash?",
      ],
      masteryChecks: 3,
    },
    {
      id: "type_function",
      title: "Ask with type()",
      teachingGoal: "Use type(value) to see what Python thinks a value is.",
      mustCover: [
        "type(x) returns the type of x (e.g. <class 'int'>).",
        "Useful when debugging: check before you convert or compute.",
        "type() works on literals and on variables.",
      ],
      misconceptions: [
        "type() changes the value.",
        "print(type(x)) prints the word type.",
      ],
      examples: [
        "print(type(15))       # <class 'int'>",
        'print(type("15"))     # <class \'str\'>',
        "print(type(1.5))      # <class 'float'>",
        "print(type(True))     # <class 'bool'>",
      ],
      checkIdeas: [
        "What does type(15) report?",
        "Are type(15) and type(\"15\") the same?",
      ],
      masteryChecks: 4,
    },
    {
      id: "int_deep",
      title: "int — whole numbers",
      teachingGoal: "Store and use whole numbers without quotes; know negatives and zero.",
      mustCover: [
        "int is a whole number: 0, 15, -3.",
        "No decimal point — 3.0 is a float, not an int.",
        "Do not wrap numbers in quotes if you want an int.",
        "Arithmetic with ints often stays int until you use /.",
      ],
      misconceptions: [
        "3.0 is an int because it is 'whole'.",
        '"42" is an int.',
      ],
      examples: [
        "lives = 3",
        "temperature = -2",
        "print(lives + 1)  # 4",
      ],
      checkIdeas: [
        "Which values are ints?",
        "Is 3.0 an int?",
      ],
      masteryChecks: 3,
    },
    {
      id: "float_deep",
      title: "float — decimals",
      teachingGoal: "Use floats for measurements; know that / produces floats.",
      mustCover: [
        "float has a decimal part: 1.75, 0.5, -0.25.",
        "In Python 3, division with / always gives a float: 4 / 2 → 2.0.",
        "Writing 3.0 makes a float even if the fraction is zero.",
        "Floats are great for height, price, distance.",
      ],
      misconceptions: [
        "4 / 2 is the int 2.",
        "Floats are only for 'complicated' math.",
      ],
      examples: [
        "height = 1.75",
        "print(4 / 2)   # 2.0",
        "print(type(4 / 2))  # <class 'float'>",
      ],
      checkIdeas: [
        "What type is 4 / 2?",
        "Which literal is a float?",
      ],
      masteryChecks: 4,
    },
    {
      id: "str_deep",
      title: "str — text (and digit strings)",
      teachingGoal: "Strings are text; \"15\" is not the number 15.",
      mustCover: [
        "str is text in quotes: \"Berlin\", 'hi', \"\".",
        "Digit characters in quotes are still str: \"15\".",
        "You can join strings with + and repeat with *.",
        "len(s) returns how many characters are in the string.",
      ],
      misconceptions: [
        '"15" and 15 are interchangeable.',
        "len(15) works on numbers the same way.",
      ],
      examples: [
        'code = "15"',
        'print(code + "A")  # 15A',
        'print("ha" * 3)    # hahaha',
        'print(len("Ada"))  # 3',
      ],
      checkIdeas: [
        "What does \"ha\" * 3 print?",
        "Is \"15\" an int?",
        "What is len(\"Ada\")?",
      ],
      masteryChecks: 4,
    },
    {
      id: "bool_deep",
      title: "bool — True and False",
      teachingGoal: "Use True/False (capitalized); comparisons produce bools.",
      mustCover: [
        "bool values are True and False — capital T/F, no quotes.",
        "Comparisons produce bools: print(5 > 3) → True.",
        "true / false lowercase are NameErrors (not Python keywords).",
        "bools often drive decisions later (if) — for now, store and print them.",
      ],
      misconceptions: [
        "Writing true or \"True\" as a boolean.",
        "Thinking 5 > 3 prints the text yes.",
      ],
      examples: [
        "ready = True",
        "print(10 == 10)  # True",
        "print(7 > 9)     # False",
      ],
      checkIdeas: [
        "Which spelling is a valid bool?",
        "What does print(5 > 3) show?",
      ],
      masteryChecks: 3,
    },
    {
      id: "none_value",
      title: "None — no value yet",
      teachingGoal: "None means 'no value'; it is not 0, False, or \"\".",
      mustCover: [
        "None is a special singleton meaning absence of a value.",
        "type(None) is NoneType.",
        "None is not the same as 0, False, or \"\".",
        "Useful as a placeholder before you assign a real value.",
      ],
      misconceptions: [
        "None equals 0.",
        "None equals False.",
        "None equals an empty string.",
      ],
      examples: [
        "answer = None",
        "print(answer)        # None",
        "print(type(answer))  # <class 'NoneType'>",
        "answer = 42",
      ],
      checkIdeas: [
        "Is None the same as 0?",
        "What type is None?",
      ],
      masteryChecks: 3,
    },
    {
      id: "casting",
      title: "Convert with int / float / str / bool",
      teachingGoal: "Cast between types deliberately; know what fails.",
      mustCover: [
        "int(\"15\") → 15; float(\"1.5\") → 1.5; str(15) → \"15\".",
        "int(3.9) truncates toward zero → 3 (does not round).",
        "int(\"3.9\") fails — convert float first or use float(\"3.9\").",
        "bool(0) is False; bool(\"\") is False; most other values are True.",
        "int(\"abc\") raises ValueError.",
      ],
      misconceptions: [
        "int(3.9) rounds to 4.",
        "int(\"3.9\") works.",
        "str(True) is useless / invalid.",
      ],
      examples: [
        'print(int("15"))',
        "print(int(3.9))      # 3",
        'print(float("1.5"))',
        "print(str(42))",
        "print(bool(0))       # False",
      ],
      checkIdeas: [
        "What is int(3.9)?",
        "Does int(\"3.9\") work?",
        "What is bool(\"\")?",
      ],
      masteryChecks: 4,
    },
    {
      id: "arithmetic",
      title: "Arithmetic operators",
      teachingGoal: "Use + - * / // % ** correctly on numbers.",
      mustCover: [
        "+ - * / are the basic four operations.",
        "** is power: 2 ** 3 → 8.",
        "% is modulo (remainder): 17 % 5 → 2.",
        "// is floor division: 7 // 2 → 3.",
        "/ is true division and yields float.",
      ],
      misconceptions: [
        "Confusing / and //.",
        "Thinking % means percent.",
        "Believing ** is XOR or something else.",
      ],
      examples: [
        "print(2 ** 3)   # 8",
        "print(17 % 5)   # 2",
        "print(7 // 2)   # 3",
        "print(7 / 2)    # 3.5",
      ],
      checkIdeas: [
        "What is 17 % 5?",
        "What is 7 // 2 vs 7 / 2?",
        "What is 2 ** 3?",
      ],
      masteryChecks: 4,
    },
    {
      id: "precedence",
      title: "Operator precedence",
      teachingGoal: "Know that ** beats * /, which beat + -; use () to force order.",
      mustCover: [
        "Priority (high → low): ** , then * / // % , then + -.",
        "Parentheses () override the default order.",
        "Left-to-right among equal-priority operators (except ** which is right-associative — keep MVP simple: prefer parentheses).",
      ],
      misconceptions: [
        "Everything is left-to-right with no priorities.",
        "2 + 3 * 4 is 20.",
      ],
      examples: [
        "print(2 + 3 * 4)    # 14",
        "print((2 + 3) * 4)  # 20",
        "print(2 ** 3 * 2)   # 16",
      ],
      checkIdeas: [
        "What is 2 + 3 * 4?",
        "How do you force addition first?",
      ],
      masteryChecks: 3,
    },
    {
      id: "mix_safely",
      title: "Mixing types safely",
      teachingGoal: "Avoid TypeError: convert before combining unlike types.",
      mustCover: [
        "\"Hi \" + 16 fails — convert with str(16) or use an f-string / commas.",
        "You can add int + float → float.",
        "Check types with type() when stuck.",
        "Convert early: n = int(text) then compute.",
      ],
      misconceptions: [
        "Python always auto-converts strings to numbers.",
        "int + str somehow works.",
      ],
      examples: [
        'age = 16',
        'print("Age: " + str(age))',
        "print(2 + 1.5)  # 3.5",
        '# print("Age: " + age)  → TypeError',
      ],
      checkIdeas: [
        "How do you fix \"Age: \" + 16?",
        "What type is 2 + 1.5?",
      ],
      masteryChecks: 4,
    },
    {
      id: "input_is_str",
      title: "input() returns str",
      teachingGoal: "Remember input always gives text; cast before math.",
      mustCover: [
        "input(...) always returns a str — even if the user types digits.",
        "For math: n = int(input(\"Number: \")) or float(...).",
        "Without casting, \"5\" + 1 or age + 1 on a string input fails or concatenates wrongly.",
        "In exercises you may simulate input by assigning a string variable.",
      ],
      misconceptions: [
        "input() returns int when the user types digits.",
        "You never need int(input()).",
      ],
      examples: [
        '# typed = input("Age: ")  → always str',
        'typed = "15"  # simulate input',
        "age = int(typed)",
        "print(age + 1)  # 16",
      ],
      checkIdeas: [
        "What type does input() return?",
        "How do you add 1 to an age from input?",
      ],
      masteryChecks: 4,
    },
  ],
  apply: {
    title: "Number lab",
    brief:
      "Build a small number lab: store several typed values (including a digit-string and None), inspect types with type(), convert where needed, run arithmetic (use at least one of //, %, or **), and print clear results — without TypeErrors.",
    criteria: [
      "Defines variables covering int, float, str, bool, and None",
      "Uses type() at least twice to inspect values",
      "Converts a digit-string with int() or float() before math",
      "Performs arithmetic using at least one of //, %, or **",
      "Prints results with str() or f-strings / commas so mixed output does not TypeError",
      "Runs without errors",
    ],
    hints: [
      "raw = \"12\" is a str — use int(raw) before adding.",
      "placeholder = None is allowed; later overwrite it with a number.",
      "print(type(x)) shows the type.",
      "Try print(17 % 5) or print(2 ** 3) or print(7 // 2).",
      'Mix text and numbers with print(f"n={n}") or print("n=", n).',
    ],
    evaluationGuide:
      "Pass if the learner (1) has variables of types int, float, str, bool, and None somewhere in the code, (2) calls type( at least twice, (3) uses int( or float( on a quoted digit string or an obviously string variable before arithmetic, (4) uses // or % or ** at least once on numbers, (5) prints without TypeError-style str+int concat (prefer f-string, comma print, or str()), (6) would run cleanly. Do not require specific names. Do not require real input() — simulating input with a string variable is fine.",
  },
}
