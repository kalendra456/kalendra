

  // Pointer interaction layer v21
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const hoverPointer = window.matchMedia('(hover: hover)').matches;

  if (!reduceMotion && finePointer && hoverPointer) {
    body.classList.add('pointer-effects-enabled');

    const cursorAura = document.createElement('div');
    const cursorDot = document.createElement('div');
    cursorAura.className = 'cursor-aura';
    cursorDot.className = 'cursor-dot';
    cursorAura.setAttribute('aria-hidden', 'true');
    cursorDot.setAttribute('aria-hidden', 'true');
    body.append(cursorAura, cursorDot);

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let auraX = targetX;
    let auraY = targetY;
    let pointerFrame = 0;

    const placePointer = (element, x, y) => {
      element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };

    const renderPointer = () => {
      auraX += (targetX - auraX) * 0.16;
      auraY += (targetY - auraY) * 0.16;
      placePointer(cursorAura, auraX, auraY);
      placePointer(cursorDot, targetX, targetY);

      if (Math.abs(targetX - auraX) > 0.08 || Math.abs(targetY - auraY) > 0.08) {
        pointerFrame = window.requestAnimationFrame(renderPointer);
      } else {
        pointerFrame = 0;
      }
    };

    const wakePointer = () => {
      if (!pointerFrame) pointerFrame = window.requestAnimationFrame(renderPointer);
    };

    const setPointerVisible = (visible) => {
      cursorAura.classList.toggle('is-visible', visible);
      cursorDot.classList.toggle('is-visible', visible);
    };

    window.addEventListener('pointermove', (event) => {
      if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      targetX = event.clientX;
      targetY = event.clientY;
      setPointerVisible(true);
      wakePointer();
    }, { passive: true });

    document.addEventListener('pointerleave', () => setPointerVisible(false));
    window.addEventListener('blur', () => setPointerVisible(false));

    const interactiveSelector = 'a, button, .gallery-card, .case-card, .gallery-overview, .recognition-summary';
    document.addEventListener('pointerover', (event) => {
      const target = event.target instanceof Element ? event.target.closest(interactiveSelector) : null;
      const active = Boolean(target);
      cursorAura.classList.toggle('is-interactive', active);
      cursorDot.classList.toggle('is-interactive', active);
    });

    document.addEventListener('pointerout', (event) => {
      const next = event.relatedTarget instanceof Element ? event.relatedTarget.closest(interactiveSelector) : null;
      if (next) return;
      cursorAura.classList.remove('is-interactive');
      cursorDot.classList.remove('is-interactive');
    });

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const tiltTargets = document.querySelectorAll('.gallery-card, .case-card, .gallery-overview, .recognition-summary');

    tiltTargets.forEach((card) => {
      card.classList.add('pointer-tilt');
      const spotlight = document.createElement('i');
      spotlight.className = 'pointer-spotlight';
      spotlight.setAttribute('aria-hidden', 'true');
      card.appendChild(spotlight);

      const image = card.querySelector('.gallery-image img, img');

      card.addEventListener('pointerenter', () => {
        card.classList.add('is-pointer-active');
      });

      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const relativeX = clamp((event.clientX - rect.left) / rect.width, 0, 1);
        const relativeY = clamp((event.clientY - rect.top) / rect.height, 0, 1);
        const rotateY = (relativeX - 0.5) * 7;
        const rotateX = (0.5 - relativeY) * 7;

        card.style.setProperty('--spot-x', `${(relativeX * 100).toFixed(1)}%`);
        card.style.setProperty('--spot-y', `${(relativeY * 100).toFixed(1)}%`);
        card.style.transform = `perspective(1050px) translate3d(0, -5px, 0) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;

        if (image) {
          const shiftX = (0.5 - relativeX) * 8;
          const shiftY = (0.5 - relativeY) * 7;
          image.style.transform = `scale(1.055) translate3d(${shiftX.toFixed(2)}px, ${shiftY.toFixed(2)}px, 0)`;
        }
      }, { passive: true });

      card.addEventListener('pointerleave', () => {
        card.classList.remove('is-pointer-active');
        card.style.removeProperty('--spot-x');
        card.style.removeProperty('--spot-y');
        card.style.removeProperty('transform');
        image?.style.removeProperty('transform');
      });
    });

    document.querySelectorAll('.button, .icon-button, .gallery-back').forEach((control) => {
      control.classList.add('pointer-magnetic');

      control.addEventListener('pointermove', (event) => {
        const rect = control.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 9;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 7;
        control.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;
      }, { passive: true });

      control.addEventListener('pointerleave', () => {
        control.style.removeProperty('translate');
      });
    });
  }
