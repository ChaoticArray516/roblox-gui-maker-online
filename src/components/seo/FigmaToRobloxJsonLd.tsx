/**
 * SOP-3B-04: Figma→Roblox 落地页 JSON-LD — @graph: SoftwareApplication + BreadcrumbList
 *
 * 转换器尚未正式发布，不再声明 HowTo（避免暗示用户现在就能完成 3 步流程），
 * SoftwareApplication 使用 PreOrder availability 并标注 planned features。
 */

import { SITE_URL, SITE_NAME } from "@/lib/site-config";
import { JsonLd } from "./JsonLd";

export function FigmaToRobloxJsonLd() {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/figma-to-roblox/#software`,
      name: `${SITE_NAME} — Figma to Roblox Converter`,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Windows, macOS, Web",
      description:
        "A planned Figma-to-Roblox converter that will map Figma layers to Roblox GUI objects, upload image assets, and convert Scale/Offset for responsive layouts.",
      url: `${SITE_URL}/figma-to-roblox`,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/PreOrder",
        description: "Free converter when released; join the waitlist to be notified",
      },
      featureList: [
        "Planned: Figma component to Roblox GUI object mapping",
        "Planned: automatic image asset upload to Roblox library",
        "Planned: Scale/Offset conversion for responsive layouts",
        "Planned: one-click import via Studio plugin once released",
      ],
      browserRequirements: "Requires JavaScript. Chrome, Firefox, Edge, or Safari.",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Figma to Roblox" },
      ],
    },
  ];

  return <JsonLd data={graph} id="figma-to-roblox-jsonld" />;
}
