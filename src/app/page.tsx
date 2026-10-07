import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/site-config";
import { HomeJsonLd } from "@/components/seo";
import { TEMPLATES } from "@/lib/templates";
import { HomepageToolIslandLazy } from "@/components/home/HomepageToolIslandLazy";

export const metadata: Metadata = {
  title: "Roblox GUI Maker — Free No-Code GUI & UI Builder Online",
  description:
    "Free Roblox GUI maker — design game UI with drag & drop, generate Luau with AI, and export in one click. No login required, 50 free credits.",
  alternates: { canonical: "/" },
};

// SOP-3T-05: 精选结果展示（12-16 卡，精选非全量）——模板卡 → /editor?template=，
// examples 卡 → /templates。卡片文案只用场景词，禁止出现主词（词密度防线）。
const FEATURED_TEMPLATES = [
  {
    slug: "rpg-inventory",
    alt: "RPG inventory GUI with drag-and-drop equip slots and item rarity colors",
    caption: "Drag-and-drop equip slots with rarity colors",
  },
  {
    slug: "shop-ui",
    alt: "Roblox shop UI with gamepass and dev product purchase buttons",
    caption: "Gamepass and dev product purchase flow",
  },
  {
    slug: "fps-hud",
    alt: "FPS HUD with ammo counter, health bar and crosshair for Roblox shooters",
    caption: "Ammo, health bar and crosshair overlay",
  },
  {
    slug: "main-menu",
    alt: "Game main menu GUI with play, settings and store buttons",
    caption: "Play, settings and store entry points",
  },
  {
    slug: "simulator-hud",
    alt: "Simulator HUD with click counter, rebirth badge and pet tracker",
    caption: "Click counter and rebirth tracking",
  },
  {
    slug: "settings",
    alt: "Settings menu GUI with volume sliders, toggles and keybind list",
    caption: "Sliders, toggles and keybinds",
  },
  {
    slug: "pet-shop",
    alt: "Pet shop GUI with a 3x3 egg grid and a green buy button",
    caption: "Egg grid with a buy button",
  },
  {
    slug: "leaderboard",
    alt: "Leaderboard panel GUI with player rankings and stat columns",
    caption: "Ranked player stats panel",
  },
] as const;

const FEATURED_EXAMPLES = [
  {
    image: "/examples/admin-dashboard.png",
    name: "Admin Dashboard",
    alt: "Admin panel GUI with moderation tools and player stats tables",
    caption: "Moderation tools and player stats",
  },
  {
    image: "/examples/daily-reward-popup.png",
    name: "Daily Reward Popup",
    alt: "Daily reward popup GUI with seven-day streak calendar and claim button",
    caption: "Seven-day streak claim flow",
  },
  {
    image: "/examples/dark-fantasy-inventory.png",
    name: "Dark Fantasy Inventory",
    alt: "Dark fantasy inventory GUI with glowing rarity borders and equipment slots",
    caption: "Glowing rarity equipment grid",
  },
  {
    image: "/examples/sci-fi-weapon-shop.png",
    name: "Sci-Fi Weapon Shop",
    alt: "Sci-fi weapon shop UI with neon rarity tags and purchase panel",
    caption: "Neon weapon purchase panel",
  },
  {
    image: "/examples/secure-trading-window.png",
    name: "Secure Trading Window",
    alt: "Trading window GUI with dual offer panels and confirm countdown",
    caption: "Dual-offer trade confirmation",
  },
] as const;

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
  { feature: "Roblox Studio plugin sync", us: "Planned", others: "Manual copy" },
  { feature: "Mobile + desktop device preview", us: "Yes", others: "Desktop only" },
];

