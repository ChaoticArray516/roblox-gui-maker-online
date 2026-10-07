import type { Metadata } from "next";

import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Terms of Service`,
  description:
    "Terms of Service for Roblox GUI Maker — accounts, subscriptions, refunds, acceptable use, and intellectual property.",
  alternates: { canonical: "/terms" },
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

export default function TermsPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-24 text-sm leading-7 text-text-muted">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-text">
          Terms of Service
        </h1>
        <p>Last updated: August 2026</p>
      </header>

      <Section title="1. The Service">
        <p>
          {SITE_NAME} provides a browser-based visual editor for designing
          Roblox game interfaces, AI-assisted GUI generation, and export of
          ready-to-use Luau code. {SITE_NAME} is an unofficial third-party tool
          and is not affiliated with, sponsored, or endorsed by Roblox
          Corporation. By using the service you agree to these terms.
        </p>
      </Section>

      <Section title="2. Accounts &amp; Plans">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-text">Free plan ($0)</strong> — 50 AI
            generation credits per month, full editor access.
          </li>
          <li>
            <strong className="text-text">Pro subscription ($9.99/month)</strong>{" "}
            — unlimited AI generation. You can cancel anytime; access continues
            until the end of the current paid period, and no further charges
            occur.
          </li>
          <li>
            <strong className="text-text">Premium templates ($9.99 one-time)</strong>{" "}
            — individual template purchases grant lifetime access to that
            template in your account.
          </li>
        </ul>
        <p>
          Payments are processed by Creem. You are responsible for keeping your
          account credentials confidential.
        </p>
      </Section>

      <Section title="3. Refunds">
        <p>
          Pro subscriptions come with a 14-day money-back guarantee: email{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-cyan-accent underline hover:opacity-80"
          >
            {SUPPORT_EMAIL}
          </a>{" "}
          within 14 days of your first charge for a full refund. Template
          purchases can be refunded within 14 days if the template is broken or
          materially different from its description.
        </p>
      </Section>

      <Section title="4. Acceptable Use">
        <p>
          You agree not to use the service for unlawful content, to abuse or
          overload the AI generation endpoints, to resell access to your
          account, or to misrepresent the service as an official Roblox
          product.
        </p>
      </Section>

      <Section title="5. Intellectual Property">
        <p>
          Luau code and GUI layouts you create and export with the editor are
          yours — use them in your own Roblox projects freely, including
          commercially. Purchased templates are licensed for use in your own
          Roblox projects; you may not redistribute or resell the templates
          themselves. The {SITE_NAME} website, editor, and brand remain our
          property.
        </p>
      </Section>

      <Section title="6. Disclaimers &amp; Limitation of Liability">
        <p>
          The service is provided &quot;as is&quot; without warranties of any
          kind. We do not guarantee uninterrupted availability or that generated
          code will be error-free. To the maximum extent permitted by law, our
          total liability for any claim related to the service is limited to the
          amount you paid us in the 12 months preceding the claim.
        </p>
      </Section>

      <Section title="7. Changes &amp; Contact">
        <p>
          We may update these terms; material changes will be posted on this
          page with a new &quot;Last updated&quot; date. Questions about these
          terms, billing, or support:{" "}
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
