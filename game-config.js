const SEVA_CONFIG = {
  gravity: 1500,
  baseJumpVelocity: 620,
  springJumpVelocity: 820,
  karaJumpMultiplier: 1.4,
  nishanJumpMultiplier: 1.6,
  // Responsive enough for a phone drag, while still leaving time to line up
  // on the narrower late-game platforms.
  maxHorizontalSpeed: 440,
  pointerSteeringGain: 9,
  pointerSteeringResponse: 18,
  keyboardAcceleration: 1500,
  // Target pacing in the soak test: roughly 10s, 25s, 45s, and 70s.
  tierThresholds: [100, 250, 450, 700],
  horizontalShifts: [72, 94, 116, 136],
  verticalGapRanges: [[78, 98], [82, 112]],
  arcadeTargetScore: 1000,
  challengeParshadTarget: 50,
  arcadeBirdStartScore: 500,
  finishBannerLeadScore: 28,
  finishRunwayGap: 108,
  finishRunwaySteps: 4,
  arcadeHorizontalMultiplier: 1.16,
  arcadeGapBonus: 6,
  movingPlatformSpeedRange: [44, 72],
  arcadeMovingPlatformSpeedRange: [54, 104],
};

globalThis.SEVA_CONFIG = SEVA_CONFIG;
if (typeof module !== 'undefined') module.exports = SEVA_CONFIG;
