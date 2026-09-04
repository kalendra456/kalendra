/* KALENDRA/OS: local portfolio navigation, not an operating system or scanning tool. */
(() => {
  'use strict';
  const D = window.KOS_CONTENT;
  if (!D) return;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const e = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icons = {
    home:'<path d="m3 10 9-7 9 7v10H3zM9 20v-7h6v7"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
    scan:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M8 12h8m-4-4v8"/><circle cx="12" cy="12" r="6"/>',
    vault:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="12" cy="12" r="4"/><path d="M12 8v8m-4-4h8M6 7h.01M18 17h.01"/>',
    workflow:'<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/><path d="M9 6h9v9M6 9v9h9m-4-3 3 3-3 3"/>',
    award:'<circle cx="12" cy="8" r="5"/><path d="m8 12-2 9 6-3 6 3-2-9M10 8l1.4 1.5L14 6"/>',
    activity:'<path d="M2 12h5l3-8 4 16 3-8h5"/>',
    folder:'<path d="M3 7V4h7l3 3h8v13H3zM3 10h18"/>',
    terminal:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m6 9 3 3-3 3m6 0h5"/>',
    mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/>',
    moon:'<path d="M20 14.3A8.5 8.5 0 0 1 9.7 4 8.5 8.5 0 1 0 20 14.3Z"/>',
    code:'<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-14-2 16"/>',
    linkedin:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7m0-10v.01m5 10v-7m0 3a3 3 0 0 1 6 0v4"/>',
    lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 4v3"/>',
    arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',
    close:'<path d="m6 6 12 12M6 18 18 6"/>',
    minimize:'<path d="M5 12h14"/>',
    maximize:'<rect x="5" y="5" width="14" height="14" rx="1"/>',
    restore:'<path d="M9 6V3h12v12h-3"/><rect x="3" y="9" width="12" height="12" rx="1"/>',
    copy:'<rect x="8" y="8" width="12" height="13" rx="1"/><path d="M5 17H3V3h12v2"/>'
  };
  const icon = key => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[key] || icons.folder}</svg>`;
  const app = id => D.apps.find(a => a.id === id);
  const appIcon = a => `<span class="app-icon ${e(a.color)}">${icon(a.icon)}</span>`;
  const tags = values => `<div class="tag-list">${values.map(t => `<span class="tag">${e(t)}</span>`).join('')}</div>`;
  const external = 'target="_blank" rel="noopener noreferrer"';
  const notice = text => `<div class="notice">${icon('lock')}<span>${e(text)}</span></div>`;
  const heading = (label, title, text = '') => `<div class="app-heading"><div><p class="eyebrow">${e(label)}</p><h2>${e(title)}</h2>${text ? `<p>${e(text)}</p>` : ''}</div></div>`;
  const openButton = (id, text, primary = false) => `<button type="button" class="${primary ? 'primary' : 'secondary'}-button" data-open="${id}">${e(text)}${icon('arrow')}</button>`;
  const workspace = $('#workspace');
  const layer = $('#windowLayer');
  const windows = new Map();
  let topZ = 30, activeId = null, desktopHidden = [], toastTimer;
  const mobile = () => matchMedia('(max-width: 760px)').matches;
  let preferences = {};
  try { preferences = JSON.parse(localStorage.getItem('kalendra-os-preferences') || '{}') || {}; } catch (_) { preferences = {}; }
  if (typeof preferences !== 'object' || Array.isArray(preferences)) preferences = {};
  let theme = preferences.theme === 'light' ? 'light' : 'dark';
  const reduceMedia = matchMedia('(prefers-reduced-motion: reduce)');
  let motion = typeof preferences.motion === 'boolean' ? preferences.motion : !reduceMedia.matches;
  const savePreferences = () => { try { localStorage.setItem('kalendra-os-preferences', JSON.stringify({theme, motion})); } catch (_) {} };
  const applyPreferences = () => {
    document.documentElement.dataset.theme = theme;
    const moving = motion && !reduceMedia.matches;
    document.documentElement.dataset.motion = moving ? 'on' : 'off';
    $('#themeButton').innerHTML = icon(theme === 'dark' ? 'sun' : 'moon');
    $('#themeButton').setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    $('#motionButton').textContent = `Motion: ${moving ? 'on' : 'off'}`;
    $('#motionButton').setAttribute('aria-pressed', String(!moving));
  };
  const toast = message => {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 3200);
  };
  const setHash = id => { try { history.replaceState(null, '', `#${id}`); } catch (_) {} };
  const syncDock = () => {
    $$('.dock-button[data-open]').forEach(button => {
      const id = button.dataset.open, state = windows.get(id);
      button.classList.toggle('is-open', !!state);
      button.classList.toggle('is-active', id === activeId && state && !state.minimized);
      button.setAttribute('aria-label', `${app(id).name}${state ? state.minimized ? ' — minimized, click to restore' : ' — open' : ''}`);
    });
    const n = [...windows.values()].filter(w => !w.minimized).length;
    $('#workspaceStatus').textContent = n ? `${n} app${n === 1 ? '' : 's'} open · Ctrl / ⌘ K to explore` : 'Desktop · open an app to explore';
  };
  function focusWindow(id, moveFocus = true) {
    const state = windows.get(id);
    if (!state) return;
    state.minimized = false;
    state.el.hidden = false;
    state.el.style.zIndex = String(++topZ);
    windows.forEach(w => { w.el.classList.toggle('is-active', w === state); w.el.inert = mobile() && w !== state; });
    activeId = id;
    setHash(id);
    syncDock();
    if (moveFocus) $('.window-bar', state.el).focus({preventScroll:true});
  }
  function nextWindow() {
    const visible = [...windows.values()].filter(w => !w.minimized).sort((a,b) => Number(b.el.style.zIndex) - Number(a.el.style.zIndex));
    if (visible.length) focusWindow(visible[0].id);
    else {activeId = null; syncDock(); (mobile() ? $('#dockSearch') : $('#desktopToggle')).focus({preventScroll:true}); setHash('desktop');}
  }
  function closeWindow(id) {
    const state = windows.get(id);
    if (!state) return;
    state.el.remove(); windows.delete(id);
    desktopHidden = desktopHidden.filter(x => x !== id);
    if (activeId === id) nextWindow(); else syncDock();
  }
  function minimizeWindow(id) {
    const state = windows.get(id);
    if (!state) return;
    state.minimized = true; state.el.hidden = true;
    if (activeId === id) nextWindow(); else syncDock();
    toast(`${app(id).name} minimized. Reopen it from the dock or search.`);
  }
  function maximizeWindow(id) {
    const state = windows.get(id);
    if (!state) return;
    state.maximized = !state.maximized;
    state.el.classList.toggle('is-maximized', state.maximized);
    const button = $('[data-action="maximize"]', state.el);
    button.innerHTML = icon(state.maximized ? 'restore' : 'maximize');
    button.setAttribute('aria-label', `${state.maximized ? 'Restore' : 'Maximize'} ${app(id).name}`);
    focusWindow(id, false);
  }
  function constrain(state) {
    if (mobile()) return;
    const W = workspace.clientWidth, H = workspace.clientHeight;
    const minW = Math.min(360, W - 20), minH = Math.min(285, H - 20);
    const width = Math.max(minW, Math.min(parseFloat(state.el.style.width) || 700, W - 20));
    const height = Math.max(minH, Math.min(parseFloat(state.el.style.height) || 470, H - 20));
    const left = Math.max(10, Math.min(parseFloat(state.el.style.left) || 10, W - width - 10));
    const top = Math.max(10, Math.min(parseFloat(state.el.style.top) || 10, H - height - 10));
    Object.assign(state.el.style, {width:`${width}px`,height:`${height}px`,left:`${left}px`,top:`${top}px`});
  }
  function enableWindowControls(state) {
    const bar = $('.window-bar', state.el), resize = $('.window-resizer', state.el);
    const start = (event, sizing) => {
      if (event.button !== 0 || mobile() || state.maximized || (!sizing && event.target.closest('button'))) return;
      event.preventDefault(); focusWindow(state.id, false);
      const target = sizing ? resize : bar;
      const rect = state.el.getBoundingClientRect();
      const ox = parseFloat(state.el.style.left), oy = parseFloat(state.el.style.top);
      const sx = event.clientX, sy = event.clientY;
      target.setPointerCapture(event.pointerId);
      document.body.classList.add('is-dragging');
      const move = ev => {
        const dx = ev.clientX - sx, dy = ev.clientY - sy;
        if (sizing) {state.el.style.width = `${rect.width + dx}px`;state.el.style.height = `${rect.height + dy}px`;}
        else {state.el.style.left = `${ox + dx}px`;state.el.style.top = `${oy + dy}px`;}
        constrain(state);
      };
      const end = () => {target.removeEventListener('pointermove',move);target.removeEventListener('pointerup',end);target.removeEventListener('pointercancel',end);document.body.classList.remove('is-dragging');};
      target.addEventListener('pointermove',move);target.addEventListener('pointerup',end);target.addEventListener('pointercancel',end);
    };
    bar.addEventListener('pointerdown',ev=>start(ev,false));
    resize.addEventListener('pointerdown',ev=>start(ev,true));
    bar.addEventListener('dblclick',ev=>{if(!ev.target.closest('button')&&!mobile()) maximizeWindow(state.id);});
    const keyMove = (ev, forceResize = false) => {
      if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(ev.key) || (!forceResize && ev.target !== bar) || mobile() || state.maximized) return;
      ev.preventDefault();
      const sizing = forceResize || ev.shiftKey;
      const horizontal = ['ArrowLeft','ArrowRight'].includes(ev.key);
      const key = sizing ? horizontal ? 'width':'height' : horizontal ? 'left':'top';
      const delta = ['ArrowLeft','ArrowUp'].includes(ev.key) ? -16:16;
      state.el.style[key] = `${parseFloat(state.el.style[key]) + delta}px`;
      constrain(state);
    };
    bar.addEventListener('keydown',ev=>keyMove(ev));resize.addEventListener('keydown',ev=>keyMove(ev,true));
    state.el.addEventListener('pointerdown',()=>{if(activeId!==state.id)focusWindow(state.id,false);});
    state.el.addEventListener('focusin',()=>{if(activeId!==state.id)focusWindow(state.id,false);});
  }
  function openApp(id) {
    const data = app(id); if (!data) return;
    desktopHidden = [];
    if (windows.has(id)) {focusWindow(id);return;}
    const el = document.createElement('section');
    el.className = 'os-window';el.dataset.app = id;el.setAttribute('role','dialog');el.setAttribute('aria-modal','false');el.setAttribute('aria-labelledby',`title-${id}`);
    const W = workspace.clientWidth,H = workspace.clientHeight;
    const hasWidgets = W > 1000;
    const width = Math.min(id === 'terminal' ? 740 : 850, W - (hasWidgets ? 398 : 158));
    const height = Math.min(id === 'home' ? 565 : 570, H - 45);
    const count = windows.size;
    const left = hasWidgets ? Math.max(128,(W - 240 - width)/2) : Math.max(120,(W-width)/2);
    Object.assign(el.style,{width:`${Math.max(380,width)}px`,height:`${height}px`,left:`${left + count%4*23}px`,top:`${Math.max(18,(H-height)/2-10)+count%4*18}px`});
    el.innerHTML = `<header class="window-bar" tabindex="0" aria-describedby="windowInstructions" aria-label="${e(data.name)} window title bar"><span class="title-icon">${icon(data.icon)}</span><h2 class="window-title" id="title-${id}">${e(data.name)}</h2><span class="window-path">/ workspace / ${id}</span><div class="window-controls"><button type="button" data-action="minimize" aria-label="Minimize ${e(data.name)}" title="Minimize">${icon('minimize')}</button><button type="button" data-action="maximize" aria-label="Maximize ${e(data.name)}" title="Maximize or restore">${icon('maximize')}</button><button type="button" data-action="close" aria-label="Close ${e(data.name)}" title="Close">${icon('close')}</button></div></header><div class="window-body"></div><footer class="window-status"><span><i class="status-dot"></i>PUBLIC PORTFOLIO</span><span>${id==='terminal'?'LOCAL NAVIGATION · NO SYSTEM EXECUTION':'YASWANTH KALENDRA / '+data.name.toUpperCase()}</span></footer><button class="window-resizer" type="button" aria-label="Resize ${e(data.name)} using arrow keys"></button>`;
    const state = {id,el,minimized:false,maximized:false};
    windows.set(id,state);layer.appendChild(el);constrain(state);enableWindowControls(state);
    renderApp(state);focusWindow(id);
    if (id === 'terminal') $('.terminal-input',el)?.focus({preventScroll:true});
  }
  function renderApp(state) {
    const body = $('.window-body',state.el);
    switch(state.id) {
      case 'home': body.innerHTML = `<div class="overview"><div class="overview-main"><p class="eyebrow"><span class="status-dot"></span> AN OFFENSIVE SECURITY WORKSPACE</p><h1>Offensive mindset.<br><span>Defensible outcomes.</span></h1><p class="overview-intro">I turn complex attack paths into clear business risk—and actionable remediation.</p><div class="identity-line"><span class="initial-avatar">YK</span><div><strong>Yaswanth Kalendra</strong><small>Application Security · VAPT · Independent Research</small></div></div><div class="button-row">${openButton('findings','Explore the research',true)}${openButton('profile','View profile')}</div><div class="overview-stats"><div><strong>20<span>+</span></strong><small>Programs assessed</small></div><div><strong>4<span>+</span></strong><small>Years of research</small></div><div><strong>Critical<span>↗</span></strong><small>Validated impact</small></div></div></div><aside class="overview-side"><p class="section-label">A DIFFERENT WAY TO EXPLORE</p><div class="launch-list"><button type="button" data-open="findings"><span>01</span><span><strong>Open the findings vault</strong><small>Research. Impact. Evidence.</small></span><span>↗</span></button><button type="button" data-open="methodology"><span>02</span><span><strong>Inspect the methodology</strong><small>From scope to verified closure.</small></span><span>↗</span></button><button type="button" data-open="recognition"><span>03</span><span><strong>See the recognition</strong><small>Public acknowledgments.</small></span><span>↗</span></button></div><div class="keyboard-tip"><p><strong>This is your desktop.</strong><br>Move windows. Explore the dock.<br>Find anything with <kbd>Ctrl / ⌘ K</kbd></p></div><button class="text-button" type="button" data-open="terminal">Prefer the command line? <span>↗</span></button></aside></div>`;break;
      case 'profile': body.innerHTML = `<div class="app-page">${heading('WHOAMI / PROFESSIONAL PROFILE','Yaswanth Kalendra','Offensive-security and application-security practitioner with hands-on defensive engineering context.')}<p class="profile-lead">I lead assessment workstreams from attack-surface modelling and manual validation through severity calibration, remediation guidance and retesting.</p>${tags(['VAPT','Web & API Pentesting','Application Security','Source-assisted Research'])}<h3 class="section-title">Experience</h3><div class="profile-timeline"><article class="timeline-entry"><small>2022 — PRESENT / INDEPENDENT · REMOTE</small><h3>Application Security Researcher &amp; Penetration Tester</h3><p>Research-led assessments across 20+ private bug-bounty and responsible-disclosure programs. Focus on identity, authorization, business logic, source-to-runtime validation and high-impact control failures.</p></article><article class="timeline-entry"><small>2025 — PRESENT / TATVA NETWORKS · INDIA</small><h3>Cybersecurity Analyst</h3><p>Enterprise-facing SOC, Wazuh SIEM/XDR, endpoint telemetry, network-security and incident-workflow work. Practical experience with Grafana, Zabbix, OpenSearch and Wazuh-to-GLPI automation.</p></article></div><h3 class="section-title">Credentials &amp; continued development</h3><div class="credential-row"><div class="credential"><strong>CEH v13</strong><small>Certified · Mar 2026</small></div><div class="credential"><strong>OSCP</strong><small>Active preparation</small></div><div class="credential"><strong>CCSE</strong><small>In progress</small></div></div><p class="fine-print">Independent research experience is presented separately from employment. Preparation is not represented as certification.</p><div class="button-row" style="margin-top:20px">${openButton('contact','Discuss an opportunity',true)}<a class="secondary-button" href="../#experience">Read standard profile ↗</a></div></div>`;break;
      case 'surface': body.innerHTML = `<div class="split-app"><nav class="app-sidebar" aria-label="Assessment domains"><span class="section-label">ASSESSMENT DOMAINS</span>${D.domains.map((d,i)=>`<button type="button" class="domain-tab" data-domain="${i}" aria-pressed="${i===0}"><span>0${i+1}</span>${e(d.label)}</button>`).join('')}</nav><article class="domain-detail"></article></div>`;renderDomain(state,0);break;
      case 'findings': renderFindings(state);break;
      case 'methodology': body.innerHTML = `<div class="app-page">${heading('CONTROLLED DELIVERY','The assessment lifecycle.','Five stages. Clear evidence. Explicit decision points. Explore the delivery approach—not a live engagement board.')}<nav class="stage-nav" aria-label="Assessment stages">${D.stages.map((s,i)=>`<button type="button" class="stage-button" data-stage="${i}" aria-pressed="${i===0}"><span>0${i+1}</span>${e(s.short)}</button>`).join('')}</nav><div id="stageDetail"></div></div>`;renderStage(state,0);break;
      case 'recognition': body.innerHTML = `<div class="app-page">${heading('PUBLIC EVIDENCE','Recognition, not just claims.','Selected acknowledgments for responsible vulnerability research. Select an image to inspect the published evidence.')}<div class="proof-grid">${D.proofs.map((p,i)=>`<article class="proof-card"><button type="button" class="proof-image" data-proof="${i}" aria-label="Enlarge ${e(p.name)} recognition"><img src="${e(p.image)}" alt="${e(p.name+' '+p.kind)}" loading="lazy"><span>Inspect evidence ↗</span></button><div class="proof-caption"><h3>${e(p.name)}</h3><p>${e(p.kind)}</p></div></article>`).join('')}</div>${notice('Acknowledgments relate to responsible disclosure. They do not imply employment, a client relationship or organizational endorsement.')}<a class="secondary-button" href="../photo-gallery/">Open the full proof gallery ↗</a></div>`;break;
      case 'operations': body.innerHTML = `<div class="app-page">${heading('DEFENSIVE ENGINEERING / SUPPORTING DEPTH','Know how the other side operates.','SOC and infrastructure work strengthens offensive judgment: which events exist, how they correlate, and what teams can realistically remediate.')}<p class="fine-print" style="margin:0 0 20px">The flows below describe project architecture. They are not live monitoring feeds.</p>${D.projects.map(p=>`<article class="project-card"><span class="section-label">${e(p.label)}</span><h3>${e(p.name)}</h3><p>${e(p.description)}</p><div class="project-flow">${p.flow.map(v=>`<span>${e(v)}</span>`).join('<i aria-hidden="true">→</i>')}</div><p class="result"><strong>Outcome / </strong>${e(p.result)}</p>${tags(p.tags)}<a class="text-button" href="${e(p.href)}" ${external}>Read the technical case study <span>↗</span></a></article>`).join('')}</div>`;break;
      case 'files': body.innerHTML = `<div class="app-page">${heading('CASE FILES / DOCUMENTATION','Inspect the implementation.','Browser-readable technical case studies, with supporting documentation linked from each case.')}<div class="file-list">${D.files.map(f=>`<a class="file-row" href="${e(f.href)}" ${external}>${icon('folder')}<div><small>${e(f.category)}</small><strong>${e(f.name)}</strong><p>${e(f.description)}</p></div><span>↗</span></a>`).join('')}</div><p class="fine-print">These links open existing public portfolio case studies. Private client configurations, credentials and unreleased findings are excluded.</p></div>`;break;
      case 'contact': body.innerHTML = `<div class="app-page">${heading('CONTACT / LET’S TALK','Deep testing. Clear communication.')}<p class="contact-intro">Open to VAPT, Penetration Testing, Application Security, Product Security and Offensive Security opportunities. I bring controlled assessment delivery, disciplined evidence and practical defensive context.</p><a class="contact-email" href="mailto:${e(D.email)}">${e(D.email)}</a><div class="button-row"><a class="primary-button" href="mailto:${e(D.email)}?subject=Offensive%20Security%20Opportunity">Discuss a role ${icon('mail')}</a><button type="button" class="secondary-button" data-copy-email>Copy email ${icon('copy')}</button></div><div class="contact-links"><a class="contact-link" href="${e(D.linkedin)}" ${external}>${icon('linkedin')}<div><strong>LinkedIn</strong><small>Professional profile</small></div><span>↗</span></a><a class="contact-link" href="${e(D.github)}" ${external}>${icon('code')}<div><strong>GitHub</strong><small>Code &amp; projects</small></div><span>↗</span></a></div><p class="fine-print">The email action opens your mail application. This website does not submit a form or send messages on your behalf.</p></div>`;break;
      case 'terminal': renderTerminal(state);break;
    }
  }
  function renderDomain(state,index) {
    const d=D.domains[index];if(!d)return;
    $$('.domain-tab',state.el).forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
    $('.domain-detail',state.el).innerHTML=`<p class="eyebrow">0${index+1} / ${e(d.name)}</p><h2>${e(d.focus)}</h2><p>${e(d.description)}</p><ul class="check-list">${d.checks.map(c=>`<li>${e(c)}</li>`).join('')}</ul><div class="domain-outcome"><strong>WHAT THE ASSESSMENT SHOULD PRODUCE</strong>${e(d.outcome)}</div>${tags(d.tags)}<div class="button-row" style="margin-top:23px">${openButton('methodology','Explore the methodology')}</div>`;
  }
  function renderFindings(state) {
    $('.window-body',state.el).innerHTML=`<div class="app-page">${heading('FINDINGS VAULT / PUBLIC EDITION','Impact over payout.','A confirmed sanitized case, alongside the assessment practices behind research-led security work.')}${notice('Private programs remain anonymized. Active reports, target identifiers and unreleased technical details are not included.')}<input type="search" class="filter-search" placeholder="Search identity, authorization, code review…" aria-label="Search findings and methodology"><div class="filter-bar" aria-label="Filter research"><button class="filter" data-filter="all" aria-pressed="true">All work</button><button class="filter" data-filter="case" aria-pressed="false">Confirmed case</button><button class="filter" data-filter="method" aria-pressed="false">Methodology</button></div><div class="finding-grid"></div></div>`;
    state.filter='all';state.query='';filterFindings(state);
    $('.filter-search',state.el).addEventListener('input',ev=>{state.query=ev.target.value;filterFindings(state);});
  }
  function filterFindings(state) {
    const q=(state.query||'').toLowerCase();
    const results=D.findings.filter(f=>(state.filter==='all'||state.filter===f.category)&&`${f.title} ${f.description} ${f.tags.join(' ')}`.toLowerCase().includes(q));
    $('.finding-grid',state.el).innerHTML=results.length?results.map(f=>`<article class="finding-card ${f.category}"><div class="finding-top"><span>${e(f.label)}</span><span class="${f.category==='case'?'severity':''}">${e(f.status)}</span></div><h3>${e(f.title)}</h3><p>${e(f.description)}</p>${tags(f.tags)}<button class="text-button" type="button" data-finding="${f.id}">Read ${f.category==='case'?'case summary':'approach'} <span>↗</span></button></article>`).join(''):'<p class="command-empty">No matching entries. Try another term or filter.</p>';
  }
  function renderFinding(state,id) {
    const f=D.findings.find(x=>x.id===id);if(!f)return;
    $('.window-body',state.el).innerHTML=`<div class="app-page"><button type="button" class="back-button" data-findings-back>← Back to findings vault</button><p class="eyebrow">${e(f.label)} / ${e(f.status)}</p><h2 class="case-heading">${e(f.title)}</h2><p class="case-body">${e(f.body)}</p>${tags(f.tags)}<div class="case-grid"><div class="content-card"><strong>ASSESSMENT APPROACH</strong><p>Manual validation, negative controls, evidence integrity and source-assisted reasoning where appropriate.</p></div><div class="content-card"><strong>DELIVERY</strong><p>Reproducibility, root cause, business impact, remediation guidance and defined retest criteria.</p></div></div>${notice(f.note)}<div class="button-row">${openButton('methodology','Inspect the workflow',true)}${openButton('recognition','View public recognition')}</div><p class="fine-print">Recognition is shown separately and is not presented as evidence for this specific private-program case.</p></div>`;
    $('.window-body',state.el).scrollTop=0;
  }
  function renderStage(state,index) {
    const s=D.stages[index];if(!s)return;
    state.stage=index;
    $$('.stage-button',state.el).forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
    $('#stageDetail',state.el).innerHTML=`<article class="stage-detail"><div class="stage-detail-top"><span class="section-label">DECISION POINT 0${index+1}</span><h3>${e(s.name)}</h3><p>${e(s.question)}</p></div><div class="stage-detail-body"><p style="margin-top:20px">${e(s.body)}</p><ul class="check-list">${s.items.map(v=>`<li>${e(v)}</li>`).join('')}</ul><div class="domain-outcome"><strong>EXPECTED DELIVERABLE</strong>${e(s.deliverable)}</div></div></article><div class="stage-bottom"><small>0${index+1} / 05 · METHODOLOGY</small><div class="button-row"><button type="button" class="secondary-button" data-stage="${index-1}" ${index===0?'disabled':''}>← Previous</button><button type="button" class="primary-button" data-stage="${(index+1)%5}">${index===4?'Back to scope':'Next stage'} →</button></div></div>`;
  }
  const terminalCommands=['help','whoami','skills','methodology','findings','recognition','labs','experience','contact','ls','open','clear'];
  function renderTerminal(state) {
    const body=$('.window-body',state.el);
    body.innerHTML=`<div class="terminal-body"><pre class="terminal-banner">K A L E N D R A / O S\nPUBLIC RESEARCH WORKSPACE · 1.0</pre><p class="terminal-notice">Explore the portfolio by command. This is a browser-only interface, not a system shell. It does not run scans or execute arbitrary commands.<br>Type <strong>help</strong> to begin. ↑ ↓ history · Tab autocomplete.</p><div class="terminal-log" role="log" aria-live="polite" aria-label="Portfolio terminal output"></div><form class="terminal-form" autocomplete="off"><label for="terminalInput">kalendra@portfolio:~$</label><input class="terminal-input" id="terminalInput" aria-label="Portfolio command" spellcheck="false" autocapitalize="off" maxlength="200" autocomplete="off"></form><div class="terminal-suggestions">${['whoami','skills','findings','help'].map(c=>`<button type="button" data-terminal-command="${c}">${c}</button>`).join('')}</div></div>`;
    state.history=[];state.historyIndex=0;
    const input=$('.terminal-input',state.el);
    $('.terminal-form',state.el).addEventListener('submit',ev=>{ev.preventDefault();runCommand(state,input.value);input.value='';});
    input.addEventListener('keydown',ev=>{
      if(ev.key==='ArrowUp'||ev.key==='ArrowDown') {ev.preventDefault();state.historyIndex=Math.max(0,Math.min(state.history.length,state.historyIndex+(ev.key==='ArrowUp'?-1:1)));input.value=state.history[state.historyIndex]||'';}
      if(ev.key==='Tab') {ev.preventDefault();const v=input.value.trim().toLowerCase();const candidates=terminalCommands.filter(c=>c.startsWith(v));if(candidates.length===1)input.value=candidates[0]+(candidates[0]==='open'?' ':'');else if(candidates.length>1) terminalOutput(state,candidates.join('  '));}
      if(ev.key==='c'&&ev.ctrlKey){ev.preventDefault();input.value='';terminalOutput(state,'^C');}
    });
    $('.terminal-body',state.el).addEventListener('click',ev=>{if(!ev.target.closest('button,a')&&!getSelection()?.toString())input.focus({preventScroll:true});});
  }
  function terminalOutput(state,text) {
    const el=document.createElement('div');el.className='terminal-block';el.textContent=text;$('.terminal-log',state.el).appendChild(el);
    const log=$('.terminal-log',state.el);while(log.children.length>120)log.firstElementChild.remove();
    $('.window-body',state.el).scrollTop=$('.window-body',state.el).scrollHeight;
  }
  function runCommand(state,raw) {
    const value=raw.trim().slice(0,200);if(!value)return;
    state.history.push(value);if(state.history.length>60)state.history.shift();state.historyIndex=state.history.length;
    const command=document.createElement('div');command.className='terminal-command';
    const prefix=document.createElement('span');prefix.textContent='kalendra@portfolio:~$ ';command.append(prefix,document.createTextNode(value));$('.terminal-log',state.el).appendChild(command);
    const [cmd,...args]=value.toLowerCase().split(/\s+/);
    const responses={
      help:'whoami       Professional overview\nskills       Assessment domains & tools\nmethodology  Five-stage assessment lifecycle\nfindings     Sanitized research summary\nrecognition  Public acknowledgments\nlabs         Supporting defensive projects\nexperience   Independent research & Tatva Networks\ncontact      Email and professional profiles\nls           List available applications\nopen <app>   Open an application (e.g. open findings)\nclear        Clear this terminal\n\nAll commands are local portfolio navigation.',
      whoami:'Yaswanth Kalendra\nOffensive Security · VAPT · Application Security\n\nIndependent web/API and source-assisted researcher.\nAssessment ownership from scope through remediation and retest.\nDefensive context: SOC, SIEM/XDR and incident automation.',
      skills:'PRIMARY\nWeb & API security · Authentication · Authorization\nBOLA / IDOR · Business logic · Source review\nSAST + DAST · Protocol logic · State integrity\n\nTOOLS & DELIVERY\nBurp Suite · Nmap · Nuclei · Nessus · OpenVAS\nMetasploit · Linux · Python · Bash\nEvidence · Severity · Remediation · Retesting\n\nDEFENSIVE CONTEXT\nWazuh · OpenSearch · Grafana · Zabbix · GLPI\nSIEM / XDR · EDR context · SOAR-aligned workflows',
      methodology:D.stages.map((s,i)=>`0${i+1}  ${s.name}\n    ${s.deliverable}`).join('\n\n'),
      findings:'CONFIRMED SANITIZED CASE\nIdentity & trust-flow control failure\nGovernment Private Program · Confirmed critical\n\nFocus: authentication, authorization and business logic.\nPrivate identifiers and technical exploit details are excluded.\n\nUse: open findings',
      recognition:D.proofs.map(p=>`${p.name} — ${p.kind}`).join('\n')+'\n\nUse: open recognition',
      labs:D.projects.map(p=>p.name).join('\n')+'\n\nArchitecture and case studies, not live monitoring.\nUse: open operations',
      experience:'2022 — Present\nIndependent Application Security Researcher & Penetration Tester\n\n2025 — Present\nTatva Networks · Cybersecurity Analyst\n\nCEH v13: certified March 2026\nOSCP: active preparation · CCSE: in progress',
      contact:`Email     ${D.email}\nLinkedIn  ${D.linkedin}\nGitHub    ${D.github}\n\nUse: open contact`,
      ls:D.apps.map(a=>`${a.id.padEnd(13)}${a.name}`).join('\n')
    };
    if(cmd==='clear')$('.terminal-log',state.el).replaceChildren();
    else if(cmd==='open') {const id=args.join('-');if(app(id)){terminalOutput(state,`Opening ${app(id).name}…`);openApp(id);}else terminalOutput(state,'Application not found. Use ls to list apps, then open <app>.');}
    else if(Object.hasOwn(responses,cmd))terminalOutput(state,responses[cmd]);
    else terminalOutput(state,`Unknown portfolio command: ${value}\nType help for available commands. System commands are not supported.`);
    $('.window-body',state.el).scrollTop=$('.window-body',state.el).scrollHeight;
  }
  // Native dialogs provide focus containment and Escape handling.
  const commandDialog=$('#commandDialog'), commandSearch=$('#commandSearch');
  let paletteIndex=0, paletteMatches=[], paletteReturnFocus;
  const actions=()=>[...D.apps.map(a=>({name:a.name,subtitle:a.subtitle,icon:a.icon,action:()=>openApp(a.id)})),{name:'Recruiter view',subtitle:'Return to the standard portfolio',icon:'home',action:()=>location.assign('../')},{name:'Show desktop',subtitle:'Minimize visible applications',icon:'scan',action:showDesktop},{name:'Switch theme',subtitle:'Dark / light workspace',icon:'sun',action:toggleTheme},{name:'Workspace help',subtitle:'Controls, shortcuts and privacy',icon:'folder',action:()=>$('#helpDialog').showModal()}];
  function renderPalette() {
    const query=commandSearch.value.trim().toLowerCase();
    paletteMatches=actions().filter(a=>`${a.name} ${a.subtitle}`.toLowerCase().includes(query));
    paletteIndex=0;
    $('#commandResults').innerHTML=paletteMatches.length?paletteMatches.map((a,i)=>`<button type="button" class="command-item ${i===0?'is-selected':''}" data-palette-index="${i}">${icon(a.icon)}<span><strong>${e(a.name)}</strong><small>${e(a.subtitle)}</small></span><span>↵</span></button>`).join(''):'<p class="command-empty">No results. Try “research”, “terminal” or “contact”.</p>';
  }
  function openPalette() {if(commandDialog.open)return;paletteReturnFocus=document.activeElement;commandSearch.value='';renderPalette();commandDialog.showModal();commandSearch.focus();}
  function selectPalette(index) {const item=paletteMatches[index];if(!item)return;commandDialog.close();item.action();}
  commandSearch.addEventListener('input',renderPalette);
  commandDialog.addEventListener('keydown',ev=>{
    if(ev.key==='Escape'){ev.preventDefault();commandDialog.close();return;}
    if(ev.key==='ArrowDown'||ev.key==='ArrowUp'){ev.preventDefault();if(!paletteMatches.length)return;paletteIndex=(paletteIndex+(ev.key==='ArrowDown'?1:-1)+paletteMatches.length)%paletteMatches.length;$$('.command-item').forEach((b,i)=>b.classList.toggle('is-selected',i===paletteIndex));$(`[data-palette-index="${paletteIndex}"]`)?.scrollIntoView({block:'nearest'});}
    if(ev.key==='Enter'&&ev.target===commandSearch){ev.preventDefault();selectPalette(paletteIndex);}
  });
  $('.command-search').addEventListener('submit',ev=>{if(ev.submitter?.classList.contains('escape-key'))return;ev.preventDefault();selectPalette(paletteIndex);});
  // Native dialog close restores focus; app activation then chooses its own focus target.
  function showProof(index) {
    const p=D.proofs[index];if(!p)return;
    $('#proofTitle').textContent=`${p.name} · ${p.kind}`;$('#proofImage').src=p.image;$('#proofImage').alt=`${p.name} ${p.kind} recognition`;$('#proofDescription').textContent=p.description;$('#proofOriginal').href=p.image;$('#proofDialog').showModal();
  }
  async function copyEmail() {
    try {if(!navigator.clipboard)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(D.email);toast('Email address copied.');}
    catch (_) {openApp('contact');toast('Clipboard unavailable. Select the displayed email address to copy it.');}
  }
  function showDesktop() {
    if(desktopHidden.length){const ids=[...desktopHidden];desktopHidden=[];ids.forEach(id=>{if(windows.has(id))focusWindow(id,false);});if(activeId)focusWindow(activeId);return;}
    desktopHidden=[...windows.values()].filter(w=>!w.minimized).map(w=>w.id);
    desktopHidden.forEach(id=>{const w=windows.get(id);w.minimized=true;w.el.hidden=true;});activeId=null;syncDock();setHash('desktop');(mobile() ? $('#dockSearch') : $('#desktopToggle')).focus({preventScroll:true});
  }
  function toggleTheme(){theme=theme==='dark'?'light':'dark';applyPreferences();savePreferences();}
  document.addEventListener('click',ev=>{
    const opener=ev.target.closest('[data-open]');if(opener){openApp(opener.dataset.open);return;}
    const cmdButton=ev.target.closest('[data-palette-index]');if(cmdButton){selectPalette(Number(cmdButton.dataset.paletteIndex));return;}
    const proof=ev.target.closest('[data-proof]');if(proof){showProof(Number(proof.dataset.proof));return;}
    const win=ev.target.closest('.os-window');const state=win&&windows.get(win.dataset.app);
    if(!state)return;
    const control=ev.target.closest('[data-action]');
    if(control){({close:closeWindow,minimize:minimizeWindow,maximize:maximizeWindow}[control.dataset.action])?.(state.id);return;}
    const domain=ev.target.closest('[data-domain]');if(domain)renderDomain(state,Number(domain.dataset.domain));
    const stage=ev.target.closest('[data-stage]');if(stage)renderStage(state,Number(stage.dataset.stage));
    const filter=ev.target.closest('[data-filter]');if(filter){state.filter=filter.dataset.filter;$$('.filter',state.el).forEach(b=>b.setAttribute('aria-pressed',String(b===filter)));filterFindings(state);}
    const finding=ev.target.closest('[data-finding]');if(finding)renderFinding(state,finding.dataset.finding);
    if(ev.target.closest('[data-findings-back]'))renderFindings(state);
    if(ev.target.closest('[data-copy-email]'))copyEmail();
    const command=ev.target.closest('[data-terminal-command]');if(command){runCommand(state,command.dataset.terminalCommand);$('.terminal-input',state.el).focus({preventScroll:true});}
  });
  document.addEventListener('keydown',ev=>{
    if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==='k'){ev.preventDefault();if(!$('#proofDialog').open&&!$('#helpDialog').open)openPalette();}
    if((ev.ctrlKey||ev.metaKey)&&ev.key==='`'){ev.preventDefault();if(!$('dialog[open]'))openApp('terminal');}
  });
  $('#desktopToggle').addEventListener('click',showDesktop);
  $('#paletteButton').addEventListener('click',openPalette);
  $('#helpButton').addEventListener('click',()=>$('#helpDialog').showModal());
  $('#themeButton').addEventListener('click',toggleTheme);
  $('#motionButton').addEventListener('click',()=>{if(reduceMedia.matches){toast('Reduced motion is enabled in your system settings.');return;}motion=!motion;applyPreferences();savePreferences();});
  reduceMedia.addEventListener('change',applyPreferences);
  $$('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
  const desktopIds=['profile','surface','findings','methodology','recognition','operations','files','contact'];
  $('#desktopApps').innerHTML=desktopIds.map(id=>{const a=app(id);return `<button class="desktop-app" type="button" data-open="${id}" aria-label="Open ${e(a.name)}">${appIcon(a)}<span>${e(a.name)}</span></button>`;}).join('');
  const dockIds=['home','profile','findings','methodology','recognition','operations','terminal','contact'];
  $('#dock').innerHTML=dockIds.map((id,i)=>{const a=app(id);return `${i===6?'<span class="dock-separator" aria-hidden="true"></span>':''}<button type="button" class="dock-button" data-open="${id}" aria-label="Open ${e(a.name)}">${appIcon(a)}<span class="dock-tooltip">${e(a.name)}</span></button>`;}).join('')+`<span class="dock-separator" aria-hidden="true"></span><button type="button" class="dock-button" id="dockSearch" aria-label="Search all applications"><span class="app-icon neutral">${icon('search')}</span><span class="dock-tooltip">Search apps · Ctrl / ⌘ K</span></button>`;
  $('#dockSearch').addEventListener('click',openPalette);
  const clock=()=>{const now=new Date();$('#clock').textContent=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',hour12:false}).format(now)+' IST';$('#clock').dateTime=now.toISOString();};
  clock();setInterval(clock,30000);applyPreferences();
  let resizeTimer;
  addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>windows.forEach(w=>{constrain(w);w.el.inert=mobile() && w.id!==activeId;}),100);});
  addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(app(id))openApp(id);});
  const initial=location.hash.slice(1);if(initial==='desktop')syncDock();else { const id=app(initial)?initial:'home';openApp(id);if(id!=='terminal')document.activeElement?.blur(); }
})();
