# PyJourney

Adaptive Python learning that turns a student's learning process into the next useful step for both the learner and the teacher.

PyJourney is a submission for the [Prometheus July AI Challenge](https://prometheus-july-ai-challenge.devpost.com/). It combines a curriculum-bounded lesson engine, in-browser Python practice, explainable adaptation, and aggregated classroom signals.

## Try the story first

Open [`/demo`](http://localhost:3000/demo) for a public, synthetic, roughly 75-second walkthrough:

1. A learner uses `==` where Python needs `=`.
2. PyJourney combines the checked result, the edit pattern, and the active curriculum node.
3. The learner receives a focused contrast instead of a full answer.
4. The next edit becomes evidence that the intervention transferred.
5. The teacher sees an aggregated class pattern and a concrete three-minute teaching move.

The walkthrough is clearly marked as synthetic and does not require an account, a database, or live learner data.

## The product thesis

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

This makes the AI useful without making the learning sequence opaque or fragile.

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

Key implementation choices:

- Next.js App Router with server components and server actions
- TypeScript and Zod schemas for lesson and AI outputs
- Neon Postgres, Drizzle ORM, and Neon Auth
- Vercel AI SDK with OpenAI
- Monaco Editor and Pyodide for in-browser Python
- Tailwind CSS and Radix UI

## Safety and privacy boundaries

- Existing profile roles are authoritative; login requests cannot promote a student to teacher.
- Teacher insights use aggregated checks and misconception counts, not raw student code.
- AI outputs are schema-validated and constrained to the active curriculum node.
- The app has a deterministic fallback for the core lesson flow.
- Demo data is fictional and explicitly labeled.

Before a real school pilot, add a complete consent, retention, deletion, and data-processing policy. See the current product analysis for the remaining authorization and privacy hardening work.

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

Open [http://localhost:3000](http://localhost:3000). The public judge walkthrough is at [http://localhost:3000/demo](http://localhost:3000/demo).

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
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Suggested two-minute demo

- **0:00–0:15 — Problem:** final answers hide the learning process; teachers see results too late.
- **0:15–0:55 — Student loop:** run the synthetic mistake, show the bounded remediation, replay the correction.
- **0:55–1:25 — Teacher loop:** open the class pattern and the three-minute intervention.
- **1:25–1:45 — Technical point:** deterministic policy + curriculum boundaries + structured AI + fallback.
- **1:45–2:00 — Impact:** one evidence trail improves the next learner step and the next teacher action.

## Repository status

This is a hackathon build. The core product loop is implemented, but production deployment should also address dependency advisories, route-level authorization checks, rate limits, and formal student-data controls.

Assignments are available for teachers: assign a concept to a class so it becomes each student’s next focus. Completion updates when the lesson is finished.
