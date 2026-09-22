const assert = require('node:assert/strict');
const config = require('../game-config.js');
const rules = require('../game-rules.js');
const { makeRuntime } = require('./runtime-browser-checks.js');
const { sizes, makeGenerator, collectRow } = require('./generator-helpers.js');

function cleanState(runtime, mode = 'endless') {
  runtime.hooks.reset(mode);
  const state = runtime.hooks.state;
  Object.assign(state, { running: true, paused: false, ending: false, nextY: -10000, platforms: [], collectibles: [], powerups: [], enemies: [], particles: [] });
  Object.assign(runtime.hooks.profile, { music: false, sound: false, reducedMotion: true });
  return state;
}

function advanceUpdates(runtime, seconds) {
  for (let remaining = seconds; remaining > 1e-9; remaining -= .04) runtime.hooks.update(Math.min(.04, remaining));
}

const runtime = makeRuntime({ value: JSON.stringify({ tutorialComplete: true, music: false, sound: false, reducedMotion: true }) });

// A long frame can carry a bird past an edge; shorter following frames must
// bring it back into the playfield instead of flipping its direction in place.
for (const size of sizes) {
  for (const side of [-1, 1]) {
    const edgeRuntime = makeRuntime({}, size);
    const edgeState = cleanState(edgeRuntime);
    const edgeBird = { x: side < 0 ? 21 : size.width - 21, y: 100, vx: side * 200, type: 'pigeon', flapOffset: 0 };
    edgeState.enemies = [edgeBird];
    edgeRuntime.hooks.update(.04);
    for (let frame = 0; frame < 12; frame++) edgeRuntime.hooks.update(1 / 120);
    assert.equal(Math.sign(edgeBird.vx), -side, 'bird keeps flying inward after an edge turn');
    assert.ok(edgeBird.x > 30 && edgeBird.x < size.width - 30, 'bird leaves the edge at mixed frame rates');
  }
}

// Ordinary downward contact lands and increments the real jump counter.
let state = cleanState(runtime);
state.platforms = [{ x: 150, y: 500, w: 150, type: 'normal', speed: 0, dir: 1, broken: false }];
Object.assign(state.player, { x: 225, y: 470, vy: 100, vx: 0 });
runtime.hooks.update(.04);
assert.equal(state.player.y, 500 - state.player.h / 2);
assert.ok(state.player.vy < 0);
assert.equal(runtime.hooks.profile.stats.jumps, 1);

// Broken platforms linger visually but cannot bounce the player a second time.
for (const reducedMotion of [false, true]) {
  state = cleanState(runtime); runtime.hooks.profile.reducedMotion = reducedMotion;
  const platform = { x: 150, y: 500, w: 150, type: 'break', speed: 0, dir: 1, broken: false };
  state.platforms = [platform];
  Object.assign(state.player, { x: 225, y: 470, vy: 100, vx: 0 });
  const jumps = runtime.hooks.profile.stats.jumps;
  runtime.hooks.update(.04);
  assert.equal(platform.broken, true); assert.equal(platform.breakElapsed, 0);
  assert.equal(state.platforms.includes(platform), true, 'landing does not remove the crumble image');
  Object.assign(state.player, { x: 225, y: 475, vy: 700, vx: 0 });
  runtime.hooks.update(.04);
  assert.equal(runtime.hooks.profile.stats.jumps, jumps + 1, 'a crumbling platform is no longer solid');
  Object.assign(state.player, { y: 400, vy: 0 });
  advanceUpdates(runtime, config.breakCrumbleDuration - .08);
  assert.equal(state.platforms.includes(platform), true);
  advanceUpdates(runtime, .05);
  assert.equal(state.platforms.includes(platform), false, 'crumble expires after the configured duration');
}

