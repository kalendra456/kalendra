from pathlib import Path
import json


def read(path: str) -> str:
    return Path(path).read_text(encoding="utf-8")


def write(path: str, text: str) -> None:
    Path(path).write_text(text, encoding="utf-8")


def replace_required(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f"Missing expected text for {label}: {old!r}")
    return text.replace(old, new)


# Main portfolio: favicon, header/footer marks and structured data.
index = read("index.html")
index = replace_required(
    index,
    "assets/yk-mark.svg",
    "assets/yk-circular-elite.png",
    "main-page logo references",
)
index = index.replace('type="image/svg+xml"', 'type="image/png"', 1)
if 'rel="apple-touch-icon"' not in index:
    index = index.replace(
        '<link rel="icon" href="assets/yk-circular-elite.png" type="image/png">',
        '<link rel="icon" href="assets/yk-circular-elite.png" type="image/png">\n'
        '  <link rel="apple-touch-icon" href="assets/yk-circular-elite.png">',
        1,
    )
index = index.replace(
    '"image": "https://kalendra456.github.io/kalendra/assets/cyber.png"',
    '"image": "https://kalendra456.github.io/kalendra/assets/yk-circular-elite.png"',
    1,
)
index = index.replace("footer-signature.css?v=1", "footer-signature.css?v=2")
write("index.html", index)

# Case-study page.
case = read("case-studies/index.html")
case = replace_required(
    case,
    "../assets/yk-mark.svg",
    "../assets/yk-circular-elite.png",
    "case-study logo references",
)
case = case.replace('type="image/svg+xml"', 'type="image/png"', 1)
if 'rel="apple-touch-icon"' not in case:
    case = case.replace(
        '<link rel="icon" href="../assets/yk-circular-elite.png" type="image/png">',
        '<link rel="icon" href="../assets/yk-circular-elite.png" type="image/png">\n'
        '  <link rel="apple-touch-icon" href="../assets/yk-circular-elite.png">',
        1,
    )
case = case.replace("../footer-signature.css?v=1", "../footer-signature.css?v=2")
write("case-studies/index.html", case)

# Recognition gallery.
gallery = read("photo-gallery/index.html")
gallery = replace_required(
    gallery,
    "../assets/yk-mark.svg",
    "../assets/yk-circular-elite.png",
    "gallery logo references",
)
gallery = gallery.replace('type="image/svg+xml"', 'type="image/png"', 1)
if 'rel="apple-touch-icon"' not in gallery:
    gallery = gallery.replace(
        '<link rel="icon" href="../assets/yk-circular-elite.png" type="image/png">',
        '<link rel="icon" href="../assets/yk-circular-elite.png" type="image/png">\n'
        '  <link rel="apple-touch-icon" href="../assets/yk-circular-elite.png">',
        1,
    )
gallery = gallery.replace("../footer-signature.css?v=1", "../footer-signature.css?v=2")
write("photo-gallery/index.html", gallery)

# 404 page.
error = read("404.html")
error = replace_required(
    error,
    "/kalendra/assets/yk-mark.svg",
    "/kalendra/assets/yk-circular-elite.png",
    "404 logo references",
)
error = error.replace('type="image/svg+xml"', 'type="image/png"', 1)
if 'rel="apple-touch-icon"' not in error:
    error = error.replace(
        '<link rel="icon" href="/kalendra/assets/yk-circular-elite.png" type="image/png">',
        '<link rel="icon" href="/kalendra/assets/yk-circular-elite.png" type="image/png">\n'
        '  <link rel="apple-touch-icon" href="/kalendra/assets/yk-circular-elite.png">',
        1,
    )
write("404.html", error)

# Web app manifest.
manifest_path = Path("site.webmanifest")
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
manifest["icons"] = [
    {
        "src": "assets/yk-circular-elite.png",
        "sizes": "256x256",
        "type": "image/png",
        "purpose": "any",
    }
]
manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

# Footer lockup: use the selected Circular Elite emblem.
footer_css = read("footer-signature.css")
footer_css = replace_required(
    footer_css,
    'url("assets/yk-mark.svg")',
    'url("assets/yk-circular-elite.png")',
    "footer emblem image",
)
footer_css = footer_css.replace(
    "filter:\n"
    "    drop-shadow(0 20px 42px rgba(0, 0, 0, .24))\n"
    "    drop-shadow(0 0 26px color-mix(in srgb, var(--accent) 18%, transparent));",
    "filter:\n"
    "    drop-shadow(0 22px 48px rgba(0, 0, 0, .28))\n"
    "    drop-shadow(0 0 30px color-mix(in srgb, var(--accent) 24%, transparent));",
    1,
)
write("footer-signature.css", footer_css)

# Compact marks: give the detailed circular emblem enough visual size.
style = read("style.css")
marker = "/* Circular Elite brand mark */"
if marker not in style:
    style += """

/* Circular Elite brand mark */
.brand-mark[src$="yk-circular-elite.png"] {
  width: 46px;
  height: 46px;
  object-fit: contain;
  border-radius: 50%;
  filter:
    drop-shadow(0 8px 18px rgba(0, 0, 0, .2))
    drop-shadow(0 0 10px color-mix(in srgb, var(--accent) 28%, transparent));
}

.footer-brand .brand-mark[src$="yk-circular-elite.png"] {
  width: 42px;
  height: 42px;
}

.error-panel .brand-mark[src$="yk-circular-elite.png"] {
  width: 64px;
  height: 64px;
}

@media (max-width: 620px) {
  .brand-mark[src$="yk-circular-elite.png"] {
    width: 42px;
    height: 42px;
  }
}
"""
write("style.css", style)

# Repository documentation.
readme = read("README.md")
readme = readme.replace(
    "│   ├── yk-mark.svg            # Portfolio identity mark",
    "│   ├── yk-circular-elite.png  # Primary Circular Elite YK identity mark\n"
    "│   ├── yk-mark.svg            # Legacy vector identity mark",
    1,
)
write("README.md", readme)

# Integrity and disclosure checks.
production_files = [
    Path("index.html"),
    Path("case-studies/index.html"),
    Path("photo-gallery/index.html"),
    Path("404.html"),
    Path("site.webmanifest"),
    Path("footer-signature.css"),
    Path("style.css"),
]
combined = "\n".join(path.read_text(encoding="utf-8") for path in production_files)
if "yk-mark.svg" in combined:
    raise SystemExit("A production reference to the legacy logo remains")
if combined.count("yk-circular-elite.png") < 10:
    raise SystemExit("Circular Elite logo was not propagated to all intended surfaces")
logo_path = Path("assets/yk-circular-elite.png")
if not logo_path.exists() or logo_path.stat().st_size < 10_000:
    raise SystemExit("Circular Elite logo asset is missing or invalid")
for forbidden in ("3958760", "WorldIDSource", "CVSS 9.2", "$25K"):
    if forbidden in combined:
        raise SystemExit(f"Private active-report detail detected: {forbidden}")
