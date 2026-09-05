from pathlib import Path

for name, prefix in (("index.html", ""), ("os/index.html", "../")):
    path = Path(name)
    source = path.read_text(encoding="utf-8")
    if source.count("</head>") != 1:
        raise SystemExit(f"Expected one head in {name}")
    if "view-choice.js" in source:
        raise SystemExit(f"View chooser is already installed in {name}")
    tags = (f'<link rel="stylesheet" href="{prefix}view-choice.css?v=1">\n'
            f'<script src="{prefix}view-choice.js?v=1" defer></script>\n')
    path.write_text(source.replace("</head>", tags + "</head>", 1), encoding="utf-8")

# Existing smoke tests exercise the workspace, not the welcome prompt.
# Let them continue past the new chooser when it would obstruct an action.
path = Path(".github/workflows/kalendra-os-live-check.yml")
if path.exists():
    source = path.read_text(encoding="utf-8")
    marker = "              page.on('pageerror', lambda error: errors.append(str(error)))\n"
    if source.count(marker) != 1:
        raise SystemExit("Expected the existing browser-test page setup")
    extra = "              page.add_locator_handler(page.locator('#portfolio-view-dialog[open]'), lambda: page.locator('#portfolio-view-dialog .vc-stay').click())\n"
    path.write_text(source.replace(marker, marker + extra, 1), encoding="utf-8")
