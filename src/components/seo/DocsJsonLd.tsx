/**
 * SOP-3B-15: 文档页 JSON-LD — @graph: TechArticle + BreadcrumbList
 *
 * 内容依据 SEO_TECH_SPEC.md §1.9 (行 1036–1120)；URL 用 SITE_URL 拼接。
 * 由 src/app/docs/page.tsx 渲染。
 */

import { SITE_URL, SITE_NAME } from "@/lib/site-config";
import { JsonLd } from "./JsonLd";

export interface DocsJsonLdProps {
  headline?: string;
  description?: string;
  datePublished?: string;
  dateModified?: string;
  dependencies?: string;
}

export function DocsJsonLd({
  headline = `${SITE_NAME} Documentation`,
  description = "Documentation for Roblox GUI Maker — editor guide, plugin guide, AI generation API, Figma import, and template development.",
  datePublished = "2026-06-19",
  dateModified = "2026-06-19",
  dependencies = "Next.js, React, Roblox Studio, Luau",
}: DocsJsonLdProps) {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "TechArticle",
      "@id": `${SITE_URL}/docs/#techarticle`,
      headline,
      description,
      url: `${SITE_URL}/docs`,
      datePublished,
      dateModified,
      author: { "@id": `${SITE_URL}/#organization` },
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-US",
      proficiencyLevel: "Beginner",
      dependencies,
      about: { "@type": "SoftwareApplication", name: SITE_NAME },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Documentation" },
      ],
    },
  ];

  return <JsonLd data={graph} id="docs-jsonld" />;
}
