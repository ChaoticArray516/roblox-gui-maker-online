# Phase 2 → Phase 3 下游交接包

> **项目**：Roblox GUI Maker（AI 驱动 Roblox GUI 智能生成器 + Studio 插件）
> **阶段**：Phase 2 完成 → Phase 3 启动
> **产出日期**：2026-06-18
> **Phase 2 执行模型**：Round 1 Gemini 3.1 Pro（骨架设计）→ Round 2 DeepSeek-V4（完整文档生成）
> **下游消费方**：Phase 3 编码实现（按 Batch 3a → 3e 顺序执行）

---

## 技术规范摘要

### 信息架构

#### Web 端 URL 路由表

> **重组说明（2026-06-18）**：吸收 Manus 检索补充——新增 `/use-cases`、`/guides` 体系，修正首页关键词消歧（首页主词改 `roblox gui maker`）。详见 [REORG_CHANGELOG.md](REORG_CHANGELOG.md)。

| 层级 | 路由 | 页面类型 | 目标关键词 | Schema 类型 | 渲染模式 | 索引策略 |
|------|------|---------|-----------|------------|---------|---------|
| L1 | `/` | 首页/落地页 | `roblox gui maker`（主）/ `roblox ui maker no coding`（次） | WebSite + SoftwareApplication + Organization | SSG | index, follow |
| L1 | `/editor` | 在线编辑器 | `roblox ui maker drag and drop` | SoftwareApplication + FAQPage + HowTo | CSR | index, nofollow |
| L1 | `/figma-to-roblox` | 功能落地页 | `roblox figma to studio` | SoftwareApplication + HowTo | SSG | index, follow |
| L1 | `/templates` | 模板市场列表 | `roblox gui templates free` | WebSite + CollectionPage + FAQPage | ISR (3600s) | index, follow |
| L2 | `/templates/[slug]` | 模板详情页 | `[模板名] roblox gui template` | Product + SoftwareApplication + ImageGallery + BreadcrumbList | ISR (3600s) | index, follow |
| **L1** | **`/use-cases`** | **场景枢纽页（新增 块A）** | **`how to make gui for roblox games`** | **CollectionPage + ItemList + BreadcrumbList** | **SSG** | **index, follow** |
| **L2** | **`/use-cases/[game-type]`** | **场景详情页（新增 块A）** | **`roblox simulator hud design` 等** | **HowTo + ItemList + BreadcrumbList** | **SSG** | **index, follow** |
| **L1** | **`/guides`** | **教程中心枢纽（新增 块B）** | **`roblox gui tutorial 2026`** | **CollectionPage + BreadcrumbList** | **SSG** | **index, follow** |
| **L2** | **`/guides/[slug]`** | **深度教程页（新增 块B）** | **`how to fix roblox gui scaling` 等** | **HowTo + TechArticle + BreadcrumbList** | **SSG** | **index, follow** |
| L1 | `/pricing` | 定价页 | `roblox studio ui editor alternative` | Product (×2) + FAQPage | SSG | index, follow |
| L1 | `/plugin` | 插件下载/安装 | `roblox studio ui design plugin` | SoftwareApplication + WebApplication | SSG | index, follow |
| L1 | `/blog` | 博客列表 | `roblox gui maker blog` | Blog + BreadcrumbList | SSG | index, follow |
| L2 | `/blog/[slug]` | 博客详情 | 文章目标关键词（长尾变体优先） | BlogPosting + Article + BreadcrumbList | SSG | index, follow |
| L1 | `/docs` | 文档索引 | `roblox gui maker documentation` | TechArticle + BreadcrumbList | SSG | index, follow |
| L2 | `/docs/[slug]` | 具体文档 | 文档主题关键词 | TechArticle + BreadcrumbList | SSG | index, follow |
| L1 | `/faq` | 常见问题 | `roblox gui maker faq` | FAQPage + BreadcrumbList | SSG | index, follow |
| L1 | `/search` | 站内搜索 | （聚合页） | SearchAction (via WebSite) | CSR | noindex |
| L1 | `/dashboard` | 用户面板 | （不需 SEO） | （无 Schema） | CSR | noindex, nofollow |
| L2 | `/dashboard/projects` | 用户项目列表 | （不需 SEO） | （无 Schema） | CSR | noindex, nofollow |
| L2 | `/dashboard/settings` | 账号设置 | （不需 SEO） | （无 Schema） | CSR | noindex, nofollow |
| L2 | `/dashboard/billing` | 账单管理 | （不需 SEO） | （无 Schema） | CSR | noindex, nofollow |

