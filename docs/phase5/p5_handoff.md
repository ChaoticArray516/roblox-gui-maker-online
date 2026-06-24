# Phase 5 → Phase 6 下游交接包 (p5_handoff)

> 生成日期: 2026-06-20

## 1. 部署状态

| 项目 | 状态 |
|------|------|
| 生产 URL | `https://roblox-gui-maker.online` |
| 部署方式 | Vercel CLI 云端构建 (`vercel deploy --prod`) |
| Project ID | `prj_CfCI1xgXNeegUkybR9EdUbdeOGXH` |
| 构建产物 | 42 个静态页面，42 条路由，含 12 个 ISR 模板 |
| 域名绑定 | `roblox-gui-maker.online`（已别名生效） |

## 2. Lighthouse 审计结果

### 首页 `/`

| 指标 | 得分 |
|------|------|
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| Agentic Browsing | 100 |
| 审计数 | 52 pass / 0 fail |

### Templates `/templates`

| 指标 | 得分 |
|------|------|
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| Agentic Browsing | 100 |
| 审计数 | 51 pass / 0 fail |

## 3. 约束合规性验证

```
rendering-audit — 目标 https://roblox-gui-maker.online

检查结果:
  ✅ 3. SSG/ISR 页面无 "use client"
     15 个 SSG/ISR 页面源码均无 'use client'
  ✅ 4. 动态路由有 generateStaticParams
     5 个动态路由均含 generateStaticParams
  ✅ 6. 站内导航用 <Link>（<a href> 仅限 noscript）
     无站内 <a href> 泄漏（noscript 内除外）
  ✅ 7. 广告容器固定尺寸
     本期无广告容器，N/A 跳过
```

## 4. 生产环境 curl 抽查

| 页面 | H1 | Title | JSON-LD |
|------|:--:|:-----:|:-------:|
| `/` | ✅ | ✅ | ✅ |
| `/templates` | ✅ | ✅ | ✅ |
| `/templates/rpg-inventory` | ✅ | ✅ | ✅ |
| `/pricing` | ✅ | ✅ | ✅ |
| `/faq` | ✅ | ✅ | ✅ |
| `/editor` | ✅ | ✅ | ✅ |
| `/plugin` | ✅ | ✅ | ✅ |
| `/figma-to-roblox` | ✅ | ✅ | ✅ |
| `/guides` | ✅ | ✅ | ✅ |
| `/guides/fix-gui-scaling` | ✅ | ✅ | ✅ |
| `/use-cases` | ✅ | ✅ | ✅ |
| `/use-cases/simulator-hud` | ✅ | ✅ | ✅ |
| `/blog` | ✅ | ✅ | ✅ |
| `/blog/best-roblox-ui-maker-no-coding` | ✅ | ✅ | ✅ |
| `/docs` | ✅ | ✅ | ✅ |
| `/docs/quick-start` | ✅ | ✅ | ✅ |

**sitemap.xml**：18 条 `<loc>`，完整覆盖。

## 5. Search Console 状态

- [ ] GSC 所有权验证（需用户操作域名 DNS TXT 记录）
- [ ] sitemap.xml 已部署在 `https://roblox-gui-maker.online/sitemap.xml`
- [ ] 待提交：GSC → Sitemaps → `https://roblox-gui-maker.online/sitemap.xml`
- [ ] Rich Results Test ：`/pricing`（Product+FAQ）、`/faq`（FAQPage）

## 6. 待后续完成的 Lighthouse CI 全量

本次仅在桌面端对 `/` 和 `/templates` 进行了 Lighthouse 导航审计。全站 Lighthouse CI（移动端 + 桌面端，所有 A 级页面）延后至本地 CI 环境完整就绪后执行。

## 7. 已知事项

| 事项 | 状态 |
|------|------|
| 预构建模式（`--prebuilt`）与 ISR 不兼容 | 改用云端构建（`vercel deploy --prod`），功能等价 |
| `OPENROUTER_API_KEY` 区域限制 | 生产环境需配置可用区域 key 或替换默认 fallback 模型 |
| 虚假社会评价 | 已从 UI 和数据源中全部删除（rating/reviewCount/下载量/评分统计） |
| GA4 占位 ID | `NEXT_PUBLIC_GA_ID` 未设置时不会渲染 `<GoogleAnalytics>`，待用户提供真实 ID |
| env vars | `NEXT_PUBLIC_SITE_URL` 等尚未写入 Vercel env（待 5E 填充） |
