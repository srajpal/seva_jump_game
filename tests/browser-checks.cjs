// Optional browser integration tests. Set PLAYWRIGHT_MODULE to a local
// Playwright installation and BROWSER_CHANNEL if not using installed Edge.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const engine = process.env.BROWSER_ENGINE || 'chromium';
const root = path.resolve(process.env.TEST_WEB_ROOT || path.join(__dirname, '..'));
const output = path.resolve(__dirname, '../screenshots/release-1.0.0', engine);
fs.mkdirSync(output, { recursive: true });
const reports = [];
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/frame.html') {
    res.setHeader('Content-Type', 'text/html');
    return res.end(`<button id="outside">Outside game</button><iframe width="500" height="650" src="http://127.0.0.1:${server.address().port}/inspect/index.html" sandbox="allow-scripts allow-same-origin allow-popups" allow="autoplay; fullscreen"></iframe>`);
  }
  if (url.pathname.endsWith('/')) { res.writeHead(403); return res.end('No directory listing'); }
  const inspect = url.pathname.startsWith('/inspect/');
  const relative = url.pathname.replace(/^\/(?:inspect|game)\//, '');
  const file = path.resolve(root, relative);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404); return res.end(); }
    if (inspect && path.basename(file) === 'game.js') data = data.toString().replace(/\}\)\(\);\s*$/, 'window.__qa={get state(){return state},get profile(){return profile},get pointer(){return pointerX},get keys(){return [...keys]},update,draw,finish,triggerBirdHit,resolveBirdHit,triggerFalconSave,set time(t){lastTime=t}};})();');
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
});
const check = (name, details = {}) => { reports.push({ name, passed: true, ...details }); console.log(`PASS ${name}`); };
async function canvasWork(page) {
  return page.evaluate(async () => {
    const frame = () => new Promise(resolve => requestAnimationFrame(resolve));
    await frame(); await frame(); // Allow a requested menu repaint to settle.
    const prototype = CanvasRenderingContext2D.prototype;
    const drawImage = prototype.drawImage, shadowBlur = Object.getOwnPropertyDescriptor(prototype, 'shadowBlur');
    let images = 0, shadows = 0;
    prototype.drawImage = function(...args) { images++; return drawImage.apply(this, args); };
    Object.defineProperty(prototype, 'shadowBlur', { ...shadowBlur, set(value) { shadows++; shadowBlur.set.call(this, value); } });
    try { for (let i = 0; i < 12; i++) await frame(); }
    finally { prototype.drawImage = drawImage; Object.defineProperty(prototype, 'shadowBlur', shadowBlur); }
    return { images, shadows };
  });
}
(async () => {
  await new Promise(resolve => server.listen(0, '0.0.0.0', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await playwright[engine].launch({ ...(engine === 'chromium' ? { channel: process.env.BROWSER_CHANNEL || 'msedge' } : {}), headless: true, timeout: 30000 });
  try {
    for (const [name, width, height, touch] of [['desktop',1280,720,false],['embed',500,800,false],['small-phone',320,568,true],['phone',390,844,true],['tablet',768,1024,true],['landscape',844,390,true]]) {
      const context = await browser.newContext({ viewport: { width, height }, isMobile: touch && engine !== 'firefox', hasTouch: touch, serviceWorkers: 'block' });
      const page = await context.newPage(); const errors = []; page.on('pageerror', e => { errors.push(e.message); console.error(`${engine}/${name}: ${e.message}`); });
      await page.goto(`${origin}/inspect/index.html`);
      const layout = await page.evaluate(() => {
        const home = document.querySelector('#home-screen').getBoundingClientRect(), title = document.querySelector('h1').getBoundingClientRect(), canvas = document.querySelector('canvas').getBoundingClientRect();
        return { width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight, homeTop: home.top, titleTop: title.top, canvasBottom: canvas.bottom };
      });
      assert(layout.scrollWidth <= width + 1 && layout.scrollHeight <= height + 1, `${name}: document fits viewport`);
      assert(layout.titleTop >= layout.homeTop, `${name}: home title is not clipped above scroll area`);
      assert(layout.canvasBottom <= height + 1, `${name}: complete canvas fits`);
      await page.screenshot({ path: path.join(output, `${name}-home.png`) });
      assert.equal((await canvasWork(page)).images, 0, `${name}: Home stops drawing images after its initial frame`);
      for (const menu of ['upgrades','badges','stats','about','settings']) {
        await page.locator(`#open-${menu}-button`).click();
        assert(await page.locator(`#${menu}-screen`).isVisible());
        assert.equal(await page.locator(`#${menu}-screen`).evaluate(el=>el.scrollTop),0, `${menu} opens at the top`);
        assert.equal((await canvasWork(page)).images, 0, `${name}: ${menu} does not redraw continuously`);
        await page.locator(`#close-${menu}-button`).click();
      }
      await page.locator('#endless-button').click(); await page.keyboard.press('Escape');
      assert(await page.evaluate(() => __qa.state.paused && !document.querySelector('#tutorial-screen').classList.contains('hidden')), `tutorial stays paused: ${JSON.stringify(errors)}`);
      await page.locator('#tutorial-skip-button').click();
      const activeCanvas = await canvasWork(page);
      assert.ok(activeCanvas.images > 0, `${name}: active gameplay still renders`);
      assert.equal(activeCanvas.shadows, 0, `${name}: active frames never assign shadowBlur`);
      await page.screenshot({ path: path.join(output, `${name}-cached-glows.png`) });
      check(`idle canvas and cached collectible glow: ${name}`, activeCanvas);
      if (name === 'desktop') {
        await page.keyboard.down('a'); assert.deepEqual(await page.evaluate(() => __qa.keys), ['ArrowLeft']); await page.keyboard.up('a');
        await page.keyboard.down('D'); assert.deepEqual(await page.evaluate(() => __qa.keys), ['ArrowRight']); await page.keyboard.up('D');
        await page.locator('#fullscreen-button').click();
        await page.waitForFunction(() => document.fullscreenElement === document.querySelector('.game-frame'));
        const fullscreen = await page.evaluate(() => { const c = document.querySelector('canvas'), r = c.getBoundingClientRect(); return { width: r.width, height: r.height, ratio: c.width / c.height }; });
        assert.ok(Math.abs(fullscreen.width / fullscreen.height - fullscreen.ratio) < .01, 'fullscreen preserves canvas aspect ratio');
        await page.screenshot({ path: path.join(output, 'desktop-fullscreen.png') });
        await page.locator('#pause-button').click(); assert(await page.locator('#pause-screen').isVisible(), 'HTML controls work in fullscreen');
        await page.locator('#resume-button').click(); await page.locator('#fullscreen-button').click();
        await page.waitForFunction(() => !document.fullscreenElement);
        check('A/D input and fullscreen enter/pause/resume/exit');
      } else if (touch) assert.equal(await page.locator('#fullscreen-button').isVisible(), false);
      await page.locator('#pause-button').click(); await page.locator('#pause-settings-button').click(); await page.keyboard.press('Escape');
      assert(await page.evaluate(() => __qa.state.paused && !document.querySelector('#settings-screen').classList.contains('hidden')));
      await page.locator('#close-settings-button').focus(); await page.keyboard.press('Tab');
      assert(await page.evaluate(() => document.querySelector('#settings-screen').contains(document.activeElement)));
      await page.locator('#close-settings-button').click(); await page.locator('#resume-button').click();
      const coordinates = await page.evaluate(() => { const c=document.querySelector('canvas'),r=c.getBoundingClientRect(),scale=Math.min(r.width/c.width,r.height/c.height);return { x:r.left+(r.width-c.width*scale)/2+c.width*scale/4, y:r.top+40, expected:c.width/4 }; });
      await page.mouse.move(coordinates.x,coordinates.y); await page.mouse.down();
      const actualPointer = await page.evaluate(() => __qa.pointer);
      assert(actualPointer !== null && Math.abs(actualPointer - coordinates.expected) < 2, `${name}: pointer maps drawing: ${actualPointer} vs ${coordinates.expected}`);
      await page.mouse.up();
      await page.keyboard.down('ArrowRight'); await page.evaluate(() => window.dispatchEvent(new Event('blur'))); await page.keyboard.up('ArrowRight');
      assert(await page.evaluate(() => __qa.state.paused && __qa.keys.length===0 && __qa.pointer===null));
      await page.locator('#pause-home-button').click();
      await page.locator('#challenge-button').click();
      const missedBowl = await page.evaluate(() => {
        const state = __qa.state, canvas = document.querySelector('canvas'), context = canvas.getContext('2d');
        Object.assign(state, { cameraY: 0, score: 100, parshad: 6, nextY: -10000, platforms: [], enemies: [], powerups: [] });
        Object.assign(state.player, { x: canvas.width / 2, y: 400, vx: 0, vy: 0 });
        state.collectibles = [{ x: 100, y: canvas.height + 61, type: 'parshad', challengeBowl: true }];
        __qa.update(0);
        state.paused = true; // Freeze the controlled scene for visual review.
        const painted = [], fillText = context.fillText;
        context.fillText = function(text, x, y, ...rest) { painted.push({ text, x, y, width: this.measureText(text).width }); return fillText.call(this, text, x, y, ...rest); };
        try { __qa.draw(); } finally { context.fillText = fillText; }
        const warning = painted.find(item => item.text === state.message);
        const rect = canvas.getBoundingClientRect(), scale = Math.min(rect.width / canvas.width, rect.height / canvas.height);
        const warningTop = rect.top + (rect.height - canvas.height * scale) / 2 + (warning.y - 15) * scale;
        return { missed: state.challengeMissed, warning, warningTop, pauseBottom: document.querySelector('#pause-button').getBoundingClientRect().bottom, canvasWidth: canvas.width, mobile: matchMedia('(pointer: coarse)').matches, painted };
      });
      assert.equal(missedBowl.missed, true);
      assert.equal(missedBowl.warning?.text, 'A bowl was missed - restart to collect all 50');
      assert.ok(missedBowl.warningTop > missedBowl.pauseBottom, `${name}: missed-bowl warning clears the pause button`);
      assert.ok(missedBowl.warning.x - missedBowl.warning.width / 2 >= 0 && missedBowl.warning.x + missedBowl.warning.width / 2 <= missedBowl.canvasWidth, `${name}: missed-bowl warning fits the canvas`);
      if (missedBowl.mobile) {
        assert.equal(await page.locator('#mobile-mode').textContent(), 'CHALLENGE · 6/50 · MISSED');
        const badge = await page.locator('#mobile-mode').boundingBox();
        assert.ok(badge && badge.x >= 0 && badge.x + badge.width <= width, `${name}: missed-bowl HUD fits`);
      } else assert.ok(missedBowl.painted.some(item => item.text.includes('6 / 50 · MISSED')));
      await page.screenshot({ path: path.join(output, `${name}-challenge-missed.png`) });
      await page.locator('#pause-button').click();
      await page.locator('#pause-restart-button').click();
      assert.equal(await page.evaluate(() => __qa.state.challengeMissed), false, 'Restart run clears missed-bowl feedback');
      await page.locator('#pause-button').click();
      await page.locator('#pause-home-button').click();
      check(`Challenge missed-bowl warning and restart: ${name}`);
      if (name === 'desktop') {
        await page.locator('canvas').focus(); await page.keyboard.press('Enter');
        assert(await page.evaluate(() => __qa.state.running && __qa.state.mode === 'endless'));
        await page.evaluate(() => __qa.finish(false, 'fall'));
        await page.locator('#end-screen').waitFor({ state: 'visible' });
        assert.equal((await canvasWork(page)).images, 0, 'the result menu stops drawing after the loss animation');
        await page.locator('#end-home-button').click();
        assert.equal((await canvasWork(page)).images, 0, 'returning Home after a result stays idle');
        check('result menu and return Home stop drawing');
      }
      await page.locator('.scene-boy').click(); await page.locator('#open-settings-button').click();
      await page.locator('#reset-progress-button').click(); await page.locator('#confirm-reset-button').click();
      assert(await page.evaluate(() => __qa.profile.character==='girl' && document.querySelector('.scene-girl').getAttribute('aria-pressed')==='true'));
      if (name === 'desktop') {
        await context.route('https://www.khalsagamestudio.com/**', route=>route.fulfill({contentType:'text/html',body:'<title>Studio link test</title>'}));
        const popupPromise=page.waitForEvent('popup'); await page.locator('.studio-home-link').click();
        const popup=await popupPromise; await popup.waitForLoadState();
        assert(page.url().startsWith(origin), 'studio link keeps the game open');
        assert.equal(await popup.evaluate(()=>window.opener),null,'external tab cannot access the game');
        await popup.close();
      }
      assert.deepEqual(errors, [], `${name}: no page errors`);
      check(`layout and core journeys: ${name}`, layout); await context.close();
    }
    const fallbackContext = await browser.newContext({ serviceWorkers: 'block' });
    await fallbackContext.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
    const fallbackPage = await fallbackContext.newPage(), fallbackErrors = [];
    fallbackPage.on('pageerror', error => fallbackErrors.push(error.message));
    await fallbackPage.goto(`${origin}/game/index.html`);
    assert(await fallbackPage.locator('#canvas-warning').isVisible());
    assert(await fallbackPage.locator('#endless-button').isDisabled());
    assert.deepEqual(fallbackErrors, []); check('missing canvas context shows an accessible fallback');
    await fallbackContext.close();
    for (const denied of ['getItem','setItem','removeItem']) {
      const context = await browser.newContext({ serviceWorkers:'block' });
      await context.addInitScript(method => { Storage.prototype[method] = () => { throw new DOMException('Denied','SecurityError'); }; }, denied);
      const page = await context.newPage(), errors=[]; page.on('pageerror', e=>errors.push(e.message));
      await page.goto(`${origin}/inspect/index.html`); await page.locator('#arcade-button').click(); await page.locator('#tutorial-skip-button').click();
      assert(await page.evaluate(()=>__qa.state.running && !__qa.state.paused));
      await page.locator('#pause-button').click(); await page.locator('#pause-settings-button').click(); await page.locator('#reset-progress-button').click(); await page.locator('#confirm-reset-button').click();
      assert(await page.locator('#home-screen').isVisible());
      assert.equal(await page.locator('#storage-warning').isVisible(), denied === 'removeItem');
      await page.locator('.scene-boy').click();
      assert.equal(await page.locator('#storage-warning').isVisible(), denied !== 'getItem');
      assert.deepEqual(errors,[]);
      check(`storage denied: ${denied}`); await context.close();
    }
    const context = await browser.newContext({ serviceWorkers:'block' }), page = await context.newPage();
    await page.goto(`${origin.replace('127.0.0.1','localhost')}/frame.html`);
    const frame = page.frameLocator('iframe'); await frame.locator('#endless-button').click(); await frame.locator('#tutorial-skip-button').click();
    await page.locator('#outside').click(); assert(await frame.locator('#pause-screen').isVisible());
    check('cross-origin iframe focus loss pauses'); await context.close();

    // Unmodified game from the exact TEST_WEB_ROOT, directory requests denied.
    if (process.env.SKIP_OFFLINE === '1') {
      reports.push({ name:'offline check', passed:false, status:'not run', reason:'Explicit SKIP_OFFLINE setting; verify separately on the target browser.' });
      console.log('NOT RUN offline check (explicit SKIP_OFFLINE)');
      return;
    }
    const offlineContext = await browser.newContext(), offlinePage = await offlineContext.newPage(), offlineErrors=[];
    offlinePage.on('pageerror',e=>offlineErrors.push(e.message));
    await offlinePage.goto(`${origin}/game/index.html`);
    await offlinePage.evaluate(()=>navigator.serviceWorker.ready);
    await offlineContext.setOffline(true); await offlinePage.reload();
    assert.equal(await offlinePage.evaluate(()=>typeof SEVA_RULES),'object');
    await offlinePage.locator('#endless-button').click(); await offlinePage.locator('#tutorial-skip-button').click();
    await offlinePage.locator('#pause-button').click(); assert(await offlinePage.locator('#pause-screen').isVisible());
    assert.deepEqual(offlineErrors,[]); check('first-visit offline actual game with directory URLs denied'); await offlineContext.close();
  } catch (error) {
    const failurePage=browser.contexts().flatMap(context=>context.pages()).at(-1);
    if(failurePage) await failurePage.screenshot({path:path.join(output,'failure.png'),fullPage:true}).catch(()=>{});
    throw error;
  } finally { await browser.close(); }
})().catch(error=>{reports.push({name:'suite failure',passed:false,error:error.message});console.error(error);process.exitCode=1;}).finally(()=>{fs.writeFileSync(path.join(output,'browser-results.json'), JSON.stringify(reports,null,2));server.close();});
