import { createHash } from "crypto"

export const hashCode = (code: string) =>
  createHash("sha256").update(code).digest("hex")

export const diffMagnitude = (prev: string | null | undefined, next: string) => {
  if (!prev) return next.length
  if (prev === next) return 0
  const a = prev
  const b = next
  let i = 0
  while (i < a.length && i < b.length && a[i] === b[i]) i += 1
  let j = 0
  while (
    j < a.length - i &&
    j < b.length - i &&
    a[a.length - 1 - j] === b[b.length - 1 - j]
  ) {
    j += 1
  }
  return Math.abs(a.length - i - j) + Math.abs(b.length - i - j)
}
