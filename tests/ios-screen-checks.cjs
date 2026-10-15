// Full iPhone screen/navigation audit. Test-only result/exit seams are injected
// into the HTTP response; the shipped source and native app contain no hooks.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'screenshots/ios-screens');
fs.mkdirSync(output, { recursive: true });
const swift = fs.readFileSync(path.join(root, 'ios/SevaJump/App/GameViewController.swift'), 'utf8');
const presentation = swift.match(/source: """\n([\s\S]*?)\n\s*""",/)[1];
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404); return res.end(); }
    if (path.basename(file) === 'game.js') data = data.toString()
      .replace(/\}\)\(\);\s*$/, 'window.__screenQA={finish,openExitConfirm,get state(){return state}};})();');
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream'); res.end(data);
  });
});
const reports = [], findings = [];
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
  try {
    for (const [name, width, height, top, bottom] of [
      ['small', 320, 568, 0, 0], ['se', 375, 667, 0, 0],
      ['notch', 390, 844, 47, 34], ['17-pro', 402, 874, 62, 34], ['pro-max', 440, 956, 62, 34],
    ]) {
      const context = await browser.newContext({ viewport: { width, height }, hasTouch: true, isMobile: true });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(presentation);
      await page.addInitScript(() => {
        localStorage.setItem('seva-jump-profile', JSON.stringify({ tutorialComplete: true, music: false, sound: false, tokens: 999, falcon: 2, shield: 2, powerJump: 2 }));
        const raf = window.requestAnimationFrame.bind(window); let time;
        window.requestAnimationFrame = callback => raf(t => callback(time ??= t));
      });
      await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
      await page.evaluate(({ top, bottom }) => {
        document.documentElement.style.setProperty('--safe-top', `${top}px`);
        document.documentElement.style.setProperty('--safe-bottom', `${bottom}px`);
      }, { top, bottom });
      const tap = async id => { await page.locator(`#${id}`).tap(); };
      const visible = id => page.locator(`#${id}`).waitFor({ state: 'visible' });
      const audit = async (id, suffix = '') => {
        await visible(id);
        const screen = page.locator(`#${id}`);
        await screen.evaluate(el => { el.scrollTop = 0; });
        const initial = await screen.evaluate(el => {
          const first = el.firstElementChild.getBoundingClientRect();
          const r = el.getBoundingClientRect();
          return { firstTop: first.top, left: r.left, right: r.right, width: el.clientWidth, scrollWidth: el.scrollWidth };
        });
        const issue = message => findings.push(`${name}/${id}${suffix}: ${message}`);
        if (initial.firstTop < top) issue(`first content above safe area (${initial.firstTop} < ${top})`);
        if (initial.scrollWidth > initial.width + 1) issue(`horizontal overflow (${initial.scrollWidth} > ${initial.width})`);
        const heading = screen.locator('h1, h2, #about-heading').first();
        const headingClear = await heading.evaluate(el => {
          const r = el.getBoundingClientRect();
          const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
          return !!hit && el.contains(hit);
        });
        if (!headingClear) issue('heading is covered');
        await page.screenshot({ path: path.join(output, `${name}-${id}${suffix}-top.png`) });
        const controls = screen.locator('button:visible, a:visible, input:visible, select:visible');
        for (let i = 0; i < await controls.count(); i++) {
          const control = controls.nth(i);
          await control.scrollIntoViewIfNeeded();
          const g = await control.evaluate(el => {
            const r = el.getBoundingClientRect();
            const label = el.tagName === 'INPUT' && el.closest('label');
            const target = label ? label.getBoundingClientRect() : r;
            const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
            return { id: el.id || el.textContent.trim(), top: r.top, bottom: r.bottom, left: r.left, right: r.right, targetWidth: target.width, targetHeight: target.height, hit: !!hit && (el.contains(hit) || hit === el || el.closest('label')?.contains(hit)) };
          });
          if (g.top < top - 1 || g.bottom > height - bottom + 1 || g.left < -1 || g.right > width + 1) issue(`${g.id} not reachable inside safe viewport: ${JSON.stringify(g)}`);
          if (!g.hit) issue(`${g.id} is covered at its tap point`);
          if (g.targetWidth < 43 || g.targetHeight < 43) issue(`${g.id} touch target ${g.targetWidth}×${g.targetHeight}`);
        }
        await screen.evaluate(el => { el.scrollTop = el.scrollHeight; });
        await page.screenshot({ path: path.join(output, `${name}-${id}${suffix}-bottom.png`) });
        assert.equal(await page.locator('.game-frame').evaluate(el => el.scrollTop), 0, `${name}/${id}: outer frame stays fixed`);
        reports.push(`${name}/${id}${suffix}`);
      };
      await audit('home-screen');
      await page.locator('#home-screen').evaluate(el => { el.scrollTop = 0; });
      const tagline = page.locator('.home-screen .eyebrow');
      assert.equal((await tagline.textContent()).trim(), 'A skyward seva adventure');
      assert.ok(await tagline.isVisible(), `${name}: tagline is visible`);
      assert.ok((await tagline.boundingBox()).y >= top, `${name}: tagline clears safe area`);
      for (const menu of ['upgrades', 'badges', 'stats']) {
        await tap(`open-${menu}-button`); await audit(`${menu}-screen`);
        await tap(`close-${menu}-button`); await visible('home-screen');
      }
      await tap('open-about-button'); await audit('about-screen');
      await tap('open-privacy-button'); await audit('privacy-screen');
      await tap('close-privacy-button'); await visible('about-screen');
      await tap('close-about-button'); await visible('home-screen');
      await tap('open-settings-button'); await audit('settings-screen');
      for (const info of ['helping-hand', 'reduced-motion']) {
        const checked = await page.locator(`#${info}-toggle`).isChecked();
        await tap(`${info}-info`); await audit('info-screen', `-${info}`);
        await tap('close-info-button'); await visible('settings-screen');
        assert.equal(await page.locator(`#${info}-toggle`).isChecked(), checked, `${name}: opening info preserves toggle`);
      }
      await tap('reset-progress-button'); await audit('reset-confirm-screen');
      await tap('cancel-reset-button'); await visible('settings-screen');
      assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('seva-jump-profile')).tokens), 999);
      await tap('replay-tutorial-button');
      for (let step = 0; step < 3; step++) { await audit('tutorial-screen', `-${step + 1}`); await tap('tutorial-next-button'); }
      await visible('settings-screen');
      await tap('replay-tutorial-button'); await tap('tutorial-skip-button'); await visible('settings-screen');
      await tap('close-settings-button'); await visible('home-screen');
      for (const mode of ['endless', 'arcade', 'challenge', 'hard']) {
        await tap(`${mode}-button`); await audit('run-upgrades-screen', `-${mode}`);
        await tap('cancel-run-button'); await visible('home-screen');
        await tap(`${mode}-button`); await tap('confirm-run-button'); await visible('mobile-hud');
        await page.screenshot({ path: path.join(output, `${name}-play-${mode}.png`) });
        await tap('pause-button'); await audit('pause-screen', `-${mode}`);
        await tap('pause-settings-button'); await audit('settings-screen', `-from-${mode}`);
        await tap('close-settings-button'); await visible('pause-screen');
        await tap('resume-button'); await visible('mobile-hud');
        await page.evaluate(() => window.__screenQA.finish(false, 'fall'));
        await audit('end-screen', `-${mode}`);
        if (mode === 'endless') {
          await tap('restart-button'); await visible('run-upgrades-screen'); await tap('confirm-run-button');
          await tap('pause-button'); await tap('pause-restart-button'); await visible('run-upgrades-screen'); await tap('confirm-run-button');
          await tap('pause-button'); await tap('pause-home-button');
        } else if (mode === 'arcade') {
          await tap('end-upgrades-button'); await visible('upgrades-screen'); await tap('close-upgrades-button');
        } else await tap('end-home-button');
        await visible('home-screen');
      }
      // Exit confirmation has no iOS entry point; inspect its shared layout only.
      await page.evaluate(() => window.__screenQA.openExitConfirm());
      await audit('exit-confirm-screen'); await tap('cancel-exit-button'); await visible('home-screen');
      assert.deepEqual(errors, [], `${name}: no browser errors`);
      console.log(`PASS navigation: ${name}`);
      await context.close();
    }
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify({ screens: reports, findings }, null, 2));
    assert.deepEqual(findings, [], `iPhone screen audit findings:\n${findings.join('\n')}`);
    console.log(`PASS ${reports.length} iPhone screen states, navigation and touch reachability`);
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
