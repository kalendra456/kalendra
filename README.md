# Yaswanth Kalendra — Cybersecurity Portfolio

A fast, accessible, dependency-free portfolio for **Yaswanth Kalendra**, positioned first for offensive-security, VAPT, penetration-testing, and application-security roles, with SOC and defensive engineering retained as a supporting differentiator.

**Live site:** https://kalendra456.github.io/kalendra/

## What this site communicates

- Offensive-first positioning for VAPT, penetration testing, application security, and product security
- Manual web/API exploitation, authorization testing, business-logic analysis, complex protocol and state-machine reasoning, SAST/DAST correlation, and source-assisted validation
- Consulting-oriented assessment delivery: scope control, evidence governance, severity calibration, remediation guidance, and retesting
- Critical-impact research framed around exploitability, state integrity, availability, and business consequence, with confirmed bounty amounts used as supporting evidence rather than a capability ceiling
- Hands-on Wazuh SIEM/XDR, endpoint telemetry and EDR context, OpenSearch-backed analytics, network monitoring, and SOAR-aligned alert-to-incident automation as secondary operational context
- A clear professional path for recruiters, security leaders, engineering teams, and consulting organizations to make contact

## Design and engineering

- Semantic HTML with accessible landmarks and keyboard navigation
- Responsive layout for desktop, tablet, and mobile
- Balanced responsive typography with restrained enterprise-scale headings
- Dark and light themes with saved user preference
- No frontend framework, third-party font, analytics tracker, or runtime dependency
- CSS-only security interface visuals to reduce page weight
- Progressive reveal effects that respect `prefers-reduced-motion`
- Accessible, keyboard-operable proof lightbox with no third-party dependency
- Emphasized credential statuses and prominent PDF resume actions
- Browser-viewable defensive engineering case studies with full DOCX downloads
- SEO metadata, Open Graph data, structured data, sitemap, manifest, and a custom 404 page
- Dedicated recognition gallery with safer public descriptions

## Repository structure

```text
.
├── index.html                 # Main portfolio
├── style.css                  # Shared design system
├── script.js                  # Theme, navigation, accessibility, and UI behavior
├── lightbox.js                # Accessible proof-image viewer
├── polish.css                 # Recruiter-focused functional polish
├── typography.css             # Balanced responsive type hierarchy
├── case-studies/
│   └── index.html             # Browser-viewable defensive engineering cases
├── photo-gallery/
│   ├── index.html             # Recognition proof archive
│   └── images/                # Existing proof screenshots
├── assets/
│   ├── yk-mark.svg            # Portfolio identity mark
│   ├── Yaswanth_Kalendra_Resume.pdf # ATS-friendly recruiter resume
│   └── recognitions/          # Main-page recognition previews
├── docs/                      # Selected project documentation
├── 404.html                   # GitHub Pages fallback
├── site.webmanifest           # Installable-site metadata
├── robots.txt
└── sitemap.xml
```

## Local preview

The site requires no build step. From the repository root, run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deployment

The repository is deployed through GitHub Pages. Updates to the configured production branch trigger the existing Pages workflow.

## Responsible disclosure and privacy

The public portfolio intentionally excludes private report contents, credentials, customer-identifying details, internal assets, and unreleased vulnerability information. Public screenshots should be reviewed before each update to ensure no sensitive data is exposed.

## Contact

- Email: `yaswanthkukkala123@gmail.com`
- LinkedIn: https://www.linkedin.com/in/yaswanth-kalendra-kukkala-37b7701a0/
- GitHub: https://github.com/kalendra456
