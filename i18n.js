/* Bundled scripts keep local-file and native launches independent of fetch. */
(() => {
  'use strict';
  const catalogs = globalThis.SevaJumpCatalogs || {};
  const supported = ['en', 'hi', 'pa-Guru'];
  const storageKey = 'sevaJump.language';
  const listeners = new Set();
  let choice = 'device', locale = 'en', saveFailed = false, fontRequest = 0;

  function detectLanguage(languages) {
    let excludedPunjabi = false;
    for (const value of languages || []) {
      const tag = String(value).replace(/_/g, '-').toLowerCase();
      if (/^hi(?:-|$)/.test(tag)) return 'hi';
      // An explicit Arabic script or Pakistan region must never select Gurmukhi.
      if (/^pa(?:-|$)/.test(tag)) {
        if (/(?:^|-)(?:arab|pk)(?:-|$)/.test(tag)) excludedPunjabi = true;
        else if ((tag === 'pa' && !excludedPunjabi) || /^pa-(?:guru|in)(?:-|$)/.test(tag)) return 'pa-Guru';
      }
      if (/^en(?:-|$)/.test(tag)) return 'en';
    }
    return 'en';
  }
  function deviceLocale() { return detectLanguage(navigator.languages?.length ? navigator.languages : [navigator.language]); }
  function t(key, params = {}) {
    const template = catalogs[locale]?.[key] ?? catalogs.en?.[key] ?? key;
    return String(template).replace(/\{([A-Za-z][A-Za-z0-9_]*)\}/g, (match, name) => Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match);
  }
  function fontFamily() {
    return locale === 'hi' ? '"Noto Sans Devanagari", "Trebuchet MS", sans-serif' : locale === 'pa-Guru' ? '"Noto Sans Gurmukhi", "Trebuchet MS", sans-serif' : '"Trebuchet MS", system-ui, sans-serif';
  }
  function applyTranslations(root = document) {
    for (const attribute of ['text', 'aria-label', 'title', 'alt']) {
      const marker = attribute === 'text' ? 'data-i18n' : `data-i18n-${attribute}`;
      for (const node of root.querySelectorAll(`[${marker}]`)) {
        const value = t(node.getAttribute(marker));
        if (attribute === 'text') node.textContent = value;
        else node.setAttribute(attribute, value);
      }
    }
    for (const select of root.querySelectorAll('[data-language-select]')) select.value = choice;
    for (const status of root.querySelectorAll('[data-language-status]')) {
      status.textContent = saveFailed ? t('ui.languageSaveWarning') : '';
      status.hidden = !saveFailed;
    }
  }
  function notify() { for (const listener of listeners) listener(locale); }
  function refresh() {
    locale = choice === 'device' ? deviceLocale() : choice;
    document.documentElement.lang = locale;
    document.documentElement.style.setProperty('--game-font', fontFamily());
    applyTranslations();
    notify();
    // Repaint cached menu canvases once local fonts have actually loaded.
    const request = ++fontRequest;
    if (document.fonts?.load) {
      const sample = locale === 'hi' ? 'हिन्दी' : locale === 'pa-Guru' ? 'ਪੰਜਾਬੀ' : 'Seva Jump';
      document.fonts.load(`700 20px ${fontFamily()}`, sample).then(() => { if (request === fontRequest) notify(); }).catch(() => {});
    }
  }
  function setLanguage(value) {
    if (value !== 'device' && !supported.includes(value)) return false;
    choice = value;
    try {
      if (choice === 'device') localStorage.removeItem(storageKey);
      else localStorage.setItem(storageKey, choice);
      saveFailed = false;
    } catch { saveFailed = true; }
    refresh();
    return true;
  }
  try { const saved = localStorage.getItem(storageKey); if (supported.includes(saved)) choice = saved; } catch { /* Play remains available without storage. */ }
  globalThis.SevaI18n = {
    t, detectLanguage, setLanguage, applyTranslations,
    get locale() { return locale; }, get choice() { return choice; }, get fontFamily() { return fontFamily(); },
    onChange(listener) { listeners.add(listener); return () => listeners.delete(listener); },
  };
  for (const select of document.querySelectorAll('[data-language-select]')) {
    select.addEventListener('change', () => setLanguage(select.value));
    const status = document.createElement('small');
    status.setAttribute('data-language-status', '');
    status.setAttribute('role', 'status');
    status.hidden = true;
    select.parentNode.append(status);
  }
  window.addEventListener('languagechange', () => { if (choice === 'device') refresh(); });
  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    choice = supported.includes(event.newValue) ? event.newValue : 'device';
    saveFailed = false;
    refresh();
  });
  refresh();
})();
