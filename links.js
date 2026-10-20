// Fill these destinations with the owner's confirmed addresses.
// Empty values deliberately remain unavailable rather than opening invented URLs.
const links = { cv: 'assets/Narbut_senior_product_designer_CV.pdf', email: 'mailto:sonarbut@yandex.ru', telegram: 'https://t.me/narbuta', abuse: 'abuse.html', delivery: 'delivery.html', auction: 'auction.html' };
for (const anchor of document.querySelectorAll('[data-link]')) {
  const destination = links[anchor.dataset.link];
  if (!destination) continue;
  anchor.href = destination;
  anchor.removeAttribute('aria-disabled');
  if (anchor.dataset.link === 'cv') anchor.setAttribute('download', 'Нарбут_CV.pdf');
}
