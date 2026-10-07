"use client";

/**
 * SOP-3I-08: Vector3 编辑器 — 源 editor-component-extensions.md §4.6 (行 5520–5552)
 *
 * X/Y/Z 三 NumberInput（step=0.1）。用于 ViewportFrame 的 lightDirection / BillboardGui 的 studsOffset 等。
 */

import { memo } from "react";
import type { Vector3 } from "@/lib/types";

interface Props {
  value: Vector3;
  onChange: (value: Vector3) => void;
  disabled?: boolean;
}

export const Vector3Editor = memo(function Vector3Editor({ value, onChange, disabled = false }: Props) {
  const axis = (key: keyof Vector3, label: string) => (
    <div className="flex items-center gap-1">
      <span className="min-w-[16px] text-right text-[10px] text-text-muted">{label}</span>
      <input
        type="number"
        value={value[key]}
        step={0.1}
        disabled={disabled}
        onChange={(e) => onChange({ ...value, [key]: Number(e.target.value) })}
        className="w-full min-w-0 rounded border border-glass-border bg-surface px-2 py-1 font-mono text-xs text-text"
      />
    </div>
  );

  return (
    <div className="flex gap-2">
      {axis("x", "X")}
      {axis("y", "Y")}
      {axis("z", "Z")}
    </div>
  );
});
