import type { Metadata } from "next";
import Link from "next/link";

import { EditorShellLazy } from "@/components/editor/EditorShellLazy";
import { EditorJsonLd, buildPageOpenGraph } from "@/components/seo";
import { OG_PAGES } from "@/lib/og-pages";

// page.tsx 是 Server Component：静态 H1/intro/<noscript>/<EditorJsonLd> 在此层，
// 保证爬虫三检（h1/title/ld+json）不受编辑器 CSR 影响。
// EditorShellLazy 是薄 Client Component wrapper，内部用 dynamic(ssr:false) 懒加载
// EditorShell + EditorSkeleton（Next 16 要求 ssr:false 必须在 Client Component 内调用）。

const OG = OG_PAGES["/editor"];

export const metadata: Metadata = {
  title: OG.title,
  description: OG.description,
  alternates: { canonical: "/editor" },
  robots: { index: true, follow: true }, // SOP-3V-03: nofollow→follow 规格变更（IA §1 /editor 行 2026-10-02 先行修订）
  ...buildPageOpenGraph({ url: "/editor", ...OG }), // SOP-3W-02: 页级 OG/Twitter（路径 A 双键）
};

export default function EditorPage() {
  return (
    <>
      <EditorJsonLd />
      <header className="mx-auto w-full max-w-6xl px-6 pt-6 pb-2">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
          Build Your Roblox GUI Online - Drag, Drop, Done
        </h1>
        <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
          <span>Compose ScreenGui layouts visually and export Luau.</span>
          <Link href="/templates" className="text-cyan-accent hover:underline">
            Browse templates
          </Link>
          <Link href="/plugin" className="text-cyan-accent hover:underline">
            Studio plugin waitlist
          </Link>
        </p>
      </header>

      {/* SOP-3K-06: 静态 intro section 承载 export / preview / visual-editor 功能词 */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-glass-border bg-surface p-4">
            <h2 className="font-display text-sm font-semibold text-text">Roblox GUI code export</h2>
            <p className="mt-1 text-xs text-text-muted">
              Export as a LocalScript, ModuleScript, Client+Server bundle,
              project JSON, or a full ZIP. Paste into StarterGui and it just
              works.
            </p>
          </div>
          <div className="rounded-xl border border-glass-border bg-surface p-4">
            <h2 className="font-display text-sm font-semibold text-text">Roblox UI preview tool</h2>
            <p className="mt-1 text-xs text-text-muted">
              Preview on Desktop, Tablet, and Mobile device frames before you
              export. Catch layout issues before they reach Studio.
            </p>
          </div>
          <div className="rounded-xl border border-glass-border bg-surface p-4">
            <h2 className="font-display text-sm font-semibold text-text">Roblox visual GUI editor</h2>
            <p className="mt-1 text-xs text-text-muted">
              Drag frames, buttons, and images onto a canvas. Scale, Offset,
              anchors, and Z-index are all editable in the properties panel.
            </p>
          </div>
        </div>
      </section>

      <noscript>
        <p className="mx-auto max-w-3xl px-6 py-8 text-text-muted">
          The interactive editor needs JavaScript enabled. You can still browse
          our <Link href="/templates" className="underline">template library</Link>{" "}
          or read the <Link href="/faq" className="underline">FAQ</Link>.
        </p>
      </noscript>
      <EditorShellLazy />
    </>
  );
}
