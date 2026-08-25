const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');

let deferredInstallPrompt;
const installButton = document.createElement('button');
installButton.className = 'app-install';
installButton.type = 'button';
installButton.hidden = true;
installButton.textContent = 'Install app';
installButton.setAttribute('aria-label', 'Install ASARK app');
document.querySelector('.site-header')?.append(installButton);

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButton.hidden = false;
});

installButton.addEventListener('click', async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = undefined;
  installButton.hidden = true;
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = undefined;
  installButton.hidden = true;
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const manifest = document.querySelector('link[rel="manifest"]');
    const serviceWorkerUrl = manifest
      ? new URL('service-worker.js', manifest.href)
      : new URL('service-worker.js', window.location.href);
    navigator.serviceWorker.register(serviceWorkerUrl);
  });
}

document.querySelectorAll('.site-footer').forEach((footer) => {
  footer.textContent = 'ASARK · The Art of Future Luxury';
});

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

const imageProjects = {
  '1600585154340': 'projects/contemporary-estate.html',
  '1618221195710': 'projects/quiet-luxury.html',
  '1600607688969': 'projects/glass-and-stone.html',
  '1496747611176': 'projects/modern-elegance.html',
  '1483985988355': 'projects/new-classic.html',
  '1549298916': 'projects/timeless-style.html',
  '1567899378494': 'projects/beyond-the-shore.html',
  '1600585154526': 'projects/private-villa.html',
  '1600047509807': 'projects/minimal-estate.html',
  '1616486338812': 'projects/material-stories.html',
  '1600210492486': 'projects/living-spaces.html',
  '1615529162924': 'projects/dining-and-kitchen.html'
};

document.querySelectorAll('a[href$="design.html"]').forEach((link) => {
  link.textContent = 'AI Technology';
});

document.querySelectorAll('.visual-card, .card[data-project-link], .card').forEach((card) => {
  const image = card.querySelector('img');
  if (!card.matches('.visual-card') && !card.dataset.projectLink && !image) return;
  const imageKey = image ? Object.keys(imageProjects).find((key) => image.src.includes(key)) : null;
  const destination = card.dataset.projectLink || (imageKey && imageProjects[imageKey]) || 'visual.html';
  card.tabIndex = 0;
  card.setAttribute('role', 'link');
  card.addEventListener('click', (event) => {
    if (event.target.closest('a, button')) return;
    window.location.href = destination;
  });
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      window.location.href = destination;
    }
  });
});

const editorialRecommendations = {
  'architecture.html': [['Architecture books', 'architecture coffee table books'], ['Outdoor lighting', 'architectural outdoor lighting'], ['Architectural model tools', 'architectural model making tools']],
  'interiors.html': [['Ambient lighting', 'ambient home lighting'], ['Home fragrance', 'luxury home fragrance'], ['Decorative objects', 'modern decorative objects'], ['Bedding', 'premium bedding'], ['Furniture', 'designer furniture']],
  'ai-technology.html': [['Smart-home hubs', 'smart home hub'], ['Smart lighting', 'smart lighting'], ['Projectors', 'home projector'], ['Sensors', 'smart home sensors']],
  'lifestyle.html': [['Coffee equipment', 'premium coffee equipment'], ['Travel equipment', 'premium travel equipment'], ['Watches', 'minimalist watches'], ['Everyday objects', 'design everyday objects']]
};

const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const recommendedProducts = editorialRecommendations[currentPage];

if (recommendedProducts && document.querySelector('main')) {
  const recommendations = document.createElement('aside');
  recommendations.className = 'page-affiliate';
  recommendations.setAttribute('aria-label', 'ASARK recommendations');
  const links = recommendedProducts.map(([label, query]) => {
    const indiaUrl = new URL('https://www.amazon.in/s');
    indiaUrl.searchParams.set('k', query);
    indiaUrl.searchParams.set('tag', 'asark-21');
    return `<a href="${indiaUrl.href}" target="_blank" rel="sponsored noopener noreferrer">${label} <span aria-hidden="true">↗</span></a>`;
  }).join('');
  recommendations.innerHTML = `<p class="eyebrow">ASARK recommends</p><h2>Selected for this collection.</h2><p class="page-affiliate-disclosure">As an Amazon Associate I earn from qualifying purchases.</p><div class="page-affiliate-links">${links}</div>`;
  document.querySelector('.site-footer')?.before(recommendations);
}
const filters = document.querySelectorAll('[data-filter]');
const visualCards = document.querySelectorAll('.visual-card');
filters.forEach((button) => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  filters.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  visualCards.forEach((card) => { card.hidden = filter !== 'all' && card.dataset.category !== filter; });
}));

const shareButton = document.querySelector('#share-button');
if (navigator.share && shareButton) {
  shareButton.addEventListener('click', () => navigator.share({ title: document.title, url: window.location.href }));
}
const saveButton = document.querySelector('#save-button');
if (saveButton) {
  saveButton.addEventListener('click', () => { saveButton.textContent = 'Saved'; saveButton.disabled = true; });
}
