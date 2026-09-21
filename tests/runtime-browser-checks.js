const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const gameSource = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
const runtimeHookSource = `globalThis.__SEVA_RUNTIME_HOOKS__ = {
  normalizeProfile, saveProfile, removeSavedProfile, resetAllProgress, canvasPointerX,
  start, reset, addPlatform, update, draw, loop, updateMobileHud, finish, triggerBirdHit, resolveBirdHit, triggerFalconSave, updateFalconRescue,
  showHome, showUpgrades, showAbout, showBadges, showStats, getAudio, noise, pollGamepad, setMusic,
  observeSounds(observer) { const playSound = sound; sound = type => { observer(type); playSound(type); }; },
  pauseGame, resumeGame, openSettings, closeSettings, requestResetProgress, cancelResetProgress,
  setLastTime(value) { lastTime = value; },
  get profile() { return profile; }, get state() { return state; }, get pointerX() { return pointerX; }, get keys() { return keys; },
};`;
const config = require('../game-config.js');
const rules = require('../game-rules.js');

function makeRuntime(storage = {}, options = {}) {
  const elements = new Map(), documentListeners = {}, windowListeners = {}, images = [], timeouts = new Map();
  let timerId = 0;
  const document = {
    activeElement: null, hidden: false, documentElement: element('html'),
    querySelector(selector) {
      if (!elements.has(selector)) {
        const node = element(selector);
        if (selector === '#home-screen') node.classList.remove('hidden');
        else if (selector.endsWith('-screen')) node.classList.add('hidden');
        if (selector === '#game') Object.assign(node, { width: 450, height: 800, clientWidth: 768, clientHeight: 1024, getContext: () => options.noCanvas ? null : drawingContext, getBoundingClientRect: () => ({ left: 0, top: 0, width: 768, height: 1024 }), setPointerCapture() {} });
        elements.set(selector, node);
      }
      return elements.get(selector);
    },
    querySelectorAll(selector) {
      if (selector === '.scene-character') return [character('girl'), character('boy')];
      if (selector === '.mode-actions button') return ['endless', 'arcade', 'challenge', 'hard'].map(modeButton);
      return [];
    },
    createElement(tag) { const node = element(tag); if (tag === 'canvas') node.getContext = () => drawingContext; return node; },
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
  const drawingContext = new Proxy({ imageSmoothingEnabled: false, measureText: () => ({ width: 0 }), ...options.drawingContext }, { get: (target, key) => target[key] || (() => {}), set: (target, key, value) => (target[key] = value, true) });
  const gameFrame = document.querySelector('.game-frame');
  Object.defineProperty(gameFrame, 'children', { get: () => Array.from(elements.entries()).filter(([key]) => key.startsWith('#') && (key.endsWith('-screen') || ['#game', '#game-tools', '#mobile-hud'].includes(key))).map(([, value]) => value) });
  const localStorage = { getItem: storage.getItem || (() => storage.value ?? null), setItem: storage.setItem || ((key, value) => { storage.value = value; }), removeItem: storage.removeItem || (() => { delete storage.value; }) };
  const window = { innerWidth: options.innerWidth ?? 450, innerHeight: options.innerHeight ?? 800, matchMedia: () => ({ matches: false }), addEventListener(type, handler) { windowListeners[type] = handler; }, close() {} };
  if (options.native) window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', Plugins: {} };
  if (options.AudioContext) window.AudioContext = options.AudioContext;
  const runtimeMath = Object.create(Math);
  runtimeMath.random = options.random ?? Math.random;
  class RuntimeImage {
    constructor() { this.listeners = {}; images.push(this); }
    set src(value) { this._src = value; }
    addEventListener(type, handler) { (this.listeners[type] ??= []).push(handler); }
    load() { this.complete = true; this.naturalWidth = 96; this.naturalHeight = 96; this.onload?.(); for (const handler of this.listeners.load || []) handler(); }
  }
  const context = { console, globalThis: null, window, document, navigator: { userAgent: '', getGamepads: options.getGamepads }, location: { protocol: 'file:' }, localStorage, Image: RuntimeImage, SEVA_CONFIG: config, SEVA_RULES: rules, requestAnimationFrame() {}, setTimeout(callback) { timeouts.set(++timerId, callback); return timerId; }, clearTimeout(id) { timeouts.delete(id); }, queueMicrotask, Math: runtimeMath, Date, Number, Object, Array, Set, JSON };
  context.globalThis = context; window.window = window; window.document = document;
  const instrumentedSource = gameSource.replace('  window.sevaJumpNativeBack = handleNativeBack;', `  ${runtimeHookSource}\n  window.sevaJumpNativeBack = handleNativeBack;`);
  assert.notEqual(instrumentedSource, gameSource, 'runtime test hook injection point must exist');
  vm.runInNewContext(instrumentedSource, context, { filename: 'game.js' });
  return { hooks: context.__SEVA_RUNTIME_HOOKS__, elements, document, documentListeners, windowListeners, storage, images, timeouts };
}

async function run() {
  const noCanvas = makeRuntime({}, { noCanvas: true });
  assert.match(noCanvas.elements.get('#canvas-warning').textContent, /cannot draw the game/);
  assert.equal(noCanvas.elements.get('#canvas-warning').classList.contains('hidden'), false);
  for (const mode of ['endless', 'arcade', 'challenge', 'hard']) assert.equal(noCanvas.elements.get(`.mode-${mode}`).disabled, true);

  const saved = { value: JSON.stringify({ tutorialComplete: true, music: false, sound: false }) };
  const pad = { connected: true, mapping: 'standard', axes: [0], buttons: Array.from({ length: 16 }, () => ({ pressed: false })) };
  const controls = makeRuntime(saved, { getGamepads: () => [null, pad] });
  const key = (value, extra = {}) => controls.documentListeners.keydown({ key: value, preventDefault() {}, ...extra });
  key('Enter', { target: { closest: () => ({}) } });
  assert.equal(controls.hooks.state.running, false, 'focused Home buttons keep native activation');
  key('Enter'); assert.equal(controls.hooks.state.running, true);
  key('A'); assert.equal(controls.hooks.keys.has('ArrowLeft'), true);
  controls.documentListeners.keyup({ key: 'a' }); assert.equal(controls.hooks.keys.size, 0);
  key('d'); assert.equal(controls.hooks.keys.has('ArrowRight'), true);
  controls.documentListeners.keyup({ key: 'D' }); assert.equal(controls.hooks.keys.size, 0);
  controls.hooks.showHome(); key(' '); assert.equal(controls.hooks.state.running, true);
  controls.hooks.showHome();
  pad.buttons[0].pressed = true; controls.hooks.pollGamepad();
  assert.equal(controls.hooks.state.running, true, 'A starts from Home');
  const started = controls.hooks.state; controls.hooks.pollGamepad(); assert.equal(controls.hooks.state, started, 'held A does not restart');
  pad.buttons[0].pressed = false; pad.axes[0] = .1; controls.hooks.pollGamepad();
  started.player.vx = 0; controls.hooks.update(.01); assert.equal(started.player.vx, 0, 'stick deadzone prevents drift');
  pad.axes[0] = 1; controls.hooks.pollGamepad(); controls.hooks.update(.01); assert.ok(started.player.vx > 0);
  pad.buttons[14].pressed = true; controls.hooks.pollGamepad(); started.player.vx = 0; controls.hooks.update(.01); assert.ok(started.player.vx < 0, 'D-pad overrides stick');
  pad.connected = false; controls.hooks.pollGamepad(); started.player.vx = 0; controls.hooks.update(.01); assert.equal(started.player.vx, 0, 'disconnect clears steering');
  pad.connected = true; pad.buttons[14].pressed = false; pad.axes[0] = 0;
  for (const button of [1, 9]) {
    pad.buttons[button].pressed = true; controls.hooks.pollGamepad(); assert.equal(started.paused, true);
    controls.hooks.pollGamepad(); assert.equal(started.paused, true, 'held pause cannot toggle');
    pad.buttons[button].pressed = false; controls.hooks.pollGamepad();
    controls.hooks.openSettings('pause'); pad.buttons[0].pressed = true; controls.hooks.pollGamepad();
    assert.equal(started.paused, true, 'A cannot resume behind Settings');
    pad.buttons[0].pressed = false; controls.hooks.pollGamepad(); controls.hooks.closeSettings();
    pad.buttons[0].pressed = true; controls.hooks.pollGamepad(); assert.equal(started.paused, false);
    pad.buttons[0].pressed = false; controls.hooks.pollGamepad();
  }
  controls.windowListeners.blur(); pad.buttons[0].pressed = true; controls.hooks.pollGamepad(); assert.equal(started.paused, true);
  controls.windowListeners.focus(); controls.hooks.pollGamepad(); assert.equal(started.paused, true, 'background A press cannot resume on focus');
  controls.hooks.profile.bestScores.challenge = 321; controls.hooks.showStats();
  assert.match(controls.elements.get('#stats-summary').innerHTML, /Best Challenge/);
  assert.match(controls.elements.get('#stats-summary').innerHTML, /321/);
  console.log('Polish controls checks passed: canvas fallback, A/D, Home activation, gamepad steering/deadzone/disconnect/pause/modal/focus, Challenge stats.');
  const deniedGamepad = makeRuntime(saved, { getGamepads() { throw new DOMException('Blocked by permissions policy', 'SecurityError'); } });
  deniedGamepad.hooks.start('endless');
  assert.doesNotThrow(() => deniedGamepad.hooks.loop(16), 'an embed denying gamepad access must still animate');
  // Prices in both UI labels and purchase deductions follow config changes.
  const savedCosts = [config.falconCost, config.shieldCost];
  try {
    config.falconCost = 17; config.shieldCost = 23;
    const shop = makeRuntime({ value: JSON.stringify({ tokens: 100, music: false, sound: false }) });
    assert.equal(shop.elements.get('#buy-falcon').textContent, 'Buy · 17');
    assert.equal(shop.elements.get('#buy-shield').textContent, 'Buy · 23');
    shop.elements.get('#buy-falcon').listeners.click();
    shop.elements.get('#buy-shield').listeners.click();
    assert.equal(shop.hooks.profile.tokens, 60);
    assert.equal(shop.hooks.profile.falcon, 1);
    assert.equal(shop.hooks.profile.shield, 1);
  } finally { [config.falconCost, config.shieldCost] = savedCosts; }
  let framesDrawn = 0;
  const drawnImages = [];
  const rendering = makeRuntime({ value: JSON.stringify({ tutorialComplete: true, music: false, sound: false }) }, { drawingContext: {
    clearRect() { framesDrawn++; }, drawImage(sprite) { drawnImages.push(sprite); },
  } });
  let frameTime = 1000;
  const frame = () => rendering.hooks.loop(frameTime += 16);
  const idle = () => { const count = framesDrawn; for (let i = 0; i < 30; i++) frame(); assert.equal(framesDrawn, count, 'idle menus must not redraw'); };
  frame(); assert.equal(framesDrawn, 1); idle();
  rendering.images.forEach(sprite => sprite.load());
  frame(); assert.equal(framesDrawn, 2, 'late image loads invalidate the idle frame'); idle();
  rendering.hooks.state.collectibles = [{ x: 100, y: 300, type: 'parshad' }, { x: 200, y: 300, type: 'token' }];
  drawnImages.length = 0; rendering.hooks.draw();
  const glows = drawnImages.filter(sprite => sprite.name === 'canvas');
  assert.deepEqual(glows.map(sprite => [sprite.width, sprite.height]), [[78, 62], [62, 62]], 'both collectible glows are baked at the intended size');
  drawnImages.length = 0; rendering.hooks.draw();
  assert.deepEqual(drawnImages.filter(sprite => sprite.name === 'canvas'), glows, 'drawing reuses the same cached glow canvases');
  for (const open of ['showHome', 'showUpgrades', 'showAbout', 'showBadges', 'showStats', 'openSettings']) {
    const count = framesDrawn;
    rendering.hooks[open]('home'); frame();
    assert.equal(framesDrawn, count + 1, `${open} requests one fresh menu frame`); idle();
  }
  rendering.hooks.start('endless');
  const playing = framesDrawn; frame(); frame();
  assert.equal(framesDrawn, playing + 2, 'gameplay draws every frame');
  rendering.hooks.pauseGame(); frame(); idle();
  rendering.hooks.openSettings('pause'); frame(); idle();
  rendering.hooks.closeSettings(); rendering.hooks.resumeGame();
  const resumed = framesDrawn; frame(); assert.equal(framesDrawn, resumed + 1);
  for (const completed of [false, true]) {
    rendering.hooks.start('arcade'); rendering.hooks.finish(completed, completed ? 'finish' : 'fall');
    const ending = framesDrawn; frame(); frame();
    assert.equal(framesDrawn, ending + 2, 'end-of-run animation keeps drawing');
    rendering.timeouts.get(rendering.hooks.state.resultTimer)();
    frame(); idle();
    rendering.hooks.showHome(); frame(); idle();
  }
  rendering.hooks.start('endless'); rendering.hooks.profile.falcon = 1;
  rendering.hooks.triggerFalconSave(); rendering.hooks.pauseGame(); rendering.hooks.showHome(); frame(); idle();
  assert.equal(rendering.hooks.state.falconRescue.elapsed, 0, 'an abandoned rescue must not animate behind Home');

  // Backdrop progression: one backdrop draw per frame, two only mid-fade, zones
  // at the height thresholds, frozen fades under pause, and Reduced Motion
  // switching instantly. The fallback still paints a sky; the old cloud ellipses
  // are gone for good (they read as flat white ovals over the painted skies).
  const calls = { images: [], ellipses: [], fills: [] }, alphaStack = [];
  const backdrop = makeRuntime({ value: JSON.stringify({ tutorialComplete: true, music: false, sound: false }) }, { drawingContext: {
    globalAlpha: 1, save() { alphaStack.push(this.globalAlpha); }, restore() { this.globalAlpha = alphaStack.pop() ?? 1; },
    drawImage(sprite) { calls.images.push([sprite, this.globalAlpha]); }, ellipse(x, y) { calls.ellipses.push([this.fillStyle, x, y]); }, fillRect(x, y, w, h) { calls.fills.push([this.fillStyle, x, y, w, h]); },
  } });
  backdrop.hooks.start('endless');
  const backdropFrame = () => { calls.images.length = 0; calls.ellipses.length = 0; calls.fills.length = 0; backdrop.hooks.draw(); return calls.images.filter(([sprite]) => /gurdwara/.test(sprite._src)); };
  const clouds = () => calls.ellipses.filter(([style]) => style === '#ffffffbb');
  const backdropSprites = ['courtyard', 'sunset', 'dawn'].map(name => backdrop.images.find(sprite => sprite._src.includes(name)));
  const expectedSprite = zone => backdropSprites[(backdrop.hooks.state.background + zone) % 3];
  // A resting player keeps the scene stable while active time advances.
  const climb = (height, dt = .1) => { const current = backdrop.hooks.state; current.heightScore = Math.max(current.heightScore, height); current.player.y = 650; current.player.vy = 0; backdrop.hooks.update(dt); };
  assert.deepEqual([backdrop.hooks.state.backdropZone, backdrop.hooks.state.backdropFade], [0, null], 'reset initialises the backdrop zone without a fade');
  assert.equal(backdropFrame().length, 0, 'unloaded images draw nothing');
  assert.ok(calls.fills.some(([style, x, y, w, h]) => ['#bce7ef', '#f8d9a7', '#c9e5c0'].includes(style) && x === 0 && y === 0 && w === 450 && h === 800), 'the fallback fills the whole background with a sky colour');
  assert.equal(clouds().length, 0, 'no cloud ellipses over the fallback sky');
  backdrop.images.forEach(sprite => sprite.load());
  const steady = backdropFrame(), steadyTotal = calls.images.length;
  assert.deepEqual(steady, [[expectedSprite(0), 1]], 'exactly one backdrop image outside a fade');
  assert.equal(clouds().length, 0, 'no cloud ellipses over the image backdrop');
  climb(config.backdropZones[1] - 1); assert.equal(backdrop.hooks.state.backdropZone, 0, 'the zone holds below its threshold');
  climb(config.backdropZones[1]); assert.equal(backdrop.hooks.state.backdropZone, 1, 'the zone changes at its threshold');
  const fading = backdropFrame();
  assert.equal(calls.images.length, steadyTotal + 1, 'a fade frame costs exactly one extra drawImage');
  assert.deepEqual(fading.map(([sprite]) => sprite), [expectedSprite(0), expectedSprite(1)], 'the fade layers the next image over the previous one');
  assert.ok(fading[0][1] === 1 && fading[1][1] > 0 && fading[1][1] < 1, 'only the incoming image is blended mid-fade');
  backdrop.hooks.pauseGame(); const frozen = backdrop.hooks.state.backdropFade.elapsed;
  for (let i = 0; i < 5; i++) backdrop.hooks.update(.1);
  assert.equal(backdrop.hooks.state.backdropFade.elapsed, frozen, 'a paused game freezes the fade');
  assert.equal(backdropFrame().length, 2, 'the paused frame keeps its half-faded sky');
  backdrop.hooks.resumeGame();
  for (let elapsed = 0; elapsed < config.backdropFadeMs; elapsed += 100) climb(0);
  assert.equal(backdrop.hooks.state.backdropFade, null, 'the fade ends after backdropFadeMs of active time');
  assert.deepEqual(backdropFrame(), [[expectedSprite(1), 1]], 'the new zone draws alone once faded in');
  assert.equal(calls.images.length, steadyTotal, 'drawImage count returns to the steady figure');
  backdrop.hooks.profile.reducedMotion = true;
  climb(config.backdropZones[2]); assert.equal(backdrop.hooks.state.backdropZone, 2);
  assert.equal(backdrop.hooks.state.backdropFade, null, 'Reduced Motion switches zones without a fade');
  assert.deepEqual(backdropFrame(), [[expectedSprite(2), 1]], 'Reduced Motion draws the new zone immediately');
  climb(0); assert.deepEqual(backdropFrame(), [[expectedSprite(2), 1]], 'no fade frames follow a Reduced Motion switch');
  console.log('Backdrop checks passed: zone thresholds, single-draw steady frames, one extra draw mid-fade, paused fades, Reduced Motion switch and pinned clouds, fallback sky.');

  let buffersCreated = 0;
  const sources = [];
  class AudioContext {
    constructor() { this.sampleRate = 48000; this.currentTime = 0; this.state = 'running'; this.destination = {}; }
    createBuffer(channels, frames, sampleRate) { buffersCreated++; return { channels, sampleRate, getChannelData: () => new Float32Array(frames) }; }
    createBufferSource() { const source = { connect: node => node, start() {}, stop() {} }; sources.push(source); return source; }
    createBiquadFilter() { return { frequency: {}, Q: {}, connect: node => node }; }
    createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect: node => node }; }
  }
  const audio = makeRuntime({}, { AudioContext });
  audio.hooks.getAudio();
  audio.hooks.noise(.045); audio.hooks.noise(.045, { frequency: 900 }); audio.hooks.noise(.12); audio.hooks.noise(.12);
  assert.equal(buffersCreated, 2, 'noise buffers are cached by duration');
  assert.equal(sources.length, 4, 'each sound still gets a fresh playable source');
  assert.equal(sources[0].buffer, sources[1].buffer);
  assert.equal(sources[2].buffer, sources[3].buffer);
  assert.notEqual(sources[0].buffer, sources[2].buffer);
  audio.elements.get('#sound-toggle').checked = false; audio.hooks.noise(.28);
  assert.equal(buffersCreated, 2, 'muted sounds do not allocate buffers');
  const notes = [];
  class MusicContext extends AudioContext {
    createOscillator() {
      const note = { frequency: {}, connect: node => node, start(time) { this.startTime = time; }, stop(time) { this.stopTime = time; } };
      notes.push(note); return note;
    }
  }
  const music = makeRuntime({ value: JSON.stringify({ tutorialComplete: true, music: true, sound: false }) }, { AudioContext: MusicContext });
  music.hooks.start('endless');
  const clock = music.hooks.getAudio();
  const tick = time => { clock.currentTime = time; const [id, callback] = [...music.timeouts].at(-1); music.timeouts.delete(id); callback(); };
  assert.equal(notes.length, 12);
  assert.equal(notes[0].startTime, config.musicStartDelaySeconds);
  tick(3.81); assert.equal(notes.length, 12, 'next phrase waits until lookahead reaches it');
  tick(3.97); assert.equal(notes.length, 24);
  assert.equal(notes[12].startTime, config.musicStartDelaySeconds + 8 * config.musicBeatSeconds, 'callback jitter does not shift the musical clock');
  tick(7.91); assert.equal(notes.length, 36);
  assert.equal(notes[24].startTime, config.musicStartDelaySeconds + 16 * config.musicBeatSeconds);
  tick(20); assert.equal(notes.length, 48, 'a long stall restarts one phrase rather than bursting missed phrases');
  assert.equal(notes[36].startTime, 20 + config.musicStartDelaySeconds);
  const beat = config.musicBeatSeconds, frequencies = list => list.map(note => note.frequency.value);
  const phraseAt = (from, index) => ({ voices: notes.slice(from + index * 12, from + index * 12 + 12), melody: frequencies(notes.slice(from + index * 12, from + index * 12 + 8)), bass: frequencies(notes.slice(from + index * 12 + 8, from + index * 12 + 12)) });
  tick(23.9); assert.equal(notes.length, 60);
  const phrases = [0, 1, 2, 3, 4].map(index => phraseAt(0, index));
  assert.deepEqual(phrases[0].melody, config.musicPhrases.endless.melody, 'a run opens with the phrase as written');
  assert.equal(new Set(phrases.slice(0, 4).map(phrase => String(phrase.melody))).size, 4, 'four consecutive phrases schedule different melodies');
  assert.deepEqual(phrases[4].melody, phrases[0].melody, 'the fifth phrase restarts the cycle');
  phrases.forEach((phrase, index) => {
    const start = phrase.voices[0].startTime;
    assert.equal(Math.min(...phrase.voices.map(note => note.startTime)), start, `phrase ${index} starts on its scheduled beat`);
    assert.ok(Math.abs(Math.max(...phrase.voices.map(note => note.stopTime)) - start - 8 * beat) < 1e-9, `phrase ${index} spans exactly 8 beats`);
    assert.deepEqual(phrase.bass, config.musicPhrases.endless.bass, `variant ${index} keeps the Endless bass`);
  });
  music.hooks.pauseGame(); assert.equal(music.timeouts.size, 0, 'pause clears scheduling');
  assert.ok(notes.every(note => note.stopTime === undefined), 'pause stops all scheduled voices immediately');
  music.hooks.resumeGame(); assert.equal(notes.length, 72);
  assert.deepEqual(phraseAt(60, 0).melody, phrases[0].melody, 'resuming reopens with the phrase as written');
  music.hooks.showHome(); assert.equal(music.timeouts.size, 0);
  const variantsOf = mode => {
    const from = notes.length, base = clock.currentTime;
    music.hooks.start(mode); [3.9, 7.9, 11.9].forEach(offset => tick(base + offset));
    assert.equal(notes.length, from + 48);
    return [0, 1, 2, 3].map(index => phraseAt(from, index));
  };
  for (const [mode, table] of [['arcade', 'arcade'], ['challenge', 'challenge'], ['hard', 'endless']]) {
    const variants = variantsOf(mode), source = config.musicPhrases[table];
    assert.deepEqual(variants[0].melody, source.melody, `${mode} opens with its own phrase`);
    assert.equal(new Set(variants.map(variant => String(variant.melody))).size, 4, `${mode} cycles four different melodies`);
    variants.forEach(variant => {
      assert.deepEqual(variant.bass, source.bass, `${mode} variants share the mode bass`);
      variant.melody.forEach(note => assert.ok(source.melody.some(root => [1, config.musicLiftRatio, 2].some(ratio => Math.abs(root * ratio - note) < 1e-9)), `${mode} variants stay on the mode's notes`));
    });
  }
  assert.equal(new Set(['endless', 'arcade', 'challenge'].map(mode => String(config.musicPhrases[mode].melody))).size, 3, 'modes keep distinct phrases');
  // The Classic style plays the phrase as written every time; the setting
  // round-trips through the profile and falls back to Varied.
  music.hooks.profile.musicStyle = 'classic';
  const classic = variantsOf('endless');
  classic.forEach((phrase, index) => assert.deepEqual(phrase.melody, config.musicPhrases.endless.melody, 'classic phrase ' + index + ' is the phrase as written'));
  music.hooks.profile.musicStyle = 'varied';
  assert.equal(music.hooks.normalizeProfile({ musicStyle: 'classic' }).musicStyle, 'classic');
  assert.equal(music.hooks.normalizeProfile({ musicStyle: 'jazz' }).musicStyle, 'varied', 'unknown styles fall back to Varied');
  music.elements.get('#music-style-select').value = 'classic'; music.elements.get('#music-style-select').listeners.change();
  assert.equal(music.hooks.profile.musicStyle, 'classic', 'the selector saves the style');
  // Info buttons reveal their note without flipping the checkbox they sit in.
  const infoButton = music.elements.get('#helping-hand-info'), note = music.elements.get('#helping-hand-note'), toggle = music.elements.get('#helping-hand-toggle');
  note.classList.add('hidden'); const checked = toggle.checked; let prevented = false;
  infoButton.listeners.click({ preventDefault() { prevented = true; }, stopPropagation() {} });
  assert.equal(note.classList.contains('hidden'), false, 'the note opens');
  assert.equal(prevented, true, 'the label click is cancelled');
  assert.equal(toggle.checked, checked);
  infoButton.listeners.click({ preventDefault() {}, stopPropagation() {} });
  assert.equal(note.classList.contains('hidden'), true, 'the note closes again');
  music.hooks.showHome(); assert.equal(music.timeouts.size, 0);
  console.log('Music timing checks passed: audio-clock lookahead, callback jitter, long stalls, four-phrase variant cycle, pause/resume and Home cleanup.');
  console.log('Rendering/audio checks passed: idle menus, image-load repaint, cached glows, paused scenes, end screens, and noise-buffer reuse.');

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
