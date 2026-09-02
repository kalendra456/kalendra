from pathlib import Path


ROOT = Path('.')
index_path = ROOT / 'index.html'
readme_path = ROOT / 'README.md'

index = index_path.read_text(encoding='utf-8')
readme = readme_path.read_text(encoding='utf-8')


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f'Missing expected content for {label}')
    return text.replace(old, new, 1)


def replace_between(text: str, start_marker: str, end_marker: str, replacement: str, label: str) -> str:
    start = text.find(start_marker)
    if start < 0:
        raise SystemExit(f'Missing start marker for {label}')
    end = text.find(end_marker, start)
    if end < 0:
        raise SystemExit(f'Missing end marker for {label}')
    return text[:start] + replacement.rstrip() + text[end:]


# Load the compact layout layer after the typography hierarchy.
index = replace_once(
    index,
    '  <link rel="stylesheet" href="typography.css?v=1">',
    '  <link rel="stylesheet" href="typography.css?v=1">\n  <link rel="stylesheet" href="streamline.css?v=1">',
    'streamline stylesheet link',
)

expertise_grid = '''  <div class="expertise-grid expertise-grid-streamlined">
    <article class="expertise-card card" data-reveal>
      <span class="card-index">01</span>
      <div class="card-icon">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 6v5c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V6l-8-3Z"></path><path d="m9 12 2 2 4-5"></path></svg>
      </div>
      <h3>Web Application Penetration Testing</h3>
      <p>Manual assessment of authentication, authorization, session management, input handling, file workflows, and application-specific abuse cases beyond standard checklists.</p>
      <ul class="compact-list">
        <li>Authentication, session and SSO testing</li>
        <li>Injection, upload and client/server boundaries</li>
        <li>Chained exploit and impact validation</li>
      </ul>
    </article>

    <article class="expertise-card card" data-reveal>
      <span class="card-index">02</span>
      <div class="card-icon">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 9 4 12l4 3M16 9l4 3-4 3M14 5l-4 14"></path></svg>
      </div>
      <h3>API Security &amp; Authorization</h3>
      <p>Authorization-focused assessment of REST and JSON workflows across users, roles, tenants, objects, state transitions, and high-value business actions.</p>
      <ul class="compact-list">
        <li>BOLA / IDOR and object-ownership testing</li>
        <li>Role, tenant and privilege-boundary matrices</li>
        <li>Multi-step business-logic abuse validation</li>
      </ul>
    </article>

    <article class="expertise-card card" data-reveal>
      <span class="card-index">03</span>
      <div class="card-icon">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4zM8 8h8M8 12h5M8 16h7"></path></svg>
      </div>
      <h3>Application Security Validation</h3>
      <p>Source-code reasoning, SAST/DAST correlation, scanner triage, negative controls, reproducible PoCs, severity calibration, and developer-ready remediation guidance.</p>
      <ul class="compact-list">
        <li>Source-to-sink and trust-boundary analysis</li>
        <li>False-positive reduction and root-cause review</li>
        <li>Remediation verification and retesting</li>
      </ul>
    </article>

    <article class="expertise-card card" data-reveal>
      <span class="card-index">04</span>
      <div class="card-icon">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18V9M10 18V5M16 18v-7M22 18H2"></path><path d="m3 7 6-3 6 5 6-6"></path></svg>
      </div>
      <h3>Detection-Informed Security Engineering &amp; Telemetry</h3>
      <p>Practical SOC, SIEM/XDR, endpoint-telemetry, detection-rule, and incident-workflow experience used to assess whether preventive controls, EDR-visible signals, and response paths support realistic attack scenarios.</p>
      <ul class="compact-list">
        <li>SIEM correlation, endpoint telemetry &amp; EDR context</li>
        <li>Detection-rule validation, alert tuning &amp; investigation</li>
        <li>SOAR-aligned orchestration and incident workflow</li>
      </ul>
    </article>

    <article class="expertise-card expertise-card-protocol card" data-reveal>
      <span class="card-index">05</span>
      <div class="card-icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 6h5l2 3h7M5 18h5l2-3h7"></path>
          <circle cx="4" cy="6" r="2"></circle>
          <circle cx="20" cy="9" r="2"></circle>
          <circle cx="4" cy="18" r="2"></circle>
          <circle cx="20" cy="15" r="2"></circle>
          <path d="M10 6v12M14 9v6"></path>
        </svg>
      </div>
      <p class="eyebrow expertise-card-kicker">Advanced research capability</p>
      <h3>Complex Logic &amp; Protocol Security</h3>
      <p>Source-assisted validation of state-machine transitions, cross-system trust boundaries, resource constraints, and atomic workflows that can affect availability, state integrity, authorization, and downstream execution.</p>
      <ul class="compact-list">
        <li>State-machine, invariant and atomic-workflow analysis</li>
        <li>Cross-system trust and resource-boundary testing</li>
        <li>Availability, integrity and recovery-path validation</li>
      </ul>
      <span class="expertise-disclosure">Presented at methodology level; active private findings and target-identifying details remain excluded until disclosure is authorized.</span>
    </article>
  </div>'''

