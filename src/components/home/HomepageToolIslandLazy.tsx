"use client";

import dynamic from "next/dynamic";
import { ToolIslandSkeleton } from "./ToolIslandSkeleton";

// Next 16 要求 ssr:false 必须在 Client Component 内调用 —— 本文件为薄壳 wrapper
// （模式对齐 src/components/editor/EditorShellLazy.tsx）
export const HomepageToolIslandLazy = dynamic(
  () => import("./HomepageToolIsland").then((m) => m.HomepageToolIsland),
  { ssr: false, loading: () => <ToolIslandSkeleton /> },
);
