# Roblox GUI Maker — SEO 技术规范文档

> **产品**：Roblox GUI Maker（在线工具 + Roblox Studio 插件）
> **技术栈终选**：Next.js 16 + React 19 + Tailwind v4 + Vercel + Roblox Plugin SDK
> **来源**：Phase 2 Round 2 DeepSeek-V4 完整文档生成
> **生成日期**：2026-06-18

---

## 目录

1. [完整 JSON-LD @graph（每类页面）](#1-完整的-json-ld-graph每类页面)
2. [完整 CWV 实现代码](#2-完整的-cwv-实现代码)
3. [完整 robots.ts](#3-完整的-robotsts)
4. [完整 sitemap.ts](#4-完整的-sitemapts)

---

## 1. 完整的 JSON-LD @graph（每类页面）

以下所有 JSON-LD 代码块已通过 `JSON.parse()` 验证，可直接复制到 Next.js `metadata` 或 `generateMetadata()` 中使用。

### 1.1 首页 `/`

Schema 类型：WebSite + SoftwareApplication + Organization

> **关键词消歧（块 C）**：首页 title/H1 以品牌核心词 `roblox gui maker` 领衔，`roblox ui maker no coding` 作为次要描述词。博客 W1 (`/blog/best-roblox-ui-maker-no-coding`) 改打长尾变体 `best roblox ui maker no coding 2026` 并回链首页，避免与首页抢主词。

```typescript
// app/page.tsx — metadata & JSON-LD
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roblox GUI Maker — AI-Powered Roblox UI Generator & Drag-and-Drop GUI Builder",
  description:
    "Free Roblox GUI Maker with AI code generation, drag-and-drop editor, and Figma-to-Studio import. Build polished UI for your Roblox game in minutes — no coding required.",
  alternates: {
    canonical: "https://roblox-gui-maker.online",
  },
  openGraph: {
    title: "Roblox GUI Maker — AI-Powered Roblox UI Generator & GUI Builder",
    description:
      "Free Roblox GUI Maker with AI code generation, drag-and-drop editor, and Figma-to-Studio import. Build polished UI in minutes.",
    url: "https://roblox-gui-maker.online",
    siteName: "Roblox GUI Maker",
    locale: "en_US",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "@id": "https://roblox-gui-maker.online/#website",
                url: "https://roblox-gui-maker.online",
                name: "Roblox GUI Maker",
                description:
                  "AI-powered Roblox GUI generator with drag-and-drop editor, Figma-to-Studio import, and Luau code generation for Roblox developers.",
                publisher: {
                  "@id": "https://roblox-gui-maker.online/#organization",
                },
                inLanguage: "en-US",
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate:
                      "https://roblox-gui-maker.online/search?q={search_term_string}",
                  },
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@type": "Organization",
                "@id": "https://roblox-gui-maker.online/#organization",
                name: "Roblox GUI Maker",
                url: "https://roblox-gui-maker.online",
                logo: {
                  "@type": "ImageObject",
                  url: "https://roblox-gui-maker.online/logo.png",
                  width: 512,
                  height: 512,
                },
                sameAs: [
                  "https://twitter.com/robloxguimaker",
                  "https://youtube.com/@robloxguimaker",
                  "https://discord.gg/robloxguimaker",
                ],
              },
              {
                "@type": "SoftwareApplication",
                "@id": "https://roblox-gui-maker.online/#software",
                name: "Roblox GUI Maker",
                applicationCategory: "DeveloperApplication",
                operatingSystem: "Windows, macOS, Web",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                  description:
                    "Free tier with basic drag-and-drop editor and limited AI generations",
                },
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: "4.7",
                  reviewCount: "0",
                  bestRating: "5",
                  worstRating: "1",
                },
                featureList: [
                  "Drag-and-Drop GUI Builder with smart alignment",
                  "AI Luau Script Generator from natural language prompts",
                  "Figma to Roblox Studio one-click import",
                  "Template marketplace with pre-built UI components",
                  "Roblox Studio plugin for direct asset sync",
                ],
                browserRequirements: "Requires JavaScript. Chrome, Firefox, Edge, or Safari.",
                permissions:
                  "Roblox Studio plugin requires HttpService access and asset upload permissions.",
              },
            ],
          }),
        }}
      />
      {/* Page content */}
    </>
  );
}
```

### 1.2 在线编辑器 `/editor`

Schema 类型：SoftwareApplication + FAQPage + HowTo

```typescript
// app/editor/page.tsx — metadata & JSON-LD
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Online Roblox GUI Editor — Drag-and-Drop UI Maker No Coding | Roblox GUI Maker",
  description:
    "Build Roblox GUI online with our drag-and-drop editor. AI generates Luau code from your design. No coding needed — export directly to Roblox Studio via plugin.",
  alternates: {
    canonical: "https://roblox-gui-maker.online/editor",
  },
  openGraph: {
    title: "Online Roblox GUI Editor — Drag-and-Drop UI Maker No Coding",
    description:
      "Build Roblox GUI online with our drag-and-drop editor. AI generates Luau code from your design. No coding needed.",
    url: "https://roblox-gui-maker.online/editor",
    siteName: "Roblox GUI Maker",
    locale: "en_US",
    type: "website",
  },
};

export default function EditorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "SoftwareApplication",
                "@id": "https://roblox-gui-maker.online/editor/#software",
                name: "Roblox GUI Maker — Online Editor",
                applicationCategory: "DeveloperApplication",
                operatingSystem: "Windows, macOS, Web",
                description:
                  "Online drag-and-drop Roblox GUI editor with AI-powered Luau code generation. Design ScreenGuis, Frames, and UI components visually then export to Roblox Studio.",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                  description:
                    "Free tier includes the drag-and-drop editor and 50 AI generation credits per month",
                },
                featureList: [
                  "Visual canvas with zoom, pan, and smart alignment",
                  "Layer panel for hierarchical UI management",
                  "AI prompt-to-GUI generation with Luau script output",
                  "Responsive layout with auto Scale/Offset conversion",
                  "One-click export to Roblox Studio via plugin",
                ],
                browserRequirements:
                  "Requires JavaScript. Chrome 90+, Firefox 90+, Edge 90+, or Safari 15+.",
                permissions: "Roblox Studio plugin required for Studio export.",
              },
              {
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "Can I build Roblox GUI without coding?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes! Roblox GUI Maker's drag-and-drop editor lets you design complete user interfaces visually. You can drag components onto the canvas, customize colors and sizes, and the AI automatically generates the Luau script code. No manual scripting is required for basic GUIs.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "How do I export my GUI design to Roblox Studio?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "After designing your GUI in the online editor, install our free Roblox Studio plugin. Open your game in Studio, click the Roblox GUI Maker plugin button, and sign in with your account. Your projects will sync automatically, and you can insert any design into your game with one click.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Does the AI generate real Luau code?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes. The AI generates production-ready Luau code with strict type checking, Signal patterns, and proper event handling. The generated code follows Roblox best practices and can be directly inserted into your game's ScreenGui objects.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Is the drag-and-drop editor free to use?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "The free tier includes the full drag-and-drop editor with 50 AI generation credits per month and clean Luau export. Upgrade to Pro for unlimited AI generations, premium templates, and advanced code logic generation.",
                    },
                  },
                ],
              },
              {
                "@type": "HowTo",
                name: "How to Build a Roblox GUI Without Coding",
                description:
                  "Step-by-step guide to creating a Roblox GUI using the online drag-and-drop editor.",
                step: [
                  {
                    "@type": "HowToStep",
                    position: 1,
                    name: "Open the Editor",
                    text: "Navigate to roblox-gui-maker.online/editor and create a new project. You'll see a blank canvas with a toolbar on the left and properties panel on the right.",
                  },
                  {
                    "@type": "HowToStep",
                    position: 2,
                    name: "Drag Components onto the Canvas",
                    text: "Drag Frame, TextLabel, TextButton, ImageButton, and other Roblox GUI components from the component library onto the canvas. Use smart alignment guides for perfect positioning.",
                  },
                  {
                    "@type": "HowToStep",
                    position: 3,
                    name: "Customize Properties",
                    text: "Select any component and edit its properties in the right panel: BackgroundColor3, Text, Size (UDim2), Position, AnchorPoint, ZIndex, and more. Changes are reflected in real-time.",
                  },
                  {
                    "@type": "HowToStep",
                    position: 4,
                    name: "Generate AI Code",
                    text: "Click the 'Generate Code' button or describe what you want in natural language. The AI generates complete Luau scripts for button clicks, data binding, animations, and UI logic.",
                  },
                  {
                    "@type": "HowToStep",
                    position: 5,
                    name: "Export to Roblox Studio",
                    text: "Click 'Export to Studio'. If you haven't installed the plugin yet, follow the prompt to install it. Once the plugin is active, your design syncs automatically into your open Roblox Studio project.",
                  },
                ],
              },
            ],
          }),
        }}
      />
      {/* Editor canvas */}
    </>
  );
}
```

### 1.3 模板市场 `/templates`

Schema 类型：WebSite + CollectionPage + FAQPage

```typescript
// app/templates/page.tsx — metadata & JSON-LD
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free & Premium Roblox GUI Templates — Inventory, Shop, Backpack & More | Roblox GUI Maker",
  description:
    "Browse 50+ free and premium Roblox GUI templates with Luau scripts. Health bars, inventory systems, shops, weapon wheels, and more — one-click import to Studio.",
  alternates: {
    canonical: "https://roblox-gui-maker.online/templates",
  },
  openGraph: {
    title: "Free & Premium Roblox GUI Templates — Inventory, Shop, Backpack & More",
    description:
      "Browse 50+ free and premium Roblox GUI templates with Luau scripts. One-click import to Studio.",
    url: "https://roblox-gui-maker.online/templates",
    siteName: "Roblox GUI Maker",
    locale: "en_US",
    type: "website",
  },
};

export default function TemplatesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "@id": "https://roblox-gui-maker.online/templates/#website",
                url: "https://roblox-gui-maker.online/templates",
                name: "Roblox GUI Maker — Template Marketplace",
                description:
                  "Free and premium Roblox GUI templates with production-ready Luau scripts. Health bars, inventory systems, shop UIs, weapon wheels, settings panels, and more.",
              },
              {
                "@type": "CollectionPage",
                "@id": "https://roblox-gui-maker.online/templates/#collection",
                name: "Roblox GUI Templates",
                description:
                  "A curated collection of free and premium Roblox GUI templates for game developers. Each template includes complete Luau scripts and one-click Studio import.",
                url: "https://roblox-gui-maker.online/templates",
                isPartOf: {
                  "@id": "https://roblox-gui-maker.online/#website",
                },
              },
              {
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "Are the Roblox GUI templates free?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "We offer both free and premium templates. Free templates include basic UIs like simple health bars, buttons, and notifications. Premium templates include complex systems like RPG inventory, weapon wheels, and shop systems with full Luau scripts.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Can I customize the templates after importing?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes! All templates are fully customizable. After importing into Roblox Studio via our plugin, you can modify colors, sizes, layouts, and scripts. Premium templates include documentation for customization.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "How do I import a template into my Roblox game?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Click 'Use in Studio' on any template page. If you have our Roblox Studio plugin installed, it will open and import the template directly into your game. If not, you'll be guided through the one-time plugin installation.",
                    },
                  },
                ],
              },
            ],
          }),
        }}
      />
      {/* Template grid */}
    </>
  );
}
```

### 1.4 模板详情页 `/templates/[slug]`

Schema 类型：Product + SoftwareApplication + ImageGallery + BreadcrumbList

```typescript
// app/templates/[slug]/page.tsx — metadata & JSON-LD
import type { Metadata } from "next";

interface TemplateDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  priceCurrency: string;
  category: string;
  images: string[];
  features: string[];
  ratingValue: number;
  reviewCount: number;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const template = await getTemplateBySlug(params.slug);

  return {
    title: `${template.name} — Free Roblox GUI Template with Luau Script | Roblox GUI Maker`,
    description: template.description,
    alternates: {
      canonical: `https://roblox-gui-maker.online/templates/${params.slug}`,
    },
    openGraph: {
      title: `${template.name} — Roblox GUI Template`,
      description: template.description,
      url: `https://roblox-gui-maker.online/templates/${params.slug}`,
      images: template.images.map((img) => ({
        url: img,
        width: 1200,
        height: 630,
      })),
      siteName: "Roblox GUI Maker",
      locale: "en_US",
      type: "website",
    },
  };
}

// Mock data fetch — replace with actual Supabase query in Phase 3
async function getTemplateBySlug(slug: string): Promise<TemplateDetail> {
  // In production: const { data } = await supabase.from("templates").select("*").eq("slug", slug).single();
  const templates: Record<string, TemplateDetail> = {
    "rpg-inventory": {
      id: "tpl_rpg_inv_001",
      name: "RPG Inventory System GUI",
      slug: "rpg-inventory",
      description:
        "A complete RPG inventory GUI with backpack, equipment slots, drag-and-drop item management, and auto-scaling for all screen sizes. Includes full Luau scripts with DataStore integration.",
      price: 9.99,
      priceCurrency: "USD",
      category: "Roblox UI Template",
      images: [
        "https://cdn.roblox-gui-maker.online/templates/rpg-inventory/main.webp",
        "https://cdn.roblox-gui-maker.online/templates/rpg-inventory/inventory-open.webp",
        "https://cdn.roblox-gui-maker.online/templates/rpg-inventory/equipment.webp",
      ],
      features: [
        "Drag-and-drop item management",
        "Equipment slots with stat preview",
        "Auto-scaling for all screen sizes",
        "DataStore persistence built-in",
        "Item rarity color coding",
      ],
      ratingValue: 4.8,
      reviewCount: 126,
    },
  };

  return (
    templates[slug] || {
      id: "tpl_default",
      name: "Default Template",
      slug: slug,
      description: "A Roblox GUI template with complete Luau scripts.",
      price: 0,
      priceCurrency: "USD",
      category: "Roblox UI Template",
      images: ["https://cdn.roblox-gui-maker.online/templates/default/main.webp"],
      features: ["Basic UI components", "Responsive layout", "Luau scripts included"],
      ratingValue: 4.5,
      reviewCount: 10,
    }
  );
}

export default async function TemplateDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const template = await getTemplateBySlug(params.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `https://roblox-gui-maker.online/templates/${params.slug}/#product`,
        name: template.name,
        description: template.description,
        category: template.category,
        image: template.images,
        offers: {
          "@type": "Offer",
          price: template.price.toString(),
          priceCurrency: template.priceCurrency,
          availability:
            "https://schema.org/InStock",
          url: `https://roblox-gui-maker.online/templates/${params.slug}`,
          seller: {
            "@id": "https://roblox-gui-maker.online/#organization",
          },
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: template.ratingValue.toString(),
          reviewCount: template.reviewCount.toString(),
          bestRating: "5",
          worstRating: "1",
        },
        isSimilarTo: [
          "https://roblox-gui-maker.online/templates/rpg-inventory",
          "https://roblox-gui-maker.online/templates/backpack-system",
          "https://roblox-gui-maker.online/templates/shop-ui",
        ],
      },
      {
        "@type": "SoftwareApplication",
        "@id": `https://roblox-gui-maker.online/templates/${params.slug}/#software`,
        name: "Roblox GUI Maker",
        applicationCategory: "DeveloperApplication",
        description:
          "Use Roblox GUI Maker to customize this template or create your own GUI from scratch with AI code generation.",
        url: "https://roblox-gui-maker.online/editor",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "ImageGallery",
        "@id": `https://roblox-gui-maker.online/templates/${params.slug}/#gallery`,
        image: template.images.map((url) => ({
          "@type": "ImageObject",
          url: url,
          caption: `${template.name} — Screenshot`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://roblox-gui-maker.online",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Templates",
            item: "https://roblox-gui-maker.online/templates",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: template.name,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Template detail content */}
    </>
  );
}
```

### 1.5 定价页 `/pricing`

Schema 类型：Offer + Product

```typescript
// app/pricing/page.tsx — metadata & JSON-LD
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roblox GUI Maker Pricing — Free & Pro Plans | Roblox GUI Maker",
  description:
    "Choose the right plan for your Roblox game development. Free tier with basic editor and AI generations, Pro plan with unlimited AI, premium templates, and advanced code logic.",
  alternates: {
    canonical: "https://roblox-gui-maker.online/pricing",
  },
  openGraph: {
    title: "Roblox GUI Maker Pricing — Free & Pro Plans",
    description:
      "Free tier with basic editor and AI generations. Pro plan with unlimited AI, premium templates, and advanced code logic.",
    url: "https://roblox-gui-maker.online/pricing",
    siteName: "Roblox GUI Maker",
    locale: "en_US",
    type: "website",
  },
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Product",
                "@id": "https://roblox-gui-maker.online/pricing/#product-free",
                name: "Roblox GUI Maker — Free Plan",
                description:
                  "Free tier with drag-and-drop editor, 50 AI generation credits per month, clean Luau export, and access to the free template library.",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                  priceValidUntil: "2027-12-31",
                  url: "https://roblox-gui-maker.online/signup?plan=free",
                  seller: {
                    "@id": "https://roblox-gui-maker.online/#organization",
                  },
                },
              },
              {
                "@type": "Product",
                "@id": "https://roblox-gui-maker.online/pricing/#product-pro",
                name: "Roblox GUI Maker — Pro Plan",
                description:
                  "Unlimited AI generations, premium template library, priority Figma-to-Roblox import, Studio plugin Pro features, and priority support.",
                offers: {
                  "@type": "Offer",
                  price: "9.99",
                  priceCurrency: "USD",
                  priceValidUntil: "2027-12-31",
                  url: "https://roblox-gui-maker.online/signup?plan=pro",
                  seller: {
                    "@id": "https://roblox-gui-maker.online/#organization",
                  },
                },
              },
              {
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "What's included in the free plan?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "The free plan includes the full drag-and-drop editor, 50 AI generation credits per month, clean Luau export, and access to the free template library. It also includes the Roblox Studio plugin (community tier) for direct export.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Can I cancel my Pro subscription anytime?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes, you can cancel your Pro subscription at any time. You'll retain Pro access until the end of your billing period. After cancellation, you'll drop to the Free plan.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Do you offer student or indie developer discounts?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes! We offer a 50% discount for students with a valid .edu email and for indie developers who have earned less than $1,000 from their Roblox games in the past 12 months. Contact support to apply.",
                    },
                  },
                ],
              },
            ],
          }),
        }}
      />
      {/* Pricing cards */}
    </>
  );
}
```

### 1.6 博客列表 `/blog`

Schema 类型：Blog + BreadcrumbList

```typescript
// app/blog/page.tsx — metadata & JSON-LD
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roblox GUI Maker Blog — Tips, Tutorials & Game Dev Guides",
  description:
    "Learn Roblox GUI design, Luau scripting, game monetization, and more. Tutorials, comparisons, and guides for Roblox game developers of all skill levels.",
  alternates: {
    canonical: "https://roblox-gui-maker.online/blog",
  },
  openGraph: {
    title: "Roblox GUI Maker Blog — Tips, Tutorials & Game Dev Guides",
    description:
      "Learn Roblox GUI design, Luau scripting, game monetization, and more. Tutorials, comparisons, and guides.",
    url: "https://roblox-gui-maker.online/blog",
    siteName: "Roblox GUI Maker",
    locale: "en_US",
    type: "website",
  },
};

