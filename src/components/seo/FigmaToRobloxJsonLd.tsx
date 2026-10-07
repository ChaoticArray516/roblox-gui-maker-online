/**
 * SOP-3B-04 / SOP-3O-02: Figma->Roblox 落地页 JSON-LD
 *
 * @graph: SoftwareApplication + HowTo(3 步 planned workflow) + BreadcrumbList
 * 转换器尚未正式发布，HowTo 用 "planned workflow" 措辞，与页面 PLANNED_STEPS 同源，
 * 不暗示用户现在就能完成 3 步流程。SoftwareApplication 用 PreOrder availability。
 */

import { SITE_URL, SITE_NAME } from "@/lib/site-config";
import { JsonLd } from "./JsonLd";

export function FigmaToRobloxJsonLd() {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/figma-to-roblox/#software`,
      name: `${SITE_NAME} - Figma to Roblox Converter`,
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
      "@type": "HowTo",
      "@id": `${SITE_URL}/figma-to-roblox/#howto`,
      name: "Convert a Figma design to Roblox Studio UI",
      description:
        "Planned workflow once the Figma-to-Roblox converter launches. Join the waitlist to be notified when each step is available.",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Upload your Figma design",
          text: "Paste a public Figma file URL or connect your Figma account. The converter will read frames, components, and image layers.",
          url: `${SITE_URL}/figma-to-roblox`,
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Auto-convert & upload assets",
          text: "Frames become ScreenGui/Frame instances, text becomes TextLabel/TextButton, and images are uploaded to your Roblox library automatically.",
          url: `${SITE_URL}/figma-to-roblox`,
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Import via Studio plugin",
          text: "Once the Roblox GUI Maker Studio plugin is live, pick the converted file and drop the UI into StarterGui in one click.",
          url: `${SITE_URL}/figma-to-roblox`,
        },
      ],
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
