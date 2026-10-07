# Site Integration（Astro / Next.js 单源生成）

> Load on request when the user asks for deployment-ready code.

**Principle**: render visible HTML and JSON-LD from ONE data source — eliminating the most common structured-data violation (schema/page drift). All answer content must exist in first-load HTML (SSR/SSG), never JS-injected on click.

## Shared data source

```ts
// data/faqs.ts — the skill's Markdown output converts directly into this structure
export const faqs = [
  {
    q: "Can I cancel anytime?",
    capsule:
      "Yes — cancel in two clicks from Settings → Billing, no questions asked. Your plan stays active until the end of the paid period.",
    detail:
      "Annual plans are prorated back to your card. Export all your data before you leave.",
    category: "pricing-objection",
  },
  // ...
];

export const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: `${f.capsule} ${f.detail ?? ""}`.trim(),
    },
  })),
};

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
```

## Astro

```astro
---
// src/pages/faq.astro
import { faqs, faqJsonLd, slug } from "../data/faqs";
---
{faqs.map((f) => (
  <section id={slug(f.q)}>
    <h2>{f.q}</h2>
    <p>{f.capsule}</p>
    {f.detail && <p>{f.detail}</p>}
  </section>
))}
<script type="application/ld+json" set:html={JSON.stringify(faqJsonLd)} />
```

## Next.js (App Router)

```tsx
// app/faq/page.tsx
import { faqs, faqJsonLd, slug } from "../../data/faqs";

export default function FaqPage() {
  return (
    <main>
      {faqs.map((f) => (
        <section key={f.q} id={slug(f.q)}>
          <h2>{f.q}</h2>
          <p>{f.capsule}</p>
          {f.detail && <p>{f.detail}</p>}
        </section>
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </main>
  );
}
```

## Don'ts (Google AI-optimization guide, 2026-05)

- No `llms.txt` or "AI-specific" hidden text.
- No content "chunking" for AI; no ideal page length exists.
- No one-page-per-query-variant (scaled content abuse).

## Recommended extras

- Verify the site in **Bing Webmaster Tools** + enable **IndexNow**; use its AI Performance dashboard (public preview since 2026-02) to track Copilot citations.
- If using an accordion, render full content server-side and offer an "Expand all" control (NN/g accessibility guidance).
