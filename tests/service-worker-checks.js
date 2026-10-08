const releaseVersion = require('../package.json').version;
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');

class MockCache {
  constructor(scope, fetchImpl) { this.scope = scope; this.fetchImpl = fetchImpl; this.entries = new Map(); this.added = []; this.failPut = false; }
  key(request) { return new URL(typeof request === 'string' ? request : request.url, this.scope).href; }
  async addAll(files) {
    // Record precache entries relative to the scope, plus each request's cache mode.
    this.added = files.map(file => typeof file === 'string' ? file : './' + file.url.slice(this.scope.length));
    this.cacheModes = files.map(file => typeof file === 'string' ? 'default' : file.cache);
    const fetched = await Promise.all(files.map(async file => {
      const response = await this.fetchImpl(typeof file === 'string' ? new Request(new URL(file, this.scope)) : file);
      if (!response.ok) throw new Error(`Precache failed: ${file}`);
      return [this.key(file), response];
    }));
    fetched.forEach(([key, response]) => this.entries.set(key, response));
  }
  async match(request, options = {}) {
    const wanted = new URL(this.key(request));
    if (options.ignoreSearch) wanted.search = '';
    for (const [key, response] of this.entries) {
      const candidate = new URL(key);
      if (options.ignoreSearch) candidate.search = '';
      if (candidate.href === wanted.href) return response.clone();
    }
  }
  async put(request, response) {
    if (this.failPut) throw new Error('QuotaExceededError');
    this.entries.set(this.key(request), response);
  }
}

function createWorker(scope = 'https://html-classic.itch.zone/html/123456/') {
  let unregistered = false;
  const listeners = {}, stores = new Map(), deleted = [], requests = [];
  let online = true, status = 200;
  const fetchImpl = async request => {
    const url = new URL(request.url); requests.push(url.href);
    if (!online) throw new TypeError('offline');
    const body = url.pathname.endsWith('.js') ? 'self.TEST_SCRIPT = true;' :
      url.pathname.endsWith('.css') ? 'body{}' :
      url.pathname.endsWith('.png') ? 'png' : '<!doctype html><title>Seva Jump</title>';
    return new Response(body, { status, headers: { 'Content-Type': url.pathname.endsWith('.js') ? 'application/javascript' : 'text/html' } });
  };
  const caches = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new MockCache(scope, fetchImpl));
      return stores.get(name);
    },
    async keys() { return [...stores.keys()]; },
    async delete(name) { deleted.push(name); return stores.delete(name); },
  };
  const self = {
    registration: { scope, unregister: async () => { unregistered = true; return true; } }, clients: { claim: async () => {} }, skipWaiting: async () => {},
    addEventListener(type, handler) { listeners[type] = handler; },
  };
  vm.runInNewContext(source, { self, caches, fetch: fetchImpl, Request, Response, URL });
  const dispatch = async (type, request) => {
    let pending, response;
    listeners[type]({ request, waitUntil(value) { pending = value; }, respondWith(value) { response = value; } });
    if (pending) await pending;
    return response;
  };
  return { scope, stores, deleted, requests, dispatch, get unregistered() { return unregistered; }, setOnline(value) { online = value; }, setStatus(value) { status = value; } };
}

function request(url, destination, mode) {
  const value = new Request(url);
  if (destination) Object.defineProperty(value, 'destination', { value: destination });
  if (mode) Object.defineProperty(value, 'mode', { value: mode });
  return value;
}

