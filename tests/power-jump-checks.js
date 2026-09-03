const assert = require('node:assert/strict');
const config = require('../game-config.js');
const rules = require('../game-rules.js');

const baseApex = config.baseJumpVelocity ** 2 / (2 * config.gravity);
const baseFlightTime = 2 * config.baseJumpVelocity / config.gravity;
let previousApex = 0;

for (let level = 0; level <= 5; level++) {
  const velocity = config.baseJumpVelocity * rules.powerJumpMultiplier(level);
  const apex = velocity ** 2 / (2 * config.gravity);
  const flightTime = 2 * velocity / config.gravity;
  const expectedHeightMultiplier = 1 + level * config.powerJumpHeightBonusPerLevel;
  assert.ok(Math.abs(apex / baseApex - expectedHeightMultiplier) < 1e-9, `Level ${level} height bonus must be linear.`);
  assert.ok(apex > previousApex || level === 0, `Level ${level} must improve on the previous level.`);
  assert.ok(flightTime >= baseFlightTime, `Level ${level} cannot reduce flight time.`);
  previousApex = apex;
  console.log(`Level ${level}: ${(apex / baseApex * 100).toFixed(0)}% height, ${apex.toFixed(1)}px apex, ${flightTime.toFixed(3)}s flight`);
}

assert.equal(Math.round((previousApex / baseApex - 1) * 100), 50, 'Level 5 should provide a meaningful 50% height advantage.');
console.log('Power Jump progression is linear in height: 10% per level, 50% at Level 5.');
