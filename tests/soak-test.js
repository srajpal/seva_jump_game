const assert = require('node:assert/strict');
const config = require('../game-config.js');
const rules = require('../game-rules.js');
const { makeRuntime } = require('./runtime-browser-checks.js');
const { sizes, makeGenerator, addRow, checkOpening, collectRow } = require('./generator-helpers.js');

const RUNS = 1000, STEPS = 350;
let landings = 0;
function frequency(name, hits, trials, expected) {
  assert.ok(trials > 10000, name + ': enough eligible rows');
  const observed = hits / trials;
  assert.ok(Math.abs(observed - expected) <= expected * .04, name + ': observed ' + observed.toFixed(5) + ', config ' + expected);
  console.log(name + ': ' + hits + '/' + trials + ' = ' + observed.toFixed(5) + ' (config ' + expected + ')');
}
for (const size of sizes) {
  const runtime = makeGenerator(size, 0x5e7a + size.width);
  for (const mode of ['endless', 'arcade', 'challenge']) {
    const counts = { rows: 0, items: 0, tokens: 0, tokenRows: 0, karaRows: 0, kara: 0, nishanRows: 0, nishan: 0, earlyBoosts: 0, birdRows: 0, birds: 0 };
    for (let run = 0; run < RUNS; run++) {
      runtime.hooks.reset(mode);
      checkOpening(runtime);
      const state = runtime.hooks.state;
      for (let step = 0; step < STEPS; step++) {
        const score = state.score;
        const generated = addRow(runtime);
        if (mode === 'challenge') {
          if (!generated.items.some(item => item.challengeBowl)) counts.tokenRows++;
          counts.tokens += generated.items.filter(item => item.type === 'token').length;
          assert.equal(generated.powerups.length, 0);
        } else {
          counts.rows++;
          counts.items += generated.items.length;
          counts.tokens += generated.items.filter(item => item.type === 'token').length;
          // Endless and Arcade share the boost score bands.
          const kara = generated.powerups.filter(item => item.type === 'kara').length, nishan = generated.powerups.filter(item => item.type === 'nishan').length;
          if (score >= config.tierThresholds[1]) { counts.karaRows++; counts.kara += kara; } else counts.earlyBoosts += kara;
          if (score >= config.tierThresholds[2]) { counts.nishanRows++; counts.nishan += nishan; } else counts.earlyBoosts += nishan;
          if (mode === 'arcade' && score >= config.arcadeBirdStartScore) { counts.birdRows++; counts.birds += generated.birds.length; }
        }
        collectRow(state, generated.platform, generated.items);
        landings++;
      }
      assert.ok(state.score > config.endlessDifficultyScore, 'soak reaches capped late-game difficulty');
    }
    const label = mode + '/' + size.width;
    if (mode === 'challenge') frequency(label + ' token rows', counts.tokens, counts.tokenRows, config.challengeTokenChance);
    else {
      frequency(label + ' collectible rows', counts.items, counts.rows, config.collectibleChance);
      frequency(label + ' token share', counts.tokens, counts.items, config.tokenShare);
      frequency(label + ' Kara', counts.kara, counts.karaRows, config.powerupChances.kara);
      frequency(label + ' Nishan', counts.nishan, counts.nishanRows, config.powerupChances.nishan);
      assert.equal(counts.earlyBoosts, 0, label + ': no boosts before their score bands');
      if (mode === 'arcade') frequency(label + ' bird rows', counts.birds, counts.birdRows, config.arcadeBirdChance);
    }
  }
  console.log(`Soaked ${RUNS} routes per mode on the ${size.width}-wide canvas.`);
}

// Probe the real generator against config-derived boundaries. Config tuning
// changes expectations, while a generator/config mismatch still fails.
let nextRoll;
const runtime = makeRuntime({}, { random: () => { const roll = nextRoll; nextRoll = undefined; return roll ?? .99; } });
const mix = config.arcadePlatformMix;
const contracts = [
  ['arcade', 0, [[mix.spring, 'spring', 'moving'], [mix.moving, 'moving', 'normal']]],
  ...[250, 1000].map(score => ['arcade', score, [[mix.spring, 'spring', 'break'], [mix.spring + rules.arcadeBreakChance(score), 'break', 'moving'], [mix.moving, 'moving', 'normal']]]),
  ['challenge', 1000, [[mix.spring, 'spring', 'break'], [mix.spring + rules.challengeBreakChance(1000), 'break', 'moving'], [mix.moving, 'moving', 'normal']]],
  ...[0, config.endlessDifficultyScore].map(score => {
    const cutoffs = rules.endlessPlatformCutoffs(score);
    return ['endless', score, [[cutoffs.spring, 'spring', 'break'], [cutoffs.break, 'break', 'moving'], [cutoffs.moving, 'moving', 'normal']]];
  }),
];
let probes = 0;
for (const [mode, score, boundaries] of contracts) {
  for (const [threshold, below, above] of boundaries) {
    for (const [roll, expected] of [[threshold - 1e-7, below], [threshold + 1e-7, above]]) {
      runtime.hooks.reset(mode);
      const state = runtime.hooks.state;
      state.score = score;
      state.challengePlatformCount = 0; // Probe an ordinary, non-bowl row.
      nextRoll = roll;
      runtime.hooks.addPlatform();
      assert.equal(state.lastPlatform.type, expected, `${mode} score ${score}, odds roll ${roll}`);
      probes++;
    }
  }
}
console.log(`Verified ${landings.toLocaleString()} generated landings and ${probes} platform-odds boundary probes.`);
