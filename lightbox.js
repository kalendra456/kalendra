(() => {
  'use strict';

  const triggers = [...document.querySelectorAll('[data-lightbox]')];
  if (!triggers.length) return;

  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const modal = document.createElement('div');
  modal.className = 'proof-lightbox';
  modal.hidden = true;
  modal.innerHTML = `
    <div class="proof-lightbox-backdrop" data-lightbox-close aria-hidden="true"></div>
    <div class="proof-lightbox-dialog" role="dialog" aria-modal="true" aria-labelledby="proofLightboxTitle" aria-describedby="proofLightboxDescription" tabindex="-1">
      <div class="proof-lightbox-toolbar">
        <span class="proof-lightbox-count" aria-live="polite"></span>
        <div class="proof-lightbox-controls">
          <button class="proof-lightbox-button proof-lightbox-previous" type="button" aria-label="View previous proof">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"></path></svg>
          </button>
          <button class="proof-lightbox-button proof-lightbox-next" type="button" aria-label="View next proof">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>
          </button>
          <button class="proof-lightbox-button proof-lightbox-close" type="button" aria-label="Close proof viewer" data-lightbox-close>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg>
          </button>
        </div>
      </div>
      <div class="proof-lightbox-stage">
        <img class="proof-lightbox-image" alt="">
      </div>
      <div class="proof-lightbox-caption">
        <strong id="proofLightboxTitle"></strong>
        <span id="proofLightboxDescription"></span>
      </div>
    </div>
  `;
  body.appendChild(modal);

  const dialog = modal.querySelector('.proof-lightbox-dialog');
  const image = modal.querySelector('.proof-lightbox-image');
  const title = modal.querySelector('#proofLightboxTitle');
  const description = modal.querySelector('#proofLightboxDescription');
  const count = modal.querySelector('.proof-lightbox-count');
  const previousButton = modal.querySelector('.proof-lightbox-previous');
  const nextButton = modal.querySelector('.proof-lightbox-next');
  const closeButton = modal.querySelector('.proof-lightbox-close');

  let activeIndex = 0;
  let returnFocus = null;

  const normalizeText = (value = '') => value.replace(/\s+/g, ' ').trim();

  const getDetails = (trigger) => {
    const card = trigger.closest('.gallery-card, .proof-card');
    const cardTitle = card?.querySelector('.gallery-card-body h3, strong');
    const cardDescription = card?.querySelector('.gallery-card-body p, small');
    const triggerImage = trigger.querySelector('img');

    return {
      src: trigger.dataset.lightboxSrc || trigger.getAttribute('href') || triggerImage?.currentSrc || triggerImage?.src || '',
      title: normalizeText(trigger.dataset.lightboxTitle || cardTitle?.textContent || triggerImage?.alt || 'Recognition evidence'),
      description: normalizeText(trigger.dataset.lightboxDescription || cardDescription?.textContent || triggerImage?.alt || 'Selected public evidence of responsible security research.'),
      alt: normalizeText(triggerImage?.alt || trigger.dataset.lightboxTitle || cardTitle?.textContent || 'Recognition evidence')
    };
  };

  const preloadAdjacent = () => {
    if (triggers.length < 2) return;
    const indexes = [
      (activeIndex - 1 + triggers.length) % triggers.length,
      (activeIndex + 1) % triggers.length
    ];
    indexes.forEach((index) => {
      const source = getDetails(triggers[index]).src;
      if (!source) return;
      const preload = new Image();
      preload.src = source;
    });
  };

  const render = () => {
    const details = getDetails(triggers[activeIndex]);
    if (!details.src) return;

    image.classList.add('is-loading');
    image.src = details.src;
    image.alt = details.alt;
    title.textContent = details.title;
    description.textContent = details.description;
    count.textContent = `${activeIndex + 1} / ${triggers.length}`;

    const multiple = triggers.length > 1;
    previousButton.hidden = !multiple;
    nextButton.hidden = !multiple;
    preloadAdjacent();
  };

  const show = (index, trigger) => {
    activeIndex = index;
    returnFocus = trigger;
    render();
    modal.hidden = false;
    body.classList.add('lightbox-open');
    requestAnimationFrame(() => dialog.focus({ preventScroll: true }));
  };

  const close = () => {
    if (modal.hidden) return;
    modal.hidden = true;
    body.classList.remove('lightbox-open');
    image.removeAttribute('src');
    returnFocus?.focus({ preventScroll: true });
    returnFocus = null;
  };

  const move = (direction) => {
    activeIndex = (activeIndex + direction + triggers.length) % triggers.length;
    if (!reduceMotion) image.animate?.(
      [
        { opacity: .35, transform: `translateX(${direction * 8}px) scale(.995)` },
        { opacity: 1, transform: 'translateX(0) scale(1)' }
      ],
      { duration: 190, easing: 'cubic-bezier(.2,.75,.25,1)' }
    );
    render();
  };

  triggers.forEach((trigger, index) => {
    trigger.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      show(index, trigger);
    });
  });

  image.addEventListener('load', () => image.classList.remove('is-loading'));
  image.addEventListener('error', () => {
    image.classList.remove('is-loading');
    description.textContent = 'This proof image could not be loaded in the viewer. Open the link in a new tab to inspect the original asset.';
  });

  previousButton.addEventListener('click', () => move(-1));
  nextButton.addEventListener('click', () => move(1));
  modal.querySelectorAll('[data-lightbox-close]').forEach((element) => element.addEventListener('click', close));

  document.addEventListener('keydown', (event) => {
    if (modal.hidden) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }

    if (event.key === 'ArrowLeft' && triggers.length > 1) {
      event.preventDefault();
      move(-1);
      return;
    }

    if (event.key === 'ArrowRight' && triggers.length > 1) {
      event.preventDefault();
      move(1);
      return;
    }

    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('button:not([hidden]), a[href], [tabindex]:not([tabindex="-1"])')]
      .filter((element) => !element.hasAttribute('disabled'));
    if (!focusable.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener('pagehide', close);
})();
