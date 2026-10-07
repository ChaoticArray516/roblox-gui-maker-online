/**
 * SOP-3B-16 / SOP-3J-03: FAQ 页 JSON-LD — @graph: FAQPage + BreadcrumbList
 *
 * 内容依据 SEO_TECH_SPEC.md §1.7；定价表述与 PRO_PLAN（$9.99）一致，URL 用 SITE_URL 拼接。
 * 2026-07-17 重构：支持传入 items 参数，供 FAQAccordion 复用；不传时保持原有 9 条默认行为。
 */

import { SITE_URL, SUPPORT_EMAIL } from "@/lib/site-config";
import type { FAQItem } from "@/lib/types";
import { JsonLd } from "./JsonLd";

const DEFAULT_FAQ_ITEMS: FAQItem[] = [
  {
    question: "What is Roblox GUI Maker?",
    answer:
      "Roblox GUI Maker is an AI-powered online tool that helps you create game user interfaces without coding. It combines a drag-and-drop visual editor, AI code generation, a planned Figma-to-Studio import feature, and a template marketplace into one platform. A Roblox Studio plugin is also planned.",
  },
  {
    question: "Is Roblox GUI Maker free?",
    answer:
      "Yes, there is a free tier that includes the full drag-and-drop editor, 50 AI generation credits per month, clean Luau export, and access to the free template library. The Pro plan at $9.99/month removes the limits and adds premium templates and advanced features.",
  },
  {
    question: "How does the AI code generation work?",
    answer:
      "You describe your GUI in natural language (e.g., 'Create a health bar with a red background, white border, and green fill that decreases from left to right'). Our AI generates the complete Luau script with proper Scale/Offset handling, Signal patterns, and event handlers. The code follows Roblox best practices and can be directly used in your game.",
  },
  {
    question: "How do I install the Roblox Studio plugin?",
    answer:
      "The plugin is not yet available. Visit roblox-gui-maker.online/plugin and click Join Plugin Waitlist. We'll email you as soon as it passes Roblox Creator Marketplace review and can be installed from your Studio Plugins tab.",
  },
  {
    question: "Can I import my Figma designs into Roblox Studio?",
    answer:
      "A Figma-to-Roblox converter is planned. Join the waitlist at roblox-gui-maker.online/figma-to-roblox to be notified when public Figma URL conversion, automatic asset upload, and Studio plugin import are ready.",
  },
  {
    question: "What Roblox GUI components are supported?",
    answer:
      "We support all Roblox GUI objects: ScreenGui, Frame, TextLabel, TextButton, ImageLabel, ImageButton, TextBox, ScrollingFrame, ViewportFrame, VideoFrame, UIGridLayout, UIListLayout, UIPageLayout, UITableLayout, UIAspectRatioConstraint, UISizeConstraint, UITextSizeConstraint, and UICorner.",
  },
  {
    question: "Can I sell the GUIs I create with Roblox GUI Maker?",
    answer:
      "Yes! GUIs you create with the free tier or Pro plan are yours to use in any commercial Roblox game. Templates purchased from the marketplace have their own license terms — check each template's license before redistributing.",
  },
  {
    question: "Do I need to know Luau scripting to use Roblox GUI Maker?",
    answer:
      "No! The drag-and-drop editor handles all layout and positioning visually. The AI generates scripts for button clicks, animations, and data binding automatically. However, knowing Luau helps you customize the generated code for complex game logic.",
  },
  {
    question: "What's your refund policy?",
    answer:
      `Pro subscriptions come with a 14-day money-back guarantee. Email ${SUPPORT_EMAIL} within 14 days of your first charge and we'll issue a full refund — no questions asked. Marketplace template purchases are also eligible for a 14-day refund if the template is broken or significantly differs from its description.`,
  },
];

export interface FaqJsonLdProps {
  items?: FAQItem[];
}

export function FaqJsonLd({ items = DEFAULT_FAQ_ITEMS }: FaqJsonLdProps) {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "FAQPage",
      mainEntity: items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "FAQ" },
      ],
    },
  ];

  return <JsonLd data={graph} id="faq-jsonld" />;
}