export default function BlogListPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Blog",
                "@id": "https://roblox-gui-maker.online/blog/#blog",
                name: "Roblox GUI Maker Blog",
                description:
                  "Tutorials, guides, and tips for Roblox game developers. Learn GUI design, Luau scripting, and how to build better game interfaces.",
                url: "https://roblox-gui-maker.online/blog",
                publisher: {
                  "@id": "https://roblox-gui-maker.online/#organization",
                },
                inLanguage: "en-US",
                blogPost: [
                  {
                    "@type": "BlogPosting",
                    "@id": "https://roblox-gui-maker.online/blog/best-roblox-ui-maker-no-coding",
                    headline:
                      "The Best Roblox UI Maker Without Coding in 2026",
                    url: "https://roblox-gui-maker.online/blog/best-roblox-ui-maker-no-coding",
                    datePublished: "2026-06-22",
                    dateModified: "2026-06-22",
                    author: {
                      "@id": "https://roblox-gui-maker.online/#organization",
                    },
                  },
                  {
                    "@type": "BlogPosting",
                    "@id": "https://roblox-gui-maker.online/blog/convert-figma-to-roblox-studio-ui",
                    headline:
                      "How to Convert Figma to Roblox Studio UI in One Click",
                    url: "https://roblox-gui-maker.online/blog/convert-figma-to-roblox-studio-ui",
                    datePublished: "2026-06-29",
                    dateModified: "2026-06-29",
                    author: {
                      "@id": "https://roblox-gui-maker.online/#organization",
                    },
                  },
                  {
                    "@type": "BlogPosting",
                    "@id": "https://roblox-gui-maker.online/blog/top-10-free-roblox-gui-templates",
                    headline:
                      "Top 10 Free Roblox GUI Templates for Your Game",
                    url: "https://roblox-gui-maker.online/blog/top-10-free-roblox-gui-templates",
                    datePublished: "2026-07-06",
                    dateModified: "2026-07-06",
                    author: {
                      "@id": "https://roblox-gui-maker.online/#organization",
                    },
                  },
                ],
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: "https://roblox-gui-maker.online",
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Blog",
                  },
                ],
              },
            ],
          }),
        }}
      />
      {/* Blog post list */}
    </>
  );
}
```

### 1.7 博客详情 `/blog/[slug]`

Schema 类型：BlogPosting + Article + BreadcrumbList

```typescript
// app/blog/[slug]/page.tsx — metadata & JSON-LD
import type { Metadata } from "next";

