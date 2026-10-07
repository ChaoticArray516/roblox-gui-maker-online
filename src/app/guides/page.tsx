import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Breadcrumb, GuidesListJsonLd, buildPageOpenGraph } from "@/components/seo";
import { OG_PAGES } from "@/lib/og-pages";

const OG = OG_PAGES["/guides"];

export const metadata: Metadata = {
  title: OG.title,
  description: OG.description,
  alternates: { canonical: "/guides" },
  ...buildPageOpenGraph({ url: "/guides", ...OG }), // SOP-3W-02
};

const GUIDES = [
  {
    slug: "fix-gui-scaling",
    title: "How to Fix Roblox GUI Scaling",
    description:
      "Understand Scale vs Offset, when to use each, and how to keep your UI crisp on every device.",
    category: "Layout",
  },
  {
    slug: "uilistlayout-uigridlayout",
    title: "UIListLayout & UIGridLayout Explained",
    description:
      "Build responsive lists and grids without manual positioning. Padding, spacing, and sort order covered.",
    category: "Layout",
  },
  {
    slug: "draggable-gui",
    title: "How to Make a Draggable GUI",
    description:
      "Add drag behavior to any Frame with a short, reusable Luau snippet and clamp it to the screen.",
    category: "Scripting",
  },
];

export default function GuidesPage() {
  return (
    <>
      <head>
        <GuidesListJsonLd />
      </head>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-24">
        <Breadcrumb items={[{ name: "Home", url: "/" }, { name: "Guides", url: "/guides" }]} />
        <header className="space-y-4">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-text">
            Roblox GUI Tutorials & Guides (2026)
          </h1>
          <p className="max-w-2xl text-text-muted">
            In-depth tutorials that take you from Studio beginner to shipped UI.
            Every guide includes copy-paste Luau and editor templates.
          </p>
        </header>

        {/* Categories */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["Basics", "Layout", "Scripting", "Systems"].map((cat) => (
            <div
              key={cat}
              className="rounded-2xl border border-glass-border bg-surface p-5 text-center"
            >
              <div className="font-display text-lg font-semibold text-text">{cat}</div>
              <div className="text-xs text-text-muted">Guides</div>
            </div>
          ))}
        </section>

        {/* Guide cards */}
        <section className="flex flex-col gap-6">
          <h2 className="font-display text-2xl font-semibold text-text">Featured guides</h2>
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {GUIDES.map((guide) => (
              <li key={guide.slug}>
                <Link
                  href={`/guides/${guide.slug}`}
                  className="flex h-full flex-col gap-3 rounded-2xl border border-glass-border bg-surface p-6 transition-colors hover:border-cyan-accent/40"
                >
                  <span className="w-fit rounded-full bg-surface-raised px-2.5 py-1 text-xs font-medium text-text-muted">
                    {guide.category}
                  </span>
                  <h3 className="font-display text-xl font-semibold text-text">{guide.title}</h3>
                  <p className="flex-1 text-sm text-text-muted">{guide.description}</p>
                  <span className="text-sm font-medium text-cyan-accent">Read guide →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-glass-border bg-surface-raised p-8 text-center">
          <h2 className="font-display text-2xl font-semibold text-text">
            Want to build alongside the guide?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-text-muted">
            Open the visual editor and apply each step as you read.
          </p>
          <Link
            href="/editor"
            className={cn(buttonVariants({ size: "lg" }), "mt-6")}
          >
            Open the Editor
          </Link>
        </section>
      </main>
    </>
  );
}
