const RULE_CONFIG = typeof module !== 'undefined' ? require('./game-config.js') : globalThis.SEVA_CONFIG;

const SEVA_RULES = {
  isArcadeLike(mode) { return mode === 'arcade' || mode === 'challenge'; },
  isHard(mode) { return mode === 'hard'; },
  gamepadSteering(axis, left, right) {
    if (left || right) return Number(Boolean(right)) - Number(Boolean(left));
    const value = Number.isFinite(axis) ? Math.max(-1, Math.min(1, axis)) : 0;
    const magnitude = Math.max(0, (Math.abs(value) - RULE_CONFIG.gamepadDeadzone) / (1 - RULE_CONFIG.gamepadDeadzone));
    return Math.sign(value) * magnitude;
  },
  endlessDifficulty(score) {
    return Math.max(0, Math.min(1, score / RULE_CONFIG.endlessDifficultyScore));
  },
  endlessPlatformCutoffs(score) {
    const difficulty = this.endlessDifficulty(score), mix = RULE_CONFIG.endlessPlatformMix;
    return {
      spring: mix.spring.base + difficulty * mix.spring.increase,
      break: mix.break.base + difficulty * mix.break.increase,
      moving: mix.moving.base + difficulty * mix.moving.increase,
    };
  },
  birdSpeed(mode, score, roll) {
    const speed = RULE_CONFIG.birdSpeed;
    return speed.base + roll * speed.randomRange + this.endlessDifficulty(score) * speed.difficultyBonus
      + (this.isHard(mode) ? speed.hardBonus : 0) + (mode === 'challenge' ? RULE_CONFIG.challengeBirdSpeedBonus : 0);
  },
  jumpApex(powerJump = 0, velocity = RULE_CONFIG.baseJumpVelocity) {
    return (velocity * this.powerJumpMultiplier(powerJump)) ** 2 / (2 * RULE_CONFIG.gravity);
  },
  // The height the game's semi-implicit Euler integrator (velocity first, then
  // position) actually reaches: velocity * step / 2 short of the analytic apex,
  // judged at the loop's longest frame step so a slow device is covered too.
  jumpReach(powerJump = 0, velocity = RULE_CONFIG.baseJumpVelocity, step = RULE_CONFIG.maxFrameSeconds) {
    return this.jumpApex(powerJump, velocity) - velocity * this.powerJumpMultiplier(powerJump) * step / 2;
  },
  nearestRowAbove(platforms, standing) {
    return platforms.filter(p => !p.broken && p.y < standing.y).sort((a, b) => b.y - a.y)[0];
  },
  // A player is stranded when the nearest intact row above the platform they
  // keep bouncing on is farther away than one jump can reach (a broken row
  // leaves a double gap). A surviving companion on that row keeps it reachable.
  // Callers pass jumpReach(), not the analytic apex, because the integrator
  // falls short of the apex by up to half a frame's velocity.
  isStranded(platforms, standing, reach) {
    const above = this.nearestRowAbove(platforms, standing);
    return !above || standing.y - above.y > reach;
  },
  // Evenly spaced solid steps from the standing platform up to the next intact
  // row, never farther apart than a generated gap, drifting sideways towards
  // that row so the route reads as a staircase.
  rescueRungs(standing, above, maxGap, canvasWidth) {
    const gap = standing.y - above.y, count = Math.max(0, Math.ceil(gap / maxGap) - 1), w = RULE_CONFIG.stallRescueRungWidth;
    const from = standing.x + standing.w / 2, to = above.x + above.w / 2;
    return Array.from({ length: count }, (_, index) => {
      const fraction = (index + 1) / (count + 1);
      const center = Math.max(w / 2 + 12, Math.min(canvasWidth - w / 2 - 12, from + (to - from) * fraction));
      return { x: center - w / 2, y: standing.y - gap * fraction, w, type: 'normal', speed: 0, dir: 1, broken: false, helper: true };
    });
  },
  maxDefaultPlatformGap() {
    const normalApex = RULE_CONFIG.baseJumpVelocity ** 2 / (2 * RULE_CONFIG.gravity);
    return Math.min(RULE_CONFIG.safeDefaultPlatformGap, normalApex * .8);
  },
  canHaveDoublePlatform(type) {
    return type !== 'moving';
  },
  endlessBirdChance(score) {
    if (score < RULE_CONFIG.endlessBirdStartScore) return 0;
    const difficulty = this.endlessDifficulty(score);
    const [low, high] = RULE_CONFIG.endlessBirdChanceRange;
    const targetChance = low + (high - low) * difficulty;
    const warmup = Math.min(1, (score - RULE_CONFIG.endlessBirdStartScore) / RULE_CONFIG.endlessBirdWarmupScore);
    return RULE_CONFIG.endlessBirdIntroChance + (targetChance - RULE_CONFIG.endlessBirdIntroChance) * warmup;
  },
  hardBirdChance(score) {
    if (score < RULE_CONFIG.hardBirdStartScore) return 0;
    const [low, high] = RULE_CONFIG.hardBirdChanceRange;
    const targetChance = low + (high - low) * this.endlessDifficulty(score);
    const warmup = Math.min(1, (score - RULE_CONFIG.hardBirdStartScore) / RULE_CONFIG.hardBirdWarmupScore);
    return RULE_CONFIG.hardBirdIntroChance + (targetChance - RULE_CONFIG.hardBirdIntroChance) * warmup;
  },
  canSpawnHardBird(existingBirdYs, candidateY, screenHeight) {
    return existingBirdYs.every(y => Math.abs(y - candidateY) >= screenHeight);
  },
  canSpawnChallengeBird(existingBirdYs, candidateY) {
    return existingBirdYs.every(y => Math.abs(y - candidateY) >= RULE_CONFIG.challengeBirdScreenSpacing);
  },
  arcadeBreakChance(score) {
    const [base, late] = RULE_CONFIG.arcadeBreakChanceRange;
    if (score < RULE_CONFIG.tierThresholds[0]) return 0;
    const progress = Math.max(0, Math.min(1, (score - RULE_CONFIG.arcadeFinalBreakableStartScore) / (RULE_CONFIG.arcadeTargetScore - RULE_CONFIG.arcadeFinalBreakableStartScore)));
    return base + (late - base) * progress;
  },
  challengeBreakChance(score) {
    const base = this.arcadeBreakChance(score);
    const range = RULE_CONFIG.arcadeTargetScore - RULE_CONFIG.challengeLateBreakStartScore;
    const progress = Math.max(0, Math.min(1, (score - RULE_CONFIG.challengeLateBreakStartScore) / range));
    return Math.min(.4, base + RULE_CONFIG.challengeBreakChanceBonus * progress);
  },
  isBelowFinishBanner(platformY, bannerY) {
    return platformY > bannerY;
  },
  isChallengeBowlRow(placed, rowNumber) {
    return placed < RULE_CONFIG.challengeParshadTarget && rowNumber % 3 === 0;
  },
  shouldComplete(mode, score, parshad) {
    return this.isArcadeLike(mode) && score >= RULE_CONFIG.arcadeTargetScore && this.didWin(mode, parshad);
  },
  shouldEndIncompleteChallenge(mode, score, parshad) {
    // Missing bowls still ends the course at the start of the finish section;
    // it never grants a finish banner or a win for partial completion.
    return mode === 'challenge' && !this.didWin(mode, parshad)
      && score >= RULE_CONFIG.arcadeTargetScore - RULE_CONFIG.finishBannerLeadScore;
  },
  didWin(mode, parshad) {
    return mode !== 'challenge' || parshad >= RULE_CONFIG.challengeParshadTarget;
  },
  powerJumpMultiplier(powerJump = 0) {
    const level = Math.max(0, Math.min(5, Number(powerJump) || 0));
    return Math.sqrt(1 + level * RULE_CONFIG.powerJumpHeightBonusPerLevel);
  },
  boostVelocity(type, powerJump = 0) {
    const multiplier = type === 'kara' ? RULE_CONFIG.karaJumpMultiplier : RULE_CONFIG.nishanJumpMultiplier;
    return -RULE_CONFIG.baseJumpVelocity * multiplier * this.powerJumpMultiplier(powerJump);
  },
  canUseFalconSave(owned, alreadyUsed) {
    return owned > 0 && !alreadyUsed;
  },
  formatStat(value) {
    const number = Math.max(0, Math.floor(Number(value) || 0));
    if (number < 10000) return number.toLocaleString();
    const units = [[1e15, 'Q'], [1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'K']];
    const [size, suffix] = units.find(([threshold]) => number >= threshold);
    const compact = number / size;
    const rounded = compact < 10 ? Math.round(compact * 10) / 10 : Math.round(compact);
    return `${rounded}${suffix}`;
  },
  finishRunwayIsReachable() {
    const jumpApex = RULE_CONFIG.baseJumpVelocity ** 2 / (2 * RULE_CONFIG.gravity);
    return RULE_CONFIG.finishRunwayGap < jumpApex && RULE_CONFIG.finishBannerGap < jumpApex;
  },
};

globalThis.SEVA_RULES = SEVA_RULES;
if (typeof module !== 'undefined') module.exports = SEVA_RULES;
