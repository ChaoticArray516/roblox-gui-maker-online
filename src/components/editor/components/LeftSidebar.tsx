"use client";

/**
 * SOP-3F-04/06/11: 左侧栏 — 三 tab（Components / Hierarchy / AI）
 *
 * 切换 tab 由内部状态管理；Toolbar 的 AI 按钮通过 onSwitchTab 回调切换。
 */

import { useState, useEffect } from "react";
import { Box, Layers, Sparkles } from "lucide-react";
import { ComponentsTab } from "./ComponentsTab";
import { HierarchyTab } from "./HierarchyTab";
import { AIPanel } from "./AIPanel";

type Tab = "components" | "hierarchy" | "ai";

export function LeftSidebar({ activeTab, onSwitchTab }: { activeTab: Tab; onSwitchTab: (t: Tab) => void }) {
  const tabs: { id: Tab; icon: typeof Box; label: string }[] = [
    { id: "components", icon: Box, label: "Components" },
    { id: "hierarchy", icon: Layers, label: "Hierarchy" },
    { id: "ai", icon: Sparkles, label: "AI" },
  ];

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-glass-border bg-surface">
      {/* Tab bar */}
      <div className="flex border-b border-glass-border">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSwitchTab(t.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${active ? "border-b-2 border-brand-500 text-text" : "text-text-muted hover:text-text"}`}
            >
              <Icon className="size-4" />
              {t.label}
            </button>
          );
        })}
      </div>
      {/* Tab content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "components" && <ComponentsTab />}
        {activeTab === "hierarchy" && <HierarchyTab />}
        {activeTab === "ai" && <AIPanel />}
      </div>
    </aside>
  );
}

/** Hook: 监听全局 editor-switch-tab 事件（Toolbar AI 按钮用） */
export function useTabSwitch(initial: Tab = "components") {
  const [tab, setTab] = useState<Tab>(initial);
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as Tab;
      if (detail) setTab(detail);
    };
    window.addEventListener("editor-switch-tab", handler);
    return () => window.removeEventListener("editor-switch-tab", handler);
  }, []);
  return [tab, setTab] as const;
}
