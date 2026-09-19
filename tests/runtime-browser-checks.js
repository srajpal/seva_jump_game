const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const gameSource = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
const runtimeHookSource = `globalThis.__SEVA_RUNTIME_HOOKS__ = {
  normalizeProfile, saveProfile, removeSavedProfile, resetAllProgress, canvasPointerX,
  start, reset, addPlatform, update, updateMobileHud, finish, triggerBirdHit, resolveBirdHit, triggerFalconSave, updateFalconRescue,
  observeSounds(observer) { const playSound = sound; sound = type => { observer(type); playSound(type); }; },
  pauseGame, resumeGame, openSettings, closeSettings, requestResetProgress, cancelResetProgress,
  setLastTime(value) { lastTime = value; },
  get profile() { return profile; }, get state() { return state; }, get pointerX() { return pointerX; }, get keys() { return keys; },
};`;
const config = require('../game-config.js');
const rules = require('../game-rules.js');

function makeRuntime(storage = {}, options = {}) {
  const elements = new Map(), documentListeners = {}, windowListeners = {};
  const document = {
    activeElement: null, hidden: false, documentElement: element('html'),
    querySelector(selector) {
      if (!elements.has(selector)) {
        const node = element(selector);
        if (selector === '#home-screen') node.classList.remove('hidden');
        else if (selector.endsWith('-screen')) node.classList.add('hidden');
        if (selector === '#game') Object.assign(node, { width: 450, height: 800, clientWidth: 768, clientHeight: 1024, getContext: () => drawingContext, getBoundingClientRect: () => ({ left: 0, top: 0, width: 768, height: 1024 }), setPointerCapture() {} });
        elements.set(selector, node);
      }
      return elements.get(selector);
    },
    querySelectorAll(selector) {
      if (selector === '.scene-character') return [character('girl'), character('boy')];
      if (selector === '.mode-actions button') return ['endless', 'arcade', 'challenge', 'hard'].map(modeButton);
      return [];
    },
    createElement(tag) { return element(tag); },
    addEventListener(type, handler) { documentListeners[type] = handler; },
  };
  function element(name) {
    const classes = new Set();
    return {
      name, id: '', className: '', dataset: {}, children: [], isConnected: true, inert: false, textContent: '', innerHTML: '', checked: true,
      classList: { add: (...values) => values.forEach(value => classes.add(value)), remove: (...values) => values.forEach(value => classes.delete(value)), contains: value => classes.has(value), toggle(value, force) { if (force ?? !classes.has(value)) classes.add(value); else classes.delete(value); } },
      listeners: {}, addEventListener(type, handler) { this.listeners[type] = handler; }, setAttribute() {}, append(child) { this.children.push(child); child.isConnected = true; },
      querySelector(selector) { if (selector === 'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])') return this.children.find(child => child.focus) || null; return element(selector); },
      querySelectorAll(selector) { if (selector === 'span') return [element('dot'), element('dot'), element('dot')]; if (selector.includes('button')) return this.children.filter(child => child.focus); return []; },
      contains(target) { return target === this || this.children.includes(target); }, focus() { document.activeElement = this; },
    };
  }
  function character(name) { const selector = `.scene-character-${name}`; if (!elements.has(selector)) { const node = element(selector); node.dataset.character = name; elements.set(selector, node); } return elements.get(selector); }
  function modeButton(name) { const selector = `.mode-${name}`; if (!elements.has(selector)) { const node = element(selector); node.dataset.mode = name; elements.set(selector, node); } return elements.get(selector); }
  const drawingContext = new Proxy({ imageSmoothingEnabled: false, measureText: () => ({ width: 0 }) }, { get: (target, key) => target[key] || (() => {}), set: (target, key, value) => (target[key] = value, true) });
  const gameFrame = document.querySelector('.game-frame');
  Object.defineProperty(gameFrame, 'children', { get: () => Array.from(elements.entries()).filter(([key]) => key.startsWith('#') && (key.endsWith('-screen') || ['#game', '#game-tools', '#mobile-hud'].includes(key))).map(([, value]) => value) });
  const localStorage = { getItem: storage.getItem || (() => storage.value ?? null), setItem: storage.setItem || ((key, value) => { storage.value = value; }), removeItem: storage.removeItem || (() => { delete storage.value; }) };
  const window = { innerWidth: options.innerWidth ?? 450, innerHeight: options.innerHeight ?? 800, matchMedia: () => ({ matches: false }), addEventListener(type, handler) { windowListeners[type] = handler; }, close() {} };
  if (options.native) window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', Plugins: {} };
  const runtimeMath = Object.create(Math);
  runtimeMath.random = options.random ?? Math.random;
  const context = { console, globalThis: null, window, document, navigator: { userAgent: '' }, location: { protocol: 'file:' }, localStorage, Image: class { set src(value) { this._src = value; } }, SEVA_CONFIG: config, SEVA_RULES: rules, requestAnimationFrame() {}, setTimeout: () => 1, clearTimeout() {}, clearInterval() {}, queueMicrotask, Math: runtimeMath, Date, Number, Object, Array, Set, JSON };
  context.globalThis = context; window.window = window; window.document = document;
  const instrumentedSource = gameSource.replace('  window.sevaJumpNativeBack = handleNativeBack;', `  ${runtimeHookSource}\n  window.sevaJumpNativeBack = handleNativeBack;`);
  assert.notEqual(instrumentedSource, gameSource, 'runtime test hook injection point must exist');
  vm.runInNewContext(instrumentedSource, context, { filename: 'game.js' });
  return { hooks: context.__SEVA_RUNTIME_HOOKS__, elements, document, documentListeners, windowListeners, storage };
}

