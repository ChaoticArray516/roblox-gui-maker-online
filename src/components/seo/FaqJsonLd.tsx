/**
 * SOP-3B-16: FAQ 页 JSON-LD — @graph: FAQPage(8 组 Q&A) + BreadcrumbList
 *
 * 内容依据 SEO_TECH_SPEC.md §1.7；定价表述与 PRO_PLAN（$9.99）一致，URL 用 SITE_URL 拼接。
 * 由 src/app/faq/page.tsx 渲染（T2 接线）。可见 FAQ 文案需与本组件 Q&A 对应。
 */

import { SITE_URL } from "@/lib/site-config";
import { JsonLd } from "./JsonLd";

export function FaqJsonLd() {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is Roblox GUI Maker?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Roblox GUI Maker is an AI-powered online tool that helps you create game user interfaces without coding. It combines a drag-and-drop visual editor, AI code generation, a planned Figma-to-Studio import feature, and a template marketplace into one platform. A Roblox Studio plugin is also in development.",
          },
        },
        {
          "@type": "Question",
          name: "Is Roblox GUI Maker free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, there is a free tier that includes the full drag-and-drop editor, 50 AI generation credits per month, clean Luau export, and access to the free template library. The Pro plan at $9.99/month removes the limits and adds premium templates and advanced features.",
          },
        },
        {
          "@type": "Question",
          name: "How does the AI code generation work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You describe your GUI in natural language (e.g., 'Create a health bar with a red background, white border, and green fill that decreases from left to right'). Our AI generates the complete Luau script with proper Scale/Offset handling, Signal patterns, and event handlers. The code follows Roblox best practices and can be directly used in your game.",
          },
        },
        {
          "@type": "Question",
          name: "How do I install the Roblox Studio plugin?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The plugin is not yet available. Visit roblox-gui-maker.online/plugin and click Join Plugin Waitlist. We'll email you as soon as it passes Roblox Creator Marketplace review and can be installed from your Studio Plugins tab.",
          },
        },
        {
          "@type": "Question",
          name: "Can I import my Figma designs into Roblox Studio?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A Figma-to-Roblox converter is in development. Join the waitlist at roblox-gui-maker.online/figma-to-roblox to be notified when public Figma URL conversion, automatic asset upload, and Studio plugin import are ready.",
          },
        },
        {
          "@type": "Question",
          name: "What Roblox GUI components are supported?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We support all Roblox GUI objects: ScreenGui, Frame, TextLabel, TextButton, ImageLabel, ImageButton, TextBox, ScrollingFrame, ViewportFrame, VideoFrame, UIGridLayout, UIListLayout, UIPageLayout, UITableLayout, UIAspectRatioConstraint, UISizeConstraint, UITextSizeConstraint, and UICorner.",
          },
        },
        {
          "@type": "Question",
          name: "Can I sell the GUIs I create with Roblox GUI Maker?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes! GUIs you create with the free tier or Pro plan are yours to use in any commercial Roblox game. Templates purchased from the marketplace have their own license terms — check each template's license before redistributing.",
          },
        },
        {
          "@type": "Question",
          name: "Do I need to know Luau scripting to use Roblox GUI Maker?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No! The drag-and-drop editor handles all layout and positioning visually. The AI generates scripts for button clicks, animations, and data binding automatically. However, knowing Luau helps you customize the generated code for complex game logic.",
          },
        },
        {
          "@type": "Question",
          name: "What's your refund policy?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Once Pro subscriptions open, they will come with a 14-day money-back guarantee. Email chaoticarray.rf516@gmail.com within 14 days of your first charge and we'll issue a full refund — no questions asked. Marketplace template purchases are also eligible for a 14-day refund if the template is broken or significantly differs from its description.",
          },
        },
      ],
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
