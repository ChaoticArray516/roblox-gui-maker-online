# Research Playbook（问题挖掘方法论）

> Load at workflow Step 2. Goal: every generated question traces to a real user source.

## 1. PAA 三层挖掘法

Why PAA first: ~43% of search queries show a PAA box (Ahrefs 2024); PAA questions are Google-verified real follow-ups and overlap heavily with the informational long-tails that trigger AI Overviews (97.7% informational intent, Ahrefs 55.8M AIO study).

| Layer | Method | Cost |
|---|---|---|
| L1 Manual | Search informational seeds (what/how/why/can/does + topic); click each PAA question — every click loads 2–3 more; chain to dozens. Incognito + `&gl=us&hl=en` for the target market | Free |
| L2 PAA tools | AlsoAsked (tree view, 3 free/day); Answer Socrates (free tier includes CSV); AnswerThePublic (autocomplete wheel); KeywordsPeopleUse (also scrapes Reddit/Quora) | Free tier – ~$12–47/mo |
| L3 Full-stack export | Ahrefs: Site Explorer → filter "keywords with PAA" → export → Keywords Explorer batch SERP export → pivot on question recurrence. Semrush: Keyword Magic question filter + PAA SERP-feature filter | Existing subscription |

Rules:
1. Reuse the PAA question's exact phrasing as your FAQ question.
2. Priority = recurrence of the same PAA question across queries (Google tends to reuse one answer source — win it, win all).
3. Record the current answer-source URL per question — that is the competitor answer to beat.
4. Reddit mines wording, PAA mines questions, keyword tools validate volume. A hot Reddit thread ≠ search demand — always validate.

## 2. Reddit / Quora Operator Library (copy-paste)

```
# Find relevant subreddits
site:reddit.com "{topic}"
# In-subreddit questions
site:reddit.com/r/{subreddit}/ "how"
site:reddit.com/r/{subreddit}/ "can I"
# Sitewide question patterns (capture exact user wording)
site:reddit.com "how do I" {topic}
site:reddit.com "what's the best" {topic}
site:reddit.com "why does my" {topic}
site:reddit.com "is it worth" {topic}
# Pain / negative sentiment (yields "anti-FAQs" — objections the product must answer)
site:reddit.com {topic} "doesn't work"
site:reddit.com {topic} "frustrated"
site:reddit.com {topic} "alternative"
site:reddit.com {topic} "vs"
# Quora equivalents
site:quora.com "{topic}" "how"
```

Operating notes:
- Sort subreddits by Top/Best first (upvotes = demand validation); monitor New for fresh pain.
- Extract users' **original wording**, not marketing language.
- Pricing-page FAQs should be rewritten as first-person concern sentences — benchmark (Supabase): "I'm worried I could end up with a huge bill at the end of the month."
- GSC (if available): filter queries containing who/what/how/why/can for questions already getting impressions.

## 3. Competitor FAQ Reverse Checklist

Per competitor (Top 10 in the niche):
- Page form: standalone FAQ page / help center / docs-embedded / pricing-page-embedded; question count magnitude.
- Taxonomy: by user task/business object (Stripe model — preferred) vs by product feature tree.
- Excerpt 2–3 of their Q&A verbatim as tone comparison.
- Log questions they do NOT cover = your differentiation gap.
- Useful searches: `site:competitor.com FAQ`, `competitor pricing FAQ`, `competitor help center`.

## 4. Tool Quick Table

| Tool | Free tier | Paid start | Strength |
|---|---|---|---|
| AlsoAsked | 3/day (PNG) | ~$12/mo | PAA tree hierarchy, Deep Search ~150 questions |
| Answer Socrates | 3/day + CSV | ~$9/mo | ~60 PAA questions/run, clustering |
| AnswerThePublic | 3/day partial | ~$11–20/mo | Autocomplete wheel, multi-platform |
| KeywordsPeopleUse | 10/mo | ~$12/mo | Google + Reddit + Quora in one |
| Ahrefs | AWT basics | Lite ~$129/mo | Bulk export + pivot workflow |
| Semrush | limited | ~$140/mo | Question filter + PAA SERP filter |
| GummySearch | 50 searches | paid | Reddit audience research |

(Prices as of 2026-07 research; treat as approximate bands.)
