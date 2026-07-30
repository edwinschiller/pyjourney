import type { Metadata } from "next"

import { LegalPage, LegalSection } from "@/components/layout/legal-page"

export const metadata: Metadata = {
  title: "Privacy Policy · PyJourney",
  description: "How PyJourney processes personal data.",
}

const CONTACT_HREF = "https://edwinschiller.com/#contact"

const PrivacyPage = () => {
  return (
    <LegalPage title="Privacy Policy">
      <p className="text-[var(--app-fg)]">
        This notice explains how personal data is processed when you use
        PyJourney.
      </p>

      <LegalSection title="1. Controller">
        <p>
          Edwin Schiller
          <br />
          Contact:{" "}
          <a
            href={CONTACT_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--app-accent)] hover:underline"
          >
            contact form
          </a>
        </p>
      </LegalSection>

      <LegalSection title="2. What we process">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Account data (email, password hash via Neon Auth, role, display
            name)
          </li>
          <li>Classroom membership and assignment status</li>
          <li>
            Learning progress, lesson events, mastery signals, and saved
            programs
          </li>
          <li>
            Optional AI requests (assistant help, hints, insight reports,
            apply review) and related context
          </li>
          <li>
            Technical data needed to run the service (for example IP address
            and timestamps via hosting/auth providers)
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Purposes and legal bases">
        <p>
          We process data to provide the learning platform, manage accounts and
          classrooms, support teaching insights, and offer optional AI
          assistance.
        </p>
        <p>
          Legal bases include Art. 6(1)(b) GDPR (providing the service), Art.
          6(1)(f) GDPR (secure operation), and where required Art. 6(1)(a) GDPR
          (consent).
        </p>
      </LegalSection>

      <LegalSection title="4. Recipients">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Neon</strong> — authentication and Postgres database
          </li>
          <li>
            <strong>Vercel</strong> — application hosting
          </li>
          <li>
            <strong>OpenAI</strong> — optional AI features; prompts may include
            lesson context or code snippets you submit
          </li>
        </ul>
        <p>
          Where providers process data outside the EU/EEA, appropriate
          safeguards (such as standard contractual clauses) apply.
        </p>
      </LegalSection>

      <LegalSection title="5. Retention">
        <p>
          Data is kept while your account is active and as long as needed for
          the stated purposes. After account deletion, personal data is deleted
          or anonymized unless legal retention rules require otherwise.
        </p>
      </LegalSection>

      <LegalSection title="6. Cookies and local storage">
        <p>
          PyJourney uses technically necessary storage (for example auth
          session cookies and a theme preference in local storage). It does not
          use marketing cookies. Aggregated traffic data may be collected via
          Vercel Web Analytics, which is designed to work without advertising
          cookies.
        </p>
      </LegalSection>

      <LegalSection title="7. Your rights">
        <p>
          You may request access, rectification, erasure, restriction,
          portability, and objection under the GDPR, and you may lodge a
          complaint with a supervisory authority (for example the Saxon Data
          Protection Commissioner).
        </p>
        <p>
          Please use the{" "}
          <a
            href={CONTACT_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--app-accent)] hover:underline"
          >
            contact form
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="8. School use">
        <p>
          When PyJourney is used in schools, teachers and schools remain
          responsible for obtaining any required consents and for the lawful
          basis of processing student data in that context.
        </p>
      </LegalSection>

      <p className="text-xs">
        Last updated:{" "}
        {new Date().toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })}
      </p>
    </LegalPage>
  )
}

export default PrivacyPage
