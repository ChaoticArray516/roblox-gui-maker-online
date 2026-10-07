import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb, buildPageOpenGraph } from "@/components/seo";
import { OG_PAGES } from "@/lib/og-pages";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { COMPARES, COMPARE_SLUGS } from "./[slug]/data";

const OG = OG_PAGES["/compare"];

export const metadata: Metadata = {
  title: { absolute: OG.title },
  description: OG.description,
  alternates: { canonical: "/compare" },
  ...buildPageOpenGraph({ url: "/compare", ...OG }), // SOP-3W-02
};

export default function CompareIndexPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-24">
      <Breadcrumb
        items={[
          { name: "Home", url: "/" },
          { name: "Compare", url: "/compare" },
        ]}
      />

      <header className="space-y-3">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-text">
          Roblox GUI Maker Comparisons
        </h1>
        <p className="text-lg text-text-muted">
          Side-by-side comparisons of Roblox GUI tools. Each comparison covers
          features, pricing, and where each tool wins - based on public data as
          of July 2026.
        </p>
      </header>

      <ul className="flex flex-col gap-4">
        {COMPARE_SLUGS.map((slug) => {
          const compare = COMPARES[slug];
          return (
            <li key={slug}>
              <Link
                href={`/compare/${slug}`}
                className="block rounded-2xl border border-glass-border bg-surface p-6 transition-colors hover:border-cyan-accent/40"
              >
                <h2 className="font-display text-xl font-semibold text-text">
                  {compare.h1}
                </h2>
                <p className="mt-2 text-sm text-text-muted">{compare.description}</p>
                <span className="mt-4 inline-block text-sm font-medium text-cyan-accent">
                  Read the comparison →
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <section className="rounded-2xl border border-glass-border bg-surface-raised p-8 text-center">
        <h2 className="font-display text-2xl font-semibold text-text">
          Want to try it yourself?
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-text-muted">
          The editor is free. Generate a UI from a prompt and export Luau in
          seconds.
        </p>
        <Link
          href="/editor"
          className={cn(buttonVariants({ size: "lg" }), "mt-6")}
        >
          Try Editor Free
        </Link>
      </section>
    </main>
  );
}
