/**
 * SOP-3J-08: 内容发布前自动化检查脚本
 *
 * 检查项（按 03_EXECUTION_GUIDE 9 项）：
 * 1. Title 长度 40–60 字符
 * 2. Meta description 长度 140–160 字符
 * 3. H1 包含 targetKeyword
 * 4. 首段包含 targetKeyword
 * 5. FAQ 4–8 个，且至少 2 个问题包含 targetKeyword
 * 6. ≥1 个代码块
 * 7. ≥1 个 CTA
 * 8. 内链密度：每 500 字 ≥1 个内链
 * 9. 字数：技术博客/指南 ≥600 字；落地页 ≥300 字
 *
 * 使用方式：pnpm content-check
 */

import { readdirSync, statSync } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";

import type { ContentSection, FAQItem } from "../src/lib/types";
import type { FAQEntry } from "../src/lib/faq-helpers";

/**
 * AI 味词表（来源 faq-engine references/de-ai-applicability.md + 项目级补充）
 * 命中即视为 AI 味违规。
 */
const AI_FLAVOR_WORDS: string[] = [
  // faq-engine Python AI_WORDS
  "delve", "tapestry", "underscore", "testament", "showcase", "garner",
  "bolster", "intricate", "interplay", "meticulous", "pivotal", "vibrant",
  "crucial", "enhance", "foster", "align with", "valuable", "enduring",
  "cutting-edge", "game-changing", "revolutionary", "seamless", "robust",
  "comprehensive", "state-of-the-art", "best-in-class", "utilize",
  "in today's fast-paced world", "ever-evolving landscape",
  // 项目级补充（Phase 3J 常见 AI 味）
  "ai-powered", "advanced features", "best practices", "natural language",
  "absolutely", "no questions asked",
];

interface BlogPostLike {
  h1: string;
  title: string;
  description: string;
  targetKeyword: string;
  sections: ContentSection[];
}

interface CheckResult {
  name: string;
  pass: boolean;
  detail: string;
}

/**
 * blog/[slug]/data.ts 的 BlogPostData 形状（Record<slug, post> 容器的单篇）。
 * 与 BlogPostLike 差异：无 h1（渲染用 title 当 H1）、sections/content 二选一、targetKeyword 可选。
 */
interface BlogPostEntry {
  slug: string;
  title: string;
  description: string;
  content: string;
  targetKeyword?: string;
  sections?: ContentSection[];
  keywords?: string[];
}