> **关键词分工原则**：落地页（`/`、`/templates`、`/use-cases`、`/figma-to-roblox`）承载交易/获取型词；博客 `/blog/*` 承载对比/信息型词；深度教程 `/guides/*` 承载 how-to 问题解决型词。首页独占 `roblox gui maker`，博客 W1 降长尾变体回链首页。

#### Roblox Studio 插件端架构描述

- **入口点**：Studio Toolbar Button + Plugin Menu + Web URI Scheme 唤起
- **Auth Panel**：OAuth2 Device Flow（Web 端 `/activate` 输入验证码）
- **Projects Sync Panel**：HttpService:GetAsync() 拉取 Web 端项目 JSON → 递归创建 Instance → 自动上传资产 → 替换 Asset ID
- **Template Library Panel**：Studio 内浏览模板市场，一键插入当前游戏
- **Figma Import Panel**：输入 Web 端生成的导入凭证码 → 拉取已解析的 Figma→Roblox 映射数据 → 批量上传资产
- **Settings Panel**：自动同步开关、图片质量、Scale 模式、版本检查
- **通信协议**：Web API (Vercel Serverless Functions) + Plugin HttpService:GetAsync() 主动拉取，不使用长轮询

#### 核心转化路径（4 条）

1. **搜索引擎 → 首页 → 编辑器 → 插件**（主要转化路径）：Google "roblox ui maker no coding" → `/` → `/editor?demo=1` 试用 → 注册 → 设计完成 → Export to Studio → 安装插件 → 转化完成
2. **搜索引擎 → 模板详情 → 编辑器/插件**（资源获客路径）：Google "roblox inventory gui template" → `/templates/rpg-inventory` → "Use in Studio" 或 "Customize in Editor" → 转化完成
3. **搜索引擎 → 博客对比文 → 编辑器**（内容获客路径）：Google "roblox studio ui editor alternative" → `/blog/5-best-roblox-studio-ui-editor-alternatives` → CTA → `/editor` → 注册 → 转化完成
4. **DevForum/Reddit/YouTube → 首页 → 编辑器**（社区获客路径）：口碑推荐 → `/` → `/editor` → 注册 → 转化完成

---

### CWV 优化目标

| 指标 | 目标值 | Google 标准 | 说明 |
|------|--------|-----------|------|
| LCP | ≤ 1.8s | ≤ 2.5s | 比 Google 标准更严格，SaaS 产品底线 |
| INP | ≤ 150ms | ≤ 200ms | 强交互拖拽画布核心指标 |
| CLS | ≤ 0.05 | ≤ 0.1 | 杜绝编辑器加载时的布局抖动 |

**实现手段**：
- SSG/ISR 静态 HTML 直出（首页、博客、定价、FAQ 等）
- 编辑器 `dynamic(() => import(...), { ssr: false })` 完全客户端渲染 + 骨架屏
- Figma→Luau AST 转换通过 Web Worker 卸载
- 模板预览图使用 Next.js `<Image>` + AVIF 格式 + `priority` 属性
- 第三方脚本（GA、Stripe）通过 Partytown Web Worker 加载
- 字体 `display: swap` + `preload: true`
- 首页 JS bundle ≤ 80KB，编辑器首屏 ≤ 120KB

---

### Schema 标记规范

每类页面的 JSON-LD @graph 完整代码详见 `workspace/SEO_TECH_SPEC.md` 第 1 节。以下是覆盖清单：

