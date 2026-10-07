import { Portal } from "@creem_io/nextjs";

/**
 * SOP-3H-05: 客户门户
 *
 * GET /api/portal?customerId=xxx → Creem 门户链接（管理订阅/发票/取消）
 * 用 @creem_io/nextjs Portal 工厂（签名/testMode 自动处理）。
 * Dashboard /billing 已登录用户跳转入口。
 *
 * testMode 铁律（memory/feedback_creem_testmode_baseurl.md）：
 * 按 CREEM_API_KEY 前缀自动判断，test key 走沙箱 base URL。
 */
export const GET = Portal({
  apiKey: process.env.CREEM_API_KEY!,
  testMode: process.env.CREEM_API_KEY?.startsWith("creem_test_") ?? true,
});
