// Browser integration: native store selection, browser exclusion, and first-run hint lifecycle.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const captures = path.join(root, 'screenshots/review-onboarding');
fs.mkdirSync(captures, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
  try {
    for (const platform of ['web', 'android', 'ios']) {
      for (const locale of ['en', 'hi', 'pa-Guru']) {
        const context = await browser.newContext({ viewport: process.env.REVIEW_TABLET ? { width: 800, height: 1280 } : platform === 'web' ? { width: 1280, height: 900 } : { width: 393, height: 852 } });
        await context.addInitScript(({ platform, locale }) => {
          localStorage.setItem('sevaJump.language', locale);
          if (platform !== 'web') window.Capacitor = { isNativePlatform: () => true, getPlatform: () => platform, Plugins: {} };
          if (platform === 'android') window.SevaJumpAndroid = { setGameplayActive() {}, openStoreReview() { window.reviewOpened = (window.reviewOpened || 0) + 1; } };
        }, { platform, locale });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
        await page.evaluate(() => document.fonts.ready);
        const links = page.locator('[data-store-review]');
        assert.equal(await links.count(), 2);
        for (const link of await links.all()) {
          if (platform === 'web') assert((await link.getAttribute('class')).includes('hidden'));
          else assert.equal(await link.getAttribute('href'), platform === 'android'
            ? 'https://play.google.com/store/apps/details?id=org.sevajump.game'
            : 'https://apps.apple.com/app/id6822047487?action=write-review');
        }
        await page.locator('#open-settings-button').click();
        const settingsLink = page.locator('#settings-screen [data-store-review]');
        assert.equal(await settingsLink.isVisible(), platform !== 'web');
        if (platform === 'android') {
          await settingsLink.click();
          assert.equal(await page.evaluate(() => window.reviewOpened), 1);
          assert(await page.locator('#settings-screen').isVisible());
        }
        await page.screenshot({ path: path.join(captures, `${platform}-${locale}${process.env.REVIEW_TABLET ? '-tablet' : ''}-settings.png`), fullPage: true });
        await page.locator('#close-settings-button').click();
        await page.locator('#open-about-button').click();
        const aboutLink = page.locator('#about-screen [data-store-review]');
        if (platform !== 'web') { await aboutLink.scrollIntoViewIfNeeded(); assert(await aboutLink.isVisible()); }
        else assert.equal(await aboutLink.isVisible(), false);
        await page.locator('#close-about-button').click();
        await page.locator('#endless-button').click();
        const hint = page.locator('#tutorial-keyboard');
        assert(await hint.isVisible());
        assert.match(await hint.textContent(), /← →.*A\/D/);
        await page.screenshot({ path: path.join(captures, `${platform}-${locale}${process.env.REVIEW_TABLET ? '-tablet' : ''}-guide.png`), fullPage: true });
        await page.locator('#tutorial-next-button').click();
        assert.equal(await hint.isVisible(), false);
        await page.locator('#tutorial-skip-button').click();
        await page.locator('#pause-button').click();
        await page.locator('#pause-settings-button').click();
        await page.locator('#close-settings-button').click();
        assert(await page.locator('#pause-screen').isVisible(), 'Settings returns to paused game');
        assert.deepEqual(errors, []);
        await context.close();
        console.log(`PASS ${platform}/${locale}: store visibility/route, guide hint, and paused Settings return`);
      }
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
