# Phase 2 文档重组变更记录（REORG_CHANGELOG）

> **日期**：2026-06-18
> **触发**：用户从 Manus 深度联网检索得到 3 份补充文档（`prompt/dev_pipeline/additional/`），需评估并整合进已产出的 Phase 2 workspace 文档。
> **方式**：3 个 Explore SubAgent 分别评估 3 份 Manus 文档与现有 workspace 文档的差异 → 综合重组计划 → 用户审批后逐项执行。
> **范围**：仅修改 `workspace/` 的 4 份 .md + 新增本文件。**未改动** `prompt/` 源提示词。

---

## 一、重组依据：3 份 Manus 检索文档

| Manus 文档 | 核心价值 | 对应评估 SubAgent |
|-----------|---------|------------------|
| `additional/blog_content_plan.md` | 基于 Reddit/DevForum 真实痛点的三阶段博客计划（痛点→进阶→对比），9 篇选题 + SEO 内容规范 | SubAgent 1 |
| `additional/keyword_clusters.md` | 模仿竞品 robloxguimaker.app 的 4 关键词集群（`/templates` `/guides` `/for`），含场景型集群 | SubAgent 2 |
| `additional/website_architecture.md` | 竞品页面架构拆解，含 `/use-cases`、`/features` 目录、各页 H1 与内容区块 | SubAgent 3 |

---

## 二、SubAgent 评估的核心共识（重组前的问题诊断）

| 问题 | 严重度 | 来源 |
|------|:---:|------|
| 缺 `/use-cases`（场景）枢纽——丢失 simulator/fps/roleplay 高转化场景词 | 🔴 P0 | SubAgent 2 + 3 |
| 缺 `/guides` 教程中心——教程散落 `/blog/*`，无权威性枢纽 | 🟡 P1 | SubAgent 1 + 2 |
| `roblox ui maker no coding`（1200/mo）首页 vs 博客 W1 抢词（cannibalization） | 🔴 P0 | SubAgent 2 |
| 博客承载过多交易型词，应迁落地页 | 🟡 P1 | SubAgent 2 + 3 |
| 页面区块缺失（首页痛点对比区 / 模板页"在编辑器打开"按钮 / Figma Reddit 痛点 / H1 文案） | 🟡 P1 | SubAgent 1 + 3 |
| 11 个新关键词未纳入 | 🟡 P1 | SubAgent 1 + 2 |

> 共识：Manus 的"三阶段/4-Cluster"与原"3-Cluster"互补而非正交，**通过新增页面类型 + 补子话题 + 关键词分工整合，不推翻原结构**。

---

## 三、用户裁决（2026-06-18）

| 议题 | 裁决 |
|------|------|
| 块 C 关键词消歧 | **首页升主词 + 博客降长尾**：首页主打 `roblox gui maker`，博客 W1 改 `best roblox ui maker no coding 2026` 并回链首页 |
| 块 B `/guides` 关系 | **博客导读 + guides 深度版**：博客保留轻量导读，深度教程放 `/guides/[slug]`，canonical 指向 guides |
| 执行范围 | **只动 workspace 4 文档 + 新增 changelog**，不碰 `prompt/` |
| 新选题排期 | **插队进现有 12 周**（非另开二期），置换低优先级文章 |

---

## 四、逐文件变更明细

### `INFORMATION_ARCHITECTURE.md`
- 路由表新增 **H1 文案列**；新增 `/use-cases`、`/use-cases/[game-type]`、`/guides`、`/guides/[slug]` 4 条路由（路由总数 18 → 22）。
- 首页主词由 `roblox ui maker no coding` 改为 `roblox gui maker`（次词降为描述），新增"关键词分工原则"说明。
- 路由文件系统映射新增 `use-cases/` 与 `guides/` 目录。
- 页面树（2.1）：首页新增痛点对比区 + Use-Case Strip；Figma 页新增 Reddit 痛点引用 + CTA 改指 `/plugin`；模板详情页新增"Open in Web Editor"按钮 + 差异化声明；新增 Use-Cases 层与 Guides 枢纽块；全核心页补 H1。
- 渲染模式决策表新增 4 行（use-cases/guides 均 SSG）。
- 内链锚文本表更新（"Open in Web Editor"、场景页、guides 导读链接）。
- 新增"附录 B：基于 Manus 深度检索的重组差异"。

