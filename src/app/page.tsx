import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site-config";
import { HomeJsonLd } from "@/components/seo";
import { TEMPLATES, getTemplatePriceLabel } from "@/lib/templates";

export const metadata: Metadata = {
  title: `${SITE_NAME}: Visually Build & Export Clean Luau in Seconds`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

const PAIN_POINTS = [
  {
    quote:
      "Positioning GUIs by typing UDim2 values and hitting Play to check is painful. I waste hours nudging Scale and Offset by hand.",
    source: "Common Roblox DevForum complaint",
  },
  {
    quote:
      "I can design the UI fine, but wiring up the Luau — buttons, inventory logic, DataStore — is where every tutorial leaves me stuck.",
    source: "Recurring r/robloxgamedev theme",
  },
];

const FEATURES = [
  {
    title: "Drag-and-Drop Editor",
    body: "Compose ScreenGui layouts on a visual canvas. Tweak Scale/Offset, anchor points, and Z-index without leaving the browser.",
  },
  {
    title: "Controllable AI Generation",
    body: "Describe the UI in plain English and get clean, editable Luau — not a black box. Refine on the canvas afterwards.",
  },
  {
    title: "One-Click Luau Export",
    body: "Export production-ready Luau for StarterGui, or push straight into Studio with the companion plugin.",
  },
];

// SOP-A: 全部 12 个模板都展示在首页（10+ 模板描述用于薄内容修复 + 长尾关键词）
const ALL_TEMPLATES = Object.values(TEMPLATES);

const USE_CASES = [
  {
    slug: "simulator-hud",
    name: "Simulator HUD",
    description: "Click counters, rebirth badges, and pet trackers.",
  },
  {
    slug: "fps-game-ui",
    name: "FPS Game UI",
    description: "Ammo, health bars, crosshairs, and kill feeds.",
  },
  {
    slug: "roleplay-menu",
    name: "Roleplay Menu",
    description: "Character panels, dialogue boxes, and shop UIs.",
  },
];

const COMPARISON = [
  { feature: "Visual drag-and-drop canvas", us: "Yes", others: "Partial" },
  { feature: "Editable Luau export (not a black box)", us: "Yes", others: "Rarely" },
  { feature: "Templates with real game logic", us: "Yes", others: "Static visuals" },
  { feature: "Free tier with AI credits", us: "50 / month", others: "Limited" },
  { feature: "Controllable AI (edit output on canvas)", us: "Yes", others: "Black box" },
  { feature: "Roblox Studio plugin sync", us: "Waitlist", others: "Manual copy" },
  { feature: "Mobile + desktop device preview", us: "Yes", others: "Desktop only" },
];

// SOP-A: Who is it for — 分受众说明，扩字数 + 覆盖各游戏类型长尾词
const AUDIENCES = [
  {
    title: "Simulator developers",
    body: "Spin up click counters, rebirth badges, pet hatch panels, and currency HUDs in minutes. The simulator HUD template ships with tweened pop numbers and mobile thumb-zone layouts so your clicker feels responsive on phones.",
  },
  {
    title: "FPS & tactical game makers",
    body: "Drop in ammo counters, health and armor bars, a center crosshair, and a kill feed. The FPS HUD template is built for low clutter and scales cleanly from 16:9 to ultrawide without obstructing targets.",
  },
  {
    title: "Roleplay & RPG creators",
    body: "Generate character sheets, dialogue boxes with typewriter text, branching quest choices, and inventory grids with item rarity colors. Every panel uses Scale-based sizing so it stays readable across devices.",
  },
  {
    title: "Obby & casual game builders",
    body: "Start screens, checkpoint timers, stage counters, and rules panels come pre-wired. The obby start screen template has big tappable buttons and UICorner rounded panels tuned for touch.",
  },
];

// SOP-A: How it Works — Prompt → Edit → Export 三步流水线
const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Describe your Roblox UI in plain English",
    body: "Type a prompt like \"Pet shop GUI with a 3x3 egg grid and a green Buy button\" into the AI panel. The generator understands Roblox-specific terms — ScreenGui, Frame, UIGridLayout, UDim2 — and returns a working layout in seconds.",
  },
  {
    step: "2",
    title: "Refine the layout on a visual canvas",
    body: "Drag elements, snap to grid, adjust Scale and Offset, set anchor points, and pick exact hex colors in the right-side properties panel. Preview on Desktop, Tablet, and Mobile device frames before exporting.",
  },
  {
    step: "3",
    title: "Export clean Luau and paste into Studio",
    body: "Click \"Export Luau\" for a commented LocalScript you can paste into StarterGui — the Studio plugin sync will be available once it launches.",
  },
];