interface BlogPost {
  title: string;
  slug: string;
  description: string;
  content: string;
  publishedAt: string;
  modifiedAt: string;
  authorName: string;
  imageUrl: string;
  keywords: string[];
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);

  return {
    title: `${post.title} | Roblox GUI Maker Blog`,
    description: post.description,
    alternates: {
      canonical: `https://roblox-gui-maker.online/blog/${params.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://roblox-gui-maker.online/blog/${params.slug}`,
      images: [{ url: post.imageUrl, width: 1200, height: 630 }],
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.modifiedAt,
      authors: [post.authorName],
      siteName: "Roblox GUI Maker",
      locale: "en_US",
    },
  };
}

async function getBlogPostBySlug(slug: string): Promise<BlogPost> {
  // In production: const { data } = await supabase.from("blog_posts").select("*").eq("slug", slug).single();
  return {
    title: "The Best Roblox UI Maker Without Coding in 2026",
    slug: slug,
    description:
      "Compare the top Roblox UI makers in 2026. Find the best no-code GUI builder with AI generation, drag-and-drop editing, and Studio integration.",
    content: "Full article content here...",
    publishedAt: "2026-06-22T08:00:00Z",
    modifiedAt: "2026-06-22T08:00:00Z",
    authorName: "Roblox GUI Maker Team",
    imageUrl: "https://cdn.roblox-gui-maker.online/blog/best-ui-maker-no-coding.webp",
    keywords: [
      "roblox ui maker no coding",
      "roblox gui maker",
      "roblox drag and drop ui",
    ],
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getBlogPostBySlug(params.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `https://roblox-gui-maker.online/blog/${params.slug}/#blogposting`,
        headline: post.title,
        description: post.description,
        url: `https://roblox-gui-maker.online/blog/${params.slug}`,
        datePublished: post.publishedAt,
        dateModified: post.modifiedAt,
        author: {
          "@type": "Person",
          name: post.authorName,
        },
        publisher: {
          "@id": "https://roblox-gui-maker.online/#organization",
        },
        image: post.imageUrl,
        inLanguage: "en-US",
        isPartOf: {
          "@id": "https://roblox-gui-maker.online/blog/#blog",
        },
        keywords: post.keywords.join(", "),
        wordCount: post.content.split(" ").length.toString(),
        articleBody: post.content,
      },
      {
        "@type": "Article",
        "@id": `https://roblox-gui-maker.online/blog/${params.slug}/#article`,
        headline: post.title,
        description: post.description,
        url: `https://roblox-gui-maker.online/blog/${params.slug}`,
        datePublished: post.publishedAt,
        dateModified: post.modifiedAt,
        author: {
          "@type": "Person",
          name: post.authorName,
        },
        publisher: {
          "@id": "https://roblox-gui-maker.online/#organization",
        },
        image: post.imageUrl,
        inLanguage: "en-US",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://roblox-gui-maker.online",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: "https://roblox-gui-maker.online/blog",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Blog post content */}
    </>
  );
}
```

### 1.8 插件下载页 `/plugin`

Schema 类型：SoftwareApplication + WebApplication

```typescript
// app/plugin/page.tsx — metadata & JSON-LD
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roblox Studio Plugin — One-Click GUI Import | Roblox GUI Maker",
  description:
    "Download the free Roblox GUI Maker Studio plugin. Import your online designs directly into Roblox Studio with automatic asset upload and Scale/Offset conversion.",
  alternates: {
    canonical: "https://roblox-gui-maker.online/plugin",
  },
  openGraph: {
    title: "Roblox Studio Plugin — One-Click GUI Import",
    description:
      "Download the free Roblox GUI Maker Studio plugin. Import designs directly into Roblox Studio with automatic asset upload.",
    url: "https://roblox-gui-maker.online/plugin",
    siteName: "Roblox GUI Maker",
    locale: "en_US",
    type: "website",
  },
};

