import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * SOP-3H-03: email OTP 确认
 *
 * 邮件链接回调到 /auth/confirm?token_hash=xxx&type=signup&next=/dashboard
 * verifyOtp 成功跳 next，失败回登录页。
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next") ?? "/dashboard";
  // 开放重定向防护：仅允许站内路径（拒绝 //evil.com 等协议相对地址）
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/dashboard";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(
    new URL("/auth/login?error=confirmation_failed", request.url),
  );
}
