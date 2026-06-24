/**
 * SOP-3F-12: OpenRouter AI 生成配置与工具
 *
 * 包含：
 * - system prompt + user prompt 构建
 * - AI 输出规范化（嵌套/扁平元素树 → Record<id, GUIElement>）
 * - Mock 生成器（无 OPENROUTER_API_KEY 时 fallback）
 *
 * 本文件可在服务端路由与客户端 AI 面板共用（无 server-only 依赖）。
 */

import { v4 as uuidv4 } from "uuid";
import {
  type GUIElement,
  type GUIElementType,
  type ElementProperties,
  type AIGenerationRequest,
  GUI_ELEMENT_TYPES,
  getDefaultProperties,
} from "./types";

/**
 * 按优先级排列的 OpenRouter 模型 fallback 链
 *
 * 2026-06-21 实测区域可用性诊断（key 有效，但部分模型在当前区域被禁）：
 *   - anthropic/claude-3.5-sonnet → 404（slug 已下线）
 *   - openai/gpt-4o / gpt-4o-mini → 403 "not available in your region"
 *   - deepseek/deepseek-chat → ✅ 200（StreamLake 供应商）
 *   - qwen/qwen-2.5-72b-instruct → ✅ 200（DeepInfra）
 *   - meta-llama/llama-3.3-70b-instruct → ✅ 200（Novita）
 *
 * 故 fallback 链改为本区域实测可用的 3 个模型。可通过 OPENROUTER_MODEL env 覆盖。
 */
export const OPENROUTER_FALLBACK_MODELS = [
  "deepseek/deepseek-chat",
  "qwen/qwen-2.5-72b-instruct",
  "meta-llama/llama-3.3-70b-instruct",
] as const;

/** 获取实际使用的模型列表（env 优先） */
export function getOpenRouterModels(): string[] {
  const env = process.env.OPENROUTER_MODEL;
  if (env) return env.split(",").map((m) => m.trim()).filter(Boolean);
  return [...OPENROUTER_FALLBACK_MODELS];
}

/** OpenRouter API endpoint */
export const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

/** 构建 system prompt：严格 JSON 输出 + 完整 schema 说明 */
export function buildSystemPrompt(): string {
  return `You are a Roblox GUI generation assistant. Your task is to convert a user's natural-language request into a valid Roblox GUI element tree as compact JSON.

RULES:
1. Output ONLY a single JSON object. No markdown, no explanation, no code fences.
2. The JSON must match this shape:
{
  "elements": [
    {
      "type": "ScreenGui | Frame | TextLabel | TextButton | TextBox | ImageLabel | ImageButton | ScrollingFrame | UICorner | UIGradient | UIListLayout | UIGridLayout | UIPadding",
      "name": "string",
      "parentId": "id of parent or null for ScreenGui root",
      "zIndex": 1,
      "properties": { ... },
      "children": [ /* optional: child element objects or child ids */ ]
    }
  ]
}
3. There must be exactly one root element of type "ScreenGui" with parentId null.
4. All positions and sizes use scale/offset format inside properties.position and properties.size:
   { "scaleX": number, "offsetX": number, "scaleY": number, "offsetY": number }
5. Colors use normalized RGB (0-1) inside properties.backgroundColor3 / textColor3 / gradientColor1 / gradientColor2:
   { "r": number, "g": number, "b": number }
6. Anchor points use { "x": number, "y": number } where 0,0 is top-left and 1,1 is bottom-right.
7. For TextLabel/TextButton/TextBox include properties.text, properties.font (a Roblox font name), properties.textSize, properties.textColor3.
8. For buttons you may set properties.onClick to a short Luau snippet like "print('clicked')".
9. For layout containers you may include UIListLayout/UIGridLayout/UIPadding as children.
10. Keep the design balanced and centered for the requested device (desktop 1024x768 or mobile 375x667).
11. Use the requested style to choose colors (bright/dark/clean/cartoon).
12. If a property is omitted, defaults will be applied; do not invent invalid enum values.

Respond with the JSON object only.`;
}

