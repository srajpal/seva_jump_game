const assert = require('node:assert/strict');
const config = require('../game-config.js');
const rules = require('../game-rules.js');
const { makeRuntime } = require('./runtime-browser-checks.js');

function cleanState(runtime, mode = 'endless') {
  runtime.hooks.reset(mode);
  const state = runtime.hooks.state;
  Object.assign(state, { running: true, paused: false, ending: false, nextY: -10000, platforms: [], collectibles: [], powerups: [], enemies: [], particles: [] });
  Object.assign(runtime.hooks.profile, { music: false, sound: false, reducedMotion: true });
  return state;
}

const runtime = makeRuntime({ value: JSON.stringify({ tutorialComplete: true, music: false, sound: false, reducedMotion: true }) });

// Ordinary downward contact lands and increments the real jump counter.
let state = cleanState(runtime);
state.platforms = [{ x: 150, y: 500, w: 150, type: 'normal', speed: 0, dir: 1, broken: false }];
Object.assign(state.player, { x: 225, y: 470, vy: 100, vx: 0 });
runtime.hooks.update(.04);
assert.equal(state.player.y, 500 - state.player.h / 2);
assert.ok(state.player.vy < 0);
assert.equal(runtime.hooks.profile.stats.jumps, 1);

// A fast descent at the real 40 ms frame cap still lands when the player's
// path crosses a platform. A final-position 25 px band misses this case.
state = cleanState(runtime);
state.platforms = [{ x: 150, y: 500, w: 150, type: 'normal', speed: 0, dir: 1, broken: false }];
Object.assign(state.player, { x: 225, y: 475, vy: 700, vx: 0 }); // feet at 499
runtime.hooks.update(.04);
assert.equal(state.player.y, 500 - state.player.h / 2);
assert.ok(state.player.vy < 0, 'swept crossing should bounce instead of tunneling');

// At the maximum generated one-platform gap, ordinary landing velocity stays
// within the band at the frame cap; tunneling begins after a missed platform.
const ordinaryImpactVelocity = Math.sqrt(2 * config.gravity * rules.maxDefaultPlatformGap());
assert.ok(ordinaryImpactVelocity * .04 + config.gravity * .04 * .04 < 25);

// The completion check precedes pickup processing, but the authored route puts
// bowl 50 safely below the cutoff. Keep that reachability margin under test.
let highestArrivalScore = 0;
for (let run = 0; run < 500; run++) {
  runtime.hooks.reset('challenge'); state = runtime.hooks.state;
  while (state.challengePlaced < config.challengeParshadTarget) runtime.hooks.addPlatform();
  const lastBowl = state.collectibles.filter(item => item.challengeBowl).at(-1);
  const arrivalScore = Math.max(0, Math.floor((650 - lastBowl.y) / 18)) + 49 * 3;
  highestArrivalScore = Math.max(highestArrivalScore, arrivalScore);
}
assert.ok(highestArrivalScore < config.arcadeTargetScore - config.finishBannerLeadScore, `generated last-bowl arrival score ${highestArrivalScore} unexpectedly reaches cutoff`);

// Exercise actual boost collection.
state = cleanState(runtime);
Object.assign(state.player, { x: 200, y: 300, vx: 0, vy: 0 });
state.powerups = [{ x: 200, y: 300, type: 'kara', taken: false }];
runtime.hooks.update(0);
assert.equal(state.player.vy, rules.boostVelocity('kara', runtime.hooks.profile.powerJump));
assert.equal(runtime.hooks.profile.stats.powerups, 1);

// Exercise delayed shield resolution and its persisted counters.
state = cleanState(runtime); runtime.hooks.profile.shield = 1;
Object.assign(state.player, { x: 200, y: 300, vx: 0, vy: 0 });
state.enemies = [{ x: 200, y: 300, vx: 0, hit: false }];
runtime.hooks.setLastTime(1000); runtime.hooks.update(0);
assert.equal(state.hitStop.type, 'shield');
runtime.hooks.setLastTime(1800); runtime.hooks.update(0);
assert.equal(runtime.hooks.profile.shield, 0);
assert.equal(runtime.hooks.profile.stats.shieldsUsed, 1);
assert.equal(runtime.hooks.profile.stats.birdsBlocked, 1);

// Exercise Falcon Save consumption, carry completion, and one-use guard.
state = cleanState(runtime); runtime.hooks.profile.falcon = 1;
Object.assign(state.player, { x: 220, y: 760, vx: 0, vy: 500 });
runtime.hooks.setLastTime(2000); runtime.hooks.update(0);
assert.ok(state.falconRescue);
assert.equal(runtime.hooks.profile.falcon, 0);
assert.equal(runtime.hooks.profile.stats.falconSaves, 1);
assert.equal(state.falconUsed, true);
runtime.hooks.setLastTime(2700); runtime.hooks.update(0);
assert.equal(state.falconRescue, null);
assert.ok(state.player.vy < 0);

// Repeated runs accumulate results once per run and reset transient state.
const priorRuns = runtime.hooks.profile.stats.runs;
const priorFalls = runtime.hooks.profile.stats.fallDeaths;
for (let run = 0; run < 3; run++) {
  state = cleanState(runtime);
  state.score = 100 + run; state.heightScore = 50 + run; state.tokens = run;
  runtime.hooks.finish(false, 'fall');
  runtime.hooks.finish(false, 'fall');
}
assert.equal(runtime.hooks.profile.stats.runs, priorRuns + 3);
assert.equal(runtime.hooks.profile.stats.fallDeaths, priorFalls + 3);
assert.equal(JSON.parse(runtime.storage.value).stats.runs, priorRuns + 3, 'repeated run totals should persist');

console.log(`Gameplay runtime checks passed. Generated Challenge last-bowl arrival score peaked at ${highestArrivalScore}; cutoff is ${config.arcadeTargetScore - config.finishBannerLeadScore}.`);
