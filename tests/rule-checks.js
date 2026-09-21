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
const challengeCutoff = config.arcadeTargetScore - config.finishBannerLeadScore;
for (const score of [challengeCutoff - 1, challengeCutoff, config.arcadeTargetScore]) {
  assert.equal(rules.shouldEndIncompleteChallenge('challenge', score, config.challengeParshadTarget - 1), score >= challengeCutoff, 'incomplete Challenge ends at the finish-section cutoff');
  assert.equal(rules.shouldEndIncompleteChallenge('challenge', score, config.challengeParshadTarget), false, 'all bowls retain the banner finish');
  for (const mode of ['arcade', 'endless', 'hard']) assert.equal(rules.shouldEndIncompleteChallenge(mode, score, 0), false);
}
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
// Late ramp: a second curve starts where the first caps and only hardens
// hazards that cannot break reachability, in Endless alone.
const lateStart = config.endlessDifficultyScore, lateEnd = lateStart + config.endlessLateDifficultyScore;
assert.equal(rules.endlessLateDifficulty(0), 0, 'the late ramp is dormant before the difficulty cap');
assert.equal(rules.endlessLateDifficulty(lateStart), 0, 'the late ramp starts at the difficulty cap');
assert.equal(rules.endlessLateDifficulty(lateEnd), 1, 'the late ramp completes one cap-length later');
assert.equal(rules.endlessLateDifficulty(100000), 1, 'the late ramp stays capped at extreme scores');
for (let score = 0, previous = 0; score <= lateEnd + 500; score += 50) {
  const late = rules.endlessLateDifficulty(score);
  assert(late >= previous && late >= 0 && late <= 1, 'the late ramp is monotonic and clamped');
  previous = late;
}
for (const roll of [0, .5, 1]) {
  const cappedSpeed = config.birdSpeed.base + roll * config.birdSpeed.randomRange + config.birdSpeed.difficultyBonus;
  for (const score of [0, 750, lateStart]) assert.equal(rules.birdSpeed('endless', score, roll), config.birdSpeed.base + roll * config.birdSpeed.randomRange + rules.endlessDifficulty(score) * config.birdSpeed.difficultyBonus, 'Endless bird speed is unchanged up to the cap');
  assert.equal(rules.birdSpeed('endless', lateEnd, roll), cappedSpeed + config.endlessLateBirdSpeedBonus, 'Endless birds gain the full late bonus at the ramp end');
  assert(rules.birdSpeed('endless', (lateStart + lateEnd) / 2, roll) > cappedSpeed && rules.birdSpeed('endless', (lateStart + lateEnd) / 2, roll) < cappedSpeed + config.endlessLateBirdSpeedBonus, 'Endless bird speed ramps between the cap and the ramp end');
  for (const mode of ['hard', 'arcade', 'challenge']) assert.equal(rules.birdSpeed(mode, lateEnd, roll), rules.birdSpeed(mode, lateStart, roll), mode + ' bird speed ignores the Endless late ramp');
}
assert.equal(rules.endlessBirdChance(lateStart), config.endlessBirdChanceRange[1], 'Endless bird odds reach the original cap at the difficulty cap');
assert.equal(rules.endlessBirdChance(lateEnd), config.endlessLateBirdChanceCap, 'Endless bird odds reach the late cap at the ramp end');
assert(rules.endlessBirdChance((lateStart + lateEnd) / 2) > config.endlessBirdChanceRange[1] && rules.endlessBirdChance(100000) === config.endlessLateBirdChanceCap, 'Endless bird odds ramp then hold the late cap');
assert.equal(rules.hardBirdChance(lateEnd), rules.hardBirdChance(lateStart), 'Hard bird odds ignore the Endless late ramp');
for (const score of [0, 750, lateStart]) assert.deepEqual(rules.endlessMovingPlatformSpeedRange(score), config.movingPlatformSpeedRange, 'Endless moving speeds are unchanged up to the cap');
assert.deepEqual(rules.endlessMovingPlatformSpeedRange(lateEnd), config.arcadeMovingPlatformSpeedRange, 'Endless moving speeds reach the Arcade range at the ramp end');
assert.deepEqual(rules.endlessMovingPlatformSpeedRange(100000), config.arcadeMovingPlatformSpeedRange, 'Endless moving speeds never exceed the Arcade range');
const [midMin, midMax] = rules.endlessMovingPlatformSpeedRange((lateStart + lateEnd) / 2);
assert(midMin > config.movingPlatformSpeedRange[0] && midMin < config.arcadeMovingPlatformSpeedRange[0] && midMax > config.movingPlatformSpeedRange[1] && midMax < config.arcadeMovingPlatformSpeedRange[1], 'both ends of the Endless moving range ramp together');
assert.equal(rules.hardBirdChance(config.hardBirdStartScore - 1), 0, 'Hard birds must not appear before their earlier intro score.');
assert(rules.hardBirdChance(config.hardBirdStartScore) > 0, 'Hard birds should begin with a readable warmup chance.');
assert(rules.hardBirdChance(100000) <= config.hardBirdChanceRange[1], 'Hard bird chance must remain capped.');
assert.equal(rules.canSpawnHardBird([0], 799, 800), false, 'Hard Mode must not place two birds within one screen height.');
assert.equal(rules.canSpawnHardBird([0], 800, 800), true, 'A new hard bird may appear after one full screen height.');
assert(config.challengeBirdStartScore < config.arcadeBirdStartScore, 'Challenge birds should arrive earlier than Arcade birds.');
assert.equal(rules.canSpawnChallengeBird([0], config.challengeBirdScreenSpacing - 1), false, 'Challenge must not place two birds within one screen.');
assert.equal(rules.canSpawnChallengeBird([0], config.challengeBirdScreenSpacing), true, 'Challenge may place another bird after one full screen.');
assert(config.hardBreakPlatformWidthRange[1] < 80, 'Hard breakable platforms should stay small.');
assert(config.hardMovingPlatformWidthRange[1] < 96, 'Hard moving platforms should stay smaller than standard routes.');
assert(rules.maxDefaultPlatformGap() < config.baseJumpVelocity ** 2 / (2 * config.gravity), 'Every generated platform gap must remain below the default jump apex.');
assert.equal(rules.maxDefaultPlatformGap(), config.safeDefaultPlatformGap, 'The generator must respect its conservative default-jump safety cap.');
assert.equal(rules.canHaveDoublePlatform('moving'), false, 'Moving platforms must never share a row.');
assert.equal(rules.canHaveDoublePlatform('normal'), true, 'A normal platform may have a companion route.');
assert.equal(config.powerJumpCosts.reduce((sum, cost) => sum + cost, 0), 197, 'Power Jump pricing should use the 50% higher playtest costs.');

