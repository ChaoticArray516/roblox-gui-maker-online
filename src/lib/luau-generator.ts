/**
 * SOP-3F-08: Luau 代码生成器
 *
 * 从编辑器元素树生成可直接粘贴到 Roblox Studio 的 Luau 脚本。
 * 支持：
 * - 完整父子层级（Instance.new + Parent）
 * - UI 效果内联（UICorner / UIGradient / UIListLayout / UIGridLayout / UIPadding）
 * - Client（LocalScript → PlayerGui）与 Server（Script → ReplicatedStorage）双模式
 * - 按钮点击事件 MouseButton1Click:Connect
 * - JSON 导出辅助（供 export-utils 打包 ZIP 使用）
 */

import type {
  GUIElement,
  GUIElementType,
  ElementProperties,
  UDim2,
  Color3,
  EventBinding,
} from "./types";
import { isEffectLike, isInteractiveComposite } from "./types";

function formatNum(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  return n.toFixed(4).replace(/\.?0+$/, "");
}

function udim2ToLuau(u: UDim2): string {
  return `UDim2.new(${formatNum(u.scaleX)}, ${Math.round(u.offsetX)}, ${formatNum(u.scaleY)}, ${Math.round(u.offsetY)})`;
}

function color3ToLuau(c: Color3): string {
  const r = Math.round(Math.min(1, Math.max(0, c.r)) * 255);
  const g = Math.round(Math.min(1, Math.max(0, c.g)) * 255);
  const b = Math.round(Math.min(1, Math.max(0, c.b)) * 255);
  return `Color3.fromRGB(${r}, ${g}, ${b})`;
}

function udimPx(px: number): string {
  return `UDim.new(0, ${Math.round(px)})`;
}

