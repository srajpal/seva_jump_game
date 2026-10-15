// Real-pixel regression: an empty decorative parshad cache must not hide the
// source bowl. The inspection seam exists only in the HTTP response under test.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'screenshots/parshad-render');
fs.mkdirSync(output, { recursive: true });
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404); return res.end(); }
    if (path.basename(file) === 'game.js') {
      if (process.env.TEST_GAME_SOURCE) data = fs.readFileSync(process.env.TEST_GAME_SOURCE);
      data = data.toString().replace(/\}\)\(\);\s*$/, 'window.__renderQA={draw,start,get state(){return state},collectibleGlows,parshadSprite};})();');
    }
    const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' }[path.extname(file)];
    res.setHeader('Content-Type', type || 'application/octet-stream'); res.end(data);
  });
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true });
    await page.addInitScript(() => {
      window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'ios', Plugins: {} };
      localStorage.setItem('seva-jump-profile', JSON.stringify({ tutorialComplete: true, music: false, sound: false }));
      // A controlled still scene lets pixel differences isolate the collectible.
      window.requestAnimationFrame = () => 0;
    });
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
    await page.waitForFunction(() => !!window.__renderQA?.collectibleGlows.parshad && !!window.__renderQA?.collectibleGlows.token);
    const report = await page.evaluate(() => {
      const qa = window.__renderQA; qa.start('endless');
      const state = qa.state;
      state.paused = true; state.cameraY = 0;
      state.platforms = []; state.powerups = []; state.enemies = []; state.particles = [];
      state.player.x = 225; state.player.y = 650; state.collectibles = [];
      const ctx = document.querySelector('canvas').getContext('2d');
      const region = () => ctx.getImageData(190, 270, 70, 60).data;
      qa.draw(); const background = new Uint8ClampedArray(region());
      const changedPixels = () => {
        const pixels = region(); let count = 0;
        for (let i = 0; i < pixels.length; i += 4) if (Math.abs(pixels[i] - background[i]) + Math.abs(pixels[i + 1] - background[i + 1]) + Math.abs(pixels[i + 2] - background[i + 2]) > 40) count++;
        return count;
      };
      state.collectibles = [{ x: 225, y: 300, type: 'parshad' }];
      qa.draw(); const normal = changedPixels();
      // Setting a canvas dimension clears its backing pixels but leaves the
      // cache object truthy: the exact failure our fallback must tolerate.
      const cache = qa.collectibleGlows.parshad; cache.width = cache.width;
      qa.draw(); const emptyCache = changedPixels();
      delete qa.collectibleGlows.parshad;
      qa.draw(); const absentCache = changedPixels();
      // Reproduce recovery after backgrounding and another render.
      window.dispatchEvent(new Event('blur')); window.dispatchEvent(new Event('focus'));
      qa.draw(); const afterFocus = changedPixels();
      return { normal, emptyCache, absentCache, afterFocus };
    });
    await page.screenshot({ path: path.join(output, 'bowl-without-cache.png') });
    for (const [name, pixels] of Object.entries(report)) assert.ok(pixels > 100, `${name}: bowl must be visibly painted, got ${pixels} changed pixels`);
    console.log('PASS parshad visibility:', report);
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
