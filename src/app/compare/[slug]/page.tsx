import type { Metadata } from "next";

import { SITE_URL, SITE_NAME } from "@/lib/site-config";
import { Breadcrumb, JsonLd, buildPageOpenGraph } from "@/components/seo";
import { CompareTable, FAQAccordion, InternalLink } from "@/components/content";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { COMPARES, COMPARE_SLUGS, type CompareSlug } from "./data";

export function generateStaticParams() {
  return COMPARE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const compare = COMPARES[slug as CompareSlug];
  if (!compare) return {};
  return {
    title: compare.title,
    description: compare.description,
    alternates: { canonical: `/compare/${compare.slug}` },
    ...buildPageOpenGraph({
      url: `/compare/${compare.slug}`,
      title: compare.title,
      description: compare.description,
    }), // SOP-3W-02
  };
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const compare = COMPARES[slug as CompareSlug];
  if (!compare) return null;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "Article",
      "@id": `${SITE_URL}/compare/${compare.slug}/#article`,
      headline: compare.h1,
      description: compare.description,
      author: { "@type": "Organization", name: SITE_NAME },
      publisher: { "@type": "Organization", name: SITE_NAME },
      datePublished: "2026-07-19",
      dateModified: "2026-07-19",
      mainEntityOfPage: `${SITE_URL}/compare/${compare.slug}`,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Compare", item: `${SITE_URL}/compare` },
        { "@type": "ListItem", position: 3, name: compare.h1 },
      ],
    },
  ];

  return (
    <>
      <head>
        <JsonLd data={graph} id="compare-jsonld" />
      </head>
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-24">
        <Breadcrumb
          items={[
            { name: "Home", url: "/" },
            { name: "Compare", url: "/compare/best-roblox-gui-makers" },
            { name: compare.targetKeyword, url: `/compare/${compare.slug}` },
          ]}
        />

        <header className="space-y-3">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-text">
            {compare.h1}
          </h1>
          <p className="text-lg text-text-muted">{compare.intro}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/editor" className={cn(buttonVariants({ size: "lg" }))}>
              Try Editor Free
            </Link>
            <Link
              href="/pricing"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
            >
              See pricing
            </Link>
          </div>
        </header>

        <CompareTable
          title="Feature comparison"
          products={compare.products}
          features={compare.features}
          footnote={compare.footnote}
        />

        <section className="flex flex-col gap-6">
          {compare.bodySections.map((section) => (
            <div key={section.heading}>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-text">
                {section.heading}
              </h2>
              <p className="mt-3 text-base leading-7 text-text-muted">{section.body}</p>
            </div>
          ))}
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text">
            Frequently asked questions
          </h2>
          <FAQAccordion items={compare.faqs} className="mt-4" />
        </section>

        <section className="flex flex-wrap gap-3">
          <InternalLink href="/editor" />
          <InternalLink href="/templates" />
          <InternalLink href="/pricing" />
        </section>

        <section className="rounded-2xl border border-glass-border bg-surface-raised p-8 text-center">
          <h2 className="font-display text-2xl font-semibold text-text">
            Ready to build?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-text-muted">
            Start from a template or generate the layout with AI in the editor.
          </p>
          <Link
            href="/editor"
            className={cn(buttonVariants({ size: "lg" }), "mt-6")}
          >
            Try Editor Free
          </Link>
        </section>
      </main>
    </>
  );
}
