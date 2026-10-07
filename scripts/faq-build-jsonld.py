#!/usr/bin/env python3
"""build_jsonld.py — FAQ JSON → FAQPage JSON-LD + lint.

Input JSON format (file path as argv[1]):
[
  {"q": "Can I cancel anytime?",
   "capsule": "Yes — cancel in two clicks ...",
   "detail": "optional expansion ...",        # optional
   "category": "pricing-objection"},           # optional
  ...
]

Output: FAQPage JSON-LD to stdout (or --out file).
Lint checks (warnings; --strict turns them into exit 1):
  - empty question/answer
  - duplicate questions
  - first answer sentence > 25 words
  - capsule outside 40–60 words
  - total answer > 150 words
  - AI-flavor vocabulary hits
Usage:
  python3 build_jsonld.py faqs.json [--out faq.jsonld] [--strict]
"""
import json
import re
import sys

AI_WORDS = {
    "delve", "tapestry", "underscore", "testament", "showcase", "garner",
    "bolster", "intricate", "interplay", "meticulous", "pivotal", "vibrant",
    "crucial", "enhance", "foster", "align with", "valuable", "enduring",
    "cutting-edge", "game-changing", "revolutionary", "seamless", "robust",
    "comprehensive", "state-of-the-art", "best-in-class", "utilize",
    "in today's fast-paced world", "ever-evolving landscape",
}


def wc(text: str) -> int:
    return len(re.findall(r"[A-Za-z0-9$€£%][\w$€£%./-]*", text))


def first_sentence(text: str) -> str:
    m = re.split(r"(?<=[.!?])\s", text.strip(), maxsplit=1)
    return m[0] if m else text


def lint(faqs: list) -> list:
    problems = []
    seen = set()
    for i, f in enumerate(faqs, 1):
        q = (f.get("q") or "").strip()
        capsule = (f.get("capsule") or "").strip()
        detail = (f.get("detail") or "").strip()
        full = f"{capsule} {detail}".strip()
        tag = f"Q{i} ({q[:40]}...)" if q else f"Q{i}"
        if not q:
            problems.append(f"{tag}: empty question")
        if not capsule:
            problems.append(f"{tag}: empty capsule")
            continue
        key = re.sub(r"\W+", "", q.lower())
        if key in seen:
            problems.append(f"{tag}: duplicate question")
        seen.add(key)
        fs_wc = wc(first_sentence(capsule))
        if fs_wc > 25:
            problems.append(f"{tag}: first sentence {fs_wc} words (>25)")
        c_wc = wc(capsule)
        if not (40 <= c_wc <= 60):
            problems.append(f"{tag}: capsule {c_wc} words (target 40-60)")
        t_wc = wc(full)
        if t_wc > 150:
            problems.append(f"{tag}: total {t_wc} words (>150)")
        low = full.lower()
        hits = sorted(w for w in AI_WORDS if w in low)
        if hits:
            problems.append(f"{tag}: AI-flavor words: {', '.join(hits)}")
    return problems


def build(faqs: list) -> dict:
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": f["q"].strip(),
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": f"{f.get('capsule', '').strip()} {f.get('detail', '').strip()}".strip(),
                },
            }
            for f in faqs
        ],
    }


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    with open(sys.argv[1], encoding="utf-8") as fh:
        faqs = json.load(fh)
    strict = "--strict" in sys.argv
    out_path = None
    if "--out" in sys.argv:
        out_path = sys.argv[sys.argv.index("--out") + 1]
    problems = lint(faqs)
    doc = json.dumps(build(faqs), ensure_ascii=False, indent=2)
    if out_path:
        with open(out_path, "w", encoding="utf-8") as fh:
            fh.write(doc + "\n")
    else:
        print(doc)
    for p in problems:
        print(f"LINT: {p}", file=sys.stderr)
    print(f"Lint: {len(problems)} problem(s) across {len(faqs)} question(s)", file=sys.stderr)
    return 1 if (strict and problems) else 0


if __name__ == "__main__":
    sys.exit(main())
