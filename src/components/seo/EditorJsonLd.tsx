/**
 * SOP-3B-03: 编辑器页 JSON-LD — @graph: SoftwareApplication + FAQPage + HowTo
 *
 * 内容依据 SEO_TECH_SPEC.md §1.2；URL 用 SITE_URL 拼接。
 * 由 src/app/editor/page.tsx 渲染（T2 接线）。
 */

import { SITE_URL, SITE_NAME } from "@/lib/site-config";
import { JsonLd } from "./JsonLd";

export function EditorJsonLd() {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/editor/#software`,
      name: `${SITE_NAME} Web Editor`,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Windows, macOS, Web",
      description:
        "Browser-based visual editor for building Roblox GUIs. Drag-and-drop layout, AI Luau generation, and one-click export of clean Luau code.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "Visual drag-and-drop GUI canvas",
        "AI prompt-to-Luau generation",
        "Scale/Offset responsive layout controls",
        "One-click Luau export",
        "Project save and sync",
      ],
      browserRequirements:
        "Requires JavaScript. Chrome, Firefox, Edge, or Safari.",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Is the web editor free to try?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. The Free plan includes the full drag-and-drop editor and 50 AI generation credits per month. You only need a Pro plan if you want unlimited AI generations and premium templates.",
          },
        },
        {
          "@type": "Question",
          name: "Do I need Roblox Studio to use the editor?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No — you can build and preview GUIs entirely in the browser. You only need Roblox Studio when you are ready to paste the exported Luau code. A Studio plugin for one-click import is in development.",
          },
        },
        {
          "@type": "Question",
          name: "What format does the export use?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The editor exports clean Luau code that creates ScreenGui, Frame, TextLabel, TextButton, ImageLabel, and other Roblox GUI objects with proper Scale/Offset values. Copy it into StarterGui or import via the Studio plugin.",
          },
        },
        {
          "@type": "Question",
          name: "Are there limits on AI generation?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Free plans receive 50 AI generation credits per month. Pro plans get unlimited generations plus priority queue and advanced code logic generation.",
          },
        },
        {
          "@type": "Question",
          name: "How do I install the Studio plugin?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The Studio plugin is currently on the waitlist. Visit roblox-gui-maker.online/plugin and click Join Plugin Waitlist. We'll email you as soon as it passes Roblox Creator Marketplace review.",
          },
        },
      ],
    },
    {
      "@type": "HowTo",
      name: "Build a Roblox GUI in 3 Steps",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Describe your UI",
          text: "Open the editor and type a natural-language prompt like 'Create a health bar with a red background and green fill'.",
          url: `${SITE_URL}/editor`,
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Generate and fine-tune",
          text: "Our AI generates the Luau code and initial layout. Drag, resize, and adjust colors on the canvas until it matches your game.",
          url: `${SITE_URL}/editor`,
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Export to Studio",
          text: "Click Export to copy the clean Luau script and paste it into StarterGui. Studio plugin import will be available once the plugin launches.",
          url: `${SITE_URL}/editor`,
        },
      ],
    },
  ];

  return <JsonLd data={graph} id="editor-jsonld" />;
}
