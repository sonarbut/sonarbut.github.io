(() => {
  const hero = document.querySelector('.restrictions-gallery');
  const portrait = hero?.querySelector('img');
  if (!portrait) return;

  const mobile = window.matchMedia('(max-width: 600px)');
  const caption = hero.closest('figure').querySelector('figcaption');
  const syncMode = () => {
    caption.textContent = mobile.matches
      ? 'Тапни, чтобы увидеть другие точки'
      : 'Наведи, чтобы увидеть другие точки';
    if (mobile.matches) {
      hero.setAttribute('role', 'button');
      hero.setAttribute('tabindex', '0');
      hero.setAttribute('aria-label', 'Показать следующую точку');
    } else {
      hero.removeAttribute('role');
      hero.removeAttribute('tabindex');
      hero.removeAttribute('aria-label');
    }
  };
  syncMode();
  mobile.addEventListener('change', syncMode);
  let pendingTap = false;
  let frames = [];
  let ready = false;
  let started = false;
  const loadFrames = () => {
    if (started) return;
    started = true;
  // Decode before switching, so slow connections never produce empty frames.
    frames = Array.from({ length: 8 }, (_, index) => {
    const image = new Image();
    image.src = `assets/abuse-case/restrictions/${index + 1}.webp`;
    return image;
  });
  Promise.all(frames.map(image => image.decode())).then(() => {
    ready = true;
    if (pendingTap && mobile.matches) advanceFrame();
    pendingTap = false;
  }).catch(() => { /* Keep the original image if an asset cannot load. */ });

  };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      loadFrames();
      observer.disconnect();
    }, { rootMargin: '600px 0px' });
    observer.observe(hero);
  } else {
    loadFrames();
  }

  let frame = 0;
  const advanceFrame = () => {
    frame = (frame + 1) % frames.length;
    portrait.src = frames[frame].src;
  };
  const onTap = () => {
    if (!mobile.matches) return;
    if (ready) advanceFrame();
    else { pendingTap = true; loadFrames(); }
  };
  hero.addEventListener('click', onTap);
  hero.addEventListener('keydown', event => {
    if (mobile.matches && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onTap();
    }
  });
  let previous = null;
  let distance = 0;
  let lastChange = -Infinity;
  const resetMovement = () => { previous = null; distance = 0; };

  hero.addEventListener('pointermove', event => {
    if (mobile.matches || event.pointerType !== 'mouse' || !ready) return;
    if (previous) distance += Math.hypot(event.clientX - previous.x, event.clientY - previous.y);
    previous = { x: event.clientX, y: event.clientY };
    // Advance only while moving, at most ten times per second.
    if (distance < 24 || event.timeStamp - lastChange < 100) return;
    frame = (frame + 1) % frames.length;
    portrait.src = frames[frame].src;
    lastChange = event.timeStamp;
    distance = 0;
  }, { passive: true });
  hero.addEventListener('pointerleave', resetMovement);
  window.addEventListener('blur', resetMovement);
})();
