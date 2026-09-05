"""Move the existing OS entry point into the header without rewriting profile content."""
from pathlib import Path
import re

path = Path('index.html')
source = path.read_text(encoding='utf-8')
assert source.count('</head>') == 1, 'Expected one document head'
assert source.count('<div class="header-actions">') == 1, 'Expected one header action group'
assert 'view-choice.js' in source, 'Keep the existing two-view chooser installed'

if 'class="os-launch topbar-os-launch"' not in source:
    pattern = r'    <!-- KALENDRA/OS entry point -->.*?<!-- /KALENDRA/OS entry point -->\s*'
    source, count = re.subn(pattern, '', source, count=1, flags=re.S)
    assert count == 1, 'Expected the existing hero launcher to move'
    link = ('\n        <a class="os-launch topbar-os-launch" href="os/?portfolio-view=os" '
            'aria-label="Launch KALENDRA/OS interactive portfolio">'
            '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2"></rect>'
            '<path d="M8 21h8M12 17v4M7 8l3 3-3 3M13 13h4"></path></svg>'
            '<span>Launch KALENDRA/OS</span></a>')
    source = source.replace('<div class="header-actions">', '<div class="header-actions">' + link, 1)
if 'href="topbar-launch.css?v=1"' not in source:
    source = source.replace('</head>', '  <link rel="stylesheet" href="topbar-launch.css?v=1">\n</head>', 1)
assert source.count('class="os-launch topbar-os-launch"') == 1
assert 'view-choice.js' in source
path.write_text(source, encoding='utf-8')
print('Moved the existing OS launch link into the sticky header; chooser, logos and content preserved.')
