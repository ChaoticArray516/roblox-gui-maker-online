import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * SOP-3H-02 / SOP-3U-06: 根 proxy（Next 16 约定，原 middleware 已弃用改名）
 *
 * 仅在 /dashboard/* 上运行（session 刷新 + 未登录守卫）。
 * SSG 营销页、API、静态资源不经过本 proxy，守住 SSG 性能铁律。
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
