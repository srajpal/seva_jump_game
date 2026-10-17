// Rebuild the contextual translation review inventory from the shipped catalogs.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..'), context = vm.createContext({});
for (const group of ['ui', 'runtime']) for (const locale of ['en', 'hi', 'pa-Guru']) vm.runInContext(fs.readFileSync(path.join(root, `locales/${group}-${locale}.js`), 'utf8'), context);
const catalogs = context.SevaJumpCatalogs;
const destination = path.join(root, 'docs/localization-inventory.json');
const previous = fs.existsSync(destination) ? JSON.parse(fs.readFileSync(destination, 'utf8')).strings : [];
const previousById = new Map(previous.map(entry => [entry.id, entry]));
const files = ['index.html', 'privacy.html', 'game.js', 'i18n.js'];
const sources = files.map(file => ({ file, lines: fs.readFileSync(path.join(root, file), 'utf8').split(/\r?\n/) }));
const entries = Object.keys(catalogs.en).sort().map(id => ({
  id, en: catalogs.en[id], hi: catalogs.hi[id], 'pa-Guru': catalogs['pa-Guru'][id],
  placeholders: [...catalogs.en[id].matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)].map(match => match[1]),
  references: sources.flatMap(({ file, lines }) => lines.flatMap((line, index) => line.includes(id) ? [`${file}:${index + 1}`] : [])),
  review: { hindi: 'pending', gurmukhi: 'pending', ownerTerminology: 'pending' },
}));
for (const entry of entries) {
  const old = previousById.get(entry.id);
  if (old && ['en', 'hi', 'pa-Guru'].every(locale => old[locale] === entry[locale])) entry.review = old.review;
}
const inventory = { status: 'Draft translations — not approved for publication', entries: entries.length, sourceWords: entries.reduce((sum, entry) => sum + (entry.en.match(/\S+/g) || []).length, 0), countingMethod: 'Whitespace-delimited English tokens, including placeholders; deduplicated catalog IDs. Store listing drafts are separate.', strings: entries };
fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(destination, JSON.stringify(inventory, null, 2) + '\n');
console.log(`${inventory.entries} entries; ${inventory.sourceWords} source words. Inventory written to docs/localization-inventory.json`);
