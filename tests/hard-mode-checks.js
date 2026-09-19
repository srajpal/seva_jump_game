const assert = require('node:assert/strict');
const config = require('../game-config.js');
const { sizes, makeGenerator, addRow, checkOpening, collectRow } = require('./generator-helpers.js');

const RUNS = 300, STEPS = 350;
for (const size of sizes) {
  const runtime = makeGenerator(size, 0x4a7d + size.width);
  let moving = 0, breakable = 0, doubleBreakRows = 0, birds = 0, earlyBirds = 0;
  for (let run = 0; run < RUNS; run++) {
    runtime.hooks.reset('hard');
    checkOpening(runtime);
    const state = runtime.hooks.state;
    for (let step = 0; step < STEPS; step++) {
      const generated = addRow(runtime);
      for (const platform of generated.row) {
        assert.ok(['moving', 'break'].includes(platform.type), 'Hard routes only use moving or breakable platforms');
        const [low, high] = platform.type === 'moving' ? config.hardMovingPlatformWidthRange : config.hardBreakPlatformWidthRange;
        assert.ok(platform.w >= low && platform.w <= high, 'Hard platforms use their narrow width range');
        if (platform.type === 'moving') {
          moving++;
          assert.ok(platform.speed >= config.hardMovingPlatformSpeedRange[0] && platform.speed <= config.hardMovingPlatformSpeedRange[1]);
        } else breakable++;
      }
      if (generated.row.length > 1) {
        assert.ok(generated.row.every(platform => platform.type === 'break'));
        doubleBreakRows++;
      }
      if (state.score < config.hardBirdStartScore) assert.equal(generated.birds.length, 0);
      if (state.score < config.endlessBirdStartScore) earlyBirds += generated.birds.length;
      birds += generated.birds.length;
      collectRow(state, generated.platform, generated.items);
    }
  }
  assert.ok(moving > 0 && breakable > 0 && doubleBreakRows > 0);
  assert.ok(earlyBirds > 0, 'Hard birds appear before the Endless introduction');
  console.log(`Verified ${RUNS} Hard routes at width ${size.width}: ${moving} moving, ${breakable} breakable, ${doubleBreakRows} double-break rows, ${birds} birds with clear lanes and screen spacing.`);
}
