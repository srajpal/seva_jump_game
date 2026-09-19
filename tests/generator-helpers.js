const assert = require('node:assert/strict');
const config = require('../game-config.js');
const { makeRuntime } = require('./runtime-browser-checks.js');

const sizes = [
  { width: 450, innerWidth: 450, innerHeight: 800, native: false },
  { width: 640, innerWidth: 800, innerHeight: 1100, native: true },
];

function makeGenerator(size, seed) {
  // Each VM owns its RNG; a failing seed is repeatable without changing the
  // host's Math.random or sharing random state with another runtime.
  let value = seed >>> 0;
  const random = () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 2 ** 32;
  };
  const runtime = makeRuntime({ value: JSON.stringify({ tutorialComplete: true, music: false, sound: false, reducedMotion: true }) }, { ...size, random });
  assert.equal(runtime.elements.get('#game').width, size.width);
  return runtime;
}

function checkRow(runtime, previous, row, birds) {
  const state = runtime.hooks.state, canvas = runtime.elements.get('#game');
  const platform = row[0], center = platform.x + platform.w / 2;
  const gap = previous.y - platform.y;
  const discriminant = config.baseJumpVelocity ** 2 - 2 * config.gravity * gap;
  assert.ok(gap > 0 && discriminant > 0, `${state.mode}/${canvas.width}: unreachable vertical gap ${gap}`);
  const time = (config.baseJumpVelocity + Math.sqrt(discriminant)) / config.gravity;
  const travel = Math.max(0, Math.abs(center - previous.x - previous.w / 2) + platform.speed * time - platform.w / 2 - state.player.w / 2);
  assert.ok(travel <= config.pointerMaxHorizontalSpeed * time + .01, `${state.mode}/${canvas.width}: unreachable horizontal landing`);
  for (const item of row) {
    assert.ok(Number.isFinite(item.x) && item.x >= 12 - 1e-8 && item.x + item.w <= canvas.width - 12 + 1e-8, 'platform stays inside canvas margins');
    assert.equal(item.y, platform.y);
    if (item !== platform) {
      assert.ok(item.companion);
      assert.notEqual(platform.type, 'moving', 'moving platforms stay alone');
      assert.ok(Math.abs(item.x + item.w / 2 - center) >= (item.w + platform.w) / 2 + 12 - 1e-8, 'companion platforms remain separated');
    }
  }
  for (const bird of birds) {
    assert.ok(Number.isFinite(bird.x) && bird.x >= 25 && bird.x <= canvas.width - 25);
    assert.ok(Math.abs(bird.x - center) >= config.birdPlatformClearance - 1e-8, 'bird spawn clears the primary landing lane');
    const nextRowY = state.platforms.find(item => !item.companion && item.y < platform.y)?.y ?? state.nextY;
    assert.equal(bird.y, (platform.y + nextRowY) / 2, 'birds spawn midway between this row and the next');
    const spacing = state.mode === 'hard' ? canvas.height : state.mode === 'challenge' ? config.challengeBirdScreenSpacing : 0;
    for (const other of state.enemies) {
      if (other !== bird && !other.hit) assert.ok(Math.abs(other.y - bird.y) >= spacing, 'birds remain at least one screen apart');
    }
  }
  return time;
}

function addRow(runtime) {
  const state = runtime.hooks.state, previous = state.lastPlatform;
  const platformCount = state.platforms.length, birdCount = state.enemies.length, itemCount = state.collectibles.length;
  runtime.hooks.addPlatform();
  const row = state.platforms.slice(platformCount), birds = state.enemies.slice(birdCount);
  const time = checkRow(runtime, previous, row, birds);
  return { platform: row[0], row, birds, items: state.collectibles.slice(itemCount), time };
}

function checkOpening(runtime) {
  const state = runtime.hooks.state;
  let previous = state.platforms[0];
  for (const platform of state.platforms.slice(1).filter(item => !item.companion)) {
    const nextRowY = state.platforms.find(item => !item.companion && item.y < platform.y)?.y ?? state.nextY;
    checkRow(runtime, previous, state.platforms.filter(item => item.y === platform.y), state.enemies.filter(bird => bird.y < platform.y && bird.y > nextRowY));
    previous = platform;
  }
}

function collectRow(state, platform, items) {
  // Model a skilled player visiting a generated row and collecting its items.
  // Generation and item placement come exclusively from game.js.
  for (const item of items) {
    if (!item.taken && item.type === 'parshad') state.parshad++;
    item.taken = true;
  }
  state.heightScore = Math.max(0, Math.floor((650 - (platform.y - state.player.h / 2)) / 18));
  state.score = state.heightScore + state.parshad * 3;
}

module.exports = { sizes, makeGenerator, addRow, checkOpening, collectRow };
