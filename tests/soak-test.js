/*
 * Fast gameplay safety check. It exercises the same jump, tier, and platform
 * configuration as the browser game without needing a visual browser session.
 */
const config = require('../game-config.js');

const RUNS = 10000;
const PLAYER_HALF_WIDTH = 15.5;
const NORMAL_WIDTH_MIN = 96;
const NORMAL_WIDTH_MAX = 140;
const BREAK_WIDTH = 70;
const MOVING_SPEED = config.movingPlatformSpeedRange[1];

function tier(score) {
  const [two, three, four, five] = config.tierThresholds;
  return score >= five ? 5 : score >= four ? 4 : score >= three ? 3 : score >= two ? 2 : 1;
}
function randomBetween(min, max) { return min + Math.random() * (max - min); }
function platformType(level) {
  const roll = Math.random();
  if (roll < .12) return 'spring';
  if (level >= 2 && roll < .25) return 'break';
  if (roll < .45) return 'moving';
  return 'normal';
}
function flightTime(gap, velocity = config.baseJumpVelocity) {
  const discriminant = velocity ** 2 - 2 * config.gravity * gap;
  if (discriminant < 0) return null;
  return (velocity + Math.sqrt(discriminant)) / config.gravity;
}

let verticalFailures = 0;
let horizontalFailures = 0;
let totalPlatforms = 0;
const tierArrivalTimes = [0, 0, 0, 0];

for (let run = 0; run < RUNS; run++) {
  let previous = { center: 227.5, width: 115, type: 'normal' };
  let score = 0;
  let elapsed = 0;
  const arrived = [false, false, false, false];
  for (let step = 0; step < 120; step++) {
    const level = tier(score);
    const type = platformType(level);
    const width = type === 'break' ? BREAK_WIDTH : randomBetween(NORMAL_WIDTH_MIN, NORMAL_WIDTH_MAX);
    const gapRange = config.verticalGapRanges[level === 1 ? 0 : 1];
    const gap = randomBetween(...gapRange);
    const shift = randomBetween(-config.horizontalShifts[level - 1], config.horizontalShifts[level - 1]);
    const center = Math.max(width / 2 + 12, Math.min(450 - width / 2 - 12, previous.center + shift));
    const time = flightTime(gap);
    totalPlatforms++;
    if (time === null) verticalFailures++;
    else {
      // Assume the moving target travels in the least helpful direction. A
      // landing is valid once the player's body overlaps the destination.
      const movingDistance = type === 'moving' ? MOVING_SPEED * time : 0;
      const requiredTravel = Math.max(0, Math.abs(center - previous.center) + movingDistance - width / 2 - PLAYER_HALF_WIDTH);
      const availableTravel = config.maxHorizontalSpeed * time;
      if (requiredTravel > availableTravel + .01) horizontalFailures++;
      elapsed += time;
    }
    score += gap / 18;
    if (Math.random() < .53 && Math.random() >= .16) score += 3;
    config.tierThresholds.forEach((threshold, index) => {
      if (!arrived[index] && score >= threshold) { arrived[index] = true; tierArrivalTimes[index] += elapsed; }
    });
    previous = { center, width, type };
  }
}

const averageArrival = tierArrivalTimes.map(time => (time / RUNS).toFixed(1));
console.log(`Simulated ${RUNS.toLocaleString()} climbs and ${totalPlatforms.toLocaleString()} landings.`);
console.log(`Unreachable vertical jumps: ${verticalFailures}`);
console.log(`Unreachable horizontal landings: ${horizontalFailures}`);
console.log(`Average time to tiers 2–5: ${averageArrival.join('s, ')}s`);

let arcadeFailures = 0;
for (let run = 0; run < RUNS; run++) {
  let previous = { center: 227.5, width: 115 };
  let score = 0;
  for (let step = 0; step < 150; step++) {
    const level = tier(score);
    const type = platformType(level);
    const width = type === 'break' ? BREAK_WIDTH : randomBetween(NORMAL_WIDTH_MIN, NORMAL_WIDTH_MAX);
    const [minGap, maxGap] = config.verticalGapRanges[level === 1 ? 0 : 1];
    const gap = randomBetween(minGap, maxGap) + config.arcadeGapBonus;
    const shift = randomBetween(-config.horizontalShifts[level - 1] * config.arcadeHorizontalMultiplier, config.horizontalShifts[level - 1] * config.arcadeHorizontalMultiplier);
    const center = Math.max(width / 2 + 12, Math.min(450 - width / 2 - 12, previous.center + shift));
    const time = flightTime(gap);
    const movingDistance = type === 'moving' && time !== null ? config.arcadeMovingPlatformSpeedRange[1] * time : 0;
    const requiredTravel = time === null ? Infinity : Math.max(0, Math.abs(center - previous.center) + movingDistance - width / 2 - PLAYER_HALF_WIDTH);
    if (requiredTravel > config.maxHorizontalSpeed * (time || 0) + .01) arcadeFailures++;
    score += gap / 18 + (Math.random() < .45 ? 3 : 0);
    previous = { center, width };
  }
}
console.log(`Arcade-mode unreachable landings: ${arcadeFailures}`);

if (verticalFailures || horizontalFailures || arcadeFailures) process.exitCode = 1;