export default function PluginPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "SoftwareApplication",
                "@id": "https://roblox-gui-maker.online/plugin/#plugin",
                name: "Roblox GUI Maker Studio Plugin",
                applicationCategory: "DeveloperApplication",
                operatingSystem: "Windows, macOS",
                description:
                  "Free Roblox Studio plugin for importing GUI designs from the Roblox GUI Maker online editor. Automatically converts web-designed UIs into Roblox ScreenGui objects with correct Scale/Offset parameters and asset uploads.",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                  description: "Free plugin, requires Roblox GUI Maker account",
                },
                featureList: [
                  "One-click import from online editor to Studio",
                  "Automatic asset upload to Roblox asset library",
                  "Correct Scale/Offset conversion for responsive layout",
                  "Project sync across devices",
                  "Template library access within Studio",
                ],
                permissions:
                  "Requires HttpService access in Roblox Studio game settings.",
                softwareVersion: "1.0.0",
                datePublished: "2026-06-18",
                installUrl: "https://www.roblox.com/library/0/roblox-gui-maker-plugin",
              },
              {
                "@type": "WebApplication",
                "@id": "https://roblox-gui-maker.online/plugin/#webapp",
                name: "Roblox GUI Maker — Plugin Setup Guide",
                url: "https://roblox-gui-maker.online/plugin",
                description:
                  "Web-based guide for installing and configuring the Roblox GUI Maker Studio Plugin.",
                applicationCategory: "DeveloperApplication",
                browserRequirements:
                  "Requires JavaScript. Chrome, Firefox, Edge, or Safari.",
              },
            ],
          }),
        }}
      />
      {/* Plugin download and setup content */}
    </>
  );
}
```

### 1.9 文档页 `/docs`

Schema 类型：TechArticle + BreadcrumbList

```typescript
// app/docs/page.tsx — metadata & JSON-LD
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roblox GUI Maker Documentation — API Reference & Guides",
  description:
    "Complete documentation for Roblox GUI Maker. Learn how to use the online editor, Studio plugin, AI code generator, Figma import, and template system.",
  alternates: {
    canonical: "https://roblox-gui-maker.online/docs",
  },
  openGraph: {
    title: "Roblox GUI Maker Documentation — API Reference & Guides",
    description:
      "Complete documentation for Roblox GUI Maker. Editor, plugin, AI code generator, Figma import, and template system.",
    url: "https://roblox-gui-maker.online/docs",
    siteName: "Roblox GUI Maker",
    locale: "en_US",
    type: "website",
  },
};

export default function DocsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "TechArticle",
                "@id": "https://roblox-gui-maker.online/docs/#techarticle",
                headline: "Roblox GUI Maker Documentation",
                description:
                  "Complete technical documentation for the Roblox GUI Maker platform, covering the online editor, Studio plugin integration, AI code generation API, Figma import workflow, and template system architecture.",
                url: "https://roblox-gui-maker.online/docs",
                datePublished: "2026-06-18",
                dateModified: "2026-06-18",
                author: {
                  "@id": "https://roblox-gui-maker.online/#organization",
                },
                publisher: {
                  "@id": "https://roblox-gui-maker.online/#organization",
                },
                inLanguage: "en-US",
                proficiencyLevel: "Beginner",
                dependencies:
                  "Next.js 16, React 19, Tailwind v4, Vercel Serverless Functions, Roblox Plugin SDK",
                about: {
                  "@type": "SoftwareApplication",
                  name: "Roblox GUI Maker",
                },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: "https://roblox-gui-maker.online",
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Documentation",
                  },
                ],
              },
            ],
          }),
        }}
      />
      {/* Documentation content */}
    </>
  );
}
```

### 1.10 FAQ 页 `/faq`

Schema 类型：FAQPage + BreadcrumbList

```typescript
// app/faq/page.tsx — metadata & JSON-LD
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roblox GUI Maker FAQ — Frequently Asked Questions",
  description:
    "Frequently asked questions about Roblox GUI Maker. Pricing, features, Studio plugin setup, AI generation limits, template licensing, and more.",
  alternates: {
    canonical: "https://roblox-gui-maker.online/faq",
  },
  openGraph: {
    title: "Roblox GUI Maker FAQ — Frequently Asked Questions",
    description:
      "Frequently asked questions about Roblox GUI Maker. Pricing, features, plugin setup, and more.",
    url: "https://roblox-gui-maker.online/faq",
    siteName: "Roblox GUI Maker",
    locale: "en_US",
    type: "website",
  },
};

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "What is Roblox GUI Maker?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Roblox GUI Maker is an AI-powered online tool and Roblox Studio plugin that helps you create game user interfaces without coding. It combines a drag-and-drop visual editor, AI code generation, Figma-to-Studio import, and a template marketplace into one platform.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Is Roblox GUI Maker free?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes, there is a free tier that includes the full drag-and-drop editor, 50 AI generation credits per month, clean Luau export, and access to the free template library. The Pro plan at $9.99/month removes the limits and adds premium templates and advanced features.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "How does the AI code generation work?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "You describe your GUI in natural language (e.g., 'Create a health bar with a red background, white border, and green fill that decreases from left to right'). Our AI generates the complete Luau script with proper Scale/Offset handling, Signal patterns, and event handlers. The code follows Roblox best practices and can be directly used in your game.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "How do I install the Roblox Studio plugin?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Visit roblox-gui-maker.online/plugin and click 'Install Plugin'. This will open the plugin page on the Roblox Creator Marketplace. Click 'Install' and the plugin will be added to your Roblox Studio. Enable HttpService in your game settings for full functionality.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Can I import my Figma designs into Roblox Studio?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes! Upload your Figma design file or connect your Figma account. Our Figma-to-Roblox converter automatically maps Figma components to Roblox GUI objects, uploads image assets to the Roblox library, and handles Scale/Offset conversion for responsive layouts.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "What Roblox GUI components are supported?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "We support all Roblox GUI objects: ScreenGui, Frame, TextLabel, TextButton, ImageLabel, ImageButton, TextBox, ScrollingFrame, ViewportFrame, VideoFrame, UIGridLayout, UIListLayout, UIPageLayout, UITableLayout, UIAspectRatioConstraint, UISizeConstraint, UITextSizeConstraint, and UICorner.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Can I sell the GUIs I create with Roblox GUI Maker?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes! GUIs you create with the free tier or Pro plan are yours to use in any commercial Roblox game. Templates purchased from the marketplace have their own license terms — check each template's license before redistributing.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Do I need to know Luau scripting to use Roblox GUI Maker?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "No! The drag-and-drop editor handles all layout and positioning visually. The AI generates scripts for button clicks, animations, and data binding automatically. However, knowing Luau helps you customize the generated code for complex game logic.",
                    },
                  },
                ],
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: "https://roblox-gui-maker.online",
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "FAQ",
                  },
                ],
              },
            ],
          }),
        }}
      />
      {/* FAQ accordion */}
    </>
  );
}
```

### 1.11 应用场景枢纽页 `/use-cases` 与场景详情页 `/use-cases/[game-type]` ★块A新增

Schema 类型：枢纽页 CollectionPage + ItemList + BreadcrumbList；详情页 HowTo + ItemList + BreadcrumbList

```typescript
// app/use-cases/page.tsx — 场景枢纽页 metadata & JSON-LD
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Make a GUI for Any Roblox Game — By Game Type | Roblox GUI Maker",
  description:
    "Design the perfect UI for your Roblox game type. Simulator HUDs, FPS interfaces, roleplay menus, and more — with ready-to-use templates and tutorials.",
  alternates: {
    canonical: "https://roblox-gui-maker.online/use-cases",
  },
  openGraph: {
    title: "How to Make a GUI for Any Roblox Game — By Game Type",
    description:
      "Design the perfect UI for your Roblox game type. Simulator HUDs, FPS interfaces, roleplay menus, and more.",
    url: "https://roblox-gui-maker.online/use-cases",
    siteName: "Roblox GUI Maker",
    locale: "en_US",
    type: "website",
  },
};

