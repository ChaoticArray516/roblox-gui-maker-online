import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Breadcrumb, BlogListJsonLd } from "@/components/seo";

export const metadata: Metadata = {
  title: "Roblox GUI Maker Blog — Tips, Tutorials & Guides",
  description:
    "Roblox UI tips, Figma-to-Studio tutorials, AI Luau generation guides, and template deep dives from the Roblox GUI Maker team.",
  alternates: { canonical: "/blog" },
};

const POSTS = [
  {
    slug: "best-roblox-ui-maker-no-coding",
    headline: "The Best Roblox UI Maker Without Coding in 2026",
    description:
      "Compare the top visual Roblox UI builders and see why a controllable AI editor beats black-box generators.",
    category: "Comparison",
    datePublished: "2026-06-20",
    dateModified: "2026-06-20",
  },
  {
    slug: "convert-figma-to-roblox-studio-ui",
    headline: "Figma to Roblox Studio UI Converter — Coming Soon",
    description:
      "What the planned Figma-to-Roblox converter will do: frame mapping, asset upload, Scale/Offset conversion, and Studio plugin import.",
    category: "News",
    datePublished: "2026-06-20",
    dateModified: "2026-06-20",
  },
  {
    slug: "top-10-free-roblox-gui-templates",
    headline: "Top 10 Free Roblox GUI Templates for Your Game",
    description:
      "The best free templates for inventories, shops, HUDs, and leaderboards — all with real Luau logic.",
    category: "Templates",
    datePublished: "2026-06-20",
    dateModified: "2026-06-20",
  },
];

export default function BlogPage() {
  return (
    <>
      <head>
        <BlogListJsonLd posts={POSTS} />
      </head>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-24">
        <Breadcrumb items={[{ name: "Home", url: "/" }, { name: "Blog", url: "/blog" }]} />
        <header className="space-y-4">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-text">
            Roblox GUI Maker Blog — Tips, Tutorials & Guides
          </h1>
          <p className="max-w-2xl text-text-muted">
            Long-form articles on building Roblox UIs, converting Figma designs,
            using AI Luau generation, and getting the most from our templates.
          </p>
        </header>

        {/* Category filters (static display) */}
        <div className="flex flex-wrap gap-2">
          {["All", "Tutorial", "Comparison", "Templates", "News"].map((cat) => (
            <span
              key={cat}
              className="rounded-full border border-glass-border bg-surface px-3 py-1 text-xs font-medium text-text-muted"
            >
              {cat}
            </span>
          ))}
        </div>

        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {POSTS.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="flex h-full flex-col gap-3 rounded-2xl border border-glass-border bg-surface p-6 transition-colors hover:border-cyan-accent/40"
              >
                <span className="w-fit rounded-full bg-surface-raised px-2.5 py-1 text-xs font-medium text-text-muted">
                  {post.category}
                </span>
                <h2 className="font-display text-xl font-semibold text-text">{post.headline}</h2>
                <p className="flex-1 text-sm text-text-muted">{post.description}</p>
                <time className="text-xs text-text-muted" dateTime={post.datePublished}>
                  {post.datePublished}
                </time>
              </Link>
            </li>
          ))}
        </ul>

        <section className="rounded-2xl border border-glass-border bg-surface-raised p-8 text-center">
          <h2 className="font-display text-2xl font-semibold text-text">
            Build faster with AI
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-text-muted">
            Try the editor and generate a custom Roblox GUI from a text prompt.
          </p>
          <Link
            href="/editor"
            className={cn(buttonVariants({ size: "lg" }), "mt-6")}
          >
            Try Editor Free
          </Link>
        </section>
      </main>
    </>
  );
}
