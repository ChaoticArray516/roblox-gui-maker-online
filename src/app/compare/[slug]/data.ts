/**
 * SOP-3K-04: /compare/[slug] 竞品对比页数据
 *
 * 3 篇对比：best-roblox-gui-makers / roblox-gui-maker-vs-bloxsmith / figma-to-roblox-plugin-comparison
 * 对接 CompareTable 的 CompareProduct[]/CompareFeature[] + FAQ + 正文。
 * 公正对比：承认竞品优势、无最高级、标 "as of 2026-07"。
 */

import type { FAQItem, CompareProduct, CompareFeature } from "@/lib/types";

export const COMPARE_SLUGS = [
  "best-roblox-gui-makers",
  "roblox-gui-maker-vs-bloxsmith",
  "figma-to-roblox-plugin-comparison",
] as const;
export type CompareSlug = (typeof COMPARE_SLUGS)[number];

export interface CompareData {
  slug: CompareSlug;
  /** sitemap lastmod（SOP-3V-04；与正文 "as of July 2026" 自述对齐 2026-07-21） */
  modifiedAt: string;
  h1: string;
  title: string;
  description: string;
  targetKeyword: string;
  intro: string;
  products: CompareProduct[];
  features: CompareFeature[];
  footnote: string;
  bodySections: { heading: string; body: string }[];
  faqs: FAQItem[];
}

const COMMON_PRODUCTS: CompareProduct[] = [
  { id: "rgm", name: "Roblox GUI Maker", isOurs: true },
  { id: "bloxsmith", name: "Bloxsmith" },
  { id: "figbloxui", name: "FigBloxUI" },
];

