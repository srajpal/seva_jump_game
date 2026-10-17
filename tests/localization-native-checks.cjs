// Explicitly targets a dedicated emulator; updates in place and restores its display overrides.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const serial = process.env.ADB_SERIAL;
assert(serial && /^emulator-\d+$/.test(serial), 'Only an explicitly selected test emulator is supported');
const adbPath = process.env.ADB_PATH || 'adb';
const adb = (...args) => execFileSync(adbPath, ['-s', serial, ...args], { timeout: 90000, maxBuffer: 32 * 1024 * 1024 });
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'screenshots/localization-native');
fs.mkdirSync(output, { recursive: true });
const displayBefore = { size: adb('shell', 'wm', 'size').toString(), density: adb('shell', 'wm', 'density').toString() };
const override = text => text.match(/Override (?:size|density): ([\dx]+)/)?.[1] || 'reset';
const report = { serial, displayBefore, sdk: adb('shell', 'getprop', 'ro.build.version.sdk').toString().trim(), checks: [] };
const check = (name, details = {}) => { report.checks.push({ name, ...details }); console.log(`PASS ${name}`); };
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let browser, originalLanguage;
async function attach() {
  if (browser) { await browser.close(); browser = null; }
  for (let attempt = 0; attempt < 30; attempt++) {
    const sockets = adb('shell', 'cat', '/proc/net/unix').toString();
    let pid;
    try { pid = adb('shell', 'pidof', 'org.sevajump.game').toString().trim().split(/\s+/)[0]; }
    catch { adb('shell', 'am', 'start', '-n', 'org.sevajump.game/.MainActivity'); await delay(1000); continue; }
    const socket = sockets.match(new RegExp(`@(webview_devtools_remote_${pid})\\b`))?.[1];
    if (socket) {
      adb('forward', 'tcp:9251', `localabstract:${socket}`);
      try {
        browser = await chromium.connectOverCDP('http://127.0.0.1:9251', { noDefaults: true });
        for (const page of browser.contexts()[0].pages()) {
          if (page.url().startsWith('https://localhost') && await page.evaluate(() => innerWidth > 0)) {
            page.setDefaultTimeout(15000);
            await page.locator('#home-screen').waitFor();
            return page;
          }
        }
        await browser.close(); browser = null;
      } catch { if (browser) await browser.close(); browser = null; }
    }
    await delay(1000);
  }
  throw Error('No attached SevaJump debug WebView');
}
async function capture(page, name) {
  await page.screenshot({ path: path.join(output, `${name}-webview.png`) });
  fs.writeFileSync(path.join(output, `${name}-device.png`), adb('exec-out', 'screencap', '-p'));
  const windows = adb('shell', 'dumpsys', 'window').toString();
  fs.writeFileSync(path.join(output, `${name}-window.txt`), windows);
  return windows;
}
async function back(page, target) {
  adb('shell', 'input', 'keyevent', 'KEYCODE_BACK');
  await page.locator(target).waitFor();
}
(async () => {
  adb('shell', 'am', 'start', '-n', 'org.sevajump.game/.MainActivity');
  let page = await attach();
  const before = await page.evaluate(() => ({ profile: localStorage.getItem('seva-jump-profile'), language: localStorage.getItem('sevaJump.language'), version: document.querySelector('.game-version').textContent }));
  originalLanguage = before.language;
  report.before = before;
  fs.writeFileSync(path.join(output, 'before-update.json'), JSON.stringify(before, null, 2));
  await browser.close(); browser = null;
  const apk = path.resolve(process.env.APK_PATH || path.join(root, 'android/app/build/outputs/apk/debug/app-debug.apk'));
  assert(fs.existsSync(apk), 'Final debug APK exists');
  assert.match(adb('install', '-r', apk).toString(), /Success/, 'Debug update installs in place');
  await delay(1000);
  adb('shell', 'am', 'start', '-n', 'org.sevajump.game/.MainActivity');
  page = await attach();
  const after = await page.evaluate(() => ({ profile: localStorage.getItem('seva-jump-profile'), version: document.querySelector('.game-version').textContent }));
  assert.deepEqual(JSON.parse(after.profile), JSON.parse(before.profile), 'in-place APK update preserves prior save');
  assert.match(after.version, new RegExp(require('../package.json').version.replaceAll('.', '\\.')));
  check('in-place update retains existing emulator save', { from: before.version, to: after.version });

  for (const [device, size, density] of [['phone', '1080x2220', '440'], ['tablet', '1600x2560', '320']]) {
    await browser.close(); browser = null;
    adb('shell', 'am', 'force-stop', 'org.sevajump.game');
    adb('shell', 'wm', 'size', size); adb('shell', 'wm', 'density', density);
    adb('shell', 'am', 'start', '-n', 'org.sevajump.game/.MainActivity');
    page = await attach();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    for (let i = 0; i < 3; i++) {
      await page.reload(); await page.locator('#home-screen').waitFor();
      await page.waitForFunction(() => ['top', 'right', 'bottom', 'left'].every(side => /^\d+px$/.test(document.documentElement.style.getPropertyValue('--android-safe-' + side))));
    }
    for (const locale of ['hi', 'pa-Guru']) {
      await page.locator('#home-screen [data-language-select]').selectOption(locale);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.evaluate(() => SevaI18n.locale), locale);
      const homeOverflow = await page.locator('#home-screen').evaluate(home => home.scrollHeight - home.clientHeight);
      assert(homeOverflow <= 1, `${device}/${locale}: Home fits without scrolling (${homeOverflow}px overflow)`);
      const font = locale === 'hi' ? 'Noto Sans Devanagari' : 'Noto Sans Gurmukhi';
      assert(await page.evaluate(font => document.fonts.check(`700 20px "${font}"`), font));
      const homeWindows = await capture(page, `${device}-${locale}-home`);
      assert(homeWindows.includes('status: WINDOW_STATE_SHOWING') && homeWindows.includes('nav: WINDOW_STATE_SHOWING'));
      await page.locator('#open-about-button').click();
      await page.locator('#open-privacy-button').click();
      await capture(page, `${device}-${locale}-privacy`);
      await back(page, '#about-screen'); await back(page, '#home-screen');
      await page.locator('#arcade-button').click();
      if (await page.locator('#run-upgrades-screen').isVisible()) await page.locator('#confirm-run-button').click();
      if (await page.locator('#tutorial-screen').isVisible()) await page.locator('#tutorial-skip-button').click();
      await page.locator('#mobile-hud').waitFor();
      const layout = await page.evaluate(() => {
        const canvas = document.querySelector('#game'), rect = canvas.getBoundingClientRect();
        const hud = document.querySelector('#mobile-hud').getBoundingClientRect();
        return { viewport: [innerWidth, innerHeight], canvas: [canvas.width, canvas.height], rect: [rect.x, rect.y, rect.width, rect.height], footer: innerHeight - rect.bottom, hudBottom: hud.bottom, safeBottom: parseFloat(document.documentElement.style.getPropertyValue('--android-safe-bottom')) || 0, score: document.querySelector('#mobile-score').textContent };
      });
      assert(Math.abs(layout.rect[2] / layout.rect[3] - layout.canvas[0] / layout.canvas[1]) < .01);
      assert(layout.rect[1] >= layout.hudBottom - 1);
      if (device === 'tablet') assert(layout.footer <= 50 + layout.safeBottom, `compact tablet footer: ${layout.footer}`);
      const playWindows = await capture(page, `${device}-${locale}-play`);
      assert(playWindows.includes('status: WINDOW_STATE_HIDDEN') && playWindows.includes('nav: WINDOW_STATE_HIDDEN'));
      await page.locator('#pause-button').click();
      const pausedScore = await page.locator('#mobile-score').textContent();
      const pausedProfile = await page.evaluate(() => localStorage.getItem('seva-jump-profile'));
      await page.locator('#pause-settings-button').click();
      const nextLocale = locale === 'hi' ? 'pa-Guru' : 'hi';
      await page.locator('#settings-screen [data-language-select]').selectOption(nextLocale);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.evaluate(() => localStorage.getItem('seva-jump-profile')), pausedProfile);
      await capture(page, `${device}-${locale}-settings-switched`);
      await back(page, '#pause-screen');
      const switchedScore = await page.locator('#mobile-score').textContent();
      assert.equal(switchedScore.match(/\d+/)?.[0], pausedScore.match(/\d+/)?.[0], 'paused score stays unchanged while switching language');
      await page.locator('#resume-button').click();
      await back(page, '#pause-screen');
      await page.locator('#pause-home-button').click();
      const saved = await page.evaluate(() => localStorage.getItem('seva-jump-profile'));
      adb('shell', 'input', 'keyevent', 'KEYCODE_BACK');
      await page.waitForFunction(() => document.visibilityState === 'hidden', null, { polling: 100 });
      adb('shell', 'am', 'start', '-n', 'org.sevajump.game/.MainActivity');
      await page.waitForFunction(() => document.visibilityState === 'visible', null, { polling: 100 });
      assert.equal(await page.evaluate(() => localStorage.getItem('seva-jump-profile')), saved);
      await page.reload(); await page.locator('#home-screen').waitFor();
      assert.equal(await page.evaluate(() => SevaI18n.locale), nextLocale, 'language preference persists on reload');
      check(`${device} ${locale}: fonts, menus, gameplay, paused switch, actual Back, saved progress`, { layout });
    }
    assert.deepEqual(errors, []);
  }
  report.passed = true;
})().catch(error => { report.error = error.stack; process.exitCode = 1; console.error(error); }).finally(async () => {
  try {
    if (browser) {
      for (const page of browser.contexts()[0].pages()) if (page.url().startsWith('https://localhost')) {
        await page.evaluate(value => SevaI18n.setLanguage(value || 'device'), originalLanguage).catch(() => {});
      }
      await browser.close();
    }
    adb('shell', 'wm', 'size', override(displayBefore.size));
    adb('shell', 'wm', 'density', override(displayBefore.density));
    adb('forward', '--remove', 'tcp:9251');
    report.displayRestored = { size: adb('shell', 'wm', 'size').toString(), density: adb('shell', 'wm', 'density').toString() };
  } catch (error) { report.cleanupError = error.message; process.exitCode = 1; }
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2));
});
