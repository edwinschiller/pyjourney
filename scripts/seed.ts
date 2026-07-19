import { config } from "dotenv"

import { seedAcademy, seedConcepts } from "../lib/db/seed"

config({ path: ".env.local" })

const main = async () => {
  const concepts = await seedConcepts()
  console.log(
    `Seeded ${concepts.concepts} concepts and ${concepts.prerequisites} prerequisites.`
  )

  const academy = await seedAcademy()
  console.log(
    `Seeded classroom "${academy.name}" (join code: ${academy.joinCode}).`
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
