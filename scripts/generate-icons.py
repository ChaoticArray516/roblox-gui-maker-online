#!/usr/bin/env python3
"""
Generate standard icon sizes from public/logo.png.

Uses Pillow (already available in this environment) so no new Node deps are needed.
Source logo has transparent background; we composite onto the site's theme color
#0B0B12 so the icons look correct on light/white surfaces (Google search results).
"""

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "public" / "logo.png"
THEME_BG = (11, 11, 18)  # #0B0B12


def generate(size: int, out_path: Path) -> None:
    with Image.open(SOURCE) as src:
        src = src.convert("RGBA")
        # Resize with high-quality downsampling, preserving aspect ratio.
        src.thumbnail((size, size), Image.Resampling.LANCZOS)

        canvas = Image.new("RGBA", (size, size), (*THEME_BG, 255))
        x = (size - src.width) // 2
        y = (size - src.height) // 2
        canvas.paste(src, (x, y), src)
        canvas.save(out_path, "PNG")
        print(f"Generated {out_path.relative_to(ROOT)} ({size}x{size})")


def main() -> None:
    # Next.js App Router convention files
    generate(180, ROOT / "src" / "app" / "icon.png")
    generate(180, ROOT / "src" / "app" / "apple-icon.png")

    # Public static assets referenced by metadata / webmanifest
    generate(180, ROOT / "public" / "apple-touch-icon.png")
    generate(180, ROOT / "public" / "icon-180x180.png")
    generate(192, ROOT / "public" / "icon-192x192.png")


if __name__ == "__main__":
    main()
