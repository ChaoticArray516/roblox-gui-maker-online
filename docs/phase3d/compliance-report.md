# Phase 3d 约束合规性报告

> **项目**: Roblox GUI Maker
> **生成日期**: 2026-06-20
> **审计范围**: 7 个 MVP 路由（`/` `/templates` `/templates/rpg-inventory` `/pricing` `/faq` `/editor` `/plugin`）+ 全局 layout
> **依据**: `workspace/_refs/SEO_TECH_SPEC.md`、`workspace/_refs/INFORMATION_ARCHITECTURE.md`、`pipeline_with_ssg_constraints.md` Phase 5
> **审计人**: Codex CLI (Claude backend)

---

## 总览

| 检查项 | SOP 编号 | 结果 | 详情 |
|---|---|---|---|
| `<img>` → `<Image>` 迁移 | SOP-3D-01 | ✅ 通过 | 全站 0 个原生 `<img>` |
| `use client` 边界 | SOP-3D-02 | ✅ 通过 | 仅 `EditorShell.tsx` + `EditorShellLazy.tsx`（editor 边界内） |
| `<Link>` vs `<a>` | SOP-3D-04 | ✅ 通过 | 站内导航全 `<Link>`；外链全 `<a rel="noopener noreferrer">`；2 处 `<noscript>` 内 `<a>` 属合理例外 |
| `generateMetadata` / `generateStaticParams` | SOP-3D-05 | ✅ 通过 | 7 页全有 metadata；`/templates/[slug]` 有 generateStaticParams + revalidate=3600 |
| JSON-LD 服务端渲染 | SOP-3D-06 | ✅ 通过 | 7 页 curl 均检出 `application/ld+json`，SSR 直出 |
| 编辑器 dynamic + 骨架屏 | SOP-3F-02 前置 | ✅ 已修复 | `/editor` 用 `dynamic(ssr:false)` + `EditorSkeleton`，SSR 含 H1/noscript/ld+json/骨架屏，EditorShell 不在 SSR HTML |
| CLS 修复 | SOP-3D-03 | ✅ 通过 | 编辑器骨架屏固定尺寸；模板图库 `aspect-video` 占位 |

**严重违规数: 0**

---

## 1. SOP-3D-01 `<img>` → `<Image>` 迁移

**方法**: `grep -rn '<img\s' src/`
**结果**: 0 匹配。

全站无原生 `<img>` 标签。当前模板预览/图库均为占位 `<div class="aspect-video">` + `<figure>`，无图片资源。后续接入真实图片时（SOP-3G-02/03），需用 `next/image` + width/height/alt，`next.config.ts` remotePatterns 已覆盖 `roblox-gui-maker.online` / `cdn.roblox-gui-maker.online` / `tr.rbxcdn.com` / `i.ytimg.com`。

**状态**: ✅ 通过

---

## 2. SOP-3D-02 `use client` 边界审计

**方法**: `grep -rn '"use client"' src/`
**结果**: 2 处实际指令（均在 `/editor` CSR 边界内）：

| 文件 | 说明 |
|---|---|
| `src/components/editor/EditorShell.tsx` | 编辑器主组件，依赖浏览器 API（DnD/Pointer/useState）——合规 |
| `src/components/editor/EditorShellLazy.tsx` | dynamic(ssr:false) wrapper——合规（Next 16 要求 ssr:false 在 Client Component 内） |

其余文件（Header/Footer/EditorSkeleton/Breadcrumb/JsonLd/7 个 page.tsx）均为 Server Component。Header 注释中提到的 `"use client"` 字样是说明文字，非实际指令。

**对照 `_refs` IA §5 渲染模式决策表**:
- SSG 页（`/` `/pricing` `/faq` `/plugin`）: 零 `"use client"` ✅
- ISR 页（`/templates` `/templates/[slug]`）: 零 `"use client"` ✅
- CSR 页（`/editor`）: `"use client"` 仅在 EditorShell + EditorShellLazy ✅

**状态**: ✅ 通过

---

## 3. SOP-3D-04 `<Link>` vs `<a>` 审计

**方法**: `grep -rn '<a\s\+href' src/`
**结果**: 2 处 `<a href>`，均在 `src/app/editor/page.tsx` 的 `<noscript>` 块内：

```tsx
<noscript>
  <p>...our <a href="/templates">template library</a> or read the <a href="/faq">FAQ</a>.</p>
</noscript>
```

**判定**: 合理例外。`<noscript>` 在 JS 禁用时生效，此时 `<Link>`（依赖客户端路由 JS）无法工作，用原生 `<a>` 是正确的降级方案。且这两条是站内导航，但属 noscript fallback 场景，不违反"站内导航用 `<Link>`"的本意（该规则针对 JS 启用时的主导航）。

