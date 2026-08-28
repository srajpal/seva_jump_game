const CACHE_NAME = 'seva-jump-v20';
const APP_FILES = [
  './',
  './index.html',
  './styles.css',
  './game-config.js',
  './game-rules.js',
  './game.js',
  './manifest.webmanifest',
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
  './assets/parshad-bowl-pixel-v1.png',
  './assets/khanda-token-pixel-v1.png',
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

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match('./index.html'))));
});
