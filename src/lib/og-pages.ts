/**
 * SOP-3W-02: 13 个静态内容页的 OG/Twitter 文案单源表。
 *
 * 各页 metadata.title/description 从本表 import（DRY：禁止同一文案两处漂移）；
 * 动态页（templates/compare/blog/use-cases/guides/docs 的 [slug]）不进表，
 * 在各自 generateMetadata 内联组装 buildPageOpenGraph。
 *
 * 文案逐字搬运自各页 metadata 现状（2026-10-03），社交卡三大要素
 * （og:url = canonical、og:title、og:description）自此按页独立。
 * 首页不进表（layout 的 OG 即首页的，现状正确）；noindex 页不接 OG。
 */

import { SITE_NAME } from "@/lib/site-config";
import { generateTitle, generateDescription } from "@/lib/seo-utils";

export interface OgPageEntry {
  readonly title: string;
  readonly description: string;
}

export const OG_PAGES: Record<string, OgPageEntry> = {
  "/editor": {
    title: "Build Your Roblox GUI Online - Drag, Drop, Done",
    description:
      "The Roblox GUI Maker web editor — drag and drop game UI on a visual canvas, then export clean Luau for Roblox Studio. Free, no login required.",
  },
  "/templates": {
    title: "Free & Premium Roblox GUI Templates (Ready-to-Play)",
    description:
      "Browse free and premium Roblox GUI templates: RPG inventories, FPS HUDs, shops, and more. Ready to drop into Studio.",
  },
  "/pricing": {
    title: `${SITE_NAME} Pricing: Free & Pro Plans`,
    description:
      "Compare Roblox GUI Maker Free and Pro plans. Free credits forever, unlimited Pro generations, and a Studio plugin alternative to Roblox built-in UI editor.",
  },
  "/compare": {
    title: `Roblox GUI Maker Comparisons | ${SITE_NAME}`,
    description:
      "Side-by-side comparisons of Roblox GUI tools. See how Roblox GUI Maker stacks up against Bloxsmith and FigBloxUI on code export, AI generation, and price.",
  },
  "/blog": {
    title: "Roblox GUI Maker Blog — Tips, Tutorials & Guides",
    description:
      "Roblox UI tips, Figma-to-Studio tutorials, AI Luau generation guides, and template deep dives from the Roblox GUI Maker team.",
  },
  "/use-cases": {
    title: "How to Make a GUI for Any Roblox Game",
    description:
      "Roblox GUI design guides by game type — simulator, FPS, roleplay, tycoon, and obby. Build the right HUD, menu, or shop for your genre.",
  },
  "/guides": {
    title: "Roblox GUI Tutorials & Guides (2026)",
    description:
      "Step-by-step Roblox GUI tutorials: fix scaling, master UIListLayout and UIGridLayout, build draggable frames, and export clean Luau.",
  },
  "/faq": {
    title: `${SITE_NAME} — Frequently Asked Questions`,
    description:
      "Answers to common questions about Roblox GUI Maker — pricing, code export, Studio plugin, Figma import, and limits.",
  },
  "/script-generator": {
    title: generateTitle("Roblox GUI Script Generator", "Free Luau Code Export"),
    description: generateDescription(
      "roblox gui script generator",
      "Turn a prompt into production-ready Luau you can paste into StarterGui",
      "Try the script generator free.",
    ),
  },
  "/ai-generator": {
    title: generateTitle("AI Roblox GUI Generator", "Real Luau, Not Images"),
    description: generateDescription(
      "roblox gui ai generator",
      "Describe a UI in plain text and get editable Luau code, not a screenshot",
      "Try the AI generator free.",
    ),
  },
  "/plugin": {
    title: "Roblox Studio Plugin - One-Click GUI Import",
    description:
      "The Roblox GUI Maker Studio plugin is coming soon. Import saved projects into StarterGui in one click. Join the waitlist to get notified when it lands on the Roblox Creator Marketplace.",
  },
  "/figma-to-roblox": {
    title: "Convert Figma to Roblox Studio UI in One Click",
    description:
      "Convert Figma designs to Roblox Studio UI in one click. Automatic component mapping, asset upload, and Studio plugin import. Join the waitlist to be notified when the converter launches.",
  },
  "/docs": {
    title: "Roblox GUI Maker Documentation",
    description:
      "Documentation for the Roblox GUI Maker editor, Studio plugin, AI generation API, Figma import, and template development.",
  },
} as const;
