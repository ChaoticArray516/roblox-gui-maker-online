# Roblox GUI Maker — 信息架构文档

> **产品**：Roblox GUI Maker（在线工具 + Roblox Studio 插件）
> **技术栈终选**：Next.js 16 + React 19 + Tailwind v4 + Vercel + Roblox Plugin SDK
> **来源**：Phase 2 Round 2 DeepSeek-V4 完整文档生成
> **生成日期**：2026-06-18

---

## 目录

1. [Web 端 URL 路由表](#1-web-端-url-路由表)
2. [页面层级树状描述](#2-页面层级树状描述)
3. [Roblox Studio 插件端架构](#3-roblox-studio-插件端架构)
4. [核心转化路径（用户动线）](#4-核心转化路径用户动线)
5. [渲染模式决策说明](#5-渲染模式决策说明)
6. [内部链接结构图](#6-内部链接结构图)

---

## 1. Web 端 URL 路由表

> **重组说明（2026-06-18）**：本表已吸收 Manus 深度检索（`additional/`）的结构性补充——新增 `/use-cases` 应用场景枢纽与 `/guides` 教程中心，并修正首页与博客的关键词自我竞争（cannibalization）。新增 **H1 文案列**。详见 [REORG_CHANGELOG.md](REORG_CHANGELOG.md)。

| 层级 | 路由 | 页面类型 | H1 文案 | 目标关键词 | Schema 类型 | 渲染模式 | 内链指向 | 索引策略 |
|------|------|---------|---------|-----------|------------|---------|---------|---------|
| L1 | `/` | 首页/落地页 | Roblox GUI Maker: Visually Build & Export Clean Luau in Seconds | `roblox gui maker`（主）/ `roblox ui maker no coding`（次，写入描述） | WebSite + SoftwareApplication + Organization | SSG | `/editor`, `/templates`, `/use-cases`, `/guides`, `/pricing`, `/plugin` | index, follow |
| L1 | `/editor` | 在线编辑器（工具核心） | Build Your Roblox GUI Online — Drag, Drop, Done | `roblox ui maker drag and drop` | SoftwareApplication + FAQPage + HowTo | CSR | `/templates`, `/plugin`, `/docs`, `/faq` | index, nofollow |
| L1 | `/figma-to-roblox` | 功能落地页 | Convert Figma to Roblox Studio UI in One Click | `roblox figma to studio` | SoftwareApplication + HowTo | SSG | `/editor`, `/plugin`, `/guides`, `/blog` | index, follow |
| L1 | `/templates` | 模板市场列表 | Free & Premium Roblox GUI Templates (Ready-to-Play) | `roblox gui templates free`（主战场） | WebSite + CollectionPage + FAQPage | ISR (3600s) | `/templates/[slug]`, `/use-cases`, `/pricing`, `/editor` | index, follow |
| L2 | `/templates/[slug]` | 模板详情页 | [Template Name] Roblox GUI Template with [Key Feature] | `[模板名] roblox gui template` | Product + SoftwareApplication + ImageGallery + BreadcrumbList | ISR (3600s) | `/templates`, `/editor?template={slug}`, 同类模板 | index, follow |
| **L1** | **`/use-cases`** | **应用场景枢纽页（新增）** | **How to Make a GUI for Any Roblox Game** | **`how to make gui for roblox games`** | **CollectionPage + ItemList + BreadcrumbList** | **SSG** | **`/use-cases/[game-type]`, `/templates`, `/editor`** | **index, follow** |
| **L2** | **`/use-cases/[game-type]`** | **场景详情页（新增）** | **Design the Perfect [Game Type] UI for Your Roblox Game** | **`roblox simulator hud design` / `roblox fps game ui maker` / `roblox roleplay menu gui`** | **HowTo + ItemList + BreadcrumbList** | **SSG** | **`/templates`, `/editor`, `/guides`** | **index, follow** |
| **L1** | **`/guides`** | **教程中心枢纽页（新增）** | **Roblox GUI Tutorials & Guides (2026)** | **`roblox gui tutorial 2026`** | **CollectionPage + BreadcrumbList** | **SSG** | **`/guides/[slug]`, `/editor`** | **index, follow** |
| **L2** | **`/guides/[slug]`** | **深度教程页（新增）** | **[How to ...] — Complete Roblox Guide** | **`how to fix roblox gui scaling` / `how to use uilistlayout roblox` / `how to make a draggable gui roblox`** | **HowTo + TechArticle + BreadcrumbList** | **SSG** | **同级 guides, `/editor`, `/templates`** | **index, follow** |
| L1 | `/pricing` | 定价页 | Roblox GUI Maker Pricing — Free & Pro Plans | `roblox studio ui editor alternative`（交易意图主战场） | Product (×2) + FAQPage | SSG | `/editor`, `/plugin`, `/faq` | index, follow |
| L1 | `/plugin` | 插件下载/安装指南 | Roblox Studio Plugin — One-Click GUI Import | `roblox studio ui design plugin` | SoftwareApplication + WebApplication | SSG | `/docs`, `/editor`, `/faq` | index, follow |
| L1 | `/blog` | 博客列表 | Roblox GUI Maker Blog — Tips, Tutorials & Guides | `roblox gui maker blog` | Blog + BreadcrumbList | SSG | `/blog/[slug]`, `/guides` | index, follow |
| L2 | `/blog/[slug]` | 博客详情页 | 文章目标关键词（长尾变体优先） | 文章目标关键词 | BlogPosting + Article + BreadcrumbList | SSG | `/editor`, `/templates`, `/guides`, `/plugin` | index, follow |
| L1 | `/docs` | 开发文档索引 | Roblox GUI Maker Documentation | `roblox gui maker documentation` | TechArticle + BreadcrumbList | SSG | `/plugin`, `/editor`, `/faq` | index, follow |
| L2 | `/docs/[slug]` | 具体文档页 | 文档主题 | 文档主题关键词 | TechArticle + BreadcrumbList | SSG | 同级文档, `/plugin` | index, follow |
| L1 | `/faq` | 常见问题 | Roblox GUI Maker — Frequently Asked Questions | `roblox gui maker faq` | FAQPage + BreadcrumbList | SSG | `/pricing`, `/editor`, `/plugin` | index, follow |
| L1 | `/search` | 站内搜索 | （聚合页，无 H1 SEO 价值） | （聚合页） | SearchAction (via WebSite) | CSR | 搜索结果动态链接 | noindex |
| L1 | `/dashboard` | 用户面板（需登录） | （不需 SEO） | （不需 SEO） | （无 Schema） | CSR | 登录后内部导航 | noindex, nofollow |
| L2 | `/dashboard/projects` | 用户项目列表 | （不需 SEO） | （不需 SEO） | （无 Schema） | CSR | `/editor/[project_id]` | noindex, nofollow |
| L2 | `/dashboard/settings` | 账号设置 | （不需 SEO） | （不需 SEO） | （无 Schema） | CSR | 面板内部链接 | noindex, nofollow |
| L2 | `/dashboard/billing` | 账单/订阅管理 | （不需 SEO） | （不需 SEO） | （无 Schema） | CSR | `/pricing` | noindex, nofollow |

> **关键词分工原则（消除 cannibalization）**：
> - **首页 `/`** 独占品牌核心词 `roblox gui maker`；`roblox ui maker no coding` 降为描述次要词，不再与博客 W1 抢主词。
> - **博客 W1** (`/blog/best-roblox-ui-maker-no-coding`) 改打长尾变体 `best roblox ui maker no coding 2026`，内链锚文本回指首页传递权重。
> - **`roblox gui templates free`** 主战场为 `/templates` 产品页；博客 `top-10-free` 仅作信息型导读，CTA 指向 `/templates`。
> - **`roblox studio ui editor alternative`** 交易意图归 `/pricing`，对比意图归博客对比文，二者互链而非抢词。
> - **落地页**（`/`、`/templates`、`/use-cases`、`/figma-to-roblox`）承载交易/获取型词；**博客**（`/blog/*`）承载对比/信息/趋势型词；**深度教程**（`/guides/*`）承载 how-to 问题解决型词。

### 路由文件系统映射（Next.js App Router）

```
app/
├── page.tsx                  → /
├── layout.tsx                → 全局布局
├── editor/
│   └── page.tsx              → /editor (CSR)
├── figma-to-roblox/
│   └── page.tsx              → /figma-to-roblox (SSG)
├── templates/
│   ├── page.tsx              → /templates (ISR)
│   └── [slug]/
│       └── page.tsx          → /templates/[slug] (ISR)
├── use-cases/                → 应用场景体系（新增，块 A）
│   ├── page.tsx              → /use-cases (SSG, 枢纽页)
│   └── [game-type]/
│       └── page.tsx          → /use-cases/[game-type] (SSG)
├── guides/                   → 教程中心（新增，块 B）
│   ├── page.tsx              → /guides (SSG, 枢纽页)
│   └── [slug]/
│       └── page.tsx          → /guides/[slug] (SSG)
├── pricing/
│   └── page.tsx              → /pricing (SSG)
├── plugin/
│   └── page.tsx              → /plugin (SSG)
├── blog/
│   ├── page.tsx              → /blog (SSG)
│   └── [slug]/
│       └── page.tsx          → /blog/[slug] (SSG)
├── docs/
│   ├── page.tsx              → /docs (SSG)
│   └── [slug]/
│       └── page.tsx          → /docs/[slug] (SSG)
├── faq/
│   └── page.tsx              → /faq (SSG)
├── search/
│   └── page.tsx              → /search (CSR)
├── dashboard/
│   ├── layout.tsx            → 认证守卫布局
│   ├── page.tsx              → /dashboard (CSR)
│   ├── projects/
│   │   └── page.tsx          → /dashboard/projects (CSR)
│   ├── settings/
│   │   └── page.tsx          → /dashboard/settings (CSR)
│   └── billing/
│       └── page.tsx          → /dashboard/billing (CSR)
├── auth/
│   ├── login/
│   │   └── page.tsx          → /auth/login
│   ├── signup/
│   │   └── page.tsx          → /auth/signup
│   └── callback/
│       └── route.ts          → /auth/callback (OAuth handler)
├── api/
│   ├── ai/
│   │   └── generate/
│   │       └── route.ts      → POST /api/ai/generate
│   ├── figma/
│   │   └── import/
│   │       └── route.ts      → POST /api/figma/import
│   ├── templates/
│   │   └── route.ts          → GET /api/templates
│   └── plugin/
│       └── sync/
│           └── route.ts      → GET /api/plugin/sync
├── robots.ts                 → /robots.txt
├── sitemap.ts                → /sitemap.xml
└── globals.css
```

---

## 2. 页面层级树状描述

### 2.1 Web 端

```
Roblox GUI Maker (https://robloxguimaker.com)
│
├── 📊 Marketing（营销与获客层）— 全部 SSG
│   ├── /                          首页/落地页
│   │   ├── H1: "Roblox GUI Maker: Visually Build & Export Clean Luau in Seconds"
│   │   ├── Hero: AI UI Generator 主打 + CTA → /editor（主词 roblox gui maker）
│   │   ├── Pain-Point Comparison: "Roblox Studio 原生编辑器 vs 我们" 对比区
│   │   │     （引用 DevForum/Reddit 真实抱怨：无缩放平移、对齐难、Scale/Offset 噩梦）★块D新增
│   │   ├── Features: 三大核心功能卡片（拖拽编辑器 / AI生成 / Figma导入）
│   │   ├── Use-Case Strip: 按游戏类型入口（Simulator/FPS/Roleplay）→ /use-cases ★块A新增
│   │   ├── Templates Preview: 热门模板缩略图轮播 → /templates
│   │   ├── Comparison: vs Bloxsmith / vs FigBloxUI 对比表
│   │   ├── Social Proof: 用户评价 / DevForum 引用
│   │   └── CTA: "Try Editor Free" → /editor
│   │
│   ├── /figma-to-roblox           功能落地页（Figma→Studio 专页）
│   │   ├── H1: "Convert Figma to Roblox Studio UI in One Click"
│   │   ├── Pain-Point Intro: 引用 Reddit/DevForum "手动导出图片、复制 Asset ID 太耗时" 真实抱怨 ★块D新增
│   │   ├── Hero: "Figma to Roblox Studio in One Click"
│   │   ├── Demo Video/GIF: YouTube 嵌入 1分钟演示（一键转换带层级 ScreenGui + 自动上传图片）
│   │   ├── Step-by-Step: 3步流程图
│   │   ├── Comparison: 对比 FigBloxUI / 手动导入
│   │   └── CTA: "Download the Studio Plugin" → /plugin（主转化）+ 次 CTA "Try in Editor" → /editor ★块D修正
│   │
│   └── /pricing                   定价页
│       ├── Plan Cards: Free vs Pro ($9.99/mo)
│       ├── Feature Comparison Table
│       ├── FAQ: 定价相关 5 问
│       └── CTA: "Start Free" / "Go Pro"
│
├── 🛠️ App（工具核心层）
│   ├── /editor                    在线编辑器入口（CSR，免登录预览模式）
│   │   ├── Canvas: 拖拽画布（缩放/平移/智能对齐）
│   │   ├── Toolbar: 组件库（Frame, TextLabel, TextButton, ImageButton...）
│   │   ├── Properties Panel: 属性编辑面板
│   │   ├── Layer Panel: 图层面板
│   │   ├── AI Prompt Bar: 自然语言输入框
│   │   ├── Code Preview: 实时 Luau 代码预览
│   │   └── Export Button: "Export to Studio" → 触发插件 URI Scheme
│   │
│   └── /editor/[project_id]       已保存项目（需登录，CSR）
│       ├── 同上编辑器组件
│       ├── Version History: 版本历史
│       └── Collaboration: 分享链接（只读预览）
│
├── 🛒 Marketplace（模板市场层）
│   ├── /templates                 模板列表（ISR，含筛选器）
│   │   ├── Category Filters: Inventory / Shop / HUD / Settings / Loading
│   │   ├── Price Filters: Free / Premium
│   │   ├── Sort: Popular / Newest / Rating
│   │   ├── Template Cards: 缩略图 + 名称 + 价格 + 评分
│   │   └── Search Bar
│   │
│   └── /templates/[slug]          模板详情（ISR）
│       ├── H1: "[Template Name] Roblox GUI Template with [Key Feature]"
│       ├── Gallery: 多图轮播
│       ├── Differentiator: "含真实 Luau 业务逻辑（非纯静态图）" 差异化声明 ★块D新增
│       ├── Description: 功能说明（自动网格布局 / 物品拖拽 / 数据存储接口）
│       ├── Code Preview: 关键脚本预览
│       ├── Reviews: 用户评价
│       ├── Related Templates: 同类推荐
│       └── CTA: "Open in Web Editor" → /editor?template={slug}（★块D 最关键转化按钮）
│             + "Use in Studio"（唤起插件）+ "Purchase"（付费模板）
│
├── 🎯 Use-Cases（应用场景层 — 全部 SSG）★块A新增
│   ├── /use-cases                 场景枢纽页
│   │   ├── H1: "How to Make a GUI for Any Roblox Game"
│   │   ├── Intro: 各游戏类型 UI 需求概述（导航枢纽）
│   │   ├── Game-Type Grid: Simulator / FPS / Roleplay / Tycoon / Obby 卡片
│   │   └── CTA: "Start Designing Free" → /editor
│   │
│   └── /use-cases/[game-type]      场景详情页
│       ├── H1: "Design the Perfect [Game Type] UI for Your Roblox Game"
│       │     · /use-cases/simulator-hud → roblox simulator hud design
│       │     · /use-cases/fps-game-ui   → roblox fps game ui maker
│       │     · /use-cases/roleplay-menu → roblox roleplay menu gui
│       ├── Design Requirements: 该游戏类型 UI 设计要点（紧凑 HUD / 货币展示 / 点击反馈）
│       ├── Step-by-Step Tutorial: 图文教程演示搭建过程
│       ├── Related Templates: 推荐对应模板 → /templates
│       └── CTA: "Build This HUD in Our Editor" → /editor
│
├── 📝 Content（内容集群层）— 全部 SSG
│   ├── /blog                      博客列表
│   │   ├── Category Filters
│   │   ├── Featured Post (Hero)
│   │   └── Post Cards: 标题 + 摘要 + 日期 + 分类标签
│   │
│   ├── /blog/[slug]               博客详情
│   │   ├── Article Content
│   │   ├── Table of Contents (侧栏)
│   │   ├── Author Box
│   │   ├── Related Posts
│   │   ├── CTA Inline: "Try Our GUI Maker" （文中自然插入）
│   │   └── Comments (可选)
│   │
│   ├── /guides                     教程中心枢纽页 ★块B新增
│   │   ├── H1: "Roblox GUI Tutorials & Guides (2026)"
│   │   ├── Intro: 体系化 UI 制作教程中心，建立权威性
│   │   ├── Guide Categories: 基础组件 / 响应式布局 / 交互脚本 / 系统搭建
│   │   └── CTA: "Open the Editor" → /editor
│   │
│   ├── /guides/[slug]              深度教程页（canonical 主体，博客导读指向此处）★块B新增
│   │   ├── H1: "[How to ...] — Complete Roblox Guide"
│   │   │     · /guides/fix-gui-scaling          → how to fix roblox gui scaling
│   │   │     · /guides/uilistlayout-uigridlayout → how to use uilistlayout roblox
│   │   │     · /guides/draggable-gui            → how to make a draggable gui roblox
│   │   ├── Table of Contents: H2 锚点（提升 Sitelinks）
│   │   ├── Step-by-Step: 图文 + Luau 语法高亮代码块 + Studio 截图
│   │   ├── Video Embed: YouTube 教程（VideoObject Schema）
│   │   └── CTA: "Try this in our Editor" → /editor / "Browse Templates" → /templates
│   │
│   ├── /docs                      文档索引
│   │   ├── Quick Start Guide
│   │   ├── Editor Guide
│   │   ├── Plugin Guide
│   │   ├── AI Generation API
│   │   ├── Figma Import Guide
│   │   └── Template Developer Guide
│   │
│   ├── /docs/[slug]               具体文档页
│   │   ├── Sidebar: 文档导航树
│   │   ├── Content: 图文教程
│   │   └── Next/Prev Navigation
│   │
│   └── /faq                       常见问题
│       ├── Accordion: 8-10 个 FAQ 条目
│       ├── Category Grouping: General / Pricing / Technical / Plugin
│       └── CTA: "Still have questions? Contact us"
│
├── 🔌 Integration（插件分发层）
│   └── /plugin                    插件下载/安装指南（SSG）
│       ├── Plugin Features Overview
│       ├── Installation Guide (3 steps)
│       ├── Setup Video
│       ├── Troubleshooting FAQ
│       └── CTA: "Install Plugin" → Roblox Creator Marketplace
│
├── 👤 User（认证与面板层）— 全部 CSR + noindex
│   ├── /auth/login
│   ├── /auth/signup
│   ├── /auth/callback              (API Route)
│   ├── /dashboard                  用户总览
│   ├── /dashboard/projects        项目列表
│   ├── /dashboard/settings        账号设置
│   └── /dashboard/billing         订阅管理
│
└── 🔍 Utility
    └── /search                     站内搜索（CSR, noindex）
```

### 2.2 Roblox Studio 插件端

```
Roblox Studio Plugin (Luau 实现)
│
├── 🏠 Plugin Entry Points
│   ├── Studio Toolbar Button: "Roblox GUI Maker" 图标
│   └── Plugin Menu → "Open Roblox GUI Maker"
│
├── 🔐 Auth Panel（认证面板）
│   ├── OAuth2 Device Flow: 显示一次性验证码
│   ├── Web 端 https://robloxguimaker.com/activate 输入验证码
│   ├── Token Storage: 本地加密存储 refresh token
│   └── Session Status: 显示登录状态 + 用户名
│
├── 📦 Projects Sync Panel（项目同步面板）
│   ├── Project List: 从 Web 端拉取项目列表
│   │   ├── 项目名称 + 缩略图
│   │   ├── 最后修改时间
│   │   └── "Insert into Game" 按钮
│   ├── Pull & Insert:
│   │   ├── HttpService:GetAsync("https://api.robloxguimaker.com/v1/projects/{id}")
│   │   ├── JSON → ScreenGui 转换（递归创建 Instance）
│   │   ├── Asset Upload: 自动上传图片到 Roblox Asset Service
│   │   └── UID Replacement: 替换占位 UID 为真实 Asset ID
│   └── Refresh Button: 手动刷新项目列表
│
├── 🎨 Template Library Panel（模板浏览面板）
│   ├── Template Browser: 分类浏览模板市场
│   ├── Preview: 模板预览图 + 说明
│   ├── Insert Template: 一键插入当前游戏
│   └── Purchase Flow: 付费模板 → Web 端完成支付 → 返回插件刷新
│
├── 🔄 Figma Import Panel（Figma 导入面板）
│   ├── Input: 输入 Web 端生成的导入凭证码
│   ├── Pull & Convert:
│   │   ├── 拉取 Web 端已解析的 Figma→Roblox 映射数据
│   │   ├── 批量上传图片资产
│   │   └── 创建 ScreenGui 层级结构
│   └── Progress Bar: 显示导入进度（图片上传较慢）
│
└── ⚙️ Settings Panel（设置面板）
    ├── Auto-sync: 开启/关闭自动同步
    ├── Asset Upload Quality: 图片上传质量设置
    ├── Scale Mode: Offset / Scale / Automatic
    └── About: 版本号 + 检查更新
```

### 2.3 Web ↔ 插件通信协议

```
┌─────────────────────────┐         ┌──────────────────────────┐
│   Web App (Next.js)     │         │   Roblox Studio Plugin   │
│                         │         │                          │
│  /editor                │  JSON   │  Projects Sync Panel     │
│  User designs GUI ──────┼────────►│  HttpService:GetAsync()  │
│  Saves project          │  API    │  Pull & Insert           │
│                         │         │                          │
│  /api/plugin/sync       │◄────────│  GET /api/plugin/sync    │
│  Returns project JSON   │         │  ?project_id=xxx         │
│                         │         │                          │
│  /api/plugin/assets     │◄────────│  POST /api/plugin/assets │
│  Returns asset URLs     │         │  ?asset_ids=xxx,yyy      │
│                         │         │                          │
│  /activate              │  OAuth  │  Auth Panel              │
│  User enters code ──────┼────────►│  Device Flow             │
│                         │         │                          │
└─────────────────────────┘         └──────────────────────────┘
```

---

## 3. Roblox Studio 插件端架构

### 3.1 插件入口点

插件在 Roblox Studio 中通过以下方式暴露：

1. **工具栏按钮**：在 Studio 顶部工具栏注册 "Roblox GUI Maker" 按钮，点击打开主面板
2. **Plugin 菜单项**：Plugin 菜单 → "Roblox GUI Maker" → 子菜单（Open / Import from Web / Browse Templates / Settings）
3. **URI Scheme 唤起**：Web 端点击 "Export to Studio" 时，通过 `roblox-studio://` URI scheme 唤起 Studio 并触发插件导入流程（如果 Roblox 不支持自定义 URI scheme，则降级为引导用户手动打开插件面板）

### 3.2 导入流程（Web → Studio）

```
Step 1: Web端设计
  User designs GUI in /editor
  → Saves project (auto-save to Supabase)
  → Clicks "Export to Studio"
  → Web shows: "Open Roblox Studio Plugin → Projects → Pull [Project Name]"

Step 2: 插件端拉取
  Plugin opens Projects Sync Panel
  → HttpService:GetAsync("https://api.robloxguimaker.com/v1/projects/{id}?token={jwt}")
  → Receives JSON payload:
    {
      "project": {
        "id": "proj_xxx",
        "name": "My Game HUD",
        "screenGuis": [
          {
            "name": "MainHUD",
            "children": [
              {
                "className": "Frame",
                "name": "HealthBar",
                "properties": {
                  "Size": "UDim2.new(0, 200, 0, 30)",
                  "Position": "UDim2.new(0, 20, 0, 20)",
                  "BackgroundColor3": "Color3.fromRGB(40, 40, 40)"
                },
                "children": [...]
              }
            ]
          }
        ],
        "assets": [
          { "uid": "asset_xxx", "url": "https://cdn.robloxguimaker.com/assets/xxx.png" }
        ]
      }
    }

Step 3: 插件端解析与创建
  → 递归遍历 screenGuis 树
  → Instance.new(className) 创建每个 GUI 对象
  → 设置 Properties
  → 对每个 asset: InsertService:CreateMeshPartAsync() 或手动上传
  → 替换占位 UID 为 Roblox Asset ID
  → 将 ScreenGui 插入 game.Players.LocalPlayer.PlayerGui 或 StarterGui

Step 4: 完成
  → 显示 "Successfully imported [N] GUI elements and [M] assets"
  → 用户在 Studio 视图中看到完整 GUI
```

### 3.3 资产同步机制

```
图片/音频资产处理流程:

Web 端上传 → CDN (cdn.robloxguimaker.com) → 生成唯一 UID
     ↓
插件端导入时:
  1. 识别 JSON 中的 asset UID
  2. 检查本地缓存（是否已上传过此资产到 Roblox）
  3. 若未缓存:
     a. HttpService:GetAsync("https://api.robloxguimaker.com/v1/assets/{uid}") 获取 asset 元数据
     b. 使用 InsertService:CreateMeshPartAsync() 或手动 HttpService + AssetService 上传
     c. 缓存 Asset ID → UID 映射
  4. 替换 UI 组件中的 Image 属性为 Roblox Asset ID (rbxassetid://xxx)
```

### 3.4 Scale/Offset 自动转换

```
Web 端使用绝对像素 (px) 设计 → 插件端自动转换为 Roblox UDim2:

规则 1: 如果 Web 端标记了 "responsive: true"
  → Size: UDim2.new(scaleX, 0, scaleY, 0)
  → Position: UDim2.new(scaleX, 0, scaleY, 0)
  → AnchorPoint: Vector2.new(0.5, 0.5)

规则 2: 如果 Web 端标记了 "responsive: false" (默认)
  → Size: UDim2.new(0, pixelWidth, 0, pixelHeight)
  → Position: UDim2.new(0, pixelX, 0, pixelY)

规则 3: 如果 Web 端使用了 AutomaticSize
  → AutomaticSize: Enum.AutomaticSize.XY
  → Size 设为 UDim2.new(1, 0, 0, 0) 配合 UISizeConstraint
```

---

## 4. 核心转化路径（用户动线）

### 路径 A：搜索引擎 → 首页 → 试用编辑器 → 安装插件（主要转化路径）

```
[Google] "roblox ui maker no coding"
    │
    ▼
[/] Landing Page
    │  Hero: "Build Roblox GUI Without Coding"
    │  Social proof: "Join 18,000+ developers"
    │
    ▼
[/editor?demo=1] Demo Editor (免登录)
    │  体验拖拽组件 + 预览 AI 生成效果
    │  限制: 无法导出/保存
    │
    ▼
[Sign Up / Log In] (modal or /auth/signup)
    │  邮箱注册 或 Google OAuth
    │
    ▼
[/editor] Full Editor
    │  完成设计 → 点击 "Export to Studio"
    │
    ▼
[/plugin] Plugin Installation Guide
    │  引导安装 Roblox Studio 插件
    │
    ▼
[Roblox Studio] Plugin → Pull Project → Insert
    │  ✅ 转化完成
```

### 路径 B：搜索引擎 → 模板详情 → 编辑器 → 插件（资源获客路径）

```
[Google] "roblox gui templates free" 或 "roblox inventory gui template"
    │
    ▼
[/templates/rpg-inventory] Template Detail
    │  查看模板截图、功能说明、代码预览
    │  CTA: "Use in Studio" / "Customize in Editor"
    │
    ▼
├──→ [Roblox Studio Plugin] 直接导入 (已有插件的用户)
│       │  Plugin URI Scheme 唤起
│       │  ✅ 转化完成
│
└──→ [/editor?template=rpg-inventory] (新用户)
        │  在编辑器中打开模板，可自由修改
        │  CTA: "Export to Studio" → 引导安装插件
        │  ✅ 转化完成
```

### 路径 C：搜索引擎 → 博客对比文 → 编辑器 → 注册（内容获客路径）

```
[Google] "roblox studio ui editor alternative" 或 "bloxsmith alternative"
    │
    ▼
[/blog/5-best-roblox-studio-ui-editor-alternatives] Comparison Article
    │  对比 Bloxsmith / NexusRBX / FigBloxUI / Sketch / Roblox GUI Maker
    │  CTA (文中第 3 段后): "Try Our Free Editor"
    │
    ▼
[/editor] Full Editor (或 /editor?demo=1)
    │  体验 → 注册 → 导出
    │  ✅ 转化完成
```

### 路径 D：DevForum / Reddit / YouTube → 首页 → 编辑器（社区获客路径）

```
[DevForum/Reddit/YouTube] 口碑推荐 / 教程视频
    │
    ▼
[/] Landing Page 或直接 [/editor]
    │  社交证明强化信任
    │  CTA: "Start Building Free"
    │
    ▼
[/editor] → Sign Up → Export to Studio
    │  ✅ 转化完成
```

---

## 5. 渲染模式决策说明

依据 p1_handoff.md 中内容集群建议的渲染模式推荐：

| 页面类型 | 渲染模式 | 决策理由 |
|---------|---------|---------|
| 首页 `/` | SSG (Static) | 核心落地页，必须秒开。内容不频繁变更。Lighthouse 满分目标。 |
| `/figma-to-roblox` | SSG (Static) | 功能落地页，内容稳定。与 Bloxsmith 类似架构，SSG 利于 SEO 排名。 |
| `/pricing` | SSG (Static) | 定价信息变更频率低（月度级别），静态生成即可。 |
| `/plugin` | SSG (Static) | 插件安装指南内容稳定。 |
| `/blog` | SSG (Static) | 博客列表页，发布新文章时触发重新构建。 |
| `/blog/[slug]` | SSG (Static) | 博客内容发布后不变更，构建时生成。 |
| `/docs` | SSG (Static) | 文档内容稳定，按需重新构建。 |
| `/docs/[slug]` | SSG (Static) | 同上。 |
| `/faq` | SSG (Static) | FAQ 内容稳定，月度级别更新。 |
| `/use-cases` | SSG (Static) | 场景枢纽页内容稳定，利于场景关键词排名。★块A新增 |
| `/use-cases/[game-type]` | SSG (Static) | 场景详情教程性内容，稳定，构建时生成。★块A新增 |
| `/guides` | SSG (Static) | 教程中心枢纽，建立权威性，内容稳定。★块B新增 |
| `/guides/[slug]` | SSG (Static) | 深度教程 canonical 主体，发布后稳定，构建时生成。★块B新增 |
| `/templates` | ISR (3600s) | 模板列表频繁更新（新模板上线、评分变化），ISR 保证内容新鲜度同时维持静态性能。 |
| `/templates/[slug]` | ISR (3600s) | 模板详情（评分、评价数、价格）可能变化，按需重新验证。 |
| `/editor` | CSR (Client) | 高度交互的富客户端应用。SSR 无意义——画布、属性面板、AI 面板全部依赖浏览器 API。 |
| `/editor/[project_id]` | CSR (Client) | 同上，且需要认证。 |
| `/dashboard/*` | CSR (Client) | 用户专属数据，无 SEO 价值，全部客户端渲染。 |
| `/search` | CSR (Client) | 动态搜索结果。 |

---

## 6. 内部链接结构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                         / (Home)                                    │
│                         priority: 1.0                               │
└──────┬──────────┬──────────┬──────────┬──────────┬─────────────────┘
       │          │          │          │          │
       ▼          ▼          ▼          ▼          ▼
   /editor   /templates  /pricing   /plugin     /blog
   0.9          0.9         0.8        0.8        0.8
       │          │          │          │          │
       │          ▼          │          │          ▼
       │    /templates/      │          │     /blog/[slug]
       │      [slug]         │          │       0.7-0.8
       │       0.6           │          │
       │                     │          │
       ▼                     ▼          ▼
   /figma-to-roblox      /faq       /docs
      0.7                 0.7        0.7
                                    │
                                    ▼
                               /docs/[slug]
                                  0.6

┌─────────────────────────────────────────────────────────────────────┐
│ 内部链接策略（箭头方向 = 链接方向）                                  │
│                                                                     │
│ / ←→ /editor          (双向: CTA + 导航)                            │
│ / ←→ /templates       (双向: Footer + 导航)                         │
│ / → /pricing          (CTA)                                         │
│ / → /plugin           (导航)                                        │
│ / → /blog             (内容分发权重)                                 │
│                                                                     │
│ /editor → /templates  (编辑器内模板按钮)                             │
│ /editor → /plugin     (导出引导)                                    │
│ /editor → /docs       (帮助链接)                                    │
│                                                                     │
│ /templates/[slug] → /editor?template=xxx  (转化链接)                │
│ /templates/[slug] → /templates (面包屑)                             │
│                                                                     │
│ /blog/[slug] → /editor   (CTA 内链，权重传递)                       │
│ /blog/[slug] → /templates (资源推荐)                                │
│ /blog/[slug] → /pricing   (定价相关文章)                             │
│ /blog/[slug] → /blog/[related] (相关文章)                           │
│                                                                     │
│ /pricing → /editor    (CTA)                                         │
│ /pricing → /faq       (定价 FAQ)                                    │
│                                                                     │
│ /faq → /pricing       (定价详情)                                    │
│ /faq → /editor        (试用)                                        │
│ /faq → /plugin        (安装帮助)                                    │
│                                                                     │
│ /plugin → /docs       (文档)                                        │
│ /plugin → /editor     (开始设计)                                    │
└─────────────────────────────────────────────────────────────────────┘
```

### 关键内链锚文本规范

| 源页面 | 锚文本 | 目标 URL |
|-------|--------|---------|
| `/` Hero CTA | "Try Editor Free" | `/editor` |
| `/` Features Section | "Browse GUI Templates" | `/templates` |
| `/` Footer | "Free Roblox GUI Templates" | `/templates` |
| `/` Footer | "Roblox Studio Plugin" | `/plugin` |
| `/editor` Toolbar | "Browse Templates" | `/templates` |
| `/editor` Export Dialog | "Install Studio Plugin" | `/plugin` |
| `/templates/[slug]` CTA | "Open in Web Editor" | `/editor?template={slug}` |
| `/templates/[slug]` CTA | "Use in Studio" | `roblox-studio://` 或 `/plugin` |
| `/` Use-Case Strip | "Find UI for your game type" | `/use-cases` |
| `/use-cases/[game-type]` CTA | "Build This HUD in Our Editor" | `/editor` |
| `/use-cases/[game-type]` Resource | "Browse matching templates" | `/templates` |
| `/blog/[slug]` Inline CTA | "Try our free Roblox GUI Maker" | `/editor` |
| `/blog/[slug]` Guide Link | "Read the full guide" | `/guides/[slug]`（导读→深度版） |
| `/blog/[slug]` Resource Link | "Browse GUI templates" | `/templates` |
| `/blog/[slug]` Comparison Link | "See pricing" | `/pricing` |
| `/guides/[slug]` CTA | "Try this in our Editor" | `/editor` |
| `/pricing` CTA | "Start Free Trial" | `/editor` |
| `/plugin` CTA | "Open Editor" | `/editor` |
| `/docs/[slug]` Sidebar | "API Reference" | `/docs/api` |
| `/faq` Link | "Check our pricing" | `/pricing` |
| `/faq` Link | "Try the editor" | `/editor` |

---

## 附录：与 Gemini 骨架的差异说明

本文件基于 Gemini Round 1 骨架细化，主要扩展点：

1. **路由表**：从 7 个核心路由扩展到 22 个路由（含 `/figma-to-roblox`、`/use-cases` + `/use-cases/[game-type]`、`/guides` + `/guides/[slug]`、`/search`、`/dashboard/*` 子路由、`/docs/[slug]`、`/auth/*`、`/api/*`）
2. **插件端架构**：新增完整的通信协议、导入流程、资产同步机制、Scale/Offset 转换规则
3. **转化路径**：从 2 条扩展到 4 条（增加社区获客路径和资源获客路径）
4. **渲染模式决策**：每类页面附带决策理由
5. **内链结构图**：新增 ASCII 结构图 + 锚文本规范表
6. **路由文件系统映射**：新增 Next.js App Router 目录结构

## 附录 B：基于 Manus 深度检索的重组差异（2026-06-18）

本文件经第二轮重组，吸收 `prompt/dev_pipeline/additional/` 三份 Manus 检索文档的结构性补充：

1. **新增 `/use-cases` 应用场景体系（块 A，P0）**：填补按游戏类型（simulator/fps/roleplay）划分的页面缺口，捕获高转化意图场景长尾词。竞品 robloxguimaker.app 已验证 `/for` 结构有效。
2. **新增 `/guides` 教程中心（块 B，P1）**：教程从博客散落升级为体系化枢纽，博客导读 + guides 深度版（canonical 指向 guides）。
3. **修正关键词自我竞争（块 C，P0）**：首页改主打 `roblox gui maker`，博客 W1 降为长尾变体，落地页/博客/guides 明确按搜索意图分工。
4. **补齐页面区块（块 D，P1）**：首页痛点对比区、模板详情页"Open in Web Editor"按钮、Figma 页 Reddit 痛点引用、全核心页 H1 文案列。
5. **路由表新增 H1 列**：每个 SEO 页面明确 H1 文案。

详见 [REORG_CHANGELOG.md](REORG_CHANGELOG.md)。
