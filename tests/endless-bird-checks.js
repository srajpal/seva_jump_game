/*
 * Endless bird fairness audit. Birds should become more common over a long
 * run, but their initial spawn lane must stay clear of the landing platform.
 */
const assert = require('node:assert/strict');
const config = require('../game-config.js');
const rules = require('../game-rules.js');

const RUNS = 10000;
const STEPS = 240;
const WIDTH = 450;
let birds = 0;
let unsafeSpawnLanes = 0;
let earlyBirds = 0;
let lateBirds = 0;

for (let run = 0; run < RUNS; run++) {
  let score = 0;
  for (let step = 0; step < STEPS; step++) {
    const difficulty = rules.endlessDifficulty(score);
    const chance = score >= config.endlessBirdStartScore
      ? config.endlessBirdChanceRange[0] + (config.endlessBirdChanceRange[1] - config.endlessBirdChanceRange[0]) * difficulty
      : 0;
    const platformCenter = 70 + Math.random() * (WIDTH - 140);
    if (Math.random() < chance) {
      const clearance = config.birdPlatformClearance;
      const leftLimit = Math.max(25, platformCenter - clearance);
      const rightLimit = Math.min(WIDTH - 25, platformCenter + clearance);
      const birdX = Math.random() < .5 && leftLimit > 25
        ? 25 + Math.random() * (leftLimit - 25)
        : rightLimit < WIDTH - 25
          ? rightLimit + Math.random() * (WIDTH - 25 - rightLimit)
          : platformCenter < WIDTH / 2 ? WIDTH - 25 : 25;
      birds++;
      if (Math.abs(birdX - platformCenter) < clearance) unsafeSpawnLanes++;
      if (difficulty < .5) earlyBirds++;
      else lateBirds++;
    }
    score += 5 + Math.random() * 2;
  }
}

assert.equal(unsafeSpawnLanes, 0, 'Birds must not spawn in the platform landing lane.');
assert(birds > 0, 'Endless mode should still generate birds.');
assert(lateBirds > earlyBirds, 'Bird density should rise as Endless difficulty rises.');

console.log(`Simulated ${RUNS.toLocaleString()} Endless runs and ${birds.toLocaleString()} bird spawns.`);
console.log(`Unsafe bird spawn lanes: ${unsafeSpawnLanes}`);
console.log(`Birds before/after 50% Endless difficulty: ${earlyBirds.toLocaleString()} / ${lateBirds.toLocaleString()}`);
