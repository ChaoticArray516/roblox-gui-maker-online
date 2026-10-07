"use client";

/**
 * SOP-3V-02: /templates 筛选器实装（"假装能用"清剿）
 *
 * Category 选项从 TEMPLATES 数据派生（[...new Set(...)]），今后加模板/加分类自动同步；
 * Price 选项与卡片 getTemplatePriceLabel 对齐（All / Free / Marketplace，废除 "Premium"）；
 * Sort 砍掉——TemplateRecord 无日期字段，"Newest" 无数据基础（不放假功能）。
 * 空态兜底 + 结果计数 aria-live，防"点了没反应/点了变空"二次误解。
 *
 * 卡片 JSX 从 templates/page.tsx 原样平移（零设计变更）。
 * 本组件虽为 client 组件但参与 SSR——首屏 HTML 含全部卡片，SEO 不退化。
 */

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type TemplateRecord, getTemplatePriceLabel } from "@/lib/templates";

type PriceFilter = "all" | "free" | "marketplace";

const PRICE_OPTIONS: { value: PriceFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "free", label: "Free" },
  { value: "marketplace", label: "Marketplace" },
];

export function TemplateBrowser({ templates }: { templates: TemplateRecord[] }) {
  const categories = useMemo(
    () => ["All", ...[...new Set(templates.map((t) => t.category))].sort()],
    [templates],
  );
  const [category, setCategory] = useState("All");
  const [price, setPrice] = useState<PriceFilter>("all");

  // SOP-3V-13(E1): ?category= URL 同步——mount 读一次（过派生集合校验），
  // onChange 时 replaceState 回写。纯客户端，无路由跳转；
  // 不用 useSearchParams()（/templates 是 ISR 页，裸调会触发 prerender Suspense bailout）。
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("category");
    if (raw && categories.includes(raw)) setCategory(raw);
    // categories 派生自 props，首次渲染即稳定
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectCategory = (value: string) => {
    setCategory(value);
    const url =
      value === "All"
        ? window.location.pathname
        : `${window.location.pathname}?category=${encodeURIComponent(value)}`;
    window.history.replaceState(null, "", url);
  };

  const filtered = useMemo(
    () =>
      templates.filter((t) => {
        const okCat = category === "All" || t.category === category;
        const okPrice =
          price === "all" || (price === "free" ? t.price === 0 : t.price > 0);
        return okCat && okPrice;
      }),
    [templates, category, price],
  );

  return (
    <>
      <section
        aria-label="Filter templates"
        className="flex flex-wrap items-end gap-6 rounded-2xl border border-glass-border bg-surface p-5"
      >
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="filter-category"
            className="text-xs font-semibold uppercase tracking-wide text-text-muted"
          >
            Category
          </label>
          <select
            id="filter-category"
            className="rounded-lg border border-glass-border bg-surface-raised px-3 py-2 text-sm text-text"
            value={category}
            onChange={(e) => selectCategory(e.target.value)}
          >
            {categories.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="filter-price"
            className="text-xs font-semibold uppercase tracking-wide text-text-muted"
          >
            Price
          </label>
          <select
            id="filter-price"
            className="rounded-lg border border-glass-border bg-surface-raised px-3 py-2 text-sm text-text"
            value={price}
            onChange={(e) => setPrice(e.target.value as PriceFilter)}
          >
            {PRICE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <p aria-live="polite" className="text-sm text-text-muted">
          {filtered.length} {filtered.length === 1 ? "template" : "templates"}
        </p>
      </section>

      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tpl) => (
          <li
            key={tpl.slug}
            className="flex flex-col gap-3 rounded-2xl border border-glass-border bg-surface p-6"
          >
            <figure
              className="relative aspect-video w-full overflow-hidden rounded-lg border border-glass-border bg-surface-raised"
            >
              <Image
                src={tpl.previewImage}
                alt={`${tpl.name} Roblox GUI template preview — ${tpl.feature}, ${tpl.style} style, ${tpl.device} layout`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
                loading="lazy"
              />
              <figcaption className="sr-only">
                {tpl.name} Roblox GUI template preview — {tpl.feature.toLowerCase()}, {tpl.style} style, {tpl.device} layout.
              </figcaption>
            </figure>
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full bg-surface-raised px-2.5 py-1 text-xs font-medium text-text-muted">
                {tpl.category}
              </span>
              <span className="text-xs text-text-muted">
                {getTemplatePriceLabel(tpl)}
              </span>
            </div>
            <h2 className="font-display text-xl font-semibold text-text">
              {tpl.name}
            </h2>
            <p className="flex-1 text-sm text-text-muted">{tpl.description}</p>
            <Link
              href={`/templates/${tpl.slug}`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              View template
            </Link>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="py-16 text-center text-text-muted">
          No templates match your filters.
        </p>
      )}
    </>
  );
}
