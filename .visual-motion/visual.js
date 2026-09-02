
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

  if (!reduceMotion && counterGroups.length) {
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
