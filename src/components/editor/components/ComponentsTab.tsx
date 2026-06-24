"use client";

/**
 * SOP-3F-04: 组件面板 — 12 基础 + 5 效果，拖拽入画布
 *
 * 原生 HTML5 DnD（setData application/x-rgm-type），Canvas 的 drop 目标读取。
 * 消费 useEditorContext.actions.addElement。双击也可添加。
 */

import { useState } from "react";
import {
  Monitor, Square, Type, MousePointerClick, TextCursor, Image, ImagePlus, Scroll,
  Radius, Palette, List, LayoutGrid, Move, ChevronDown, ChevronRight,
} from "lucide-react";
import { OBJECT_COMPONENTS, EFFECTS_COMPONENTS, type ComponentItem, type GUIElementType, getDefaultProperties, isUIEffect } from "@/lib/types";
import { DEVICE_CONFIGS } from "@/lib/editor-utils";
import { useEditorContext } from "../context/EditorContext";

const ICON_MAP: Record<string, typeof Monitor> = {
  Monitor, Square, Type, MousePointerClick, TextCursor, Image, ImagePlus, Scroll,
  Radius, Palette, List, LayoutGrid, Move,
};

function ComponentRow({ item, onAdd }: { item: ComponentItem; onAdd: (t: GUIElementType) => void }) {
  const Icon = ICON_MAP[item.icon] ?? Square;
  return (
    <button
      type="button"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/x-rgm-type", item.type);
        e.dataTransfer.effectAllowed = "copy";
      }}
      onClick={() => onAdd(item.type)}
      className="flex w-full cursor-grab items-center gap-2.5 rounded-lg border border-glass-border bg-surface-raised px-2.5 py-2 text-left transition-colors hover:border-brand-400/40 active:cursor-grabbing"
    >
      <Icon className="size-4 shrink-0 text-text-muted" />
      <span className="flex-1">
        <span className="block text-sm font-medium text-text">{item.title}</span>
        <span className="block text-xs text-text-muted">{item.description}</span>
      </span>
    </button>
  );
}

function Section({ title, items, onAdd, defaultOpen }: { title: string; items: readonly ComponentItem[]; onAdd: (t: GUIElementType) => void; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1 py-1 text-xs font-semibold uppercase tracking-wide text-text-muted"
      >
        {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
        {title}
      </button>
      {open && (
        <div className="mt-1 flex flex-col gap-1.5">
          {items.map((it) => (
            <ComponentRow key={it.type} item={it} onAdd={onAdd} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ComponentsTab() {
  const { state, actions } = useEditorContext();
  const cfg = DEVICE_CONFIGS[state.deviceType];

  const handleAdd = (type: GUIElementType) => {
    const targetId = state.selectedId ?? state.rootId;
    const defaults = getDefaultProperties(type);

    // 效果组件（UICorner/UIGradient/UIListLayout/UIGridLayout/UIPadding）加为选中元素子级，
    // 无需落点（它们无 position/size）。
    if (isUIEffect(type)) {
      actions.addElement(type, targetId);
      return;
    }

    // 可视元素：落点为画布中心（减去元素半宽半高），避免堆在 (0,0)。
    const sizePx = {
      x: defaults.size.scaleX * cfg.width + defaults.size.offsetX,
      y: defaults.size.scaleY * cfg.height + defaults.size.offsetY,
    };
    const offsetX = Math.max(0, Math.round((cfg.width - sizePx.x) / 2));
    const offsetY = Math.max(0, Math.round((cfg.height - sizePx.y) / 2));
    actions.addElement(type, state.rootId, {
      properties: { ...defaults, position: { scaleX: 0, offsetX, scaleY: 0, offsetY } },
    });
  };

  return (
    <div className="flex flex-col gap-3 p-3">
      <Section title="Objects" items={OBJECT_COMPONENTS} onAdd={handleAdd} defaultOpen />
      <Section title="Effects & Layout" items={EFFECTS_COMPONENTS} onAdd={handleAdd} defaultOpen={false} />
      <p className="mt-1 text-xs text-text-muted">Drag a component onto the canvas, or click to add.</p>
    </div>
  );
}