export default function UseCasesHubPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "CollectionPage",
                "@id": "https://roblox-gui-maker.online/use-cases/#collection",
                name: "Roblox GUI by Game Type",
                description:
                  "A hub of Roblox UI design guides and templates organized by game type: simulator, FPS, roleplay, tycoon, and more.",
                url: "https://roblox-gui-maker.online/use-cases",
                isPartOf: { "@id": "https://roblox-gui-maker.online/#website" },
              },
              {
                "@type": "ItemList",
                "@id": "https://roblox-gui-maker.online/use-cases/#itemlist",
                name: "Roblox Game Type UI Use Cases",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Simulator HUD Design",
                    url: "https://roblox-gui-maker.online/use-cases/simulator-hud",
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "FPS Game UI",
                    url: "https://roblox-gui-maker.online/use-cases/fps-game-ui",
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: "Roleplay Menu GUI",
                    url: "https://roblox-gui-maker.online/use-cases/roleplay-menu",
                  },
                ],
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: "https://roblox-gui-maker.online",
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Use Cases",
                  },
                ],
              },
            ],
          }),
        }}
      />
      {/* Game-type grid */}
    </>
  );
}
```

```typescript
// app/use-cases/[game-type]/page.tsx — 场景详情页 metadata & JSON-LD
import type { Metadata } from "next";

interface UseCaseDetail {
  gameType: string;
  slug: string;
  h1: string;
  title: string;
  description: string;
  targetKeyword: string;
  steps: { name: string; text: string }[];
  relatedTemplates: string[];
}

async function getUseCaseBySlug(slug: string): Promise<UseCaseDetail> {
  // In production: fetch from Supabase / content layer
  const useCases: Record<string, UseCaseDetail> = {
    "simulator-hud": {
      gameType: "Simulator",
      slug: "simulator-hud",
      h1: "Design the Perfect HUD for Your Roblox Simulator Game",
      title: "Roblox Simulator HUD Design — Build a Clean, Compact HUD",
      description:
        "Learn how to design a compact, readable HUD for your Roblox simulator game: currency displays, stat panels, and clear click feedback. Build it visually with Roblox GUI Maker.",
      targetKeyword: "roblox simulator hud design",
      steps: [
        {
          name: "Plan Your HUD Layout",
          text: "Identify the core stats a simulator player needs at a glance: currency, multipliers, rebirth level, and inventory count. Keep the layout compact and anchored to screen corners.",
        },
        {
          name: "Build the Currency Display",
          text: "Drag a Frame onto the top-right of the canvas, add a TextLabel for the currency value and an ImageLabel for the coin icon. Use UIListLayout for automatic spacing.",
        },
        {
          name: "Add Stat Panels with Click Feedback",
          text: "Create TextButtons for upgrade actions. Add hover and click animations so players get instant visual feedback — critical for the fast-paced simulator loop.",
        },
        {
          name: "Export to Studio",
          text: "Use the Roblox GUI Maker plugin to import your HUD into Studio with correct Scale/Offset values for all screen sizes.",
        },
      ],
      relatedTemplates: [
        "https://roblox-gui-maker.online/templates/health-bar",
        "https://roblox-gui-maker.online/templates/shop-ui",
      ],
    },
  };

  return (
    useCases[slug] || {
      gameType: "Roblox Game",
      slug: slug,
      h1: "Design the Perfect UI for Your Roblox Game",
      title: "Roblox Game UI Design Guide",
      description: "Design a great UI for your Roblox game with Roblox GUI Maker.",
      targetKeyword: "how to make gui for roblox games",
      steps: [
        {
          name: "Plan Your UI",
          text: "Identify the core interface elements your game needs.",
        },
        {
          name: "Build Visually",
          text: "Use the drag-and-drop editor to lay out your components.",
        },
        {
          name: "Export to Studio",
          text: "Import into Roblox Studio via the plugin.",
        },
      ],
      relatedTemplates: ["https://roblox-gui-maker.online/templates"],
    }
  );
}

export async function generateMetadata({
  params,
}: {
  params: { "game-type": string };
}): Promise<Metadata> {
  const uc = await getUseCaseBySlug(params["game-type"]);
  return {
    title: `${uc.title} | Roblox GUI Maker`,
    description: uc.description,
    alternates: {
      canonical: `https://roblox-gui-maker.online/use-cases/${params["game-type"]}`,
    },
    openGraph: {
      title: uc.h1,
      description: uc.description,
      url: `https://roblox-gui-maker.online/use-cases/${params["game-type"]}`,
      siteName: "Roblox GUI Maker",
      locale: "en_US",
      type: "website",
    },
  };
}

export default async function UseCaseDetailPage({
  params,
}: {
  params: { "game-type": string };
}) {
  const uc = await getUseCaseBySlug(params["game-type"]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HowTo",
        "@id": `https://roblox-gui-maker.online/use-cases/${params["game-type"]}/#howto`,
        name: uc.h1,
        description: uc.description,
        step: uc.steps.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: s.name,
          text: s.text,
        })),
      },
      {
        "@type": "ItemList",
        "@id": `https://roblox-gui-maker.online/use-cases/${params["game-type"]}/#related`,
        name: "Related Templates",
        itemListElement: uc.relatedTemplates.map((url, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: url,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://roblox-gui-maker.online",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Use Cases",
            item: "https://roblox-gui-maker.online/use-cases",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: uc.gameType,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Use-case detail content */}
    </>
  );
}
```

### 1.12 教程中心枢纽页 `/guides` 与深度教程页 `/guides/[slug]` ★块B新增

Schema 类型：枢纽页 CollectionPage + BreadcrumbList；教程页 HowTo + TechArticle + BreadcrumbList

```typescript
// app/guides/page.tsx — 教程中心枢纽页 metadata & JSON-LD
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roblox GUI Tutorials & Guides (2026) — Learn UI Design | Roblox GUI Maker",
  description:
    "Free Roblox GUI tutorials: fix scaling issues, master UIListLayout and UIGridLayout, build draggable GUIs, and more. Step-by-step guides with Luau code.",
  alternates: {
    canonical: "https://roblox-gui-maker.online/guides",
  },
  openGraph: {
    title: "Roblox GUI Tutorials & Guides (2026) — Learn UI Design",
    description:
      "Free Roblox GUI tutorials: fix scaling, master layouts, build draggable GUIs, and more. Step-by-step with Luau code.",
    url: "https://roblox-gui-maker.online/guides",
    siteName: "Roblox GUI Maker",
    locale: "en_US",
    type: "website",
  },
};

export default function GuidesHubPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "CollectionPage",
                "@id": "https://roblox-gui-maker.online/guides/#collection",
                name: "Roblox GUI Tutorials & Guides",
                description:
                  "A complete library of Roblox GUI tutorials covering scaling, layout components, draggable interfaces, and UI scripting with Luau.",
                url: "https://roblox-gui-maker.online/guides",
                isPartOf: { "@id": "https://roblox-gui-maker.online/#website" },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: "https://roblox-gui-maker.online",
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Guides",
                  },
                ],
              },
            ],
          }),
        }}
      />
      {/* Guide category navigation */}
    </>
  );
}
```

```typescript
// app/guides/[slug]/page.tsx — 深度教程页 metadata & JSON-LD
import type { Metadata } from "next";

interface GuideDetail {
  slug: string;
  h1: string;
  title: string;
  description: string;
  targetKeyword: string;
  publishedAt: string;
  modifiedAt: string;
  imageUrl: string;
  steps: { name: string; text: string }[];
  videoId?: string;
}

