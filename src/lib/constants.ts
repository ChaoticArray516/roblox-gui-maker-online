/**
 * 全站常量定义。SOP-3A-10。
 * 定价、模板分类、游戏类型、渲染模式枚举的单一数据源。
 */

/** 渲染模式枚举（与 INFORMATION_ARCHITECTURE.md §5 决策表一致） */
export const RenderMode = {
  SSG: "SSG",
  ISR: "ISR",
  CSR: "CSR",
} as const;
export type RenderMode = (typeof RenderMode)[keyof typeof RenderMode];

/** ISR 重新验证时间（秒）— 模板列表/详情 */
export const ISR_REVALIDATE_SECONDS = 3600;

/** 游戏类型 — 用于 /use-cases/[game-type] 路由参数 */
export const GameType = {
  Simulator: "simulator",
  FPS: "fps",
  Roleplay: "roleplay",
  Tycoon: "tycoon",
  Obby: "obby",
} as const;
export type GameType = (typeof GameType)[keyof typeof GameType];

export const GAME_TYPES: readonly GameType[] = Object.values(GameType);

/** 定价计划 — Free 与 Pro */
export interface PricingPlan {
  readonly id: "free" | "pro";
  readonly name: string;
  readonly priceUSD: number;
  readonly billingPeriod: "month" | "one_time";
  readonly credits: number | "unlimited";
  readonly features: readonly string[];
  readonly ctaLabel: string;
  readonly ctaHref: string;
  readonly highlighted: boolean;
}

export const FREE_PLAN: PricingPlan = {
  id: "free",
  name: "Free",
  priceUSD: 0,
  billingPeriod: "month",
  credits: 50,
  features: [
    "Drag-and-drop GUI editor",
    "50 AI generation credits / month",
    "Export clean Luau code",
    "Access to free template library",
  ],
  ctaLabel: "Start Free",
  ctaHref: "/editor",
  highlighted: false,
};

export const PRO_PLAN: PricingPlan = {
  id: "pro",
  name: "Pro",
  priceUSD: 9.99,
  billingPeriod: "month",
  credits: "unlimited",
  features: [
    "Everything in Free",
    "Unlimited AI generations",
    "Premium template library",
    "Priority email support",
  ],
  ctaLabel: "Upgrade to Pro",
  ctaHref: "/api/checkout?productId=PRO_MONTHLY",
  highlighted: true,
};

export const PRICING_PLANS: readonly PricingPlan[] = [FREE_PLAN, PRO_PLAN];

/** SOP-3W-03: 导出格式基准表述（唯一事实源 = ExportMenu 实装：7 选项 6 类产物）。
 *  全站文案引用此常量或与之逐字对齐，禁止散落手写格式清单、禁止排他性
 *  总数表述（"N formats 共几种"类）；上下文只提子集合法。 */
export const EXPORT_FORMATS_SUMMARY =
  "Client Luau, Server Luau, ModuleScript, Client+Server bundle, project JSON, and a ZIP bundle containing everything";