import type { ConceptContentBank } from "@/lib/lesson-engine/bank/content/variables"

const fb = (correct: string, wrong: string) => ({ correct, wrong })

/**
 * Slot fillers for the Functions blueprint.
 * Keys MUST match TopicSpec.id in curricula/functions.ts.
 */
export const FUNCTIONS_CONTENT: ConceptContentBank = {
  why_functions: {
    explains: [
      {
        title: "Name a block of steps",
        body: `A **function** groups steps under one name so you can run them whenever you need.

\`\`\`python
# Without a function — repeat yourself
print("Hi", "Ada")
print("Hi", "Bob")

# With a function — define once, call many (next topics)
\`\`\`

Functions keep programs **organized** and **easier to fix**.`,
      },
      {
        title: "Fix once, not ten times",
        body: `Imagine the greeting text changes from \`"Hi"\` to \`"Hello"\`.

Without a function you hunt every copy. With one \`def greet(...)\` you change **one place**.

\`\`\`python
# Mental model: function = reusable recipe card
# def = write the recipe
# call = cook it when needed
\`\`\``,
      },
      {
        title: "Define ≠ run",
        body: `Writing \`def say_hi():\` **stores** the recipe — it does **not** run the body yet.

\`\`\`python
def say_hi():
    print("Hello!")

# Nothing prints until you call say_hi()
\`\`\`

That separation is why functions scale: define many helpers, call them in order later.`,
      },
    ],
    quizzes: [
      {
        prompt: "Why use a function instead of copy-pasting the same lines?",
        choices: [
          { id: "a", label: "Reuse and fix logic in one place" },
          { id: "b", label: "Python requires every script to use def" },
          { id: "c", label: "Functions run faster than print" },
        ],
        correctId: "a",
        feedback: fb(
          "DRY — Don't Repeat Yourself.",
          "Functions are for structure and reuse, not a speed trick."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Does writing def say_hi(): run the function body immediately?",
        choices: [
          { id: "no", label: "No — you must call it" },
          { id: "yes", label: "Yes — def always runs the body" },
          { id: "maybe", label: "Only if the body has print" },
        ],
        correctId: "no",
        feedback: fb(
          "Definition stores the block; call executes it.",
          "def alone does not run the indented body."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Which is the best reason beginners learn functions early?",
        choices: [
          { id: "a", label: "Break problems into named, reusable steps" },
          { id: "b", label: "Replace variables entirely" },
          { id: "c", label: "Avoid using print forever" },
        ],
        correctId: "a",
        feedback: fb(
          "Named steps → readable programs.",
          "Variables and print still matter; functions organize them."
        ),
        difficulty: "hard",
      },
      {
        prompt: "What happens right after this line runs?",
        code: 'def greet():\n    print("Hi")',
        choices: [
          { id: "nothing", label: "Nothing prints yet" },
          { id: "hi", label: '"Hi" prints immediately' },
          { id: "error", label: "SyntaxError" },
        ],
        correctId: "nothing",
        feedback: fb(
          "def registers the function; call to run.",
          "Body runs on call, not on def."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Complete the keyword that starts a function definition.",
        template: "___ say_hi():",
        answers: ["def"],
        placeholder: "…",
        feedback: fb(
          "def starts every function definition.",
          "The keyword is def, not function or fn."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Add a second identical print by calling greet() again — do not duplicate the def body.",
        lines: [
          "Keep the def as-is.",
          "Call greet() twice after the definition.",
        ],
        starterCode: 'def greet():\n    print("Hi")\n\ngreet()\n',
        mustContain: ["greet()", "def greet"],
        mustMatchAny: ["greet()\n", "greet()\r\n"],
        feedback: fb(
          "Reuse via calls — that is the point of functions.",
          "Add another greet() line after the first call."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix the indentation so the print is inside the function body.",
        lines: ["Indent the print line under def."],
        starterCode: 'def line():\nprint("---")\n',
        mustContain: ['    print("---")', "def line():"],
        mustNotContain: ['def line():\nprint'],
        feedback: fb(
          "Body must be indented under def.",
          "Add four spaces before print."
        ),
      },
    ],
  },

  def_basics: {
    explains: [
      {
        title: "def name():",
        body: `Start with \`def\`, then the **name**, then \`()\`, then a **colon**:

\`\`\`python
def say_hi():
    print("Hello!")
\`\`\`

The indented lines are the **body** — what runs when the function is called.`,
      },
      {
        title: "Colon + indent",
        body: `Two syntax rules bite beginners:

\`\`\`python
def greet():        # colon required
    print("Hi")     # body indented (usually 4 spaces)

# def greet()       # SyntaxError — missing :
# print("Hi")       # not in the body — wrong indent
\`\`\`

Python uses indentation to know where the body ends.`,
      },
      {
        title: "Naming helpers",
        body: `Function names follow the same rules as variables: letters, digits, \`_\`, not starting with a digit.

\`\`\`python
def show_banner():
    print("====")

def line2():
    print("--")
\`\`\`

Pick names that describe the job: \`show_banner\`, not \`f1\`.`,
      },
    ],
    quizzes: [
      {
        prompt: "Which line is valid function syntax?",
        choices: [
          { id: "a", label: "def greet():" },
          { id: "b", label: "def greet()" },
          { id: "c", label: "function greet():" },
        ],
        correctId: "a",
        feedback: fb(
          "def, name, (), and colon.",
          "Python uses def; do not forget the colon."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What marks the start of the function body?",
        choices: [
          { id: "indent", label: "Indented lines after the def line" },
          { id: "blank", label: "A blank line after def" },
          { id: "return", label: "A return on the def line" },
        ],
        correctId: "indent",
        feedback: fb(
          "Indentation defines the body.",
          "Blank lines are optional; indent is required."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What is wrong here?",
        code: 'def hi()\n    print("Hi")',
        choices: [
          { id: "colon", label: "Missing : after ()" },
          { id: "def", label: "Should use function instead of def" },
          { id: "print", label: "print is illegal inside functions" },
        ],
        correctId: "colon",
        feedback: fb(
          "def hi(): needs the colon.",
          "print is fine; fix the def line."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Which body belongs to def line():?",
        choices: [
          { id: "a", label: 'Four-space indent, then print("---")' },
          { id: "b", label: 'print("---") at the same indent as def' },
          { id: "c", label: "No body allowed" },
        ],
        correctId: "a",
        feedback: fb(
          "Body must be indented under def.",
          "Same-column print is outside the function."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Fill in the missing colon on the def line.",
        template: "def wave()___",
        answers: [":"],
        placeholder: "…",
        feedback: fb(
          "Every def line ends with :.",
          "Add a colon after ()."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Define show_star() that prints \"*\" — include def, colon, and indented body.",
        lines: ["def show_star():", '    print("*")'],
        starterCode: "# define show_star below\n",
        mustContain: ["def show_star():", 'print("*")'],
        mustNotContain: ["def show_star()\n"],
        feedback: fb(
          "Complete def with indented print.",
          "Write def show_star(): then indented print(\"*\")."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix indentation so print is inside def ping():",
        lines: ["Indent print with four spaces."],
        starterCode: 'def ping():\nprint("pong")\n',
        mustContain: ['    print("pong")'],
        mustNotContain: ['def ping():\nprint'],
        feedback: fb(
          "Indented body → valid function.",
          "Add spaces before print."
        ),
      },
    ],
  },

  call_basics: {
    explains: [
      {
        title: "Run with name()",
        body: `After \`def\`, **call** the function to execute its body:

\`\`\`python
def say_hi():
    print("Hello!")

say_hi()    # prints Hello!
\`\`\`

The parentheses \`()\` mean "run this now".`,
      },
      {
        title: "Call many times",
        body: `One definition, unlimited calls:

\`\`\`python
def line():
    print("---")

line()
print("middle")
line()
\`\`\`

Each \`line()\` runs the body again from the top.`,
      },
      {
        title: "Name without () does not run",
        body: `\`say_hi\` alone is just the function **object** — no body execution:

\`\`\`python
def say_hi():
    print("Hello!")

say_hi     # no output — missing ()
say_hi()   # prints Hello!
\`\`\`

Always add \`()\` when you want the body to run.`,
      },
    ],
    quizzes: [
      {
        prompt: "How do you run say_hi after defining it?",
        choices: [
          { id: "call", label: "say_hi()" },
          { id: "name", label: "say_hi" },
          { id: "run", label: "run say_hi" },
        ],
        correctId: "call",
        feedback: fb(
          "Parentheses trigger the call.",
          "Name alone does not execute the body."
        ),
        difficulty: "easy",
      },
      {
        prompt: "How many times does \"Hi\" print?",
        code: 'def hi():\n    print("Hi")\n\nhi()\nhi()\nhi()',
        choices: [
          { id: "3", label: "3" },
          { id: "1", label: "1" },
          { id: "0", label: "0" },
        ],
        correctId: "3",
        feedback: fb(
          "Each call runs the body once.",
          "Three calls → three prints."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What happens here?",
        code: 'def ping():\n    print("pong")\n\nping',
        choices: [
          { id: "nothing", label: "Nothing prints" },
          { id: "pong", label: '"pong" prints' },
          { id: "error", label: "SyntaxError" },
        ],
        correctId: "nothing",
        feedback: fb(
          "Missing () — body never runs.",
          "Use ping() to execute."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Why must the call name match def exactly?",
        choices: [
          { id: "a", label: "Python names are case-sensitive" },
          { id: "b", label: "Calls are optional" },
          { id: "c", label: "def creates a global alias automatically" },
        ],
        correctId: "a",
        feedback: fb(
          "Say_hi and say_hi are different names.",
          "Spelling and case must match the def."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Complete the call to run jump()",
        template: "jump___",
        answers: ["()"],
        placeholder: "…",
        feedback: fb(
          "() runs the function.",
          "Add empty parentheses."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "The function is defined but never runs. Add a call so \"Go!\" prints.",
        lines: ["Call run() after the def."],
        starterCode: 'def run():\n    print("Go!")\n',
        mustContain: ["run()"],
        feedback: fb(
          "Call executes the body.",
          "Add run() on a line after the def."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix the call — use parentheses so beep runs twice.",
        lines: ["Replace beep with beep() twice."],
        starterCode: 'def beep():\n    print("beep")\n\nbeep\nbeep\n',
        mustContain: ["beep()"],
        mustNotContain: ["\nbeep\n", "\nbeep\r\n"],
        feedback: fb(
          "beep() runs; beep alone does not.",
          "Write beep() on each call line."
        ),
      },
    ],
  },

  parameters: {
    explains: [
      {
        title: "Inputs in def name(param):",
        body: `A **parameter** is a name inside the parentheses that stands for a value passed in:

\`\`\`python
def greet(name):
    print("Hi", name)

greet("Ada")
greet("Bob")
\`\`\`

Each call can send a different **argument** for \`name\`.`,
      },
      {
        title: "Parameter vs argument",
        body: `In \`def add(n):\`, \`n\` is the **parameter** (placeholder in the recipe).

In \`add(5)\`, \`5\` is the **argument** (actual ingredient).

\`\`\`python
def double(n):
    print(n * 2)

double(4)   # n is 4 inside the body
\`\`\``,
      },
      {
        title: "Use the parameter inside",
        body: `The parameter behaves like a local variable assigned from the caller:

\`\`\`python
def shout(word):
    print(word.upper())

shout("hi")    # HI
\`\`\`

Different calls → different values bound to the same parameter name.`,
      },
    ],
    quizzes: [
      {
        prompt: "In greet(\"Ada\"), what is \"Ada\"?",
        choices: [
          { id: "arg", label: "An argument passed to the call" },
          { id: "param", label: "A parameter in the def line" },
          { id: "return", label: "A return value" },
        ],
        correctId: "arg",
        feedback: fb(
          "Call site passes the argument.",
          "The def lists the parameter name."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Where do parameters appear?",
        choices: [
          { id: "def", label: "Inside def parentheses" },
          { id: "call", label: "Only at the call — never in def" },
          { id: "body", label: "Only as strings in the body" },
        ],
        correctId: "def",
        feedback: fb(
          "def greet(name): declares the parameter.",
          "The call supplies the value."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What prints?",
        code: 'def show(x):\n    print(x)\n\nshow(42)',
        choices: [
          { id: "42", label: "42" },
          { id: "x", label: "x" },
          { id: "nothing", label: "Nothing" },
        ],
        correctId: "42",
        feedback: fb(
          "x is 42 inside show.",
          "Argument 42 binds to parameter x."
        ),
        difficulty: "hard",
      },
      {
        prompt: "What is wrong?",
        code: 'def greet(name):\n    print("Hi", name)\n\ngreet()',
        choices: [
          { id: "type", label: "TypeError — missing required argument name" },
          { id: "syntax", label: "SyntaxError on def" },
          { id: "ok", label: "Prints Hi with no name" },
        ],
        correctId: "type",
        feedback: fb(
          "greet expects one argument.",
          "Pass a name: greet(\"Ada\")."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Pass the string \"Py\" to show()",
        template: 'show(___)',
        answers: ['"Py"', "'Py'"],
        placeholder: "…",
        feedback: fb(
          "Arguments go inside the call parentheses.",
          'Try show("Py").'
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Add parameter name to def and pass \"Ada\" in the call.",
        lines: ["def greet(name):", 'greet("Ada")'],
        starterCode: 'def greet():\n    print("Hi", name)\n\ngreet()\n',
        mustContain: ["def greet(name):", 'greet("Ada")'],
        mustNotContain: ["def greet():"],
        feedback: fb(
          "Parameter in def, argument in call.",
          "Change def to greet(name) and call greet(\"Ada\")."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix the call — pass 7 so double prints 14.",
        lines: ["Call double(7)."],
        starterCode: "def double(n):\n    print(n * 2)\n\ndouble()\n",
        mustContain: ["double(7)"],
        mustNotContain: ["double()"],
        feedback: fb(
          "n needs a value from the call.",
          "Use double(7)."
        ),
      },
    ],
  },

  return_values: {
    explains: [
      {
        title: "return sends a value back",
        body: `\`return\` ends the function and gives a result to whoever **called** it:

\`\`\`python
def double(n):
    return n * 2

x = double(5)   # x is 10
print(x)
\`\`\`

The caller can store, print, or pass the result onward.`,
      },
      {
        title: "print is not return",
        body: `\`print\` **shows** output; it does **not** send a usable value back:

\`\`\`python
def show_double(n):
    print(n * 2)

y = show_double(5)   # prints 10, but y is None
\`\`\`

Use \`return\` when the caller needs the number or string for later.`,
      },
      {
        title: "return stops the function",
        body: `Code after \`return\` in the same path does not run:

\`\`\`python
def pick():
    return 1
    print("never")   # unreachable

print(pick())   # 1
\`\`\`

One clear return path keeps helpers easy to read.`,
      },
    ],
    quizzes: [
      {
        prompt: "What is x after x = double(5) if double returns n * 2?",
        code: "def double(n):\n    return n * 2\n\nx = double(5)",
        choices: [
          { id: "10", label: "10" },
          { id: "5", label: "5" },
          { id: "none", label: "None" },
        ],
        correctId: "10",
        feedback: fb(
          "return n * 2 → 10.",
          "return sends the computed value back."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Does print(5) give the caller a usable 5 for math?",
        choices: [
          { id: "no", label: "No — print displays; return gives a value" },
          { id: "yes", label: "Yes — print returns the number" },
          { id: "always", label: "Only inside functions" },
        ],
        correctId: "no",
        feedback: fb(
          "print's job is output, not returning for reuse.",
          "Use return when you need the value in a variable."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What is y here?",
        code: 'def bad():\n    print("hi")\n\ny = bad()',
        choices: [
          { id: "none", label: "None" },
          { id: "hi", label: '"hi"' },
          { id: "zero", label: "0" },
        ],
        correctId: "none",
        feedback: fb(
          "No return → caller gets None.",
          "print inside does not set y to \"hi\"."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Which helper lets you write total = add(2, 3)?",
        choices: [
          { id: "return", label: "def add(a,b): return a + b" },
          { id: "print", label: "def add(a,b): print(a + b)" },
          { id: "both", label: "Both work the same for assignment" },
        ],
        correctId: "return",
        feedback: fb(
          "Assignment needs a returned value.",
          "print displays but add(...) is None for y = ..."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Complete the line that sends n * 2 back to the caller.",
        template: "    ___ n * 2",
        answers: ["return"],
        placeholder: "…",
        feedback: fb(
          "return sends the value out.",
          "Use the return keyword."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Change print to return so x becomes 10.",
        lines: ["Use return n * 2 instead of print."],
        starterCode: "def double(n):\n    print(n * 2)\n\nx = double(5)\n",
        mustContain: ["return n * 2"],
        mustNotContain: ["print(n * 2)"],
        feedback: fb(
          "return → x is 10.",
          "Replace print with return n * 2."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Store the greeting in msg using make_greeting's return value, then print msg.",
        lines: ['msg = make_greeting("Ada")', "print(msg)"],
        starterCode: 'def make_greeting(name):\n    return "Hi " + name\n\nprint(make_greeting("Ada"))\n',
        mustContain: ['msg = make_greeting("Ada")', "print(msg)"],
        feedback: fb(
          "Capture return, then print.",
          "Assign to msg first, then print(msg)."
        ),
      },
    ],
  },

  multiple_params: {
    explains: [
      {
        title: "def add(a, b):",
        body: `Separate multiple parameters with **commas**:

\`\`\`python
def add(a, b):
    return a + b

print(add(2, 3))   # 5
\`\`\`

Each name is a slot for one argument at call time.`,
      },
      {
        title: "Order matches",
        body: `First argument → first parameter, second → second:

\`\`\`python
def power(base, exp):
    return base ** exp

print(power(2, 3))   # 8  (2**3)
print(power(3, 2))   # 9  (3**2) — order matters!
\`\`\``,
      },
      {
        title: "Commas in call too",
        body: `Pass multiple arguments the same way:

\`\`\`python
def greet(first, last):
    print(first, last)

greet("Ada", "Lovelace")
\`\`\`

Count parameters in \`def\` — pass the **same number** of arguments (unless defaults apply later).`,
      },
    ],
    quizzes: [
      {
        prompt: "What is add(2, 3) if def add(a, b): return a + b?",
        choices: [
          { id: "5", label: "5" },
          { id: "23", label: "23" },
          { id: "error", label: "TypeError" },
        ],
        correctId: "5",
        feedback: fb(
          "2 + 3 → 5.",
          "Both args bind; return sums them."
        ),
        difficulty: "easy",
      },
      {
        prompt: "How many arguments does greet(first, last) require?",
        choices: [
          { id: "2", label: "2" },
          { id: "1", label: "1" },
          { id: "0", label: "0" },
        ],
        correctId: "2",
        feedback: fb(
          "Two parameters → two arguments.",
          "Pass both at call time."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What is subtract(10, 3) with def subtract(a, b): return a - b?",
        code: "def subtract(a, b):\n    return a - b\n\nprint(subtract(10, 3))",
        choices: [
          { id: "7", label: "7" },
          { id: "neg7", label: "-7" },
          { id: "13", label: "13" },
        ],
        correctId: "7",
        feedback: fb(
          "a=10, b=3 → 10 - 3.",
          "First arg is a, second is b."
        ),
        difficulty: "hard",
      },
      {
        prompt: "What goes wrong?",
        code: "def pair(x, y):\n    return x + y\n\nprint(pair(1))",
        choices: [
          { id: "type", label: "TypeError — missing y" },
          { id: "one", label: "Prints 1" },
          { id: "syntax", label: "SyntaxError on def" },
        ],
        correctId: "type",
        feedback: fb(
          "Two params need two args.",
          "Call pair(1, 2) or similar."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Pass 4 and 5 to add()",
        template: "add(___, ___)",
        answers: ["4, 5", "5, 4"],
        placeholder: "…",
        feedback: fb(
          "Two args for two parameters.",
          "Write add(4, 5) — order is a then b."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix the call — pass both 2 and 3 to add.",
        lines: ["Use add(2, 3)."],
        starterCode: "def add(a, b):\n    return a + b\n\nprint(add(2))\n",
        mustContain: ["add(2, 3)"],
        mustNotContain: ["add(2)"],
        feedback: fb(
          "Both parameters filled.",
          "Change to add(2, 3)."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Add second parameter b to def and return a + b.",
        lines: ["def add(a, b):", "return a + b"],
        starterCode: "def add(a):\n    return a + 1\n\nprint(add(2, 3))\n",
        mustContain: ["def add(a, b):", "return a + b"],
        mustNotContain: ["def add(a):"],
        feedback: fb(
          "Two params match two call args.",
          "Define add(a, b) and return a + b."
        ),
      },
    ],
  },

  defaults_intro: {
    explains: [
      {
        title: "param=default in def",
        body: `Optional parameters can ship with a **default value**:

\`\`\`python
def greet(name="World"):
    print("Hi", name)

greet()          # Hi World
greet("Ada")     # Hi Ada
\`\`\`

Omit the argument → Python uses the default.`,
      },
      {
        title: "Required before optional",
        body: `Parameters **without** defaults must come **first**:

\`\`\`python
def tag(label, value="none"):
    print(label, value)

tag("score")           # score none
tag("score", 10)       # score 10
\`\`\`

\`def bad(value="x", label):\` is a SyntaxError.`,
      },
      {
        title: "Keep defaults simple",
        body: `At this level, stick to simple literals:

\`\`\`python
def repeat(word, times=2):
    print(word * times)

repeat("ha")       # haha
repeat("ha", 3)    # hahaha
\`\`\`

Defaults are a light convenience — not every parameter needs one.`,
      },
    ],
    quizzes: [
      {
        prompt: "What does greet() print when def greet(name=\"World\"): print(\"Hi\", name)?",
        choices: [
          { id: "world", label: "Hi World" },
          { id: "error", label: "TypeError" },
          { id: "hi", label: "Hi only" },
        ],
        correctId: "world",
        feedback: fb(
          "Default name is \"World\".",
          "Omitted arg → default used."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Can required parameters come after defaulted ones?",
        choices: [
          { id: "no", label: "No — defaults must be last" },
          { id: "yes", label: "Yes — any order" },
          { id: "maybe", label: "Only with return" },
        ],
        correctId: "no",
        feedback: fb(
          "Syntax rule: non-defaults first.",
          "def f(a, b=1) is OK; def f(a=1, b) is not."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What prints?",
        code: 'def shout(msg, end="!"):\n    print(msg + end)\n\nshout("Hi")',
        choices: [
          { id: "hi", label: "Hi!" },
          { id: "hiplain", label: "Hi" },
          { id: "err", label: "TypeError" },
        ],
        correctId: "hi",
        feedback: fb(
          "end defaults to \"!\".",
          "msg + end → \"Hi!\"."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Which def line is valid?",
        choices: [
          { id: "a", label: 'def f(x, y=0):' },
          { id: "b", label: 'def f(x=0, y):' },
          { id: "c", label: "def f(x=0, y=0=1):" },
        ],
        correctId: "a",
        feedback: fb(
          "Required x, optional y.",
          "Non-default parameters must come first."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Set the default name to \"World\" in the def line.",
        template: 'def greet(name=___):',
        answers: ['"World"', "'World'"],
        placeholder: "…",
        feedback: fb(
          "Default is a string literal.",
          'Use name="World".'
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Add default times=2 so repeat(\"go\") prints gogo.",
        lines: ["def repeat(word, times=2):"],
        starterCode: 'def repeat(word, times):\n    print(word * times)\n\nrepeat("go")\n',
        mustContain: ["times=2"],
        feedback: fb(
          "Default fills missing second arg.",
          "Change to times=2 in the def."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Call greet() with no args to use the default, then greet(\"Ada\").",
        lines: ["greet() then greet(\"Ada\")"],
        starterCode: 'def greet(name="World"):\n    print("Hi", name)\n\ngreet("Ada")\n',
        mustContain: ["greet()", 'greet("Ada")'],
        feedback: fb(
          "Both default and explicit calls.",
          "Add greet() before or after the Ada call."
        ),
      },
    ],
  },

  scope_local: {
    explains: [
      {
        title: "Locals live inside the function",
        body: `Names assigned **inside** the body are **local**:

\`\`\`python
def demo():
    x = 99
    print(x)

demo()       # 99
# print(x)   # NameError — x does not exist here
\`\`\`

Locals disappear from the outside view when the call ends.`,
      },
      {
        title: "Parameters are local too",
        body: `\`name\` in \`def greet(name):\` is a local name for that call:

\`\`\`python
def greet(name):
    print(name)

greet("Ada")
# print(name)  # NameError outside
\`\`\`

Each call gets its own binding for the parameter.`,
      },
      {
        title: "Same name, different boxes (light)",
        body: `A variable outside and a parameter inside can share a spelling but are **different**:

\`\`\`python
x = 1

def show():
    x = 99
    print(x)   # 99 — local x

show()
print(x)       # 1 — outer x unchanged
\`\`\`

Prefer clear parameter names to avoid confusion at first.`,
      },
    ],
    quizzes: [
      {
        prompt: "Can you print x after demo() if x = 99 only inside demo?",
        choices: [
          { id: "no", label: "No — NameError outside" },
          { id: "yes", label: "Yes — x stays 99 globally" },
          { id: "maybe", label: "Only if demo returns x" },
        ],
        correctId: "no",
        feedback: fb(
          "Locals are not visible outside.",
          "Use return if the caller needs the value."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Are function parameters local names?",
        choices: [
          { id: "yes", label: "Yes" },
          { id: "no", label: "No — they are global" },
          { id: "builtin", label: "They are built-ins" },
        ],
        correctId: "yes",
        feedback: fb(
          "Params exist only during the call.",
          "Treat them like local variables."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What prints last?",
        code: "n = 1\ndef bump():\n    n = 10\n    print(n)\n\nbump()\nprint(n)",
        choices: [
          { id: "10then1", label: "10 then 1" },
          { id: "10then10", label: "10 then 10" },
          { id: "1then1", label: "1 then 1" },
        ],
        correctId: "10then1",
        feedback: fb(
          "Inner n is local; outer n stays 1.",
          "Assignment inside bump does not change global n here."
        ),
        difficulty: "hard",
      },
      {
        prompt: "How should the caller get a value computed inside a function?",
        choices: [
          { id: "return", label: "return it from the function" },
          { id: "hope", label: "Hope the local becomes global automatically" },
          { id: "print", label: "print is enough for all later math" },
        ],
        correctId: "return",
        feedback: fb(
          "return is the contract with the caller.",
          "Locals do not leak out by assignment."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Send the local result back so the caller can use it.",
        template: "def get_three():\n    x = 3\n    ___ x",
        answers: ["return"],
        placeholder: "…",
        feedback: fb(
          "return shares value with caller.",
          "Locals need return to escape."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix outer code — use return instead of expecting secret inside local.",
        lines: ["def pick(): return 7", "print(pick())"],
        starterCode: "def pick():\n    answer = 7\n\nprint(answer)\n",
        mustContain: ["return 7", "print(pick())"],
        mustNotContain: ["print(answer)"],
        feedback: fb(
          "Call pick() and return 7.",
          "answer is local — return it via pick()."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Predict fix: return name from make_label so print works outside.",
        lines: ['return "User: " + name', "print(make_label(\"Ada\"))"],
        starterCode: 'def make_label(name):\n    label = "User: " + name\n\nprint(label)\n',
        mustContain: ['return "User: " + name', "make_label("],
        mustNotContain: ["print(label)\n"],
        feedback: fb(
          "Return the string; caller prints.",
          "Add return and print(make_label(...))."
        ),
      },
    ],
  },

  reuse_helpers: {
    explains: [
      {
        title: "One def, many calls",
        body: `Extract repeated lines into a helper:

\`\`\`python
def banner():
    print("====")

banner()
print("Title")
banner()
\`\`\`

Change the banner style **once** in \`banner()\`.`,
      },
      {
        title: "Helpers calling helpers",
        body: `Small functions can stack:

\`\`\`python
def line():
    print("---")

def section(title):
    line()
    print(title)
    line()

section("Scores")
\`\`\`

Each helper stays tiny; together they tell a story.`,
      },
      {
        title: "Name by job",
        body: `Good names read like instructions:

\`\`\`python
def show_score(points):
    print("Score:", points)

show_score(10)
show_score(25)
\`\`\`

Avoid \`do_stuff\` — future-you should guess what the call does.`,
      },
    ],
    quizzes: [
      {
        prompt: "Why edit banner() once instead of three separate print blocks?",
        choices: [
          { id: "a", label: "Single place to fix and consistent output" },
          { id: "b", label: "Python forbids duplicate prints" },
          { id: "c", label: "Calls are slower than copies" },
        ],
        correctId: "a",
        feedback: fb(
          "DRY — one source of truth.",
          "Reuse beats scattered copies."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Can one helper call another helper?",
        choices: [
          { id: "yes", label: "Yes" },
          { id: "no", label: "No — only main code may call" },
          { id: "once", label: "Only once per program" },
        ],
        correctId: "yes",
        feedback: fb(
          "Functions compose.",
          "section() calling line() is normal."
        ),
        difficulty: "easy",
      },
      {
        prompt: "How many times does \"---\" print?",
        code: 'def line():\n    print("---")\n\ndef wrap():\n    line()\n    print("mid")\n    line()\n\nwrap()',
        choices: [
          { id: "2", label: "2" },
          { id: "1", label: "1" },
          { id: "3", label: "3" },
        ],
        correctId: "2",
        feedback: fb(
          "wrap calls line twice.",
          "Two line() calls → two dashes."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Which design is better for repeated formatting?",
        choices: [
          { id: "helper", label: "def format_row(x): ... called many times" },
          { id: "copy", label: "Same 5 lines copied in 4 places" },
          { id: "global", label: "One giant block with no functions" },
        ],
        correctId: "helper",
        feedback: fb(
          "Helper = reusable formatting.",
          "Copy-paste multiplies bugs."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Call the helper a second time.",
        template: "star()\n___",
        answers: ["star()"],
        placeholder: "…",
        feedback: fb(
          "Same call again.",
          "Write star() on the next line."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Replace the duplicate print with two calls to divider().",
        lines: ["def divider(): print(\"---\")", "call divider() twice"],
        starterCode: 'print("---")\nprint("text")\nprint("---")\n',
        mustContain: ["def divider():", "divider()"],
        mustNotContain: ['print("---")\nprint("text")\nprint("---")'],
        feedback: fb(
          "Extract then call twice.",
          "Define divider and use divider() around text."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Make show_twice call flash() two times instead of duplicating body.",
        lines: ["Inside show_twice: flash() twice"],
        starterCode: 'def flash():\n    print("*")\n\ndef show_twice():\n    print("*")\n    print("*")\n\nshow_twice()\n',
        mustContain: ["flash()"],
        mustNotContain: ['    print("*")\n    print("*")'],
        feedback: fb(
          "Compose with calls to flash().",
          "Replace inner prints with flash() twice."
        ),
      },
    ],
  },

  pure_vs_print: {
    explains: [
      {
        title: "Return for reuse",
        body: `When the caller needs a **value** for math or storage, **return** it:

\`\`\`python
def add(a, b):
    return a + b

total = add(2, 3) + 1   # 6 — needs return
\`\`\`

\`print\` inside \`add\` would not let this expression work.`,
      },
      {
        title: "Print as side effect",
        body: `A **side effect** changes or shows something without returning useful data:

\`\`\`python
def show_add(a, b):
    print(a + b)   # side effect: output

show_add(2, 3)   # fine for display only
# x = show_add(2, 3)  → x is None
\`\`\`

Display helpers may print; math helpers should return.`,
      },
      {
        title: "Caller decides to print",
        body: `Pattern: compute with return, display at the top level:

\`\`\`python
def area(w, h):
    return w * h

a = area(4, 5)
print("Area:", a)
\`\`\`

Separation makes helpers testable and reusable.`,
      },
    ],
    quizzes: [
      {
        prompt: "Which helper works in total = add(2, 3) + 1?",
        choices: [
          { id: "return", label: "def add(a,b): return a + b" },
          { id: "print", label: "def add(a,b): print(a + b)" },
          { id: "both", label: "Both equally" },
        ],
        correctId: "return",
        feedback: fb(
          "Expression needs a returned number.",
          "print leaves add(...) as None."
        ),
        difficulty: "easy",
      },
      {
        prompt: "Is print inside a function a side effect?",
        choices: [
          { id: "yes", label: "Yes — it produces output without returning the value" },
          { id: "no", label: "No — print is pure" },
          { id: "return", label: "Only if return is also used" },
        ],
        correctId: "yes",
        feedback: fb(
          "Output is an effect on the world.",
          "return gives value to caller; print displays."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What is x?",
        code: "def f(n):\n    print(n * 2)\n\nx = f(3)",
        choices: [
          { id: "none", label: "None" },
          { id: "6", label: "6" },
          { id: "3", label: "3" },
        ],
        correctId: "none",
        feedback: fb(
          "Print shows 6; assignment gets None.",
          "Need return for x to be 6."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Best split for a score calculator?",
        choices: [
          { id: "a", label: "compute() returns number; main prints it" },
          { id: "b", label: "compute() prints and returns nothing; reuse in math" },
          { id: "c", label: "One function prints and returns the same value always" },
        ],
        correctId: "a",
        feedback: fb(
          "Compute vs display separation.",
          "Return for reuse; print at call site."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Use the keyword that makes triple(n) usable in x = triple(2) + 1",
        template: "def triple(n):\n    ___ n * 3",
        answers: ["return"],
        placeholder: "…",
        feedback: fb(
          "return enables expressions.",
          "Replace print mindset with return."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Refactor: return the sum; print only in main after storing in total.",
        lines: ["return a + b", "total = add(2, 3)", 'print("Total:", total)'],
        starterCode: "def add(a, b):\n    print(a + b)\n\nadd(2, 3)\n",
        mustContain: ["return a + b", "total = add(2, 3)"],
        mustNotContain: ["print(a + b)"],
        feedback: fb(
          "Return inside; print outside.",
          "return a + b and assign before printing."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix so print(double(4) + 1) prints 9 — double must return.",
        lines: ["return n * 2"],
        starterCode: "def double(n):\n    print(n * 2)\n\nprint(double(4) + 1)\n",
        mustContain: ["return n * 2"],
        mustNotContain: ["print(n * 2)"],
        feedback: fb(
          "double(4) must be 8 for +1 → 9.",
          "Use return n * 2."
        ),
      },
    ],
  },

  common_fn_bugs: {
    explains: [
      {
        title: "Forgot ()",
        body: `Classic bug: define but never **call**:

\`\`\`python
def go():
    print("run")

go    # silent — no run
go()  # correct
\`\`\`

If nothing happens, check for missing parentheses.`,
      },
      {
        title: "Wrong argument count",
        body: `Too few or too many arguments → **TypeError**:

\`\`\`python
def greet(name):
    print(name)

greet()           # TypeError
greet("a", "b")   # TypeError — only one param
\`\`\`

Match the \`def\` parameter list.`,
      },
      {
        title: "Forgot return",
        body: `Caller expects a value but gets **None**:

\`\`\`python
def triple(n):
    print(n * 3)

x = triple(2)   # prints 6, x is None
\`\`\`

Use \`return\` when the result should be used later.`,
      },
    ],
    quizzes: [
      {
        prompt: "What is x after x = triple(2) if triple only print(n * 3)?",
        choices: [
          { id: "none", label: "None" },
          { id: "6", label: "6" },
          { id: "2", label: "2" },
        ],
        correctId: "none",
        feedback: fb(
          "print does not assign to x.",
          "Add return if x should be 6."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What error for greet() when def greet(name): ...?",
        choices: [
          { id: "type", label: "TypeError — missing argument" },
          { id: "name", label: "NameError on def" },
          { id: "none", label: "No error" },
        ],
        correctId: "type",
        feedback: fb(
          "Required param missing at call.",
          "Pass one argument."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What is wrong?",
        code: 'def hi():\nprint("hi")\n\nhi()',
        choices: [
          { id: "indent", label: "IndentationError / body not in function" },
          { id: "call", label: "hi() is wrong — use hi" },
          { id: "print", label: "print illegal in functions" },
        ],
        correctId: "indent",
        feedback: fb(
          "Body must indent under def.",
          "Fix indent before debugging calls."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Which call fails?",
        code: "def add(a, b):\n    return a + b",
        choices: [
          { id: "one", label: "add(1)" },
          { id: "two", label: "add(1, 2)" },
          { id: "zero", label: "add()" },
        ],
        correctId: "one",
        feedback: fb(
          "add(1) and add() lack the second arg.",
          "Need exactly two arguments (unless defaults)."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Fix the call — add missing parentheses.",
        template: "run___",
        answers: ["()"],
        placeholder: "…",
        feedback: fb(
          "run() executes.",
          "Add ()."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix greet call — pass one name argument.",
        lines: ['greet("Sam")'],
        starterCode: 'def greet(name):\n    print("Hi", name)\n\ngreet()\n',
        mustContain: ['greet("Sam")', 'greet(\'Sam\')'],
        mustNotContain: ["greet()"],
        feedback: fb(
          "One param → one arg.",
          "Call greet(\"Sam\")."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Fix triple so x becomes 6 — use return, not only print.",
        lines: ["return n * 3"],
        starterCode: "def triple(n):\n    print(n * 3)\n\nx = triple(2)\n",
        mustContain: ["return n * 3"],
        mustNotContain: ["print(n * 3)"],
        feedback: fb(
          "return fixes the None bug.",
          "Replace print with return n * 3."
        ),
      },
    ],
  },

  design_small: {
    explains: [
      {
        title: "One job per helper",
        body: `Split work into small, named steps:

\`\`\`python
def square(n):
    return n * n

def sum_squares(a, b):
    return square(a) + square(b)

print(sum_squares(3, 4))   # 25
\`\`\`

\`square\` does one thing; \`sum_squares\` composes it.`,
      },
      {
        title: "Read the main flow",
        body: `Top-level calls should read like a recipe:

\`\`\`python
def banner():
    print("====")

def show(title, score):
    banner()
    print(title, score)
    banner()

show("Quiz", 10)
\`\`\`

Names document intent without comments.`,
      },
      {
        title: "Avoid the mega-function",
        body: `Anti-pattern: one \`def\` that inputs, computes, formats, and prints everything.

Better:

\`\`\`python
def parse(text):
    return int(text)

def double(n):
    return n * 2

result = double(parse("5"))
print(result)
\`\`\`

Small pieces are easier to fix and reuse.`,
      },
    ],
    quizzes: [
      {
        prompt: "Why square() plus sum_squares() instead of one big function?",
        choices: [
          { id: "a", label: "Reuse square elsewhere; clearer names" },
          { id: "b", label: "Python limits function body length" },
          { id: "c", label: "Multiple defs run faster always" },
        ],
        correctId: "a",
        feedback: fb(
          "Compose small helpers.",
          "Clarity and reuse beat one blob."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What makes a good helper name?",
        choices: [
          { id: "verb", label: "Describes the job: format_price, square" },
          { id: "f1", label: "Short opaque: f1, g2" },
          { id: "long", label: "Whole sentence with spaces" },
        ],
        correctId: "verb",
        feedback: fb(
          "Name = readable intent.",
          "Avoid func1 / do_stuff."
        ),
        difficulty: "easy",
      },
      {
        prompt: "What prints?",
        code: "def a(n):\n    return n + 1\ndef b(n):\n    return a(n) * 2\n\nprint(b(3))",
        choices: [
          { id: "8", label: "8" },
          { id: "6", label: "6" },
          { id: "4", label: "4" },
        ],
        correctId: "8",
        feedback: fb(
          "a(3)=4, b returns 4*2=8.",
          "Trace helper calls step by step."
        ),
        difficulty: "hard",
      },
      {
        prompt: "Best refactor for a 40-line def that reads input, adds, and prints?",
        choices: [
          { id: "split", label: "Split into read(), add(), show() helpers" },
          { id: "copy", label: "Duplicate into two 40-line defs" },
          { id: "comment", label: "Add one big comment and keep as-is" },
        ],
        correctId: "split",
        feedback: fb(
          "Separate read / compute / display.",
          "Small named steps win."
        ),
        difficulty: "hard",
      },
    ],
    practices: [
      {
        mode: "fillBlank",
        prompt: "Call square from inside sum_squares (first term).",
        template: "    return ___(a) + square(b)",
        answers: ["square"],
        placeholder: "…",
        feedback: fb(
          "Reuse the square helper.",
          "Call square(a)."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Extract line() helper; wrap() should call line() before and after print.",
        lines: ['def line(): print("---")', "use line() in wrap"],
        starterCode: 'def wrap():\n    print("---")\n    print("core")\n    print("---")\n\nwrap()\n',
        mustContain: ["def line():", "line()"],
        mustNotContain: ['    print("---")\n    print("core")\n    print("---")'],
        feedback: fb(
          "DRY with line() helper.",
          "Define line and call it twice in wrap."
        ),
      },
      {
        mode: "miniEdit",
        prompt: "Add square(n) helper and use it in print(square(5)).",
        lines: ["def square(n): return n * n", "print(square(5))"],
        starterCode: "print(5 * 5)\n",
        mustContain: ["def square(n):", "return n * n", "square(5)"],
        feedback: fb(
          "Small helper + compose at top.",
          "Define square and print(square(5))."
        ),
      },
    ],
  },
}
