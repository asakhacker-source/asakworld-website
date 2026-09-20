(() => {
  'use strict';

  const catalog = window.ASARK_AMAZON_AFFILIATE_CATALOG;
  if (!catalog || document.querySelector('[data-asark-amazon-widget]')) return;

  const siteRoot = new URL('/', location.href);
  const imageRoot = new URL('assets/images/affiliate/', siteRoot).pathname;
  const approvedHosts = new Set(['link.amazon']);
  const validProducts = catalog.products.map((product) => {
    if (!product || product.approvedAffiliateLink !== true || product.originalArtwork !== true) return null;
    try {
      const affiliateUrl = new URL(product.url);
      const imageUrl = new URL(product.image, siteRoot);
      if (affiliateUrl.protocol !== 'https:' || affiliateUrl.username || affiliateUrl.password || !approvedHosts.has(affiliateUrl.hostname)) return null;
      if (imageUrl.origin !== siteRoot.origin || !imageUrl.pathname.startsWith(imageRoot)) return null;
      return { product, affiliateUrl, imageUrl };
    } catch { return null; }
  }).filter(Boolean);
  if (!validProducts.length) return;

  let pagePath = '';
  try { pagePath = decodeURIComponent(location.pathname).replace(/^\/+|\/+$/g, '') || 'index.html'; }
  catch { pagePath = 'index.html'; }

  const category = catalog.pageCategories[pagePath];
  let recommendations = validProducts.filter(({ product }) => product.category === category);
  const isMainPage = Object.prototype.hasOwnProperty.call(catalog.mainPageOffsets, pagePath);
  if (isMainPage) {
    recommendations = catalog.mainPageCategories.map((itemCategory) => {
      const matches = validProducts.filter(({ product }) => product.category === itemCategory);
      return matches.length ? matches[catalog.mainPageOffsets[pagePath] % matches.length] : null;
    }).filter(Boolean);
  }
  if (!recommendations.length) {
    const generalProducts = validProducts.filter(({ product }) => !product.category || product.category === catalog.generalCategory);
    recommendations = generalProducts.length ? generalProducts : validProducts;
    console.info('[ASARK Amazon] Using the existing retained-catalog fallback for', pagePath);
  }
  const featuredId = catalog.featuredProducts[pagePath];
  if (featuredId) {
    const featured = validProducts.find(({ product }) => product.id === featuredId);
    if (featured) recommendations = [featured, ...recommendations.filter(({ product }) => product.id !== featuredId)];
  }
  if (!isMainPage && !featuredId && !category) {
    const stableIndex = [...pagePath].reduce((sum, character) => sum + character.charCodeAt(0), 0) % recommendations.length;
    recommendations = [recommendations[stableIndex]];
  }
  if (!recommendations.length) return;

  const create = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const button = (className, label, title) => {
    const element = create('button', className, label);
    element.type = 'button';
    element.title = title;
    element.setAttribute('aria-label', title);
    return element;
  };
  const widget = create('div', 'asark-amazon-widget');
  widget.dataset.asarkAmazonWidget = '';
  const launcher = button('asark-amazon-launcher', '🛒 Amazon Picks', 'Open Amazon recommendations');
  launcher.dataset.asarkAmazonLauncher = '';
  launcher.id = 'asark-amazon-launcher';
  launcher.setAttribute('aria-controls', 'asark-amazon-panel');
  launcher.setAttribute('aria-expanded', 'false');

  const panel = create('section', 'asark-amazon-panel');
  panel.id = 'asark-amazon-panel';
  panel.dataset.asarkAmazonPanel = '';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Amazon recommendations');
  panel.setAttribute('aria-hidden', 'true');
  panel.inert = true;
  const header = create('header', 'asark-amazon-header');
  header.append(create('h2', '', 'Recommended on Amazon'));
  const close = button('asark-amazon-close', '×', 'Close Amazon recommendations');
  close.dataset.asarkAmazonClose = '';
  header.append(close);

  const productArea = create('div', 'asark-amazon-product');
  const image = create('img', 'asark-amazon-image');
  const title = create('p', 'asark-amazon-title');
  const productLink = create('a', 'asark-amazon-link');
  productLink.target = '_blank';
  productLink.rel = 'sponsored nofollow noopener noreferrer';
  const paidLink = create('span', 'asark-amazon-paid-link', '(paid link)');
  const disclosure = create('p', 'asark-amazon-disclosure', 'As an Amazon Associate I earn from qualifying purchases.');
  productArea.append(image, title, productLink, paidLink, disclosure);
  panel.append(header, productArea);

  const selectProduct = (entry) => {
    image.src = new URL(`${entry.imageUrl.pathname}?v=8`, siteRoot).href;
    image.alt = entry.product.alt;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.width = 1254;
    image.height = 1254;
    title.textContent = entry.product.title.trim();
    productLink.href = entry.affiliateUrl.href;
    productLink.textContent = 'View on Amazon →';
  };
  selectProduct(recommendations[0]);
  image.addEventListener('error', () => {
    image.hidden = true;
    console.warn('[ASARK Amazon] Recommendation artwork could not be loaded; the product link remains available.');
  }, { once: true });

  const setOpen = (isOpen, restoreFocus = true) => {
    panel.classList.toggle('open', isOpen);
    panel.inert = !isOpen;
    panel.setAttribute('aria-hidden', String(!isOpen));
    launcher.setAttribute('aria-expanded', String(isOpen));
    if (isOpen && matchMedia('(max-width: 900px)').matches) {
      document.dispatchEvent(new CustomEvent('asark-amazon:opening'));
    }
    if (isOpen) close.focus();
    else if (restoreFocus) launcher.focus();
  };
  launcher.addEventListener('click', () => setOpen(!panel.classList.contains('open')));
  close.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panel.classList.contains('open')) setOpen(false);
  });
  document.addEventListener('asark-ai:opening', () => {
    if (matchMedia('(max-width: 900px)').matches && panel.classList.contains('open')) setOpen(false, false);
  });

  widget.append(launcher, panel);
  document.body.append(widget);
})();
