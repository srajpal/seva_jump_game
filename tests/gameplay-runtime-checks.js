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

function advanceUpdates(runtime, seconds, step = .04) {
  for (let remaining = seconds; remaining > 1e-9; remaining -= step) runtime.hooks.update(Math.min(step, remaining));
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

// Stall rescue: bouncing on a platform whose next intact row is two gaps
// above (a broken row in between) converts it into a spring after the stall
// threshold, and the spring then carries the player up to the row above.
function strandedScenario(mode = 'endless', upper = { x: 150, y: 300, w: 150 }) {
  const stalled = cleanState(rescueRuntime, mode);
  const standingPlatform = { x: 150, y: 500, w: 150, type: 'normal', speed: 0, dir: 1, broken: false };
  stalled.platforms = [standingPlatform, { type: 'normal', speed: 0, dir: 1, broken: false, ...upper }];
  Object.assign(stalled.player, { x: 225, y: 470, vy: 100, vx: 0 });
  return { stalled, standingPlatform };
}
const rescueRuntime = makeRuntime({ value: JSON.stringify({ tutorialComplete: true, music: false, sound: false, reducedMotion: true }) });
const springSounds = [];
rescueRuntime.hooks.observeSounds(type => springSounds.push(type));
{
  const { stalled, standingPlatform } = strandedScenario();
  assert.equal(stalled.lastLanding.y, 700, 'lastLanding starts as the run start platform');
  advanceUpdates(rescueRuntime, .04);
  assert.equal(stalled.lastLanding, standingPlatform, 'landing records the platform bounced from');
  advanceUpdates(rescueRuntime, 2.5);
  assert.equal(standingPlatform.type, 'normal', 'no rescue before the stall threshold');
  const heightBefore = stalled.heightScore;
  springSounds.length = 0;
  advanceUpdates(rescueRuntime, 1.5);
  assert.equal(standingPlatform.type, 'spring', 'a stranded platform becomes a spring after the stall threshold');
  assert.equal(stalled.message, 'Spring assist!');
  assert.ok(stalled.messageTimer > 0 && stalled.messageTimer <= 1.5);
  assert.equal(springSounds.includes('spring'), true, 'the conversion plays the spring sound');
  assert.equal(stalled.stallTimer < config.stallRescueSeconds, true, 'the stall timer restarts after a rescue');
  assert.equal(stalled.heightScore, heightBefore, 'the conversion itself does not award height');
  advanceUpdates(rescueRuntime, 1.2);
  assert.ok(stalled.heightScore > heightBefore, 'the spring carries the player up to the row two gaps above');
  assert.equal(stalled.lastLanding, stalled.platforms[1], 'the player lands on the upper row');
  assert.equal(standingPlatform.type, 'spring', 'a converted platform stays a spring');
}

// A reachable row (vertically within one jump, even if the player keeps
// missing it sideways) never triggers the rescue.
{
  const { stalled, standingPlatform } = strandedScenario('endless', { x: 20, y: 410, w: 90 });
  advanceUpdates(rescueRuntime, 5);
  assert.equal(standingPlatform.type, 'normal', 'a row within the jump apex is not a stall rescue case');
  assert.ok(stalled.stallTimer >= config.stallRescueSeconds, 'the timer alone is not enough to convert');
  assert.equal(stalled.platforms.every(platform => platform.type === 'normal'), true);
}

// A stranded moving platform stops so the spring stays under the player.
{
  const { stalled, standingPlatform } = strandedScenario();
  Object.assign(standingPlatform, { x: 60, w: 330, type: 'moving', speed: 30 });
  advanceUpdates(rescueRuntime, 3.6);
  assert.equal(standingPlatform.type, 'spring');
  assert.equal(standingPlatform.speed, 0, 'the converted platform no longer moves');
  const x = standingPlatform.x; advanceUpdates(rescueRuntime, .4);
  assert.equal(standingPlatform.x, x);
  assert.ok(stalled.stallTimer < config.stallRescueSeconds);
}

// The rescue waits out a bird hit-stop and a Falcon carry, and the stall timer
// does not accumulate during either.
{
  const { stalled, standingPlatform } = strandedScenario();
  rescueRuntime.hooks.profile.shield = 1;
  advanceUpdates(rescueRuntime, 2.9);
  stalled.stallTimer = 10;
  rescueRuntime.hooks.triggerBirdHit({ x: stalled.player.x, y: stalled.player.y, hit: false });
  assert.ok(stalled.hitStop);
  advanceUpdates(rescueRuntime, .6);
  assert.ok(stalled.hitStop, 'the hit-stop is still running');
  assert.equal(standingPlatform.type, 'normal', 'no rescue during a bird hit-stop');
  assert.equal(stalled.stallTimer, 10, 'hit-stop frames do not count as stalled time');
  advanceUpdates(rescueRuntime, .4);
  assert.equal(stalled.hitStop, null);
  assert.equal(standingPlatform.type, 'spring', 'the rescue resumes once play does');
  rescueRuntime.hooks.profile.shield = 0; stalled.invincibleTimer = 0; stalled.invincibleSource = null;
}
{
  const { stalled, standingPlatform } = strandedScenario();
  rescueRuntime.hooks.profile.falcon = 1;
  advanceUpdates(rescueRuntime, .04);
  stalled.stallTimer = 10;
  rescueRuntime.hooks.triggerFalconSave();
  assert.ok(stalled.falconRescue);
  advanceUpdates(rescueRuntime, .4);
  assert.ok(stalled.falconRescue, 'the carry is still in progress');
  assert.equal(standingPlatform.type, 'normal', 'no rescue during a Falcon carry');
  assert.equal(stalled.stallTimer, 10, 'carry frames do not count as stalled time');
  advanceUpdates(rescueRuntime, .4);
  assert.equal(stalled.falconRescue, null);
  assert.equal(stalled.lastLanding.rescuePlatform, true, 'the Falcon platform becomes the standing platform');
  assert.equal(standingPlatform.type, 'normal', 'the abandoned platform is never converted');
  rescueRuntime.hooks.profile.falcon = 0;
}

// When several rows broke in a row the gap is beyond even a spring, so the
// rescue bridges it with helper steps instead of converting the platform.
{
  const { stalled, standingPlatform } = strandedScenario('hard', { x: 150, y: 200, w: 150 });
  const upper = stalled.platforms[1];
  springSounds.length = 0;
  advanceUpdates(rescueRuntime, 3.6);
  assert.equal(standingPlatform.type, 'normal', 'a 300 px gap is not answered with a spring');
  const helpers = stalled.platforms.filter(platform => platform.helper);
  assert.equal(helpers.length, 3, 'three steps bridge a 300 px gap at the 96 px cap');
  assert.deepEqual(helpers.map(step => step.y), [425, 350, 275]);
  assert.equal(stalled.message, 'Helper platforms!');
  assert.equal(springSounds.includes('spring'), false);
  const heightBefore = stalled.heightScore;
  advanceUpdates(rescueRuntime, 4.5);
  assert.ok(stalled.heightScore > heightBefore, 'the steps carry the player upward');
  assert.equal(stalled.lastLanding, upper, 'the player reaches the intact row');
  assert.equal(stalled.platforms.filter(platform => platform.helper).length, 3, 'no extra steps are added once the route is climbable');
}

// A platform that already is a spring only gets steps when the next row is
// beyond the spring apex; within it, the spring is enough and nothing fires.
{
  const { stalled, standingPlatform } = strandedScenario('endless', { x: 20, y: 308, w: 90 });
  standingPlatform.type = 'spring';
  advanceUpdates(rescueRuntime, 5);
  assert.equal(stalled.platforms.length, 2, 'a spring within reach of the next row needs no help');
  assert.notEqual(stalled.message, 'Spring assist!');
}
{
  const { stalled, standingPlatform } = strandedScenario('endless', { x: 150, y: 212, w: 150 });
  standingPlatform.type = 'spring';
  advanceUpdates(rescueRuntime, 3.6);
  assert.deepEqual(stalled.platforms.filter(platform => platform.helper).map(step => step.y), [404, 308], 'a spring facing a 288 px gap gets two steps');
  advanceUpdates(rescueRuntime, 2.5);
  assert.equal(stalled.lastLanding, stalled.platforms[1], 'the spring plus steps reach the intact row');
  assert.equal(standingPlatform.type, 'spring');
}

// The spec's timing at 60 fps: 3.5 s after landing the platform is a spring
// with its message, and about a second later the player has gained height.
{
  const { stalled, standingPlatform } = strandedScenario();
  advanceUpdates(rescueRuntime, 3.5, 1 / 60);
  assert.equal(standingPlatform.type, 'spring', 'the conversion happens within 3.5 s at 60 fps');
  assert.equal(stalled.message, 'Spring assist!');
  const heightBefore = stalled.heightScore;
  advanceUpdates(rescueRuntime, 1, 1 / 60);
  assert.ok(stalled.heightScore > heightBefore, 'the player reaches the upper row about a second later');
}

// Regression: the stranded check must use the integrator's reach, not the
// analytic apex. Power Jump 5's apex (192.2 px) covers the widest double gap on
// paper, but semi-implicit Euler falls about 6 px short at 60 fps and 15 px at
// the 40 ms clamp; gaps in that band left the player bouncing forever with no
// rescue. Aligned under the row, so horizontal reach is not a factor.
for (const [level, gap, step] of [[5, 190, 1 / 60], [5, 192, 1 / 60], [5, 180, .04], [3, 164, 1 / 60], [4, 176, 1 / 60], [3, 158, .04]]) {
  const { stalled, standingPlatform } = strandedScenario('endless', { x: 150, y: 500 - gap, w: 150 });
  rescueRuntime.hooks.profile.powerJump = level;
  const upper = stalled.platforms[1];
  assert.equal(rules.isStranded(stalled.platforms, standingPlatform, { powerJump: level, halfWidth: stalled.player.w / 2, reach: rules.jumpApex(level) }), false, `the analytic apex claims a ${gap} px gap is reachable at Power Jump ${level}`);
  advanceUpdates(rescueRuntime, 1, step);
  const heightBefore = stalled.heightScore;
  advanceUpdates(rescueRuntime, 2, step);
  assert.equal(stalled.lastLanding, standingPlatform, `the player never lands on the ${gap} px row at Power Jump ${level}`);
  assert.equal(stalled.heightScore, heightBefore, 'no height is gained while stranded');
  advanceUpdates(rescueRuntime, 2, step);
  assert.equal(standingPlatform.type, 'spring', `a ${gap} px gap at Power Jump ${level} (step ${step.toFixed(4)}) is rescued`);
  advanceUpdates(rescueRuntime, 2, step);
  assert.equal(stalled.lastLanding, upper, 'the spring then reaches the row');
  rescueRuntime.hooks.profile.powerJump = 0;
}
// The same band exists for a spring: gaps between the spring's integrated
// reach and its analytic apex (three or four broken rows) need helper steps.
for (const [level, gap] of [[1, 244], [0, 222], [5, 334]]) {
  const { stalled, standingPlatform } = strandedScenario('endless', { x: 150, y: 500 - gap, w: 150 });
  standingPlatform.type = 'spring'; rescueRuntime.hooks.profile.powerJump = level;
  const upper = stalled.platforms[1];
  advanceUpdates(rescueRuntime, 3, 1 / 60);
  assert.equal(stalled.lastLanding, standingPlatform, `a spring never reaches a ${gap} px row at Power Jump ${level}`);
  advanceUpdates(rescueRuntime, 2, 1 / 60);
  assert.ok(stalled.platforms.some(platform => platform.helper), `a spring facing a ${gap} px gap at Power Jump ${level} gets helper steps`);
  advanceUpdates(rescueRuntime, 4, 1 / 60);
  assert.equal(stalled.lastLanding, upper, 'the steps then reach the row');
  rescueRuntime.hooks.profile.powerJump = 0;
}
// A gap the integrator genuinely reaches at Power Jump 5 is never rescued.
{
  const { stalled, standingPlatform } = strandedScenario('endless', { x: 150, y: 500 - 176, w: 150 });
  rescueRuntime.hooks.profile.powerJump = 5;
  advanceUpdates(rescueRuntime, 5, .04);
  assert.equal(standingPlatform.type, 'normal', 'a 176 px gap is within Power Jump 5 reach even at the frame clamp');
  assert.equal(stalled.lastLanding, stalled.platforms[1]);
  rescueRuntime.hooks.profile.powerJump = 0;
}

// A stranded platform that has already been culled, or that broke under the
// player, is never converted.
{
  const { stalled, standingPlatform } = strandedScenario();
  advanceUpdates(rescueRuntime, .04);
  stalled.platforms = stalled.platforms.filter(platform => platform !== standingPlatform);
  Object.assign(stalled.player, { y: 600, vy: 0 });
  stalled.stallTimer = 10;
  rescueRuntime.hooks.update(.04);
  assert.equal(standingPlatform.type, 'normal', 'a culled platform is left alone');
}

// The next row can be within jumping height yet too far sideways for a touch
// player at the pointer speed cap: the lone survivor of a row whose partner
// broke, or a finish-runway step. The spring's longer flight covers it.
const steer = x => rescueRuntime.elements.get('#game').listeners.pointerdown({ clientX: 96 + x * 1.28, pointerId: 1 });
const releaseSteering = () => rescueRuntime.elements.get('#game').listeners.pointercancel();
// A player steers for the far row from the moment they leave the platform;
// steering mid-descent would only carry them off the ledge.
function awaitLaunch(velocity) {
  for (let frames = 0; rescueRuntime.hooks.state.player.vy > -velocity * .99 && frames < 120; frames++) rescueRuntime.hooks.update(1 / 60);
  assert.ok(rescueRuntime.hooks.state.player.vy <= -velocity * .99, 'the player launched at the expected velocity');
}
function sidewaysScenario(upper) {
  const { stalled, standingPlatform } = strandedScenario('arcade', upper);
  Object.assign(standingPlatform, { x: 20, w: 100 });
  Object.assign(stalled.player, { x: 70 });
  releaseSteering();
  return { stalled, standingPlatform, upper: stalled.platforms[1] };
}
{
  const { stalled, standingPlatform, upper } = sidewaysScenario({ x: 300, y: 404, w: 100 });
  advanceUpdates(rescueRuntime, 2.9, 1 / 60);
  assert.equal(standingPlatform.type, 'normal', 'no rescue before the stall threshold');
  assert.equal(stalled.lastLanding, standingPlatform);
  advanceUpdates(rescueRuntime, .7, 1 / 60);
  assert.equal(standingPlatform.type, 'spring', 'a row 96 px up but 280 px across is a stall rescue case for touch play');
  assert.equal(stalled.message, 'Spring assist!');
  awaitLaunch(config.springJumpVelocity);
  steer(350);
  advanceUpdates(rescueRuntime, 1.5, 1 / 60);
  assert.equal(stalled.lastLanding, upper, 'the spring flight reaches the far row at the pointer speed cap');
  releaseSteering();
}
// Within touch reach nothing fires, however long the player idles.
{
  const { stalled, standingPlatform } = sidewaysScenario({ x: 220, y: 404, w: 100 });
  advanceUpdates(rescueRuntime, 5, 1 / 60);
  assert.equal(standingPlatform.type, 'normal', 'a row 200 px across is within one touch hop');
  assert.ok(stalled.stallTimer >= config.stallRescueSeconds);
  assert.equal(stalled.platforms.length, 2);
}
// Beyond even a spring's sideways reach, a midway step splits the crossing.
{
  const { stalled, standingPlatform, upper } = sidewaysScenario({ x: 380, y: 404, w: 60 });
  advanceUpdates(rescueRuntime, 3.6, 1 / 60);
  assert.equal(standingPlatform.type, 'normal', 'a 340 px crossing is not answered with a spring');
  const helpers = stalled.platforms.filter(platform => platform.helper);
  assert.equal(helpers.length, 1, 'one helper step bridges the crossing');
  assert.equal(helpers[0].y, 452);
  assert.equal(helpers[0].x + helpers[0].w / 2, 240, 'the step sits midway between the platforms');
  assert.equal(stalled.message, 'Helper platforms!');
  awaitLaunch(config.baseJumpVelocity);
  steer(240);
  advanceUpdates(rescueRuntime, 1.5, 1 / 60);
  assert.equal(stalled.lastLanding, helpers[0], 'the player reaches the helper step');
  awaitLaunch(config.baseJumpVelocity);
  steer(410);
  advanceUpdates(rescueRuntime, 1.5, 1 / 60);
  assert.equal(stalled.lastLanding, upper, 'and then the far row');
  releaseSteering();
}
// A converted spring that still cannot make the crossing gets steps too.
{
  const { stalled, standingPlatform } = sidewaysScenario({ x: 380, y: 404, w: 60 });
  standingPlatform.type = 'spring';
  advanceUpdates(rescueRuntime, 3.6, 1 / 60);
  assert.equal(stalled.platforms.filter(platform => platform.helper).length, 1, 'a spring facing a 340 px crossing gets a helper step');
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