function hasKeyword(text: string, keyword: string): boolean {
  return text.toLowerCase().includes(keyword.toLowerCase());
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * 与 faq-engine build_jsonld.py 对齐的词数统计（正则匹配 token）。
 * 用于 FAQ capsule/answer 长度校验，保证 TS 与 Python lint 结果一致。
 */
function wcPy(text: string): number {
  return (text.match(/[A-Za-z0-9$€£%][\w$€£%./-]*/g) || []).length;
}

/** 与 Python first_sentence 对齐：在 .!? 后的空白处分割，取首句。 */
function firstSentence(text: string): string {
  const m = text.trim().split(/(?<=[.!?])\s/);
  return m[0] ?? text;
}

/**
 * 首句合规检查（faq-engine 规范：首句以 Yes/No/数字/结论开头，≤25 词）。
 * - 是非问题（Can/Is/Do/Does/Will/Are...）：首句必须以 Yes/No/Not 开头
 * - 非是非问题（How/What/Why/Which...）：首句不得以 throat-clearing 开头（即视为结论）
 */
function isFirstSentenceValid(question: string, sentence: string): boolean {
  const q = question.trim().toLowerCase();
  const isYesNoQuestion = /^(can|is|do|does|will|are|could|should|may|would|have|has|did)\b/.test(q);
  const s = sentence.trim().toLowerCase();
  if (isYesNoQuestion) {
    return /^(yes|no|not yet|not\s|sure|correct|right|true|false)\b/.test(s) || /^\d/.test(s);
  }
  // 非是非问题：排除 throat-clearing 开头
  const throatClearing = /^(in today|in the|we understand|it's important|there are|there is|this is|here is|generally|typically|usually|often|sometimes|many|some|basically|essentially)\b/;
  return !throatClearing.test(s);
}

/** 检测 AI 味词命中 */
function findAIWords(text: string): string[] {
  const low = text.toLowerCase();
  return AI_FLAVOR_WORDS.filter((w) => low.includes(w));
}

function extractTextFromSections(sections: ContentSection[]): string {
  return sections
    .map((section) => {
      switch (section.type) {
        case "text":
          return section.body;
        case "heading":
          return section.text;
        case "callout":
          return `${section.title ?? ""} ${section.text}`;
        case "list":
          return section.items.join(" ");
        case "faq":
          return section.items.map((i) => `${i.question} ${i.answer}`).join(" ");
        case "cta":
          return `${section.title ?? ""} ${section.description ?? ""} ${section.buttons.map((b) => b.label).join(" ")}`;
        case "compare":
          return `${section.title} ${section.features.map((f) => f.name).join(" ")}`;
        case "image":
          return section.image.alt;
        case "gallery":
          return section.images.map((img) => img.alt).join(" ");
        case "code":
          return "";
        case "table":
          return `${section.headers.join(" ")} ${section.rows.flat().join(" ")}`;
        case "links":
          return section.links.map((l) => l.anchorText ?? "").join(" ");
        default:
          return "";
      }
    })
    .join(" ");
}

function getFirstParagraph(sections: ContentSection[]): string {
  const firstText = sections.find((s) => s.type === "text");
  return firstText?.type === "text" ? firstText.body : "";
}

function countCodeBlocks(sections: ContentSection[]): number {
  return sections.filter((s) => s.type === "code").length;
}

function countCTAs(sections: ContentSection[]): number {
  return sections.filter((s) => s.type === "cta").length;
}

function countInternalLinks(sections: ContentSection[]): number {
  return sections.reduce((acc, s) => {
    if (s.type === "links") return acc + s.links.length;
    if (s.type === "cta") return acc + s.buttons.filter((b) => !b.href.startsWith("http")).length;
    return acc;
  }, 0);
}

interface BlogPostCheckOptions {
  /** 首段覆盖：博客页引入段在 content（不在 sections），传入 content 首段以正确校验 */
  firstParagraph?: string;
  /** 页面级固定 CTA 数：page.tsx 硬编码的 CTA 按钮（不在 sections 数据里），计入避免误报 */
  extraCtas?: number;
  /** 页面级固定内链数：page.tsx 硬编码的内链（不在 sections 数据里），计入避免误报 */
  extraInternalLinks?: number;
}

function checkBlogPost(name: string, post: BlogPostLike, wordTarget = 600, opts: BlogPostCheckOptions = {}): CheckResult[] {
  const results: CheckResult[] = [];
  const text = extractTextFromSections(post.sections);
  const firstParagraph = opts.firstParagraph ?? getFirstParagraph(post.sections);
  const wordCount = countWords(text);
  const faqSections = post.sections.filter((s) => s.type === "faq");
  const allFaqs: FAQItem[] = faqSections.flatMap((s) => (s.type === "faq" ? s.items : []));
  const codeBlocks = countCodeBlocks(post.sections);
  const ctas = countCTAs(post.sections) + (opts.extraCtas ?? 0);
  const internalLinks = countInternalLinks(post.sections) + (opts.extraInternalLinks ?? 0);

  // 1. Title
  const titleLen = post.title.length;
  results.push({
    name: `${name}: title length`,
    pass: titleLen >= 40 && titleLen <= 60,
    detail: `${titleLen} chars`,
  });

  // 2. Meta description
  const descLen = post.description.length;
  results.push({
    name: `${name}: meta description length`,
    pass: descLen >= 140 && descLen <= 160,
    detail: `${descLen} chars`,
  });

  // 3. H1 keyword
  results.push({
    name: `${name}: H1 contains keyword`,
    pass: hasKeyword(post.h1, post.targetKeyword),
    detail: `keyword="${post.targetKeyword}"`,
  });

  // 4. First paragraph keyword
  results.push({
    name: `${name}: first paragraph contains keyword`,
    pass: hasKeyword(firstParagraph, post.targetKeyword),
    detail: firstParagraph.slice(0, 60) + "...",
  });

  // 5. FAQ count and keyword density
  const faqWithKeyword = allFaqs.filter((f) => hasKeyword(f.question, post.targetKeyword)).length;
  results.push({
    name: `${name}: FAQ count & keyword density`,
    pass: allFaqs.length === 0 || (allFaqs.length >= 4 && allFaqs.length <= 8 && faqWithKeyword >= 2),
    detail: `${allFaqs.length} FAQs, ${faqWithKeyword} with keyword`,
  });

  // 6. Code block
  results.push({
    name: `${name}: code blocks`,
    pass: codeBlocks >= 1,
    detail: `${codeBlocks} code block(s)`,
  });

  // 7. CTA
  results.push({
    name: `${name}: CTAs`,
    pass: ctas >= 1,
    detail: `${ctas} CTA section(s)`,
  });

  // 8. Internal link density
  const expectedLinks = Math.max(1, Math.floor(wordCount / 500));
  results.push({
    name: `${name}: internal link density`,
    pass: internalLinks >= expectedLinks,
    detail: `${internalLinks} links / ${expectedLinks} expected per ${wordCount} words`,
  });

  // 9. Word count
  results.push({
    name: `${name}: word count`,
    pass: wordCount >= wordTarget,
    detail: `${wordCount} words (>=${wordTarget})`,
  });

  return results;
}

/**
 * SOP-3O-07: 适配 blog/[slug]/data.ts 的 BlogPostData 形状，复用 checkBlogPost 九项检查。
 * - h1 ← title（渲染侧 blog/[slug]/page.tsx H1 即 post.title）
 * - targetKeyword ← targetKeyword ?? keywords[0] ?? slug（3 篇旧博客无 targetKeyword 时回退）
 * - sections ← sections ?? content.split("\n\n") 合成 text 段（3 篇无 sections 时回退）
 * 词数阈值维持 600（博客扩写到 2000-4000 为 Phase 4 独立持续事项，不在本任务）。
 */
function checkBlogPostEntry(name: string, post: BlogPostEntry): CheckResult[] {
  const sections: ContentSection[] =
    post.sections && post.sections.length > 0
      ? post.sections
      : post.content
          .split("\n\n")
          .map((body) => body.trim())
          .filter(Boolean)
          .map((body) => ({ type: "text", body }) as ContentSection);
  const mapped: BlogPostLike = {
    h1: post.title,
    title: post.title,
    description: post.description,
    targetKeyword: post.targetKeyword ?? post.keywords?.[0] ?? post.slug,
    sections,
  };
  // A 类口径修正：博客页 page.tsx 硬编码 2 个固定 <Link>（Try Our GUI Maker→/editor、
  // Read the Guides→/guides，均站内非 http），视作 1 个 CTA + 2 个内链；引入段在 content 首段
  // （sections 第一个 text 节常是 step 正文而非引入段），故用 content 首段校验首段关键词。
  const introParagraph = post.content.split("\n\n")[0]?.trim() ?? "";
  return checkBlogPost(name, mapped, 600, {
    firstParagraph: introParagraph,
    extraCtas: 1,
    extraInternalLinks: 2,
  });
}

function checkFAQ(name: string, items: FAQItem[]): CheckResult[] {
  return [
    {
      name: `${name}: FAQ present`,
      pass: items.length > 0,
      detail: `${items.length} FAQs`,
    },
  ];
}

/**
 * SOP-3J faq-engine 集成：FAQ 去 AI 味 + 结构合规检查
 *
 * 检查项（来源 faq-engine SKILL.md / build_jsonld.py）：
 * - 每条 capsule 40-60 词
 * - 首句 ≤25 词且以 Yes/No/数字/结论开头
 * - 完整答案（capsule + detail + cta）≤150 词
 * - 无 AI 味词
 * - 无重复问题
 * - 每个问题有 source
 * - ≥1 条对比问题含竞品名 + 比较日期
 * - ≥1 条价格/退款含风险逆转
 */
function checkFAQDeAI(name: string, entries: FAQEntry[]): CheckResult[] {
  const results: CheckResult[] = [];
  const seen = new Set<string>();
  let hasCompare = false;
  let hasRiskReversal = false;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const tag = `${name}: FAQ#${i + 1} (${entry.question.slice(0, 40)})`;
    const capsule = entry.capsule ?? "";
    const detail = entry.detail ?? "";
    const cta = entry.cta ?? "";
    const full = `${capsule} ${detail} ${cta}`.trim();

    // capsule 40-60 词
    const cWc = wcPy(capsule);
    results.push({
      name: `${tag}: capsule word count`,
      pass: cWc >= 40 && cWc <= 60,
      detail: `${cWc} words (target 40-60)`,
    });

    // 首句 ≤25 词且以结论开头
    const fs = firstSentence(capsule);
    const fsWc = wcPy(fs);
    const verdictOk = isFirstSentenceValid(entry.question, fs);
    results.push({
      name: `${tag}: first sentence`,
      pass: fsWc <= 25 && verdictOk,
      detail: `${fsWc} words, verdict-start=${verdictOk}`,
    });

    // 完整答案 ≤150 词
    const tWc = wcPy(full);
    results.push({
      name: `${tag}: total answer length`,
      pass: tWc <= 150,
      detail: `${tWc} words (<=150)`,
    });

    // AI 味词
    const aiHits = findAIWords(full);
    results.push({
      name: `${tag}: AI-flavor words`,
      pass: aiHits.length === 0,
      detail: aiHits.length === 0 ? "clean" : `hits: ${aiHits.join(", ")}`,
    });

    // source 存在
    results.push({
      name: `${tag}: source present`,
      pass: Boolean(entry.source && entry.source.trim().length > 0),
      detail: entry.source ? entry.source.slice(0, 50) : "missing",
    });

    // 重复问题
    const key = entry.question.toLowerCase().replace(/\W+/g, "");
    if (seen.has(key)) {
      results.push({
        name: `${tag}: duplicate question`,
        pass: false,
        detail: "duplicate",
      });
    }
    seen.add(key);

    // 对比问题（含竞品名 + 日期）
    if (/bloxsmith|figbloxui|compare/i.test(entry.question + full)) {
      const hasDate = /\b(20\d{2}|july|june|august)\b/i.test(full);
      if (hasDate) hasCompare = true;
    }

    // 风险逆转（价格/退款类）
    if (/refund|money-back|credit card|cancel|free/i.test(full)) {
      if (/no credit card|14-day|money-back|cancel|refund/i.test(full)) {
        hasRiskReversal = true;
      }
    }
  }

  // 汇总：对比问题
  results.push({
    name: `${name}: competitor comparison FAQ`,
    pass: hasCompare,
    detail: hasCompare ? "present" : "missing (need competitor name + date)",
  });

  // 汇总：风险逆转
  results.push({
    name: `${name}: risk-reversal FAQ`,
    pass: hasRiskReversal,
    detail: hasRiskReversal ? "present" : "missing (need refund/no credit card)",
  });

  return results;
}

function findDataFiles(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const st = statSync(fullPath);
    if (st.isDirectory()) {
      findDataFiles(fullPath, files);
    } else if (st.isFile() && entry === "data.ts") {
      files.push(fullPath);
    }
  }
  return files;
}

