/**
 * SOP-3H-07: 积分系统后端
 *
 * 与 color_pages 的直接表读写不同，roblox_gui 用 0001_init.sql 的原子 RPC：
 *   - deduct_credit(p_user_id, p_amount, p_reason) — 原子 UPDATE ... WHERE credits_remaining >= p_amount RETURNING
 *   - add_credits(p_user_id, p_amount, p_reason) — 回滚用
 * RPC 自带竞态防护（WHERE credits_remaining >= p_amount），比 read-then-write 稳健。
 *
 * Pro 旁路：plan==='Pro' 时直接返回 { remaining: Infinity }，不调 deduct_credit。
 *
 * 配额源：FREE_MONTHLY=50（与 constants.ts FREE_PLAN.credits=50 + schema DEFAULT 50 三同源）。
 * roblox_gui 无 Team 档（定价只有 Free/Pro），故无 TEAM_MONTHLY。
 */
import { getServiceClient } from "@/lib/supabase/service";

export const FREE_MONTHLY = 50;

export interface CreditStatus {
  remaining: number;
  plan: "Free" | "Pro";
  isPro: boolean;
  total: number;
}

/**
 * 查询某用户的积分状态（service client，bypass RLS，供 webhook/dashboard 用）。
 * 不依赖 request session——按 userId 直查。
 */
export async function getCreditStatus(
  userId: string,
): Promise<CreditStatus | null> {
  const supabase = getServiceClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits_remaining, plan")
    .eq("id", userId)
    .single();

  if (!profile) return null;

  // profiles.plan 由 webhook 同步；subscriptions 表作为二级校验
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  const plan: "Free" | "Pro" =
    profile.plan === "Pro" || sub?.plan === "Pro" ? "Pro" : "Free";
  const total = plan === "Pro" ? Infinity : FREE_MONTHLY;

  return {
    remaining: profile.credits_remaining,
    plan,
    isPro: plan === "Pro",
    total,
  };
}

/**
 * 扣除 1 个积分（原子 RPC）。
 * - Pro 用户旁路：不调 RPC，返回 { remaining: Infinity, charged: false }
 * - Free 用户：调 deduct_credit；额度不足时 RPC 抛 insufficient_credits → 返回 { remaining: 0, charged: false }
 * - 返回 null：用户不存在 / DB 异常
 * charged 判别（SOP-3X-03）：调用方必须以 charged 判定「本次是否真扣」——
 * insufficient 不抛错且 remaining:0 与「扣成功归零」形态相同，不可按 remaining 反推。
 */
export async function consumeCredit(
  userId: string,
  reason: string,
): Promise<{ remaining: number; charged: boolean } | null> {
  const status = await getCreditStatus(userId);
  if (!status) return null;

  // Pro 旁路（不扣费，charged=false）
  if (status.isPro) {
    return { remaining: Infinity, charged: false };
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase.rpc("deduct_credit", {
    p_user_id: userId,
    p_amount: 1,
    p_reason: reason,
  });

  if (error) {
    // RPC 抛 insufficient_credits（Postgres P0001）→ Supabase 返回 error
    if (error.message.includes("insufficient_credits")) {
      return { remaining: 0, charged: false };
    }
    console.error("[credits] deduct_credit failed:", error);
    return null;
  }

  return { remaining: (data as number) ?? 0, charged: true };
}

/**
 * 回滚积分（AI 生成失败时退款）。
 */
export async function refundCredit(
  userId: string,
  amount: number,
  reason: string,
): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase.rpc("add_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
  });
  if (error) {
    console.error("[credits] add_credits (refund) failed:", error);
  }
}
