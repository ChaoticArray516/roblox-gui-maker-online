/**
 * SOP-3B-07: 应用场景枢纽页 JSON-LD — @graph: CollectionPage + ItemList + BreadcrumbList
 *
 * 内容依据 SEO_TECH_SPEC.md §1.11 (行 1251–1346)；URL 用 SITE_URL 拼接。
 * 由 src/app/use-cases/page.tsx 渲染。ItemList numberOfItems ≥ 3。
 */

import { SITE_URL } from "@/lib/site-config";
import { JsonLd } from "./JsonLd";

export interface UseCaseItem {
  slug: string;
  name: string;
}

export interface UseCasesListJsonLdProps {
  items: UseCaseItem[];
}

export function UseCasesListJsonLd({ items }: UseCasesListJsonLdProps) {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/use-cases/#collection`,
      name: "How to Make a GUI for Any Roblox Game",
      description:
        "Design the perfect UI for any Roblox game type — simulator HUDs, FPS game UI, roleplay menus, and more.",
      url: `${SITE_URL}/use-cases`,
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}/use-cases/#itemlist`,
      name: "Roblox GUI Use Cases by Game Type",
      itemListElement: items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: it.name,
        url: `${SITE_URL}/use-cases/${it.slug}`,
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Use Cases" },
      ],
    },
  ];

  return <JsonLd data={graph} id="use-cases-list-jsonld" />;
}
