"use client";

/**
 * SOP-3I-08: EventBinding 编辑器 — 源 editor-component-extensions.md §4.5 (行 5062–5228)
 *
 * 头部绑定状态点（绿=已绑定 / 红=无脚本）+ Edit/Cancel 切换 + textarea 编辑 Luau 脚本
 * + Save/Clear + 折叠预览（截断 80 字符）。
 */

import { memo, useCallback, useState } from "react";
import type { EventBinding } from "@/lib/types";

interface Props {
  value: EventBinding;
  onChange: (value: EventBinding) => void;
  availableEvents?: string[];
  disabled?: boolean;
}

export const EventBindingEditor = memo(function EventBindingEditor({ value, onChange, disabled = false }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [scriptDraft, setScriptDraft] = useState(value.script);

  const handleSave = useCallback(() => {
    onChange({ ...value, script: scriptDraft });
    setIsEditing(false);
  }, [onChange, value, scriptDraft]);

  const preview = value.script.length > 80 ? `${value.script.substring(0, 80)}...` : value.script;

  return (
    <div className="overflow-hidden rounded-md border border-glass-border bg-surface-raised">
      <div className="flex items-center justify-between bg-surface px-3 py-2">
        <div className="flex items-center gap-2">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: value.script ? "#22c55e" : "#ef4444" }}
          />
          <span className="text-xs text-text-muted">{value.script ? "Script bound" : "No script"}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setScriptDraft(value.script);
            setIsEditing(!isEditing);
          }}
          disabled={disabled}
          className="rounded px-2.5 py-0.5 text-xs text-white disabled:opacity-50"
          style={{ backgroundColor: isEditing ? "#dc2626" : "#2563eb" }}
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      {isEditing && (
        <div className="p-2">
          {value.params.length > 0 && (
            <div className="mb-1 text-[10px] text-text-muted">
              Available params: {value.params.join(", ")}
            </div>
          )}
          <textarea
            value={scriptDraft}
            onChange={(e) => setScriptDraft(e.target.value)}
            rows={4}
            placeholder="-- Enter Luau script here\nprint('Hello!')"
            className="w-full resize-y rounded border border-glass-border bg-surface p-2 font-mono text-xs text-text"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setScriptDraft("");
                onChange({ ...value, script: "" });
              }}
              className="rounded px-3 py-1 text-xs text-white"
              style={{ backgroundColor: "#475569" }}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded px-3 py-1 text-xs text-white"
              style={{ backgroundColor: "#16a34a" }}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {!isEditing && value.script && (
        <pre className="m-0 max-h-[60px] overflow-hidden border-t border-glass-border bg-surface p-2 font-mono text-[10px] text-text-muted">
          {preview}
        </pre>
      )}
    </div>
  );
});
