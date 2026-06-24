import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TemplatesListJsonLd } from "@/components/seo";
import { TEMPLATES, getTemplatePriceLabel } from "@/lib/templates";

export const revalidate = 3600; // ISR — keep in sync with ISR_REVALIDATE_SECONDS in @/lib/constants

export const metadata: Metadata = {
  title: "Free & Premium Roblox GUI Templates (Ready-to-Play)",
  description:
    "Browse free and premium Roblox GUI templates: RPG inventories, FPS HUDs, shops, and more. Ready to drop into Studio.",
  alternates: { canonical: "/templates" },
};

const templates = Object.values(TEMPLATES);

const FILTERS: { label: string; options: string[]; comingSoon?: boolean }[] = [
  {
    label: "Category",
    options: [
      "All",
      "Inventory",
      "Menu",
      "Shop",
      "HUD",
      "Leaderboard",
      "Health Bar",
      "Settings",
      "Loading Screen",
      "Dialogue",
    ],
    comingSoon: true,
  },
  { label: "Price", options: ["All", "Free", "Premium"], comingSoon: true },
  { label: "Sort", options: ["Newest"], comingSoon: true },
];

export default function TemplatesPage() {
  return (
    <>
      <head>
        <TemplatesListJsonLd />
      </head>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-24">
        <header className="space-y-4">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-text">
            Free &amp; Premium Roblox GUI Templates (Ready-to-Play)
          </h1>
          <p className="max-w-2xl text-text-muted">
            A growing library of production-tested Roblox UIs: copy them into
            your project or open straight in the Web Editor.
          </p>
          <p className="max-w-2xl rounded-xl border border-cyan-accent/30 bg-surface-raised px-4 py-3 text-sm text-text">
            <strong className="text-cyan-accent">Every template ships with
            REAL Luau logic</strong>{" "}
            — shop validation, inventory drag-and-drop, DataStore persistence —
            not just static visuals.
          </p>
        </header>

        {/* Filters (static display — interactive filtering ships post-MVP) */}
        <section
          aria-label="Filter templates"
          className="flex flex-wrap gap-6 rounded-2xl border border-glass-border bg-surface p-5"
        >
          {FILTERS.map((f) => (
            <div key={f.label} className="flex flex-col gap-1.5">
              <label
                htmlFor={`filter-${f.label.toLowerCase()}`}
                className="text-xs font-semibold uppercase tracking-wide text-text-muted"
              >
                {f.label}
                {f.comingSoon && (
                  <span className="ml-1.5 normal-case text-text-muted/70">
                    (coming soon)
                  </span>
                )}
              </label>
              <select
                id={`filter-${f.label.toLowerCase()}`}
                className="rounded-lg border border-glass-border bg-surface-raised px-3 py-2 text-sm text-text disabled:cursor-not-allowed disabled:opacity-60"
                defaultValue={f.options[0]}
                disabled={f.comingSoon}
              >
                {f.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </section>

        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((tpl) => (
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

        {/* SOP-C: 长内容枢纽 — 模板使用指南 + 分类速查（扩字数 + 长尾） */}
        <section className="mt-4 grid gap-10 lg:grid-cols-[2fr_1fr]">
          <article className="prose prose-invert max-w-none rounded-2xl border border-glass-border bg-surface p-8">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-text">
              How to use these Roblox GUI templates in Studio
            </h2>
            <p className="mt-3 text-text-muted">
              Every template in this library is a complete Roblox GUI — not a
              static mockup. Click <strong>Open in Web Editor</strong> on any
              card to load the layout into the visual editor, then export to
              StarterGui. Studio plugin sync will be available once the plugin
              launches.
            </p>
            <h3 className="mt-6 font-display text-lg font-semibold text-text">
              Three ways to ship a template
            </h3>
            <ol className="mt-3 list-decimal pl-5 text-text-muted">
              <li>
                <strong className="text-text">One-click Luau export.</strong>{" "}
                Generate a clean LocalScript that builds the entire UI hierarchy
                programmatically. Paste it into <code>StarterGui</code> as a{" "}
                <code>LocalScript</code>.
              </li>
              <li>
                <strong className="text-text">Studio plugin sync (coming soon).</strong>{" "}
                The Roblox GUI Maker plugin is currently on the waitlist. Once
                it launches on the Creator Marketplace, click Sync in the editor
                and the GUI will land in Studio as real{" "}
                <code>ScreenGui</code>, <code>Frame</code>, and{" "}
                <code>TextButton</code> instances you can edit further.
              </li>
              <li>
                <strong className="text-text">JSON import.</strong> Save the
                template as a project JSON, share it with collaborators, and
                re-import it into any other Roblox GUI Maker workspace.
              </li>
            </ol>
            <h3 className="mt-6 font-display text-lg font-semibold text-text">
              What &quot;real Luau logic&quot; means
            </h3>
            <p className="mt-3 text-text-muted">
              Most free Roblox GUI packs ship visual mockups with empty event
              handlers. Our templates wire up the events that actually matter:
              shop cards bind to <code>MarketplaceService:PromptProductPurchase</code>,
              inventories use <code>UIDragDetector</code>-style handlers and
              DataStore stubs, leaderboards integrate with{" "}
              <code>OrderedDataStore</code>, and HUDs respond to{" "}
              <code>Humanoid.HealthChanged</code> and{" "}
              <code>UserInputService</code> input events.
            </p>
            <h3 className="mt-6 font-display text-lg font-semibold text-text">
              Mobile, tablet, and desktop scaling
            </h3>
            <p className="mt-3 text-text-muted">
              Every template defaults to Scale-based <code>UDim2</code> sizing
              with <code>AnchorPoint</code> set on key panels. Touch targets are
              at least 44×44 px on mobile, and{" "}
              <code>UIAspectRatioConstraint</code> is applied to icons and
              square buttons so they stay sharp across viewports. Use the device
              preview toggle in the editor to verify before exporting.
            </p>
            <h3 className="mt-6 font-display text-lg font-semibold text-text">
              Editing the layout
            </h3>
            <p className="mt-3 text-text-muted">
              Once a template is open in the editor you can drag elements on the
              canvas, snap to grid, change Scale and Offset in the right-side
              properties panel, pick exact hex colors, or duplicate any element
              with <kbd>Ctrl+D</kbd>. The layer tree on the left supports
              rename, reorder, and nested grouping, so you can restructure the
              UI without breaking event bindings.
            </p>
          </article>

          <aside className="flex flex-col gap-6">
            <div className="rounded-2xl border border-glass-border bg-surface p-6">
              <h3 className="font-display text-lg font-semibold text-text">
                Browse by category
              </h3>
              <ul className="mt-4 flex flex-col gap-2 text-sm text-text-muted">
                <li>• Inventory — RPG slot grids, equipment panels</li>
                <li>• Menu — main menu, obby start screens, settings</li>
                <li>• Shop — gamepass, dev product, pet hatching</li>
                <li>• HUD — FPS, simulator, mobile-first</li>
                <li>• Leaderboard — OrderedDataStore powered top-10</li>
                <li>• Health Bar — tweened damage feedback</li>
                <li>• Loading Screen — progress bar with tips</li>
                <li>• Dialogue — typewriter text, branching choices</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-cyan-accent/30 bg-surface-raised p-6">
              <h3 className="font-display text-lg font-semibold text-text">
                Need a specific UI?
              </h3>
              <p className="mt-2 text-sm text-text-muted">
                Describe it in plain English in the AI panel and the generator
                will scaffold a custom Roblox GUI in seconds — editable on the
                canvas afterwards.
              </p>
              <Link
                href="/editor"
                className="mt-4 inline-flex text-sm font-medium text-cyan-accent hover:underline"
              >
                Generate a custom GUI →
              </Link>
            </div>
          </aside>
        </section>

        {/* CTA band */}
        <section className="rounded-2xl border border-glass-border bg-surface-raised p-8 text-center">
          <h2 className="font-display text-2xl font-semibold text-text">
            Need something custom?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-text-muted">
            Build any Roblox GUI from scratch in our visual editor — then export
            clean Luau in one click.
          </p>
          <Link
            href="/editor"
            className={cn(buttonVariants({ size: "lg" }), "mt-6")}
          >
            Build it in the editor
          </Link>
        </section>
      </main>
    </>
  );
}
