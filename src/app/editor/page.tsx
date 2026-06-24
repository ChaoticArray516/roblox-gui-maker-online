import type { Metadata } from "next";
import Link from "next/link";

import { EditorShellLazy } from "@/components/editor/EditorShellLazy";
import { EditorJsonLd } from "@/components/seo";

// page.tsx 是 Server Component：静态 H1/intro/<noscript>/<EditorJsonLd> 在此层，
// 保证爬虫三检（h1/title/ld+json）不受编辑器 CSR 影响。
// EditorShellLazy 是薄 Client Component wrapper，内部用 dynamic(ssr:false) 懒加载
// EditorShell + EditorSkeleton（Next 16 要求 ssr:false 必须在 Client Component 内调用）。

export const metadata: Metadata = {
  title: "Build Your Roblox GUI Online — Drag, Drop, Done",
  description:
    "The Roblox GUI Maker web editor — drag, drop, and export Luau. The full editor is loading; please enable JavaScript.",
  alternates: { canonical: "/editor" },
  robots: { index: true, follow: false },
};

export default function EditorPage() {
  return (
    <>
      <EditorJsonLd />
      <header className="mx-auto w-full max-w-6xl px-6 pt-16">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text sm:text-4xl">
          Build Your Roblox GUI Online — Drag, Drop, Done
        </h1>
        <p className="mt-3 max-w-2xl text-text-muted">
          Compose ScreenGui layouts visually, tweak Scale/Offset, and export
          production-ready Luau in seconds.
        </p>
        <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-muted">
          <Link href="/templates" className="text-cyan-accent hover:underline">
            Browse GUI templates
          </Link>
          <Link href="/plugin" className="text-cyan-accent hover:underline">
            Join Studio plugin waitlist
          </Link>
        </p>
      </header>
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