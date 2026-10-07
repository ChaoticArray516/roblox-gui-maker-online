/**
 * SOP-3J 临时演示页数据
 *
 * 用于集中验证 CodeBlock / FAQAccordion / CTA / CompareTable / InternalLink 组件。
 * 本路由 robots noindex，不上 production sitemap。
 *
 * DEMO_FAQS 复用 /faq/data.ts 的 FAQ_ENTRIES 子集（去 AI 味版本），
 * 保证两个数据源措辞一致。
 */

import type { BlogPost, FAQItem } from "@/lib/types";
import { toFAQItem } from "@/lib/faq-helpers";
import { FAQ_ENTRIES } from "../faq/data";

// 选取 5 条与 /faq 完全一致的 FAQ（覆盖 General/Pricing/Technical/对比）
const DEMO_FAQ_QUESTIONS = [
  "What is Roblox GUI Maker?",
  "Is Roblox GUI Maker free?",
  "How does the AI code generation work?",
  "Can I import my Figma designs into Roblox Studio?",
  "How does Roblox GUI Maker compare to Bloxsmith and FigBloxUI?",
];

export const DEMO_FAQS: FAQItem[] = DEMO_FAQ_QUESTIONS.map((q) => {
  const entry = FAQ_ENTRIES.find((e) => e.question === q);
  if (!entry) throw new Error(`Demo FAQ not found in FAQ_ENTRIES: ${q}`);
  return toFAQItem(entry);
});

export const DEMO_POST: BlogPost = {
  slug: "test-content-components",
  h1: "Roblox GUI Maker: Build UIs with AI and Export Clean Luau",
  title: "Roblox GUI Maker: Build UIs with AI and Export Clean Luau",
  description:
    "Learn how Roblox GUI Maker turns a prompt into production-ready Luau. Drag, drop, preview across devices, then paste straight into Roblox Studio.",
  targetKeyword: "Roblox GUI Maker",
  publishedAt: "2026-07-17",
  modifiedAt: "2026-07-17",
  authorName: "Roblox GUI Maker Team",
  imageUrl: "/og/default.png",
  sections: [
    {
      type: "text",
      body: "Roblox GUI Maker is the fastest way to build polished user interfaces for your Roblox game. Whether you are making a simulator HUD, an RPG inventory, or a main menu, you can describe the UI in plain English and get editable Luau code in seconds. The visual canvas lets you tweak Scale, Offset, colors, and Z-index without leaving the browser. Every change is reflected instantly across Desktop, Tablet, and Mobile device frames, so you can verify responsiveness before exporting.",
    },
    {
      type: "text",
      body: "Traditional Roblox UI workflows often force you to jump between Studio, spreadsheets of UDim2 values, and manual Play-mode checks. Roblox GUI Maker collapses that loop into three predictable steps: describe what you want, refine the layout visually, and export clean Luau. Because the output is real code - not a screenshot or black-box asset - you can paste it into StarterGui, inspect it, and extend it with your own game logic. This transparency is what separates Roblox GUI Maker from template-only or image-generation tools.",
    },
    {
      type: "heading",
      level: 2,
      text: "Why developers choose Roblox GUI Maker",
    },
    {
      type: "list",
      items: [
        "Visual drag-and-drop canvas with device preview",
        "AI generates real Luau, not images",
        "Twelve production-ready templates with game logic",
        "One-click export to StarterGui or ModuleScript",
        "Free tier with 50 AI generation credits per month",
      ],
    },
    {
      type: "text",
      body: "The templates cover the most common Roblox UI patterns: shops with purchase validation, slot-based inventories with drag-and-drop, FPS and simulator HUDs, dialogue systems with branching choices, and obby start screens tuned for touch. Each template ships with both client and server Luau, so you are not starting from a static mockup. You can open any template in the web editor, customize it, and export a version that fits your game.",
    },
    {
      type: "heading",
      level: 2,
      text: "Example: health bar Luau output",
    },
    {
      type: "code",
      language: "lua",
      code: `local Players = game:GetService("Players")
local player = Players.LocalPlayer
local gui = player:WaitForChild("PlayerGui")

local HealthBar = Instance.new("Frame")
HealthBar.Size = UDim2.new(0, 200, 0, 24)
HealthBar.Position = UDim2.new(0.5, -100, 0.9, 0)
HealthBar.BackgroundColor3 = Color3.fromRGB(40, 40, 40)
HealthBar.Parent = gui

local Fill = Instance.new("Frame")
Fill.Size = UDim2.new(1, 0, 1, 0)
Fill.BackgroundColor3 = Color3.fromRGB(0, 255, 128)
Fill.Parent = HealthBar`,
      filename: "HealthBar.lua",
      showLineNumbers: true,
      cta: { variant: "editor", href: "/editor", label: "Try this in the editor" },
    },
    {
      type: "text",
      body: "The generated code uses Scale and Offset correctly, names instances clearly, and avoids unnecessary nesting. You can bind it to your existing Humanoid.HealthChanged events or replace the placeholder values with your own stat system. Because the code is editable Luau, you are never locked into a proprietary format.",
    },
    {
      type: "heading",
      level: 2,
      text: "Compare Roblox GUI Maker to alternatives",
    },
    {
      type: "compare",
      title: "Feature comparison",
      products: [
        { id: "rgm", name: "Roblox GUI Maker", isOurs: true },
        { id: "others", name: "Bloxsmith / FigBloxUI" },
      ],
      features: [
        { name: "Visual drag-and-drop canvas", ours: true, competitor: "Partial" },
        { name: "Editable Luau export", ours: true, competitor: false, highlight: true },
        { name: "AI prompt-to-GUI", ours: true, competitor: false },
        { name: "Mobile device preview", ours: true, competitor: false },
        { name: "Free tier", ours: "50 AI credits / month", competitor: "Limited" },
      ],
      footnote: "Comparison based on publicly listed features as of July 2026.",
    },
    {
      type: "heading",
      level: 2,
      text: "Frequently asked questions",
    },
    {
      type: "faq",
      items: DEMO_FAQS,
      injectSchema: true,
    },
    {
      type: "text",
      body: "If you are ready to stop wrestling with manual UDim2 math and start shipping UI faster, Roblox GUI Maker gives you the tools to design, generate, and export in one place. The Free plan is enough to prototype full interfaces, and the Pro plan removes the credit cap when you are ready to scale.",
    },
    {
      type: "links",
      links: [
        { href: "/editor", anchorText: "Try Editor Free" },
        { href: "/templates", anchorText: "Browse GUI Templates" },
        { href: "/pricing", anchorText: "See pricing" },
        { href: "/figma-to-roblox", anchorText: "Figma to Roblox waitlist" },
      ],
    },
    {
      type: "cta",
      title: "Start building free",
      description: "No credit card. 50 AI generation credits every month on the Free plan.",
      buttons: [
        { variant: "primary", href: "/editor", label: "Try Editor Free" },
        { variant: "secondary", href: "/templates", label: "Browse Templates" },
      ],
    },
  ],
};
