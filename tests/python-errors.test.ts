import assert from "node:assert/strict"
import test from "node:test"

import { formatPythonError } from "../lib/pyodide/format-error"
import { wrapPythonWithExecutionGuard } from "../lib/pyodide/run-guard"

test("compiles learner code with its own traceback filename and line numbers", () => {
  const code = 'print("first")\nprint(missing_name)'
  const wrapped = wrapPythonWithExecutionGuard(code, 123)

  assert.match(wrapped, /_exec_limit = 123/)
  assert.ok(
    wrapped.includes(`_student_source = ${JSON.stringify(code)}`)
  )
  assert.match(
    wrapped,
    /compile\(_student_source, "<student-code>", "exec"\)/
  )
  assert.doesNotMatch(wrapped, /    print\("first"\)/)
})

test("removes Pyodide frames but keeps learner frames and the exception", () => {
  const raw = `Traceback (most recent call last):
  File "/lib/python313.zip/_pyodide/_base.py", line 597, in eval_code_async
    await CodeRunner(...)
  File "<student-code>", line 2, in <module>
    print(missing_name)
NameError: name 'missing_name' is not defined`

  assert.equal(
    formatPythonError(raw),
    `Traceback (most recent call last):
  File "your code", line 2, in <module>
    print(missing_name)
NameError: name 'missing_name' is not defined`
  )
})

test("keeps nested learner frames", () => {
  const raw = `Traceback (most recent call last):
  File "/lib/python313.zip/_pyodide/_base.py", line 411, in run_async
  File "<student-code>", line 5, in <module>
    greet()
  File "<student-code>", line 2, in greet
    print(name)
NameError: name 'name' is not defined`

  const formatted = formatPythonError(raw)
  assert.match(formatted, /File "your code", line 5/)
  assert.match(formatted, /File "your code", line 2/)
  assert.doesNotMatch(formatted, /_pyodide/)
})

test("restores the learner's source line when the runtime omits it", () => {
  const raw = `Traceback (most recent call last):
  File "/lib/python313.zip/_pyodide/_base.py", line 411, in run_async
  File "<student-code>", line 2, in <module>
NameError: name 'missing_name' is not defined`

  assert.equal(
    formatPythonError(raw, 'print("before")\nprint(missing_name)'),
    `Traceback (most recent call last):
  File "your code", line 2, in <module>
    print(missing_name)
NameError: name 'missing_name' is not defined`
  )
})

test("removes execution-guard frames that follow learner frames", () => {
  const raw = `Traceback (most recent call last):
  File "<student-code>", line 2, in <module>
  File "<student-code>", line 2, in <module>
  File "<stdin>", line 11, in _exec_tracer
KeyboardInterrupt: Execution stopped: possible infinite loop.`

  const formatted = formatPythonError(raw, "while True:\n    pass")
  assert.match(formatted, /File "your code", line 2/)
  assert.equal(formatted.match(/File "your code", line 2/g)?.length, 1)
  assert.match(formatted, /KeyboardInterrupt: Execution stopped/)
  assert.doesNotMatch(formatted, /<stdin>|_exec_tracer/)
})

test("keeps syntax-error context without inventing a traceback heading", () => {
  const raw = `  File "<student-code>", line 1
    print(
         ^
SyntaxError: '(' was never closed`

  assert.equal(
    formatPythonError(raw),
    `File "your code", line 1
    print(
         ^
SyntaxError: '(' was never closed`
  )
})

test("leaves runtime and timeout messages unchanged", () => {
  assert.equal(
    formatPythonError("Execution timed out after 8000ms.\n"),
    "Execution timed out after 8000ms."
  )
})
