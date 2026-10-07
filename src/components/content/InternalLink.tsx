import Link from "next/link";

import { cn } from "@/lib/utils";

export const ANCHOR_TEXTS: Record<string, string> = {
  "/editor": "Try Editor Free",
  "/templates": "Browse GUI Templates",
  "/templates?free=1": "Free Roblox GUI Templates",
  "/plugin": "Roblox Studio Plugin",
  "/pricing": "See pricing",
  "/faq": "Frequently Asked Questions",
  "/use-cases": "Find UI for your game type",
  "/blog": "Read more on our blog",
  "/guides": "Read the full guide",
  "/docs": "Documentation",
  "/figma-to-roblox": "Convert Figma to Roblox Studio",
  "/editor?demo=1": "Try the demo editor",
};

export interface InternalLinkProps {
  href: string;
  children?: React.ReactNode;
  /** 强制覆盖锚文本 */
  anchorText?: string;
  title?: string;
  className?: string;
}

function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href) || href.startsWith("roblox-studio://");
}

function resolveAnchorText(
  href: string,
  anchorText?: string,
  children?: React.ReactNode
): React.ReactNode {
  if (children) return children;
  if (anchorText) return anchorText;
  return ANCHOR_TEXTS[href] || href;
}

export function InternalLink({
  href,
  children,
  anchorText,
  title,
  className,
}: InternalLinkProps) {
  const text = resolveAnchorText(href, anchorText, children);
  const baseClasses = cn(
    "text-cyan-accent hover:text-cyan-accent/80 hover:underline underline-offset-2 transition-colors",
    className
  );

  if (isExternal(href)) {
    return (
      <a
        href={href}
        title={title}
        className={baseClasses}
        rel="noopener noreferrer"
        target="_blank"
      >
        {text}
      </a>
    );
  }

  return (
    <Link href={href} title={title} className={baseClasses}>
      {text}
    </Link>
  );
}