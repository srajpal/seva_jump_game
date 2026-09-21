// Plays the real game.js through the runtime harness with a simple autopilot
// to measure pacing and difficulty: run length, endings, death causes, token
// income, power-ups, soft-locks and experiment rescues. Pointer steering at the
// mobile speed cap with crude bird avoidance. The bot is a relative instrument:
// compare flag-off against flag-on with the same seed, never read its numbers
// as human skill. Dev tool only: scripts/ is not in scripts/web-files.mjs.
//
// Usage: node scripts/autopilot.js [runsPerMode] [capSeconds] [flag,flag]
//        [--modes=endless,arcade] [--seed=N] [--json=out.json] [--quiet]
//        [--motion] [--startScore=N]
// The third argument sets config.experiments.<flag> = true before the runtime
// is created so flagged behaviour can be compared per run. --motion plays with
// Reduced Motion off (the default profile keeps it on to skip particles).
// --startScore=N lifts the whole opening world by N * 18 px so the run begins
// at height score N and the generator sees late-game scores from the first row.
const fs = require('node:fs');
const path = require('node:path');
const { makeRuntime } = require(path.resolve(__dirname, '../tests/runtime-browser-checks.js'));
const config = require(path.resolve(__dirname, '../game-config.js'));

const positional = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
const option = name => { const found = process.argv.find(arg => arg.startsWith('--' + name + '=')); return found ? found.slice(name.length + 3) : undefined; };
const RUNS = Number(positional[0] || 40), CAP = Number(positional[1] || 240), DT = 1 / 60;
const MODES = (option('modes') || 'endless,arcade,challenge,hard').split(',').filter(Boolean);
const SEED = Number(option('seed') || 0xa11ce);
const QUIET = process.argv.includes('--quiet');
const MOTION = process.argv.includes('--motion');
const START_SCORE = Number(option('startScore') || 0);
config.experiments = config.experiments || {};
for (const flag of (positional[2] || '').split(',').filter(Boolean)) config.experiments[flag] = true;

let seed = SEED >>> 0;
const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; };
const runtime = makeRuntime({ value: JSON.stringify({ tutorialComplete: true, music: false, sound: false, reducedMotion: !MOTION }) }, { random });
const { hooks } = runtime, canvas = runtime.elements.get('#game');
const scale = 1.28, contentLeft = 96; // matches the harness' 768x1024 canvas rect
const W = canvas.width, g = config.gravity, HALF_W = 15.5, FEET = 24, POINTER_SPEED = config.pointerMaxHorizontalSpeed;

function steerTo(x) { canvas.listeners.pointerdown({ clientX: contentLeft + Math.max(0, Math.min(W, x)) * scale, pointerId: 1 }); }

function chooseTarget(state, stalled) {
  const p = state.player; let best = null;
  for (const plat of state.platforms) {
    if (plat.broken) continue;
    const d = plat.y - FEET - p.y;               // vertical distance from player centre to landing height
    const disc = p.vy * p.vy + 2 * g * d;
    if (disc < 0) continue;                      // above the apex: unreachable this bounce
    const t = (-p.vy + Math.sqrt(disc)) / g;      // time until feet reach plat.y on the way down
    if (!(t > 0)) continue;
    const center = plat.x + plat.w / 2 + (plat.type === 'moving' ? plat.dir * plat.speed * t : 0);
    const need = Math.max(0, Math.abs(center - p.x) - plat.w / 2 - HALF_W);
    // Normal play keeps a steering-lag margin; when height has not increased
    // for a while, commit to the highest platform the raw speed cap allows.
    const reachable = need <= POINTER_SPEED * t * (stalled ? 1 : .85);
    const score = (reachable ? 0 : 10000) + plat.y;    // prefer reachable, then highest (smallest y)
    if (!best || score < best.score) best = { plat, center, score, t };
  }
  return best;
}

function birdThreat(state) {
  const p = state.player;
  for (const b of state.enemies) {
    if (b.hit) continue;
    const dx = b.x - p.x, dy = b.y - p.y;
    if (Math.abs(dy) < 70 && Math.abs(dx) < 110 && Math.sign(b.vx) !== Math.sign(dx)) return b; // closing in
  }
  return null;
}

function liftWorld(state, pixels) {
  // Move the opening world up so the run starts at a late-game height score.
  // Only differences in y matter to the game, apart from the height formula.
  state.player.y -= pixels; state.cameraY -= pixels; state.nextY -= pixels;
  for (const list of [state.platforms, state.collectibles, state.enemies, state.powerups]) for (const item of list) item.y -= pixels;
}

