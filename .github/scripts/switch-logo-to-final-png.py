from pathlib import Path
import json

OLD = 'yk-circular-elite-v2.svg'
NEW = 'yk-chatgpt-shared-logo.png'

TEXT_FILES = [
    Path('index.html'),
    Path('case-studies/index.html'),
    Path('photo-gallery/index.html'),
    Path('404.html'),
    Path('footer-signature.css'),
    Path('style.css'),
]

for path in TEXT_FILES:
    text = path.read_text(encoding='utf-8')
    if OLD not in text:
        raise SystemExit(f'Expected broken SVG reference missing from {path}')
    text = text.replace(OLD, NEW)
    if path.suffix == '.html':
        text = text.replace('type="image/svg+xml"', 'type="image/png"')
        text = text.replace('style.css?v=26', 'style.css?v=27')
        text = text.replace('footer-signature.css?v=5', 'footer-signature.css?v=6')
    path.write_text(text, encoding='utf-8')

manifest_path = Path('site.webmanifest')
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
manifest['icons'] = [
    {
        'src': 'assets/yk-chatgpt-shared-logo.png',
        'sizes': '256x256',
        'type': 'image/png',
        'purpose': 'any'
    }
]
manifest_path.write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')

logo = Path('assets/yk-chatgpt-shared-logo.png')
logo_bytes = logo.read_bytes()
if not logo_bytes.startswith(b'\x89PNG\r\n\x1a\n'):
    raise SystemExit('Existing selected logo is not a valid PNG')
if len(logo_bytes) < 10_000:
    raise SystemExit('Existing selected logo is unexpectedly small')

production = TEXT_FILES + [manifest_path]
combined = '\n'.join(path.read_text(encoding='utf-8') for path in production)
if OLD in combined:
    raise SystemExit('A production reference to the broken SVG remains')
if combined.count(NEW) < 10:
    raise SystemExit('The selected PNG was not propagated across all branding surfaces')

for forbidden in ('3958760', 'WorldIDSource', 'CVSS 9.2', '$25K'):
    if forbidden in combined:
        raise SystemExit(f'Private active-report detail detected: {forbidden}')