(async () => {
  const worker = createWorker();
  await worker.dispatch('install');
  const [[cacheName, releaseCache]] = worker.stores;
  assert.equal(cacheName, `seva-jump-${encodeURIComponent('/html/123456/')}-v${releaseVersion}-art6`);
  assert(!releaseCache.added.includes('./'), 'precache must not request the hosting directory');
  assert(releaseCache.added.includes('./index.html'));
  assert(releaseCache.cacheModes.every(mode => mode === 'reload'), 'precache bypasses the HTTP cache so replaced art is never stale');

  const requestsBeforeNavigation = worker.requests.length;
  const onlineNavigation = await worker.dispatch('fetch', request(worker.scope, '', 'navigate'));
  assert.match(await onlineNavigation.text(), /Seva Jump/);
  assert.equal(worker.requests.length, requestsBeforeNavigation,
    'a controlling worker keeps HTML on its complete cached release during an upgrade');

  worker.setOnline(false);
  const scriptResponse = await worker.dispatch('fetch', request(`${worker.scope}game.js?v=1.0.3`, 'script'));
  assert.equal(scriptResponse.status, 200, 'first controlled offline reload finds a versioned script');
  assert.match(await scriptResponse.text(), /TEST_SCRIPT/);
  const navigationResponse = await worker.dispatch('fetch', request(worker.scope, '', 'navigate'));
  assert.match(await navigationResponse.text(), /Seva Jump/, 'directory navigation uses cached index.html');

  worker.stores.set('other-game-v9', new MockCache(worker.scope, async () => new Response('other')));
  const collidingLossyScope = `seva-jump-${encodeURIComponent('/html-123456/')}-v0.13.1`;
  worker.stores.set(collidingLossyScope, new MockCache(worker.scope, async () => new Response('other scope')));
  const oldName = cacheName.replace(`v${releaseVersion}`, 'v1.0.0');
  worker.stores.set(oldName, new MockCache(worker.scope, async () => new Response('old')));
  await worker.dispatch('activate');
  assert(worker.stores.has('other-game-v9'), 'activation preserves unrelated shared-origin caches');
  assert(worker.stores.has(collidingLossyScope), 'similar scope paths cannot delete each other\'s caches');
  assert(!worker.stores.has(oldName), 'activation removes only this scope\'s obsolete release cache');

  worker.setOnline(true); worker.setStatus(200); releaseCache.failPut = true;
  const uncachedNetworkResponse = await worker.dispatch('fetch', request(`${worker.scope}runtime.txt`));
  assert.equal(uncachedNetworkResponse.status, 200, 'cache quota failure preserves a successful network response');
  releaseCache.failPut = false;

  worker.setStatus(404);
  const missingResponse = await worker.dispatch('fetch', request(`${worker.scope}assets/missing.png`, 'image'));
  assert.equal(missingResponse.status, 404);
  assert(![...releaseCache.entries.keys()].some(key => key.endsWith('missing.png')), '404 is not cached');

  worker.setStatus(500);
  const failedResponse = await worker.dispatch('fetch', request(`${worker.scope}missing.js`, 'script'));
  assert.equal(failedResponse.status, 500);
  assert(![...releaseCache.entries.keys()].some(key => key.endsWith('missing.js')), '500 is not cached');

  worker.setOnline(false);
  const offlineAsset = await worker.dispatch('fetch', request(`${worker.scope}never-cached.js`, 'script'));
  assert.equal(offlineAsset.status, 503);
  assert.match(offlineAsset.headers.get('Content-Type'), /javascript/, 'missing scripts never receive HTML');
  assert.equal(await worker.dispatch('fetch', request('https://example.com/external.js', 'script')), undefined);

  // In the Capacitor app (https://localhost) a worker left by an older build
  // must stand down: no precache, no interception, its caches removed.
  const native = createWorker('https://localhost/');
  native.stores.set(`seva-jump-${encodeURIComponent('/')}-v1.0.10-art6`, new MockCache(native.scope, async () => new Response('old')));
  native.stores.set('other-app-cache', new MockCache(native.scope, async () => new Response('other')));
  await native.dispatch('install');
  assert.equal(native.requests.length, 0, 'the native app worker precaches nothing');
  await native.dispatch('activate');
  assert.deepEqual([...native.stores.keys()], ['other-app-cache'], 'the native app worker removes only Seva Jump caches');
  assert.equal(native.unregistered, true, 'the native app worker unregisters itself');
  assert.equal(await native.dispatch('fetch', request('https://localhost/index.html', '', 'navigate')), undefined, 'the native app loads its packaged files');
  const devServer = createWorker('http://localhost:8765/');
  await devServer.dispatch('install');
  assert(devServer.requests.length > 0, 'local web servers keep offline caching');

  console.log('PASS service worker: scoped atomic precache, first-load offline, cache ownership, typed fallbacks and native-app stand-down');
})().catch(error => { console.error(error); process.exitCode = 1; });
