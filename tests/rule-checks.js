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
assert.equal(rules.shouldComplete('challenge', config.arcadeTargetScore, config.challengeParshadTarget - 1), false);
assert.equal(rules.shouldComplete('challenge', config.arcadeTargetScore, config.challengeParshadTarget), true);
assert.equal(rules.didWin('challenge', config.challengeParshadTarget - 1), false);
assert.equal(rules.didWin('challenge', config.challengeParshadTarget), true);
assert.equal(rules.didWin('arcade', 0), true);
assert.equal(rules.isArcadeLike('arcade'), true);
assert.equal(rules.isArcadeLike('challenge'), true);
assert.equal(rules.isArcadeLike('endless'), false);
assert.equal(rules.isHard('hard'), true);
assert.equal(rules.shouldComplete('hard', 100000, 1000), false, 'Hard Mode should keep climbing without a score finish.');
assert.equal(rules.endlessBirdChance(config.endlessBirdStartScore - 1), 0, 'Birds should not begin before their intro score.');
assert(rules.endlessBirdChance(config.endlessBirdStartScore) > 0 && rules.endlessBirdChance(config.endlessBirdStartScore) < config.endlessBirdChanceRange[0], 'Birds should begin with a gentle chance.');
assert(rules.endlessBirdChance(config.endlessDifficultyScore) <= config.endlessBirdChanceRange[1], 'Bird chance must remain capped.');
assert.equal(rules.endlessDifficulty(0), 0, 'Endless difficulty should begin gently.');
assert(rules.endlessDifficulty(750) > 0 && rules.endlessDifficulty(750) < 1, 'Endless difficulty should ramp continuously.');
assert.equal(rules.endlessDifficulty(config.endlessDifficultyScore), 1, 'Endless difficulty should reach its capped late-game intensity.');
assert.equal(rules.endlessDifficulty(100000), 1, 'Endless difficulty should remain capped at extreme scores.');
assert.equal(rules.hardBirdChance(config.hardBirdStartScore - 1), 0, 'Hard birds must not appear before their earlier intro score.');
assert(rules.hardBirdChance(config.hardBirdStartScore) > 0, 'Hard birds should begin with a readable warmup chance.');
assert(rules.hardBirdChance(100000) <= config.hardBirdChanceRange[1], 'Hard bird chance must remain capped.');
assert.equal(rules.canSpawnHardBird([0], 799, 800), false, 'Hard Mode must not place two birds within one screen height.');
assert.equal(rules.canSpawnHardBird([0], 800, 800), true, 'A new hard bird may appear after one full screen height.');
assert(config.hardBreakPlatformWidthRange[1] < 80, 'Hard breakable platforms should stay small.');
assert(config.hardMovingPlatformWidthRange[1] < 96, 'Hard moving platforms should stay smaller than standard routes.');
assert(rules.maxDefaultPlatformGap() < config.baseJumpVelocity ** 2 / (2 * config.gravity), 'Every generated platform gap must remain below the default jump apex.');
assert.equal(rules.maxDefaultPlatformGap(), config.safeDefaultPlatformGap, 'The generator must respect its conservative default-jump safety cap.');
assert.equal(rules.canHaveDoublePlatform('moving'), false, 'Moving platforms must never share a row.');
assert.equal(rules.canHaveDoublePlatform('normal'), true, 'A normal platform may have a companion route.');
assert.equal(config.powerJumpCosts.reduce((sum, cost) => sum + cost, 0), 197, 'Power Jump pricing should use the 50% higher playtest costs.');

// Challenge placement: one bowl every third generated platform, then no more.
let placed = 0;
for (let platform = 1; platform <= 220; platform++) {
  if (placed < config.challengeParshadTarget && platform % 3 === 0) placed++;
}
assert.equal(placed, config.challengeParshadTarget, 'Challenge must contain exactly the requested number of bowls.');
assert.equal(config.challengeParshadTarget * 3, 150, 'All Challenge bowls should appear before the finish section.');
assert(config.arcadeMovingPlatformSpeedRange[1] <= 110, 'Arcade platform speed cap should remain manageable.');
assert(config.finishRunwayGap < config.baseJumpVelocity ** 2 / (2 * config.gravity), 'Each finish-runway platform must be within a normal jump apex.');
assert(config.finishBannerGap < config.baseJumpVelocity ** 2 / (2 * config.gravity), 'The final banner jump must remain within the normal jump apex.');
assert.equal(rules.finishRunwayIsReachable(), true, 'The finish runway must remain reachable as a complete path.');
assert.equal(rules.isBelowFinishBanner(101, 100), true, 'Platforms below the finish banner should remain.');
assert.equal(rules.isBelowFinishBanner(100, 100), false, 'Platforms at the finish banner must be removed.');
assert.equal(rules.isBelowFinishBanner(99, 100), false, 'Platforms above the finish banner must be removed.');
assert.equal(rules.arcadeBreakChance(config.tierThresholds[0] - 1), 0, 'Early Arcade should not generate breakables.');
assert(rules.arcadeBreakChance(config.arcadeTargetScore) > rules.arcadeBreakChance(config.arcadeFinalBreakableStartScore), 'Breakables should increase modestly in the final Arcade section.');
assert(rules.arcadeBreakChance(config.arcadeTargetScore) <= .3, 'Final Arcade breakables must remain below the fairness cap.');
assert(config.victorySceneDurationMs >= 5000, 'The completed run should remain visible for at least five seconds.');
assert(rules.boostVelocity('kara') < -config.baseJumpVelocity, 'Kara must provide a higher immediate jump.');
assert(Math.abs(rules.boostVelocity('kara')) <= config.baseJumpVelocity * 1.5, 'Kara must remain below its one-jump safety cap.');
assert(rules.boostVelocity('nishan') < rules.boostVelocity('kara'), 'Nishan should be stronger than Kara.');
assert(Math.abs(rules.boostVelocity('nishan')) <= config.baseJumpVelocity * 1.75, 'Nishan must remain below its one-jump safety cap.');
assert.equal(rules.canUseFalconSave(1, false), true, 'An owned unused Falcon Save should activate.');
assert.equal(rules.canUseFalconSave(0, false), false, 'Falcon Save should not activate when none are owned.');
assert.equal(rules.canUseFalconSave(1, true), false, 'Only one Falcon Save can activate in a run.');

// Stat labels must remain compact enough for the narrow mobile stat cards.
for (const value of [0, 9_999, 10_000, 123_456, 9_999_999, 123_456_789, Number.MAX_SAFE_INTEGER]) {
  const display = rules.formatStat(value);
  assert(display.length <= 6, `Stat display ${display} must fit a compact card.`);
}
assert.equal(rules.formatStat(123_456), '123K');
assert.equal(rules.formatStat(1_234_567), '1.2M');

console.log(`Rule checks passed. Challenge contains exactly ${placed} parshad bowls across its first 150 platforms.`);
