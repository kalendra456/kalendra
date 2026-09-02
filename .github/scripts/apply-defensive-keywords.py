from pathlib import Path

index_path = Path("index.html")
readme_path = Path("README.md")

index = index_path.read_text(encoding="utf-8")
readme = readme_path.read_text(encoding="utf-8")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f"Missing expected content for {label}: {old[:90]}")
    return text.replace(old, new, 1)


# Structured-data terminology for ATS and search engines.
index = replace_once(
    index,
    '      "Detection Engineering",\n      "Linux"',
    '      "Detection Engineering",\n      "Security Information and Event Management (SIEM)",\n      "Extended Detection and Response (XDR)",\n      "Endpoint Detection and Response (EDR) Concepts",\n      "Security Orchestration, Automation and Response (SOAR) Workflows",\n      "Security Telemetry",\n      "Incident Response Automation",\n      "Linux"',
    "structured defensive expertise",
)

# Hero: defensive depth remains secondary to offensive security.
index = replace_once(
    index,
    "Hands-on SOC and detection-engineering experience adds operational context without diluting the offensive focus.",
    "Hands-on SIEM/XDR, endpoint-telemetry, detection-engineering, and response-automation experience adds operational context without diluting the offensive focus.",
    "hero defensive context",
)

# Core expertise card 04.
replacements = (
    (
        "<h3>Detection-Informed Security Engineering</h3>",
        "<h3>Detection-Informed Security Engineering &amp; Telemetry</h3>",
        "core defensive title",
    ),
    (
        "<p>Practical SOC, monitoring, logging, and incident-workflow experience used to evaluate whether preventive controls, telemetry, and response paths support real attack scenarios.</p>",
        "<p>Practical SOC, SIEM/XDR, endpoint-telemetry, detection-rule, and incident-workflow experience used to assess whether preventive controls, EDR-visible signals, and response paths support realistic attack scenarios.</p>",
        "core defensive description",
    ),
    (
        "<li>SIEM, logging and control observability</li>",
        "<li>SIEM correlation, endpoint telemetry &amp; EDR context</li>",
        "core SIEM bullet",
    ),
    (
        "<li>Detection and incident-workflow context</li>",
        "<li>Detection-rule validation, alert tuning &amp; investigation</li>",
        "core detection bullet",
    ),
    (
        "<li>Infrastructure and network-security awareness</li>",
        "<li>SOAR-aligned orchestration and incident workflow</li>",
        "core SOAR bullet",
    ),
)
for old, new, label in replacements:
    index = replace_once(index, old, new, label)

# Defensive section and employment narrative.
index = replace_once(
    index,
    "<p>Defensive engineering is retained as a deliberate secondary advantage: understanding production telemetry, change control, monitoring gaps, incident workflow, and operational constraints makes offensive findings more realistic and remediation guidance more implementable.</p>",
    "<p>Defensive engineering remains a deliberate secondary advantage: hands-on SIEM/XDR, endpoint telemetry, network monitoring, alert tuning, and SOAR-aligned workflow automation improve understanding of production controls, detection gaps, incident handling, and implementation constraints—making offensive findings more realistic and remediation guidance more actionable.</p>",
    "defensive section introduction",
)
index = replace_once(
    index,
    "<p>Enterprise-facing SOC, monitoring, network-security, and customer-environment work that strengthens understanding of production controls, telemetry, incident handling, and implementation constraints.</p>",
    "<p>Enterprise-facing SOC, SIEM/XDR, endpoint-telemetry, network-security, and customer-environment work that strengthens understanding of production controls, detection coverage, incident handling, and implementation constraints.</p>",
    "Tatva experience summary",
)
index = replace_once(
    index,
    "<li>Supported Wazuh, Zabbix, Grafana, and OpenSearch deployments for security monitoring, infrastructure visibility, and investigation workflows.</li>",
    "<li>Supported Wazuh SIEM/XDR, endpoint agents, Zabbix, Grafana, and OpenSearch deployments for telemetry collection, security monitoring, infrastructure visibility, and investigation workflows.</li>\n                        <li>Built Wazuh-to-GLPI alert-to-incident automation with deduplication and controlled ticket creation, providing practical SOAR-aligned orchestration experience.</li>",
    "Tatva defensive delivery bullets",
)

