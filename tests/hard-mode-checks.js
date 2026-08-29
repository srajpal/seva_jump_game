const assert = require('node:assert/strict');
const config = require('../game-config.js');
const rules = require('../game-rules.js');

const RUNS = 10000;
let moving = 0;
let breakable = 0;
let doubleBreakRows = 0;
let birds = 0;

for (let run = 0; run < RUNS; run++) {
  const birdYs = [];
  let score = 0;
  let y = 610;
  for (let row = 0; row < 220; row++) {
    const type = Math.random() < config.hardMovingChance ? 'moving' : 'break';
    assert(type === 'moving' || type === 'break', 'Hard routes may only use moving or breakable platforms.');
    if (type === 'moving') moving++;
    else {
      breakable++;
      if (Math.random() < config.hardDoubleBreakChance) doubleBreakRows++;
    }
    const gap = Math.min(config.verticalGapRanges[1][0] + Math.random() * (config.verticalGapRanges[1][1] - config.verticalGapRanges[1][0]), rules.maxDefaultPlatformGap());
    assert(gap < config.baseJumpVelocity ** 2 / (2 * config.gravity), 'Every Hard Mode row must remain vertically reachable.');
    y -= gap;
    score += gap / 18;
    if (Math.random() < rules.hardBirdChance(score) && rules.canSpawnHardBird(birdYs, y - 90, 800)) {
      birdYs.push(y - 90);
      birds++;
    }
  }
  for (let i = 1; i < birdYs.length; i++) assert(Math.abs(birdYs[i] - birdYs[i - 1]) >= 800, 'Hard birds must remain at least one screen apart.');
}

assert(moving > 0 && breakable > 0, 'Hard Mode needs both moving and breakable platforms.');
assert(doubleBreakRows > 0, 'Hard Mode should sometimes create multiple breakable platforms per row.');
assert(birds > 0, 'Hard Mode should include earlier birds.');
console.log(`Simulated ${RUNS.toLocaleString()} Hard Mode routes: ${moving.toLocaleString()} moving, ${breakable.toLocaleString()} breakable, ${doubleBreakRows.toLocaleString()} double-break rows, ${birds.toLocaleString()} birds.`);
