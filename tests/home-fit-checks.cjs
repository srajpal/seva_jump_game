const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(process.env.TEST_WEB_ROOT || path.join(__dirname, '..'));
const output = path.resolve(__dirname, '../screenshots/home-fit');
const iosController = fs.readFileSync(path.join(__dirname, '../ios/SevaJump/App/GameViewController.swift'), 'utf8');
const iosPresentationCss = iosController.match(/style\.textContent = `([\s\S]*?)`;/)?.[1];
assert(iosPresentationCss, 'iOS native presentation CSS is available for layout checks');
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const failures = [];
  try {
    const cases = [
      ['moto', 411, 812, false, false], ['phone', 393, 720, false, false],
      ['compact-phone', 360, 640, false, false], ['tiny-phone', 320, 568, false, true],
      ['native-phone', 393, 808, 'android', false], ['pixel-6', 411, 914, 'android', false], ['native-tablet', 800, 1280, 'android', false],
      ['pixel-6-large-text', 411, 914, 'android', false, '18.4px'],
      ['pixel-6-large-text-browser', 411, 914, false, false, '18.4px'],
      ['native-short-phone', 393, 720, 'android', false],
      ['android-compact-large-text', 360, 800, 'android', false, '18.4px'],
      ['android-compact-accessibility-text', 360, 800, 'android', true, '24px'],
      ['android-medium-large-text', 393, 873, 'android', false, '18.4px'],
      ['android-mouse-large-text', 393, 873, 'android', false, '18.4px', true],
      ['android-wide-large-text', 432, 960, 'android', false, '18.4px'],
      ['ios-mini', 360, 780, 'ios', false],
      ['ios-se', 375, 667, 'ios', true],
      ['ios-se-large-text', 375, 667, 'ios', true, '18.4px'],
      ['ios-standard', 393, 852, 'ios', false],
      ['ios-new', 402, 874, 'ios', false],
      ['ios-plus', 430, 932, 'ios', false],
      ['ios-max', 440, 956, 'ios', false],
      ['ios-standard-large-text', 393, 852, 'ios', false, '18.4px'],
      ['ios-standard-accessibility-text', 393, 852, 'ios', true, '24px'],
      ['ios-new-large-text', 402, 874, 'ios', false, '18.4px'],
      ['ios-plus-large-text', 430, 932, 'ios', false, '18.4px'],
    ];
    for (const [name, width, height, native, allowScroll, rootFontSize, finePointer] of cases.filter(([name]) => !process.env.HOME_FIT_CASE || name === process.env.HOME_FIT_CASE)) {
      const context = await browser.newContext({ viewport: { width, height }, hasTouch: !finePointer, isMobile: !finePointer });
      if (native) await context.addInitScript(platform => {
        window.Capacitor = { isNativePlatform: () => true, getPlatform: () => platform, Plugins: {} };
        document.addEventListener('DOMContentLoaded', () => {
          document.documentElement.style.setProperty('--android-safe-top', platform === 'ios' ? '59px' : '24px');
          document.documentElement.style.setProperty('--android-safe-bottom', platform === 'ios' ? '34px' : '24px');
        });
      }, native);
      const page = await context.newPage();
      await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
      if (native === 'ios') {
        await page.evaluate(() => document.documentElement.classList.add('ios-native'));
        await page.addStyleTag({ content: iosPresentationCss });
      }
      if (rootFontSize) await page.addStyleTag({ content: `html { font-size: ${rootFontSize}; }` });
      for (const locale of ['en', 'hi', 'pa-Guru']) {
        await page.evaluate(locale => SevaI18n.setLanguage(locale), locale);
        await page.evaluate(() => document.fonts.ready);
        const result = await page.locator('#home-screen').evaluate(home => {
          home.scrollTop = 0;
          const bounds = home.getBoundingClientRect();
          const order = parent => [...parent.children].flatMap((element, index, children) => {
            if (index === children.length - 1) return [];
            const next = children[index + 1];
            return element.getBoundingClientRect().bottom > next.getBoundingClientRect().top + 1
              ? [`${element.className || element.tagName} overlaps ${next.className || next.tagName}`] : [];
          });
          const scene = home.querySelector('.home-scene').getBoundingClientRect();
          const content = home.querySelector('.home-content').getBoundingClientRect();
          return { height: home.clientHeight, scroll: home.scrollHeight - home.clientHeight,
            pageScroll: document.documentElement.scrollHeight - innerHeight,
            sections: [...home.children].map(el => ({ name: el.className, height: Math.round(el.getBoundingClientRect().height) })),
            controlsFit: [...home.querySelectorAll('button, select')].every(el => { const r = el.getBoundingClientRect(); return r.left >= bounds.left && r.right <= bounds.right + 1; }),
            overlaps: [...order(home), ...order(home.querySelector('.home-content')),
              ...[...home.querySelector('.home-content').children].flatMap(el => el.getBoundingClientRect().bottom > content.bottom + 1 ? [`${el.className || el.tagName} escapes home content`] : []),
              ...[...home.querySelectorAll('.scene-character, .scene-bowl')].flatMap(el => el.getBoundingClientRect().bottom > scene.bottom + 8 ? [`${el.className} escapes scene`] : [])],
          };
        });
        if ((!allowScroll && (result.scroll > 1 || result.pageScroll > 1)) || !result.controlsFit || result.overlaps.length) {
          failures.push(`${name}/${locale}: ${JSON.stringify(result)}`);
          await page.screenshot({ path: path.join(output, `${name}-${locale}.png`) });
        } else console.log(`PASS ${name}/${locale}: ${result.scroll}px Home scroll${allowScroll ? ' (scrolling allowed)' : ''}`);
        if (locale === 'pa-Guru' || (locale === 'hi' && ['pixel-6-large-text', 'android-compact-large-text', 'ios-standard-large-text', 'ios-standard-accessibility-text'].includes(name))) await page.screenshot({ path: path.join(output, `${name}-${locale}.png`) });
        // Even small screens must keep the language control and version reachable.
        await page.locator('#home-language-select').scrollIntoViewIfNeeded();
        assert(await page.locator('#home-language-select').isVisible());
        await page.locator('.game-version').scrollIntoViewIfNeeded();
        const versionReachable = await page.locator('.game-version').evaluate(el => {
          const version = el.getBoundingClientRect(), home = el.closest('.home-screen').getBoundingClientRect();
          return version.top >= home.top - 1 && version.bottom <= home.bottom + 1;
        });
        assert(versionReachable, `${name}/${locale}: version remains reachable`);
      }
      await context.close();
    }
    assert.deepEqual(failures, [], 'Home must fit ordinary phones/tablets without scrolling');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