# Defensive case studies.
case_replacements = (
    (
        '<p class="eyebrow">Compliance validation lab</p>',
        '<p class="eyebrow">SIEM / XDR validation lab</p>',
        "Wazuh case eyebrow",
    ),
    (
        "<p>Deployed an isolated beta environment to evaluate compliance and telemetry capabilities without introducing risk to the stable SOC stack.</p>",
        "<p>Deployed an isolated Wazuh SIEM/XDR beta environment to evaluate endpoint telemetry, compliance, and detection capabilities without introducing risk to the stable SOC stack.</p>",
        "Wazuh case description",
    ),
    (
        "<div class=\"case-result\"><strong>Outcome</strong><span>Validated certificates, agent health, ingestion behavior, and Windows/Linux coverage in a controlled test environment.</span></div>",
        "<div class=\"case-result\"><strong>Outcome</strong><span>Validated certificates, agent health, endpoint-telemetry ingestion, and Windows/Linux host coverage in a controlled test environment.</span></div>",
        "Wazuh case outcome",
    ),
    (
        "<div class=\"tag-list\"><span>Wazuh 5</span><span>Docker</span><span>ISO 27001</span></div>",
        "<div class=\"tag-list\"><span>Wazuh 5</span><span>SIEM / XDR</span><span>Endpoint Telemetry</span><span>Docker</span><span>ISO 27001</span></div>",
        "Wazuh case tags",
    ),
    (
        '<p class="eyebrow">Unified visibility</p>',
        '<p class="eyebrow">SIEM analytics &amp; unified visibility</p>',
        "dashboard eyebrow",
    ),
    (
        "<p>Correlated security events and infrastructure health into a host-focused SOC dashboard using OpenSearch-backed data.</p>",
        "<p>Correlated SIEM alerts, endpoint telemetry, and infrastructure health into a host-focused SOC dashboard using OpenSearch-backed data.</p>",
        "dashboard description",
    ),
    (
        "<div class=\"case-result\"><strong>Outcome</strong><span>Faster host-level investigation across security and availability signals.</span></div>",
        "<div class=\"case-result\"><strong>Outcome</strong><span>Faster host-level investigation across security, endpoint, and availability signals.</span></div>",
        "dashboard outcome",
    ),
    (
        "<div class=\"tag-list\"><span>Grafana</span><span>Zabbix</span><span>OpenSearch</span></div>",
        "<div class=\"tag-list\"><span>SIEM Analytics</span><span>Endpoint Telemetry</span><span>Grafana</span><span>Zabbix</span><span>OpenSearch</span></div>",
        "dashboard tags",
    ),
    (
        '<p class="eyebrow">Log engineering</p>',
        '<p class="eyebrow">SIEM ingestion &amp; log engineering</p>',
        "firewall eyebrow",
    ),
    (
        "<p>Built and troubleshot the collector-to-engine-to-indexer pipeline, making firewall events searchable and usable for investigation.</p>",
        "<p>Built and troubleshot the firewall-to-collector-to-Wazuh-SIEM-to-indexer pipeline, making network-security telemetry searchable and usable for investigation.</p>",
        "firewall description",
    ),
    (
        "<div class=\"case-result\"><strong>Outcome</strong><span>Reliable network-event visibility with corrected connector and data-stream behavior.</span></div>",
        "<div class=\"case-result\"><strong>Outcome</strong><span>Reliable network-event visibility with corrected connector, ingestion, and data-stream behavior.</span></div>",
        "firewall outcome",
    ),
    (
        "<div class=\"tag-list\"><span>Syslog</span><span>Wazuh</span><span>Firewall</span></div>",
        "<div class=\"tag-list\"><span>SIEM</span><span>Syslog</span><span>Wazuh</span><span>Firewall</span><span>OpenSearch</span></div>",
        "firewall tags",
    ),
    (
        '<p class="eyebrow">Incident workflow automation</p>',
        '<p class="eyebrow">SOAR-aligned workflow automation</p>',
        "GLPI eyebrow",
    ),
    (
        "<h3>Wazuh to GLPI incident ticketing</h3>",
        "<h3>Wazuh-to-GLPI incident orchestration</h3>",
        "GLPI title",
    ),
    (
        "<p>Converted high-value security alerts into deduplicated GLPI incidents through a custom integration workflow.</p>",
        "<p>Built a SOAR-aligned workflow that converted high-value Wazuh alerts into deduplicated GLPI incidents with controlled ticket creation and incident context.</p>",
        "GLPI description",
    ),
    (
        "<div class=\"case-result\"><strong>Outcome</strong><span>Actionable alert-to-ticket flow with reduced duplication and operational noise.</span></div>",
        "<div class=\"case-result\"><strong>Outcome</strong><span>Automated alert-to-incident triage, reduced duplicate tickets and operational noise, and improved response-workflow consistency.</span></div>",
        "GLPI outcome",
    ),
    (
        "<div class=\"tag-list\"><span>Wazuh</span><span>GLPI</span><span>ITSM</span></div>",
        "<div class=\"tag-list\"><span>Wazuh</span><span>SOAR-aligned</span><span>GLPI</span><span>Alert Deduplication</span><span>ITSM</span></div>",
        "GLPI tags",
    ),
)
for old, new, label in case_replacements:
    index = replace_once(index, old, new, label)

