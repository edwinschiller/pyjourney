import { config } from "dotenv"

import { seedConcepts } from "../lib/db/seed"

config({ path: ".env.local" })

const main = async () => {
  const result = await seedConcepts()
  console.log(
    `Seeded ${result.concepts} concepts and ${result.prerequisites} prerequisites.`
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
