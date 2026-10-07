/**
 * SOP-3B-06: 模板详情 JSON-LD — @graph: Product + SoftwareApplication + ImageGallery + BreadcrumbList
 *
 * 内容依据 SEO_TECH_SPEC.md §1.5；props 由页面（T2）传入，URL 用 SITE_URL 拼接。
 * 由 src/app/templates/[slug]/page.tsx 渲染。
 */

import { SITE_URL, SITE_NAME } from "@/lib/site-config";
import {
  MERCHANT_BRAND,
  MERCHANT_RETURN_POLICY,
  MERCHANT_SHIPPING_DETAILS,
} from "@/lib/seo-merchant";
import { JsonLd } from "./JsonLd";

export interface TemplateDetailProps {
  name: string;
  slug: string;
  description: string;
  /** 价格数值；0 表示免费 */
  price: number;
  priceCurrency: string;
  category: string;
  /** 截图 URL 列表（绝对 URL） */
  images: string[];
  features: string[];
  /** 可选 FAQ 条目；传入时 @graph 追加 FAQPage 节点（SOP-3L-04） */
  faqs?: { question: string; answer: string }[];
}

export function TemplateDetailJsonLd({
  name,
  slug,
  description,
  price,
  priceCurrency,
  category,
  images,
  features,
  faqs,
}: TemplateDetailProps) {
  const base = `${SITE_URL}/templates/${slug}`;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "Product",
      "@id": `${base}/#product`,
      name,
      description,
      category,
      image: images,
      brand: MERCHANT_BRAND,
      offers: {
        "@type": "Offer",
        price: price.toString(),
        priceCurrency,
        availability: "https://schema.org/InStock",
        url: base,
        seller: { "@id": `${SITE_URL}/#organization` },
        hasMerchantReturnPolicy: MERCHANT_RETURN_POLICY,
        shippingDetails: MERCHANT_SHIPPING_DETAILS,
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${base}/#software`,
      name: SITE_NAME,
      applicationCategory: "DeveloperApplication",
      description:
        "Use Roblox GUI Maker to customize this template or create your own GUI from scratch with AI code generation.",
      url: `${SITE_URL}/editor`,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@type": "ImageGallery",
      "@id": `${base}/#gallery`,
      image: images.map((url) => ({
        "@type": "ImageObject",
        url,
        caption: `${name} — Screenshot`,
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Templates",
          item: `${SITE_URL}/templates`,
        },
        { "@type": "ListItem", position: 3, name },
      ],
    },
  ];

  // SOP-3L-04: 可选 FAQPage 节点（当 faqs 传入时追加）
  if (faqs && faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${base}/#faqpage`,
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }

  return <JsonLd data={graph} id="template-detail-jsonld" />;
}
