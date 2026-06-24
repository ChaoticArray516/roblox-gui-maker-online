import { NextResponse } from "next/server";

/**
 * SOP-3F-12: AI 服务状态探测
 *
 * 返回当前是否配置了 OPENROUTER_API_KEY、是否走 mock、当前模型。
 * 前端据此显示 "Live" / "Demo" 徽章。
 */
export async function GET() {
  const configured = !!process.env.OPENROUTER_API_KEY;
  return NextResponse.json({
    configured,
    mock: !configured,
    model: process.env.OPENROUTER_MODEL ?? null,
  });
}