// SOP-A: FAQ — 嵌入首页的 8 条 Q&A，与 FaqJsonLd 主题对齐但首页版更聚焦"使用门槛"
const HOMEPAGE_FAQ = [
  {
    q: "Do I need to know Lua to use Roblox GUI Maker?",
    a: "No. The drag-and-drop editor builds your GUI visually, and the AI generator writes editable Luau for you. Even if you have never opened a Studio script, you can ship a working UI on day one.",
  },
  {
    q: "Is Roblox GUI Maker free?",
    a: "Yes — the Free plan includes the full visual editor, all free templates, and 50 AI generation credits every month. The Pro plan adds unlimited credits and premium templates.",
  },
  {
    q: "How does the Luau export work?",
    a: "When you click Export, we generate a self-contained LocalScript that programmatically builds your entire UI hierarchy. Paste it into StarterGui in Roblox Studio, hit Play, and your GUI appears exactly as designed.",
  },
  {
    q: "Can I import a Figma design into Roblox?",
    a: "A Figma-to-Roblox converter is in development. Visit the Figma to Roblox page to join the waitlist — once live, it will convert frames into a Roblox-ready UI tree with auto-uploaded image assets and Studio plugin import.",
  },
  {
    q: "Do the templates include real game logic?",
    a: "Yes — every template ships with production-ready Luau. Shops include MarketplaceService prompts, inventories include drag-and-drop and DataStore stubs, leaderboards include OrderedDataStore integration. Not just static visuals.",
  },
  {
    q: "Will my GUI work on mobile?",
    a: "All templates and generated layouts default to Scale-based sizing with auto-fit anchors and UIAspectRatioConstraint where needed. Use the editor's mobile preview to verify touch targets before exporting.",
  },
  {
    q: "Can I edit the AI output?",
    a: "Always. The AI is controllable, not a black box — every element it generates lives in the canvas and properties panel where you can tweak Size, Position, Color, and Z-Index by hand.",
  },
  {
    q: "Does Roblox GUI Maker work with the Roblox Studio plugin?",
    a: "A companion plugin is in development. Join the waitlist on the plugin page to be notified when it lands on the Roblox Creator Marketplace. Until then, you can export clean Luau from the editor and paste it straight into StarterGui.",
  },
  {
    q: "What export formats does Roblox GUI Maker support?",
    a: "Three formats. Export Luau as a commented LocalScript you paste into StarterGui. Export the project as JSON to share or re-import in another workspace. Or export a ZIP bundle containing the Luau, the JSON project file, and a README — handy for handing a GUI off to a teammate or a client.",
  },
  {
    q: "Can I use the generated GUIs in commercial Roblox games?",
    a: "Yes. GUIs you generate or build with Roblox GUI Maker are yours to use in any Roblox game, including ones that earn Robux through gamepasses, developer products, or Premium payouts. The Free and Pro plans both grant full commercial usage rights — the Pro plan only adds unlimited AI credits and premium templates.",
  },
];

