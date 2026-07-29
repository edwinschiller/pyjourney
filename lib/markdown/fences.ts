export type MarkdownSegment =
  | { type: "text"; text: string }
  | { type: "code"; language: string | null; code: string }

const FENCE_OPEN = /```([a-zA-Z0-9_+-]*)[ \t]*/g

/** Turn literal "\\n" into real newlines (common LLM artifact). */
export const unescapeLiteralNewlines = (value: string) =>
  value.replace(/\\n/g, "\n").replace(/\\t/g, "\t")

/**
 * When models collapse Python onto one line, insert reasonable breaks.
 * Leaves multi-line code untouched.
 */
export const expandCollapsedPython = (code: string) => {
  let next = unescapeLiteralNewlines(code).trim()
  if (!next || next.includes("\n")) {
    return next
  }

  next = next
    .replace(/\s+\b(elif|else|except|finally)\b/g, "\n$1")
    .replace(/([^\n])\s+\b(if|for|while|def|class|try|with)\b/g, "$1\n$2")
    .replace(/:\s+(?=\S)/g, ":\n    ")

  return next
}

export const formatFencedCode = (language: string | null, code: string) => {
  const trimmed = unescapeLiteralNewlines(code).replace(/^\n+|\n+$/g, "")
  const lang = language?.toLowerCase() ?? ""
  if (lang === "python" || lang === "py" || lang === "") {
    return expandCollapsedPython(trimmed)
  }
  return trimmed
}

/**
 * Split markdown into prose and fenced code segments.
 * Handles same-line fences and unclosed opening fences.
 */
export const splitMarkdownSegments = (markdown: string): MarkdownSegment[] => {
  const source = unescapeLiteralNewlines(markdown)
  const segments: MarkdownSegment[] = []
  let cursor = 0

  while (cursor < source.length) {
    FENCE_OPEN.lastIndex = cursor
    const open = FENCE_OPEN.exec(source)
    if (!open || open.index == null) {
      const rest = source.slice(cursor)
      if (rest) segments.push({ type: "text", text: rest })
      break
    }

    if (open.index > cursor) {
      segments.push({ type: "text", text: source.slice(cursor, open.index) })
    }

    const language = open[1] || null
    const contentStart = open.index + open[0].length
    const closeIndex = source.indexOf("```", contentStart)

    if (closeIndex === -1) {
      segments.push({
        type: "code",
        language,
        code: formatFencedCode(language, source.slice(contentStart)),
      })
      break
    }

    segments.push({
      type: "code",
      language,
      code: formatFencedCode(
        language,
        source.slice(contentStart, closeIndex)
      ),
    })
    cursor = closeIndex + 3
  }

  return segments.length > 0 ? segments : [{ type: "text", text: source }]
}

/**
 * Prefer well-formed fences for storage / AI cleanup:
 * put ```lang and closing ``` on their own lines.
 */
export const normalizeMarkdownFences = (markdown: string): string =>
  splitMarkdownSegments(markdown)
    .map((segment) => {
      if (segment.type === "text") return segment.text
      const lang = segment.language || "python"
      return `\n\`\`\`${lang}\n${segment.code}\n\`\`\`\n`
    })
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