runtime.hooks.start('endless');
state = runtime.hooks.state;
assert.equal(runtime.hooks.profile.stats.birdsSeen, 0, 'generating a course never counts birds as seen');
state.cameraY = 0;
const bird = { x: 225, y: -900, vx: 60, type: 'pigeon', flapOffset: 0 };
state.enemies = [bird]; runtime.hooks.draw(); assert.equal(runtime.hooks.profile.stats.birdsSeen, 0);
bird.y = 300; runtime.hooks.draw(); runtime.hooks.draw();
assert.equal(runtime.hooks.profile.stats.birdsSeen, 1, 'a bird counts once when first visible');
bird.y = -900; runtime.hooks.draw(); bird.y = 300; runtime.hooks.draw();
assert.equal(runtime.hooks.profile.stats.birdsSeen, 1, 're-entering view does not count twice');
const hiddenBird = { ...bird, seen: false }; state.enemies.push(hiddenBird);
runtime.hooks.pauseGame(); runtime.hooks.draw(); assert.equal(runtime.hooks.profile.stats.birdsSeen, 1);
runtime.hooks.showHome(); runtime.hooks.draw(); assert.equal(runtime.hooks.profile.stats.birdsSeen, 1, 'menu backgrounds do not count sightings');

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
for (const size of sizes) {
  const course = makeGenerator(size, 0xc4a11 + size.width);
  for (let run = 0; run < 500; run++) {
    course.hooks.reset('challenge');
    const generated = course.hooks.state;
    for (const platform of generated.platforms.filter(item => !item.companion).slice(1)) {
      collectRow(generated, platform, generated.collectibles.filter(item => item.y < platform.y && item.y >= platform.y - 37));
    }
    while (generated.score < config.arcadeTargetScore - config.finishBannerLeadScore) {
      const itemCount = generated.collectibles.length;
      course.hooks.addPlatform();
      collectRow(generated, generated.lastPlatform, generated.collectibles.slice(itemCount));
    }
    const bowls = generated.collectibles.filter(item => item.challengeBowl);
    assert.equal(bowls.length, config.challengeParshadTarget);
    assert.equal(generated.powerups.length, 0, 'Challenge courses must never spawn Kara or Nishan boosts');
    const primary = generated.platforms.filter(item => !item.companion);
    for (const bowl of bowls) {
      const bowlRow = primary.findIndex(platform => platform.y === bowl.y + 26);
      assert.ok(bowlRow > 0);
      assert.equal(primary[bowlRow].type, 'normal', 'bowl rows stay solid');
      assert.notEqual(primary[bowlRow - 1].type, 'spring', 'the row immediately below a bowl must not launch past it');
    }
    const arrivalScore = Math.max(0, Math.floor((650 - bowls.at(-1).y) / 18)) + 49 * 3;
    highestArrivalScore = Math.max(highestArrivalScore, arrivalScore);
  }
}
assert.ok(highestArrivalScore < config.arcadeTargetScore - config.finishBannerLeadScore, `generated last-bowl arrival score ${highestArrivalScore} unexpectedly reaches cutoff`);

// Only an untaken Challenge bowl beyond the missed-bowl boundary warns the
// player. Keep it alive across multiple frames and then remove it to ensure
// neither later frames nor later missed bowls replay the message or sound.
const missedRuntime = makeRuntime({}, { native: true });
const playedSounds = [];
missedRuntime.hooks.observeSounds(type => playedSounds.push(type));
state = cleanState(missedRuntime, 'challenge');
assert.equal(state.challengeMissed, false);
Object.assign(state.player, { x: 225, y: 400, vy: 0 });
state.parshad = 6;
const boundary = state.cameraY + missedRuntime.elements.get('#game').height + config.challengeMissedBowlMargin;
state.collectibles = [{ x: 100, y: boundary, type: 'parshad', challengeBowl: true }];
missedRuntime.hooks.update(0);
assert.equal(state.challengeMissed, false, 'the exact boundary is still recoverable');
state.collectibles[0].y++;
let warningCount = 0, message = state.message;
Object.defineProperty(state, 'message', { get: () => message, set(value) { message = value; warningCount++; } });
missedRuntime.hooks.update(0);
assert.equal(state.challengeMissed, true);
assert.equal(state.message, 'A bowl was missed - restart to collect all 50');
assert.equal(state.messageTimer, config.challengeMissedMessageDuration);
missedRuntime.hooks.updateMobileHud();
assert.equal(missedRuntime.elements.get('#mobile-mode').textContent, 'CHALLENGE · 6/50 · MISSED');
missedRuntime.hooks.update(.04);
assert.ok(state.messageTimer < config.challengeMissedMessageDuration, 'the warning timer is not refreshed every frame');
state.collectibles.push({ x: 100, y: boundary + 100, type: 'parshad', challengeBowl: true });
missedRuntime.hooks.update(0);
assert.equal(warningCount, 1, 'the warning message is assigned exactly once per run');
assert.equal(playedSounds.filter(type => type === 'loss').length, 1, 'the loss sound plays exactly once');
assert.equal(state.collectibles.length, 1, 'the later bowl was detected before normal offscreen cleanup');
for (const [mode, collectible] of [
  ['challenge', { type: 'parshad', challengeBowl: true, taken: true }],
  ['challenge', { type: 'token' }],
  ['arcade', { type: 'parshad' }],
]) {
  state = cleanState(missedRuntime, mode);
  Object.assign(state.player, { y: 400, vy: 0 });
  state.collectibles = [{ x: 100, y: boundary + 100, ...collectible }];
  missedRuntime.hooks.update(0);
  assert.equal(state.challengeMissed, false, 'taken bowls, tokens and other modes do not warn');
}
state = cleanState(missedRuntime, 'challenge');
missedRuntime.hooks.updateMobileHud();
assert.equal(state.challengeMissed, false, 'restarting clears the missed-bowl flag');
assert.equal(missedRuntime.elements.get('#mobile-mode').textContent, 'CHALLENGE · 0/50');

