/**
 * SOP-3B-13: 博客列表 JSON-LD — @graph: Blog + BreadcrumbList
 *
 * 内容依据 SEO_TECH_SPEC.md §1.6 (行 685–795)；URL 用 SITE_URL 拼接。
 * 由 src/app/blog/page.tsx 渲染。
 */

import { SITE_URL, SITE_NAME } from "@/lib/site-config";
import { JsonLd } from "./JsonLd";

export interface BlogPostSummary {
  slug: string;
  headline: string;
  datePublished: string;
  dateModified: string;
}

export interface BlogListJsonLdProps {
  posts: BlogPostSummary[];
}

export function BlogListJsonLd({ posts }: BlogListJsonLdProps) {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "Blog",
      "@id": `${SITE_URL}/blog/#blog`,
      name: `${SITE_NAME} Blog`,
      description:
        "Roblox GUI Maker blog — tips, tutorials, and guides on building Roblox UIs, AI Luau generation, and upcoming Figma-to-Studio import.",
      url: `${SITE_URL}/blog`,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-US",
      blogPost: posts.map((p) => ({
        "@type": "BlogPosting",
        "@id": `${SITE_URL}/blog/${p.slug}`,
        headline: p.headline,
        url: `${SITE_URL}/blog/${p.slug}`,
        datePublished: p.datePublished,
        dateModified: p.dateModified,
        author: { "@id": `${SITE_URL}/#organization` },
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Blog" },
      ],
    },
  ];

  return <JsonLd data={graph} id="blog-list-jsonld" />;
}
