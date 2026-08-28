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
  ['Architecture/Ancient World/Gemini_Generated_Image_(1).webp', 1472, 704], ['Architecture/Ancient World/Gemini_Generated_Image_(2).webp', 1472, 704], ['Architecture/Ancient World/Gemini_Generated_Image_(3).webp', 1472, 704],
  ['Architecture/Modern World/Gemini_Generated_Image_(4).webp', 1472, 704], ['Architecture/Modern World/Gemini_Generated_Image_(5).webp', 1472, 704], ['Architecture/Modern World/Gemini_Generated_Image_(6).webp', 1472, 704],
  ['Architecture/Futuristic World/Gemini_Generated_Image_(7).webp', 1472, 704], ['Architecture/Futuristic World/Gemini_Generated_Image_(8).webp', 1472, 704], ['Architecture/Futuristic World/Gemini_Generated_Image_(9).webp', 1472, 704],
  ['Architecture/Hacker Setup/Gemini_Generated_Image_(10).webp', 1024, 1024], ['Architecture/Hacker Setup/Gemini_Generated_Image_(11).webp', 1024, 1024]
];
const authConfig = window.ASARK_AUTH || {};
const supabaseUrl = (typeof authConfig.supabaseUrl === 'string' ? authConfig.supabaseUrl : '').replace(/\/$/, '');
const supabaseAnonKey = typeof authConfig.supabaseAnonKey === 'string' ? authConfig.supabaseAnonKey : '';
const decodeLegacySupabaseKey = (key) => {
  if (typeof key !== 'string' || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(key)) return null;
  try {
    const payload = key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload.padEnd(payload.length + (4 - payload.length % 4) % 4, '=')));
  } catch { return null; }
};
const isPublicSupabaseKey = (key) => {
  if (typeof key !== 'string') return false;
  if (/^sb_secret_/i.test(key)) return false;
  if (/^sb_publishable_[A-Za-z0-9_-]{20,}$/.test(key)) return true;
  return decodeLegacySupabaseKey(key)?.role === 'anon';
};
const isAuthConfigured = /^https:\/\/[^/]+\.supabase\.co$/i.test(supabaseUrl) && isPublicSupabaseKey(supabaseAnonKey);
const homeUrl = siteRootUrl;


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
const affiliateAllowedPages = new Set(['ai-technology.html', 'semiconductor.html', 'market-technology.html', 'animation-technology.html', 'space.html', 'vehicle-technology.html', 'blogs.html', 'curated.html']);
const recommendedProducts = affiliateAllowedPages.has(currentPage) ? editorialRecommendations[currentPage] : null;

if (currentPage === 'architecture.html') {
  const architectureContent = document.querySelector('.content-section');
  if (architectureContent) {
    const architectureGallery = document.createElement('section');
    architectureGallery.className = 'architecture-gallery';
    architectureGallery.setAttribute('aria-labelledby', 'architecture-gallery-title');
    const galleryCards = architectureImages.map(([imagePath, width, height], index) =>
      `<figure><img data-ai-image-fixed loading="lazy" src="ai images/${imagePath}" width="${width}" height="${height}" alt="AI-generated architectural visual study ${index + 1}"><figcaption>ASARK visual study ${String(index + 1).padStart(2, '0')}</figcaption></figure>`
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
    technologyShowcase.innerHTML = '<img src="ai images/Technology/technology-showcase-grid.webp" alt="Visual overview of artificial intelligence, market, animation, space and vehicle technology" data-ai-image-fixed width="1536" height="1024"><figcaption>Explore twenty connected innovations across AI, market, animation, space and vehicle technology.</figcaption>';
    technologyGrid.before(technologyShowcase);
  }
}

const visualFilters = document.querySelectorAll('[data-filter]');
const visualCards = document.querySelectorAll('.visual-library-grid [data-category]');
if (visualFilters.length && visualCards.length) {
  visualFilters.forEach((button) => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    visualFilters.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    visualCards.forEach((card) => { card.hidden = filter !== 'all' && card.dataset.category !== filter; });
  }));
}

