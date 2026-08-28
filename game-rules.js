const RULE_CONFIG = typeof module !== 'undefined' ? require('./game-config.js') : globalThis.SEVA_CONFIG;

const SEVA_RULES = {
  isArcadeLike(mode) { return mode === 'arcade' || mode === 'challenge'; },
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
  shouldComplete(mode, score, parshad) {
    if (mode === 'arcade') return score >= RULE_CONFIG.arcadeTargetScore;
    if (mode === 'challenge') return score >= RULE_CONFIG.arcadeTargetScore && parshad >= RULE_CONFIG.challengeParshadTarget;
    return false;
  },
  didWin(mode, parshad) {
    return mode !== 'challenge' || parshad >= RULE_CONFIG.challengeParshadTarget;
  },
  boostVelocity(type, powerJump = 0) {
    const multiplier = type === 'kara' ? RULE_CONFIG.karaJumpMultiplier : RULE_CONFIG.nishanJumpMultiplier;
    return -RULE_CONFIG.baseJumpVelocity * multiplier * (1 + powerJump * .1);
  },
  canUseFalconSave(owned, alreadyUsed) {
    return owned > 0 && !alreadyUsed;
  },
  finishRunwayIsReachable() {
    const jumpApex = RULE_CONFIG.baseJumpVelocity ** 2 / (2 * RULE_CONFIG.gravity);
    const neededAfterLastPlatform = RULE_CONFIG.finishBannerLeadScore * 18 - RULE_CONFIG.finishRunwaySteps * RULE_CONFIG.finishRunwayGap;
    return RULE_CONFIG.finishRunwayGap < jumpApex && neededAfterLastPlatform < jumpApex;
  },
};

globalThis.SEVA_RULES = SEVA_RULES;
if (typeof module !== 'undefined') module.exports = SEVA_RULES;
