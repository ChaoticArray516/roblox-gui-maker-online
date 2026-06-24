"use client";

/**
 * SOP-3F-07: 属性面板 — 选中元素的完整属性编辑
 *
 * 分组：Layout / Appearance / Text / Container / Action / ZIndex
 * 按 isVisualElement/isTextElement/isUIEffect 条件渲染对应分组。
 * 消费 useEditorContext.actions.updateElement。
 */

import { Trash2, MousePointerClick, Copy } from "lucide-react";
import { useEditorContext } from "../context/EditorContext";
import {
  isVisualElement, isTextElement, isContainerElement, isUIEffect,
  ROBLOX_FONTS, type ElementProperties,
} from "@/lib/types";
import { color3ToHex, hexToColor3 } from "@/lib/editor-utils";
import { PropertySection, Label, NumInput, TextInput, SelectInput } from "./PropertySection";

function ColorInput({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value.slice(0, 7)}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-10 rounded-md border border-glass-border bg-surface-raised"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-glass-border bg-surface-raised px-2 py-1.5 text-sm text-text"
      />
    </div>
  );
}

export function PropertiesPanel() {
  const { state, actions } = useEditorContext();
  const el = state.selectedId ? state.elements[state.selectedId] : null;

  if (!el) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-6 text-text-muted">
        <MousePointerClick className="size-6" />
        <p className="text-xs">Select an element to edit its properties.</p>
      </div>
    );
  }

  const p = el.properties;
  const update = (patch: Partial<ElementProperties>) => {
    actions.updateElement(el.id, { properties: { ...p, ...patch } });
  };
  const visual = isVisualElement(el.type);
  const text = isTextElement(el.type);
  const container = isContainerElement(el.type);
  const effect = isUIEffect(el.type);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-glass-border px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text">{el.name}</p>
          <p className="text-xs text-text-muted">{el.type}</p>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => actions.duplicateElement(el.id)} className="rounded p-1 text-text-muted hover:text-text" aria-label="Duplicate">
            <Copy className="size-3.5" />
          </button>
          {el.type !== "ScreenGui" && (
            <button type="button" onClick={() => actions.removeElement(el.id)} className="rounded p-1 text-text-muted hover:text-destructive" aria-label="Delete">
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Name */}
      <div className="border-b border-glass-border px-3 py-2">
        <Label>Name</Label>
        <TextInput value={el.name} onChange={(v) => actions.updateElement(el.id, { name: v })} />
      </div>

      {visual && (
        <PropertySection title="Layout">
          <Label>Position (Scale X / Offset X / Scale Y / Offset Y)</Label>
          <div className="grid grid-cols-4 gap-1">
            <NumInput value={p.position.scaleX} onChange={(v) => update({ position: { ...p.position, scaleX: v } })} />
            <NumInput value={p.position.offsetX} onChange={(v) => update({ position: { ...p.position, offsetX: v } })} />
            <NumInput value={p.position.scaleY} onChange={(v) => update({ position: { ...p.position, scaleY: v } })} />
            <NumInput value={p.position.offsetY} onChange={(v) => update({ position: { ...p.position, offsetY: v } })} />
          </div>
          <Label>Size (Scale X / Offset X / Scale Y / Offset Y)</Label>
          <div className="grid grid-cols-4 gap-1">
            <NumInput value={p.size.scaleX} onChange={(v) => update({ size: { ...p.size, scaleX: v } })} />
            <NumInput value={p.size.offsetX} onChange={(v) => update({ size: { ...p.size, offsetX: v } })} />
            <NumInput value={p.size.scaleY} onChange={(v) => update({ size: { ...p.size, scaleY: v } })} />
            <NumInput value={p.size.offsetY} onChange={(v) => update({ size: { ...p.size, offsetY: v } })} />
          </div>
          <Label>Anchor Point (X / Y)</Label>
          <div className="grid grid-cols-2 gap-1">
            <NumInput value={p.anchorPoint.x} step={0.1} onChange={(v) => update({ anchorPoint: { ...p.anchorPoint, x: v } })} />
            <NumInput value={p.anchorPoint.y} step={0.1} onChange={(v) => update({ anchorPoint: { ...p.anchorPoint, y: v } })} />
          </div>
        </PropertySection>
      )}

      {visual && (
        <PropertySection title="Appearance">
          <Label>Background Color</Label>
          <ColorInput value={color3ToHex(p.backgroundColor3)} onChange={(hex) => update({ backgroundColor3: hexToColor3(hex) })} />
          <Label>Transparency ({p.backgroundTransparency.toFixed(2)})</Label>
          <input type="range" min={0} max={1} step={0.05} value={p.backgroundTransparency} onChange={(e) => update({ backgroundTransparency: Number(e.target.value) })} className="w-full" />
          <Label>Corner Radius</Label>
          <NumInput value={p.cornerRadius} onChange={(v) => update({ cornerRadius: v })} />
        </PropertySection>
      )}

      {effect && el.type === "UICorner" && (
        <PropertySection title="Corner">
          <Label>CornerRadius</Label>
          <NumInput value={p.cornerRadius} onChange={(v) => update({ cornerRadius: v })} />
        </PropertySection>
      )}

      {effect && el.type === "UIGradient" && (
        <PropertySection title="Gradient">
          <Label>Color 1</Label>
          <ColorInput value={color3ToHex(p.gradientColor1 ?? { r: 0.4, g: 0.4, b: 0.9 })} onChange={(hex) => update({ gradientColor1: hexToColor3(hex) })} />
          <Label>Color 2</Label>
          <ColorInput value={color3ToHex(p.gradientColor2 ?? { r: 0.5, g: 0.4, b: 0.9 })} onChange={(hex) => update({ gradientColor2: hexToColor3(hex) })} />
          <Label>Rotation</Label>
          <NumInput value={p.gradientRotation ?? 0} onChange={(v) => update({ gradientRotation: v })} />
        </PropertySection>
      )}

      {effect && (el.type === "UIListLayout" || el.type === "UIGridLayout" || el.type === "UIPadding") && (
        <PropertySection title="Layout">
          {el.type === "UIGridLayout" && (
            <>
              <Label>Cell Size (W / H)</Label>
              <div className="grid grid-cols-2 gap-1">
                <NumInput value={p.cellSize?.x ?? 100} onChange={(v) => update({ cellSize: { x: v, y: p.cellSize?.y ?? 100 } })} />
                <NumInput value={p.cellSize?.y ?? 100} onChange={(v) => update({ cellSize: { x: p.cellSize?.x ?? 100, y: v } })} />
              </div>
            </>
          )}
          <Label>Padding</Label>
          <NumInput value={p.padding} onChange={(v) => update({ padding: v })} />
        </PropertySection>
      )}

      {text && (
        <PropertySection title="Text">
          <Label>Text</Label>
          <textarea
            value={p.text}
            onChange={(e) => update({ text: e.target.value })}
            rows={2}
            className="w-full rounded-md border border-glass-border bg-surface-raised px-2 py-1.5 text-sm text-text"
          />
          <Label>Font</Label>
          <SelectInput value={p.font} options={ROBLOX_FONTS as unknown as string[]} onChange={(v) => update({ font: v })} />
          <Label>Text Size</Label>
          <NumInput value={p.textSize} onChange={(v) => update({ textSize: v })} />
          <Label>Text Color</Label>
          <ColorInput value={color3ToHex(p.textColor3)} onChange={(hex) => update({ textColor3: hexToColor3(hex) })} />
        </PropertySection>
      )}

      {container && (
        <PropertySection title="Container">
          <Label>Layout</Label>
          <SelectInput value={p.layout} options={["none", "list", "grid"] as const} onChange={(v) => update({ layout: v })} />
          <Label>Padding</Label>
          <NumInput value={p.padding} onChange={(v) => update({ padding: v })} />
        </PropertySection>
      )}

      {(el.type === "TextButton" || el.type === "ImageButton") && (
        <PropertySection title="Action">
          <Label>OnClick (Luau)</Label>
          <textarea
            value={p.onClick}
            onChange={(e) => update({ onClick: e.target.value })}
            rows={3}
            placeholder="print('Button clicked!')"
            className="w-full rounded-md border border-glass-border bg-surface-raised px-2 py-1.5 font-mono text-xs text-text"
          />
        </PropertySection>
      )}

      <PropertySection title="Z-Index">
        <NumInput value={el.zIndex} onChange={(v) => actions.updateElement(el.id, { zIndex: v })} />
      </PropertySection>
    </div>
  );
}
