import { eq } from "drizzle-orm"

import { ACADEMY_JOIN_CODE } from "@/lib/db/constants"
import { getDb } from "@/lib/db"
import { classrooms } from "@/lib/db/schema"

const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ"
const DIGITS = "23456789"

const pick = (alphabet: string) =>
  alphabet[Math.floor(Math.random() * alphabet.length)] ?? alphabet[0]

/** Format: PY-XX-NNN (avoids ambiguous characters) */
export const generateJoinCodeCandidate = () =>
  `PY-${pick(LETTERS)}${pick(LETTERS)}-${pick(DIGITS)}${pick(DIGITS)}${pick(DIGITS)}`

export const normalizeJoinCode = (raw: string) =>
  raw.trim().toUpperCase().replace(/\s+/g, "")

export const isReservedJoinCode = (code: string) =>
  normalizeJoinCode(code) === ACADEMY_JOIN_CODE

export const allocateUniqueJoinCode = async (maxAttempts = 12) => {
  const db = getDb()

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = generateJoinCodeCandidate()
    if (isReservedJoinCode(candidate)) {
      continue
    }

    const existing = await db
      .select({ id: classrooms.id })
      .from(classrooms)
      .where(eq(classrooms.joinCode, candidate))
      .limit(1)

    if (existing.length === 0) {
      return candidate
    }
  }

  throw new Error("Could not allocate a unique join code")
}