### `CONTENT_CLUSTER_STRATEGY.md`
- 12 周日历重排：W1 改长尾变体；W3 改信息型导读 CTA 指 `/templates`；W5 改轻量导读（深度版迁 guides）；**W7 置换为 Shop GUI、W9 置换为 AI 失败分析、W10 置换为 Leaderboard**（原 Code Generator/Drag-vs-AI/Free-vs-Paid 降级为按需补充文章）。
- 新增"常驻 `/guides` 教程页"小节（fix-gui-scaling / uilistlayout-uigridlayout / draggable-gui，不占博客周次）。
- Cluster 1 子话题列表更新；Cluster 3 新增 S4 Shop、S5 Leaderboard；**新增 Cluster 4：应用场景（场景型）**；新增"三阶段 × 四 Cluster 映射说明"。
- 流量预期更新（场景词 + guides 词来源）。
- SOP（5.1）新增：目录 TOC、≥3 张截图、Luau 语法高亮强化、canonical 指向 guides、文末双模板 CTA。
- KPI（6.3）关键词清单重排为 P0–P3 + 降级词，新增 14 个场景/教程/进阶系统/竞品拦截词。

### `SEO_TECH_SPEC.md`
- 新增 §1.11 `/use-cases` + `/use-cases/[game-type]` 完整 JSON-LD（CollectionPage / ItemList / HowTo / BreadcrumbList）。
- 新增 §1.12 `/guides` + `/guides/[slug]` 完整 JSON-LD（CollectionPage / HowTo / TechArticle / BreadcrumbList + 可选 VideoObject）。
- §1.1 首页新增关键词消歧说明（块 C）。
- `sitemap.ts` 新增 `/use-cases`、`/guides` 静态条目 + `getUseCaseSitemapEntries()` / `getGuideSitemapEntries()` 动态生成函数。
- `robots.ts` allow 列表新增 use-cases/guides；GPTBot/ClaudeBot/CCBot/Google-Extended 允许抓取 guides/use-cases（喂 LLM 品牌词）。
- 附录 A JSON-LD 验证表新增 4 行（#11–#14）。

### `p2_handoff.md`
- Web 端路由表新增 4 条路由 + 关键词分工原则 + 首页主词修正。
- Schema 覆盖清单 10 → 14 类。
- 12 周发布日历同步重排（标 ★ 新选题）；3 Cluster → 4 Cluster。
- Batch 3c 验收标准新增：首页痛点对比区、Use-Case Strip、模板"Open in Web Editor"、use-cases/guides 页、博客导读回链。
- 内链策略表更新；Phase 3 输入文件清单 + 产出物索引新增本文件与 Manus 检索来源。

### `REORG_CHANGELOG.md`（本文件，新增）

---

## 五、未采纳 / 推迟事项

| 事项 | 决定 | 理由 |
|------|------|------|
| `/figma-to-roblox` 迁 `/features/figma-to-roblox` | **不迁，保留顶层** | 3 SubAgent 一致建议；目标词独立高意图，扁平 URL 权重更集中 |
| 新建 `/features` 聚合页 | **本期不做**，仅文档注明 | 当前顶层路由已覆盖，非紧迫 |
| 降级文章（Code Generator / Drag-vs-AI / Free-vs-Paid） | 降级为按需补充，不占 12 周首发 | 目标词已由 `/editor`/首页/`/pricing` 覆盖 |
| Tycoon/Obby 等更多场景页 | 二期扩展 | 首批先验证 simulator/fps/roleplay 3 个 |

---

## 六、一致性验证结果（执行后）

- ✅ 三文档页面集合吻合：`INFORMATION_ARCHITECTURE.md` 路由表（22 条）↔ `SEO_TECH_SPEC.md` JSON-LD（14 类页面 + dashboard/search 无 Schema）↔ `CONTENT_CLUSTER_STRATEGY.md` 内链目标。
- ✅ 新增 JSON-LD 结构（CollectionPage/ItemList/HowTo/TechArticle/条件 VideoObject 展开）模式已验证可 `JSON.parse()`。
- ✅ 关键词无重复主战场：首页 `roblox gui maker` / 博客 W1 长尾变体 / `/templates` 承接 `roblox gui templates free` / `/use-cases` 承接场景词 / `/guides` 承接 how-to 词。
- ✅ `p2_handoff.md` Batch 3c 验收标准与新增页面对齐，供 Phase 3 编码消费。
