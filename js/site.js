const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');

const primarySections = [
  ['index.html', 'Home'], ['index.html#about', 'About'], ['blogs.html', 'Blogs']
];
const dropdownSections = [
  ['architecture.html', 'Architecture', [['ancient.html', 'Ancient World'], ['modern.html', 'Modern World'], ['futuristic.html', 'Futuristic World'], ['hacker-setup.html', 'Hacker Setup']]],
  ['technology.html', 'Technology', [['ai-technology.html', 'AI Technology'], ['market-technology.html', 'Market Technology'], ['animation-technology.html', 'Animation Technology'], ['vehicle-technology.html', 'Vehicle Technology'], ['space.html', 'Space Technology']]],
  ['semiconductor.html', 'Semiconductor', [['vlsi.html', 'VLSI'], ['processor.html', 'Processor'], ['graphics-card.html', 'Graphics Card']]]
];
const activePage = window.location.pathname.split('/').pop() || 'index.html';
const activeNavHref = activePage === 'index.html' && window.location.hash === '#about'
  ? 'index.html#about'
  : activePage;
if (siteNav) {
  const navigationLinks = primarySections.map(([href, label]) =>
    `<a href="${href}"${href === activeNavHref ? ' aria-current="page"' : ''}>${label}</a>`
  );
  const dropdownLinks = dropdownSections.map(([href, label, children]) => {
    const isActive = href === activeNavHref || children.some(([childHref]) => childHref === activeNavHref);
    const childLinks = children.map(([childHref, childLabel]) =>
      `<li><a href="${childHref}"${childHref === activeNavHref ? ' aria-current="page"' : ''}>${childLabel}</a></li>`
    ).join('');
    return `<div class="nav-dropdown"><a href="${href}"${isActive ? ' aria-current="page"' : ''}>${label}</a><ul class="nav-submenu">${childLinks}</ul></div>`;
  });
  siteNav.innerHTML = `<div class="nav-links nav-links-primary">${navigationLinks.join('')}${dropdownLinks.join('')}</div>`;
}

// Keep every visible editorial image on ASARK within the supplied AI image collection.
const aiImagePaths = [
  'Architecture/Ancient World/Gemini_Generated_Image_(1).png', 'Architecture/Ancient World/Gemini_Generated_Image_(2).png', 'Architecture/Ancient World/Gemini_Generated_Image_(3).png',
  'Architecture/Modern World/Gemini_Generated_Image_(4).png', 'Architecture/Modern World/Gemini_Generated_Image_(5).png', 'Architecture/Modern World/Gemini_Generated_Image_(6).png',
  'Architecture/Futuristic World/Gemini_Generated_Image_(7).png', 'Architecture/Futuristic World/Gemini_Generated_Image_(8).png', 'Architecture/Futuristic World/Gemini_Generated_Image_(9).png',
  'Architecture/Hacker Setup/Gemini_Generated_Image_(10).png', 'Architecture/Hacker Setup/Gemini_Generated_Image_(11).png',
  'Technology/AI Technology/Gemini_Generated_Image_(12).png', 'Technology/AI Technology/Gemini_Generated_Image_(13).png', 'Technology/AI Technology/Gemini_Generated_Image_(14).png',
  'Technology/Market Technology/Gemini_Generated_Image_(15).png', 'Technology/Market Technology/Gemini_Generated_Image_(16).png',
  'Technology/Animation Technology/Gemini_Generated_Image_(17).png', 'Technology/Animation Technology/Gemini_Generated_Image_(18).png',
  'Technology/Vehicle Technology/Gemini_Generated_Image_(19).png', 'Technology/Vehicle Technology/Gemini_Generated_Image_(20).png',
  'Technology/Space Technology/Gemini_Generated_Image_39a5aj39a5aj39a5.png', 'Technology/Space Technology/Gemini_Generated_Image_3mhdo63mhdo63mhd.png',
  'Semiconductor/VLSI/Gemini_Generated_Image_gbjlagbjlagbjlag.png', 'Semiconductor/VLSI/Gemini_Generated_Image_jquxqcjquxqcjqux.png',
  'Semiconductor/Processor/Gemini_Generated_Image_jv701qjv701qjv70.png', 'Semiconductor/Processor/Gemini_Generated_Image_lc0e35lc0e35lc0e.png',
  'Semiconductor/Graphics Card/Gemini_Generated_Image_ld8r28ld8r28ld8r.png', 'Semiconductor/Graphics Card/Gemini_Generated_Image_o0n0yjo0n0yjo0n0.png', 'Semiconductor/Graphics Card/Gemini_Generated_Image_w1zouxw1zouxw1zo.png',
  'Blogs/modern house.png', 'Blogs/our-best-look-ever-yet-at-tony-starks-mansion-from-the-book-v0-mq5lg6zmpg1g1.webp'
];
const homeUrl = new URL(document.querySelector('.logo')?.getAttribute('href') || 'index.html', window.location.href);
const aiImageUrl = (index) => new URL(`ai images/${aiImagePaths[index % aiImagePaths.length]}`, homeUrl).href;

