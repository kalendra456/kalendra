from pathlib import Path


ROOT = Path('.')
index_path = ROOT / 'index.html'
gallery_path = ROOT / 'photo-gallery' / 'index.html'
readme_path = ROOT / 'README.md'
sitemap_path = ROOT / 'sitemap.xml'

index = index_path.read_text(encoding='utf-8')
gallery = gallery_path.read_text(encoding='utf-8')
readme = readme_path.read_text(encoding='utf-8')
sitemap = sitemap_path.read_text(encoding='utf-8')


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f'Missing expected content for {label}')
    return text.replace(old, new, 1)


# Shared functional-polish stylesheet.
index = replace_once(
    index,
    '  <link rel="stylesheet" href="style.css?v=23">',
    '  <link rel="stylesheet" href="style.css?v=23">\n  <link rel="stylesheet" href="polish.css?v=1">',
    'main polish stylesheet',
)
gallery = replace_once(
    gallery,
    '  <link rel="stylesheet" href="../style.css?v=23">',
    '  <link rel="stylesheet" href="../style.css?v=23">\n  <link rel="stylesheet" href="../polish.css?v=1">',
    'gallery polish stylesheet',
)

# Resume action alongside primary hero evidence actions.
hero_gallery_button = '''      <a class="button button-secondary" href="photo-gallery/">
        View validation evidence
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5M10 14 19 5M19 13v6H5V5h6"></path></svg>
      </a>'''
hero_resume_button = hero_gallery_button + '''
      <a class="button button-secondary resume-button" href="assets/Yaswanth_Kalendra_Resume.pdf" download>
        Download resume (PDF)
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 20h14"></path></svg>
      </a>'''
index = replace_once(index, hero_gallery_button, hero_resume_button, 'hero resume action')

# Recruiter logistics, kept concise and factual.
recruiter_bar = '''<section class="recruiter-bar shell" aria-label="Recruiter logistics" data-reveal>
  <div>
    <span class="recruiter-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z"></path><circle cx="12" cy="10" r="2"></circle></svg></span>
    <span><small>Location</small><strong>Bengaluru, India</strong></span>
  </div>
  <div>
    <span class="recruiter-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16v11H4zM8 7V4h8v3M9 18v2h6v-2"></path></svg></span>
    <span><small>Work modes</small><strong>Remote · Hybrid · On-site</strong></span>
  </div>
  <div>
    <span class="recruiter-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 17h16M6 17l2-7h8l2 7M9 10V6h6v4"></path></svg></span>
    <span><small>Mobility</small><strong>Open to relocation</strong></span>
  </div>
  <div>
    <span class="recruiter-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg></span>
    <span><small>Notice period</small><strong>30 days</strong></span>
  </div>
</section>

'''
index = replace_once(
    index,
    '<section class="metrics shell" aria-label="Professional impact" data-reveal>',
    recruiter_bar + '<section class="metrics shell" aria-label="Professional impact" data-reveal>',
    'recruiter logistics bar',
)

# Certification badges with clear status hierarchy.
index = replace_once(
    index,
    '<span><i class="complete"></i><strong>CEH v13</strong><small>Certified · Mar 2026</small></span>',
    '<span class="credential-badge credential-certified"><i class="complete"></i><strong>CEH v13</strong><small>Certified · Mar 2026</small></span>',
    'CEH credential badge',
)
index = replace_once(
    index,
    '<span><i></i><strong>OSCP</strong><small>Active preparation</small></span>',
    '<span class="credential-badge credential-progress"><i></i><strong>OSCP</strong><small>Active preparation</small></span>',
    'OSCP credential badge',
)
index = replace_once(
    index,
    '<span><i></i><strong>CCSE</strong><small>In progress</small></span>',
    '<span class="credential-badge credential-progress"><i></i><strong>CCSE</strong><small>In progress</small></span>',
    'CCSE credential badge',
)

