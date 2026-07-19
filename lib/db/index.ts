import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

import * as schema from "./schema"

const createDb = () => {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL is not set")
  }

  const sql = neon(url)
  return drizzle(sql, { schema })
}

export type Db = ReturnType<typeof createDb>

let dbInstance: Db | null = null

export const getDb = (): Db => {
  if (!dbInstance) {
    dbInstance = createDb()
  }
  return dbInstance
}

export * from "./schema"
