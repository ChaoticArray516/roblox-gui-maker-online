"use client";

/**
 * SOP-3F-02: EditorShell — 编辑器主壳（重写，消费 context）
 *
 * 组合：EditorProvider → Toolbar + LeftSidebar + Canvas + RightPanel + 底部 Luau 预览。
 * 由 EditorShellLazy 通过 dynamic(ssr:false) 懒加载。CSR 边界。
 * 三栏 + 顶 Toolbar + 底代码预览。零 framer-motion（守 SOP-3X-06）。
 */

import { useState } from "react";
import { generateServerLuau } from "@/lib/luau-generator";
import { EditorProvider, useEditorContext } from "./context/EditorContext";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { Toolbar } from "./components/Toolbar";
import { LeftSidebar, useTabSwitch } from "./components/LeftSidebar";
import { Canvas } from "./components/Canvas";
import { PropertiesPanel } from "./components/PropertiesPanel";
import { CodePanel } from "./components/CodePanel";
import { ExportMenu } from "./components/ExportMenu";
import { OnboardingCard } from "./OnboardingCard";
import { DEVICE_CONFIGS } from "@/lib/editor-utils";

function EditorShellInner() {
  const [tab, setTab] = useTabSwitch("components");
  const { state, notice, draftInfo, actions } = useEditorContext();
  const [codeOpen, setCodeOpen] = useState(false);

  useKeyboardShortcuts();

  const clientCode = actions.exportLuau();
  const serverCode = generateServerLuau(state.elements, state.rootId);
  const jsonCode = actions.exportJSON();
  const guiName = state.rootId ? state.elements[state.rootId]?.name ?? "gui" : "gui";

  const cfg = DEVICE_CONFIGS[state.deviceType];

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col px-4">
      <div className="flex h-[calc(100vh-8rem)] min-h-[560px] flex-col overflow-hidden rounded-2xl border border-glass-border bg-surface">
        <Toolbar onSwitchTab={setTab} />

        {/* ONB-01: 首次进入引导条（localStorage 门控，不遮画布交互） */}
        <OnboardingCard />

        {/* SAVE-02: ?project= 加载降级提示（越权/不存在/解析失败） */}
        {notice && (
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-glass-border bg-surface-raised px-3 py-2 text-xs text-text-muted">
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => actions.setNotice(null)}
              className="rounded-md border border-glass-border px-2 py-0.5 text-text transition-colors hover:bg-surface"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* SOP-3U-07: 草稿恢复提示条（必须用户确认；四级优先最末级，仅在无 ?project=/?template= 时出现） */}
        {draftInfo && (
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-glass-border bg-surface-raised px-3 py-2 text-xs text-text-muted">
            <span>
              {(() => {
                const t = draftInfo.savedAt ? new Date(draftInfo.savedAt) : null;
                const hhmm =
                  t && !Number.isNaN(t.getTime())
                    ? `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`
                    : null;
                return hhmm
                  ? `Restore your unsaved edits from ${hhmm}?`
                  : "Restore your unsaved edits?";
              })()}
            </span>
            <span className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => actions.restoreDraft()}
                className="rounded-md bg-brand-500 px-2 py-0.5 font-semibold text-white transition-colors hover:bg-brand-400"
              >
                Restore
              </button>
              <button
                type="button"
                onClick={() => actions.discardDraft()}
                className="rounded-md border border-glass-border px-2 py-0.5 text-text transition-colors hover:bg-surface"
              >
                Discard
              </button>
            </span>
          </div>
        )}

        {/* 画布上方固定栏：设备信息 + 缩放控制 */}
        <div className="flex h-10 shrink-0 items-center justify-between border-b border-glass-border bg-surface px-3">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="font-medium text-text">{cfg.label}</span>
            <span>·</span>
            <span>{cfg.width}×{cfg.height}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => actions.setZoom(Math.max(0.1, state.zoom - 0.1))}
              className="rounded-md border border-glass-border bg-surface px-2 py-1 text-xs text-text-muted transition-colors hover:bg-surface-raised hover:text-text"
            >
              −
            </button>
            <span className="w-10 text-center text-xs text-text-muted">{Math.round(state.zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => actions.setZoom(Math.min(3, state.zoom + 0.1))}
              className="rounded-md border border-glass-border bg-surface px-2 py-1 text-xs text-text-muted transition-colors hover:bg-surface-raised hover:text-text"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => actions.setZoom(1)}
              className="rounded-md border border-glass-border bg-surface px-2 py-1 text-xs text-text-muted transition-colors hover:bg-surface-raised hover:text-text"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <LeftSidebar activeTab={tab} onSwitchTab={setTab} />
          <Canvas />
          <aside className="w-64 shrink-0 overflow-auto border-l border-glass-border bg-surface">
            <PropertiesPanel />
          </aside>
        </div>
      </div>

      {/* 底部 Luau 预览 */}
      <div className="mt-4 flex flex-col overflow-hidden rounded-2xl border border-glass-border bg-surface">
        <div className="flex items-center justify-between border-b border-glass-border px-4 py-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">Luau Preview</span>
          <div className="flex items-center gap-2">
            <ExportMenu
              guiName={guiName}
              clientCode={clientCode}
              serverCode={serverCode}
              jsonCode={jsonCode}
              elements={state.elements}
              rootId={state.rootId}
            />
            <button
              type="button"
              onClick={() => setCodeOpen((o) => !o)}
              className="text-xs font-semibold uppercase tracking-wide text-text-muted transition-colors hover:text-text"
            >
              {codeOpen ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        {codeOpen && (
          <div className="h-56">
            <CodePanel clientCode={clientCode} serverCode={serverCode} />
          </div>
        )}
      </div>
    </div>
  );
}

export function EditorShell() {
  return (
    <EditorProvider>
      <EditorShellInner />
    </EditorProvider>
  );
}
