const CACHE_NAME = 'asark-app-v38';
const OFFLINE_URL = './offline.html';
const APP_SHELL = [
  './', './index.html', './architecture.html', './ancient.html', './modern.html', './futuristic.html', './technology.html', './ai-technology.html', './space.html', './semiconductor.html', './vlsi.html', './processor.html', './graphics-card.html',
  './hacker-setup.html', './market-technology.html', './animation-technology.html', './vehicle-technology.html', './blogs.html', './about.html', './visual.html',
  './login.html', './signup.html',
  './offline.html', './guides/intelligent-home-foundation.html', './guides/ambient-lighting.html',
  './guides/coffee-ritual.html', './projects/beyond-the-shore.html',
  './projects/contemporary-estate.html', './projects/dining-and-kitchen.html',
  './projects/glass-and-stone.html', './projects/living-spaces.html',
  './projects/material-stories.html', './projects/minimal-estate.html',
  './projects/modern-elegance.html', './projects/new-classic.html',
  './projects/private-villa.html', './projects/quiet-luxury.html',
  './projects/timeless-style.html', './css/style.css', './js/site.js', './js/auth-config.js',
  './manifest.webmanifest', './assets/asark-mark.svg', './assets/icon-192.png', './assets/technology-blog.png', './assets/technology-showcase.png',
  './assets/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match(OFFLINE_URL))));
    return;
  }

  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)
    .then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      }
      return response;
    })));
});
