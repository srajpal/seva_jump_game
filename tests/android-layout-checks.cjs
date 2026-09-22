// Browser reproduction of Android WebView geometry; no device or APK required.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const output = path.resolve(__dirname, '../screenshots/android-layout');
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
  try {
    for (const [name, width, height, touch] of [
      ['compact-tablet', 600, 960, true], ['compact-tablet-mouse', 600, 960, false],
      ['tablet', 800, 1280, true], ['tablet-mouse', 800, 1280, false],
      ['wide-tablet', 960, 1280, true], ['phone', 393, 808, true],
      ['short-tablet', 700, 850, true],
      ['pixel-phone', 411, 914, true],
      ['short-handset', 320, 568, true],
    ]) {
      const context = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(({ cutout }) => {
        window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', Plugins: {} };
        const insets = active => {
          const root = document.documentElement;
          if (!root) return;
          root.style.setProperty('--android-safe-top', active ? `${cutout}px` : `${Math.max(24, cutout)}px`);
          root.style.setProperty('--android-safe-bottom', active ? '16px' : '24px');
        };
        window.SevaJumpAndroid = { setGameplayActive: insets };
        document.addEventListener('DOMContentLoaded', () => insets(false));
        localStorage.setItem('seva-jump-profile', JSON.stringify({ tutorialComplete: true, music: false, sound: false }));
      }, { cutout: name === 'pixel-phone' ? 60 : 0 });
      await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
      await page.locator('#arcade-button').click();
      await page.locator('#mobile-hud').waitFor();
      const geometry = await page.evaluate(() => {
        const frame = document.querySelector('.game-frame');
        const canvas = document.querySelector('canvas');
        const rect = element => { const r = element.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, left: r.left, right: r.right }; };
        return { scroll: frame.scrollTop, canvas: rect(canvas), hud: rect(document.querySelector('#mobile-hud')), pause: rect(document.querySelector('#pause-button')), width: canvas.width, height: canvas.height };
      });
      await page.screenshot({ path: path.join(output, `${name}-play.png`) });
      assert.equal(geometry.scroll, 0, `${name}: focusing canvas must not scroll the game frame: ${JSON.stringify(geometry)}`);
      assert.ok(geometry.hud.top >= 0 && geometry.pause.top >= 0, `${name}: HUD and Pause remain visible`);
      assert.ok(geometry.canvas.bottom <= height && geometry.canvas.top >= geometry.hud.bottom, `${name}: whole canvas fits below HUD`);
      if (name.includes('phone')) assert.ok(geometry.canvas.left < 1 && geometry.canvas.right >= width - 1, `${name}: phone playfield fills the width without side borders`);
      if (width >= 600) assert.ok(geometry.canvas.bottom <= height - 64 + 1, `${name}: tablet retains its footer and bottom safe area`);
      assert.ok(Math.abs((geometry.canvas.right - geometry.canvas.left) / (geometry.canvas.bottom - geometry.canvas.top) - geometry.width / geometry.height) < .01, `${name}: canvas is not stretched`);
      await page.locator('#pause-button').click();
      await page.locator('#resume-button').click();
      assert.equal(await page.locator('.game-frame').evaluate(el => el.scrollTop), 0, `${name}: resume preserves frame position`);
      await page.locator('#pause-button').click();
      await page.evaluate(() => window.sevaJumpNativeBack());
      await page.locator('#exit-confirm-screen').waitFor();
      const exitTitle = await page.locator('#exit-confirm-screen h2').boundingBox();
      assert.ok(exitTitle.y >= 24, `${name}: exit heading clears status bar`);
      await page.screenshot({ path: path.join(output, `${name}-exit.png`) });
      await page.locator('#cancel-exit-button').click();
      await page.locator('#pause-home-button').click();
      for (const menu of ['about', 'upgrades', 'badges', 'stats', 'settings']) {
        await page.locator(`#open-${menu}-button`).click();
        const heading = await page.locator(`#${menu}-heading`).boundingBox();
        assert.ok(heading.y >= 24, `${name}/${menu}: heading clears status bar after gameplay`);
        const close = page.locator(`#close-${menu}-button`);
        await close.scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(output, `${name}-${menu}.png`) });
        await close.click();
        assert.equal(await page.locator('.game-frame').evaluate(el => el.scrollTop), 0, `${name}: scrolling a menu does not move the frame`);
      }
      assert.deepEqual(errors, []);
      console.log(`PASS Android layout: ${name}`);
      await context.close();
    }
    const iosContext = await browser.newContext({ viewport: { width: 800, height: 1280 }, hasTouch: true, isMobile: true });
    const iosPage = await iosContext.newPage();
    await iosPage.addInitScript(() => {
      window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'ios', Plugins: {} };
    });
    await iosPage.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    assert.equal(await iosPage.locator('html').evaluate(el => el.classList.contains('android-app')), false, 'iOS does not receive Android presentation');
    assert.equal(await iosPage.locator('canvas').evaluate(el => el.width), 640, 'iOS retains its existing tablet canvas');
    await iosContext.close();
    console.log('PASS Android presentation excluded from iOS');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