index = replace_between(
    index,
    '  <div class="expertise-grid">',
    '\n</section>\n\n    <section class="section methodology-section">',
    expertise_grid,
    'consolidated core expertise grid',
)

methodology_highlights = '''  <div class="offensive-methodology card" data-reveal>
    <div class="offensive-methodology-header">
      <div>
        <p class="eyebrow">Methodology highlights</p>
        <h3>Four repeatable controls behind the featured engagement.</h3>
      </div>
      <p>Condensed into one scan-friendly panel so the confirmed critical case remains the visual anchor while assessment breadth stays clear.</p>
    </div>

    <div class="offensive-methodology-grid">
      <article class="offensive-methodology-item">
        <span class="offensive-methodology-index">02</span>
        <div>
          <strong>Authorization boundaries</strong>
          <p>Test role, tenant, object, and state-transition controls through request mutation and multi-user negative controls.</p>
          <small>API Security · BOLA / IDOR · Access Control</small>
        </div>
      </article>

      <article class="offensive-methodology-item">
        <span class="offensive-methodology-index">03</span>
        <div>
          <strong>Code-to-runtime validation</strong>
          <p>Correlate source paths, configuration, trust decisions, and runtime behavior to confirm exploitability and root cause.</p>
          <small>Code Review · SAST + DAST · Root Cause</small>
        </div>
      </article>

      <article class="offensive-methodology-item">
        <span class="offensive-methodology-index">04</span>
        <div>
          <strong>Finding governance</strong>
          <p>Reproduce, deduplicate, calibrate severity, explain business impact, and define remediation and retest criteria.</p>
          <small>Triage · Severity · Reporting · Retest</small>
        </div>
      </article>

      <article class="offensive-methodology-item">
        <span class="offensive-methodology-index">05</span>
        <div>
          <strong>Risk-based assessment planning</strong>
          <p>Prioritize authentication, session, upload, integration, and business-process surfaces around high-value control boundaries.</p>
          <small>Burp Suite · Threat Modeling · Web Security</small>
        </div>
      </article>
    </div>
  </div>'''

work_start = index.find('<section class="section shell" id="work">')
if work_start < 0:
    raise SystemExit('Missing offensive work section')
old_work_grid_start = index.find('  <div class="case-grid">', work_start)
recognition_start = index.find('\n</section>\n\n    <section class="section recognition-section"', old_work_grid_start)
if old_work_grid_start < 0 or recognition_start < 0:
    raise SystemExit('Unable to locate offensive supporting-card grid')
index = index[:old_work_grid_start] + methodology_highlights + index[recognition_start:]

# Group five defensive cards into three focused capability workstreams.
old_operations_copy = '<p>Defensive engineering remains a deliberate secondary advantage: hands-on SIEM/XDR, endpoint telemetry, network monitoring, alert tuning, and SOAR-aligned workflow automation improve understanding of production controls, detection gaps, incident handling, and implementation constraints—making offensive findings more realistic and remediation guidance more actionable.</p>'
new_operations_copy = '<p>Three grouped workstreams summarize hands-on SIEM/XDR, endpoint telemetry, observability, network-security logging, and SOAR-aligned automation. Detailed browser-viewable case studies and technical documents remain available without allowing supporting SOC work to compete with the offensive-security narrative.</p>'
index = replace_once(index, old_operations_copy, new_operations_copy, 'defensive section summary')

defensive_grid = '''  <div class="case-grid defensive-case-grid">
    <article class="case-card card" data-reveal>
      <div class="case-card-head"><span>01</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 6v5c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V6l-8-3Z"></path><path d="M5 4h14v5H5zM8 9v6"></path></svg></div>
      <p class="eyebrow">SIEM / XDR validation &amp; log engineering</p>
      <h3>Wazuh 5 SIEM &amp; Log Pipeline</h3>
      <p>Combined isolated Wazuh 5 validation, endpoint-agent coverage, ISO 27001 testing, and firewall syslog ingestion into an OpenSearch-backed investigation pipeline.</p>
      <div class="case-result"><strong>Outcome</strong><span>Validated certificates, agent health, Windows/Linux telemetry, connector behavior, data streams, and searchable network-security events.</span></div>
      <div class="tag-list"><span>Wazuh 5</span><span>SIEM / XDR</span><span>Endpoint Telemetry</span><span>Syslog</span><span>OpenSearch</span><span>ISO 27001</span></div>
      <div class="case-actions">
        <a class="text-link" href="case-studies/#wazuh-iso27001">View SIEM lab <span aria-hidden="true">→</span></a>
        <a class="text-link" href="case-studies/#firewall-syslog">View log pipeline <span aria-hidden="true">→</span></a>
      </div>
    </article>

    <article class="case-card card" data-reveal>
      <div class="case-card-head"><span>02</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18V9M10 18V5M16 18v-7M22 18H2"></path><path d="m3 7 6-3 6 5 6-6"></path></svg></div>
      <p class="eyebrow">Unified observability &amp; network monitoring</p>
      <h3>Unified SOC Observability</h3>
      <p>Correlated Wazuh and OpenSearch security data with Grafana, Zabbix, SNMP, and infrastructure-health signals across endpoints, switches, access points, servers, and firewall paths.</p>
      <div class="case-result"><strong>Outcome</strong><span>Faster host and infrastructure investigation across security, endpoint, availability, and network telemetry.</span></div>
      <div class="tag-list"><span>SIEM Analytics</span><span>Grafana</span><span>Zabbix</span><span>SNMP</span><span>Network Monitoring</span></div>
      <div class="case-actions">
        <a class="text-link" href="case-studies/#unified-soc-dashboard">View observability case <span aria-hidden="true">→</span></a>
      </div>
    </article>

    <article class="case-card card" data-reveal>
      <div class="case-card-head"><span>03</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v12H7l-3 3zM8 9h8M8 13h5"></path></svg></div>
      <p class="eyebrow">SOAR-aligned workflow automation</p>
      <h3>Incident Workflow Automation</h3>
      <p>Converted selected Wazuh alerts into controlled, deduplicated GLPI incidents with preserved security context and a repeatable path from detection to assigned operational work.</p>
      <div class="case-result"><strong>Outcome</strong><span>Reduced duplicate tickets and operational noise while improving incident traceability, triage consistency, and response ownership.</span></div>
      <div class="tag-list"><span>Wazuh</span><span>SOAR-aligned</span><span>GLPI</span><span>Alert Deduplication</span><span>ITSM</span></div>
      <div class="case-actions">
        <a class="text-link" href="case-studies/#wazuh-glpi">View automation case <span aria-hidden="true">→</span></a>
      </div>
    </article>
  </div>'''

