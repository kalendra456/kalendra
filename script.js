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
})();
