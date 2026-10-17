const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { makeRuntime } = require('./runtime-browser-checks.js');

const root = path.resolve(__dirname, '..');
const catalogs = {};
for (const locale of ['en', 'hi', 'pa-Guru']) {
  const scope = { SevaJumpCatalogs: catalogs }; scope.globalThis = scope;
  vm.runInNewContext(fs.readFileSync(path.join(root, 'locales', `runtime-${locale}.js`), 'utf8'), scope);
}
const keys = Object.keys(catalogs.en).sort();
for (const locale of ['hi', 'pa-Guru']) {
  assert.deepEqual(Object.keys(catalogs[locale]).sort(), keys);
  for (const key of keys) {
    const placeholders = text => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
    assert.deepEqual(placeholders(catalogs[locale][key]), placeholders(catalogs.en[key]), `${locale}: ${key}`);
    assert.notEqual(catalogs[locale][key], catalogs.en[key], `${locale}: untranslated ${key}`);
  }
}

for (const locale of ['en', 'hi', 'pa-Guru']) for (const mode of ['endless', 'arcade', 'challenge', 'hard']) {
  const writes = [];
  const saved = JSON.stringify({ tokens: 17, tutorialComplete: true, music: false, sound: false, bestScores: { arcade: 999 } });
  const data = new Map([['seva-jump-profile', saved]]);
  const painted = [];
  const runtime = makeRuntime({
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => { writes.push(key); data.set(key, value); },
    removeItem: key => data.delete(key),
  }, { drawingContext: { measureText: text => ({ width: [...String(text)].length * 8 }), fillText: (text, x, y) => painted.push({ text, x, y }) } });
  const { hooks, i18n } = runtime;
  i18n.setLanguage(locale);
  hooks.start(mode);
  hooks.pauseGame();
  const state = hooks.state, profile = JSON.stringify(hooks.profile), platform = state.platforms[0];
  const timer = state.messageTimer, playerY = state.player.y;
  const beforeWrites = writes.filter(key => key === 'seva-jump-profile').length;
  i18n.setLanguage('en'); i18n.setLanguage(locale);
  assert.equal(hooks.state, state, 'language changes preserve run identity');
  assert.equal(state.paused, true);
  assert.equal(state.platforms[0], platform);
  assert.equal(state.player.y, playerY);
  assert.equal(state.messageTimer, timer);
  assert.equal(state.messageId, `game.message.start.${mode}`);
  assert.equal(state.message, i18n.t(state.messageId, state.messageParams));
  assert.equal(JSON.stringify(hooks.profile), profile, 'language changes do not rewrite progress');
  assert.equal(writes.filter(key => key === 'seva-jump-profile').length, beforeWrites);
  assert.equal(hooks.profile.bestScores.arcade, 999, 'old saves remain readable');
  assert.ok(runtime.elements.get('#badge-grid').innerHTML.includes(i18n.t('game.badge.first-run.title')));
  assert.ok(runtime.elements.get('#stats-summary').innerHTML.includes(i18n.t('game.stat.runs')));

  // Every warning/effect message is repaintable after a locale change. Stable IDs
  // determine warning placement even if the translated display string changes.
  for (const id of keys.filter(key => key.startsWith('game.message.'))) {
    state.messageId = id; state.messageParams = { target: 50 }; state.messageTimer = 2;
    i18n.setLanguage(locale); painted.length = 0; hooks.draw();
    assert.equal(state.message, i18n.t(id, { target: 50 }));
    assert.ok(painted.some(item => item.text === state.message || state.message.startsWith(item.text)), id);
  }
  state.messageId = 'game.message.missedBowl'; state.messageParams = { target: 50 };
  i18n.setLanguage(locale); painted.length = 0; hooks.draw();
  const messageLines = painted.filter(item => item.y >= 180 && item.y < 230);
  assert.ok(messageLines.length > 0, 'missed-bowl warning uses its ID for placement');
  assert.ok(messageLines.every(item => [...item.text].length * 8 <= 418), 'long warnings wrap inside the canvas');
  state.stuckBanner = true; painted.length = 0; hooks.draw();
  assert.ok(painted.some(item => i18n.t('game.stuck.title').startsWith(item.text)), 'persistent stuck banner is translated');
}

const failedStorage = makeRuntime({ getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } });
failedStorage.i18n.setLanguage('hi');
assert.equal(failedStorage.i18n.locale, 'hi', 'language switching still works with blocked storage');
assert.equal(failedStorage.elements.get('#storage-warning').textContent, catalogs.hi['game.storage.unavailable']);
failedStorage.hooks.start('endless');
assert.equal(failedStorage.hooks.state.running, true);

// Reset covers the separately stored language setting as well as progress.
const resetStorage = { language: 'pa-Guru', value: JSON.stringify({ tokens: 23, tutorialComplete: true }) };
const resetRuntime = makeRuntime(resetStorage);
assert.equal(resetRuntime.i18n.choice, 'pa-Guru');
resetRuntime.hooks.resetAllProgress();
assert.equal(resetRuntime.i18n.choice, 'device');
assert.equal(resetRuntime.i18n.locale, 'en', 'unsupported or missing device locale falls back to English after reset');
assert.equal(resetRuntime.hooks.profile.tokens, 0);
assert.equal(resetStorage.language, undefined, 'reset removes the persisted language override');
assert.equal(resetStorage.value, undefined, 'reset removes persisted progress without writing it back during the language refresh');

for (const failedKey of ['sevaJump.language', 'all']) {
  const savedKeys = new Map([['sevaJump.language', 'hi'], ['seva-jump-profile', JSON.stringify({ tokens: 23 })]]);
  const blockedReset = makeRuntime({
    getItem: key => savedKeys.get(key) ?? null,
    setItem: (key, value) => savedKeys.set(key, value),
    removeItem: key => { if (failedKey === 'all' || key === failedKey) throw Error('blocked removal'); savedKeys.delete(key); },
  });
  // Supply the language status surface to the lightweight runtime DOM mock.
  const status = blockedReset.document.querySelector('#language-reset-status');
  const queryAll = blockedReset.document.querySelectorAll.bind(blockedReset.document);
  blockedReset.document.querySelectorAll = selector => selector === '[data-language-status]' ? [status] : queryAll(selector);
  blockedReset.hooks.resetAllProgress();
  assert.equal(blockedReset.i18n.choice, 'device', 'failed persistence still resets language for this session');
  assert.equal(blockedReset.hooks.profile.tokens, 0);
  assert.equal(savedKeys.get('sevaJump.language'), 'hi', 'the original stored override remains when removal is blocked');
  assert.equal(status.hidden, false, 'a failed language reset is not presented as saved');
  assert.equal(status.textContent, blockedReset.i18n.t('ui.languageSaveWarning'));
  if (failedKey === 'all') {
    assert.equal(blockedReset.elements.get('#storage-warning').textContent, catalogs.en['game.storage.eraseFailed']);
    assert.equal(blockedReset.elements.get('#storage-warning').classList.contains('hidden'), false);
  }
}
console.log(`Localization runtime checks passed (${keys.length} entries; three languages; four modes).`);
