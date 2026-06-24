"use client";

/**
 * SOP-3F-02: 编辑器顶部工具栏
 *
 * Logo + 撤销/重做 | 设备切换 + Preview + AI | 新建/模板/导入JSON/导出JSON/导出Luau
 * 消费 useEditorContext。纯 CSS 动画（无 framer-motion，守 SOP-3X-06）。
 */

import {
  Undo2,
  Redo2,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  EyeOff,
  Plus,
  LayoutTemplate,
  Upload,
  Download,
  Save,
  FileCode,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { useEditorContext } from "../context/EditorContext";
import { type DeviceType } from "@/lib/types";

const DEVICES: { type: DeviceType; icon: typeof Monitor; label: string }[] = [
  { type: "desktop", icon: Monitor, label: "Desktop" },
  { type: "tablet", icon: Tablet, label: "Tablet" },
  { type: "mobile", icon: Smartphone, label: "Mobile" },
];

export function Toolbar({ onSwitchTab }: { onSwitchTab: (tab: "components" | "hierarchy" | "ai") => void }) {
  const { state, actions } = useEditorContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => actions.importJSON(String(reader.result));
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleExportLuau = () => {
    const code = actions.exportLuau();
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gui.lua";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const json = actions.exportJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gui.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveJSON = () => {
    const json = actions.exportJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "project.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="flex h-12 items-center justify-between gap-2 border-b border-glass-border bg-surface px-3">
      {/* 左：Logo + 撤销/重做 */}
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-brand-500 font-bold text-white">R</span>
          <span className="hidden text-sm font-semibold text-text sm:inline">Roblox GUI Maker</span>
        </Link>
        <span className="mx-1 h-5 w-px bg-glass-border" />
        <button
          type="button"
          onClick={actions.undo}
          disabled={!actions.canUndo}
          aria-label="Undo"
          className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-raised hover:text-text disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <Undo2 className="size-4" />
        </button>
        <button
          type="button"
          onClick={actions.redo}
          disabled={!actions.canRedo}
          aria-label="Redo"
          className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-raised hover:text-text disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <Redo2 className="size-4" />
        </button>
      </div>

      {/* 中：设备切换 + Preview + AI */}
      <div className="flex items-center gap-2">
        <div className="flex rounded-lg border border-glass-border bg-surface-raised p-0.5">
          {DEVICES.map((d) => {
            const Icon = d.icon;
            const active = state.deviceType === d.type;
            return (
              <button
                key={d.type}
                type="button"
                onClick={() => actions.setDeviceType(d.type)}
                aria-label={d.label}
                aria-pressed={active}
                className={`rounded-md p-1.5 transition-colors ${active ? "bg-brand-500 text-white" : "text-text-muted hover:text-text"}`}
              >
                <Icon className="size-4" />
              </button>
            );
          })}
        </div>
        <span className="h-5 w-px bg-glass-border" />
        <button
          type="button"
          onClick={actions.togglePreview}
          aria-label="Toggle preview"
          aria-pressed={state.previewMode}
          className={`rounded-md p-1.5 transition-colors ${state.previewMode ? "bg-cyan-accent/20 text-cyan-accent" : "text-text-muted hover:bg-surface-raised hover:text-text"}`}
        >
          {state.previewMode ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
        <span className="h-5 w-px bg-glass-border" />
        <button
          type="button"
          onClick={() => onSwitchTab("ai")}
          aria-label="AI generate"
          className="flex items-center gap-1.5 rounded-md bg-cyan-accent/10 px-2.5 py-1.5 text-sm font-medium text-cyan-accent transition-colors hover:bg-cyan-accent/20"
        >
          <Sparkles className="size-4" />
          <span className="hidden sm:inline">AI</span>
        </button>
      </div>

      {/* 右：新建/模板/导入/导出 */}
      <div className="flex items-center gap-1">
        <Link
          href="/editor"
          aria-label="New"
          className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-raised hover:text-text"
        >
          <Plus className="size-4" />
        </Link>
        <Link
          href="/templates"
          aria-label="Templates"
          className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-raised hover:text-text"
        >
          <LayoutTemplate className="size-4" />
        </Link>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Import JSON"
          className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-raised hover:text-text"
        >
          <Upload className="size-4" />
        </button>
        <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImport} className="hidden" />
        <button
          type="button"
          onClick={handleExportJSON}
          aria-label="Export JSON"
          className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-raised hover:text-text"
        >
          <Download className="size-4" />
        </button>
        <button
          type="button"
          onClick={handleSaveJSON}
          aria-label="Save JSON"
          className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-raised hover:text-text"
        >
          <Save className="size-4" />
        </button>
        <button
          type="button"
          onClick={handleExportLuau}
          aria-label="Export Luau"
          className="flex items-center gap-1.5 rounded-md bg-brand-500 px-2.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-400"
        >
          <FileCode className="size-4" />
          <span className="hidden sm:inline">Luau</span>
        </button>
      </div>
    </header>
  );
}