// SOP-A: FAQ — 嵌入首页的 Q&A。SOP-3T-03 词频治理：品牌词仅保留 2 处（q1/q2），
// 其余改代称，防止 FAQ 区冲淡主词密度预算。
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
    a: "A Figma-to-Roblox converter is planned. Visit the Figma to Roblox page to join the waitlist — once live, it will convert frames into a Roblox-ready UI tree with auto-uploaded image assets and Studio plugin import.",
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
    q: "Does it work with the Roblox Studio plugin?",
    a: "A companion plugin is planned. Join the waitlist on the plugin page to be notified when it lands on the Roblox Creator Marketplace. Until then, you can export clean Luau from the editor and paste it straight into StarterGui.",
  },
  {
    q: "What export formats are supported?",
    a: "The editor exports Client Luau, Server Luau, ModuleScript, a Client+Server bundle, project JSON, and a ZIP bundle — copy the Luau straight into StarterGui or hand the ZIP to a teammate.",
  },
  {
    q: "Can I use the generated GUIs in commercial Roblox games?",
    a: "Yes. GUIs you generate or build with the editor are yours to use in any Roblox game, including ones that earn Robux through gamepasses, developer products, or Premium payouts. The Free and Pro plans both grant full commercial usage rights — the Pro plan only adds unlimited AI credits and premium templates.",
  },
];

