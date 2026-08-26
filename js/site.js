const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');

const primarySections = [
  ['index.html', 'Home'], ['index.html#about', 'About'], ['architecture.html', 'Architecture'],
  ['technology.html', 'Technology'], ['semiconductor.html', 'Semiconductor'], ['blogs.html', 'Blogs']
];
const activePage = window.location.pathname.split('/').pop() || 'index.html';
const activeNavHref = activePage === 'index.html' && window.location.hash === '#about'
  ? 'index.html#about'
  : activePage;
if (siteNav) {
  const navigationLinks = primarySections.map(([href, label]) =>
    `<a href="${href}"${href === activeNavHref ? ' aria-current="page"' : ''}>${label}</a>`
  );
  const primaryLinks = navigationLinks.slice(0, -2).join('');
  const secondaryLinks = navigationLinks.slice(-2).join('');
  siteNav.innerHTML = `<div class="nav-links nav-links-primary">${primaryLinks}</div><div class="nav-links nav-links-secondary">${secondaryLinks}</div>`;
}

// Keep every visible editorial image on ASARK within the supplied AI image collection.
const aiImageFiles = [
  'Gemini_Generated_Image_(1).png', 'Gemini_Generated_Image_(2).png',
  'Gemini_Generated_Image_(3).png', 'Gemini_Generated_Image_(4).png',
  'Gemini_Generated_Image_(5).png', 'Gemini_Generated_Image_(6).png',
  'Gemini_Generated_Image_(7).png', 'Gemini_Generated_Image_(8).png',
  'Gemini_Generated_Image_(9).png', 'Gemini_Generated_Image_(10).png',
  'Gemini_Generated_Image_(11).png', 'Gemini_Generated_Image_(12).png',
  'Gemini_Generated_Image_(13).png', 'Gemini_Generated_Image_(14).png',
  'Gemini_Generated_Image_(15).png', 'Gemini_Generated_Image_(16).png',
  'Gemini_Generated_Image_(17).png', 'Gemini_Generated_Image_(18).png',
  'Gemini_Generated_Image_(19).png', 'Gemini_Generated_Image_(20).png',
  'Gemini_Generated_Image_39a5aj39a5aj39a5.png',
  'Gemini_Generated_Image_3mhdo63mhdo63mhd.png',
  'Gemini_Generated_Image_gbjlagbjlagbjlag.png',
  'Gemini_Generated_Image_jquxqcjquxqcjqux.png',
  'Gemini_Generated_Image_jv701qjv701qjv70.png',
  'Gemini_Generated_Image_lc0e35lc0e35lc0e.png',
  'Gemini_Generated_Image_ld8r28ld8r28ld8r.png',
  'Gemini_Generated_Image_o0n0yjo0n0yjo0n0.png',
  'Gemini_Generated_Image_w1zouxw1zouxw1zo.png', 'modern house.png',
  'our-best-look-ever-yet-at-tony-starks-mansion-from-the-book-v0-mq5lg6zmpg1g1.webp'
];
const homeUrl = new URL(document.querySelector('.logo')?.getAttribute('href') || 'index.html', window.location.href);
const aiImageUrl = (index) => new URL(`ai images/HOME/ARCHETECTURE/${aiImageFiles[index % aiImageFiles.length]}`, homeUrl).href;

document.querySelectorAll('img').forEach((image, index) => {
  if (image.closest('.site-header') || image.src.includes('asark-mark')) return;
  image.dataset.originalImage = image.src;
  image.src = aiImageUrl(index);
  image.removeAttribute('srcset');
  image.dataset.aiImage = 'true';
});

document.querySelectorAll('.image-provenance, .visual-source-note').forEach((note) => {
  note.textContent = 'Images are AI-generated visual studies from the ASARK collection. They illustrate concepts and do not depict built projects, real products or real places.';
});

document.querySelectorAll('.visual-info span').forEach((label) => {
  label.textContent = label.textContent.replace('EDITORIAL REFERENCE', 'AI-GENERATED CONCEPT');
});

const headerSearch = document.createElement('form');
headerSearch.className = 'header-search';
headerSearch.setAttribute('role', 'search');
headerSearch.innerHTML = '<label><span class="sr-only">Search ASARK</span><input type="search" name="q" placeholder="Search" autocomplete="off"></label><button type="submit" aria-label="Search ASARK">⌕</button>';
siteNav?.append(headerSearch);

const accountActions = document.createElement('div');
accountActions.className = 'account-actions';
const headerHomeUrl = new URL(document.querySelector('.logo')?.getAttribute('href') || 'index.html', window.location.href);
const loginUrl = new URL('login.html', headerHomeUrl).href;
const signupUrl = new URL('signup.html', headerHomeUrl).href;
accountActions.innerHTML = `<a href="${loginUrl}">Log in</a><a class="account-signup" href="${signupUrl}">Sign up</a>`;
siteNav?.append(accountActions);

