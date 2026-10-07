#!/usr/bin/env python3
"""
Extract template metadata + client/server Luau code blocks from
prompt/graph/temps/extracted/template-*.md

Outputs:
- workspace/test/stage6_extract.json  (metadata summary)
- workspace/public/templates/luau/{slug}/client.lua
- workspace/public/templates/luau/{slug}/server.lua (only if server section exists)
"""

import json
import re
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent.parent
SRC_DIR = BASE / "prompt" / "graph" / "temps" / "extracted"
OUT_DIR = BASE / "workspace" / "public" / "templates" / "luau"
TEST_DIR = BASE / "workspace" / "test"

SLUG_MAP = {
    "template-fps-hud.md": "fps-hud",
    "template-simulator-hud.md": "simulator-hud",
    "template-health-bar.md": "health-bar",
    "template-global-leaderboard.md": "leaderboard",
    "template-dialogue-system.md": "dialogue-system",
    "template-main-menu.md": "main-menu",
    "template-settings-menu.md": "settings",
    "template-obby-start-screen.md": "obby-start-screen",
    "template-pet-shop.md": "pet-shop",
    "template-rpg-inventory.md": "rpg-inventory",
    "template-shop-ui.md": "shop-ui",
    "template-loading-screen.md": "loading-screen",
}


def slugify(filename: str) -> str:
    return SLUG_MAP.get(filename, filename.replace("template-", "").replace(".md", ""))


def extract_section(text: str, start_re: str, end_res=None):
    end_res = end_res or [r"^##\s+\d+\."]
    pattern = re.compile(start_re, re.MULTILINE)
    match = pattern.search(text)
    if not match:
        return None
    start = match.start()
    end = len(text)
    for end_re in end_res:
        em = re.compile(end_re, re.MULTILINE).search(text, start + 1)
        if em:
            end = min(end, em.start())
    return text[start:end]


def extract_first_lua_block(section: str) -> str | None:
    pattern = re.compile(r"```lua\n(.*?)```", re.DOTALL)
    m = pattern.search(section)
    if not m:
        return None
    return m.group(1).strip()


def parse_overview_table(section: str) -> dict:
    rows = {}
    for line in section.splitlines():
        line = line.strip()
        if line.startswith("|") and "Property" not in line and "---" not in line:
            parts = [p.strip() for p in line.split("|")]
            parts = [p for p in parts if p]
            if len(parts) >= 2:
                key = parts[0].strip("*").strip()
                val = parts[1].strip()
                rows[key] = val
    return rows


def parse_features(section: str) -> list[str]:
    feats = []
    in_features = False
    for line in section.splitlines():
        s = line.strip()
        if re.match(r"^#{1,3}\s+.*Features", s, re.IGNORECASE):
            in_features = True
            continue
        if in_features:
            if s.startswith("##"):
                break
            if s.startswith("-") or s.startswith("*"):
                feats.append(s.lstrip("-* ").strip())
            elif re.match(r"^\d+\.", s):
                feats.append(re.sub(r"^\d+\.\s*", "", s))
    return feats


def parse_description(section: str) -> str:
    lines = section.splitlines()
    for i, line in enumerate(lines):
        s = line.strip()
        if re.match(r"^#{1,3}\s+Description", s, re.IGNORECASE):
            for j in range(i + 1, len(lines)):
                candidate = lines[j].strip()
                if candidate:
                    return candidate
            return ""
        if s.startswith("**Description:**"):
            return s.split("**Description:**", 1)[1].strip()
        if s.startswith("Description:"):
            return s.split("Description:", 1)[1].strip()
    return ""


def main():
    meta = {}
    for md in sorted(SRC_DIR.glob("template-*.md")):
        slug = slugify(md.name)
        text = md.read_text(encoding="utf-8")

        overview = extract_section(text, r"^##\s+1\.\s+Template Overview")
        overview_rows = parse_overview_table(overview or "")
        features = parse_features(overview or "")
        description = parse_description(overview or "")

        client_section = extract_section(
            text, r"^##\s+3\.\s+.*Client", [r"^##\s+4\."]
        )
        server_section = extract_section(
            text, r"^##\s+4\.\s+.*Server", [r"^##\s+5\."]
        )

        client_code = extract_first_lua_block(client_section or "")
        server_code = extract_first_lua_block(server_section or "")

        meta[slug] = {
            "filename": md.name,
            "overview": overview_rows,
            "description": description,
            "features": features,
            "hasClient": bool(client_code),
            "hasServer": bool(server_code),
        }

        slug_dir = OUT_DIR / slug
        slug_dir.mkdir(parents=True, exist_ok=True)
        if client_code:
            (slug_dir / "client.lua").write_text(client_code + "\n", encoding="utf-8")
        if server_code:
            (slug_dir / "server.lua").write_text(server_code + "\n", encoding="utf-8")

    TEST_DIR.mkdir(parents=True, exist_ok=True)
    (TEST_DIR / "stage6_extract.json").write_text(
        json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(f"Extracted {len(meta)} templates to {OUT_DIR}")
    print(f"Metadata summary: {TEST_DIR / 'stage6_extract.json'}")


if __name__ == "__main__":
    main()