/** 构建 user prompt */
export function buildUserPrompt(req: AIGenerationRequest): string {
  const deviceSize = req.device === "mobile" ? "375x667" : "1024x768";
  return `Generate a Roblox GUI for the following request.

Prompt: ${req.prompt}
GUI type: ${req.guiType}
Style: ${req.style}
Target device: ${req.device} (${deviceSize})

Return the GUI element tree as JSON.`;
}

function isValidElementType(type: unknown): type is GUIElementType {
  return typeof type === "string" && (GUI_ELEMENT_TYPES as readonly string[]).includes(type);
}

function mergeUDim2(
  def: ElementProperties["position"],
  part?: Partial<ElementProperties["position"]> | null,
): ElementProperties["position"] {
  if (!part) return def;
  return {
    scaleX: typeof part.scaleX === "number" ? part.scaleX : def.scaleX,
    offsetX: typeof part.offsetX === "number" ? part.offsetX : def.offsetX,
    scaleY: typeof part.scaleY === "number" ? part.scaleY : def.scaleY,
    offsetY: typeof part.offsetY === "number" ? part.offsetY : def.offsetY,
  };
}

function mergeColor3(
  def: ElementProperties["backgroundColor3"],
  part?: Partial<ElementProperties["backgroundColor3"]> | null,
): ElementProperties["backgroundColor3"] {
  if (!part) return def;
  return {
    r: typeof part.r === "number" ? part.r : def.r,
    g: typeof part.g === "number" ? part.g : def.g,
    b: typeof part.b === "number" ? part.b : def.b,
  };
}

function mergeAnchor(
  def: ElementProperties["anchorPoint"],
  part?: Partial<ElementProperties["anchorPoint"]> | null,
): ElementProperties["anchorPoint"] {
  if (!part) return def;
  return {
    x: typeof part.x === "number" ? part.x : def.x,
    y: typeof part.y === "number" ? part.y : def.y,
  };
}

function mergeCellSize(
  def: NonNullable<ElementProperties["cellSize"]>,
  part?: Partial<ElementProperties["cellSize"]> | null,
): NonNullable<ElementProperties["cellSize"]> {
  if (!part) return def;
  return {
    x: typeof part.x === "number" ? part.x : def.x,
    y: typeof part.y === "number" ? part.y : def.y,
  };
}

