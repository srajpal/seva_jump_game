const assert = require('node:assert/strict');
const config = require('../game-config.js');
const { sizes, makeGenerator, addRow, checkOpening, collectRow } = require('./generator-helpers.js');

const RUNS = 300;
const cutoff = config.arcadeTargetScore - config.finishBannerLeadScore;
for (const size of sizes) {
  const runtime = makeGenerator(size, 0xf011 + size.width);
  for (let run = 0; run < RUNS; run++) {
    for (const mode of ['endless', 'arcade', 'challenge']) {
      runtime.hooks.reset(mode);
      checkOpening(runtime);
      const state = runtime.hooks.state;
      // Visit the real opening rows before extending the course. These include
      // Challenge bowls placed by reset, so they must not be discarded.
      for (const platform of state.platforms.filter(item => !item.companion).slice(1)) {
        collectRow(state, platform, state.collectibles.filter(item => item.x === platform.x + platform.w / 2 && item.y < platform.y && item.y >= platform.y - 37));
      }
      let rows = 0;
      while (mode === 'endless' ? rows < 350 : state.score < cutoff) {
        assert.ok(rows++ < 400, `${mode} must reach its finish section`);
        const generated = addRow(runtime);
        collectRow(state, generated.platform, generated.items);
      }
      if (mode === 'challenge') {
        assert.equal(state.challengePlaced, config.challengeParshadTarget);
        assert.equal(state.collectibles.filter(item => item.challengeBowl).length, config.challengeParshadTarget, 'actual course contains exactly 50 bowls');
        assert.equal(state.parshad, config.challengeParshadTarget, 'all generated bowls arrive before the finish cutoff');
      }

      // Exercise the real finish transition with a skilled player positioned
      // on the generated route, plus the next four generated runway rows.
      const launch = state.lastPlatform;
      Object.assign(state.player, { x: launch.x + launch.w / 2, y: launch.y - state.player.h / 2, vx: 0, vy: 0 });
      state.cameraY = state.player.y - 300;
      for (let step = 0; step < config.finishRunwaySteps; step++) addRow(runtime);
      state.collectibles = []; state.powerups = []; state.enemies = [];
      runtime.hooks.update(0);
      if (mode === 'endless') {
        assert.ok(state.score > config.arcadeTargetScore);
        assert.equal(state.finishGate, null, 'Endless never generates a finish banner');
        assert.equal(state.ending, false, 'Endless never ends by score');
        continue;
      }
      assert.ok(state.finishGate, `${mode} creates its actual finish banner`);
      const runway = state.platforms.filter(platform => platform.finishRunway).sort((a, b) => b.y - a.y);
      assert.equal(runway.length, config.finishRunwaySteps);
      assert.equal(runway.at(-1).type, 'normal', 'final launch platform is solid');
      assert.ok(runway.every(platform => platform.speed === 0));
      assert.ok(state.platforms.every(platform => platform.y > state.finishGate.y), 'no platforms above the banner');
      const bannerGap = runway.at(-1).y - state.finishGate.y;
      assert.ok(bannerGap > 0 && bannerGap < config.baseJumpVelocity ** 2 / (2 * config.gravity), 'actual banner is reachable');
      state.player.y = state.finishGate.y;
      runtime.hooks.update(0);
      assert.equal(state.completed, true);
      assert.equal(state.endReason, 'finish');
      assert.equal(state.finishGate.broken, true);
      assert.ok(state.score >= config.arcadeTargetScore);
    }
  }
  // A generated Challenge course still loses if one of its bowls was missed.
  runtime.hooks.reset('challenge');
  const state = runtime.hooks.state;
  while (state.challengePlaced < config.challengeParshadTarget) {
    const generated = addRow(runtime);
    collectRow(state, generated.platform, generated.items);
  }
  state.parshad = config.challengeParshadTarget - 1;
  state.score = cutoff;
  runtime.hooks.update(0);
  assert.equal(state.completed, false);
  assert.equal(state.endReason, 'challenge-incomplete');
  assert.equal(state.finishGate, null);
  console.log(`Verified ${RUNS} full generated runs per mode at width ${size.width}: Endless continuation, Arcade/Challenge runways and wins, all 50 bowls, and a missed-bowl loss.`);
}