export const COMPARES: Record<CompareSlug, CompareData> = {
  "best-roblox-gui-makers": {
    slug: "best-roblox-gui-makers",
    modifiedAt: "2026-07-21",
    h1: "Best Roblox GUI Makers Compared (2026)",
    title: "Best Roblox GUI Makers Compared (2026)",
    description:
      "Compare Roblox GUI Maker, Bloxsmith, and FigBloxUI on code export, AI generation, templates, and price. Pick the right Roblox UI tool for your game.",
    targetKeyword: "best roblox gui maker",
    intro:
      "Three tools dominate Roblox GUI creation in 2026. This comparison lays out what each one actually does - not what their landing pages claim - so you can pick based on your workflow. All feature data is sourced from each tool's public site as of July 2026.",
    products: COMMON_PRODUCTS,
    features: [
      { name: "Visual drag-and-drop canvas", ours: true, competitor: "Partial", highlight: true },
      { name: "Exports editable Luau code", ours: true, competitor: false },
      { name: "AI prompt-to-GUI generation", ours: true, competitor: false },
      { name: "Mobile and desktop device preview", ours: true, competitor: false },
      { name: "Templates with real game logic", ours: true, competitor: "Static visuals" },
      { name: "Free tier", ours: "50 AI credits / month", competitor: "Limited" },
      { name: "Roblox Studio plugin", ours: "Planned", competitor: "Manual copy" },
      { name: "Figma import", ours: "Planned", competitor: "FigBloxUI only" },
    ],
    footnote: "Comparison based on publicly listed features as of July 2026. Re-checked every 90 days.",
    bodySections: [
      {
        heading: "What each tool is built for",
        body: "Roblox GUI Maker is built for developers who want to ship UI fast and own the code. You drag frames on a canvas, describe what you want in plain text, and export Luau you can paste into StarterGui. Bloxsmith focuses on pre-made UI kits - you buy a pack of themed components and assemble them in Studio. FigBloxUI is a Figma-to-Roblox bridge: it converts Figma designs into Roblox GUI instances. All three solve overlapping but different problems, and the right pick depends on whether you want to generate, buy, or import.",
      },
      {
        heading: "Why code export matters",
        body: "Most Roblox GUI tools output images, model files, or copy-paste component trees that you cannot edit. Roblox GUI Maker is the only one that exports plain Luau - a LocalScript you can read, tweak, and extend with your own game logic. If you have ever tried to customize a pre-built UI kit and hit a wall because the components are locked, code export is the difference between 'it works' and 'it is mine'. Bloxsmith and FigBloxUI both output structures you can modify in Studio, but neither hands you the underlying script.",
      },
      {
        heading: "Pricing and free tiers",
        body: "Roblox GUI Maker has a free tier with 50 AI generation credits per month, full editor access, and the public template library. Pro is $9.99 per month with unlimited generations and premium templates. Bloxsmith sells UI kits individually - prices vary by pack. FigBloxUI has a free tier for small designs and paid plans for larger projects. If you ship multiple games or iterate often, a subscription with unlimited credits (Roblox GUI Maker Pro) tends to be cheaper than per-kit purchases over a year.",
      },
    ],
    faqs: [
      {
        question: "Is Roblox GUI Maker really the best Roblox GUI maker?",
        answer:
          "It depends on your workflow. If you want AI-generated, editable Luau code, Roblox GUI Maker is the only tool that does both. If you want pre-built themed kits, Bloxsmith is stronger. If you design in Figma, FigBloxUI is the pick. As of July 2026, no single tool does all three well.",
      },
      {
        question: "Can I use these tools for commercial Roblox games?",
        answer:
          "Yes. All three allow commercial use. Roblox GUI Maker grants full commercial rights on both Free and Pro plans. Bloxsmith kits and FigBloxUI exports have their own licenses, so check each product page before reselling.",
      },
      {
        question: "Which tool is best for beginners?",
        answer:
          "Roblox GUI Maker and FigBloxUI both work for beginners. Roblox GUI Maker's AI generation means you can describe a UI in plain text and get a working layout without any design skills. FigBloxUI requires some Figma knowledge. Bloxsmith assumes you can assemble components in Studio.",
      },
      {
        question: "Do any of these tools require Luau knowledge?",
        answer:
          "No. Roblox GUI Maker generates Luau for you, FigBloxUI converts Figma visually, and Bloxsmith gives you pre-built components. You only need Luau if you want to customize the exported code or wire it to custom game systems.",
      },
    ],
  },
  "roblox-gui-maker-vs-bloxsmith": {
    slug: "roblox-gui-maker-vs-bloxsmith",
    modifiedAt: "2026-07-21",
    h1: "Roblox GUI Maker vs Bloxsmith: Which Fits Your Workflow?",
    title: "Roblox GUI Maker vs Bloxsmith (2026)",
    description:
      "Roblox GUI Maker generates editable Luau from a prompt. Bloxsmith sells pre-made UI kits. Compare features, pricing, and use cases to pick the right one.",
    targetKeyword: "roblox gui maker vs bloxsmith",
    intro:
      "Roblox GUI Maker and Bloxsmith both help you build Roblox UI, but they take opposite approaches. One generates code from a prompt; the other sells pre-built component kits. This comparison breaks down where each wins, based on public features as of July 2026.",
    products: [
      { id: "rgm", name: "Roblox GUI Maker", isOurs: true },
      { id: "bloxsmith", name: "Bloxsmith" },
    ],
    features: [
      { name: "AI prompt-to-GUI generation", ours: true, competitor: false, highlight: true },
      { name: "Exports editable Luau code", ours: true, competitor: false, highlight: true },
      { name: "Visual drag-and-drop canvas", ours: true, competitor: "Partial" },
      { name: "Pre-built themed UI kits", ours: "Templates", competitor: true, highlight: true },
      { name: "Mobile device preview", ours: true, competitor: false },
      { name: "Pricing model", ours: "Free + $9.99/mo", competitor: "Per-kit" },
    ],
    footnote: "Comparison based on publicly listed features as of July 2026.",
    bodySections: [
      {
        heading: "Generation vs pre-built kits",
        body: "Roblox GUI Maker generates UI from a text prompt. You type 'a pet shop with a 3x3 egg grid and a green Buy button' and the editor returns a working layout with editable Luau. Bloxsmith sells pre-built UI kits - themed packs of components (buttons, frames, HUDs) that you assemble manually in Studio. Generation is faster for custom layouts; kits are faster if you want a proven design and do not need to customize heavily.",
      },
      {
        heading: "Where Bloxsmith wins",
        body: "Bloxsmith is the stronger pick if you want polished, designer-built UI without doing the design work yourself. The kits are curated, consistent, and ready to drop in. If your game needs a specific aesthetic (cyberpunk, cartoon, sci-fi) and you do not want to iterate on styling, buying a kit saves hours. Bloxsmith also integrates directly with Studio, so there is no copy-paste step. The trade-off is that kit components are harder to customize deeply - you are editing someone else's structure.",
      },
      {
        heading: "Where Roblox GUI Maker wins",
        body: "Roblox GUI Maker wins when you need custom UI, editable code, or AI generation. The export is plain Luau, so you can read it, tweak it, and wire it to your own game systems. The AI generation means a beginner can describe a UI and get a working layout in seconds. The template library covers common patterns (inventories, shops, HUDs) if you want a starting point. If you ship multiple games or iterate often, the $9.99/month Pro plan with unlimited credits is cheaper than buying multiple kits.",
      },
    ],
    faqs: [
      {
        question: "Is Roblox GUI Maker cheaper than Bloxsmith?",
        answer:
          "It depends on volume. Roblox GUI Maker Pro is $9.99/month with unlimited AI generations. Bloxsmith charges per kit, so costs add up if you need multiple themes. For a single game with one kit, Bloxsmith may be cheaper; for multiple games or frequent iteration, Roblox GUI Maker Pro is usually cheaper.",
      },
      {
        question: "Can I use both together?",
        answer:
          "Yes. Some developers use Bloxsmith kits for proven patterns (main menus, settings) and Roblox GUI Maker for custom game-specific UI that needs generated code. The two outputs can coexist in the same StarterGui.",
      },
      {
        question: "Which is better for beginners?",
        answer:
          "Roblox GUI Maker is better for absolute beginners because the AI generation handles layout and code. Bloxsmith assumes you can navigate Studio and assemble components. If you have never opened Studio, start with Roblox GUI Maker.",
      },
      {
        question: "Do either tools require Luau knowledge?",
        answer:
          "No. Roblox GUI Maker generates Luau for you, and Bloxsmith kits are pre-built. You only need Luau if you want to customize the exported code or wire it to custom game logic.",
      },
    ],
  },
  "figma-to-roblox-plugin-comparison": {
    slug: "figma-to-roblox-plugin-comparison",
    modifiedAt: "2026-07-21",
    h1: "Figma to Roblox Plugin Comparison: FigBloxUI vs Roblox GUI Maker",
    title: "Figma to Roblox Plugin Comparison (2026)",
    description:
      "Compare FigBloxUI and Roblox GUI Maker for converting Figma designs to Roblox UI. See which handles asset upload, Scale/Offset, and Studio import better.",
    targetKeyword: "figma to roblox plugin",
    intro:
      "If you design UI in Figma and build in Roblox, you need a bridge between the two. FigBloxUI is the established Figma-to-Roblox tool. Roblox GUI Maker is adding its own converter. This comparison covers what each does today, based on public features as of July 2026.",
    products: [
      { id: "rgm", name: "Roblox GUI Maker", isOurs: true },
      { id: "figbloxui", name: "FigBloxUI" },
    ],
    features: [
      { name: "Figma-to-Roblox conversion", ours: "Planned", competitor: true, highlight: true },
      { name: "Automatic image asset upload", ours: "Planned", competitor: true },
      { name: "Scale/Offset conversion", ours: "Planned", competitor: true },
      { name: "AI prompt-to-GUI (no Figma needed)", ours: true, competitor: false, highlight: true },
      { name: "Visual canvas editor", ours: true, competitor: false },
      { name: "Exports editable Luau code", ours: true, competitor: false, highlight: true },
      { name: "Pricing", ours: "Free + $9.99/mo", competitor: "Free + paid tiers" },
    ],
    footnote: "Comparison based on publicly listed features as of July 2026. Roblox GUI Maker's Figma converter is planned.",
    bodySections: [
      {
        heading: "What FigBloxUI does well",
        body: "FigBloxUI is the mature pick for Figma-to-Roblox conversion today. It reads Figma frames, maps them to Roblox GUI objects, uploads image assets to your Roblox library, and handles Scale/Offset conversion for responsive layouts. If your team already designs in Figma and wants a direct pipeline to Studio, FigBloxUI is the established choice. It handles the conversion automatically and keeps the design-to-build loop tight. The trade-off is that FigBloxUI does not generate code or offer an in-browser editor - you start in Figma and end in Studio.",
      },
      {
        heading: "What Roblox GUI Maker adds",
        body: "Roblox GUI Maker's Figma converter is planned, but the platform already does things FigBloxUI does not. It has a visual canvas editor in the browser, so you can design without Figma. It generates Luau from a text prompt, so you can prototype without any design tool. And it exports editable Luau code, so you own the output. When the Figma converter ships, it will plug into the same editor - you import from Figma, refine on the canvas, and export Luau. That is a different workflow than FigBloxUI's direct Figma-to-Studio pipeline.",
      },
      {
        heading: "Which should you pick today?",
        body: "If you need Figma-to-Roblox conversion right now, FigBloxUI is the working tool. If you can wait, or if you want AI generation and code export alongside Figma import, Roblox GUI Maker is the broader platform. Many teams will end up using both: FigBloxUI for immediate Figma imports, and Roblox GUI Maker for custom UI that needs generated code. Watch the Roblox GUI Maker waitlist for converter launch updates.",
      },
    ],
    faqs: [
      {
        question: "Is Roblox GUI Maker's Figma converter available yet?",
        answer:
          "Not yet. The Figma-to-Roblox converter is planned. Join the waitlist at roblox-gui-maker.online/figma-to-roblox to be notified when the beta opens. Today, Roblox GUI Maker offers AI generation and a visual canvas; FigBloxUI is the working Figma-to-Roblox tool.",
      },
      {
        question: "Does FigBloxUI export Luau code?",
        answer:
          "No. FigBloxUI converts Figma designs into Roblox GUI instances in Studio, which you can edit visually. It does not hand you the underlying Luau script. Roblox GUI Maker is the only tool that exports editable Luau code.",
      },
      {
        question: "Can I use both FigBloxUI and Roblox GUI Maker?",
        answer:
          "Yes. Use FigBloxUI to import Figma designs into Studio today, and use Roblox GUI Maker for AI-generated UI or custom layouts that need editable code. The two outputs can coexist in the same project.",
      },
      {
        question: "Which handles Scale/Offset conversion better?",
        answer:
          "FigBloxUI handles Scale/Offset conversion today as part of its Figma import. Roblox GUI Maker will handle it when the converter launches. If you need Scale/Offset conversion right now, FigBloxUI is the working option.",
      },
    ],
  },
};