export default function HomePage() {
  return (
    <>
      <head>
        <HomeJsonLd />
      </head>
      <main className="flex flex-1 flex-col">
        {/* §A 第一屏：左 = SSR 真文字（眉题/H1/副标/trust 行），右 = CSR 工具岛 */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-accent">
              Free Roblox GUI Maker
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-text sm:text-5xl">
              Roblox GUI Maker: Build Game UI Visually, Export Clean Luau
            </h1>
            <p className="mt-4 max-w-xl text-lg text-text-muted">
              Design your game interface on a drag-and-drop canvas, generate
              Luau from a plain-English prompt, and paste the code straight
              into Roblox Studio.
            </p>
            <p className="mt-6 text-sm font-medium text-text-muted">
              Free · No login required · 50 free credits
            </p>
          </div>
          <HomepageToolIslandLazy />
        </section>

        {/* §B-1（~200 词，整合 Pain-point 内容） */}
        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Why Choose This Roblox GUI Maker
          </h2>
          <div className="mt-8 grid items-center gap-8 md:grid-cols-2">
            <div className="space-y-4 text-text-muted">
              <p>
                Ask any Roblox developer what slows them down and you will hear
                the same answer: building UI inside Studio means typing UDim2
                values, hitting Play, waiting for the game to load, and nudging
                Scale and Offset by hand until a button finally sits where it
                should. A single inventory panel can eat an afternoon. Wiring
                the Luau behind it — button events, inventory logic, DataStore
                calls — is where most tutorials stop and the real guessing
                begins.
              </p>
              <p>
                This Roblox GUI maker exists to remove those two bottlenecks.
                You compose the interface on a visual canvas that shows exactly
                what players will see, so the trial-and-error loop disappears.
                When you need logic, the AI generator drafts clean, editable
                Luau from a plain-English description, and every element it
                creates stays fully adjustable on the canvas. You keep full
                control of the result instead of accepting a black box.
              </p>
              <p>
                Because the whole tool runs in the browser, there is nothing to
                install and no Studio plugin required to get started. Open the
                editor, pick a template or describe your idea, and watch a
                working GUI take shape in under a minute.
              </p>
            </div>
            <figure className="overflow-hidden rounded-2xl border border-glass-border bg-surface-raised">
              <Image
                src="/showcase/prompt-to-gui.png"
                alt="Prompt to GUI showcase — a dark editor panel with a glowing prompt beside a generated cyberpunk weapon shop interface"
                width={1280}
                height={720}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="h-auto w-full"
                loading="lazy"
              />
              <figcaption className="px-5 py-4 text-sm text-text-muted">
                Type a prompt in natural language. Get a polished interface with
                editable Luau — not a black-box screenshot.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* §B-2 From Prompt to Playable UI in Three Steps（~180 词，整合 How it Works） */}
        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            From Prompt to Playable UI in Three Steps
          </h2>
          <div className="mt-6 max-w-3xl space-y-4 text-text-muted">
            <p>
              Everything in the editor follows one predictable pipeline, so you
              always know what comes next.
            </p>
            <p>
              <strong className="text-text">First, describe what you need.</strong>{" "}
              A prompt like &quot;Pet shop GUI with a 3x3 egg grid and a green
              Buy button&quot; is enough — the generator understands
              Roblox-specific terms such as ScreenGui, Frame, UIGridLayout, and
              UDim2, and returns a working layout in seconds. Prefer to start
              hands-on? Skip the prompt and open any template directly on the
              canvas.
            </p>
            <p>
              <strong className="text-text">Second, refine the layout visually.</strong>{" "}
              Drag elements into place, snap to the grid, adjust Scale and
              Offset, set anchor points, and pick exact colors in the
              properties panel. Device frames let you preview the same GUI on
              desktop, tablet, and phone before you commit.
            </p>
            <p>
              <strong className="text-text">Third, export.</strong> One click
              produces a commented LocalScript that rebuilds your entire UI
              hierarchy. Paste it into StarterGui, hit Play in Studio, and the
              interface appears exactly as you designed it.
            </p>
          </div>
          <figure className="mt-8 overflow-hidden rounded-2xl border border-glass-border bg-surface-raised">
            <Image
              src="/showcase/how-it-works.png"
              alt="Three-step workflow diagram — text prompt on the left, RPG inventory preview in the middle, clean Luau code on the right"
              width={1024}
              height={559}
              sizes="(max-width: 768px) 100vw, 896px"
              className="h-auto w-full"
              loading="lazy"
            />
          </figure>
        </section>

        {/* §B-3（~180 词，整合 Free & No-Code） */}
        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Free Roblox GUI Generator with 50 AI Credits
          </h2>
          <div className="mt-6 max-w-3xl space-y-4 text-text-muted">
            <p>
              The AI panel is a Roblox GUI generator trained around real game
              UI patterns. Tell it &quot;dark fantasy inventory with rarity
              colors&quot; or &quot;simulator HUD with a rebirth button&quot;
              and it assembles the frames, buttons, and layouts for you —
              including starter Luau logic you can read and modify. Because the
              output lands on the same canvas as hand-built work, you can mix
              AI generation with manual editing freely.
            </p>
            <p>
              The free plan includes 50 AI generation credits every month, the
              full drag-and-drop editor, and the public template library. No
              credit card is required, and you do not even need an account to
              try it: open the editor and the generator runs in demo mode so
              you can judge the output quality before signing up.
            </p>
            <p>
              When you outgrow the free credits, the Pro plan at $9.99 per
              month removes the limit entirely. And this Roblox GUI generator
              never locks your exports behind the paywall — code you generate
              on the free plan is yours to keep.
            </p>
          </div>
        </section>

        {/* §B-4（~200 词，整合 4 受众卡） */}
        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Roblox UI Maker for Every Game Genre
          </h2>
          <div className="mt-8 grid items-center gap-8 md:grid-cols-2">
            <div className="space-y-4 text-text-muted">
              <p>
                Different Roblox genres stress a UI in very different ways, and
                the templates and AI prompts here are tuned for each of them.
              </p>
              <p>
                <strong className="text-text">Simulator developers</strong> can
                spin up click counters, rebirth badges, pet hatch panels, and
                currency HUDs in minutes — the simulator HUD template ships
                with tweened pop numbers and thumb-zone layouts, so a clicker
                feels responsive on phones where most players are.{" "}
                <strong className="text-text">FPS and tactical game makers</strong>{" "}
                get ammo counters, health and armor bars, a center crosshair,
                and kill feeds built for low clutter, scaling cleanly from 16:9
                to ultrawide without covering targets.
              </p>
              <p>
                <strong className="text-text">Roleplay and RPG creators</strong>{" "}
                can generate character sheets, dialogue boxes with typewriter
                text, branching quest choices, and inventory grids with item
                rarity colors.{" "}
                <strong className="text-text">Obby and casual builders</strong>{" "}
                start from pre-wired start screens, checkpoint timers, and
                stage counters with big tappable buttons. Whatever you ship,
                this Roblox UI maker gives you a genre-specific starting point
                instead of a blank frame.
              </p>
            </div>
            <figure className="overflow-hidden rounded-2xl border border-glass-border bg-surface-raised">
              <Image
                src="/showcase/multi-device-preview.png"
                alt="Space Exploration main menu rendered identically on a desktop monitor and a smartphone with dark translucent panels"
                width={1280}
                height={720}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="h-auto w-full"
                loading="lazy"
              />
              <figcaption className="px-5 py-4 text-sm text-text-muted">
                Toggle Desktop, Tablet, and Mobile in the editor. Scale-based
                UDim2 sizing keeps your UI sharp on every device.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* §B-5 Clean Luau Export — No Lock-In（~150 词，整合 Features bento） */}
        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Clean Luau Export — No Lock-In
          </h2>
          <div className="mt-6 max-w-3xl space-y-4 text-text-muted">
            <p>
              Every export is plain, commented Luau that reads like a developer
              wrote it. The generator builds your UI hierarchy programmatically
              — no redundant wrapper frames, no mystery variables — so the
              script pastes straight into StarterGui and runs.
            </p>
            <p>
              Exports cover the common handoffs. Grab a LocalScript when you
              want the GUI itself, a ModuleScript or Client+Server bundle for
              structured projects, the project JSON to back up or re-import
              your work, or a ZIP bundle with everything when you are handing
              the interface to a teammate or a client.
            </p>
            <p>
              Exporting is available on the free plan with no watermark and no
              feature gating. Your designs, your code, your game — the tool
              earns its keep by saving you hours, not by holding your work
              hostage.
            </p>
          </div>
        </section>

        {/* §C 精选结果展示列表（SSR 层，爬虫可读；卡片只用场景词） */}
        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
              Roblox GUI Examples Ready to Remix
            </h2>
            <Link
              href="/templates"
              className="text-sm font-medium text-cyan-accent hover:underline"
            >
              Browse all templates →
            </Link>
          </div>
          <p className="mt-2 max-w-2xl text-text-muted">
            Templates below open straight in the editor. Examples marked
            “Gallery only” live in our template gallery — full editor support
            coming as we expand.
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {FEATURED_TEMPLATES.map((item) => {
              const t = TEMPLATES[item.slug];
              return (
                <li key={item.slug}>
                  <Link
                    href={`/editor?template=${item.slug}`}
                    className="group block overflow-hidden rounded-xl border border-glass-border bg-surface transition-colors hover:border-cyan-accent/40"
                  >
                    <Image
                      src={t.previewImage}
                      alt={item.alt}
                      width={450}
                      height={300}
                      className="aspect-video w-full object-cover transition group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                    <div className="p-3">
                      <p className="font-medium text-text">{t.name}</p>
                      <p className="mt-1 text-xs text-text-muted">
                        {item.caption}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
            {FEATURED_EXAMPLES.map((item) => (
              <li key={item.image}>
                <Link
                  href="/templates"
                  className="group relative block overflow-hidden rounded-xl border border-glass-border bg-surface transition-colors hover:border-cyan-accent/40"
                >
                  <span className="absolute left-2 top-2 z-10 rounded-full bg-surface-raised/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-text-muted">
                    Gallery only
                  </span>
                  <Image
                    src={item.image}
                    alt={item.alt}
                    width={450}
                    height={300}
                    className="aspect-video w-full object-cover transition group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  <div className="p-3">
                    <p className="font-medium text-text">{item.name}</p>
                    <p className="mt-1 text-xs text-text-muted">
                      {item.caption}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Use-case strip（保留） */}
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

        {/* Comparison table（保留） */}
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

        {/* FAQ（保留，词频治理后品牌词 2 处） */}
        <section className="mx-auto w-full max-w-4xl px-6 py-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Frequently asked questions
          </h2>
          <p className="mt-3 max-w-3xl text-text-muted">
            Quick answers about pricing, AI generation, the Studio plugin, and
            how the Luau export pipeline works.
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

        {/* §H Final CTA（升级文案） */}
        <section className="mx-auto w-full max-w-5xl px-6 py-24 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-text">
            Start building your Roblox GUI in minutes
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-text-muted">
            No credit card. 50 AI generation credits every month on the Free
            plan.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/editor" className={cn(buttonVariants({ size: "lg" }))}>
              Open the Editor — It&apos;s Free
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
