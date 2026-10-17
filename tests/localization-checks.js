const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const locales = ['en', 'hi', 'pa-Guru'];
function makeI18n({ languages = ['en-US'], saved, fail = false } = {}) {
  const storage = new Map(saved ? [['sevaJump.language', saved]] : []), events = {};
  const context = vm.createContext({
    navigator: { languages },
    document: { documentElement: { style: { setProperty() {} } }, querySelectorAll: () => [] },
    window: { addEventListener: (name, fn) => { events[name] = fn; } },
    localStorage: { getItem: key => { if (fail) throw Error('denied'); return storage.get(key); }, setItem: (key, value) => { if (fail) throw Error('denied'); storage.set(key, value); }, removeItem: key => { if (fail) throw Error('denied'); storage.delete(key); } },
  });
  for (const group of ['ui', 'runtime']) for (const locale of locales) vm.runInContext(fs.readFileSync(path.join(root, `locales/${group}-${locale}.js`), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(root, 'i18n.js'), 'utf8'), context);
  return { api: context.SevaI18n, catalogs: context.SevaJumpCatalogs, storage, context, events };
}
const { catalogs } = makeI18n();
const keys = Object.keys(catalogs.en).sort();
const placeholders = value => [...value.matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)].map(match => match[1]).sort();
for (const locale of locales) {
  assert.deepEqual(Object.keys(catalogs[locale]).sort(), keys, `${locale} key parity`);
  for (const key of keys) {
    assert.equal(typeof catalogs[locale][key], 'string', `${locale}/${key} string`);
    assert(catalogs[locale][key].trim(), `${locale}/${key} nonempty`);
    assert.deepEqual(placeholders(catalogs[locale][key]), placeholders(catalogs.en[key]), `${locale}/${key} placeholders`);
    assert(!catalogs[locale][key].includes('\uFFFD'), `${locale}/${key} encoding`);
    assert(!/[\u0660-\u0669\u0966-\u096F\u0A66-\u0A6F]/.test(catalogs[locale][key]), `${locale}/${key} familiar digits`);
    if (locale !== 'en') assert.notEqual(catalogs[locale][key], catalogs.en[key], `${locale}/${key} untranslated source`);
  }
}
for (const [languages, expected] of [
  [['hi-IN'], 'hi'], [['pa'], 'pa-Guru'], [['pa-IN'], 'pa-Guru'], [['pa-Guru'], 'pa-Guru'],
  [['pa-Arab'], 'en'], [['pa-PK'], 'en'], [['pa-Arab-IN'], 'en'], [['pa-Guru-PK'], 'en'],
  [['pa-PK', 'pa', 'en'], 'en'], [['pa-Arab', 'pa'], 'en'], [['pa-PK', 'pa', 'hi'], 'hi'],
  [['fr-FR', 'hi'], 'hi'], [['en-GB', 'hi'], 'en'], [['fr'], 'en'], [[], 'en'],
]) assert.equal(makeI18n({ languages }).api.locale, expected, languages.join(','));
for (const saved of ['en', 'hi', 'pa-Guru']) assert.equal(makeI18n({ saved, languages: ['fr'] }).api.locale, saved);
assert.equal(makeI18n({ saved: 'garbage', languages: ['hi'] }).api.locale, 'hi');
const chosen = makeI18n({ languages: ['hi'] });
let changes = 0;
chosen.api.onChange(() => changes++);
assert(chosen.api.setLanguage('pa-Guru'));
assert.equal(chosen.storage.get('sevaJump.language'), 'pa-Guru');
assert.equal(chosen.context.document.documentElement.lang, 'pa-Guru');
assert(chosen.api.fontFamily.includes('Gurmukhi'));
assert(!chosen.api.setLanguage('pa-Arab'));
assert.equal(changes, 1);
chosen.api.setLanguage('device');
assert.equal(chosen.api.locale, 'hi');
assert(!chosen.storage.has('sevaJump.language'));
chosen.context.navigator.languages = ['pa-IN']; chosen.events.languagechange();
assert.equal(chosen.api.locale, 'pa-Guru');
chosen.events.storage({ key: 'sevaJump.language', newValue: 'hi' });
assert.equal(chosen.api.locale, 'hi');
const denied = makeI18n({ fail: true });
assert(denied.api.setLanguage('hi'));
assert.equal(denied.api.locale, 'hi', 'storage denial keeps the session usable');
const html = ['index.html', 'privacy.html'].map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
for (const [, key] of html.matchAll(/data-i18n(?:-aria-label|-title|-alt)?="([^"]+)"/g)) assert(keys.includes(key), `HTML reference ${key}`);
const game = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
for (const [, key, following] of game.matchAll(/\bt\(['"]([^'"]+)['"]\s*(.)/g)) assert(keys.includes(key) || (following === '+' && keys.some(candidate => candidate.startsWith(key))), `runtime reference ${key}`);
assert(!/state\.message\s*={2,3}\s*['"]/.test(game), 'display messages must not control gameplay');
assert(game.includes('select:not([disabled])'), 'focus trap includes selects');
const sourceWords = keys.reduce((count, key) => count + (catalogs.en[key].match(/\S+/g) || []).length, 0);
console.log(`Localization checks passed: ${keys.length} entries, ${sourceWords} source words (whitespace tokens, placeholders included) per language.`);
module.exports = { makeI18n };
