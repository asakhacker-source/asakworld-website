const CACHE_NAME = 'asark-app-v121';
const OFFLINE_URL = './offline.html';
const LOCAL_DEVELOPMENT = ['localhost', '127.0.0.1'].includes(self.location.hostname);
const APP_SHELL = [
  './', './index.html', './offline.html', './css/style.css?v=93', './js/site.js?v=92',
  './manifest.webmanifest', './assets/asark-mark.svg', './assets/icon-192.png', './assets/icon-512.png',
  './css/asark-amazon-widget.css?v=2', './js/amazon-affiliate-products.js?v=12', './js/asark-amazon-widget.js?v=1'
];

self.addEventListener('install', (event) => {
  if (LOCAL_DEVELOPMENT) {
    event.waitUntil(self.skipWaiting());
    return;
  }
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  if (LOCAL_DEVELOPMENT) {
    event.waitUntil(self.clients.claim());
    return;
  }
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
    .then(() => self.clients.claim()));
});

function cacheCompleteResponse(event, request, response) {
  if (response.status !== 200) return;

  const copy = response.clone();
  event.waitUntil(caches.open(CACHE_NAME)
    .then((cache) => cache.put(request, copy))
    .catch(() => undefined));
}

self.addEventListener('fetch', (event) => {
  if (LOCAL_DEVELOPMENT) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.endsWith('/auth-callback.html') || url.pathname.endsWith('/reset-password.html') || url.pathname.endsWith('/js/auth-config.js') || url.searchParams.has('code')) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }

  if (event.request.headers.has('range')) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request)
      .then((response) => {
        cacheCompleteResponse(event, event.request, response);
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match(OFFLINE_URL))));
    return;
  }

  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)
    .then((response) => {
      cacheCompleteResponse(event, event.request, response);
      return response;
    })));
});
