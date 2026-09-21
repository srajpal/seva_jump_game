const SEVA_CONFIG = {
  gravity: 1500,
  baseJumpVelocity: 620,
  springJumpVelocity: 820,
  // Each Power Jump level adds a true 10% to jump height. Velocity uses the
  // square root of this value because height is proportional to velocity².
  powerJumpHeightBonusPerLevel: .1,
  // Longest frame step the game loop integrates. Semi-implicit Euler (velocity
  // first, then position) reaches velocity * step / 2 less than the analytic
  // apex, so reachability checks use this worst case, not the analytic apex.
  maxFrameSeconds: .04,
  karaJumpMultiplier: 1.4,
  // The Nishan boost is a short guided flight rather than a stronger bounce:
  // a steady climb at this speed with gravity off, then a natural
  // deceleration from it. The speed sits below a normal jump so the arc it
  // leaves behind is one the generator's rows can always catch.
  nishanFlightSeconds: 1.2,
  nishanFlightSpeed: 520,
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
  gamepadDeadzone: .18,
  breakCrumbleDuration: .3,
  breakCrumbleFallDistance: 36,
  // Seconds without a height gain before a stranded player gets help. The
  // platform turns into a spring, whose worst-case reach (about 208 px)
  // clears the two capped gaps (192 px) a single broken row leaves. When
  // several rows broke in a row (Hard's double-break rows) the gap is bridged
  // by helper platforms of this width instead.
  stallRescueSeconds: 3,
  stallRescueRungWidth: 76,
  // Without Helping Hand (or in Challenge and Hard, where it never applies) a
  // stranded run is told so at stallRescueSeconds and ends here instead of
  // bouncing forever.
  stallEndSeconds: 6,
  musicBeatSeconds: .5,
  musicLookaheadSeconds: .2,
  musicStartDelaySeconds: .05,
  musicSchedulerIntervalMs: 50,
  // Each mode's 8-beat phrase: one melody note per beat over a bass note every
  // two beats. Hard shares Endless. playMusicPhrase cycles four variants of it
  // (as written, reversed as an answer, lifted a fifth, a syncopated octave
  // bounce) so the loop only repeats every fourth phrase.
  musicPhrases: {
    endless: { melody: [392, 440, 523, 440, 349, 392, 440, 494], bass: [196, 175, 196, 220] },
    arcade: { melody: [392, 440, 523, 587, 523, 440, 494, 523], bass: [196, 175, 196, 220] },
    challenge: { melody: [392, 440, 494, 523, 494, 440, 392, 330], bass: [196, 196, 220, 220] },
  },
  musicLiftRatio: 1.5,
  // Beat offset and length of each bounce-variant note; together they still
  // fill exactly eight beats so the scheduler's phrase advance holds.
  musicBounceBeats: [[0, 1.5], [1.5, .5], [2, 1], [3, 1], [4, 1.5], [5.5, .5], [6, 1], [7, 1]],
  // Arcade has authored score bands; Endless instead uses a continuous curve.
  tierThresholds: [100, 250, 450, 700],
  horizontalShifts: [72, 94, 116, 136, 136],
  verticalGapRanges: [[78, 98], [82, 112]],
  // A conservative cap below the unboosted jump apex keeps every normal
  // platform route reachable without relying on boosts or perfect timing.
  safeDefaultPlatformGap: 96,
  doublePlatformChance: .24,
  // Cumulative platform-roll cutoffs; Arcade break odds come from its score curve.
  arcadePlatformMix: { spring: .09, moving: .55 },
  endlessPlatformMix: {
    spring: { base: .10, increase: .03 },
    break: { base: .18, increase: .14 },
    moving: { base: .38, increase: .18 },
  },
  collectibleChance: .53,
  tokenShare: .16,
  challengeTokenChance: .14,
  powerupChances: { kara: .055, nishan: .04 },
  arcadeBirdChance: .18,
  birdSpeed: { base: 60, randomRange: 45, difficultyBonus: 35, hardBonus: 12 },
  endlessDifficultyScore: 1500,
  // Past the difficulty cap a gentler second ramp keeps strong Endless runs
  // from plateauing. It only touches hazards that cannot break reachability
  // (bird speed, bird odds, moving-platform speed), never gaps or shifts.
  endlessLateDifficultyScore: 1500,
  endlessLateBirdSpeedBonus: 40,
  endlessLateBirdChanceCap: .32,
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
  birdSpawnOffset: 90,
  arcadeTargetScore: 1000,
  challengeParshadTarget: 50,
  // Net is H - 52 and bowl pickup reach is 86: normally unreachable at H + 34.
  // A 40 ms falling frame can overshoot the net before Falcon rescue, so track
  // recovered misses even beyond this extra warning margin.
  challengeMissedBowlMargin: 60,
  challengeMissedMessageDuration: 3,
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
  // The backdrop walks courtyard -> sunset -> dawn as the height score passes
  // each zone, so a long climb reads as time passing. The fade runs on active
  // time; the cloud layer drifts against the camera to give the climb depth.
  backdropZones: [0, 500, 1100],
  backdropFadeMs: 1200,
  backdropCloudParallax: .04,
  victorySceneDurationMs: 5000,
  victoryFadeDurationMs: 700,
  birdHitDurationMs: 1000,
  reducedMotionBirdHitDurationMs: 750,
  falconCarryDurationMs: 1100,
  reducedMotionFalconCarryDurationMs: 650,
  falconFlashDurationMs: 1100,
  shieldFlashDurationMs: 950,
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
  falconCost: 8,
  shieldCost: 10,
};

globalThis.SEVA_CONFIG = SEVA_CONFIG;
if (typeof module !== 'undefined') module.exports = SEVA_CONFIG;
