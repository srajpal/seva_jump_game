const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'release-media');
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const file = path.resolve(root, `.${pathname}`);
  if (!file.startsWith(root + path.sep)) {
    res.writeHead(403);
    return res.end();
  }
  fs.readFile(file, (error, body) => {
    if (error) {
      res.writeHead(404);
      return res.end();
    }
    // The result screen needs a controlled run. Inject this inspection seam only
    // into the in-memory response, never into the shipped game.js file.
    if (pathname === '/game.js') {
      body = Buffer.from(body.toString().replace(/\}\)\(\);\s*$/, 'window.__mediaQa = { finish };})();'));
    }
    res.setHeader('Content-Type', ({
      '.html': 'text/html', '.js': 'application/javascript',
      '.css': 'text/css', '.png': 'image/png',
      '.webmanifest': 'application/manifest+json',
    })[path.extname(file)] || 'application/octet-stream');
    res.end(body);
  });
});

async function capture(page, name, visible) {
  if (visible) await page.locator(visible).waitFor({ state: 'visible' });
  await page.screenshot({ path: path.join(output, `${name}.png`) });
}

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
  try {
    const cover = await browser.newPage({ viewport: { width: 630, height: 500 } });
    await cover.goto(`${origin}/release-media/cover.html`);
    await cover.evaluate(() => Promise.all([...document.images].map(image => image.decode())));
    await cover.screenshot({ path: path.join(output, 'itch-cover-630x500.png') });
    await cover.close();

    const context = await browser.newContext({
      viewport: { width: 450, height: 800 }, isMobile: true,
      hasTouch: true, serviceWorkers: 'block',
    });
    const page = await context.newPage();
    await page.goto(`${origin}/index.html`);
    await page.evaluate(() => Promise.all([...document.images].map(image => image.decode())));
    await capture(page, 'home', '#home-screen');

    for (const menu of ['upgrades', 'badges', 'stats', 'settings', 'about']) {
      await page.locator(`#open-${menu}-button`).click();
      await capture(page, menu, `#${menu}-screen`);
      if (menu === 'settings') {
        await page.locator('#helping-hand-info').click();
        await capture(page, 'setting-info', '#info-screen');
        await page.locator('#close-info-button').click();
        await page.locator('#reset-progress-button').click();
        await capture(page, 'reset-confirm', '#reset-confirm-screen');
        await page.locator('#cancel-reset-button').click();
      }
      if (menu === 'about') {
        await page.locator('#open-privacy-button').click();
        await capture(page, 'privacy', '#privacy-screen');
        await page.locator('#close-privacy-button').click();
      }
      await page.locator(`#close-${menu}-button`).click();
    }

    await page.locator('#endless-button').click();
    await capture(page, 'tutorial', '#tutorial-screen');
    await page.locator('#tutorial-skip-button').click();
    await page.waitForTimeout(700);
    await capture(page, 'gameplay', '#game');
    await page.locator('#pause-button').click();
    await capture(page, 'pause', '#pause-screen');
    await page.locator('#resume-button').click();
    await page.evaluate(() => __mediaQa.finish(false, 'fall'));
    await page.locator('#end-screen').waitFor({ state: 'visible' });
    await capture(page, 'run-result', '#end-screen');
    await context.close();
    console.log('Captured cover and all current player-accessible screens.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => server.close());
