/**
 * SOP-3J-03 配套 + faq-engine 集成：/faq 页面数据
 *
 * 按 F:\skillhub\faq-engine SKILL 规范重写：
 * - 每条 FAQ 用 capsule（40-60 词，首句 ≤25 词以 Yes/No/数字/结论开头）+ 可选 detail/cta
 * - 每条标注 source（问题来源）
 * - 去 AI 味词（seamless/robust/comprehensive/absolutely/no questions asked 等）
 * - 含 1 条竞品对比（Bloxsmith/FigBloxUI，as of 2026-07，无最高级，承认对方优势）
 * - 含 1 条退款风险逆转（14-day refund + no credit card）
 *
 * 渲染层仍用 FAQItem，通过 toFAQItem 合并三层为 answer。
 */

import type { FAQItem } from "@/lib/types";
import { toFAQItem, type FAQEntry } from "@/lib/faq-helpers";
import { SUPPORT_EMAIL } from "@/lib/site-config";

export const FAQ_CATEGORIES = ["General", "Pricing", "Technical", "Plugin", "Design Help"] as const;

export type FAQCategory = (typeof FAQ_CATEGORIES)[number];

export const FAQ_ENTRIES: FAQEntry[] = [
  {
    category: "General",
    question: "What is Roblox GUI Maker?",
    capsule:
      "A browser editor where you drag out UI frames, type a prompt to generate Luau, and copy the result into StarterGui. It skips the manual UDim2 math for common layouts like menus, shops, and HUDs, and lets you preview on phone and desktop before exporting.",
    detail:
      "It supports the standard Roblox GUI objects: Frame, TextLabel, TextButton, TextBox, ImageLabel, ScrollingFrame, UIGridLayout, UIListLayout, UICorner, and constraints like UIAspectRatioConstraint and UISizeConstraint.",
    source: "Internal: homepage hero + DevForum GUI pain-point complaints",
  },
  {
    category: "General",
    question: "Do I need to know Luau scripting to use Roblox GUI Maker?",
    capsule:
      "No, not for basic layouts. The editor handles positioning and sizing visually, and the AI can generate click and animation scripts for you. You only need Luau when wiring the UI to your own stats, inventory, or custom game systems, and even then you edit the exported code directly.",
    source: "Internal: /editor visual canvas + AI panel",
  },
  {
    category: "General",
    question: "How does Roblox GUI Maker compare to Bloxsmith and FigBloxUI?",
    capsule:
      "Bloxsmith and FigBloxUI focus on design assets and Figma import. Roblox GUI Maker is the only one that exports editable Luau code you can paste into StarterGui, as of July 2026. Bloxsmith is stronger if you want pre-made UI kits; FigBloxUI wins on Figma workflow. Pick us for code output and in-browser editing.",
    source: "Internal: /compare + homepage comparison table (as of 2026-07)",
  },
  {
    category: "Pricing",
    question: "Is Roblox GUI Maker free?",
    capsule:
      "Yes - the free tier includes the editor, 50 AI generation credits per month, Luau export, and the public template library. Pro will cost $9.99 per month when it launches, adding unlimited generations and premium templates. No credit card is required to start.",
    source: "Internal: /pricing page + FREE_PLAN constant",
  },
  {
    category: "Pricing",
    question: "Can I sell the GUIs I create with Roblox GUI Maker?",
    capsule:
      "Yes. Anything you build is yours to use in commercial Roblox games, including ones that earn Robux through gamepasses or developer products. Marketplace templates carry their own license, so check the template page before reselling or bundling a paid template into your game.",
    source: "Internal: FREE_PLAN/PRO_PLAN commercial usage terms",
  },
  {
    category: "Pricing",
    question: "What's your refund policy?",
    capsule:
      `Pro subscriptions come with a 14-day money-back guarantee. Email ${SUPPORT_EMAIL} within 14 days of your first charge for a full refund. Marketplace templates can also be refunded within 14 days if the template is broken or materially different from its listing. No credit card is needed to try the free tier.`,
    source: "Internal: refund policy + /pricing FAQ",
  },
  {
    category: "Technical",
    question: "How does the AI code generation work?",
    capsule:
      "Type what you want, such as a red health bar that shrinks from left to right. The editor returns a Luau script with UDim2 sizing, UICorner, and event hooks wired up. You can tweak it on the canvas before copying, so the output stays readable and editable.",
    source: "Internal: /editor AI panel + OpenRouter integration",
  },
  {
    category: "Technical",
    question: "Can I import my Figma designs into Roblox Studio?",
    capsule:
      "Not yet. The Figma to Roblox converter is planned. Join the waitlist at roblox-gui-maker.online/figma-to-roblox and you will be emailed when the beta opens for public Figma URLs, automatic asset upload, and one-click Studio plugin import. Meanwhile, export Luau and paste it manually.",
    source: "Internal: /figma-to-roblox page waitlist",
  },
  {
    category: "Plugin",
    question: "How do I install the Roblox Studio plugin?",
    capsule:
      "Not yet. The plugin is still in review on the Roblox Creator Marketplace. Join the waitlist at roblox-gui-maker.online/plugin and you will get an email once it is installable from the Studio Plugins tab. Until then, export Luau from the editor and paste it into StarterGui.",
    source: "Internal: /plugin page waitlist",
  },
  {
    category: "Design Help",
    question: "I need Roblox GUI design help - where do I start?",
    capsule:
      "Start with a template. Pick one close to your game type - a HUD for a shooter, a shop for a simulator, a menu for an RPG - and open it in the editor. You can drag, recolor, and resize every element without writing Luau, then export the result. The use-cases pages break down layout rules per game type.",
    detail:
      "If you are stuck on a specific layout, describe it in the AI panel in plain text and the generator returns a starting point you can refine.",
    source: "Internal: /use-cases + /templates + editor AI panel",
  },
  {
    category: "Design Help",
    question: "Why is Roblox UI so hard to make?",
    capsule:
      "Two reasons: UDim2 sizing mixes Scale and Offset in ways that break across screen sizes, and Studio has no visual canvas for laying out GUI. Roblox GUI Maker fixes both - you drag on a canvas and the editor handles the UDim2 math, with a mobile preview to catch layout breaks before export.",
    detail:
      "Most pain comes from Offset-only sizing that looks right on your monitor but breaks on phones. The editor defaults to Scale-based sizing so layouts stay proportional.",
    source: "Internal: DevForum GUI complaints + /guides/fix-gui-scaling",
  },
  {
    category: "Design Help",
    question: "Why is Roblox Studio GUI so slow to build?",
    capsule:
      "Studio forces manual placement: drag each Frame, type each UDim2, press Play to check, repeat. That loop eats hours for a single menu. The editor collapses it into describe, refine on canvas, export - with live device preview so you do not re-enter Studio to test every change.",
    detail:
      "The editor also generates Luau programmatically, so adding 10 buttons is one prompt, not 10 drag-and-property-panel cycles.",
    source: "Internal: editor workflow + DevForum GUI speed complaints",
  },
];

/** FAQItem[]（合并 capsule + detail + cta 为 answer），供 FAQAccordion / FaqJsonLd 使用 */
export const FAQ_ITEMS: FAQItem[] = FAQ_ENTRIES.map(toFAQItem);

/** 扁平 FAQItem[]，供 content-check / FaqJsonLd 默认数据使用 */
export const FAQ_ITEMS_FLAT: FAQItem[] = FAQ_ITEMS;

/** 按 category 分组返回 FAQItem[] */
export function getFAQsByCategory(category: FAQCategory): FAQItem[] {
  return FAQ_ENTRIES.filter((entry) => entry.category === category).map(toFAQItem);
}
