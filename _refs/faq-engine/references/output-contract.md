# Output Contract（输出格式约束 + 验证清单）

> Load at workflow Step 5. All deliverables MUST follow this structure.

## 1. Output Template

```markdown
# [Product Name] — FAQ Page

## Meta Block <!-- INTERNAL: strip before publish -->
- **Target Keywords**: [comma-separated]
- **Search Intent**: [Informational / Commercial / Navigational]
- **Primary Channel**: [Featured Snippet / AI Citation / On-page Conversion — multi-select]
- **Page Type**: [Standalone FAQ / Pricing-embedded / Docs-embedded / Contact / Comparison-block]
- **Schema Ready**: [Yes / No — purpose: machine-readability + Bing ecosystem, NOT Google rich results (deprecated 2026-05-07)]
- **Brand Tone**: [Casual / Professional / Technical / Playful]
- **Last Reviewed**: [YYYY-MM-DD]
- **Word Count**: [total]

## FAQ Content

### Q1: [Question — PAA original phrasing or user's own words]
**Category**: [Onboarding / Pricing-Objection / Trust-Objection / Feature-Objection / Comparison / Technical / Troubleshooting]
**Source**: [PAA / Reddit / Competitor FAQ / GSC / Support log + source URL]
**Search Volume Proxy**: [High / Medium / Low — based on PAA recurrence]
**Answer**:
- **Capsule** (40–60 words): [first sentence ≤25 words starting Yes/No/number/verdict + one supporting sentence; quotable standalone]
- **Detail** (optional): [≤60 words or ≤5 bullets; **bold** key terms; 1 descriptive-anchor internal link]
- **CTA** (optional, ≤1): [from CTA library, continuous with the answer]

### Q2: ...

## Schema.org JSON-LD
[FAQPage JSON-LD mirroring the visible Q&A 1:1; mainEntity is an array; name/text hold full text]

## Validation Checklist
[Full checklist below — tick every item; mark fixed items with what was fixed]

## Sources
[Per-question intent source + competitor sources + fact-check sources: URL + access date + key insight]
```

## 2. Validation Checklist（逐项强制）

**Question authenticity**
- [ ] Every question has a real source (PAA / Reddit / support log / GSC) — zero internal brainstorming; every Source field contains a full clickable URL (not just a site/thread name)
- [ ] No filler ("What does FAQ stand for?"); coverage spans Awareness → Decision
- [ ] Pricing-page questions use first-person concern phrasing ("I'm worried I could…")

**Answer engineering**
- [ ] First sentence ≤25 words, opens with Yes/No/number/verdict, quotable standalone
- [ ] Capsule 40–60 words; total ≤120 words (≤150 with list); overflow linked to docs
- [ ] Most important Q&A placed in the page's first 30%
- [ ] Accordion/collapsed content server-rendered into first-load HTML
- [ ] ≤1 soft CTA per answer; ≤4 CTA scenarios per page

**Conversion & compliance**
- [ ] ≥1 comparison question: verifiable, no superlatives, comparison date stated, 90-day re-check reminder
- [ ] ≥1 pricing/conversion question with risk-reversal fact (no credit card / cancel anytime / prorated refund)
- [ ] Objection answers admit limitations — no defensiveness, no vaporware
- [ ] Every number/claim verifiable ("So what? Prove it.")

**De-AI flavor**
- [ ] All 6 signal classes pass (AI vocab / throat-clearing / hype adjectives / fence-sitting / mechanical triads / fake precision)
- [ ] Sentence lengths vary; ≥1 answer uses an analogy or real math
- [ ] Tone matches Brand Tone (default Professional-Casual)

**IA & technical**
- [ ] Core info (pricing/features/security) also available in main copy — FAQ restates + links
- [ ] One topic cluster per page; no long-tail-variant page splitting
- [ ] Task-word groups when >20 questions; every question has a `#` anchor
- [ ] HTML and JSON-LD generated from a single data source; marked-up text fully visible on page
- [ ] JSON-LD passes **validator.schema.org** (never Rich Results Test for FAQ)
- [ ] No ads inside answers/schema; no UGC marked as FAQPage
- [ ] Visible Last-Reviewed date + byline (solo devs: brand byline + About page explaining authorship)
- [ ] Publishable sections (FAQ Content / JSON-LD) contain zero process narration or editorial reminders; fix logs and re-verify reminders live only in Build Notes

## 3. Evidence-Conflict Appendix (present both sides when these arise)

| Topic | For | Against | Skill stance |
|---|---|---|---|
| Schema boosts AI citations | Bing official (2025-03); Authoritas (+40% weight); Semrush 304K URLs (+22%) | Ahrefs 2026-05 controlled test (≈0; AIO significantly negative); Search Atlas (no correlation); SearchVIU (LLMs don't parse JSON-LD on direct fetch) | Keep markup (zero cost + Bing endorsement); never promise citation uplift |
| FAQ page SEO value | PAA/answer shape matches informational queries; AI-citation demand rising | SERP display incentive = 0; AIO cuts top-page clicks −34.5% | Value = citable content asset + cluster node + on-page conversion |
| Ideal question/word count | Practice ranges: 10–30 questions, 40–60 word answers | Google: "no ideal page length" | Ranges are usability defaults, not ranking rules |

*Research basis (2026-07-17): 65+ searches across 3 briefs — 8 first-hand site reverse-engineers (Stripe/Notion/Ahrefs/Zapier/Figma/Cloudflare/Supabase/Vercel), SEO technical specs (Google Search Central, schema.org, NN/g, Ahrefs/Semrush studies), CRO copy patterns (NN/g, Copyhackers, CXL, FTC/CAP compliance).*
