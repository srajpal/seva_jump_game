// Attach only to an explicitly forwarded debug WebView on a test emulator.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const serial = process.env.ADB_SERIAL;
assert(serial && /^emulator-\d+$/.test(serial), 'Set ADB_SERIAL to the test emulator');
const adb = (...args) => execFileSync(process.env.ADB_PATH || 'adb', ['-s', serial, ...args], {
  maxBuffer: 32 * 1024 * 1024, timeout: 30000
});
const output = path.resolve(__dirname, '../screenshots/release-1.0.1/native');
const name = process.env.DEVICE_LABEL || serial;
assert(/^[\w-]+$/.test(name), 'DEVICE_LABEL must be a simple filename');
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.connectOverCDP(process.env.WEBVIEW_CDP || 'http://127.0.0.1:9222', { noDefaults: true });
  try {
    // Android may retain a detached, zero-size WebView after Activity recreation.
    const candidates = [];
    for (const candidate of browser.contexts()[0].pages()) {
      if (candidate.url().startsWith('https://localhost') &&
          await candidate.evaluate(() => innerWidth > 0 && innerHeight > 0)) candidates.push(candidate);
    }
    assert.equal(candidates.length, 1, 'One attached game WebView exists');
    const page = candidates[0];
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    // Repeated reloads cover the native inset callback racing document creation,
    // and a new root needing the same insets even without a native layout change.
    for (let i = 0; i < 5; i++) {
      console.log(`${name}: reload ${i + 1}/5`);
      await page.reload();
      await page.locator('#home-screen').waitFor();
      await page.waitForFunction(() => ['top', 'right', 'bottom', 'left'].every(side =>
        /^\d+px$/.test(document.documentElement.style.getPropertyValue('--android-safe-' + side))));
    }
    assert.match(await page.locator('.game-version').textContent(),
      new RegExp(`^v${require('../package.json').version.replaceAll('.', '\\.')}`),
      'Installed candidate replaces the previous service-worker cache');
    const layout = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      const rect = canvas.getBoundingClientRect();
      const style = getComputedStyle(document.documentElement);
      return {
        viewport: [innerWidth, innerHeight],
        native: document.documentElement.classList.contains('native-app'),
        canvas: [canvas.width, canvas.height], rect: [rect.width, rect.height],
        objectFit: getComputedStyle(canvas).objectFit,
        insets: Object.fromEntries(['top', 'right', 'bottom', 'left'].map(side =>
          [side, parseFloat(style.getPropertyValue('--android-safe-' + side))]))
      };
    });
    assert(layout.native);
    assert(layout.viewport[1] > layout.viewport[0], 'Portrait viewport');
    assert(layout.insets.top > 0 && layout.insets.bottom > 0, 'Menu system bars publish nonzero safe areas');
    assert(layout.objectFit === 'contain' || Math.abs(layout.rect[0] / layout.rect[1] - layout.canvas[0] / layout.canvas[1]) < .01, 'Canvas is not stretched');
    const capture = async suffix => {
      await page.screenshot({ path: path.join(output, `${name}-${suffix}-webview.png`) });
      fs.writeFileSync(path.join(output, `${name}-${suffix}-device.png`), adb('exec-out', 'screencap', '-p'));
      const windows = adb('shell', 'dumpsys', 'window').toString();
      fs.writeFileSync(path.join(output, `${name}-${suffix}-window.txt`), windows);
      const barState = suffix === 'play' ? 'HIDDEN' : 'SHOWING';
      assert(windows.includes(`status: WINDOW_STATE_${barState}`), `${suffix}: status bar ${barState}`);
      assert(windows.includes(`nav: WINDOW_STATE_${barState}`), `${suffix}: navigation bar ${barState}`);
    };
    await capture('home');
    await page.locator('#arcade-button').click();
    if (await page.locator('#tutorial-screen').isVisible()) await page.locator('#tutorial-skip-button').click();
    await page.locator('#mobile-hud').waitFor();
    assert(await page.evaluate(() => {
      const frame = document.querySelector('.game-frame');
      const canvas = document.querySelector('canvas').getBoundingClientRect();
      const hud = document.querySelector('#mobile-hud').getBoundingClientRect();
      return frame.scrollTop === 0 && hud.top >= 0 && canvas.top >= hud.bottom
        && canvas.bottom <= innerHeight;
    }), 'Canvas focus keeps the HUD visible and the whole playfield inside the viewport');
    await page.waitForFunction(() => {
      const button = document.querySelector('#pause-button').getBoundingClientRect();
      const safe = parseFloat(document.documentElement.style.getPropertyValue('--android-safe-top'));
      return button.top >= safe;
    });
    assert(await page.evaluate(() => {
      const pause = document.querySelector('#pause-button').getBoundingClientRect();
      return [...document.querySelectorAll('.mobile-hud-upgrades > span')].every(item =>
        item.getBoundingClientRect().right <= pause.left);
    }), 'HUD upgrade counters do not overlap Pause when gesture insets are applied');
    await capture('play');
    await page.locator('#pause-button').click();
    await page.locator('#pause-settings-button').click();
    await page.keyboard.press('Escape');
    assert(await page.locator('#settings-screen').isVisible());
    await page.locator('#close-settings-button').click();
    await page.locator('#resume-button').click();
    // Exercise AndroidX/Capacitor's actual Back dispatch, not the JS handler directly.
    adb('shell', 'input', 'keyevent', 'KEYCODE_BACK');
    await page.locator('#exit-confirm-screen').waitFor();
    await page.locator('#cancel-exit-button').click();
    await page.locator('#pause-screen').waitFor();
    await page.locator('#pause-home-button').click();
    await page.locator('#open-about-button').click();
    await page.locator('#open-privacy-button').click();
    await page.locator('#close-privacy-button').click();
    const gestureNavigation = adb('shell', 'settings', 'get', 'secure', 'navigation_mode').toString().trim() === '2';
    if (gestureNavigation) {
      const [width, height] = await page.evaluate(() =>
        [Math.round(innerWidth * devicePixelRatio), Math.round(innerHeight * devicePixelRatio)]);
      adb('shell', 'input', 'touchscreen', 'swipe', '0', String(Math.floor(height / 2)),
        String(Math.floor(width * .75)), String(Math.floor(height / 2)), '150');
      await page.locator('#exit-confirm-screen').waitFor();
      await page.locator('#cancel-exit-button').click();
    }
    await page.locator('#close-about-button').click();
    assert.deepEqual(errors, []);
    const result = { name, passed: true, sdk: adb('shell', 'getprop', 'ro.build.version.sdk').toString().trim(), gestureNavigation, layout, errors };
    fs.writeFileSync(path.join(output, `${name}-results.json`), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