if (currentPage === 'ai-technology.html') {
  const technologyGrid = document.querySelector('.technology-grid');
  if (technologyGrid) {
    const aiOverview = document.createElement('figure');
    aiOverview.className = 'ai-technology-overview';
    aiOverview.innerHTML = '<img data-ai-image-fixed loading="lazy" src="ai images/Technology/AI Technology/ai-technology-overview.webp" alt="AI technology overview showing machine learning, AI assistants, healthcare, education and responsible AI" width="1536" height="1024"><figcaption>AI-generated overview: building a smarter future with responsible artificial intelligence.</figcaption>';
    technologyGrid.before(aiOverview);
  }
}

if (currentPage === 'animation-technology.html') {
  const technologyGrid = document.querySelector('.technology-grid');
  if (technologyGrid) {
    const animationOverview = document.createElement('figure');
    animationOverview.className = 'animation-technology-overview';
    animationOverview.innerHTML = '<img data-ai-image-fixed loading="lazy" src="ai images/Technology/Animation Technology/animation-technology-feature.webp" alt="Animation Technology infographic featuring 3D animation, AI tools, virtual reality, motion capture and visual storytelling" width="1672" height="941"><figcaption>Animation Technology: creative tools that bring ideas to life through motion, immersive worlds and visual storytelling.</figcaption>';
    technologyGrid.before(animationOverview);
  }
}

