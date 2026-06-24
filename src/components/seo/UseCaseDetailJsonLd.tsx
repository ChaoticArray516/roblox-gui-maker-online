/**
 * SOP-3B-08: 场景详情页 JSON-LD — @graph: HowTo + ItemList + BreadcrumbList
 *
 * 内容依据 SEO_TECH_SPEC.md §1.11 (行 1347–1515)；URL 用 SITE_URL 拼接。
 * 由 src/app/use-cases/[game-type]/page.tsx 渲染。props 由页面传入。
 */

import { SITE_URL } from "@/lib/site-config";
import { JsonLd } from "./JsonLd";

export interface UseCaseStep {
  name: string;
  text: string;
}

export interface UseCaseDetailJsonLdProps {
  gameType: string;
  slug: string;
  h1: string;
  description: string;
  steps: UseCaseStep[];
  /** 相关模板的绝对或相对 URL 列表 */
  relatedTemplates: string[];
}

export function UseCaseDetailJsonLd({
  gameType,
  slug,
  h1,
  description,
  steps,
  relatedTemplates,
}: UseCaseDetailJsonLdProps) {
  const base = `${SITE_URL}/use-cases/${slug}`;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "HowTo",
      "@id": `${base}/#howto`,
      name: h1,
      description,
      step: steps.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.name,
        text: s.text,
      })),
    },
    {
      "@type": "ItemList",
      "@id": `${base}/#related`,
      name: "Related Templates",
      itemListElement: relatedTemplates.map((url, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: url.startsWith("http") ? url : `${SITE_URL}${url}`,
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Use Cases", item: `${SITE_URL}/use-cases` },
        { "@type": "ListItem", position: 3, name: gameType },
      ],
    },
  ];

  return <JsonLd data={graph} id="use-case-detail-jsonld" />;
}