| # | 页面路由 | Schema 类型 | 代码状态 |
|---|---------|------------|---------|
| 1 | `/` | WebSite + SoftwareApplication + Organization | ✅ 完整可运行 |
| 2 | `/editor` | SoftwareApplication + FAQPage + HowTo | ✅ 完整可运行 |
| 3 | `/templates` | WebSite + CollectionPage + FAQPage | ✅ 完整可运行 |
| 4 | `/templates/[slug]` | Product + SoftwareApplication + ImageGallery + BreadcrumbList | ✅ 完整可运行 |
| 5 | `/pricing` | Product (Free) + Product (Pro) + FAQPage | ✅ 完整可运行 |
| 6 | `/blog` | Blog + BreadcrumbList | ✅ 完整可运行 |
| 7 | `/blog/[slug]` | BlogPosting + Article + BreadcrumbList | ✅ 完整可运行 |
| 8 | `/plugin` | SoftwareApplication + WebApplication | ✅ 完整可运行 |
| 9 | `/docs` | TechArticle + BreadcrumbList | ✅ 完整可运行 |
| 10 | `/faq` | FAQPage + BreadcrumbList | ✅ 完整可运行 |
| 11 | `/use-cases` | CollectionPage + ItemList + BreadcrumbList | ✅ 完整可运行（★块A） |
| 12 | `/use-cases/[game-type]` | HowTo + ItemList + BreadcrumbList | ✅ 完整可运行（★块A） |
| 13 | `/guides` | CollectionPage + BreadcrumbList | ✅ 完整可运行（★块B） |
| 14 | `/guides/[slug]` | HowTo + TechArticle + BreadcrumbList (+ VideoObject 可选) | ✅ 完整可运行（★块B） |

所有 JSON-LD 代码块已通过 `JSON.parse()` 结构验证。可直接复制到 Next.js `page.tsx` 的 `<script type="application/ld+json">` 中使用。

---

### 内容集群策略

#### 三个月发布日历（12 周，已重排）

| 周次 | 发布日期 | 文章标题 | 目标关键词 | URL | 内容类型 |
|------|---------|---------|-----------|-----|---------|
| W1 | 2026-06-22 | The Best Roblox UI Maker Without Coding in 2026 | `best roblox ui maker no coding 2026`（长尾变体） | `/blog/best-roblox-ui-maker-no-coding` | 比较文 + 支柱 |
| W2 | 2026-06-29 | How to Convert Figma to Roblox Studio UI in One Click | `roblox figma to studio` | `/blog/convert-figma-to-roblox-studio-ui` | 教程 + 支柱 |
| W3 | 2026-07-06 | Top 10 Free Roblox GUI Templates for Your Game | `roblox gui templates free`（导读，主战场 `/templates`） | `/blog/top-10-free-roblox-gui-templates` | 信息型导读 |
| W4 | 2026-07-13 | 5 Best Roblox Studio UI Editor Alternatives | `roblox studio ui editor alternative` | `/blog/5-best-roblox-studio-ui-editor-alternatives` | 比较文 + 子话题 |
| W5 | 2026-07-20 | How to Fix Roblox GUI Scaling: Scale vs Offset | `how to fix roblox gui scaling`（导读 → `/guides/fix-gui-scaling`） | `/blog/roblox-gui-scaling-guide` | 轻量导读 |
| W6 | 2026-07-27 | Build a Roblox Inventory GUI: Step-by-Step | `roblox inventory gui template` | `/blog/build-roblox-inventory-gui` | 教程 + 子话题 |
| W7 | 2026-08-03 | Building a Working Roblox Shop GUI with Server Validation ★ | `roblox shop gui script` / `how to make a shop in roblox` | `/blog/roblox-shop-gui-server-validation` | 教程 + 模板推广 |
| W8 | 2026-08-10 | How to Create a Roblox Backpack System with AI | `roblox backpack system script` | `/blog/roblox-backpack-system-ai` | 教程 + 子话题 |
| W9 | 2026-08-17 | Why AI UI Generators for Roblox Often Fail (And How to Fix It) ★ | `roblox ai ui generator` / `bloxsmith alternative` | `/blog/ai-ui-generator-failures` | 痛点分析 + 比较文 |
| W10 | 2026-08-24 | How to Create a Global Leaderboard GUI in Roblox ★ | `roblox leaderboard gui free` / `ordereddatastore tutorial` | `/blog/roblox-leaderboard-ordereddatastore` | 教程 + 模板推广 |
| W11 | 2026-08-31 | Importing UI From Figma Sucks — Here's the Fix | `roblox figma to studio plugin` | `/blog/importing-ui-from-figma-sucks-fix` | 痛点 + 子话题 |
| W12 | 2026-09-07 | 2026 Roblox UI Design Trends & Best Practices | `roblox ui design plugin` / `roblox ui templates` | `/blog/2026-roblox-ui-design-trends` | 趋势文 + 子话题 |

