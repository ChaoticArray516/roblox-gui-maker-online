"use client";

/**
 * ONB-01: 编辑器首次进入三步引导条。
 *
 * localStorage "onboarded_v1" 门控：未设置时显示，
 * 点「Got it」或任一引导动作后永久消失。
 * ②步显式指路 AI 入口（藏在 Toolbar "AI" 按钮 → 侧栏 tab 两层之后，
 * 是 28/33 注册用户从未用 AI 的可见性元凶）。
 */

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "onboarded_v1";

export function OnboardingCard() {
  // 首渲染一律 null，避免 hydration 不一致；mount 后读 localStorage
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // 隐私模式等场景读不到 localStorage —— 不显示引导条
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setVisible(false);
  };

  const goAiTab = () => {
    window.dispatchEvent(
      new CustomEvent("editor-switch-tab", { detail: "ai" }),
    );
    dismiss();
  };

  return (
    <div
      aria-label="Getting started"
      className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b border-glass-border bg-surface-raised px-3 py-2 text-xs text-text-muted"
    >
      <span className="font-semibold text-text">Get started:</span>
      <span>
        ①{" "}
        <Link
          href="/templates"
          onClick={dismiss}
          className="text-cyan-accent hover:underline"
        >
          Pick a template
        </Link>{" "}
        or drag components from the left panel
      </span>
      <span aria-hidden="true">→</span>
      <span>
        ②{" "}
        <button
          type="button"
          onClick={goAiTab}
          className="text-cyan-accent hover:underline"
        >
          Describe your UI
        </button>{" "}
        (click the &quot;AI&quot; button in the toolbar to open the AI panel)
      </span>
      <span aria-hidden="true">→</span>
      <span>③ Export Luau from the bottom bar</span>
      <button
        type="button"
        onClick={dismiss}
        className="ml-auto rounded-md border border-glass-border px-2 py-0.5 text-text transition-colors hover:bg-surface"
      >
        Got it
      </button>
    </div>
  );
}
