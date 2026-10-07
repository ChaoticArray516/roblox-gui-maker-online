import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FAQAccordion } from "@/components/content";
import { FaqJsonLd, buildPageOpenGraph } from "@/components/seo";
import { OG_PAGES } from "@/lib/og-pages";
import { FAQ_CATEGORIES, FAQ_ITEMS_FLAT, getFAQsByCategory } from "./data";

const OG = OG_PAGES["/faq"];

export const metadata: Metadata = {
  title: OG.title,
  description: OG.description,
  alternates: { canonical: "/faq" },
  ...buildPageOpenGraph({ url: "/faq", ...OG }), // SOP-3W-02
};

export default function FaqPage() {
  return (
    <>
      <head>
        <FaqJsonLd items={FAQ_ITEMS_FLAT} />
      </head>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-24">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-text">
          Roblox GUI Maker — Frequently Asked Questions
        </h1>

        {/* Static search + category anchors (SSG: no JS filtering) */}
        <div className="flex flex-col gap-4">
          <input
            type="search"
            placeholder="Search questions..."
            aria-label="Search FAQ"
            className="w-full rounded-xl border border-glass-border bg-surface-raised px-4 py-3 text-sm text-text placeholder:text-text-muted"
          />
          <div className="flex flex-wrap gap-2">
            {FAQ_CATEGORIES.map((cat) => (
              <a
                key={cat}
                href={`#${cat.toLowerCase()}`}
                className="rounded-full border border-glass-border bg-surface px-3 py-1 text-xs font-medium text-text-muted transition-colors hover:border-cyan-accent/40 hover:text-text"
              >
                {cat}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {FAQ_CATEGORIES.map((cat) => {
            const items = getFAQsByCategory(cat);
            return (
              <section key={cat} id={cat.toLowerCase()}>
                <h2 className="font-display text-xl font-semibold text-text">{cat}</h2>
                <FAQAccordion
                  items={items}
                  injectSchema={false}
                  className="mt-4"
                />
              </section>
            );
          })}
        </div>

        <section className="rounded-2xl border border-glass-border bg-surface-raised p-8 text-center">
          <h2 className="font-display text-2xl font-semibold text-text">
            Still have questions?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-text-muted">
            Try the editor yourself, or join the waitlist to be notified when
            the Studio plugin launches.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/editor" className={cn(buttonVariants({ size: "lg" }))}>
              Try Editor Free
            </Link>
            <Link
              href="/plugin"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
            >
              Join plugin waitlist
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
