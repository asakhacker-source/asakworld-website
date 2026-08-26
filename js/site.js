const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const manifestLink = document.querySelector('link[rel="manifest"]');
const siteRootUrl = manifestLink ? new URL('.', manifestLink.href) : new URL('/', window.location.href);
const siteHref = (path) => new URL(path, siteRootUrl).href;

const primarySections = [
  ['index.html', 'Home'], ['blogs.html', 'Journal'], ['visual.html', 'Visuals'], ['curated.html', 'Resources'], ['about.html', 'About']
];
const dropdownSections = [
  ['technology.html', 'Technology', [['ai-technology.html', 'AI Technology'], ['semiconductor.html', 'Semiconductor & VLSI'], ['market-technology.html', 'Market Technology'], ['animation-technology.html', 'Animation Technology'], ['space.html', 'Space Technology'], ['vehicle-technology.html', 'Vehicle Technology'], ['computing.html', 'Computing']]]
];
const activePage = window.location.pathname.split('/').pop() || 'index.html';
const activeNavHref = activePage === 'index.html' && window.location.hash === '#about'
  ? 'index.html#about'
  : activePage;
if (siteNav) {
  const navigationLinks = primarySections.map(([href, label]) =>
    `<a href="${siteHref(href)}"${href === activeNavHref ? ' aria-current="page"' : ''}>${label}</a>`
  );
  const dropdownLinks = dropdownSections.map(([href, label, children]) => {
    const isActive = href === activeNavHref || children.some(([childHref]) => childHref === activeNavHref);
    const childLinks = children.map(([childHref, childLabel]) =>
      `<li><a href="${siteHref(childHref)}"${childHref === activeNavHref ? ' aria-current="page"' : ''}>${childLabel}</a></li>`
    ).join('');
    const submenuId = `${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-submenu`;
    return `<div class="nav-dropdown"><a href="${siteHref(href)}"${isActive ? ' aria-current="page"' : ''}>${label}</a><button class="nav-submenu-toggle" type="button" aria-expanded="false" aria-controls="${submenuId}" aria-label="Show ${label} menu">Menu</button><ul class="nav-submenu" id="${submenuId}">${childLinks}</ul></div>`;
  });
  siteNav.innerHTML = `<div class="nav-links nav-links-primary">${navigationLinks.slice(0, 1).join('')}${dropdownLinks.join('')}${navigationLinks.slice(1).join('')}</div>`;
}

document.querySelectorAll('.nav-submenu-toggle').forEach((toggle) => {
  const dropdown = toggle.closest('.nav-dropdown');
  const close = () => { dropdown?.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); };
  toggle.addEventListener('click', (event) => { event.stopPropagation(); const open = toggle.getAttribute('aria-expanded') === 'true'; document.querySelectorAll('.nav-submenu-toggle').forEach((item) => { item.closest('.nav-dropdown')?.classList.remove('is-open'); item.setAttribute('aria-expanded', 'false'); }); if (!open) { dropdown?.classList.add('is-open'); toggle.setAttribute('aria-expanded', 'true'); } });
  dropdown?.addEventListener('keydown', (event) => { if (event.key === 'Escape') { close(); toggle.focus(); } });
  document.addEventListener('click', (event) => { if (!dropdown?.contains(event.target)) close(); });
});

// Keep every visible editorial image on ASARK within the supplied AI image collection.
const architectureImages = [
  'Architecture/Ancient World/Gemini_Generated_Image_(1).webp', 'Architecture/Ancient World/Gemini_Generated_Image_(2).webp', 'Architecture/Ancient World/Gemini_Generated_Image_(3).webp',
  'Architecture/Modern World/Gemini_Generated_Image_(4).webp', 'Architecture/Modern World/Gemini_Generated_Image_(5).webp', 'Architecture/Modern World/Gemini_Generated_Image_(6).webp',
  'Architecture/Futuristic World/Gemini_Generated_Image_(7).webp', 'Architecture/Futuristic World/Gemini_Generated_Image_(8).webp', 'Architecture/Futuristic World/Gemini_Generated_Image_(9).webp',
  'Architecture/Hacker Setup/Gemini_Generated_Image_(10).webp', 'Architecture/Hacker Setup/Gemini_Generated_Image_(11).webp'
];
const homeUrl = siteRootUrl;

