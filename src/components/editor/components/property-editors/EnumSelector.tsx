"use client";

/**
 * SOP-3I-08: EnumSelector — 源 editor-component-extensions.md §4.4 (行 4949–5060)
 *
 * 自定义下拉按钮 + 绝对定位选项列表 + 全屏点击外部关闭 overlay。
 * 用于枚举值选择（区别于原生 SelectInput，提供描述说明 + 高亮选中项）。
 */

import { memo, useState } from "react";

interface Props {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
  description?: string;
}

export const EnumSelector = memo(function EnumSelector({ value, options, onChange, disabled = false, description }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex w-full items-center justify-between rounded-md border border-glass-border bg-surface px-3 py-1.5 text-left font-mono text-sm text-text disabled:opacity-60"
      >
        <span>{value}</span>
        <span className="text-[10px] text-text-muted">▾</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[200px] overflow-y-auto rounded-md border border-glass-border bg-surface-raised shadow-lg">
            {options.map((opt) => (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className="cursor-pointer px-3 py-2 font-mono text-xs transition-colors hover:bg-white/5"
                style={{
                  color: opt === value ? "#60a5fa" : undefined,
                  backgroundColor: opt === value ? "rgba(96,165,250,0.1)" : undefined,
                }}
              >
                {opt}
              </div>
            ))}
          </div>
        </>
      )}

      {description && <div className="mt-1 text-[10px] text-text-muted">{description}</div>}
    </div>
  );
});
