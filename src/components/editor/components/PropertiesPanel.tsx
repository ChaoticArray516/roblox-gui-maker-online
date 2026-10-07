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
  isInteractiveComposite, ROBLOX_FONTS, type ElementProperties, type EventBinding, type Vector3,
} from "@/lib/types";
import { color3ToHex, hexToColor3 } from "@/lib/editor-utils";
import { PropertySection, Label, NumInput, TextInput, SelectInput } from "./PropertySection";
import { ColorSequenceEditor } from "./property-editors/ColorSequenceEditor";
import { NumberSequenceEditor } from "./property-editors/NumberSequenceEditor";
import { EnumSelector } from "./property-editors/EnumSelector";
import { EventBindingEditor } from "./property-editors/EventBindingEditor";
import { Vector3Editor } from "./property-editors/Vector3Editor";

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

      {/* SOP-3I-08: 3I-01→06 新组件专属属性段（使用新值类型编辑器） */}
      <ExtendedComponentProps el={el} p={p} update={update} />

      <PropertySection title="Z-Index">
        <NumInput value={el.zIndex} onChange={(v) => actions.updateElement(el.id, { zIndex: v })} />
      </PropertySection>

      {isInteractiveComposite(el.type) && (
        <CompositePropsSection el={el} p={p} update={update} />
      )}
    </div>
  );
}

/**
 * SOP-3I-08: 3I-01→06 新组件专属属性段 — 使用新值类型编辑器
 * (ColorSequenceEditor / NumberSequenceEditor / EnumSelector / EventBindingEditor / Vector3Editor)。
 * 按 el.type 分组手写（方案 A：不引入 PropertySchema 注册表）。
 */
