/**
 * SOP-3F-14: 模板数据扩展
 *
 * 从单个示例扩展到 12+ 预置模板，作为 /templates 列表与 /templates/[slug] 详情的
 * 单一数据源。 price=0 表示免费。
 *
 * 图片策略（2026-06-21 调整）：每个模板用 `previewImage` 字段指向 workspace/public
 * 下的本地静态图（Gemini Dark Glassmorphism 设计稿），按主题最贴近的映射；
 * `images[]` 在 schema/JSON-LD 中输出绝对 URL，列表/详情卡片视觉用同源图避免坏图。
 * 后续真实模板缩略图就绪后只需替换映射或换回 CDN。
 */

import { SITE_URL } from "./site-config";

export interface TemplateRecord {
  slug: string;
  name: string;
  feature: string;
  description: string;
  price: number;
  priceCurrency: string;
  category: string;
  style: string;
  device: string;
  /** 本地 public/ 下的预览图（含前导 /）— 用于列表/详情卡片渲染 */
  previewImage: string;
  /** JSON-LD image[] 用，绝对 URL */
  images: string[];
  features: string[];
  luauPreview: string;
}

const localImg = (path: string) => `${SITE_URL}${path}`;

export const TEMPLATES: Record<string, TemplateRecord> = {
  "rpg-inventory": {
    slug: "rpg-inventory",
    name: "RPG Inventory",
    feature: "Drag & Equip",
    description:
      "A slot-based RPG inventory GUI for Roblox with drag-and-drop, equip slots, item rarity colors, and tooltips.",
    price: 0,
    priceCurrency: "USD",
    category: "Inventory",
    style: "dark",
    device: "desktop",
    previewImage: "/templates/rpg-inventory.png",
    images: [localImg("/templates/rpg-inventory.png")],
    features: [
      "Drag-and-drop item management",
      "Equipment slots with stat preview",
      "Auto-scaling for all screen sizes",
      "DataStore persistence built-in",
      "Item rarity color coding",
    ],
    luauPreview: `local Players = game:GetService("Players")
local player = Players.LocalPlayer
local inventory = player:WaitForChild("PlayerGui").Inventory

local UserInputService = game:GetService("UserInputService")
UserInputService.InputBegan:Connect(function(input, processed)
\tif processed then return end
\tif input.KeyCode == Enum.KeyCode.Tab then
\t\tinventory.Enabled = not inventory.Enabled
\tend
end)`,
  },
  "main-menu": {
    slug: "main-menu",
    name: "Main Menu",
    feature: "Play / Settings / Store",
    description:
      "A polished main menu with animated play button, settings shortcut, store link, and social icons. Fits any genre.",
    price: 0,
    priceCurrency: "USD",
    category: "Menu",
    style: "clean",
    device: "desktop",
    previewImage: "/templates/main-menu.png",
    images: [localImg("/templates/main-menu.png")],
    features: [
      "Play, Settings, Store buttons",
      "Subtle UIGradient background",
      "Auto-fit for mobile and tablet",
      "One-click open in editor",
      "Clean, readable font stack",
    ],
    luauPreview: `local MainMenu = script.Parent:WaitForChild("MainMenu")
local PlayButton = MainMenu:WaitForChild("PlayButton")

PlayButton.MouseButton1Click:Connect(function()
\tprint("Player pressed Play")
\t-- Fire remote to start match
end)`,
  },
  "pet-shop": {
    slug: "pet-shop",
    name: "Pet Shop",
    feature: "Buy & Equip Pets",
    description:
      "A cartoony pet shop UI with rarity badges, buy buttons, coin balance, and equipped-pet preview panel.",
    price: 9.99,
    priceCurrency: "USD",
    category: "Shop",
    style: "cartoon",
    device: "desktop",
    previewImage: "/templates/pet-shop.png",
    images: [localImg("/templates/pet-shop.png")],
    features: [
      "6 pet cards with rarity badges",
      "Coin balance header",
      "Buy / Equip actions",
      "Equipped pet preview",
      "Server-side purchase validation",
    ],
    luauPreview: `local Shop = script.Parent:WaitForChild("PetShop")
local BuyEvent = game.ReplicatedStorage:WaitForChild("BuyPet")

for _, card in ipairs(Shop.Items:GetChildren()) do
\tcard.BuyButton.MouseButton1Click:Connect(function()
\t\tBuyEvent:FireServer(card.Name)
\tend)
end`,
  },
  "shop-ui": {
    slug: "shop-ui",
    name: "Shop UI",
    feature: "Gamepass & Devproduct Ready",
    description:
      "A general-purpose shop GUI with category tabs, item grid, and purchase prompts wired to MarketplaceService.",
    price: 0,
    priceCurrency: "USD",
    category: "Shop",
    style: "bright",
    device: "desktop",
    previewImage: "/templates/shop-ui.png",
    images: [localImg("/templates/shop-ui.png")],
    features: [
      "Category tabs (Gear, Power-ups, Skins)",
      "UIGridLayout item grid",
      "Purchase prompt integration",
      "Server validation stub",
      "Mobile-friendly scaling",
    ],
    luauPreview: `local MarketplaceService = game:GetService("MarketplaceService")
local Shop = script.Parent:WaitForChild("ShopUI")

Shop.Items.Gear.Sword.BuyButton.MouseButton1Click:Connect(function()
\tMarketplaceService:PromptProductPurchase(game.Players.LocalPlayer, 123456789)
end)`,
  },
  "leaderboard": {
    slug: "leaderboard",
    name: "Global Leaderboard",
    feature: "OrderedDataStore Powered",
    description:
      "A top-10 global leaderboard GUI with player name, avatar placeholder, and score. Auto-refreshes every minute.",
    price: 0,
    priceCurrency: "USD",
    category: "Leaderboard",
    style: "clean",
    device: "desktop",
    previewImage: "/templates/leaderboard.png",
    images: [localImg("/templates/leaderboard.png")],
    features: [
      "Top 10 player rows",
      "Avatar + name + score columns",
      "OrderedDataStore integration stub",
      "Auto-refresh timer",
      "Mobile scroll support",
    ],
    luauPreview: `local Leaderboard = script.Parent:WaitForChild("Leaderboard")
local Rows = Leaderboard:WaitForChild("Rows")

local function refresh(scores)
\tfor i, row in ipairs(Rows:GetChildren()) do
\t\trow.Score.Text = tostring(scores[i] or 0)
\tend
end`,
  },
  "health-bar": {
    slug: "health-bar",
    name: "Health Bar",
    feature: "Tweened Damage Feedback",
    description:
      "A compact health bar with tweened fill, damage flash, and low-health pulse. Works for any humanoid.",
    price: 0,
    priceCurrency: "USD",
    category: "Health Bar",
    style: "cartoon",
    device: "mobile",
    previewImage: "/templates/health-bar.png",
    images: [localImg("/templates/health-bar.png")],
    features: [
      "Tweened health fill",
      "Damage flash effect",
      "Low-health pulse warning",
      "Humanoid.Health changed binding",
      "Mobile-safe size",
    ],
    luauPreview: `local TweenService = game:GetService("TweenService")
local Bar = script.Parent:WaitForChild("HealthBar")
local Fill = Bar:WaitForChild("Fill")

local function updateHealth(current, max)
\tlocal ratio = current / max
\tTweenService:Create(Fill, TweenInfo.new(0.2), {Size = UDim2.new(ratio, 0, 1, 0)}):Play()
end`,
  },
  "settings": {
    slug: "settings",
    name: "Settings Menu",
    feature: "Volume & Toggle Options",
    description:
      "A settings panel with volume sliders, fullscreen toggle, music mute, and language placeholder. Clean UIListLayout.",
    price: 0,
    priceCurrency: "USD",
    category: "Settings",
    style: "dark",
    device: "desktop",
    previewImage: "/templates/settings.png",
    images: [localImg("/templates/settings.png")],
    features: [
      "Master / SFX volume sliders",
      "Fullscreen and mute toggles",
      "UIListLayout rows",
      "Save settings to DataStore stub",
      "Back to game button",
    ],
    luauPreview: `local Settings = script.Parent:WaitForChild("SettingsMenu")
local MusicToggle = Settings:WaitForChild("MusicToggle")

MusicToggle.MouseButton1Click:Connect(function()
\tlocal enabled = MusicToggle.Text == "Music: ON"
\tMusicToggle.Text = enabled and "Music: OFF" or "Music: ON"
end)`,
  },
  "loading-screen": {
    slug: "loading-screen",
    name: "Loading Screen",
    feature: "Progress Bar & Tips",
    description:
      "A loading screen with progress bar, rotating gameplay tips, and fade-out once loading is complete.",
    price: 0,
    priceCurrency: "USD",
    category: "Loading Screen",
    style: "clean",
    device: "desktop",
    previewImage: "/templates/loading-screen.png",
    images: [localImg("/templates/loading-screen.png")],
    features: [
      "Animated progress bar",
      "Rotating gameplay tips",
      "Fade-out on complete",
      "Percent text label",
      "Works with ContentProvider",
    ],
    luauPreview: `local Loading = script.Parent:WaitForChild("LoadingScreen")
local Progress = Loading:WaitForChild("ProgressBar")

local function setProgress(percent)
\tProgress.Fill.Size = UDim2.new(percent / 100, 0, 1, 0)
\tProgress.Percent.Text = percent .. "%"
end`,
  },
  "fps-hud": {
    slug: "fps-hud",
    name: "FPS HUD",
    feature: "Ammo / Health / Crosshair",
    description:
      "A tactical FPS HUD with ammo counter, health bar, crosshair, and kill feed placeholder. Performance-focused.",
    price: 9.99,
    priceCurrency: "USD",
    category: "HUD",
    style: "dark",
    device: "desktop",
    previewImage: "/examples/tactical-fps-hud.png",
    images: [localImg("/examples/tactical-fps-hud.png")],
    features: [
      "Ammo / magazine counter",
      "Health & armor bars",
      "Center crosshair",
      "Kill feed placeholder",
      "Low-overhead layout",
    ],
    luauPreview: `local HUD = script.Parent:WaitForChild("FPSHud")
local Ammo = HUD:WaitForChild("AmmoCounter")

local function updateAmmo(current, reserve)
\tAmmo.Text = string.format("%02d / %02d", current, reserve)
end`,
  },
  "simulator-hud": {
    slug: "simulator-hud",
    name: "Simulator HUD",
    feature: "Clicks / Rebirths / Pets",
    description:
      "A simulator-style HUD with click counter, rebirth badge, pet count, and currency tracker. Bright and readable.",
    price: 0,
    priceCurrency: "USD",
    category: "HUD",
    style: "bright",
    device: "mobile",
    previewImage: "/templates/simulator-hud.png",
    images: [localImg("/templates/simulator-hud.png")],
    features: [
      "Click / currency counter",
      "Rebirth badge",
      "Equipped pet icons",
      "Mobile thumb-friendly",
      "Tweened pop numbers",
    ],
    luauPreview: `local HUD = script.Parent:WaitForChild("SimulatorHud")
local Clicks = HUD:WaitForChild("ClicksLabel")

local function addClicks(amount)
\tClicks.Text = tonumber(Clicks.Text) + amount
end`,
  },
  "dialogue-system": {
    slug: "dialogue-system",
    name: "Dialogue System",
    feature: "NPC Chat & Choices",
    description:
      "An NPC dialogue UI with typewriter text, speaker portrait placeholder, and branching choice buttons.",
    price: 9.99,
    priceCurrency: "USD",
    category: "Dialogue",
    style: "cartoon",
    device: "desktop",
    previewImage: "/templates/dialogue-system.png",
    images: [localImg("/templates/dialogue-system.png")],
    features: [
      "Typewriter text effect",
      "Speaker name + portrait",
      "Branching choice buttons",
      "Dialogue tree stub",
      "Continue / skip button",
    ],
    luauPreview: `local Dialogue = script.Parent:WaitForChild("DialogueBox")
local TextLabel = Dialogue:WaitForChild("TextLabel")

local function typeWrite(text)
\tfor i = 1, #text do
\t\tTextLabel.Text = text:sub(1, i)
\t\ttask.wait(0.03)
\tend
end`,
  },
  "obby-start-screen": {
    slug: "obby-start-screen",
    name: "Obby Start Screen",
    feature: "Start / Rules / Shop",
    description:
      "A colorful obby start screen with start button, rules panel, shop link, and best-time display.",
    price: 0,
    priceCurrency: "USD",
    category: "Menu",
    style: "cartoon",
    device: "mobile",
    previewImage: "/templates/obby-start-screen.png",
    images: [localImg("/templates/obby-start-screen.png")],
    features: [
      "Start / Rules / Shop buttons",
      "Best time display",
      "Mobile-safe big buttons",
      "UICorner rounded panels",
      "One-click open in editor",
    ],
    luauPreview: `local StartScreen = script.Parent:WaitForChild("StartScreen")
local StartButton = StartScreen:WaitForChild("StartButton")

StartButton.MouseButton1Click:Connect(function()
\tStartScreen.Enabled = false
\t-- Teleport player to start pad
end)`,
  },
};

export function getTemplatePriceLabel(tpl: TemplateRecord): string {
  if (tpl.price === 0) return "Free";
  return "Marketplace";
}

export const TEMPLATE_SLUGS = Object.keys(TEMPLATES);

export function getSimilarTemplates(slug: string, limit = 3): TemplateRecord[] {
  const current = TEMPLATES[slug];
  if (!current) return [];
  return Object.values(TEMPLATES)
    .filter((t) => t.slug !== slug && t.category === current.category)
    .slice(0, limit);
}