/** SOP-4-27: 检查 TemplateDetails（模板详情内容深度，统计渲染后完整可见文本） */
function checkTemplateDetails(name: string, details: Record<string, { howToUse: string; faqs?: { question: string; answer: string }[]; codeSteps?: { step: string; text: string }[]; internalLinks?: { href: string; label: string }[] }>): CheckResult[] {
  const results: CheckResult[] = [];
  const entries = Object.entries(details);
  for (const [slug, detail] of entries) {
    // 统计渲染后完整可见文本：howToUse + codeSteps + faqs 的全部文字（data.ts 字段词数）
    const fullText = [
      detail.howToUse ?? "",
      ...(detail.codeSteps ?? []).map((s) => `${s.step} ${s.text}`),
      ...(detail.faqs ?? []).map((f) => `${f.question} ${f.answer}`),
    ].join(" ");
    const wc = countWords(fullText);
    results.push({
      name: `${name}#${slug}: content word count`,
      pass: wc >= 300,
      detail: `${wc} words (>=300)`,
    });
    const faqCount = Array.isArray(detail.faqs) ? detail.faqs.length : 0;
    results.push({
      name: `${name}#${slug}: FAQ count`,
      pass: faqCount >= 4,
      detail: `${faqCount} FAQs (>=4)`,
    });
  }
  return results;
}

