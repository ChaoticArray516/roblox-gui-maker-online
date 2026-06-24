/**
 * SOP-3C T2-A2: 全站 Footer — 服务端组件（零 "use client"）
 *
 * 品牌列 + FOOTER_NAV 站内导航列（<Link>）+ 版权行。
 * 站内链接只指向 7 个 MVP 路由内的页面；社媒为外链 <a rel>。
 * year 服务端求值（Footer 是 Server Component，无 hydration 漂移）。
 */

import Link from "next/link";
import Image from "next/image";

import {
  FOOTER_NAV,
  SITE_NAME,
  SITE_TWITTER_HANDLE,
} from "@/lib/site-config";

const SOCIAL_LINKS = [
  { label: "Twitter / X", href: "https://twitter.com/robloxguimaker" },
  { label: "YouTube", href: "https://youtube.com/@robloxguimaker" },
  { label: "Discord", href: "https://discord.gg/robloxguimaker" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-glass-border bg-surface text-text-muted">
      <div className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
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

          {/* Community / social (external) */}
          <div>
            <h2 className="text-sm font-semibold text-text">Community</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {SOCIAL_LINKS.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="transition-colors hover:text-text"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
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
          <p>{SITE_TWITTER_HANDLE}</p>
        </div>
      </div>
    </footer>
  );
}