// A 40 ms frame can pick up a warned bowl before the net triggers Falcon.
// Another missed bowl, including one already culled, must remain in the HUD.
for (const otherMiss of [false, true]) {
  state = cleanState(missedRuntime, 'challenge');
  missedRuntime.hooks.profile.falcon = 1;
  state.cameraY = 0;
  Object.assign(state.player, { x: 225, y: 400, vy: 0 });
  const recoverable = { x: 225, y: 861, type: 'parshad', challengeBowl: true };
  state.collectibles = [recoverable];
  if (otherMiss) state.collectibles.push({ x: 25, y: 950, type: 'parshad', challengeBowl: true });
  missedRuntime.hooks.update(0); assert.equal(state.challengeMissed, true);
  Object.assign(state.player, { y: 747, vy: 1000 });
  missedRuntime.hooks.update(.04);
  assert.equal(recoverable.taken, true, 'lag frame recovers the previously warned bowl');
  assert.ok(state.falconRescue, 'the same frame triggers Falcon rescue');
  assert.equal(state.challengeMissed, otherMiss);
  missedRuntime.hooks.updateMobileHud();
  assert.equal(missedRuntime.elements.get('#mobile-mode').textContent.includes('MISSED'), otherMiss);
}
for (const native of [false, true]) {
  const painted = [];
  const messages = makeRuntime({}, { native, drawingContext: { fillText(text, x, y) { painted.push({ text, y }); } } });
  state = cleanState(messages, 'challenge'); state.challengeMissed = true;
  for (const message of ['A bowl was missed - restart to collect all 50', 'FALCON SAVE!', 'Back in the sky!', 'Bird hit!']) {
    state.message = message; state.messageTimer = 2; painted.length = 0; messages.hooks.draw();
    const item = painted.find(item => item.text === message);
    if (message.startsWith('A bowl')) assert.equal(item?.y, 180);
    else if (native) assert.equal(item, undefined, 'later messages stay off the mobile canvas');
    else assert.equal(item?.y, 120, 'desktop messages keep their normal position after a miss');
  }
}

// Exercise actual boost collection.
state = cleanState(runtime);
Object.assign(state.player, { x: 200, y: 300, vx: 0, vy: 0 });
state.powerups = [{ x: 200, y: 300, type: 'kara', taken: false }];
runtime.hooks.update(0);
assert.equal(state.player.vy, rules.boostVelocity('kara', runtime.hooks.profile.powerJump));
assert.equal(runtime.hooks.profile.stats.powerups, 1);

