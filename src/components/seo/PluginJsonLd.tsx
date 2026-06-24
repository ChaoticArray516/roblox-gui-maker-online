/**
 * SOP-3B-12: 插件页 JSON-LD — @graph: SoftwareApplication + WebApplication
 *
 * 插件尚未正式发布，JSON-LD 使用 PreOrder Offer 并标注等待列表状态，
 * 避免向 Google 声明插件已可下载安装。
 */

import { SITE_URL } from "@/lib/site-config";
import { JsonLd } from "./JsonLd";

export function PluginJsonLd() {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/plugin/#plugin`,
      name: "Roblox GUI Maker Studio Plugin",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Windows, macOS",
      description:
        "A planned Roblox Studio plugin for importing GUI designs from the Roblox GUI Maker online editor. Converts web-designed UIs into Roblox ScreenGui objects with Scale/Offset parameters and asset uploads.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/PreOrder",
        description: "Free plugin when released; join the waitlist to be notified",
      },
      featureList: [
        "Planned: one-click import from online editor to Studio",
        "Planned: automatic asset upload to Roblox asset library",
        "Planned: Scale/Offset conversion for responsive layout",
        "Planned: project sync across devices",
        "Planned: template library access within Studio",
      ],
      softwareVersion: "1.0.0",
      datePublished: "2026-06-18",
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/plugin/#webapp`,
      name: "Roblox GUI Maker — Plugin Waitlist",
      url: `${SITE_URL}/plugin`,
      description:
        "Waitlist page for the upcoming Roblox GUI Maker Studio Plugin.",
      applicationCategory: "DeveloperApplication",
      browserRequirements:
        "Requires JavaScript. Chrome, Firefox, Edge, or Safari.",
    },
  ];

  return <JsonLd data={graph} id="plugin-jsonld" />;
}
