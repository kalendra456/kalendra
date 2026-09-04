from pathlib import Path
import json
import shutil

ROOT = Path(".")
SOURCE = ROOT / "assets" / "yk-circular-elite.png"
TARGET = ROOT / "assets" / "yk-chatgpt-shared-logo.png"

if not SOURCE.exists():
    raise SystemExit("Source Circular Elite PNG is missing")

source_data = SOURCE.read_bytes()
if not source_data.startswith(b"\x89PNG\r\n\x1a\n") or len(source_data) < 10_000:
    raise SystemExit("Source Circular Elite PNG is invalid")

shutil.copyfile(SOURCE, TARGET)


def update_text(filename: str, changes: list[tuple[str, str]]) -> None:
    path = ROOT / filename
    text = path.read_text(encoding="utf-8")
    for old, new in changes:
        if old not in text:
            raise SystemExit(f"Expected reference missing in {filename}: {old}")
        text = text.replace(old, new)
    path.write_text(text, encoding="utf-8")


update_text(
    "index.html",
    [
        ("assets/yk-circular-elite.svg", "assets/yk-chatgpt-shared-logo.png"),
        ('type="image/svg+xml"', 'type="image/png"'),
        ("style.css?v=24", "style.css?v=25"),
        ("footer-signature.css?v=3", "footer-signature.css?v=4"),
    ],
)

update_text(
    "case-studies/index.html",
    [
        ("../assets/yk-circular-elite.svg", "../assets/yk-chatgpt-shared-logo.png"),
        ('type="image/svg+xml"', 'type="image/png"'),
        ("../style.css?v=24", "../style.css?v=25"),
        ("../footer-signature.css?v=3", "../footer-signature.css?v=4"),
    ],
)

update_text(
    "photo-gallery/index.html",
    [
        ("../assets/yk-circular-elite.svg", "../assets/yk-chatgpt-shared-logo.png"),
        ('type="image/svg+xml"', 'type="image/png"'),
        ("../style.css?v=24", "../style.css?v=25"),
        ("../footer-signature.css?v=3", "../footer-signature.css?v=4"),
    ],
)

update_text(
    "404.html",
    [
        ("/kalendra/assets/yk-circular-elite.svg", "/kalendra/assets/yk-chatgpt-shared-logo.png"),
        ('type="image/svg+xml"', 'type="image/png"'),
        ("/kalendra/style.css?v=24", "/kalendra/style.css?v=25"),
    ],
)

update_text(
    "footer-signature.css",
    [('url("assets/yk-circular-elite.svg")', 'url("assets/yk-chatgpt-shared-logo.png")')],
)

style_path = ROOT / "style.css"
style = style_path.read_text(encoding="utf-8")
if "yk-circular-elite.svg" not in style:
    raise SystemExit("Expected Circular Elite SVG selector missing in style.css")
style = style.replace("yk-circular-elite.svg", "yk-chatgpt-shared-logo.png")

visibility_marker = "/* Exact ChatGPT-shared Circular Elite logo */"
if visibility_marker not in style:
    style += """

/* Exact ChatGPT-shared Circular Elite logo */
.brand-mark[src$="yk-chatgpt-shared-logo.png"] {
  display: block !important;
  width: 46px;
  height: 46px;
  flex: 0 0 46px;
  object-fit: contain;
  opacity: 1 !important;
  visibility: visible !important;
  border-radius: 50%;
  filter:
    drop-shadow(0 8px 18px rgba(0, 0, 0, .22))
    drop-shadow(0 0 11px color-mix(in srgb, var(--accent) 32%, transparent));
}

.footer-brand .brand-mark[src$="yk-chatgpt-shared-logo.png"] {
  width: 42px;
  height: 42px;
  flex-basis: 42px;
}

.error-panel .brand-mark[src$="yk-chatgpt-shared-logo.png"] {
  width: 64px;
  height: 64px;
  flex-basis: 64px;
}

@media (max-width: 620px) {
  .brand-mark[src$="yk-chatgpt-shared-logo.png"] {
    width: 42px;
    height: 42px;
    flex-basis: 42px;
  }
}
"""
style_path.write_text(style, encoding="utf-8")

manifest_path = ROOT / "site.webmanifest"
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
manifest["icons"] = [
    {
        "src": "assets/yk-chatgpt-shared-logo.png",
        "sizes": "256x256",
        "type": "image/png",
        "purpose": "any",
    }
]
manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

production_files = [
    ROOT / "index.html",
    ROOT / "case-studies" / "index.html",
    ROOT / "photo-gallery" / "index.html",
    ROOT / "404.html",
    ROOT / "footer-signature.css",
    ROOT / "style.css",
    ROOT / "site.webmanifest",
]
combined = "\n".join(path.read_text(encoding="utf-8") for path in production_files)

if "yk-circular-elite.svg" in combined:
    raise SystemExit("Approximate SVG is still referenced by a production surface")
if combined.count("yk-chatgpt-shared-logo.png") < 10:
    raise SystemExit("Exact shared logo was not propagated everywhere")
if TARGET.read_bytes() != source_data:
    raise SystemExit("Exact logo copy does not match the selected source image")
