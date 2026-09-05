from pathlib import Path
import re

index = Path('index.html')
text = index.read_text(encoding='utf-8')

css = '  <link rel="stylesheet" href="os/launcher.css?v=1">\n'
if 'href="os/launcher.css?v=1"' not in text:
    if '</head>' not in text:
        raise SystemExit('index.html has no closing head element')
    text = text.replace('</head>', css + '</head>', 1)

start = '<!-- KALENDRA/OS entry point -->'
end = '<!-- /KALENDRA/OS entry point -->'
entry = '''<!-- KALENDRA/OS entry point -->
    <nav class="experience-switch" aria-label="Portfolio views">
      <span class="experience-label">Choose your perspective</span>
      <span class="current-view" aria-current="page">Recruiter View</span>
      <a class="os-launch" href="os/">Launch KALENDRA/OS <span aria-hidden="true">↗</span></a>
    </nav>
    <!-- /KALENDRA/OS entry point -->

    '''

if start in text:
    if end not in text:
        raise SystemExit('Incomplete existing KALENDRA/OS launcher block')
    text = re.sub(re.escape(start) + r'.*?' + re.escape(end) + r'\s*', entry, text, count=1, flags=re.S)
else:
    marker = '<div class="hero-links" aria-label="Professional profiles">'
    if text.count(marker) != 1:
        raise SystemExit('Expected exactly one hero-links insertion point')
    text = text.replace(marker, entry + marker, 1)

index.write_text(text, encoding='utf-8')

required = [Path('os/index.html'), Path('os/os.css'), Path('os/os.js'), Path('os/launcher.css')]
for item in required:
    if not item.is_file() or item.stat().st_size < 1000:
        raise SystemExit(f'Missing or incomplete runtime file: {item}')

runtime = '\n'.join(p.read_text(encoding='utf-8') for p in required)
if 'KALENDRA/OS' not in runtime or 'Findings Vault' not in runtime or 'terminal' not in runtime.lower():
    raise SystemExit('Runtime validation failed')
if 'assets/brand.png' in runtime:
    raise SystemExit('Packaged logo reference was not replaced')
