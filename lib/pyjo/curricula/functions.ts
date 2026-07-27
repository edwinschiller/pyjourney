import type { LessonBlueprint } from "@/lib/pyjo/curricula/types"

/**
 * Functions — reusable blocks after Variables and Data Types.
 *
 * Learners define and call functions, pass parameters, distinguish return
 * from print, meet local scope, use simple defaults, and split tasks into
 * small helpers before conditions and loops.
 */
export const FUNCTIONS_BLUEPRINT: LessonBlueprint = {
  slug: "functions",
  title: "Functions",
  objective:
    "Define and call functions, pass parameters, use return vs print, understand local scope, and build reusable helpers.",
  rationale:
    "Copy-pasting the same logic leads to bugs and unreadable scripts. Functions teach DRY design early: name a task, pass inputs, get outputs back, and compose small helpers into bigger behavior.",
  topics: [
    {
      id: "why_functions",
      title: "Why functions?",
      teachingGoal:
        "Functions group steps under one name so you can reuse and organize code.",
      mustCover: [
        "A function is a named block of code you can run whenever you need it.",
        "Without functions you repeat the same lines — harder to fix and read.",
        "Functions help you think in small tasks: greet, add, format_score.",
      ],
      misconceptions: [
        "Functions are only for 'advanced' programmers.",
        "Defining a function runs it immediately.",
      ],
      examples: [
        "# Same logic twice — messy",
        'print("Hi", "Ada")',
        'print("Hi", "Bob")',
        "# Better: define once, call many times (next topics)",
      ],
      checkIdeas: [
        "Why not copy-paste the same block ten times?",
        "Does writing def run the function?",
      ],
      masteryChecks: 3,
    },
    {
      id: "def_basics",
      title: "Define with def",
      teachingGoal:
        "Write def name(): followed by an indented body; colon and indent are required.",
      mustCover: [
        "def function_name(): starts a definition — note the colon.",
        "The body is indented (usually 4 spaces).",
        "The function does nothing until you call it later.",
        "Empty line after def is optional; indent is not.",
      ],
      misconceptions: [
        "Forgetting the colon after ().",
        "Body at the same indent level as def.",
        "Thinking def name = function (Python uses def keyword).",
      ],
      examples: [
        "def say_hi():",
        '    print("Hello!")',
        "",
        "def line():",
        '    print("---")',
      ],
      checkIdeas: [
        "What marks the start of a function body?",
        "Is def greet(): valid syntax?",
      ],
      masteryChecks: 4,
    },
    {
      id: "call_basics",
      title: "Call with ()",
      teachingGoal:
        "Run a function by writing its name followed by parentheses: name().",
      mustCover: [
        "Definition alone does not run the body — you must call it.",
        "Call syntax: function_name().",
        "You can call the same function many times.",
        "Name must match the def (case-sensitive).",
      ],
      misconceptions: [
        "Referencing the name without () does not run the body.",
        "Calling before def works (NameError in normal top-down scripts).",
      ],
      examples: [
        "def say_hi():",
        '    print("Hello!")',
        "",
        "say_hi()   # runs the body",
        "say_hi()   # runs again",
      ],
      checkIdeas: [
        "How do you run say_hi after defining it?",
        "What happens if you only write say_hi without ()?",
      ],
      masteryChecks: 4,
    },
    {
      id: "parameters",
      title: "Parameters",
      teachingGoal:
        "Accept inputs in def name(param): and pass values at the call: name(value).",
      mustCover: [
        "Parameters are names in the def parentheses.",
        "Arguments are the values you pass when calling.",
        "Inside the body, the parameter name stands for that value.",
        "One call can pass different arguments each time.",
      ],
      misconceptions: [
        "Parameter and argument mean the same in beginner docs — but the value is passed at call time.",
        "Using a global variable instead of a parameter when the value should vary per call.",
      ],
      examples: [
        "def greet(name):",
        '    print("Hi", name)',
        "",
        'greet("Ada")',
        'greet("Bob")',
      ],
      checkIdeas: [
        "What is passed to name in greet(\"Ada\")?",
        "Where do parameters appear — def or call?",
      ],
      masteryChecks: 4,
    },
    {
      id: "return_values",
      title: "return vs print",
      teachingGoal:
        "return sends a value back to the caller; print only shows output and returns None.",
      mustCover: [
        "return expression ends the function and gives a result to the caller.",
        "print(...) displays text but the function result is None unless you return.",
        "Caller can store the result: x = double(5).",
        "return and print solve different jobs — compute vs display.",
      ],
      misconceptions: [
        "Thinking print returns the printed value to use in math.",
        "Using print where you need return (and vice versa).",
        "Expecting code after return to still run.",
      ],
      examples: [
        "def double(n):",
        "    return n * 2",
        "",
        "x = double(5)   # x is 10",
        "print(x)",
      ],
      checkIdeas: [
        "What does double(5) evaluate to if body is return n * 2?",
        "Does print(5) give the caller a usable 5?",
      ],
      masteryChecks: 4,
    },
    {
      id: "multiple_params",
      title: "Multiple parameters",
      teachingGoal:
        "Define and call functions with two or more parameters; order must match.",
      mustCover: [
        "def add(a, b): — comma separates parameters.",
        "Call with matching order: add(2, 3).",
        "First arg binds to first param, second to second.",
        "Wrong order → wrong results even if types match.",
      ],
      misconceptions: [
        "Passing arguments in random order without names.",
        "Forgetting commas between parameters or arguments.",
      ],
      examples: [
        "def add(a, b):",
        "    return a + b",
        "",
        "print(add(2, 3))   # 5",
        "print(add(10, 1))  # 11",
      ],
      checkIdeas: [
        "What is add(2, 3)?",
        "Why does add(3, 2) differ from add(2, 3) for subtraction?",
      ],
      masteryChecks: 3,
    },
    {
      id: "defaults_intro",
      title: "Simple default arguments",
      teachingGoal:
        "Optional parameters can have defaults: def greet(name=\"World\"): — call with or without that arg.",
      mustCover: [
        "Default syntax: param=default_value in the def line.",
        "Caller may omit that argument — default is used.",
        "Keep defaults simple (literals) at this level.",
        "Parameters without defaults must come before ones with defaults.",
      ],
      misconceptions: [
        "Putting defaults on every parameter when only one is optional.",
        "Default values re-evaluated each call — keep MVP to literals.",
      ],
      examples: [
        'def greet(name="World"):',
        '    print("Hi", name)',
        "",
        "greet()           # Hi World",
        'greet("Ada")      # Hi Ada',
      ],
      checkIdeas: [
        "What does greet() print with default \"World\"?",
        "Can required params come after defaulted ones?",
      ],
      masteryChecks: 3,
    },
    {
      id: "scope_local",
      title: "Local scope",
      teachingGoal:
        "Variables created inside a function are local — not visible outside after the call.",
      mustCover: [
        "Assignments inside the body create local names.",
        "Locals exist only while the function runs.",
        "Outside code cannot read an inner local (NameError).",
        "Parameters are local names too.",
      ],
      misconceptions: [
        "Expecting a variable set inside a function to exist globally afterward.",
        "Same name inside and outside — they can be different variables (shadowing — mention lightly).",
      ],
      examples: [
        "def demo():",
        "    x = 99",
        "    print(x)",
        "",
        "demo()      # 99",
        "# print(x)  → NameError outside",
      ],
      checkIdeas: [
        "Can you print x after demo() if x was set only inside demo?",
        "Are parameters local?",
      ],
      masteryChecks: 4,
    },
    {
      id: "reuse_helpers",
      title: "Write once, call many",
      teachingGoal:
        "Extract repeated logic into a helper and call it from several places.",
      mustCover: [
        "One def, many calls — fixes happen in one place.",
        "Helpers can call other helpers.",
        "Name helpers by what they do: format_price, square.",
        "Main flow reads like a recipe: call step1(), call step2().",
      ],
      misconceptions: [
        "Inlining everything because 'it's only used twice'.",
        "Giant one-function scripts instead of small named steps.",
      ],
      examples: [
        "def banner():",
        '    print("====")',
        "",
        "banner()",
        'print("Score: 10")',
        "banner()",
      ],
      checkIdeas: [
        "Why change banner() once instead of three print blocks?",
        "Can helpers call each other?",
      ],
      masteryChecks: 3,
    },
    {
      id: "pure_vs_print",
      title: "Return vs side effects",
      teachingGoal:
        "Prefer return for computed values; use print inside only when displaying is the job.",
      mustCover: [
        "Side effect: function changes or displays something (print) without returning useful data.",
        "Pure-ish helper: input → return value, caller decides what to print.",
        "Mixing both is OK but know which part is for reuse in expressions.",
        "result = add(2, 3) needs return; show_score() may print.",
      ],
      misconceptions: [
        "Printing inside every helper so callers cannot reuse the number.",
        "Returning and printing the same thing everywhere redundantly.",
      ],
      examples: [
        "def add(a, b):",
        "    return a + b",
        "",
        "total = add(2, 3)",
        "print(total)",
      ],
      checkIdeas: [
        "Which helper is easier to use in total = ...?",
        "Is print inside add a side effect?",
      ],
      masteryChecks: 4,
    },
    {
      id: "common_fn_bugs",
      title: "Common function bugs",
      teachingGoal:
        "Spot missing (), wrong argument count, and forgotten return.",
      mustCover: [
        "say_hi vs say_hi() — only the call runs the body.",
        "Too few or too many arguments → TypeError.",
        "Function with no return gives None to the caller.",
        "IndentationError if body not indented.",
      ],
      misconceptions: [
        "Assigning x = say_hi thinking x is the return value of print inside.",
        "Adding extra args that do not exist in def.",
      ],
      examples: [
        "def triple(n):",
        "    print(n * 3)   # displays, returns None",
        "",
        "x = triple(2)    # x is None",
        "# triple()       → TypeError missing n",
      ],
      checkIdeas: [
        "What is x after x = triple(2) when body only prints?",
        "What error for greet() if greet needs one argument?",
      ],
      masteryChecks: 4,
    },
    {
      id: "design_small",
      title: "Split into helpers",
      teachingGoal:
        "Break a task into small functions: each does one job; compose them in order.",
      mustCover: [
        "Identify repeated or distinct steps: read, compute, display.",
        "Each helper should have a clear name and small body.",
        "Top-level calls read the story: a = fetch(); b = transform(a); show(b).",
        "Avoid one huge def with unrelated jobs.",
      ],
      misconceptions: [
        "One function that does input, math, formatting, and printing all at once.",
        "Helper names like do_stuff or func1.",
      ],
      examples: [
        "def square(n):",
        "    return n * n",
        "",
        "def sum_squares(a, b):",
        "    return square(a) + square(b)",
        "",
        "print(sum_squares(3, 4))  # 25",
      ],
      checkIdeas: [
        "Why square() plus sum_squares() instead of one blob?",
        "What makes a good helper name?",
      ],
      masteryChecks: 4,
    },
  ],
  apply: {
    title: "Greeting toolkit",
    brief:
      "Build a small greeting toolkit: define at least two helpers — one that returns a greeting string from a name, and one that prints a formatted banner. Use parameters, at least one return value, and call your helpers more than once with different arguments. Compose them in a short main flow without errors.",
    criteria: [
      "Defines at least two functions with def",
      "Uses at least one parameter in a function",
      "Uses return to produce a string (not only print)",
      "Calls each helper at least once; one helper called twice with different args",
      "Uses correct () on every call and matching argument counts",
      "Runs without NameError, TypeError, or IndentationError",
    ],
    hints: [
      "def make_greeting(name): return \"Hi \" + name — caller can print(result).",
      "def banner(): print(\"====\") needs no parameters if the banner is fixed.",
      "Call make_greeting(\"Ada\") and store or print the returned string.",
      "Check indentation: body lines must be indented under def.",
      "If a function needs a name, pass it at call time — do not rely on a mystery global.",
    ],
    evaluationGuide:
      "Pass if the learner (1) defines ≥2 functions with def and indented bodies, (2) has ≥1 parameter on at least one function, (3) uses return at least once to produce a str (e.g. greeting text) that the caller uses (assign or print the returned value), (4) calls helpers with () at least 3 total calls including one function invoked twice with different arguments, (5) argument counts match definitions — no TypeError from arity, (6) code would run cleanly top to bottom. Accept banner/print-only helpers alongside return-based ones. Do not require specific function names. Do not require default arguments or multiple parameters unless present — bonus if used correctly.",
  },
}
