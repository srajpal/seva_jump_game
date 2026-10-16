/* Layout native screenshots inside vector marketing panels; never redraw gameplay.
 * Requires sharp (via NODE_PATH or the local installation).
 * Usage: node scripts/prepare-ios-store-artwork.cjs <capture-directory>
 * Input: raw/{phone,pad}/{arcade,challenge,hard,home}.png + metadata.json.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
const root = path.resolve(process.argv[2] || 'screenshots/app-store-1.0.11-build47');
const escape = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
const uri = p => `data:image/png;base64,${fs.readFileSync(p).toString('base64')}`;
const panels = [
  ['arcade', 'A skyward', 'adventure', 'Jump, collect & climb.'],
  ['challenge', 'Recover the', 'parshad', 'Collect all 50 in Challenge.'],
  ['hard', 'Ready for', 'Hard Mode?', 'Smaller platforms. Bigger challenge.'],
  ['home', 'Four ways', 'to play', 'Offline. No ads. No purchases.'],
];
async function render(svg, base) {
  fs.writeFileSync(base + '.svg', svg);
  await sharp(Buffer.from(svg)).flatten({ background: '#0b3444' }).removeAlpha().png().toFile(base + '.png');
}
(async () => {
  const manifest = { prepared: '2026-10-16', sourceVersion: '1.0.11', sourceBuild: '47', uploaded: false, files: [] };
  for (const kind of ['phone', 'pad']) {
    const w = kind === 'phone' ? 1206 : 2064, h = kind === 'phone' ? 2622 : 2752;
    const scale = kind === 'phone' ? 1 : 1.4, top = kind === 'phone' ? 360 : 470;
    fs.mkdirSync(path.join(root, kind), { recursive: true });
    const tiles = [];
    for (let i = 0; i < panels.length; i++) {
      const [id, line1, line2, sub] = panels[i];
      const source = path.join(root, 'raw', kind, id + '.png');
      const m = await sharp(source).metadata();
      const sh = h - top - 55, sw = sh * m.width / m.height, sx = (w - sw) / 2;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#0b3444"/><stop offset="1" stop-color="#176277"/></linearGradient></defs>
      <rect width="${w}" height="${h}" fill="url(#sky)"/>
      <g font-family="Arial, sans-serif" text-anchor="middle">
      <text x="${w/2}" y="${54*scale}" fill="#b9e3df" font-size="${25*scale}" letter-spacing="${5*scale}">SEVA JUMP</text>
      <text x="${w/2}" y="${149*scale}" fill="#ffda77" font-size="${88*scale}" font-weight="700">${escape(line1)}</text>
      <text x="${w/2}" y="${239*scale}" fill="#ffda77" font-size="${88*scale}" font-weight="700">${escape(line2)}</text>
      <text x="${w/2}" y="${304*scale}" fill="#f1f9f3" font-size="${36*scale}">${escape(sub)}</text></g>
      <rect x="${sx-6}" y="${top-6}" width="${sw+12}" height="${sh+12}" rx="8" fill="#76b4ba"/>
      <image href="${uri(source)}" x="${sx}" y="${top}" width="${sw}" height="${sh}" preserveAspectRatio="xMidYMid meet"/>
      </svg>`;
      const base=path.join(root,kind,`${String(i+1).padStart(2,'0')}-${id}`);
      await render(svg,base);
      const b=await sharp(base+'.png').resize({width:260}).png().toBuffer();
      tiles.push({input:b,left:i*280+10,top:10});
      manifest.files.push({file:path.relative(root,base+'.png'),width:w,height:h,source:path.relative(root,source),sourceSHA256:crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex'),sha256:crypto.createHash('sha256').update(fs.readFileSync(base+'.png')).digest('hex')});
    }
    await sharp({create:{width:1120,height:Math.ceil(h/w*260)+20,channels:3,background:'#e7f0ee'}}).composite(tiles).jpeg({quality:92}).toFile(path.join(root,kind+'-preview.jpg'));
  }
  const header=`<svg xmlns="http://www.w3.org/2000/svg" width="3840" height="1646">
  <defs><linearGradient id="bg"><stop stop-color="#bdebf4"/><stop offset="1" stop-color="#f8edc9"/></linearGradient></defs>
  <rect width="3840" height="1646" fill="url(#bg)"/>
  <circle cx="420" cy="1450" r="850" fill="#93d7e6" opacity=".35"/>
  <circle cx="3450" cy="200" r="900" fill="#fff9e5" opacity=".45"/>
  <image href="${uri(path.resolve('assets/seva-jump-logo.png'))}" x="650" y="140" width="1350" height="1100" preserveAspectRatio="xMidYMid meet"/>
  <g font-family="Arial, sans-serif" fill="#123d50" text-anchor="middle"><text x="1325" y="1350" font-size="80" font-weight="700">A skyward adventure</text><text x="1325" y="1470" font-size="52">Offline pixel platformer</text></g>
  <rect x="2450" y="64" width="715" height="1544" rx="35" fill="#0b3444"/>
  <image href="${uri(path.join(root,'raw/phone/arcade.png'))}" x="2465" y="80" width="685" height="1512" preserveAspectRatio="xMidYMid meet"/>
  </svg>`;
  await render(header,path.join(root,'header-3840x1646'));
  await sharp(path.join(root,'header-3840x1646.png')).resize({width:1200}).jpeg().toFile(path.join(root,'header-preview.jpg'));
  fs.writeFileSync(path.join(root,'artwork-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log('Created eight screenshot panels, header, previews and provenance manifest in '+root);
})().catch(e=>{console.error(e);process.exit(1);});
