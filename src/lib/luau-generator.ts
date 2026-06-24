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
} from "./types";

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

const UI_EFFECT_TYPES: ReadonlySet<GUIElementType> = new Set([
  "UICorner",
  "UIGradient",
  "UIListLayout",
  "UIGridLayout",
  "UIPadding",
]);

function isUIEffect(type: GUIElementType): boolean {
  return UI_EFFECT_TYPES.has(type);
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
  const needsSpatial =
    el.type !== "ScreenGui" &&
    el.type !== "UICorner" &&
    el.type !== "UIGradient" &&
    el.type !== "UIListLayout" &&
    el.type !== "UIGridLayout" &&
    el.type !== "UIPadding";

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
  }
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
    if (isUIEffect(el.type)) continue;
    const varName = varNames[el.id];
    lines.push(`-- Create ${el.name} (${el.type})`);
    lines.push(`local ${varName} = Instance.new("${el.type}")`);
    lines.push(`${varName}.Name = "${escapeString(el.name)}"`);
    applyElementProperties(lines, el, varName);
    lines.push("");
  }

  // Parent elements (root first, then children BFS)
  for (const el of allElements) {
    if (el.id === rootId) continue;
    if (isUIEffect(el.type)) continue;

    const varName = varNames[el.id];
    const parentVar = el.parentId ? varNames[el.parentId] ?? rootVar : rootVar;

    // Inline UI effects before parenting the visual element
    const childEffects = el.children
      .map((cid) => elements[cid])
      .filter((c): c is GUIElement => Boolean(c) && isUIEffect(c.type));
    for (const effect of childEffects) {
      generateEffectInline(lines, effect, varName);
    }

    lines.push(`${varName}.Parent = ${parentVar}`);

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
