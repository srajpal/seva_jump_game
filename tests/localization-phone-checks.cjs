// Connect only to the explicitly opened localhost QA tab on a physical phone.
// The installed native game, other Chrome tabs and device radios are untouched.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const url = process.env.PHONE_QA_URL || 'http://127.0.0.1:8763/index.html';
assert(new URL(url).hostname === '127.0.0.1', 'Only the explicit localhost QA page is supported');
const output = path.resolve(__dirname, '../screenshots/localization-phone');
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.connectOverCDP(process.env.PHONE_CDP || 'http://127.0.0.1:9253', { noDefaults: true });
  let page, original;
  const checks = [], errors = [];
  try {
    for (let attempt = 0; attempt < 40 && !page; attempt++) {
      page = browser.contexts().flatMap(context => context.pages()).find(candidate => candidate.url() === url);
      if (!page) await new Promise(resolve => setTimeout(resolve, 250));
    }
    assert(page, `The dedicated QA page is open; contexts=${browser.contexts().length}, pages=${browser.contexts().reduce((sum, context) => sum + context.pages().length, 0)}; local targets=${browser.contexts().flatMap(context => context.pages()).filter(candidate => candidate.url().includes('127.0.0.1:8763')).map(candidate => candidate.url()).join(',')}`);
    page.setDefaultTimeout(15000);
    page.on('pageerror', error => errors.push(error.message));
    await page.reload();
    await page.locator('#home-screen').waitFor();
    original = await page.evaluate(() => ({ profile: localStorage.getItem('seva-jump-profile'), language: localStorage.getItem('sevaJump.language') }));
    const device = await page.evaluate(() => ({ viewport: [innerWidth, innerHeight], devicePixelRatio, userAgent: navigator.userAgent }));
    for (const locale of ['hi', 'pa-Guru']) {
      await page.locator('#home-language-select').selectOption(locale);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.evaluate(() => SevaI18n.locale), locale);
      const sample = locale === 'hi' ? 'हिन्दी' : 'ਪੰਜਾਬੀ';
      assert(await page.evaluate(sample => document.fonts.check(`700 20px ${SevaI18n.fontFamily}`, sample), sample));
      await page.screenshot({ path: path.join(output, `${locale}-home.png`) });
      await page.locator('#open-about-button').click();
      await page.screenshot({ path: path.join(output, `${locale}-about.png`) });
      await page.locator('#open-privacy-button').click();
      await page.screenshot({ path: path.join(output, `${locale}-privacy.png`) });
      await page.locator('#close-privacy-button').click();
      await page.locator('#close-about-button').click();
      await page.locator('#open-badges-button').click();
      await page.screenshot({ path: path.join(output, `${locale}-badges.png`) });
      await page.locator('#close-badges-button').click();
      for (const mode of ['endless', 'arcade', 'challenge', 'hard']) {
        await page.locator(`#${mode}-button`).click();
        if (await page.locator('#run-upgrades-screen').isVisible()) await page.locator('#confirm-run-button').click();
        if (await page.locator('#tutorial-screen').isVisible()) {
          await page.screenshot({ path: path.join(output, `${locale}-tutorial.png`) });
          await page.locator('#tutorial-skip-button').click();
        }
        await page.locator('#pause-button').click();
        const score = await page.locator('#mobile-score').textContent();
        const profile = await page.evaluate(() => localStorage.getItem('seva-jump-profile'));
        await page.locator('#pause-settings-button').click();
        await page.locator('#settings-language-select').selectOption('en');
        await page.locator('#settings-language-select').selectOption(locale);
        await page.evaluate(() => document.fonts.ready);
        assert.equal(await page.evaluate(() => localStorage.getItem('seva-jump-profile')), profile);
        assert.equal(await page.locator('#mobile-score').textContent(), score);
        await page.screenshot({ path: path.join(output, `${locale}-${mode}-settings.png`) });
        await page.locator('#close-settings-button').click();
        assert(await page.locator('#pause-screen').isVisible());
        await page.locator('#pause-home-button').click();
      }
      await page.reload(); await page.locator('#home-screen').waitFor();
      assert.equal(await page.locator('#home-language-select').inputValue(), locale);
      checks.push(`${locale}: bundled font, Help/Privacy/badges, four modes, pause/settings switch, save retention and reload`);
      console.log(`PASS physical Chrome ${checks.at(-1)}`);
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ passed: true, device, checks, errors, limitations: 'Physical Chrome only; no candidate native installation, airplane-mode or full natural playthrough claim.' }, null, 2));
  } finally {
    if (page && original) await page.evaluate(original => {
      for (const [key, value] of [['seva-jump-profile', original.profile], ['sevaJump.language', original.language]]) {
        if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value);
      }
    }, original).catch(() => {});
    if (page) await page.close();
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
