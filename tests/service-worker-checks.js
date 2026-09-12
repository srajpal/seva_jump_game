const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');

class MockCache {
  constructor(scope, fetchImpl) { this.scope = scope; this.fetchImpl = fetchImpl; this.entries = new Map(); this.added = []; this.failPut = false; }
  key(request) { return new URL(typeof request === 'string' ? request : request.url, this.scope).href; }
  async addAll(files) {
    this.added = [...files];
    const fetched = await Promise.all(files.map(async file => {
      const response = await this.fetchImpl(new Request(new URL(file, this.scope)));
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

function createWorker() {
  const scope = 'https://html-classic.itch.zone/html/123456/';
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
    registration: { scope }, clients: { claim: async () => {} }, skipWaiting: async () => {},
    addEventListener(type, handler) { listeners[type] = handler; },
  };
  vm.runInNewContext(source, { self, caches, fetch: fetchImpl, Request, Response, URL });
  const dispatch = async (type, request) => {
    let pending, response;
    listeners[type]({ request, waitUntil(value) { pending = value; }, respondWith(value) { response = value; } });
    if (pending) await pending;
    return response;
  };
  return { scope, stores, deleted, requests, dispatch, setOnline(value) { online = value; }, setStatus(value) { status = value; } };
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
  assert.equal(cacheName, `seva-jump-${encodeURIComponent('/html/123456/')}-v0.13.2`);
  assert(!releaseCache.added.includes('./'), 'precache must not request the hosting directory');
  assert(releaseCache.added.includes('./index.html'));

  const requestsBeforeNavigation = worker.requests.length;
  const onlineNavigation = await worker.dispatch('fetch', request(worker.scope, '', 'navigate'));
  assert.match(await onlineNavigation.text(), /Seva Jump/);
  assert.equal(worker.requests.length, requestsBeforeNavigation,
    'a controlling worker keeps HTML on its complete cached release during an upgrade');

  worker.setOnline(false);
  const scriptResponse = await worker.dispatch('fetch', request(`${worker.scope}game.js?v=0.13.2`, 'script'));
  assert.equal(scriptResponse.status, 200, 'first controlled offline reload finds a versioned script');
  assert.match(await scriptResponse.text(), /TEST_SCRIPT/);
  const navigationResponse = await worker.dispatch('fetch', request(worker.scope, '', 'navigate'));
  assert.match(await navigationResponse.text(), /Seva Jump/, 'directory navigation uses cached index.html');

  worker.stores.set('other-game-v9', new MockCache(worker.scope, async () => new Response('other')));
  const collidingLossyScope = `seva-jump-${encodeURIComponent('/html-123456/')}-v0.13.1`;
  worker.stores.set(collidingLossyScope, new MockCache(worker.scope, async () => new Response('other scope')));
  const oldName = cacheName.replace('v0.13.2', 'v0.13.1');
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

  console.log('PASS service worker: scoped atomic precache, first-load offline, cache ownership and typed fallbacks');
})().catch(error => { console.error(error); process.exitCode = 1; });
