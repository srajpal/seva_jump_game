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
  // A hop describes one bounce: the launch velocity (base unless the platform
  // is a spring), the Power Jump level and the player's half width, which is
  // the overlap a landing needs. hop.reach may override the integrator reach.
  hopReach(hop) {
    return hop.reach ?? this.jumpReach(hop.powerJump, hop.velocity ?? RULE_CONFIG.baseJumpVelocity);
  },
  // Seconds from launch until the feet come back down to a row 'gap' px above.
  hopTime(gap, hop) {
    const velocity = (hop.velocity ?? RULE_CONFIG.baseJumpVelocity) * this.powerJumpMultiplier(hop.powerJump);
    // Callers check the height first; at exactly the apex the flight is v / g.
    return (velocity + Math.sqrt(Math.max(0, velocity ** 2 - 2 * RULE_CONFIG.gravity * gap))) / RULE_CONFIG.gravity;
  },
  // Sideways distance a touch player covers in one hop: the pointer speed cap
  // less the ramp-up the steering response costs (about one time constant).
  horizontalReach(time) {
    return RULE_CONFIG.pointerMaxHorizontalSpeed * Math.max(0, time - 1 / RULE_CONFIG.pointerSteeringResponse);
  },
  // Same reachability the generator promises for consecutive rows: the target
  // is within the hop's height and its landing edge is within sideways reach
  // during the flight, with a moving target assumed to drift away.
  canHop(from, to, hop) {
    const gap = from.y - to.y;
    if (!(gap > 0 && gap <= this.hopReach(hop))) return false;
    const time = this.hopTime(gap, hop);
    const travel = Math.abs(to.x + to.w / 2 - from.x - from.w / 2) + (to.speed || 0) * time - to.w / 2 - hop.halfWidth;
    return Math.max(0, travel) <= this.horizontalReach(time);
  },
  // A player is stranded when no intact platform above the one they keep
  // bouncing on can be hopped to: a broken row leaves a double gap, or the only
  // surviving platform of the next row sits too far sideways for a touch
  // player. A surviving companion within reach keeps the row reachable.
  isStranded(platforms, standing, hop) {
    return platforms.every(p => p.broken || p.y >= standing.y || !this.canHop(standing, p, hop));
  },
  // Evenly spaced solid steps from the standing platform up to the next intact
  // row, drifting sideways towards it so the route reads as a staircase: the
  // fewest steps that keep every hop within a generated gap and within reach.
  rescueRungs(standing, above, hop, canvasWidth) {
    const gap = standing.y - above.y, w = RULE_CONFIG.stallRescueRungWidth, maxGap = this.maxDefaultPlatformGap();
    const from = standing.x + standing.w / 2, to = above.x + above.w / 2;
    const base = { ...hop, velocity: RULE_CONFIG.baseJumpVelocity, reach: undefined };
    const build = count => Array.from({ length: count }, (_, index) => {
      const fraction = (index + 1) / (count + 1);
      const center = Math.max(w / 2 + 12, Math.min(canvasWidth - w / 2 - 12, from + (to - from) * fraction));
      return { x: center - w / 2, y: standing.y - gap * fraction, w, type: 'normal', speed: 0, dir: 1, broken: false, helper: true };
    });
    for (let count = 0; ; count++) {
      const route = [standing, ...build(count), above];
      if (gap / (count + 1) <= maxGap && route.every((step, index) => !index || this.canHop(route[index - 1], step, base))) return route.slice(1, -1);
      if (count >= 8) return build(count);
    }
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
