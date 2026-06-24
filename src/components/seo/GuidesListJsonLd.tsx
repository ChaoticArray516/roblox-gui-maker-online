/**
 * SOP-3B-09: 教程中心枢纽页 JSON-LD — @graph: CollectionPage + BreadcrumbList
 *
 * 内容依据 SEO_TECH_SPEC.md §1.12 (行 1516–1586)；URL 用 SITE_URL 拼接。
 * 由 src/app/guides/page.tsx 渲染。注意：枢纽页无 ItemList（与 /use-cases 枢纽不同）。
 */

import { SITE_URL } from "@/lib/site-config";
import { JsonLd } from "./JsonLd";

export function GuidesListJsonLd() {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/guides/#collection`,
      name: "Roblox GUI Tutorials & Guides (2026)",
      description:
        "A hub of in-depth Roblox GUI tutorials — fix GUI scaling, master UIListLayout & UIGridLayout, build draggable GUIs, and more.",
      url: `${SITE_URL}/guides`,
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Guides" },
      ],
    },
  ];

  return <JsonLd data={graph} id="guides-list-jsonld" />;
}