operations_start = index.find('<section class="section shell" id="operations">')
if operations_start < 0:
    raise SystemExit('Missing defensive operations section')
old_defensive_grid_start = index.find('  <div class="case-grid">', operations_start)
capabilities_start = index.find('\n</section>\n\n<section class="section shell" id="capabilities">', old_defensive_grid_start)
if old_defensive_grid_start < 0 or capabilities_start < 0:
    raise SystemExit('Unable to locate defensive project grid')
index = index[:old_defensive_grid_start] + defensive_grid + index[capabilities_start:]

# Repository documentation mirrors the streamlined scan path.
readme = replace_once(
    readme,
    '- Browser-viewable defensive engineering case studies with full DOCX downloads',
    '- Browser-viewable defensive engineering case studies with full DOCX downloads\n- Streamlined main-page flow: five integrated expertise cards, one compact offensive-methodology panel, and three grouped defensive workstreams',
    'README streamlined layout bullet',
)
readme = replace_once(
    readme,
    '├── typography.css             # Balanced responsive type hierarchy',
    '├── typography.css             # Balanced responsive type hierarchy\n├── streamline.css              # Consolidated expertise, methodology, and defensive layouts',
    'README streamline stylesheet',
)

# Validate information retention and disclosure boundaries.
required_index_phrases = (
    'expertise-grid expertise-grid-streamlined',
    '<span class="card-index">05</span>',
    'Complex Logic &amp; Protocol Security',
    'offensive-methodology card',
    'Authorization boundaries',
    'Code-to-runtime validation',
    'Finding governance',
    'Risk-based assessment planning',
    'case-grid defensive-case-grid',
    'Wazuh 5 SIEM &amp; Log Pipeline',
    'Unified SOC Observability',
    'Incident Workflow Automation',
    'case-studies/#wazuh-iso27001',
    'case-studies/#firewall-syslog',
    'case-studies/#unified-soc-dashboard',
    'case-studies/#wazuh-glpi',
    'streamline.css?v=1',
)
for phrase in required_index_phrases:
    if phrase not in index:
        raise SystemExit(f'Missing required streamlined content: {phrase}')

removed_main_page_phrases = (
    'protocol-research-card card',
    'Large-scale network visibility',
    'Wazuh-to-GLPI incident orchestration',
    '<div class="case-card-head"><span>05</span><svg',
)
for phrase in removed_main_page_phrases:
    if phrase in index:
        raise SystemExit(f'Redundant main-page structure remains: {phrase}')

if index.count('class="expertise-card') != 5:
    raise SystemExit('Core expertise must contain exactly five cards')
if index.count('class="offensive-methodology-item"') != 4:
    raise SystemExit('Offensive methodology must contain exactly four compact items')
operations_block = index[index.find('<section class="section shell" id="operations">'):index.find('<section class="section shell" id="capabilities">')]
if operations_block.count('class="case-card card"') != 3:
    raise SystemExit('Defensive operations must contain exactly three grouped cards')

if index.index('Core offensive expertise') > index.index('Defensive depth'):
    raise SystemExit('Offensive-first hierarchy was not preserved')

for forbidden in ('3958760', 'WorldIDSource', 'WorldIDSatellite', '16,777,216', 'CVSS 9.2', '$25K'):
    if forbidden in index or forbidden in readme:
        raise SystemExit(f'Active private-report detail detected: {forbidden}')

if not (ROOT / 'streamline.css').exists():
    raise SystemExit('streamline.css is missing')

index_path.write_text(index, encoding='utf-8')
readme_path.write_text(readme, encoding='utf-8')