headerSearch.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = headerSearch.elements.q.value.trim();
  if (!query) return;
  const homeLink = document.querySelector('.logo')?.getAttribute('href') || 'index.html';
  const homeUrl = new URL(homeLink, window.location.href);
  const blogsUrl = new URL('blogs.html', homeUrl);
  blogsUrl.searchParams.set('q', query);
  window.location.href = blogsUrl.href;
});

let deferredInstallPrompt;
let isInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
const installButton = document.createElement('button');
installButton.className = 'app-install';
installButton.type = 'button';
installButton.hidden = true;
installButton.textContent = 'Install app';
installButton.setAttribute('aria-label', 'Install ASARK app');
document.querySelector('.site-header')?.append(installButton);

const isIosSafari = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
const setInstallButton = () => {
  if (isInstalled) {
    installButton.hidden = true;
    return;
  }
  if (deferredInstallPrompt) {
    installButton.textContent = 'Install app';
    installButton.setAttribute('aria-label', 'Install ASARK app');
    installButton.hidden = false;
    return;
  }
  if (isIosSafari) {
    installButton.textContent = 'Add to Home Screen';
    installButton.setAttribute('aria-label', 'Add ASARK to your iPhone or iPad home screen');
    installButton.hidden = false;
    return;
  }
  installButton.hidden = true;
};

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  setInstallButton();
});

installButton.addEventListener('click', async () => {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = undefined;
    setInstallButton();
    return;
  }
  if (isIosSafari) {
    window.alert('To install ASARK, tap Share and choose Add to Home Screen.');
  }
});

window.addEventListener('appinstalled', () => {
  isInstalled = true;
  deferredInstallPrompt = undefined;
  setInstallButton();
});

setInstallButton();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const manifest = document.querySelector('link[rel="manifest"]');
    const serviceWorkerUrl = manifest
      ? new URL('service-worker.js', manifest.href)
      : new URL('service-worker.js', window.location.href);
    navigator.serviceWorker.register(serviceWorkerUrl).catch(() => {});
  });
}

document.querySelectorAll('.site-footer').forEach((footer) => {
  footer.textContent = '© 2026 ASARK · The Art of Future Luxury';
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

const projectDestinations = {
  'Contemporary Estate': 'projects/contemporary-estate.html',
  'Quiet Luxury': 'projects/quiet-luxury.html',
  'Glass and Stone': 'projects/glass-and-stone.html',
  'Modern Elegance': 'projects/modern-elegance.html',
  'The New Classic': 'projects/new-classic.html',
  'Timeless Style': 'projects/timeless-style.html',
  'Beyond the Shore': 'projects/beyond-the-shore.html',
  'Private Villa': 'projects/private-villa.html',
  'Minimal Estate': 'projects/minimal-estate.html',
  'Material Stories': 'projects/material-stories.html',
  'Living Spaces': 'projects/living-spaces.html',
  'Dining and Kitchen': 'projects/dining-and-kitchen.html'
};

document.querySelectorAll('a[href$="design.html"]').forEach((link) => {
  link.textContent = 'AI Technology';
});

document.querySelectorAll('.visual-card, .card[data-project-link], .card').forEach((card) => {
  const image = card.querySelector('img');
  if (!card.matches('.visual-card') && !card.dataset.projectLink && !image) return;
  const imageSource = image?.dataset.originalImage || image?.src || '';
  const imageKey = image ? Object.keys(imageProjects).find((key) => imageSource.includes(key)) : null;
  const cardTitle = card.querySelector('h3')?.textContent.trim() || '';
  const destination = card.dataset.projectLink || projectDestinations[cardTitle] || (imageKey && imageProjects[imageKey]) || 'visual.html';
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
  'ai-technology.html': [['Smart-home hubs', 'smart home hub'], ['Smart lighting', 'smart lighting'], ['Projectors', 'home projector'], ['Sensors', 'smart home sensors']]
};

const currentPage = activePage;
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
const shareButton = document.querySelector('#share-button');
if (navigator.share && shareButton) {
  shareButton.addEventListener('click', () => navigator.share({ title: document.title, url: window.location.href }));
}
const saveButton = document.querySelector('#save-button');
if (saveButton) {
  saveButton.addEventListener('click', () => { saveButton.textContent = 'Saved'; saveButton.disabled = true; });
}

document.querySelectorAll('[data-account-form]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = form.querySelector('.account-form-message');
    if (message) message.textContent = 'Account sign-in will be available when ASARK connects a secure authentication service.';
  });
});

const motionQuery = window.matchMedia('(prefers-reduced-motion: no-preference)');
if (motionQuery.matches && 'IntersectionObserver' in window) {
  const revealTargets = document.querySelectorAll('.content-section, .curated-card, .interior-card, .lifestyle-card, .affiliate-product-card');
  revealTargets.forEach((element, index) => {
    element.classList.add('motion-reveal');
    element.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 70}ms`);
  });
  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      activeObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealTargets.forEach((element) => observer.observe(element));
}
