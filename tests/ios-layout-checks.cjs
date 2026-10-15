// Exercise the actual iOS wrapper presentation in a browser, including focus
// scrolling and simulated cutout/home-indicator insets. Native captures remain
// necessary to verify WebKit's real env(safe-area-inset-*) values.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const swift = fs.readFileSync(path.resolve(__dirname, '../ios/SevaJump/App/GameViewController.swift'), 'utf8');
const presentation = swift.match(/source: """\n([\s\S]*?)\n\s*""",/)[1];
const output = path.resolve(__dirname, '../screenshots/ios-layout');
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await playwright[process.env.BROWSER_ENGINE || 'chromium'].launch({
    ...(process.env.BROWSER_ENGINE === 'webkit' ? {} : { channel: process.env.BROWSER_CHANNEL || 'chrome' }), headless: true,
  });
  try {
    for (const [name, width, height, top, bottom, legacy] of [
      ['se', 375, 667, 0, 0], ['small-phone', 320, 568, 0, 0],
      ['modern-phone', 393, 852, 59, 34], ['pro-max', 440, 956, 62, 34],
      ['ipad-mini', 744, 1133, 24, 20], ['short-tablet', 800, 850, 24, 20],
      ['legacy-se', 375, 667, 0, 0, true],
    ]) {
      const context = await browser.newContext({ viewport: { width, height }, hasTouch: true, isMobile: true });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.addInitScript(presentation);
      // Keep runs alive while slow simulator/browser hosts inspect layout.
      // Only the test page's animation clock is frozen; production is intact.
      await page.addInitScript(() => {
        const raf = window.requestAnimationFrame.bind(window);
        let frozenTime;
        window.requestAnimationFrame = callback => raf(time => callback(frozenTime ??= time));
      });
      await page.addInitScript(() => localStorage.setItem('seva-jump-profile', JSON.stringify({ tutorialComplete: true, music: false, sound: false })));
      await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
      await page.evaluate(({ top, bottom, legacy }) => {
        document.documentElement.style.setProperty('--safe-top', `${top}px`);
        document.documentElement.style.setProperty('--safe-bottom', `${bottom}px`);
        if (legacy) {
          // Exercise the wrapper's fallbacks as if newer declarations were
          // discarded by an older engine. Inline styles avoid file-URL CSSOM restrictions.
          for (const style of document.querySelectorAll('style')) style.textContent = style.textContent
            .replace(/overflow: clip;/g, '')
            .replace(/width: [^;]*100dvh[^;]*;/g, '');
        }
      }, { top, bottom, legacy });
      const homeCheck = async () => {
        await page.locator('#home-screen').evaluate(el => { el.scrollTop = 0; });
        const tagline = page.locator('.home-screen .eyebrow');
        assert.ok(await tagline.isVisible(), `${name}: home tagline stays visible on compact iPhones`);
        assert.ok((await tagline.boundingBox()).y >= top, `${name}: tagline clears safe area`);
        const logo = await page.locator('.game-logo').boundingBox();
        assert.ok(logo.y >= top && logo.y + logo.height <= height - bottom, `${name}: home logo clears safe area`);
        assert.equal(await page.locator('.game-frame').evaluate(el => el.scrollTop), 0, `${name}: home frame stays at top`);
      };
      await homeCheck();
      await page.screenshot({ path: path.join(output, `${name}-home.png`) });
      await page.locator('#arcade-button').click();
      await page.locator('#mobile-hud').waitFor({ state: 'visible' });
      const verify = async () => {
        const geometry = await page.evaluate(() => {
          const rect = selector => { const r = document.querySelector(selector).getBoundingClientRect(); return { top: r.top, bottom: r.bottom, width: r.width, height: r.height }; };
          const canvas = document.querySelector('canvas');
          return { frameScroll: document.querySelector('.game-frame').scrollTop, pageScroll: window.scrollY, canvas: rect('canvas'), hud: rect('#mobile-hud'), pause: rect('#pause-button'), ratio: canvas.width / canvas.height };
        });
        assert.equal(geometry.frameScroll, 0, `${name}: focus does not scroll frame`);
        assert.equal(geometry.pageScroll, 0, `${name}: focus does not scroll page`);
        assert.ok(geometry.hud.top >= 0 && geometry.hud.bottom <= height, `${name}: HUD visible`);
        assert.ok(geometry.pause.top >= top && geometry.pause.bottom <= geometry.hud.bottom, `${name}: Pause clears cutout ${JSON.stringify(geometry)}`);
        assert.ok(geometry.canvas.top >= geometry.hud.bottom - 1 && geometry.canvas.bottom <= height - bottom + 1, `${name}: whole canvas fits below HUD`);
        assert.ok(Math.abs(geometry.canvas.width / geometry.canvas.height - geometry.ratio) < .001, `${name}: canvas is not stretched`);
      };
      await verify();
      await page.screenshot({ path: path.join(output, `${name}-play.png`) });
      await page.locator('#pause-button').click();
      await page.locator('#resume-button').click();
      await verify();
      await page.evaluate(() => window.dispatchEvent(new Event('blur')));
      await page.locator('#resume-button').click();
      await verify();
      await page.locator('#pause-button').click();
      await page.locator('#pause-home-button').click();
      await homeCheck();
      for (const menu of ['about', 'settings', 'stats']) {
        await page.locator(`#open-${menu}-button`).click();
        const heading = await page.locator(`#${menu}-heading`).boundingBox();
        assert.ok(heading.y >= top, `${name}: ${menu} heading visible after gameplay`);
        await page.locator(`#close-${menu}-button`).click();
        await homeCheck();
      }
      assert.deepEqual(errors, []);
      console.log(`PASS iOS layout: ${name}`);
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
