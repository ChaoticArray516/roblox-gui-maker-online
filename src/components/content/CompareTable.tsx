import { Check, X, Minus } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CompareFeature, CompareProduct } from "@/lib/types";

export interface CompareTableProps {
  title: string;
  products: CompareProduct[];
  features: CompareFeature[];
  footnote?: string;
  className?: string;
}

function CellValue({
  value,
  isOurs,
}: {
  value: string | boolean | undefined;
  isOurs?: boolean;
}) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className={cn("size-5", isOurs ? "text-cyan-accent" : "text-text-muted")} />
    ) : (
      <X className="size-5 text-text-muted" />
    );
  }
  if (value === undefined || value === "") {
    return <Minus className="size-5 text-text-muted" />;
  }
  return <span className={cn(isOurs && "text-cyan-accent")}>{value}</span>;
}

export function CompareTable({
  title,
  products,
  features,
  footnote,
  className,
}: CompareTableProps) {
  const ourProduct = products.find((p) => p.isOurs);
  const competitor = products.find((p) => !p.isOurs);

  return (
    <section className={cn("w-full", className)}>
      <h2 className="font-display text-2xl font-semibold tracking-tight text-text">
        {title}
      </h2>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-glass-border">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-surface-raised text-text">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                Feature
              </th>
              {products.map((p) => (
                <th
                  key={p.id}
                  scope="col"
                  className={cn(
                    "px-4 py-3 font-semibold",
                    p.isOurs && "bg-brand-500/10 text-cyan-accent"
                  )}
                >
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-text-muted">
            {features.map((feature) => {
              const isHighlight = feature.highlight;
              return (
                <tr
                  key={feature.name}
                  className={cn(
                    "border-t border-glass-border",
                    isHighlight && "bg-surface-raised/50"
                  )}
                >
                  <th
                    scope="row"
                    className="px-4 py-3 font-normal text-text"
                  >
                    {feature.name}
                  </th>
                  <td
                    className={cn(
                      "px-4 py-3",
                      ourProduct?.isOurs && "bg-brand-500/5 text-cyan-accent"
                    )}
                  >
                    <CellValue value={feature.ours} isOurs />
                  </td>
                  <td className="px-4 py-3">
                    <CellValue
                      value={feature.competitor}
                      isOurs={competitor?.isOurs}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {footnote && (
        <p className="mt-3 text-xs text-text-muted">{footnote}</p>
      )}
    </section>
  );
}