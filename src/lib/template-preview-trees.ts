/**
 * SOP-3I-11/3I-18: 模板预览树
 *
 * 将 12 份 template-*.md §2 Hierarchy 转换为 TemplateLivePreview 可用的
 * PreviewNode[]。当前为简化示意树（突出组件结构），3I-18 页面集成后
 * 随 3I-12 数据校准可继续细化。
 */

import type { PreviewNode, InteractiveElement } from "@/components/templates/TemplateLivePreview";

interface NodeProps {
  size?: { scaleX?: number; offsetX?: number; scaleY?: number; offsetY?: number };
  position?: { scaleX?: number; offsetX?: number; scaleY?: number; offsetY?: number };
  backgroundColor3?: { r: number; g: number; b: number };
  backgroundTransparency?: number;
  borderSizePixel?: number;
  borderColor3?: { r: number; g: number; b: number };
  cornerRadius?: number;
  anchorPoint?: { x: number; y: number };
  zIndex?: number;
  text?: string;
  textColor3?: { r: number; g: number; b: number };
  textSize?: number;
  font?: string;
}

const defaults = {
  screenGui: {
    size: { scaleX: 1, offsetX: 0, scaleY: 1, offsetY: 0 },
    position: { scaleX: 0, offsetX: 0, scaleY: 0, offsetY: 0 },
    backgroundTransparency: 1,
  },
  frame: {
    backgroundColor3: { r: 0.1, g: 0.1, b: 0.12 },
    backgroundTransparency: 0,
    borderSizePixel: 0,
    borderColor3: { r: 0.3, g: 0.3, b: 0.35 },
    cornerRadius: 8,
    anchorPoint: { x: 0, y: 0 },
    zIndex: 1,
  },
  label: {
    backgroundTransparency: 1,
    textColor3: { r: 0.95, g: 0.95, b: 0.97 },
    textSize: 16,
    font: "SourceSans",
    zIndex: 2,
  },
  button: {
    backgroundColor3: { r: 0.43, g: 0.36, b: 0.98 },
    backgroundTransparency: 0,
    textColor3: { r: 1, g: 1, b: 1 },
    textSize: 16,
    font: "SourceSans",
    cornerRadius: 6,
    zIndex: 2,
  },
};

function mergeSize(pos?: NodeProps["size"]) {
  return {
    scaleX: pos?.scaleX ?? 0,
    offsetX: pos?.offsetX ?? 0,
    scaleY: pos?.scaleY ?? 0,
    offsetY: pos?.offsetY ?? 0,
  };
}

function node(type: string, name: string, props: NodeProps, children: PreviewNode[] = []): PreviewNode {
  return {
    id: name,
    type,
    name,
    properties: {
      Size: mergeSize(props.size),
      Position: mergeSize(props.position),
      BackgroundColor3: props.backgroundColor3,
      BackgroundTransparency: props.backgroundTransparency,
      BorderSizePixel: props.borderSizePixel,
      BorderColor3: props.borderColor3,
      CornerRadius: props.cornerRadius,
      AnchorPoint: props.anchorPoint,
      ZIndex: props.zIndex,
      Text: props.text,
      TextColor3: props.textColor3,
      TextSize: props.textSize,
      Font: props.font,
    },
    children,
  };
}

function screenGui(name: string, children: PreviewNode[]): PreviewNode {
  return node("ScreenGui", name, defaults.screenGui, children);
}

function frame(name: string, props: NodeProps, children: PreviewNode[] = []): PreviewNode {
  return node("Frame", name, { ...defaults.frame, ...props }, children);
}

function textLabel(name: string, props: NodeProps): PreviewNode {
  return node("TextLabel", name, { ...defaults.label, ...props });
}

function textButton(name: string, props: NodeProps): PreviewNode {
  return node("TextButton", name, { ...defaults.button, ...props });
}

