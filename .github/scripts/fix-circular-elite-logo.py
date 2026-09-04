from pathlib import Path
import json

ROOT = Path('.')

text_files = [
    Path('index.html'),
    Path('case-studies/index.html'),
    Path('photo-gallery/index.html'),
    Path('404.html'),
    Path('footer-signature.css'),
    Path('style.css'),
    Path('README.md'),
]

for path in text_files:
    text = path.read_text(encoding='utf-8')
    text = text.replace('yk-circular-elite.png', 'yk-circular-elite.svg')
    path.write_text(text, encoding='utf-8')

# Correct favicon MIME types after switching from PNG to SVG.
for path in [Path('index.html'), Path('case-studies/index.html'), Path('photo-gallery/index.html'), Path('404.html')]:
    text = path.read_text(encoding='utf-8')
    text = text.replace('href="assets/yk-circular-elite.svg" type="image/png"', 'href="assets/yk-circular-elite.svg" type="image/svg+xml"')
    text = text.replace('href="../assets/yk-circular-elite.svg" type="image/png"', 'href="../assets/yk-circular-elite.svg" type="image/svg+xml"')
    text = text.replace('href="/kalendra/assets/yk-circular-elite.svg" type="image/png"', 'href="/kalendra/assets/yk-circular-elite.svg" type="image/svg+xml"')
    # Bust cached CSS that still points to the previous PNG.
    text = text.replace('style.css?v=23', 'style.css?v=24')
    text = text.replace('footer-signature.css?v=2', 'footer-signature.css?v=3')
    path.write_text(text, encoding='utf-8')

# Update the installable web-app icon.
manifest_path = Path('site.webmanifest')
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
manifest['icons'] = [{
    'src': 'assets/yk-circular-elite.svg',
    'sizes': 'any',
    'type': 'image/svg+xml',
    'purpose': 'any'
}]
manifest_path.write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')

# Keep README accurate.
readme_path = Path('README.md')
readme = readme_path.read_text(encoding='utf-8')
readme = readme.replace(
    'yk-circular-elite.svg  # Primary Circular Elite YK identity mark',
    'yk-circular-elite.svg  # Primary scalable Circular Elite YK identity mark'
)
readme_path.write_text(readme, encoding='utf-8')

# Integrity checks.
logo = Path('assets/yk-circular-elite.svg')
if not logo.exists() or logo.stat().st_size < 2_000:
    raise SystemExit('Circular Elite SVG is missing or unexpectedly small')

production = [
    Path('index.html'),
    Path('case-studies/index.html'),
    Path('photo-gallery/index.html'),
    Path('404.html'),
    Path('footer-signature.css'),
    Path('style.css'),
    Path('site.webmanifest'),
]
combined = '\n'.join(p.read_text(encoding='utf-8') for p in production)
if 'yk-circular-elite.png' in combined:
    raise SystemExit('A production reference to the broken PNG remains')
if combined.count('yk-circular-elite.svg') < 10:
    raise SystemExit('SVG logo was not propagated to all intended surfaces')
if 'footer-signature.css?v=3' not in Path('index.html').read_text(encoding='utf-8'):
    raise SystemExit('Footer cache version was not updated')
if 'style.css?v=24' not in Path('index.html').read_text(encoding='utf-8'):
    raise SystemExit('Global style cache version was not updated')
for forbidden in ('3958760', 'WorldIDSource', 'CVSS 9.2', '$25K'):
    if forbidden in combined:
        raise SystemExit(f'Private active-report detail detected: {forbidden}')
