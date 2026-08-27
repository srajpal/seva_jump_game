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
  // Arcade has authored score bands; Endless instead uses a continuous curve.
  tierThresholds: [100, 250, 450, 700],
  horizontalShifts: [72, 94, 116, 136, 136],
  verticalGapRanges: [[78, 98], [82, 112]],
  // A conservative cap below the unboosted jump apex keeps every normal
  // platform route reachable without relying on boosts or perfect timing.
  safeDefaultPlatformGap: 96,
  doublePlatformChance: .24,
  endlessDifficultyScore: 1500,
  endlessHorizontalShiftRange: [72, 136],
  endlessBirdStartScore: 180,
  endlessBirdChanceRange: [.08, .26],
  // Birds should be hazards to steer around, never sit directly above the
  // platform a player is trying to land on.
  birdPlatformClearance: 76,
  arcadeTargetScore: 1000,
  challengeParshadTarget: 50,
  arcadeBirdStartScore: 500,
  finishBannerLeadScore: 28,
  finishRunwayGap: 96,
  finishRunwaySteps: 4,
  arcadeHorizontalMultiplier: 1.16,
  arcadeGapBonus: 6,
  movingPlatformSpeedRange: [44, 72],
  arcadeMovingPlatformSpeedRange: [54, 104],
};

globalThis.SEVA_CONFIG = SEVA_CONFIG;
if (typeof module !== 'undefined') module.exports = SEVA_CONFIG;