export default function HomePage() {
  return (
    <>
      <head>
        <HomeJsonLd />
      </head>
      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-6 py-28 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-accent">
            AI-Powered Roblox UI Generator
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-text sm:text-6xl">
            Roblox GUI Maker: Visually Build &amp; Export Clean Luau in Seconds
          </h1>
          <p className="max-w-2xl text-lg text-text-muted">
            Figma-level drag &amp; drop, controllable AI, and one-click Luau
            export — no coding required. Skip the boilerplate and import straight
            into Studio.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/editor" className={cn(buttonVariants({ size: "lg" }))}>
              Try Editor Free
            </Link>
            <Link
              href="/templates"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
            >
              Browse GUI Templates
            </Link>
          </div>
        </section>

        {/* Hero showcase — Gemini Dark Glassmorphism design renders */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-16">
          <div className="grid gap-6 md:grid-cols-2">
            <figure className="overflow-hidden rounded-2xl border border-glass-border bg-surface-raised">
              <Image
                src="/showcase/prompt-to-gui.png"
                alt="Roblox GUI Maker prompt-to-GUI showcase — a dark code editor with glowing cyan prompt on the left and a generated cyberpunk weapon shop GUI with frosted glass panels and neon rarity tags on the right"
                width={1280}
                height={720}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="h-auto w-full"
                priority
              />
              <figcaption className="px-5 py-4 text-sm text-text-muted">
                Type a prompt in natural language. Get a polished Roblox GUI with
                editable Luau — not a black-box screenshot.
              </figcaption>
            </figure>
            <figure className="overflow-hidden rounded-2xl border border-glass-border bg-surface-raised">
              <Image
                src="/showcase/multi-device-preview.png"
                alt="Roblox GUI Maker multi-device preview — a Space Exploration main menu rendered identically on a matte-black desktop monitor and a smartphone, both using dark translucent glassmorphism panels"
                width={1280}
                height={720}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="h-auto w-full"
                loading="lazy"
              />
              <figcaption className="px-5 py-4 text-sm text-text-muted">
                Toggle Desktop, Tablet, and Mobile in the editor. Scale-based UDim2
                sizing keeps your UI sharp on every device.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Pain-point comparison */}
        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Building Roblox UI by hand is slow. We fixed the two worst parts.
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-glass-border bg-surface p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                Studio native workflow
              </h3>
              <ul className="mt-4 space-y-4">
                {PAIN_POINTS.map((p) => (
                  <li key={p.source}>
                    <blockquote className="text-text">“{p.quote}”</blockquote>
                    <cite className="mt-1 block text-xs not-italic text-text-muted">
                      — {p.source}
                    </cite>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-cyan-accent/30 bg-surface-raised p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-cyan-accent">
                With {SITE_NAME}
              </h3>
              <ul className="mt-4 space-y-3 text-text">
                <li>Drag, drop, and snap — no manual UDim2 math.</li>
                <li>AI writes editable Luau you can read and tweak.</li>
                <li>Templates ship with working logic, not just visuals.</li>
                <li>Export or push to Studio in one click.</li>
              </ul>
              <Link
                href="/editor"
                className={cn(buttonVariants({ size: "lg" }), "mt-6")}
              >
                Try Editor Free
              </Link>
            </div>
          </div>
        </section>

        {/* SOP-A: How it Works (Prompt → Edit → Export 三步流水线) */}
        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            How Roblox GUI Maker works
          </h2>
          <p className="mt-3 max-w-3xl text-text-muted">
            From a one-line prompt to production-ready Luau in under five
            minutes. The pipeline is built around three predictable stages, so
            you always know what to do next.
          </p>
          <figure className="mt-8 overflow-hidden rounded-2xl border border-glass-border bg-surface-raised">
            <Image
              src="/showcase/how-it-works.png"
              alt="Roblox GUI Maker workflow diagram showing the three-step pipeline: text prompt input on the left, a dark RPG inventory GUI preview in the middle, and clean Luau code on the right, connected by glowing neon data lines"
              width={1024}
              height={559}
 sizes="(max-width: 768px) 100vw, 896px"
              className="h-auto w-full"
              loading="lazy"
            />
          </figure>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((s) => (
              <li
                key={s.step}
                className="rounded-2xl border border-glass-border bg-surface p-6"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-raised font-display text-base font-semibold text-cyan-accent">
                  {s.step}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-text">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm text-text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* SOP-A: Who is it for — 分受众说明，扩字数 + 游戏类型长尾词 */}
        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Built for every kind of Roblox developer
          </h2>
          <p className="mt-3 max-w-3xl text-text-muted">
            Whether you are shipping your first simulator or polishing a
            tactical FPS, {SITE_NAME} has a template and an AI prompt tuned for
            your genre. Pick your category below, generate a starter layout in
            seconds, then refine it on the canvas.
          </p>
          <ul className="mt-8 grid gap-6 md:grid-cols-2">
            {AUDIENCES.map((a) => (
              <li
                key={a.title}
                className="rounded-2xl border border-glass-border bg-surface p-6"
              >
                <h3 className="font-display text-lg font-semibold text-text">
                  {a.title}
                </h3>
                <p className="mt-3 text-sm text-text-muted">{a.body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-text-muted">
            Not sure where yours fits? Describe your game in the{" "}
            <Link href="/editor" className="text-cyan-accent hover:underline">
              AI panel
            </Link>{" "}
            and the generator will pick a sensible starting layout — you can
            always swap components afterwards.
          </p>
        </section>

        {/* Features bento */}
        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Everything you need to ship Roblox UI
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-glass-border bg-surface p-6"
              >
                <h3 className="font-display text-lg font-semibold text-text">
                  {f.title}
                </h3>
                <p className="mt-3 text-sm text-text-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Use-case strip */}
        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Built for every Roblox genre
          </h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {USE_CASES.map((uc) => (
              <li key={uc.slug}>
                <Link
                  href={`/use-cases/${uc.slug}`}
                  className="block rounded-2xl border border-glass-border bg-surface p-6 transition-colors hover:border-cyan-accent/40"
                >
                    <h3 className="font-display text-lg font-semibold text-text">{uc.name}</h3>
                    <p className="mt-2 text-sm text-text-muted">{uc.description}</p>
                    <span className="mt-4 inline-block text-sm font-medium text-cyan-accent">See the guide →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* SOP-A: 全 12 模板预览 + 描述（薄内容修复，长尾关键词捕获） */}
        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
              Production-ready Roblox GUI templates
            </h2>
            <Link
              href="/templates"
              className="text-sm font-medium text-cyan-accent hover:underline"
            >
              Browse all templates →
            </Link>
          </div>
          <p className="mt-3 max-w-3xl text-text-muted">
            Twelve hand-built layouts covering the most common Roblox UI
            patterns: inventories, shops, HUDs, leaderboards, dialogue boxes,
            and obby start screens. Every template includes the component tree,
            real Luau logic, and a one-click &quot;Open in Web Editor&quot;
            shortcut.
          </p>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_TEMPLATES.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/templates/${t.slug}`}
                  className="block h-full rounded-2xl border border-glass-border bg-surface p-6 transition-colors hover:border-cyan-accent/40"
                >
                  <figure
                    className="relative aspect-video w-full overflow-hidden rounded-lg bg-surface-raised"
                  >
                    <Image
                      src={t.previewImage}
                      alt={`${t.name} Roblox GUI template preview — ${t.feature}, ${t.style} style, ${t.device} layout`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                      loading="lazy"
                    />
                    <figcaption className="sr-only">
                      Roblox {t.name} GUI template preview showing {t.feature.toLowerCase()} on a {t.style} {t.category.toLowerCase()} layout.
                    </figcaption>
                  </figure>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold text-text">
                      {t.name}
                    </h3>
                    <span className="text-xs text-text-muted">
                      {getTemplatePriceLabel(t)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-wide text-cyan-accent">
                    {t.feature}
                  </p>
                  <p className="mt-2 text-sm text-text-muted">{t.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Comparison table */}
        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            How we compare
          </h2>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-glass-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-raised text-text">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Feature
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    {SITE_NAME}
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Bloxsmith / FigBloxUI
                  </th>
                </tr>
              </thead>
              <tbody className="text-text-muted">
                {COMPARISON.map((row) => (
                  <tr key={row.feature} className="border-t border-glass-border">
                    <th scope="row" className="px-4 py-3 font-normal text-text">
                      {row.feature}
                    </th>
                    <td className="px-4 py-3 text-cyan-accent">{row.us}</td>
                    <td className="px-4 py-3">{row.others}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SOP-A: FAQ on homepage — 8 Q&A 大幅扩字数 + FAQ 长尾 */}
        <section className="mx-auto w-full max-w-4xl px-6 py-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Frequently asked questions
          </h2>
          <p className="mt-3 max-w-3xl text-text-muted">
            Quick answers about Roblox GUI Maker — pricing, AI, the Studio
            plugin, and how the Luau export pipeline works.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {HOMEPAGE_FAQ.map((item) => (
              <details
                key={item.q}
                className="rounded-xl border border-glass-border bg-surface p-5"
              >
                <summary className="cursor-pointer font-medium text-text">
                  {item.q}
                </summary>
                <p className="mt-3 text-sm text-text-muted">{item.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-sm text-text-muted">
            More detailed questions covered on the{" "}
            <Link href="/faq" className="text-cyan-accent hover:underline">
              full FAQ page
            </Link>
            , including pricing, refunds, and commercial use.
          </p>
        </section>

        {/* Final CTA */}
        <section className="mx-auto w-full max-w-5xl px-6 py-24 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-text">
            Start building free
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-text-muted">
            No credit card. 50 AI generation credits every month on the Free plan.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
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
        </section>
      </main>
    </>
  );
}
