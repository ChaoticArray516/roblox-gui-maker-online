import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeNext } from "@/lib/auth-next";

/**
 * SOP-3H-03: OAuth / email redirect callback
 *
 * Creem/OAuth 提供商回调到 /auth/callback?code=xxx&next=/dashboard
 * 用 code 换 session，成功跳 next（默认 /dashboard），失败回登录页。
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // SOP-3U-05: 开放重定向防护收敛至 sanitizeNext（拒绝 //、/\ 变体、控制字符、超长）
  const next = sanitizeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // GA4-03: 成功分支先跳客户端探针页打 login 事件，再由探针 replace 到最终落点。
      // 仅改 redirect URL 字符串，鉴权逻辑行零改动。
      const method = searchParams.get("method") ?? "oauth";
      return NextResponse.redirect(
        `${origin}/auth/callback-success?next=${encodeURIComponent(next)}&method=${encodeURIComponent(method)}`,
      );
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`);
}