/** SOP-4-27: 检查 COMPARES（对比页内容深度，统计渲染后完整可见文本） */
function checkCompares(name: string, compares: Record<string, { intro: string; features?: { name: string }[]; bodySections?: { heading: string; body: string }[]; faqs?: { question: string; answer: string }[] }>): CheckResult[] {
  const results: CheckResult[] = [];
  const entries = Object.entries(compares);
  for (const [slug, compare] of entries) {
    const fullText = [
      compare.intro ?? "",
      ...(compare.features ?? []).map((f) => f.name),
      ...(compare.bodySections ?? []).map((s) => `${s.heading} ${s.body}`),
      ...(compare.faqs ?? []).map((f) => `${f.question} ${f.answer}`),
    ].join(" ");
    const wc = countWords(fullText);
    results.push({
      name: `${name}#${slug}: content word count`,
      pass: wc >= 400,
      detail: `${wc} words (>=400)`,
    });
    const faqCount = Array.isArray(compare.faqs) ? compare.faqs.length : 0;
    results.push({
      name: `${name}#${slug}: FAQ count`,
      pass: faqCount >= 4,
      detail: `${faqCount} FAQs (>=4)`,
    });
  }
  return results;
}

/** SOP-4-27: 检查 DOCS（文档内容深度，统计渲染后完整可见文本） */
function checkDocs(name: string, docs: Record<string, { content: string; title: string; sections?: { heading: string; body: string }[] }>): CheckResult[] {
  const results: CheckResult[] = [];
  const entries = Object.entries(docs);
  for (const [slug, doc] of entries) {
    const fullText = [
      doc.content ?? "",
      ...(doc.sections ?? []).map((s) => `${s.heading} ${s.body}`),
    ].join(" ");
    const wc = countWords(fullText);
    results.push({
      name: `${name}#${slug}: rendered word count`,
      pass: wc >= 300,
      detail: `${wc} words (>=300)`,
    });
  }
  return results;
}

