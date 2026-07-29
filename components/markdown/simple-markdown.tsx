import type { ReactNode } from "react"

import {
  splitMarkdownSegments,
} from "@/lib/markdown/fences"
import { cn } from "@/lib/utils"

const renderInline = (text: string, keyPrefix: string): ReactNode[] => {
  const nodes: ReactNode[] = []
  const pattern = /(\*\*[^*]+\*\*|`[^`\n]+`|\*[^*]+\*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let partIndex = 0

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }
    const token = match[0]
    const key = `${keyPrefix}-${partIndex++}`
    if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold text-[var(--app-fg)]">
          {token.slice(2, -2)}
        </strong>
      )
    } else if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(
        <code
          key={key}
          className="rounded-md bg-[var(--app-bg)] px-1.5 py-0.5 font-mono text-[0.9em] text-[var(--brand-navy)] dark:text-[var(--app-fg)]"
        >
          {token.slice(1, -1)}
        </code>
      )
    } else if (token.startsWith("*") && token.endsWith("*")) {
      nodes.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>
      )
    } else {
      nodes.push(token)
    }
    lastIndex = match.index + token.length
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes.length > 0 ? nodes : [text]
}

type SimpleMarkdownProps = {
  content: string
  className?: string
  proseClassName?: string
  codeClassName?: string
}

export const SimpleMarkdown = ({
  content,
  className,
  proseClassName,
  codeClassName,
}: SimpleMarkdownProps) => {
  const segments = splitMarkdownSegments(content)

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {segments.map((segment, index) => {
        if (segment.type === "code") {
          return (
            <pre
              key={`code-${index}`}
              className={cn(
                "overflow-x-auto rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4 font-mono text-sm leading-relaxed whitespace-pre shadow-inner",
                codeClassName
              )}
            >
              <code>{segment.code}</code>
            </pre>
          )
        }

        const trimmed = segment.text.trim()
        if (!trimmed) return null

        const paragraphs = trimmed.split(/\n{2,}/)
        return (
          <div key={`text-${index}`} className="flex flex-col gap-3">
            {paragraphs.map((paragraph, paragraphIndex) => (
              <p
                key={`p-${index}-${paragraphIndex}`}
                className={cn(
                  "text-[15px] leading-relaxed whitespace-pre-wrap text-[var(--app-muted)]",
                  proseClassName
                )}
              >
                {renderInline(paragraph, `${index}-${paragraphIndex}`)}
              </p>
            ))}
          </div>
        )
      })}
    </div>
  )
}