# Main-page proof cards now enlarge in-place instead of navigating away.
proof_links = {
    '<a class="proof-card" href="photo-gallery/" aria-label="View Drexel University Hall of Fame proof">':
        '<a class="proof-card" href="assets/recognitions/drexel-hof.jpg" data-lightbox data-lightbox-title="Drexel University · Hall of Fame" data-lightbox-description="Public Hall of Fame recognition following responsible vulnerability disclosure." aria-label="Enlarge Drexel University Hall of Fame proof">',
    '<a class="proof-card" href="photo-gallery/" aria-label="View SAP Security Credits proof">':
        '<a class="proof-card" href="assets/recognitions/sap-credits.jpg" data-lightbox data-lightbox-title="SAP · Security Credits" data-lightbox-description="Public SAP Security Credits recognition associated with responsible security research." aria-label="Enlarge SAP Security Credits proof">',
    '<a class="proof-card" href="photo-gallery/" aria-label="View Accenture responsible disclosure proof">':
        '<a class="proof-card" href="assets/recognitions/accenture-hof.jpg" data-lightbox data-lightbox-title="Accenture · Responsible Disclosure" data-lightbox-description="Public recognition associated with responsible vulnerability disclosure." aria-label="Enlarge Accenture responsible disclosure proof">',
    '<a class="proof-card" href="photo-gallery/" aria-label="View ALDI Hall of Fame proof">':
        '<a class="proof-card" href="assets/recognitions/aldi-hof.jpg" data-lightbox data-lightbox-title="ALDI · IT Security Hall of Fame" data-lightbox-description="Public Hall of Fame evidence for a valid responsible-disclosure finding." aria-label="Enlarge ALDI Hall of Fame proof">',
}
for old, new in proof_links.items():
    index = replace_once(index, old, new, f'proof lightbox link: {new[:72]}')

# Browser-viewable summaries first; full DOCX remains available as supporting evidence.
defensive_actions = {
    '<a class="text-link" href="docs/Wazuh_5_Beta2_ISO27001_Test_Lab_Documentation(2).docx" download>Download technical documentation <small>(DOCX)</small> <span aria-hidden="true">↓</span></a>':
        '''<div class="case-actions">
        <a class="text-link" href="case-studies/#wazuh-iso27001">View case study <span aria-hidden="true">→</span></a>
        <a class="text-link" href="docs/Wazuh_5_Beta2_ISO27001_Test_Lab_Documentation(2).docx" download>Download DOCX <span aria-hidden="true">↓</span></a>
      </div>''',
    '<a class="text-link" href="docs/Wazuh_5_Grafana_Zabbix_SOC_Dashboard_Documentation(1).docx" download>Download technical documentation <small>(DOCX)</small> <span aria-hidden="true">↓</span></a>':
        '''<div class="case-actions">
        <a class="text-link" href="case-studies/#unified-soc-dashboard">View case study <span aria-hidden="true">→</span></a>
        <a class="text-link" href="docs/Wazuh_5_Grafana_Zabbix_SOC_Dashboard_Documentation(1).docx" download>Download DOCX <span aria-hidden="true">↓</span></a>
      </div>''',
    '<a class="text-link" href="docs/Wazuh5%20Firewall%20Syslog%20Integration%20Documentation.docx" download>Download technical documentation <small>(DOCX)</small> <span aria-hidden="true">↓</span></a>':
        '''<div class="case-actions">
        <a class="text-link" href="case-studies/#firewall-syslog">View case study <span aria-hidden="true">→</span></a>
        <a class="text-link" href="docs/Wazuh5%20Firewall%20Syslog%20Integration%20Documentation.docx" download>Download DOCX <span aria-hidden="true">↓</span></a>
      </div>''',
    '<a class="text-link" href="docs/Wazuh_GLPI_SOC_Integration_Documentation(1).docx" download>Download technical documentation <small>(DOCX)</small> <span aria-hidden="true">↓</span></a>':
        '''<div class="case-actions">
        <a class="text-link" href="case-studies/#wazuh-glpi">View case study <span aria-hidden="true">→</span></a>
        <a class="text-link" href="docs/Wazuh_GLPI_SOC_Integration_Documentation(1).docx" download>Download DOCX <span aria-hidden="true">↓</span></a>
      </div>''',
}
for old, new in defensive_actions.items():
    index = replace_once(index, old, new, f'defensive case action: {new.splitlines()[1].strip()}')

# Resume action in the conversion-focused contact panel.
contact_copy_button = '''            <button class="button button-secondary copy-email" id="copyEmail" type="button" data-email="yaswanthkukkala123@gmail.com">'''
contact_resume = '''            <a class="button button-secondary resume-button" href="assets/Yaswanth_Kalendra_Resume.pdf" download>
              Download resume (PDF)
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 20h14"></path></svg>
            </a>
''' + contact_copy_button
index = replace_once(index, contact_copy_button, contact_resume, 'contact resume action')