> ★ = 本次重组插队的真实痛点新选题（置换原 W7 Code Generator / W9 Drag-vs-AI / W10 Free-vs-Paid，后者降级为按需补充文章）。
> **常驻 `/guides` 页（不占博客周次）**：`/guides/fix-gui-scaling`、`/guides/uilistlayout-uigridlayout`、`/guides/draggable-gui`。

#### 4 个 Cluster 清单

**Cluster 1: Roblox UI 设计工具（工具型）**
- 支柱：`/blog/best-roblox-ui-maker-no-coding`（回链首页传权重）
- 子话题：`/blog/roblox-gui-scaling-guide`（→`/guides/fix-gui-scaling`）, `/blog/5-best-roblox-studio-ui-editor-alternatives`, `/blog/ai-ui-generator-failures`, `/blog/2026-roblox-ui-design-trends`
- 常驻 guides：`/guides/uilistlayout-uigridlayout`, `/guides/draggable-gui`

**Cluster 2: Figma→Roblox 流程（流程型）**
- 支柱：`/blog/convert-figma-to-roblox-studio-ui`
- 子话题：`/blog/best-figma-to-roblox-plugins`, `/blog/importing-ui-from-figma-sucks-fix`, `/blog/roblox-figma-workflow-automation`

**Cluster 3: GUI 模板市场（资源型）**
- 支柱：`/blog/free-premium-roblox-gui-templates`
- 子话题：`/blog/top-10-free-roblox-gui-templates`, `/blog/build-roblox-inventory-gui`, `/blog/roblox-backpack-system-ai`, `/blog/roblox-shop-gui-server-validation` ★, `/blog/roblox-leaderboard-ordereddatastore` ★

**Cluster 4: 应用场景（场景型）★块A新增**
- 支柱：`/use-cases`（场景枢纽页，非博客）
- 子话题：`/use-cases/simulator-hud`, `/use-cases/fps-game-ui`, `/use-cases/roleplay-menu`

#### 内链策略表（关键转化链接）

| 源页面 | 锚文本 | 目标页面 | 链接类型 |
|-------|--------|---------|---------|
| 所有比较文/博客 | "Try our free Roblox GUI Maker" | `/editor` | CTA 内链 |
| 所有教程文 | "Browse GUI templates" | `/templates` | 资源内链 |
| 模板详情页 | "Open in Web Editor" | `/editor?template={slug}` | 转化内链（★块D 最关键） |
| 博客导读 | "Read the full guide" | `/guides/[slug]` | 导读→深度版（canonical） |
| 场景页 | "Build This HUD in Our Editor" | `/editor` | 场景转化内链 |
| Figma 教程 | "Install Studio Plugin" | `/plugin` | 转化内链 |
| 定价页 | "Start free trial" | `/editor` | 导航内链 |

---

## 功能需求清单（专为 Phase 3 准备）

