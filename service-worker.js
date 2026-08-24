const CACHE_NAME = 'asark-v5';
const APP_SHELL = [
  './', './index.html', './architecture.html', './ai-technology.html', './interiors.html',
  './lifestyle.html', './blog.html', './affiliate.html', './about.html', './visual.html',
  './css/style.css', './js/site.js', './manifest.webmanifest', './assets/asark-mark.svg',
  './assets/icon-192.png', './assets/icon-512.png', './assets/ai-technology-ambient-intelligence.png',
  './assets/interiors/ai-interior-collection.png', './assets/interiors/ai-living-room.png',
  './assets/lifestyle/ai-lifestyle-collection.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then((response) => response || caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (new URL(event.request.url).origin === self.location.origin) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
    }
    return response;
  }))));
});
