"use client";

/**
 * EditorShellLazy — 编辑器懒加载 wrapper（Client Component）
 *
 * Next.js 16 起 `next/dynamic` 的 `ssr: false` 不允许在 Server Component 中调用，
 * 必须在 Client Component 内使用。本组件是薄 wrapper：声明 "use client" 后用
 * dynamic(ssr:false) 懒加载 EditorShell，加载期显示 EditorSkeleton 防 CLS。
 *
 * 这样 page.tsx 保持 Server Component（静态 H1/intro/<noscript>/<EditorJsonLd> 在 SSR），
 * 仅这一层 wrapper + EditorShell 是 CSR 边界。满足 `_refs` SEO_TECH_SPEC.md §2.4。
 */

import dynamic from "next/dynamic";
import { EditorSkeleton } from "./EditorSkeleton";

const EditorShell = dynamic(
  () => import("./EditorShell").then((m) => m.EditorShell),
  { ssr: false, loading: () => <EditorSkeleton /> },
);

export function EditorShellLazy() {
  return <EditorShell />;
}
