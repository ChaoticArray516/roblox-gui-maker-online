import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SITE_URL } from "@/lib/site-config";
import { Breadcrumb, BlogPostJsonLd } from "@/components/seo";
import { POSTS, POST_SLUGS, type PostSlug } from "./data";

export function generateStaticParams() {
  return POST_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS[slug as PostSlug];
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = POSTS[slug as PostSlug];
  if (!post) return null;

  const canonical = `${SITE_URL}/blog/${post.slug}`;

  return (
    <>
      <head>
        <BlogPostJsonLd
          slug={post.slug}
          title={post.title}
          description={post.description}
          content={post.content}
          publishedAt={post.publishedAt}
          modifiedAt={post.modifiedAt}
          authorName={post.authorName}
          imageUrl={post.imageUrl}
          keywords={post.keywords}
        />
      </head>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-24">
      <Breadcrumb
        items={[
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: post.title, url: canonical },
        ]}
      />

      <article className="flex flex-col gap-6">
        <header className="space-y-3">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-text">
            {post.title}
          </h1>
          <p className="text-text-muted">
            {post.publishedAt} · {post.authorName}
          </p>
        </header>

        <div className="prose prose-invert max-w-none text-text-muted">
          {post.content.split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/editor" className={cn(buttonVariants({ size: "lg" }))}>
            Try Our GUI Maker
          </Link>
          <Link
            href="/guides"
            className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
          >
            Read the Guides
          </Link>
        </div>
      </article>
    </main>
    </>
  );
}
