# PyJourney

Adaptive Python learning that turns a student's learning process into the next useful step for both the learner and the teacher.

PyJourney is a submission for the [Prometheus July AI Challenge](https://prometheus-july-ai-challenge.devpost.com/). It combines a curriculum-bounded lesson engine, in-browser Python practice, explainable adaptation, and aggregated classroom signals.

## Product demo

Open [`/demo`](http://localhost:3000/demo) for a short public walkthrough with synthetic data (no account required):

1. A learner uses `==` where Python needs `=`.
2. PyJourney combines the checked result, the edit pattern, and the active curriculum node.
3. The learner receives a focused contrast instead of a full answer.
4. The next edit becomes evidence that the intervention transferred.
5. The teacher sees an aggregated class pattern and a concrete next teaching move.

## How it works

Most coding tutors optimize for answering the current question. PyJourney optimizes for the learning loop:

```text
attempt → evidence → bounded learning step → fresh check → classroom action
```

That creates three linked product surfaces:

- **Student learning path:** prerequisite-aware concepts, adaptive lessons, staged practice, and explicit “Why this step?” evidence.
- **Python workspace:** browser-based Python execution for practice without local setup.
- **Teacher insight:** aggregated struggle patterns, transparent prioritization, and a recommended next teaching move without exposing raw student code.

## What is adaptive

PyJourney separates pedagogical policy from generated content:

- A deterministic policy chooses the next intent: explain, quiz, practice, remediate, apply, or complete.
- Curated curriculum definitions constrain scope, misconceptions, mastery checks, and application criteria.
- When OpenAI is configured, the model fills a bounded lesson-block schema and reviews open application work against explicit criteria.
- Without an API key—or when generation fails—the same flow continues from deterministic content banks and rule-based review.
- Mastery and prerequisite unlocks remain governed by recorded checks and policy thresholds.

## Architecture

```mermaid
flowchart LR
    A[Student attempt] --> B[Deterministic checks]
    A --> C[Lesson events]
    B --> D[Pedagogical policy]
    C --> D
    E[Curriculum boundaries] --> D
    D --> F[Bounded AI generation]
    D --> G[Deterministic content fallback]
    F --> H[Next lesson step]
    G --> H
    C --> I[Aggregated learner memory]
    I --> J[Teacher intervention radar]
```

Stack:

- Next.js App Router with server components and server actions
- TypeScript and Zod schemas for lesson and AI outputs
- Neon Postgres, Drizzle ORM, and Neon Auth
- Vercel AI SDK with OpenAI
- Monaco Editor and Pyodide for in-browser Python
- Tailwind CSS and Radix UI

## Safety and privacy

- Existing profile roles are authoritative; login requests cannot promote a student to teacher.
- Teacher insights use aggregated checks and misconception counts, not raw student code.
- AI outputs are schema-validated and constrained to the active curriculum node.
- The core lesson flow has a deterministic fallback.
- Demo data is fictional and explicitly labeled.

## Local setup

Requirements:

- Node.js 20+
- A Neon project with Postgres and Neon Auth
- An OpenAI API key for generated variants; optional for the deterministic experience

```bash
npm ci
cp .env.example .env.local
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Product demo: [http://localhost:3000/demo](http://localhost:3000/demo).

Environment variables:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require
NEON_AUTH_BASE_URL=https://ep-xxx.neonauth.<region>.aws.neon.tech/neondb/auth
NEON_AUTH_COOKIE_SECRET=replace-with-at-least-32-characters
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

Never commit real credentials.

## Useful commands

```bash
npm run dev
npm run build
npm run lint
npm run test:auth-role
npm run test:python-errors
npm run test:lesson-integrity
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Notes

Assignments let teachers point a class at a concept as each student’s next focus. Completion updates when the lesson is finished.
