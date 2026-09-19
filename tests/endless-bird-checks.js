const assert = require('node:assert/strict');
const config = require('../game-config.js');
const { sizes, makeGenerator, addRow, checkOpening, collectRow } = require('./generator-helpers.js');

const RUNS = 300, STEPS = 350;
for (const size of sizes) {
  const runtime = makeGenerator(size, 0xb17d + size.width);
  let birds = 0, earlyBirds = 0, lateBirds = 0, earlyRows = 0, lateRows = 0;
  for (let run = 0; run < RUNS; run++) {
    runtime.hooks.reset('endless');
    checkOpening(runtime);
    const state = runtime.hooks.state;
    for (let step = 0; step < STEPS; step++) {
      const score = state.score;
      const generated = addRow(runtime);
      if (score < config.endlessBirdStartScore) assert.equal(generated.birds.length, 0, 'no birds before their introduction');
      birds += generated.birds.length;
      if (score < config.endlessDifficultyScore / 2) { earlyRows++; earlyBirds += generated.birds.length; }
      else { lateRows++; lateBirds += generated.birds.length; }
      collectRow(state, generated.platform, generated.items);
    }
  }
  assert.ok(earlyBirds > 0 && lateBirds > 0, 'both halves of the difficulty curve generate birds');
  assert.ok(lateBirds / lateRows > earlyBirds / earlyRows, 'bird density per generated row rises with difficulty');
  console.log(`Verified ${RUNS} Endless routes at width ${size.width}: ${birds} birds with clear spawn lanes; early/late density ${(earlyBirds / earlyRows).toFixed(3)}/${(lateBirds / lateRows).toFixed(3)}.`);
}
