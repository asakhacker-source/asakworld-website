(() => {
  'use strict';

  // Owner-supplied SiteStripe links paired with original ASARK category artwork.
  // Short-link codes are not ASINs. Only the one explicitly confirmed ASIN is stored.
  const AMAZON_AFFILIATE_PRODUCTS = Object.freeze([
    { id: 'ai-intel-core-ultra-9-285k', asin: null, category: 'AI', title: 'Intel® Core Ultra 9 Processor 285K, LGA1851 (36M Cache—up to 5.70 GHz)', url: 'https://link.amazon/B01UJSVgk', image: 'assets/images/affiliate/amazon-ai.webp', alt: 'Original ASARK illustration for the AI category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'ai-amazon-echo-dot-5', asin: null, category: 'AI', title: 'Amazon Echo Dot (5th Gen) | Smart Speaker with Vibrant Sound, Motion Detection, Temperature Sensor, Alexa and Bluetooth | Blue', url: 'https://link.amazon/B0iBMq9Vb', image: 'assets/images/affiliate/amazon-ai.webp', alt: 'Original ASARK illustration for the AI category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'ai-emo-go-home-robot', asin: null, category: 'AI', title: 'EMO Go Home AI Desktop Pet Robot with EMO Smart Lighting (Home Station)', url: 'https://link.amazon/B02wQ2pWm', image: 'assets/images/affiliate/amazon-ai.webp', alt: 'Original ASARK illustration for the AI category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'semiconductor-astem-building-blocks', asin: null, category: 'SEMICONDUCTOR', title: 'ASTEM Adults 36Pcs Power-Function Building Blocks Set – Battery Box, IR Speed Remote Control, IR Receiver, Motor and Power-Function Light', url: 'https://link.amazon/B01q6nJ7T', image: 'assets/images/affiliate/amazon-semiconductor.webp', alt: 'Original ASARK illustration for the semiconductor category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'semiconductor-nano-chips-2030', asin: null, category: 'SEMICONDUCTOR', title: 'Nano-chips 2030: On-chip AI for an Efficient Data-driven World (Frontiers Collection)', url: 'https://link.amazon/B0gbWuEbR', image: 'assets/images/affiliate/amazon-semiconductor.webp', alt: 'Original ASARK illustration for the semiconductor category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'semiconductor-digilent-basys3', asin: null, category: 'SEMICONDUCTOR', title: 'Digilent Basys3 Xilinx Artix-7 FPGA Board', url: 'https://link.amazon/B04tXdCeB', image: 'assets/images/affiliate/amazon-semiconductor.webp', alt: 'Original ASARK illustration for the semiconductor category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'space-knowledge-encyclopedia', asin: '9390391741', category: 'SPACE', title: 'Space – Collection of 6 Books: Knowledge Encyclopedia for Children', url: 'https://link.amazon/B08fPOVsz', image: 'assets/images/affiliate/amazon-space.webp', alt: 'Original ASARK illustration for the space category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'space-pie-matrix-draco', asin: null, category: 'SPACE', title: 'Pie Matrix Draco 90800 Reflector Telescope – 90mm Aperture, 800mm Focal, ALT-AZ Side ARM Mount, Smartphone Adapter and Tripod', url: 'https://link.amazon/B0hYKsq8v', image: 'assets/images/affiliate/amazon-space.webp', alt: 'Original ASARK illustration for the space category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'space-gesto-planetarium', asin: null, category: 'SPACE', title: 'Gesto Planetarium Galaxy Projector – 13 Replaceable Discs, 4K HD Star Light Projector with Dynamic Meteors, 360° Rotation and Nebula', url: 'https://link.amazon/B0gJtRmlL', image: 'assets/images/affiliate/amazon-space.webp', alt: 'Original ASARK illustration for the space category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'market-martech-playbook', asin: null, category: 'MARKET', title: 'The MarTech Playbook: 10 Practical Frameworks for Data, Automation & AI to Build Scalable, ROI-Driven Marketing Strategies', url: 'https://link.amazon/B01XYYZYJ', image: 'assets/images/affiliate/amazon-market.webp', alt: 'Original ASARK illustration for the market category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'market-wizards', asin: null, category: 'MARKET', title: 'Market Wizards: Interviews with Top Traders', url: 'https://link.amazon/B04GWCixU', image: 'assets/images/affiliate/amazon-market.webp', alt: 'Original ASARK illustration for the market category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'market-algo-trading-cheat-codes', asin: null, category: 'MARKET', title: 'Algo Trading Cheat Codes: Techniques for Traders to Quickly and Efficiently Develop Better Algorithmic Trading Systems', url: 'https://link.amazon/B0iuNZmkg', image: 'assets/images/affiliate/amazon-market.webp', alt: 'Original ASARK illustration for the market category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'vehicle-polar-x1-ev-charger', asin: null, category: 'VEHICLE', title: 'Polar X1 | 11kW Smart EV Charger | 3-Phase | Wall-Mount, 5m TPU Cable | Display, App, Bluetooth, RFID and OTA Updates', url: 'https://link.amazon/B0cs6Ow1r', image: 'assets/images/affiliate/amazon-vehicle.webp', alt: 'Original ASARK illustration for the vehicle category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'vehicle-obdeleven-3', asin: null, category: 'VEHICLE', title: 'OBDeleven 3 OBD II Diagnostic Scanner for VW, Audi, Skoda, BMW, Mercedes, Mini, Toyota, Seat and Cupra', url: 'https://link.amazon/B0cu6ryVS', image: 'assets/images/affiliate/amazon-vehicle.webp', alt: 'Original ASARK illustration for the vehicle category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'vehicle-eox-portable-ev-charger', asin: null, category: 'VEHICLE', title: 'EOX® 3.6kW Portable Universal Car EV Charger | 16A Type 2 AC | 3-Pin Indian Plug | Adjustable Power | LED Display', url: 'https://link.amazon/B01SHujIY', image: 'assets/images/affiliate/amazon-vehicle.webp', alt: 'Original ASARK illustration for the vehicle category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'animation-xppen-artist-pro-16', asin: null, category: 'ANIMATION', title: 'XPPen Artist Pro 16 (Gen 2) 16-Inch Drawing Display with X3 Pro Stylus and Bluetooth Express Key Remote', url: 'https://link.amazon/B0ieL06kX', image: 'assets/images/affiliate/amazon-animation.webp', alt: 'Original ASARK illustration for the animation category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'animation-dj-laser-light', asin: null, category: 'ANIMATION', title: 'DJ Laser Light for Party, 3D Animation Laser Machine with Manual Graffiti, Text Playback and Personalized Programming', url: 'https://link.amazon/B0aX3Ivrm', image: 'assets/images/affiliate/amazon-animation.webp', alt: 'Original ASARK illustration for the animation category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'animation-animators-eye', asin: null, category: 'ANIMATION', title: 'The Animator’s Eye: Adding Life to Animation With Timing, Layout, Design, Color and Sound', url: 'https://link.amazon/B01jmwTbD', image: 'assets/images/affiliate/amazon-animation.webp', alt: 'Original ASARK illustration for the animation category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'architecture-isomars-a2-drafting-kit', asin: null, category: 'ARCHITECTURE', title: 'Isomars A2 Technical Drawing & Drafting Kit with Board & Tools', url: 'https://link.amazon/B0gOPHXao', image: 'assets/images/affiliate/amazon-architecture.webp', alt: 'Original ASARK illustration for the architecture category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'architecture-underprivileged-classes', asin: null, category: 'ARCHITECTURE', title: 'Reading the Architecture of the Underprivileged Classes', url: 'https://link.amazon/B02NBvnCZ', image: 'assets/images/affiliate/amazon-architecture.webp', alt: 'Original ASARK illustration for the architecture category.', approvedAffiliateLink: true, originalArtwork: true },
    { id: 'architecture-wooden-house-puzzle', asin: null, category: 'ARCHITECTURE', title: '3D Wooden House Puzzle Japanese Architecture Miniature Model Kit – 58-Piece Laser-Cut MDF DIY Craft', url: 'https://link.amazon/B06uuyqNK', image: 'assets/images/affiliate/amazon-architecture.webp', alt: 'Original ASARK illustration for the architecture category.', approvedAffiliateLink: true, originalArtwork: true }
  ]);

  const ROTATION_INTERVAL_MS = 12000;
  const FADE_DURATION_MS = 250;
  const GENERAL_CATEGORY = 'GENERAL';
  const MAIN_PAGE_OFFSETS = Object.freeze({
    'index.html': 0,
    'visual.html': 1,
    'blogs.html': 2,
    'technology.html': 0
  });
  const MAIN_PAGE_CATEGORIES = Object.freeze(['AI', 'SEMICONDUCTOR', 'SPACE', 'MARKET', 'VEHICLE', 'ANIMATION', 'ARCHITECTURE']);
  const PAGE_FEATURED_PRODUCTS = Object.freeze({
    'what-is-vlsi.html': 'ai-intel-core-ultra-9-285k'
  });
  const PAGE_CATEGORIES = Object.freeze({
    'ai-technology.html': 'AI', 'computing.html': 'AI', 'graphics-card.html': 'AI',
    'processor.html': 'SEMICONDUCTOR', 'semiconductor.html': 'SEMICONDUCTOR', 'vlsi.html': 'SEMICONDUCTOR',
    'what-is-vlsi.html': 'SEMICONDUCTOR',
    'market-technology.html': 'MARKET', 'animation-technology.html': 'ANIMATION', 'architecture.html': 'ARCHITECTURE',
    'space.html': 'SPACE', 'vehicle-technology.html': 'VEHICLE',
    'journal/ai-technology-future.html': 'AI', 'journal/semiconductor-technology-future.html': 'SEMICONDUCTOR',
    'journal/market-technology-future.html': 'MARKET', 'journal/animation-technology-future.html': 'ANIMATION',
    'journal/space-technology-future.html': 'SPACE', 'journal/vehicle-technology-future.html': 'VEHICLE'
  });

  const normalisePath = () => {
    try { return decodeURIComponent(location.pathname).replace(/^\/+|\/+$/g, '') || 'index.html'; }
    catch { return 'index.html'; }
  };
  const scriptUrl = new URL(document.currentScript.src);
  const siteRoot = new URL('../', scriptUrl);
  const affiliateImageRoot = new URL('assets/images/affiliate/', siteRoot).pathname;
  const AFFILIATE_HOSTS = new Set(['link.amazon']);
  const approvedAffiliateUrl = (value) => {
    if (typeof value !== 'string') return null;
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password && AFFILIATE_HOSTS.has(url.hostname) ? url : null;
    } catch { return null; }
  };
  const approvedArtworkUrl = (value) => {
    if (typeof value !== 'string') return null;
    try {
      const url = new URL(value, siteRoot);
      return url.origin === siteRoot.origin && !url.search && !url.hash && url.pathname.startsWith(affiliateImageRoot) ? url : null;
    } catch { return null; }
  };
  const versionedArtworkUrl = (url) => {
    const versionedUrl = new URL(url.href);
    versionedUrl.searchParams.set('v', '8');
    return versionedUrl.href;
  };
  const renderAffiliateSidebar = () => {
  const validProducts = AMAZON_AFFILIATE_PRODUCTS.map((product) => ({ product, affiliateUrl: approvedAffiliateUrl(product?.url), artworkUrl: approvedArtworkUrl(product?.image) }))
    .filter(({ product, affiliateUrl, artworkUrl }) => product && typeof product.id === 'string' && product.id.trim() && typeof product.title === 'string' && product.title.trim() && product.approvedAffiliateLink === true && product.originalArtwork === true && affiliateUrl && artworkUrl);
  if (!validProducts.length) return;

  const pagePath = normalisePath();
  const pageCategory = PAGE_CATEGORIES[pagePath] || GENERAL_CATEGORY;
  const categoryProducts = validProducts.filter(({ product }) => product.category === pageCategory);
  const generalProducts = validProducts.filter(({ product }) => !product.category || product.category === GENERAL_CATEGORY);
  const isMainPage = Object.prototype.hasOwnProperty.call(MAIN_PAGE_OFFSETS, pagePath);
  const mainPageProducts = isMainPage ? MAIN_PAGE_CATEGORIES.map((category) => {
    const matches = validProducts.filter(({ product }) => product.category === category);
    return matches[MAIN_PAGE_OFFSETS[pagePath] % matches.length];
  }).filter(Boolean) : [];
  let products = isMainPage ? mainPageProducts : (categoryProducts.length ? categoryProducts : generalProducts);
  const featuredProductId = PAGE_FEATURED_PRODUCTS[pagePath];
  if (featuredProductId) {
    const featuredProduct = validProducts.find(({ product }) => product.id === featuredProductId);
    if (featuredProduct) products = [featuredProduct, ...products.filter(({ product }) => product.id !== featuredProductId)];
  }
  if (isMainPage && products.length !== MAIN_PAGE_CATEGORIES.length) return;
  const main = document.querySelector('main');
  const footer = document.querySelector('.site-footer');
  if (!main || !footer || document.querySelector('[data-amazon-affiliate-catalog]')) return;

  if (!document.querySelector('link[data-amazon-affiliate-styles]')) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = new URL('../css/amazon-affiliate-sidebar.css?v=7', scriptUrl).href;
    stylesheet.dataset.amazonAffiliateStyles = '';
    document.head.append(stylesheet);
  }

  const createProductLink = (entry, layoutClass, loading) => {
    const productLink = document.createElement('a');
    productLink.className = layoutClass;
    productLink.href = entry.affiliateUrl.href;
    productLink.target = '_blank';
    productLink.rel = 'sponsored nofollow noopener noreferrer';
    const image = document.createElement('img');
    image.className = 'amazon-affiliate-image';
    image.src = versionedArtworkUrl(entry.artworkUrl);
    image.alt = entry.product.alt;
    image.loading = loading;
    image.decoding = 'async';
    image.width = 1254;
    image.height = 1254;
    const artworkNote = document.createElement('span');
    artworkNote.className = 'amazon-affiliate-artwork-note';
    artworkNote.textContent = 'Original ASARK category illustration';
    const title = document.createElement('span');
    title.className = 'amazon-affiliate-title';
    title.textContent = entry.product.title.trim();
    const cta = document.createElement('span');
    cta.className = 'amazon-affiliate-cta';
    cta.textContent = 'View on Amazon';
    productLink.append(image, artworkNote, title, cta);
    return productLink;
  };

  if (!products.length) return;
  const isHomePage = pagePath === 'index.html';
  let layout;
  let homeMount = null;
  if (isHomePage) {
    homeMount = document.querySelector('[data-amazon-affiliate-mount="home"]');
    if (!homeMount) {
      console.warn('[ASARK affiliate] Homepage mount [data-amazon-affiliate-mount="home"] was not found.');
      return;
    }
    layout = homeMount.closest('.amazon-affiliate-layout--post-hero');
    if (!layout) {
      console.warn('[ASARK affiliate] Homepage mount is outside the post-hero layout.');
      return;
    }
  } else {
    layout = document.createElement('div');
    layout.className = 'amazon-affiliate-layout';
    main.before(layout);
    layout.append(main);
  }
  const sidebar = document.createElement('aside');
  sidebar.className = 'amazon-affiliate-sidebar';
  sidebar.dataset.amazonAffiliateCatalog = isMainPage ? 'main' : 'category';
  sidebar.setAttribute('aria-label', 'Recommended Amazon product');
  const label = document.createElement('p');
  label.className = 'amazon-affiliate-label';
  label.textContent = 'Recommended on Amazon';
  const productLink = createProductLink(products[0], 'amazon-affiliate-product-link', 'eager');
  const image = productLink.querySelector('.amazon-affiliate-image');
  const title = productLink.querySelector('.amazon-affiliate-title');
  const cta = productLink.querySelector('.amazon-affiliate-cta');
  cta.textContent = 'View on Amazon →';
  const disclosure = document.createElement('p');
  disclosure.className = 'amazon-affiliate-disclosure';
  disclosure.textContent = 'As an Amazon Associate, ASARK may earn from qualifying purchases.';
  sidebar.append(label, productLink, disclosure);
  if (isHomePage) {
    sidebar.id = homeMount.id;
    homeMount.replaceWith(sidebar);
  } else {
    layout.append(sidebar);
  }

  let currentIndex = -1;
  let rotationTimer = null;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const showProduct = (nextIndex) => {
    const entry = products[nextIndex];
    if (!entry) return;
    const update = () => {
      productLink.href = entry.affiliateUrl.href;
      image.src = versionedArtworkUrl(entry.artworkUrl);
      image.alt = entry.product.alt;
      title.textContent = entry.product.title.trim();
      sidebar.classList.remove('is-changing');
      currentIndex = nextIndex;
    };
    if (currentIndex < 0 || reducedMotion) { update(); return; }
    sidebar.classList.add('is-changing');
    window.setTimeout(update, FADE_DURATION_MS);
  };
  const nextProduct = () => showProduct((currentIndex + 1) % products.length);
  const startRotation = () => {
    if (reducedMotion || products.length < 2 || rotationTimer || document.hidden) return;
    rotationTimer = window.setInterval(nextProduct, ROTATION_INTERVAL_MS);
  };
  const stopRotation = () => {
    if (!rotationTimer) return;
    window.clearInterval(rotationTimer);
    rotationTimer = null;
  };
  image.addEventListener('error', () => {
    image.hidden = true;
    console.warn('[ASARK affiliate] Recommendation artwork could not be loaded; the product link remains available.');
  }, { once: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopRotation(); else startRotation(); });
  showProduct(isMainPage || featuredProductId ? 0 : Math.floor(Math.random() * products.length));
  startRotation();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAffiliateSidebar, { once: true });
  } else {
    renderAffiliateSidebar();
  }
})();
