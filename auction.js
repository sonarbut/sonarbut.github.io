(() => {
  const hero = document.querySelector('.auction-image');
  const portrait = hero?.querySelector('img');
  if (!portrait) return;

  const cover = portrait.getAttribute('src');
  let hovered = false;

  // Decode before switching, so slow connections never produce empty frames.
  const frames = Array.from({ length: 3 }, (_, index) => {
    const image = new Image();
    image.src = `assets/auction/${index + 1}.png`;
    return image;
  });
  let ready = false;
  Promise.all(frames.map(image => image.decode())).then(() => {
    ready = true;
    if (hovered) portrait.src = frames[frame].src;
  }).catch(() => { /* Keep the original image if an asset cannot load. */ });

  let frame = 0;
  let previous = null;
  let distance = 0;
  let lastChange = -Infinity;
  const resetMovement = () => { previous = null; distance = 0; };

  const showCover = () => {
    hovered = false;
    resetMovement();
    portrait.src = cover;
  };
  hero.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    hovered = true;
    frame = 0;
    lastChange = -Infinity;
    resetMovement();
    if (ready) portrait.src = frames[frame].src;
  });
  hero.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !hovered || !ready) return;
    if (previous) distance += Math.hypot(event.clientX - previous.x, event.clientY - previous.y);
    previous = { x: event.clientX, y: event.clientY };
    // Advance only while moving, at most ten times per second.
    if (distance < 24 || event.timeStamp - lastChange < 100) return;
    frame = (frame + 1) % frames.length;
    portrait.src = frames[frame].src;
    lastChange = event.timeStamp;
    distance = 0;
  }, { passive: true });
  hero.addEventListener('pointerleave', showCover);
  window.addEventListener('blur', showCover);
})();
