/* Recover an already controlled development tab without changing production PWA behavior. */
(() => {
  if (!['localhost', '127.0.0.1'].includes(location.hostname) || !('serviceWorker' in navigator)) return;
  const workerUrl = new URL('../service-worker.js', document.currentScript.src).href;
  const isAsarkWorker = (worker) => worker && new URL(worker.scriptURL).pathname === new URL(workerUrl).pathname;
  navigator.serviceWorker.getRegistrations().then(async (registrations) => {
    const controlled = isAsarkWorker(navigator.serviceWorker.controller);
    const removed = await Promise.all(registrations
      .filter((registration) => isAsarkWorker(registration.active || registration.waiting || registration.installing))
      .map((registration) => registration.unregister()));
    // Unregistering alone leaves the current document controlled until navigation.
    if (controlled && removed.some(Boolean)) location.reload();
  }).catch((error) => console.warn('[ASARK] Could not release the local service worker:', error));
})();
