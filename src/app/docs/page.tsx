import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Breadcrumb, DocsJsonLd, buildPageOpenGraph } from "@/components/seo";
import { OG_PAGES } from "@/lib/og-pages";

const OG = OG_PAGES["/docs"];

export const metadata: Metadata = {
  title: OG.title,
  description: OG.description,
  alternates: { canonical: "/docs" },
  ...buildPageOpenGraph({ url: "/docs", ...OG }), // SOP-3W-02
};

const DOCS = [
  {
    slug: "quick-start",
    title: "Quick Start",
    description: "Create your first GUI in under five minutes.",
  },
  {
    slug: "editor-guide",
    title: "Editor Guide",
    description: "Learn the canvas, layers, properties, and export options.",
  },
  {
    slug: "plugin-guide",
    title: "Plugin Guide",
    description: "Install and use the Roblox Studio plugin.",
  },
  {
    slug: "ai-generation-api",
    title: "AI Generation API",
    description: "How the AI endpoint works and how to shape prompts.",
  },
  {
    slug: "figma-import-guide",
    title: "Figma Import Guide",
    description: "Convert Figma designs to Roblox GUI objects.",
  },
  {
    slug: "template-developer-guide",
    title: "Template Developer Guide",
    description: "Build templates that others can reuse.",
  },
];

export default function DocsPage() {
  return (
    <>
      <head>
        <DocsJsonLd headline="Roblox GUI Maker Documentation" description="Documentation for the Roblox GUI Maker visual editor, Luau export, and Studio plugin." />
      </head>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-24">
        <Breadcrumb items={[{ name: "Home", url: "/" }, { name: "Docs", url: "/docs" }]} />
        <header className="space-y-4">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-text">
            Roblox GUI Maker Documentation
          </h1>
          <p className="max-w-2xl text-text-muted">
            Everything you need to use the editor, plugin, AI generation, Figma
            import, and templates.
          </p>
        </header>

        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {DOCS.map((doc) => (
            <li key={doc.slug}>
              <Link
                href={`/docs/${doc.slug}`}
                className="flex h-full flex-col gap-2 rounded-2xl border border-glass-border bg-surface p-6 transition-colors hover:border-cyan-accent/40"
              >
                <h2 className="font-display text-xl font-semibold text-text">{doc.title}</h2>
                <p className="flex-1 text-sm text-text-muted">{doc.description}</p>
                <span className="text-sm font-medium text-cyan-accent">Read →</span>
              </Link>
            </li>
          ))}
        </ul>

        <section className="rounded-2xl border border-glass-border bg-surface-raised p-8 text-center">
          <h2 className="font-display text-2xl font-semibold text-text">
            Stuck?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-text-muted">
            Open the editor and try the features hands-on, or browse the FAQ.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/editor" className={cn(buttonVariants({ size: "lg" }))}>
              Open Editor
            </Link>
            <Link
              href="/faq"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
            >
              Visit FAQ
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
