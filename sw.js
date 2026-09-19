const RELEASE_VERSION = '1.0.0';
const SCOPE_URL = new URL(self.registration.scope);
const SCOPE_KEY = encodeURIComponent(SCOPE_URL.pathname);
const CACHE_PREFIX = `seva-jump-${SCOPE_KEY}-`;
const CACHE_NAME = `${CACHE_PREFIX}v${RELEASE_VERSION}`;

// Keep this list explicit: itch.io rejects directory requests, and one failed
// request would prevent the whole release cache from installing.
const APP_FILES = [
  './index.html',
  './styles.css',
  './game-config.js',
  './game-rules.js',
  './game.js',
  './manifest.webmanifest',
  './privacy.html',
  './assets/app-icon-bird-v1.png',
  './assets/gurdwara-courtyard-pixel-v1.png',
  './assets/gurdwara-sunset-pixel-v1.png',
  './assets/gurdwara-dawn-pixel-v1.png',
  './assets/player-girl-pixel-v1.png',
  './assets/player-girl-fall-pixel-v1.png',
  './assets/player-girl-net-pixel-v2.png',
  './assets/player-boy-pixel-v1.png',
  './assets/player-boy-fall-pixel-v3.png',
  './assets/player-boy-net-pixel-v4.png',
  './assets/platform-grass-pixel-v1.png',
  './assets/platform-spring-pixel-v1.png',
  './assets/platform-moving-pixel-v1.png',
  './assets/platform-break-wood-pixel-v1.png',
  './assets/parshad-bowl-pixel-v3.png',
  './assets/khanda-token-pixel-v3.png',
  './assets/bird-pigeon-flap-pixel-v1.png',
  './assets/bird-sparrow-flap-pixel-v1.png',
  './assets/bird-swift-flap-pixel-v1.png',
  './assets/powerup-kara-pixel-v1.png',
  './assets/powerup-nishan-pixel-v1.png',
  './assets/dhal-shield-pixel-v1.png',
  './assets/falcon-save-pixel-v1.png',
  './assets/catch-net-hover-pixel-v1.png',
  './assets/finish-banner-hover-pixel-v1.png',
];

const cacheMatch = request => caches.open(CACHE_NAME)
  .then(cache => cache.match(request, { ignoreSearch: true }));

const canCache = (request, response) => {
  const url = new URL(request.url);
  return response.ok
    && response.type !== 'opaque'
    && url.origin === SCOPE_URL.origin
    && url.href.startsWith(SCOPE_URL.href);
};

const fetchAndCache = request => fetch(request).then(response => {
  if (!canCache(request, response)) return response;
  const cacheKey = new URL(request.url);
  cacheKey.search = '';
  return caches.open(CACHE_NAME)
    .then(cache => cache.put(cacheKey.href, response.clone()))
    .catch(() => undefined)
    .then(() => response);
});

const unavailableResponse = destination => {
  const contentTypes = {
    script: 'application/javascript; charset=utf-8',
    style: 'text/css; charset=utf-8',
    image: 'image/svg+xml; charset=utf-8',
  };
  return new Response('', {
    status: 503,
    statusText: 'Offline',
    headers: { 'Content-Type': contentTypes[destination] || 'text/plain; charset=utf-8' },
  });
};

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map(key => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== SCOPE_URL.origin || !requestUrl.href.startsWith(SCOPE_URL.href)) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      // Keep a controlled page on one complete release. The browser still
      // checks sw.js for updates; the next worker takes over only after its
      // entire APP_FILES cache installs successfully.
      cacheMatch('./index.html')
        .then(cached => cached || fetchAndCache(event.request))
        .catch(() => unavailableResponse('document')),
    );
    return;
  }

  event.respondWith(
    cacheMatch(event.request)
      .then(cached => cached || fetchAndCache(event.request))
      .catch(() => unavailableResponse(event.request.destination)),
  );
});
