"use client";

/**
 * SOP-3F-02: 编辑器顶部工具栏
 *
 * Logo + 撤销/重做 | 设备切换 + Preview + AI | 新建/模板/导入JSON/导出JSON/导出Luau
 * 消费 useEditorContext。纯 CSS 动画（无 framer-motion，守 SOP-3X-06）。
 * SAVE-01: Save 落库（登录 upsert + toast + 失败回退下载；未登录保持下载）。
 * SAVE-03: 保存状态点（Saving… / Saved · HH:MM）+ 项目名点击改名。
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
import { useEffect, useRef, useState } from "react";
import { useEditorContext } from "../context/EditorContext";
import { type DeviceType } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { currentPathAsNext } from "@/lib/auth-next";

const DEVICES: { type: DeviceType; icon: typeof Monitor; label: string }[] = [
  { type: "desktop", icon: Monitor, label: "Desktop" },
  { type: "tablet", icon: Tablet, label: "Tablet" },
  { type: "mobile", icon: Smartphone, label: "Mobile" },
];

type Toast = {
  msg: string;
  tone: "info" | "success" | "error";
  link?: { href: string; label: string };
} | null;

export function Toolbar({ onSwitchTab }: { onSwitchTab: (tab: "components" | "hierarchy" | "ai") => void }) {
  const { state, projectId, projectName, actions } = useEditorContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // SAVE-01: 登录态（局部读取，同构 AIGenerator 先例，不新加 context 层）
  const [userId, setUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // SAVE-03: 项目名点击改名
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  const showToast = (
    msg: string,
    tone: NonNullable<Toast>["tone"],
    link?: { href: string; label: string },
  ) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ msg, tone, link });
    // 带登录链接的 toast 给用户留点击窗口（3s 太短）
    toastTimerRef.current = setTimeout(() => setToast(null), link ? 8000 : 3000);
  };

  const downloadProject = () => {
    const json = actions.exportJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "project.json";
    a.click();
    URL.revokeObjectURL(url);
  };

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

  // SAVE-01: 未登录 → 下载 + 引导；已登录 → insert/update 落库，失败回退下载
  const handleSave = async () => {
    if (!userId) {
      // SOP-3X-08: 全量自动落库链——存 pending 标记（草稿层 debounce/beforeunload
      // 已持续兜底画布数据），登录回归后由 useEditorState mount 检测自动恢复+落库
      try {
        sessionStorage.setItem("pending_save_v1", "1");
      } catch {
        // 存储不可用静默——下载兜底仍在
      }
      downloadProject();
      showToast("Project downloaded — log in to save it to the cloud.", "info", {
        href: `/auth/login?next=${encodeURIComponent(currentPathAsNext())}`,
        label: "Log in to save",
      });
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const guiJson = JSON.parse(actions.exportJSON());
      if (projectId) {
        const { error } = await supabase
          .from("projects")
          .update({ name: projectName, gui_json: guiJson })
          .eq("id", projectId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("projects")
          .insert({ user_id: userId, name: projectName, gui_json: guiJson })
          .select("id")
          .single();
        if (error) throw error;
        if (data) actions.setProjectId(data.id);
      }
      setSavedAt(new Date());
      actions.clearDraft(); // SOP-3U-07: 落库成功 = 清除时机②
      trackEvent("project_saved", { source: "manual" }); // SOP-3X-05
      showToast("Saved to cloud", "success");
    } catch (e) {
      console.error("Cloud save failed:", e);
      downloadProject();
      showToast("Cloud save failed — downloaded a local copy instead.", "error");
    } finally {
      setSaving(false);
    }
  };

  const commitName = () => {
    actions.setProjectName(nameDraft.trim() || "Untitled GUI");
    setEditingName(false);
  };

  return (
    <header className="flex h-12 items-center justify-between gap-2 border-b border-glass-border bg-surface px-3">
      {/* 左：Logo + 撤销/重做 + 项目名（SAVE-03） */}
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
        <span className="mx-1 hidden h-5 w-px bg-glass-border md:block" />
        {editingName ? (
          <input
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitName();
              if (e.key === "Escape") setEditingName(false);
            }}
            aria-label="Project name"
            className="hidden w-40 rounded-md border border-glass-border bg-surface-raised px-2 py-1 text-xs text-text md:block"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setNameDraft(projectName);
              setEditingName(true);
            }}
            title="Click to rename"
            className="hidden max-w-40 truncate rounded-md px-2 py-1 text-xs text-text-muted transition-colors hover:bg-surface-raised hover:text-text md:block"
          >
            {projectName}
          </button>
        )}
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

      {/* 右：保存状态点（SAVE-03）+ 新建/模板/导入/导出 */}
      <div className="flex items-center gap-1">
        {(saving || savedAt) && (
          <span aria-live="polite" className="mr-1 inline text-[10px] text-text-muted">
            {saving
              ? "Saving…"
              : savedAt
                ? `Saved · ${savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : ""}
          </span>
        )}
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
          onClick={handleSave}
          disabled={saving}
          aria-label="Save project"
          className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-raised hover:text-text disabled:opacity-30"
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

      {/* SAVE-01: toast（轻量自研，固定定位，3 秒自动消失） */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-4 right-4 z-50 rounded-lg border px-4 py-2 text-sm ${
            toast.tone === "success"
              ? "border-cyan-accent/30 bg-surface-raised text-cyan-accent"
              : toast.tone === "error"
                ? "border-red-500/30 bg-surface-raised text-red-300"
                : "border-glass-border bg-surface-raised text-text"
          }`}
        >
          {toast.msg}
          {toast.link && (
            <>
              {" "}
              {/* SOP-3X-08: 整页跳转兜底（OAuth 必须整页，同 AccountMenu 先例） */}
              <a
                href={toast.link.href}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.assign(toast.link!.href);
                }}
                className="font-semibold text-cyan-accent underline"
              >
                {toast.link.label}
              </a>
            </>
          )}
        </div>
      )}
    </header>
  );
}