const WHITE = { r: 1, g: 1, b: 1 };
const DARK = { r: 0.08, g: 0.08, b: 0.12 };
const GRAY = { r: 0.15, g: 0.15, b: 0.2 };
const BRAND = { r: 0.43, g: 0.36, b: 0.98 };
const RED = { r: 0.93, g: 0.26, b: 0.26 };
const GREEN = { r: 0.13, g: 0.74, b: 0.39 };
const CYAN = { r: 0.13, g: 0.83, b: 0.93 };
const YELLOW = { r: 0.98, g: 0.75, b: 0.18 };

function inventorySlots(): PreviewNode[] {
  const slots: PreviewNode[] = [];
  for (let i = 0; i < 12; i++) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    slots.push(
      frame(
        `Slot${i + 1}`,
        {
          size: { scaleX: 0, offsetX: 64, scaleY: 0, offsetY: 64 },
          position: { scaleX: 0, offsetX: 20 + col * 72, scaleY: 0, offsetY: 80 + row * 72 },
          backgroundColor3: GRAY,
          cornerRadius: 6,
        },
        i % 5 === 0
          ? [frame(`Item${i + 1}`, { size: { scaleX: 0, offsetX: 48, scaleY: 0, offsetY: 48 }, position: { scaleX: 0, offsetX: 8, scaleY: 0, offsetY: 8 }, backgroundColor3: i % 2 === 0 ? BRAND : YELLOW, cornerRadius: 4 })]
          : [],
      ),
    );
  }
  return slots;
}

