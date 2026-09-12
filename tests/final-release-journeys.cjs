// Final packaged-candidate journeys in Edge. Run completion is driven through
// an in-memory QA seam; mode entry, persistence, menus, and purchases use the UI.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const root = path.resolve(process.env.TEST_WEB_ROOT || path.join(__dirname, '../dist/final-verification'));
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  if (pathname.endsWith('/')) { response.writeHead(403); return response.end('Directory requests disabled'); }
  const relative = pathname.replace(/^\//, '');
  const file = path.resolve(root, relative);
  if (!file.startsWith(root + path.sep)) { response.writeHead(403); return response.end(); }
  fs.readFile(file, (error, contents) => {
    if (error) { response.writeHead(404); return response.end(); }
    if (relative === 'game.js') {
      contents = contents.toString()
        .replace('const resultDelay = completed ? config.victorySceneDurationMs : 2800;', 'const resultDelay = 25;')
        .replace(/\}\)\(\);\s*$/, `window.__releaseQa = {
          get state() { return state; }, get profile() { return profile; },
          finish, awardBadge, renderBadges, updateUpgradeUI, saveProfile
        };})();`);
    }
    response.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    response.end(contents);
  });
});

async function openMode(page, character, mode) {
  await page.locator(`.scene-${character}`).click();
  await page.locator(`#${mode}-button`).click();
  await page.waitForFunction(() => window.__releaseQa?.state?.running);
  assert.equal(await page.evaluate(() => __releaseQa.state.player.character), character);
  assert.equal(await page.evaluate(() => __releaseQa.state.mode), mode);
}

async function controlledResult(page, { character, mode, completed, reason, score, height, parshad, tokens, heading }) {
  await openMode(page, character, mode);
  await page.evaluate(values => {
    Object.assign(__releaseQa.state, {
      score: values.score, heightScore: values.height, parshad: values.parshad, tokens: values.tokens,
    });
    __releaseQa.finish(values.completed, values.reason);
  }, { completed, reason, score, height, parshad, tokens });
  await page.locator('#end-screen').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#end-heading').textContent(), heading);
  assert.equal(await page.locator('#end-score').textContent(), `Score ${score}`);
  assert.match(await page.locator('#run-breakdown').textContent(), new RegExp(`${height}Height.*${parshad}Parshad.*${tokens}Khanda earned`));
  await page.locator('#end-home-button').click();
}

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await playwright.chromium.launch({ channel: 'msedge', headless: true, timeout: 30000 });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
    await context.addInitScript(() => {
      if (localStorage.getItem('seva-jump-profile') === null) localStorage.setItem('seva-jump-profile', JSON.stringify({ tutorialComplete: true }));
    });
    let page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}/index.html`);

    await page.locator('#open-settings-button').click();
    await page.locator('#music-toggle').uncheck();
    await page.locator('#sound-toggle').uncheck();
    await page.locator('#reduced-motion-toggle').check();
    await page.locator('#close-settings-button').click();
    await page.reload();
    await page.locator('#open-settings-button').click();
    assert.equal(await page.locator('#music-toggle').isChecked(), false);
    assert.equal(await page.locator('#sound-toggle').isChecked(), false);
    assert.equal(await page.locator('#reduced-motion-toggle').isChecked(), true);
    assert(await page.locator('html').evaluate(node => node.classList.contains('reduced-motion')));
    await page.locator('#close-settings-button').click();

    await page.evaluate(() => { __releaseQa.profile.tokens = 40; __releaseQa.updateUpgradeUI(); __releaseQa.saveProfile(); });
    await page.locator('#open-upgrades-button').click();
    await page.locator('#buy-falcon').click();
    await page.locator('#buy-shield').click();
    await page.locator('#buy-power').click();
    assert.equal(await page.locator('#wallet-count').textContent(), '7');
    assert.equal(await page.locator('#falcon-owned').textContent(), 'Owned: 1');
    assert.equal(await page.locator('#shield-owned').textContent(), 'Owned: 1');
    assert.equal(await page.locator('#power-owned').textContent(), 'Level: 1 / 5');
    await page.locator('#close-upgrades-button').click();
    await page.reload();
    await page.locator('#open-upgrades-button').click();
    assert.equal(await page.locator('#wallet-count').textContent(), '7');
    assert.equal(await page.locator('#power-owned').textContent(), 'Level: 1 / 5');
    await page.locator('#close-upgrades-button').click();

    await page.evaluate(() => { ['sky-starter', 'tokens-10'].forEach(__releaseQa.awardBadge); __releaseQa.renderBadges(); });
    await page.locator('#open-badges-button').click();
    assert.equal(await page.locator('#badge-count').textContent(), '2 of 10 earned');
    assert.equal(await page.locator('.badge-card:not(.locked)').count(), 2);
    await page.locator('#close-badges-button').click();

    await controlledResult(page, { character: 'girl', mode: 'arcade', completed: true, reason: 'finish', score: 1000, height: 997, parshad: 18, tokens: 2, heading: 'Arcade complete!' });
    await controlledResult(page, { character: 'girl', mode: 'challenge', completed: true, reason: 'finish', score: 913, height: 900, parshad: 50, tokens: 1, heading: 'Challenge complete!' });
    await controlledResult(page, { character: 'boy', mode: 'endless', completed: false, reason: 'fall', score: 321, height: 300, parshad: 7, tokens: 1, heading: 'Run complete' });
    await controlledResult(page, { character: 'boy', mode: 'hard', completed: false, reason: 'bird', score: 222, height: 210, parshad: 3, tokens: 0, heading: 'Run complete' });

    await page.locator('#open-stats-button').click();
    assert.match(await page.locator('#stats-summary').textContent(), /4Runs/);
    assert.match(await page.locator('#death-breakdown').textContent(), /1Falls.*1Bird collisions/);
    await page.locator('#close-stats-button').click();
    await page.reload();
    assert.match(await page.locator('#home-records').textContent(), /Endless 321.*Arcade 1000.*Challenge 913.*Hard 222/);
    assert.equal(await page.locator('.scene-boy').getAttribute('aria-pressed'), 'true');
    assert.deepEqual(errors, []);
    console.log('PASS final Edge journeys: preferences, upgrades, badges, both characters, all modes, controlled win/loss results, stats, reload persistence');
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; server.close(); });
