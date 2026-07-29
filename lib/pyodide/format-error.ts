import { STUDENT_CODE_FILENAME } from "./run-guard"

const TRACEBACK_HEADING = "Traceback (most recent call last):"
const DISPLAY_FILENAME = "your code"

/**
 * Keep Python's useful exception details while removing Pyodide and execution
 * wrapper frames that do not help a learner fix their program.
 */
export const formatPythonError = (value: string, source?: string) => {
  const normalized = value.replace(/\r\n?/g, "\n").trim()
  if (!normalized) return ""

  const lines = normalized.split("\n")
  const studentFrameIndex = lines.findIndex((line) =>
    line.includes(`File "${STUDENT_CODE_FILENAME}"`)
  )

  if (studentFrameIndex < 0) {
    return normalized
  }

  const hasTraceback = lines
    .slice(0, studentFrameIndex)
    .some((line) => line.trim() === TRACEBACK_HEADING)
  const usefulLines = lines
    .slice(studentFrameIndex)
    .map((line) =>
      line.replace(
        `File "${STUDENT_CODE_FILENAME}"`,
        `File "${DISPLAY_FILENAME}"`
      )
    )

  const learnerLines = usefulLines.filter((line, index) => {
    const isInternalFrame =
      /^\s*File "/.test(line) && !line.includes(`File "${DISPLAY_FILENAME}"`)
    if (isInternalFrame) return false

    const previousLine = usefulLines[index - 1]
    const followsInternalFrame =
      line.startsWith("    ") &&
      /^\s*File "/.test(previousLine ?? "") &&
      !previousLine?.includes(`File "${DISPLAY_FILENAME}"`)
    return !followsInternalFrame
  })

  const sourceLines = source?.split("\n")
  const withSourceContext = learnerLines.flatMap((line, index) => {
    const match = line.match(/File "your code", line (\d+)/)
    if (!match || !sourceLines) return [line]

    const nextLine = learnerLines[index + 1]
    const alreadyHasSource = Boolean(nextLine?.startsWith("    "))
    if (alreadyHasSource) return [line]

    const sourceLine = sourceLines[Number(match[1]) - 1]?.trim()
    return sourceLine ? [line, `    ${sourceLine}`] : [line]
  })

  const dedupedFrames: string[] = []
  for (let index = 0; index < withSourceContext.length; index += 1) {
    const line = withSourceContext[index]
    const sourceLine = withSourceContext[index + 1]
    const repeatsPreviousFrame =
      line.includes(`File "${DISPLAY_FILENAME}"`) &&
      sourceLine?.startsWith("    ") &&
      dedupedFrames.at(-2) === line &&
      dedupedFrames.at(-1) === sourceLine

    if (repeatsPreviousFrame) {
      index += 1
      continue
    }
    dedupedFrames.push(line)
  }

  return [
    ...(hasTraceback ? [TRACEBACK_HEADING] : []),
    ...dedupedFrames,
  ].join("\n")
}
