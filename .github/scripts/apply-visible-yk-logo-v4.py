from pathlib import Path
import json

OLD = "yk-chatgpt-shared-logo.png"
NEW = "yk-final-logo-v4.png"

text_files = [
    Path("index.html"),
    Path("case-studies/index.html"),
    Path("photo-gallery/index.html"),
    Path("404.html"),
    Path("footer-signature.css"),
    Path("style.css"),
]

for path in text_files:
    text = path.read_text(encoding="utf-8")
    if OLD not in text:
        raise SystemExit(f"Expected existing logo reference missing from {path}")
    text = text.replace(OLD, NEW)
    if path.suffix == ".html":
        text = text.replace("style.css?v=27", "style.css?v=28")
        text = text.replace("footer-signature.css?v=6", "footer-signature.css?v=7")
    path.write_text(text, encoding="utf-8")

manifest_path = Path("site.webmanifest")
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
manifest["icons"] = [
    {
        "src": "assets/yk-final-logo-v4.png",
        "sizes": "256x256",
        "type": "image/png",
        "purpose": "any"
    }
]
manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

logo = Path("assets/yk-final-logo-v4.png")
data = logo.read_bytes()
if not data.startswith(b"\x89PNG\r\n\x1a\n"):
    raise SystemExit("The new logo asset is not a valid PNG")
if len(data) < 10_000:
    raise SystemExit(f"The new logo asset is unexpectedly small: {len(data)} bytes")

combined = "\n".join(path.read_text(encoding="utf-8") for path in text_files + [manifest_path])
if OLD in combined:
    raise SystemExit("A production reference to the previous logo remains")
if combined.count(NEW) < 10:
    raise SystemExit("The new logo was not propagated across all intended surfaces")

for forbidden in ("3958760", "WorldIDSource", "CVSS 9.2", "$25K"):
    if forbidden in combined:
        raise SystemExit(f"Private active-report detail detected: {forbidden}")
