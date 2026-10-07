import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/supabase/service";
import { refundCredit } from "@/lib/credits";

/**
 * SOP-3X-04: 解析失败退款兜底端点
 *
 * POST /api/ai/generate/refund
 * body: { generationId }
 *
 * 场景：SSE 流完整结束（服务端已结算 charged=true）但客户端 JSON.parse 失败——
 * 用户没拿到结果，额度应退回。
 *
 * 幂等：条件更新 status completed→refunded 且 charged=true，
 * 命中才退款；重复调用第二次更新 0 行 → 404，零影响。
 * 匿名/非本人/未扣费/非 completed → 一律 404（不泄露行存在性）。
 */
export async function POST(req: NextRequest) {
  let generationId: string;
  try {
    const body = await req.json();
    if (!body?.generationId || typeof body.generationId !== "string") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    generationId = body.generationId;
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 匿名 404
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 条件更新幂等：仅当 本人 + charged=true + status='completed' 才命中
  const service = getServiceClient();
  const { data, error } = await service
    .from("generations")
    .update({ status: "refunded" })
    .eq("id", generationId)
    .eq("user_id", user.id)
    .eq("charged", true)
    .eq("status", "completed")
    .select("id");

  if (error) {
    console.error("[ai/generate/refund] conditional update failed:", error);
    return NextResponse.json(
      { error: "Refund failed. Please contact support." },
      { status: 500 },
    );
  }
  if (!data || data.length === 0) {
    // 未命中：非本人/未扣费/非 completed/已 refunded（重复调用）——零影响
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await refundCredit(user.id, 1, "ai_generate_parse_failed");
  return NextResponse.json({ ok: true, refunded: 1 });
}
