/**
 * SOP-3B-10: 深度教程页 JSON-LD — @graph: HowTo + TechArticle + BreadcrumbList (+ 可选 VideoObject)
 *
 * 内容依据 SEO_TECH_SPEC.md §1.12 (行 1587–1771)；URL 用 SITE_URL 拼接。
 * 由 src/app/guides/[slug]/page.tsx 渲染。props 由页面传入。
 * VideoObject 仅在 videoId 存在时内联到 HowTo.video（条件 spread）。
 */

import { SITE_URL } from "@/lib/site-config";
import { JsonLd } from "./JsonLd";

export interface GuideStep {
  name: string;
  text: string;
}

export interface GuideDetailJsonLdProps {
  slug: string;
  h1: string;
  title: string;
  description: string;
  targetKeyword: string;
  publishedAt: string;
  modifiedAt: string;
  imageUrl: string;
  steps: GuideStep[];
  /** YouTube 视频 ID；存在则内联 VideoObject 到 HowTo.video */
  videoId?: string;
}

export function GuideDetailJsonLd({
  slug,
  h1,
  description,
  targetKeyword,
  publishedAt,
  modifiedAt,
  imageUrl,
  steps,
  videoId,
}: GuideDetailJsonLdProps) {
  const base = `${SITE_URL}/guides/${slug}`;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "HowTo",
      "@id": `${base}/#howto`,
      name: h1,
      description,
      image: imageUrl,
      step: steps.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.name,
        text: s.text,
      })),
      ...(videoId
        ? {
            video: {
              "@type": "VideoObject",
              name: h1,
              description,
              thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
              uploadDate: publishedAt,
              contentUrl: `https://www.youtube.com/watch?v=${videoId}`,
              embedUrl: `https://www.youtube.com/embed/${videoId}`,
            },
          }
        : {}),
    },
    {
      "@type": "TechArticle",
      "@id": `${base}/#techarticle`,
      headline: h1,
      description,
      url: base,
      datePublished: publishedAt,
      dateModified: modifiedAt,
      author: { "@id": `${SITE_URL}/#organization` },
      publisher: { "@id": `${SITE_URL}/#organization` },
      image: imageUrl,
      inLanguage: "en-US",
      proficiencyLevel: "Beginner",
      keywords: targetKeyword,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
        { "@type": "ListItem", position: 3, name: h1 },
      ],
    },
  ];

  return <JsonLd data={graph} id="guide-detail-jsonld" />;
}
