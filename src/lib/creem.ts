/**
 * SOP-3H-04: Creem SDK 服务端封装
 *
 * 来源: MASTER_SOP.md §16.4 SOP-3H-04
 *
 * 基于 creem@1.5.1 实测 API:
 * - new Creem({ apiKey, server: 'test'|'prod' })
 * - creem.checkouts.create(CreateCheckoutRequest)
 * - creem.customers.listSubscriptions(id, pageNumber?, pageSize?)
 * - creem.customers.generateBillingLinks({customerId})
 *
 * testMode 铁律(memory/feedback_creem_testmode_baseurl.md):
 *   - 本文件 server: 按 CREEM_API_KEY 前缀(creem_test_*)自动选 'test',否则 'prod'
 *   - @creem_io/nextjs 工厂(Checkout/Portal/Webhook,3H-05/06 才会创建)同样必须用
 *     testMode: process.env.CREEM_API_KEY?.startsWith("creem_test_") ?? true
 *   防止 test key 被 SDK 默认 testMode:false 误发到 prod base URL 拿 401。
 */

import "server-only";
import { Creem } from "creem";

import { SITE_URL } from "@/lib/site-config";

/** Creem API key — 从 env 读取(3H-05 工厂、本文件 SDK 实例共用) */
export const CREEM_API_KEY = process.env.CREEM_API_KEY ?? "";

/** 是否走测试沙箱(test key 前缀或显式 env 覆盖) */
export const CREEM_TEST_MODE =
  CREEM_API_KEY.startsWith("creem_test_") ||
  process.env.CREEM_TEST_MODE === "true";

/**
 * Creem SDK 实例
 * server 决定 base URL: 'test' → test-api.creem.io / 'prod' → api.creem.io
 */
export const creem = new Creem({
  apiKey: CREEM_API_KEY,
  server: CREEM_TEST_MODE ? "test" : "prod",
});

/**
 * 产品 ID — 从 env 读取（SOP-3H-13）
 *
 * 部署时在 Vercel 注入真实 prod_xxx ID（Creem Dashboard 建产品后获得）。
 * 未配置时为空字符串，checkout 路由会返回 400 提示未配置。
 *
 * 数值与 src/lib/constants.ts PRO_PLAN + src/lib/templates.ts 同源:
 *   - Pro Plan: $9.99/月(constants.ts)
 *   - $9.99 模板: fps-hud / pet-shop / dialogue-system(templates.ts)
 */
export const PRODUCTS = {
  /** 订阅: Pro 月付 $9.99 */
  PRO_MONTHLY: process.env.CREEM_PRODUCT_PRO_MONTHLY ?? "",
  /** 一次性: $9.99 模板 - FPS HUD */
  TEMPLATE_FPS_HUD: process.env.CREEM_PRODUCT_TEMPLATE_FPS_HUD ?? "",
  /** 一次性: $9.99 模板 - Pet Shop */
  TEMPLATE_PET_SHOP: process.env.CREEM_PRODUCT_TEMPLATE_PET_SHOP ?? "",
  /** 一次性: $9.99 模板 - Dialogue System */
  TEMPLATE_DIALOGUE: process.env.CREEM_PRODUCT_TEMPLATE_DIALOGUE ?? "",
} as const;

export type ProductKey = keyof typeof PRODUCTS;

/**
 * 创建 checkout 会话
 *
 * @param params.productId    Creem 产品 ID(取自 PRODUCTS)
 * @param params.userId       Supabase user id;放进 metadata,webhook 用它定位用户
 * @param params.email        客户邮箱;Creem 会预填到 checkout 页
 * @param params.successUrl   付款成功跳转;默认 ${SITE_URL}/dashboard?checkout=success
 * @param params.metadata     额外业务数据(例如 templateSlug);默认仅 userId+source
 *
 * 返回 CheckoutEntity,前端用 .checkoutUrl 跳转到 Creem 结账页。
 */
export async function createCheckoutSession(params: {
  productId: string;
  userId: string;
  email: string;
  successUrl?: string;
  metadata?: Record<string, string>;
}) {
  const { productId, userId, email, successUrl, metadata } = params;

  return await creem.checkouts.create({
    productId,
    successUrl: successUrl ?? `${SITE_URL}/dashboard?checkout=success`,
    customer: { email },
    metadata: {
      // referenceId 是 @creem_io/nextjs webhook 读 userId 的约定字段（SOP-3H-06）
      referenceId: userId,
      userId,
      source: "web",
      timestamp: new Date().toISOString(),
      ...metadata,
    },
  });
}

/**
 * 按客户 ID 查询活跃订阅
 *
 * 用法: Dashboard /billing 页加载时调用,判断用户当前是否 Pro。
 * 返回 status='active' | 'trialing' 的订阅列表(空数组 = 该客户当前无有效订阅)。
 */
export async function verifySubscription(customerId: string) {
  const result = await creem.customers.listSubscriptions(customerId);
  const items = result.items ?? [];
  return items.filter(
    (sub) => sub.status === "active" || sub.status === "trialing",
  );
}

/**
 * 获取客户门户链接
 * 用户用来管理订阅 / 查发票 / 取消;Dashboard /billing 跳转入口。
 */
export async function getCustomerPortalLink(customerId: string) {
  return await creem.customers.generateBillingLinks({ customerId });
}

/**
 * 工具:从 Creem 产品 slug 映射回应用层 PRODUCT key
 * webhook 收到产品事件时,用此识别这是 Pro 订阅还是模板购买
 */
export function findProductKey(productId: string): ProductKey | null {
  const entries = Object.entries(PRODUCTS) as [ProductKey, string][];
  const match = entries.find(([, id]) => id === productId);
  return match ? match[0] : null;
}
