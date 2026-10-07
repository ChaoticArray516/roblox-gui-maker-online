"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { currentPathAsNext } from "@/lib/auth-next";

/**
 * SOP-3H-03: Header 账户入口（Client island）
 *
 * Header 本身是 Server Component（SSG 页面静态预渲染不动）。
 * 本组件在客户端 hydrate 后读取 session：
 *   - 已登录：显示 Dashboard 链接 + Sign out
 *   - 未登录：显示 Log in 链接
 * 初次渲染（SSR/首屏）显示 Log in 占位，避免 hydration mismatch。
 */
export function AccountMenu() {
  const [loggedIn, setLoggedIn] = useState(false);
  // SOP-3U-04: SSR 期 window 不可用（href 会退化为 /dashboard 兜底），
  // mount 后用真实路径刷新 href；onClick 点击时现算（双保险）。
  const [loginHref, setLoginHref] = useState("/auth/login");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setLoggedIn(!!user);
    });
    setLoginHref(`/auth/login?next=${encodeURIComponent(currentPathAsNext())}`);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    // SOP-3U-02: 整页跳转，绕开客户端路由（CSR bailout 页发起的 transition 会悬挂）
    window.location.assign("/auth/login");
  }

  if (!loggedIn) {
    // SOP-3U-02/04: next 透传 + 整页跳转兜底（Link 保留语义，点击时 preventDefault 接管）
    return (
      <Link
        href={loginHref}
        onClick={(e) => {
          e.preventDefault();
          window.location.assign(
            `/auth/login?next=${encodeURIComponent(currentPathAsNext())}`,
          );
        }}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        Log in
      </Link>
    );
  }

  return (
    <div className="hidden items-center gap-2 md:flex">
      <Link
        href="/dashboard"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        Dashboard
      </Link>
      <button
        onClick={handleSignOut}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
      >
        Sign out
      </button>
    </div>
  );
}
