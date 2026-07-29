/**
 * Replaces builtins.input with a prefilled queue.
 * No run_sync — works without WebAssembly stack switching.
 */
export const PYTHON_INPUT_SETUP = `
import builtins

__learnify_inputs = list(__learnify_inputs)

def __learnify_input(prompt=""):
    if prompt:
        print(prompt, end="")
    if not __learnify_inputs:
        raise EOFError("No more input available.")
    value = str(__learnify_inputs.pop(0))
    print(value)
    return value

builtins.input = __learnify_input
`

const decodePythonStringLiteral = (literal: string): string => {
  const quote = literal[0]
  if (quote !== '"' && quote !== "'") return literal
  if (literal.length < 2 || literal[literal.length - 1] !== quote) {
    return literal
  }

  return literal
    .slice(1, -1)
    .replace(/\\\\/g, "\\")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
}

/**
 * Static input() calls in source (student code; not loops with dynamic count).
 */
export const extractInputPrompts = (code: string): string[] => {
  const prompts: string[] = []
  const callPattern = /\binput\s*\(/g
  let match = callPattern.exec(code)

  while (match !== null) {
    let index = match.index + match[0].length

    while (index < code.length && /\s/.test(code[index])) {
      index += 1
    }

    if (index >= code.length || code[index] === ")") {
      prompts.push("")
      match = callPattern.exec(code)
      continue
    }

    const quote = code[index]
    if (quote !== '"' && quote !== "'") {
      prompts.push("")
      match = callPattern.exec(code)
      continue
    }

    let cursor = index + 1
    let escaped = false
    let closed = false

    while (cursor < code.length) {
      const char = code[cursor]
      if (escaped) {
        escaped = false
        cursor += 1
        continue
      }
      if (char === "\\") {
        escaped = true
        cursor += 1
        continue
      }
      if (char === quote) {
        prompts.push(decodePythonStringLiteral(code.slice(index, cursor + 1)))
        closed = true
        break
      }
      cursor += 1
    }

    if (!closed) {
      prompts.push("")
    }

    match = callPattern.exec(code)
  }

  return prompts
}

export const collectPythonInputs = async (
  prompts: string[],
  requestValue: (
    prompt: string,
    index: number,
    total: number
  ) => Promise<string | null>
): Promise<string[] | null> => {
  const values: string[] = []

  for (let index = 0; index < prompts.length; index += 1) {
    const value = await requestValue(prompts[index], index, prompts.length)
    if (value === null) {
      return null
    }
    values.push(value)
  }

  return values
}
