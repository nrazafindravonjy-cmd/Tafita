// Tafita offline support: keeps what was viewed and what a list prepared, and
// serves it when the network is missing.
const VERSION = 'tafita-v1';
const SHELL = `${VERSION}-shell`;
const DATA = `${VERSION}-data`;
const MEDIA = `${VERSION}-media`;
const TILES = `${VERSION}-tiles`;
const LIMITS = { [MEDIA]: 400, [TILES]: 6000, [DATA]: 1500 };

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((cache) => cache.addAll(['/'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

async function trim(name) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  const extra = keys.length - LIMITS[name];
  for (let i = 0; i < extra; i++) await cache.delete(keys[i]);
}

async function cacheFirst(request, name) {
  const cache = await caches.open(name);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok || response.type === 'opaque') {
    await cache.put(request, response.clone());
    trim(name);
  }
  return response;
}

async function networkFirst(request, name) {
  const cache = await caches.open(name);
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
      trim(name);
    }
    return response;
  } catch (error) {
    const hit = await cache.match(request);
    if (hit) return hit;
    throw error;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // The app is a single page: any navigation falls back to the cached shell.
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, SHELL).catch(() => caches.match('/')));
    return;
  }
  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith('/_expo/') || url.pathname.startsWith('/assets/')) {
      event.respondWith(cacheFirst(request, SHELL));
    } else if (url.pathname.endsWith('.json')) {
      event.respondWith(networkFirst(request, SHELL));
    } else if (url.pathname === '/api/photo') {
      event.respondWith(cacheFirst(request, MEDIA));
    }
    return;
  }
  // Place data from the Neon Data API: fresh when online, cached when not.
  if (url.hostname.includes('.apirest.')) {
    event.respondWith(networkFirst(request, DATA));
    return;
  }
  if (url.hostname.endsWith('wikimedia.org') || url.hostname.includes('neon.tech') && url.pathname.includes('/storage')) {
    event.respondWith(cacheFirst(request, MEDIA));
    return;
  }
  if (url.hostname === 'tiles.openfreemap.org' || url.hostname === 'tiles.maps.eox.at') {
    event.respondWith(cacheFirst(request, TILES));
  }
});
