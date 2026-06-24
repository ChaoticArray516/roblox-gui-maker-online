/**
 * EditorSkeleton — 编辑器加载骨架屏（防 CLS）
 *
 * `_refs` SEO_TECH_SPEC.md §2.3/§2.4 要求 /editor 用 `dynamic(..., { ssr: false })`
 * 懒加载 EditorShell，加载期间显示本骨架屏，避免布局抖动。
 *
 * 纯 Server Component（无 "use client"）——骨架屏是静态 HTML，不需客户端逻辑。
 * 三栏布局与 EditorShell 对齐：左组件库 / 中画布（640×360 固定）/ 右属性面板 + 底部代码面板。
 * 颜色用项目 token（bg-surface / bg-surface-raised / border-glass-border），pulse 动画由 tw-animate-css 提供。
 */

export function EditorSkeleton() {
  return (
    <section
      aria-label="Loading editor"
      aria-valuemax={100}
      aria-valuemin={0}
      role="progressbar"
      className="mx-auto mt-10 flex w-full max-w-6xl flex-col gap-4 px-6"
    >
      <div className="grid gap-4 lg:grid-cols-[200px_1fr_240px]">
        {/* 左：组件库骨架 */}
        <div className="flex flex-col gap-2 rounded-2xl border border-glass-border bg-surface p-4">
          <div className="h-3 w-20 animate-pulse rounded bg-surface-raised" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-full animate-pulse rounded-lg bg-surface-raised"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>

        {/* 中：画布骨架（固定 640×360，与 EditorShell CANVAS_W/CANVAS_H 一致，防 CLS） */}
        <div className="flex flex-col gap-2">
          <div
            className="flex items-center justify-center rounded-2xl border border-glass-border bg-surface"
            style={{ height: 360, maxWidth: 640, marginInline: "auto", width: "100%" }}
          >
            <div className="h-4 w-40 animate-pulse rounded bg-surface-raised" />
          </div>
          <div className="mx-auto h-3 w-48 animate-pulse rounded bg-surface-raised" />
        </div>

        {/* 右：属性面板骨架 */}
        <div className="flex flex-col gap-3 rounded-2xl border border-glass-border bg-surface p-4">
          <div className="h-3 w-20 animate-pulse rounded bg-surface-raised" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div
                className="h-3 w-14 animate-pulse rounded bg-surface-raised"
                style={{ animationDelay: `${i * 50}ms` }}
              />
              <div
                className="h-8 w-full animate-pulse rounded bg-surface-raised"
                style={{ animationDelay: `${i * 50}ms` }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 底部：Luau 预览骨架 */}
      <div className="rounded-2xl border border-glass-border bg-surface">
        <div className="border-b border-glass-border px-4 py-2">
          <div className="h-3 w-24 animate-pulse rounded bg-surface-raised" />
        </div>
        <div className="flex flex-col gap-2 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-3 w-full animate-pulse rounded bg-surface-raised"
              style={{ animationDelay: `${i * 40}ms` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
