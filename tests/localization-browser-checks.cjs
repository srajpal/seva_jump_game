// Optional real-browser checks. Inspection hooks exist only in the HTTP response.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(process.env.TEST_WEB_ROOT || path.join(__dirname, '..'));
const output = path.resolve(__dirname, '../screenshots/localization');
fs.mkdirSync(output, { recursive: true });
const server = http.createServer((req, res) => {
  const relative = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
  const file = path.resolve(root, relative);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (error, buffer) => {
    if (error) { res.writeHead(404); return res.end(); }
    if (relative === 'game.js') buffer = buffer.toString().replace(/\}\)\(\);\s*$/, 'window.__qa={get state(){return state},get profile(){return profile},draw,finish};})();');
    res.setHeader('Content-Type', ({ '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css', '.ttf': 'font/ttf' })[path.extname(file)] || 'application/octet-stream');
    res.end(buffer);
  });
});
async function noClipping(page, screen) {
  const issues = await page.locator(screen).evaluate(node => [...node.querySelectorAll('[data-i18n],button,select')].flatMap(element => {
    if (!element.getClientRects().length || element.closest('.hidden') || element.tagName === 'OPTION') return [];
    const style = getComputedStyle(element), box = element.getBoundingClientRect();
    if (!box.width || !box.height) return [];
    return element.scrollWidth > element.clientWidth + 3 && style.display !== 'inline' && element.tagName !== 'SELECT' ? [`${element.id || element.dataset.i18n}: ${element.scrollWidth}/${element.clientWidth}`] : [];
  }));
  assert.deepEqual(issues, [], `${screen}: horizontal clipping`);
}
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
  try {
    for (const locale of ['hi', 'pa-Guru']) for (const [name, width, height, native] of [
      ['small-phone', 320, 568, false], ['phone', 393, 808, false], ['tablet', 800, 1280, false], ['native-tablet', 900, 1600, true],
    ]) {
      const context = await browser.newContext({ locale, viewport: { width, height }, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
      const page = await context.newPage(), errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(({ native }) => {
        if (native) window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', Plugins: {} };
        localStorage.setItem('seva-jump-profile', JSON.stringify({ tutorialComplete: true, tokens: 17, bestScores: { arcade: 999 }, sound: false, music: false }));
      }, { native });
      await page.goto(origin + '/index.html');
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.evaluate(() => SevaI18n.locale), locale);
      assert(await page.evaluate(() => document.fonts.check(`700 20px ${SevaI18n.fontFamily}`, SevaI18n.locale === 'hi' ? 'हिन्दी' : 'ਪੰਜਾਬੀ')));
      await noClipping(page, '#home-screen');
      await page.screenshot({ path: path.join(output, `${locale}-${name}-home.png`) });
      await page.locator('#home-language-select').selectOption('en');
      await page.locator('#home-language-select').focus(); await page.keyboard.press('Enter');
      assert(await page.locator('#home-screen').isVisible(), 'Enter on language select must not start a run');
      await page.locator('#home-language-select').selectOption(locale);
      for (const [open, screen, close] of [
        ['#open-about-button', '#about-screen', '#close-about-button'], ['#open-badges-button', '#badges-screen', '#close-badges-button'],
        ['#open-stats-button', '#stats-screen', '#close-stats-button'], ['#open-upgrades-button', '#upgrades-screen', '#close-upgrades-button'],
      ]) {
        await page.locator(open).click(); await noClipping(page, screen);
        await page.screenshot({ path: path.join(output, `${locale}-${name}-${screen.slice(1)}.png`) });
        await page.locator(close).click();
      }
      for (const mode of ['endless', 'arcade', 'challenge', 'hard']) {
        await page.locator(`#${mode}-button`).click();
        await page.locator('#pause-button').click();
        const before = await page.evaluate(() => ({ profile: JSON.stringify(__qa.profile), state: JSON.stringify(__qa.state) }));
        await page.locator('#pause-settings-button').click();
        await page.locator('#settings-language-select').selectOption('en');
        await page.locator('#settings-language-select').selectOption(locale);
        await page.evaluate(() => document.fonts.ready);
        assert.equal(await page.evaluate(() => JSON.stringify(__qa.profile)), before.profile);
        const after = await page.evaluate(() => ({ state: JSON.stringify(__qa.state), paused: __qa.state.paused }));
        assert.equal(after.state, before.state, 'switching preserves full paused run'); assert(after.paused);
        await noClipping(page, '#settings-screen');
        await page.locator('#music-toggle').focus(); await page.keyboard.press('Shift+Tab');
        assert.equal(await page.evaluate(() => document.activeElement.id), 'settings-language-select', 'select participates in focus sequence');
        await page.locator('#close-settings-button').click();
        await page.locator('#pause-home-button').click();
      }
      await page.reload();
      assert.equal(await page.locator('#home-language-select').inputValue(), locale, 'explicit choice persists');
      assert.deepEqual(errors, []);
      console.log(`PASS ${locale}/${name}: fonts, menus, four modes, paused switch, select keyboard, persistence`);
      await context.close();
    }
    const offline = await browser.newContext({ locale: 'hi' }), page = await offline.newPage();
    await page.goto(origin + '/index.html');
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    await page.reload(); await page.waitForFunction(() => navigator.serviceWorker.controller);
    await offline.setOffline(true); await page.reload();
    await page.locator('#home-language-select').selectOption('pa-Guru');
    await page.evaluate(() => document.fonts.ready);
    assert(await page.evaluate(() => document.fonts.check('700 20px "Noto Sans Gurmukhi"', 'ਪੰਜਾਬੀ')));
    assert.equal(await page.evaluate(() => SevaI18n.locale), 'pa-Guru');
    await page.goto(origin + '/privacy.html');
    assert.equal(await page.locator('html').getAttribute('lang'), 'pa-Guru');
    assert.match(await page.locator('h1').textContent(), /[\u0A00-\u0A7F]/);
    await page.locator('[data-language-select]').selectOption('hi'); await page.evaluate(() => document.fonts.ready);
    assert(await page.evaluate(() => document.fonts.check('700 20px "Noto Sans Devanagari"', 'हिन्दी')));
    console.log('PASS offline catalogs, both fonts, privacy navigation and switching');
    await offline.close();
    const local = await browser.newContext({ locale: 'pa-PK' }), localPage = await local.newPage();
    await localPage.goto(pathToFileURL(path.join(root, 'index.html')).href);
    assert.equal(await localPage.evaluate(() => SevaI18n.locale), 'en');
    await localPage.locator('#home-language-select').selectOption('hi'); await localPage.evaluate(() => document.fonts.ready);
    assert(await localPage.evaluate(() => document.fonts.check('700 20px "Noto Sans Devanagari"', 'हिन्दी')));
    console.log('PASS direct file launch, fonts and pa-PK exclusion');
    await local.close();
    const denied = await browser.newContext(), deniedPage = await denied.newPage();
    await deniedPage.addInitScript(() => { Storage.prototype.setItem = () => { throw Error('denied'); }; });
    await deniedPage.goto(origin + '/index.html');
    await deniedPage.locator('#home-language-select').selectOption('hi');
    assert.equal(await deniedPage.evaluate(() => SevaI18n.locale), 'hi');
    assert.match(await deniedPage.locator('#home-screen [data-language-status]').textContent(), /[\u0900-\u097F]/);
    console.log('PASS denied storage retains session choice and announces failure');
    await denied.close();
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
