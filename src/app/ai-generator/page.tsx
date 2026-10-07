import type { Metadata } from "next";
import Link from "next/link";

import { SITE_URL, SITE_NAME } from "@/lib/site-config";
import { JsonLd, buildPageOpenGraph } from "@/components/seo";
import { FAQAccordion, CTASection } from "@/components/content";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { OG_PAGES } from "@/lib/og-pages";

const OG = OG_PAGES["/ai-generator"];

export const metadata: Metadata = {
  title: { absolute: OG.title },
  description: OG.description,
  alternates: { canonical: "/ai-generator" },
  ...buildPageOpenGraph({ url: "/ai-generator", ...OG }), // SOP-3W-02
};

const FAQS = [
  {
    question: "Does the AI generate real Luau code or just images?",
    answer:
      "Real Luau code, not images. The AI returns a working UI hierarchy - Frames, TextLabels, TextButtons - that you can paste into StarterGui and edit. You own the output and can customize every value.",
  },
  {
    question: "Is the AI Roblox GUI generator free?",
    answer:
      "Yes - the free tier includes 50 AI generation credits per month. Each generation costs one credit. Pro is $9.99 per month with unlimited generations when you scale.",
  },
  {
    question: "What can I describe to the AI?",
    answer:
      "Any Roblox UI. Describe a main menu, a pet shop, an FPS HUD, an inventory grid, or a settings panel. The AI understands Roblox terms like ScreenGui, Frame, UIGridLayout, and UDim2, so you can be specific.",
  },
  {
    question: "Can I edit what the AI generates?",
    answer:
      "Yes. Every element the AI creates lands on the visual canvas, where you can drag, resize, recolor, and re-layer it. The generated Luau updates as you edit, so the code and the canvas stay in sync.",
  },
  {
    question: "How is this different from other AI UI tools?",
    answer:
      "Most AI UI tools output images or screenshots. Roblox GUI Maker outputs editable Luau code you can paste into Studio and ship. As of July 2026, no other Roblox GUI tool offers AI generation plus code export.",
  },
];

export default function AiGeneratorPage() {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/ai-generator/#software`,
      name: `${SITE_NAME} - AI Generator`,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      description:
        "An AI Roblox GUI generator that turns a text prompt into editable Luau code - not an image or screenshot. Describe a UI, get a working layout, and paste it into Studio.",
      url: `${SITE_URL}/ai-generator`,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
  ];

  return (
    <>
      <head>
        <JsonLd data={graph} id="ai-generator-jsonld" />
      </head>
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-24">
        <header className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-accent">
            Real Luau, Not Images
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-text">
            AI Roblox GUI Generator
          </h1>
          <p className="text-lg text-text-muted">
            Describe a UI in plain text and get editable Luau code - not a
            screenshot or mockup. The AI returns a working layout you can paste
            into StarterGui and customize. It is the only Roblox GUI tool that
            generates real code, as of July 2026.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/editor" className={cn(buttonVariants({ size: "lg" }))}>
              Try the AI Generator Free
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
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text">
            Why code beats images
          </h2>
          <p className="mt-3 text-base leading-7 text-text-muted">
            Most AI UI tools output a picture. You look at it, you cannot ship
            it. Roblox GUI Maker outputs Luau - a LocalScript that builds your
            UI hierarchy programmatically. Paste it into StarterGui, press Play,
            and the GUI appears exactly as designed. Then edit any value in the
            code or on the canvas. You own the output.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text">
            What you can generate
          </h2>
          <ul className="mt-4 flex flex-col gap-2 text-text-muted">
            <li>• Main menus with Play, Settings, and Shop buttons</li>
            <li>• Pet shops and item shops with rarity-colored card grids</li>
            <li>• FPS HUDs with ammo, health, and crosshair</li>
            <li>• Inventory grids with drag-and-drop and rarity borders</li>
            <li>• Settings panels with sliders and toggles</li>
            <li>• Dialogue systems with typewriter text and branching choices</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text">
            How the AI generation works
          </h2>
          <p className="mt-3 text-text-muted">
            You describe the UI in plain text, and the AI returns a working
            layout with editable Luau. Every element lands on the visual
            canvas, where you can drag, resize, recolor, and re-layer it before
            exporting. The generated code and the canvas stay in sync, so what
            you see is exactly what you paste into Studio. The Free plan
            includes 50 AI generation credits per month; each generation costs
            one credit. Anonymous users get a free sample layout with OpenRouter
            disabled, so you can try the AI before signing up.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text">
            Frequently asked questions
          </h2>
          <FAQAccordion items={FAQS} className="mt-4" injectSchema={false} />
        </section>

        <CTASection
          title="Generate your first Roblox GUI with AI"
          description="Free to start. 50 AI credits per month, no credit card required."
          buttons={[
            { variant: "primary", href: "/editor", label: "Try Editor Free" },
            { variant: "secondary", href: "/pricing", label: "See pricing" },
          ]}
        />
      </main>
    </>
  );
}