const PREVIEW_TREES: Record<string, PreviewNode[]> = {
  "rpg-inventory": [
    screenGui("InventoryGui", [
      frame(
        "InventoryFrame",
        { size: { scaleX: 0, offsetX: 340, scaleY: 0, offsetY: 360 }, position: { scaleX: 0.5, offsetX: -170, scaleY: 0.5, offsetY: -180 }, backgroundColor3: DARK, cornerRadius: 12 },
        [
          textLabel("Title", { text: "Inventory", size: { scaleX: 1, offsetX: 0, scaleY: 0, offsetY: 40 }, textSize: 22, font: "GothamBold" }),
          ...inventorySlots(),
          textButton("EquipBtn", { text: "Equip", size: { scaleX: 0, offsetX: 100, scaleY: 0, offsetY: 32 }, position: { scaleX: 0.5, offsetX: -50, scaleY: 1, offsetY: -44 } }),
        ],
      ),
    ]),
  ],

  "main-menu": [
    screenGui("MainMenuGui", [
      frame(
        "MainMenu",
        { size: { scaleX: 0, offsetX: 520, scaleY: 0, offsetY: 360 }, position: { scaleX: 0.5, offsetX: -260, scaleY: 0.5, offsetY: -180 }, backgroundColor3: { r: 0.06, g: 0.06, b: 0.1 }, cornerRadius: 16 },
        [
          textLabel("GameTitle", { text: "MY GAME", size: { scaleX: 1, offsetX: 0, scaleY: 0, offsetY: 80 }, textSize: 36, font: "GothamBlack" }),
          textButton("PlayBtn", { text: "▶  Play", size: { scaleX: 0, offsetX: 200, scaleY: 0, offsetY: 48 }, position: { scaleX: 0.5, offsetX: -100, scaleY: 0, offsetY: 130 } }),
          textButton("SettingsBtn", { text: "⚙ Settings", size: { scaleX: 0, offsetX: 200, scaleY: 0, offsetY: 48 }, position: { scaleX: 0.5, offsetX: -100, scaleY: 0, offsetY: 190 }, backgroundColor3: GRAY }),
          textButton("StoreBtn", { text: "🛒 Store", size: { scaleX: 0, offsetX: 200, scaleY: 0, offsetY: 48 }, position: { scaleX: 0.5, offsetX: -100, scaleY: 0, offsetY: 250 }, backgroundColor3: GRAY }),
        ],
      ),
    ]),
  ],

  "pet-shop": [
    screenGui("PetShopGui", [
      frame(
        "PetShop",
        { size: { scaleX: 0, offsetX: 560, scaleY: 0, offsetY: 420 }, position: { scaleX: 0.5, offsetX: -280, scaleY: 0.5, offsetY: -210 }, backgroundColor3: { r: 0.98, g: 0.96, b: 0.9 }, cornerRadius: 16 },
        [
          textLabel("CoinLabel", { text: "🪙 1,250 Coins", size: { scaleX: 1, offsetX: 0, scaleY: 0, offsetY: 44 }, textColor3: { r: 0.2, g: 0.15, b: 0.1 }, textSize: 20, font: "GothamBold" }),
          ...Array.from({ length: 6 }, (_, i) => {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const colors = [BRAND, CYAN, YELLOW, RED, GREEN, { r: 0.8, g: 0.4, b: 0.9 }];
            return frame(
              `PetCard${i + 1}`,
              { size: { scaleX: 0, offsetX: 160, scaleY: 0, offsetY: 160 }, position: { scaleX: 0, offsetX: 20 + col * 180, scaleY: 0, offsetY: 60 + row * 180 }, backgroundColor3: WHITE, cornerRadius: 12 },
              [
                frame(`PetIcon${i + 1}`, { size: { scaleX: 0, offsetX: 80, scaleY: 0, offsetY: 80 }, position: { scaleX: 0.5, offsetX: -40, scaleY: 0, offsetY: 16 }, backgroundColor3: colors[i], cornerRadius: 40 }),
                textLabel(`PetName${i + 1}`, { text: `Pet ${i + 1}`, size: { scaleX: 1, offsetX: 0, scaleY: 0, offsetY: 24 }, position: { scaleX: 0, offsetX: 0, scaleY: 0, offsetY: 104 }, textColor3: { r: 0.2, g: 0.15, b: 0.1 }, textSize: 14 }),
                textButton(`BuyBtn${i + 1}`, { text: "Buy", size: { scaleX: 0, offsetX: 80, scaleY: 0, offsetY: 28 }, position: { scaleX: 0.5, offsetX: -40, scaleY: 0, offsetY: 128 }, backgroundColor3: GREEN }),
              ],
            );
          }),
        ],
      ),
    ]),
  ],

  "shop-ui": [
    screenGui("ShopGui", [
      frame(
        "ShopUI",
        { size: { scaleX: 0, offsetX: 540, scaleY: 0, offsetY: 400 }, position: { scaleX: 0.5, offsetX: -270, scaleY: 0.5, offsetY: -200 }, backgroundColor3: { r: 0.95, g: 0.97, b: 1 }, cornerRadius: 14 },
        [
          textLabel("ShopTitle", { text: "Item Shop", size: { scaleX: 1, offsetX: 0, scaleY: 0, offsetY: 48 }, textColor3: { r: 0.1, g: 0.12, b: 0.2 }, textSize: 24, font: "GothamBold" }),
          frame("TabBar", { size: { scaleX: 1, offsetX: 0, scaleY: 0, offsetY: 40 }, position: { scaleX: 0, offsetX: 0, scaleY: 0, offsetY: 56 }, backgroundColor3: { r: 0.85, g: 0.9, b: 0.98 } },
            ["Gear", "Power-ups", "Skins"].map((tab, i) =>
              textButton(`Tab${tab}`, { text: tab, size: { scaleX: 0, offsetX: 90, scaleY: 0, offsetY: 32 }, position: { scaleX: 0, offsetX: 16 + i * 100, scaleY: 0, offsetY: 4 }, backgroundColor3: i === 0 ? BRAND : { r: 0.7, g: 0.75, b: 0.9 }, textSize: 13 }),
            ),
          ),
          ...Array.from({ length: 4 }, (_, i) =>
            frame(
              `Item${i + 1}`,
              { size: { scaleX: 0, offsetX: 120, scaleY: 0, offsetY: 140 }, position: { scaleX: 0, offsetX: 24 + (i % 2) * 260, scaleY: 0, offsetY: 110 + Math.floor(i / 2) * 160 }, backgroundColor3: WHITE, cornerRadius: 10 },
              [
                frame(`ItemIcon${i + 1}`, { size: { scaleX: 0, offsetX: 64, scaleY: 0, offsetY: 64 }, position: { scaleX: 0.5, offsetX: -32, scaleY: 0, offsetY: 16 }, backgroundColor3: [CYAN, YELLOW, RED, GREEN][i], cornerRadius: 8 }),
                textLabel(`ItemName${i + 1}`, { text: `Item ${i + 1}`, size: { scaleX: 1, offsetX: 0, scaleY: 0, offsetY: 20 }, position: { scaleX: 0, offsetX: 0, scaleY: 0, offsetY: 86 }, textColor3: { r: 0.1, g: 0.12, b: 0.2 }, textSize: 13 }),
                textButton(`Purchase${i + 1}`, { text: "$Buy", size: { scaleX: 0, offsetX: 80, scaleY: 0, offsetY: 26 }, position: { scaleX: 0.5, offsetX: -40, scaleY: 0, offsetY: 108 }, backgroundColor3: BRAND, textSize: 13 }),
              ],
            ),
          ),
        ],
      ),
    ]),
  ],

  leaderboard: [
    screenGui("LeaderboardGui", [
      frame(
        "Leaderboard",
        { size: { scaleX: 0, offsetX: 420, scaleY: 0, offsetY: 520 }, position: { scaleX: 0.5, offsetX: -210, scaleY: 0.5, offsetY: -260 }, backgroundColor3: { r: 0.08, g: 0.1, b: 0.14 }, cornerRadius: 12 },
        [
          textLabel("BoardTitle", { text: "🏆 Global Leaderboard", size: { scaleX: 1, offsetX: 0, scaleY: 0, offsetY: 52 }, textSize: 22, font: "GothamBold" }),
          ...Array.from({ length: 10 }, (_, i) =>
            frame(
              `Row${i + 1}`,
              { size: { scaleX: 1, offsetX: -32, scaleY: 0, offsetY: 40 }, position: { scaleX: 0.5, offsetX: 0, scaleY: 0, offsetY: 64 + i * 44 }, backgroundColor3: i % 2 === 0 ? { r: 0.12, g: 0.14, b: 0.18 } : { r: 0.1, g: 0.12, b: 0.16 }, cornerRadius: 6 },
              [
                textLabel(`Rank${i + 1}`, { text: `#${i + 1}`, size: { scaleX: 0, offsetX: 40, scaleY: 1, offsetY: 0 }, position: { scaleX: 0, offsetX: 12, scaleY: 0, offsetY: 0 }, textSize: 14, font: "GothamBold" }),
                textLabel(`Name${i + 1}`, { text: `Player_${100 + i}`, size: { scaleX: 0, offsetX: 160, scaleY: 1, offsetY: 0 }, position: { scaleX: 0, offsetX: 60, scaleY: 0, offsetY: 0 }, textSize: 14 }),
                textLabel(`Score${i + 1}`, { text: `${10000 - i * 900}`, size: { scaleX: 0, offsetX: 80, scaleY: 1, offsetY: 0 }, position: { scaleX: 1, offsetX: -96, scaleY: 0, offsetY: 0 }, textColor3: CYAN, textSize: 14, font: "GothamBold" }),
              ],
            ),
          ),
        ],
      ),
    ]),
  ],

  "health-bar": [
    screenGui("HealthGui", [
      frame(
        "HealthBar",
        { size: { scaleX: 0, offsetX: 280, scaleY: 0, offsetY: 36 }, position: { scaleX: 0, offsetX: 20, scaleY: 0, offsetY: 20 }, backgroundColor3: { r: 0.2, g: 0.05, b: 0.05 }, cornerRadius: 18 },
        [
          frame("Fill", { size: { scaleX: 0.75, offsetX: 0, scaleY: 1, offsetY: 0 }, backgroundColor3: RED, cornerRadius: 18 }),
          textLabel("HealthText", { text: "75 / 100", size: { scaleX: 1, offsetX: 0, scaleY: 1, offsetY: 0 }, textSize: 14, font: "GothamBold" }),
        ],
      ),
    ]),
  ],

  settings: [
    screenGui("SettingsGui", [
      frame(
        "SettingsMenu",
        { size: { scaleX: 0, offsetX: 460, scaleY: 0, offsetY: 420 }, position: { scaleX: 0.5, offsetX: -230, scaleY: 0.5, offsetY: -210 }, backgroundColor3: { r: 0.09, g: 0.09, b: 0.13 }, cornerRadius: 14 },
        [
          textLabel("SettingsTitle", { text: "Settings", size: { scaleX: 1, offsetX: 0, scaleY: 0, offsetY: 56 }, textSize: 24, font: "GothamBold" }),
          ...[
            { label: "Master Volume", value: "80%" },
            { label: "SFX Volume", value: "60%" },
            { label: "Music: ON", toggle: true },
            { label: "Fullscreen: OFF", toggle: true },
          ].map((row, i) =>
            frame(
              `Row${i + 1}`,
              { size: { scaleX: 1, offsetX: -48, scaleY: 0, offsetY: 48 }, position: { scaleX: 0.5, offsetX: 0, scaleY: 0, offsetY: 80 + i * 64 }, backgroundColor3: GRAY, cornerRadius: 8 },
              [
                textLabel(`Label${i + 1}`, { text: row.label, size: { scaleX: 0.6, offsetX: 0, scaleY: 1, offsetY: 0 }, position: { scaleX: 0, offsetX: 16, scaleY: 0, offsetY: 0 }, textSize: 15 }),
                row.toggle
                  ? textButton(`Toggle${i + 1}`, { text: row.label.split(": ")[1], size: { scaleX: 0, offsetX: 80, scaleY: 0, offsetY: 32 }, position: { scaleX: 1, offsetX: -96, scaleY: 0, offsetY: 8 }, backgroundColor3: BRAND, textSize: 13 })
                  : textLabel(`Value${i + 1}`, { text: row.value, size: { scaleX: 0, offsetX: 60, scaleY: 1, offsetY: 0 }, position: { scaleX: 1, offsetX: -76, scaleY: 0, offsetY: 0 }, textColor3: CYAN, textSize: 15, font: "GothamBold" }),
              ],
            ),
          ),
          textButton("BackBtn", { text: "← Back", size: { scaleX: 0, offsetX: 120, scaleY: 0, offsetY: 40 }, position: { scaleX: 0.5, offsetX: -60, scaleY: 1, offsetY: -60 }, backgroundColor3: { r: 0.3, g: 0.3, b: 0.35 } }),
        ],
      ),
    ]),
  ],

  "loading-screen": [
    screenGui("LoadingGui", [
      frame(
        "LoadingScreen",
        { size: { scaleX: 1, offsetX: 0, scaleY: 1, offsetY: 0 }, backgroundColor3: { r: 0.04, g: 0.04, b: 0.06 } },
        [
          textLabel("LoadingTitle", { text: "Loading...", size: { scaleX: 1, offsetX: 0, scaleY: 0, offsetY: 48 }, position: { scaleX: 0, offsetX: 0, scaleY: 0, offsetY: -40 }, textSize: 28, font: "GothamBold" }),
          frame("ProgressBar", { size: { scaleX: 0, offsetX: 400, scaleY: 0, offsetY: 24 }, position: { scaleX: 0.5, offsetX: -200, scaleY: 0.5, offsetY: 20 }, backgroundColor3: GRAY, cornerRadius: 12 },
            [frame("Fill", { size: { scaleX: 0.65, offsetX: 0, scaleY: 1, offsetY: 0 }, backgroundColor3: BRAND, cornerRadius: 12 })],
          ),
          textLabel("Percent", { text: "65%", size: { scaleX: 1, offsetX: 0, scaleY: 0, offsetY: 24 }, position: { scaleX: 0, offsetX: 0, scaleY: 0, offsetY: 60 }, textColor3: CYAN, textSize: 18, font: "GothamBold" }),
          textLabel("Tip", { text: "Tip: Collect coins to unlock pets!", size: { scaleX: 1, offsetX: 0, scaleY: 0, offsetY: 20 }, position: { scaleX: 0, offsetX: 0, scaleY: 0, offsetY: 100 }, textSize: 14 }),
        ],
      ),
    ]),
  ],

  "fps-hud": [
    screenGui("FpsHudGui", [
      frame(
        "FPSHud",
        { size: { scaleX: 1, offsetX: 0, scaleY: 1, offsetY: 0 }, backgroundTransparency: 1 },
        [
          frame("AmmoCounter", { size: { scaleX: 0, offsetX: 120, scaleY: 0, offsetY: 56 }, position: { scaleX: 1, offsetX: -140, scaleY: 1, offsetY: -76 }, backgroundColor3: DARK, cornerRadius: 8 },
            [textLabel("AmmoText", { text: "30 / 90", size: { scaleX: 1, offsetX: 0, scaleY: 1, offsetY: 0 }, textSize: 18, font: "GothamBold" })],
          ),
          frame("HealthBar", { size: { scaleX: 0, offsetX: 240, scaleY: 0, offsetY: 20 }, position: { scaleX: 0, offsetX: 20, scaleY: 1, offsetY: -40 }, backgroundColor3: { r: 0.2, g: 0.05, b: 0.05 }, cornerRadius: 10 },
            [frame("HealthFill", { size: { scaleX: 0.85, offsetX: 0, scaleY: 1, offsetY: 0 }, backgroundColor3: RED, cornerRadius: 10 })],
          ),
          frame("Crosshair", { size: { scaleX: 0, offsetX: 24, scaleY: 0, offsetY: 24 }, position: { scaleX: 0.5, offsetX: -12, scaleY: 0.5, offsetY: -12 }, backgroundColor3: WHITE, cornerRadius: 12, backgroundTransparency: 0.7 }),
        ],
      ),
    ]),
  ],

  "simulator-hud": [
    screenGui("SimulatorHudGui", [
      frame(
        "SimulatorHud",
        { size: { scaleX: 1, offsetX: 0, scaleY: 1, offsetY: 0 }, backgroundTransparency: 1 },
        [
          frame("ClicksPanel", { size: { scaleX: 0, offsetX: 180, scaleY: 0, offsetY: 64 }, position: { scaleX: 0.5, offsetX: -90, scaleY: 0, offsetY: 20 }, backgroundColor3: { r: 0.1, g: 0.12, b: 0.18 }, cornerRadius: 12 },
            [textLabel("Clicks", { text: "⚡ Clicks: 1,234", size: { scaleX: 1, offsetX: 0, scaleY: 1, offsetY: 0 }, textSize: 16, font: "GothamBold" })],
          ),
          frame("RebirthPanel", { size: { scaleX: 0, offsetX: 140, scaleY: 0, offsetY: 48 }, position: { scaleX: 0, offsetX: 20, scaleY: 0, offsetY: 20 }, backgroundColor3: YELLOW, cornerRadius: 10 },
            [textLabel("Rebirths", { text: "Rebirth: 5", size: { scaleX: 1, offsetX: 0, scaleY: 1, offsetY: 0 }, textColor3: DARK, textSize: 14, font: "GothamBold" })],
          ),
          frame("PetsPanel", { size: { scaleX: 0, offsetX: 160, scaleY: 0, offsetY: 48 }, position: { scaleX: 1, offsetX: -180, scaleY: 0, offsetY: 20 }, backgroundColor3: CYAN, cornerRadius: 10 },
            [textLabel("Pets", { text: "Pets: 12", size: { scaleX: 1, offsetX: 0, scaleY: 1, offsetY: 0 }, textColor3: DARK, textSize: 14, font: "GothamBold" })],
          ),
        ],
      ),
    ]),
  ],

  "dialogue-system": [
    screenGui("DialogueGui", [
      frame(
        "DialogueBox",
        { size: { scaleX: 0, offsetX: 640, scaleY: 0, offsetY: 220 }, position: { scaleX: 0.5, offsetX: -320, scaleY: 1, offsetY: -240 }, backgroundColor3: { r: 0.08, g: 0.08, b: 0.12 }, cornerRadius: 16 },
        [
          frame("Portrait", { size: { scaleX: 0, offsetX: 120, scaleY: 0, offsetY: 120 }, position: { scaleX: 0, offsetX: 24, scaleY: 0, offsetY: 24 }, backgroundColor3: { r: 0.6, g: 0.55, b: 0.5 }, cornerRadius: 12 }),
          textLabel("Speaker", { text: "NPC Bob", size: { scaleX: 0, offsetX: 160, scaleY: 0, offsetY: 24 }, position: { scaleX: 0, offsetX: 160, scaleY: 0, offsetY: 24 }, textColor3: CYAN, textSize: 16, font: "GothamBold" }),
          textLabel("DialogueText", { text: "Welcome to the village! What would you like to do?", size: { scaleX: 0, offsetX: 440, scaleY: 0, offsetY: 60 }, position: { scaleX: 0, offsetX: 160, scaleY: 0, offsetY: 56 }, textSize: 14 }),
          ...["Hello!", "Do you have quests?", "Goodbye."].map((choice, i) =>
            textButton(`Choice${i + 1}`, { text: choice, size: { scaleX: 0, offsetX: 130, scaleY: 0, offsetY: 32 }, position: { scaleX: 0, offsetX: 160 + i * 150, scaleY: 0, offsetY: 130 }, backgroundColor3: GRAY, textSize: 13 }),
          ),
        ],
      ),
    ]),
  ],

  "obby-start-screen": [
    screenGui("StartScreenGui", [
      frame(
        "StartScreen",
        { size: { scaleX: 1, offsetX: 0, scaleY: 1, offsetY: 0 }, backgroundColor3: { r: 0.18, g: 0.75, b: 0.85 } },
        [
          textLabel("Title", { text: "OBBY ADVENTURE", size: { scaleX: 1, offsetX: 0, scaleY: 0, offsetY: 64 }, position: { scaleX: 0, offsetX: 0, scaleY: 0, offsetY: 80 }, textSize: 40, font: "GothamBlack" }),
          textLabel("BestTime", { text: "Best Time: 02:34", size: { scaleX: 1, offsetX: 0, scaleY: 0, offsetY: 24 }, position: { scaleX: 0, offsetX: 0, scaleY: 0, offsetY: 150 }, textSize: 18 }),
          textButton("StartBtn", { text: "▶ Start", size: { scaleX: 0, offsetX: 220, scaleY: 0, offsetY: 56 }, position: { scaleX: 0.5, offsetX: -110, scaleY: 0, offsetY: 220 }, backgroundColor3: GREEN, textSize: 20 }),
          textButton("RulesBtn", { text: "📜 Rules", size: { scaleX: 0, offsetX: 220, scaleY: 0, offsetY: 48 }, position: { scaleX: 0.5, offsetX: -110, scaleY: 0, offsetY: 290 }, backgroundColor3: YELLOW, textColor3: DARK, textSize: 16 }),
          textButton("ShopBtn", { text: "🛒 Shop", size: { scaleX: 0, offsetX: 220, scaleY: 0, offsetY: 48 }, position: { scaleX: 0.5, offsetX: -110, scaleY: 0, offsetY: 350 }, backgroundColor3: BRAND, textSize: 16 }),
        ],
      ),
    ]),
  ],
  "daily-rewards": [
    screenGui("RewardsScreenGui", [
      frame(
        "RewardsPanel",
        { size: { scaleX: 0.4, offsetX: 0, scaleY: 0.6, offsetY: 0 }, position: { scaleX: 0.5, offsetX: 0, scaleY: 0.5, offsetY: 0 }, anchorPoint: { x: 0.5, y: 0.5 }, backgroundColor3: { r: 0.13, g: 0.13, b: 0.16 } },
        [
          textLabel("Title", { text: "DAILY REWARDS", size: { scaleX: 1, offsetX: 0, scaleY: 0, offsetY: 48 }, position: { scaleX: 0, offsetX: 0, scaleY: 0, offsetY: 40 }, textSize: 28, font: "GothamBold" }),
          textLabel("StreakLabel", { text: "Streak: 3 days", size: { scaleX: 1, offsetX: 0, scaleY: 0, offsetY: 24 }, position: { scaleX: 0, offsetX: 0, scaleY: 0, offsetY: 100 }, textSize: 18, textColor3: { r: 0.75, g: 0.85, b: 1 } }),
          textLabel("TimerLabel", { text: "Next reward in 18h 24m", size: { scaleX: 1, offsetX: 0, scaleY: 0, offsetY: 20 }, position: { scaleX: 0, offsetX: 0, scaleY: 0, offsetY: 140 }, textSize: 14, textColor3: { r: 0.63, g: 0.63, b: 0.71 } }),
          textButton("ClaimButton", { text: "Claim Daily Reward", size: { scaleX: 0.8, offsetX: 0, scaleY: 0, offsetY: 56 }, position: { scaleX: 0.1, offsetX: 0, scaleY: 0, offsetY: 220 }, backgroundColor3: BRAND, textSize: 18 }),
        ],
      ),
    ]),
  ],
};