function ExtendedComponentProps({
  el, p, update,
}: {
  el: { type: string };
  p: ElementProperties;
  update: (patch: Partial<ElementProperties>) => void;
}) {
  const updateEBFull = (key: keyof ElementProperties, eb: EventBinding) => {
    update({ [key]: eb } as Partial<ElementProperties>);
  };
  const updateV3 = (key: keyof ElementProperties, v: Vector3) => {
    update({ [key]: v } as Partial<ElementProperties>);
  };

  // UIStroke（约束类）
  if (el.type === "UIStroke") {
    return (
      <PropertySection title="Stroke">
        <Label>Color</Label>
        <ColorInput value={color3ToHex(p.strokeColor ?? { r: 0, g: 0, b: 0 })} onChange={(hex) => update({ strokeColor: hexToColor3(hex) })} />
        <Label>Thickness</Label>
        <NumInput value={p.strokeThickness ?? 1} onChange={(v) => update({ strokeThickness: v })} />
        <Label>Transparency ({(p.strokeTransparency ?? 0).toFixed(2)})</Label>
        <input type="range" min={0} max={1} step={0.05} value={p.strokeTransparency ?? 0} onChange={(e) => update({ strokeTransparency: Number(e.target.value) })} className="w-full" />
        <Label>Apply Mode</Label>
        <SelectInput value={p.strokeApplyMode ?? "Contextual"} options={["Contextual", "Border", "Inner", "Outline"] as const} onChange={(v) => update({ strokeApplyMode: v })} />
        <Label>Line Join Mode</Label>
        <SelectInput value={p.strokeLineJoinMode ?? "Round"} options={["Round", "Bevel", "Miter"] as const} onChange={(v) => update({ strokeLineJoinMode: v })} />
        <Label>Enabled</Label>
        <SelectInput value={p.strokeEnabled ?? true ? "true" : "false"} options={["true", "false"] as const} onChange={(v) => update({ strokeEnabled: v === "true" })} />
      </PropertySection>
    );
  }

  // UIScale
  if (el.type === "UIScale") {
    return (
      <PropertySection title="Scale">
        <Label>Scale ({(p.scale ?? 1).toFixed(2)})</Label>
        <input type="range" min={0} max={3} step={0.05} value={p.scale ?? 1} onChange={(e) => update({ scale: Number(e.target.value) })} className="w-full" />
      </PropertySection>
    );
  }

  // UIAspectRatioConstraint
  if (el.type === "UIAspectRatioConstraint") {
    return (
      <PropertySection title="Aspect Ratio">
        <Label>Aspect Ratio</Label>
        <NumInput value={p.aspectRatio ?? 1} step={0.1} onChange={(v) => update({ aspectRatio: v })} />
        <Label>Aspect Type</Label>
        <SelectInput value={p.aspectType ?? "FitWithinMaxSize"} options={["FitWithinMaxSize", "ScaleWithParentSize"] as const} onChange={(v) => update({ aspectType: v })} />
        <Label>Dominant Axis</Label>
        <SelectInput value={p.dominantAxis ?? "Width"} options={["Width", "Height"] as const} onChange={(v) => update({ dominantAxis: v })} />
      </PropertySection>
    );
  }

  // UISizeConstraint
  if (el.type === "UISizeConstraint") {
    return (
      <PropertySection title="Size Constraint">
        <Label>Min Size (X / Y)</Label>
        <div className="grid grid-cols-2 gap-1">
          <NumInput value={p.minSize?.x ?? 0} onChange={(v) => update({ minSize: { x: v, y: p.minSize?.y ?? 0 } })} />
          <NumInput value={p.minSize?.y ?? 0} onChange={(v) => update({ minSize: { x: p.minSize?.x ?? 0, y: v } })} />
        </div>
        <Label>Max Size (X / Y)</Label>
        <div className="grid grid-cols-2 gap-1">
          <NumInput value={p.maxSize?.x ?? 0} onChange={(v) => update({ maxSize: { x: v, y: p.maxSize?.y ?? 0 } })} />
          <NumInput value={p.maxSize?.y ?? 0} onChange={(v) => update({ maxSize: { x: p.maxSize?.x ?? 0, y: v } })} />
        </div>
      </PropertySection>
    );
  }

  // UITextSizeConstraint
  if (el.type === "UITextSizeConstraint") {
    return (
      <PropertySection title="Text Size Constraint">
        <Label>Min Text Size</Label>
        <NumInput value={p.minTextSize ?? 1} onChange={(v) => update({ minTextSize: v })} />
        <Label>Max Text Size</Label>
        <NumInput value={p.maxTextSize ?? 100} onChange={(v) => update({ maxTextSize: v })} />
      </PropertySection>
    );
  }

  // UIDragDetector（交互类）— EventBinding 编辑器
  if (el.type === "UIDragDetector") {
    return (
      <PropertySection title="Drag Detector">
        <Label>Drag Style</Label>
        <EnumSelector value={p.dragStyle ?? "TranslatePlane"} options={["TranslateLine", "TranslateView", "TranslatePlane", "Rotate", "Scriptable"]} onChange={(v) => update({ dragStyle: v as ElementProperties["dragStyle"] })} />
        <Label>Response Style</Label>
        <EnumSelector value={p.responseStyle ?? "Linear"} options={["Linear", "Constant", "Acceleration"]} onChange={(v) => update({ responseStyle: v as ElementProperties["responseStyle"] })} />
        <Label>Min Drag Distance</Label>
        <NumInput value={p.minDragDistance ?? 0} onChange={(v) => update({ minDragDistance: v })} />
        <Label>Max Drag Distance (0 = ∞)</Label>
        <NumInput value={p.maxDragDistance ?? 0} onChange={(v) => update({ maxDragDistance: v })} />
        <Label>Enabled</Label>
        <SelectInput value={p.dragEnabled ?? true ? "true" : "false"} options={["true", "false"] as const} onChange={(v) => update({ dragEnabled: v === "true" })} />
        <Label>OnDragStart</Label>
        <EventBindingEditor value={p.onDragStart ?? { script: "", params: ["inputPosition"] }} onChange={(eb) => updateEBFull("onDragStart", eb)} />
        <Label>OnDragMove</Label>
        <EventBindingEditor value={p.onDragMove ?? { script: "", params: ["inputPosition", "delta"] }} onChange={(eb) => updateEBFull("onDragMove", eb)} />
        <Label>OnDragEnd</Label>
        <EventBindingEditor value={p.onDragEnd ?? { script: "", params: ["inputPosition"] }} onChange={(eb) => updateEBFull("onDragEnd", eb)} />
      </PropertySection>
    );
  }

  // VideoFrame
  if (el.type === "VideoFrame") {
    return (
      <PropertySection title="Video">
        <Label>Video Asset ID</Label>
        <TextInput value={p.video ?? ""} onChange={(v) => update({ video: v })} placeholder="rbxassetid://..." />
        <Label>Playing</Label>
        <SelectInput value={p.playing ? "true" : "false"} options={["true", "false"] as const} onChange={(v) => update({ playing: v === "true" })} />
        <Label>Looped</Label>
        <SelectInput value={p.looped ? "true" : "false"} options={["true", "false"] as const} onChange={(v) => update({ looped: v === "true" })} />
        <Label>Volume ({(p.volume ?? 1).toFixed(2)})</Label>
        <input type="range" min={0} max={1} step={0.05} value={p.volume ?? 1} onChange={(e) => update({ volume: Number(e.target.value) })} className="w-full" />
        <Label>Playback Speed</Label>
        <NumInput value={p.playbackSpeed ?? 1} step={0.1} onChange={(v) => update({ playbackSpeed: v })} />
      </PropertySection>
    );
  }

  // ViewportFrame — Vector3 编辑器（灯光方向）
  if (el.type === "ViewportFrame") {
    return (
      <PropertySection title="Viewport Lighting">
        <Label>Ambient Color</Label>
        <ColorInput value={color3ToHex(p.ambient ?? { r: 0.4, g: 0.4, b: 0.4 })} onChange={(hex) => update({ ambient: hexToColor3(hex) })} />
        <Label>Light Color</Label>
        <ColorInput value={color3ToHex(p.lightColor ?? { r: 1, g: 1, b: 1 })} onChange={(hex) => update({ lightColor: hexToColor3(hex) })} />
        <Label>Light Direction (X / Y / Z)</Label>
        <Vector3Editor value={p.lightDirection ?? { x: -1, y: -1, z: -1 }} onChange={(v) => updateV3("lightDirection", v)} />
      </PropertySection>
    );
  }

  // CanvasGroup
  if (el.type === "CanvasGroup") {
    return (
      <PropertySection title="Canvas Group">
        <Label>Group Color</Label>
        <ColorInput value={color3ToHex(p.groupColor3 ?? { r: 1, g: 1, b: 1 })} onChange={(hex) => update({ groupColor3: hexToColor3(hex) })} />
        <Label>Group Transparency ({(p.groupTransparency ?? 0).toFixed(2)})</Label>
        <input type="range" min={0} max={1} step={0.05} value={p.groupTransparency ?? 0} onChange={(e) => update({ groupTransparency: Number(e.target.value) })} className="w-full" />
      </PropertySection>
    );
  }

  // UIGradientEnhanced — ColorSequence + NumberSequence 编辑器
  if (el.type === "UIGradientEnhanced") {
    return (
      <PropertySection title="Enhanced Gradient">
        <Label>Color Sequence</Label>
        <ColorSequenceEditor value={p.colorSequence ?? { keypoints: [] }} onChange={(cs) => update({ colorSequence: cs })} />
        <Label>Transparency Sequence</Label>
        <NumberSequenceEditor value={p.transparencySequence ?? { keypoints: [] }} onChange={(ns) => update({ transparencySequence: ns })} />
        <Label>Rotation</Label>
        <NumInput value={p.gradientRotation ?? 0} onChange={(v) => update({ gradientRotation: v })} />
        <Label>Offset (X / Y)</Label>
        <div className="grid grid-cols-2 gap-1">
          <NumInput value={p.gradientOffset?.x ?? 0} step={0.1} onChange={(v) => update({ gradientOffset: { x: v, y: p.gradientOffset?.y ?? 0 } })} />
          <NumInput value={p.gradientOffset?.y ?? 0} step={0.1} onChange={(v) => update({ gradientOffset: { x: p.gradientOffset?.x ?? 0, y: v } })} />
        </div>
        <Label>Enabled</Label>
        <SelectInput value={p.gradientEnabled ?? true ? "true" : "false"} options={["true", "false"] as const} onChange={(v) => update({ gradientEnabled: v === "true" })} />
      </PropertySection>
    );
  }

  // UIFlexLayout
  if (el.type === "UIFlexLayout") {
    return (
      <PropertySection title="Flex Layout">
        <Label>Flex Direction</Label>
        <EnumSelector value={p.flexDirection ?? "Row"} options={["Row", "Column", "RowReverse", "ColumnReverse"]} onChange={(v) => update({ flexDirection: v as ElementProperties["flexDirection"] })} />
        <Label>Justify Content</Label>
        <EnumSelector value={p.justifyContent ?? "FlexStart"} options={["FlexStart", "FlexEnd", "Center", "SpaceBetween", "SpaceAround", "SpaceEvenly"]} onChange={(v) => update({ justifyContent: v as ElementProperties["justifyContent"] })} />
        <Label>Align Items</Label>
        <EnumSelector value={p.alignItems ?? "Stretch"} options={["FlexStart", "FlexEnd", "Center", "Stretch", "Baseline"]} onChange={(v) => update({ alignItems: v as ElementProperties["alignItems"] })} />
        <Label>Gap</Label>
        <NumInput value={p.gap ?? 0} onChange={(v) => update({ gap: v })} />
        <Label>Enabled</Label>
        <SelectInput value={p.enabled ?? true ? "true" : "false"} options={["true", "false"] as const} onChange={(v) => update({ enabled: v === "true" })} />
      </PropertySection>
    );
  }

  // BillboardGui
  if (el.type === "BillboardGui") {
    return (
      <PropertySection title="Billboard">
        <Label>Adornee</Label>
        <TextInput value={p.adornee ?? ""} onChange={(v) => update({ adornee: v })} placeholder="workspace.Part" />
        <Label>Studs Offset (X / Y / Z)</Label>
        <Vector3Editor value={p.studsOffset ?? { x: 0, y: 0, z: 2 }} onChange={(v) => updateV3("studsOffset", v)} />
        <Label>Always On Top</Label>
        <SelectInput value={p.alwaysOnTop ? "true" : "false"} options={["true", "false"] as const} onChange={(v) => update({ alwaysOnTop: v === "true" })} />
        <Label>Max Distance</Label>
        <NumInput value={p.maxDistance ?? 1000} onChange={(v) => update({ maxDistance: v })} />
        <Label>ZIndex Behavior</Label>
        <SelectInput value={p.zIndexBehavior ?? "Sibling"} options={["Sibling", "Global"] as const} onChange={(v) => update({ zIndexBehavior: v })} />
      </PropertySection>
    );
  }

  // SurfaceGui
  if (el.type === "SurfaceGui") {
    return (
      <PropertySection title="Surface">
        <Label>Adornee</Label>
        <TextInput value={p.adornee ?? ""} onChange={(v) => update({ adornee: v })} placeholder="workspace.Part" />
        <Label>Face</Label>
        <EnumSelector value={p.face ?? "Front"} options={["Front", "Back", "Left", "Right", "Top", "Bottom"]} onChange={(v) => update({ face: v as ElementProperties["face"] })} />
        <Label>Sizing Mode</Label>
        <SelectInput value={p.sizingMode ?? "PixelsPerStud"} options={["PixelsPerStud", "FixedSize"] as const} onChange={(v) => update({ sizingMode: v })} />
        <Label>Pixels Per Stud</Label>
        <NumInput value={p.pixelsPerStud ?? 50} onChange={(v) => update({ pixelsPerStud: v })} />
      </PropertySection>
    );
  }

  // SelectionBox / SelectionSphere
  if (el.type === "SelectionBox" || el.type === "SelectionSphere") {
    return (
      <PropertySection title="Selection">
        <Label>Adornee</Label>
        <TextInput value={p.adornee ?? ""} onChange={(v) => update({ adornee: v })} placeholder="workspace.Part" />
        <Label>Outline Color</Label>
        <ColorInput value={color3ToHex(p.strokeColor ?? { r: 0.05, g: 0.58, b: 1 })} onChange={(hex) => update({ strokeColor: hexToColor3(hex) })} />
        <Label>Surface Color</Label>
        <ColorInput value={color3ToHex(p.surfaceColor3 ?? { r: 0.05, g: 0.58, b: 1 })} onChange={(hex) => update({ surfaceColor3: hexToColor3(hex) })} />
        <Label>Surface Transparency ({(p.surfaceTransparency ?? 0.9).toFixed(2)})</Label>
        <input type="range" min={0} max={1} step={0.05} value={p.surfaceTransparency ?? 0.9} onChange={(e) => update({ surfaceTransparency: Number(e.target.value) })} className="w-full" />
        {el.type === "SelectionBox" && (
          <>
            <Label>Line Thickness ({(p.lineThickness ?? 0.03).toFixed(3)})</Label>
            <input type="range" min={0.01} max={0.2} step={0.01} value={p.lineThickness ?? 0.03} onChange={(e) => update({ lineThickness: Number(e.target.value) })} className="w-full" />
          </>
        )}
      </PropertySection>
    );
  }

  // 非新组件类型不渲染额外段
  return null;
}

