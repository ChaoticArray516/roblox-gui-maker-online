/**
 * SOP-3C T2-A2: 全站 Footer — 服务端组件（零 "use client"）
 *
 * 品牌列 + FOOTER_NAV 站内导航列（<Link>）+ 版权行。
 * 站内链接只指向 7 个 MVP 路由内的页面。
 * year 取构建期 BUILD_TIME（与 sitemap 同源，防跨年漂移），未注入时兜底当前年。
 *
 * Creem 合规(2026-09):已移除指向不存在账号的社媒外链(Twitter/X、YouTube、Discord),
 * 账号创建后再以真实 URL 恢复。
 */

import Link from "next/link";
import Image from "next/image";

import { FOOTER_NAV, SITE_NAME, SUPPORT_EMAIL } from "@/lib/site-config";

export function Footer() {
  // SOP-3V-14(E8): 与 sitemap 同源的构建期年份，防跨年漂移；BUILD_TIME 未注入时兜底
  const year = process.env.BUILD_TIME?.slice(0, 4) ?? new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-glass-border bg-surface text-text-muted">
      <div className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-text"
            >
              <Image
                src="/logo-transparent.png"
                alt="Roblox GUI Maker logo"
                width={26}
                height={26}
                className="h-6 w-6 shrink-0"
              />
              <span>{SITE_NAME}</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-text-muted">
              AI-powered Roblox GUI maker — drag, drop, and export clean Luau in
              seconds. No coding required.
            </p>
          </div>

          {/* Product nav */}
          <div>
            <h2 className="text-sm font-semibold text-text">Product</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/editor"
                  className="transition-colors hover:text-text"
                >
                  Web Editor
                </Link>
              </li>
              {FOOTER_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-text"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h2 className="text-sm font-semibold text-text">Legal</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="transition-colors hover:text-text"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="transition-colors hover:text-text"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-glass-border pt-6 text-xs text-text-muted sm:flex-row sm:items-center">
          <p>
            &copy; {year} {SITE_NAME}. All rights reserved.
          </p>
          <p className="max-w-md text-center">
            Not affiliated with or endorsed by Roblox Corporation. &quot;Roblox&quot; is a
            registered trademark of Roblox Corporation.
          </p>
        </div>
        <p className="mt-3 text-xs text-text-muted">
          Support:{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="underline transition-colors hover:text-text"
          >
            {SUPPORT_EMAIL}
          </a>
        </p>
      </div>
    </footer>
  );
}