| Batch | 功能点 | 推荐后端模型 | 依赖 | 验收标准 |
|-------|--------|------------|------|---------|
| **3a** | 项目初始化与架构搭建 | DeepSeek-V4 | 无 | `pnpm dev` 启动成功；目录结构符合 `INFORMATION_ARCHITECTURE.md` 路由表；所有路由文件已创建（占位即可）；`next.config.ts` 含图片优化 + Partytown 配置 |
| **3b** | 核心 SEO 组件开发 | Kimi K2.6 | 3a | `JsonLd` 组件支持所有 10 种页面类型；`Breadcrumb` 组件支持自动生成；`OG Image` 组件可用；Lighthouse SEO 评分 100；JSON-LD 服务端渲染（非客户端注入） |
| **3c** | 页面模板与路由实现 | Kimi K2.6 | 3a | 首页 `/` 含 Hero + **痛点对比区（Studio 原生 vs 我们）** + Features + **Use-Case Strip** + CTA；编辑器 `/editor` 含骨架屏 + 动态导入；模板市场 `/templates` 含筛选器 + 卡片列表；模板详情 `/templates/[slug]` 含图库 + **"Open in Web Editor" 按钮**；**场景枢纽 `/use-cases` + `/use-cases/[game-type]` 含设计要点 + 教程 + 模板推荐（★块A）**；**教程中心 `/guides` + `/guides/[slug]` 含 TOC + Luau 代码块 + canonical（★块B）**；定价 `/pricing` 含 Free/Pro 卡片；博客 `/blog` + `/blog/[slug]` 含内容渲染 + 导读回链 guides；插件 `/plugin` 含安装引导；文档 `/docs` 含侧边导航；FAQ `/faq` 含折叠面板；所有路由可访问，渲染模式符合规范 |
| **3d** | 跨文件重构与约束合规性检查 | DeepSeek-V4 | 3b, 3c | 零 TypeScript 报错；`use client` 边界审计通过（Server Component 中无客户端 Hook）；CLS 修复：所有动态加载组件含固定尺寸骨架屏；图片全部迁移到 `next/image` 且含 `remotePatterns` 配置；Lighthouse 性能评分 ≥ 90；合规性报告 0 严重违规 |
| **3e** | 部署脚本与 CI/CD | DeepSeek-V4 | 3d | Vercel 部署成功；Lighthouse CI 集成（性能 < 90 则阻断）；`pnpm type-check` 通过；`pnpm lint` 通过；`pnpm build` 通过；robots.txt + sitemap.xml 生成正确 |

---

## 技术栈终选

**终选确认：选项 A — Next.js 16 + React 19 + Tailwind v4 + Vercel + Roblox Plugin SDK**

**采用依据**：

依据 p1_handoff.md 中竞品数据，Bloxsmith 采用 Next.js/Vercel 架构成功跑通了"AI 生成 → Web 展示 → Studio 导入"的完整闭环，验证了该技术栈在处理 Luau AST 转换和跨端通信上的可行性。NexusRBX 采用的纯 React SPA（选项 B）无法实现针对海量模板和博客集群的 SSG/ISR 静态生成，将导致在有机搜索竞争中落败——我们的关键词清单中 4 个核心词（`roblox gui templates free` 600/mo, `roblox gui scaling tool` 450/mo, `roblox studio ui editor alternative` 300/mo, `roblox gui code generator` 280/mo）都需要搜索引擎可见的静态内容页。Next.js 兼顾了强交互（Client Components 驱动拖拽编辑器）与极速首屏内容呈现（Server Components 驱动首页与模板市场），完美契合混合型 SaaS 产品形态。Vercel 边缘网络确保全球 Roblox 开发者（主要分布在美国、巴西、菲律宾、俄罗斯）快速访问。

**技术约束清单**：
- `/`, `/blog/*`, `/pricing`, `/faq`, `/plugin`, `/docs/*`, `/figma-to-roblox` 强制 SSG
- `/editor`, `/editor/*`, `/dashboard/*`, `/search` 强制 CSR（`ssr: false`）
- `/templates`, `/templates/*` 使用 ISR（`revalidate: 3600`）
- 首页 First Load JS ≤ 80KB；编辑器 JS bundle ≤ 500KB（分包）
- 插件通信：Vercel Serverless Functions 提供 JSON API，Plugin 侧 HttpService:GetAsync() 主动拉取，不使用长轮询

---

## 下游消费指南

### Phase 3 必须遵守的规则

