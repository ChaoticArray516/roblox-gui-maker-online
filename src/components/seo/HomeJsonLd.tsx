/**
 * SOP-3B-02: 首页 JSON-LD — @graph: WebSite + Organization + SoftwareApplication
 *
 * 内容依据 SEO_TECH_SPEC.md §1.1；所有 URL 用 SITE_URL 拼接，禁止硬编码域名。
 * 由 src/app/page.tsx 渲染（T2 接线）。
 */

import {
  SITE_URL,
  SITE_NAME,
  ORG_LOGO,
} from "@/lib/site-config";
import { JsonLd } from "./JsonLd";

export function HomeJsonLd() {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description:
        "AI-powered Roblox GUI generator with drag-and-drop editor, Luau code generation, and a planned Figma-to-Studio import feature for Roblox developers.",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-US",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: ORG_LOGO,
        width: 512,
        height: 512,
      },
      sameAs: [
        "https://twitter.com/robloxguimaker",
        "https://youtube.com/@robloxguimaker",
        "https://discord.gg/robloxguimaker",
      ],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: SITE_NAME,
      description:
        "AI-powered Roblox GUI maker — drag-and-drop editor, controllable AI Luau generation, planned Figma-to-Studio import, and one-click clean Luau export.",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Windows, macOS, Web",
      url: SITE_URL,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "Drag-and-Drop GUI Builder with smart alignment",
        "AI Luau Script Generator from natural language prompts",
        "Planned: Figma to Roblox Studio import",
        "Template marketplace with pre-built UI components",
        "Planned: Roblox Studio plugin for direct asset sync",
      ],
      browserRequirements:
        "Requires JavaScript. Chrome, Firefox, Edge, or Safari.",
    },
  ];

  return <JsonLd data={graph} id="home-jsonld" />;
}
