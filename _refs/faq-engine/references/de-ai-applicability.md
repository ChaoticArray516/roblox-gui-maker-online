# De-AI-Flavor & Applicability（去 AI 味 + 适用性刹车）

> §1 load at Step 4 (de-AI pass). §2 load at Step 0 (applicability check).

## 1. 去 AI 味

### 1.1 六类信号检查（逐条排查）

1. **AI vocabulary** (Wikipedia "Signs of AI writing" empirical list): delve, tapestry, underscore, testament, showcase, garner, bolster, intricate, interplay, landscape (abstract), meticulous, pivotal, vibrant, crucial, enhance, foster, highlight(ing), align with, Additionally (sentence-initial), valuable, enduring — they co-occur: one usually means more.
2. **Throat-clearing openers**: "In today's fast-paced world…", "In the ever-evolving landscape of…", "We understand that…" — delete the whole sentence, start from the question.
3. **Hype adjectives**: cutting-edge, game-changing, revolutionary, seamless, robust, comprehensive, state-of-the-art, best-in-class (NN/g: users detest "marketese"; objective language scored +27% usability).
4. **Fence-sitting**: "There are pros and cons to both approaches." — human copy takes a position.
5. **Mechanical triads & monotone rhythm**: repeated "fast, reliable, and secure" triplets; every paragraph = intro + bullets + mini-conclusion; no sentence-length variance.
6. **Fake precision**: "Studies show…", "It's important to note that…", invented statistics — every number must be verifiable.

### 1.2 词级替换表

| AI flavor | Write instead |
|---|---|
| utilize | use |
| delve into | look at / dig into |
| seamless(ly) | state the specific friction removed |
| enable you to | say what the user can do |
| very / really / extremely | delete |
| elevate / unlock / harness | improve / open / use |
| In today's fast-paced world | delete sentence |
| end user | name the audience ("financial advisors") |

### 1.3 改写总则 + 对照

Rule: cut throat-clearing → verdict-first sentence → concrete nouns/numbers over hype adjectives → vary sentence length → take a position → human CTA.

> **Before**: "In today's fast-paced digital landscape, businesses are constantly seeking comprehensive, cutting-edge analytics solutions. Our robust platform offers competitive pricing meticulously designed to elevate your workflow…"
> **After**: "PocketLint starts at $9 a month. That's it — no seat fees, no overage charges, no 'contact sales.' If you go over your limit one month, nothing happens; we only ask you to upgrade after two consecutive months over."

> **Before**: "We understand that data security is paramount in the modern era. Rest assured that we leverage state-of-the-art, enterprise-grade security measures…"
> **After**: "Your data is encrypted in transit and at rest, stored in EU data centers, and never sold or used for training. We run a yearly third-party penetration test — the latest report (June 2026) is linked from our security page."

> **Before**: "When evaluating PocketLint versus LegacyTool, it's worth noting that both solutions offer unique advantages… Ultimately, the optimal choice depends on your specific requirements."
> **After**: "Pick LegacyTool if you need on-prem deployment and a 40-page report builder. Pick PocketLint if you want your stats on one page, cookieless, and live in five minutes. Try it free on your real traffic →"

## 2. 适用性刹车（FAQ 是不是正确形态）

FAQ is a conditional tool, not a default IA (critics: GDS, A List Apart, Canada.ca, The Good; conditional supporter: NN/g).

**✅ Use FAQ when:**
1. Transactional, narrow, high-frequency questions (shipping, refunds, cancellation, trial terms, billing details).
2. Objection-clearing block (3–12 Q&A) at the end of landing/pricing pages, right before the final CTA.
3. Contact page call-driver questions (≤7, answers above phone/email).
4. Named-competitor FAQ block on "X vs Y" pages (2–3 sentences per answer).
5. Time-sensitive / exceptional info unfit for evergreen docs.

**❌ Use another format when:**
1. Defining terms → build a **glossary** ("FAQs for definitions = ticket straight to documentation hell").
2. Multi-topic knowledge base >10 items → task-oriented docs IA + search.
3. Core info (pricing/features/security) exists ONLY in the FAQ → fix the main copy; FAQ merely restates + links.
4. Questions came from internal brainstorming → mine support logs/search terms first; if none, don't write.
5. Content already covered in body copy → don't duplicate (avoids self-competition in search).

**Decision output**: if the scenario lands in ❌, respond with the recommended alternative IA + rationale instead of an FAQ page. Refusing the wrong format is correct behavior.
