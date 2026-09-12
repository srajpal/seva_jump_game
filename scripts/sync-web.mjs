import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { webFiles } from './web-files.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'www');
// Fixed generated directory under this project, never a caller-supplied path.
if (dirname(output) !== resolve(root)) throw new Error('Unsafe web output directory');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of webFiles) {
  await mkdir(dirname(resolve(output, file)), { recursive: true });
  await cp(resolve(root, file), resolve(output, file));
}
