import type { Metadata } from "next";

import { SITE_NAME } from "@/lib/site-config";
import {
  CodeBlock,
  FAQAccordion,
  CTASection,
  CompareTable,
  InternalLink,
} from "@/components/content";
import type { ContentSection } from "@/lib/types";
import { DEMO_POST } from "./data";

export const metadata: Metadata = {
  title: `Content Components — ${SITE_NAME}`,
  description:
    "Internal test page for CodeBlock, FAQAccordion, CTA, CompareTable, and InternalLink components.",
  robots: { index: false, follow: false },
};

function SectionRenderer({ section }: { section: ContentSection }) {
  switch (section.type) {
    case "text":
      return <p className="text-text-muted">{section.body}</p>;
    case "heading":
      const Heading = `h${section.level}` as "h2" | "h3" | "h4";
      return (
        <Heading className="font-display text-2xl font-semibold tracking-tight text-text">
          {section.text}
        </Heading>
      );
    case "list":
      const ListTag = section.ordered ? "ol" : "ul";
      return (
        <ListTag className="list-inside list-disc space-y-2 text-text-muted">
          {section.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ListTag>
      );
    case "code":
      return (
        <CodeBlock
          code={section.code}
          language={section.language}
          filename={section.filename}
          showLineNumbers={section.showLineNumbers}
          cta={section.cta}
        />
      );
    case "faq":
      return <FAQAccordion items={section.items} injectSchema={section.injectSchema} />;
    case "cta":
      return (
        <CTASection
          title={section.title}
          description={section.description}
          buttons={section.buttons}
        />
      );
    case "compare":
      return (
        <CompareTable
          title={section.title}
          products={section.products}
          features={section.features}
          footnote={section.footnote}
        />
      );
    case "links":
      return (
        <div className="flex flex-wrap gap-3">
          {section.links.map((link, i) => (
            <InternalLink key={i} href={link.href} anchorText={link.anchorText} />
          ))}
        </div>
      );
    default:
      return null;
  }
}

export default function TestContentComponentsPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-24">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-text">
        {DEMO_POST.h1}
      </h1>
      {DEMO_POST.sections.map((section, index) => (
        <section key={index} className="flex flex-col gap-4">
          <SectionRenderer section={section} />
        </section>
      ))}
    </main>
  );
}