import { PYODIDE_MAX_EXECUTION_STEPS } from "./protocol"

export const STUDENT_CODE_FILENAME = "<student-code>"

/** Wrap user code with a line-step guard to stop runaway loops. */
export const wrapPythonWithExecutionGuard = (
  userCode: string,
  maxSteps = PYODIDE_MAX_EXECUTION_STEPS
) => {
  const source = JSON.stringify(userCode)

  return `
import sys as _sys
_exec_steps = [0]
_exec_limit = ${maxSteps}
_student_source = ${source}

def _exec_tracer(frame, event, arg):
    if event == "line":
        _exec_steps[0] += 1
        if _exec_steps[0] > _exec_limit:
            raise KeyboardInterrupt(
                "Execution stopped: possible infinite loop "
                f"(more than {_exec_limit} steps)."
            )
    return _exec_tracer

_sys.settrace(_exec_tracer)
try:
    exec(
        compile(_student_source, "${STUDENT_CODE_FILENAME}", "exec"),
        globals(),
        globals(),
    )
finally:
    _sys.settrace(None)
`
}
