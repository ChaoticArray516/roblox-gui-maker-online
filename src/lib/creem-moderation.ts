/**
 * Creem 合规: Moderation API 前置筛查
 *
 * 来源: https://docs.creem.io/features/moderation
 * 要求: 所有触达生成模型的用户 prompt 必须先经 POST /v1/moderation/prompt 筛查。
 *   - decision = "allow" → 放行
 *   - decision = "flag" / "deny" → 拦截(Creem 建议 flag 视同 deny)
 *   - 调用失败(网络/超时/5xx/无 key) → fail closed, 绝不跳过筛查直接生成
 *
 * base URL 与 creem.ts 的 testMode 铁律一致:
 *   creem_test_* key → test-api.creem.io, 否则 api.creem.io
 */

import "server-only";

import { CREEM_API_KEY, CREEM_TEST_MODE } from "@/lib/creem";

export type ModerationDecision = "allow" | "flag" | "deny";

export type ModerationResult =
  | { ok: true; decision: ModerationDecision }
  | { ok: false };

const MODERATION_TIMEOUT_MS = 5000;

/**
 * 筛查单个用户 prompt。只传用户可控文本,不要拼接系统模板(计费按字符计)。
 *
 * @param prompt     用户原始输入
 * @param externalId 可选审计标识(如 `user_<id>`),会回显在 Creem 侧记录中
 */
export async function moderatePrompt(
  prompt: string,
  externalId?: string,
): Promise<ModerationResult> {
  if (!CREEM_API_KEY) {
    console.warn("[creem-moderation] CREEM_API_KEY 未配置,无法筛查");
    return { ok: false };
  }

  const baseUrl = CREEM_TEST_MODE
    ? "https://test-api.creem.io"
    : "https://api.creem.io";

  try {
    const res = await fetch(`${baseUrl}/v1/moderation/prompt`, {
      method: "POST",
      headers: {
        "x-api-key": CREEM_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        ...(externalId ? { external_id: externalId } : {}),
      }),
      signal: AbortSignal.timeout(MODERATION_TIMEOUT_MS),
    });

    if (!res.ok) {
      console.warn(`[creem-moderation] HTTP ${res.status}`);
      return { ok: false };
    }

    const data: unknown = await res.json();
    const decision = (data as { decision?: unknown })?.decision;
    if (
      decision === "allow" ||
      decision === "flag" ||
      decision === "deny"
    ) {
      return { ok: true, decision };
    }

    // 未知字段/异常响应体 — 按失败处理(fail closed)
    console.warn("[creem-moderation] 响应缺少有效 decision 字段");
    return { ok: false };
  } catch (err) {
    console.warn("[creem-moderation] 调用失败:", err);
    return { ok: false };
  }
}