function playRun(mode) {
  hooks.reset(mode); const state = hooks.state, profile = hooks.profile;
  if (START_SCORE > 0) liftWorld(state, START_SCORE * 18);
  const before = { jumps: profile.stats.jumps, powerups: profile.stats.powerups };
  const seenPowerups = new WeakSet(), seenBirds = new WeakSet(), platformTypes = new WeakMap();
  let powerupsGenerated = 0, birdsGenerated = 0, nishanTaken = 0, lastNishanAt = -Infinity, postNishanFall = 0, lastInvincible = 0;
  let t = 0, ms = 1000, maxHeight = 0, lastGain = 0, longestStall = 0, softLock, rescues = 0, rescueWithoutStall = 0;
  // A taken power-up is culled in the same update, so detect a Nishan pickup
  // by its protection timer jumping up rather than by the object.
  const notePickups = () => { if (state.invincibleSource === 'nishan' && state.invincibleTimer > lastInvincible) { nishanTaken++; lastNishanAt = t; } lastInvincible = state.invincibleTimer; };
  // A rescue is a platform flipping to 'spring' after the run created it, or a
  // helper step appearing; state.message lingers after its timer, so it is not
  // a reliable event source.
  const noteRescues = () => {
    let rescued = false;
    for (const plat of state.platforms) {
      const previous = platformTypes.get(plat);
      if ((previous !== undefined && previous !== 'spring' && plat.type === 'spring') || (previous === undefined && plat.helper)) rescued = true;
      platformTypes.set(plat, plat.type);
    }
    return rescued;
  };
  while (!state.ending && t < CAP) {
    const p = state.player;
    for (const power of state.powerups) if (!seenPowerups.has(power)) { seenPowerups.add(power); powerupsGenerated++; }
    for (const b of state.enemies) if (!seenBirds.has(b)) { seenBirds.add(b); birdsGenerated++; }
    const stalled = t - lastGain > 3;
    const threat = birdThreat(state);
    if (threat) steerTo(threat.x > p.x ? Math.max(HALF_W, p.x - 140) : Math.min(W - HALF_W, p.x + 140));
    else { const target = chooseTarget(state, stalled); if (target) steerTo(target.center); }
    ms += DT * 1000; hooks.setLastTime(ms); hooks.update(DT); t += DT;
    notePickups();
    // The game fires its rescue on the frame active stall time reaches the
    // threshold, so judge the stall after this frame, not before it.
    if (noteRescues()) { rescues++; if (!(t - lastGain >= 3 - 1e-6)) rescueWithoutStall++; }
    if (state.heightScore > maxHeight) { maxHeight = state.heightScore; lastGain = t; }
    longestStall = Math.max(longestStall, t - lastGain);
    // Classify the first long stall: is the nearest intact platform above the
    // one we keep bouncing on farther away than a normal jump can reach?
    if (t - lastGain > 20 && softLock === undefined) {
      const standing = state.platforms.filter(pl => !pl.broken && pl.y >= p.y).sort((a, b) => a.y - b.y)[0];
      const above = state.platforms.filter(pl => !pl.broken && standing && pl.y < standing.y).sort((a, b) => b.y - a.y)[0];
      const apex = config.baseJumpVelocity ** 2 / (2 * g);
      softLock = Boolean(standing && above && standing.y - above.y > apex);
    }
  }
  if (state.ending && state.endReason === 'fall' && t - lastNishanAt <= 2) postNishanFall = 1;
  return { mode, score: Math.floor(state.score), seconds: t, ended: state.ending ? state.endReason : 'cap', completed: Boolean(state.completed),
    parshad: state.parshad, tokens: state.tokens, jumps: profile.stats.jumps - before.jumps, birdsGenerated, maxHeight,
    powerupsGenerated, powerupsTaken: profile.stats.powerups - before.powerups, nishanTaken, postNishanFall, longestStall, softLock: softLock === true, rescues, rescueWithoutStall };
}