document.querySelectorAll('img').forEach((image, index) => {
  if (image.closest('.site-header') || image.src.includes('asark-mark') || image.dataset.aiImageFixed !== undefined) return;
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

const headerSearch = { setAttribute() {}, addEventListener() {} };
headerSearch.className = 'header-search';
headerSearch.setAttribute('role', 'search');
headerSearch.innerHTML = '<label><span class="sr-only">Search ASARK</span><input type="search" name="q" placeholder="Search" autocomplete="off"></label><button type="submit" aria-label="Search ASARK">⌕</button>';

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
  'ancient.html': [['Ancient architecture books', 'ancient architecture books'], ['World history books', 'world history books'], ['Drawing notebooks', 'architect sketchbook']],
  'modern.html': [['Modern architecture books', 'modern architecture books'], ['Architectural lighting', 'architectural lighting'], ['Design sketchbooks', 'architecture sketchbook']],
  'futuristic.html': [['Future design books', 'futuristic design books'], ['Smart lighting', 'smart lighting'], ['3D printing tools', '3d printing tools']],
  'hacker-setup.html': [['Mechanical keyboards', 'mechanical keyboard'], ['Monitor arms', 'monitor arm'], ['USB-C hubs', 'usb c hub']],
  'technology.html': [['Technology books', 'technology books'], ['Smart-home hubs', 'smart home hub'], ['Portable SSDs', 'portable ssd']],
  'ai-technology.html': [['Smart-home hubs', 'smart home hub'], ['Smart lighting', 'smart lighting'], ['Projectors', 'home projector'], ['Sensors', 'smart home sensors']],
  'market-technology.html': [['Finance books', 'personal finance books'], ['Business notebooks', 'business notebook'], ['Desk organisers', 'desk organizer']],
  'animation-technology.html': [['Drawing tablets', 'drawing tablet'], ['Animation books', 'animation books'], ['Colour-calibrated monitors', 'color calibrated monitor']],
  'vehicle-technology.html': [['Car phone mounts', 'car phone mount'], ['Dash cameras', 'dash camera'], ['Portable tyre inflators', 'portable tyre inflator']],
  'space.html': [['Smart lighting', 'smart lighting'], ['Air purifiers', 'air purifier'], ['Home sensors', 'smart home sensors']],
  'semiconductor.html': [['Electronics books', 'electronics books'], ['Circuit design kits', 'electronics circuit kit'], ['Precision tool kits', 'precision screwdriver set']],
  'vlsi.html': [['VLSI books', 'vlsi design books'], ['Electronics books', 'semiconductor books'], ['Technical notebooks', 'engineering notebook']],
  'processor.html': [['Computer architecture books', 'computer architecture books'], ['Cooling pads', 'laptop cooling pad'], ['USB-C hubs', 'usb c hub']],
  'graphics-card.html': [['Graphics cards', 'graphics card'], ['Gaming monitors', 'gaming monitor'], ['GPU support brackets', 'gpu support bracket']],
  'blogs.html': [['Technology books', 'technology books'], ['Reading lights', 'reading lamp'], ['Notebooks', 'notebook journal']]
};

const currentPage = activePage;
const affiliateExcludedPages = new Set(['login.html', 'signup.html', 'offline.html']);
const defaultRecommendations = [['Design books', 'design books'], ['Desk lighting', 'desk lamp'], ['Everyday organisers', 'desk organizer']];
const recommendedProducts = affiliateExcludedPages.has(currentPage)
  ? null
  : (editorialRecommendations[currentPage] || defaultRecommendations);

if (currentPage === 'blogs.html') {
  const blogTopicAnchors = {
    'ai-title': 'ai-technology',
    'market-title': 'market-technology',
    'animation-title': 'animation-technology',
    'space-title': 'space-technology',
    'vehicle-title': 'vehicle-technology'
  };
  Object.entries(blogTopicAnchors).forEach(([headingId, sectionId]) => {
    document.querySelector(`[aria-labelledby="${headingId}"]`)?.setAttribute('id', sectionId);
  });
  const blogTopicDetails = {
    'ai-title': '<h3>How AI works</h3><p>Modern AI systems learn from data. Machine learning identifies patterns in large datasets and uses those patterns to make predictions or decisions. Deep learning extends this with multi-layer neural networks, supporting image recognition, natural-language processing, speech recognition, robotics and generative AI.</p><h3>AI in different industries</h3><p>In healthcare, AI can assist analysis of medical information. In education, it can support personalised learning. Agriculture, business and engineering teams can use AI to study conditions, automate repetitive work, forecast demand, organise information and accelerate simulation, design and testing.</p><h3>Responsible AI</h3><p>As AI becomes more integrated into society, privacy, security, fairness, transparency, accuracy and human oversight remain essential. AI should strengthen human capabilities and be developed with clear responsibility.</p>',
    'market-title': '<h3>Data and market analysis</h3><p>Data analytics helps organisations study product demand, customer feedback, website activity, sales performance and economic trends. AI can reveal patterns that are difficult to identify manually, but technology should support careful judgement rather than replace it—market conditions can change quickly.</p><h3>E-commerce and digital payments</h3><p>Online stores let businesses reach customers beyond physical locations. Mobile banking, payment gateways and secure authentication have made transactions faster and more convenient, while creating a stronger need for trustworthy digital systems.</p><h3>What comes next</h3><p>Market technology will increasingly combine AI, automation, cloud computing, cybersecurity and analytics. Sustainable growth depends on using real-time information responsibly and protecting customer data.</p>',
    'animation-title': '<h3>From 2D to 3D</h3><p>Two-dimensional animation remains valuable for cartoons, education and motion graphics. Three-dimensional animation creates objects with depth through modelling, materials, virtual lighting and character movement. A typical workflow moves through concept, modelling, texturing, rigging, animation, lighting, rendering and final editing.</p><h3>Motion capture and real-time graphics</h3><p>Motion capture records physical movement and translates it into digital animation. Real-time rendering makes it possible to explore complex scenes interactively instead of waiting for every frame to render.</p><h3>AI and animation</h3><p>AI-assisted tools can help generate concepts, improve motion, organise workflows and accelerate repetitive work. Human creativity remains central: artists and designers decide the story, emotion, visual identity and purpose.</p><h3>Beyond entertainment</h3><p>Animation also makes technical ideas easier to understand. Engineering simulations, medical visualisation and scientific explainers can reveal processes that are difficult to observe directly.</p>',
    'space-title': '<h3>Satellites in everyday life</h3><p>Satellites support navigation, communication, television broadcasting, weather forecasting, environmental monitoring, disaster management, scientific research and mapping. Weather systems continuously observe conditions that help specialists study storms, clouds, temperatures and climate patterns.</p><h3>Smaller and smarter systems</h3><p>Advances in electronics and manufacturing have enabled smaller satellite platforms for research, communication and observation. Efficient processors, improved sensors and intelligent software can help satellites process more useful information before transmitting it to Earth.</p><h3>Robotics and exploration</h3><p>Robotic spacecraft can explore environments that are difficult for people to reach, analysing surfaces, atmospheres, radiation and other conditions. Future missions may use increasingly autonomous systems for complex scientific tasks.</p><h3>Sustainable exploration</h3><p>Responsible space development includes managing orbital debris, coordinating satellite operations, designing efficient spacecraft and considering long-term environmental impact.</p>',
    'vehicle-title': '<h3>Electric vehicles</h3><p>EVs use electric motors and battery systems rather than relying entirely on internal-combustion engines. Battery management, power electronics, regenerative braking, charging infrastructure, thermal management and vehicle-control software all shape performance, safety, cost and lifespan.</p><h3>Connected vehicles</h3><p>Connected vehicles can exchange information with digital infrastructure and cloud services to support navigation, maintenance, updates and traffic management. Vehicle-to-everything, or V2X, is being researched to help compatible vehicles and infrastructure communicate.</p><h3>Driver-assistance technology</h3><p>Cameras, radar, ultrasonic sensors and other systems can support parking assistance, adaptive cruise control, lane support and collision warnings. Their capabilities and limitations must be understood clearly, with testing, cybersecurity, regulation and human responsibility remaining essential.</p><h3>The future of transportation</h3><p>Electric mobility, renewable energy, connected vehicles, intelligent infrastructure and improved public transport can help make travel safer, cleaner, more efficient, accessible and sustainable.</p>'
  };
  Object.entries(blogTopicDetails).forEach(([headingId, content]) => {
    const topicHeader = document.getElementById(headingId)?.closest('header');
    if (!topicHeader) return;
    const detail = document.createElement('div');
    detail.className = 'blog-topic-detail';
    detail.innerHTML = content;
    topicHeader.after(detail);
  });
  if (window.location.hash) {
    window.setTimeout(() => document.querySelector(window.location.hash)?.scrollIntoView({ block: 'start' }), 0);
  }
  document.querySelectorAll('.blog-card-grid img').forEach((image) => image.remove());
  const blogPost = document.querySelector('.blog-post');
  if (blogPost) {
    const blogDirectory = document.createElement('section');
    blogDirectory.className = 'blog-directory';
    blogDirectory.innerHTML = '<figure><img src="assets/technology-blog.png" alt="AI-generated editorial illustration connecting artificial intelligence, market data, animation, space technology and an electric vehicle"><figcaption>AI-generated editorial visual study: five connected technologies shaping the future.</figcaption></figure><div><p class="eyebrow">Read by topic</p><h2>Five field guides for the future.</h2><p>Explore each technology through its own focused ASARK page.</p><nav aria-label="Technology blog topics"><a href="ai-technology.html">AI Technology</a><a href="market-technology.html">Market Technology</a><a href="animation-technology.html">Animation Technology</a><a href="space.html">Space Technology</a><a href="vehicle-technology.html">Vehicle Technology</a></nav></div>';
    blogPost.before(blogDirectory);
  }
}

if (currentPage === 'architecture.html') {
  const architectureContent = document.querySelector('.content-section');
  if (architectureContent) {
    const architectureGallery = document.createElement('section');
    architectureGallery.className = 'architecture-gallery';
    architectureGallery.setAttribute('aria-labelledby', 'architecture-gallery-title');
    const galleryCards = aiImagePaths.map((imagePath, index) =>
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
    technologyShowcase.innerHTML = '<img src="assets/technology-showcase.png" alt="AI-generated 20-tile visual overview of artificial intelligence, markets, animation, space and vehicle technology"><figcaption>AI-generated visual overview: twenty connected technology concepts across five future-facing fields.</figcaption>';
    technologyGrid.before(technologyShowcase);
  }
}

const technologyBlogConnections = {
  'ai-technology.html': ['ai-technology', 'Read the AI Technology blog guide'],
  'market-technology.html': ['market-technology', 'Read the Market Technology blog guide'],
  'animation-technology.html': ['animation-technology', 'Read the Animation Technology blog guide'],
  'space.html': ['space-technology', 'Read the Space Technology blog guide'],
  'vehicle-technology.html': ['vehicle-technology', 'Read the Vehicle Technology blog guide']
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