/** SOP-4-27: 检查 GUIDES（指南内容深度，统计渲染后完整可见文本） */
function checkGuides(name: string, guides: Record<string, { intro: string; sections?: { heading: string; body?: string; code?: string }[]; steps?: { name: string; text: string }[]; faq?: { q: string; a: string }[] }>): CheckResult[] {
  const results: CheckResult[] = [];
  const entries = Object.entries(guides);
  for (const [slug, guide] of entries) {
    const fullText = [
      guide.intro ?? "",
      ...(guide.sections ?? []).map((s) => `${s.heading} ${s.body} ${s.code ?? ""}`),
      ...(guide.steps ?? []).map((s) => `${s.name} ${s.text}`),
      ...(guide.faq ?? []).map((f) => `${f.q} ${f.a}`),
    ].join(" ");
    const wc = countWords(fullText);
    results.push({
      name: `${name}#${slug}: rendered word count`,
      pass: wc >= 400,
      detail: `${wc} words (>=400)`,
    });
    const faqCount = Array.isArray(guide.faq) ? guide.faq.length : 0;
    results.push({
      name: `${name}#${slug}: FAQ present`,
      pass: faqCount > 0,
      detail: `${faqCount} FAQs`,
    });
  }
  return results;
}

/** SOP-4-27: 检查 USE_CASES（用例内容深度，统计渲染后完整可见文本） */
function checkUseCases(name: string, useCases: Record<string, { intro?: string; requirements?: string[]; steps?: { name: string; text: string }[]; bodySections?: { heading: string; body: string }[]; designTips?: string[]; faq?: { q: string; a: string }[] }>): CheckResult[] {
  const results: CheckResult[] = [];
  const entries = Object.entries(useCases);
  for (const [slug, uc] of entries) {
    const fullText = [
      uc.intro ?? "",
      ...(uc.requirements ?? []),
      ...(uc.steps ?? []).map((s) => `${s.name} ${s.text}`),
      ...(uc.bodySections ?? []).map((s) => `${s.heading} ${s.body}`),
      ...(uc.designTips ?? []),
      ...(uc.faq ?? []).map((f) => `${f.q} ${f.a}`),
    ].join(" ");
    const wc = countWords(fullText);
    results.push({
      name: `${name}#${slug}: rendered word count`,
      pass: wc >= 700,
      detail: `${wc} words (>=700)`,
    });
  }
  return results;
}

