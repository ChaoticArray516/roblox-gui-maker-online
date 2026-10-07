"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TEMPLATES } from "@/lib/templates";

/** 首页精选模板（6 张，选图质量最好的） */
const FEATURED_SLUGS = [
  "rpg-inventory",
  "shop-ui",
  "fps-hud",
  "main-menu",
  "simulator-hud",
  "settings",
] as const;

export function HomepageToolIsland() {
  const router = useRouter();
  const [slug, setSlug] = useState<string>(FEATURED_SLUGS[0]);
  const [prompt, setPrompt] = useState("");

  function start() {
    // ① 用户若输入了 prompt，暂存到 sessionStorage 供编辑器 AI 面板预填
    //    （SOP-3V-14 E9：AIGenerator mount 时读取并清除，闭环已接通）
    if (prompt.trim()) {
      try {
        sessionStorage.setItem("homepage_ai_prompt", prompt.trim());
      } catch {}
    }
    // ② 携 ?template= 跳编辑器（useEditorState.ts 已消费该参数，零编辑器改造）
    router.push(`/editor?template=${slug}`);
  }

  return (
    <div className="rounded-2xl border border-glass-border bg-surface p-6">
      <p className="text-sm font-medium text-text-muted">1. Pick a template</p>
      <div
        role="radiogroup"
        aria-label="Choose a GUI template"
        className="mt-2 grid grid-cols-3 gap-2"
      >
        {FEATURED_SLUGS.map((s) => {
          const t = TEMPLATES[s];
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={slug === s}
              onClick={() => setSlug(s)}
              className={cn(
                "rounded-lg border p-2 text-xs text-text transition-colors hover:border-cyan-accent/40",
                slug === s
                  ? "border-brand-500 bg-brand-500/10"
                  : "border-glass-border",
              )}
            >
              {t.name}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-sm font-medium text-text-muted">
        2. Describe your UI (optional)
      </p>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
        placeholder="e.g. A cyberpunk shop UI with glow effects and a buy button"
        className="mt-2 w-full rounded-lg border border-glass-border bg-surface-raised p-3 text-sm text-text placeholder:text-text-muted"
      />

      <button
        type="button"
        onClick={start}
        className={cn(buttonVariants({ size: "lg" }), "mt-4 w-full")}
      >
        Start Creating Free
      </button>
      <p className="mt-2 text-center text-xs text-text-muted">
        Free · No login required · 50 free credits
      </p>
    </div>
  );
}
