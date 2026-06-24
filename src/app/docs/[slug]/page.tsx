import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Breadcrumb, DocsJsonLd } from "@/components/seo";
import { DOCS, DOC_SLUGS, type DocSlug } from "./data";

export function generateStaticParams() {
  return DOC_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = DOCS[slug as DocSlug];
  if (!doc) return {};
  return {
    title: `${doc.title} — Roblox GUI Maker Docs`,
    description: doc.description,
    alternates: { canonical: `/docs/${doc.slug}` },
  };
}

export default async function DocDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = DOCS[slug as DocSlug];
  if (!doc) return null;

  const currentIndex = DOC_SLUGS.indexOf(doc.slug);
  const prev = DOC_SLUGS[currentIndex - 1];
  const next = DOC_SLUGS[currentIndex + 1];

  return (
    <>
      <head>
        <DocsJsonLd headline={`${doc.title} — Roblox GUI Maker Docs`} description={doc.description} />
      </head>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-24">
      <Breadcrumb
        items={[
          { name: "Home", url: "/" },
          { name: "Docs", url: "/docs" },
          { name: doc.title, url: `/docs/${doc.slug}` },
        ]}
      />

      <article className="flex flex-col gap-6">
        <header className="space-y-3">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-text">
            {doc.title}
          </h1>
          <p className="text-text-muted">{doc.description}</p>
        </header>

        <div className="prose prose-invert max-w-none text-text-muted">
          {doc.content.split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
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
      </article>

      {/* Next / Prev */}
      <nav className="flex justify-between gap-4 border-t border-glass-border pt-6">
        {prev ? (
          <Link
            href={`/docs/${prev}`}
            className="rounded-xl border border-glass-border bg-surface px-4 py-3 text-sm text-text transition-colors hover:border-cyan-accent/40"
          >
            ← {DOCS[prev].title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/docs/${next}`}
            className="rounded-xl border border-glass-border bg-surface px-4 py-3 text-sm text-text transition-colors hover:border-cyan-accent/40"
          >
            {DOCS[next].title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
    </>
  );
}
