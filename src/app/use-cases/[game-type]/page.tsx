import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Breadcrumb, UseCaseDetailJsonLd, buildPageOpenGraph } from "@/components/seo";
import { SITE_URL } from "@/lib/site-config";
import { USE_CASES, USE_CASE_SLUGS, type UseCaseSlug } from "./data";

export function generateStaticParams() {
  return USE_CASE_SLUGS.map((slug) => ({ "game-type": slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ "game-type": string }>;
}): Promise<Metadata> {
  const { "game-type": slug } = await params;
  const uc = USE_CASES[slug as UseCaseSlug];
  if (!uc) return {};
  return {
    title: uc.h1,
    description: uc.description,
    alternates: { canonical: `/use-cases/${uc.slug}` },
    ...buildPageOpenGraph({
      url: `/use-cases/${uc.slug}`,
      title: uc.h1,
      description: uc.description,
    }), // SOP-3W-02
  };
}

export default async function UseCaseDetailPage({
  params,
}: {
  params: Promise<{ "game-type": string }>;
}) {
  const { "game-type": slug } = await params;
  const uc = USE_CASES[slug as UseCaseSlug];
  if (!uc) return null;

  return (
    <>
      <head>
        <UseCaseDetailJsonLd
          gameType={uc.gameType}
          slug={uc.slug}
          h1={uc.h1}
          description={uc.description}
          steps={uc.steps}
          relatedTemplates={uc.relatedTemplates.map((p) => `${SITE_URL}${p}`)}
        />
      </head>
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-24">
      <Breadcrumb
        items={[
          { name: "Home", url: "/" },
          { name: "Use Cases", url: "/use-cases" },
          { name: uc.gameType, url: `/use-cases/${uc.slug}` },
        ]}
      />

      <header className="space-y-3">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-text">
          {uc.h1}
        </h1>
        <p className="text-lg text-text-muted">{uc.description}</p>
        <p className="text-base leading-7 text-text-muted">{uc.intro}</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/editor" className={cn(buttonVariants({ size: "lg" }))}>
            Build This HUD in Our Editor
          </Link>
          <Link
            href="/templates"
            className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
          >
            Browse Templates
          </Link>
        </div>
      </header>

      <section>
        <h2 className="font-display text-2xl font-semibold text-text">Design requirements</h2>
        <ul className="mt-4 flex flex-col gap-2 text-text-muted">
          {uc.requirements.map((r) => (
            <li key={r}>• {r}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold text-text">Step-by-step tutorial</h2>
        <ol className="mt-4 flex flex-col gap-4">
          {uc.steps.map((step, i) => (
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

      <section className="flex flex-col gap-6">
        {uc.bodySections.map((section) => (
          <div key={section.heading}>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-text">
              {section.heading}
            </h2>
            <p className="mt-3 text-base leading-7 text-text-muted">{section.body}</p>
          </div>
        ))}
      </section>

      {uc.designTips.length > 0 && (
        <section className="rounded-2xl border border-glass-border bg-surface p-6">
          <h2 className="font-display text-2xl font-semibold text-text">Design tips</h2>
          <ul className="mt-4 flex flex-col gap-2 text-text-muted">
            {uc.designTips.map((tip) => (
              <li key={tip}>• {tip}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-glass-border bg-surface p-6">
        <h2 className="font-display text-2xl font-semibold text-text">Related templates</h2>
        <ul className="mt-4 flex flex-col gap-2">
          {uc.relatedTemplates.map((path) => (
            <li key={path}>
              <Link
                href={path}
                className="text-cyan-accent hover:underline underline-offset-2"
              >
                {path.split("/").pop()}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-glass-border bg-surface-raised p-8 text-center">
        <h2 className="font-display text-2xl font-semibold text-text">
          Ready to build?
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-text-muted">
          Start from a template or generate the layout with AI in the editor.
        </p>
        <Link
          href={`/editor?template=${uc.relatedTemplates[0]?.split("/").pop() ?? ""}`}
          className={cn(buttonVariants({ size: "lg" }), "mt-6")}
        >
          Start with a template
        </Link>
      </section>
    </main>
    </>
  );
}