# Enable accessible lightboxes on the main page and entire gallery.
index = replace_once(
    index,
    '  <script src="script.js?v=22" defer></script>',
    '  <script src="script.js?v=22" defer></script>\n  <script src="lightbox.js?v=1" defer></script>',
    'main lightbox script',
)

gallery_image_count = gallery.count('<a class="gallery-image"')
if gallery_image_count < 10:
    raise SystemExit(f'Unexpected gallery image count: {gallery_image_count}')
gallery = gallery.replace('<a class="gallery-image"', '<a class="gallery-image" data-lightbox')
gallery = replace_once(
    gallery,
    '  <script src="../script.js?v=22" defer></script>',
    '  <script src="../script.js?v=22" defer></script>\n  <script src="../lightbox.js?v=1" defer></script>',
    'gallery lightbox script',
)
gallery = replace_once(
    gallery,
    'Open any image to inspect the source screenshot at full size.',
    'Select any image to inspect the source screenshot in an accessible full-size viewer.',
    'gallery lightbox instruction',
)

# Repository documentation mirrors the recruiter workflow.
readme = replace_once(
    readme,
    '- Progressive reveal effects that respect `prefers-reduced-motion`',
    '- Progressive reveal effects that respect `prefers-reduced-motion`\n- Accessible, keyboard-operable proof lightbox with no third-party dependency\n- Recruiter logistics bar, emphasized credential statuses, and prominent PDF resume actions\n- Browser-viewable defensive engineering case studies with full DOCX downloads',
    'README design enhancements',
)
readme = replace_once(
    readme,
    '├── script.js                  # Theme, navigation, accessibility, and UI behavior',
    '├── script.js                  # Theme, navigation, accessibility, and UI behavior\n├── lightbox.js                # Accessible proof-image viewer\n├── polish.css                 # Recruiter-focused functional polish\n├── case-studies/\n│   └── index.html             # Browser-viewable defensive engineering cases',
    'README repository structure scripts',
)
readme = replace_once(
    readme,
    '│   ├── yk-mark.svg            # Portfolio identity mark\n│   └── recognitions/          # Main-page recognition previews',
    '│   ├── yk-mark.svg            # Portfolio identity mark\n│   ├── Yaswanth_Kalendra_Resume.pdf # ATS-friendly recruiter resume\n│   └── recognitions/          # Main-page recognition previews',
    'README resume asset',
)

# Add browser-viewable case studies to search discovery.
sitemap_entry = '''  <url>
    <loc>https://kalendra456.github.io/kalendra/case-studies/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
'''
sitemap = replace_once(sitemap, '</urlset>', sitemap_entry + '</urlset>', 'case-study sitemap entry')

# Safety and integrity checks.
required_index = (
    'Download resume (PDF)',
    'class="recruiter-bar shell"',
    'Bengaluru, India',
    'Remote · Hybrid · On-site',
    'Notice period',
    'credential-certified',
    'data-lightbox-title="Drexel University · Hall of Fame"',
    'case-studies/#wazuh-glpi',
    'lightbox.js?v=1',
)
for phrase in required_index:
    if phrase not in index:
        raise SystemExit(f'Missing required index phrase: {phrase}')

required_gallery = ('data-lightbox', '../polish.css?v=1', '../lightbox.js?v=1')
for phrase in required_gallery:
    if phrase not in gallery:
        raise SystemExit(f'Missing required gallery phrase: {phrase}')

for forbidden in ('3958760', 'WorldIDSource', 'WorldIDSatellite', '16,777,216', 'CVSS 9.2', '$25K'):
    for name, content in (('index.html', index), ('photo-gallery/index.html', gallery), ('README.md', readme)):
        if forbidden in content:
            raise SystemExit(f'Private active-report detail detected in {name}: {forbidden}')

if index.index('Core offensive expertise') > index.index('Defensive depth'):
    raise SystemExit('Defensive material appears before core offensive expertise')

if gallery.count('data-lightbox') != gallery_image_count:
    raise SystemExit('Not every gallery image received a lightbox trigger')

for expected_file in (
    ROOT / 'assets' / 'Yaswanth_Kalendra_Resume.pdf',
    ROOT / 'polish.css',
    ROOT / 'lightbox.js',
    ROOT / 'case-studies' / 'index.html',
):
    if not expected_file.exists():
        raise SystemExit(f'Required generated asset missing: {expected_file}')

index_path.write_text(index, encoding='utf-8')
gallery_path.write_text(gallery, encoding='utf-8')
readme_path.write_text(readme, encoding='utf-8')
sitemap_path.write_text(sitemap, encoding='utf-8')
