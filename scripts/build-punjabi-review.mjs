// Review-only instrumentation lives in generated output, never the release payload.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { loadPayload, createZip } from './build-itch.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'dist/punjabi-review');
const { changes } = JSON.parse(await readFile(resolve(root, 'docs/punjabi-review-changes.json'), 'utf8'));
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
function marked(change) {
  let cursor = 0, result = '';
  for (const [start, end] of change.ranges) {
    result += escape(change.after.slice(cursor, start)) + '<mark>' + escape(change.after.slice(start, end)) + '</mark>';
    cursor = end;
  }
  return result + escape(change.after.slice(cursor));
}
const review = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Punjabi second review</title><style>@font-face{font-family:Punjabi;src:url(assets/fonts/NotoSansGurmukhi.ttf)}*{box-sizing:border-box}body{margin:20px auto;padding:16px;max-width:900px;font:18px/1.7 system-ui}p[lang]{font-family:Punjabi,sans-serif}article{border-top:1px solid #aaa;padding:20px 0;overflow-wrap:anywhere}mark{background:#ffe16a;color:#171717}small{font-size:13px}a{color:#174a80}</style><h1>Punjabi second review</h1><p>1.0.13 / build 51 review variant • October 22, 2026</p><p>35 revised entries. Yellow marks show new or replacement words compared with the original draft. The previous line also shows wording removed from the revision. Punjabi approval is pending; Hindi review remains pending.</p><p><a href="index.html">Open highlighted game</a></p>${changes.map((c, i) => `<article><h2>${i + 1}. ${escape(c.en)}</h2><small>${escape(c.id)}</small><p>Previous draft</p><p lang="pa-Guru">${escape(c.before)}</p><p>Revised for review</p><p lang="pa-Guru">${marked(c)}</p></article>`).join('')}</html>`;
const instrumentation = `(() => {
  const changes = ${JSON.stringify(changes)};
  const byText = new Map(changes.map(c => [c.after, c]));
  const style = document.createElement('style');
  style.textContent = '.punjabi-review-word{background:#ffe16a!important;color:#171717!important;border-radius:2px}.punjabi-review-link{position:fixed;right:4px;top:4px;z-index:99999;background:#ffe16a;color:#171717;padding:3px 7px;border:1px solid #171717;border-radius:4px;font:12px system-ui}';
  document.head.append(style);
  const link = document.createElement('a'); link.href = 'review.html'; link.className = 'punjabi-review-link'; link.textContent = 'Punjabi review · 35 edits'; document.body.append(link);
  let pending = false;
  const observer = new MutationObserver(() => { if (!pending) { pending = true; requestAnimationFrame(highlight); } });
  function highlight() {
    pending = false; observer.disconnect();
    if (document.documentElement.lang === 'pa-Guru') {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      for (const node of nodes) {
        if (node.parentElement.closest('mark,script,style,option,textarea')) continue;
        const c = byText.get(node.textContent); if (!c) continue;
        const fragment = document.createDocumentFragment(); let cursor = 0;
        for (const [start, end] of c.ranges) {
          fragment.append(document.createTextNode(c.after.slice(cursor, start)));
          const mark = document.createElement('mark'); mark.className = 'punjabi-review-word'; mark.textContent = c.after.slice(start, end); fragment.append(mark); cursor = end;
        }
        fragment.append(document.createTextNode(c.after.slice(cursor))); node.replaceWith(fragment);
      }
    }
    observer.observe(document.body, {subtree:true, childList:true, characterData:true});
  }
  // Canvas text cannot contain HTML marks. Paint the revised word backgrounds
  // behind the original shaped text without altering its metrics or placement.
  const original = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function(text, x, y, maxWidth) {
    if (document.documentElement.lang === 'pa-Guru') {
      const c = byText.get(String(text));
      if (c) {
        const width = this.measureText(text).width;
        const scale = maxWidth && width > maxWidth ? maxWidth / width : 1;
        const align = this.textAlign;
        const left = x - (align === 'center' ? width * scale / 2 : ['right','end'].includes(align) ? width * scale : 0);
        const metrics = this.measureText(text), size = parseFloat(this.font.match(/[\\d.]+px/)?.[0]) || 16;
        const ascent = metrics.actualBoundingBoxAscent || size, descent = metrics.actualBoundingBoxDescent || size * .25;
        this.save(); this.fillStyle = '#ffe16a';
        for (const [start,end] of c.ranges) this.fillRect(left + this.measureText(text.slice(0,start)).width * scale, y - ascent - 2, (this.measureText(text.slice(0,end)).width - this.measureText(text.slice(0,start)).width) * scale, ascent + descent + 4);
        this.restore(); this.save(); this.fillStyle = '#171717';
        if (maxWidth === undefined) original.call(this,text,x,y); else original.call(this,text,x,y,maxWidth);
        this.restore(); return;
      }
    }
    if (maxWidth === undefined) original.call(this,text,x,y); else original.call(this,text,x,y,maxWidth);
  };
  globalThis.SevaI18n.setLanguage('pa-Guru'); highlight();
})();`;
const entries = await loadPayload(root);
for (const entry of entries) {
  if (['index.html', 'privacy.html'].includes(entry.name)) {
    entry.data = Buffer.from(entry.data.toString().replace('</body>', '<script src="punjabi-review.js"></script></body>'));
  }
  // A review package must not install the production service worker cache.
  if (entry.name === 'sw.js') entry.data = Buffer.from("self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',event=>event.waitUntil(self.registration.unregister()));");
}
entries.push({name:'punjabi-review.js',data:Buffer.from(instrumentation)}, {name:'review.html',data:Buffer.from(review)});
for (const {name,data} of entries) { const target = resolve(output,name); await mkdir(dirname(target),{recursive:true}); await writeFile(target,data); }
const zip = createZip(entries), archive = resolve(root,'dist/SevaJump-1.0.13-Punjabi-Second-Review.zip');
await writeFile(archive,zip);
await writeFile(archive+'.sha256',createHash('sha256').update(zip).digest('hex')+'  SevaJump-1.0.13-Punjabi-Second-Review.zip\n');
console.log('Built '+archive+' with '+changes.length+' revised entries.');
