/* KALENDRA/OS 1.0 — local, allowlisted portfolio navigation. No shell or target requests. */
(() => {
  'use strict';
  const SITE = 'https://kalendra456.github.io/kalendra/';
  const EMAIL = 'yaswanthkukkala123@gmail.com';
  const apps = {
    home: { title: 'Overview', subtitle: 'Start here', keywords: 'home welcome workspace' },
    profile: { title: 'Whoami', subtitle: 'Profile, experience & credentials', keywords: 'about experience tatva ceh oscp ccse' },
    surface: { title: 'Attack Surface', subtitle: 'Web, API & complex-logic expertise', keywords: 'skills authentication authorization identity appsec source protocol' },
    findings: { title: 'Findings Vault', subtitle: 'Sanitized offensive case work', keywords: 'critical case files government business impact' },
    lab: { title: 'Exploit Lab', subtitle: 'Assessment delivery methodology', keywords: 'workflow scope validate report retest tools' },
    recognition: { title: 'Recognition', subtitle: 'Public acknowledgments & evidence', keywords: 'sap accenture aldi drexel hall fame proof' },
    operations: { title: 'Operations', subtitle: 'Defensive engineering context', keywords: 'soc siem edr xdr soar wazuh grafana zabbix glpi' },
    terminal: { title: 'Terminal', subtitle: 'Explore with portfolio commands', keywords: 'shell cli help command' },
    contact: { title: 'Contact', subtitle: 'Email, LinkedIn & professional opportunities', keywords: 'linkedin github email hire job role' },
    config: { title: 'Preferences', subtitle: 'Theme, motion & keyboard shortcuts', keywords: 'settings theme light dark reduce motion help' }
  };
  const layer = document.getElementById('window-layer');
  const palette = document.getElementById('command-palette');
  const paletteInput = document.getElementById('palette-input');
  const results = document.getElementById('palette-results');
  const proofDialog = document.getElementById('proof-dialog');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 700px)');
  const windows = new Map();
  const wm = window.createKalendraWindowManager({ layer, mobile, windows, icon, announce, activate: id => focusWindow(id, false) });
  let active = '', topZ = 5, desktopHidden = false, toastTimer, paletteReturnFocus;
  let paletteMatches = [], paletteSelection = 0;
  let termHistory = [], termIndex = 0, termDraft = '';
  const terminalCommands = ['help','whoami','skills','methodology','findings','recognition','labs','operations','experience','contact','open','ls','pwd','date','theme','clear','about'];
  function icon(name) {
    // Names only come from the fixed application/icon registry.
    return name === 'terminal' ? '<span class="terminal-glyph" aria-hidden="true">&gt;_</span>' : `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  }
  function element(tag, cls, text) { const node = document.createElement(tag); if (cls) node.className = cls; if (text !== undefined) node.textContent = text; return node; }
  function announce(text) { document.getElementById('announcer').textContent = text; }
  function readPreference(key) { try { return localStorage.getItem(key); } catch (_) { return null; } }
  function savePreference(key, value) { try { localStorage.setItem(key, value); } catch (_) { /* Storage is optional. */ } }
  const savedTheme = readPreference('kalendra-os-theme');
  document.documentElement.dataset.theme = ['light','dark'].includes(savedTheme) ? savedTheme : 'dark';
  let reduceMotion = readPreference('kalendra-os-motion') === 'reduce';
  function updatePreferences() {
    const isReduced = reduceMotion || reduced.matches;
    document.documentElement.dataset.motion = isReduced ? 'reduce' : 'full';
    document.querySelectorAll('[data-motion-toggle]').forEach(b => { b.setAttribute('aria-pressed', String(isReduced)); b.textContent = reduced.matches ? 'System: reduced' : isReduced ? 'Motion reduced' : 'Reduce motion'; b.disabled = reduced.matches; });
    document.querySelectorAll('[data-theme-toggle]').forEach(b => { const label = document.documentElement.dataset.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'; b.setAttribute('aria-label',label); if (!b.querySelector('.icon')) b.textContent = label; });
  }
  function toggleTheme() { const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = theme; savePreference('kalendra-os-theme', theme); updatePreferences(); announce(`${theme} theme enabled`); }
  reduced.addEventListener('change', updatePreferences);
  function toast(text) { const node = document.getElementById('toast'); node.textContent = text; node.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { node.hidden = true; }, 4500); }
  function bounds() { return wm.bounds(); }
  function initialRect(id, offset=0) { return wm.initialRect(id,offset); }
  function fitRect(rect) { return wm.fitRect(rect); }
  function applyRect(win,rect) { wm.applyRect(win,rect); }
  function setHash(id) { try { const next = id ? `#${id}` : location.pathname + location.search; history.replaceState(null,'',next); } catch (_) { /* Local previews may have restricted history. */ } }
  function updateDock() {
    document.querySelectorAll('[data-dock]').forEach(button => {
      const id = button.dataset.dock, win = windows.get(id);
      button.classList.toggle('is-running', Boolean(win));
      button.setAttribute('aria-pressed',String(Boolean(win && !win.node.hidden && id === active)));
      button.setAttribute('aria-label',`${win ? (win.node.hidden ? 'Restore' : 'Focus') : 'Open'} ${apps[id].title}`);
    });
    const visible = [...windows.values()].filter(w => !w.node.hidden).length;
    document.getElementById('empty-desktop').hidden = visible !== 0;
    document.getElementById('window-count').textContent = `${windows.size} app${windows.size === 1 ? '' : 's'} open`;
    document.getElementById('show-desktop').innerHTML = `${icon('home')} ${visible ? 'Show desktop' : 'Restore windows'}`;
  }
  function focusWindow(id, moveFocus = true) {
    const win = windows.get(id); if (!win) return;
    win.node.hidden = false; active = id;
    if (topZ > 10000) { [...windows.values()].sort((a,b) => Number(a.node.style.zIndex)-Number(b.node.style.zIndex)).forEach((w,i) => { w.node.style.zIndex = i+6; }); topZ=windows.size+10; }
    win.node.style.zIndex = ++topZ;
    windows.forEach((w,key) => w.node.classList.toggle('is-active',key===id));
    if (moveFocus) win.node.focus({preventScroll:true});
    updateDock();
  }
  function focusNext() {
    const next = [...windows.entries()].filter(([,w])=>!w.node.hidden).sort((a,b)=>Number(b[1].node.style.zIndex)-Number(a[1].node.style.zIndex))[0];
    if (next) { focusWindow(next[0]); setHash(next[0]); }
    else { active=''; setHash(''); updateDock(); document.getElementById('palette-trigger').focus({preventScroll:true}); }
  }
  function control(action, title) { const b = element('button'); b.type='button'; b.dataset.windowAction=action; b.setAttribute('aria-label', `${title} window`); b.title=title; b.innerHTML=icon(action); return b; }
  function openApp(id, changeHash = true) {
    if (!Object.hasOwn(apps,id)) return;
    desktopHidden = false;
    if (windows.has(id)) { focusWindow(id); if(changeHash)setHash(id); return; }
    const app = apps[id], node=element('section','app-window');
    node.dataset.app=id; node.id=`window-${id}`; node.tabIndex=-1; node.setAttribute('role','region'); node.setAttribute('aria-labelledby',`title-${id}`);
    const bar=element('div','window-titlebar');
    const title=element('h2','window-title'); title.id=`title-${id}`; title.innerHTML=icon(id); title.append(document.createTextNode(app.title));
    const tag=element('small','',id==='terminal'?'PORTFOLIO SHELL':'KALENDRA/OS'); title.append(tag);
    const controls=element('div','window-controls'); controls.append(control('minimize','Minimize'),control('maximize','Maximize'),control('close','Close'));
    bar.append(title,controls);
    const body=element('div','window-body'); body.append(document.getElementById(`app-${id}`).content.cloneNode(true));
    const footer=element('div','window-footer'); footer.append(element('span','',`/${id === 'home' ? 'workspace' : id}`),element('span','status-right','PUBLIC CONTENT · LOCAL INTERFACE'));
    const grip=element('button','resize-grip'); grip.type='button'; grip.setAttribute('aria-label',`Resize ${app.title} window. Use arrow keys.`); grip.title='Drag to resize · arrow keys when focused';
    node.append(bar,body,footer,grip); layer.append(node);
    const win={node,rect:initialRect(id,(windows.size%4)*22),maximized:false}; windows.set(id,win); applyRect(win,win.rect);
    node.addEventListener('pointerdown',()=>focusWindow(id,false));
    node.addEventListener('focusin',()=>{if(active!==id)focusWindow(id,false);});
    controls.addEventListener('click',e=>{const b=e.target.closest('[data-window-action]');if(!b)return; if(b.dataset.windowAction==='close')closeWindow(id);if(b.dataset.windowAction==='minimize')minimizeWindow(id);if(b.dataset.windowAction==='maximize')maximizeWindow(id);});
    setupDrag(win,bar,grip);
    bar.addEventListener('dblclick',e=>{if(!e.target.closest('button')&&!mobile.matches)maximizeWindow(id);});
    focusWindow(id); if(changeHash)setHash(id); updatePreferences();
    if(id==='terminal') { setupTerminal(node); node.querySelector('input').focus({preventScroll:true}); }
    announce(`${app.title} opened`);
  }
  function closeWindow(id) { const win=windows.get(id);if(!win)return;wm.detach(win);win.node.remove();windows.delete(id);announce(`${apps[id].title} closed`);focusNext(); }
  function minimizeWindow(id) { const win=windows.get(id);if(!win)return;wm.cancelInteraction();win.node.hidden=true;announce(`${apps[id].title} minimized. Restore it from the dock.`);focusNext(); }
  function maximizeWindow(id) { wm.toggleMaximize(id); }
  function setupDrag(win,bar,grip) { wm.attach(win,bar,grip); }
  function showDesktop() {
    const visible=[...windows.values()].some(w=>!w.node.hidden);
    if(visible){windows.forEach(w=>{w.wasVisible=!w.node.hidden;w.node.hidden=true;});active='';desktopHidden=true;setHash('');updateDock();document.getElementById('show-desktop').focus();}
    else if(windows.size){windows.forEach(w=>{if(!desktopHidden||w.wasVisible)w.node.hidden=false;});desktopHidden=false;focusNext();}
    else openApp('home');
  }
  function arrangeWindows() { wm.arrange();toast('Open windows recentered.'); }
  // Command palette: actions are selected from a fixed registry, never evaluated as code.
  const commands=[...Object.entries(apps).map(([id,a])=>({id,title:a.title,desc:a.subtitle,keywords:a.keywords,icon:id,run:()=>openApp(id)})),{id:'desktop',title:'Show desktop',desc:'Minimize or restore open windows',keywords:'minimize restore clear',icon:'home',run:showDesktop},{id:'arrange',title:'Arrange windows',desc:'Recenter the workspace',keywords:'reset layout',icon:'restore',run:arrangeWindows},{id:'theme',title:'Switch color theme',desc:'Midnight / light',keywords:'theme dark light',icon:'sun',run:toggleTheme},{id:'recruiter',title:'Recruiter View',desc:'Return to the standard portfolio',keywords:'exit traditional portfolio',icon:'external',run:()=>location.assign(SITE)}];
  function renderPalette(){const query=paletteInput.value.trim().toLowerCase();paletteMatches=commands.filter(c=>`${c.title} ${c.desc} ${c.keywords}`.toLowerCase().includes(query));paletteSelection=0;results.replaceChildren();if(!paletteMatches.length){results.append(element('p','palette-empty','No matching apps. Try “skills”, “contact”, or “terminal”.'));return;}paletteMatches.forEach((c,i)=>{const button=element('button','palette-result');button.type='button';button.innerHTML=icon(c.icon);const text=element('span');text.append(element('strong','',c.title),element('small','',c.desc));button.append(text);button.addEventListener('click',()=>executePalette(i));button.addEventListener('pointerenter',()=>{paletteSelection=i;selectPalette(false);});results.append(button);});selectPalette(false);}
  function selectPalette(scroll=true){[...results.children].forEach((b,i)=>{b.classList.toggle('is-selected',i===paletteSelection);b.setAttribute('aria-current',String(i===paletteSelection));});if(scroll)results.children[paletteSelection]?.scrollIntoView({block:'nearest'});}
  function executePalette(i){const c=paletteMatches[i];if(!c)return;paletteReturnFocus=null;palette.close();c.run();}
  function openPalette(){if(proofDialog.open)return;paletteReturnFocus=document.activeElement;if(!palette.open)palette.showModal();paletteInput.value='';renderPalette();paletteInput.focus();}
  palette.addEventListener('close',()=>{if(paletteReturnFocus?.isConnected)paletteReturnFocus.focus({preventScroll:true});});
  palette.addEventListener('click',e=>{if(e.target===palette){const r=palette.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)palette.close();}});
  paletteInput.addEventListener('input',renderPalette);
  paletteInput.addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();if(!paletteMatches.length)return;paletteSelection=(paletteSelection+(e.key==='ArrowDown'?1:-1)+paletteMatches.length)%paletteMatches.length;selectPalette();}if(e.key==='Enter'){e.preventDefault();executePalette(paletteSelection);}});
  document.getElementById('palette-trigger').addEventListener('click',openPalette);
  document.getElementById('show-desktop').addEventListener('click',showDesktop);
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(palette.open)palette.close();else openPalette();return;}
    if(palette.open||proofDialog.open)return;
    if(e.altKey&&e.key.toLowerCase()==='w'&&active){e.preventDefault();closeWindow(active);return;}
    if(e.altKey&&e.shiftKey&&e.key.startsWith('Arrow')&&active&&!mobile.matches){const win=windows.get(active);if(win.maximized)return;e.preventDefault();const d={ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20]}[e.key];applyRect(win,{...win.rect,x:win.rect.x+d[0],y:win.rect.y+d[1]});}
  });
  const proofFiles=new Set(['sap-credits.jpg','accenture-hof.jpg','aldi-hof.jpg','drexel-hof.jpg']);
  function openProof(file,title){if(!proofFiles.has(file))return;const image=document.getElementById('proof-image'),loading=document.getElementById('proof-loading'),error=document.getElementById('proof-error');image.hidden=true;error.hidden=true;loading.hidden=false;document.getElementById('proof-title').textContent=title;image.alt=title;const url=SITE+'assets/recognitions/'+file;document.getElementById('proof-link').href=url;image.onload=()=>{loading.hidden=true;image.hidden=false;};image.onerror=()=>{loading.hidden=true;error.hidden=false;image.hidden=true;};image.src=url;proofDialog.showModal();}
  proofDialog.querySelector('[data-close-proof]').addEventListener('click',()=>proofDialog.close());
  async function copyEmail(){try{if(!navigator.clipboard)throw new Error('Clipboard not available');await navigator.clipboard.writeText(EMAIL);toast('Email address copied.');}catch(_){toast(`Copy this address: ${EMAIL}`);}}
  document.addEventListener('click',e=>{
    const open=e.target.closest('[data-open]');if(open){openApp(open.dataset.open);return;}
    if(e.target.closest('[data-theme-toggle]')){toggleTheme();return;}
    if(e.target.closest('[data-motion-toggle]')){reduceMotion=!reduceMotion;savePreference('kalendra-os-motion',reduceMotion?'reduce':'full');updatePreferences();return;}
    if(e.target.closest('[data-arrange]')){arrangeWindows();return;}
    if(e.target.closest('[data-copy-email]')){copyEmail();return;}
    const domain=e.target.closest('[data-domain]');if(domain){const body=domain.closest('.window-body');body.querySelectorAll('[data-domain]').forEach(b=>b.setAttribute('aria-pressed',String(b===domain)));body.querySelectorAll('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==domain.dataset.domain);return;}
    const stage=e.target.closest('[data-stage]');if(stage){const body=stage.closest('.window-body');body.querySelectorAll('[data-stage]').forEach(b=>b.setAttribute('aria-pressed',String(b===stage)));body.querySelectorAll('[data-stage-panel]').forEach(p=>p.hidden=p.dataset.stagePanel!==stage.dataset.stage);return;}
    const proof=e.target.closest('[data-proof]');if(proof)openProof(proof.dataset.proof,proof.dataset.proofTitle);
  });
  function terminalOutput(win,command,output,appLink){const log=win.querySelector('.terminal-output');const group=element('div');if(command){const line=element('div','command-line');line.append(element('span','','kalendra@portfolio:~$'),document.createTextNode(command));group.append(line);}group.append(element('pre','',output));if(appLink){const button=element('button','text-button',`Open ${apps[appLink].title} →`);button.dataset.open=appLink;group.append(button);}log.append(group);while(log.childElementCount>60)log.firstElementChild.remove();const body=win.querySelector('.window-body');requestAnimationFrame(()=>{body.scrollTop=body.scrollHeight;});}
  const terminalText={
    help:['PORTFOLIO COMMANDS\n\nwhoami        Profile and positioning\nskills        Core offensive expertise\nmethodology   Assessment delivery lifecycle\nfindings      Sanitized case overview\nrecognition   Public acknowledgments\nlabs          Assessment methodology\noperations    Defensive engineering\nexperience    Professional experience\ncontact       Email and profiles\nopen <app>    Open a workspace application\nls            List available applications\npwd           Show this portfolio location\ndate          Your device’s local date/time\ntheme         Switch midnight / light\nclear         Clear the terminal\nabout         About this workspace\n\nThis is a content navigator. No system commands are executed.'],
    whoami:['Yaswanth Kalendra\nOffensive Security & Application Security\nWeb & API Penetration Testing\n\nManual, source-assisted, and protocol-aware assessment.\nScope → validation → risk communication → remediation → retest.','profile'],
    skills:['PRIMARY TRACK\nWeb application penetration testing\nAPI authorization: roles, tenants, object ownership\nAuthentication, session security, OAuth / OIDC\nBusiness logic and source-assisted validation\nState machines, invariants, and protocol logic\n\nSUPPORTING DEPTH\nSIEM/XDR, endpoint telemetry, EDR context, and SOAR-aligned workflows.','surface'],
    methodology:['01  Control scope and rules of engagement\n02  Model the attack surface and trust boundaries\n03  Validate exploitability with disciplined evidence\n04  Calibrate severity and communicate business risk\n05  Guide remediation, retest, and verify closure criteria','lab'],
    findings:['SANITIZED CASE / 01\nAuthentication control failure — Government Private Program\nPublic summary: confirmed critical outcome.\n\nFocus: identity transitions and trust decisions.\nDelivery: manual validation, impact evidence, root cause, and remediation guidance.\n\nPrivate report details and target identifiers are not included.','findings'],
    recognition:['PUBLIC RECOGNITION\nSAP — Security Credits\nAccenture — Responsible Disclosure\nALDI — IT Security Hall of Fame\nDrexel University — Hall of Fame\n\nEvidence links are available in the Recognition application.','recognition'],
    labs:['ASSESSMENT DELIVERY LAB\nScope controls, attack-surface models, manual validation,\nreporting discipline, and remediation/retest criteria.\n\nThis workspace does not connect to live test targets.','lab'],
    operations:['DEFENSIVE ENGINEERING CONTEXT\n01  Wazuh 5 SIEM & Log Pipeline\n02  Unified SOC Observability: Wazuh, Grafana, Zabbix\n03  Incident Workflow Automation: Wazuh → GLPI\n\nSupporting capabilities: OpenSearch, syslog, endpoint telemetry,\nSNMP, firewall rules, VPN/NAT, and alert deduplication.','operations'],
    experience:['2022–present  Independent Application Security Researcher\n              & Penetration Tester\n2025–present  Tatva Networks · Cybersecurity Analyst\n\nCEH v13: certified March 2026\nOSCP: active preparation\nCCSE: study in progress','profile'],
    contact:[`Email: ${EMAIL}\nLinkedIn: Yaswanth Kalendra Kukkala\nGitHub: kalendra456\n\nOpen Contact for direct professional profile links.`,'contact'],
    ls:[Object.keys(apps).join('  ')],
    pwd:['/kalendra/os/ — a browser-based portfolio, not a filesystem'],
    about:['KALENDRA/OS 1.0\nAn optional interactive view of Yaswanth Kalendra’s public portfolio.\nBuilt with semantic HTML, CSS, and vanilla JavaScript.\nNo account, analytics, shell execution, or live target access.']
  };
  function setupTerminal(win){const form=win.querySelector('form'),input=win.querySelector('input');terminalOutput(win,'','Welcome to KALENDRA/OS. Type help to explore.');
    form.addEventListener('submit',e=>{e.preventDefault();const raw=input.value.trim().slice(0,256);if(!raw)return;input.value='';termHistory.push(raw);termHistory=termHistory.slice(-60);termIndex=termHistory.length;termDraft='';const [cmd,...args]=raw.toLowerCase().split(/\s+/);if(cmd==='clear'&&!args.length){win.querySelector('.terminal-output').replaceChildren();return;}
      if(cmd==='open'){const id=args[0];if(args.length===1&&Object.hasOwn(apps,id)){terminalOutput(win,raw,`Opening ${apps[id].title}…`);openApp(id);}else terminalOutput(win,raw,'Usage: open <app>\nAvailable: '+Object.keys(apps).join(', '));return;}
      if(cmd==='date'&&!args.length){terminalOutput(win,raw,new Date().toLocaleString()+' (your device’s local time)');return;}
      if(cmd==='theme'&&!args.length){toggleTheme();terminalOutput(win,raw,`Theme: ${document.documentElement.dataset.theme}`);return;}
      if(Object.hasOwn(terminalText,cmd)&&!args.length){terminalOutput(win,raw,...terminalText[cmd]);return;}
      terminalOutput(win,raw,'Command not available in this portfolio. Type help.\nNo system commands are executed.');
    });
    input.addEventListener('keydown',e=>{if(e.key==='ArrowUp'){e.preventDefault();if(termIndex===termHistory.length)termDraft=input.value;termIndex=Math.max(0,termIndex-1);input.value=termHistory[termIndex]||'';}if(e.key==='ArrowDown'){e.preventDefault();termIndex=Math.min(termHistory.length,termIndex+1);input.value=termIndex===termHistory.length?termDraft:termHistory[termIndex];}if(e.key==='Tab'&&input.value.trim()){const value=input.value.toLowerCase(),parts=value.split(/\s+/);const candidates=parts[0]==='open'&&parts.length===2?Object.keys(apps).filter(x=>x.startsWith(parts[1])).map(x=>'open '+x):terminalCommands.filter(x=>x.startsWith(value));if(candidates.length){e.preventDefault();if(candidates.length===1)input.value=candidates[0];else terminalOutput(win,'',candidates.join('  '));}}});
  }
  function tick(){const clock=document.getElementById('clock'),date=new Date();clock.textContent=date.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',hour12:false});clock.dateTime=date.toISOString();clock.title='Your local time · '+date.toLocaleDateString();}
  tick();setInterval(tick,30000);updatePreferences();
  let ambientFrame=0;
  document.getElementById('desktop').addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||reduceMotion||reduced.matches||ambientFrame)return;ambientFrame=requestAnimationFrame(()=>{document.documentElement.style.setProperty('--mx',e.clientX+'px');document.documentElement.style.setProperty('--my',(e.clientY-54)+'px');ambientFrame=0;});});
  addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(Object.hasOwn(apps,id))openApp(id,false);});
  const initial=location.hash.slice(1);openApp(Object.hasOwn(apps,initial)?initial:'home',false);
})();
