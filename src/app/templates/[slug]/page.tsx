import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Breadcrumb, TemplateDetailJsonLd } from "@/components/seo";
import {
  TEMPLATES,
  TEMPLATE_SLUGS,
  getSimilarTemplates,
  getTemplatePriceLabel,
} from "@/lib/templates";

export function generateStaticParams() {
  return TEMPLATE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tpl = TEMPLATES[slug];
  if (!tpl) return {};
  return {
    title: `${tpl.name} Roblox GUI Template with ${tpl.feature}`,
    description: tpl.description,
    alternates: { canonical: `/templates/${tpl.slug}` },
  };
}

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tpl = TEMPLATES[slug];
  if (!tpl) return null;

  const similar = getSimilarTemplates(slug, 3);

  return (
    <>
      <head>
        <TemplateDetailJsonLd
          name={tpl.name}
          slug={tpl.slug}
          description={tpl.description}
          price={tpl.price}
          priceCurrency={tpl.priceCurrency}
          category={tpl.category}
          images={tpl.images}
          features={tpl.features}
        />
      </head>
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-24">
        <Breadcrumb
          items={[
            { name: "Home", url: "/" },
            { name: "Templates", url: "/templates" },
            { name: tpl.name, url: `/templates/${tpl.slug}` },
          ]}
        />
        <h1 className="font-display text-4xl font-semibold tracking-tight text-text">
          {tpl.name} Roblox GUI Template with {tpl.feature}
        </h1>
        <p className="text-lg text-text-muted">{tpl.description}</p>

        <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
          <span className="rounded-full bg-surface-raised px-2.5 py-1 text-xs font-medium text-text">
            {tpl.category}
          </span>
          <span>{getTemplatePriceLabel(tpl)}</span>
          {tpl.price > 0 && (
            <span className="text-xs text-text-muted">
              · Open in editor for free during beta
            </span>
          )}
        </div>

        {/* Image gallery */}
        <div className="grid gap-3 sm:grid-cols-3">
          {tpl.images.map((src, i) => (
            <figure
              key={src}
              className="overflow-hidden rounded-xl border border-glass-border bg-surface-raised"
            >
              <Image
                src={tpl.previewImage}
                alt={`${tpl.name} Roblox GUI template — ${tpl.feature}, ${tpl.style} ${tpl.category.toLowerCase()} layout, screenshot ${i + 1}`}
                width={640}
                height={360}
                className="h-auto w-full object-cover"
                priority={i === 0}
              />
              <figcaption className="sr-only">
                {tpl.name} Roblox GUI template — screenshot {i + 1} of {tpl.images.length}, showing {tpl.feature.toLowerCase()} on a {tpl.style} {tpl.category.toLowerCase()} layout for {tpl.device}.
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/editor?template=${tpl.slug}`}
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Open in Web Editor
          </Link>
          <Link
            href="/plugin"
            className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
          >
            Join Studio plugin waitlist
          </Link>
        </div>

        {/* Live preview placeholder */}
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text">
            Live preview
          </h2>
          <div
            className="mt-4 flex aspect-video w-full items-center justify-center rounded-2xl border border-glass-border bg-surface-raised text-sm text-text-muted"
            aria-label="Interactive preview coming soon"
          >
            Interactive preview coming soon
          </div>
        </section>

        {/* Differentiator note */}
        <p className="rounded-xl border border-cyan-accent/30 bg-surface-raised px-4 py-3 text-sm text-text">
          <strong className="text-cyan-accent">Includes real, production-ready Luau logic</strong>{" "}
          — not a static mockup.
        </p>

        <section>
          <h2 className="font-display text-2xl font-semibold text-text">
            What&apos;s inside
          </h2>
          <ul className="mt-4 flex flex-col gap-2 text-text-muted">
            {tpl.features.map((feature) => (
              <li key={feature}>• {feature}</li>
            ))}
          </ul>
        </section>

        {/* Code preview */}
        <section>
          <h2 className="font-display text-2xl font-semibold text-text">
            Code preview
          </h2>
          <pre className="mt-4 overflow-x-auto rounded-xl border border-glass-border bg-surface p-4 text-sm">
            <code className="font-mono text-text-muted">{tpl.luauPreview}</code>
          </pre>
        </section>

        {/* Similar templates */}
        {similar.length > 0 && (
          <section>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-text">
              Similar templates
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((st) => (
                <li key={st.slug}>
                  <Link
                    href={`/templates/${st.slug}`}
                    className="block rounded-2xl border border-glass-border bg-surface p-4 transition-colors hover:border-cyan-accent/40"
                  >
                    <figure className="overflow-hidden rounded-lg bg-surface-raised">
                      <Image
                        src={st.previewImage}
                        alt={`${st.name} Roblox GUI template — similar pick, ${st.feature}`}
                        width={384}
                        height={216}
                        className="h-auto w-full object-cover"
                        loading="lazy"
                      />
                      <figcaption className="sr-only">
                        Similar Roblox GUI template — {st.name}, {st.feature.toLowerCase()}.
                      </figcaption>
                    </figure>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="font-display text-base font-semibold text-text">{st.name}</span>
                      <span className="text-xs text-text-muted">
                        {getTemplatePriceLabel(st)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-text-muted">{st.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}