async function run() {
  const denied = makeRuntime({ getItem() { throw new DOMException('denied', 'SecurityError'); }, setItem() { throw new DOMException('denied', 'SecurityError'); }, removeItem() { throw new DOMException('denied', 'SecurityError'); } });
  await Promise.resolve();
  assert.equal(denied.hooks.profile.character, 'girl');
  assert.doesNotThrow(() => denied.hooks.saveProfile());
  assert.match(denied.elements.get('#storage-warning').textContent, /keep playing for this session/);
  let denyQuotaWrite = true;
  const quotaStorage = { value: JSON.stringify({ tokens: 7 }), setItem(key, value) { if (denyQuotaWrite) throw new DOMException('full', 'QuotaExceededError'); quotaStorage.value = value; } };
  const quota = makeRuntime(quotaStorage);
  assert.equal(quota.hooks.saveProfile(), false);
  assert.match(quota.elements.get('#storage-warning').textContent, /can’t be saved/);
  quota.hooks.resetAllProgress();
  assert.equal(quotaStorage.value, undefined, 'reset should still remove an old save after a write failure');
  assert.equal(quota.elements.get('#storage-warning').classList.contains('hidden'), true, 'successful reset deletion should clear the storage warning');
  denyQuotaWrite = false;
  assert.equal(quota.hooks.saveProfile(), true, 'successful reset deletion should restore saving');
  assert.match(quotaStorage.value, /"character":"girl"/);
  denyQuotaWrite = true;
  assert.equal(quota.hooks.saveProfile(), false, 'a later denied write should disable saving again');
  assert.equal(quota.elements.get('#storage-warning').classList.contains('hidden'), false, 'a later denied write should show the warning again');
  const deniedRemoval = makeRuntime({ getItem: () => null, removeItem() { throw new DOMException('denied', 'SecurityError'); } });
  assert.doesNotThrow(() => deniedRemoval.hooks.resetAllProgress());
  assert.match(deniedRemoval.elements.get('#storage-warning').textContent, /could not be erased/);

  const malformed = makeRuntime({ value: '{bad json' });
  await Promise.resolve();
  assert.equal(malformed.hooks.profile.tokens, 0);
  assert.equal(malformed.elements.get('#storage-warning')?.textContent ?? '', '', 'corrupt JSON should recover without claiming storage is unavailable');
  const invalid = makeRuntime({ value: JSON.stringify({ tokens: -5, falcon: '3.9', powerJump: 99, character: 'robot', music: 'yes', bestScores: { endless: Infinity }, stats: { runs: -2 }, badges: [] }) });
  assert.deepEqual([invalid.hooks.profile.tokens, invalid.hooks.profile.falcon, invalid.hooks.profile.powerJump, invalid.hooks.profile.character, invalid.hooks.profile.music], [0, 3, 5, 'girl', true]);

  const runtime = makeRuntime({ value: JSON.stringify({ character: 'boy', tutorialComplete: true }) });
  runtime.hooks.resetAllProgress();
  assert.equal(runtime.hooks.profile.character, 'girl');
  assert.equal(runtime.elements.get('.scene-character-girl').classList.contains('selected'), true);
  assert.equal(runtime.elements.get('.scene-character-boy').classList.contains('selected'), false);

  const canvas = runtime.elements.get('#game');
  canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 768, height: 1024 });
  assert.equal(Math.round(runtime.hooks.canvasPointerX({ clientX: 96 })), 0);
  assert.equal(Math.round(runtime.hooks.canvasPointerX({ clientX: 240 })), 113);
  assert.equal(Math.round(runtime.hooks.canvasPointerX({ clientX: 672 })), 450);

  runtime.hooks.state.running = true; runtime.hooks.state.paused = false;
  const pauseScreen = runtime.elements.get('#pause-screen'), settingsScreen = runtime.elements.get('#settings-screen');
  const resumeButton = runtime.elements.get('#resume-button'), pauseSettingsButton = runtime.elements.get('#pause-settings-button');
  const musicToggle = runtime.elements.get('#music-toggle'), closeSettingsButton = runtime.elements.get('#close-settings-button');
  pauseScreen.children.push(resumeButton, pauseSettingsButton); settingsScreen.children.push(musicToggle, closeSettingsButton);
  runtime.hooks.pauseGame(); await Promise.resolve();
  assert.equal(runtime.document.activeElement, runtime.elements.get('#pause-screen'), 'new dialog receives initial focus without scrolling to a lower button');
  assert.equal(canvas.inert, true, 'background canvas should be inert while paused');
  runtime.hooks.openSettings('pause'); await Promise.resolve();
  runtime.documentListeners.keydown({ key: 'Escape', preventDefault() {} });
  assert.equal(runtime.hooks.state.paused, true, 'Escape must not resume behind Settings');
  closeSettingsButton.focus();
  let tabPrevented = false;
  runtime.documentListeners.keydown({ key: 'Tab', preventDefault() { tabPrevented = true; } });
  assert.equal(runtime.document.activeElement, musicToggle, 'Tab should wrap within the modal');
  assert.equal(tabPrevented, true);
  runtime.hooks.closeSettings(); await Promise.resolve();
  runtime.hooks.profile.music = false;
  runtime.hooks.resumeGame(); await Promise.resolve();
  assert.equal(runtime.document.activeElement, canvas, 'resuming gameplay should focus the canvas');
  runtime.hooks.pauseGame(); runtime.hooks.openSettings('pause');
  runtime.hooks.keys.add('ArrowRight'); runtime.windowListeners.blur();
  assert.equal(runtime.hooks.keys.size, 0);
  canvas.listeners.pointerdown({ clientX: 384, pointerId: 1 }); canvas.listeners.pointercancel();
  assert.equal(runtime.hooks.pointerX, null);

  console.log('Runtime browser checks passed.');
}

module.exports = { makeRuntime };
if (require.main === module) run().catch(error => { console.error(error); process.exitCode = 1; });
