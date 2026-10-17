const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(process.env.TEST_WEB_ROOT || path.join(__dirname, '..'));
const output = path.resolve(__dirname, '../screenshots/home-fit');
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const failures = [];
  try {
    for (const [name, width, height, native, tiny] of [
      ['moto', 411, 812, false, false], ['phone', 393, 720, false, false],
      ['compact-phone', 360, 640, false, false], ['tiny-phone', 320, 568, false, true],
      ['native-phone', 393, 808, true, false], ['native-tablet', 800, 1280, true, false],
      ['native-short-phone', 393, 720, true, false],
    ]) {
      const context = await browser.newContext({ viewport: { width, height }, hasTouch: true, isMobile: true });
      if (native) await context.addInitScript(() => {
        window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', Plugins: {} };
        document.addEventListener('DOMContentLoaded', () => {
          document.documentElement.style.setProperty('--android-safe-top', '24px');
          document.documentElement.style.setProperty('--android-safe-bottom', '24px');
        });
      });
      const page = await context.newPage();
      await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
      for (const locale of ['en', 'hi', 'pa-Guru']) {
        await page.evaluate(locale => SevaI18n.setLanguage(locale), locale);
        await page.evaluate(() => document.fonts.ready);
        const result = await page.locator('#home-screen').evaluate(home => {
          home.scrollTop = 0;
          const bounds = home.getBoundingClientRect();
          return { height: home.clientHeight, scroll: home.scrollHeight - home.clientHeight,
            pageScroll: document.documentElement.scrollHeight - innerHeight,
            sections: [...home.children].map(el => ({ name: el.className, height: Math.round(el.getBoundingClientRect().height) })),
            controlsFit: [...home.querySelectorAll('button, select')].every(el => { const r = el.getBoundingClientRect(); return r.left >= bounds.left && r.right <= bounds.right + 1; }),
          };
        });
        if ((!tiny && (result.scroll > 1 || result.pageScroll > 1)) || !result.controlsFit) {
          failures.push(`${name}/${locale}: ${JSON.stringify(result)}`);
          await page.screenshot({ path: path.join(output, `${name}-${locale}.png`) });
        } else console.log(`PASS ${name}/${locale}: ${result.scroll}px Home scroll${tiny ? ' (tiny-screen scrolling allowed)' : ''}`);
        if (locale === 'pa-Guru') await page.screenshot({ path: path.join(output, `${name}-${locale}.png`) });
        // Even small screens must keep the language control and version reachable.
        await page.locator('#home-language-select').scrollIntoViewIfNeeded();
        assert(await page.locator('#home-language-select').isVisible());
      }
      await context.close();
    }
    assert.deepEqual(failures, [], 'Home must fit ordinary phones/tablets without scrolling');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
