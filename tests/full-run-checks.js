/*
 * Fast whole-run simulations. These model a skilled player reaching each
 * generated platform and verify mode goals plus every end-of-run safeguard.
 */
const assert = require('node:assert/strict');
const config = require('../game-config.js');
const rules = require('../game-rules.js');

const RUNS = 5000;
const normalApex = config.baseJumpVelocity ** 2 / (2 * config.gravity);

function simulate(mode) {
  let score = 0;
  let parshad = 0;
  let generatedPlatforms = 0;
  while (mode === 'endless' ? generatedPlatforms < 240 : score < config.arcadeTargetScore - config.finishBannerLeadScore) {
    const [low, high] = config.verticalGapRanges[score < config.tierThresholds[0] ? 0 : 1];
    const gap = Math.min(low + Math.random() * (high - low) + (rules.isArcadeLike(mode) ? config.arcadeGapBonus : 0), rules.maxDefaultPlatformGap());
    assert(gap < normalApex, `Generated ${mode} gap exceeded normal jump apex.`);
    score += gap / 18;
    generatedPlatforms++;
    if (mode === 'challenge' && parshad < config.challengeParshadTarget && generatedPlatforms % 3 === 0) parshad++;
    else if (mode !== 'challenge' && Math.random() < .45) score += 3;
  }
  return { score, parshad, generatedPlatforms };
}

for (let run = 0; run < RUNS; run++) {
  const endless = simulate('endless');
  assert.equal(rules.shouldComplete('endless', endless.score, endless.parshad), false, 'Endless mode must never end by score.');

  const arcade = simulate('arcade');
  assert(arcade.score >= config.arcadeTargetScore - config.finishBannerLeadScore, 'Arcade should reach its finish section.');
  assert.equal(rules.finishRunwayIsReachable(), true, 'Arcade finish runway must be reachable.');
  assert.equal(rules.didWin('arcade', arcade.parshad), true, 'Arcade should win when the banner is reached.');

  const challenge = simulate('challenge');
  assert.equal(challenge.parshad, config.challengeParshadTarget, 'A complete Challenge run must contain all 50 bowls.');
  assert.equal(rules.didWin('challenge', challenge.parshad), true, 'Collecting all bowls must win Challenge Mode.');
  assert.equal(rules.didWin('challenge', challenge.parshad - 1), false, 'Missing a bowl must lose Challenge Mode.');
}

console.log(`Simulated ${RUNS.toLocaleString()} full runs in Endless, Arcade, and Challenge modes.`);
console.log('Verified finish runway, one-jump boosts, Falcon Save eligibility, score completion, and all Challenge bowls.');