function mergeProperties(
  defaults: ElementProperties,
  input: Partial<ElementProperties> | undefined,
): ElementProperties {
  if (!input) return defaults;
  const out: ElementProperties = { ...defaults };

  if (input.position) out.position = mergeUDim2(defaults.position, input.position);
  if (input.size) out.size = mergeUDim2(defaults.size, input.size);
  if (input.anchorPoint) out.anchorPoint = mergeAnchor(defaults.anchorPoint, input.anchorPoint);
  if (input.backgroundColor3) out.backgroundColor3 = mergeColor3(defaults.backgroundColor3, input.backgroundColor3);
  if (input.textColor3) out.textColor3 = mergeColor3(defaults.textColor3, input.textColor3);
  if (input.gradientColor1 && defaults.gradientColor1) out.gradientColor1 = mergeColor3(defaults.gradientColor1, input.gradientColor1);
  if (input.gradientColor2 && defaults.gradientColor2) out.gradientColor2 = mergeColor3(defaults.gradientColor2, input.gradientColor2);
  if (input.cellSize) out.cellSize = mergeCellSize(defaults.cellSize ?? { x: 100, y: 100 }, input.cellSize);
  if (input.cellPadding) out.cellPadding = mergeCellSize(defaults.cellPadding ?? { x: 8, y: 8 }, input.cellPadding);

  const scalarKeys: Array<keyof ElementProperties> = [
    "backgroundTransparency", "cornerRadius", "text", "font", "textSize",
    "layout", "padding", "onClick", "image", "placeholder",
    "gradientTransparency1", "gradientTransparency2", "gradientRotation",
    "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  ];
  for (const key of scalarKeys) {
    const value = input[key];
    if (value !== undefined) (out as Record<typeof key, unknown>)[key] = value;
  }

  if (input.fillDirection) out.fillDirection = input.fillDirection;
  if (input.sortOrder) out.sortOrder = input.sortOrder;
  if (input.startCorner) out.startCorner = input.startCorner;

  return out;
}

interface FlatAIGeneratedItem {
  rawId?: string;
  type: GUIElementType;
  name: string;
  parentId: string | null;
  zIndex: number;
  properties: Partial<ElementProperties>;
  childIdRefs: string[];
}

function flattenAIGeneratedItem(
  item: unknown,
  parentId: string | null,
  out: FlatAIGeneratedItem[],
): void {
  if (!item || typeof item !== "object") return;
  const it = item as Record<string, unknown>;

  const type = isValidElementType(it.type) ? it.type : "Frame";
  const rawId = typeof it.id === "string" ? it.id : undefined;
  const name = typeof it.name === "string" && it.name ? it.name : type;
  const explicitParentId = typeof it.parentId === "string" ? it.parentId : null;
  const zIndex = typeof it.zIndex === "number" ? it.zIndex : 1;
  const properties = (it.properties && typeof it.properties === "object")
    ? (it.properties as Partial<ElementProperties>)
    : {};

  const childIdRefs: string[] = [];
  const childObjects: unknown[] = [];

  if (Array.isArray(it.children)) {
    for (const child of it.children) {
      if (typeof child === "string") {
        childIdRefs.push(child);
      } else {
        childObjects.push(child);
      }
    }
  }

  out.push({
    rawId,
    type,
    name,
    parentId: explicitParentId ?? parentId,
    zIndex,
    properties,
    childIdRefs,
  });

  const currentId = rawId ?? `__generated_${out.length}`;
  for (const child of childObjects) {
    flattenAIGeneratedItem(child, currentId, out);
  }
}

/** 将 AI 输出的任意结构规范化为元素树映射 */
export function normalizeAIGenerated(
  raw: unknown,
): { elements: Record<string, GUIElement>; rootId: string | null } {
  if (!raw || typeof raw !== "object") {
    throw new Error("AI output is not a JSON object");
  }

  const obj = raw as Record<string, unknown>;
  let sourceList: unknown[] = [];
  if (Array.isArray(obj)) {
    sourceList = obj;
  } else if (Array.isArray(obj.elements)) {
    sourceList = obj.elements;
  } else if (obj.gui && typeof obj.gui === "object" && Array.isArray((obj.gui as Record<string, unknown>).elements)) {
    sourceList = (obj.gui as Record<string, unknown>).elements as unknown[];
  } else {
    throw new Error("AI output missing elements array");
  }

  const flat: FlatAIGeneratedItem[] = [];
  for (const item of sourceList) {
    flattenAIGeneratedItem(item, null, flat);
  }

  // 分配稳定 id
  const idMap: Record<string, string> = {};
  const elements: Record<string, GUIElement> = {};
  let rootId: string | null = null;

  for (let i = 0; i < flat.length; i++) {
    const item = flat[i];
    const id = item.rawId && !idMap[item.rawId] ? item.rawId : uuidv4();
    if (item.rawId) idMap[item.rawId] = id;
    const defaults = getDefaultProperties(item.type);
    const properties = mergeProperties(defaults, item.properties);
    elements[id] = {
      id,
      type: item.type,
      name: item.name,
      parentId: item.parentId,
      children: [],
      properties,
      zIndex: item.zIndex,
    };
    if (item.type === "ScreenGui" && item.parentId === null) {
      rootId = id;
    }
  }

  // 如果 AI 没给 ScreenGui 根节点，创建一个并把顶层元素挂上去
  if (!rootId) {
    const root = uuidv4();
    elements[root] = {
      id: root,
      type: "ScreenGui",
      name: "ScreenGui",
      parentId: null,
      children: [],
      properties: getDefaultProperties("ScreenGui"),
      zIndex: 0,
    };
    rootId = root;
  }

  // 修复 parentId：未指定或为 null 的非根元素挂到 root
  for (const el of Object.values(elements)) {
    if (el.type !== "ScreenGui" && (!el.parentId || !elements[el.parentId])) {
      el.parentId = rootId;
    }
  }

  // 重建 children 数组
  for (const el of Object.values(elements)) {
    if (el.parentId && elements[el.parentId]) {
      const parent = elements[el.parentId];
      if (!parent.children.includes(el.id)) {
        parent.children.push(el.id);
      }
    }
  }

  // 应用显式 child id 引用
  for (const [i, item] of flat.entries()) {
    const id = Object.keys(elements)[i];
    if (!id) continue;
    const el = elements[id];
    for (const ref of item.childIdRefs) {
      const targetId = idMap[ref] ?? ref;
      if (elements[targetId] && !el.children.includes(targetId)) {
        el.children.push(targetId);
        elements[targetId].parentId = id;
      }
    }
  }

  return { elements, rootId };
}

function makeColor(r: number, g: number, b: number): { r: number; g: number; b: number } {
  return { r, g, b };
}

function paletteFor(style: AIGenerationRequest["style"]) {
  switch (style) {
    case "dark":
      return {
        bg: makeColor(0.12, 0.12, 0.14),
        panel: makeColor(0.18, 0.18, 0.22),
        primary: makeColor(0.5, 0.4, 1),
        text: makeColor(0.95, 0.95, 0.97),
        muted: makeColor(0.55, 0.55, 0.6),
      };
    case "clean":
      return {
        bg: makeColor(0.96, 0.97, 0.98),
        panel: makeColor(1, 1, 1),
        primary: makeColor(0.1, 0.1, 0.12),
        text: makeColor(0.1, 0.1, 0.12),
        muted: makeColor(0.45, 0.47, 0.5),
      };
    case "cartoon":
      return {
        bg: makeColor(0.98, 0.95, 0.9),
        panel: makeColor(1, 0.96, 0.88),
        primary: makeColor(1, 0.5, 0.2),
        text: makeColor(0.2, 0.1, 0.05),
        muted: makeColor(0.55, 0.45, 0.35),
      };
    case "bright":
    default:
      return {
        bg: makeColor(0.95, 0.96, 0.98),
        panel: makeColor(1, 1, 1),
        primary: makeColor(0.2, 0.6, 1),
        text: makeColor(0.1, 0.1, 0.1),
        muted: makeColor(0.45, 0.5, 0.55),
      };
  }
}

function udim2(scaleX: number, offsetX: number, scaleY: number, offsetY: number): {
  scaleX: number; offsetX: number; scaleY: number; offsetY: number;
} {
  return { scaleX, offsetX, scaleY, offsetY };
}

/** Mock 生成器：没有 API key 时提供可立即渲染的示例 GUI */
export function generateMockElements(req: AIGenerationRequest): Record<string, GUIElement> {
  const palette = paletteFor(req.style);
  const isMobile = req.device === "mobile";
  const rootId = uuidv4();
  const elements: Record<string, GUIElement> = {};

  elements[rootId] = {
    id: rootId,
    type: "ScreenGui",
    name: "ScreenGui",
    parentId: null,
    children: [],
    properties: getDefaultProperties("ScreenGui"),
    zIndex: 0,
  };

  const add = (
    parentId: string,
    type: GUIElementType,
    name: string,
    overrides: { properties?: Partial<ElementProperties>; zIndex?: number } = {},
  ) => {
    const id = uuidv4();
    const defaults = getDefaultProperties(type);
    const el: GUIElement = {
      id,
      type,
      name,
      parentId,
      children: [],
      properties: overrides.properties ? mergeProperties(defaults, overrides.properties) : defaults,
      zIndex: overrides.zIndex ?? 1,
    };
    elements[id] = el;
    elements[parentId].children.push(id);
    return id;
  };

  const panelWidth = isMobile ? 0.9 : 0.5;
  const panelHeight = isMobile ? 0.7 : 0.65;
  const panelX = (1 - panelWidth) / 2;
  const panelY = (1 - panelHeight) / 2;

  const panelId = add(rootId, "Frame", `${req.guiType}Panel`, {
    properties: {
      position: udim2(panelX, 0, panelY, 0),
      size: udim2(panelWidth, 0, panelHeight, 0),
      backgroundColor3: palette.panel,
      cornerRadius: 16,
    },
  });

  // 标题
  add(panelId, "TextLabel", "Title", {
    properties: {
      position: udim2(0, 0, 0.05, 0),
      size: udim2(1, 0, 0.12, 0),
      backgroundTransparency: 1,
      text: req.prompt.slice(0, 28) || `${req.style} ${req.guiType}`,
      font: "GothamBold",
      textSize: isMobile ? 22 : 28,
      textColor3: palette.text,
    },
    zIndex: 2,
  });

  const makeButton = (label: string, yScale: number, onClick?: string) => {
    const btn = add(panelId, "TextButton", label, {
      properties: {
        position: udim2(0.1, 0, yScale, 0),
        size: udim2(0.8, 0, 0.1, 0),
        backgroundColor3: palette.primary,
        text: label,
        font: "GothamBold",
        textSize: isMobile ? 16 : 18,
        textColor3: req.style === "clean" || req.style === "bright" ? makeColor(1, 1, 1) : makeColor(1, 1, 1),
        onClick: onClick || `print('${label} clicked')`,
      },
    });
    add(btn, "UICorner", "Corner", { properties: { cornerRadius: 8 } });
    return btn;
  };

  switch (req.guiType) {
    case "menu": {
      makeButton("Play", 0.25, "print('Play clicked')");
      makeButton("Settings", 0.4, "print('Open settings')");
      makeButton("Shop", 0.55, "print('Open shop')");
      makeButton("Exit", 0.7, "print('Exit game')");
      break;
    }
    case "shop": {
      add(panelId, "UIGridLayout", "Grid", {
        properties: {
          position: udim2(0, 0, 0, 0),
          size: udim2(1, 0, 1, 0),
          cellSize: { x: isMobile ? 90 : 120, y: isMobile ? 110 : 140 },
          cellPadding: { x: 10, y: 10 },
          paddingTop: 80,
          paddingBottom: 20,
          paddingLeft: 20,
          paddingRight: 20,
        },
      });
      for (let i = 1; i <= 6; i++) {
        const item = add(panelId, "Frame", `Item${i}`, {
          properties: { backgroundColor3: palette.bg, cornerRadius: 8 },
        });
        add(item, "ImageLabel", `ItemImg${i}`, {
          properties: {
            position: udim2(0.1, 0, 0.1, 0),
            size: udim2(0.8, 0, 0.5, 0),
            backgroundColor3: palette.primary,
            image: "rbxassetid://0",
          },
        });
        add(item, "TextLabel", `ItemName${i}`, {
          properties: {
            position: udim2(0, 0, 0.62, 0),
            size: udim2(1, 0, 0.18, 0),
            backgroundTransparency: 1,
            text: `Item ${i}`,
            font: "GothamBold",
            textSize: 14,
            textColor3: palette.text,
          },
        });
        add(item, "TextButton", `Buy${i}`, {
          properties: {
            position: udim2(0.15, 0, 0.8, 0),
            size: udim2(0.7, 0, 0.14, 0),
            backgroundColor3: palette.primary,
            text: "Buy",
            font: "GothamBold",
            textSize: 12,
            onClick: `print('Bought item ${i}')`,
          },
        });
      }
      break;
    }
    case "hud": {
      const hpBar = add(panelId, "Frame", "HealthBar", {
        properties: {
          position: udim2(0.1, 0, 0.35, 0),
          size: udim2(0.8, 0, 0.15, 0),
          backgroundColor3: palette.bg,
          cornerRadius: 8,
        },
      });
      add(hpBar, "Frame", "HealthFill", {
        properties: {
          position: udim2(0, 0, 0, 0),
          size: udim2(0.75, 0, 1, 0),
          backgroundColor3: makeColor(0.96, 0.25, 0.35),
          cornerRadius: 8,
        },
      });
      add(hpBar, "TextLabel", "HP", {
        properties: {
          position: udim2(0, 0, 0, 0),
          size: udim2(1, 0, 1, 0),
          backgroundTransparency: 1,
          text: "HP 75/100",
          font: "GothamBold",
          textSize: 16,
          textColor3: palette.text,
        },
      });
      makeButton("Use Medkit", 0.6);
      makeButton("Open Map", 0.72);
      break;
    }
    case "inventory": {
      const scroll = add(panelId, "ScrollingFrame", "InventoryScroll", {
        properties: {
          position: udim2(0.05, 0, 0.2, 0),
          size: udim2(0.9, 0, 0.7, 0),
          backgroundColor3: palette.bg,
          cornerRadius: 8,
        },
      });
      add(scroll, "UIListLayout", "List", {
        properties: { padding: 8, fillDirection: "vertical", sortOrder: "layoutOrder" },
      });
      add(scroll, "UIPadding", "Pad", {
        properties: { paddingTop: 8, paddingRight: 8, paddingBottom: 8, paddingLeft: 8 },
      });
      for (let i = 1; i <= 5; i++) {
        const row = add(scroll, "Frame", `Slot${i}`, {
          properties: {
            size: udim2(1, 0, 0, isMobile ? 56 : 64),
            backgroundColor3: palette.panel,
            cornerRadius: 6,
          },
          zIndex: i,
        });
        add(row, "ImageLabel", `SlotImg${i}`, {
          properties: {
            position: udim2(0.02, 0, 0.1, 0),
            size: udim2(0, isMobile ? 40 : 48, 0.8, 0),
            backgroundColor3: palette.primary,
            image: "rbxassetid://0",
          },
        });
        add(row, "TextLabel", `SlotName${i}`, {
          properties: {
            position: udim2(0.18, 0, 0, 0),
            size: udim2(0.8, 0, 1, 0),
            backgroundTransparency: 1,
            text: `Slot ${i}: Empty`,
            font: "Gotham",
            textSize: 14,
            textColor3: palette.text,
          },
        });
      }
      break;
    }
    case "settings": {
      add(panelId, "UIListLayout", "List", {
        properties: { padding: 12, fillDirection: "vertical", sortOrder: "layoutOrder" },
      });
      add(panelId, "UIPadding", "Pad", {
        properties: { paddingTop: 80, paddingRight: 24, paddingBottom: 24, paddingLeft: 24 },
      });
      for (const label of ["Music", "SFX", "Notifications"]) {
        const row = add(panelId, "Frame", `${label}Row`, {
          properties: {
            size: udim2(1, 0, 0, 44),
            backgroundColor3: palette.bg,
            cornerRadius: 6,
          },
        });
        add(row, "TextLabel", `${label}Label`, {
          properties: {
            position: udim2(0.05, 0, 0, 0),
            size: udim2(0.5, 0, 1, 0),
            backgroundTransparency: 1,
            text: label,
            font: "GothamBold",
            textSize: 16,
            textColor3: palette.text,
          },
        });
        add(row, "TextButton", `${label}Toggle`, {
          properties: {
            position: udim2(0.7, 0, 0.15, 0),
            size: udim2(0.25, 0, 0.7, 0),
            backgroundColor3: palette.primary,
            text: "ON",
            font: "GothamBold",
            textSize: 12,
            onClick: `print('Toggled ${label}')`,
          },
        });
      }
      break;
    }
    case "custom":
    default: {
      makeButton("Action 1", 0.3);
      makeButton("Action 2", 0.45);
      add(panelId, "TextLabel", "Subtitle", {
        properties: {
          position: udim2(0.1, 0, 0.62, 0),
          size: udim2(0.8, 0, 0.2, 0),
          backgroundTransparency: 1,
          text: "Custom GUI generated by AI",
          font: "Gotham",
          textSize: 14,
          textColor3: palette.muted,
        },
      });
      break;
    }
  }

  add(panelId, "UICorner", "PanelCorner", { properties: { cornerRadius: 16 } });
  if (req.guiType !== "settings" && req.guiType !== "shop" && req.guiType !== "inventory") {
    add(panelId, "UIPadding", "PanelPad", {
      properties: { paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16 },
    });
  }

  return elements;
}