// A long pause must freeze a rescue in the middle of its carry, including the
// flash; resume must not teleport the player or expire the effect.
for (const reducedMotion of [false, true]) {
  const pausedRuntime = makeRuntime({ value: JSON.stringify({ tutorialComplete: true }) });
  const pausedState = cleanState(pausedRuntime);
  pausedRuntime.hooks.profile.reducedMotion = reducedMotion;
  pausedRuntime.hooks.profile.falcon = 1;
  Object.assign(pausedState.player, { x: 220, y: 760, vx: 0, vy: 500 });
  let clock = 2000;
  pausedRuntime.hooks.setLastTime(clock);
  pausedRuntime.hooks.triggerFalconSave();
  const frames = reducedMotion ? 10 : 17;
  for (let frame = 0; frame < frames; frame++) {
    clock += 40; pausedRuntime.hooks.setLastTime(clock); pausedRuntime.hooks.update(.04);
  }
  const rescue = pausedState.falconRescue, flash = pausedState.upgradeEffect;
  const before = { x: pausedState.player.x, y: pausedState.player.y, rescue: rescue.elapsed, flash: flash.elapsed };
  assert.ok(pausedState.player.y < 760, 'rescue reached its carry stage before pausing');
  pausedRuntime.hooks.pauseGame();
  pausedRuntime.hooks.setLastTime(clock + 60000);
  pausedRuntime.hooks.update(.04);
  pausedRuntime.hooks.resumeGame();
  pausedRuntime.hooks.update(0);
  assert.equal(pausedState.falconRescue, rescue, 'resuming must not instantly finish the paused Falcon rescue');
  assert.deepEqual({ x: pausedState.player.x, y: pausedState.player.y, rescue: rescue.elapsed, flash: flash.elapsed }, before);
  assert.equal(pausedState.upgradeEffect, flash, 'the flash survives the pause');
  for (let frame = 0; frame < 12; frame++) pausedRuntime.hooks.update(.04);
  assert.equal(pausedState.falconRescue, null, 'carry completes after its remaining active time');
  assert.equal(pausedRuntime.hooks.profile.stats.falconSaves, 1);
}

// All hit-stop outcomes wait for active time, including after a long pause.
for (const type of ['shield', 'nishan', 'loss']) {
  const hitRuntime = makeRuntime({ value: JSON.stringify({ tutorialComplete: true }) });
  const hitState = cleanState(hitRuntime);
  hitRuntime.hooks.profile.shield = type === 'shield' ? 1 : 0;
  if (type === 'nishan') { hitState.invincibleTimer = 5; hitState.invincibleSource = 'nishan'; }
  Object.assign(hitState.player, { x: 200, y: 300, vx: 0, vy: 0 });
  hitRuntime.hooks.triggerBirdHit({ x: 200, y: 300, hit: false });
  const hit = hitState.hitStop;
  advanceUpdates(hitRuntime, .28);
  hitRuntime.hooks.pauseGame();
  hitRuntime.hooks.setLastTime(60000);
  hitRuntime.hooks.update(.04);
  hitRuntime.hooks.resumeGame();
  hitRuntime.hooks.update(0);
  assert.equal(hitState.hitStop, hit, `${type}: pause must not resolve a bird hit`);
  assert.equal(hit.elapsed, 280);
  advanceUpdates(hitRuntime, .48);
  assert.equal(hitState.hitStop, null);
  if (type === 'loss') assert.equal(hitState.endReason, 'bird');
  else assert.equal(hitRuntime.hooks.profile.stats.birdsBlocked, 1);
  if (type === 'shield') {
    assert.equal(hitRuntime.hooks.profile.shield, 0);
    const flash = hitState.upgradeEffect;
    hitRuntime.hooks.pauseGame();
    hitRuntime.hooks.setLastTime(120000);
    hitRuntime.hooks.draw(); hitRuntime.hooks.draw();
    assert.equal(hitState.upgradeEffect, flash, 'rendering cannot expire a paused upgrade flash');
    assert.equal(flash.elapsed, 0);
    hitRuntime.hooks.resumeGame();
    // Keep the character in place while the flash runs to its active duration.
    for (let frame = 0; frame < 24; frame++) {
      Object.assign(hitState.player, { y: 300, vy: 0 });
      hitRuntime.hooks.update(.04);
    }
    assert.equal(hitState.upgradeEffect, null);
  }
}

