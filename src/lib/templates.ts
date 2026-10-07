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
  /** 本地 public/ 下的 client Luau 静态资产路径（含前导 /） */
  luauClientAsset: string;
  /** 本地 public/ 下的 server Luau 静态资产路径（含前导 /）；不存在时留空 */
  luauServerAsset?: string;
  /** 模板简介 */
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
  /** 短代码片段（详情页 Client Code 标签的 fallback） */
  luauPreview: string;
  /** v_2_0 关键词别名 slug（不改 URL，用于 metadata/Schema/搜索匹配；来源 v_2_0/00_MASTER_INDEX §4.2） */
  keywordAliases?: string[];
  /** 内容最后修订日（YYYY-MM-DD，sitemap lastmod 用，SOP-3V-04；3L 批次=2026-07-19，daily-rewards 3L-05=2026-07-20） */
  modifiedAt: string;
}

const localImg = (path: string) => `${SITE_URL}${path}`;

export const TEMPLATES: Record<string, TemplateRecord> = {
  "rpg-inventory": {
    slug: "rpg-inventory",
    name: "RPG Inventory",
    feature: "Drag & Equip",
    description:
      "A slot-based RPG inventory GUI for Roblox with drag-and-drop, equip slots, item rarity colors, and tooltips. This template provides a complete inventory system that supports item collection, equipment management, drag-and-drop interactions, rarity-based color coding, and informative tooltips on hover. It is designed for RPG, adventure, and survival games where players collect and manage items.",
    price: 0,
    priceCurrency: "USD",
    modifiedAt: "2026-07-19",
    category: "Inventory",
    style: "dark",
    device: "desktop",
    previewImage: "/templates/rpg-inventory.png",
    images: [localImg("/templates/rpg-inventory.png")],
    luauClientAsset: "/templates/luau/rpg-inventory/client.lua",
    luauServerAsset: "/templates/luau/rpg-inventory/server.lua",
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
    keywordAliases: ["inventory-gui"],
  },
  "main-menu": {
    slug: "main-menu",
    name: "Main Menu",
    feature: "Play / Settings / Store",
    description:
      "A polished main menu with animated play button, settings shortcut, store link, and social icons. Features a subtle UIGradient background, smooth Tween animations, and auto-fitting layout that adapts to mobile, tablet, and desktop screens. Fits any genre from simulators to RPGs to obbies.",
    price: 0,
    priceCurrency: "USD",
    modifiedAt: "2026-07-19",
    category: "Menu",
    style: "clean",
    device: "desktop",
    previewImage: "/templates/main-menu.png",
    images: [localImg("/templates/main-menu.png")],
    luauClientAsset: "/templates/luau/main-menu/client.lua",
    luauServerAsset: "/templates/luau/main-menu/server.lua",
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
    keywordAliases: ["menu-gui"],
  },
  "pet-shop": {
    slug: "pet-shop",
    name: "Pet Shop",
    feature: "Buy & Equip Pets",
    description:
      "A cartoony pet shop UI with rarity badges, buy buttons, coin balance, and equipped-pet preview panel. Designed for pet collection games, simulators, and RPGs where players can browse, purchase, and equip companion pets. Features 6 pet cards with visual rarity indicators, animated purchase flow, and a dedicated preview panel for the currently equipped pet.",
    price: 9.99,
    priceCurrency: "USD",
    modifiedAt: "2026-07-19",
    category: "Shop",
    style: "cartoon",
    device: "desktop",
    previewImage: "/templates/pet-shop.png",
    images: [localImg("/templates/pet-shop.png")],
    luauClientAsset: "/templates/luau/pet-shop/client.lua",
    luauServerAsset: "/templates/luau/pet-shop/server.lua",
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
      "A general-purpose shop GUI with category tabs, item grid, and purchase prompts wired to MarketplaceService. Supports both Gamepasses and Developer Products. Features a clean bright design with animated purchase flow, category filtering, and detailed item descriptions. Ready for monetization out of the box.",
    price: 0,
    priceCurrency: "USD",
    modifiedAt: "2026-07-19",
    category: "Shop",
    style: "bright",
    device: "desktop",
    previewImage: "/templates/shop-ui.png",
    images: [localImg("/templates/shop-ui.png")],
    luauClientAsset: "/templates/luau/shop-ui/client.lua",
    luauServerAsset: "/templates/luau/shop-ui/server.lua",
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
    keywordAliases: ["shop-gui"],
  },
  "leaderboard": {
    slug: "leaderboard",
    name: "Global Leaderboard",
    feature: "OrderedDataStore Powered",
    description:
      "A top-10 global leaderboard GUI with player name, avatar placeholder, and score. Auto-refreshes every minute. This template provides a production-ready leaderboard system that displays the highest-scoring players across your entire Roblox game. It features a clean, modern design with automatic data synchronization, smooth entry animations, and a responsive layout that works on all screen sizes.",
    price: 0,
    priceCurrency: "USD",
    modifiedAt: "2026-07-19",
    category: "Leaderboard",
    style: "clean",
    device: "desktop",
    previewImage: "/templates/leaderboard.png",
    images: [localImg("/templates/leaderboard.png")],
    luauClientAsset: "/templates/luau/leaderboard/client.lua",
    luauServerAsset: "/templates/luau/leaderboard/server.lua",
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
      "A compact health bar with tweened fill, damage flash, and low-health pulse. Works for any humanoid. This template provides a responsive, animated health bar that tracks player health with smooth fill animations, visual damage feedback with screen flash effects, and an urgent pulsing animation when health drops below a critical threshold. Designed with a cartoon aesthetic optimized for mobile devices.",
    price: 0,
    priceCurrency: "USD",
    modifiedAt: "2026-07-19",
    category: "Health Bar",
    style: "cartoon",
    device: "mobile",
    previewImage: "/templates/health-bar.png",
    images: [localImg("/templates/health-bar.png")],
    luauClientAsset: "/templates/luau/health-bar/client.lua",
    luauServerAsset: "/templates/luau/health-bar/server.lua",
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
      "A settings panel with volume sliders, fullscreen toggle, music mute, and language placeholder. Clean UIListLayout. This template provides a comprehensive settings system with smooth slider interactions, animated toggle switches, and a modular design that makes adding new settings effortless. Features a sleek dark theme with accent-colored interactive elements.",
    price: 0,
    priceCurrency: "USD",
    modifiedAt: "2026-07-19",
    category: "Settings",
    style: "dark",
    device: "desktop",
    previewImage: "/templates/settings.png",
    images: [localImg("/templates/settings.png")],
    luauClientAsset: "/templates/luau/settings/client.lua",
    luauServerAsset: "/templates/luau/settings/server.lua",
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
    keywordAliases: ["settings-menu"],
  },
  "loading-screen": {
    slug: "loading-screen",
    name: "Loading Screen",
    feature: "Progress Bar & Tips",
    description:
      "A loading screen with progress bar, rotating gameplay tips, and fade-out once loading is complete. This template provides a polished, professional loading experience that keeps players engaged while assets load. Features a smooth animated progress bar, helpful rotating gameplay tips to educate players, and an elegant fade-out transition when loading completes.",
    price: 0,
    priceCurrency: "USD",
    modifiedAt: "2026-07-19",
    category: "Loading Screen",
    style: "clean",
    device: "desktop",
    previewImage: "/templates/loading-screen.png",
    images: [localImg("/templates/loading-screen.png")],
    luauClientAsset: "/templates/luau/loading-screen/client.lua",
    luauServerAsset: "/templates/luau/loading-screen/server.lua",
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
      "A tactical FPS HUD with ammo counter, health bar, crosshair, and kill feed placeholder. Designed for performance-focused first-person shooter experiences on Roblox. Features a dark tactical aesthetic inspired by modern military shooters, with high-contrast UI elements that remain readable during intense gameplay.",
    price: 9.99,
    priceCurrency: "USD",
    modifiedAt: "2026-07-19",
    category: "HUD",
    style: "dark",
    device: "desktop",
    previewImage: "/examples/tactical-fps-hud.png",
    images: [localImg("/examples/tactical-fps-hud.png")],
    luauClientAsset: "/templates/luau/fps-hud/client.lua",
    luauServerAsset: "/templates/luau/fps-hud/server.lua",
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
    keywordAliases: ["hud-gui"],
  },
  "simulator-hud": {
    slug: "simulator-hud",
    name: "Simulator HUD",
    feature: "Clicks / Rebirths / Pets",
    description:
      "A simulator-style HUD with click counter, rebirth badge, pet count, and currency tracker. Designed with a bright and readable aesthetic optimized for mobile devices. Perfect for clicker simulators, pet collection games, tycoon-style experiences, and any Roblox game that tracks incremental progress with satisfying visual feedback.",
    price: 0,
    priceCurrency: "USD",
    modifiedAt: "2026-07-19",
    category: "HUD",
    style: "bright",
    device: "mobile",
    previewImage: "/templates/simulator-hud.png",
    images: [localImg("/templates/simulator-hud.png")],
    luauClientAsset: "/templates/luau/simulator-hud/client.lua",
    luauServerAsset: "/templates/luau/simulator-hud/server.lua",
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
    keywordAliases: ["hud-gui"],
  },
  "dialogue-system": {
    slug: "dialogue-system",
    name: "Dialogue System",
    feature: "NPC Chat & Choices",
    description:
      "An NPC dialogue UI with typewriter text, speaker portrait placeholder, and branching choice buttons. Designed for story-driven Roblox experiences with a charming cartoon aesthetic. Features smooth typewriter text animation, animated NPC portraits, player choice branching, and full dialogue tree support for complex narrative flows.",
    price: 9.99,
    priceCurrency: "USD",
    modifiedAt: "2026-07-19",
    category: "Dialogue",
    style: "cartoon",
    device: "desktop",
    previewImage: "/templates/dialogue-system.png",
    images: [localImg("/templates/dialogue-system.png")],
    luauClientAsset: "/templates/luau/dialogue-system/client.lua",
    luauServerAsset: "/templates/luau/dialogue-system/server.lua",
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
      "A colorful obby start screen with start button, rules panel, shop link, and best-time display. Designed with a vibrant cartoon aesthetic optimized for mobile devices. Features animated UI elements, player statistics, level selection preview, and social features like friend invites. Perfect for obstacle course (obby) games, parkour experiences, and timed challenge games on Roblox.",
    price: 0,
    priceCurrency: "USD",
    modifiedAt: "2026-07-19",
    category: "Menu",
    style: "cartoon",
    device: "mobile",
    previewImage: "/templates/obby-start-screen.png",
    images: [localImg("/templates/obby-start-screen.png")],
    luauClientAsset: "/templates/luau/obby-start-screen/client.lua",
    luauServerAsset: "/templates/luau/obby-start-screen/server.lua",
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
  "daily-rewards": {
    slug: "daily-rewards",
    name: "Daily Rewards",
    feature: "Daily Claim & Streak",
    description:
      "A daily rewards GUI for Roblox that resets every 24 hours, tracks login streaks, and plays a claim animation when the player collects their reward. This template provides a complete rewards system with streak multipliers, claimed-state persistence via DataStore, and a tweened reveal animation. It is designed for simulators, tycoons, and any game that wants players coming back daily.",
    price: 0,
    priceCurrency: "USD",
    modifiedAt: "2026-07-20",
    category: "Rewards",
    style: "bright",
    device: "desktop",
    previewImage: "/templates/daily-rewards.png",
    images: [localImg("/templates/daily-rewards.png")],
    luauClientAsset: "/templates/luau/daily-rewards/client.lua",
    luauServerAsset: "/templates/luau/daily-rewards/server.lua",
    features: [
      "24-hour reset timer",
      "Login streak with multiplier",
      "Tweened claim animation",
      "DataStore persistence",
      "Claimed-state disable button",
    ],
    luauPreview: `local Rewards = script.Parent:WaitForChild("RewardsPanel")
local ClaimButton = Rewards:WaitForChild("ClaimButton")

ClaimButton.MouseButton1Click:Connect(function()
\tlocal ClaimEvent = game.ReplicatedStorage:WaitForChild("ClaimDailyReward")
\tClaimEvent:FireServer()
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
