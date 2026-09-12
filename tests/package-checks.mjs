import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { inflateRawSync } from 'node:zlib';
import { loadPayload, createZip } from '../scripts/build-itch.mjs';

const entries = await loadPayload();
const names = entries.map(e => e.name);
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
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  if (/^https?:/.test(match[1])) continue;
  assert(names.includes(match[1].split('?')[0]), `Packaged HTML dependency: ${match[1]}`);
}
assert(html.includes(`v${pkg.version}`));
for (const match of html.matchAll(/\?v=([^"']+)/g)) assert.equal(match[1], pkg.version);
const worker = entries.find(e => e.name === 'sw.js').data.toString();
assert(worker.includes(`'${pkg.version}'`), 'Worker cache must match candidate version');
for (const match of worker.matchAll(/'\.\/([^']+)'/g)) assert(names.includes(match[1]), `Packaged precache file: ${match[1]}`);
const manifest = JSON.parse(entries.find(e => e.name === 'manifest.webmanifest').data);
for (const icon of manifest.icons) assert(names.includes(icon.src));
console.log(`Package checks passed: ${entries.length} runtime files, deterministic valid ZIP, complete HTML/manifest/precache dependencies, version ${pkg.version}.`);
