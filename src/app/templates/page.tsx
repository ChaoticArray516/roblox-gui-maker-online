import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TemplatesListJsonLd, buildPageOpenGraph } from "@/components/seo";
import { OG_PAGES } from "@/lib/og-pages";
import { TemplateBrowser } from "@/components/templates/TemplateBrowser";
import { TEMPLATES } from "@/lib/templates";

export const revalidate = 3600; // ISR — keep in sync with ISR_REVALIDATE_SECONDS in @/lib/constants

const OG = OG_PAGES["/templates"];

export const metadata: Metadata = {
  title: OG.title,
  description: OG.description,
  alternates: { canonical: "/templates" },
  ...buildPageOpenGraph({ url: "/templates", ...OG }), // SOP-3W-02
};

const templates = Object.values(TEMPLATES);

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

        <TemplateBrowser templates={templates} />

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
              StarterGui.
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
                <strong className="text-text">Studio plugin sync (planned).</strong>{" "}
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
                <li>• Settings — toggles, sliders, keybind panels</li>
                <li>• Rewards — daily claim, streak counters</li>
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

        {/* SOP-3K-07: screen-gui-generator section（P2 词：roblox screen gui generator） */}
        <section className="rounded-2xl border border-glass-border bg-surface p-8">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text">
            Roblox ScreenGui generator
          </h2>
          <p className="mt-3 max-w-3xl text-text-muted">
            Need a ScreenGui from scratch instead of a template? The editor
            generates one from a prompt. Describe the layout - main menu, HUD,
            inventory - and get a ScreenGui with Frames, TextLabels, and
            TextButtons wired up, ready to paste into StarterGui.
          </p>
          <Link
            href="/editor"
            className={cn(buttonVariants({ size: "lg" }), "mt-6")}
          >
            Generate a ScreenGui
          </Link>
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
