# Roblox GUI Maker — 内容集群策略文档

> **产品**：Roblox GUI Maker（在线工具 + Roblox Studio 插件）
> **技术栈终选**：Next.js 16 + React 19 + Tailwind v4 + Vercel + Roblox Plugin SDK
> **来源**：Phase 2 Round 2 DeepSeek-V4 完整文档生成
> **生成日期**：2026-06-18

---

## 目录

1. [三个月内容发布日历（12 周）](#1-三个月内容发布日历12-周)
2. [三个 Cluster 详细展开](#2-三个-cluster-详细展开)
3. [内部链接策略表](#3-内部链接策略表)
4. [视频内容策略（Roblox 特有）](#4-视频内容策略roblox-特有)
5. [内容发布 SOP](#5-内容发布-sop)
6. [内容效果追踪 KPI](#6-内容效果追踪-kpi)

---

## 1. 三个月内容发布日历（12 周）

发布起始日期：**2026-06-22（周一）**，每周一发布一篇。

> **重组说明（2026-06-18）**：本日历经第二轮重组，吸收 Manus 检索（`additional/blog_content_plan.md`）的真实痛点选题，并修正首页/博客关键词自我竞争。高优先级新选题（Shop GUI / Leaderboard / AI 失败分析）**插队进 12 周**，置换原 W7/W9/W10（Code Generator / Drag-vs-AI / Free-vs-Paid，降级为按需补充文章）。组件痛点教程（UIListLayout / Draggable）作为**常驻 `/guides` 页**，不占博客周次。详见 [REORG_CHANGELOG.md](REORG_CHANGELOG.md)。

| 周次 | 发布日期 | 文章标题 (H1) | 目标关键词 | 所属 Cluster | URL | 内容类型 | 目标字数 | 内链指向 | 视频需求 |
|------|---------|-------------|-----------|------------|-----|---------|---------|---------|---------|
| W1 | 2026-06-22 | The Best Roblox UI Maker Without Coding in 2026 | `best roblox ui maker no coding 2026`（长尾变体，首页主词为 `roblox gui maker`） | Cluster 1 (工具型) | `/blog/best-roblox-ui-maker-no-coding` | 比较文 + 工具推广 | 2500+ | `/`（回传权重）, `/editor`, `/pricing` | YouTube 3min 演示 |
| W2 | 2026-06-29 | How to Convert Figma to Roblox Studio UI in One Click | `roblox figma to studio` | Cluster 2 (流程型) | `/blog/convert-figma-to-roblox-studio-ui` | 教程 (HowTo) | 3000+ | `/figma-to-roblox`, `/editor`, `/plugin` | YouTube 5min 教程 |
| W3 | 2026-07-06 | Top 10 Free Roblox GUI Templates for Your Game | `roblox gui templates free`（信息型导读；主战场为 `/templates` 产品页） | Cluster 3 (资源型) | `/blog/top-10-free-roblox-gui-templates` | 信息型导读 | 2000+ | `/templates`（主 CTA）, `/editor` | 无（截图即可） |
| W4 | 2026-07-13 | 5 Best Roblox Studio UI Editor Alternatives (2026) | `roblox studio ui editor alternative`（对比意图；交易意图归 `/pricing`） | Cluster 1 (工具型) | `/blog/5-best-roblox-studio-ui-editor-alternatives` | 比较文 | 2500+ | `/editor`, `/pricing`（互链） | YouTube 4min 对比 |
| W5 | 2026-07-20 | How to Fix Roblox GUI Scaling: Scale vs Offset (2026) | `how to fix roblox gui scaling` / `roblox gui scaling tool`（博客导读，深度版见 `/guides/fix-gui-scaling`） | Cluster 1 (工具型) | `/blog/roblox-gui-scaling-guide` | 轻量导读（→ guides 深度版） | 1500+ | `/guides/fix-gui-scaling`（深度版）, `/editor` | YouTube 8min 深度教程 |
| W6 | 2026-07-27 | Build a Roblox Inventory GUI: Step-by-Step Tutorial | `roblox inventory gui template` | Cluster 3 (资源型) | `/blog/build-roblox-inventory-gui` | 教程 + 模板推广 | 3000+ | `/templates/rpg-inventory`, `/editor` | YouTube 10min 完整教程 |
| W7 | 2026-08-03 | Building a Working Roblox Shop GUI with Server Validation | `roblox shop gui script` / `how to make a shop in roblox`（★置换原 Code Generator） | Cluster 3 (资源型) | `/blog/roblox-shop-gui-server-validation` | 教程 + 模板推广 | 3000+ | `/templates/shop-ui`, `/editor` | YouTube 8min 教程 |
| W8 | 2026-08-10 | How to Create a Roblox Backpack System with AI | `roblox backpack system script` | Cluster 3 (资源型) | `/blog/roblox-backpack-system-ai` | 教程 + 模板推广 | 3000+ | `/templates/backpack-system`, `/editor` | YouTube 8min 教程 |
| W9 | 2026-08-17 | Why AI UI Generators for Roblox Often Fail (And How to Fix It) | `roblox ai ui generator` / `bloxsmith alternative`（★置换原 Drag-vs-AI，吸收竞品拦截） | Cluster 1 (工具型) | `/blog/ai-ui-generator-failures` | 痛点分析 + 比较文 | 2500+ | `/editor`, `/`（可控 AI 卖点） | YouTube 4min 演示 |
| W10 | 2026-08-24 | How to Create a Global Leaderboard GUI in Roblox (2026) | `roblox leaderboard gui free` / `ordereddatastore tutorial`（★置换原 Free-vs-Paid） | Cluster 3 (资源型) | `/blog/roblox-leaderboard-ordereddatastore` | 教程 + 模板推广 | 3000+ | `/templates/leaderboard`, `/editor` | YouTube 8min 教程 |
| W11 | 2026-08-31 | Importing UI From Figma Sucks — Here's the Fix | `roblox figma to studio plugin` | Cluster 2 (流程型) | `/blog/importing-ui-from-figma-sucks-fix` | 痛点 + 解决方案 | 2000+ | `/figma-to-roblox`, `/editor`, `/plugin` | YouTube 3min 对比演示 |
| W12 | 2026-09-07 | 2026 Roblox UI Design Trends & Best Practices | `roblox ui design plugin` / `roblox ui templates` | Cluster 1 (工具型) | `/blog/2026-roblox-ui-design-trends` | 趋势文 | 2500+ | `/plugin`, `/templates`, `/use-cases` | TikTok 60s 快速版 |

### 1.0 常驻 `/guides` 教程页（不占博客周次，随时上线）

以下深度教程作为教程中心常驻页，独立于 12 周博客日历。博客导读文章（如 W5）通过 canonical/内链指向对应 guides 深度版，避免重复内容：

| URL | H1 | 目标关键词 | 内容类型 | 内链指向 |
|-----|-----|-----------|---------|---------|
| `/guides/fix-gui-scaling` | How to Fix Roblox GUI Scaling: Scale vs Offset Explained | `how to fix roblox gui scaling` / `roblox gui scaling tool` | HowTo 深度教程 | `/editor`, `/blog/roblox-gui-scaling-guide`（导读回链） |
| `/guides/uilistlayout-uigridlayout` | The Ultimate Guide to UIListLayout & UIGridLayout in Roblox | `how to use uilistlayout roblox` / `roblox uigridlayout spacing` | HowTo 深度教程 | `/editor`, `/templates` |
| `/guides/draggable-gui` | How to Make a Draggable GUI in Roblox (Without Complex Scripts) | `how to make a draggable gui roblox` / `roblox draggable frame script` | HowTo 深度教程 | `/editor`（一键开启拖拽功能） |

> **被置换文章去向**：原 W7 `roblox-gui-code-generator`、W9 `drag-and-drop-vs-ai-roblox-ui-builder`、W10 `free-vs-paid-roblox-gui-makers` 降级为"按需补充文章"，目标词已分别由 `/editor`、首页、`/pricing` 落地页覆盖，优先级低于真实痛点教程，可在 12 周后视流量补发。

### 1.1 发布时间线与流量预期

```
Week 1-4:    冷启动期 — 建立索引，0 流量预期。重点：高质量内容 + 内链搭建。
Week 5-8:    初步增长期 — 部分文章开始进入 Google 索引。目标：前 8 篇文章全部索引。
Week 9-12:   稳定产出期 — W1-W4 文章开始获得排名。目标：至少 3 篇文章进入目标关键词 Top 10。

┌──────────────────────────────────────────────────────────────────────────┐
│  W1    W2    W3    W4    W5    W6    W7    W8    W9    W10   W11   W12  │
│  ██    ██    ██    ██    ██    ██    ██    ██    ██    ██    ██    ██   │
│  ▲                                                                      │
│  └─ Pillar 1 首发                                                       │
│                                                                          │
│  预期流量 (12 周后):                                                     │
│  - Organic: 5,000-8,000 monthly visits                                   │
│  - 主要来源: roblox gui maker (首页主词)                                │
│            roblox figma to studio (800/mo)                              │
│            roblox gui templates free (600/mo, → /templates)            │
│            roblox simulator/fps/roleplay (→ /use-cases 场景词)         │
│            how to fix roblox gui scaling (→ /guides)                   │
│            其他长尾词合计: ~2,000/mo                                     │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 三个 Cluster 详细展开

### 2.1 Cluster 1：Roblox UI 设计工具（工具型）

**主题**：帮助开发者选择和使用 Roblox UI 设计工具
**支柱页面**：`/blog/best-roblox-ui-maker-no-coding`
**目标用户意图**：交易型/对比型 — 用户正在寻找工具，有明确购买/使用意图
**渲染模式**：SSG

#### 支柱页面结构

```
The Best Roblox UI Maker Without Coding in 2026
│
├── Introduction: Roblox GUI 编辑痛点（引用 DevForum 数据）
├── What Makes a Good Roblox UI Maker?
│   ├── 拖拽编辑 vs AI 生成 vs 模板
│   ├── Studio 集成能力
│   └── 定价合理性
├── Top 5 Roblox UI Makers Compared
│   ├── #1 Roblox GUI Maker (我们) — 唯一三合一平台
│   ├── #2 Bloxsmith — 最佳 AI 生成质量
│   ├── #3 NexusRBX — 最佳代码质量
│   ├── #4 FigBloxUI — 最佳 Figma 集成
│   └── #5 Sketch — 最佳免费插件
├── Comparison Table (功能矩阵)
├── How to Choose: 决策树
│   ├── 需要 AI 生成？→ Roblox GUI Maker / Bloxsmith
│   ├── 需要 Figma 导入？→ Roblox GUI Maker / FigBloxUI
│   ├── 需要免费方案？→ Roblox GUI Maker Free / Sketch
│   └── 需要模板市场？→ Roblox GUI Maker / gfxcomet
├── Why We Built Roblox GUI Maker (品牌故事)
└── CTA: "Try Roblox GUI Maker Free"
```

#### 子话题文章清单

| # | 文章标题 | URL | 目标关键词 | 与支柱关系 |
|---|---------|-----|-----------|----------|
| S1 | How to Fix Roblox GUI Scaling: Scale vs Offset（博客导读，深度版 → `/guides/fix-gui-scaling`） | `/blog/roblox-gui-scaling-guide` | `how to fix roblox gui scaling` / `roblox gui scaling tool` | 从支柱页 Scaling 部分延伸；深度教程迁 guides |
| S2 | 5 Best Roblox Studio UI Editor Alternatives | `/blog/5-best-roblox-studio-ui-editor-alternatives` | `roblox studio ui editor alternative`（对比意图） | 从支柱页 Top 5 比较表延伸 |
| S3 | Why AI UI Generators for Roblox Often Fail (And How to Fix It) | `/blog/ai-ui-generator-failures` | `roblox ai ui generator` / `bloxsmith alternative` | 从支柱页 AI 生成质量讨论延伸，竞品拦截 |
| S4 | 2026 Roblox UI Design Trends & Best Practices | `/blog/2026-roblox-ui-design-trends` | `roblox ui design plugin` / `roblox ui templates` | 从支柱页 "What Makes a Good UI Maker" 延伸 |
| (常驻 guides) | The Ultimate Guide to UIListLayout & UIGridLayout | `/guides/uilistlayout-uigridlayout` | `how to use uilistlayout roblox` / `roblox uigridlayout spacing` | 组件痛点深度教程 |
| (常驻 guides) | How to Make a Draggable GUI in Roblox | `/guides/draggable-gui` | `how to make a draggable gui roblox` / `roblox draggable frame script` | 交互脚本深度教程 |

> **降级文章**（不占 12 周首发）：`/blog/roblox-gui-code-generator`（`roblox gui code generator`）、`/blog/drag-and-drop-vs-ai-roblox-ui-builder`（`roblox ui maker drag and drop`）、`/blog/free-vs-paid-roblox-gui-makers`（`roblox gui maker pricing`）——目标词已由 `/editor`/首页/`/pricing` 覆盖，按需补发。

#### Cluster 1 内链结构

```
支柱页 (/blog/best-roblox-ui-maker-no-coding) ──→ /（回传首页权重，消除 cannibalization）
├──→ S1 (/blog/roblox-gui-scaling-guide) ──→ /guides/fix-gui-scaling（深度版）
├──→ S2 (/blog/5-best-roblox-studio-ui-editor-alternatives) ←→ /pricing（互链，意图分工）
├──→ S3 (/blog/ai-ui-generator-failures) ──→ /（可控 AI 卖点）
├──→ S4 (/blog/2026-roblox-ui-design-trends) ──→ /use-cases, /templates
├──→ /guides（教程中心枢纽）
└──→ /editor (CTA)

S1 ←→ 支柱页；S1 → /guides/fix-gui-scaling（canonical 主体）
S2 ←→ 支柱页, /pricing
S3 ←→ 支柱页, 首页
S4 ←→ 支柱页, /use-cases
常驻 guides (uilistlayout / draggable) ←→ /guides 枢纽, /editor
```

---

### 2.2 Cluster 2：Figma→Roblox 工作流（流程型）

**主题**：帮助开发者优化从设计到实现的 Figma→Roblox 工作流
**支柱页面**：`/blog/convert-figma-to-roblox-studio-ui`
**目标用户意图**：交易型/流程型 — 用户有 Figma 设计稿，需要将其导入 Roblox
**渲染模式**：SSG

#### 支柱页面结构

```
How to Convert Figma to Roblox Studio UI in One Click
│
├── Introduction: Figma 设计师的 Roblox 困境
│   ├── DevForum 引用: "Importing UI From Figma SUCKS" (3381689)
│   └── 手动导入的 5 个痛苦步骤
├── Method 1: Roblox GUI Maker (推荐)
│   ├── Step 1: Upload Figma File
│   ├── Step 2: Auto-Convert (组件映射 + 资产上传)
│   ├── Step 3: Install Plugin & Import
│   └── Video Demo
├── Method 2: FigBloxUI
│   ├── Pros: 直接 Figma 插件集成
│   └── Cons: 无法保留组件结构，按月订阅
├── Method 3: Manual Import (传统方式)
│   ├── Step-by-step 手动流程
│   └── Pros/Cons: 完全控制但极其耗时
├── Comparison Table: 3 种方法对比
├── Best Practices for Figma-to-Roblox Design
│   ├── 命名规范
│   ├── 图层组织
│   └── 响应式设计考虑
└── CTA: "Convert Your First Figma Design Free"
```

#### 子话题文章清单

| # | 文章标题 | URL | 目标关键词 | 与支柱关系 |
|---|---------|-----|-----------|----------|
| S1 | Best Figma to Roblox Plugins Compared | `/blog/best-figma-to-roblox-plugins` | `figma to roblox plugin` | 从支柱页 Method 1 vs Method 2 延伸 |
| S2 | Importing UI From Figma Sucks — Here's the Fix | `/blog/importing-ui-from-figma-sucks-fix` | `roblox figma to studio plugin` | 从支柱页 Introduction 痛点延伸 |
| S3 | Roblox Design Workflow: From Figma to Studio in Minutes | `/blog/roblox-figma-workflow-automation` | `roblox figma workflow` | 从支柱页 Best Practices 延伸 |

#### Cluster 2 内链结构

```
支柱页 (/blog/convert-figma-to-roblox-studio-ui)
├──→ S1 (/blog/best-figma-to-roblox-plugins)
├──→ S2 (/blog/importing-ui-from-figma-sucks-fix)
├──→ S3 (/blog/roblox-figma-workflow-automation)
├──→ /editor (CTA)
└──→ /plugin (CTA)

S1 ←→ 支柱页, /plugin
S2 ←→ 支柱页, S1, /editor
S3 ←→ 支柱页, /docs
```

---

### 2.3 Cluster 3：GUI 模板市场（资源型）

**主题**：为开发者提供高质量的 Roblox GUI 模板资源和教程
**支柱页面**：`/blog/free-premium-roblox-gui-templates`
**目标用户意图**：信息型/获取型 — 用户寻找免费或付费的 UI 模板
**渲染模式**：ISR（模板列表和详情会定期更新）

#### 支柱页面结构

```
Free & Premium Roblox GUI Templates for Your Game
│
├── Introduction: 为什么使用模板能节省 10-20 小时开发时间
├── Free Templates (10 个)
│   ├── Health Bar
│   ├── Simple Shop
│   ├── Basic Inventory
│   ├── Leaderboard
│   ├── Settings Panel
│   ├── Dialog Box
│   ├── Loading Screen
│   ├── Notification System
│   ├── Minimap Frame
│   └── Score Display
├── Premium Templates (5 个)
│   ├── RPG Inventory System ($9.99)
│   ├── Weapon Wheel ($7.99)
│   ├── Backpack System ($9.99)
│   ├── Complete Shop UI ($12.99)
│   └── Clan/Guild System ($14.99)
├── How to Use Templates with Roblox GUI Maker
│   ├── 一键导入流程
│   └── 自定义修改指南
└── CTA: "Browse All Templates"
```

#### 子话题文章清单

| # | 文章标题 | URL | 目标关键词 | 与支柱关系 |
|---|---------|-----|-----------|----------|
| S1 | Top 10 Free Roblox GUI Templates for Your Game（信息型导读，CTA → `/templates`） | `/blog/top-10-free-roblox-gui-templates` | `roblox gui templates free` | 从支柱页 Free Templates 部分延伸；主战场为 `/templates` 产品页 |
| S2 | Build a Roblox Inventory GUI: Step-by-Step | `/blog/build-roblox-inventory-gui` | `roblox inventory gui template` | 从支柱页 RPG Inventory 模板延伸的深度教程 |
| S3 | How to Create a Roblox Backpack System with AI | `/blog/roblox-backpack-system-ai` | `roblox backpack system script` | 从支柱页 Backpack System 模板延伸 |
| S4 | Building a Working Roblox Shop GUI with Server Validation（★新增 W7） | `/blog/roblox-shop-gui-server-validation` | `roblox shop gui script` / `how to make a shop in roblox` | 从支柱页 Shop UI 模板延伸，强调服务器验证防作弊 |
| S5 | How to Create a Global Leaderboard GUI in Roblox（★新增 W10） | `/blog/roblox-leaderboard-ordereddatastore` | `roblox leaderboard gui free` / `ordereddatastore tutorial` | 从支柱页 Leaderboard 模板延伸，结合 OrderedDataStore |

#### Cluster 3 内链结构

```
支柱页 (/blog/free-premium-roblox-gui-templates)
├──→ S1 (/blog/top-10-free-roblox-gui-templates) ──→ /templates（主 CTA）
├──→ S2 (/blog/build-roblox-inventory-gui) ──→ /templates/rpg-inventory
├──→ S3 (/blog/roblox-backpack-system-ai) ──→ /templates/backpack-system
├──→ S4 (/blog/roblox-shop-gui-server-validation) ──→ /templates/shop-ui
├──→ S5 (/blog/roblox-leaderboard-ordereddatastore) ──→ /templates/leaderboard
├──→ /templates (CTA)
└──→ /editor?template=xxx (CTA)

S1 ←→ 支柱页, /templates
S2 ←→ 支柱页, /templates/rpg-inventory, /editor
S3 ←→ 支柱页, /templates/backpack-system, /editor
S4 ←→ 支柱页, /templates/shop-ui, /editor, /use-cases/simulator-hud（场景互链）
S5 ←→ 支柱页, /templates/leaderboard, /editor
```

---

### 2.4 Cluster 4：应用场景（场景型）★块A新增

**主题**：按游戏类型（simulator/fps/roleplay）划分的 UI 解决方案，捕获高转化意图场景长尾词
**支柱页面**：`/use-cases`（场景枢纽页，非博客）
**目标用户意图**：信息型/工具型 — 用户已确定游戏类型，寻找该类型的 UI 方案
**渲染模式**：SSG
**依据**：竞品 robloxguimaker.app 通过 `/for` 目录验证此结构有效（见 `additional/keyword_clusters.md` Cluster 3）

#### 支柱页面结构

```
/use-cases — How to Make a GUI for Any Roblox Game
│
├── Introduction: 不同游戏类型的 UI 需求差异
├── Game-Type Grid（卡片导航）
│   ├── Simulator HUD → /use-cases/simulator-hud
│   ├── FPS Game UI   → /use-cases/fps-game-ui
│   ├── Roleplay Menu → /use-cases/roleplay-menu
│   ├── Tycoon UI（二期扩展）
│   └── Obby HUD（二期扩展）
└── CTA: "Start Designing Free" → /editor
```

#### 子话题（场景详情页）清单

| # | 页面 | URL | 目标关键词 | 内容重点 |
|---|------|-----|-----------|---------|
| S1 | Simulator HUD | `/use-cases/simulator-hud` | `roblox simulator hud design` | 紧凑布局、货币展示、属性面板、明显点击反馈 |
| S2 | FPS Game UI | `/use-cases/fps-game-ui` | `roblox fps game ui maker` | 准星、弹药面板、击杀提示 |
| S3 | Roleplay Menu | `/use-cases/roleplay-menu` | `roblox roleplay menu gui` | 角色选择、职业切换等复杂菜单 |

#### Cluster 4 内链结构

```
枢纽页 (/use-cases) ──→ /editor（CTA）
├──→ S1 (/use-cases/simulator-hud) ──→ /templates（相关 HUD 模板）, /editor
├──→ S2 (/use-cases/fps-game-ui) ──→ /templates, /editor
└──→ S3 (/use-cases/roleplay-menu) ──→ /templates, /editor

S1-S3 ←→ 枢纽页；各场景页 → 对应模板（Cluster 3 跨链）+ /guides（教程跨链）
首页 Use-Case Strip ──→ /use-cases 枢纽
```

---

### 2.5 三阶段 × 四 Cluster 映射说明

Manus 检索的"三阶段"（痛点解决 → 进阶系统 → 行业对比）与本文档的"四 Cluster"是**互补维度**，映射关系：

| Manus 三阶段 | 对应 Cluster / 页面 |
|-------------|-------------------|
| 阶段一：痛点解决（Scaling、UIListLayout、Draggable） | Cluster 1 子话题 + `/guides/*` 深度教程 |
| 阶段二：进阶系统（Shop、Inventory、Leaderboard） | Cluster 3 子话题 S2-S5 + `/templates/*` |
| 阶段三：行业对比（Figma vs Studio、AI 失败、设计趋势） | Cluster 1 比较文 + Cluster 2 流程对比 |
| （Manus 未显式分类的场景需求） | Cluster 4 `/use-cases/*`（场景型） |

---

## 3. 内部链接策略表

### 3.1 工具/产品页 → 博客内容页（权重传递方向）

| 源页面 (高权重) | 锚文本 | 目标页面 | 链接类型 | 策略目的 |
|----------------|--------|---------|---------|---------|
| `/` (首页) | "Best Roblox UI Maker Guide" | `/blog/best-roblox-ui-maker-no-coding` | 导航内链 | 首页权重传递给支柱页 |
| `/` (首页) | "Free Roblox GUI Templates" | `/templates` | Footer | 分发首页权重给模板市场 |
| `/` (首页) | "How to Import Figma to Roblox" | `/blog/convert-figma-to-roblox-studio-ui` | Features 区块 | 传递权重给 Cluster 2 支柱页 |
| `/editor` | "Learn GUI Scaling Best Practices" | `/blog/roblox-gui-scaling-guide` | Help 链接 | 工具用户 → 教程内容 |
| `/editor` | "Browse Templates" | `/templates` | Toolbar 按钮 | 工具用户 → 模板市场 |
| `/templates` | "How to Build a Custom GUI" | `/editor` | Banner CTA | 模板浏览者 → 工具 |
| `/pricing` | "See What Pro Users Build" | `/templates` | Social Proof | 定价页 → 模板展示 |

### 3.2 博客内容页之间（Cluster 内部权重传递）

| 源页面 | 锚文本 | 目标页面 | 链接类型 |
|-------|--------|---------|---------|
| `/blog/best-roblox-ui-maker-no-coding` | "master GUI scaling" | `/blog/roblox-gui-scaling-guide` | 支柱 → 子话题 |
| `/blog/best-roblox-ui-maker-no-coding` | "compare Studio alternatives" | `/blog/5-best-roblox-studio-ui-editor-alternatives` | 支柱 → 子话题 |
| `/blog/best-roblox-ui-maker-no-coding` | "AI code generation" | `/blog/roblox-gui-code-generator` | 支柱 → 子话题 |
| `/blog/roblox-gui-code-generator` | "drag-and-drop vs AI comparison" | `/blog/drag-and-drop-vs-ai-roblox-ui-builder` | 子话题 ↔ 子话题 |
| `/blog/drag-and-drop-vs-ai-roblox-ui-builder` | "see free vs paid options" | `/blog/free-vs-paid-roblox-gui-makers` | 子话题 ↔ 子话题 |
| `/blog/convert-figma-to-roblox-studio-ui` | "best Figma plugins" | `/blog/best-figma-to-roblox-plugins` | 支柱 → 子话题 |
| `/blog/convert-figma-to-roblox-studio-ui` | "why Figma import is broken" | `/blog/importing-ui-from-figma-sucks-fix` | 支柱 → 子话题 |
| `/blog/importing-ui-from-figma-sucks-fix` | "automated workflow solution" | `/blog/roblox-figma-workflow-automation` | 子话题 ↔ 子话题 |
| `/blog/free-premium-roblox-gui-templates` | "top 10 free templates" | `/blog/top-10-free-roblox-gui-templates` | 支柱 → 子话题 |
| `/blog/free-premium-roblox-gui-templates` | "build an inventory GUI" | `/blog/build-roblox-inventory-gui` | 支柱 → 子话题 |
| `/blog/build-roblox-inventory-gui` | "create a backpack system" | `/blog/roblox-backpack-system-ai` | 子话题 ↔ 子话题 |

### 3.3 博客内容页 → 产品/转化页（转化路径）

| 源页面 | 锚文本 | 目标页面 | 位置 | 转化意图 |
|-------|--------|---------|------|---------|
| `/blog/best-roblox-ui-maker-no-coding` | "Try Roblox GUI Maker Free" | `/editor` | 文中 H2 后 + 文末 | 工具试用 |
| `/blog/best-roblox-ui-maker-no-coding` | "See pricing" | `/pricing` | 定价提及处 | 定价查询 |
| `/blog/convert-figma-to-roblox-studio-ui` | "Import Your Figma Design Now" | `/editor` | Method 1 推荐后 + 文末 | 工具试用 |
| `/blog/convert-figma-to-roblox-studio-ui` | "Install the free plugin" | `/plugin` | Method 1 Step 3 后 | 插件安装 |
| `/blog/top-10-free-roblox-gui-templates` | "Browse all templates" | `/templates` | 列表末尾 | 模板浏览 |
| `/blog/top-10-free-roblox-gui-templates` | "Customize in our editor" | `/editor` | 每个模板描述后 | 工具试用 |
| `/blog/5-best-roblox-studio-ui-editor-alternatives` | "Try our free alternative" | `/editor` | 每个竞品对比后 + 文末 | 工具试用 |
| `/blog/build-roblox-inventory-gui` | "Get the RPG Inventory template" | `/templates/rpg-inventory` | 教程完成后 | 模板购买/使用 |
| `/blog/roblox-backpack-system-ai` | "Get the Backpack System template" | `/templates/backpack-system` | 教程完成后 | 模板购买/使用 |
| `/blog/free-vs-paid-roblox-gui-makers` | "Start with our free plan" | `/pricing` | 结论部分 | 定价页转化 |
| 所有博客文章 | "Roblox GUI Maker" (首次提及) | `/` | 首段 | 品牌认知 |
| 所有博客文章 | "Try our free GUI Maker" | `/editor` | 文末 Author Box CTA | 统一转化 CTA |

### 3.4 跨 Cluster 链接（提升内容发现）

| 源 Cluster | 目标 Cluster | 锚文本示例 | 链接场景 |
|-----------|-------------|----------|---------|
| Cluster 1 (工具) | Cluster 2 (流程) | "import your Figma designs" | 工具文章中提及 Figma 导入功能时 |
| Cluster 1 (工具) | Cluster 3 (资源) | "pre-built GUI templates" | 工具文章中提及模板库时 |
| Cluster 2 (流程) | Cluster 1 (工具) | "AI-powered UI builder" | Figma 文章中提及 AI 生成替代方案时 |
| Cluster 2 (流程) | Cluster 3 (资源) | "Figma-to-Roblox template pack" | Figma 文章中提及现成模板时 |
| Cluster 3 (资源) | Cluster 1 (工具) | "customize this template" | 模板文章中引导用户使用编辑器修改 |
| Cluster 3 (资源) | Cluster 2 (流程) | "import your own Figma design" | 模板文章中提及自定义设计导入 |

---

## 4. 视频内容策略（Roblox 特有）

### 4.1 为什么需要视频

Roblox 开发者群体特征：
- 平均年龄 13-24 岁，强烈偏好视频内容
- YouTube 和 TikTok 是主要信息获取渠道
- DevForum 帖子中视频教程的互动率是纯文本的 3-5 倍
- "How to" 类视频搜索量远高于文字教程

### 4.2 视频制作计划

| 优先级 | 视频标题 | 平台 | 时长 | 对应文章 | 发布周 |
|--------|---------|------|------|---------|--------|
| P0 | "Build a Roblox GUI in 3 Minutes (No Coding)" | YouTube + TikTok | 3min + 60s | W1 Pillar | W1 |
| P0 | "Figma to Roblox Studio — One Click Import" | YouTube | 5min | W2 Pillar | W2 |
| P1 | "Roblox GUI Scaling FIXED — Scale & Offset Explained" | YouTube | 8min | W5 Tutorial | W5 |
| P1 | "Build an RPG Inventory GUI from Scratch" | YouTube | 10min | W6 Tutorial | W6 |
| P2 | "Bloxsmith vs Roblox GUI Maker — Which is Better?" | YouTube | 4min | W4 Comparison | W4 |
| P2 | "AI Generates My Entire Roblox GUI (Mind-Blowing)" | YouTube + TikTok | 3min + 60s | W7 Promotion | W7 |
| P3 | "Importing UI from Figma SUCKS — I Fixed It" | YouTube | 3min | W11 Pain Point | W11 |
| P3 | "2026 Roblox UI Trends You Need to Know" | TikTok | 60s | W12 Trends | W12 |

### 4.3 视频 SEO 最佳实践

- 标题包含目标关键词
- Description 前 2 行包含文章 URL + CTA
- 所有视频添加 `VideoObject` Schema（嵌入对应博客文章 JSON-LD）
- YouTube 视频添加 Chapters（时间戳），提高搜索可见性
- TikTok 使用 3-5 个 Roblox 相关 Hashtags（`#robloxdev` `#robloxgui` `#gamedev`）

### 4.4 视频嵌入 Schema 示例

```typescript
// 博客文章 JSON-LD @graph 中添加 VideoObject
{
  "@type": "VideoObject",
  "name": "Build a Roblox GUI in 3 Minutes (No Coding)",
  "description": "Step-by-step tutorial showing how to build a complete Roblox GUI using the Roblox GUI Maker drag-and-drop editor. No coding required.",
  "thumbnailUrl": "https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg",
  "uploadDate": "2026-06-22",
  "duration": "PT3M00S",
  "contentUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "embedUrl": "https://www.youtube.com/embed/VIDEO_ID",
  "interactionStatistic": {
    "@type": "InteractionCounter",
    "interactionType": { "@type": "WatchAction" },
    "userInteractionCount": "0"
  }
}
```

---

## 5. 内容发布 SOP

### 5.1 每篇文章发布前 Checklist

- [ ] 标题包含目标关键词（前 60 字符内）
- [ ] Meta Description 包含目标关键词，≤ 160 字符，有 CTA
- [ ] URL slug 匹配目标关键词（小写，连字符分隔）
- [ ] H1 与 Title 一致或高度相关
- [ ] H2/H3 中包含 LSI 关键词（如 "Roblox Studio", "Luau", "ScreenGui", "GUI design"）
- [ ] 首段 100 字内出现目标关键词
- [ ] **目录（Table of Contents）已添加**：长文必须含 H2 锚点 TOC，提升阅读体验并增加 SERP Sitelinks 机会 ★块D新增
- [ ] **至少 3 张实质性截图**：Roblox Studio 截图 / Figma 设计稿截图 / 代码片段（Alt 文本含关键词）★块D新增
- [ ] 至少 2 个内部链接（指向支柱页 + 转化页）
- [ ] 至少 1 个外部权威链接（Roblox 官方文档、DevForum）
- [ ] JSON-LD Schema 已添加（BlogPosting + Article + BreadcrumbList；guides 页用 HowTo + TechArticle）
- [ ] Open Graph 图片已设置（1200×630）
- [ ] Canonical URL 已设置（**博客导读文章 canonical 指向 `/guides` 深度版**，防重复内容）★块B新增
- [ ] 字数 ≥ 2000（支柱页 ≥ 2500；博客导读可 ≥ 1500）
- [ ] 段落 ≤ 3-4 句，便于移动端阅读
- [ ] **代码块使用干净的 Luau 语法高亮**：吸引直接搜索代码片段的开发者，提升专业度 ★块D强化
- [ ] **文末明确 CTA（二选一双模板）**：① "Try this design in our editor" → `/editor`（工具转化）② "Download the free template" → `/templates`（资源转化）★块D新增
- [ ] 如包含视频，VideoObject Schema 已添加

### 5.2 发布后动作

1. **提交 Google Indexing API**（新文章发布 24h 内）
2. **提交 Bing IndexNow API**
3. **在 DevForum 签名或相关帖子中自然引用**（不 spam）
4. **在 Reddit r/robloxgamedev 分享**（仅高质量教程，遵守 10:1 规则）
5. **在 Twitter/X 发布**（带文章截图 + 关键要点线程）
6. **添加到 Google Search Console** 并请求索引
7. **72h 后检查索引状态**

### 5.3 内容更新节奏

| 内容类型 | 更新频率 | 更新动作 |
|---------|---------|---------|
| 支柱页（Pillar） | 每季度 | 更新数据、竞品信息、截图、年份标题（如 2026 → 2027） |
| 比较文 | 每半年 | 检查竞品是否变化（定价/功能），更新对比表 |
| 教程 | 按需 | 如果 Roblox API 变化导致代码失效，立即更新 |
| 列表文（Top 10） | 每季度 | 增加新模板，移除下架模板，更新截图 |
| 趋势文 | 每年 | 完全重写（年度趋势变化大） |

---

## 6. 内容效果追踪 KPI

### 6.1 SEO 指标（月度追踪）

| 指标 | 3 个月目标 | 6 个月目标 | 12 个月目标 |
|------|----------|----------|-----------|
| 索引页面数 | 20+ | 30+ | 50+ |
| Organic Clicks (GSC) | 1,000/mo | 5,000/mo | 20,000/mo |
| Avg. Position (主要关键词) | Top 30 | Top 15 | Top 5 |
| CTR (主要关键词) | 2%+ | 4%+ | 6%+ |
| 内链点击（GA4） | 200/mo | 800/mo | 3,000/mo |
| 转化率（博客 → 注册） | 1% | 2% | 3% |

### 6.2 内容质量指标

| 指标 | 目标 |
|------|------|
| Avg. Time on Page | > 3min |
| Bounce Rate | < 60% |
| Scroll Depth | > 50% |
| Social Shares | > 10/post (cumulative) |
| Backlinks (自然获得) | > 5/post (6个月内) |

### 6.3 关键词排名追踪清单

每月在 Semrush/Ahrefs 中追踪以下关键词的排名变化：

```
P0 (核心商业词):
  roblox gui maker                  [目标: Top 5 — 首页主词]
  roblox ui maker no coding         [目标: Top 5 — 首页次词 / 博客长尾 best...2026]
  roblox figma to studio            [目标: Top 5]

P1 (高价值长尾):
  roblox gui templates free         [目标: Top 5 — /templates 主战场]
  roblox studio ui editor alternative [目标: Top 5 — /pricing + 博客对比文]
  roblox figma to studio plugin     [目标: Top 5]

P2 (场景词 + 教程词 — 块A/B 新增):
  roblox simulator hud design       [目标: Top 5 — /use-cases/simulator-hud]
  roblox fps game ui maker          [目标: Top 5 — /use-cases/fps-game-ui]
  roblox roleplay menu gui          [目标: Top 5 — /use-cases/roleplay-menu]
  how to make gui for roblox games  [目标: Top 10 — /use-cases 枢纽]
  how to fix roblox gui scaling     [目标: Top 5 — /guides/fix-gui-scaling]
  how to use uilistlayout roblox    [目标: Top 5 — /guides/uilistlayout-uigridlayout]
  roblox uigridlayout spacing       [目标: Top 5 — /guides/uilistlayout-uigridlayout]
  how to make a draggable gui roblox [目标: Top 5 — /guides/draggable-gui]
  roblox gui tutorial 2026          [目标: Top 10 — /guides 枢纽]

P3 (进阶系统 + 竞品拦截 — 块E 新增):
  roblox shop gui script            [目标: Top 10 — W7]
  how to make a shop in roblox      [目标: Top 10 — W7]
  roblox leaderboard gui free       [目标: Top 5 — W10]
  ordereddatastore tutorial         [目标: Top 10 — W10]
  roblox ai ui generator            [目标: Top 5 — W9]
  bloxsmith alternative             [目标: Top 5 — W9 竞品拦截]
  roblox inventory gui template     [目标: Top 5]
  roblox backpack system script     [目标: Top 5]
  roblox draggable frame script     [目标: Top 10 — /guides/draggable-gui]

降级词（已由落地页覆盖，不单独追踪首发）:
  roblox ui maker drag and drop     [→ /editor]
  roblox gui code generator         [→ /editor]
  roblox gui maker pricing          [→ /pricing]
  roblox ui design plugin           [→ W12 趋势文]
```

---

## 附录：内容模板

### 比较文模板（用于 Cluster 1 W1, W4, W9, W10）

```markdown
# [H1: 含目标关键词]

## Introduction
[100字 — 问题陈述 + 目标关键词首次出现]

## What Makes a Good [产品类别]?
[300字 — 3-5 个评估维度，含 LSI 关键词]

## Top [N] [产品类别] Compared
### #1 [我们] — [独特卖点]
### #2 [竞品 A] — [竞品卖点]
### #3 [竞品 B] — [竞品卖点]
...

## Comparison Table
[Markdown 表格 — 功能 × 产品矩阵]

## Which One Should You Choose?
[300字 — 决策树/场景推荐]

## Why We Built [产品名]
[200字 — 品牌故事]

## Try [产品名] Free
[CTA — 链接到 /editor]
```

### 教程模板（用于 Cluster 2 W2, Cluster 1 W5, Cluster 3 W6, W8）

```markdown
# [H1: How to / Build / Create ...]

## Introduction
[100字 — 教程目标 + 目标关键词]

## Prerequisites
[列表 — 需要的前置条件/工具]

## Step 1: [动作]
[200-300字 + 截图]

## Step 2: [动作]
[200-300字 + 截图]

## Step 3: [动作]
[200-300字 + 截图]

...

## Complete Luau Code
```lua
-- Full working code
```

## Video Tutorial
[YouTube embed]

## Next Steps
[CTA — 链接到 /editor 或 /templates]
```

### 列表文模板（用于 Cluster 3 W3）

```markdown
# [H1: Top N ...]

## Introduction
[100字 — 列表概述 + 目标关键词]

## [Template 1 Name]
[150字 + 截图 + 功能列表 + CTA]

## [Template 2 Name]
[150字 + 截图 + 功能列表 + CTA]

...

## How to Use These Templates
[200字 — 导入流程说明]

## Build Your Own Custom GUI
[CTA — 链接到 /editor]
```
