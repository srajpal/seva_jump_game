(() => {
  const canvas = document.querySelector('#game');
  const nativePlatform = window.Capacitor?.isNativePlatform?.()
    || ['android', 'ios'].includes(window.Capacitor?.getPlatform?.())
    || /\bwv\b/.test(navigator.userAgent);
  document.documentElement.classList.toggle('native-app', Boolean(nativePlatform));
  const nativeTablet = Boolean(nativePlatform) && Math.min(window.innerWidth, window.innerHeight) >= 700;
  if (nativeTablet) canvas.width = 640;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const W = canvas.width, H = canvas.height;
  const config = globalThis.SEVA_CONFIG;
  const rules = globalThis.SEVA_RULES;
  const ui = {
    home: document.querySelector('#home-screen'), end: document.querySelector('#end-screen'), upgrades: document.querySelector('#upgrades-screen'), about: document.querySelector('#about-screen'), tutorial: document.querySelector('#tutorial-screen'), tutorialIcon: document.querySelector('#tutorial-icon'), tutorialStep: document.querySelector('#tutorial-step'), tutorialHeading: document.querySelector('#tutorial-heading'), tutorialCopy: document.querySelector('#tutorial-copy'), tutorialDots: document.querySelector('#tutorial-dots'), tutorialNext: document.querySelector('#tutorial-next-button'), tutorialSkip: document.querySelector('#tutorial-skip-button'), pause: document.querySelector('#pause-screen'), gameTools: document.querySelector('#game-tools'), mobileHud: document.querySelector('#mobile-hud'), mobileScore: document.querySelector('#mobile-score'), mobileItems: document.querySelector('#mobile-items'), mobileMode: document.querySelector('#mobile-mode'), mobileFalcon: document.querySelector('#mobile-falcon'), mobileShield: document.querySelector('#mobile-shield'), mobilePower: document.querySelector('#mobile-power'),
    score: document.querySelector('#end-score'), endHeading: document.querySelector('#end-heading'), endBest: document.querySelector('#end-best'), runBreakdown: document.querySelector('#run-breakdown'), endGoal: document.querySelector('#end-goal'), homeRecords: document.querySelector('#home-records'), endless: document.querySelector('#endless-button'), arcade: document.querySelector('#arcade-button'), challenge: document.querySelector('#challenge-button'), hard: document.querySelector('#hard-button'), modeChoices: document.querySelectorAll('.mode-actions button'),
    restart: document.querySelector('#restart-button'), choices: document.querySelectorAll('.scene-character'),
    sceneGirl: document.querySelector('.scene-girl'), sceneBoy: document.querySelector('.scene-boy'),
    openUpgrades: document.querySelector('#open-upgrades-button'), closeUpgrades: document.querySelector('#close-upgrades-button'),
    endHome: document.querySelector('#end-home-button'), endUpgrades: document.querySelector('#end-upgrades-button'),
    wallet: document.querySelector('#wallet-count'), upgradeMessage: document.querySelector('#upgrade-message'),
    falconOwned: document.querySelector('#falcon-owned'), shieldOwned: document.querySelector('#shield-owned'), powerOwned: document.querySelector('#power-owned'),
    buyFalcon: document.querySelector('#buy-falcon'), buyShield: document.querySelector('#buy-shield'), buyPower: document.querySelector('#buy-power'),
    openAbout: document.querySelector('#open-about-button'), closeAbout: document.querySelector('#close-about-button'), openPrivacy: document.querySelector('#open-privacy-button'), closePrivacy: document.querySelector('#close-privacy-button'), privacy: document.querySelector('#privacy-screen'), exitConfirm: document.querySelector('#exit-confirm-screen'), confirmExit: document.querySelector('#confirm-exit-button'), cancelExit: document.querySelector('#cancel-exit-button'), openSettings: document.querySelector('#open-settings-button'), closeSettings: document.querySelector('#close-settings-button'), pauseSettings: document.querySelector('#pause-settings-button'), resetProgress: document.querySelector('#reset-progress-button'), resetConfirm: document.querySelector('#reset-confirm-screen'), confirmReset: document.querySelector('#confirm-reset-button'), cancelReset: document.querySelector('#cancel-reset-button'), settings: document.querySelector('#settings-screen'), openBadges: document.querySelector('#open-badges-button'), closeBadges: document.querySelector('#close-badges-button'), badges: document.querySelector('#badges-screen'), badgeCount: document.querySelector('#badge-count'), badgeGrid: document.querySelector('#badge-grid'), badgeToast: document.querySelector('#badge-toast'), badgeToastIcon: document.querySelector('#badge-toast-icon'), badgeToastName: document.querySelector('#badge-toast-name'), openStats: document.querySelector('#open-stats-button'), closeStats: document.querySelector('#close-stats-button'), stats: document.querySelector('#stats-screen'), statsSummary: document.querySelector('#stats-summary'), deathBreakdown: document.querySelector('#death-breakdown'),
    musicToggle: document.querySelector('#music-toggle'), soundToggle: document.querySelector('#sound-toggle'), reducedMotionToggle: document.querySelector('#reduced-motion-toggle'), replayTutorial: document.querySelector('#replay-tutorial-button'),
    pauseButton: document.querySelector('#pause-button'), resume: document.querySelector('#resume-button'), pauseRestart: document.querySelector('#pause-restart-button'), pauseHome: document.querySelector('#pause-home-button'),
  };
  const palette = ['#bce7ef', '#f8d9a7', '#c9e5c0', '#e5c4d6'];
  const backgroundImages = ['assets/gurdwara-courtyard-pixel-v1.png', 'assets/gurdwara-sunset-pixel-v1.png', 'assets/gurdwara-dawn-pixel-v1.png'].map(src => { const image = new Image(); image.src = src; return image; });
  const playerSprites = { girl: { jump: new Image(), fall: new Image() }, boy: { jump: new Image(), fall: new Image() } };
  playerSprites.girl.jump.src = 'assets/player-girl-pixel-v1.png';
  playerSprites.girl.fall.src = 'assets/player-girl-fall-pixel-v1.png';
  playerSprites.boy.jump.src = 'assets/player-boy-pixel-v1.png';
  playerSprites.boy.fall.src = 'assets/player-boy-fall-pixel-v3.png';
  const netLandingSprites = { girl: new Image(), boy: new Image() };
  netLandingSprites.girl.src = 'assets/player-girl-net-pixel-v2.png';
  netLandingSprites.boy.src = 'assets/player-boy-net-pixel-v4.png';
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
  parshadSprite.src = 'assets/parshad-bowl-pixel-v3.png';
  const khandaTokenSprite = new Image();
  khandaTokenSprite.src = 'assets/khanda-token-pixel-v3.png';
  const birdSprites = {};
  [['pigeon', 'assets/bird-pigeon-flap-pixel-v1.png'], ['sparrow', 'assets/bird-sparrow-flap-pixel-v1.png'], ['swift', 'assets/bird-swift-flap-pixel-v1.png']].forEach(([type, src]) => { const image = new Image(); image.src = src; birdSprites[type] = image; });
  const powerupSprites = { kara: new Image(), nishan: new Image() };
  powerupSprites.kara.src = 'assets/powerup-kara-pixel-v1.png';
  powerupSprites.nishan.src = 'assets/powerup-nishan-pixel-v1.png';
  const catchNetSprite = new Image();
  catchNetSprite.src = 'assets/catch-net-hover-pixel-v1.png';
  const dhalShieldSprite = new Image();
  dhalShieldSprite.src = 'assets/dhal-shield-pixel-v1.png';
  const falconSaveSprite = new Image();
  falconSaveSprite.src = 'assets/falcon-save-pixel-v1.png';
  const finishBannerSprite = new Image();
  finishBannerSprite.src = 'assets/finish-banner-hover-pixel-v1.png';
  const BADGES = [
    { id: 'first-run', icon: '✦', title: 'First Leap', description: 'Finish your first run.', color: '#d56d39' },
    { id: 'sky-starter', icon: '☁', title: 'Sky Starter', description: 'Reach 100 points.', color: '#4e98c7' },
    { id: 'endless-1000', icon: '∞', title: 'Endless Explorer', description: 'Reach 1,000 in Endless Run.', color: '#477e55' },
    { id: 'endless-2000', icon: '★', title: 'Sky Legend', description: 'Reach 2,000 in Endless Run.', color: '#a85e30' },
    { id: 'arcade-complete', icon: '⚑', title: 'Banner Breaker', description: 'Complete Arcade Mode.', color: '#9b597e' },
    { id: 'challenge-complete', icon: '◎', title: 'Seva Champion', description: 'Collect all 50 in Challenge.', color: '#b56b2e' },
    { id: 'parshad-50', icon: '◉', title: 'Bowl Collector', description: 'Collect 50 parshad bowls total.', color: '#c88932' },
    { id: 'tokens-10', icon: '◇', title: 'Khanda Keeper', description: 'Collect 10 Khanda tokens total.', color: '#5d7c94' },
    { id: 'bird-defender', icon: '◒', title: 'Bird Defender', description: 'Block 3 bird collisions.', color: '#5476a8' },
    { id: 'power-seeker', icon: '⚡', title: 'Power Seeker', description: 'Collect 5 power-ups.', color: '#b65e45' },
  ];
  const defaultProfile = { tokens: 0, falcon: 0, shield: 0, powerJump: 0, character: 'girl', tutorialComplete: false, music: true, sound: true, reducedMotion: false, bestScores: { endless: 0, arcade: 0, challenge: 0, hard: 0 }, badges: {}, stats: { runs: 0, wins: 0, arcadeWins: 0, challengeWins: 0, leftEarly: 0, deaths: 0, fallDeaths: 0, birdDeaths: 0, challengeMisses: 0, jumps: 0, totalScore: 0, totalHeight: 0, parshad: 0, tokens: 0, powerups: 0, birdsSeen: 0, birdsBlocked: 0, falconSaves: 0, shieldsUsed: 0 } };
  function loadProfile() { try { const saved = JSON.parse(localStorage.getItem('seva-jump-profile')) || {}; const tutorialComplete = saved.tutorialComplete ?? Object.values(saved.tutorialModes || {}).some(Boolean); return { ...defaultProfile, ...saved, tutorialComplete, bestScores: { ...defaultProfile.bestScores, ...saved.bestScores }, badges: { ...defaultProfile.badges, ...saved.badges }, stats: { ...defaultProfile.stats, ...saved.stats } }; } catch { return { ...defaultProfile, bestScores: { ...defaultProfile.bestScores }, badges: {}, stats: { ...defaultProfile.stats } }; } }
  function saveProfile() { localStorage.setItem('seva-jump-profile', JSON.stringify(profile)); }
  let profile = loadProfile();
  let state, selectedCharacter = profile.character === 'boy' ? 'boy' : 'girl', settingsReturn = 'home', pointerX = null, keys = new Set(), lastTime = 0, tutorialIndex = 0, tutorialResumesRun = false;
  let audioContext, musicTimer = null, musicVoices = [], badgeQueue = [], badgeToastTimer = null;

  function applyPreferences() {
    ui.musicToggle.checked = profile.music;
    ui.soundToggle.checked = profile.sound;
    ui.reducedMotionToggle.checked = profile.reducedMotion;
    document.documentElement.classList.toggle('reduced-motion', profile.reducedMotion);
  }
  function requestResetProgress() { ui.settings.classList.add('hidden'); ui.resetConfirm.classList.remove('hidden'); }
  function cancelResetProgress() { ui.resetConfirm.classList.add('hidden'); ui.settings.classList.remove('hidden'); }
  function resetAllProgress() {
    ui.resetConfirm.classList.add('hidden');
    localStorage.removeItem('seva-jump-profile');
    profile = { ...defaultProfile, bestScores: { ...defaultProfile.bestScores }, badges: {}, stats: { ...defaultProfile.stats } };
    clearTimeout(badgeToastTimer); badgeQueue = []; ui.badgeToast.classList.add('hidden');
    applyPreferences(); updateUpgradeUI(); updateRecordsUI(); renderBadges(); renderStats();
    showHome();
  }

  function getAudio() {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();
    return audioContext;
  }
  function tone(frequency, duration, options = {}) {
    if (!ui.soundToggle.checked || !audioContext) return;
    const audio = audioContext, now = audio.currentTime, oscillator = audio.createOscillator(), gain = audio.createGain();
    oscillator.type = options.wave || 'triangle'; oscillator.frequency.setValueAtTime(frequency, now);
    if (options.slide) oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, options.slide), now + duration);
    gain.gain.setValueAtTime(options.volume ?? .055, now); gain.gain.exponentialRampToValueAtTime(.001, now + duration);
    oscillator.connect(gain).connect(audio.destination); oscillator.start(now); oscillator.stop(now + duration + .03);
  }
  function noise(duration, options = {}) {
    if (!ui.soundToggle.checked || !audioContext) return;
    const audio = audioContext, frames = Math.ceil(audio.sampleRate * duration), buffer = audio.createBuffer(1, frames, audio.sampleRate), samples = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) samples[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    const source = audio.createBufferSource(), filter = audio.createBiquadFilter(), gain = audio.createGain(), now = audio.currentTime;
    source.buffer = buffer; filter.type = options.filter || 'bandpass'; filter.frequency.value = options.frequency || 900; filter.Q.value = .8;
    gain.gain.setValueAtTime(options.volume ?? .025, now); gain.gain.exponentialRampToValueAtTime(.001, now + duration);
    source.connect(filter).connect(gain).connect(audio.destination); source.start(now); source.stop(now + duration + .03);
  }
  function sound(type) {
    if (type === 'land') { tone(300, .075, { slide: 235, volume: .034 }); noise(.045, { frequency: 460, volume: .014 }); }
    else if (type === 'spring') { tone(380, .11, { slide: 720, volume: .05 }); setTimeout(() => tone(770, .09, { volume: .032 }), 55); }
    else if (type === 'collect') { tone(760, .065, { volume: .037 }); setTimeout(() => tone(1020, .085, { volume: .03 }), 52); }
    else if (type === 'token') { tone(580, .08, { slide: 920, volume: .045 }); setTimeout(() => tone(1180, .11, { volume: .034 }), 62); }
    else if (type === 'boost') { tone(330, .16, { slide: 820, wave: 'sine', volume: .052 }); setTimeout(() => tone(990, .13, { volume: .034 }), 82); }
    else if (type === 'shield') { tone(260, .16, { slide: 150, wave: 'square', volume: .045 }); setTimeout(() => tone(420, .12, { volume: .025 }), 50); }
    else if (type === 'hit') { noise(.09, { filter: 'bandpass', frequency: 780, volume: .038 }); tone(190, .12, { slide: 125, wave: 'square', volume: .035 }); }
    else if (type === 'break') { noise(.14, { filter: 'lowpass', frequency: 620, volume: .05 }); tone(165, .12, { slide: 85, wave: 'sawtooth', volume: .026 }); }
    else if (type === 'save') { tone(500, .12, { slide: 780, volume: .05 }); setTimeout(() => tone(980, .15, { volume: .036 }), 78); }
    else if (type === 'badge') { [659, 784, 1047].forEach((note, i) => setTimeout(() => tone(note, .13, { volume: .033 }), i * 88)); }
    else if (type === 'ui') tone(610, .045, { slide: 700, volume: .018 });
    else if (type === 'purchase') { tone(440, .08, { slide: 660, volume: .03 }); setTimeout(() => tone(880, .1, { volume: .026 }), 64); }
    else if (type === 'win') { [523, 659, 784, 1047].forEach((note, i) => setTimeout(() => tone(note, .17, { volume: .045 }), i * 100)); }
    else if (type === 'firework') { noise(.28, { filter: 'lowpass', frequency: 360, volume: .05 }); tone(180, .16, { slide: 85, wave: 'sawtooth', volume: .027 }); setTimeout(() => noise(.16, { frequency: 1350, volume: .023 }), 115); }
    else if (type === 'loss') { tone(260, .3, { slide: 110, wave: 'sine', volume: .042 }); noise(.12, { frequency: 230, volume: .014 }); }
  }
  function playMusicPhrase() {
    if (!audioContext || !ui.musicToggle.checked) return;
    const audio = audioContext, now = audio.currentTime, beat = .5;
    const music = state?.mode === 'challenge' ? [392, 440, 494, 523, 494, 440, 392, 330] : state?.mode === 'arcade' ? [392, 440, 523, 587, 523, 440, 494, 523] : [392, 440, 523, 440, 349, 392, 440, 494];
    const bass = state?.mode === 'challenge' ? [196, 196, 220, 220] : [196, 175, 196, 220];
    music.forEach((note, i) => {
      const oscillator = audio.createOscillator(), gain = audio.createGain(), start = now + i * beat;
      oscillator.type = 'sine'; oscillator.frequency.value = note; gain.gain.setValueAtTime(.028, start); gain.gain.exponentialRampToValueAtTime(.001, start + beat * .84);
      oscillator.connect(gain).connect(audio.destination); oscillator.start(start); oscillator.stop(start + beat); musicVoices.push(oscillator); oscillator.onended = () => { musicVoices = musicVoices.filter(voice => voice !== oscillator); };
    });
    bass.forEach((note, i) => {
      const oscillator = audio.createOscillator(), gain = audio.createGain(), start = now + i * beat * 2;
      oscillator.type = 'triangle'; oscillator.frequency.value = note; gain.gain.setValueAtTime(.018, start); gain.gain.exponentialRampToValueAtTime(.001, start + beat * 1.7);
      oscillator.connect(gain).connect(audio.destination); oscillator.start(start); oscillator.stop(start + beat * 2); musicVoices.push(oscillator); oscillator.onended = () => { musicVoices = musicVoices.filter(voice => voice !== oscillator); };
    });
  }
  function setMusic() {
    clearInterval(musicTimer); musicTimer = null;
    if (!ui.musicToggle.checked || !audioContext) return;
    playMusicPhrase(); musicTimer = setInterval(playMusicPhrase, 8 * .5 * 1000);
  }
  function stopMusic() { clearInterval(musicTimer); musicTimer = null; musicVoices.forEach(voice => { try { voice.stop(); } catch {} }); musicVoices = []; }
  function startAudio() { getAudio(); setMusic(); }

  function updateUpgradeUI(message = '') {
    ui.wallet.textContent = profile.tokens;
    ui.falconOwned.textContent = `Owned: ${profile.falcon}`;
    ui.shieldOwned.textContent = `Owned: ${profile.shield}`;
    ui.powerOwned.textContent = `Level: ${profile.powerJump} / 5`;
    ui.buyPower.textContent = profile.powerJump >= 5 ? 'Max level' : `Buy · ${config.powerJumpCosts[profile.powerJump]}`;
    ui.buyPower.disabled = profile.powerJump >= 5;
    ui.upgradeMessage.textContent = message;
  }
  function updateRecordsUI() {
    const best = profile.bestScores;
    ui.homeRecords.textContent = `Best · Endless ${best.endless} · Arcade ${best.arcade} · Challenge ${best.challenge} · Hard ${best.hard}`;
  }
  function renderBadges() {
    const earned = BADGES.filter(badge => profile.badges[badge.id]).length;
    ui.badgeCount.textContent = `${earned} of ${BADGES.length} earned`;
    ui.badgeGrid.innerHTML = BADGES.map(badge => `<article class="badge-card${profile.badges[badge.id] ? '' : ' locked'}" style="--badge-color:${badge.color}"><span class="badge-ribbon"><span class="badge-icon" aria-hidden="true">${badge.icon}</span></span><span><h3>${badge.title}</h3><p>${badge.description}</p><small>${profile.badges[badge.id] ? 'Earned' : 'Keep climbing'}</small></span></article>`).join('');
  }
  function renderStats() {
    const s = profile.stats, averageScore = s.runs ? Math.round(s.totalScore / s.runs) : 0;
    ui.statsSummary.innerHTML = [
      ['Runs', s.runs], ['Jumps', s.jumps], ['Best Endless', profile.bestScores.endless], ['Best Arcade', profile.bestScores.arcade], ['Best Hard', profile.bestScores.hard],
      ['Average score', averageScore], ['Height climbed', s.totalHeight], ['Parshad', s.parshad], ['Khanda earned', s.tokens],
      ['Boosts collected', s.powerups], ['Birds seen', s.birdsSeen], ['Birds blocked', s.birdsBlocked],
    ].map(([label, value]) => `<article><strong>${rules.formatStat(value)}</strong><span>${label}</span></article>`).join('');
    ui.deathBreakdown.innerHTML = [
      ['Course finishes', s.wins, '#477e55'], ['Arcade wins', s.arcadeWins, '#5c9c74'], ['Challenge wins', s.challengeWins, '#9b597e'], ['Left early', s.leftEarly, '#7b8793'], ['Falls', s.fallDeaths, '#bd7d54'], ['Bird collisions', s.birdDeaths, '#6b86a8'], ['Challenge incomplete', s.challengeMisses, '#b78448'], ['Dhal Shields used', s.shieldsUsed, '#5b8692'],
    ].map(([label, value, color]) => `<article style="--stat-color:${color}"><strong>${rules.formatStat(value)}</strong><span>${label}</span></article>`).join('');
  }
  function showNextBadgeToast() {
    const badge = badgeQueue.shift();
    if (!badge) return;
    ui.badgeToastIcon.textContent = badge.icon;
    ui.badgeToastName.textContent = badge.title;
    ui.badgeToast.classList.remove('hidden');
    clearTimeout(badgeToastTimer);
    badgeToastTimer = setTimeout(() => { ui.badgeToast.classList.add('hidden'); showNextBadgeToast(); }, 3000);
  }
  function awardBadge(id) {
    if (profile.badges[id]) return false;
    const badge = BADGES.find(candidate => candidate.id === id);
    if (!badge) return false;
    profile.badges[id] = true;
    saveProfile(); renderBadges();
    sound('badge');
    badgeQueue.push(badge);
    if (badgeQueue.length === 1 && ui.badgeToast.classList.contains('hidden')) showNextBadgeToast();
    return true;
  }

  function reset(mode = 'endless') {
    if (state?.fireworkSoundTimers) state.fireworkSoundTimers.forEach(clearTimeout);
    state = {
      running: true, paused: false, mode, score: 0, heightScore: 0, parshad: 0, tokens: 0, cameraY: 0,
      background: Math.floor(Math.random() * backgroundImages.length), nextY: 610, ending: false, falconUsed: false, invincibleTimer: 0, shieldVisualTimer: 0, finishGate: null, fireworkSoundTimers: [], challengePlaced: 0, challengePlatformCount: 0, upgradeEffect: null, hitStop: null, falconRescue: null,
      player: { x: W / 2, y: 650, vx: 0, vy: -config.baseJumpVelocity * (1 + profile.powerJump * .1), w: 31, h: 48, character: selectedCharacter, facing: 1 },
      platforms: [{ x: 170, y: 700, w: 115, type: 'normal' }], lastPlatform: { x: 170, y: 700, w: 115 }, collectibles: [], enemies: [], powerups: [], particles: [],
      message: mode === 'challenge' ? `Challenge · collect all ${config.challengeParshadTarget} parshad` : mode === 'arcade' ? `Arcade · reach ${config.arcadeTargetScore}` : mode === 'hard' ? 'Hard Mode · fragile routes ahead' : 'Endless Run · Keep climbing', messageTimer: 3,
    };
    while (state.nextY > -900) addPlatform();
  }
  function addPlatform() {
    const r = Math.random();
    const arcade = rules.isArcadeLike(state.mode);
    const hard = rules.isHard(state.mode);
    const level = arcade || hard ? levelForScore(state.score) : 1;
    const endlessDifficulty = rules.endlessDifficulty(state.score);
    const challengeBowlPlatform = state.mode === 'challenge' && state.challengePlaced < config.challengeParshadTarget && (state.challengePlatformCount + 1) % 3 === 0;
    let type = 'normal';
    if (hard) {
      type = r < config.hardMovingChance ? 'moving' : 'break';
    } else if (arcade) {
      if (r < .09) type = 'spring';
      else if (level >= 2 && r < .09 + (state.mode === 'challenge' ? rules.challengeBreakChance(state.score) : rules.arcadeBreakChance(state.score))) type = 'break';
      else if (r < .55) type = 'moving';
    } else {
      // Endless has no tiers: its platform mix gradually becomes more varied.
      if (r < .10 + endlessDifficulty * .03) type = 'spring';
      else if (r < .18 + endlessDifficulty * .14) type = 'break';
      else if (r < .38 + endlessDifficulty * .18) type = 'moving';
    }
    if (challengeBowlPlatform) type = 'normal';
    const hardWidthRange = type === 'moving' ? config.hardMovingPlatformWidthRange : config.hardBreakPlatformWidthRange;
    const w = challengeBowlPlatform ? 128 : hard ? hardWidthRange[0] + Math.random() * (hardWidthRange[1] - hardWidthRange[0]) : type === 'break' ? 70 : 96 + Math.random() * 44;
    // Keep each new platform inside the normal jump arc of the preceding one.
    // The sideways variation grows with tiers instead of producing an
    // unwinnable first jump anywhere across the screen.
    const previous = state.lastPlatform;
    const tierIndex = Math.min(level - 1, config.horizontalShifts.length - 1);
    const arcadeShift = config.horizontalShifts[tierIndex] * config.arcadeHorizontalMultiplier;
    const endlessShift = config.endlessHorizontalShiftRange[0] + (config.endlessHorizontalShiftRange[1] - config.endlessHorizontalShiftRange[0]) * endlessDifficulty;
    const hardShift = config.hardHorizontalShiftRange[0] + (config.hardHorizontalShiftRange[1] - config.hardHorizontalShiftRange[0]) * endlessDifficulty;
    const horizontalShift = arcade ? arcadeShift : hard ? hardShift : endlessShift;
    const previousCenter = previous.x + previous.w / 2;
    const center = Math.max(w / 2 + 12, Math.min(W - w / 2 - 12,
      previousCenter + (Math.random() * 2 - 1) * horizontalShift));
    const x = center - w / 2;
    const arcadeProgress = Math.min(1, state.score / config.arcadeTargetScore);
    let speed = 0;
    if (type === 'moving') {
      if (hard) {
        const [minSpeed, maxSpeed] = config.hardMovingPlatformSpeedRange;
        speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
      } else if (arcade) {
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
    // A second platform makes occasional rows feel more generous and varied.
    // Moving platforms deliberately stay alone so their route stays readable.
    const doubleChance = hard && type === 'break' ? config.hardDoubleBreakChance : config.doublePlatformChance;
    if (rules.canHaveDoublePlatform(type) && Math.random() < doubleChance) {
      const companionW = hard ? config.hardBreakPlatformWidthRange[0] + Math.random() * (config.hardBreakPlatformWidthRange[1] - config.hardBreakPlatformWidthRange[0]) : 88 + Math.random() * 34;
      const direction = center < W / 2 ? 1 : -1;
      const companionCenter = Math.max(companionW / 2 + 12, Math.min(W - companionW / 2 - 12, center + direction * (w / 2 + companionW / 2 + 24)));
      if (Math.abs(companionCenter - center) >= (w + companionW) / 2 + 12) state.platforms.push({ x: companionCenter - companionW / 2, y: state.nextY, w: companionW, type: hard ? 'break' : 'normal', speed: 0, dir: 1, broken: false, companion: true });
    }
    if (state.mode === 'challenge') {
      // The Challenge course contains exactly 50 bowls, spaced through its
      // route. Missing even one means the finish banner cannot be won.
      state.challengePlatformCount++;
      if (challengeBowlPlatform) { state.collectibles.push({ x: x + w / 2, y: platform.y - 26, type: 'parshad', challengeBowl: true }); state.challengePlaced++; }
      else if (Math.random() < .14) state.collectibles.push({ x: x + w / 2, y: platform.y - 37, type: 'token' });
    } else if (Math.random() < .53) state.collectibles.push({ x: x + w / 2, y: platform.y - 37, type: Math.random() < .16 ? 'token' : 'parshad' });
    if (level >= 3 && Math.random() < .055) state.powerups.push({ x: x + w / 2, y: platform.y - 60, type: 'kara' });
    if (level >= 4 && Math.random() < .04) state.powerups.push({ x: x + w / 2, y: platform.y - 60, type: 'nishan' });
    const birdChance = state.mode === 'challenge'
      ? (state.score >= config.challengeBirdStartScore ? config.challengeBirdChance : 0)
      : arcade ? (state.score >= config.arcadeBirdStartScore ? .18 : 0)
        : hard ? rules.hardBirdChance(state.score) : rules.endlessBirdChance(state.score);
    const candidateBirdY = platform.y - 90;
    const activeBirdYs = state.enemies.filter(bird => !bird.hit).map(bird => bird.y);
    const birdSpacingIsSafe = hard ? rules.canSpawnHardBird(activeBirdYs, candidateBirdY, H)
      : state.mode === 'challenge' ? rules.canSpawnChallengeBird(activeBirdYs, candidateBirdY) : true;
    if (!challengeBowlPlatform && birdSpacingIsSafe && Math.random() < birdChance) {
      const types = ['pigeon', 'sparrow', 'swift'], platformCenter = x + w / 2, clearance = config.birdPlatformClearance;
      const leftLimit = Math.max(25, platformCenter - clearance), rightLimit = Math.min(W - 25, platformCenter + clearance);
      const birdX = Math.random() < .5 && leftLimit > 25 ? 25 + Math.random() * (leftLimit - 25) : rightLimit < W - 25 ? rightLimit + Math.random() * (W - 25 - rightLimit) : platformCenter < W / 2 ? W - 25 : 25;
      const challengeSpeedBonus = state.mode === 'challenge' ? config.challengeBirdSpeedBonus : 0;
      state.enemies.push({ x: birdX, y: candidateBirdY, vx: (Math.random() < .5 ? -1 : 1) * (60 + Math.random() * 45 + endlessDifficulty * 35 + (hard ? 12 : 0) + challengeSpeedBonus), type: types[Math.floor(Math.random() * types.length)], flapOffset: Math.random() * Math.PI * 2 });
      profile.stats.birdsSeen++;
    }
    // A normal jump reaches about 128 pixels. Endless ramps continuously;
    // Arcade steps through its planned score bands.
    const earlyGap = config.verticalGapRanges[0], lateGap = config.verticalGapRanges[1];
    const [minGap, maxGap] = arcade ? config.verticalGapRanges[level === 1 ? 0 : 1] : hard ? lateGap : [earlyGap[0] + (lateGap[0] - earlyGap[0]) * endlessDifficulty, earlyGap[1] + (lateGap[1] - earlyGap[1]) * endlessDifficulty];
    const requestedGap = minGap + Math.random() * (maxGap - minGap) + (arcade ? config.arcadeGapBonus : 0);
    const verticalGap = Math.min(requestedGap, rules.maxDefaultPlatformGap());
    state.nextY -= verticalGap;
  }
  function burst(x, y, color, count = 6) {
    if (profile.reducedMotion) return;
    for (let i = 0; i < count; i++) state.particles.push({ x, y, vx: (Math.random() * 2 - 1) * 145, vy: -45 - Math.random() * 155, color, life: .5 + Math.random() * .3, maxLife: .8, size: 4 + Math.floor(Math.random() * 5) });
  }
  function addFinishRunway() {
    // Reuse the route that is already waiting above the player. Creating a
    // second staircase here made platforms visibly pop into the playfield.
    const p = state.player;
    const runway = state.platforms.filter(platform => !platform.companion && !platform.broken && platform.y < p.y - 24).sort((a, b) => b.y - a.y).slice(0, config.finishRunwaySteps);
    if (!runway.length) return false;
    runway.forEach((platform, index) => {
      platform.finishRunway = true;
      platform.speed = 0;
      platform.dir = 1;
      // A few late breakables add tension; the final launch platform remains
      // solid so the banner jump is always fair.
      platform.type = index === runway.length - 1 ? 'normal' : (Math.random() < rules.arcadeBreakChance(state.score) ? 'break' : 'normal');
    });
    const topPlatform = runway[runway.length - 1];
    state.finishGate = { y: topPlatform.y - config.finishBannerGap, broken: false };
    const belowBanner = object => rules.isBelowFinishBanner(object.y, state.finishGate.y);
    state.platforms = state.platforms.filter(belowBanner);
    state.collectibles = state.collectibles.filter(belowBanner);
    state.powerups = state.powerups.filter(belowBanner);
    state.enemies = state.enemies.filter(belowBanner);
    return true;
  }
  // Longer score bands let a full run breathe before new hazards appear.
  function levelForScore(score) { const [two, three, four, five] = config.tierThresholds; return score >= five ? 5 : score >= four ? 4 : score >= three ? 3 : score >= two ? 2 : 1; }
  function worldToScreen(y) { return y - state.cameraY; }
  function collide(a, b, range = 20) { return Math.abs(a.x - b.x) < range && Math.abs(a.y - b.y) < range; }
  function finish(completed = false, reason = 'loss') {
    if (state.ending) return;
    state.ending = true; state.running = false; state.completed = completed; state.endReason = reason; state.winStarted = lastTime;
    ui.pause.classList.add('hidden'); ui.gameTools.classList.add('hidden');
    stopMusic();
    sound(completed ? 'win' : 'loss');
    if (completed) {
      [450, 1350, 2350, 3450, 4300].forEach(delay => state.fireworkSoundTimers.push(setTimeout(() => sound('firework'), delay)));
    }
    const score = Math.floor(state.score), previousBest = profile.bestScores[state.mode] || 0, isNewBest = score > previousBest;
    if (isNewBest) profile.bestScores[state.mode] = score;
    profile.stats.runs++;
    profile.stats.totalScore += score;
    profile.stats.totalHeight += state.heightScore;
    if (completed) { profile.stats.wins++; if (state.mode === 'arcade') profile.stats.arcadeWins++; if (state.mode === 'challenge') profile.stats.challengeWins++; }
    else {
      profile.stats.deaths++;
      if (state.mode === 'challenge') profile.stats.challengeMisses++;
      if (reason === 'bird') profile.stats.birdDeaths++;
      else if (reason !== 'challenge-incomplete') profile.stats.fallDeaths++;
    }
    awardBadge('first-run');
    if (state.mode === 'arcade' && completed) awardBadge('arcade-complete');
    if (state.mode === 'challenge' && completed) awardBadge('challenge-complete');
    profile.tokens += state.tokens; saveProfile(); updateUpgradeUI(); updateRecordsUI();
    const resultDelay = completed ? config.victorySceneDurationMs : 2800;
    setTimeout(() => {
      const challenge = state.mode === 'challenge';
      ui.endHeading.textContent = completed ? (challenge ? 'Challenge complete!' : 'Arcade complete!') : (challenge && (reason === 'finish' || reason === 'challenge-incomplete') ? 'Challenge progress' : 'Run complete');
      ui.score.textContent = `Score ${score}`;
      ui.endBest.textContent = isNewBest ? 'New personal best!' : `Personal best · ${profile.bestScores[state.mode]}`;
      ui.runBreakdown.innerHTML = `<span><strong>${state.heightScore}</strong>Height</span><span><strong>${state.parshad}</strong>Parshad</span><span><strong>${state.tokens}</strong>Khanda earned</span>`;
      const challengeStars = Math.min(5, Math.floor(state.parshad / 10));
      ui.endGoal.textContent = state.mode === 'endless' ? 'Endless Run keeps going. Come back and beat your personal best.' : state.mode === 'hard' ? 'Hard Mode keeps climbing with only small moving and breakable platforms.' : challenge ? (completed ? 'You reached the finish with all 50 parshad bowls! ★★★★★' : `You collected ${state.parshad} of 50 parshad bowls · ${'★'.repeat(challengeStars)}${'☆'.repeat(5 - challengeStars)} ${challengeStars} / 5 stars`) : (completed ? 'You reached 1,000 and broke through the finish banner!' : 'Reach 1,000 points to break through the finish banner.');
      ui.end.classList.remove('hidden');
      requestAnimationFrame(() => ui.end.classList.add('visible'));
    }, resultDelay);
  }
  function triggerBirdHit(bird) {
    if (state.hitStop || state.ending) return;
    state.hitStop = { bird, type: state.invincibleTimer > 0 ? 'nishan' : profile.shield > 0 ? 'shield' : 'loss', started: lastTime, resolvesAt: lastTime + (profile.reducedMotion ? 750 : 1000) };
    state.message = state.hitStop.type === 'loss' ? 'BIRD HIT!' : 'BIRD BLOCKED!';
    state.messageTimer = 1.1;
    sound('hit');
  }
  function resolveBirdHit() {
    const hit = state.hitStop;
    if (!hit || lastTime < hit.resolvesAt) return false;
    state.hitStop = null; hit.bird.hit = true;
    if (hit.type === 'nishan') {
      profile.stats.birdsBlocked++; if (profile.stats.birdsBlocked >= 3) awardBadge('bird-defender'); sound('shield');
      state.message = 'Nishan boost protected you!'; state.messageTimer = 2;
    } else if (hit.type === 'shield') {
      profile.stats.birdsBlocked++; profile.stats.shieldsUsed++; if (profile.stats.birdsBlocked >= 3) awardBadge('bird-defender'); sound('shield');
      profile.shield--; state.invincibleTimer = 4; state.shieldVisualTimer = 4; state.upgradeEffect = { type: 'shield', started: lastTime }; saveProfile(); updateUpgradeUI(); state.message = 'Dhal Shield activated! 4 seconds protected.'; state.messageTimer = 2;
    } else { finish(false, 'bird'); return true; }
    return false;
  }
  function triggerFalconSave() {
    const p = state.player, platformW = 124, platformY = state.cameraY + H - 155;
    const platformX = Math.max(12, Math.min(W - platformW - 12, p.x - platformW / 2));
    const platform = { x: platformX, y: platformY, w: platformW, type: 'normal', speed: 0, dir: 1, broken: false, rescuePlatform: true };
    state.platforms.push(platform);
    state.falconRescue = { started: lastTime, duration: profile.reducedMotion ? 650 : 1100, pickupX: p.x, pickupY: p.y, platform };
    p.vx = 0; p.vy = 0; profile.falcon--; profile.stats.falconSaves++; state.falconUsed = true;
    state.upgradeEffect = { type: 'falcon', started: lastTime }; saveProfile(); updateUpgradeUI(); state.message = 'FALCON SAVE!'; state.messageTimer = 1.2; sound('save');
  }
  function updateFalconRescue() {
    const rescue = state.falconRescue;
    if (!rescue) return false;
    const elapsed = lastTime - rescue.started, progress = Math.min(1, elapsed / rescue.duration), p = state.player;
    if (progress < .55) { p.x = rescue.pickupX; p.y = rescue.pickupY; return true; }
    const carry = (progress - .55) / .45, targetX = rescue.platform.x + rescue.platform.w / 2, targetY = rescue.platform.y - p.h / 2;
    p.x = rescue.pickupX + (targetX - rescue.pickupX) * carry; p.y = rescue.pickupY + (targetY - rescue.pickupY) * carry;
    if (progress < 1) return true;
    p.x = targetX; p.y = targetY; p.vx = 0; p.vy = -config.baseJumpVelocity * (1 + profile.powerJump * .1); state.invincibleTimer = Math.max(state.invincibleTimer, 1.2); state.falconRescue = null;
    state.message = 'Back in the sky!'; state.messageTimer = 1.4;
    return false;
  }
  function update(dt) {
    if (!state.running || state.paused) return;
    if (state.falconRescue && updateFalconRescue()) return;
    if (state.hitStop) { if (resolveBirdHit()) return; if (state.hitStop) return; }
    const p = state.player;
    if (state.invincibleTimer > 0) state.invincibleTimer = Math.max(0, state.invincibleTimer - dt);
    if (state.shieldVisualTimer > 0) state.shieldVisualTimer = Math.max(0, state.shieldVisualTimer - dt);
    const keyboard = (keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0);
    if (pointerX !== null) {
      const desiredVelocity = Math.max(-config.pointerMaxHorizontalSpeed, Math.min(config.pointerMaxHorizontalSpeed, (pointerX - p.x) * config.pointerSteeringGain));
      p.vx += (desiredVelocity - p.vx) * Math.min(1, config.pointerSteeringResponse * dt);
    } else {
      p.vx += keyboard * config.keyboardAcceleration * dt;
      p.vx *= Math.pow(.0007, dt);
    }
    p.vx = Math.max(-config.maxHorizontalSpeed, Math.min(config.maxHorizontalSpeed, p.vx));
    if (Math.abs(p.vx) > 22) p.facing = Math.sign(p.vx);
    p.x += p.vx * dt;
    p.x = Math.max(p.w / 2, Math.min(W - p.w / 2, p.x)); p.vy += config.gravity * dt; p.y += p.vy * dt;
    for (const plat of state.platforms) {
      if (plat.type === 'moving') { plat.x += plat.dir * plat.speed * dt; if (plat.x < 6 || plat.x + plat.w > W - 6) plat.dir *= -1; }
      const top = plat.y;
      if (!plat.broken && p.vy > 0 && p.y + p.h / 2 >= top && p.y + p.h / 2 <= top + 25 && p.x + p.w / 2 > plat.x && p.x - p.w / 2 < plat.x + plat.w) {
        const jumpMultiplier = 1 + profile.powerJump * .1;
        p.y = top - p.h / 2; p.vy = -(plat.type === 'spring' ? config.springJumpVelocity : config.baseJumpVelocity) * jumpMultiplier;
        profile.stats.jumps++;
        sound(plat.type === 'break' ? 'break' : plat.type === 'spring' ? 'spring' : 'land');
        const landingColor = plat.type === 'spring' ? '#d5a5ff' : plat.type === 'break' ? '#c49464' : '#f7efd7';
        burst(p.x, top, landingColor, plat.type === 'spring' ? 26 : plat.type === 'break' ? 20 : 16);
        burst(p.x, top, '#fff9e8', plat.type === 'spring' ? 9 : 6);
        if (plat.type === 'break') plat.broken = true;
      }
    }
    const targetCamera = Math.min(state.cameraY, p.y - H * .38);
    state.cameraY += (targetCamera - state.cameraY) * Math.min(1, dt * 4);
    const currentHeight = Math.max(0, Math.floor((650 - p.y) / 18));
    if (currentHeight > state.heightScore) { state.heightScore = currentHeight; state.score = currentHeight + state.parshad * 3; }
    if (state.score >= 100) awardBadge('sky-starter');
    if (state.mode === 'endless' && state.score >= 1000) awardBadge('endless-1000');
    if (state.mode === 'endless' && state.score >= 2000) awardBadge('endless-2000');
    if (rules.isArcadeLike(state.mode)) {
      // A Challenge run with missed bowls reaches its course end directly,
      // rather than showing a victory banner that the player cannot earn.
      if (state.mode === 'challenge' && !rules.didWin('challenge', state.parshad) && state.score >= config.arcadeTargetScore - config.finishBannerLeadScore) {
        finish(false, 'challenge-incomplete');
        return;
      }
      if (!state.finishGate && state.score >= config.arcadeTargetScore - config.finishBannerLeadScore) {
        if (addFinishRunway()) { state.message = 'The finish banner is ahead!'; state.messageTimer = 2; }
      }
      if (state.finishGate && p.y <= state.finishGate.y) {
        state.finishGate.broken = true;
        state.score = Math.max(state.score, config.arcadeTargetScore);
        finish(rules.didWin(state.mode, state.parshad), 'finish');
        return;
      }
    }
    while (state.nextY > state.cameraY - 900 && (!state.finishGate || state.nextY > state.finishGate.y)) addPlatform();
    state.platforms = state.platforms.filter(o => o.y < state.cameraY + H + 100 && !o.broken);
    for (const c of state.collectibles) if (!c.taken && collide(p, c, c.challengeBowl ? 86 : 27)) { c.taken = true; if (c.type === 'token') { state.tokens++; profile.stats.tokens++; burst(c.x, c.y, '#f5cd57', 9); sound('token'); if (profile.stats.tokens >= 10) awardBadge('tokens-10'); } else { state.parshad++; profile.stats.parshad++; state.score += 3; burst(c.x, c.y, '#fff1a5', 8); sound('collect'); if (profile.stats.parshad >= 50) awardBadge('parshad-50'); } }
    state.collectibles = state.collectibles.filter(c => !c.taken && c.y < state.cameraY + H + 100);
    for (const power of state.powerups) if (!power.taken && collide(p, power, 30)) { power.taken = true; profile.stats.powerups++; burst(power.x, power.y, power.type === 'kara' ? '#f5cb58' : '#f1815a', 14); if (profile.stats.powerups >= 5) awardBadge('power-seeker'); sound('boost'); if (power.type === 'nishan') state.invincibleTimer = 5; p.vy = rules.boostVelocity(power.type, profile.powerJump); state.message = power.type === 'kara' ? 'Kara boost · one higher jump!' : 'Nishan boost · one jump + protection!'; state.messageTimer = 2; }
    state.powerups = state.powerups.filter(o => !o.taken && o.y < state.cameraY + H + 100);
    for (const bird of state.enemies) { if (bird.hit) continue; bird.x += bird.vx * dt; if (bird.x < 20 || bird.x > W - 20) bird.vx *= -1; if (collide(p, bird, 28)) triggerBirdHit(bird); }
    state.enemies = state.enemies.filter(o => o.y < state.cameraY + H + 100 && !o.hit);
    for (const particle of state.particles) { particle.x += particle.vx * dt; particle.y += particle.vy * dt; particle.vy += 360 * dt; particle.life -= dt; }
    state.particles = state.particles.filter(particle => particle.life > 0);
    // End the run as the character reaches the visible net, rather than after
    // they have already disappeared below the frame.
    if (p.y > state.cameraY + H - 52) {
      if (rules.canUseFalconSave(profile.falcon, state.falconUsed)) triggerFalconSave();
      else finish(false, 'fall');
    }
    state.messageTimer -= dt;
  }
  function drawBackdrop() {
    const backgroundImage = backgroundImages[state.background];
    if (backgroundImage.complete && backgroundImage.naturalWidth) {
      const sourceRatio = backgroundImage.naturalWidth / backgroundImage.naturalHeight;
      const targetRatio = W / H;
      if (targetRatio > sourceRatio) {
        const sourceHeight = backgroundImage.naturalWidth / targetRatio;
        const sourceY = (backgroundImage.naturalHeight - sourceHeight) / 2;
        ctx.drawImage(backgroundImage, 0, sourceY, backgroundImage.naturalWidth, sourceHeight, 0, 0, W, H);
      } else {
        const sourceWidth = backgroundImage.naturalHeight * targetRatio;
        const sourceX = (backgroundImage.naturalWidth - sourceWidth) / 2;
        ctx.drawImage(backgroundImage, sourceX, 0, sourceWidth, backgroundImage.naturalHeight, 0, 0, W, H);
      }
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
    for (let burst = 0; burst < 5; burst++) {
      const cx = 62 + burst * 92, cy = 115 + (burst % 3) * 70;
      const burstAge = Math.max(0, age - burst * .22);
      for (let spark = 0; spark < 14; spark++) {
        const angle = spark / 14 * Math.PI * 2 + burst;
        const distance = profile.reducedMotion ? 34 : 10 + ((burstAge * 82 + burst * 13) % 72);
        ctx.fillStyle = colors[(spark + burst) % colors.length];
        const fall = profile.reducedMotion ? 0 : Math.min(24, burstAge * burstAge * 3);
        ctx.fillRect(cx + Math.cos(angle) * distance - 3, cy + Math.sin(angle) * distance + fall - 3, 6, 6);
      }
    }
  }
  function drawCatchNet() {
    if (catchNetSprite.complete && catchNetSprite.naturalWidth) ctx.drawImage(catchNetSprite, -20, H - 186 + (profile.reducedMotion ? 0 : Math.sin(lastTime / 260) * 3), W + 40, 220);
    else { const netY = H - 22; ctx.strokeStyle = '#e5dac8'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(W / 2, netY - 26, 122, 0, Math.PI); ctx.stroke(); ctx.strokeStyle = '#c7b89e'; ctx.lineWidth = 2; for (let x = W / 2 - 105; x <= W / 2 + 105; x += 21) { ctx.beginPath(); ctx.moveTo(x, netY - 20); ctx.lineTo(W / 2, netY + 20); ctx.stroke(); } }
  }
  function drawUpgradeStatus() {
    const entries = [
      { icon: falconSaveSprite, value: `×${profile.falcon}`, active: profile.falcon > 0 },
      { icon: dhalShieldSprite, value: `×${profile.shield}`, active: profile.shield > 0 },
      { icon: null, value: `↑${profile.powerJump}`, active: profile.powerJump > 0 },
    ];
    let x = 17;
    for (const entry of entries) {
      ctx.fillStyle = entry.active ? '#fff9e8e8' : '#e7ded1cc'; ctx.fillRect(x, 66, 61, 25);
      ctx.strokeStyle = entry.active ? '#a85e30' : '#9b9387'; ctx.lineWidth = 1.5; ctx.strokeRect(x, 66, 61, 25);
      if (entry.icon?.complete && entry.icon.naturalWidth) ctx.drawImage(entry.icon, x + 3, 68, 21, 21);
      else { ctx.fillStyle = entry.active ? '#a85e30' : '#8d857b'; ctx.font = 'bold 17px "Trebuchet MS"'; ctx.textAlign = 'center'; ctx.fillText(entry.icon ? '✦' : '↑', x + 14, 84); }
      ctx.fillStyle = entry.active ? '#24483f' : '#756f67'; ctx.font = 'bold 12px "Trebuchet MS"'; ctx.textAlign = 'left'; ctx.fillText(entry.value, x + 27, 83);
      x += 66;
    }
  }
  // Native tablets can report mouse-like pointer capabilities even though they
  // use the same full-screen HUD as phones.
  const usesMobileHud = () => Boolean(nativePlatform) || window.matchMedia?.('(hover: none) and (pointer: coarse)').matches;
  function updateMobileHud() { if (!usesMobileHud() || !state?.running) { ui.mobileHud.classList.add('hidden'); return; } const name = state.mode === 'arcade' ? 'ARCADE' : state.mode === 'challenge' ? 'CHALLENGE' : state.mode === 'hard' ? 'HARD' : 'ENDLESS'; const detail = state.mode === 'challenge' ? `${state.parshad}/${config.challengeParshadTarget}` : state.mode === 'arcade' ? `${Math.floor(state.score)}/${config.arcadeTargetScore}` : 'CLIMB'; ui.mobileScore.textContent = `Score ${Math.floor(state.score)}`; ui.mobileItems.textContent = `Parshad ${state.parshad} · Khanda ${state.tokens}`; ui.mobileFalcon.textContent = profile.falcon; ui.mobileShield.textContent = profile.shield; ui.mobilePower.textContent = profile.powerJump; ui.mobileMode.textContent = `${name} · ${detail}`; ui.mobileHud.classList.remove('hidden'); }
  function drawUpgradeEffect() {
    const effect = state.upgradeEffect;
    if (!effect) return;
    const age = lastTime - effect.started;
    const duration = effect.type === 'falcon' ? 1100 : 950;
    if (age > duration) { state.upgradeEffect = null; return; }
    const alpha = Math.max(0, 1 - age / duration);
    const icon = effect.type === 'falcon' ? falconSaveSprite : dhalShieldSprite;
    const title = effect.type === 'falcon' ? 'FALCON SAVE!' : 'DHAL SHIELD!';
    ctx.save(); ctx.globalAlpha = alpha * .26; ctx.fillStyle = effect.type === 'falcon' ? '#f3b84e' : '#6ca0b5'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = alpha;
    if (icon.complete && icon.naturalWidth) ctx.drawImage(icon, W / 2 - 45, 136, 90, 90);
    ctx.fillStyle = '#fff9e8'; ctx.strokeStyle = '#24483f'; ctx.lineWidth = 4; ctx.font = '900 22px "Trebuchet MS"'; ctx.textAlign = 'center'; ctx.strokeText(title, W / 2, 244); ctx.fillText(title, W / 2, 244); ctx.restore();
  }
  function drawFalconRescue() {
    const rescue = state.falconRescue;
    if (!rescue) return;
    const progress = Math.min(1, (lastTime - rescue.started) / rescue.duration), pickupScreenY = worldToScreen(rescue.pickupY), targetX = rescue.platform.x + rescue.platform.w / 2, targetY = worldToScreen(rescue.platform.y - 48);
    let x, y;
    if (progress < .55) { const t = progress / .55; x = W + 68 + (rescue.pickupX - (W + 68)) * t; y = 54 + (pickupScreenY - 54) * t; }
    else { const t = (progress - .55) / .45; x = rescue.pickupX + (targetX - rescue.pickupX) * t; y = pickupScreenY + (targetY - pickupScreenY) * t; }
    const destinationX = progress < .55 ? rescue.pickupX : targetX;
    ctx.save(); ctx.translate(x, y); if (x > destinationX) ctx.scale(-1, 1); if (falconSaveSprite.complete && falconSaveSprite.naturalWidth) ctx.drawImage(falconSaveSprite, -64, -57, 128, 114); else { ctx.fillStyle = '#c88932'; ctx.beginPath(); ctx.ellipse(0, 0, 42, 22, 0, 0, Math.PI * 2); ctx.fill(); } ctx.restore();
  }
  function drawNetStars() {
    const centerX = W / 2, centerY = H - 164;
    ctx.save(); ctx.font = 'bold 20px "Trebuchet MS"'; ctx.textAlign = 'center';
    for (let star = 0; star < 3; star++) {
      const angle = profile.reducedMotion ? [-.8, .15, 1.1][star] : lastTime / 260 + star * Math.PI * 2 / 3;
      const x = centerX + Math.cos(angle) * 47, y = centerY + Math.sin(angle) * 20;
      ctx.fillStyle = star === 1 ? '#fff8d6' : '#f3c64d'; ctx.fillText('✦', x, y);
    }
    ctx.restore();
  }
  function drawLossTransition() {
    if (!state.ending || state.completed) return;
    const progress = Math.max(0, Math.min(1, (lastTime - state.winStarted - 2200) / 600));
    if (!progress) return;
    ctx.save();
    ctx.globalAlpha = progress * .82;
    ctx.fillStyle = '#fff7e7'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#dcefeb';
    const radius = 44 + progress * 185;
    [-18, W / 2, W + 18].forEach((x, index) => { ctx.beginPath(); ctx.arc(x, H / 2 + (index - 1) * 46, radius, 0, Math.PI * 2); ctx.fill(); });
    ctx.restore();
  }
  function drawWinTransition() {
    if (!state.ending || !state.completed) return;
    const fadeStart = config.victorySceneDurationMs - config.victoryFadeDurationMs;
    const progress = Math.max(0, Math.min(1, (lastTime - state.winStarted - fadeStart) / config.victoryFadeDurationMs));
    if (!progress) return;
    ctx.save(); ctx.globalAlpha = progress; ctx.fillStyle = '#fff7e7'; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  function draw() {
    if (!state) return; ctx.clearRect(0, 0, W, H); drawBackdrop();
    drawFireworks();
    if (state.finishGate && !state.finishGate.broken) { const gateY = worldToScreen(state.finishGate.y) + (profile.reducedMotion ? 0 : Math.sin(lastTime / 220) * 3); if (finishBannerSprite.complete && finishBannerSprite.naturalWidth) ctx.drawImage(finishBannerSprite, -16, gateY - 72, W + 32, 185); ctx.fillStyle = '#fff9e8'; ctx.font = 'bold 16px "Trebuchet MS"'; ctx.textAlign = 'center'; ctx.fillText('FINISH', W / 2, gateY + 2); }
    for (const plat of state.platforms) { const y = worldToScreen(plat.y); if (y < -30 || y > H + 40) continue;
      const sprite = platformSprites[plat.type] || platformSprite;
      if (sprite.complete && sprite.naturalWidth) ctx.drawImage(sprite, plat.x, y - 22, plat.w, 50);
      else { ctx.fillStyle = plat.type === 'break' ? '#b48d66' : plat.type === 'spring' ? '#7c5c9c' : '#477e55'; ctx.fillRect(plat.x, y, plat.w, 13); }
    }
    for (const particle of state.particles) { const alpha = Math.max(0, particle.life / particle.maxLife); ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = particle.color; ctx.fillRect(Math.round(particle.x - particle.size / 2), Math.round(worldToScreen(particle.y) - particle.size / 2), particle.size, particle.size); ctx.restore(); }
    for (const c of state.collectibles) { const y = worldToScreen(c.y); ctx.save(); ctx.translate(c.x, y); const glowPulse = profile.reducedMotion ? 0 : Math.sin(lastTime / 180) * 1.5; ctx.shadowColor = c.type === 'token' ? '#65d8ff' : '#ffd45c'; ctx.shadowBlur = 7 + glowPulse; if (c.type === 'token' && khandaTokenSprite.complete && khandaTokenSprite.naturalWidth) { ctx.drawImage(khandaTokenSprite, -19, -19, 38, 38); } else if (c.type === 'token') { ctx.fillStyle = '#e3a721'; ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff4b2'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('✦', 0, 5); } else if (parshadSprite.complete && parshadSprite.naturalWidth) { ctx.drawImage(parshadSprite, -27, -19, 54, 38); } else { ctx.shadowColor = '#fff3a6'; ctx.shadowBlur = 16; ctx.fillStyle = '#f6c879'; ctx.beginPath(); ctx.ellipse(0, 4, 15, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff0ae'; ctx.beginPath(); ctx.arc(-5, -4, 5, 0, Math.PI * 2); ctx.arc(4, -4, 5, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); }
    for (const o of state.powerups) { const y = worldToScreen(o.y); const sprite = powerupSprites[o.type]; if (sprite.complete && sprite.naturalWidth) ctx.drawImage(sprite, o.x - 25, y - 25, 50, 50); else { ctx.fillStyle = o.type === 'kara' ? '#d6a740' : '#ed7353'; ctx.beginPath(); ctx.arc(o.x, y, 15, 0, Math.PI * 2); ctx.fill(); } }
    for (const b of state.enemies) { const y = worldToScreen(b.y); const birdSprite = birdSprites[b.type] || birdSprites.pigeon; const frame = profile.reducedMotion ? 1 : Math.floor((lastTime / 100 + b.flapOffset) % 3); const isHit = state.hitStop?.bird === b; if (birdSprite.complete && birdSprite.naturalWidth) { const frameWidth = birdSprite.naturalWidth / 3; ctx.save(); ctx.translate(b.x, y); if (isHit && !profile.reducedMotion) ctx.globalAlpha = Math.floor(lastTime / 85) % 2 ? .34 : 1; if (b.vx < 0) ctx.scale(-1, 1); ctx.drawImage(birdSprite, frame * frameWidth, 0, frameWidth, birdSprite.naturalHeight, -35, -28, 70, 56); ctx.restore(); } else { ctx.fillStyle = '#42546c'; ctx.beginPath(); ctx.ellipse(b.x, y, 19, 11, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#1f344a'; ctx.beginPath(); ctx.moveTo(b.x - 4, y); ctx.lineTo(b.x - 31, y - 15); ctx.lineTo(b.x - 19, y + 9); ctx.fill(); ctx.fillStyle = '#f2ba4a'; ctx.beginPath(); ctx.moveTo(b.x + 18, y); ctx.lineTo(b.x + 30, y + 3); ctx.lineTo(b.x + 18, y + 6); ctx.fill(); } if (isHit) { ctx.save(); ctx.fillStyle = state.hitStop.type === 'loss' ? '#e45d43' : '#f4ca4a'; ctx.font = '900 28px "Trebuchet MS"'; ctx.textAlign = 'center'; ctx.fillText('✦', b.x - 24, y - 28); ctx.fillText('✦', b.x + 25, y - 17); ctx.restore(); } }
    drawCatchNet();
    const p = state.player, py = worldToScreen(p.y);
    const isNetLanding = state.ending && !state.completed && (state.endReason === 'fall' || state.endReason === 'bird');
    if (isNetLanding) {
      const landingSprite = netLandingSprites[p.character];
      if (landingSprite.complete && landingSprite.naturalWidth) ctx.drawImage(landingSprite, W / 2 - 74, H - 177, 148, 148);
      else { ctx.fillStyle = '#24483f'; ctx.font = 'bold 18px "Trebuchet MS"'; ctx.textAlign = 'center'; ctx.fillText('Oh man!', W / 2, H - 98); }
      drawNetStars();
    } else {
    const isFalling = p.vy > 30 || state.ending;
    const playerSprite = playerSprites[p.character][isFalling ? 'fall' : 'jump'];
    const tilt = isFalling ? Math.max(-.12, Math.min(.12, p.vx / 1300)) : Math.max(-.055, Math.min(.055, p.vx / 4200));
    const bob = isFalling || profile.reducedMotion ? 0 : Math.sin(lastTime / 85) * 1.25;
    ctx.save(); ctx.translate(p.x, py + bob); ctx.rotate(tilt); ctx.scale(p.facing, 1); if (state.invincibleTimer > 0 && !profile.reducedMotion && Math.floor(lastTime / 105) % 2) ctx.globalAlpha = .48;
    if (playerSprite.complete && playerSprite.naturalWidth) {
      // The source has transparent padding; these bounds align its visible feet
      // with the collision body while preserving a crisp, readable silhouette.
      ctx.drawImage(playerSprite, -34, -60, 68, 102);
    } else {
      ctx.fillStyle = p.character === 'girl' ? '#d46686' : '#477e55'; ctx.beginPath(); ctx.arc(0, -15, 16, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#a96942'; ctx.beginPath(); ctx.arc(0, -8, 12, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#324e3d'; ctx.fillRect(-11, 1, 22, 26); ctx.fillStyle = '#f6d4b0'; ctx.fillRect(-18, 5, 8, 20); ctx.fillRect(10, 5, 8, 20);
    }
    if ((profile.shield > 0 || state.shieldVisualTimer > 0) && dhalShieldSprite.complete && dhalShieldSprite.naturalWidth) ctx.drawImage(dhalShieldSprite, 6, -14, 39, 39);
    ctx.restore();
    }
    drawFalconRescue();
    if (state.running || state.ending) {
      updateMobileHud(); if (usesMobileHud()) { drawUpgradeEffect(); drawLossTransition(); drawWinTransition(); return; }
      ctx.fillStyle = '#24483f'; ctx.font = 'bold 18px "Trebuchet MS"'; ctx.textAlign = 'left'; ctx.fillText(`Score ${Math.floor(state.score)}`, 18, 31); ctx.font = 'bold 13px "Trebuchet MS"'; ctx.fillText(`Parshad ${state.parshad}  ·  Khanda ${state.tokens}`, 18, 52);
      drawUpgradeStatus();
      const modeName = state.mode === 'arcade' ? 'ARCADE MODE' : state.mode === 'challenge' ? 'CHALLENGE MODE' : state.mode === 'hard' ? 'HARD MODE' : 'ENDLESS RUN';
      const modeDetail = state.mode === 'arcade' ? `${Math.floor(state.score)} / ${config.arcadeTargetScore}` : state.mode === 'challenge' ? `${state.parshad} / ${config.challengeParshadTarget} BOWLS` : 'KEEP CLIMBING';
      ctx.fillStyle = '#fff8e9e8'; ctx.fillRect(W / 2 - 80, H - 55, 160, 38);
      ctx.strokeStyle = state.mode === 'challenge' ? '#b56b2e' : state.mode === 'arcade' ? '#d56d39' : state.mode === 'hard' ? '#9c4825' : '#527165'; ctx.lineWidth = 2;
      ctx.strokeRect(W / 2 - 80, H - 55, 160, 38);
      ctx.textAlign = 'center'; ctx.fillStyle = '#24483f'; ctx.font = 'bold 11px "Trebuchet MS"'; ctx.fillText(`${modeName} · ${modeDetail}`, W / 2, H - 31);
      if (state.messageTimer > 0) { ctx.textAlign = 'center'; ctx.fillStyle = '#24483f'; ctx.font = 'bold 15px "Trebuchet MS"'; ctx.fillText(state.message, W / 2, 120); }
    }
    drawUpgradeEffect();
    drawLossTransition();
    drawWinTransition();
  }
  function loop(time) { const dt = Math.min(.04, (time - lastTime) / 1000 || 0); lastTime = time; update(dt); draw(); requestAnimationFrame(loop); }
  function setSelectedCharacter(character) {
    selectedCharacter = character;
    profile.character = character;
    saveProfile();
    ui.choices.forEach(button => button.classList.toggle('selected', button.dataset.character === character));
    ui.choices.forEach(button => button.setAttribute('aria-pressed', button.dataset.character === character));
    ui.sceneGirl.classList.toggle('selected', character === 'girl');
    ui.sceneBoy.classList.toggle('selected', character === 'boy');
  }
  ui.choices.forEach(button => button.addEventListener('click', () => { setSelectedCharacter(button.dataset.character); sound('ui'); }));
  const TUTORIAL_STEPS = [
    { icon: '↔', title: 'Guide your jumper', copy: 'Drag anywhere across the game to move left and right while your jumper bounces automatically.' },
    { icon: '✦', title: 'Land and collect', copy: 'Land on platforms, collect glowing parshad bowls for score, and earn Khanda tokens for upgrades.' },
    { icon: '☂', title: 'Watch for birds', copy: 'Avoid birds, use boosts when you find them, and keep climbing. Your first run starts now!' },
  ];
  function renderTutorial() {
    const step = TUTORIAL_STEPS[tutorialIndex];
    ui.tutorialIcon.textContent = step.icon; ui.tutorialHeading.textContent = step.title; ui.tutorialCopy.textContent = step.copy;
    ui.tutorialStep.textContent = `${tutorialIndex + 1} of ${TUTORIAL_STEPS.length}`;
    ui.tutorialDots.querySelectorAll('span').forEach((dot, index) => dot.classList.toggle('active', index === tutorialIndex));
    ui.tutorialNext.textContent = tutorialIndex === TUTORIAL_STEPS.length - 1 ? 'Let’s jump!' : 'Next';
  }
  function showTutorial() {
    tutorialIndex = 0; tutorialResumesRun = Boolean(state?.running); if (state?.running) state.paused = true;
    ui.home.classList.add('hidden'); ui.end.classList.add('hidden'); ui.upgrades.classList.add('hidden'); ui.about.classList.add('hidden'); ui.badges.classList.add('hidden'); ui.stats.classList.add('hidden'); ui.settings.classList.add('hidden'); ui.pause.classList.add('hidden'); ui.gameTools.classList.add('hidden');
    renderTutorial(); ui.tutorial.classList.remove('hidden');
  }
  function finishTutorial() {
    profile.tutorialComplete = true;
    saveProfile(); ui.tutorial.classList.add('hidden');
    if (tutorialResumesRun && state) { state.paused = false; startAudio(); ui.gameTools.classList.remove('hidden'); }
    else showHome();
  }
  function openSettings(from) { settingsReturn = from; if (from === 'pause') ui.pause.classList.add('hidden'); else ui.home.classList.add('hidden'); ui.settings.classList.remove('hidden'); }
  function closeSettings() { ui.settings.classList.add('hidden'); if (settingsReturn === 'pause' && state?.paused) ui.pause.classList.remove('hidden'); else ui.home.classList.remove('hidden'); }
  function leaveRunEarly() { if (state?.running && state.paused && !state.ending) { profile.stats.leftEarly++; saveProfile(); } showHome(); }
  function restartPausedRun() { const mode = state?.mode || 'endless'; leaveRunEarly(); start(mode); }
  function start(mode) { getAudio(); reset(mode); ui.home.classList.add('hidden'); ui.end.classList.add('hidden'); ui.end.classList.remove('visible'); ui.upgrades.classList.add('hidden'); ui.about.classList.add('hidden'); ui.privacy.classList.add('hidden'); ui.badges.classList.add('hidden'); ui.stats.classList.add('hidden'); ui.settings.classList.add('hidden'); ui.resetConfirm.classList.add('hidden'); ui.exitConfirm.classList.add('hidden'); ui.pause.classList.add('hidden'); if (!profile.tutorialComplete) return showTutorial(); startAudio(); ui.tutorial.classList.add('hidden'); ui.gameTools.classList.remove('hidden'); }
  function showHome() { pointerX = null; keys.clear(); if (state) state.running = false; stopMusic(); ui.mobileHud.classList.add('hidden'); updateRecordsUI(); ui.home.classList.remove('hidden'); ui.end.classList.add('hidden'); ui.end.classList.remove('visible'); ui.upgrades.classList.add('hidden'); ui.about.classList.add('hidden'); ui.privacy.classList.add('hidden'); ui.badges.classList.add('hidden'); ui.stats.classList.add('hidden'); ui.tutorial.classList.add('hidden'); ui.settings.classList.add('hidden'); ui.resetConfirm.classList.add('hidden'); ui.exitConfirm.classList.add('hidden'); ui.pause.classList.add('hidden'); ui.gameTools.classList.add('hidden'); }
  function showUpgrades() { pointerX = null; keys.clear(); if (state) state.running = false; stopMusic(); updateUpgradeUI(); ui.home.classList.add('hidden'); ui.end.classList.add('hidden'); ui.upgrades.classList.remove('hidden'); ui.about.classList.add('hidden'); ui.badges.classList.add('hidden'); ui.stats.classList.add('hidden'); ui.settings.classList.add('hidden'); ui.pause.classList.add('hidden'); ui.gameTools.classList.add('hidden'); }
  function showAbout() { pointerX = null; keys.clear(); if (state) state.running = false; stopMusic(); ui.home.classList.add('hidden'); ui.end.classList.add('hidden'); ui.upgrades.classList.add('hidden'); ui.about.classList.remove('hidden'); ui.privacy.classList.add('hidden'); ui.badges.classList.add('hidden'); ui.stats.classList.add('hidden'); ui.settings.classList.add('hidden'); ui.pause.classList.add('hidden'); ui.gameTools.classList.add('hidden'); }
  function showPrivacy() { ui.about.classList.add('hidden'); ui.privacy.classList.remove('hidden'); }
  function openExitConfirm() { ui.exitConfirm.classList.remove('hidden'); }
  function closeExitConfirm() { ui.exitConfirm.classList.add('hidden'); }
  function handleNativeBack() { if (!ui.exitConfirm.classList.contains('hidden')) return closeExitConfirm(); if (!ui.home.classList.contains('hidden')) return exitNativeApp(); if (state?.running && !state.paused) pauseGame(); openExitConfirm(); }
  function exitNativeApp() { const app = window.Capacitor?.Plugins?.App; if (app?.exitApp) app.exitApp(); else window.close(); }
  function showBadges() { renderBadges(); ui.home.classList.add('hidden'); ui.badges.classList.remove('hidden'); ui.stats.classList.add('hidden'); }
  function showStats() { renderStats(); ui.home.classList.add('hidden'); ui.badges.classList.add('hidden'); ui.stats.classList.remove('hidden'); }
  function pauseGame() { if (!state?.running || state.ending) return; pointerX = null; keys.clear(); state.paused = true; stopMusic(); ui.pause.classList.remove('hidden'); }
  function resumeGame() { if (!state?.paused || state.ending) return; state.paused = false; ui.pause.classList.add('hidden'); if (profile.music) startAudio(); }
  function buyUpgrade(type) {
    const costs = { falcon: 8, shield: 10, powerJump: config.powerJumpCosts[profile.powerJump] };
    if (type === 'powerJump' && profile.powerJump >= 5) return updateUpgradeUI('Power Jump is already at its maximum level.');
    const cost = costs[type];
    if (profile.tokens < cost) return updateUpgradeUI(`You need ${cost - profile.tokens} more Khanda tokens.`);
    profile.tokens -= cost; profile[type]++; saveProfile(); sound('purchase'); updateUpgradeUI('Upgrade purchased!');
  }
  ui.modeChoices.forEach(button => button.addEventListener('click', () => start(button.dataset.mode)));
  ui.restart.addEventListener('click', () => start(state?.mode || 'endless'));
  ui.openUpgrades.addEventListener('click', showUpgrades); ui.endUpgrades.addEventListener('click', showUpgrades); ui.endHome.addEventListener('click', showHome); ui.closeUpgrades.addEventListener('click', showHome); ui.openAbout.addEventListener('click', showAbout); ui.closeAbout.addEventListener('click', showHome); ui.openPrivacy.addEventListener('click', showPrivacy); ui.closePrivacy.addEventListener('click', showAbout); ui.confirmExit.addEventListener('click', exitNativeApp); ui.cancelExit.addEventListener('click', closeExitConfirm); ui.openBadges.addEventListener('click', showBadges); ui.closeBadges.addEventListener('click', showHome); ui.openStats.addEventListener('click', showStats); ui.closeStats.addEventListener('click', showHome); ui.openSettings.addEventListener('click', () => openSettings('home')); ui.pauseSettings.addEventListener('click', () => openSettings('pause')); ui.closeSettings.addEventListener('click', closeSettings); ui.replayTutorial.addEventListener('click', showTutorial); ui.resetProgress.addEventListener('click', requestResetProgress); ui.confirmReset.addEventListener('click', resetAllProgress); ui.cancelReset.addEventListener('click', cancelResetProgress);
  ui.buyFalcon.addEventListener('click', () => buyUpgrade('falcon')); ui.buyShield.addEventListener('click', () => buyUpgrade('shield')); ui.buyPower.addEventListener('click', () => buyUpgrade('powerJump'));
  ui.pauseButton.addEventListener('click', pauseGame); ui.resume.addEventListener('click', resumeGame); ui.pauseRestart.addEventListener('click', restartPausedRun); ui.pauseHome.addEventListener('click', leaveRunEarly);
  ui.musicToggle.addEventListener('change', () => { profile.music = ui.musicToggle.checked; saveProfile(); if (profile.music && !state?.paused) startAudio(); else setMusic(); });
  ui.soundToggle.addEventListener('change', () => { profile.sound = ui.soundToggle.checked; saveProfile(); });
  ui.reducedMotionToggle.addEventListener('change', () => { profile.reducedMotion = ui.reducedMotionToggle.checked; document.documentElement.classList.toggle('reduced-motion', profile.reducedMotion); saveProfile(); });
  ui.tutorialNext.addEventListener('click', () => { if (tutorialIndex < TUTORIAL_STEPS.length - 1) { tutorialIndex++; renderTutorial(); sound('ui'); } else finishTutorial(); });
  ui.tutorialSkip.addEventListener('click', finishTutorial);
  canvas.addEventListener('pointerdown', e => { pointerX = (e.offsetX / canvas.clientWidth) * W; canvas.setPointerCapture?.(e.pointerId); });
  canvas.addEventListener('pointermove', e => { if (e.buttons) pointerX = (e.offsetX / canvas.clientWidth) * W; });
  canvas.addEventListener('pointerup', () => { pointerX = null; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (state?.paused) resumeGame(); else pauseGame(); e.preventDefault(); return; } if (['ArrowLeft', 'ArrowRight'].includes(e.key)) { keys.add(e.key); e.preventDefault(); } }); document.addEventListener('keyup', e => keys.delete(e.key));
  window.sevaJumpNativeBack = handleNativeBack; window.Capacitor?.Plugins?.App?.addListener?.('backButton', handleNativeBack); applyPreferences(); setSelectedCharacter(selectedCharacter); reset(); state.running = false; updateUpgradeUI(); updateRecordsUI(); renderBadges(); renderStats(); requestAnimationFrame(loop);
  if ('serviceWorker' in navigator && location.protocol !== 'file:') window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
})();
