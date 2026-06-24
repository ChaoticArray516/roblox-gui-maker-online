/**
 * Merchant listings 合规共享常量。
 *
 * 触发原因：2026-06-21 GSC 报告 Product/Offer 缺 image / brand / availability /
 * hasMerchantReturnPolicy / shippingDetails 五项字段。Product JSON-LD 由
 * PricingJsonLd（Pro Plan）和 TemplateDetailJsonLd（每个模板）渲染，本模块为
 * 这两处提供 brand / 退货 / 物流 三件套，避免重复定义。
 *
 * 字段形态依据：https://developers.google.com/search/docs/appearance/structured-data/merchant-listing
 *
 * ⚠️ 凡更新退款政策/支持国家/数字交付方式，先更这里，再同步 Pricing 页可见文案，
 *    否则可能被 Google 视为 misrepresentation。
 */

import { SITE_NAME } from "./site-config";

/** Brand 节 — 满足 Merchant listings 的 "global identifier" 要求 */
export const MERCHANT_BRAND: Record<string, unknown> = {
  "@type": "Brand",
  name: SITE_NAME,
};

/**
 * 退货政策 — 14 天无理由全额退款，邮件方式（数字订阅按"退款"语义记账）。
 * 与 Pricing 页可见文案/隐私条款必须一致。
 */
export const MERCHANT_RETURN_POLICY: Record<string, unknown> = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: ["US", "GB", "DE", "CA", "AU", "FR", "JP"],
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 14,
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/FreeReturn",
};

/**
 * 物流详情 — 数字商品按 $0/即时交付声明（0 处理 + 0 运输天数）。
 * shippingDestination 用 DefinedRegion 国家允许列表；Google 文档未支持 "001" 全球码。
 */
export const MERCHANT_SHIPPING_DETAILS: Record<string, unknown> = {
  "@type": "OfferShippingDetails",
  shippingRate: {
    "@type": "MonetaryAmount",
    value: "0",
    currency: "USD",
  },
  shippingDestination: [
    { "@type": "DefinedRegion", addressCountry: "US" },
    { "@type": "DefinedRegion", addressCountry: "GB" },
    { "@type": "DefinedRegion", addressCountry: "DE" },
    { "@type": "DefinedRegion", addressCountry: "CA" },
    { "@type": "DefinedRegion", addressCountry: "AU" },
    { "@type": "DefinedRegion", addressCountry: "FR" },
    { "@type": "DefinedRegion", addressCountry: "JP" },
  ],
  deliveryTime: {
    "@type": "ShippingDeliveryTime",
    handlingTime: {
      "@type": "QuantitativeValue",
      minValue: 0,
      maxValue: 0,
      unitCode: "DAY",
    },
    transitTime: {
      "@type": "QuantitativeValue",
      minValue: 0,
      maxValue: 0,
      unitCode: "DAY",
    },
  },
};
