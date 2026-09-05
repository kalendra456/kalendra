/* Shared portfolio entry chooser. No tracking or persistent view preference. */
(() => {
  'use strict';
  const scriptURL = document.currentScript?.src;
  if (!scriptURL || !window.HTMLDialogElement || !HTMLDialogElement.prototype.showModal) return;
  const base = new URL('.', scriptURL);
  const paths = { recruiter: base.pathname, os: new URL('os/', base).pathname };
  const canonicalPath = path => path.replace(/index\.html$/, '').replace(/\/?$/, '/');
  const current = canonicalPath(location.pathname);
  const view = current === paths.os ? 'os' : current === paths.recruiter ? 'recruiter' : null;
  if (!view || document.getElementById('portfolio-view-dialog')) return;
  const names = { recruiter: 'Recruiter View', os: 'KALENDRA/OS' };
  const handoffKey = 'portfolio-view';
  const arrival = new URL(location.href);
  const chosenArrival = arrival.searchParams.get(handoffKey) === view;
  if (arrival.searchParams.has(handoffKey)) {
    arrival.searchParams.delete(handoffKey);
    try { history.replaceState(history.state, '', arrival); } catch (_) { /* Navigation still works. */ }
  }
  const switchIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="7" height="16" rx="2"/><rect x="14" y="4" width="7" height="16" rx="2"/></svg>';
  const dialog = document.createElement('dialog');
  dialog.id = 'portfolio-view-dialog';
  dialog.className = 'vc-dialog';
  dialog.setAttribute('aria-labelledby', 'vc-title');
  dialog.setAttribute('aria-describedby', 'vc-description');
  // Static, authored markup only. No URL or visitor input is interpolated into HTML.
  dialog.innerHTML = `
    <div class="vc-heading-row"><span class="vc-identity">YK<span>Yaswanth Kalendra</span></span><span class="vc-edition">TWO PERSPECTIVES. ONE PORTFOLIO.</span></div>
    <p class="vc-eyebrow">WELCOME TO MY PORTFOLIO</p>
    <h2 id="vc-title">Which view would you like?</h2>
    <p id="vc-description">Start with a focused overview or explore the interactive workspace.</p>
    <div class="vc-options">
      <a class="vc-option vc-recruiter" data-view="recruiter" href="#">
        <span class="vc-preview vc-page" aria-hidden="true"><span class="vc-mini-nav"></span><span class="vc-mini-title"></span><span class="vc-mini-line"></span><span class="vc-mini-line vc-short"></span><span class="vc-mini-cards"><i></i><i></i><i></i></span></span>
        <span class="vc-option-label">FOCUSED &amp; PROFESSIONAL</span><strong class="vc-option-title">Recruiter View</strong>
        <span class="vc-option-description">Experience, expertise and validated work in a clear, easy-to-scan portfolio.</span>
        <span class="vc-option-tags">Experience · Case studies · Contact</span>
        <span class="vc-option-action">Open Recruiter View <span aria-hidden="true">↗</span></span>
      </a>
      <a class="vc-option vc-os" data-view="os" href="#">
        <span class="vc-preview vc-desktop" aria-hidden="true"><span class="vc-mini-apps"><i></i><i></i><i></i></span><span class="vc-mini-window"><span>● ● ●</span><b>kalendra@portfolio:~$</b><em>whoami<span>_</span></em></span><span class="vc-mini-dock"><i></i><i></i><i></i><i></i></span></span>
        <span class="vc-option-label">INTERACTIVE &amp; EXPLORABLE</span><strong class="vc-option-title">KALENDRA/OS</strong>
        <span class="vc-option-description">An interactive desktop with apps, case files and a portfolio terminal.</span>
        <span class="vc-option-tags">Desktop · Findings vault · Terminal</span>
        <span class="vc-option-action">Launch KALENDRA/OS <span aria-hidden="true">↗</span></span>
      </a>
    </div>
    <div class="vc-bottom"><p>You can switch views at any time.</p><button type="button" class="vc-stay"></button></div>`;
  document.body.append(dialog);
  const toggles = [];
  let returnFocus = null;
  const stay = dialog.querySelector('.vc-stay');
  stay.textContent = `Continue in ${names[view]}`;
  function closeChooser() { if (dialog.open) dialog.close(); }
  function openChooser(trigger) {
    if (dialog.open) return;
    returnFocus = trigger instanceof HTMLElement ? trigger : document.activeElement;
    dialog.showModal();
    toggles.forEach(button => button.setAttribute('aria-expanded', 'true'));
    dialog.querySelector(`[data-view="${view}"]`).focus({ preventScroll: true });
  }
  function choose(target) {
    if (target === view) { closeChooser(); return; }
    const next = new URL(paths[target], base);
    // Consumed on arrival: one click selects the view without a second welcome prompt.
    next.searchParams.set(handoffKey, target);
    location.assign(next.href);
  }
  dialog.querySelectorAll('[data-view]').forEach(link => {
    link.href = new URL(paths[link.dataset.view], base).href;
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      choose(link.dataset.view);
    });
  });
  stay.addEventListener('click', closeChooser);
  dialog.addEventListener('close', () => {
    toggles.forEach(button => button.setAttribute('aria-expanded', 'false'));
    if (returnFocus instanceof HTMLElement && returnFocus.isConnected) returnFocus.focus({ preventScroll: true });
  });
  // Keep workspace shortcuts (e.g. Ctrl+K) from opening a second modal behind this one.
  document.addEventListener('keydown', event => {
    if (!dialog.open) return;
    event.stopImmediatePropagation();
    if (event.key === 'Tab') {
      event.preventDefault();
      const controls = [...dialog.querySelectorAll('a[href], button:not([disabled])')];
      const index = controls.indexOf(document.activeElement);
      const next = event.shiftKey ? (index <= 0 ? controls.length - 1 : index - 1) : (index + 1) % controls.length;
      controls[next]?.focus({ preventScroll: true });
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') event.preventDefault();
    if (event.key === 'Escape') { event.preventDefault(); closeChooser(); }
  }, true);
  function addToggle(parent, oldLink) {
    if (!parent) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'vc-toggle';
    button.innerHTML = `${switchIcon}<span>Switch view</span>`;
    button.setAttribute('aria-label', 'Switch portfolio view');
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', dialog.id);
    button.setAttribute('aria-expanded', 'false');
    button.title = 'Choose Recruiter View or KALENDRA/OS';
    button.addEventListener('click', () => openChooser(button));
    if (oldLink) oldLink.replaceWith(button); else parent.prepend(button);
    toggles.push(button);
  }
  if (view === 'os') {
    const link = document.querySelector('.system-right .recruiter-link');
    addToggle(document.querySelector('.system-right'), link);
  } else {
    addToggle(document.querySelector('.header-actions'));
    // The existing explicit launch link also counts as a view selection.
    document.querySelectorAll('a.os-launch').forEach(link => {
      link.addEventListener('click', event => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        choose('os');
      });
    });
  }
  // Never remember a default silently: direct visits and reloads of either entry ask again.
  if (!chosenArrival) openChooser();
})();
