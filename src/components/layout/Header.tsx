/**
 * SOP-3C T2-A1: 全站 Header — 服务端组件（零 "use client"）
 *
 * sticky 顶栏：Logo → / + PRIMARY_NAV 站内导航（<Link>）+ "Try Editor Free" 主按钮。
 * 移动端用纯 CSS <details> 折叠（不引 JS），守住 SEO 组件零客户端铁律。
 * 导航数据源：site-config.ts 的 PRIMARY_NAV（只含 7 个 MVP 路由内的 5 个内容页）。
 */

import Link from "next/link";
import Image from "next/image";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PRIMARY_NAV, SITE_NAME } from "@/lib/site-config";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-glass-border bg-bg/80 backdrop-blur supports-[backdrop-filter]:bg-bg/60">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-text"
        >
          <Image
            src="/logo-transparent.png"
            alt="Roblox GUI Maker logo"
            width={28}
            height={28}
            priority
            className="h-7 w-7 shrink-0"
          />
          <span>{SITE_NAME}</span>
        </Link>

        {/* 桌面导航 */}
        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-text-muted transition-colors hover:text-text"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link href="/editor" className={cn(buttonVariants({ size: "lg" }))}>
            Try Editor Free
          </Link>
        </div>

        {/* 移动端：纯 CSS <details> 折叠，无 JS */}
        <details className="relative md:hidden">
          <summary
            className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-lg border border-glass-border text-text [&::-webkit-details-marker]:hidden"
            aria-label="Toggle navigation menu"
          >
            <span aria-hidden className="text-lg leading-none">
              ☰
            </span>
          </summary>
          <nav
            aria-label="Mobile"
            className="absolute right-0 mt-2 flex w-48 flex-col gap-1 rounded-lg border border-glass-border bg-surface-raised p-2 shadow-lg"
          >
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface hover:text-text"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/editor"
              className={cn(buttonVariants({ size: "lg" }), "mt-1 w-full")}
            >
              Try Editor Free
            </Link>
          </nav>
        </details>
      </div>
      <div className="border-t border-glass-border bg-surface-raised/40 py-1 text-center text-[10px] font-medium tracking-wide text-text-muted">
        Unofficial third-party tool · Not affiliated with Roblox Corporation
      </div>
    </header>
  );
}
