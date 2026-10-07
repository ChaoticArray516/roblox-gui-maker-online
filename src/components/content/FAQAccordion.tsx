"use client";

/**
 * SOP-3J-03: FAQAccordion — FAQ 手风琴组件
 *
 * 基于 shadcn accordion，复用现有 FaqJsonLd 注入 FAQPage Schema（非新建 Schema 组件）。
 * 可在 SSG 页面中作为 client island 使用。
 */

import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FaqJsonLd } from "@/components/seo";
import type { FAQItem } from "@/lib/types";

export interface FAQAccordionProps {
  items: FAQItem[];
  /** 是否在页面注入 FAQPage JSON-LD，默认 true */
  injectSchema?: boolean;
  className?: string;
}

export function FAQAccordion({
  items,
  injectSchema = true,
  className,
}: FAQAccordionProps) {
  if (items.length === 0) return null;

  return (
    <>
      {injectSchema && <FaqJsonLd items={items} />}
      <Accordion
        multiple
        className={cn("flex w-full flex-col gap-3", className)}
      >
        {items.map((faq, index) => (
          <AccordionItem
            key={index}
            value={`faq-${index}`}
            className="rounded-xl border border-glass-border bg-surface px-5 py-1"
          >
            <AccordionTrigger className="text-left text-base font-medium text-text hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-7 text-text-muted">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
}