# ATS-scannable defensive capability matrix.
index = replace_once(
    index,
    '<p class="eyebrow">Defensive context</p>',
    '<p class="eyebrow">Defensive context &amp; operations</p>',
    "capability eyebrow",
)
index = replace_once(
    index,
    "<h3>Detection, infrastructure &amp; operations</h3>",
    "<h3>SIEM, endpoint detection &amp; response automation</h3>",
    "capability title",
)
index = replace_once(
    index,
    "<div class=\"skill-cloud\"><span>Wazuh</span><span>Zabbix</span><span>Grafana</span><span>OpenSearch</span><span>Syslog</span><span>SNMP</span><span>Firewall Rules</span><span>VPN</span><span>NAT</span><span>Alert Tuning</span><span>Incident Workflow</span><span>Network Monitoring</span></div>",
    "<div class=\"skill-cloud\"><span>SIEM</span><span>Wazuh</span><span>XDR</span><span>OpenSearch</span><span>Log Correlation</span><span>Syslog</span><span>Endpoint Telemetry</span><span>EDR Context</span><span>Host Monitoring</span><span>Detection Rules</span><span>Alert Tuning</span><span>Telemetry Analysis</span><span>Zabbix</span><span>Grafana</span><span>SNMP</span><span>Firewall Rules</span><span>VPN / NAT</span><span>SOAR-aligned Automation</span><span>GLPI</span><span>Alert Deduplication</span><span>Incident Response Workflows</span></div>",
    "defensive capability tags",
)

readme = replace_once(
    readme,
    "- Hands-on SOC, monitoring, logging, network-security, and incident-workflow experience as secondary operational context",
    "- Hands-on Wazuh SIEM/XDR, endpoint telemetry and EDR context, OpenSearch-backed analytics, network monitoring, and SOAR-aligned alert-to-incident automation as secondary operational context",
    "README defensive capability bullet",
)

required = (
    "Detection-Informed Security Engineering &amp; Telemetry",
    "SIEM correlation, endpoint telemetry &amp; EDR context",
    "SOAR-aligned orchestration and incident workflow",
    "Wazuh SIEM/XDR",
    "Wazuh-to-GLPI incident orchestration",
    "SOAR-aligned Automation",
    "Endpoint Detection and Response (EDR) Concepts",
    "Security Orchestration, Automation and Response (SOAR) Workflows",
)
for phrase in required:
    if phrase not in index:
        raise SystemExit(f"Missing required defensive positioning phrase: {phrase}")

for unsupported in (
    "CrowdStrike",
    "SentinelOne",
    "Microsoft Sentinel",
    "Splunk",
    "Palo Alto Cortex",
    "Shuffle SOAR",
):
    if unsupported in index:
        raise SystemExit(f"Unsupported platform claim detected: {unsupported}")

if index.index("Core offensive expertise") > index.index("Defensive depth"):
    raise SystemExit("Defensive content incorrectly precedes core offensive expertise")

index_path.write_text(index, encoding="utf-8")
readme_path.write_text(readme, encoding="utf-8")
