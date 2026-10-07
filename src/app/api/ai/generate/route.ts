import { NextResponse, type NextRequest } from "next/server";
import {
  buildSystemPrompt,
  buildUserPrompt,
  generateMockElements,
  getOpenRouterModels,
  OPENROUTER_API_URL,
} from "@/lib/openrouter";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";
import type { AIGenerationRequest } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/supabase/service";
import { consumeCredit, getCreditStatus } from "@/lib/credits";
import { moderatePrompt } from "@/lib/creem-moderation";

/**
 * SOP-3F-12 + SOP-3H-08: AI 生成路由
 *
 * POST /api/ai/generate
 * Creem 合规(2026-09): 所有 prompt 先经 Creem Moderation API 筛查,
 *   deny/flag 一律 400 拦截; 已登录请求(会触达真实模型)在筛查不可用时
 *   fail closed 返回 503。匿名 Mock 不触达模型,筛查不可用时仍允许试用。
 * 认证 + 积分策略（SOP-3X-03 重构：流完成才扣 + 首免认领制）：
 *   - 未登录：直接走 Mock 流（不扣费、不落库、不拦 OpenRouter 之外的访问），保留匿名试用
 *   - 已登录 Free：首次生成免扣（generations 部分唯一索引认领制）；
 *     第 N 次在流正常完成后 deduct_credit(1)；cancel/断网/启动失败一律不扣
 *   - 已登录 Pro：旁路扣费，直接跑 OpenRouter
 *   - 已登录但积分=0（非首免）：返回 402 + upgradeUrl
 * - 无 OPENROUTER_API_KEY 或全部模型失败时建 failed 行 + 回退 Mock 流
 *   （不扣费；回退响应不带 X-Generation-Id，客户端缺头识别 mock）
 * - 统一输出 SSE：每行 `data: <chunk>`，结束 `data: [DONE]`
 *
 * 流内容是一段 JSON 字符串（与 useEditorState.importJSON 格式一致）。
 */

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
};

function buildMockStream(req: AIGenerationRequest): ReadableStream<Uint8Array> {
  const elements = generateMockElements(req);
  const payload = JSON.stringify({
    version: "1.0",
    exportedAt: new Date().toISOString(),
    gui: {
      name: `${req.style} ${req.guiType}`,
      elements: Object.values(elements),
    },
  });

  const encoder = new TextEncoder();
  // 把 JSON 切成 32 字符块模拟流式输出
  const chunkSize = 32;

  return new ReadableStream({
    start(controller) {
      let i = 0;
      function push() {
        if (i >= payload.length) {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          return;
        }
        const chunk = payload.slice(i, i + chunkSize);
        controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
        i += chunkSize;
        setTimeout(push, 12);
      }
      push();
    },
  });
}

async function buildOpenRouterPayload(req: AIGenerationRequest) {
  return {
    model: getOpenRouterModels()[0] ?? "deepseek/deepseek-chat",
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserPrompt(req) },
    ],
    stream: true,
    temperature: 0.2,
    max_tokens: 4000,
  };
}

type StreamOutcome = "completed" | "cancelled" | "failed";

function createOpenRouterStream(
  upstreamBody: ReadableStream<Uint8Array> | null,
  onSettle?: (outcome: StreamOutcome) => Promise<void>,
): ReadableStream<Uint8Array> | null {
  if (!upstreamBody) return null;
  const reader = upstreamBody.getReader();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // SOP-3X-03: 结算只触发一次（三处 close 点/cancel/catch 互斥）；
  // completed 路径在 controller.close() 前 await 完——客户端 [DONE] 晚于扣费提交，
  // 保证积分刷新 effect（[success] 依赖）读到扣后余额。
  let settled = false;
  async function settle(outcome: StreamOutcome): Promise<void> {
    if (settled) return;
    settled = true;
    try {
      await onSettle?.(outcome);
    } catch (err) {
      console.error("[ai/generate] settle failed:", err);
    }
  }

  return new ReadableStream({
    start(controller) {
      let buffer = "";

      async function pump(): Promise<void> {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            await settle("completed");
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (data === "[DONE]") {
              await settle("completed");
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (typeof content === "string" && content.length > 0) {
                // SSE 帧内不能含裸换行（否则客户端按 \n split 后，换行后的片段
                // 不以 "data:" 开头会被丢弃，导致 JSON 截断）。
                // JSON 中换行是无意义空白，剥离后帧内为单行，安全。
                const safe = content.replace(/[\r\n]+/g, "");
                if (safe.length > 0) {
                  controller.enqueue(encoder.encode(`data: ${safe}\n\n`));
                }
              }
              const finishReason = parsed.choices?.[0]?.finish_reason;
              if (finishReason === "stop" || finishReason === "length") {
                await settle("completed");
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                controller.close();
                return;
              }
            } catch {
              // 忽略无法解析的杂项行
            }
          }
        }
      }

      pump().catch(async (err) => {
        await settle("failed");
        controller.error(err);
      });
    },
    cancel() {
      // 客户端断开（abort/关页/断网）——不扣费，置 cancelled（fire-and-forget）
      void settle("cancelled");
      reader.cancel().catch(() => {});
    },
  });
}

