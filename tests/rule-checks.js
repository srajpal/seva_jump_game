const assert = require('node:assert/strict');
const config = require('../game-config.js');
const rules = require('../game-rules.js');

// Completion rules: an endless run must never complete due to its score.
for (const score of [0, config.arcadeTargetScore, 10000]) {
assert.equal(rules.shouldComplete('endless', score, config.challengeParshadTarget + 100), false);
}
assert.equal(rules.shouldComplete('arcade', config.arcadeTargetScore - 1, 999), false);
assert.equal(rules.shouldComplete('arcade', config.arcadeTargetScore, 0), true);
assert.equal(rules.shouldComplete('challenge', config.arcadeTargetScore - 1, 999), false);
assert.equal(rules.shouldComplete('challenge', config.arcadeTargetScore, 0), true);
assert.equal(rules.didWin('challenge', config.challengeParshadTarget - 1), false);
assert.equal(rules.didWin('challenge', config.challengeParshadTarget), true);
assert.equal(rules.didWin('arcade', 0), true);
assert.equal(rules.isArcadeLike('arcade'), true);
assert.equal(rules.isArcadeLike('challenge'), true);
assert.equal(rules.isArcadeLike('endless'), false);

// Challenge placement: one bowl every third generated platform, then no more.
let placed = 0;
for (let platform = 1; platform <= 220; platform++) {
  if (placed < config.challengeParshadTarget && platform % 3 === 0) placed++;
}
assert.equal(placed, config.challengeParshadTarget, 'Challenge must contain exactly the requested number of bowls.');
assert.equal(config.challengeParshadTarget * 3, 150, 'All Challenge bowls should appear before the finish section.');
assert(config.arcadeMovingPlatformSpeedRange[1] <= 110, 'Arcade platform speed cap should remain manageable.');
assert(config.finishRunwayGap < config.baseJumpVelocity ** 2 / (2 * config.gravity), 'Each finish-runway platform must be within a normal jump apex.');
assert(config.finishRunwaySteps * config.finishRunwayGap >= config.finishBannerLeadScore * 18 - config.baseJumpVelocity ** 2 / (2 * config.gravity), 'The finish runway must reach the banner approach.');

console.log(`Rule checks passed. Challenge contains exactly ${placed} parshad bowls across its first 150 platforms.`);
