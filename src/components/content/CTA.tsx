import Link from "next/link";
import { ArrowRight, FileCode, Wrench, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { CTAConfig } from "@/lib/types";

export interface CTAButtonProps {
  variant?: CTAConfig["variant"];
  href: string;
  label: string;
  query?: Record<string, string>;
  className?: string;
}

const VARIANT_MAP: Record<
  NonNullable<CTAConfig["variant"]>,
  { variant: "default" | "outline" | "secondary" | "ghost"; icon?: React.ReactNode }
> = {
  primary: { variant: "default", icon: <ArrowRight className="size-4" /> },
  secondary: { variant: "outline", icon: <ArrowRight className="size-4" /> },
  editor: { variant: "default", icon: <Wrench className="size-4" /> },
  template: { variant: "secondary", icon: <FileCode className="size-4" /> },
  waitlist: { variant: "outline", icon: <Sparkles className="size-4" /> },
  next: { variant: "ghost", icon: <ArrowRight className="size-4" /> },
};

function buildHref(href: string, query?: Record<string, string>): string {
  if (!query || Object.keys(query).length === 0) return href;
  const qs = new URLSearchParams(query).toString();
  return `${href}${href.includes("?") ? "&" : "?"}${qs}`;
}

function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href) || href.startsWith("roblox-studio://");
}

export function CTAButton({
  variant = "primary",
  href,
  label,
  query,
  className,
}: CTAButtonProps) {
  const { variant: btnVariant, icon } = VARIANT_MAP[variant];
  const target = buildHref(href, query);
  const classes = cn(buttonVariants({ variant: btnVariant, size: "lg" }), "gap-2", className);

  if (isExternal(target)) {
    return (
      <a
        href={target}
        className={classes}
        rel="noopener noreferrer"
        target="_blank"
      >
        {label}
        {icon}
      </a>
    );
  }

  return (
    <Link href={target} className={classes}>
      {label}
      {icon}
    </Link>
  );
}

export interface CTASectionProps {
  title?: string;
  description?: string;
  buttons: CTAConfig[];
  className?: string;
}

export function CTASection({ title, description, buttons, className }: CTASectionProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-glass-border bg-surface p-8 text-center",
        className
      )}
    >
      {title && (
        <h2 className="font-display text-2xl font-semibold tracking-tight text-text">
          {title}
        </h2>
      )}
      {description && (
        <p className="mx-auto mt-3 max-w-xl text-text-muted">{description}</p>
      )}
      {buttons.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {buttons.map((btn, i) => (
            <CTAButton
              key={`${btn.href}-${btn.label}-${i}`}
              variant={btn.variant}
              href={btn.href}
              label={btn.label}
              query={btn.query}
            />
          ))}
        </div>
      )}
    </section>
  );
}