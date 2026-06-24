/**
 * SOP-3B-14: 博客详情 JSON-LD — @graph: BlogPosting + Article + BreadcrumbList
 *
 * 内容依据 SEO_TECH_SPEC.md §1.7 (行 796–952)；URL 用 SITE_URL 拼接。
 * 由 src/app/blog/[slug]/page.tsx 渲染。props 由页面传入。
 */

import { SITE_URL } from "@/lib/site-config";
import { JsonLd } from "./JsonLd";

export interface BlogPostJsonLdProps {
  slug: string;
  title: string;
  description: string;
  content: string;
  publishedAt: string;
  modifiedAt: string;
  authorName: string;
  imageUrl: string;
  keywords: string[];
}

export function BlogPostJsonLd({
  slug,
  title,
  description,
  content,
  publishedAt,
  modifiedAt,
  authorName,
  imageUrl,
  keywords,
}: BlogPostJsonLdProps) {
  const base = `${SITE_URL}/blog/${slug}`;
  const author = { "@type": "Person", name: authorName };

  const graph: Record<string, unknown>[] = [
    {
      "@type": "BlogPosting",
      "@id": `${base}/#blogposting`,
      headline: title,
      description,
      url: base,
      datePublished: publishedAt,
      dateModified: modifiedAt,
      author,
      publisher: { "@id": `${SITE_URL}/#organization` },
      image: imageUrl,
      inLanguage: "en-US",
      isPartOf: { "@id": `${SITE_URL}/blog/#blog` },
      keywords: keywords.join(", "),
      wordCount: content.split(" ").length.toString(),
      articleBody: content,
    },
    {
      "@type": "Article",
      "@id": `${base}/#article`,
      headline: title,
      description,
      url: base,
      datePublished: publishedAt,
      dateModified: modifiedAt,
      author,
      publisher: { "@id": `${SITE_URL}/#organization` },
      image: imageUrl,
      inLanguage: "en-US",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
        { "@type": "ListItem", position: 3, name: title },
      ],
    },
  ];

  return <JsonLd data={graph} id="blog-post-jsonld" />;
}