// Ending scenes advance flashes without resuming the player's physics.
state = cleanState(runtime);
state.upgradeEffect = { type: 'falcon', elapsed: 0, duration: config.falconFlashDurationMs };
runtime.hooks.finish(false, 'fall');
const endingY = state.player.y;
advanceUpdates(runtime, config.falconFlashDurationMs / 1000 + .04);
assert.equal(state.upgradeEffect, null, 'flashes still expire during the end-of-run animation');
assert.equal(state.player.y, endingY, 'ending frames must not advance gameplay physics');

// Exercise delayed shield resolution and its persisted counters.
state = cleanState(runtime); runtime.hooks.profile.shield = 1;
Object.assign(state.player, { x: 200, y: 300, vx: 0, vy: 0 });
state.enemies = [{ x: 200, y: 300, vx: 0, hit: false }];
runtime.hooks.setLastTime(1000); runtime.hooks.update(0);
assert.equal(state.hitStop.type, 'shield');
advanceUpdates(runtime, .76);
assert.equal(runtime.hooks.profile.shield, 0);
assert.equal(runtime.hooks.profile.stats.shieldsUsed, 1);
assert.equal(runtime.hooks.profile.stats.birdsBlocked, 1);

// A second bird inside the Dhal Shield grace window is brushed aside: no
// hit-stop, no Nishan message, and no extra block credited.
assert.equal(state.invincibleSource, 'shield');
state.enemies = [{ x: 200, y: 300, vx: 0, hit: false }];
runtime.hooks.setLastTime(1900); runtime.hooks.update(0);
assert.equal(state.hitStop, null, 'grace-period hits must not freeze the game');
assert.equal(state.enemies.length, 0, 'the brushed bird is removed');
assert.equal(runtime.hooks.profile.stats.birdsBlocked, 1, 'grace-period hits are not counted as blocks');
assert.match(state.message, /Dhal Shield/);

// Nishan protection still resolves through the celebratory hit-stop.
state = cleanState(runtime);
Object.assign(state.player, { x: 200, y: 300, vx: 0, vy: 0 });
state.powerups = [{ x: 200, y: 300, type: 'nishan', taken: false }];
runtime.hooks.update(0);
assert.equal(state.invincibleSource, 'nishan');
state.enemies = [{ x: 200, y: 300, vx: 0, hit: false }];
runtime.hooks.setLastTime(3000); runtime.hooks.update(0);
assert.equal(state.hitStop?.type, 'nishan');

// Exercise Falcon Save consumption, carry completion, and one-use guard.
state = cleanState(runtime); runtime.hooks.profile.falcon = 1;
Object.assign(state.player, { x: 220, y: 760, vx: 0, vy: 500 });
runtime.hooks.setLastTime(2000); runtime.hooks.update(0);
assert.ok(state.falconRescue);
assert.equal(runtime.hooks.profile.falcon, 0);
assert.equal(runtime.hooks.profile.stats.falconSaves, 1);
assert.equal(state.falconUsed, true);
advanceUpdates(runtime, .68);
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

// The start platform must sit under the player on every canvas width. Native
// tablets widen the canvas to 640, which previously left the fixed x=170 row
// out of reach of a player spawned at W / 2.
for (const tablet of [false, true]) {
  const sized = makeRuntime({ value: JSON.stringify({ tutorialComplete: true }) }, tablet ? { innerWidth: 800, innerHeight: 1100, native: true } : {});
  const canvasWidth = sized.elements.get('#game').width, start = sized.hooks.state, player = start.player, first = start.platforms[0];
  assert.equal(canvasWidth, tablet ? 640 : 450);
  assert.equal(first.x + first.w / 2, canvasWidth / 2, 'start platform is centred on the canvas');
  assert.ok(player.x + player.w / 2 > first.x && player.x - player.w / 2 < first.x + first.w, `player spawns above the start platform (${tablet ? 'native tablet' : 'phone'})`);
}

console.log(`Gameplay runtime checks passed. Generated Challenge last-bowl arrival score peaked at ${highestArrivalScore}; cutoff is ${config.arcadeTargetScore - config.finishBannerLeadScore}.`);