function escapeString(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

/**
 * SOP-3I-07: 交互复合组件 → Roblox 基底 Instance 类型。
 * 复合组件在 Roblox 不存在同名 Instance，主实例用最贴近的基底。
 */
function robloxBasename(type: GUIElementType): string {
  switch (type) {
    case "DraggablePanel": return "Frame";
    case "AnimatedButton": return "TextButton";
    case "TypewriterText": return "TextLabel";
    case "CountdownTimer": return "TextLabel";
    case "ModalDialog": return "Frame";
    case "TabContainer": return "Frame";
    case "DropdownMenu": return "TextButton";
    case "SliderBar": return "Frame";
    case "NotificationToast": return "Frame";
    case "TweenedFrame": return "Frame";
    default: return type;
  }
}

function collectElementsBFS(
  elements: Record<string, GUIElement>,
  rootId: string,
): GUIElement[] {
  const result: GUIElement[] = [];
  const queue = [rootId];
  while (queue.length > 0) {
    const id = queue.shift()!;
    const el = elements[id];
    if (!el) continue;
    result.push(el);
    for (const childId of el.children) {
      queue.push(childId);
    }
  }
  return result;
}

function safeVarName(name: string): string {
  let safe = name.replace(/[^a-zA-Z0-9_]/g, "_");
  if (/^[0-9]/.test(safe)) safe = `_${safe}`;
  if (safe.length === 0) safe = "el";
  const keywords = new Set([
    "and", "break", "do", "else", "elseif", "end", "false", "for",
    "function", "if", "in", "local", "nil", "not", "or", "repeat",
    "return", "then", "true", "until", "while",
  ]);
  if (keywords.has(safe)) safe = `${safe}_`;
  return safe;
}

function buildVarNames(elements: Record<string, GUIElement>, rootId: string): Record<string, string> {
  const map: Record<string, string> = {};
  const used = new Set<string>();
  for (const el of collectElementsBFS(elements, rootId!)) {
    const base = safeVarName(el.name);
    let name = base;
    let counter = 1;
    while (used.has(name)) {
      name = `${base}_${counter}`;
      counter++;
    }
    used.add(name);
    map[el.id] = name;
  }
  return map;
}

function applyElementProperties(
  lines: string[],
  el: GUIElement,
  varName: string,
): void {
  const p = el.properties;
  // 效果/约束类无独立 position/size；ScreenGui 也跳过（由 root 创建段单独处理）
  const needsSpatial = el.type !== "ScreenGui" && !isEffectLike(el.type);

  if (needsSpatial) {
    lines.push(`${varName}.Position = ${udim2ToLuau(p.position)}`);
    lines.push(`${varName}.Size = ${udim2ToLuau(p.size)}`);
    lines.push(`${varName}.AnchorPoint = Vector2.new(${formatNum(p.anchorPoint.x)}, ${formatNum(p.anchorPoint.y)})`);
  }

  if (
    el.type !== "UIListLayout" &&
    el.type !== "UIGridLayout" &&
    el.type !== "UIPadding"
  ) {
    lines.push(`${varName}.BackgroundColor3 = ${color3ToLuau(p.backgroundColor3)}`);
    lines.push(`${varName}.BackgroundTransparency = ${formatNum(p.backgroundTransparency)}`);
  }

  lines.push(`${varName}.ZIndex = ${el.zIndex}`);

  if (
    el.type === "TextLabel" ||
    el.type === "TextButton" ||
    el.type === "TextBox"
  ) {
    lines.push(`${varName}.Text = "${escapeString(p.text)}"`);
    lines.push(`${varName}.Font = Enum.Font.${p.font}`);
    lines.push(`${varName}.TextSize = ${p.textSize}`);
    lines.push(`${varName}.TextColor3 = ${color3ToLuau(p.textColor3)}`);
  }

  // SOP-3I-07: 文本基底的复合组件主实例也需 text/font/textSize/textColor
  if (
    el.type === "AnimatedButton" || el.type === "TypewriterText" ||
    el.type === "CountdownTimer" || el.type === "DropdownMenu"
  ) {
    if (el.type === "AnimatedButton" || el.type === "DropdownMenu") {
      lines.push(`${varName}.Text = "${escapeString(p.text)}"`);
    }
    lines.push(`${varName}.Font = Enum.Font.${p.font}`);
    lines.push(`${varName}.TextSize = ${p.textSize}`);
    lines.push(`${varName}.TextColor3 = ${color3ToLuau(p.textColor3)}`);
    if (el.type === "AnimatedButton") lines.push(`${varName}.AutoButtonColor = false`);
  }

  if (el.type === "TextBox" && p.placeholder) {
    lines.push(`${varName}.PlaceholderText = "${escapeString(p.placeholder)}"`);
  }

  if ((el.type === "ImageLabel" || el.type === "ImageButton") && p.image) {
    lines.push(`${varName}.Image = "${escapeString(p.image)}"`);
  }

  if (el.type === "ScrollingFrame") {
    lines.push(`${varName}.ScrollBarThickness = 8`);
    lines.push(`${varName}.CanvasSize = UDim2.new(0, 0, 2, 0)`);
    lines.push(`${varName}.AutomaticCanvasSize = Enum.AutomaticSize.Y`);
  }

  // SOP-3I-04: 媒体/3D 组件专属属性 — 源 editor-component-extensions.md §2.8–2.10 (行 849–1229)
  if (el.type === "VideoFrame") {
    if (p.video) lines.push(`${varName}.Video = "${escapeString(p.video)}"`);
    lines.push(`${varName}.Playing = ${p.playing ? "true" : "false"}`);
    lines.push(`${varName}.Looped = ${p.looped ? "true" : "false"}`);
    lines.push(`${varName}.Volume = ${formatNum(p.volume ?? 1)}`);
    lines.push(`${varName}.PlaybackSpeed = ${formatNum(p.playbackSpeed ?? 1)}`);
  }
  if (el.type === "ViewportFrame") {
    if (p.ambient) lines.push(`${varName}.Ambient = ${color3ToLuau(p.ambient)}`);
    if (p.lightColor) lines.push(`${varName}.LightColor = ${color3ToLuau(p.lightColor)}`);
    if (p.lightDirection) lines.push(`${varName}.LightDirection = Vector3.new(${formatNum(p.lightDirection.x)}, ${formatNum(p.lightDirection.y)}, ${formatNum(p.lightDirection.z)})`);
  }
  if (el.type === "CanvasGroup") {
    if (p.groupColor3) lines.push(`${varName}.GroupColor3 = ${color3ToLuau(p.groupColor3)}`);
    lines.push(`${varName}.GroupTransparency = ${formatNum(p.groupTransparency ?? 0)}`);
  }
  // SOP-3I-05: 世界空间容器专属属性 — 源 editor-component-extensions.md §2.11–2.12 (行 1231–1615)
  if (el.type === "BillboardGui") {
    if (p.adornee) lines.push(`${varName}.Adornee = ${p.adornee}`);
    if (p.studsOffset) lines.push(`${varName}.StudsOffset = Vector3.new(${formatNum(p.studsOffset.x)}, ${formatNum(p.studsOffset.y)}, ${formatNum(p.studsOffset.z)})`);
    lines.push(`${varName}.AlwaysOnTop = ${p.alwaysOnTop ? "true" : "false"}`);
    lines.push(`${varName}.LightInfluence = ${formatNum(p.lightInfluence ?? 1)}`);
    lines.push(`${varName}.MaxDistance = ${p.maxDistance ?? 1000}`);
    lines.push(`${varName}.Brightness = ${formatNum(p.brightness ?? 1)}`);
    lines.push(`${varName}.ResetOnSpawn = ${p.resetOnSpawn ? "true" : "false"}`);
    const zib = p.zIndexBehavior ?? "Sibling";
    lines.push(`${varName}.ZIndexBehavior = Enum.ZIndexBehavior.${zib}`);
  }
  if (el.type === "SurfaceGui") {
    if (p.adornee) lines.push(`${varName}.Adornee = ${p.adornee}`);
    const face = p.face ?? "Front";
    lines.push(`${varName}.Face = Enum.NormalId.${face}`);
    const sm = p.sizingMode ?? "PixelsPerStud";
    lines.push(`${varName}.SizingMode = Enum.SurfaceGuiSizingMode.${sm}`);
    if (sm === "PixelsPerStud") {
      lines.push(`${varName}.PixelsPerStud = ${p.pixelsPerStud ?? 50}`);
    } else if (p.canvasSize) {
      lines.push(`${varName}.CanvasSize = Vector2.new(${Math.round(p.canvasSize.x)}, ${Math.round(p.canvasSize.y)})`);
    }
    lines.push(`${varName}.AlwaysOnTop = ${p.alwaysOnTop ? "true" : "false"}`);
    lines.push(`${varName}.LightInfluence = ${formatNum(p.lightInfluence ?? 1)}`);
    lines.push(`${varName}.Brightness = ${formatNum(p.brightness ?? 1)}`);
  }

  if ((el.type === "TextButton" || el.type === "ImageButton") && p.onClick) {
    const code = p.onClick.trim();
    if (code) {
      lines.push("");
      lines.push(`${varName}.MouseButton1Click:Connect(function()`);
      for (const cl of code.split("\n")) {
        const trimmed = cl.trim();
        if (trimmed) lines.push(`  ${trimmed}`);
      }
      lines.push(`end)`);
    }
  }
}

function generateEffectInline(
  lines: string[],
  effect: GUIElement,
  parentVar: string,
): void {
  const p = effect.properties;

  switch (effect.type) {
    case "UICorner": {
      lines.push(`local corner = Instance.new("UICorner")`);
      lines.push(`corner.CornerRadius = ${udimPx(p.cornerRadius)}`);
      lines.push(`corner.Parent = ${parentVar}`);
      break;
    }
    case "UIGradient": {
      lines.push(`local gradient = Instance.new("UIGradient")`);
      if (p.gradientColor1 && p.gradientColor2) {
        lines.push(
          `gradient.Color = ColorSequence.new(${color3ToLuau(p.gradientColor1)}, ${color3ToLuau(p.gradientColor2)})`,
        );
      }
      if (typeof p.gradientRotation === "number") {
        lines.push(`gradient.Rotation = ${p.gradientRotation}`);
      }
      if (typeof p.gradientTransparency1 === "number" && typeof p.gradientTransparency2 === "number") {
        lines.push(
          `gradient.Transparency = NumberSequence.new(${formatNum(p.gradientTransparency1)}, ${formatNum(p.gradientTransparency2)})`,
        );
      }
      lines.push(`gradient.Parent = ${parentVar}`);
      break;
    }
    case "UIListLayout": {
      lines.push(`local listLayout = Instance.new("UIListLayout")`);
      const fd = p.fillDirection ?? "vertical";
      lines.push(`listLayout.FillDirection = Enum.FillDirection.${fd.charAt(0).toUpperCase() + fd.slice(1)}`);
      const so = p.sortOrder ?? "layoutOrder";
      lines.push(`listLayout.SortOrder = Enum.SortOrder.${so.charAt(0).toUpperCase() + so.slice(1)}`);
      lines.push(`listLayout.Padding = ${udimPx(p.padding)}`);
      lines.push(`listLayout.Parent = ${parentVar}`);
      break;
    }
    case "UIGridLayout": {
      lines.push(`local gridLayout = Instance.new("UIGridLayout")`);
      if (p.cellSize) {
        lines.push(
          `gridLayout.CellSize = UDim2.new(0, ${Math.round(p.cellSize.x)}, 0, ${Math.round(p.cellSize.y)})`,
        );
      }
      if (p.cellPadding) {
        lines.push(
          `gridLayout.CellPadding = UDim2.new(0, ${Math.round(p.cellPadding.x)}, 0, ${Math.round(p.cellPadding.y)})`,
        );
      }
      const so = p.sortOrder ?? "layoutOrder";
      lines.push(`gridLayout.SortOrder = Enum.SortOrder.${so.charAt(0).toUpperCase() + so.slice(1)}`);
      const sc = p.startCorner ?? "topLeft";
      const startCornerMap: Record<string, string> = {
        topLeft: "TopLeft",
        topRight: "TopRight",
        bottomLeft: "BottomLeft",
        bottomRight: "BottomRight",
      };
      lines.push(`gridLayout.StartCorner = Enum.StartCorner.${startCornerMap[sc] ?? "TopLeft"}`);
      const fd = p.fillDirection ?? "horizontal";
      lines.push(`gridLayout.FillDirection = Enum.FillDirection.${fd.charAt(0).toUpperCase() + fd.slice(1)}`);
      lines.push(`gridLayout.Parent = ${parentVar}`);
      break;
    }
    case "UIPadding": {
      lines.push(`local padding = Instance.new("UIPadding")`);
      const pt = p.paddingTop ?? p.padding ?? 16;
      const pr = p.paddingRight ?? p.padding ?? 16;
      const pb = p.paddingBottom ?? p.padding ?? 16;
      const pl = p.paddingLeft ?? p.padding ?? 16;
      lines.push(`padding.PaddingTop = ${udimPx(pt)}`);
      lines.push(`padding.PaddingRight = ${udimPx(pr)}`);
      lines.push(`padding.PaddingBottom = ${udimPx(pb)}`);
      lines.push(`padding.PaddingLeft = ${udimPx(pl)}`);
      lines.push(`padding.Parent = ${parentVar}`);
      break;
    }
    // SOP-3I-02: 约束类组件（5）— 源 editor-component-extensions.md §2.2–2.6 (行 176–684)
    case "UIStroke": {
      lines.push(`local stroke = Instance.new("UIStroke")`);
      if (p.strokeColor) lines.push(`stroke.Color = ${color3ToLuau(p.strokeColor)}`);
      lines.push(`stroke.Thickness = ${formatNum(p.strokeThickness ?? 1)}`);
      lines.push(`stroke.Transparency = ${formatNum(p.strokeTransparency ?? 0)}`);
      const asm = p.strokeApplyMode ?? "Contextual";
      lines.push(`stroke.ApplyStrokeMode = Enum.ApplyStrokeMode.${asm}`);
      const ljm = p.strokeLineJoinMode ?? "Round";
      lines.push(`stroke.LineJoinMode = Enum.LineJoinMode.${ljm}`);
      lines.push(`stroke.Enabled = ${p.strokeEnabled ?? true ? "true" : "false"}`);
      lines.push(`stroke.Parent = ${parentVar}`);
      break;
    }
    case "UIScale": {
      lines.push(`local scale = Instance.new("UIScale")`);
      lines.push(`scale.Scale = ${formatNum(p.scale ?? 1)}`);
      lines.push(`scale.Parent = ${parentVar}`);
      break;
    }
    case "UIAspectRatioConstraint": {
      lines.push(`local aspect = Instance.new("UIAspectRatioConstraint")`);
      lines.push(`aspect.AspectRatio = ${formatNum(p.aspectRatio ?? 1)}`);
      const at = p.aspectType ?? "FitWithinMaxSize";
      lines.push(`aspect.AspectType = Enum.AspectType.${at}`);
      const da = p.dominantAxis ?? "Width";
      lines.push(`aspect.DominantAxis = Enum.DominantAxis.${da}`);
      lines.push(`aspect.Parent = ${parentVar}`);
      break;
    }
    case "UISizeConstraint": {
      lines.push(`local sizeConstraint = Instance.new("UISizeConstraint")`);
      const minV = p.minSize ?? { x: 0, y: 0 };
      const maxV = p.maxSize ?? { x: Infinity, y: Infinity };
      lines.push(`sizeConstraint.MinSize = ${vector2ToLuau(minV)}`);
      lines.push(`sizeConstraint.MaxSize = ${vector2ToLuau(maxV)}`);
      lines.push(`sizeConstraint.Parent = ${parentVar}`);
      break;
    }
    case "UITextSizeConstraint": {
      lines.push(`local textSizeConstraint = Instance.new("UITextSizeConstraint")`);
      lines.push(`textSizeConstraint.MinTextSize = ${p.minTextSize ?? 1}`);
      lines.push(`textSizeConstraint.MaxTextSize = ${p.maxTextSize ?? 100}`);
      lines.push(`textSizeConstraint.Parent = ${parentVar}`);
      break;
    }
    // SOP-3I-03: UIDragDetector 交互组件 — 源 editor-component-extensions.md §2.7 (行 687–847)
    case "UIDragDetector": {
      lines.push(`local dragDetector = Instance.new("UIDragDetector")`);
      const ds = p.dragStyle ?? "TranslatePlane";
      lines.push(`dragDetector.DragStyle = Enum.UIDragDetectorDragStyle.${ds}`);
      const rs = p.responseStyle ?? "Linear";
      lines.push(`dragDetector.ResponseStyle = Enum.UIDragDetectorResponseStyle.${rs}`);
      lines.push(`dragDetector.MinDragDistance = ${p.minDragDistance ?? 0}`);
      const maxD = p.maxDragDistance ?? 0;
      lines.push(`dragDetector.MaxDragDistance = ${maxD === 0 || maxD === Infinity ? "math.huge" : maxD}`);
      lines.push(`dragDetector.Enabled = ${p.dragEnabled ?? true ? "true" : "false"}`);
      lines.push(`dragDetector.Parent = ${parentVar}`);
      // 事件绑定（仅当 script 非空时生成 :Connect 闭包）
      if (p.onDragStart?.script) {
        const params = p.onDragStart.params.join(", ");
        lines.push(`dragDetector.DragStart:Connect(function(${params})`);
        for (const cl of p.onDragStart.script.split("\n")) {
          const t = cl.trim();
          if (t) lines.push(`  ${t}`);
        }
        lines.push(`end)`);
      }
      if (p.onDragMove?.script) {
        const params = p.onDragMove.params.join(", ");
        lines.push(`dragDetector.DragContinue:Connect(function(${params})`);
        for (const cl of p.onDragMove.script.split("\n")) {
          const t = cl.trim();
          if (t) lines.push(`  ${t}`);
        }
        lines.push(`end)`);
      }
      if (p.onDragEnd?.script) {
        const params = p.onDragEnd.params.join(", ");
        lines.push(`dragDetector.DragEnd:Connect(function(${params})`);
        for (const cl of p.onDragEnd.script.split("\n")) {
          const t = cl.trim();
          if (t) lines.push(`  ${t}`);
        }
        lines.push(`end)`);
      }
      break;
    }
    // SOP-3I-05: SelectionBox / SelectionSphere — 源 editor-component-extensions.md §2.13 (行 1617–1738)
    case "SelectionBox": {
      lines.push(`local selectionBox = Instance.new("SelectionBox")`);
      if (p.adornee) lines.push(`selectionBox.Adornee = ${p.adornee}`);
      if (p.strokeColor) lines.push(`selectionBox.Color3 = ${color3ToLuau(p.strokeColor)}`);
      lines.push(`selectionBox.LineThickness = ${formatNum(p.lineThickness ?? 0.03)}`);
      if (p.surfaceColor3) lines.push(`selectionBox.SurfaceColor3 = ${color3ToLuau(p.surfaceColor3)}`);
      lines.push(`selectionBox.SurfaceTransparency = ${formatNum(p.surfaceTransparency ?? 0.9)}`);
      lines.push(`selectionBox.Transparency = ${formatNum(p.strokeTransparency ?? 0)}`);
      lines.push(`selectionBox.Parent = ${parentVar}`);
      break;
    }
    case "SelectionSphere": {
      lines.push(`local selectionSphere = Instance.new("SelectionSphere")`);
      if (p.adornee) lines.push(`selectionSphere.Adornee = ${p.adornee}`);
      if (p.strokeColor) lines.push(`selectionSphere.Color3 = ${color3ToLuau(p.strokeColor)}`);
      if (p.surfaceColor3) lines.push(`selectionSphere.SurfaceColor3 = ${color3ToLuau(p.surfaceColor3)}`);
      lines.push(`selectionSphere.SurfaceTransparency = ${formatNum(p.surfaceTransparency ?? 0.9)}`);
      lines.push(`selectionSphere.Parent = ${parentVar}`);
      break;
    }
    // SOP-3I-06: UIGradientEnhanced — 源 editor-component-extensions.md §2.14 (行 1740–1876)
    case "UIGradientEnhanced": {
      lines.push(`local gradient = Instance.new("UIGradient")`);
      if (p.colorSequence && p.colorSequence.keypoints.length > 0) {
        const kp = p.colorSequence.keypoints
          .map((k) => `ColorSequenceKeypoint.new(${formatNum(k.time)}, ${color3ToLuau(k.color)})`)
          .join(", ");
        lines.push(`gradient.Color = ColorSequence.new({${kp}})`);
      }
      if (p.transparencySequence && p.transparencySequence.keypoints.length > 0) {
        const kp = p.transparencySequence.keypoints
          .map((k) => `NumberSequenceKeypoint.new(${formatNum(k.time)}, ${formatNum(k.value)})`)
          .join(", ");
        lines.push(`gradient.Transparency = NumberSequence.new({${kp}})`);
      }
      lines.push(`gradient.Rotation = ${formatNum(p.gradientRotation ?? 0)}`);
      if (p.gradientOffset) {
        lines.push(`gradient.Offset = Vector2.new(${formatNum(p.gradientOffset.x)}, ${formatNum(p.gradientOffset.y)})`);
      }
      lines.push(`gradient.Enabled = ${p.gradientEnabled ?? true ? "true" : "false"}`);
      lines.push(`gradient.Parent = ${parentVar}`);
      break;
    }
    // SOP-3I-06: UIFlexLayout polyfill — 源 editor-component-extensions.md §2.15 (行 1878–2044)
    // 生成 UIListLayout + UISizeConstraint 组合等效 flexbox
    case "UIFlexLayout": {
      lines.push(`local flexLayout = Instance.new("UIListLayout")`);
      const fd = p.flexDirection ?? "Row";
      const fillDir = fd.startsWith("Row") ? "Horizontal" : "Vertical";
      lines.push(`flexLayout.FillDirection = Enum.FillDirection.${fillDir}`);
      const jc = p.justifyContent ?? "FlexStart";
      const hAlignMap: Record<string, string> = {
        FlexStart: "Left", FlexEnd: "Right", Center: "Center",
        SpaceBetween: "Center", SpaceAround: "Center", SpaceEvenly: "Center",
      };
      const vAlignMap: Record<string, string> = {
        FlexStart: "Top", FlexEnd: "Bottom", Center: "Center",
        Stretch: "Center", Baseline: "Center",
      };
      lines.push(`flexLayout.HorizontalAlignment = Enum.HorizontalAlignment.${hAlignMap[jc] ?? "Left"}`);
      lines.push(`flexLayout.VerticalAlignment = Enum.VerticalAlignment.${vAlignMap[p.alignItems ?? "Stretch"] ?? "Top"}`);
      lines.push(`flexLayout.Padding = ${udimPx(p.gap ?? 0)}`);
      lines.push(`flexLayout.SortOrder = Enum.SortOrder.LayoutOrder`);
      lines.push(`flexLayout.Parent = ${parentVar}`);
      break;
    }
  }
}

/** SOP-3I-07: EventBinding 脚本 → 缩进 Luau 代码行（仅 script 非空时生成） */
function emitEventBinding(lines: string[], eb: EventBinding | undefined, indent: string): void {
  if (!eb?.script) return;
  for (const cl of eb.script.split("\n")) {
    const t = cl.trim();
    if (t) lines.push(`${indent}${t}`);
  }
}

/**
 * SOP-3I-07: 交互复合组件生成 — 源 editor-component-extensions.md §3.2–3.11 (行 2073–4515)
 *
 * 复合组件主实例已由 applyElementProperties 作为可视元素生成（Frame/TextLabel/TextButton 基底
 * + position/size/color）。这里在 .Parent 赋值后追加：子实例创建 + 行为脚本。
 * 每个组件按 §3 各 postCreation 模式内联 game:GetService（编辑器出口；
 * 3I-09 Orchestrator 出口才做头部注入去重）。
 * 源文档已知 bug：部分 generator 引用未定义的 properties，此处统一用 el.properties。
 */
function generateCompositePostCreation(
  lines: string[],
  el: GUIElement,
  varName: string,
): void {
  const p = el.properties;

  switch (el.type) {
    // §3.2 DraggablePanel — Frame + 可选 DragHandle TextLabel + 拖拽行为
    case "DraggablePanel": {
      if (p.showDragHandle) {
        lines.push(`-- DraggablePanel drag handle`);
        lines.push(`local ${varName}Handle = Instance.new("TextLabel")`);
        lines.push(`${varName}Handle.Name = "DragHandle"`);
        lines.push(`${varName}Handle.Size = UDim2.new(1, 0, 0, ${p.dragHandleHeight ?? 28})`);
        lines.push(`${varName}Handle.BackgroundColor3 = ${color3ToLuau(p.dragHandleColor ?? { r: 0.25, g: 0.25, b: 0.3 })}`);
        lines.push(`${varName}Handle.Text = "${escapeString(p.dragHandleTitle ?? "Draggable Panel")}"`);
        lines.push(`${varName}Handle.TextColor3 = ${color3ToLuau(p.titleTextColor ?? { r: 1, g: 1, b: 1 })}`);
        lines.push(`${varName}Handle.TextSize = ${p.titleTextSize ?? 14}`);
        lines.push(`${varName}Handle.Parent = ${varName}`);
        lines.push(``);
        lines.push(`-- DraggablePanel dragging behavior`);
        lines.push(`local UIS = game:GetService("UserInputService")`);
        lines.push(`local dragging = false`);
        lines.push(`local dragStart = nil`);
        lines.push(`local startPos = nil`);
        lines.push(``);
        lines.push(`${varName}Handle.InputBegan:Connect(function(input)`);
        lines.push(`  if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then`);
        lines.push(`    dragging = true`);
        lines.push(`    dragStart = input.Position`);
        lines.push(`    startPos = ${varName}.Position`);
        lines.push(`  end`);
        lines.push(`end)`);
        lines.push(``);
        lines.push(`UIS.InputChanged:Connect(function(input)`);
        lines.push(`  if dragging and (input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch) then`);
        lines.push(`    local delta = input.Position - dragStart`);
        lines.push(`    ${varName}.Position = UDim2.new(startPos.X.Scale, startPos.X.Offset + delta.X, startPos.Y.Scale, startPos.Y.Offset + delta.Y)`);
        lines.push(`  end`);
        lines.push(`end)`);
        lines.push(``);
        lines.push(`UIS.InputEnded:Connect(function(input)`);
        lines.push(`  if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then`);
        lines.push(`    dragging = false`);
        lines.push(`  end`);
        lines.push(`end)`);
      }
      if (p.showCloseButton) {
        lines.push(`-- DraggablePanel close button`);
        lines.push(`local ${varName}Close = Instance.new("TextButton")`);
        lines.push(`${varName}Close.Name = "CloseButton"`);
        lines.push(`${varName}Close.Size = UDim2.new(0, 16, 0, 16)`);
        lines.push(`${varName}Close.Position = UDim2.new(1, -22, 0, 6)`);
        lines.push(`${varName}Close.BackgroundColor3 = ${color3ToLuau(p.closeButtonColor ?? { r: 0.85, g: 0.2, b: 0.2 })}`);
        lines.push(`${varName}Close.Text = "X"`);
        lines.push(`${varName}Close.TextColor3 = Color3.fromRGB(255, 255, 255)`);
        lines.push(`${varName}Close.TextSize = 10`);
        lines.push(`${varName}Close.Parent = ${varName}`);
        lines.push(`${varName}Close.MouseButton1Click:Connect(function()`);
        lines.push(`  ${varName}.Visible = false`);
        emitEventBinding(lines, p.onClose, "  ");
        lines.push(`end)`);
      }
      break;
    }

    // §3.3 AnimatedButton — TextButton + TweenService 悬停/按下动画
    case "AnimatedButton": {
      lines.push(`-- AnimatedButton behavior`);
      lines.push(`local TweenService = game:GetService("TweenService")`);
      lines.push(`local hoverTween = TweenService:Create(${varName}, TweenInfo.new(${p.hoverTweenTime ?? 0.15}, Enum.EasingStyle.${p.easingStyle ?? "Quad"}, Enum.EasingDirection.${p.easingDirection ?? "Out"}), {`);
      lines.push(`  BackgroundColor3 = ${color3ToLuau(p.hoverColor3 ?? { r: 0.545, g: 0.36, b: 0.964 })}`);
      lines.push(`})`);
      lines.push(`local leaveTween = TweenService:Create(${varName}, TweenInfo.new(${p.hoverTweenTime ?? 0.15}), {`);
      lines.push(`  BackgroundColor3 = ${color3ToLuau(p.backgroundColor3)}`);
      lines.push(`})`);
      lines.push(`local pressTween = TweenService:Create(${varName}, TweenInfo.new(${p.pressTweenTime ?? 0.1}, Enum.EasingStyle.${p.easingStyle ?? "Quad"}, Enum.EasingDirection.In), {`);
      lines.push(`  BackgroundColor3 = ${color3ToLuau(p.pressedColor3 ?? { r: 0.35, g: 0.28, b: 0.85 })}`);
      lines.push(`})`);
      lines.push(``);
      lines.push(`${varName}.MouseEnter:Connect(function() hoverTween:Play() end)`);
      lines.push(`${varName}.MouseLeave:Connect(function() leaveTween:Play() end)`);
      lines.push(`${varName}.MouseButton1Down:Connect(function() pressTween:Play() end)`);
      lines.push(`${varName}.MouseButton1Up:Connect(function() hoverTween:Play() end)`);
      lines.push(`${varName}.MouseButton1Click:Connect(function()`);
      emitEventBinding(lines, p.onClickBinding, "  ");
      lines.push(`end)`);
      break;
    }

    // §3.4 TypewriterText — TextLabel + RunService 逐字打印 + 光标闪烁
    case "TypewriterText": {
      lines.push(`-- TypewriterText behavior`);
      lines.push(`local RunService = game:GetService("RunService")`);
      lines.push(`local fullText = "${escapeString(p.fullText ?? "")}"`);
      lines.push(`local typeInterval = ${p.typeSpeed && p.typeSpeed > 0 ? (1 / p.typeSpeed).toFixed(4) : "0.033"}`);
      lines.push(`local charIndex = 0`);
      lines.push(`local elapsed = 0`);
      lines.push(`local cursorVisible = true`);
      lines.push(`local cursorTimer = 0`);
      lines.push(`local cursorRate = ${p.cursorBlinkRate && p.cursorBlinkRate > 0 ? (1 / p.cursorBlinkRate).toFixed(4) : "0.5"}`);
      lines.push(``);
      lines.push(`task.wait(${p.startDelay ?? 0})`);
      lines.push(``);
      lines.push(`local connection`);
      lines.push(`connection = RunService.Heartbeat:Connect(function(dt)`);
      lines.push(`  elapsed = elapsed + dt`);
      lines.push(`  cursorTimer = cursorTimer + dt`);
      lines.push(`  if cursorTimer >= cursorRate then`);
      lines.push(`    cursorVisible = not cursorVisible`);
      lines.push(`    cursorTimer = 0`);
      lines.push(`  end`);
      lines.push(`  if elapsed >= typeInterval then`);
      lines.push(`    charIndex = math.min(charIndex + 1, #fullText)`);
      if (p.showCursor) {
        lines.push(`    ${varName}.Text = string.sub(fullText, 1, charIndex) .. (cursorVisible and "${escapeString(p.cursorChar ?? "|")}" or " ")`);
      } else {
        lines.push(`    ${varName}.Text = string.sub(fullText, 1, charIndex)`);
      }
      lines.push(`    elapsed = 0`);
      lines.push(`    if charIndex >= #fullText then`);
      if (p.loop) {
        lines.push(`      task.wait(${p.loopDelay ?? 1})`);
        if (p.deleteBeforeLoop) {
          lines.push(`      for i = #fullText, 1, -1 do`);
          lines.push(`        ${varName}.Text = string.sub(fullText, 1, i - 1)`);
          lines.push(`        task.wait(${p.deleteSpeed ?? 0.03})`);
          lines.push(`      end`);
        }
        lines.push(`      charIndex = 0`);
      } else {
        lines.push(`      connection:Disconnect()`);
        lines.push(`      ${varName}.Text = fullText`);
      }
      lines.push(`    end`);
      lines.push(`  end`);
      lines.push(`end)`);
      break;
    }

    // §3.5 CountdownTimer — TextLabel + RunService 倒计时
    case "CountdownTimer": {
      lines.push(`-- CountdownTimer behavior`);
      lines.push(`local RunService = game:GetService("RunService")`);
      lines.push(`local duration = ${p.duration ?? 60}`);
      lines.push(`local remaining = duration`);
      lines.push(`local elapsedT = 0`);
      lines.push(`local running = ${p.autoStart ?? true}`);
      lines.push(`local completed = false`);
      lines.push(``);
      const fmt = p.timerFormat ?? "MM:SS";
      lines.push(`local function formatTime(seconds)`);
      if (fmt === "SS.mm") {
        lines.push(`  local secs = math.floor(seconds)`);
        lines.push(`  local ms = math.floor((seconds % 1) * 100)`);
        lines.push(`  return string.format("%02d.%02d", secs, ms)`);
      } else if (fmt === "HH:MM:SS") {
        lines.push(`  local hrs = math.floor(seconds / 3600)`);
        lines.push(`  local mins = math.floor((seconds % 3600) / 60)`);
        lines.push(`  local secs = math.floor(seconds % 60)`);
        lines.push(`  return string.format("%02d:%02d:%02d", hrs, mins, secs)`);
      } else {
        lines.push(`  local mins = math.floor(seconds / 60)`);
        lines.push(`  local secs = math.floor(seconds % 60)`);
        lines.push(`  return string.format("%02d:%02d", mins, secs)`);
      }
      lines.push(`end`);
      lines.push(``);
      if (p.countDirection === "Up") {
        lines.push(`local connection = RunService.Heartbeat:Connect(function(dt)`);
        lines.push(`  if not running then return end`);
        lines.push(`  elapsedT = elapsedT + dt`);
        lines.push(`  ${varName}.Text = formatTime(elapsedT)`);
        lines.push(`  if elapsedT >= duration and not completed then`);
        lines.push(`    completed = true`);
        emitEventBinding(lines, p.onComplete, "    ");
        if (p.loop) {
          lines.push(`    task.wait(1)`);
          lines.push(`    elapsedT = 0`);
          lines.push(`    completed = false`);
        } else {
          lines.push(`    running = false`);
        }
        lines.push(`  end`);
        lines.push(`end)`);
      } else {
        lines.push(`local connection = RunService.Heartbeat:Connect(function(dt)`);
        lines.push(`  if not running then return end`);
        lines.push(`  remaining = math.max(0, remaining - dt)`);
        lines.push(`  ${varName}.Text = formatTime(remaining)`);
        lines.push(`  if remaining <= 0 and not completed then`);
        lines.push(`    completed = true`);
        if (p.flashOnComplete) {
          lines.push(`    local originalColor = ${varName}.BackgroundColor3`);
          lines.push(`    ${varName}.BackgroundColor3 = ${color3ToLuau(p.flashColor ?? { r: 1, g: 0.2, b: 0.2 })}`);
          lines.push(`    task.delay(${p.flashDuration ?? 0.5}, function() ${varName}.BackgroundColor3 = originalColor end)`);
        }
        emitEventBinding(lines, p.onComplete, "    ");
        if (p.loop) {
          lines.push(`    task.wait(1)`);
          lines.push(`    remaining = duration`);
          lines.push(`    completed = false`);
        } else {
          lines.push(`    running = false`);
        }
        lines.push(`  end`);
        lines.push(`end)`);
      }
      break;
    }

    // §3.6 ModalDialog — Frame + TitleBar + CloseButton + 打开动画
    case "ModalDialog": {
      lines.push(`-- ModalDialog title bar`);
      if (p.showTitleBar) {
        lines.push(`local ${varName}TitleBar = Instance.new("Frame")`);
        lines.push(`${varName}TitleBar.Name = "TitleBar"`);
        lines.push(`${varName}TitleBar.Size = UDim2.new(1, 0, 0, ${p.titleHeight ?? 36})`);
        lines.push(`${varName}TitleBar.BackgroundColor3 = ${color3ToLuau(p.titleColor ?? { r: 0.25, g: 0.25, b: 0.3 })}`);
        lines.push(`${varName}TitleBar.BorderSizePixel = 0`);
        lines.push(`${varName}TitleBar.Parent = ${varName}`);
        lines.push(``);
        lines.push(`local ${varName}Title = Instance.new("TextLabel")`);
        lines.push(`${varName}Title.Name = "Title"`);
        lines.push(`${varName}Title.Size = UDim2.new(1, -10, 1, 0)`);
        lines.push(`${varName}Title.Position = UDim2.new(0, 10, 0, 0)`);
        lines.push(`${varName}Title.BackgroundTransparency = 1`);
        lines.push(`${varName}Title.Text = "${escapeString(p.titleText ?? "Modal Dialog")}"`);
        lines.push(`${varName}Title.TextColor3 = ${color3ToLuau(p.titleTextColor ?? { r: 1, g: 1, b: 1 })}`);
        lines.push(`${varName}Title.TextSize = ${p.titleTextSize ?? 16}`);
        lines.push(`${varName}Title.Font = Enum.Font.GothamBold`);
        lines.push(`${varName}Title.TextXAlignment = Enum.TextXAlignment.Left`);
        lines.push(`${varName}Title.Parent = ${varName}TitleBar`);
      }
      lines.push(``);
      if (p.showCloseButton) {
        lines.push(`-- ModalDialog close button`);
        lines.push(`local ${varName}Close = Instance.new("TextButton")`);
        lines.push(`${varName}Close.Name = "CloseButton"`);
        lines.push(`${varName}Close.Size = UDim2.new(0, ${p.closeButtonSize ?? 20}, 0, ${p.closeButtonSize ?? 20})`);
        lines.push(`${varName}Close.Position = UDim2.new(1, ${-(p.closeButtonSize ?? 20) - 8}, 0, 8)`);
        lines.push(`${varName}Close.BackgroundColor3 = ${color3ToLuau(p.closeButtonColor ?? { r: 0.85, g: 0.2, b: 0.2 })}`);
        lines.push(`${varName}Close.Text = "X"`);
        lines.push(`${varName}Close.TextColor3 = Color3.fromRGB(255, 255, 255)`);
        lines.push(`${varName}Close.TextSize = ${Math.round((p.closeButtonSize ?? 20) * 0.5)}`);
        lines.push(`${varName}Close.Parent = ${p.showTitleBar ? `${varName}TitleBar` : varName}`);
        lines.push(`${varName}Close.MouseButton1Click:Connect(function()`);
        lines.push(`  ${varName}.Visible = false`);
        emitEventBinding(lines, p.onClose, "  ");
        lines.push(`end)`);
      }
      if (p.showAnimation) {
        lines.push(`-- ModalDialog open animation`);
        lines.push(`local TweenService = game:GetService("TweenService")`);
        lines.push(`local originalSize = ${varName}.Size`);
        lines.push(`${varName}.Size = UDim2.new(0, 0, 0, 0)`);
        lines.push(`local openTween = TweenService:Create(${varName}, TweenInfo.new(${p.tweenTime ?? 0.3}, Enum.EasingStyle.Back, Enum.EasingDirection.Out), { Size = originalSize })`);
        lines.push(`openTween:Play()`);
      }
      emitEventBinding(lines, p.onOpen, "");
      break;
    }

    // §3.7 TabContainer — Frame + TabBar + Content + 标签切换
    case "TabContainer": {
      const tabs = p.tabs && p.tabs.length > 0 ? p.tabs : [{ label: "Tab 1" }, { label: "Tab 2" }];
      lines.push(`-- TabContainer tab bar`);
      lines.push(`local ${varName}TabBar = Instance.new("Frame")`);
      lines.push(`${varName}TabBar.Name = "TabBar"`);
      lines.push(`${varName}TabBar.Size = UDim2.new(1, 0, 0, ${p.tabBarHeight ?? 36})`);
      lines.push(`${varName}TabBar.BackgroundColor3 = ${color3ToLuau(p.tabBarColor ?? { r: 0.2, g: 0.2, b: 0.25 })}`);
      lines.push(`${varName}TabBar.BorderSizePixel = 0`);
      lines.push(`${varName}TabBar.Parent = ${varName}`);
      lines.push(``);
      lines.push(`local ${varName}Content = Instance.new("Frame")`);
      lines.push(`${varName}Content.Name = "Content"`);
      lines.push(`${varName}Content.Size = UDim2.new(1, 0, 1, ${-(p.tabBarHeight ?? 36)})`);
      lines.push(`${varName}Content.Position = UDim2.new(0, 0, 0, ${p.tabBarHeight ?? 36})`);
      lines.push(`${varName}Content.BackgroundColor3 = ${color3ToLuau(p.contentBackgroundColor ?? { r: 0.13, g: 0.13, b: 0.16 })}`);
      lines.push(`${varName}Content.BackgroundTransparency = ${p.contentTransparency ?? 0}`);
      lines.push(`${varName}Content.BorderSizePixel = 0`);
      lines.push(`${varName}Content.Parent = ${varName}`);
      lines.push(``);
      lines.push(`local tabButtons = {}`);
      lines.push(`local tabPages = {}`);
      lines.push(`local activeTabIndex = ${(p.defaultTabIndex ?? 0) + 1}`);
      lines.push(``);
      tabs.forEach((tab, i) => {
        const idx = i + 1;
        lines.push(`-- Tab ${idx}: ${tab.label}`);
        lines.push(`local tabBtn${idx} = Instance.new("TextButton")`);
        lines.push(`tabBtn${idx}.Name = "Tab_${tab.label}"`);
        lines.push(`tabBtn${idx}.Size = UDim2.new(0, 80, 1, -8)`);
        lines.push(`tabBtn${idx}.Position = UDim2.new(0, ${(i * 84) + (p.tabPadding ?? 8)}, 0, 4)`);
        lines.push(`tabBtn${idx}.Text = "${escapeString(tab.label)}"`);
        lines.push(`tabBtn${idx}.TextColor3 = ${i === (p.defaultTabIndex ?? 0) ? color3ToLuau(p.activeTabTextColor ?? { r: 1, g: 1, b: 1 }) : color3ToLuau(p.tabTextColor ?? { r: 0.7, g: 0.7, b: 0.75 })}`);
        lines.push(`tabBtn${idx}.TextSize = ${p.tabTextSize ?? 14}`);
        lines.push(`tabBtn${idx}.BackgroundColor3 = ${i === (p.defaultTabIndex ?? 0) ? color3ToLuau(p.activeTabColor ?? { r: 0.429, g: 0.365, b: 0.984 }) : color3ToLuau(p.tabBarColor ?? { r: 0.2, g: 0.2, b: 0.25 })}`);
        lines.push(`tabBtn${idx}.BorderSizePixel = 0`);
        lines.push(`tabBtn${idx}.Parent = ${varName}TabBar`);
        lines.push(`table.insert(tabButtons, tabBtn${idx})`);
        lines.push(``);
        lines.push(`local tabPage${idx} = Instance.new("Frame")`);
        lines.push(`tabPage${idx}.Name = "Page_${tab.label}"`);
        lines.push(`tabPage${idx}.Size = UDim2.new(1, 0, 1, 0)`);
        lines.push(`tabPage${idx}.BackgroundTransparency = 1`);
        lines.push(`tabPage${idx}.Visible = ${i === (p.defaultTabIndex ?? 0) ? "true" : "false"}`);
        lines.push(`tabPage${idx}.Parent = ${varName}Content`);
        lines.push(`table.insert(tabPages, tabPage${idx})`);
        lines.push(``);
      });
      lines.push(`local function switchTab(newIndex)`);
      lines.push(`  if newIndex == activeTabIndex then return end`);
      lines.push(`  tabPages[activeTabIndex].Visible = false`);
      lines.push(`  tabPages[newIndex].Visible = true`);
      lines.push(`  activeTabIndex = newIndex`);
      lines.push(`  for i, tab in ipairs(tabButtons) do`);
      lines.push(`    tab.BackgroundColor3 = (i == newIndex) and ${color3ToLuau(p.activeTabColor ?? { r: 0.429, g: 0.365, b: 0.984 })} or ${color3ToLuau(p.tabBarColor ?? { r: 0.2, g: 0.2, b: 0.25 })}`);
      lines.push(`    tab.TextColor3 = (i == newIndex) and ${color3ToLuau(p.activeTabTextColor ?? { r: 1, g: 1, b: 1 })} or ${color3ToLuau(p.tabTextColor ?? { r: 0.7, g: 0.7, b: 0.75 })}`);
      lines.push(`  end`);
      lines.push(`end`);
      lines.push(``);
      tabs.forEach((_, i) => {
        lines.push(`tabButtons[${i + 1}].MouseButton1Click:Connect(function() switchTab(${i + 1}) end)`);
      });
      break;
    }

    // §3.8 DropdownMenu — TextButton + Arrow + DropdownList + 选项按钮
    case "DropdownMenu": {
      const options = p.options && p.options.length > 0 ? p.options : ["Option 1", "Option 2"];
      lines.push(`-- DropdownMenu arrow`);
      lines.push(`local ${varName}Arrow = Instance.new("TextLabel")`);
      lines.push(`${varName}Arrow.Name = "Arrow"`);
      lines.push(`${varName}Arrow.Size = UDim2.new(0, 20, 1, 0)`);
      lines.push(`${varName}Arrow.Position = UDim2.new(1, -25, 0, 0)`);
      lines.push(`${varName}Arrow.Text = "\\u{25BC}"`);
      lines.push(`${varName}Arrow.TextColor3 = ${color3ToLuau(p.arrowColor ?? { r: 0.7, g: 0.7, b: 0.75 })}`);
      lines.push(`${varName}Arrow.TextSize = ${(p.textSize ?? 14) - 2}`);
      lines.push(`${varName}Arrow.BackgroundTransparency = 1`);
      lines.push(`${varName}Arrow.Parent = ${varName}`);
      lines.push(``);
      lines.push(`-- DropdownMenu list`);
      lines.push(`local ${varName}List = Instance.new("Frame")`);
      lines.push(`${varName}List.Name = "DropdownList"`);
      lines.push(`${varName}List.Size = UDim2.new(1, 0, 0, 0)`);
      lines.push(`${varName}List.Position = UDim2.new(0, 0, 1, 2)`);
      lines.push(`${varName}List.BackgroundColor3 = ${color3ToLuau(p.dropdownBackgroundColor ?? { r: 0.18, g: 0.18, b: 0.22 })}`);
      lines.push(`${varName}List.BorderSizePixel = ${p.borderSizePixel ?? 1}`);
      lines.push(`${varName}List.ClipsDescendants = true`);
      lines.push(`${varName}List.Visible = false`);
      lines.push(`${varName}List.ZIndex = 50`);
      lines.push(`${varName}List.Parent = ${varName}`);
      lines.push(``);
      lines.push(`local isOpen = false`);
      const optHeight = p.optionHeight ?? 30;
      const listHeight = Math.min(options.length * optHeight, p.dropdownMaxHeight ?? 150);
      lines.push(`local listHeight = ${listHeight}`);
      lines.push(``);
      options.forEach((opt, i) => {
        lines.push(`-- Option: ${opt}`);
        lines.push(`local opt${i} = Instance.new("TextButton")`);
        lines.push(`opt${i}.Name = "Option_${opt}"`);
        lines.push(`opt${i}.Size = UDim2.new(1, 0, 0, ${optHeight})`);
        lines.push(`opt${i}.Position = UDim2.new(0, 0, 0, ${i * optHeight})`);
        lines.push(`opt${i}.Text = "${escapeString(opt)}"`);
        lines.push(`opt${i}.TextColor3 = ${color3ToLuau(p.optionTextColor ?? { r: 0.9, g: 0.9, b: 0.9 })}`);
        lines.push(`opt${i}.TextSize = ${p.textSize ?? 14}`);
        lines.push(`opt${i}.BackgroundTransparency = 1`);
        lines.push(`opt${i}.ZIndex = 51`);
        lines.push(`opt${i}.Parent = ${varName}List`);
        lines.push(`opt${i}.MouseEnter:Connect(function()`);
        lines.push(`  opt${i}.BackgroundColor3 = ${color3ToLuau(p.hoverColor ?? { r: 0.429, g: 0.365, b: 0.984 })}`);
        lines.push(`  opt${i}.TextColor3 = ${color3ToLuau(p.hoverTextColor ?? { r: 1, g: 1, b: 1 })}`);
        lines.push(`  opt${i}.BackgroundTransparency = 0`);
        lines.push(`end)`);
        lines.push(`opt${i}.MouseLeave:Connect(function() opt${i}.BackgroundTransparency = 1 end)`);
        lines.push(`opt${i}.MouseButton1Click:Connect(function()`);
        lines.push(`  ${varName}.Text = "${escapeString(opt)}"`);
        lines.push(`  isOpen = false`);
        if (p.onSelectionChanged?.script) {
          const replaced = p.onSelectionChanged.script.replace(/\{selected\}/g, `"${opt}"`);
          for (const cl of replaced.split("\n")) {
            const t = cl.trim();
            if (t) lines.push(`  ${t}`);
          }
        }
        lines.push(`end)`);
        lines.push(``);
      });
      lines.push(`-- DropdownMenu toggle`);
      lines.push(`local TweenService = game:GetService("TweenService")`);
      lines.push(`${varName}.MouseButton1Click:Connect(function()`);
      lines.push(`  isOpen = not isOpen`);
      lines.push(`  if isOpen then`);
      lines.push(`    ${varName}List.Visible = true`);
      lines.push(`    TweenService:Create(${varName}List, TweenInfo.new(${p.openTweenTime ?? 0.2}), { Size = UDim2.new(1, 0, 0, listHeight) }):Play()`);
      lines.push(`  else`);
      lines.push(`    TweenService:Create(${varName}List, TweenInfo.new(${p.closeTweenTime ?? 0.15}), { Size = UDim2.new(1, 0, 0, 0) }):Play()`);
      lines.push(`    task.delay(${p.closeTweenTime ?? 0.15}, function() if not isOpen then ${varName}List.Visible = false end end)`);
      lines.push(`  end`);
      lines.push(`end)`);
      break;
    }

    // §3.9 SliderBar — Frame + Track + Fill + Handle + 拖拽
    case "SliderBar": {
      const isH = p.orientation !== "Vertical";
      lines.push(`-- SliderBar track`);
      lines.push(`local ${varName}Track = Instance.new("Frame")`);
      lines.push(`${varName}Track.Name = "Track"`);
      if (isH) {
        lines.push(`${varName}Track.Size = UDim2.new(1, 0, 0, ${p.trackThickness ?? 6})`);
        lines.push(`${varName}Track.Position = UDim2.new(0, 0, 0.5, ${-Math.round((p.trackThickness ?? 6) / 2)})`);
      } else {
        lines.push(`${varName}Track.Size = UDim2.new(0, ${p.trackThickness ?? 6}, 1, 0)`);
        lines.push(`${varName}Track.Position = UDim2.new(0.5, ${-Math.round((p.trackThickness ?? 6) / 2)}, 0, 0)`);
      }
      lines.push(`${varName}Track.BackgroundColor3 = ${color3ToLuau(p.trackColor ?? { r: 0.25, g: 0.25, b: 0.3 })}`);
      lines.push(`${varName}Track.BorderSizePixel = 0`);
      lines.push(`${varName}Track.Parent = ${varName}`);
      lines.push(``);
      if (p.showFill) {
        lines.push(`local ${varName}Fill = Instance.new("Frame")`);
        lines.push(`${varName}Fill.Name = "Fill"`);
        const ratio = ((p.defaultValue ?? 50) - (p.minValue ?? 0)) / Math.max(1, (p.maxValue ?? 100) - (p.minValue ?? 0));
        if (isH) lines.push(`${varName}Fill.Size = UDim2.new(${ratio.toFixed(4)}, 0, 1, 0)`);
        else lines.push(`${varName}Fill.Size = UDim2.new(1, 0, ${ratio.toFixed(4)}, 0)`);
        lines.push(`${varName}Fill.BackgroundColor3 = ${color3ToLuau(p.fillColor ?? { r: 0.429, g: 0.365, b: 0.984 })}`);
        lines.push(`${varName}Fill.BorderSizePixel = 0`);
        lines.push(`${varName}Fill.Parent = ${varName}Track`);
        lines.push(``);
      }
      lines.push(`-- SliderBar handle`);
      lines.push(`local ${varName}Handle = Instance.new("TextButton")`);
      lines.push(`${varName}Handle.Name = "Handle"`);
      lines.push(`${varName}Handle.Size = UDim2.new(0, ${p.handleSize ?? 16}, 0, ${p.handleSize ?? 16})`);
      lines.push(`${varName}Handle.BackgroundColor3 = ${color3ToLuau(p.handleColor ?? { r: 1, g: 1, b: 1 })}`);
      lines.push(`${varName}Handle.BorderSizePixel = ${p.handleBorderThickness ?? 2}`);
      lines.push(`${varName}Handle.BorderColor3 = ${color3ToLuau(p.handleBorderColor ?? { r: 0.429, g: 0.365, b: 0.984 })}`);
      lines.push(`${varName}Handle.Text = ""`);
      lines.push(`${varName}Handle.AutoButtonColor = false`);
      lines.push(`${varName}Handle.Parent = ${varName}Track`);
      lines.push(``);
      if (p.showValue) {
        lines.push(`local ${varName}Value = Instance.new("TextLabel")`);
        lines.push(`${varName}Value.Name = "ValueLabel"`);
        lines.push(`${varName}Value.Size = UDim2.new(0, 50, 0, 20)`);
        lines.push(`${varName}Value.Position = UDim2.new(1, -50, 0, -24)`);
        lines.push(`${varName}Value.Text = string.format("${p.valueFormat ?? "%d"}", ${p.defaultValue ?? 50})`);
        lines.push(`${varName}Value.TextColor3 = ${color3ToLuau(p.valueTextColor ?? { r: 0.9, g: 0.9, b: 0.9 })}`);
        lines.push(`${varName}Value.TextSize = ${p.valueTextSize ?? 12}`);
        lines.push(`${varName}Value.BackgroundTransparency = 1`);
        lines.push(`${varName}Value.Parent = ${varName}`);
        lines.push(``);
      }
      lines.push(`-- SliderBar dragging behavior`);
      lines.push(`local UserInputService = game:GetService("UserInputService")`);
      lines.push(`local minValue = ${p.minValue ?? 0}`);
      lines.push(`local maxValue = ${p.maxValue ?? 100}`);
      lines.push(`local step = ${p.step ?? 1}`);
      lines.push(`local currentValue = ${p.defaultValue ?? 50}`);
      lines.push(`local dragging = false`);
      lines.push(``);
      lines.push(`local function updateHandlePosition()`);
      lines.push(`  local r = (currentValue - minValue) / (maxValue - minValue)`);
      if (isH) lines.push(`  ${varName}Handle.Position = UDim2.new(r, ${-Math.round((p.handleSize ?? 16) / 2)}, 0.5, ${-Math.round((p.handleSize ?? 16) / 2)})`);
      else lines.push(`  ${varName}Handle.Position = UDim2.new(0.5, ${-Math.round((p.handleSize ?? 16) / 2)}, 1 - r, ${-Math.round((p.handleSize ?? 16) / 2)})`);
      if (p.showFill) {
        if (isH) lines.push(`  ${varName}Fill.Size = UDim2.new(r, 0, 1, 0)`);
        else lines.push(`  ${varName}Fill.Size = UDim2.new(1, 0, r, 0)`);
      }
      lines.push(`end`);
      lines.push(`updateHandlePosition()`);
      lines.push(``);
      lines.push(`${varName}Handle.InputBegan:Connect(function(input)`);
      lines.push(`  if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then dragging = true end`);
      lines.push(`end)`);
      lines.push(`UserInputService.InputChanged:Connect(function(input)`);
      lines.push(`  if not dragging then return end`);
      lines.push(`  if input.UserInputType ~= Enum.UserInputType.MouseMovement and input.UserInputType ~= Enum.UserInputType.Touch then return end`);
      lines.push(`  local trackAbs = ${varName}Track.AbsolutePosition`);
      lines.push(`  local trackSize = ${varName}Track.AbsoluteSize`);
      if (isH) lines.push(`  local r = math.clamp((input.Position.X - trackAbs.X) / trackSize.X, 0, 1)`);
      else lines.push(`  local r = math.clamp(1 - (input.Position.Y - trackAbs.Y) / trackSize.Y, 0, 1)`);
      lines.push(`  local raw = minValue + r * (maxValue - minValue)`);
      lines.push(`  currentValue = math.clamp(math.floor(raw / step + 0.5) * step, minValue, maxValue)`);
      lines.push(`  updateHandlePosition()`);
      if (p.showValue) lines.push(`  ${varName}Value.Text = string.format("${p.valueFormat ?? "%d"}", currentValue)`);
      emitEventBinding(lines, p.onValueChanged, "  ");
      lines.push(`end)`);
      lines.push(`UserInputService.InputEnded:Connect(function(input)`);
      lines.push(`  if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then dragging = false end`);
      lines.push(`end)`);
      break;
    }

    // §3.10 NotificationToast — Frame + Title + Message + 进度条 + 滑入 + 自动消失
    case "NotificationToast": {
      lines.push(`-- NotificationToast content`);
      lines.push(`local ${varName}Title = Instance.new("TextLabel")`);
      lines.push(`${varName}Title.Name = "Title"`);
      lines.push(`${varName}Title.Size = UDim2.new(1, -24, 0, ${(p.titleTextSize ?? 16) + 6})`);
      lines.push(`${varName}Title.Position = UDim2.new(0, 12, 0, 8)`);
      lines.push(`${varName}Title.BackgroundTransparency = 1`);
      lines.push(`${varName}Title.Text = "${escapeString(p.text ?? "")}"`);
      lines.push(`${varName}Title.TextColor3 = ${color3ToLuau(p.toastTitleColor ?? p.titleColor ?? { r: 1, g: 1, b: 1 })}`);
      lines.push(`${varName}Title.TextSize = ${p.titleTextSize ?? 16}`);
      lines.push(`${varName}Title.Font = Enum.Font.${p.font ?? "Gotham"}`);
      lines.push(`${varName}Title.TextXAlignment = Enum.TextXAlignment.Left`);
      lines.push(`${varName}Title.Parent = ${varName}`);
      lines.push(``);
      lines.push(`local ${varName}Message = Instance.new("TextLabel")`);
      lines.push(`${varName}Message.Name = "Message"`);
      lines.push(`${varName}Message.Size = UDim2.new(1, -24, 1, ${-((p.titleTextSize ?? 16) + 22)})`);
      lines.push(`${varName}Message.Position = UDim2.new(0, 12, 0, ${(p.titleTextSize ?? 16) + 16})`);
      lines.push(`${varName}Message.BackgroundTransparency = 1`);
      lines.push(`${varName}Message.Text = "${escapeString(p.placeholder ?? "")}"`);
      lines.push(`${varName}Message.TextColor3 = ${color3ToLuau(p.messageColor ?? { r: 0.8, g: 0.8, b: 0.85 })}`);
      lines.push(`${varName}Message.TextSize = ${p.messageTextSize ?? 13}`);
      lines.push(`${varName}Message.Font = Enum.Font.${p.font ?? "Gotham"}`);
      lines.push(`${varName}Message.TextXAlignment = Enum.TextXAlignment.Left`);
      lines.push(`${varName}Message.TextWrapped = true`);
      lines.push(`${varName}Message.Parent = ${varName}`);
      lines.push(``);
      if (p.showProgressBar) {
        lines.push(`local ${varName}Progress = Instance.new("Frame")`);
        lines.push(`${varName}Progress.Name = "ProgressBar"`);
        lines.push(`${varName}Progress.Size = UDim2.new(1, 0, 0, ${p.progressBarHeight ?? 3})`);
        lines.push(`${varName}Progress.Position = UDim2.new(0, 0, 1, ${-(p.progressBarHeight ?? 3)})`);
        lines.push(`${varName}Progress.BackgroundColor3 = ${color3ToLuau(p.progressBarColor ?? { r: 0.429, g: 0.365, b: 0.984 })}`);
        lines.push(`${varName}Progress.BorderSizePixel = 0`);
        lines.push(`${varName}Progress.Parent = ${varName}`);
        lines.push(``);
      }
      lines.push(`-- NotificationToast slide-in + auto-dismiss`);
      lines.push(`local TweenService = game:GetService("TweenService")`);
      lines.push(`local originalPosition = ${varName}.Position`);
      const slideOffset = p.slideDirection === "Left" ? "UDim2.new(1, 50, 0, 0)"
        : p.slideDirection === "Right" ? "UDim2.new(-1, -50, 0, 0)"
        : p.slideDirection === "Top" ? "UDim2.new(0, 0, -1, -50)"
        : "UDim2.new(0, 0, 1, 50)";
      lines.push(`${varName}.Position = originalPosition + ${slideOffset}`);
      lines.push(`TweenService:Create(${varName}, TweenInfo.new(${p.slideTweenTime ?? 0.3}, Enum.EasingStyle.Quart, Enum.EasingDirection.Out), { Position = originalPosition }):Play()`);
      lines.push(``);
      lines.push(`task.spawn(function()`);
      lines.push(`  local dur = ${p.duration ?? 4}`);
      lines.push(`  local elapsed = 0`);
      lines.push(`  while elapsed < dur do`);
      lines.push(`    local dt = task.wait(0.05)`);
      lines.push(`    elapsed = elapsed + dt`);
      if (p.showProgressBar) lines.push(`    ${varName}Progress.Size = UDim2.new(1 - (elapsed / dur), 0, 0, ${p.progressBarHeight ?? 3})`);
      lines.push(`  end`);
      lines.push(`  local fadeTween = TweenService:Create(${varName}, TweenInfo.new(${p.fadeOutTime ?? 0.3}), { BackgroundTransparency = 1 })`);
      lines.push(`  fadeTween:Play()`);
      lines.push(`  fadeTween.Completed:Wait()`);
      lines.push(`  ${varName}:Destroy()`);
      lines.push(`end)`);
      if (p.dismissible) {
        lines.push(``);
        lines.push(`${varName}.InputBegan:Connect(function(input)`);
        lines.push(`  if input.UserInputType == Enum.UserInputType.MouseButton1 then ${varName}:Destroy() end`);
        lines.push(`end)`);
      }
      break;
    }

    // §3.11 TweenedFrame — Frame + 预设动画 Tween
    case "TweenedFrame": {
      lines.push(`-- TweenedFrame animation`);
      lines.push(`local TweenService = game:GetService("TweenService")`);
      lines.push(`local tweenInfo = TweenInfo.new(${p.tweenTime ?? 0.5}, Enum.EasingStyle.${p.easingStyle ?? "Quad"}, Enum.EasingDirection.${p.easingDirection ?? "Out"}, ${p.repeatCount ?? 0}, ${p.reverses ?? false}, ${p.delayTime ?? 0})`);
      lines.push(``);
      const preset = p.presetAnimation ?? "FadeIn";
      const presetTargets: Record<string, string> = {
        FadeIn: `BackgroundTransparency = 0`,
        SlideUp: `Position = UDim2.new(${formatNum(p.position.scaleX)}, ${Math.round(p.position.offsetX)}, ${formatNum(p.position.scaleY)}, ${Math.round((p.position.offsetY) - 50)})`,
        SlideDown: `Position = UDim2.new(${formatNum(p.position.scaleX)}, ${Math.round(p.position.offsetX)}, ${formatNum(p.position.scaleY)}, ${Math.round((p.position.offsetY) + 50)})`,
        SlideLeft: `Position = UDim2.new(${formatNum(p.position.scaleX)}, ${Math.round((p.position.offsetX) - 50)}, ${formatNum(p.position.scaleY)}, ${Math.round(p.position.offsetY)})`,
        SlideRight: `Position = UDim2.new(${formatNum(p.position.scaleX)}, ${Math.round((p.position.offsetX) + 50)}, ${formatNum(p.position.scaleY)}, ${Math.round(p.position.offsetY)})`,
        ScaleUp: `Size = UDim2.new(${formatNum(p.size.scaleX * 1.2)}, ${Math.round(p.size.offsetX)}, ${formatNum(p.size.scaleY * 1.2)}, ${Math.round(p.size.offsetY)})`,
        ScaleDown: `Size = UDim2.new(${formatNum(p.size.scaleX * 0.8)}, ${Math.round(p.size.offsetX)}, ${formatNum(p.size.scaleY * 0.8)}, ${Math.round(p.size.offsetY)})`,
        BounceIn: `Size = ${udim2ToLuau(p.size)}`,
      };
      const initialStates: Record<string, string[]> = {
        FadeIn: [`${varName}.BackgroundTransparency = 1`],
        BounceIn: [`${varName}.Size = UDim2.new(0, 0, 0, 0)`],
      };
      if (initialStates[preset]) {
        for (const s of initialStates[preset]) lines.push(s);
        lines.push(``);
      }
      const targetStr = preset === "Custom"
        ? [
          p.targetSize ? `Size = ${udim2ToLuau(p.targetSize)}` : null,
          p.targetPosition ? `Position = ${udim2ToLuau(p.targetPosition)}` : null,
          p.targetTransparency !== undefined ? `BackgroundTransparency = ${formatNum(p.targetTransparency)}` : null,
          p.targetColor ? `BackgroundColor3 = ${color3ToLuau(p.targetColor)}` : null,
        ].filter(Boolean).join(", ")
        : (presetTargets[preset] ?? `BackgroundTransparency = 0`);
      lines.push(`local tween = TweenService:Create(${varName}, tweenInfo, { ${targetStr} })`);
      const trigger = p.trigger ?? "OnCreated";
      if (trigger === "OnCreated") {
        lines.push(`tween:Play()`);
      } else if (trigger === "OnActivated") {
        lines.push(`${varName}.Activated:Connect(function() tween:Play() end)`);
      } else if (trigger === "OnHover") {
        lines.push(`${varName}.MouseEnter:Connect(function() tween:Play() end)`);
      } else {
        lines.push(`-- Manual trigger`);
        lines.push(`-- External code can call tween:Play() / tween:Pause()`);
      }
      break;
    }
  }
}

/** SOP-3I-02: Vector2 → Luau（UISizeConstraint 用；Infinity → math.huge） */
function vector2ToLuau(v: { x: number; y: number }): string {
  const x = v.x === Infinity ? "math.huge" : v.x === -Infinity ? "-math.huge" : `${Math.round(v.x)}`;
  const y = v.y === Infinity ? "math.huge" : v.y === -Infinity ? "-math.huge" : `${Math.round(v.y)}`;
  return `Vector2.new(${x}, ${y})`;
}

export interface GenerateLuauOptions {
  client?: boolean;
  server?: boolean;
}

export function generateLuau(
  elements: Record<string, GUIElement>,
  rootId: string | null,
  options?: GenerateLuauOptions,
): string {
  const isClient = options?.client ?? !options?.server;
  const root = rootId ? elements[rootId] : null;
  if (!root) return "-- No root element found";

  const lines: string[] = [];
  lines.push("-- ============================================================");
  lines.push("-- Generated by Roblox GUI Maker");
  lines.push(`-- GUI: ${escapeString(root.name)}`);
  lines.push(`-- Mode: ${isClient ? "Client (LocalScript)" : "Server (Script)"}`);
  lines.push(`-- Generated at: ${new Date().toISOString()}`);
  lines.push("-- ============================================================");
  lines.push("");

  if (isClient) {
    lines.push('local Players = game:GetService("Players")');
    lines.push("local player = Players.LocalPlayer");
    lines.push('local PlayerGui = player:WaitForChild("PlayerGui")');
  } else {
    lines.push('local ReplicatedStorage = game:GetService("ReplicatedStorage")');
  }
  lines.push("");

  const effectiveRootId = rootId!;

  const varNames = buildVarNames(elements, effectiveRootId);
  const allElements = collectElementsBFS(elements, effectiveRootId);

  // Create root ScreenGui
  const rootVar = varNames[root.id];
  lines.push(`-- Create ${root.name}`);
  lines.push(`local ${rootVar} = Instance.new("${root.type}")`);
  lines.push(`${rootVar}.Name = "${escapeString(root.name)}"`);
  lines.push(`${rootVar}.ResetOnSpawn = false`);
  lines.push(`${rootVar}.IgnoreGuiInset = true`);
  lines.push(`${rootVar}.ZIndexBehavior = Enum.ZIndexBehavior.Sibling`);
  lines.push("");

  // Create non-effect elements as variables
  for (const el of allElements) {
    if (el.id === rootId) continue;
    if (isEffectLike(el.type)) continue;
    const varName = varNames[el.id];
    lines.push(`-- Create ${el.name} (${el.type})`);
    lines.push(`local ${varName} = Instance.new("${robloxBasename(el.type)}")`);
    lines.push(`${varName}.Name = "${escapeString(el.name)}"`);
    applyElementProperties(lines, el, varName);
    lines.push("");
  }

  // Parent elements (root first, then children BFS)
  for (const el of allElements) {
    if (el.id === rootId) continue;
    if (isEffectLike(el.type)) continue;

    const varName = varNames[el.id];
    const parentVar = el.parentId ? varNames[el.parentId] ?? rootVar : rootVar;

    // Inline UI effects before parenting the visual element
    const childEffects = el.children
      .map((cid) => elements[cid])
      .filter((c): c is GUIElement => Boolean(c) && isEffectLike(c.type));
    for (const effect of childEffects) {
      generateEffectInline(lines, effect, varName);
    }

    lines.push(`${varName}.Parent = ${parentVar}`);

    // SOP-3I-07: 交互复合组件 — 主实例已生成，追加子实例 + 行为脚本
    if (isInteractiveComposite(el.type)) {
      generateCompositePostCreation(lines, el, varName);
      lines.push("");
    }

    // If parent has a layout, assign LayoutOrder based on zIndex for predictability
    const parentEl = el.parentId ? elements[el.parentId] : root;
    const parentHasLayout = parentEl?.children.some((cid) => {
      const c = elements[cid];
      return c && (c.type === "UIListLayout" || c.type === "UIGridLayout");
    });
    if (parentHasLayout) {
      lines.push(`${varName}.LayoutOrder = ${el.zIndex}`);
    }

    lines.push("");
  }

  // Parent root
  if (isClient) {
    lines.push(`${rootVar}.Parent = PlayerGui`);
  } else {
    lines.push(`${rootVar}.Parent = ReplicatedStorage`);
    lines.push("");
    lines.push("-- To use this GUI on the client, clone it from ReplicatedStorage into PlayerGui");
  }

  lines.push("");
  lines.push(`print("GUI loaded: ${escapeString(root.name)}")`);

  return lines.join("\n");
}

export function generateClientLuau(
  elements: Record<string, GUIElement>,
  rootId: string | null,
): string {
  return generateLuau(elements, rootId, { client: true });
}

export function generateServerLuau(
  elements: Record<string, GUIElement>,
  rootId: string | null,
): string {
  return generateLuau(elements, rootId, { server: true });
}

interface JSONExport {
  version: string;
  exportedAt: string;
  gui: {
    name: string;
    elements: Array<{
      id: string;
      type: GUIElementType;
      name: string;
      parentId: string | null;
      children: string[];
      properties: ElementProperties;
      zIndex: number;
    }>;
  };
}

/**
 * 生成项目 JSON 字符串（供 ZIP 打包或独立导出）。
 * 注意：useEditorState.exportJSON 是 UI 使用的封装，这里提供函数版本。
 */
export function generateProjectJSON(
  elements: Record<string, GUIElement>,
  rootId: string | null,
): string {
  const root = rootId ? elements[rootId] : null;
  if (!root) return "{}";

  const exportData: JSONExport = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    gui: {
      name: root.name,
      elements: [],
    },
  };

  for (const el of collectElementsBFS(elements, rootId!)) {
    exportData.gui.elements.push({
      id: el.id,
      type: el.type,
      name: el.name,
      parentId: el.parentId,
      children: [...el.children],
      properties: JSON.parse(JSON.stringify(el.properties)) as ElementProperties,
      zIndex: el.zIndex,
    });
  }

  return JSON.stringify(exportData, null, 2);
}