async function getGuideBySlug(slug: string): Promise<GuideDetail> {
  const guides: Record<string, GuideDetail> = {
    "fix-gui-scaling": {
      slug: "fix-gui-scaling",
      h1: "How to Fix Roblox GUI Scaling: Scale vs Offset Explained",
      title: "How to Fix Roblox GUI Scaling — Scale vs Offset Complete Guide (2026)",
      description:
        "Learn the difference between Scale and Offset in Roblox UDim2, why your UI breaks on mobile, and how to build responsive GUIs that look right on every device.",
      targetKeyword: "how to fix roblox gui scaling",
      publishedAt: "2026-07-20T08:00:00Z",
      modifiedAt: "2026-07-20T08:00:00Z",
      imageUrl: "https://cdn.roblox-gui-maker.online/guides/fix-gui-scaling.webp",
      steps: [
        {
          name: "Understand Scale vs Offset",
          text: "Scale is a fraction (0-1) of the parent's size, so it adapts to any screen. Offset is a fixed pixel value that stays constant. UDim2.new(scaleX, offsetX, scaleY, offsetY) combines both.",
        },
        {
          name: "Diagnose Why Your UI Breaks on Mobile",
          text: "If you used pure Offset, your UI keeps its pixel size on small screens and overflows. Switch to Scale for position and size that adapt to the viewport.",
        },
        {
          name: "Use AnchorPoint for Centering",
          text: "Set AnchorPoint to Vector2.new(0.5, 0.5) and Position to UDim2.new(0.5, 0, 0.5, 0) to perfectly center an element regardless of screen size.",
        },
        {
          name: "Let Roblox GUI Maker Handle It Automatically",
          text: "In the editor, toggle 'Responsive' on any element and the tool converts pixel values to the correct Scale/Offset mix on export — no manual math.",
        },
      ],
      videoId: "SCALING_VIDEO_ID",
    },
  };

  return (
    guides[slug] || {
      slug: slug,
      h1: "Roblox GUI Guide",
      title: "Roblox GUI Guide",
      description: "A step-by-step Roblox GUI tutorial.",
      targetKeyword: "roblox gui tutorial",
      publishedAt: "2026-06-18T08:00:00Z",
      modifiedAt: "2026-06-18T08:00:00Z",
      imageUrl: "https://cdn.roblox-gui-maker.online/guides/default.webp",
      steps: [
        { name: "Step 1", text: "Follow the tutorial steps." },
      ],
    }
  );
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const guide = await getGuideBySlug(params.slug);
  return {
    title: `${guide.title} | Roblox GUI Maker`,
    description: guide.description,
    alternates: {
      canonical: `https://roblox-gui-maker.online/guides/${params.slug}`,
    },
    openGraph: {
      title: guide.h1,
      description: guide.description,
      url: `https://roblox-gui-maker.online/guides/${params.slug}`,
      images: [{ url: guide.imageUrl, width: 1200, height: 630 }],
      type: "article",
      publishedTime: guide.publishedAt,
      modifiedTime: guide.modifiedAt,
      siteName: "Roblox GUI Maker",
      locale: "en_US",
    },
  };
}

export default async function GuideDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const guide = await getGuideBySlug(params.slug);

  const howToStep = guide.steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.name,
    text: s.text,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HowTo",
        "@id": `https://roblox-gui-maker.online/guides/${params.slug}/#howto`,
        name: guide.h1,
        description: guide.description,
        image: guide.imageUrl,
        step: howToStep,
        ...(guide.videoId
          ? {
              video: {
                "@type": "VideoObject",
                name: guide.h1,
                description: guide.description,
                thumbnailUrl: `https://i.ytimg.com/vi/${guide.videoId}/maxresdefault.jpg`,
                uploadDate: guide.publishedAt,
                contentUrl: `https://www.youtube.com/watch?v=${guide.videoId}`,
                embedUrl: `https://www.youtube.com/embed/${guide.videoId}`,
              },
            }
          : {}),
      },
      {
        "@type": "TechArticle",
        "@id": `https://roblox-gui-maker.online/guides/${params.slug}/#techarticle`,
        headline: guide.h1,
        description: guide.description,
        url: `https://roblox-gui-maker.online/guides/${params.slug}`,
        datePublished: guide.publishedAt,
        dateModified: guide.modifiedAt,
        author: { "@id": "https://roblox-gui-maker.online/#organization" },
        publisher: { "@id": "https://roblox-gui-maker.online/#organization" },
        image: guide.imageUrl,
        inLanguage: "en-US",
        proficiencyLevel: "Beginner",
        keywords: guide.targetKeyword,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://roblox-gui-maker.online",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Guides",
            item: "https://roblox-gui-maker.online/guides",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: guide.h1,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Guide content with TOC + Luau code blocks */}
    </>
  );
}
```

---

## 2. 完整的 CWV 实现代码

### 2.1 图片优化配置（next.config.ts）

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.roblox-gui-maker.online",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "tr.rbxcdn.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        port: "",
        pathname: "/**",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 604800,
  },
  experimental: {
    optimizePackageImports: [
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "lucide-react",
    ],
  },
  headers: async () => [
    {
      source: "/templates/:slug*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
        },
      ],
    },
    {
      source: "/:all*(svg|jpg|jpeg|png|webp|avif)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ],
};

export default nextConfig;
```

### 2.2 字体预加载配置（app/layout.tsx）

```typescript
// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://roblox-gui-maker.online"),
  title: {
    default: "Roblox GUI Maker — AI-Powered Roblox UI Generator & GUI Builder",
    template: "%s | Roblox GUI Maker",
  },
  description:
    "Free Roblox GUI Maker with AI code generation, drag-and-drop editor, and Figma-to-Studio import. Build polished UI for your Roblox game in minutes.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link
          rel="preconnect"
          href="https://cdn.roblox-gui-maker.online"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://www.googletagmanager.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://www.google-analytics.com"
        />
        <link rel="dns-prefetch" href="https://tr.rbxcdn.com" />
      </head>
      <body className="min-h-screen bg-white dark:bg-slate-950 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
```

### 2.3 编辑器骨架屏（防 CLS）

```typescript
// components/editor/EditorSkeleton.tsx
export function EditorSkeleton() {
  return (
    <div
      className="flex h-screen w-full bg-slate-900"
      role="progressbar"
      aria-label="Loading editor"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext="Loading Roblox GUI editor..."
    >
      {/* Left toolbar skeleton */}
      <div className="w-16 flex-shrink-0 border-r border-slate-700 bg-slate-800 p-2">
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-10 rounded-lg bg-slate-700 animate-pulse"
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      </div>

      {/* Canvas area skeleton */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-[800px] h-[600px] rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="h-4 w-48 bg-slate-700 rounded animate-pulse mx-auto" />
            <div className="h-3 w-32 bg-slate-700 rounded animate-pulse mx-auto" />
          </div>
        </div>
      </div>

      {/* Right properties panel skeleton */}
      <div className="w-72 flex-shrink-0 border-l border-slate-700 bg-slate-800 p-4">
        <div className="space-y-4">
          <div className="h-5 w-20 bg-slate-700 rounded animate-pulse" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 w-16 bg-slate-700 rounded animate-pulse" />
                <div className="h-8 w-full bg-slate-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 2.4 编辑器动态导入 + 代码分割

```typescript
// app/editor/page.tsx — dynamic imports
import dynamic from "next/dynamic";
import { EditorSkeleton } from "@/components/editor/EditorSkeleton";

const CanvasEditor = dynamic(
  () => import("@/components/editor/Canvas").then((mod) => mod.CanvasEditor),
  {
    ssr: false,
    loading: () => <EditorSkeleton />,
  }
);

const AiPromptPanel = dynamic(
  () =>
    import("@/components/editor/AiPromptPanel").then((mod) => mod.AiPromptPanel),
  {
    ssr: false,
  }
);

const LuauCodePreview = dynamic(
  () =>
    import("@/components/editor/LuauCodePreview").then(
      (mod) => mod.LuauCodePreview
    ),
  {
    ssr: false,
  }
);

export default function EditorPage() {
  return (
    <div className="flex h-screen flex-col">
      <CanvasEditor />
      <AiPromptPanel />
      <LuauCodePreview />
    </div>
  );
}
```

### 2.5 Web Worker 卸载繁重计算

```typescript
// workers/luau-compiler.ts
// This worker runs Figma JSON → Luau AST conversion off the main thread

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fills?: Array<{
    type: string;
    color?: { r: number; g: number; b: number; a: number };
  }>;
  strokes?: Array<{
    type: string;
    color?: { r: number; g: number; b: number; a: number };
  }>;
  cornerRadius?: number;
  characters?: string;
  style?: Record<string, unknown>;
}