document.querySelectorAll('.visual-info span').forEach((label) => {
  label.textContent = label.textContent.replace('EDITORIAL REFERENCE', 'AI-GENERATED CONCEPT');
});

const accountActions = document.createElement('div');
accountActions.className = 'account-actions';
const headerHomeUrl = siteRootUrl;
const loginUrl = new URL('login.html', headerHomeUrl).href;
const signupUrl = new URL('signup.html', headerHomeUrl).href;
accountActions.innerHTML = `<a href="${loginUrl}">Log in</a><a class="account-signup" href="${signupUrl}">Sign up</a>`;
siteNav?.append(accountActions);

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

document.querySelectorAll('.visual-card[data-card-link], .card[data-project-link]').forEach((card) => {
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
  'ancient.html': [['Ancient architecture books', 'ancient architecture books'], ['World history books', 'world history books'], ['Drawing notebooks', 'architect sketchbook']],
  'modern.html': [['Modern architecture books', 'modern architecture books'], ['Architectural lighting', 'architectural lighting'], ['Design sketchbooks', 'architecture sketchbook']],
  'futuristic.html': [['Future design books', 'futuristic design books'], ['Smart lighting', 'smart lighting'], ['3D printing tools', '3d printing tools']],
  'hacker-setup.html': [['Mechanical keyboards', 'mechanical keyboard'], ['Monitor arms', 'monitor arm'], ['USB-C hubs', 'usb c hub']],
  'technology.html': [['Technology books', 'technology books'], ['Smart-home hubs', 'smart home hub'], ['Portable SSDs', 'portable ssd']],
  'ai-technology.html': [['AI books', 'artificial intelligence books'], ['Machine-learning books', 'machine learning books'], ['Python books', 'python programming books']],
  'market-technology.html': [['Analytics books', 'data analytics books'], ['FinTech books', 'financial technology books'], ['Business technology books', 'business technology books']],
  'animation-technology.html': [['Drawing tablets', 'drawing tablet'], ['Animation books', 'animation books'], ['Colour-calibrated monitors', 'color calibrated monitor']],
  'vehicle-technology.html': [['Automotive engineering books', 'automotive engineering books'], ['EV technology books', 'electric vehicle technology books'], ['Emergency tyre inflators', 'portable tyre inflator']],
  'space.html': [['Astronomy books', 'astronomy books'], ['Telescopes', 'beginner telescope'], ['Space-science books', 'space science books']],
  'semiconductor.html': [['Electronics books', 'electronics books'], ['Circuit design kits', 'electronics circuit kit'], ['Precision tool kits', 'precision screwdriver set']],
  'vlsi.html': [['VLSI books', 'vlsi design books'], ['Electronics books', 'semiconductor books'], ['Technical notebooks', 'engineering notebook']],
  'processor.html': [['Computer architecture books', 'computer architecture books'], ['Cooling pads', 'laptop cooling pad'], ['USB-C hubs', 'usb c hub']],
  'graphics-card.html': [['Graphics cards', 'graphics card'], ['Gaming monitors', 'gaming monitor'], ['GPU support brackets', 'gpu support bracket']],
  'blogs.html': [['Technology books', 'technology books'], ['Reading lights', 'reading lamp'], ['Notebooks', 'notebook journal']]
};

const currentPage = activePage;
const affiliateAllowedPages = new Set(['technology.html', 'ai-technology.html', 'semiconductor.html', 'market-technology.html', 'animation-technology.html', 'space.html', 'vehicle-technology.html', 'blogs.html', 'curated.html']);
const recommendedProducts = affiliateAllowedPages.has(currentPage) ? editorialRecommendations[currentPage] : null;

if (currentPage === 'architecture.html') {
  const architectureContent = document.querySelector('.content-section');
  if (architectureContent) {
    const architectureGallery = document.createElement('section');
    architectureGallery.className = 'architecture-gallery';
    architectureGallery.setAttribute('aria-labelledby', 'architecture-gallery-title');
    const galleryCards = architectureImages.map((imagePath, index) =>
      `<figure><img data-ai-image-fixed loading="lazy" src="ai images/${imagePath}" alt="AI-generated architectural visual study ${index + 1}"><figcaption>ASARK visual study ${String(index + 1).padStart(2, '0')}</figcaption></figure>`
    ).join('');
    architectureGallery.innerHTML = `<header><p class="eyebrow">ASARK visual archive</p><h2 id="architecture-gallery-title">Architecture visual collection</h2><p>All supplied AI-generated visual studies are collected here.</p></header><div>${galleryCards}</div>`;
    architectureContent.append(architectureGallery);
  }
}

if (currentPage === 'technology.html') {
  const technologyGrid = document.querySelector('.technology-grid');
  if (technologyGrid) {
    const technologyShowcase = document.createElement('figure');
    technologyShowcase.className = 'technology-showcase';
    technologyShowcase.innerHTML = '<img src="ai images/Technology/technology-showcase-grid.webp" alt="Visual overview of artificial intelligence, market, animation, space and vehicle technology" data-ai-image-fixed><figcaption>Explore twenty connected innovations across AI, market, animation, space and vehicle technology.</figcaption>';
    technologyGrid.before(technologyShowcase);
  }
}

if (currentPage === 'ai-technology.html') {
  const technologyGrid = document.querySelector('.technology-grid');
  if (technologyGrid) {
    const aiOverview = document.createElement('figure');
    aiOverview.className = 'ai-technology-overview';
    aiOverview.innerHTML = '<img data-ai-image-fixed loading="lazy" src="ai images/Technology/AI Technology/ai-technology-overview.webp" alt="AI technology overview showing machine learning, AI assistants, healthcare, education and responsible AI"><figcaption>AI-generated overview: building a smarter future with responsible artificial intelligence.</figcaption>';
    technologyGrid.before(aiOverview);
  }
}

if (currentPage === 'animation-technology.html') {
  const technologyGrid = document.querySelector('.technology-grid');
  if (technologyGrid) {
    const animationOverview = document.createElement('figure');
    animationOverview.className = 'animation-technology-overview';
    animationOverview.innerHTML = '<img data-ai-image-fixed loading="lazy" src="ai images/Technology/Animation Technology/animation-technology-feature.webp" alt="Animation Technology infographic featuring 3D animation, AI tools, virtual reality, motion capture and visual storytelling"><figcaption>Animation Technology: creative tools that bring ideas to life through motion, immersive worlds and visual storytelling.</figcaption>';
    technologyGrid.before(animationOverview);
  }
}

if (currentPage === 'space.html') {
  const spaceGrid = document.querySelector('.content-section .grid');
  if (spaceGrid) {
    const spaceOverview = document.createElement('figure');
    spaceOverview.className = 'space-technology-overview';
    spaceOverview.innerHTML = '<img data-ai-image-fixed loading="lazy" src="ai images/Technology/Space Technology/space-technology-feature.webp" alt="Space Technology infographic featuring satellites, launch vehicles, planetary exploration, astronomy and space research"><figcaption>Space Technology: exploring beyond boundaries through satellites, launch systems, research and planetary exploration.</figcaption>';
    spaceGrid.before(spaceOverview);
  }
}

const technologyBlogConnections = {
  'ai-technology.html': ['ai-title', 'Read the AI Technology Journal guide'],
  'market-technology.html': ['market-title', 'Read the Market Technology Journal guide'],
  'animation-technology.html': ['animation-title', 'Read the Animation Technology Journal guide'],
  'space.html': ['space-title', 'Read the Space Technology Journal guide'],
  'vehicle-technology.html': ['vehicle-title', 'Read the Vehicle Technology Journal guide']
};
const technologyBlogConnection = technologyBlogConnections[currentPage];
if (technologyBlogConnection) {
  const [topicId, label] = technologyBlogConnection;
  const technologyGrid = document.querySelector('.technology-grid');
  if (technologyGrid) {
    const blogConnection = document.createElement('aside');
    blogConnection.className = 'blog-connection';
    blogConnection.innerHTML = `<p class="eyebrow">ASARK Blog</p><h2>Go deeper.</h2><p>Explore the visual field guide for this technology.</p><a class="btn-outline" href="blogs.html#${topicId}">${label}</a>`;
    technologyGrid.before(blogConnection);
  }
}

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

const authConfig = window.ASARK_AUTH || {};
const supabaseUrl = (authConfig.supabaseUrl || '').replace(/\/$/, '');
const supabaseAnonKey = authConfig.supabaseAnonKey || '';
const isAuthConfigured = /^https:\/\/[^/]+\.supabase\.co$/i.test(supabaseUrl) && supabaseAnonKey.length > 20;

const setAuthMessage = (form, text) => {
  const message = form.querySelector('.account-form-message');
  if (message) message.textContent = text;
};

const beginSocialLogin = (provider, form) => {
  if (!isAuthConfigured) {
    setAuthMessage(form, 'Account sign-in needs Supabase configuration. See AUTHENTICATION.md.');
    return;
  }
  const providerName = provider === 'Microsoft' ? 'azure' : 'google';
  const authorizeUrl = new URL(`${supabaseUrl}/auth/v1/authorize`);
  authorizeUrl.searchParams.set('provider', providerName);
  authorizeUrl.searchParams.set('redirect_to', new URL('index.html', window.location.href).href);
  if (providerName === 'azure') authorizeUrl.searchParams.set('scopes', 'email');
  window.location.assign(authorizeUrl.href);
};

const submitEmailAuth = async (form) => {
  if (!isAuthConfigured) {
    setAuthMessage(form, 'Account sign-in needs Supabase configuration. See AUTHENTICATION.md.');
    return;
  }
  const values = new FormData(form);
  const isSignup = form.dataset.accountForm === 'signup';
  const endpoint = isSignup ? '/auth/v1/signup' : '/auth/v1/token?grant_type=password';
  const payload = { email: values.get('email'), password: values.get('password') };
  if (isSignup) payload.data = { full_name: values.get('name') || '' };
  setAuthMessage(form, isSignup ? 'Creating your account…' : 'Signing you in…');
  try {
    const response = await fetch(`${supabaseUrl}${endpoint}`, {
      method: 'POST',
      headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.msg || result.message || 'Unable to complete authentication.');
    if (result.access_token) localStorage.setItem('asark.auth.session', JSON.stringify(result));
    if (isSignup && !result.access_token) {
      setAuthMessage(form, 'Account created. Check your email to confirm your address.');
      return;
    }
    window.location.assign(new URL('index.html', window.location.href).href);
  } catch (error) {
    setAuthMessage(form, error.message || 'Unable to complete authentication.');
  }
};

const oauthParameters = new URLSearchParams(window.location.hash.slice(1));
if (oauthParameters.get('access_token')) {
  localStorage.setItem('asark.auth.session', JSON.stringify(Object.fromEntries(oauthParameters.entries())));
  history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`);
}

document.querySelectorAll('[data-account-form]').forEach((form) => {
  const socialAuth = document.createElement('div');
  socialAuth.className = 'social-auth';
  socialAuth.innerHTML = '<p>Or continue with</p><div><button class="social-auth-button" type="button" data-social-provider="Google"><span aria-hidden="true">G</span>Continue with Google</button><button class="social-auth-button" type="button" data-social-provider="Microsoft"><span aria-hidden="true">⊞</span>Continue with Microsoft</button></div>';
  form.before(socialAuth);
  socialAuth.querySelectorAll('[data-social-provider]').forEach((button) => {
    button.addEventListener('click', () => {
      beginSocialLogin(button.dataset.socialProvider, form);
    });
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submitEmailAuth(form);
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
