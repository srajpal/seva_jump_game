import { cp, mkdir, rm } from 'node:fs/promises';

const files = [
  'index.html',
  'styles.css',
  'game.js',
  'game-config.js',
  'game-rules.js',
  'manifest.webmanifest',
  'sw.js',
  'privacy.html',
  'assets'
];

await rm('www', { recursive: true, force: true });
await mkdir('www', { recursive: true });
for (const file of files) {
  await cp(file, `www/${file}`, { recursive: true });
}
