const RULE_CONFIG = typeof module !== 'undefined' ? require('./game-config.js') : globalThis.SEVA_CONFIG;

const SEVA_RULES = {
  isArcadeLike(mode) { return mode === 'arcade' || mode === 'challenge'; },
  isHard(mode) { return mode === 'hard'; },
  endlessDifficulty(score) {
    return Math.max(0, Math.min(1, score / RULE_CONFIG.endlessDifficultyScore));
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
  shouldComplete(mode, score, parshad) {
    if (mode === 'arcade') return score >= RULE_CONFIG.arcadeTargetScore;
    if (mode === 'challenge') return score >= RULE_CONFIG.arcadeTargetScore && parshad >= RULE_CONFIG.challengeParshadTarget;
    return false;
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
