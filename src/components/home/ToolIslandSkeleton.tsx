/** 纯静态骨架屏（防 CLS），尺寸逼近 HomepageToolIsland 真实布局 */
export function ToolIslandSkeleton() {
  return (
    <div
      className="rounded-2xl border border-glass-border bg-surface p-6"
      aria-hidden="true"
    >
      <div className="h-4 w-32 rounded bg-surface-raised" />
      <div className="mt-2 grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-surface-raised" />
        ))}
      </div>
      <div className="mt-4 h-4 w-48 rounded bg-surface-raised" />
      <div className="mt-2 h-20 rounded-lg bg-surface-raised" />
      <div className="mt-4 h-11 rounded-lg bg-brand-500/40" />
      <div className="mx-auto mt-2 h-3 w-56 rounded bg-surface-raised" />
    </div>
  );
}
