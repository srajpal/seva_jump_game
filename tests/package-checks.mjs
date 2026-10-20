import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { inflateRawSync } from 'node:zlib';
import { runInNewContext } from 'node:vm';
import { loadPayload, createZip } from '../scripts/build-itch.mjs';

const entries = await loadPayload();
const names = entries.map(e => e.name);
async function folderFiles(directory, prefix = '') {
  const result = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const relative = prefix + item.name;
    if (item.isDirectory()) result.push(...await folderFiles(new URL(item.name + '/', directory), relative + '/'));
    else result.push(relative);
  }
  return result.sort();
}
for (const folder of ['assets', 'locales']) {
  assert.deepEqual(await folderFiles(new URL(`../${folder}/`, import.meta.url)), names.filter(name => name.startsWith(folder + '/')).map(name => name.slice(folder.length + 1)).sort(), `iOS ${folder} folder contains only allowlisted runtime files`);
}
const iosProject = await readFile(new URL('../ios/SevaJump.xcodeproj/project.pbxproj', import.meta.url), 'utf8');
assert(!/path\s*=\s*"?\.\.\/design/.test(iosProject), 'design variants stay outside the iOS bundle');
for (const resource of ['i18n.js', 'localization.css', 'locales', 'assets']) {
  assert(iosProject.includes(`/* ${resource} in Resources */`), `iOS bundles ${resource}`);
  assert(iosProject.includes(`path = ../${resource};`), `iOS references authoritative ${resource}`);
}
assert.equal(new Set(names).size, names.length, 'No duplicate paths');
assert.equal(new Set(names.map(n => n.toLowerCase())).size, names.length, 'No case-colliding paths');
assert(names.includes('index.html'), 'index.html must be at archive root');
assert(names.every(n => !/^(node_modules|android|ios|screenshots|\.git)\//.test(n)), 'Only runtime files ship');
const zip = createZip(entries);
assert.deepEqual(createZip(entries), zip, 'Unchanged sources must produce identical ZIP bytes');
// Independently read each ZIP local record and decompress the payload.
let offset = 0;
for (const entry of entries) {
  assert.equal(zip.readUInt32LE(offset), 0x04034b50);
  assert.equal(zip.readUInt16LE(offset + 8), 8, 'DEFLATE compression');
  const compressedSize = zip.readUInt32LE(offset + 18), nameLength = zip.readUInt16LE(offset + 26);
  assert.equal(zip.readUInt32LE(offset + 22), entry.data.length);
  const dataStart = offset + 30 + nameLength;
  assert.equal(zip.subarray(offset + 30, dataStart).toString(), entry.name);
  assert.deepEqual(inflateRawSync(zip.subarray(dataStart, dataStart + compressedSize)), entry.data, entry.name);
  offset = dataStart + compressedSize;
}
assert.equal(zip.readUInt32LE(offset), 0x02014b50, 'Central directory follows payload');
assert.equal(zip.readUInt32LE(zip.length - 22), 0x06054b50);
assert.equal(zip.readUInt16LE(zip.length - 12), entries.length);
assert.equal(zip.readUInt32LE(zip.length - 6), offset);

const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
const html = entries.find(e => e.name === 'index.html').data.toString();
for (const document of ['index.html', 'privacy.html']) {
  const source = entries.find(entry => entry.name === document).data.toString();
  for (const match of source.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    if (/^(https?:|mailto:)/.test(match[1])) continue;
    assert(names.includes(match[1].split('?')[0]), `${document}: packaged dependency ${match[1]}`);
  }
}
const versionElement = html.match(/<p\b(?=[^>]*\bclass="[^"]*\bgame-version\b[^"]*")[^>]*>v([^ |<]+)/);
assert.ok(versionElement, 'Visible game version label exists');
assert.equal(versionElement[1], pkg.version, 'Visible web version');
assert.equal(versionElement[0].match(/\saria-label="Game version ([^"]+)"/)?.[1], pkg.version, 'Accessible English web version');
const versionKey = versionElement[0].match(/\sdata-i18n-aria-label="([^"]+)"/)?.[1];
assert.ok(versionKey, 'Game version accessible label has a translation key');
for (const locale of ['en', 'hi', 'pa-Guru']) {
  const context = {};
  runInNewContext(entries.find(entry => entry.name === `locales/ui-${locale}.js`).data.toString(), context);
  const label = context.SevaJumpCatalogs[locale][versionKey];
  assert.equal(label?.match(/\d+\.\d+\.\d+/)?.[0], pkg.version, `${locale}: accessible version matches candidate`);
}
assert.ok([...html.matchAll(/\?v=([^"']+)/g)].length >= 4, 'Versioned web references exist');
for (const match of html.matchAll(/\?v=([^"']+)/g)) assert.equal(match[1], pkg.version);
const worker = entries.find(e => e.name === 'sw.js').data.toString();
assert.equal(worker.match(/const RELEASE_VERSION = '([^']+)'/)?.[1], pkg.version, 'Worker cache must match candidate version');
for (const [file, pattern, minimum] of [
  ['android/app/build.gradle', /\bversionName\s+"([^"]+)"/g, 1],
  ['ios/SevaJump/App/Info.plist', /<key>CFBundleShortVersionString<\/key>\s*<string>([^<]+)<\/string>/g, 1],
  ['ios/SevaJump.xcodeproj/project.pbxproj', /\bMARKETING_VERSION\s*=\s*"?([^";\s]+)"?\s*;/g, 2],
]) {
  const source = await readFile(new URL('../' + file, import.meta.url), 'utf8');
  const versions = [...source.matchAll(pattern)];
  assert.ok(versions.length >= minimum, `${file}: native version declarations exist`);
  for (const match of versions) assert.equal(match[1], pkg.version, `${file}: version must match package.json`);
}
for (const match of worker.matchAll(/'\.\/([^']+)'/g)) assert(names.includes(match[1]), `Packaged precache file: ${match[1]}`);
for (const name of names.filter(name => /^(?:locales\/|assets\/fonts\/|i18n\.js$|localization\.css$)/.test(name))) {
  assert(worker.includes(`'./${name}'`), `Offline precache includes ${name}`);
}
function fontCodepoints(font) {
  // Read Unicode cmap formats 4/12 using the TrueType directory. This catches
  // accidental Latin-only/subset downloads without adding a font dependency.
  let cmap;
  for (let i = 0; i < font.readUInt16BE(4); i++) {
    const table = 12 + i * 16;
    if (font.toString('ascii', table, table + 4) === 'cmap') cmap = font.readUInt32BE(table + 8);
  }
  assert.ok(cmap, 'Font has a character map');
  const points = new Set();
  for (let i = 0; i < font.readUInt16BE(cmap + 2); i++) {
    const subtable = cmap + font.readUInt32BE(cmap + 4 + i * 8 + 4);
    const format = font.readUInt16BE(subtable);
    if (format === 12) {
      for (let j = 0; j < font.readUInt32BE(subtable + 12); j++) {
        const group = subtable + 16 + j * 12;
        const start = font.readUInt32BE(group), end = font.readUInt32BE(group + 4), glyph = font.readUInt32BE(group + 8);
        for (let point = start; point <= end; point++) if (glyph + point - start) points.add(point);
      }
    } else if (format === 4) {
      const segments = font.readUInt16BE(subtable + 6) / 2;
      const ends = subtable + 14, starts = ends + segments * 2 + 2;
      const deltas = starts + segments * 2, offsets = deltas + segments * 2;
      for (let j = 0; j < segments; j++) {
        const end = font.readUInt16BE(ends + j * 2), start = font.readUInt16BE(starts + j * 2);
        const delta = font.readInt16BE(deltas + j * 2), range = font.readUInt16BE(offsets + j * 2);
        for (let point = start; point <= end && point < 0xffff; point++) {
          let glyph = range ? font.readUInt16BE(offsets + j * 2 + range + (point - start) * 2) : point;
          if (!range || glyph) glyph = (glyph + delta) & 0xffff;
          if (glyph) points.add(point);
        }
      }
    }
  }
  return points;
}
for (const [family, locale, low, high] of [['Devanagari', 'hi', 0x900, 0x97f], ['Gurmukhi', 'pa-Guru', 0xa00, 0xa7f]]) {
  const font = entries.find(entry => entry.name === `assets/fonts/NotoSans${family}.ttf`).data;
  assert.equal(font.readUInt32BE(0), 0x00010000, `${family}: real TrueType font header`);
  const codepoints = fontCodepoints(font), context = {};
  for (const group of ['ui', 'runtime']) runInNewContext(entries.find(entry => entry.name === `locales/${group}-${locale}.js`).data.toString(), context);
  for (const text of Object.values(context.SevaJumpCatalogs[locale])) {
    for (const char of text) {
      const point = char.codePointAt(0);
      if (point >= low && point <= high) assert(codepoints.has(point), `${family}: bundled font covers U+${point.toString(16)}`);
    }
  }
  const license = entries.find(entry => entry.name === `assets/fonts/OFL-${family}.txt`).data.toString();
  assert(license.includes('SIL OPEN FONT LICENSE Version 1.1'), `${family}: license is bundled`);
}
const manifest = JSON.parse(entries.find(e => e.name === 'manifest.webmanifest').data);
for (const icon of manifest.icons) assert(names.includes(icon.src));
console.log(`Package checks passed: ${entries.length} runtime files, deterministic valid ZIP, complete HTML/manifest/precache dependencies, version ${pkg.version}.`);
