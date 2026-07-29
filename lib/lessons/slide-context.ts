import type { LessonBlock } from "@/lib/ai/schemas/lesson-blocks"

/** Compact title/prompt for hints and assistant headers. */
export const slidePromptForBlock = (block: LessonBlock): string => {
  switch (block.kind) {
    case "explain":
      return block.title ?? "Explanation"
    case "quiz":
    case "practice":
      return block.prompt
    case "apply":
      return block.title
    case "complete":
      return block.title
  }
}

/**
 * Full slide content the assistant must see — not just the heading.
 * Includes requirements, choices, starter code, and criteria.
 */
export const slideBodyForBlock = (block: LessonBlock): string => {
  switch (block.kind) {
    case "explain":
      return [block.title ? `# ${block.title}` : null, block.body]
        .filter(Boolean)
        .join("\n\n")
    case "quiz":
      return [
        block.prompt,
        block.code ? `Code on slide:\n\`\`\`python\n${block.code}\n\`\`\`` : null,
        "Choices:",
        ...block.choices.map((choice) => `- (${choice.id}) ${choice.label}`),
      ]
        .filter(Boolean)
        .join("\n")
    case "practice":
      if (block.mode === "fillBlank") {
        return [
          block.prompt,
          block.template ? `Template:\n${block.template}` : null,
        ]
          .filter(Boolean)
          .join("\n\n")
      }
      return [
        block.prompt,
        block.lines?.length
          ? `Requirements:\n${block.lines.map((line) => `- ${line}`).join("\n")}`
          : null,
        block.mustContain?.length
          ? `Must include: ${block.mustContain.map((item) => `\`${item}\``).join(", ")}`
          : null,
        block.starterCode
          ? `Starter code:\n\`\`\`python\n${block.starterCode}\n\`\`\``
          : null,
      ]
        .filter(Boolean)
        .join("\n\n")
    case "apply":
      return [
        block.brief,
        "Success criteria:",
        ...block.criteria.map((criterion) => `- ${criterion}`),
        block.starterCode
          ? `Starter:\n\`\`\`python\n${block.starterCode}\n\`\`\``
          : null,
      ]
        .filter(Boolean)
        .join("\n")
    case "complete":
      return block.body
  }
}
