const RULE_CONFIG = typeof module !== 'undefined' ? require('./game-config.js') : globalThis.SEVA_CONFIG;

const SEVA_RULES = {
  isArcadeLike(mode) { return mode === 'arcade' || mode === 'challenge'; },
  shouldComplete(mode, score, parshad) {
    if (mode === 'arcade') return score >= RULE_CONFIG.arcadeTargetScore;
    if (mode === 'challenge') return score >= RULE_CONFIG.arcadeTargetScore;
    return false;
  },
  didWin(mode, parshad) {
    return mode !== 'challenge' || parshad >= RULE_CONFIG.challengeParshadTarget;
  },
};

globalThis.SEVA_RULES = SEVA_RULES;
if (typeof module !== 'undefined') module.exports = SEVA_RULES;
