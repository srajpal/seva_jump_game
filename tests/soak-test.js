const assert = require('node:assert/strict');
const config = require('../game-config.js');
const { makeRuntime } = require('./runtime-browser-checks.js');
const { sizes, makeGenerator, addRow, checkOpening, collectRow } = require('./generator-helpers.js');

const RUNS = 1000, STEPS = 350;
let landings = 0;
for (const size of sizes) {
  const runtime = makeGenerator(size, 0x5e7a + size.width);
  for (const mode of ['endless', 'arcade']) {
    for (let run = 0; run < RUNS; run++) {
      runtime.hooks.reset(mode);
      checkOpening(runtime);
      const state = runtime.hooks.state;
      for (let step = 0; step < STEPS; step++) {
        const generated = addRow(runtime);
        collectRow(state, generated.platform, generated.items);
        landings++;
      }
      assert.ok(state.score > config.endlessDifficultyScore, 'soak reaches capped late-game difficulty');
    }
  }
  console.log(`Soaked ${RUNS} Endless and ${RUNS} Arcade routes on the ${size.width}-wide canvas.`);
}

// Fixed balance contracts, not another generator: probe both sides of the
// shipped type thresholds using the real addPlatform. Even a small odds edit
// must deliberately update these expectations. All other draws remain seeded.
let nextRoll;
const runtime = makeRuntime({}, { random: () => {
  const roll = nextRoll;
  nextRoll = undefined;
  return roll ?? .99;
} });
const contracts = [
  ['arcade', 0, [[.09, 'spring', 'moving'], [.55, 'moving', 'normal']]],
  ['arcade', 250, [[.09, 'spring', 'break'], [.31, 'break', 'moving'], [.55, 'moving', 'normal']]],
  ['arcade', 1000, [[.09, 'spring', 'break'], [.38, 'break', 'moving'], [.55, 'moving', 'normal']]],
  ['challenge', 1000, [[.09, 'spring', 'break'], [.48, 'break', 'moving'], [.55, 'moving', 'normal']]],
  ['endless', 0, [[.10, 'spring', 'break'], [.18, 'break', 'moving'], [.38, 'moving', 'normal']]],
  ['endless', 1500, [[.13, 'spring', 'break'], [.32, 'break', 'moving'], [.56, 'moving', 'normal']]],
];
let probes = 0;
for (const [mode, score, boundaries] of contracts) {
  for (const [threshold, below, above] of boundaries) {
    for (const [roll, expected] of [[threshold - 1e-7, below], [threshold + 1e-7, above]]) {
      runtime.hooks.reset(mode);
      const state = runtime.hooks.state;
      state.score = score;
      state.challengePlatformCount = 0; // Probe an ordinary, non-bowl row.
      nextRoll = roll;
      runtime.hooks.addPlatform();
      assert.equal(state.lastPlatform.type, expected, `${mode} score ${score}, odds roll ${roll}`);
      probes++;
    }
  }
}
console.log(`Verified ${landings.toLocaleString()} generated landings and ${probes} platform-odds boundary probes.`);