const INTERACTIVE_OVERRIDES: Record<string, InteractiveElement[]> = {
  "main-menu": [
    { nodeId: "PlayBtn", hoverEffect: "scale" },
    { nodeId: "SettingsBtn", hoverEffect: "brightness" },
    { nodeId: "StoreBtn", hoverEffect: "colorShift" },
  ],
  "obby-start-screen": [
    { nodeId: "StartBtn", hoverEffect: "scale" },
    { nodeId: "RulesBtn", hoverEffect: "brightness" },
    { nodeId: "ShopBtn", hoverEffect: "colorShift" },
  ],
  "pet-shop": Array.from({ length: 6 }, (_, i) => ({
    nodeId: `BuyBtn${i + 1}`,
    hoverEffect: "scale" as const,
  })),
  "shop-ui": Array.from({ length: 4 }, (_, i) => ({
    nodeId: `Purchase${i + 1}`,
    hoverEffect: "scale" as const,
  })),
  "dialogue-system": Array.from({ length: 3 }, (_, i) => ({
    nodeId: `Choice${i + 1}`,
    hoverEffect: "brightness" as const,
  })),
  settings: [{ nodeId: "BackBtn", hoverEffect: "scale" }],
  "rpg-inventory": [{ nodeId: "EquipBtn", hoverEffect: "scale" }],
  "daily-rewards": [{ nodeId: "ClaimButton", hoverEffect: "scale" }],
};

export function getTemplatePreviewTree(slug: string): PreviewNode[] {
  return PREVIEW_TREES[slug] ?? PREVIEW_TREES["main-menu"];
}

export function getTemplateInteractiveElements(slug: string): InteractiveElement[] {
  return INTERACTIVE_OVERRIDES[slug] ?? [];
}