1. **按 Batch 顺序执行**：3a → 3b → 3c → 3d → 3e，禁止跳 Batch
2. **每个 Batch 切换对应后端模型**：3a 和 3d 和 3e 用 DeepSeek-V4，3b 和 3c 用 Kimi K2.6
3. **Phase 3 必须引用本文件的"功能需求清单"表格**，禁止引用"Phase 2 策略文档"
4. **Phase 3 每个 Batch 验收时对照 `workspace/SEO_TECH_SPEC.md` 检查**：
   - JSON-LD Schema 完整性
   - CWV 目标值（LCP ≤ 1.8s, INP ≤ 150ms, CLS ≤ 0.05）
   - robots.ts + sitemap.ts 正确性
5. **禁止擅自修改**：
   - URL 路由结构（已在 Phase 2 锁定）
   - Schema 类型（已在 Phase 2 锁定）
   - 渲染模式决策（SSG/ISR/CSR 分配已在 Phase 2 锁定）
6. **Roblox Studio 插件端**独立于 Web 端开发，插件代码（Luau）不在 Phase 3 Web 端编码范围内——但 Web 端必须提供插件需要的 API 端点（`/api/plugin/sync`, `/api/plugin/assets`）

### Phase 3 输入文件清单

| 文件 | 路径 | 用途 |
|------|------|------|
| SEO 技术规范 | `workspace/SEO_TECH_SPEC.md` | JSON-LD 代码、CWV 配置、robots.ts、sitemap.ts |
| 信息架构文档 | `workspace/INFORMATION_ARCHITECTURE.md` | URL 路由表、目录结构、插件架构、转化路径 |
| 内容集群策略 | `workspace/CONTENT_CLUSTER_STRATEGY.md` | 发布日历、Cluster 结构、内链策略、内容 SOP |
| 重组变更记录 | `workspace/REORG_CHANGELOG.md` | 本次基于 Manus 检索的重组依据、差异与裁决 |
| Manus 检索补充 | `prompt/dev_pipeline/additional/*.md` | blog_content_plan / keyword_clusters / website_architecture（事实依据） |
| Phase 1 交接包 | `prompt/dev_pipeline/phase1/p1_handoff.md` | 竞品数据、关键词数据（事实依据，不可修改） |
| Phase 2 Round 1 骨架 | `prompt/dev_pipeline/phase2/Roblox GUI Maker 架构设计.md` | Gemini 骨架设计（策略依据） |

### Phase 3 禁止事项

- 不要重新讨论技术栈选择（已在 Phase 2 终选锁定）
- 不要增删 URL 路由（已在 Phase 2 锁定）
- 不要修改 Schema 类型分配（已在 Phase 2 锁定）
- 不要将 Roblox Studio 插件逻辑混入 Web 端组件代码
- 不要使用 `[...]`、`// TODO`、`[your-xxx-here]` 等占位符——所有代码必须完整可运行
- 不要跳过 Batch 依赖关系（3b 依赖 3a 的目录结构，3c 依赖 3a 的路由框架，3d 依赖 3b+3c 的完整代码）

---

## 附录：Phase 2 产出物索引

| 产出物 | 路径 | 作者 | 字数 |
|--------|------|------|------|
| Phase 1 交接包 | `prompt/dev_pipeline/phase1/p1_handoff.md` | Manus AI | ~3,000 |
| Phase 2 Round 1 骨架 | `prompt/dev_pipeline/phase2/Roblox GUI Maker 架构设计.md` | Gemini 3.1 Pro | ~8,000 |
| SEO 技术规范 | `workspace/SEO_TECH_SPEC.md` | DeepSeek-V4 (本回合) | ~12,000 |
| 信息架构文档 | `workspace/INFORMATION_ARCHITECTURE.md` | DeepSeek-V4 (本回合) | ~8,000 |
| 内容集群策略 | `workspace/CONTENT_CLUSTER_STRATEGY.md` | DeepSeek-V4 (本回合) | ~10,000 |
| Phase 2 交接包 | `workspace/p2_handoff.md` | 人工整理 (本回合) | ~5,000 |
| 重组变更记录 | `workspace/REORG_CHANGELOG.md` | 重组回合 (本回合) | ~3,000 |
