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

function EditorShellInner() {
  const [tab, setTab] = useTabSwitch("components");
  const { state, actions } = useEditorContext();
  const [codeOpen, setCodeOpen] = useState(true);

  useKeyboardShortcuts();

  const clientCode = actions.exportLuau();
  const serverCode = generateServerLuau(state.elements, state.rootId);
  const jsonCode = actions.exportJSON();
  const guiName = state.rootId ? state.elements[state.rootId]?.name ?? "gui" : "gui";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-6">
      <div className="flex h-[70vh] min-h-[480px] flex-col overflow-hidden rounded-2xl border border-glass-border bg-surface">
        <Toolbar onSwitchTab={setTab} />
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
          <div className="h-64">
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
