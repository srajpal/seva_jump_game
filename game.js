(() => {
  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const W = canvas.width, H = canvas.height;
  const config = globalThis.SEVA_CONFIG;
  const rules = globalThis.SEVA_RULES;
  const ui = {
    home: document.querySelector('#home-screen'), end: document.querySelector('#end-screen'), upgrades: document.querySelector('#upgrades-screen'), about: document.querySelector('#about-screen'),
    score: document.querySelector('#end-score'), endHeading: document.querySelector('#end-heading'), endless: document.querySelector('#endless-button'), arcade: document.querySelector('#arcade-button'), challenge: document.querySelector('#challenge-button'),
    restart: document.querySelector('#restart-button'), choices: document.querySelectorAll('.choice'),
    openUpgrades: document.querySelector('#open-upgrades-button'), closeUpgrades: document.querySelector('#close-upgrades-button'),
    endHome: document.querySelector('#end-home-button'), endUpgrades: document.querySelector('#end-upgrades-button'),
    wallet: document.querySelector('#wallet-count'), upgradeMessage: document.querySelector('#upgrade-message'),
    falconOwned: document.querySelector('#falcon-owned'), shieldOwned: document.querySelector('#shield-owned'), powerOwned: document.querySelector('#power-owned'),
    buyFalcon: document.querySelector('#buy-falcon'), buyShield: document.querySelector('#buy-shield'), buyPower: document.querySelector('#buy-power'),
    openAbout: document.querySelector('#open-about-button'), closeAbout: document.querySelector('#close-about-button'),
  };
  const palette = ['#bce7ef', '#f8d9a7', '#c9e5c0', '#e5c4d6'];
  const backgroundImage = new Image();
  backgroundImage.src = 'assets/gurdwara-courtyard-pixel-v1.png';
  const playerSprites = { girl: { jump: new Image(), fall: new Image() }, boy: { jump: new Image(), fall: new Image() } };
  playerSprites.girl.jump.src = 'assets/player-girl-pixel-v1.png';
  playerSprites.girl.fall.src = 'assets/player-girl-fall-pixel-v1.png';
  playerSprites.boy.jump.src = 'assets/player-boy-pixel-v1.png';
  playerSprites.boy.fall.src = 'assets/player-boy-fall-pixel-v3.png';
  const platformSprite = new Image();
  platformSprite.src = 'assets/platform-grass-pixel-v1.png';
  const springPlatformSprite = new Image();
  springPlatformSprite.src = 'assets/platform-spring-pixel-v1.png';
  const breakPlatformSprite = new Image();
  breakPlatformSprite.src = 'assets/platform-break-wood-pixel-v1.png';
  const movingPlatformSprite = new Image();
  movingPlatformSprite.src = 'assets/platform-moving-pixel-v1.png';
  const platformSprites = { normal: platformSprite, spring: springPlatformSprite, break: breakPlatformSprite, moving: movingPlatformSprite };
  const parshadSprite = new Image();
  parshadSprite.src = 'assets/parshad-bowl-pixel-v1.png';
  const khandaTokenSprite = new Image();
  khandaTokenSprite.src = 'assets/khanda-token-pixel-v1.png';
  const birdSprite = new Image();
  birdSprite.src = 'assets/bird-pigeon-pixel-v1.png';
  const powerupSprites = { kara: new Image(), nishan: new Image() };
  powerupSprites.kara.src = 'assets/powerup-kara-pixel-v1.png';
  powerupSprites.nishan.src = 'assets/powerup-nishan-pixel-v1.png';
  const catchNetSprite = new Image();
  catchNetSprite.src = 'assets/catch-net-hover-pixel-v1.png';
  const dhalShieldSprite = new Image();
  dhalShieldSprite.src = 'assets/dhal-shield-pixel-v1.png';
  const finishBannerSprite = new Image();
  finishBannerSprite.src = 'assets/finish-banner-hover-pixel-v1.png';
  const defaultProfile = { tokens: 0, falcon: 0, shield: 0, powerJump: 0 };
  function loadProfile() { try { return { ...defaultProfile, ...JSON.parse(localStorage.getItem('seva-jump-profile')) }; } catch { return { ...defaultProfile }; } }
  function saveProfile() { localStorage.setItem('seva-jump-profile', JSON.stringify(profile)); }
  let profile = loadProfile();
  let state, selectedCharacter = 'girl', pointerX = null, keys = new Set(), lastTime = 0;

  function updateUpgradeUI(message = '') {
    ui.wallet.textContent = profile.tokens;
    ui.falconOwned.textContent = `Owned: ${profile.falcon}`;
    ui.shieldOwned.textContent = `Owned: ${profile.shield}`;
    ui.powerOwned.textContent = `Level: ${profile.powerJump} / 5`;
    ui.buyPower.textContent = profile.powerJump >= 5 ? 'Max level' : `Buy · ${15 + profile.powerJump * 10}`;
    ui.buyPower.disabled = profile.powerJump >= 5;
    ui.upgradeMessage.textContent = message;
  }

  function reset(mode = 'endless') {
    state = {
      running: true, mode, score: 0, heightScore: 0, parshad: 0, tokens: 0, cameraY: 0,
      background: Math.floor(Math.random() * palette.length), nextY: 610, ending: false, falconUsed: false, boostMultiplier: 1, boostTimer: 0, invincibleTimer: 0, finishGate: null, challengePlaced: 0, challengePlatformCount: 0,
      player: { x: W / 2, y: 650, vx: 0, vy: -config.baseJumpVelocity * (1 + profile.powerJump * .1), w: 31, h: 48, character: selectedCharacter },
      platforms: [{ x: 170, y: 700, w: 115, type: 'normal' }], lastPlatform: { x: 170, y: 700, w: 115 }, collectibles: [], enemies: [], powerups: [],
      message: mode === 'challenge' ? `Challenge · collect all ${config.challengeParshadTarget} parshad` : mode === 'arcade' ? `Arcade · reach ${config.arcadeTargetScore}` : 'Endless Run · Keep climbing', messageTimer: 3,
    };
    while (state.nextY > -900) addPlatform();
  }
  function addPlatform() {
    const level = levelForScore(state.score);
    const r = Math.random();
    const arcade = rules.isArcadeLike(state.mode);
    let type = 'normal';
    if (r < (arcade ? .09 : .12)) type = 'spring';
    else if (level >= 2 && r < (arcade ? .31 : .25)) type = 'break';
    else if (r < (arcade ? .55 : .45)) type = 'moving';
    const w = type === 'break' ? 70 : 96 + Math.random() * 44;
    // Keep each new platform inside the normal jump arc of the preceding one.
    // The sideways variation grows with tiers instead of producing an
    // unwinnable first jump anywhere across the screen.
    const previous = state.lastPlatform;
    const horizontalShift = config.horizontalShifts[level - 1] * (arcade ? config.arcadeHorizontalMultiplier : 1);
    const previousCenter = previous.x + previous.w / 2;
    const center = Math.max(w / 2 + 12, Math.min(W - w / 2 - 12,
      previousCenter + (Math.random() * 2 - 1) * horizontalShift));
    const x = center - w / 2;
    const arcadeProgress = Math.min(1, state.score / config.arcadeTargetScore);
    let speed = 0;
    if (type === 'moving') {
      if (arcade) {
        const [minSpeed, maxSpeed] = config.arcadeMovingPlatformSpeedRange;
        speed = Math.min(maxSpeed, (minSpeed + (maxSpeed - minSpeed) * arcadeProgress) * (.9 + Math.random() * .2));
      } else {
        const [minSpeed, maxSpeed] = config.movingPlatformSpeedRange;
        speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
      }
    }
    const platform = { x, y: state.nextY, w, type, speed, dir: Math.random() < .5 ? -1 : 1, broken: false };
    state.platforms.push(platform);
    state.lastPlatform = platform;
    if (state.mode === 'challenge') {
      // The Challenge course contains exactly 50 bowls, spaced through its
      // route. Missing even one means the finish banner cannot be won.
      state.challengePlatformCount++;
      const placeParshad = state.challengePlaced < config.challengeParshadTarget && state.challengePlatformCount % 3 === 0;
      if (placeParshad) { state.collectibles.push({ x: x + w / 2, y: platform.y - 37, type: 'parshad' }); state.challengePlaced++; }
      else if (Math.random() < .14) state.collectibles.push({ x: x + w / 2, y: platform.y - 37, type: 'token' });
    } else if (Math.random() < .53) state.collectibles.push({ x: x + w / 2, y: platform.y - 37, type: Math.random() < .16 ? 'token' : 'parshad' });
    if (level >= 3 && Math.random() < .055) state.powerups.push({ x: x + w / 2, y: platform.y - 60, type: 'kara' });
    if (level >= 4 && Math.random() < .04) state.powerups.push({ x: x + w / 2, y: platform.y - 60, type: 'nishan' });
    const birdStartScore = arcade ? config.arcadeBirdStartScore : config.tierThresholds[3];
    if (state.score >= birdStartScore && Math.random() < .18) state.enemies.push({ x: 25 + Math.random() * (W - 50), y: platform.y - 90, vx: (Math.random() < .5 ? -1 : 1) * (60 + Math.random() * 45) });
    // A normal jump reaches about 128 pixels. Early gaps are deliberately
    // forgiving; larger gaps can appear only once the player is progressing.
    const [minGap, maxGap] = config.verticalGapRanges[level === 1 ? 0 : 1];
    const verticalGap = minGap + Math.random() * (maxGap - minGap) + (arcade ? config.arcadeGapBonus : 0);
    state.nextY -= verticalGap;
  }
  // Longer score bands let a full run breathe before new hazards appear.
  function levelForScore(score) { const [two, three, four, five] = config.tierThresholds; return score >= five ? 5 : score >= four ? 4 : score >= three ? 3 : score >= two ? 2 : 1; }
  function worldToScreen(y) { return y - state.cameraY; }
  function collide(a, b, range = 20) { return Math.abs(a.x - b.x) < range && Math.abs(a.y - b.y) < range; }
  function finish(completed = false, reason = 'loss') {
    if (state.ending) return;
    state.ending = true; state.running = false; state.completed = completed; state.endReason = reason; state.winStarted = lastTime;
    profile.tokens += state.tokens; saveProfile(); updateUpgradeUI();
    setTimeout(() => { ui.endHeading.textContent = completed ? (state.mode === 'challenge' ? 'Challenge complete!' : 'Arcade complete!') : (state.mode === 'challenge' && reason === 'finish' ? 'Challenge incomplete' : 'Run complete'); ui.score.textContent = `Score ${Math.floor(state.score)} · ${state.parshad} parshad · ${state.tokens} Khanda tokens earned`; ui.end.classList.remove('hidden'); }, 520);
  }
  function update(dt) {
    if (!state.running) return;
    const p = state.player;
    if (state.boostTimer > 0) { state.boostTimer = Math.max(0, state.boostTimer - dt); if (state.boostTimer === 0) state.boostMultiplier = 1; }
    if (state.invincibleTimer > 0) state.invincibleTimer = Math.max(0, state.invincibleTimer - dt);
    const keyboard = (keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0);
    if (pointerX !== null) p.vx += (pointerX - p.x) * 8 * dt; else p.vx += keyboard * 1100 * dt;
    p.vx *= Math.pow(.0007, dt); p.vx = Math.max(-config.maxHorizontalSpeed, Math.min(config.maxHorizontalSpeed, p.vx)); p.x += p.vx * dt;
    p.x = Math.max(p.w / 2, Math.min(W - p.w / 2, p.x)); p.vy += config.gravity * dt; p.y += p.vy * dt;
    for (const plat of state.platforms) {
      if (plat.type === 'moving') { plat.x += plat.dir * plat.speed * dt; if (plat.x < 6 || plat.x + plat.w > W - 6) plat.dir *= -1; }
      const top = plat.y;
      if (!plat.broken && p.vy > 0 && p.y + p.h / 2 >= top && p.y + p.h / 2 <= top + 25 && p.x + p.w / 2 > plat.x && p.x - p.w / 2 < plat.x + plat.w) {
        const jumpMultiplier = (1 + profile.powerJump * .1) * state.boostMultiplier;
        p.y = top - p.h / 2; p.vy = -(plat.type === 'spring' ? config.springJumpVelocity : config.baseJumpVelocity) * jumpMultiplier;
        if (plat.type === 'break') plat.broken = true;
      }
    }
    const targetCamera = Math.min(state.cameraY, p.y - H * .38);
    state.cameraY += (targetCamera - state.cameraY) * Math.min(1, dt * 4);
    const currentHeight = Math.max(0, Math.floor((650 - p.y) / 18));
    if (currentHeight > state.heightScore) { state.heightScore = currentHeight; state.score = currentHeight + state.parshad * 3; }
    if (rules.isArcadeLike(state.mode)) {
      if (!state.finishGate && state.score >= config.arcadeTargetScore - config.finishBannerLeadScore) {
        state.finishGate = { y: p.y - config.finishBannerLeadScore * 18, broken: false };
        state.message = 'The finish banner is ahead!'; state.messageTimer = 2;
      }
      if (state.finishGate && p.y <= state.finishGate.y) {
        state.finishGate.broken = true;
        finish(rules.didWin(state.mode, state.parshad), 'finish');
        return;
      }
    }
    while (state.nextY > state.cameraY - 900) addPlatform();
    state.platforms = state.platforms.filter(o => o.y < state.cameraY + H + 100 && !o.broken);
    for (const c of state.collectibles) if (!c.taken && collide(p, c, 27)) { c.taken = true; if (c.type === 'token') state.tokens++; else { state.parshad++; state.score += 3; } }
    state.collectibles = state.collectibles.filter(c => !c.taken && c.y < state.cameraY + H + 100);
    for (const power of state.powerups) if (!power.taken && collide(p, power, 30)) { power.taken = true; state.boostMultiplier = power.type === 'kara' ? 2.5 : 3.5; state.boostTimer = 5; if (power.type === 'nishan') state.invincibleTimer = 5; p.vy = -config.baseJumpVelocity * state.boostMultiplier; state.message = power.type === 'kara' ? 'Kara boost · 5 seconds!' : 'Nishan boost · invincible!'; state.messageTimer = 2; }
    state.powerups = state.powerups.filter(o => !o.taken && o.y < state.cameraY + H + 100);
    for (const bird of state.enemies) { bird.x += bird.vx * dt; if (bird.x < 20 || bird.x > W - 20) bird.vx *= -1; if (collide(p, bird, 28)) { if (state.invincibleTimer > 0) { bird.hit = true; state.message = 'Nishan boost protected you!'; state.messageTimer = 2; } else if (profile.shield > 0) { profile.shield--; bird.hit = true; saveProfile(); updateUpgradeUI(); state.message = 'Dhal Shield protected you!'; state.messageTimer = 2; } else finish(); } }
    state.enemies = state.enemies.filter(o => o.y < state.cameraY + H + 100 && !o.hit);
    // End the run as the character reaches the visible net, rather than after
    // they have already disappeared below the frame.
    if (p.y > state.cameraY + H - 52) {
      if (profile.falcon > 0 && !state.falconUsed) { profile.falcon--; state.falconUsed = true; saveProfile(); updateUpgradeUI(); p.y = state.cameraY + H - 185; p.vy = -(config.springJumpVelocity + 40) * (1 + profile.powerJump * .1); state.message = 'Falcon Save!'; state.messageTimer = 2; }
      else finish();
    }
    state.messageTimer -= dt;
  }
  function drawBackdrop() {
    if (backgroundImage.complete && backgroundImage.naturalWidth) {
      ctx.drawImage(backgroundImage, 0, 0, W, H);
      return;
    }
    ctx.fillStyle = palette[state.background]; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff7df'; ctx.beginPath(); ctx.arc(365, 92, 42, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7cb296'; ctx.fillRect(0, H - 100, W, 100);
    // A distant gurdwara-inspired silhouette belongs only to the background.
    ctx.fillStyle = '#f6e3bb'; ctx.fillRect(50, H - 185, 92, 88); ctx.fillRect(310, H - 166, 92, 69);
    ctx.fillStyle = '#e2aa65'; [96, 356].forEach(x => { ctx.beginPath(); ctx.arc(x, H - 186, 30, Math.PI, 0); ctx.fill(); });
    ctx.fillStyle = '#ffffffbb'; for (let i = 0; i < 4; i++) { const x = (i * 130 + 25 - state.cameraY * .04) % 520 - 50; ctx.beginPath(); ctx.ellipse(x, 130 + i * 70, 50, 15, 0, 0, Math.PI * 2); ctx.fill(); }
  }
  function drawFireworks() {
    if (!state.completed) return;
    const age = Math.max(0, (lastTime - state.winStarted) / 1000);
    const colors = ['#ffe46b', '#f47c4b', '#4da8dc', '#f7f2d0'];
    for (let burst = 0; burst < 3; burst++) {
      const cx = 105 + burst * 120, cy = 130 + (burst % 2) * 65;
      for (let spark = 0; spark < 12; spark++) {
        const angle = spark / 12 * Math.PI * 2 + burst;
        const distance = 12 + ((age * 75 + burst * 17) % 58);
        ctx.fillStyle = colors[(spark + burst) % colors.length];
        ctx.fillRect(cx + Math.cos(angle) * distance - 3, cy + Math.sin(angle) * distance - 3, 6, 6);
      }
    }
  }
  function drawCatchNet() {
    if (catchNetSprite.complete && catchNetSprite.naturalWidth) ctx.drawImage(catchNetSprite, -20, H - 186 + Math.sin(lastTime / 260) * 3, W + 40, 220);
    else { const netY = H - 22; ctx.strokeStyle = '#e5dac8'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(W / 2, netY - 26, 122, 0, Math.PI); ctx.stroke(); ctx.strokeStyle = '#c7b89e'; ctx.lineWidth = 2; for (let x = W / 2 - 105; x <= W / 2 + 105; x += 21) { ctx.beginPath(); ctx.moveTo(x, netY - 20); ctx.lineTo(W / 2, netY + 20); ctx.stroke(); } }
  }
  function draw() {
    if (!state) return; ctx.clearRect(0, 0, W, H); drawBackdrop();
    drawFireworks();
    if (state.finishGate && !state.finishGate.broken) { const gateY = worldToScreen(state.finishGate.y) + Math.sin(lastTime / 220) * 3; if (finishBannerSprite.complete && finishBannerSprite.naturalWidth) ctx.drawImage(finishBannerSprite, -16, gateY - 72, W + 32, 185); ctx.fillStyle = '#fff9e8'; ctx.font = 'bold 16px "Trebuchet MS"'; ctx.textAlign = 'center'; ctx.fillText('FINISH', W / 2, gateY + 2); }
    for (const plat of state.platforms) { const y = worldToScreen(plat.y); if (y < -30 || y > H + 40) continue;
      const sprite = platformSprites[plat.type] || platformSprite;
      if (sprite.complete && sprite.naturalWidth) ctx.drawImage(sprite, plat.x, y - 22, plat.w, 50);
      else { ctx.fillStyle = plat.type === 'break' ? '#b48d66' : plat.type === 'spring' ? '#7c5c9c' : '#477e55'; ctx.fillRect(plat.x, y, plat.w, 13); }
    }
    for (const c of state.collectibles) { const y = worldToScreen(c.y); ctx.save(); ctx.translate(c.x, y); if (c.type === 'token' && khandaTokenSprite.complete && khandaTokenSprite.naturalWidth) { ctx.drawImage(khandaTokenSprite, -18, -18, 36, 36); } else if (c.type === 'token') { ctx.fillStyle = '#e3a721'; ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff4b2'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('✦', 0, 5); } else if (parshadSprite.complete && parshadSprite.naturalWidth) { ctx.drawImage(parshadSprite, -24, -24, 48, 48); } else { ctx.shadowColor = '#fff3a6'; ctx.shadowBlur = 16; ctx.fillStyle = '#f6c879'; ctx.beginPath(); ctx.ellipse(0, 4, 15, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff0ae'; ctx.beginPath(); ctx.arc(-5, -4, 5, 0, Math.PI * 2); ctx.arc(4, -4, 5, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); }
    for (const o of state.powerups) { const y = worldToScreen(o.y); const sprite = powerupSprites[o.type]; if (sprite.complete && sprite.naturalWidth) ctx.drawImage(sprite, o.x - 25, y - 25, 50, 50); else { ctx.fillStyle = o.type === 'kara' ? '#d6a740' : '#ed7353'; ctx.beginPath(); ctx.arc(o.x, y, 15, 0, Math.PI * 2); ctx.fill(); } }
    for (const b of state.enemies) { const y = worldToScreen(b.y); if (birdSprite.complete && birdSprite.naturalWidth) { ctx.save(); ctx.translate(b.x, y); if (b.vx < 0) ctx.scale(-1, 1); ctx.drawImage(birdSprite, -35, -26, 70, 47); ctx.restore(); } else { ctx.fillStyle = '#42546c'; ctx.beginPath(); ctx.ellipse(b.x, y, 19, 11, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#1f344a'; ctx.beginPath(); ctx.moveTo(b.x - 4, y); ctx.lineTo(b.x - 31, y - 15); ctx.lineTo(b.x - 19, y + 9); ctx.fill(); ctx.fillStyle = '#f2ba4a'; ctx.beginPath(); ctx.moveTo(b.x + 18, y); ctx.lineTo(b.x + 30, y + 3); ctx.lineTo(b.x + 18, y + 6); ctx.fill(); } }
    drawCatchNet();
    const p = state.player, py = worldToScreen(p.y);
    const isFalling = p.vy > 30 || state.ending;
    const playerSprite = playerSprites[p.character][isFalling ? 'fall' : 'jump'];
    const tilt = isFalling ? Math.max(-.12, Math.min(.12, p.vx / 1300)) : Math.max(-.055, Math.min(.055, p.vx / 4200));
    const bob = isFalling ? 0 : Math.sin(lastTime / 85) * 1.25;
    ctx.save(); ctx.translate(p.x, py + bob); ctx.rotate(tilt);
    if (playerSprite.complete && playerSprite.naturalWidth) {
      // The source has transparent padding; these bounds align its visible feet
      // with the collision body while preserving a crisp, readable silhouette.
      ctx.drawImage(playerSprite, -34, -60, 68, 102);
    } else {
      ctx.fillStyle = p.character === 'girl' ? '#d46686' : '#477e55'; ctx.beginPath(); ctx.arc(0, -15, 16, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#a96942'; ctx.beginPath(); ctx.arc(0, -8, 12, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#324e3d'; ctx.fillRect(-11, 1, 22, 26); ctx.fillStyle = '#f6d4b0'; ctx.fillRect(-18, 5, 8, 20); ctx.fillRect(10, 5, 8, 20);
    }
    if (profile.shield > 0 && dhalShieldSprite.complete && dhalShieldSprite.naturalWidth) ctx.drawImage(dhalShieldSprite, 5, -18, 52, 52);
    ctx.restore();
    ctx.fillStyle = '#24483f'; ctx.font = 'bold 18px "Trebuchet MS"'; ctx.textAlign = 'left'; ctx.fillText(`Score ${Math.floor(state.score)}`, 18, 31); ctx.font = 'bold 13px "Trebuchet MS"'; ctx.fillText(`Parshad ${state.parshad}  ·  Khanda ${state.tokens}`, 18, 52); ctx.textAlign = 'right'; ctx.fillText(state.mode === 'arcade' ? `Arcade ${Math.floor(state.score)} / ${config.arcadeTargetScore}` : state.mode === 'challenge' ? `Challenge ${state.parshad} / ${config.challengeParshadTarget}` : `Endless · Tier ${levelForScore(state.score)}/5`, W - 18, 31);
    if (state.messageTimer > 0) { ctx.textAlign = 'center'; ctx.fillStyle = '#24483f'; ctx.font = 'bold 15px "Trebuchet MS"'; ctx.fillText(state.message, W / 2, 82); }
  }
  function loop(time) { const dt = Math.min(.04, (time - lastTime) / 1000 || 0); lastTime = time; update(dt); draw(); requestAnimationFrame(loop); }
  ui.choices.forEach(button => button.addEventListener('click', () => { selectedCharacter = button.dataset.character; ui.choices.forEach(b => b.classList.toggle('selected', b === button)); }));
  function start(mode) { reset(mode); ui.home.classList.add('hidden'); ui.end.classList.add('hidden'); ui.upgrades.classList.add('hidden'); ui.about.classList.add('hidden'); }
  function showHome() { pointerX = null; if (state) state.running = false; ui.home.classList.remove('hidden'); ui.end.classList.add('hidden'); ui.upgrades.classList.add('hidden'); ui.about.classList.add('hidden'); }
  function showUpgrades() { pointerX = null; if (state) state.running = false; updateUpgradeUI(); ui.home.classList.add('hidden'); ui.end.classList.add('hidden'); ui.upgrades.classList.remove('hidden'); ui.about.classList.add('hidden'); }
  function showAbout() { pointerX = null; if (state) state.running = false; ui.home.classList.add('hidden'); ui.end.classList.add('hidden'); ui.upgrades.classList.add('hidden'); ui.about.classList.remove('hidden'); }
  function buyUpgrade(type) {
    const costs = { falcon: 8, shield: 10, powerJump: 15 + profile.powerJump * 10 };
    if (type === 'powerJump' && profile.powerJump >= 5) return updateUpgradeUI('Power Jump is already at its maximum level.');
    const cost = costs[type];
    if (profile.tokens < cost) return updateUpgradeUI(`You need ${cost - profile.tokens} more Khanda tokens.`);
    profile.tokens -= cost; profile[type]++; saveProfile(); updateUpgradeUI('Upgrade purchased!');
  }
  ui.endless.addEventListener('click', () => start('endless')); ui.arcade.addEventListener('click', () => start('arcade')); ui.challenge.addEventListener('click', () => start('challenge')); ui.restart.addEventListener('click', () => start(state?.mode || 'endless'));
  ui.openUpgrades.addEventListener('click', showUpgrades); ui.endUpgrades.addEventListener('click', showUpgrades); ui.endHome.addEventListener('click', showHome); ui.closeUpgrades.addEventListener('click', showHome); ui.openAbout.addEventListener('click', showAbout); ui.closeAbout.addEventListener('click', showHome);
  ui.buyFalcon.addEventListener('click', () => buyUpgrade('falcon')); ui.buyShield.addEventListener('click', () => buyUpgrade('shield')); ui.buyPower.addEventListener('click', () => buyUpgrade('powerJump'));
  canvas.addEventListener('pointerdown', e => { pointerX = (e.offsetX / canvas.clientWidth) * W; canvas.setPointerCapture?.(e.pointerId); });
  canvas.addEventListener('pointermove', e => { if (e.buttons) pointerX = (e.offsetX / canvas.clientWidth) * W; });
  canvas.addEventListener('pointerup', () => { pointerX = null; });
  document.addEventListener('keydown', e => { if (['ArrowLeft', 'ArrowRight'].includes(e.key)) { keys.add(e.key); e.preventDefault(); } }); document.addEventListener('keyup', e => keys.delete(e.key));
  function bindButton(id, key) { const b = document.querySelector(id); ['pointerdown', 'pointerup', 'pointerleave', 'pointercancel'].forEach(event => b.addEventListener(event, e => { e.preventDefault(); event === 'pointerdown' ? keys.add(key) : keys.delete(key); })); }
  bindButton('#left-button', 'ArrowLeft'); bindButton('#right-button', 'ArrowRight'); reset(); state.running = false; updateUpgradeUI(); requestAnimationFrame(loop);
})();