**外链审计**（通过数据数组渲染）:
- `src/components/layout/Footer.tsx`: 3 条社媒外链（Twitter/YouTube/Discord），`<a rel="noopener noreferrer" target="_blank">` ✅
- `src/app/plugin/page.tsx`: 1 条插件市场外链（`create.roblox.com`），`<a rel="noopener noreferrer" target="_blank">` ✅

**站内导航**: Header/Footer/页内 CTA 全用 `<Link>` ✅

**状态**: ✅ 通过（2 处 noscript `<a>` 为合理例外）

---

## 4. SOP-3D-05 `generateMetadata` / `generateStaticParams` 审计

**方法**: `grep -rn 'export const metadata\|generateMetadata\|generateStaticParams\|export const revalidate' src/app/`

| 路由 | metadata | generateStaticParams | revalidate |
|---|---|---|---|
| `/` | ✅ `export const metadata` | — | — |
| `/templates` | ✅ `export const metadata` | — | ✅ 3600 |
| `/templates/[slug]` | ✅ `generateMetadata` | ✅ | ✅ 3600 |
| `/pricing` | ✅ `export const metadata` | — | — |
| `/faq` | ✅ `export const metadata` | — | — |
| `/editor` | ✅ `export const metadata` | — | — |
| `/plugin` | ✅ `export const metadata` | — | — |
| `layout.tsx` | ✅ 全局 metadata | — | — |

**状态**: ✅ 通过

---

## 5. SOP-3D-06 JSON-LD 服务端渲染审计

**方法**: `pnpm start` → `curl -s localhost:$PORT/$p | grep -c "application/ld+json"`

| 路由 | ld+json 计数 | 判定 |
|---|---|---|
| `/` | 1 | ✅ |
| `/templates` | 1 | ✅ |
| `/templates/rpg-inventory` | 2 | ✅（TemplateDetailJsonLd + Breadcrumb） |
| `/pricing` | 1 | ✅ |
| `/faq` | 1 | ✅ |
| `/editor` | 1 | ✅ |
| `/plugin` | 1 | ✅ |

所有 SEO 页面 JSON-LD 均在 SSR HTML 中（`<script type="application/ld+json">` 服务端直出，非客户端注入）。

**状态**: ✅ 通过

---

## 6. SOP-3F-02 前置修复：编辑器 dynamic + 骨架屏

**修复前（MVP 既有偏离）**: `src/app/editor/page.tsx` 直接 `import { EditorShell } from "@/components/editor/EditorShell"` 并渲染，未用 `dynamic(ssr:false)` + `EditorSkeleton`，违反 `_refs` SEO_TECH_SPEC.md §2.4。

**修复后**:
- 新建 `src/components/editor/EditorSkeleton.tsx`（Server Component，固定尺寸三栏骨架屏 + 底部代码面板，`role="progressbar"`）
- 新建 `src/components/editor/EditorShellLazy.tsx`（薄 `"use client"` wrapper，内部 `dynamic(ssr:false)` 懒加载 EditorShell）——Next 16 要求 `ssr:false` 必须在 Client Component 内调用
- 改 `src/app/editor/page.tsx`: 保持 Server Component，渲染 `<EditorShellLazy />`，静态 H1/intro/`<noscript>`/`<EditorJsonLd />` 留在 SSR 层

**验证（`curl /editor` SSR HTML）**:
- `<h1>`: 1 ✅
- `<noscript>`: 1 ✅
- `application/ld+json`: 1 ✅
- `Loading editor`（骨架屏）: 1 ✅
- `editor-canvas`（EditorShell 客户端标记）: 0 ✅（ssr:false 生效，EditorShell 不在 SSR HTML）

**状态**: ✅ 已修复

---

## 7. SOP-3D-03 CLS 修复

- 编辑器画布骨架屏固定 `height: 360` + `maxWidth: 640` ✅
- 模板图库占位 `aspect-video` ✅
- 模板详情图库 `<figure class="aspect-video">` ✅
- 字体 `display: swap` + `preload: true`（layout.tsx）✅

**状态**: ✅ 通过

---

## 待办（非本阶段违规，记录后续）

| 项 | 说明 | 对应 SOP |
|---|---|---|
| 模板评分可见文案 | 已清理（`★ 4.8` 移除） | Schema 合规已完成 |
| aggregateRating 虚构 | 已清理（TemplateDetailJsonLd） | Schema 合规已完成 |
| PluginJsonLd installUrl 死链 | 已清理 | Schema 合规已完成 |
| 真实图片接入 | 当前全占位，接入时用 `next/image` | SOP-3G-02/03 |
| `/noscript` 内 `<a>` | 合理例外，保持现状 | — |

---

## 结论

MVP 7 页 + 全局 layout **0 严重违规**，Phase 3d 合规审计通过。编辑器 dynamic + 骨架屏前置修复已完成，满足 `_refs` 渲染规范。可进入 Phase 3e CI/CD 基建。
