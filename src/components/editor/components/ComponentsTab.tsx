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
  Maximize2, RectangleHorizontal, Scaling, Hand, Video, Box, Layers,
  MapPin, BoxSelect, Circle, Timer, PanelTop, PanelLeft, SlidersHorizontal,
  Bell, Play, Rows3,
} from "lucide-react";
import {
  OBJECT_COMPONENTS, EFFECTS_COMPONENTS, CONSTRAINTS_COMPONENTS, INTERACTIVE_COMPONENTS,
  MEDIA_3D_COMPONENTS, WORLD_COMPONENTS, ENHANCED_EFFECTS_COMPONENTS,
  INTERACTIVE_COMPOSITE_COMPONENTS,
  type ComponentItem, type GUIElementType, getDefaultProperties, isEffectLike,
} from "@/lib/types";
import { DEVICE_CONFIGS } from "@/lib/editor-utils";
import { useEditorContext } from "../context/EditorContext";

const ICON_MAP: Record<string, typeof Monitor> = {
  Monitor, Square, Type, MousePointerClick, TextCursor, Image, ImagePlus, Scroll,
  Radius, Palette, List, LayoutGrid, Move,
  Maximize2, RectangleHorizontal, Scaling, Hand, Video, Box, Layers,
  MapPin, BoxSelect, Circle, Timer, PanelTop, PanelLeft, SlidersHorizontal,
  Bell, Play, Rows3,
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
    const defaults = getDefaultProperties(type);

    // 效果/约束类组件（UICorner/UIGradient/UIListLayout/UIGridLayout/UIPadding +
    // SOP-3I-02 约束 / SOP-3I-03 交互 / SOP-3I-05 Selection* / SOP-3I-06 增强效果）
    // 加为选中元素子级，无需落点（它们无 position/size）。
    if (isEffectLike(type)) {
      // SOP-3I-06 修复：effect 不应挂到另一个 effect 下（effect 无子级渲染，会导致生成器跳过）。
      // 若当前选中本身就是 effect-like，沿 parentId 上溯到第一个非 effect 的可视容器，否则用 rootId。
      let targetId = state.selectedId ?? state.rootId;
      let probe = targetId ? state.elements[targetId] : null;
      while (probe && isEffectLike(probe.type) && probe.parentId) {
        probe = state.elements[probe.parentId] ?? null;
      }
      if (probe && !isEffectLike(probe.type)) {
        targetId = probe.id;
      } else {
        targetId = state.rootId;
      }
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
      <Section title="Constraints" items={CONSTRAINTS_COMPONENTS} onAdd={handleAdd} defaultOpen={false} />
      <Section title="Interactive" items={INTERACTIVE_COMPONENTS} onAdd={handleAdd} defaultOpen={false} />
      <Section title="Media & 3D" items={MEDIA_3D_COMPONENTS} onAdd={handleAdd} defaultOpen={false} />
      <Section title="World Space" items={WORLD_COMPONENTS} onAdd={handleAdd} defaultOpen={false} />
      <Section title="Enhanced Effects" items={ENHANCED_EFFECTS_COMPONENTS} onAdd={handleAdd} defaultOpen={false} />
      <Section title="Interactive Composite" items={INTERACTIVE_COMPOSITE_COMPONENTS} onAdd={handleAdd} defaultOpen={false} />
      <p className="mt-1 text-xs text-text-muted">Drag a component onto the canvas, or click to add.</p>
    </div>
  );
}
