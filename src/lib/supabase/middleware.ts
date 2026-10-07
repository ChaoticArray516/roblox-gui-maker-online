import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * SOP-3H-02: Supabase session 刷新 + 受保护路由守卫
 * （SOP-3U-06: 调用方已迁移为 src/proxy.ts；本文件为普通模块，文件名保留不动）
 *
 * 1. 刷新 auth token（getUser() 触发 cookie 续期）
 * 2. /dashboard/* 未登录 → 302 /auth/login?next=<原路径>
 *
 * 仅在 matcher 匹配的路由（/dashboard/*）上运行，SSG 营销页不经过本 proxy，
 * 守住 SSG 铁律（Header 在营销页是静态的，不显示登录态）。
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // 刷新 auth token；getUser() 会自动续期过期 cookie
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 受保护路由：未登录重定向到登录页
  const pathname = request.nextUrl.pathname;
  const isProtected = pathname.startsWith("/dashboard");
  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
