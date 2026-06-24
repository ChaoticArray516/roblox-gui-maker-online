import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PRICING_PLANS } from "@/lib/constants";
import { SITE_NAME } from "@/lib/site-config";
import { PricingJsonLd } from "@/components/seo";

export const metadata: Metadata = {
  title: `${SITE_NAME} Pricing: Free & Pro Plans`,
  description:
    "Compare Roblox GUI Maker Free and Pro plans. Free credits forever, unlimited Pro generations, and a Studio plugin alternative to Roblox built-in UI editor.",
  alternates: { canonical: "/pricing" },
};

// Feature comparison rows — Free vs Pro
const COMPARISON_ROWS: { label: string; free: string; pro: string }[] = [
  { label: "Drag-and-drop editor", free: "Yes", pro: "Yes" },
  { label: "AI generation credits", free: "50 / month", pro: "Unlimited" },
  { label: "Luau code export", free: "Yes", pro: "Yes" },
  { label: "Template library", free: "Free templates", pro: "Free + Premium" },
  { label: "Figma → Roblox import", free: "—", pro: "Priority" },
  { label: "Studio plugin", free: "Community tier", pro: "Pro features" },
  { label: "Support", free: "Community", pro: "Priority email" },
];

// Pricing FAQ — kept in sync with PricingJsonLd FAQPage mainEntity (4 entries)
const PRICING_FAQ: { q: string; a: string }[] = [
  {
    q: "What's included in the free plan?",
    a: "The free plan includes the full drag-and-drop editor, 50 AI generation credits per month, clean Luau code export, access to the free template library, and the Roblox Studio plugin (community tier).",
  },
  {
    q: "How much does the Pro plan cost?",
    a: "Pro is $9.99 per month. It adds unlimited AI generations, the premium template library, priority Figma import, Studio plugin Pro features, and priority email support.",
  },
  {
    q: "Can I cancel my Pro subscription anytime?",
    a: "Yes, you can cancel your Pro subscription at any time. You'll retain Pro access until the end of your billing period, then drop to the Free plan automatically.",
  },
  {
    q: "Do you offer student or indie developer discounts?",
    a: "Yes! We offer a 50% discount for students with a valid .edu email and for indie developers who have earned less than $1,000 from their Roblox games in the past 12 months. Contact support to apply.",
  },
  {
    q: "What's your refund policy?",
    a: "Once Pro subscriptions open, they will come with a 14-day money-back guarantee. Email chaoticarray.rf516@gmail.com within 14 days of your first charge and we'll refund in full — no questions asked. Marketplace template purchases are also eligible for a 14-day refund if the template is broken or significantly differs from its description.",
  },
];

export default function PricingPage() {
  return (
    <>
      <head>
        <PricingJsonLd />
      </head>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-24">
      <header className="space-y-4 text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-text">
          Roblox GUI Maker Pricing — Free & Pro Plans
        </h1>
        <p className="text-text-muted">
          Start free, upgrade when your project takes off.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        {PRICING_PLANS.map((plan) => (
          <article
            key={plan.id}
            className="flex flex-col gap-4 rounded-2xl border border-glass-border bg-surface p-8"
          >
            <h2 className="font-display text-2xl font-semibold text-text">{plan.name}</h2>
            <p className="text-3xl font-semibold text-text">
              ${plan.priceUSD}
              <span className="text-sm font-normal text-text-muted">/month</span>
            </p>
            <ul className="flex flex-1 flex-col gap-2 text-sm text-text-muted">
              {plan.features.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
            <Link
              href={plan.ctaHref}
              className={cn(
                buttonVariants({
                  variant: plan.highlighted ? "default" : "outline",
                  size: "lg",
                }),
              )}
            >
              {plan.ctaLabel}
            </Link>
          </article>
        ))}
      </div>

      {/* Feature comparison table */}
      <section>
        <h2 className="text-center font-display text-2xl font-semibold tracking-tight text-text">
          Compare plans
        </h2>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-glass-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-raised text-text">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Feature
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Free
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Pro
                </th>
              </tr>
            </thead>
            <tbody className="text-text-muted">
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.label} className="border-t border-glass-border">
                  <th scope="row" className="px-4 py-3 font-normal text-text">
                    {row.label}
                  </th>
                  <td className="px-4 py-3">{row.free}</td>
                  <td className="px-4 py-3 text-cyan-accent">{row.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pricing FAQ — native <details> accordion */}
      <section>
        <h2 className="text-center font-display text-2xl font-semibold tracking-tight text-text">
          Pricing questions
        </h2>
        <div className="mx-auto mt-6 flex max-w-2xl flex-col gap-3">
          {PRICING_FAQ.map((item) => (
            <details
              key={item.q}
              className="rounded-xl border border-glass-border bg-surface p-4"
            >
              <summary className="cursor-pointer font-medium text-text">
                {item.q}
              </summary>
              <p className="mt-3 text-sm text-text-muted">{item.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-text-muted">
          More questions?{" "}
          <Link href="/faq" className="text-cyan-accent hover:underline">
            Check our FAQ
          </Link>
          .
        </p>
      </section>
    </main>
    </>
  );
}