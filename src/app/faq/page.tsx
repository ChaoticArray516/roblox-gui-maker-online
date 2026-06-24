import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/site-config";
import { FaqJsonLd } from "@/components/seo";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Frequently Asked Questions`,
  description:
    "Answers to common questions about Roblox GUI Maker — pricing, code export, Studio plugin, Figma import, and limits.",
  alternates: { canonical: "/faq" },
};

const FAQ_CATEGORIES = ["General", "Pricing", "Technical", "Plugin"] as const;

const faqItems = [
  {
    category: "General",
    q: "What is Roblox GUI Maker?",
    a: "Roblox GUI Maker is an AI-powered online tool that helps you create game user interfaces without coding. It combines a drag-and-drop visual editor, AI code generation, a planned Figma-to-Studio import feature, and a template marketplace into one platform. A Roblox Studio plugin is also in development.",
  },
  {
    category: "Pricing",
    q: "Is Roblox GUI Maker free?",
    a: "Yes, there is a free tier that includes the full drag-and-drop editor, 50 AI generation credits per month, clean Luau export, and access to the free template library. The Pro plan will be $9.99/month when subscriptions open and will add unlimited AI generations, premium templates, and advanced features.",
  },
  {
    category: "Technical",
    q: "How does the AI code generation work?",
    a: "You describe your GUI in natural language (e.g., 'Create a health bar with a red background, white border, and green fill that decreases from left to right'). Our AI generates the complete Luau script with proper Scale/Offset handling, Signal patterns, and event handlers. The code follows Roblox best practices and can be directly used in your game.",
  },
  {
    category: "Plugin",
    q: "How do I install the Roblox Studio plugin?",
    a: "The plugin is not yet available. Visit roblox-gui-maker.online/plugin and click Join Plugin Waitlist. We'll email you as soon as it passes Roblox Creator Marketplace review and can be installed from your Studio Plugins tab.",
  },
  {
    category: "Technical",
    q: "Can I import my Figma designs into Roblox Studio?",
    a: "A Figma-to-Roblox converter is in development. Join the waitlist at roblox-gui-maker.online/figma-to-roblox to be notified when public Figma URL conversion, automatic asset upload, and Studio plugin import are ready.",
  },
  {
    category: "Technical",
    q: "What Roblox GUI components are supported?",
    a: "We support all Roblox GUI objects: ScreenGui, Frame, TextLabel, TextButton, ImageLabel, ImageButton, TextBox, ScrollingFrame, ViewportFrame, VideoFrame, UIGridLayout, UIListLayout, UIPageLayout, UITableLayout, UIAspectRatioConstraint, UISizeConstraint, UITextSizeConstraint, and UICorner.",
  },
  {
    category: "Pricing",
    q: "Can I sell the GUIs I create with Roblox GUI Maker?",
    a: "Yes! GUIs you create with the free tier or Pro plan (when available) are yours to use in any commercial Roblox game. Templates purchased from the marketplace have their own license terms — check each template's license before redistributing.",
  },
  {
    category: "General",
    q: "Do I need to know Luau scripting to use Roblox GUI Maker?",
    a: "No! The drag-and-drop editor handles all layout and positioning visually. The AI generates scripts for button clicks, animations, and data binding automatically. However, knowing Luau helps you customize the generated code for complex game logic.",
  },
  {
    category: "Pricing",
    q: "What's your refund policy?",
    a: "Once Pro subscriptions open, they will come with a 14-day money-back guarantee. Email chaoticarray.rf516@gmail.com within 14 days of your first charge and we'll issue a full refund — no questions asked. Marketplace template purchases are also eligible for a 14-day refund if the template is broken or significantly differs from its description.",
  },
];

export default function FaqPage() {
  return (
    <>
      <head>
        <FaqJsonLd />
      </head>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-24">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-text">
          Roblox GUI Maker — Frequently Asked Questions
        </h1>

        {/* Static search + category anchors (SSG: no JS filtering) */}
        <div className="flex flex-col gap-4">
          <input
            type="search"
            placeholder="Search questions..."
            aria-label="Search FAQ"
            className="w-full rounded-xl border border-glass-border bg-surface-raised px-4 py-3 text-sm text-text placeholder:text-text-muted"
          />
          <div className="flex flex-wrap gap-2">
            {FAQ_CATEGORIES.map((cat) => (
              <a
                key={cat}
                href={`#${cat.toLowerCase()}`}
                className="rounded-full border border-glass-border bg-surface px-3 py-1 text-xs font-medium text-text-muted transition-colors hover:border-cyan-accent/40 hover:text-text"
              >
                {cat}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {FAQ_CATEGORIES.map((cat) => {
            const items = faqItems.filter((i) => i.category === cat);
            return (
              <section key={cat} id={cat.toLowerCase()}>
                <h2 className="font-display text-xl font-semibold text-text">{cat}</h2>
                <div className="mt-4 flex flex-col gap-3">
                  {items.map((item) => (
                    <details
                      key={item.q}
                      className="rounded-2xl border border-glass-border bg-surface p-6"
                    >
                      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                        <h3 className="inline text-lg font-semibold text-text">
                          {item.q}
                        </h3>
                      </summary>
                      <p className="mt-3 text-text-muted">{item.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <section className="rounded-2xl border border-glass-border bg-surface-raised p-8 text-center">
          <h2 className="font-display text-2xl font-semibold text-text">
            Still have questions?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-text-muted">
            Try the editor yourself, or join the waitlist to be notified when
            the Studio plugin launches.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/editor" className={cn(buttonVariants({ size: "lg" }))}>
              Try Editor Free
            </Link>
            <Link
              href="/plugin"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
            >
              Join plugin waitlist
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