if (currentPage === 'space.html') {
  const spaceGrid = document.querySelector('.content-section .grid');
  if (spaceGrid) {
    const spaceOverview = document.createElement('figure');
    spaceOverview.className = 'space-technology-overview';
    spaceOverview.innerHTML = '<img data-ai-image-fixed loading="lazy" src="ai images/Technology/Space Technology/space-technology-feature.webp" alt="Space Technology infographic featuring satellites, launch vehicles, planetary exploration, astronomy and space research" width="1536" height="1024"><figcaption>Space Technology: exploring beyond boundaries through satellites, launch systems, research and planetary exploration.</figcaption>';
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

const AUTH_SESSION_KEY = 'asark.auth.session.v2';
const AUTH_PKCE_KEY = 'asark.auth.pkce.v1';
const LEGACY_AUTH_SESSION_KEY = 'asark.auth.session';
const AUTH_REFRESH_SKEW_SECONDS = 90;
const AUTH_CALLBACK_PATH = 'auth-callback.html';
const AUTH_SOCIAL_FLOW_MAX_AGE_MS = 10 * 60 * 1000;
const AUTH_SIGNUP_FLOW_MAX_AGE_MS = 60 * 60 * 1000;
const AUTH_REQUEST_TIMEOUT_MS = 12 * 1000;
let authenticationInitialisation = Promise.resolve();
let authInteractionActive = false;

const setAuthMessage = (form, text, type = '') => {
  const message = form.querySelector('.account-form-message');
  if (message) { message.textContent = text; message.dataset.state = type; }
};
const setAuthBusy = (form, busy) => {
  form.setAttribute('aria-busy', String(busy));
  form.querySelectorAll('button, input').forEach((control) => { control.disabled = busy; });
};
const setAllAuthBusy = (busy) => {
  document.querySelectorAll('[data-account-form]').forEach((form) => setAuthBusy(form, busy));
  document.querySelectorAll('[data-social-provider]').forEach((control) => { control.disabled = busy; });
};
const acquireAuthInteraction = () => {
  if (authInteractionActive) return false;
  authInteractionActive = true;
  setAllAuthBusy(true);
  return true;
};
const releaseAuthInteraction = () => { authInteractionActive = false; setAllAuthBusy(false); };
const authCallbackUrl = () => new URL(AUTH_CALLBACK_PATH, siteRootUrl).href;
const isSafeReturnPath = (value) => {
  if (typeof value !== 'string' || /[\\\u0000-\u001f\u007f]/.test(value)) return null;
  try {
    const resolved = new URL(value, siteRootUrl);
    if (!/^https?:$/.test(resolved.protocol) || resolved.origin !== siteRootUrl.origin || resolved.username || resolved.password) return null;
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch { return null; }
};
const sessionReturnPath = () => isSafeReturnPath(new URLSearchParams(window.location.search).get('next')) || '/index.html';
const parseJwtExpiry = (token) => {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(payload.padEnd(payload.length + (4 - payload.length % 4) % 4, '=')));
    return Number.isFinite(decoded.exp) ? decoded.exp : 0;
  } catch { return 0; }
};
const normaliseSession = (candidate) => {
  if (!candidate || typeof candidate !== 'object' || typeof candidate.access_token !== 'string' || typeof candidate.refresh_token !== 'string') return null;
  const expiresAt = Number(candidate.expires_at || parseJwtExpiry(candidate.access_token));
  if (!Number.isFinite(expiresAt) || expiresAt <= 0 || candidate.access_token.split('.').length !== 3) return null;
  return { access_token: candidate.access_token, refresh_token: candidate.refresh_token, expires_at: expiresAt, token_type: 'bearer', user: candidate.user || null };
};
const readStoredSession = () => {
  localStorage.removeItem(LEGACY_AUTH_SESSION_KEY);
  try {
    const session = normaliseSession(JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || 'null'));
    if (!session) localStorage.removeItem(AUTH_SESSION_KEY);
    return session;
  } catch { localStorage.removeItem(AUTH_SESSION_KEY); return null; }
};
const clearStoredSession = () => { localStorage.removeItem(AUTH_SESSION_KEY); localStorage.removeItem(LEGACY_AUTH_SESSION_KEY); };
const storeSession = (session) => { localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session)); };
const authError = (message, status = 0) => Object.assign(new Error(message), {
  status,
  retryable: status === 0 || status === 408 || status === 429 || status >= 500
});
const authRequest = async (path, options = {}) => {
  if (!isAuthConfigured) throw new Error('Authentication is not configured.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AUTH_REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${supabaseUrl}${path}`, {
      method: options.method || 'GET', credentials: 'omit', cache: 'no-store',
      headers: { apikey: supabaseAnonKey, 'Content-Type': 'application/json', ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}) },
      signal: controller.signal,
      ...(options.body ? { body: JSON.stringify(options.body) } : {})
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw authError('Unable to complete authentication.', response.status);
    return body;
  } catch (error) {
    if (error?.status) throw error;
    throw authError('Unable to complete authentication.');
  } finally { clearTimeout(timeout); }
};
const verifyAndStoreSession = async (candidate) => {
  const session = normaliseSession(candidate);
  if (!session) throw new Error('The authentication response was invalid.');
  const user = await authRequest('/auth/v1/user', { accessToken: session.access_token });
  if (!user || typeof user.id !== 'string') throw new Error('The authentication session could not be verified.');
  session.user = { id: user.id, email: user.email || '', user_metadata: user.user_metadata || {} };
  storeSession(session);
  return session;
};
const refreshSession = async (session) => verifyAndStoreSession(await authRequest('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: session.refresh_token } }));
const base64Url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
const randomVerifier = () => { const bytes = new Uint8Array(64); crypto.getRandomValues(bytes); return base64Url(bytes); };
const readPkceFlow = () => {
  try {
    const flow = JSON.parse(localStorage.getItem(AUTH_PKCE_KEY) || 'null');
    const maxAge = flow?.purpose === 'signup' ? AUTH_SIGNUP_FLOW_MAX_AGE_MS : AUTH_SOCIAL_FLOW_MAX_AGE_MS;
    const now = Date.now();
    const age = now - flow?.createdAt;
    if (!flow || !['signup', 'social'].includes(flow.purpose) || typeof flow.verifier !== 'string' || !/^[A-Za-z0-9_-]{43,128}$/.test(flow.verifier) || !Number.isFinite(flow.createdAt) || flow.createdAt <= 0 || flow.createdAt > now || age < 0 || age > maxAge || !isSafeReturnPath(flow.returnPath)) {
      localStorage.removeItem(AUTH_PKCE_KEY);
      return null;
    }
    return flow;
  } catch { localStorage.removeItem(AUTH_PKCE_KEY); return null; }
};
const clearPkceFlow = () => localStorage.removeItem(AUTH_PKCE_KEY);
const pkceChallenge = async (verifier) => base64Url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))));
const createPkceFlow = async (purpose, allowExisting = false) => {
  const existing = readPkceFlow();
  if (existing) {
    if (allowExisting && existing.purpose === purpose) return { ...existing, challenge: await pkceChallenge(existing.verifier), reused: true };
    throw new Error('An authentication confirmation is already pending. Finish it before starting another sign-in.');
  }
  const verifier = randomVerifier();
  const flow = { purpose, verifier, createdAt: Date.now(), returnPath: sessionReturnPath() };
  localStorage.setItem(AUTH_PKCE_KEY, JSON.stringify(flow));
  return { ...flow, challenge: await pkceChallenge(verifier), reused: false };
};
const renderAccountActions = (session = null) => {
  if (!siteNav) return;
  siteNav.querySelector('.account-actions')?.remove();
  if (!isAuthConfigured) return;
  const actions = document.createElement('div'); actions.className = 'account-actions';
  if (session) {
    const accountLabel = document.createElement('span'); accountLabel.className = 'account-label'; accountLabel.textContent = session.user?.email || 'Account';
    const logoutButton = document.createElement('button'); logoutButton.className = 'account-logout'; logoutButton.type = 'button'; logoutButton.textContent = 'Log out';
    logoutButton.addEventListener('click', async () => {
      logoutButton.disabled = true;
      try { await authRequest('/auth/v1/logout', { method: 'POST', accessToken: session.access_token }); } catch { /* Local logout remains safe if the network is unavailable. */ }
      clearStoredSession(); renderAccountActions(); window.location.assign(siteHref('index.html'));
    });
    actions.append(accountLabel, logoutButton);
  } else {
    const loginLink = document.createElement('a'); loginLink.href = siteHref('login.html'); loginLink.textContent = 'Log in';
    const signupLink = document.createElement('a'); signupLink.className = 'account-signup'; signupLink.href = siteHref('signup.html'); signupLink.textContent = 'Sign up';
    actions.append(loginLink, signupLink);
  }
  siteNav.append(actions);
};
const restoreSession = async () => {
  if (!isAuthConfigured) return renderAccountActions();
  const stored = readStoredSession();
  if (!stored) return renderAccountActions();
  try {
    const session = stored.expires_at - Math.floor(Date.now() / 1000) <= AUTH_REFRESH_SKEW_SECONDS ? await refreshSession(stored) : await verifyAndStoreSession(stored);
    renderAccountActions(session);
  } catch (error) {
    if (!error?.retryable) clearStoredSession();
    renderAccountActions();
  }
};
const beginSocialLogin = async (provider, form) => {
  if (!acquireAuthInteraction()) return;
  try {
    await authenticationInitialisation;
    if (!isAuthConfigured) { setAuthMessage(form, 'Account sign-in needs Supabase configuration.', 'error'); return; }
    setAuthMessage(form, 'Redirecting to secure sign-in…');
    const flow = await createPkceFlow('social');
    const url = new URL(`${supabaseUrl}/auth/v1/authorize`);
    url.searchParams.set('provider', provider === 'Microsoft' ? 'azure' : 'google');
    url.searchParams.set('redirect_to', authCallbackUrl());
    url.searchParams.set('code_challenge', flow.challenge); url.searchParams.set('code_challenge_method', 's256');
    if (provider === 'Microsoft') url.searchParams.set('scopes', 'email');
    window.location.assign(url.href);
  } catch { setAuthMessage(form, 'Unable to start secure sign-in. Please try again.', 'error'); }
  finally { releaseAuthInteraction(); }
};
const submitEmailAuth = async (form) => {
  const values = new FormData(form); const isSignup = form.dataset.accountForm === 'signup';
  const email = String(values.get('email') || '').trim(); const password = String(values.get('password') || '');
  if (!email || !password) { setAuthMessage(form, 'Enter your email address and password.', 'error'); return; }
  if (!acquireAuthInteraction()) return;
  try {
    await authenticationInitialisation;
    if (!isAuthConfigured) { setAuthMessage(form, 'Account sign-in needs Supabase configuration.', 'error'); return; }
    setAuthMessage(form, isSignup ? 'Creating your account…' : 'Signing you in…');
    let result;
    if (isSignup) {
      const flow = await createPkceFlow('signup', true);
      const signupUrl = new URL('/auth/v1/signup', supabaseUrl);
      signupUrl.searchParams.set('redirect_to', authCallbackUrl());
      result = await authRequest(`${signupUrl.pathname}${signupUrl.search}`, { method: 'POST', body: { email, password, data: { full_name: String(values.get('name') || '').trim() }, code_challenge: flow.challenge, code_challenge_method: 's256' } });
    } else result = await authRequest('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } });
    if (result.access_token) { if (isSignup) clearPkceFlow(); await verifyAndStoreSession(result); window.location.assign(siteHref('index.html')); return; }
    setAuthMessage(form, 'Check your email to verify your address before signing in.', 'success');
  } catch (error) {
    if (form.dataset.accountForm === 'signup' && !error.retryable && readPkceFlow()?.purpose === 'signup') clearPkceFlow();
    setAuthMessage(form, 'Unable to complete that request. Check your details and try again.', 'error');
  }
  finally { releaseAuthInteraction(); }
};
const completeAuthCallback = async () => {
  const callback = document.querySelector('[data-auth-callback]');
  if (!callback) return;
  const callbackUrl = new URL(window.location.href);
  const parameters = callbackUrl.searchParams;
  const hasProviderError = parameters.has('error') || parameters.has('error_code') || parameters.has('error_description');
  const code = parameters.get('code');
  const hasFragment = callbackUrl.hash.length > 1;
  history.replaceState({}, document.title, window.location.pathname);
  if (hasProviderError || hasFragment) {
    clearPkceFlow();
    callback.textContent = 'This sign-in could not be completed. Please return to Log in and try again.';
    return;
  }
  if (!isAuthConfigured) {
    if (code) clearPkceFlow();
    callback.textContent = 'Authentication is not configured yet.';
    return;
  }
  const flow = readPkceFlow();
  if (!code || !flow) {
    if (flow?.purpose !== 'signup') clearPkceFlow();
    callback.textContent = 'This sign-in link has expired. Please start again.';
    return;
  }
  callback.textContent = 'Finishing secure sign-in…';
  try {
    const session = await authRequest('/auth/v1/token?grant_type=pkce', { method: 'POST', body: { auth_code: code, code_verifier: flow.verifier } });
    clearPkceFlow();
    await verifyAndStoreSession(session);
    window.location.replace(new URL(flow.returnPath, siteRootUrl).href);
  } catch (error) {
    clearPkceFlow();
    callback.textContent = 'We could not verify this sign-in. Please return to Log in and try again.';
  }
};

document.querySelectorAll('[data-account-form]').forEach((form) => {
  const socialAuth = document.createElement('div'); socialAuth.className = 'social-auth';
  socialAuth.innerHTML = '<p>Or continue with</p><div><button class="social-auth-button" type="button" data-social-provider="Google"><span aria-hidden="true">G</span>Continue with Google</button><button class="social-auth-button" type="button" data-social-provider="Microsoft"><span aria-hidden="true">⊞</span>Continue with Microsoft</button></div>';
  form.before(socialAuth);
  socialAuth.querySelectorAll('[data-social-provider]').forEach((button) => button.addEventListener('click', () => beginSocialLogin(button.dataset.socialProvider, form)));
  form.addEventListener('submit', (event) => { event.preventDefault(); submitEmailAuth(form); });
});
const authCallbackTarget = document.querySelector('[data-auth-callback]');
authenticationInitialisation = authCallbackTarget
  ? completeAuthCallback().catch(() => { authCallbackTarget.textContent = 'We could not complete this sign-in. Please return to Log in and try again.'; })
  : restoreSession().catch(() => { clearStoredSession(); renderAccountActions(); });

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