async function tryOpenRouterStream(
  req: AIGenerationRequest,
  key: string,
  onSettle?: (outcome: StreamOutcome) => Promise<void>,
): Promise<ReadableStream<Uint8Array> | null> {
  const models = getOpenRouterModels();
  const payloadBase = await buildOpenRouterPayload(req);

  for (const model of models) {
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
          "HTTP-Referer": SITE_URL,
          "X-Title": SITE_NAME,
        },
        body: JSON.stringify({ ...payloadBase, model }),
      });

      if (!response.ok) continue;

      const stream = createOpenRouterStream(response.body, onSettle);
      if (stream) return stream;
    } catch {
      // 继续 fallback
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  let body: AIGenerationRequest;
  try {
    body = await req.json();
    if (!body.prompt || typeof body.prompt !== "string") {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // 认证：未登录 → 匿名 Mock 试用（不扣费、不跑 OpenRouter）
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Creem 合规: Moderation 前置筛查 — 在扣费/模型调用之前执行。
  // deny/flag 一律拦截; 已登录请求会触达真实模型,筛查失败时 fail closed。
  const moderation = await moderatePrompt(
    body.prompt,
    user ? `user_${user.id}` : "anonymous",
  );
  if (moderation.ok && moderation.decision !== "allow") {
    return NextResponse.json(
      {
        error: "prompt_rejected",
        message:
          "Your prompt was rejected because it violates our content policy. Please revise and try again.",
      },
      { status: 400 },
    );
  }
  if (!moderation.ok && user) {
    return NextResponse.json(
      {
        error: "moderation_unavailable",
        message:
          "Content moderation is temporarily unavailable. Please try again later.",
      },
      { status: 503 },
    );
  }

  if (!user) {
    return new Response(buildMockStream(body), { headers: SSE_HEADERS });
  }

  // ── SOP-3X-03: 已登录 = 首免认领 + 预检只读 + 流完成才扣 ──────────────

  // ① 首免认领（认领制，非查再判）：insert is_free_first=true，
  //    部分唯一索引冲突(23505)说明已被认领/已用过 → 改插普通行
  const service = getServiceClient();
  let isFreeFirst = false;
  let gen = await service
    .from("generations")
    .insert({
      user_id: user.id,
      prompt: body.prompt,
      gui_type: body.guiType,
      style: body.style,
      device: body.device,
      is_free_first: true,
    })
    .select("id")
    .single();
  if (gen.error?.code === "23505") {
    gen = await service
      .from("generations")
      .insert({
        user_id: user.id,
        prompt: body.prompt,
        gui_type: body.guiType,
        style: body.style,
        device: body.device,
      })
      .select("id")
      .single();
  } else if (!gen.error && gen.data) {
    isFreeFirst = true;
  }
  if (!gen.data) {
    // 非 23505 错误（表未建/RLS/网络）→ 500 早退，不触达模型不扣费
    console.error("[ai/generate] generations insert failed:", gen.error);
    return NextResponse.json(
      { error: "Generation init failed. Please try again later." },
      { status: 500 },
    );
  }
  const generationId = gen.data.id as string;

  // ② 预检只读不扣（首免与 Pro 跳过 402 判定）
  const pre = await getCreditStatus(user.id);
  if (!pre) {
    await service
      .from("generations")
      .update({ status: "failed" })
      .eq("id", generationId);
    return NextResponse.json(
      { error: "Account error. Please contact support." },
      { status: 500 },
    );
  }
  if (!isFreeFirst && !pre.isPro && pre.remaining === 0) {
    await service
      .from("generations")
      .update({ status: "failed" })
      .eq("id", generationId);
    return NextResponse.json(
      {
        error: "Out of AI credits. Upgrade to Pro for unlimited generations.",
        remaining: 0,
        upgradeUrl: "/pricing",
      },
      { status: 402 },
    );
  }

  // ④ 结算：只在流正常完成后扣费（铁律 4）；cancel/failed 一律不扣
  const settle = async (outcome: StreamOutcome): Promise<void> => {
    if (outcome === "completed") {
      let chargedNow = false;
      if (!isFreeFirst && !pre.isPro) {
        const r = await consumeCredit(user.id, "ai_generate");
        // 竞态（预检过→扣时不足）→ charged=false：放行当送一次，严禁逆向（铁律 3/4）
        chargedNow = r?.charged ?? false;
      }
      await service
        .from("generations")
        .update({ status: "completed", charged: chargedNow })
        .eq("id", generationId);
    } else {
      await service
        .from("generations")
        .update({ status: outcome })
        .eq("id", generationId);
    }
  };

  const key = process.env.OPENROUTER_API_KEY;
  let stream: ReadableStream<Uint8Array> | null = null;

  if (key) {
    stream = await tryOpenRouterStream(body, key, settle);
  }

  if (!stream) {
    // OpenRouter 启动失败 → status=failed + 不扣 + 回退 Mock（仍返回 200）
    // 不携带 X-Generation-Id——客户端缺头识别 mock 场景
    await settle("failed");
    console.warn("[ai/generate] OpenRouter failed, Mock fallback (no charge)");
    stream = buildMockStream(body);
    return new Response(stream, { headers: SSE_HEADERS });
  }

  // ⑤ 响应头携带生成 id（退款端点凭证）+ 首免标记（客户端埋点用）
  const headers: Record<string, string> = {
    ...SSE_HEADERS,
    "X-Generation-Id": generationId,
  };
  if (isFreeFirst) headers["X-Free-First"] = "1";
  return new Response(stream, { headers });
}
