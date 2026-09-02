(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const header = document.getElementById('siteHeader');
  const themeToggle = document.getElementById('themeToggle');
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  const scrollProgress = document.getElementById('scrollProgress');
  const copyEmailButton = document.getElementById('copyEmail');
  const toast = document.getElementById('toast');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const systemTheme = window.matchMedia('(prefers-color-scheme: light)');

  let toastTimer;

  const showToast = (message) => {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = window.setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 2600);
  };

  const getTheme = () => root.dataset.theme === 'light' ? 'light' : 'dark';

  const updateThemeControl = () => {
    if (!themeToggle) return;
    const currentTheme = getTheme();
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    themeToggle.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
    themeToggle.setAttribute('aria-pressed', String(currentTheme === 'light'));

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute('content', currentTheme === 'dark' ? '#07111f' : '#f4f7fb');
    }
  };

  const setTheme = (theme, persist = true) => {
    const normalizedTheme = theme === 'light' ? 'light' : 'dark';
    root.dataset.theme = normalizedTheme;
    if (persist) {
      try {
        localStorage.setItem('portfolio-theme', normalizedTheme);
      } catch (_) {
        // The portfolio remains functional if storage is unavailable.
      }
    }
    updateThemeControl();
  };

  updateThemeControl();

  themeToggle?.addEventListener('click', () => {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  });

  systemTheme.addEventListener?.('change', (event) => {
    try {
      if (!localStorage.getItem('portfolio-theme')) {
        setTheme(event.matches ? 'light' : 'dark', false);
      }
    } catch (_) {
      setTheme(event.matches ? 'light' : 'dark', false);
    }
  });

  const closeMobileNav = () => {
    if (!menuToggle || !mobileNav) return;
    mobileNav.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    body.classList.remove('nav-open');
  };

  const openMobileNav = () => {
    if (!menuToggle || !mobileNav) return;
    mobileNav.hidden = false;
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close navigation');
    body.classList.add('nav-open');
  };

  menuToggle?.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMobileNav() : openMobileNav();
  });

  mobileNav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileNav);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMobileNav();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 920) closeMobileNav();
  });

  const updateScrollUI = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min((scrollTop / scrollable) * 100, 100) : 0;

    if (scrollProgress) scrollProgress.style.width = `${progress}%`;
    header?.classList.toggle('is-scrolled', scrollTop > 16);
  };

  updateScrollUI();
  window.addEventListener('scroll', updateScrollUI, { passive: true });

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  const revealItems = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.08
    });

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 4, 3) * 55}ms`;
      revealObserver.observe(item);
    });
  }

  const desktopLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"]')];
  const trackedSections = desktopLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && desktopLinks.length && trackedSections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      desktopLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === `#${visible.target.id}`;
        link.classList.toggle('is-active', isActive);
        if (isActive) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, {
      rootMargin: '-28% 0px -60% 0px',
      threshold: [0.01, 0.2, 0.5]
    });

    trackedSections.forEach((section) => sectionObserver.observe(section));
  }

  const copyText = async (value) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const helper = document.createElement('textarea');
    helper.value = value;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    const copied = document.execCommand('copy');
    helper.remove();
    if (!copied) throw new Error('Copy command failed');
  };

  copyEmailButton?.addEventListener('click', async () => {
    const email = copyEmailButton.dataset.email;
    if (!email) return;

    try {
      await copyText(email);
      showToast('Email address copied to clipboard.');
    } catch (_) {
      showToast(`Email: ${email}`);
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      if (reduceMotion) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', targetId);
    });
  });

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

  // Visual motion layer v22
  if (!reduceMotion) {
    let ambientTargetX = 50;
    let ambientTargetY = 18;
    let ambientCurrentX = ambientTargetX;
    let ambientCurrentY = ambientTargetY;
    let ambientFrame = 0;

    const renderAmbient = () => {
      ambientCurrentX += (ambientTargetX - ambientCurrentX) * 0.085;
      ambientCurrentY += (ambientTargetY - ambientCurrentY) * 0.085;

      root.style.setProperty('--ambient-x', `${ambientCurrentX.toFixed(2)}%`);
      root.style.setProperty('--ambient-y', `${ambientCurrentY.toFixed(2)}%`);
      root.style.setProperty('--ambient-shift-x', `${((ambientCurrentX - 50) * 0.34).toFixed(2)}px`);
      root.style.setProperty('--ambient-shift-y', `${((ambientCurrentY - 50) * 0.24).toFixed(2)}px`);

      if (Math.abs(ambientTargetX - ambientCurrentX) > 0.03 || Math.abs(ambientTargetY - ambientCurrentY) > 0.03) {
        ambientFrame = window.requestAnimationFrame(renderAmbient);
      } else {
        ambientFrame = 0;
      }
    };

    const wakeAmbient = () => {
      if (!ambientFrame) ambientFrame = window.requestAnimationFrame(renderAmbient);
    };

    if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('pointermove', (event) => {
        ambientTargetX = Math.min(Math.max((event.clientX / Math.max(window.innerWidth, 1)) * 100, 8), 92);
        ambientTargetY = Math.min(Math.max((event.clientY / Math.max(window.innerHeight, 1)) * 100, 8), 92);
        wakeAmbient();
      }, { passive: true });
    }
  }

  const counterGroups = document.querySelectorAll('.metrics, .gallery-stats, .recognition-numbers');

  if (!reduceMotion && counterGroups.length && 'IntersectionObserver' in window) {
    const prepareCounter = (element) => {
      const original = element.textContent.trim();
      const match = original.match(/^(.*?)(\d+(?:\.\d+)?)(.*)$/);
      if (!match) return null;

      const target = Number.parseFloat(match[2]);
      if (!Number.isFinite(target)) return null;

      const decimals = match[2].includes('.') ? match[2].split('.')[1].length : 0;
      const prefix = match[1];
      const suffix = match[3];

      element.textContent = '';
      element.setAttribute('aria-label', original);

      if (prefix) {
        const prefixNode = document.createElement('span');
        prefixNode.className = 'motion-affix motion-prefix';
        prefixNode.setAttribute('aria-hidden', 'true');
        prefixNode.textContent = prefix;
        element.appendChild(prefixNode);
      }

      const numberNode = document.createElement('span');
      numberNode.className = 'motion-number';
      numberNode.setAttribute('aria-hidden', 'true');
      numberNode.textContent = (0).toFixed(decimals);
      element.appendChild(numberNode);

      if (suffix) {
        const suffixNode = document.createElement('span');
        suffixNode.className = 'motion-affix motion-suffix';
        suffixNode.setAttribute('aria-hidden', 'true');
        suffixNode.textContent = suffix;
        element.appendChild(suffixNode);
      }

      return { numberNode, target, decimals };
    };

    const animateCounter = ({ numberNode, target, decimals }) => {
      const duration = Math.min(1750, 950 + target * 22);
      const start = performance.now();

      const tick = (now) => {
        const elapsed = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - elapsed, 3);
        const value = target * eased;
        numberNode.textContent = value.toFixed(decimals);

        if (elapsed < 1) {
          window.requestAnimationFrame(tick);
        } else {
          numberNode.textContent = target.toFixed(decimals);
        }
      };

      window.requestAnimationFrame(tick);
    };

    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const counters = [...entry.target.querySelectorAll('strong')]
          .map(prepareCounter)
          .filter(Boolean);

        counters.forEach((counter, index) => {
          window.setTimeout(() => animateCounter(counter), index * 90);
        });

        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.28,
      rootMargin: '0px 0px -8% 0px'
    });

    counterGroups.forEach((group) => counterObserver.observe(group));
  }

})();
