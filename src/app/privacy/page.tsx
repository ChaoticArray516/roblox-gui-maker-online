import type { Metadata } from "next";

import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Privacy Policy`,
  description:
    "How Roblox GUI Maker collects, uses, and protects your data — accounts, payments, analytics, and your rights.",
  alternates: { canonical: "/privacy" },
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-xl font-semibold text-text">{title}</h2>
      {children}
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-24 text-sm leading-7 text-text-muted">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-text">
          Privacy Policy
        </h1>
        <p>Last updated: August 2026</p>
      </header>

      <Section title="Overview">
        <p>
          {SITE_NAME} (&quot;we&quot;, &quot;us&quot;) operates{" "}
          roblox-gui-maker.online, a web-based tool for building Roblox game
          interfaces and exporting Luau code. This policy explains what data we
          collect, why, and the choices you have. {SITE_NAME} is an unofficial
          third-party tool and is not affiliated with or endorsed by Roblox
          Corporation.
        </p>
      </Section>

      <Section title="Data We Collect">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-text">Account data</strong> — when you sign
            up or log in (email + password, or Google / GitHub OAuth), we store
            your email address, display name, and authentication identifiers via
            Supabase Auth.
          </li>
          <li>
            <strong className="text-text">Project data</strong> — GUI projects
            you save in the editor (element trees stored as JSON), tied to your
            account.
          </li>
          <li>
            <strong className="text-text">Payment data</strong> — payments are
            processed by Creem. We receive your email, purchase status, and
            transaction IDs; we never see or store your card number.
          </li>
          <li>
            <strong className="text-text">Usage analytics</strong> — anonymous
            page-view and interaction statistics via Google Analytics 4.
          </li>
          <li>
            <strong className="text-text">AI prompts</strong> — text prompts you
            submit to the AI generator are sent to OpenRouter to produce GUI
            output.
          </li>
        </ul>
      </Section>

      <Section title="Cookies">
        <p>
          We use essential cookies to keep you signed in (Supabase session
          cookies) and analytics cookies from Google Analytics 4 to understand
          aggregate usage. We do not use advertising or cross-site tracking
          cookies.
        </p>
      </Section>

      <Section title="Third-Party Processors">
        <ul className="list-disc space-y-2 pl-5">
          <li>Supabase — authentication and database hosting</li>
          <li>Google / GitHub — OAuth sign-in providers</li>
          <li>OpenRouter — AI model inference for GUI generation</li>
          <li>Creem — payment processing and subscription billing</li>
          <li>Vercel — website hosting and delivery</li>
          <li>Google Analytics 4 — anonymized usage analytics</li>
        </ul>
        <p>
          Each processor handles data under its own privacy policy; we share
          only the minimum required for the service to function.
        </p>
      </Section>

      <Section title="Data Retention &amp; Deletion">
        <p>
          We keep your account and project data while your account is active.
          To delete your account and all associated data (projects, credits
          history, purchase records), email us at{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-cyan-accent underline hover:opacity-80"
          >
            {SUPPORT_EMAIL}
          </a>{" "}
          — we complete verified deletion requests within 30 days.
        </p>
      </Section>

      <Section title="Your Rights">
        <p>
          You may request a copy of your data, correction of inaccurate data,
          deletion of your account, or export of your saved projects at any
          time by contacting us at the address below. If you are in the EEA/UK,
          you also have the right to lodge a complaint with your local data
          protection authority.
        </p>
      </Section>

      <Section title="Children">
        <p>
          The service is not directed at children under 13, and we do not
          knowingly collect personal data from children under 13.
        </p>
      </Section>

      <Section title="Changes &amp; Contact">
        <p>
          We may update this policy; material changes will be noted on this page
          with a new &quot;Last updated&quot; date. Questions about privacy or
          data requests:{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-cyan-accent underline hover:opacity-80"
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </Section>
    </main>
  );
}