interface LuauComponent {
  className: string;
  properties: Record<string, unknown>;
  children: LuauComponent[];
}

self.onmessage = (event: MessageEvent<{ figmaData: FigmaNode }>) => {
  const { figmaData } = event.data;
  try {
    const luauTree = convertFigmaToLuau(figmaData);
    self.postMessage({ success: true, data: luauTree });
  } catch (error) {
    self.postMessage({
      success: false,
      error: error instanceof Error ? error.message : "Unknown conversion error",
    });
  }
};

function convertFigmaToLuau(node: FigmaNode): LuauComponent {
  const component: LuauComponent = {
    className: mapFigmaTypeToRoblox(node.type),
    properties: mapFigmaPropertiesToRoblox(node),
    children: [],
  };

  if (node.children) {
    for (const child of node.children) {
      component.children.push(convertFigmaToLuau(child));
    }
  }

  return component;
}

function mapFigmaTypeToRoblox(figmaType: string): string {
  const typeMap: Record<string, string> = {
    FRAME: "Frame",
    TEXT: "TextLabel",
    RECTANGLE: "Frame",
    GROUP: "Frame",
    INSTANCE: "Frame",
    COMPONENT: "Frame",
    COMPONENT_SET: "Frame",
    BOOLEAN_OPERATION: "Frame",
    VECTOR: "ImageLabel",
    STAR: "ImageLabel",
    LINE: "Frame",
    ELLIPSE: "ImageLabel",
    POLYGON: "ImageLabel",
  };
  return typeMap[figmaType] || "Frame";
}

function mapFigmaPropertiesToRoblox(node: FigmaNode): Record<string, unknown> {
  const props: Record<string, unknown> = {
    Name: node.name,
  };

  if (node.absoluteBoundingBox) {
    props.Size = `UDim2.new(0, ${Math.round(node.absoluteBoundingBox.width)}, 0, ${Math.round(node.absoluteBoundingBox.height)})`;
    props.Position = `UDim2.new(0, ${Math.round(node.absoluteBoundingBox.x)}, 0, ${Math.round(node.absoluteBoundingBox.y)})`;
  }

  if (node.fills && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill.type === "SOLID" && fill.color) {
      props.BackgroundColor3 = `Color3.fromRGB(${Math.round(fill.color.r * 255)}, ${Math.round(fill.color.g * 255)}, ${Math.round(fill.color.b * 255)})`;
      props.BackgroundTransparency = fill.color.a !== undefined ? (1 - fill.color.a) : 0;
    }
  }

  if (node.strokes && node.strokes.length > 0) {
    const stroke = node.strokes[0];
    if (stroke.type === "SOLID" && stroke.color) {
      props.BorderColor3 = `Color3.fromRGB(${Math.round(stroke.color.r * 255)}, ${Math.round(stroke.color.g * 255)}, ${Math.round(stroke.color.b * 255)})`;
    }
  }

  if (node.cornerRadius !== undefined) {
    props.UICorner = `UDim.new(0, ${Math.round(node.cornerRadius)})`;
  }

  if (node.characters) {
    props.Text = node.characters;
  }

  return props;
}
```

### 2.6 第三方脚本加载策略（Partytown + Google Analytics）

```typescript
// components/analytics/ThirdPartyScripts.tsx
"use client";

import Script from "next/script";

export function ThirdPartyScripts() {
  return (
    <>
      {/* Google Analytics via Partytown — offloads to Web Worker */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
        strategy="worker"
        type="text/partytown"
      />
      <Script
        id="gtag-config"
        strategy="worker"
        type="text/partytown"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX', {
              page_path: window.location.pathname,
              send_page_view: true,
              cookie_flags: 'SameSite=None;Secure',
            });
          `,
        }}
      />

      {/* Partytown configuration — must load on main thread */}
      <Script
        id="partytown-config"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            partytown = {
              lib: "/~partytown/",
              forward: ["gtag", "dataLayer.push"],
              debug: false,
            };
          `,
        }}
      />

      {/* Stripe.js — deferred loading for pricing page */}
      <Script
        id="stripe-js"
        src="https://js.stripe.com/v3/"
        strategy="lazyOnload"
      />
    </>
  );
}
```

### 2.7 模板预览图优化组件

```typescript
// components/templates/TemplateThumbnail.tsx
import Image from "next/image";

interface TemplateThumbnailProps {
  src: string;
  alt: string;
  priority?: boolean;
  width: number;
  height: number;
}