async function main() {
  const cwd = process.cwd();
  const dataFiles = findDataFiles(join(cwd, "src", "app"));
  const allResults: CheckResult[] = [];

  for (const absolutePath of dataFiles) {
    const displayPath = absolutePath.replace(cwd + "\\", "").replace(cwd + "/", "");
    try {
      const mod = await import(pathToFileURL(absolutePath).href);

      // FAQ checks
      if (mod.FAQ_ITEMS_FLAT && Array.isArray(mod.FAQ_ITEMS_FLAT)) {
        allResults.push(...checkFAQ(displayPath, mod.FAQ_ITEMS_FLAT as FAQItem[]));
      }

      // faq-engine de-AI checks（FAQ_ENTRIES 含 capsule/detail/source）
      if (mod.FAQ_ENTRIES && Array.isArray(mod.FAQ_ENTRIES)) {
        allResults.push(...checkFAQDeAI(displayPath, mod.FAQ_ENTRIES as FAQEntry[]));
      }

      // BlogPost-like checks (single export named POST / GUIDE / etc.)
      for (const [key, value] of Object.entries(mod)) {
        const v = value as Record<string, unknown>;
        if (
          v &&
          typeof v === "object" &&
          "h1" in v &&
          "title" in v &&
          "description" in v &&
          "targetKeyword" in v &&
          Array.isArray(v.sections)
        ) {
          allResults.push(...checkBlogPost(`${displayPath}#${key}`, v as unknown as BlogPostLike));
        }
      }

      // SOP-3O-07: blog/[slug]/data.ts 的 POSTS 容器（Record<slug, post>，无 h1 顶层字段）
      // 现有 BlogPost-like 循环因缺 h1 跳过全部博客；此处逐篇适配后跑九项检查。
      if (mod.POSTS && typeof mod.POSTS === "object") {
        for (const [slug, post] of Object.entries(mod.POSTS as Record<string, BlogPostEntry>)) {
          if (post && typeof post === "object" && "title" in post && "content" in post) {
            allResults.push(...checkBlogPostEntry(`${displayPath}#${slug}`, post));
          }
        }
      }

      // SOP-4-27: 模板详情内容检查（TEMPLATE_DETAILS）
      if (mod.TEMPLATE_DETAILS && typeof mod.TEMPLATE_DETAILS === "object") {
        allResults.push(...checkTemplateDetails(displayPath, mod.TEMPLATE_DETAILS as Record<string, { howToUse: string; faqs?: { question: string; answer: string }[]; codeSteps?: { step: string; text: string }[]; internalLinks?: { href: string; label: string }[] }>));
      }

      // SOP-4-27: 文档内容检查（DOCS）
      if (mod.DOCS && typeof mod.DOCS === "object") {
        allResults.push(...checkDocs(displayPath, mod.DOCS as Record<string, { content: string; title: string; sections?: { heading: string; body: string }[] }>));
      }

      // SOP-4-27: 指南内容检查（GUIDES）
      if (mod.GUIDES && typeof mod.GUIDES === "object") {
        allResults.push(...checkGuides(displayPath, mod.GUIDES as Record<string, { intro: string; sections?: { heading: string; body?: string; code?: string }[]; steps?: { name: string; text: string }[]; faq?: { q: string; a: string }[] }>));
      }

      // SOP-4-27: 用例内容检查（USE_CASES）
      if (mod.USE_CASES && typeof mod.USE_CASES === "object") {
        allResults.push(...checkUseCases(displayPath, mod.USE_CASES as Record<string, { intro?: string; requirements?: string[]; steps?: { name: string; text: string }[]; bodySections?: { heading: string; body: string }[]; designTips?: string[]; faq?: { q: string; a: string }[] }>));
      }

      // SOP-4-27: 对比页内容检查（COMPARES）
      if (mod.COMPARES && typeof mod.COMPARES === "object") {
        allResults.push(...checkCompares(displayPath, mod.COMPARES as Record<string, { intro: string; features?: { name: string }[]; bodySections?: { heading: string; body: string }[]; faqs?: { question: string; answer: string }[] }>));
      }
    } catch (err) {
      allResults.push({
        name: displayPath,
        pass: false,
        detail: `Failed to load: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  let failures = 0;
  for (const r of allResults) {
    const icon = r.pass ? "✅" : "❌";
    console.log(`${icon} ${r.name}: ${r.detail}`);
    if (!r.pass) failures++;
  }

  console.log(`\n${allResults.length} checks, ${failures} failed`);
  process.exit(failures > 0 ? 1 : 0);
}

main();