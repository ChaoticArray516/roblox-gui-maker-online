/**
 * SOP-3B-05: 模板库 JSON-LD — @graph: WebSite + CollectionPage + FAQPage
 *
 * 内容依据 SEO_TECH_SPEC.md §1.4；所有 URL 用 SITE_URL 拼接。
 * 由 src/app/templates/page.tsx 渲染（T2 接线）。
 */

import { SITE_URL } from "@/lib/site-config";
import { JsonLd } from "./JsonLd";

export function TemplatesListJsonLd() {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/templates/#website`,
      url: `${SITE_URL}/templates`,
      name: "Roblox GUI Maker — Template Marketplace",
      description:
        "Free and premium Roblox GUI templates with production-ready Luau scripts. Health bars, inventory systems, shop UIs, weapon wheels, settings panels, and more.",
    },
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/templates/#collection`,
      name: "Roblox GUI Templates",
      description:
        "A curated collection of free and premium Roblox GUI templates for game developers. Each template includes complete Luau scripts and can be opened in the web editor for customization and export.",
      url: `${SITE_URL}/templates`,
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Are the Roblox GUI templates free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We offer both free and premium templates. Free templates include basic UIs like simple health bars, buttons, and notifications. Premium templates include complex systems like RPG inventory, weapon wheels, and shop systems with full Luau scripts.",
          },
        },
        {
          "@type": "Question",
          name: "Can I customize the templates after importing?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes! All templates are fully customizable. Open any template in the web editor to modify colors, sizes, layouts, and scripts, then export clean Luau to paste into StarterGui. Studio plugin import will be available once the plugin launches.",
          },
        },
        {
          "@type": "Question",
          name: "How do I import a template into my Roblox game?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Click 'Open in Web Editor' on any template page, customize the layout, then click Export to copy the Luau script into StarterGui. A Studio plugin for one-click import is in development — join the waitlist to be notified.",
          },
        },
      ],
    },
  ];

  return <JsonLd data={graph} id="templates-list-jsonld" />;
}
