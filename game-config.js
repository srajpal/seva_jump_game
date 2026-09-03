const SEVA_CONFIG = {
  gravity: 1500,
  baseJumpVelocity: 620,
  springJumpVelocity: 820,
  // Each Power Jump level adds a true 10% to jump height. Velocity uses the
  // square root of this value because height is proportional to velocity².
  powerJumpHeightBonusPerLevel: .1,
  karaJumpMultiplier: 1.4,
  nishanJumpMultiplier: 1.6,
  // Responsive enough for a phone drag, while still leaving time to line up
  // on the narrower late-game platforms.
  maxHorizontalSpeed: 440,
  // Drag input targets a position directly, so it needs a gentler cap than
  // keyboard input. This keeps a single phone swipe from crossing the entire
  // stage while preserving reachability for every generated platform route.
  pointerMaxHorizontalSpeed: 300,
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
  endlessBirdStartScore: 160,
  endlessBirdWarmupScore: 120,
  endlessBirdIntroChance: .025,
  endlessBirdChanceRange: [.08, .26],
  hardBirdStartScore: 60,
  hardBirdWarmupScore: 140,
  hardBirdIntroChance: .04,
  hardBirdChanceRange: [.10, .22],
  hardMovingChance: .38,
  hardDoubleBreakChance: .34,
  hardBreakPlatformWidthRange: [58, 72],
  hardMovingPlatformWidthRange: [72, 88],
  hardHorizontalShiftRange: [92, 132],
  hardMovingPlatformSpeedRange: [58, 92],
  // Birds should be hazards to steer around, never sit directly above the
  // platform a player is trying to land on.
  birdPlatformClearance: 76,
  arcadeTargetScore: 1000,
  challengeParshadTarget: 50,
  arcadeBirdStartScore: 500,
  // Challenge introduces birds earlier than Arcade, but keeps them at least
  // one screen apart so each encounter remains readable.
  challengeBirdStartScore: 350,
  challengeBirdChance: .24,
  challengeBirdScreenSpacing: 800,
  challengeBirdSpeedBonus: 60,
  finishBannerLeadScore: 28,
  finishRunwayGap: 96,
  finishRunwaySteps: 4,
  finishBannerGap: 84,
  victorySceneDurationMs: 5000,
  victoryFadeDurationMs: 700,
  arcadeFinalBreakableStartScore: 700,
  arcadeBreakChanceRange: [.22, .29],
  challengeLateBreakStartScore: 600,
  challengeBreakChanceBonus: .1,
  arcadeHorizontalMultiplier: 1.16,
  arcadeGapBonus: 6,
  movingPlatformSpeedRange: [44, 72],
  arcadeMovingPlatformSpeedRange: [54, 104],
  // Rounded up from the previous prices: each level is 50% more expensive.
  powerJumpCosts: [15, 23, 38, 53, 68],
};

globalThis.SEVA_CONFIG = SEVA_CONFIG;
if (typeof module !== 'undefined') module.exports = SEVA_CONFIG;