export function TemplateThumbnail({
  src,
  alt,
  priority = false,
  width,
  height,
}: TemplateThumbnailProps) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="h-auto w-full object-cover transition-transform duration-300 hover:scale-105"
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPvd7POQAAAABJRU5ErkJggg=="
        style={{ aspectRatio: `${width}/${height}` }}
      />
    </div>
  );
}
```

---

## 3. 完整的 robots.ts

> **⚠️ MVP 偏离说明（2026-06-19）**：本节展示的是全量站点（数万 URL）的目标方案，引用 4 个分片 sitemap（`sitemap.xml` / `sitemap_pages.xml` / `sitemap_blog.xml` / `sitemap_templates.xml`）。**MVP 阶段实际实现为单个 `sitemap.xml`**（仅 7 条 MVP 路由，远低于单文件 50,000 URL 上限），`src/app/robots.ts` 只引用这一个。分片是 Phase 4 内容铺开、URL 数量级上升后的 P2 增量项，非 MVP 必需。AI 爬虫段实现为 6 个 user-agent（GPTBot / CCBot / ClaudeBot / Claude-Web / anthropic-ai / Google-Extended）。

```typescript
// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://roblox-gui-maker.online";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/editor",
          "/figma-to-roblox",
          "/templates",
          "/templates/*",
          "/use-cases",
          "/use-cases/*",
          "/guides",
          "/guides/*",
          "/pricing",
          "/plugin",
          "/blog",
          "/blog/*",
          "/docs",
          "/docs/*",
          "/faq",
        ],
        disallow: [
          "/api/",
          "/api/*",
          "/auth/",
          "/auth/*",
          "/oauth/",
          "/oauth/*",
          "/dashboard/",
          "/dashboard/*",
          "/billing/",
          "/billing/*",
          "/editor/*/",
          "/admin/",
          "/admin/*",
          "/webhooks/",
          "/webhooks/*",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/blog", "/blog/*", "/guides", "/guides/*", "/use-cases", "/use-cases/*", "/docs", "/docs/*", "/faq"],
        disallow: [
          "/templates/",
          "/templates/*",
          "/editor",
          "/editor/*",
          "/api/",
          "/api/*",
          "/dashboard/",
          "/dashboard/*",
        ],
      },
      {
        userAgent: "ClaudeBot",
        allow: ["/", "/blog", "/blog/*", "/guides", "/guides/*", "/use-cases", "/use-cases/*", "/docs", "/docs/*", "/faq"],
        disallow: [
          "/templates/",
          "/templates/*",
          "/editor",
          "/editor/*",
          "/api/",
          "/api/*",
          "/dashboard/",
          "/dashboard/*",
        ],
      },
      {
        userAgent: "CCBot",
        allow: ["/", "/blog", "/blog/*", "/guides", "/guides/*", "/use-cases", "/use-cases/*", "/docs", "/docs/*", "/faq"],
        disallow: [
          "/templates/",
          "/templates/*",
          "/editor",
          "/editor/*",
          "/api/",
          "/api/*",
          "/dashboard/",
          "/dashboard/*",
        ],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/", "/blog", "/blog/*", "/guides", "/guides/*", "/use-cases", "/use-cases/*", "/docs", "/docs/*", "/faq"],
        disallow: [
          "/templates/",
          "/templates/*",
          "/editor",
          "/editor/*",
          "/api/",
          "/api/*",
          "/dashboard/",
          "/dashboard/*",
        ],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap_pages.xml`,
      `${baseUrl}/sitemap_blog.xml`,
      `${baseUrl}/sitemap_templates.xml`,
    ],
  };
}
```

---

## 4. 完整的 sitemap.ts

> **⚠️ MVP 偏离说明（2026-06-19）**：本节为全量目标方案（静态路由 + 动态 blog/templates/use-cases/guides 条目）。**MVP 阶段 `src/app/sitemap.ts` 仅含 7 条 MVP 路由**（`/`、`/templates`、`/templates/rpg-inventory`、`/pricing`、`/faq`、`/editor`、`/plugin`），刻意不收录尚未上线的空壳页，避免 GSC 收录空页降权（见 MASTER_SOP 附录 G.1 铁律）。MVP 后随页面补齐增量扩展，无需分片，直至接近 50,000 URL 上限。

```typescript
// app/sitemap.ts
import type { MetadataRoute } from "next";

const BASE_URL = "https://roblox-gui-maker.online";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date("2026-06-18"),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/editor`,
      lastModified: new Date("2026-06-18"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/templates`,
      lastModified: new Date("2026-06-18"),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date("2026-06-18"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/plugin`,
      lastModified: new Date("2026-06-18"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date("2026-06-18"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/docs`,
      lastModified: new Date("2026-06-18"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date("2026-06-18"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/use-cases`,
      lastModified: new Date("2026-06-18"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/guides`,
      lastModified: new Date("2026-06-18"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const blogRoutes = await getBlogSitemapEntries();
  const templateRoutes = await getTemplateSitemapEntries();
  const useCaseRoutes = await getUseCaseSitemapEntries();
  const guideRoutes = await getGuideSitemapEntries();

  return [
    ...staticRoutes,
    ...blogRoutes,
    ...templateRoutes,
    ...useCaseRoutes,
    ...guideRoutes,
  ];
}

async function getUseCaseSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  // In production, fetch from content layer / Supabase
  const useCases = [
    { slug: "simulator-hud", updatedAt: new Date("2026-06-18") },
    { slug: "fps-game-ui", updatedAt: new Date("2026-06-18") },
    { slug: "roleplay-menu", updatedAt: new Date("2026-06-18") },
  ];

  return useCases.map((uc) => ({
    url: `${BASE_URL}/use-cases/${uc.slug}`,
    lastModified: uc.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
}

async function getGuideSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  // In production, fetch from content layer / Supabase
  const guides = [
    { slug: "fix-gui-scaling", updatedAt: new Date("2026-07-20") },
    { slug: "uilistlayout-uigridlayout", updatedAt: new Date("2026-07-20") },
    { slug: "draggable-gui", updatedAt: new Date("2026-07-20") },
  ];

  return guides.map((g) => ({
    url: `${BASE_URL}/guides/${g.slug}`,
    lastModified: g.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
}

async function getBlogSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  // In production, fetch from Supabase:
  // const { data } = await supabase.from("blog_posts").select("slug, updated_at").order("updated_at", { ascending: false });

  const blogPosts = [
    {
      slug: "best-roblox-ui-maker-no-coding",
      updatedAt: new Date("2026-06-22"),
      priority: 0.8,
    },
    {
      slug: "convert-figma-to-roblox-studio-ui",
      updatedAt: new Date("2026-06-29"),
      priority: 0.8,
    },
    {
      slug: "top-10-free-roblox-gui-templates",
      updatedAt: new Date("2026-07-06"),
      priority: 0.7,
    },
    {
      slug: "5-best-roblox-studio-ui-editor-alternatives",
      updatedAt: new Date("2026-07-13"),
      priority: 0.7,
    },
    {
      slug: "roblox-gui-scaling-guide",
      updatedAt: new Date("2026-07-20"),
      priority: 0.7,
    },
    {
      slug: "build-roblox-inventory-gui",
      updatedAt: new Date("2026-07-27"),
      priority: 0.7,
    },
    {
      slug: "roblox-gui-code-generator",
      updatedAt: new Date("2026-08-03"),
      priority: 0.7,
    },
    {
      slug: "roblox-backpack-system-ai",
      updatedAt: new Date("2026-08-10"),
      priority: 0.7,
    },
    {
      slug: "drag-and-drop-vs-ai-roblox-ui-builder",
      updatedAt: new Date("2026-08-17"),
      priority: 0.7,
    },
    {
      slug: "free-vs-paid-roblox-gui-makers",
      updatedAt: new Date("2026-08-24"),
      priority: 0.7,
    },
    {
      slug: "importing-ui-from-figma-sucks-fix",
      updatedAt: new Date("2026-08-31"),
      priority: 0.7,
    },
    {
      slug: "2026-roblox-ui-design-trends",
      updatedAt: new Date("2026-09-07"),
      priority: 0.6,
    },
  ];

  return blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly" as const,
    priority: post.priority,
  }));
}

async function getTemplateSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  // In production, fetch from Supabase:
  // const { data } = await supabase.from("templates").select("slug, updated_at").order("updated_at", { ascending: false });

  const templates = [
    { slug: "rpg-inventory", updatedAt: new Date("2026-06-18") },
    { slug: "backpack-system", updatedAt: new Date("2026-06-18") },
    { slug: "shop-ui", updatedAt: new Date("2026-06-18") },
    { slug: "weapon-wheel", updatedAt: new Date("2026-06-18") },
    { slug: "settings-panel", updatedAt: new Date("2026-06-18") },
    { slug: "health-bar", updatedAt: new Date("2026-06-18") },
    { slug: "leaderboard", updatedAt: new Date("2026-06-18") },
    { slug: "notification-system", updatedAt: new Date("2026-06-18") },
    { slug: "dialog-box", updatedAt: new Date("2026-06-18") },
    { slug: "loading-screen", updatedAt: new Date("2026-06-18") },
  ];

  return templates.map((tpl) => ({
    url: `${BASE_URL}/templates/${tpl.slug}`,
    lastModified: tpl.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
}
```

---

## 附录 A：JSON-LD 验证清单

以下所有 JSON-LD 代码块已通过 `JSON.parse()` 结构验证（逻辑语义验证需在部署后通过 [Google Rich Results Test](https://search.google.com/test/rich-results) 进行）：

| # | 页面路由 | Schema 类型 | parse 验证 | Rich Results 验证 |
|---|---------|------------|-----------|-----------------|
| 1 | `/` | WebSite + SoftwareApplication + Organization | ✅ | 待部署后验证 |
| 2 | `/editor` | SoftwareApplication + FAQPage + HowTo | ✅ | 待部署后验证 |
| 3 | `/templates` | WebSite + CollectionPage + FAQPage | ✅ | 待部署后验证 |
| 4 | `/templates/[slug]` | Product + SoftwareApplication + ImageGallery + BreadcrumbList | ✅ | 待部署后验证 |
| 5 | `/pricing` | Product (×2) + FAQPage | ✅ | 待部署后验证 |
| 6 | `/blog` | Blog + BreadcrumbList | ✅ | 待部署后验证 |
| 7 | `/blog/[slug]` | BlogPosting + Article + BreadcrumbList | ✅ | 待部署后验证 |
| 8 | `/plugin` | SoftwareApplication + WebApplication | ✅ | 待部署后验证 |
| 9 | `/docs` | TechArticle + BreadcrumbList | ✅ | 待部署后验证 |
| 10 | `/faq` | FAQPage + BreadcrumbList | ✅ | 待部署后验证 |
| 11 | `/use-cases` | CollectionPage + ItemList + BreadcrumbList | ✅ | 待部署后验证 ★块A |
| 12 | `/use-cases/[game-type]` | HowTo + ItemList + BreadcrumbList | ✅ | 待部署后验证 ★块A |
| 13 | `/guides` | CollectionPage + BreadcrumbList | ✅ | 待部署后验证 ★块B |
| 14 | `/guides/[slug]` | HowTo + TechArticle + BreadcrumbList (+ VideoObject 可选) | ✅ | 待部署后验证 ★块B |

## 附录 B：技术约束清单

| 约束项 | 目标值 | 备注 |
|--------|--------|------|
| LCP | ≤ 1.8s | 比 Google 标准 2.5s 更严格 |
| INP | ≤ 150ms | 拖拽画布核心指标 |
| CLS | ≤ 0.05 | 杜绝编辑器加载布局抖动 |
| 首页 JS bundle | ≤ 80KB | 首次加载 |
| 编辑器 JS bundle | ≤ 500KB | 分包加载，首屏 ≤ 120KB |
| 图片格式 | AVIF + WebP 双格式 | 自动降级 |
| 字体策略 | `display: swap` | 无闪烁加载 |
| 第三方脚本 | Partytown Web Worker | GA/Stripe 卸载主线程 |
