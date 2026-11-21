const VERSION = "c7358932ccd2c40b";
const SCOPE = self.registration.scope;
const PREFIX = 'old-pc-testimony:' + encodeURIComponent(SCOPE) + ':';
const CACHE = PREFIX + VERSION;
const FILES = ["./assets/ending-class.webp","./assets/evidence/IMG_0712_04.jpg","./assets/evidence/clinic-duty-log.jpg","./assets/evidence/exhibit-photo.jpg","./assets/evidence/exhibit-register.jpg","./assets/evidence/handover-papers.jpg","./assets/evidence/incident-brief.jpg","./assets/evidence/inventory-film.jpg","./assets/evidence/lesson-board.jpg","./assets/evidence/lodging-register.jpg","./assets/evidence/night-school.jpg","./assets/evidence/night-transport.jpg","./assets/evidence/returned-items.jpg","./assets/evidence/shop-c742.jpg","./assets/evidence/station-key-register.jpg","./assets/evidence/station-work-order.jpg","./assets/evidence/valuation-and-booking.jpg","./assets/index-B7X2tHr6.js","./assets/index-o8Kh37zZ.css","./assets/xp-bliss.svg","./favicon.svg","./index.html","./offline-manifest.json"].map(path =>
  new URL(path.split('/').map(encodeURIComponent).join('/'), SCOPE).href
);
const INDEX = new URL('index.html', SCOPE).href;
const CACHEABLE = new Set(FILES);

function precache(cache) {
  return cache.addAll(FILES.map(url => new Request(url, { cache: 'reload' })));
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // addAll commits atomically. Leave an existing cache intact if a fetch fails.
    await precache(cache);
  })());
});
self.addEventListener('activate', event => event.waitUntil((async () => {
  const names = await caches.keys();
  await Promise.all(names.filter(name => name.startsWith(PREFIX) && name !== CACHE).map(name => caches.delete(name)));
  await self.clients.claim();
})()));
self.addEventListener('message', event => {
  if (event.data === 'CACHE_STATUS' || event.data === 'REPAIR_CACHE') event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    if (event.data === 'REPAIR_CACHE') {
      try { await precache(cache); }
      catch { event.ports[0]?.postMessage({ ready: false, version: VERSION }); return; }
    }
    const found = await Promise.all(FILES.map(url => cache.match(url)));
    event.ports[0]?.postMessage({ ready: found.every(Boolean), version: VERSION });
  })());
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  url.search = '';
  url.hash = '';
  const key = event.request.mode === 'navigate' && url.href === SCOPE ? INDEX : url.href;
  if (!CACHEABLE.has(key)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    return (await cache.match(key)) || fetch(event.request);
  })());
});
