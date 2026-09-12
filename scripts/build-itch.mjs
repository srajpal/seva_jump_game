import { readFile, writeFile, mkdir, readdir, realpath, rename } from 'node:fs/promises';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { deflateRawSync } from 'node:zlib';
import { webFiles } from './web-files.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const hash = data => createHash('sha256').update(data).digest('hex');
function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export async function loadPayload(projectRoot = root) {
  const actualRoot = await realpath(projectRoot);
  if (new Set(webFiles.map(name => name.toLowerCase())).size !== webFiles.length) throw new Error('Duplicate or case-colliding archive paths');
  const entries = [];
  for (const name of [...webFiles].sort()) {
    if (!/^[a-zA-Z0-9_./-]+$/.test(name) || name.includes('..') || name.startsWith('/')) throw new Error(`Unsafe archive path: ${name}`);
    const siblings = await readdir(dirname(resolve(projectRoot, name)));
    if (!siblings.includes(basename(name))) throw new Error(`Missing or case-mismatched file: ${name}`);
    const actualFile = await realpath(resolve(projectRoot, name));
    const expectedFile = resolve(actualRoot, name);
    if (actualFile !== expectedFile) throw new Error(`Linked or redirected archive file: ${name}`);
    entries.push({ name, data: await readFile(resolve(projectRoot, name)) });
  }
  const allowed = new Set(webFiles);
  for (const { name, data } of entries.filter(e => !e.name.endsWith('.png'))) {
    for (const match of data.toString().matchAll(/assets\/[a-zA-Z0-9_.-]+\.[a-zA-Z0-9]+/g)) {
      if (!allowed.has(match[0])) throw new Error(`${name} references unpackaged asset: ${match[0]}`);
    }
  }
  if (entries.length > 1000 || entries.some(e => e.name.length > 240 || e.data.length > 200_000_000)
      || entries.reduce((sum, e) => sum + e.data.length, 0) > 500_000_000) throw new Error('Payload exceeds itch HTML5 limits');
  return entries;
}

// ZIP32, UTF-8 filenames, raw DEFLATE, fixed 1980 timestamp: identical inputs
// produce identical archives with the same Node/zlib version. No platform tools
// or third-party runtime required.
export function createZip(entries) {
  const locals = [], central = [];
  let offset = 0;
  for (const { name, data } of entries) {
    const encoded = Buffer.from(name), compressed = deflateRawSync(data, { level: 9 }), crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x800, 6); local.writeUInt16LE(8, 8); local.writeUInt16LE(33, 12);
    local.writeUInt32LE(crc, 14); local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(data.length, 22); local.writeUInt16LE(encoded.length, 26);
    locals.push(local, encoded, compressed);
    const header = Buffer.alloc(46);
    header.writeUInt32LE(0x02014b50, 0); header.writeUInt16LE(20, 4); header.writeUInt16LE(20, 6);
    header.writeUInt16LE(0x800, 8); header.writeUInt16LE(8, 10); header.writeUInt16LE(33, 14);
    header.writeUInt32LE(crc, 16); header.writeUInt32LE(compressed.length, 20);
    header.writeUInt32LE(data.length, 24); header.writeUInt16LE(encoded.length, 28);
    header.writeUInt32LE(offset, 42); central.push(header, encoded);
    offset += local.length + encoded.length + compressed.length;
  }
  const directory = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, end]);
}

export async function buildItch() {
  const { version } = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
  if (!/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(version)) throw new Error('Invalid release version');
  const entries = await loadPayload(), zip = createZip(entries), output = resolve(root, 'dist');
  await mkdir(output, { recursive: true });
  const filename = `seva-jump-${version}-itch.zip`;
  const manifest = { version, archive: filename, sha256: hash(zip), archiveBytes: zip.length,
    toolchain: { node: process.versions.node, zlib: process.versions.zlib },
    unpackedBytes: entries.reduce((sum, e) => sum + e.data.length, 0),
    files: entries.map(e => ({ path: e.name, bytes: e.data.length, sha256: hash(e.data) })) };
  const artifacts = [[filename, zip], [`${filename}.manifest.json`, JSON.stringify(manifest, null, 2) + '\n'],
    [`${filename}.sha256`, `${manifest.sha256}  ${filename}\n`]];
  for (const [name, data] of artifacts) await writeFile(resolve(output, `${name}.tmp`), data);
  // Each rename is atomic; consumers must verify the sidecar hash before upload
  // because publishing three separate files cannot itself be transactional.
  for (const [name] of artifacts) await rename(resolve(output, `${name}.tmp`), resolve(output, name));
  console.log(`Built ${filename}: ${entries.length} files, ${zip.length.toLocaleString()} bytes; SHA-256 ${manifest.sha256}`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildItch();
