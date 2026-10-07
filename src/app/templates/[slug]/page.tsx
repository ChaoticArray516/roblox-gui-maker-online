import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { readFileSync } from "fs";
import { join } from "path";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Breadcrumb, TemplateDetailJsonLd, buildPageOpenGraph } from "@/components/seo";
import { TemplatePurchaseButton } from "@/components/templates/TemplatePurchaseButton";
import { TemplateCodeViewer } from "@/components/templates/TemplateCodeViewer";
import { TemplateLivePreview } from "@/components/templates/TemplateLivePreview";
import { CodeBlock, FAQAccordion, InternalLink } from "@/components/content";
import { PRODUCTS } from "@/lib/creem";
import {
  TEMPLATES,
  TEMPLATE_SLUGS,
  getSimilarTemplates,
  getTemplatePriceLabel,
} from "@/lib/templates";
import { TEMPLATE_DETAILS } from "./data";
import {
  getTemplateInteractiveElements,
  getTemplatePreviewTree,
} from "@/lib/template-preview-trees";

/** 付费模板 slug → Creem 产品 key 映射 */
const PAID_TEMPLATE_PRODUCT: Record<string, keyof typeof PRODUCTS> = {
  "fps-hud": "TEMPLATE_FPS_HUD",
  "pet-shop": "TEMPLATE_PET_SHOP",
  "dialogue-system": "TEMPLATE_DIALOGUE",
};

/** 读取 public/ 下静态 Luau 资产；失败时返回 undefined */
function readLuauAsset(assetPath?: string): string | undefined {
  if (!assetPath) return undefined;
  try {
    return readFileSync(join(process.cwd(), "public", assetPath), "utf-8");
  } catch {
    return undefined;
  }
}

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
  const title = `${tpl.name} Roblox GUI Template with ${tpl.feature}`;
  return {
    title,
    description: tpl.description,
    alternates: { canonical: `/templates/${tpl.slug}` },
    // SOP-3W-02: 页级 OG/Twitter（路径 A 双键；专属 1200×630 图为后置任务，先用默认图）
    ...buildPageOpenGraph({
      url: `/templates/${tpl.slug}`,
      title,
      description: tpl.description,
    }),
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
  const detail = TEMPLATE_DETAILS[slug];
  // SOP-3V-10: productId 为空（CREEM_PRODUCT_* 未配置）→ 不渲染 Buy，杜绝 503 入口
  const productKey = PAID_TEMPLATE_PRODUCT[tpl.slug];
  const productId =
    tpl.price > 0 && productKey ? PRODUCTS[productKey] || undefined : undefined;
  const clientCode = readLuauAsset(tpl.luauClientAsset) ?? tpl.luauPreview;
  const serverCode = readLuauAsset(tpl.luauServerAsset);

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
          faqs={detail?.faqs}
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
          {productId ? (
            <TemplatePurchaseButton
              slug={tpl.slug}
              productId={productId}
            />
          ) : (
            <Link
              href="/plugin"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
            >
              Join Studio plugin waitlist
            </Link>
          )}
        </div>

        {/* Live preview */}
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text">
            Live preview
          </h2>
          <div className="mt-4 h-[560px] w-full overflow-hidden rounded-2xl border border-glass-border">
            <TemplateLivePreview
              templateName={tpl.name}
              description={tpl.description}
              uiTree={getTemplatePreviewTree(slug)}
              interactiveElements={getTemplateInteractiveElements(slug)}
            />
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

        {/* SOP-3L-02: How to Use */}
        {detail && (
          <section>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-text">
              How to use this template
            </h2>
            <p className="mt-3 text-base leading-7 text-text-muted">{detail.howToUse}</p>
          </section>
        )}

        {/* SOP-3L-03: Code integration steps */}
        {detail && (
          <section>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-text">
              Add it to your game in 3 steps
            </h2>
            <ol className="mt-4 flex flex-col gap-4">
              {detail.codeSteps.map((s, i) => (
                <li
                  key={s.step}
                  className="flex gap-4 rounded-2xl border border-glass-border bg-surface p-5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-raised font-semibold text-cyan-accent">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-text">{s.step}</h3>
                    <p className="mt-1 text-sm text-text-muted">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-4">
              <CodeBlock
                code={clientCode}
                language="lua"
                filename={`${tpl.slug}.lua`}
                showLineNumbers
                cta={{ variant: "editor", href: `/editor?template=${tpl.slug}`, label: "Open in editor" }}
              />
            </div>
          </section>
        )}

        {/* Code preview */}
        <section>
          <h2 className="font-display text-2xl font-semibold text-text">Code preview</h2>
          <div className="mt-4">
            <TemplateCodeViewer
              templateName={tpl.name}
              previewComponent={
                <div className="flex h-80 w-full flex-col items-center justify-center gap-2 text-text-muted">
                  <span className="text-sm">Interactive visual preview is shown in the Live preview section above.</span>
                  <span className="text-xs">Switch tabs to inspect the generated Luau client/server code.</span>
                </div>
              }
              clientCode={clientCode}
              serverCode={serverCode}
            />
          </div>
        </section>

        {/* SOP-3L-04: FAQ */}
        {detail && detail.faqs.length > 0 && (
          <section>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-text">
              Frequently asked questions
            </h2>
            <FAQAccordion items={detail.faqs} injectSchema={false} className="mt-4" />
          </section>
        )}

        {/* SOP-3L-06: Internal links */}
        {detail && detail.internalLinks.length > 0 && (
          <section className="rounded-2xl border border-glass-border bg-surface p-6">
            <h2 className="font-display text-2xl font-semibold text-text">Keep going</h2>
            <ul className="mt-4 flex flex-col gap-2">
              {detail.internalLinks.map((link) => (
                <li key={link.href}>
                  <InternalLink href={link.href} anchorText={link.label} />
                </li>
              ))}
            </ul>
          </section>
        )}

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
