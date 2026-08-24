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
  card.addEventListener('click', () => { window.location.href = destination; });
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      window.location.href = destination;
    }
  });
});

const affiliateTopic = (() => {
  const page = `${window.location.pathname} ${document.title}`.toLowerCase();
  if (page.includes('affiliate.html')) return null;
  if (page.includes('yacht') || page.includes('shore')) return { title: 'For life by the water', products: [['Explore marine binoculars', 'marine binoculars'], ['Explore travel cameras', 'compact travel camera']] };
  if (page.includes('fashion') || page.includes('elegance') || page.includes('classic')) return { title: 'For considered style', products: [['Explore leather watches', 'minimalist leather watch'], ['Explore garment care', 'garment steamer']] };
  if (page.includes('kitchen') || page.includes('dining')) return { title: 'For the kitchen ritual', products: [['Explore chef knives', 'chef knife set'], ['Explore pendant lighting', 'modern pendant light']] };
  if (page.includes('technology') || page.includes('intelligent')) return { title: 'For an intelligent home', products: [['Explore smart-home hubs', 'smart home hub'], ['Explore smart lighting', 'smart LED light bulb']] };
  if (page.includes('interior') || page.includes('living') || page.includes('material') || page.includes('quiet luxury')) return { title: 'For a considered interior', products: [['Explore ambient lighting', 'dimmable LED floor lamp'], ['Explore home fragrances', 'luxury reed diffuser']] };
  if (page.includes('lifestyle') || page.includes('timeless')) return { title: 'For daily rituals', products: [['Explore coffee rituals', 'manual coffee grinder'], ['Explore design objects', 'modern desk organizer']] };
  if (page.includes('architecture') || page.includes('estate') || page.includes('villa') || page.includes('glass and stone') || page.includes('minimal')) return { title: 'For architectural living', products: [['Explore architectural books', 'architecture coffee table book'], ['Explore outdoor lighting', 'modern outdoor wall light']] };
  return { title: 'For considered living', products: [['Explore design books', 'interior design coffee table book'], ['Explore ambient lighting', 'dimmable LED table lamp']] };
})();

if (affiliateTopic && document.querySelector('main')) {
  const recommendations = document.createElement('aside');
  recommendations.className = 'page-affiliate';
  recommendations.setAttribute('aria-label', 'Related Amazon recommendations');
  const links = affiliateTopic.products.map(([label, query]) => {
    const url = new URL('https://www.amazon.in/s');
    url.searchParams.set('k', query);
    url.searchParams.set('tag', 'asark-21');
    return `<a href="${url.href}" target="_blank" rel="sponsored noopener noreferrer">${label} <span aria-hidden="true">↗</span></a>`;
  }).join('');
  recommendations.innerHTML = `<p class="eyebrow">ASARK recommends</p><h2>${affiliateTopic.title}</h2><p class="page-affiliate-disclosure">As an Amazon Associate I earn from qualifying purchases.</p><div class="page-affiliate-links">${links}</div>`;
  document.querySelector('.site-footer')?.before(recommendations);
}