// Stall rescue: a broken row can leave the next intact platform two capped
// gaps above the one the player keeps bouncing on, beyond one jump's apex.
const apex = rules.jumpApex();
assert.equal(apex, config.baseJumpVelocity ** 2 / (2 * config.gravity), 'the unboosted apex matches the physics');
assert(rules.jumpApex(5) > apex, 'Power Jump raises the apex used for the stranded check');
assert(config.springJumpVelocity ** 2 / (2 * config.gravity) > 2 * rules.maxDefaultPlatformGap(), 'a spring must clear two capped gaps');
const standing = { x: 100, y: 500, w: 100, type: 'normal', broken: false };
const brokenRow = { x: 100, y: 404, w: 70, type: 'break', broken: true };
const farRow = { x: 100, y: 308, w: 100, type: 'normal', broken: false };
// A hop is judged at the player's half width; 'reach' overrides the height.
const hop = { powerJump: 0, halfWidth: 15.5 }, apexHop = { ...hop, reach: apex }, hopAt = level => ({ ...hop, powerJump: level });
assert.equal(rules.isStranded([farRow, standing, brokenRow], standing, apexHop), true, 'a double gap above a broken row strands the player');
assert.equal(rules.isStranded([farRow, standing, { ...brokenRow, broken: false }], standing, apexHop), false, 'an intact row within one jump is reachable');
assert.equal(rules.isStranded([farRow, standing, brokenRow, { x: 220, y: 404, w: 90, type: 'normal', broken: false, companion: true }], standing, apexHop), false, 'a surviving companion on the broken row keeps it reachable');
assert.equal(rules.isStranded([standing, { ...farRow, y: 500 - apex }], standing, apexHop), false, 'a row exactly one apex above is still reachable');
assert.equal(rules.isStranded([standing, { ...farRow, y: 500 - apex - 1 }], standing, apexHop), true, 'a row just beyond the apex is not');
assert.equal(rules.isStranded([standing, { ...farRow, y: 600 }], standing, apexHop), true, 'rows below the standing platform do not count');
assert.equal(rules.isStranded([farRow, standing, brokenRow], standing, hopAt(3)), true, 'Power Jump 3 (about 152 px reach) cannot clear a 192 px double gap');
// Power Jump 5's analytic apex (192.2 px) looks like it just clears the capped
// double gap, but the integrator falls short of the apex, so the game must
// judge the gap by what a frame-stepped jump actually reaches.
assert.equal(rules.isStranded([farRow, standing, brokenRow], standing, { ...hopAt(5), reach: rules.jumpApex(5) }), false, 'the analytic apex would wrongly call a 192 px gap reachable at Power Jump 5');
assert.equal(rules.isStranded([farRow, standing, brokenRow], standing, hopAt(5)), true, 'Power Jump 5 (about 177 px reach) is stranded by the capped double gap');
// Sideways reach: the next row can be within jumping height yet too far for a
// touch player at the pointer speed cap once steering ramp-up is paid. This is
// the generator's own promise for consecutive rows, so an intact route is
// never flagged; only a lone survivor of a broken row or a runway step is.
const hopTime = rules.hopTime(96, hop);
assert.ok(Math.abs(hopTime - (config.baseJumpVelocity + Math.sqrt(config.baseJumpVelocity ** 2 - 2 * config.gravity * 96)) / config.gravity) < 1e-9, 'flight time to a row 96 px up follows the launch physics');
assert.ok(Math.abs(rules.hopTime(apex, hop) - config.baseJumpVelocity / config.gravity) < 1e-9, 'a row exactly at the apex is met at the top of the flight');
assert.equal(rules.horizontalReach(hopTime), config.pointerMaxHorizontalSpeed * (hopTime - 1 / config.pointerSteeringResponse), 'sideways reach is the pointer cap less one steering time constant');
assert.equal(rules.horizontalReach(0.01), 0, 'no sideways reach before steering responds');
const ledge = { x: 37, y: 500, w: 97, type: 'normal', broken: false };
const nearSide = { x: 260, y: 404, w: 109, type: 'normal', broken: false, speed: 0 };
const farSide = { ...nearSide, x: 271 };
assert.equal(rules.canHop(ledge, nearSide, hop), true, 'a row 96 px up and 229 px across is within a touch hop');
assert.equal(rules.canHop(ledge, farSide, hop), false, 'eleven more pixels are beyond the ramp-adjusted pointer reach');
assert.equal(rules.canHop(ledge, { ...nearSide, speed: 90 }, hop), false, 'a moving target is assumed to drift away during the flight');
assert.equal(rules.canHop(ledge, farSide, { ...hop, velocity: config.springJumpVelocity }), true, 'a spring flight lasts long enough to cover the far row');
assert.equal(rules.isStranded([ledge, farSide], ledge, hop), true, 'a lone far-side survivor strands a touch player');
assert.equal(rules.isStranded([ledge, farSide], ledge, { ...hop, velocity: config.springJumpVelocity }), false, 'converting the platform to a spring makes the far row reachable');
assert.equal(rules.isStranded([ledge, farSide, { ...nearSide, companion: true }], ledge, hop), false, 'a reachable companion keeps the row reachable');
assert.equal(rules.isStranded([ledge, { ...farSide, y: 260 }], ledge, hop), true, 'a row far above and far across is stranded on both counts');
// jumpReach must never exceed what semi-implicit Euler (vy += g*dt; y += vy*dt,
// the order update() uses) climbs, at 60 fps and at the 40 ms loop clamp, and
// must stay within a pixel of it at the clamp so rescues are not over-eager.
function integratedRise(velocity, step) {
  let y = 0, vy = -velocity, top = 0;
  while (vy < 0) { vy += config.gravity * step; y += vy * step; top = Math.min(top, y); }
  return -top;
}
for (const level of [0, 1, 2, 3, 4, 5]) for (const velocity of [config.baseJumpVelocity, config.springJumpVelocity]) {
  const launch = velocity * rules.powerJumpMultiplier(level);
  for (const step of [1 / 60, 1 / 30, config.maxFrameSeconds]) {
    const rise = integratedRise(launch, step), reach = rules.jumpReach(level, velocity, step);
    assert.ok(reach <= rise + 1e-9 && rise < rules.jumpApex(level, velocity), `reach ${reach.toFixed(2)} bounds the integrated rise ${rise.toFixed(2)} (level ${level}, velocity ${velocity}, step ${step})`);
    assert.ok(rise - reach < 1, 'the reach is within a pixel of the integrated rise');
  }
  assert.ok(rules.jumpReach(level, velocity) <= rules.jumpReach(level, velocity, 1 / 60), 'the default reach is the loop clamp, the worst case');
}
assert.ok(rules.jumpReach() > rules.maxDefaultPlatformGap(), 'every single generated gap stays reachable at the frame clamp, so no rescue fires for one');
assert.ok(rules.jumpReach(5) < 2 * rules.maxDefaultPlatformGap(), 'even Power Jump 5 is stranded by the widest double gap');
assert.ok(rules.jumpReach(0, config.springJumpVelocity) > 2 * rules.maxDefaultPlatformGap(), 'a converted spring still clears two capped gaps at the frame clamp');
assert.equal(rules.nearestRowAbove([farRow, standing, brokenRow], standing), farRow, 'the nearest intact row skips broken platforms');
assert.equal(rules.nearestRowAbove([standing, { ...farRow, y: 600 }], standing), undefined);
const springApex = rules.jumpApex(0, config.springJumpVelocity);
assert.equal(springApex, config.springJumpVelocity ** 2 / (2 * config.gravity));
assert(springApex > 2 * rules.maxDefaultPlatformGap() && springApex < 3 * rules.maxDefaultPlatformGap(), 'a spring clears two capped gaps but not three');
assert(rules.jumpReach(0, config.springJumpVelocity) > 2 * rules.maxDefaultPlatformGap(), 'the spring reach at the loop clamp still clears two capped gaps');
// Several broken rows in a row (Hard double-break rows) leave a gap no spring
// can clear; helper steps bridge it at generated spacing, inside the canvas.
assert.deepEqual(rules.rescueRungs(standing, { x: 100, y: 500 - 192, w: 100 }, hop, 450).map(rung => rung.y), [404], 'a double gap gets exactly one midway step');
const tripleGap = { x: 330, y: 500 - 288, w: 100 };
const rungs = rules.rescueRungs(standing, tripleGap, hop, 450);
assert.equal(rungs.length, 2, 'a triple gap needs two steps');
assert.deepEqual(rungs.map(rung => rung.y), [404, 308]);
for (const [index, expected] of [150 + (380 - 150) / 3, 150 + 2 * (380 - 150) / 3].entries()) assert.ok(Math.abs(rungs[index].x + rungs[index].w / 2 - expected) < 1e-9, 'steps drift towards the next row');
assert.ok(rungs.every(rung => rung.type === 'normal' && rung.helper && !rung.broken && rung.speed === 0 && rung.w === config.stallRescueRungWidth));
const wideGap = rules.rescueRungs({ x: 0, y: 500, w: 60 }, { x: 390, y: 500 - 375, w: 60 }, hop, 450);
assert.equal(wideGap.length, 3, 'a 375 px gap needs three steps at the 96 px cap');
for (let index = 0; index < wideGap.length; index++) {
  const below = index ? wideGap[index - 1].y : 500;
  assert.ok(below - wideGap[index].y <= rules.maxDefaultPlatformGap(), 'each step stays within a generated gap');
  assert.ok(wideGap[index].x >= 12 && wideGap[index].x + wideGap[index].w <= 450 - 12, 'steps stay inside the canvas margins');
}
assert.ok(wideGap[2].y > 500 - 375 && wideGap[2].y - (500 - 375) <= rules.maxDefaultPlatformGap(), 'the top step is within one generated gap of the intact row');
assert.equal(rules.rescueRungs(standing, { x: 100, y: 500 - 96, w: 100 }, hop, 450).length, 0, 'a reachable row needs no steps');
// A row only one gap up but the whole canvas across gets a single midway step
// that splits the sideways distance into two touch-sized hops.
const sideways = rules.rescueRungs({ x: 0, y: 500, w: 60 }, { x: 390, y: 404, w: 60 }, hop, 450);
assert.equal(sideways.length, 1, 'one step bridges a full-width sideways gap');
assert.equal(sideways[0].y, 452);
assert.equal(sideways[0].x + sideways[0].w / 2, 225, 'the step sits midway between the two platforms');
assert.equal(rules.canHop({ x: 0, y: 500, w: 60 }, sideways[0], hop) && rules.canHop(sideways[0], { x: 390, y: 404, w: 60 }, hop), true, 'both hops of the bridged route are within touch reach');

// Challenge placement: one bowl every third generated platform, then no more.
let placed = 0;
for (let platform = 1; platform <= 220; platform++) {
  if (rules.isChallengeBowlRow(placed, platform)) placed++;
}
assert.equal(rules.isChallengeBowlRow(0, 1), false);
assert.equal(rules.isChallengeBowlRow(0, 2), false);
assert.equal(rules.isChallengeBowlRow(0, 3), true);
assert.equal(rules.isChallengeBowlRow(config.challengeParshadTarget - 1, 150), true);
assert.equal(rules.isChallengeBowlRow(config.challengeParshadTarget, 153), false);
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
assert(rules.challengeBreakChance(config.arcadeTargetScore) > rules.arcadeBreakChance(config.arcadeTargetScore), 'Late Challenge should use modestly more breakables than Arcade.');
assert(rules.challengeBreakChance(config.arcadeTargetScore) <= .4, 'Late Challenge breakables must remain below the fairness cap.');
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
