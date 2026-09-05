/* KALENDRA/OS window geometry. Local interface only; no network or shell access. */
(() => {
  'use strict';
  window.createKalendraWindowManager = ({ layer, mobile, windows, icon, announce, activate }) => {
    const desktop = layer.parentElement;
    const dock = document.querySelector('.dock');
    const bar = document.querySelector('.system-bar');
    const clamp = (n, lo, hi) => Math.max(lo, Math.min(n, Math.max(lo, hi)));
    let gesture = null, layoutFrame = 0;
    function bounds() {
      const gap = mobile.matches ? 8 : 12;
      return { width: layer.clientWidth, height: layer.clientHeight, gap };
    }
    function available() {
      const b = bounds();
      return { x: b.gap, y: b.gap, width: Math.max(1, b.width - 2*b.gap), height: Math.max(1, b.height - 2*b.gap) };
    }
    function fitRect(rect) {
      const a = available();
      const width = clamp(rect.width, Math.min(380, a.width), a.width);
      const height = clamp(rect.height, Math.min(300, a.height), a.height);
      return { x: clamp(rect.x, a.x, a.x+a.width-width), y: clamp(rect.y, a.y, a.y+a.height-height), width, height };
    }
    function initialRect(id, offset=0) {
      const b = bounds(), a = available();
      const sidebar = b.width > 1000 ? 250 : 0;
      const width = Math.min(id === 'home' ? 940 : id === 'terminal' ? 760 : 820, Math.max(380, a.width-sidebar-130));
      const height = Math.min(id === 'home' ? 660 : 610, a.height-16);
      return fitRect({ x: Math.max(110,(b.width-sidebar-width)/2)+offset, y: (b.height-height)/2+offset, width, height });
    }
    function render(win) {
      // Floating geometry is never overwritten by maximize, mobile mode or viewport fitting.
      const r = (win.maximized || mobile.matches) ? available() : fitRect(win.rect);
      win.displayRect = { ...r };
      for (const [name, value] of Object.entries({left:r.x,top:r.y,width:r.width,height:r.height})) {
        win.node.style[name] = `${value}px`;
        win.node.style.setProperty(`--wm-${name}`, `${value}px`);
      }
      win.node.classList.toggle('is-maximized', Boolean(win.maximized));
      win.node.dataset.windowMode = mobile.matches ? 'mobile' : win.maximized ? 'maximized' : 'floating';
      const button = win.node.querySelector('[data-window-action="maximize"]');
      if (button) {
        const label = win.maximized ? 'Restore' : 'Maximize';
        button.innerHTML = icon(win.maximized ? 'restore' : 'maximize');
        button.title = `${label} window (Alt+Enter)`;
        button.setAttribute('aria-label', `${label} window`);
        button.setAttribute('aria-pressed', String(Boolean(win.maximized)));
        button.disabled = mobile.matches;
      }
      win.node.querySelectorAll('[data-resize]').forEach(handle => { handle.hidden = mobile.matches || win.maximized; });
      if (win.sizeLabel) win.sizeLabel.textContent = `${Math.round(r.width)} × ${Math.round(r.height)}`;
    }
    function applyRect(win, rect) { win.rect = fitRect(rect); render(win); }
    function syncLayout() {
      layoutFrame = 0;
      const viewportBottom = window.visualViewport ? window.visualViewport.offsetTop + window.visualViewport.height : innerHeight;
      const top = bar ? bar.getBoundingClientRect().bottom : 54;
      const dockTop = dock ? dock.getBoundingClientRect().top : innerHeight-100;
      const bottom = Math.max(top+24, Math.min(dockTop-8, viewportBottom-8));
      desktop.style.top = `${top}px`;
      desktop.style.bottom = `${Math.max(0,innerHeight-bottom)}px`;
      windows.forEach(render);
    }
    function scheduleLayout() {
      if (gesture) gesture.finish(false);
      if (!layoutFrame) layoutFrame = requestAnimationFrame(syncLayout);
    }
    function cancelInteraction() { if (gesture) gesture.finish(true); }
    function toggleMaximize(id) {
      const win = windows.get(id);
      if (!win || mobile.matches) return;
      cancelInteraction();
      win.maximized = !win.maximized;
      render(win); activate(id);
      announce(`${win.node.querySelector('.window-title')?.textContent || 'Window'} ${win.maximized ? 'maximized' : 'restored'}`);
    }
    function resizeRect(start, edge, dx, dy) {
      const a = available();
      const minW = Math.min(380,a.width), minH = Math.min(300,a.height);
      let left=start.x, top=start.y, right=left+start.width, bottom=top+start.height;
      if (edge.includes('w')) left=clamp(start.x+dx,a.x,right-minW);
      if (edge.includes('e')) right=clamp(right+dx,left+minW,a.x+a.width);
      if (edge.includes('n')) top=clamp(start.y+dy,a.y,bottom-minH);
      if (edge.includes('s')) bottom=clamp(bottom+dy,top+minH,a.y+a.height);
      return {x:left,y:top,width:right-left,height:bottom-top};
    }
    function attach(win, titlebar, grip) {
      grip.dataset.resize = 'se';
      grip.setAttribute('aria-label','Resize window. Arrow keys change size; Shift for larger steps.');
      grip.title = 'Drag a corner or edge to resize · Arrow keys when focused';
      const handles=[grip];
      for (const edge of ['n','e','s','w','ne','nw','sw']) {
        const handle=document.createElement('div');
        handle.className='wm-resize-edge'; handle.dataset.resize=edge; handle.setAttribute('aria-hidden','true');
        win.node.append(handle); handles.push(handle);
      }
      const sizeLabel=document.createElement('span');
      sizeLabel.className='wm-size-readout'; sizeLabel.setAttribute('aria-hidden','true');
      win.node.append(sizeLabel); win.sizeLabel=sizeLabel;
      titlebar.title='Drag to move · Double-click to maximize or restore';
      win.node.querySelector('[data-window-action="maximize"]').setAttribute('aria-keyshortcuts','Alt+Enter');
      function begin(event, edge='') {
        if (mobile.matches || event.button!==0 || event.isPrimary===false || (edge && win.maximized)) return;
        if (!edge && event.target.closest('button,a,input')) return;
        cancelInteraction();
        event.preventDefault(); activate(win.node.dataset.app);
        const target=event.currentTarget, pointerId=event.pointerId;
        const original={rect:{...win.rect},maximized:win.maximized};
        let start={...win.displayRect}, px=event.clientX, py=event.clientY;
        const downX=px, downY=py;
        const fraction=clamp((px-layer.getBoundingClientRect().left-start.x)/start.width,0,1);
        let moved=false, raf=0, pending=null, finished=false;
        try { target.setPointerCapture(pointerId); } catch (_) { return; }
        function applyPending() {
          raf=0;
          if (!pending || finished) return;
          const point=pending; pending=null;
          if (!moved && Math.hypot(point.x-downX,point.y-downY)<4) return;
          if (!moved) {
            moved=true;
            win.node.classList.add(edge?'is-resizing':'is-dragging');
            document.body.classList.add('wm-interacting');
            document.body.style.setProperty('--wm-cursor',edge ? `${edge}-resize` : 'grabbing');
            if (win.maximized && !edge) {
              win.maximized=false;
              const r=fitRect(win.rect), origin=layer.getBoundingClientRect();
              applyRect(win,{...r,x:point.x-origin.left-r.width*fraction,y:point.y-origin.top-22});
              start={...win.displayRect}; px=point.x; py=point.y;
            }
          }
          const dx=point.x-px, dy=point.y-py;
          applyRect(win,edge ? resizeRect(start,edge,dx,dy) : {...start,x:start.x+dx,y:start.y+dy});
        }
        function move(e) {
          if (e.pointerId!==pointerId) return;
          pending={x:e.clientX,y:e.clientY};
          if (!raf) raf=requestAnimationFrame(applyPending);
        }
        function finish(cancel=false) {
          if (finished) return;
          if (!cancel) applyPending();
          finished=true; cancelAnimationFrame(raf);
          target.removeEventListener('pointermove',move);
          target.removeEventListener('pointerup',up);
          target.removeEventListener('pointercancel',abort);
          target.removeEventListener('lostpointercapture',lost);
          window.removeEventListener('blur',blur);
          document.removeEventListener('keydown',key,true);
          win.node.classList.remove('is-dragging','is-resizing');
          document.body.classList.remove('wm-interacting');
          document.body.style.removeProperty('--wm-cursor');
          if (cancel) { win.rect=original.rect; win.maximized=original.maximized; render(win); }
          gesture=null;
          try { if(target.hasPointerCapture(pointerId))target.releasePointerCapture(pointerId); } catch (_) { /* Detached handles need no release. */ }
          if (moved && edge && !cancel) announce(`Window size ${Math.round(win.displayRect.width)} by ${Math.round(win.displayRect.height)}`);
        }
        function up(e) { if(e.pointerId===pointerId){pending={x:e.clientX,y:e.clientY};finish(false);} }
        function abort(e) { if(e.pointerId===pointerId)finish(true); }
        function lost(e) { if(e.pointerId===pointerId)finish(false); }
        function blur() { finish(false); }
        function key(e) { if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();finish(true);} }
        gesture={win,finish};
        target.addEventListener('pointermove',move);
        target.addEventListener('pointerup',up);
        target.addEventListener('pointercancel',abort);
        target.addEventListener('lostpointercapture',lost);
        window.addEventListener('blur',blur);
        document.addEventListener('keydown',key,true);
      }
      titlebar.addEventListener('pointerdown',e=>begin(e));
      handles.forEach(handle=>handle.addEventListener('pointerdown',e=>begin(e,handle.dataset.resize)));
      grip.addEventListener('keydown',e=>{
        if (mobile.matches || win.maximized) return;
        const moves={ArrowRight:[1,0],ArrowLeft:[-1,0],ArrowDown:[0,1],ArrowUp:[0,-1]};
        if(!moves[e.key])return;
        e.preventDefault(); e.stopPropagation();
        const step=e.shiftKey?50:20, [dx,dy]=moves[e.key];
        applyRect(win,resizeRect(win.displayRect,'se',dx*step,dy*step));
        announce(`Window size ${Math.round(win.displayRect.width)} by ${Math.round(win.displayRect.height)}`);
      });
      render(win);
    }
    function detach(win) { if(gesture?.win===win)gesture.finish(false); }
    function arrange() {
      cancelInteraction();
      let i=0;
      // Do not focus in insertion order or reveal windows that were minimized.
      windows.forEach((win,id)=>{win.maximized=false;applyRect(win,initialRect(id,(i++%4)*22));});
    }
    document.addEventListener('keydown',event=>{
      if (event.defaultPrevented || event.key!=='Enter' || !event.altKey || mobile.matches || document.querySelector('dialog[open]')) return;
      const win=[...windows.values()].find(w=>!w.node.hidden && w.node.classList.contains('is-active'));
      if(win){event.preventDefault();toggleMaximize(win.node.dataset.app);}
    });
    window.addEventListener('resize',scheduleLayout);
    window.visualViewport?.addEventListener('resize',scheduleLayout);
    mobile.addEventListener('change',scheduleLayout);
    if ('ResizeObserver' in window) {
      const observer=new ResizeObserver(scheduleLayout);
      if(dock)observer.observe(dock);
      if(bar)observer.observe(bar);
    }
    syncLayout();
    return {bounds,initialRect,fitRect,applyRect,attach,detach,toggleMaximize,arrange,cancelInteraction};
  };
})();
