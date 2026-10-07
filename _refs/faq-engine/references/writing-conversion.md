# Writing & Conversion（答案工程 + 转化文案模式库）

> Load at workflow Step 3.

## 1. 三层长度结构（硬指标）

| Tier | Length | Purpose |
|---|---|---|
| First sentence (direct answer) | ≤25 words, standalone | Instant answer / voice answers (voice-answer mean ≈29 words) |
| Answer capsule (first paragraph) | 40–60 words (≈250–300 chars) | Featured-snippet & AI-extraction sweet spot (snippet means: 42–43 words) |
| Full answer | ≤120 words (≤150 with a list) | Readability (users read 20–28% of page words) |
| Overflow | Link out ("Read more about X") | Healthy IA |

## 2. BLUF 三段式（每条答案内部结构）

1. **First sentence** ≤25 words, quotable out of context. First word = Yes / No / number / verdict. Never open with "Great question", "In today's…", "It depends". For Yes/No questions the answer's first word is Yes or No (Cloudflare style-guide rule); qualifiers go in sentence two.
2. **Expansion** — 1–3 sentences or ≤5 bullets: conditions, evidence, exceptions. Inverted pyramid: cutting from the bottom never loses the core.
3. **Soft CTA** — ≤1 sentence, optional, from the CTA library (§6). The CTA continues the answer; it is not an ad.

Placement rules:
- Most important Q&A in the **page's first 30%** (44.2% of LLM citations come from the first 30%; 55% of AIO-cited passages likewise).
- Never bury answers behind JS-injected accordions, page bottom, or images. Accordion content must be server-rendered into first-load HTML.
- **Numeric double-check (hard rule)**: recompute every computed number before output — worked examples, address/host math, price arithmetic, percentages. Keep one consistent counting basis (e.g., total vs usable addresses) within and across answers; state the basis when ambiguity is possible. (Eval catch: 256−228=28 was shipped as "36" by mixing usable-host and total-address sums.)

## 3. 页面结构分级

| Scale | Structure |
|---|---|
| <20 questions | Flat list on one page |
| 20–50 | Group by sub-theme (≤7 per group); group names are task words, never "General/Miscellaneous" |
| 50–100 | + anchor TOC / SSR accordion; every question has a `#` anchor for deep-linking |
| >100 | Hub-and-spoke: hub lists all questions, spokes carry single-question detail pages (40–60 word capsule up top), bidirectional descriptive-anchor links, site search |

Type-specific counts: standalone FAQ page 10–30 questions; pricing-page embedded FAQ 8–12 (all pre-purchase objections: plan choice / overage / cancel / invoice / refund) followed by dual CTA (Talk to sales + Get started — Vercel pattern); Contact page ≤7 (answers above the phone/email — Canada.ca rule). **One topic cluster = one page; never one page per long-tail variant** (scaled content abuse).

## 4. 语气标杆（8 条真实 Q&A，写作时对标）

1. Verdict first + mechanism (Supabase): "No, we do not charge for paused projects. Compute hours are only counted for active instances."
2. One-line refusal, no evasion (Supabase): "Can I delay my payment? — No, you cannot delay your payment."
3. Yes + default state + optional action (Supabase): "Yes. Spend caps are on by default on the Pro Plan. You can turn spend caps off… to pay as you grow."
4. Analogy to defuse resistance (Stripe identity): "When you interact with businesses in-person, identity verification happens all the time. For example…"
5. Fact first, then role boundary (Stripe): "The business you purchased from supplied Stripe with your email address to facilitate the refund process."
6. Yes + immediate qualifier (Cloudflare): "Yes, you can use Workers KV outside of Workers by using the REST API… It is important to note the limits…"
7. Metaphor as quotable definition (Notion): "Imagine every piece of content you add to a page… as a single building block."
8. Plan-by-plan verdict + action close (Vercel): "Our Hobby plan is for personal, non-commercial use. Pro is designed for… Contact our sales team to learn more."

Numbers beat adjectives — show real math (Supabase benchmark: "$25 Pro Plan + $30 for 3 projects − $10 credits ⇒ $45/month").

## 5. 异议处理四步骨架

Question uses the user's own words (mined from support tickets / Reddit / G2 — never brainstormed internally). Answer in 4 moves:

1. **Acknowledge** the objection is legitimate (no defensiveness — admitting known limitations signals maturity, per NN/g).
2. **Direct answer** (Yes/No/price/number).
3. **Evidence + risk reversal** (mechanism, verifiable links, refund/cancel promises — every claim passes "So what? Prove it.").
4. **Soft CTA**.

Benchmarks:
- Pricing objection: "Will I automatically be charged when my free trial is up? — **No.** We don't ask for a credit card to try Basecamp, so we couldn't charge you even if we wanted to." (physical impossibility = strongest risk reversal) / Fathom reframing the business model: "If you aren't paying for the product, you are the product. At Fathom… we sell software, not data."
- Trust objection: Yes/No → mechanism list (encryption, data residency, compliance) → verifiable evidence links → honest limits. "We take security seriously" alone = saying nothing (Tally pattern: GDPR + EU storage + encryption in transit/at rest + retention control).
- Feature objection: Yes → ≤3-step quickstart; No → admit + workaround, never vaporware (Superhuman: "There is no dedicated mobile app… changes show up automatically in your Outlook Mobile app.").

## 6. 对比类 FAQ 五步法（"X vs Y" / "X alternative"）

1. **Verdict first**: "Choose X if…; choose Y if…" — taking a side is mandatory (both-sides-ing = AI flavor).
2. **Scope the comparison**: which dimensions, which plan/version, as of when (legal requirement: basis must be stated).
3. **Facts only**: ≤4 dimensions, verifiable facts, prefer a table; **no superlatives** (best/fastest).
4. **Honest tradeoff**: name one thing the competitor does better ("honest about tradeoffs without trashing the other option").
5. **Soft CTA** to the full comparison page or migration guide.

Compliance red lines:
- Name the competitor (searchers of "[Competitor] vs [You]" expect named brands).
- Verifiable claims only — US FTC 1979 comparative-advertising policy permits truthful comparison; false/misleading claims are actionable under Lanham Act §43(a). UK/EU audiences: CAP Code 3.33/3.35 (comparisons must be verifiable; ASA 2024 Wizz Air ruling).
- Re-verify competitor pricing/features every **90 days**.

## 7. 软 CTA 措辞库（15 条）

Rules: call to value over call to action; first person ("my" beats "your", +90% clicks in the classic Aagaard test); attach friction-reducers; ≤1 CTA per answer; ≤4 CTA scenarios per page.

- Trial/start: "Try it free — no credit card needed →" ｜ "Start my 30-day trial and test it on real data →" ｜ "See it working on the live demo (no signup) →" ｜ "Create my first form in under 2 minutes →"
- Docs/deep-dive: "Read the full setup guide (3 steps) →" ｜ "See the API docs for exactly what's returned →" ｜ "Step-by-step migration checklist →" ｜ "All the fine print, on one page →"
- Pricing/plans: "See my exact price — pick my traffic tier →" ｜ "Compare plans side by side →" ｜ "Start free, upgrade only if I outgrow it →" ｜ "Nonprofit or student? Get the discount →"
- Compare/switch: "See the full [Product] vs [Competitor] breakdown →" ｜ "Import my data from [Competitor] in one click →" ｜ "Switch and get 3 months free →" (must be honorably redeemable)
