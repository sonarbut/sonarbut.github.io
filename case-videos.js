// Fetch clips shortly before they enter the viewport, instead of all at once.
const caseVideos = document.querySelectorAll('video[data-src]');
function loadVideo(video) {
  if (!video.dataset.src) return;
  video.preload = 'auto';
  video.src = video.dataset.src;
  delete video.dataset.src;
  video.load();
}

if ('IntersectionObserver' in window) {
  const preloadObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      loadVideo(entry.target);
      preloadObserver.unobserve(entry.target);
    }
  }, { rootMargin: '500px 0px' });

  const playbackObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const video = entry.target;
      if (entry.isIntersecting) {
        loadVideo(video);
        video.play().catch(() => {
          // Native controls remain available when autoplay is blocked.
        });
      } else {
        video.pause();
      }
    }
  }, { threshold: 0.1 });

  caseVideos.forEach(video => {
    preloadObserver.observe(video);
    playbackObserver.observe(video);
  });
} else {
  caseVideos.forEach(loadVideo);
}
