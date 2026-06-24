/**
 * SOP-3B-11: 定价 JSON-LD — @graph: Product(Free) + Product(Pro) + FAQPage
 *
 * 内容依据 SEO_TECH_SPEC.md §1.6；价格从 FREE_PLAN / PRO_PLAN 常量读取，
 * 与可见定价页同源，杜绝价格漂移（Pro = $9.99，已锁定）。URL 用 SITE_URL 拼接。
 * 由 src/app/pricing/page.tsx 渲染（T2 接线）。
 */

import { SITE_URL, SITE_DEFAULT_OG_IMAGE } from "@/lib/site-config";
import { FREE_PLAN, PRO_PLAN } from "@/lib/constants";
import {
  MERCHANT_BRAND,
  MERCHANT_RETURN_POLICY,
  MERCHANT_SHIPPING_DETAILS,
} from "@/lib/seo-merchant";
import { JsonLd } from "./JsonLd";

export function PricingJsonLd() {
  const graph: Record<string, unknown>[] = [
    // Free Plan: price=0 不符合 Google Merchant listings 要求，
    // 按 SoftwareApplication 暴露，避免持续触发 GSC 告警。
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/pricing/#software-free`,
      name: "Roblox GUI Maker — Free Plan",
      description:
        "Free tier with drag-and-drop editor, 50 AI generation credits per month, clean Luau export, and access to the free template library.",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: FREE_PLAN.priceUSD.toString(),
        priceCurrency: "USD",
        priceValidUntil: "2027-12-31",
        url: `${SITE_URL}/editor`,
        seller: { "@id": `${SITE_URL}/#organization` },
      },
    },
    // Pro Plan: 真实 SaaS 商品，按 Merchant listings 完整字段声明。
    {
      "@type": "Product",
      "@id": `${SITE_URL}/pricing/#product-pro`,
      name: "Roblox GUI Maker — Pro Plan",
      description:
        "Unlimited AI generations, premium template library, priority Figma-to-Roblox import, Studio plugin Pro features, and priority support.",
      image: [SITE_DEFAULT_OG_IMAGE],
      brand: MERCHANT_BRAND,
      offers: {
        "@type": "Offer",
        price: PRO_PLAN.priceUSD.toString(),
        priceCurrency: "USD",
        priceValidUntil: "2027-12-31",
        availability: "https://schema.org/PreOrder",
        url: "mailto:chaoticarray.rf516@gmail.com?subject=Notify%20me%20when%20Roblox%20GUI%20Maker%20Pro%20launches",
        seller: { "@id": `${SITE_URL}/#organization` },
        hasMerchantReturnPolicy: MERCHANT_RETURN_POLICY,
        shippingDetails: MERCHANT_SHIPPING_DETAILS,
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What's included in the free plan?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The free plan includes the full drag-and-drop editor, 50 AI generation credits per month, clean Luau code export, and access to the free template library. The Roblox Studio plugin community tier will be included once the plugin launches.",
          },
        },
        {
          "@type": "Question",
          name: "How much does the Pro plan cost?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Pro will be $9.99 per month when subscriptions open. It will add unlimited AI generations, the premium template library, priority Figma import, Studio plugin Pro features, and priority email support.",
          },
        },
        {
          "@type": "Question",
          name: "Can I cancel my Pro subscription anytime?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Once Pro subscriptions are available, you can cancel at any time. You'll retain Pro access until the end of your billing period, then drop to the Free plan automatically.",
          },
        },
        {
          "@type": "Question",
          name: "Do you offer student or indie developer discounts?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes! We plan to offer a 50% discount for students with a valid .edu email and for indie developers who have earned less than $1,000 from their Roblox games in the past 12 months. Contact support to apply once Pro launches.",
          },
        },
        {
          "@type": "Question",
          name: "What's your refund policy?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Once Pro subscriptions open, they will come with a 14-day money-back guarantee. Email chaoticarray.rf516@gmail.com within 14 days of your first charge and we'll refund in full — no questions asked. Marketplace template purchases are also eligible for a 14-day refund if the template is broken or significantly differs from its description.",
          },
        },
      ],
    },
  ];

  return <JsonLd data={graph} id="pricing-jsonld" />;
}
