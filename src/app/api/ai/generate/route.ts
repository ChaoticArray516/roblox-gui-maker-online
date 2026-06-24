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

/**
 * SOP-3F-12: AI 生成路由
 *
 * POST /api/ai/generate
 * - 有 OPENROUTER_API_KEY 时调用 OpenRouter，按 fallback 链尝试模型
 * - 无 key 或全部模型失败时返回 Mock SSE 流
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

function createOpenRouterStream(
  upstreamBody: ReadableStream<Uint8Array> | null,
): ReadableStream<Uint8Array> | null {
  if (!upstreamBody) return null;
  const reader = upstreamBody.getReader();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream({
    start(controller) {
      let buffer = "";

      async function pump(): Promise<void> {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
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

      pump().catch((err) => {
        controller.error(err);
      });
    },
  });
}

async function tryOpenRouterStream(
  req: AIGenerationRequest,
  key: string,
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

      const stream = createOpenRouterStream(response.body);
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

  const key = process.env.OPENROUTER_API_KEY;
  let stream: ReadableStream<Uint8Array> | null = null;

  if (key) {
    stream = await tryOpenRouterStream(body, key);
  }

  if (!stream) {
    stream = buildMockStream(body);
  }

  return new Response(stream, { headers: SSE_HEADERS });
}
