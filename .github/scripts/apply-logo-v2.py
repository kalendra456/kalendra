from pathlib import Path
import json

OLD = "yk-chatgpt-shared-logo.png"
NEW = "yk-circular-elite-v2.svg"

html_files = [
    Path("index.html"),
    Path("case-studies/index.html"),
    Path("photo-gallery/index.html"),
    Path("404.html"),
]

for path in html_files:
    text = path.read_text(encoding="utf-8")
    if OLD not in text:
        raise SystemExit(f"Expected legacy logo reference missing from {path}")
    text = text.replace(OLD, NEW)
    text = text.replace(
        f'href="assets/{NEW}" type="image/png"',
        f'href="assets/{NEW}" type="image/svg+xml"',
    )
    text = text.replace(
        f'href="../assets/{NEW}" type="image/png"',
        f'href="../assets/{NEW}" type="image/svg+xml"',
    )
    text = text.replace(
        f'href="/kalendra/assets/{NEW}" type="image/png"',
        f'href="/kalendra/assets/{NEW}" type="image/svg+xml"',
    )
    text = text.replace("style.css?v=25", "style.css?v=26")
    text = text.replace("footer-signature.css?v=4", "footer-signature.css?v=5")
    path.write_text(text, encoding="utf-8")

# Update both stylesheets and fit the new SVG precisely inside the lockup.
for path in (Path("style.css"), Path("footer-signature.css")):
    text = path.read_text(encoding="utf-8")
    if OLD not in text:
        raise SystemExit(f"Expected legacy logo selector missing from {path}")
    text = text.replace(OLD, NEW)
    if path.name == "footer-signature.css":
        text = text.replace(
            f'background: url("assets/{NEW}") center / 108% 108% no-repeat;',
            f'background: url("assets/{NEW}") center / 100% 100% no-repeat;',
        )
    path.write_text(text, encoding="utf-8")

# PWA icon metadata.
manifest_path = Path("site.webmanifest")
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
manifest["icons"] = [
    {
        "src": f"assets/{NEW}",
        "sizes": "any",
        "type": "image/svg+xml",
        "purpose": "any",
    }
]
manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

# Update the repository map if the existing identity entry is present.
readme_path = Path("README.md")
readme = readme_path.read_text(encoding="utf-8")
if "yk-circular-elite-v2.svg" not in readme:
    needle = "├── assets/"
    if needle in readme:
        readme = readme.replace(
            needle,
            needle + "\n│   ├── yk-circular-elite-v2.svg # Primary vector identity mark",
            1,
        )
readme_path.write_text(readme, encoding="utf-8")

# Final integrity checks.
production = html_files + [
    Path("style.css"),
    Path("footer-signature.css"),
    Path("site.webmanifest"),
]
combined = "\n".join(path.read_text(encoding="utf-8") for path in production)
if OLD in combined:
    raise SystemExit("A production reference to the legacy PNG remains")
if combined.count(NEW) < 12:
    raise SystemExit("The new SVG was not propagated to all intended surfaces")
if not Path(f"assets/{NEW}").exists():
    raise SystemExit("The new SVG asset is missing")
if Path(f"assets/{NEW}").stat().st_size < 5000:
    raise SystemExit("The new SVG asset appears incomplete")

for forbidden in ("3958760", "WorldIDSource", "CVSS 9.2", "$25K"):
    if forbidden in combined:
        raise SystemExit(f"Private active-report detail detected: {forbidden}")
