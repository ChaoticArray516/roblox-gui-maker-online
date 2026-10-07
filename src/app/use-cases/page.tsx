import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Breadcrumb, UseCasesListJsonLd, buildPageOpenGraph } from "@/components/seo";
import { OG_PAGES } from "@/lib/og-pages";

const OG = OG_PAGES["/use-cases"];

export const metadata: Metadata = {
  title: OG.title,
  description: OG.description,
  alternates: { canonical: "/use-cases" },
  ...buildPageOpenGraph({ url: "/use-cases", ...OG }), // SOP-3W-02
};

const USE_CASES = [
  { slug: "simulator-hud", name: "Simulator HUD", description: "Clicks, rebirths, pets, and currencies." },
  { slug: "fps-game-ui", name: "FPS Game UI", description: "Ammo, health, crosshair, and kill feed." },
  { slug: "roleplay-menu", name: "Roleplay Menu", description: "Character, dialogue, and shop panels." },
  { slug: "tycoon-ui", name: "Tycoon UI", description: "Upgrades, cash, and progress boards." },
  { slug: "obby-start-screen", name: "Obby Start Screen", description: "Start, rules, and leaderboard buttons." },
];

export default function UseCasesPage() {
  return (
    <>
      <head>
        <UseCasesListJsonLd items={USE_CASES} />
      </head>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-24">
        <Breadcrumb
          items={[{ name: "Home", url: "/" }, { name: "Use Cases", url: "/use-cases" }]}
        />
        <header className="space-y-4">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-text">
            How to Make a GUI for Any Roblox Game
          </h1>
          <p className="max-w-2xl text-text-muted">
            Different genres need different UIs. Pick your game type and see the
            layout patterns, components, and Luau scripts that fit best.
          </p>
        </header>

        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((uc) => (
            <li key={uc.slug}>
              <Link
                href={`/use-cases/${uc.slug}`}
                className="flex h-full flex-col gap-3 rounded-2xl border border-glass-border bg-surface p-6 transition-colors hover:border-cyan-accent/40"
              >
                <h2 className="font-display text-xl font-semibold text-text">{uc.name}</h2>
                <p className="flex-1 text-sm text-text-muted">{uc.description}</p>
                <span className="text-sm font-medium text-cyan-accent">See the build →</span>
              </Link>
            </li>
          ))}
        </ul>

        <section className="rounded-2xl border border-glass-border bg-surface-raised p-8 text-center">
          <h2 className="font-display text-2xl font-semibold text-text">
            Start designing free
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-text-muted">
            Open the editor and build any of these UIs from scratch with AI help.
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
