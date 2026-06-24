import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Breadcrumb, GuideDetailJsonLd } from "@/components/seo";
import { GUIDES, GUIDE_SLUGS, type GuideSlug } from "./data";

export function generateStaticParams() {
  return GUIDE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDES[slug as GuideSlug];
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
  };
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = GUIDES[slug as GuideSlug];
  if (!guide) return null;

  const wordCount = guide.intro.split(/\s+/).length
    + guide.sections.reduce((n, s) => n + s.body.split(/\s+/).length, 0)
    + guide.faq.reduce((n, f) => n + f.a.split(/\s+/).length, 0);

  return (
    <>
      <head>
        <GuideDetailJsonLd
          slug={guide.slug}
          h1={guide.h1}
          title={guide.title}
          description={guide.description}
          targetKeyword={guide.targetKeyword}
          publishedAt={guide.publishedAt}
          modifiedAt={guide.modifiedAt}
          imageUrl={guide.imageUrl}
          steps={guide.steps}
        />
      </head>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-24">
      <Breadcrumb
        items={[
          { name: "Home", url: "/" },
          { name: "Guides", url: "/guides" },
          { name: guide.title, url: `/guides/${guide.slug}` },
        ]}
      />

      <article className="flex flex-col gap-8">
        <header className="space-y-3">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-text">
            {guide.h1}
          </h1>
          <p className="text-text-muted">
            Last updated: {guide.modifiedAt} · {wordCount} words · {Math.max(2, Math.round(wordCount / 200))} min read
          </p>
        </header>

        <p className="text-lg leading-relaxed text-text">{guide.intro}</p>

        {/* TOC */}
        <nav aria-label="Table of contents" className="rounded-2xl border border-glass-border bg-surface p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Table of contents</h2>
          <ol className="mt-3 list-decimal pl-5 text-text">
            {guide.sections.map((s) => (
              <li key={s.heading}>
                <a href={`#${s.heading.toLowerCase().replace(/\s+/g, "-")}`} className="hover:underline">{s.heading}</a>
              </li>
            ))}
            <li>
              <a href="#step-by-step-summary" className="hover:underline">Step-by-step summary</a>
            </li>
            <li>
              <a href="#faq" className="hover:underline">FAQ</a>
            </li>
          </ol>
        </nav>

        {guide.sections.map((section) => (
          <section
            key={section.heading}
            id={section.heading.toLowerCase().replace(/\s+/g, "-")}
            className="flex flex-col gap-3"
          >
            <h2 className="font-display text-2xl font-semibold text-text">{section.heading}</h2>
            <p className="text-text-muted">{section.body}</p>
            {section.code && (
              <pre className="overflow-x-auto rounded-xl border border-glass-border bg-surface p-4 text-sm">
                <code className="font-mono text-text-muted">{section.code}</code>
              </pre>
            )}
          </section>
        ))}

        {/* Step-by-step summary */}
        <section id="step-by-step-summary" className="flex flex-col gap-4">
          <h2 className="font-display text-2xl font-semibold text-text">Step-by-step summary</h2>
          <ol className="flex flex-col gap-3">
            {guide.steps.map((step, i) => (
              <li
                key={step.name}
                className="flex gap-4 rounded-2xl border border-glass-border bg-surface p-5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-raised font-semibold text-cyan-accent">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-text">{step.name}</h3>
                  <p className="mt-1 text-sm text-text-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section id="faq" className="flex flex-col gap-4">
          <h2 className="font-display text-2xl font-semibold text-text">FAQ</h2>
          <div className="flex flex-col gap-3">
            {guide.faq.map((item) => (
              <details
                key={item.q}
                className="rounded-xl border border-glass-border bg-surface p-5"
              >
                <summary className="cursor-pointer font-medium text-text">{item.q}</summary>
                <p className="mt-3 text-sm text-text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/editor"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Try this in the Editor
          </Link>
          <Link
            href="/templates"
            className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
          >
            Browse Templates
          </Link>
        </div>
      </article>
    </main>
    </>
  );
}