/**
 * SOP-3I-07: 交互复合组件最小属性段（Name 已在头部通用段编辑）。
 * 完整值类型编辑器（ColorSequence/EventBinding 等）归 3I-08；此处仅关键标量/颜色/文本字段。
 */
function CompositePropsSection({
  el, p, update,
}: {
  el: { type: string };
  p: ElementProperties;
  update: (patch: Partial<ElementProperties>) => void;
}) {
  const updateEBFull = (key: keyof ElementProperties, eb: EventBinding) => {
    update({ [key]: eb } as Partial<ElementProperties>);
  };
  return (
    <PropertySection title="Component">
      {/* 文本基底的复合组件 */}
      {(el.type === "AnimatedButton" || el.type === "DropdownMenu") && (
        <>
          <Label>Text</Label>
          <TextInput value={p.text} onChange={(v) => update({ text: v })} />
          <Label>Font</Label>
          <SelectInput value={p.font} options={ROBLOX_FONTS as unknown as string[]} onChange={(v) => update({ font: v })} />
          <Label>Text Size</Label>
          <NumInput value={p.textSize} onChange={(v) => update({ textSize: v })} />
        </>
      )}
      {el.type === "TypewriterText" && (
        <>
          <Label>Full Text</Label>
          <textarea value={p.fullText ?? ""} onChange={(e) => update({ fullText: e.target.value })} rows={2} className="w-full rounded-md border border-glass-border bg-surface-raised px-2 py-1.5 text-sm text-text" />
          <Label>Type Speed (chars/s)</Label>
          <NumInput value={p.typeSpeed ?? 30} onChange={(v) => update({ typeSpeed: v })} />
          <Label>Loop</Label>
          <SelectInput value={p.loop ? "true" : "false"} options={["true", "false"] as const} onChange={(v) => update({ loop: v === "true" })} />
        </>
      )}
      {el.type === "CountdownTimer" && (
        <>
          <Label>Duration (s)</Label>
          <NumInput value={p.duration ?? 60} onChange={(v) => update({ duration: v })} />
          <Label>Format</Label>
          <SelectInput value={p.timerFormat ?? "MM:SS"} options={["MM:SS", "SS.mm", "HH:MM:SS", "Custom"] as const} onChange={(v) => update({ timerFormat: v })} />
          <Label>Direction</Label>
          <SelectInput value={p.countDirection ?? "Down"} options={["Down", "Up"] as const} onChange={(v) => update({ countDirection: v })} />
          <Label>OnComplete</Label>
          <EventBindingEditor value={p.onComplete ?? { script: "", params: [] }} onChange={(eb) => updateEBFull("onComplete", eb)} />
        </>
      )}
      {el.type === "ModalDialog" && (
        <>
          <Label>Title Text</Label>
          <TextInput value={p.titleText ?? ""} onChange={(v) => update({ titleText: v })} />
          <Label>Close On Overlay Click</Label>
          <SelectInput value={p.closeOnOverlayClick ? "true" : "false"} options={["true", "false"] as const} onChange={(v) => update({ closeOnOverlayClick: v === "true" })} />
          <Label>OnClose</Label>
          <EventBindingEditor value={p.onClose ?? { script: "", params: [] }} onChange={(eb) => updateEBFull("onClose", eb)} />
        </>
      )}
      {el.type === "DraggablePanel" && (
        <>
          <Label>Handle Title</Label>
          <TextInput value={p.dragHandleTitle ?? ""} onChange={(v) => update({ dragHandleTitle: v })} />
          <Label>Show Drag Handle</Label>
          <SelectInput value={p.showDragHandle ? "true" : "false"} options={["true", "false"] as const} onChange={(v) => update({ showDragHandle: v === "true" })} />
          <Label>Show Close Button</Label>
          <SelectInput value={p.showCloseButton ? "true" : "false"} options={["true", "false"] as const} onChange={(v) => update({ showCloseButton: v === "true" })} />
        </>
      )}
      {el.type === "SliderBar" && (
        <>
          <Label>Min / Max</Label>
          <div className="grid grid-cols-2 gap-1">
            <NumInput value={p.minValue ?? 0} onChange={(v) => update({ minValue: v })} />
            <NumInput value={p.maxValue ?? 100} onChange={(v) => update({ maxValue: v })} />
          </div>
          <Label>Default Value</Label>
          <NumInput value={p.defaultValue ?? 50} onChange={(v) => update({ defaultValue: v })} />
          <Label>Step</Label>
          <NumInput value={p.step ?? 1} onChange={(v) => update({ step: v })} />
          <Label>Orientation</Label>
          <SelectInput value={p.orientation ?? "Horizontal"} options={["Horizontal", "Vertical"] as const} onChange={(v) => update({ orientation: v })} />
        </>
      )}
      {el.type === "NotificationToast" && (
        <>
          <Label>Title</Label>
          <TextInput value={p.text ?? ""} onChange={(v) => update({ text: v })} />
          <Label>Message</Label>
          <textarea value={p.placeholder ?? ""} onChange={(e) => update({ placeholder: e.target.value })} rows={2} className="w-full rounded-md border border-glass-border bg-surface-raised px-2 py-1.5 text-sm text-text" />
          <Label>Duration (s)</Label>
          <NumInput value={p.duration ?? 4} onChange={(v) => update({ duration: v })} />
          <Label>Dismissible</Label>
          <SelectInput value={p.dismissible ? "true" : "false"} options={["true", "false"] as const} onChange={(v) => update({ dismissible: v === "true" })} />
        </>
      )}
      {el.type === "TabContainer" && (
        <>
          <Label>Tab Bar Height</Label>
          <NumInput value={p.tabBarHeight ?? 36} onChange={(v) => update({ tabBarHeight: v })} />
          <Label>Default Tab Index</Label>
          <NumInput value={p.defaultTabIndex ?? 0} onChange={(v) => update({ defaultTabIndex: v })} />
        </>
      )}
      {el.type === "DropdownMenu" && (
        <>
          <Label>Options (comma-separated)</Label>
          <textarea value={(p.options ?? []).join(", ")} onChange={(e) => update({ options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} rows={2} className="w-full rounded-md border border-glass-border bg-surface-raised px-2 py-1.5 text-sm text-text" />
          <Label>Placeholder</Label>
          <TextInput value={p.dropdownPlaceholder ?? ""} onChange={(v) => update({ dropdownPlaceholder: v })} />
        </>
      )}
      {el.type === "TweenedFrame" && (
        <>
          <Label>Preset Animation</Label>
          <SelectInput value={p.presetAnimation ?? "FadeIn"} options={["FadeIn", "SlideUp", "SlideDown", "SlideLeft", "SlideRight", "ScaleUp", "ScaleDown", "BounceIn", "Custom"] as const} onChange={(v) => update({ presetAnimation: v })} />
          <Label>Tween Time (s)</Label>
          <NumInput value={p.tweenTime ?? 0.5} step={0.1} onChange={(v) => update({ tweenTime: v })} />
          <Label>Trigger</Label>
          <SelectInput value={p.trigger ?? "OnCreated"} options={["OnCreated", "OnActivated", "OnHover", "Manual"] as const} onChange={(v) => update({ trigger: v })} />
        </>
      )}

      {/* 通用颜色（多数复合组件有背景色，已在 Appearance 段；这里补专属强调色） */}
      {el.type === "AnimatedButton" && (
        <>
          <Label>Hover Color</Label>
          <ColorInput value={color3ToHex(p.hoverColor3 ?? { r: 0.545, g: 0.36, b: 0.964 })} onChange={(hex) => update({ hoverColor3: hexToColor3(hex) })} />
          <Label>Pressed Color</Label>
          <ColorInput value={color3ToHex(p.pressedColor3 ?? { r: 0.35, g: 0.28, b: 0.85 })} onChange={(hex) => update({ pressedColor3: hexToColor3(hex) })} />
          <Label>OnClick</Label>
          <EventBindingEditor value={p.onClickBinding ?? { script: "", params: [] }} onChange={(eb) => updateEBFull("onClickBinding", eb)} />
        </>
      )}
      {el.type === "DropdownMenu" && (
        <Label>OnSelectionChanged: use {"{selected}"} placeholder in OnClick above is N/A — script stored in onSelectionChanged</Label>
      )}
    </PropertySection>
  );
}