const mean = a => a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0;
const median = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const fmt = n => Number.isInteger(n) ? String(n) : n.toFixed(1);
const flagsOn = Object.keys(config.experiments).filter(k => config.experiments[k]);
const summary = { runs: RUNS, cap: CAP, seed: SEED, experiments: flagsOn, modes: {} };
if (!QUIET) console.log('experiments on: ' + (flagsOn.join(', ') || 'none') + '   seed ' + SEED);
for (const mode of MODES) {
  // Each mode restarts the seed stream so a subset run (--modes=arcade)
  // replays exactly the runs the full run would have played for that mode.
  seed = (SEED + ['endless', 'arcade', 'challenge', 'hard'].indexOf(mode) * 0x9e3779b9) >>> 0;
  const results = []; for (let i = 0; i < RUNS; i++) results.push(playRun(mode));
  const ends = {}; for (const r of results) ends[r.ended] = (ends[r.ended] || 0) + 1;
  const wins = results.filter(r => r.completed);
  const birds = results.reduce((s, r) => s + r.birdsGenerated, 0), birdDeaths = ends.bird || 0, fallDeaths = ends.fall || 0;
  const minutes = results.reduce((s, r) => s + r.seconds, 0) / 60;
  const stats = {
    scoreMean: mean(results.map(r => r.score)), scoreMedian: median(results.map(r => r.score)), scoreMax: Math.max(...results.map(r => r.score)),
    lengthMean: mean(results.map(r => r.seconds)), endings: ends, completed: wins.length, finishTimeMean: mean(wins.map(r => r.seconds)),
    tokens: mean(results.map(r => r.tokens)), parshad: mean(results.map(r => r.parshad)), jumps: mean(results.map(r => r.jumps)),
    birdsPerRun: birds / RUNS, birdDeaths, birdDeathsPer100Birds: 100 * birdDeaths / Math.max(1, birds),
    fallDeaths, fallDeathsPerMinute: fallDeaths / Math.max(1e-9, minutes), capSurvivals: ends.cap || 0,
    powerupsGenerated: mean(results.map(r => r.powerupsGenerated)), powerupsTaken: mean(results.map(r => r.powerupsTaken)),
    nishanTaken: results.reduce((s, r) => s + r.nishanTaken, 0), postNishanFalls: results.reduce((s, r) => s + r.postNishanFall, 0),
    stalledOver20: results.filter(r => r.longestStall > 20).length, softLocked: results.filter(r => r.softLock).length,
    rescues: results.reduce((s, r) => s + r.rescues, 0), rescueRuns: results.filter(r => r.rescues).length, rescuesWithoutStall: results.reduce((s, r) => s + r.rescueWithoutStall, 0),
  };
  summary.modes[mode] = { ...stats, results };
  if (QUIET) continue;
  console.log('\n== ' + mode.toUpperCase() + ' (' + RUNS + ' runs, cap ' + CAP + 's) ==');
  console.log('score  mean ' + fmt(stats.scoreMean) + '  median ' + stats.scoreMedian + '  max ' + stats.scoreMax);
  console.log('length mean ' + fmt(stats.lengthMean) + 's  ends: ' + Object.entries(ends).map(([k, v]) => k + '=' + v).join(', ') + '  fall deaths/min ' + stats.fallDeathsPerMinute.toFixed(3));
  if (mode === 'arcade' || mode === 'challenge') console.log('completed ' + wins.length + '/' + RUNS + (wins.length ? '  mean time to finish ' + fmt(stats.finishTimeMean) + 's' : '') + (mode === 'challenge' ? '  parshad mean ' + fmt(stats.parshad) + '/50' : ''));
  console.log('per run: tokens ' + fmt(stats.tokens) + '  parshad ' + fmt(stats.parshad) + '  jumps ' + fmt(stats.jumps) + '  birds generated ' + fmt(stats.birdsPerRun) + '  bird deaths ' + birdDeaths + ' (' + stats.birdDeathsPer100Birds.toFixed(1) + ' per 100 birds)  -> tokens/min ' + fmt(mean(results.map(r => r.tokens / (r.seconds / 60)))));
  console.log('power-ups: generated ' + fmt(stats.powerupsGenerated) + '/run, taken ' + fmt(stats.powerupsTaken) + '/run (nishan ' + stats.nishanTaken + ', falls within 2s of nishan ' + stats.postNishanFalls + ')   stalls >20s: ' + stats.stalledOver20 + ' (soft-locked: ' + stats.softLocked + ')   rescues: ' + stats.rescues + ' in ' + stats.rescueRuns + ' runs (' + stats.rescuesWithoutStall + ' without a 3s stall)');
}
const jsonPath = option('json');
if (jsonPath) fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 1));
