// Capture the real Android presentation from an extracted candidate payload.
// No test hooks, fake scores, CSS overrides, crops or resized artwork.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(process.env.TEST_WEB_ROOT || '.');
const output = path.resolve(process.env.MEDIA_OUTPUT || `screenshots/play-${require('../package.json').version}`);
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 900, height: 1600 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
    await context.addInitScript(() => {
      window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', Plugins: {} };
      window.SevaJumpAndroid = { setGameplayActive() {
        document.documentElement.style.setProperty('--android-safe-top', '0px');
        document.documentElement.style.setProperty('--android-safe-bottom', '0px');
      } };
      localStorage.setItem('seva-jump-profile', JSON.stringify({ tutorialComplete: true, music: false, sound: false }));
    });
    const page = await context.newPage();
    const capture = name => page.screenshot({ path: path.join(output, `tablet-${name}.png`) });
    await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
    await page.evaluate(() => Promise.all([...document.images].map(image => image.decode())));
    await capture('02-home');
    await page.locator('#open-upgrades-button').click();
    await capture('04-upgrades');
    await page.locator('#close-upgrades-button').click();
    for (const [mode, character, name] of [['arcade','girl','01-arcade'], ['challenge','boy','03-challenge']]) {
      await page.locator(`[data-character="${character}"]`).click();
      await page.locator(`#${mode}-button`).click();
      await page.waitForTimeout(650); // Natural opening jump, no fabricated result.
      const layout = await page.evaluate(() => {
        const c = document.querySelector('canvas'), r = c.getBoundingClientRect();
        return { width: c.width, height: c.height, gap: innerHeight - r.bottom, ratio: r.width/r.height };
      });
      assert(layout.gap <= 50, `Tablet screenshot has oversized footer: ${JSON.stringify(layout)}`);
      assert(Math.abs(layout.ratio - layout.width/layout.height) < .001, 'Artwork must not stretch');
      await capture(name);
      await page.locator('#pause-button').click();
      await page.locator('#pause-home-button').click();
    }
    console.log(`Four 1800×3200 tablet captures saved to ${output}`);
    await context.close();
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });
