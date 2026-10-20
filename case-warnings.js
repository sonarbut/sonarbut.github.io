(() => {
  const hero = document.querySelector('.warnings-gallery');
  const portrait = hero?.querySelector('img');
  if (!portrait) return;

  let frames = [];
  let ready = false;
  let started = false;
  const loadFrames = () => {
    if (started) return;
    started = true;
  // Decode before switching, so slow connections never produce empty frames.
    frames = Array.from({ length: 7 }, (_, index) => {
    const image = new Image();
    image.src = `assets/abuse-case/warnings/${index + 1}.webp`;
    return image;
  });
  Promise.all(frames.map(image => image.decode())).then(() => {
    ready = true;
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
  let previous = null;
  let distance = 0;
  let lastChange = -Infinity;
  const resetMovement = () => { previous = null; distance = 0; };

  hero.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !ready) return;
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
