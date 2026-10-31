(() => {
  const i18n = globalThis.SevaI18n;
  const t = (key, params) => i18n.t(key, params);
  const canvasFont = (size, weight = 'bold') => `${weight} ${size}px ${i18n.fontFamily}`;
  let storageWarningId = 'game.storage.unavailable', upgradeMessageId = '', upgradeMessageParams = {}, activeBadge = null, infoContent = null;
  const canvas = document.querySelector('#game');
  const nativePlatform = window.Capacitor?.isNativePlatform?.()
    || ['android', 'ios'].includes(window.Capacitor?.getPlatform?.())
    || /\bwv\b/.test(navigator.userAgent);
  document.documentElement.classList.toggle('native-app', Boolean(nativePlatform));
  const androidPlatform = window.Capacitor?.getPlatform?.() === 'android'
    || Boolean(window.SevaJumpAndroid) || /\bwv\b/.test(navigator.userAgent);
  document.documentElement.classList.toggle('android-app', androidPlatform);
  const reviewUrl = (window.Capacitor?.getPlatform?.() === 'android' || Boolean(window.SevaJumpAndroid)) ? 'https://play.google.com/store/apps/details?id=org.sevajump.game'
    : window.Capacitor?.getPlatform?.() === 'ios' ? 'https://apps.apple.com/app/id6822047487?action=write-review' : null;
  for (const link of document.querySelectorAll('[data-store-review]')) {
    if (!reviewUrl) continue;
    link.href = reviewUrl;
    link.classList.remove('hidden');
    link.addEventListener('click', event => {
      if (androidPlatform && window.SevaJumpAndroid?.openStoreReview) {
        event.preventDefault();
        window.SevaJumpAndroid.openStoreReview();
      }
    });
  }
  function setNativeGameplayActive(active) {
    window.SevaJumpAndroid?.setGameplayActive?.(Boolean(active));
  }
  const nativeTablet = Boolean(nativePlatform) && Math.min(window.innerWidth, window.innerHeight) >= 700;
  const androidTablet = androidPlatform && Math.min(window.innerWidth, window.innerHeight) >= 600;
  document.documentElement.classList.toggle('android-tablet', androidTablet);
  if (androidTablet) {
    canvas.width = globalThis.SEVA_RULES.androidTabletCanvasWidth(window.innerWidth, window.innerHeight);
    document.documentElement.style.setProperty('--android-canvas-ratio', canvas.width / canvas.height);
  } else if (nativeTablet) canvas.width = 640;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    const warning = document.querySelector('#canvas-warning');
    warning.textContent = t('game.canvas.unavailable');
    i18n.onChange(() => { warning.textContent = t('game.canvas.unavailable'); });
    warning.classList.remove('hidden');
    document.querySelectorAll('.mode-actions button').forEach(button => { button.disabled = true; });
    return;
  }
  // Source art is larger than its gameplay footprint; filter downsampling so
  // thin outlines and emblem details do not break into isolated pixels.
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  const W = canvas.width, H = canvas.height;
  const config = globalThis.SEVA_CONFIG;
  const rules = globalThis.SEVA_RULES;
  let menuDirty = true, menuVisible = true;
  let gamepadSteer = 0, gamepadButtons = { a: false, pause: false }, gamepadFocused = true;
  const ui = {
    runUpgrades: document.querySelector("#run-upgrades-screen"),
    home: document.querySelector('#home-screen'), end: document.querySelector('#end-screen'), upgrades: document.querySelector('#upgrades-screen'), about: document.querySelector('#about-screen'), tutorial: document.querySelector('#tutorial-screen'), tutorialIcon: document.querySelector('#tutorial-icon'), tutorialStep: document.querySelector('#tutorial-step'), tutorialHeading: document.querySelector('#tutorial-heading'), tutorialCopy: document.querySelector('#tutorial-copy'), tutorialKeyboard: document.querySelector('#tutorial-keyboard'), tutorialDots: document.querySelector('#tutorial-dots'), tutorialNext: document.querySelector('#tutorial-next-button'), tutorialSkip: document.querySelector('#tutorial-skip-button'), pause: document.querySelector('#pause-screen'), gameTools: document.querySelector('#game-tools'), mobileHud: document.querySelector('#mobile-hud'), mobileScore: document.querySelector('#mobile-score'), mobileItems: document.querySelector('#mobile-items'), mobileMode: document.querySelector('#mobile-mode'), mobileFalcon: document.querySelector('#mobile-falcon'), mobileShield: document.querySelector('#mobile-shield'), mobilePower: document.querySelector('#mobile-power'),
    score: document.querySelector('#end-score'), endHeading: document.querySelector('#end-heading'), endBest: document.querySelector('#end-best'), runBreakdown: document.querySelector('#run-breakdown'), endGoal: document.querySelector('#end-goal'), homeRecords: document.querySelector('#home-records'), endless: document.querySelector('#endless-button'), arcade: document.querySelector('#arcade-button'), challenge: document.querySelector('#challenge-button'), hard: document.querySelector('#hard-button'), modeChoices: document.querySelectorAll('.mode-actions button'),
    restart: document.querySelector('#restart-button'), choices: document.querySelectorAll('.scene-character'),
    sceneGirl: document.querySelector('.scene-girl'), sceneBoy: document.querySelector('.scene-boy'),
    openUpgrades: document.querySelector('#open-upgrades-button'), closeUpgrades: document.querySelector('#close-upgrades-button'),
    endHome: document.querySelector('#end-home-button'), endUpgrades: document.querySelector('#end-upgrades-button'),
    wallet: document.querySelector('#wallet-count'), upgradeMessage: document.querySelector('#upgrade-message'),
    falconOwned: document.querySelector('#falcon-owned'), shieldOwned: document.querySelector('#shield-owned'), powerOwned: document.querySelector('#power-owned'),
    buyFalcon: document.querySelector('#buy-falcon'), buyShield: document.querySelector('#buy-shield'), buyPower: document.querySelector('#buy-power'),
    openAbout: document.querySelector('#open-about-button'), closeAbout: document.querySelector('#close-about-button'), openPrivacy: document.querySelector('#open-privacy-button'), closePrivacy: document.querySelector('#close-privacy-button'), privacy: document.querySelector('#privacy-screen'), exitConfirm: document.querySelector('#exit-confirm-screen'), confirmExit: document.querySelector('#confirm-exit-button'), cancelExit: document.querySelector('#cancel-exit-button'), openSettings: document.querySelector('#open-settings-button'), closeSettings: document.querySelector('#close-settings-button'), pauseSettings: document.querySelector('#pause-settings-button'), resetProgress: document.querySelector('#reset-progress-button'), resetConfirm: document.querySelector('#reset-confirm-screen'), confirmReset: document.querySelector('#confirm-reset-button'), cancelReset: document.querySelector('#cancel-reset-button'), settings: document.querySelector('#settings-screen'), openBadges: document.querySelector('#open-badges-button'), closeBadges: document.querySelector('#close-badges-button'), badges: document.querySelector('#badges-screen'), badgeCount: document.querySelector('#badge-count'), badgeGrid: document.querySelector('#badge-grid'), badgeToast: document.querySelector('#badge-toast'), badgeToastIcon: document.querySelector('#badge-toast-icon'), badgeToastName: document.querySelector('#badge-toast-name'), openStats: document.querySelector('#open-stats-button'), closeStats: document.querySelector('#close-stats-button'), stats: document.querySelector('#stats-screen'), statsSummary: document.querySelector('#stats-summary'), deathBreakdown: document.querySelector('#death-breakdown'),
    musicToggle: document.querySelector('#music-toggle'), soundToggle: document.querySelector('#sound-toggle'), reducedMotionToggle: document.querySelector('#reduced-motion-toggle'), helpingHandToggle: document.querySelector('#helping-hand-toggle'), musicStyleSelect: document.querySelector('#music-style-select'), helpingHandInfo: document.querySelector('#helping-hand-info'), reducedMotionInfo: document.querySelector('#reduced-motion-info'), helpingHandNote: document.querySelector('#helping-hand-note'), reducedMotionNote: document.querySelector('#reduced-motion-note'), infoScreen: document.querySelector('#info-screen'), infoHeading: document.querySelector('#info-heading'), infoBody: document.querySelector('#info-body'), closeInfo: document.querySelector('#close-info-button'), musicPreview: document.querySelector('#music-preview-button'), replayTutorial: document.querySelector('#replay-tutorial-button'),
    pauseButton: document.querySelector('#pause-button'), resume: document.querySelector('#resume-button'), pauseRestart: document.querySelector('#pause-restart-button'), pauseHome: document.querySelector('#pause-home-button'),
  };
  const palette = ['#bce7ef', '#f8d9a7', '#c9e5c0', '#e5c4d6'];
  const backgroundImages = ['assets/gurdwara-courtyard-pixel-v1.png', 'assets/gurdwara-sunset-pixel-v1.png', 'assets/gurdwara-dawn-pixel-v1.png'].map(src => { const image = new Image(); image.src = src; return image; });
  const playerSheets = { girl: new Image(), boy: new Image() };
  // Explicit rectangles preserve complete feet where artwork crosses a grid edge.
  // All poses use one scale, rather than stretching each silhouette to fit a box.
  const playerFrames = {
    jump: [80, 0, 360, 545], fall: [545, 0, 450, 512],
    net: [1080, 65, 390, 465], push: [70, 565, 395, 445], apex: [565, 512, 410, 505],
  };
  function drawPlayerPose(context, character, pose, x, bottom, scale) {
    const sheet = playerSheets[character];
    if (!sheet.complete || !sheet.naturalWidth) return false;
    const [sx, sy, width, height] = playerFrames[pose];
    context.save();
    context.translate(x, bottom);
    // Mirror the boy's base pose; movement-facing remains an independent transform.
    context.scale(character === 'boy' ? -1 : 1, 1);
    context.drawImage(sheet, sx, sy, width, height, -width * scale / 2, -height * scale, width * scale, height * scale);
    context.restore();
    return true;
  }
  for (const character of ['girl', 'boy']) {
    playerSheets[character].src = `assets/player-${character}-poses-v2.png`;
  }
  const platformSprite = new Image();
  platformSprite.src = 'assets/platform-grass-pixel-v1.png';
  const springPlatformSprite = new Image();
  springPlatformSprite.src = 'assets/platform-spring-pixel-v1.png';
  const breakPlatformSprite = new Image();
  breakPlatformSprite.src = 'assets/platform-break-wood-pixel-v1.png';
  const movingPlatformSprite = new Image();
  movingPlatformSprite.src = 'assets/platform-moving-pixel-v1.png';
  const platformSprites = { normal: platformSprite, spring: springPlatformSprite, break: breakPlatformSprite, moving: movingPlatformSprite };
  const collectibleGlows = {};
  function glowSprite(sprite, color, w, h, angle = 0) {
    const buffer = document.createElement('canvas'); buffer.width = w + 24; buffer.height = h + 24;
    const glow = buffer.getContext('2d'); glow.imageSmoothingEnabled = true; glow.imageSmoothingQuality = 'high'; glow.shadowColor = color; glow.shadowBlur = 8;
    glow.translate(buffer.width / 2, buffer.height / 2);
    if (angle) {
      // Orthographic Y-axis turn: the face narrows while the gold edge remains.
      const face = Math.abs(Math.cos(angle));
      glow.fillStyle = '#e8a323'; glow.beginPath();
      glow.ellipse(0, 0, Math.max(2, w * face / 2), h * .47, 0, 0, Math.PI * 2); glow.fill();
      glow.scale(Math.max(.02, face), 1);
    }
    glow.drawImage(sprite, -w / 2, -h / 2, w, h);
    return buffer;
  }
  const parshadSprite = new Image();
  parshadSprite.onload = () => { collectibleGlows.parshad = glowSprite(parshadSprite, '#ffd45c', 54, 38); menuDirty = true; };
  parshadSprite.src = 'assets/parshad-bowl-pixel-v3.png';
  const khandaTokenSprite = new Image();
  khandaTokenSprite.onload = () => {
    // Derive every frame from one master: the emblem cannot drift between poses.
    collectibleGlows.token = Array.from({ length: 24 }, (_, frame) =>
      glowSprite(khandaTokenSprite, '#65d8ff', 38, 38, frame * Math.PI / 12));
    menuDirty = true;
  };
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
  const powerJumpSprite = new Image();
  powerJumpSprite.src = 'assets/power-jump-upgrade-v1.png';
  const falconSaveSprite = new Image();
  falconSaveSprite.src = 'assets/falcon-save-pixel-v1.png';
  const finishBannerSprite = new Image();
  finishBannerSprite.src = 'assets/finish-banner-hover-pixel-v1.png';
  // An idle menu needs one fresh frame when an asynchronously loaded sprite
  // replaces a fallback. Keep the normal frame loop idle after that repaint.
  [...backgroundImages, ...Object.values(playerSheets), ...Object.values(platformSprites), ...Object.values(birdSprites), ...Object.values(powerupSprites), catchNetSprite, dhalShieldSprite, powerJumpSprite, falconSaveSprite, finishBannerSprite].forEach(sprite => sprite.addEventListener('load', () => { menuDirty = true; }));
  // Approximate progression from early milestones to demanding run achievements.
  const BADGES = [
    { id: 'first-run', icon: '✦', title: 'game.badge.first-run.title', description: 'game.badge.first-run.description', color: '#d56d39' },
    { id: 'sky-starter', icon: '☁', title: 'game.badge.sky-starter.title', description: 'game.badge.sky-starter.description', color: '#4e98c7' },
    { id: 'power-seeker', icon: '⚡', title: 'game.badge.power-seeker.title', description: 'game.badge.power-seeker.description', color: '#b65e45' },
    { id: 'parshad-50', icon: '◉', title: 'game.badge.parshad-50.title', description: 'game.badge.parshad-50.description', color: '#c88932' },
    { id: 'tokens-10', icon: '◇', title: 'game.badge.tokens-10.title', description: 'game.badge.tokens-10.description', color: '#5d7c94' },
    { id: 'bird-defender', icon: '◒', title: 'game.badge.bird-defender.title', description: 'game.badge.bird-defender.description', color: '#5476a8' },
    { id: 'boost-master', icon: '⚡', title: 'game.badge.boost-master.title', description: 'game.badge.boost-master.description', color: '#8553a1' },
    { id: 'arcade-complete', icon: '⚑', title: 'game.badge.arcade-complete.title', description: 'game.badge.arcade-complete.description', color: '#9b597e' },
    { id: 'endless-1000', icon: '∞', title: 'game.badge.endless-1000.title', description: 'game.badge.endless-1000.description', color: '#477e55' },
    { id: 'comeback-kid', icon: '↟', title: 'game.badge.comeback-kid.title', description: 'game.badge.comeback-kid.description', color: '#b66a34' },
    { id: 'both-feet-in', icon: '↔', title: 'game.badge.both-feet-in.title', description: 'game.badge.both-feet-in.description', color: '#397e79' },
    { id: 'challenge-complete', icon: '◎', title: 'game.badge.challenge-complete.title', description: 'game.badge.challenge-complete.description', color: '#b56b2e' },
    { id: 'endless-2000', icon: '★', title: 'game.badge.endless-2000.title', description: 'game.badge.endless-2000.description', color: '#a85e30' },
    { id: 'perfect-arcade', icon: '★', title: 'game.badge.perfect-arcade.title', description: 'game.badge.perfect-arcade.description', color: '#b27b19' },
  ];
  const defaultProfile = { tokens: 0, falcon: 0, shield: 0, powerJump: 0, character: 'girl', tutorialComplete: false, music: true, musicStyle: 'varied', sound: true, helpingHand: true, reducedMotion: Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches), bestScores: { endless: 0, arcade: 0, challenge: 0, hard: 0 }, badges: {}, stats: { runs: 0, wins: 0, arcadeWins: 0, arcadeWinsGirl: 0, arcadeWinsBoy: 0, challengeWins: 0, leftEarly: 0, deaths: 0, fallDeaths: 0, birdDeaths: 0, challengeMisses: 0, jumps: 0, totalScore: 0, totalHeight: 0, parshad: 0, tokens: 0, powerups: 0, birdsSeen: 0, birdsBlocked: 0, falconSaves: 0, shieldsUsed: 0 } };
  const profileStorageKey = 'seva-jump-profile';
  let storageAvailable = true;
  function freshProfile() { return { ...defaultProfile, bestScores: { ...defaultProfile.bestScores }, badges: {}, runUpgrades: { falcon: true, shield: true, powerJump: true }, stats: { ...defaultProfile.stats } }; }
  function wholeNumber(value, maximum = Number.MAX_SAFE_INTEGER) { const number = Number(value); return Number.isFinite(number) ? Math.max(0, Math.min(maximum, Math.floor(number))) : 0; }
  function normalizeProfile(saved) {
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return freshProfile();
    const normalized = freshProfile();
    ['tokens', 'falcon', 'shield'].forEach(key => { normalized[key] = wholeNumber(saved[key]); });
    normalized.powerJump = wholeNumber(saved.powerJump, 5);
    normalized.character = saved.character === 'boy' ? 'boy' : 'girl';
    ['music', 'sound', 'reducedMotion', 'helpingHand'].forEach(key => { if (typeof saved[key] === 'boolean') normalized[key] = saved[key]; });
    normalized.musicStyle = saved.musicStyle === 'classic' ? 'classic' : 'varied';
    normalized.tutorialComplete = typeof saved.tutorialComplete === 'boolean' ? saved.tutorialComplete : Object.values(saved.tutorialModes && typeof saved.tutorialModes === 'object' ? saved.tutorialModes : {}).some(Boolean);
    Object.keys(normalized.bestScores).forEach(key => { normalized.bestScores[key] = wholeNumber(saved.bestScores?.[key]); });
    if (saved.badges && typeof saved.badges === 'object' && !Array.isArray(saved.badges)) Object.keys(saved.badges).forEach(key => { if (saved.badges[key] === true) normalized.badges[key] = true; });
    Object.keys(normalized.stats).forEach(key => { normalized.stats[key] = wholeNumber(saved.stats?.[key]); });
    // Keep the original seeker save ID and credit previously collected boosts.
    if (normalized.stats.powerups >= 5) normalized.badges['power-seeker'] = true;
    if (normalized.stats.powerups >= 25) normalized.badges['boost-master'] = true;
    normalized.runUpgrades = Object.fromEntries(["falcon", "shield", "powerJump"].map(key => [key, saved.runUpgrades?.[key] !== false]));
    return normalized;
  }
  function showStorageWarning(messageId = 'game.storage.unavailable') {
    storageAvailable = false;
    let warning = document.querySelector('#storage-warning');
    if (!warning) {
      warning = document.createElement('p'); warning.id = 'storage-warning'; warning.className = 'storage-warning';
      warning.setAttribute('role', 'status'); warning.setAttribute('aria-live', 'polite');
      document.querySelector('.game-frame')?.append(warning);
    }
    storageWarningId = messageId; warning.textContent = t(messageId);
    warning.classList.remove('hidden');
  }
  function loadProfile() {
    let value;
    try { value = localStorage.getItem(profileStorageKey); }
    catch { queueMicrotask(showStorageWarning); return freshProfile(); }
    if (value === null) return freshProfile();
    try { return normalizeProfile(JSON.parse(value)); }
    catch { return freshProfile(); }
  }
  function saveProfile() { if (!storageAvailable) return false; try { localStorage.setItem(profileStorageKey, JSON.stringify(profile)); return true; } catch { showStorageWarning(); return false; } }
  function removeSavedProfile() {
    try {
      localStorage.removeItem(profileStorageKey);
      storageAvailable = true;
      document.querySelector('#storage-warning')?.classList.add('hidden');
      return true;
    } catch { showStorageWarning('game.storage.eraseFailed'); return false; }
  }
  let profile = loadProfile();
  const runUpgrade = key => profile.runUpgrades[key] ? profile[key] : 0;
  const consumableLabel = key => !profile.runUpgrades[key] ? t('game.upgrade.off') : state?.[`${key}Used`] ? t('game.upgrade.used') : String(Math.min(1, profile[key]));
  let pendingRunMode = "endless";
  let state, selectedCharacter = profile.character === 'boy' ? 'boy' : 'girl', settingsReturn = 'home', pointerX = null, keys = new Set(), lastTime = 0, tutorialIndex = 0, tutorialResumesRun = false, tutorialReturn = 'home';
  let audioContext, musicTimer = null, musicVoices = [], badgeQueue = [], badgeToastTimer = null;
  let nextMusicPhraseTime = 0, musicPhraseIndex = 0;
  const noiseBuffers = new Map();

  function applyPreferences() {
    ui.musicToggle.checked = profile.music;
    ui.soundToggle.checked = profile.sound;
    ui.reducedMotionToggle.checked = profile.reducedMotion;
    ui.helpingHandToggle.checked = profile.helpingHand;
    ui.musicStyleSelect.value = profile.musicStyle;
    document.documentElement.classList.toggle('reduced-motion', profile.reducedMotion);
  }
  function requestResetProgress() { ui.settings.classList.add('hidden'); ui.resetConfirm.classList.remove('hidden'); syncModalAccessibility(); }
  // Setting explanations open as a dialog over Settings, the same way the
  // reset confirmation does, so they read well inside the native wrappers.
  function openInfo(title, note) { infoContent = { title, note }; menuDirty = true; ui.infoHeading.textContent = t(title); ui.infoBody.textContent = note.textContent; ui.settings.classList.add('hidden'); ui.infoScreen.classList.remove('hidden'); syncModalAccessibility(); }
  function closeInfo() { menuDirty = true; ui.infoScreen.classList.add('hidden'); ui.settings.classList.remove('hidden'); syncModalAccessibility(); }
  function cancelResetProgress() { ui.resetConfirm.classList.add('hidden'); ui.settings.classList.remove('hidden'); syncModalAccessibility(); }
  function resetAllProgress() {
    ui.resetConfirm.classList.add('hidden');
    removeSavedProfile();
    profile = freshProfile();
    setSelectedCharacter(profile.character, false);
    clearTimeout(badgeToastTimer); badgeQueue = []; ui.badgeToast.classList.add('hidden');
    applyPreferences(); updateUpgradeUI(); updateRecordsUI(); renderBadges(); renderStats();
    showHome();
    // Language is stored separately from progress, but is part of Reset's
    // "all settings" promise. Refresh only after the default profile is ready.
    i18n.setLanguage('device');
  }

  function getAudio() {
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) throw new Error('Audio unavailable');
      if (!audioContext) { audioContext = new Audio(); noiseBuffers.clear(); }
      // Safari reports 'interrupted' after calls or backgrounding: resume from
      // any non-running state, not only 'suspended'.
      if (audioContext.state !== 'running') audioContext.resume?.()?.catch(() => {});
      return audioContext;
    } catch {
      // Sound is optional: missing devices or browser APIs must not stop play.
      audioContext = null;
      ui.musicToggle.disabled = true; ui.soundToggle.disabled = true;
      document.querySelector('#audio-warning')?.classList.remove('hidden');
      return null;
    }
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
    const audio = audioContext;
    let buffer = noiseBuffers.get(duration);
    if (!buffer) {
      const frames = Math.ceil(audio.sampleRate * duration);
      buffer = audio.createBuffer(1, frames, audio.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let i = 0; i < frames; i++) samples[i] = (Math.random() * 2 - 1) * (1 - i / frames);
      noiseBuffers.set(duration, buffer);
    }
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
  // The four variants of a mode's phrase, so consecutive phrases differ while
  // the bass keeps the mode's character: as written, reversed as an answer,
  // lifted a fifth, then a syncopated octave bounce leading back to the start.
  function musicVariant(phrase, index) {
    const { melody, bass } = phrase, straight = melody.map((_, i) => [i, 1]);
    if (index === 1) return { melody: [...melody].reverse(), bass, beats: straight };
    if (index === 2) return { melody: melody.map(note => note * config.musicLiftRatio), bass, beats: straight };
    if (index === 3) return { melody: melody.map((note, i) => i % 2 ? note * 2 : note), bass, beats: config.musicBounceBeats };
    return { melody, bass, beats: straight };
  }
  function playMusicPhrase(startTime, variant = null) {
    if (!audioContext || (variant === null && !ui.musicToggle.checked)) return;
    const audio = audioContext, now = startTime, beat = config.musicBeatSeconds;
    const { melody, bass, beats } = musicVariant(config.musicPhrases[state?.mode] || config.musicPhrases.endless, variant ?? (profile.musicStyle === 'classic' ? 0 : musicPhraseIndex++ % 4));
    melody.forEach((note, i) => {
      const oscillator = audio.createOscillator(), gain = audio.createGain(), start = now + beats[i][0] * beat, length = beats[i][1] * beat;
      oscillator.type = 'sine'; oscillator.frequency.value = note; gain.gain.setValueAtTime(.028, start); gain.gain.exponentialRampToValueAtTime(.001, start + length * .84);
      oscillator.connect(gain).connect(audio.destination); oscillator.start(start); oscillator.stop(start + length); musicVoices.push(oscillator); oscillator.onended = () => { musicVoices = musicVoices.filter(voice => voice !== oscillator); };
    });
    bass.forEach((note, i) => {
      const oscillator = audio.createOscillator(), gain = audio.createGain(), start = now + i * beat * 2;
      oscillator.type = 'triangle'; oscillator.frequency.value = note; gain.gain.setValueAtTime(.018, start); gain.gain.exponentialRampToValueAtTime(.001, start + beat * 1.7);
      oscillator.connect(gain).connect(audio.destination); oscillator.start(start); oscillator.stop(start + beat * 2); musicVoices.push(oscillator); oscillator.onended = () => { musicVoices = musicVoices.filter(voice => voice !== oscillator); };
    });
  }
  function setMusic() {
    stopMusic();
    if (!ui.musicToggle.checked || !audioContext || !state?.running || state.paused || menuVisible) return;
    // A run (or a resumed one) always opens with the phrase as written.
    nextMusicPhraseTime = audioContext.currentTime + config.musicStartDelaySeconds; musicPhraseIndex = 0;
    scheduleMusic();
  }
  function scheduleMusic() {
    if (!audioContext || !ui.musicToggle.checked || !state?.running || state.paused || menuVisible) return;
    // A delayed callback must not queue a burst of notes in the past.
    if (nextMusicPhraseTime < audioContext.currentTime) nextMusicPhraseTime = audioContext.currentTime + config.musicStartDelaySeconds;
    while (nextMusicPhraseTime < audioContext.currentTime + config.musicLookaheadSeconds) {
      playMusicPhrase(nextMusicPhraseTime);
      nextMusicPhraseTime += config.musicBeatSeconds * 8;
    }
    musicTimer = setTimeout(scheduleMusic, config.musicSchedulerIntervalMs);
  }
  // One phrase of the chosen style from Settings, even with music switched off;
  // Varied previews rotate through the variants that differ from Classic.
  let previewIndex = 0;
  function previewMusic() { const audio = getAudio(); if (!audio) return; stopMusic(); playMusicPhrase(audio.currentTime + config.musicStartDelaySeconds, profile.musicStyle === 'classic' ? 0 : 1 + previewIndex++ % 3); }
  function stopMusic() { clearTimeout(musicTimer); musicTimer = null; musicVoices.forEach(voice => { try { voice.stop(); } catch {} }); musicVoices = []; }
  function startAudio() { getAudio(); setMusic(); }

  function updateUpgradeUI(messageId = '', params = {}) {
    ui.wallet.textContent = profile.tokens;
    ui.falconOwned.textContent = t('game.upgrade.owned', { count: profile.falcon });
    ui.shieldOwned.textContent = t('game.upgrade.owned', { count: profile.shield });
    ui.buyFalcon.textContent = t('game.upgrade.buy', { cost: config.falconCost });
    ui.buyShield.textContent = t('game.upgrade.buy', { cost: config.shieldCost });
    ui.powerOwned.textContent = t('game.upgrade.level', { level: profile.powerJump });
    ui.buyPower.textContent = profile.powerJump >= 5 ? t('game.upgrade.max') : t('game.upgrade.buy', { cost: config.powerJumpCosts[profile.powerJump] });
    ui.buyPower.disabled = profile.powerJump >= 5;
    upgradeMessageId = messageId; upgradeMessageParams = params; ui.upgradeMessage.textContent = messageId ? t(messageId, params) : '';
  }
  function updateRecordsUI() {
    const best = profile.bestScores;
    ui.homeRecords.innerHTML = ['endless', 'arcade', 'challenge', 'hard'].map(mode => `<article><span>${t('game.mode.' + mode)}</span><strong>${rules.formatStat(best[mode])}</strong><small>${t('game.record.best')}</small></article>`).join('');
  }
  function renderBadges() {
    const earned = BADGES.filter(badge => profile.badges[badge.id]).length;
    ui.badgeCount.textContent = t('game.badge.count', { earned, total: BADGES.length });
    ui.badgeGrid.innerHTML = BADGES.map(badge => `<article class="badge-card${profile.badges[badge.id] ? '' : ' locked'}" style="--badge-color:${badge.color}"><span class="badge-ribbon"><span class="badge-icon badge-art-${badge.id}" aria-hidden="true"></span></span><span><h3>${t(badge.title)}</h3><p>${t(badge.description)}</p><small>${profile.badges[badge.id] ? t('game.badge.earned') : t('game.badge.keepClimbing')}</small></span></article>`).join('');
  }
  function renderStats() {
    updateRecordsUI();
    const s = profile.stats, averageScore = s.runs ? Math.round(s.totalScore / s.runs) : 0;
    ui.statsSummary.innerHTML = [
      [t('game.stat.runs'), s.runs], [t('game.stat.jumps'), s.jumps],
      [t('game.stat.averageScore'), averageScore], [t('game.stat.heightClimbed'), s.totalHeight], [t('game.stat.parshad'), s.parshad], [t('game.stat.khandaEarned'), s.tokens],
      [t('game.stat.boostsCollected'), s.powerups], [t('game.stat.birdsSeen'), s.birdsSeen], [t('game.stat.birdsBlocked'), s.birdsBlocked],
    ].map(([label, value]) => `<article><strong>${rules.formatStat(value)}</strong><span>${label}</span></article>`).join('');
    ui.deathBreakdown.innerHTML = [
      [t('game.stat.finishes'), s.wins, '#477e55'], [t('game.stat.arcadeWins'), s.arcadeWins, '#5c9c74'], [t('game.stat.challengeWins'), s.challengeWins, '#9b597e'], [t('game.stat.leftEarly'), s.leftEarly, '#7b8793'], [t('game.stat.falls'), s.fallDeaths, '#bd7d54'], [t('game.stat.birdCollisions'), s.birdDeaths, '#6b86a8'], [t('game.stat.challengeIncomplete'), s.challengeMisses, '#b78448'], [t('game.stat.shieldsUsed'), s.shieldsUsed, '#5b8692'],
    ].map(([label, value, color]) => `<article style="--stat-color:${color}"><strong>${rules.formatStat(value)}</strong><span>${label}</span></article>`).join('');
  }
  function showNextBadgeToast() {
    const badge = badgeQueue.shift();
    if (!badge) return;
    ui.badgeToastIcon.textContent = '';
    ui.badgeToastIcon.className = `badge-icon badge-art-${badge.id}`;
    activeBadge = badge; ui.badgeToastName.textContent = t(badge.title);
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
    clearTimeout(state?.resultTimer);
    // Centre the start platform on the live canvas width: native tablets widen
    // the canvas to 640, so a fixed x would leave the opening jump short.
    const startPlatform = { x: W / 2 - 57.5, y: 700, w: 115, type: 'normal', speed: 0, dir: 1, broken: false };
    state = {
      running: true, paused: false, mode, score: 0, heightScore: 0, parshad: 0, tokens: 0, cameraY: 0, arcadeMissedParshad: false,
      background: Math.floor(Math.random() * backgroundImages.length), backdropZone: 0, backdropFade: null, nextY: 610, ending: false, falconUsed: false, shieldUsed: false, invincibleTimer: 0, invincibleSource: null, shieldVisualTimer: 0, resultTimer: null, finishGate: null, fireworkSoundTimers: [], challengePlaced: 0, challengePlatformCount: 0, upgradeEffect: null, hitStop: null, falconRescue: null, flight: null,
      player: { x: W / 2, y: 650, vx: 0, vy: -config.baseJumpVelocity * rules.powerJumpMultiplier(runUpgrade('powerJump')), w: 31, h: 48, character: selectedCharacter, facing: 1 },
      // The opening launch has no landing event, so the start platform counts
      // as the first landing for the stall rescue.
      platforms: [startPlatform], lastPlatform: startPlatform, lastLanding: startPlatform, stallTimer: 0, collectibles: [], enemies: [], powerups: [], particles: [], challengeMissed: false, missedBowls: new Set(), challengeWarningShown: false,
      messageId: 'game.message.start.' + mode, messageParams: { target: mode === 'challenge' ? config.challengeParshadTarget : config.arcadeTargetScore }, message: '', messageTimer: 3,
    };
    state.message = t(state.messageId, state.messageParams);
    while (state.nextY > -900) addPlatform();
  }
  function addPlatform() {
    const r = Math.random();
    const arcade = rules.isArcadeLike(state.mode);
    const hard = rules.isHard(state.mode);
    // Score bands gate Kara and Nishan in every mode; only Arcade also uses
    // them for its sideways shifts and gap ranges.
    const level = levelForScore(state.score);
    const endlessDifficulty = rules.endlessDifficulty(state.score);
    const challengeBowlPlatform = state.mode === 'challenge' && rules.isChallengeBowlRow(state.challengePlaced, state.challengePlatformCount + 1);
    const belowChallengeBowl = state.mode === 'challenge' && rules.isChallengeBowlRow(state.challengePlaced, state.challengePlatformCount + 2);
    let type = 'normal';
    if (hard) {
      type = r < config.hardMovingChance ? 'moving' : 'break';
    } else if (arcade) {
      if (r < config.arcadePlatformMix.spring) type = 'spring';
      else if (level >= 2 && r < config.arcadePlatformMix.spring + (state.mode === 'challenge' ? rules.challengeBreakChance(state.score) : rules.arcadeBreakChance(state.score))) type = 'break';
      else if (r < config.arcadePlatformMix.moving) type = 'moving';
    } else {
      // Endless has no tiers: its platform mix gradually becomes more varied.
      const mix = rules.endlessPlatformCutoffs(state.score);
      if (r < mix.spring) type = 'spring';
      else if (r < mix.break) type = 'break';
      else if (r < mix.moving) type = 'moving';
    }
    if (challengeBowlPlatform || (belowChallengeBowl && type === 'spring')) type = 'normal';
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
        const [minSpeed, maxSpeed] = rules.endlessMovingPlatformSpeedRange(state.score);
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
      else if (Math.random() < config.challengeTokenChance) state.collectibles.push({ x: x + w / 2, y: platform.y - 37, type: 'token' });
    } else if (Math.random() < config.collectibleChance) state.collectibles.push({ x: x + w / 2, y: platform.y - 37, type: Math.random() < config.tokenShare ? 'token' : 'parshad' });
    if (state.mode !== 'challenge' && level >= 3 && Math.random() < config.powerupChances.kara) state.powerups.push({ x: x + w / 2, y: platform.y - 60, type: 'kara' });
    if (state.mode !== 'challenge' && level >= 4 && Math.random() < config.powerupChances.nishan) state.powerups.push({ x: x + w / 2, y: platform.y - 60, type: 'nishan' });
    const birdChance = state.mode === 'challenge'
      ? (state.score >= config.challengeBirdStartScore ? config.challengeBirdChance : 0)
      : arcade ? rules.arcadeBirdChance(state.score)
        : hard ? rules.hardBirdChance(state.score) : rules.endlessBirdChance(state.score);
    const candidateBirdY = platform.y - config.birdSpawnOffset;
    const activeBirdYs = state.enemies.filter(bird => !bird.hit).map(bird => bird.y);
    const birdSpacingIsSafe = hard ? rules.canSpawnHardBird(activeBirdYs, candidateBirdY, H)
      : state.mode === 'arcade' ? rules.canSpawnArcadeBird(activeBirdYs, candidateBirdY, H, state.score)
        : state.mode === 'challenge' ? rules.canSpawnChallengeBird(activeBirdYs, candidateBirdY) : true;
    if (!challengeBowlPlatform && birdSpacingIsSafe && Math.random() < birdChance) {
      const types = ['pigeon', 'sparrow', 'swift'], platformCenter = x + w / 2, clearance = config.birdPlatformClearance;
      const leftLimit = Math.max(25, platformCenter - clearance), rightLimit = Math.min(W - 25, platformCenter + clearance);
      const birdX = Math.random() < .5 && leftLimit > 25 ? 25 + Math.random() * (leftLimit - 25) : rightLimit < W - 25 ? rightLimit + Math.random() * (W - 25 - rightLimit) : platformCenter < W / 2 ? W - 25 : 25;
      state.enemies.push({ x: birdX, y: candidateBirdY, vx: (Math.random() < .5 ? -1 : 1) * rules.birdSpeed(state.mode, state.score, Math.random()), type: types[Math.floor(Math.random() * types.length)], flapOffset: Math.random() * Math.PI * 2 });
    }
    // Keep gap sampling after bird generation to preserve the seeded courses.
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
    menuVisible = false;
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
    if (state.mode === 'arcade' && completed && state.falconUsed) awardBadge('comeback-kid');
    if (state.mode === 'arcade' && completed) {
      profile.stats[state.player.character === 'boy' ? 'arcadeWinsBoy' : 'arcadeWinsGirl']++;
      if (profile.stats.arcadeWinsBoy > 0 && profile.stats.arcadeWinsGirl > 0) awardBadge('both-feet-in');
    }
    if (state.mode === 'arcade' && completed && state.parshad > 0 && !state.arcadeMissedParshad
      && !state.collectibles.some(item => item.type === 'parshad' && !item.taken)) awardBadge('perfect-arcade');
    if (state.mode === 'challenge' && completed) awardBadge('challenge-complete');
    profile.tokens += state.tokens; saveProfile(); updateUpgradeUI(); updateRecordsUI();
    const resultDelay = completed ? config.victorySceneDurationMs : 2800;
    state.resultTimer = setTimeout(() => {
      menuVisible = true; menuDirty = true;
      setNativeGameplayActive(false);
      state.result = { completed, reason, score, isNewBest };
      renderResult();
      ui.end.classList.remove('hidden');
      syncModalAccessibility();
      requestAnimationFrame(() => ui.end.classList.add('visible'));
    }, resultDelay);
  }
  function renderResult() {
    if (!state?.result) return;
    const { completed, reason, score, isNewBest } = state.result;
      const challenge = state.mode === 'challenge';
      ui.endHeading.textContent = completed ? (challenge ? t('game.result.challengeComplete') : t('game.result.arcadeComplete')) : (challenge && (reason === 'finish' || reason === 'challenge-incomplete') ? t('game.result.challengeProgress') : t('game.result.runComplete'));
      ui.score.textContent = t('game.score', { score });
      ui.endBest.textContent = isNewBest ? t('game.result.newBest') : t('game.result.personalBest', { score: profile.bestScores[state.mode] });
      ui.runBreakdown.innerHTML = `<span><strong>${state.heightScore}</strong>${t('game.stat.height')}</span><span><strong>${state.parshad}</strong>${t('game.stat.parshad')}</span><span><strong>${state.tokens}</strong>${t('game.stat.khandaEarned')}</span>`;
      const challengeStars = Math.min(5, Math.floor(state.parshad / 10));
      ui.endGoal.textContent = state.mode === 'endless' ? t('game.result.endless') : state.mode === 'hard' ? t('game.result.hard') : challenge ? (completed ? t('game.result.challengeWin') : t('game.result.challengeScore', { count: state.parshad, stars: '★'.repeat(challengeStars) + '☆'.repeat(5 - challengeStars), rating: challengeStars })) : (completed ? t('game.result.arcadeWin') : t('game.result.arcadeGoal'));
  }
  function triggerBirdHit(bird) {
    if (state.hitStop || state.ending) return;
    if (state.invincibleTimer > 0 && state.invincibleSource !== 'nishan') {
      // Dhal Shield and Falcon grace periods already announced themselves:
      // brush the bird aside without another hit-stop or a Nishan message.
      bird.hit = true; burst(bird.x, bird.y, '#f4ca4a', 8); sound('shield');
      setRunMessage(state.invincibleSource === 'falcon' ? 'game.message.falconProtected' : 'game.message.shieldProtecting'); state.messageTimer = 1.5;
      return;
    }
    state.hitStop = { bird, type: state.invincibleTimer > 0 ? 'nishan' : (runUpgrade('shield') > 0 && !state.shieldUsed) ? 'shield' : 'loss', elapsed: 0, duration: profile.reducedMotion ? config.reducedMotionBirdHitDurationMs : config.birdHitDurationMs };
    setRunMessage(state.hitStop.type === 'loss' ? 'game.message.birdHit' : 'game.message.birdBlocked');
    state.messageTimer = 1.1;
    sound('hit');
  }
  function resolveBirdHit(dt = 0) {
    const hit = state.hitStop;
    if (!hit) return false;
    hit.elapsed += dt * 1000;
    if (hit.elapsed < hit.duration) return false;
    state.hitStop = null; hit.bird.hit = true;
    if (hit.type === 'nishan') {
      profile.stats.birdsBlocked++; if (profile.stats.birdsBlocked >= 3) awardBadge('bird-defender'); sound('shield');
      setRunMessage('game.message.nishanProtected'); state.messageTimer = 2;
    } else if (hit.type === 'shield') {
      profile.stats.birdsBlocked++; profile.stats.shieldsUsed++; if (profile.stats.birdsBlocked >= 3) awardBadge('bird-defender'); sound('shield');
      profile.shield--; state.shieldUsed = true; state.invincibleTimer = 4; state.invincibleSource = 'shield'; state.shieldVisualTimer = 4; state.upgradeEffect = { type: 'shield', elapsed: 0, duration: config.shieldFlashDurationMs }; saveProfile(); updateUpgradeUI(); setRunMessage('game.message.shieldActivated'); state.messageTimer = 2;
    } else { finish(false, 'bird'); return true; }
    return false;
  }
  function triggerFalconSave() {
    const p = state.player, platformW = 124, platformY = state.cameraY + H - 155;
    const platformX = Math.max(12, Math.min(W - platformW - 12, p.x - platformW / 2));
    const platform = { x: platformX, y: platformY, w: platformW, type: 'normal', speed: 0, dir: 1, broken: false, rescuePlatform: true };
    state.platforms.push(platform);
    state.falconRescue = { elapsed: 0, duration: profile.reducedMotion ? config.reducedMotionFalconCarryDurationMs : config.falconCarryDurationMs, pickupX: p.x, pickupY: p.y, platform };
    p.vx = 0; p.vy = 0; profile.falcon--; profile.stats.falconSaves++; state.falconUsed = true;
    state.upgradeEffect = { type: 'falcon', elapsed: 0, duration: config.falconFlashDurationMs }; saveProfile(); updateUpgradeUI(); setRunMessage('game.message.falconSave'); state.messageTimer = 1.2; sound('save');
  }
  function updateFalconRescue(dt = 0) {
    const rescue = state.falconRescue;
    if (!rescue) return false;
    rescue.elapsed += dt * 1000;
    const progress = Math.min(1, rescue.elapsed / rescue.duration), p = state.player;
    if (progress < .55) { p.x = rescue.pickupX; p.y = rescue.pickupY; return true; }
    const carry = (progress - .55) / .45, targetX = rescue.platform.x + rescue.platform.w / 2, targetY = rescue.platform.y - p.h / 2;
    p.x = rescue.pickupX + (targetX - rescue.pickupX) * carry; p.y = rescue.pickupY + (targetY - rescue.pickupY) * carry;
    if (progress < 1) return true;
    p.x = targetX; p.y = targetY; p.vx = 0; p.vy = -config.baseJumpVelocity * rules.powerJumpMultiplier(runUpgrade('powerJump')); if (state.invincibleTimer < 1.2) { state.invincibleTimer = 1.2; state.invincibleSource = 'falcon'; } state.falconRescue = null;
    state.lastLanding = rescue.platform; // the carry launches the player from here without a landing event
    setRunMessage('game.message.backInSky'); state.messageTimer = 1.4;
    return false;
  }
  function updateStallRescue() {
    state.stuckBanner = false;
    // A broken row can leave the nearest intact platform two gaps above the
    // one the player keeps bouncing on, or its only survivor too far sideways
    // for a touch player, and the camera never scrolls down. Once the climb
    // has stalled, turn that platform into a spring: its longer flight also
    // covers more sideways distance. When even a spring cannot get there
    // (several rows broke in a row, common in Hard's double-break rows)
    // bridge the gap with solid helper steps instead.
    const standing = state.lastLanding;
    if (state.stallTimer < config.stallRescueSeconds || state.hitStop || state.falconRescue || state.ending || state.paused) return;
    if (!standing || standing.broken || !state.platforms.includes(standing)) return;
    const hop = { powerJump: runUpgrade('powerJump'), halfWidth: state.player.w / 2 }, springHop = { ...hop, velocity: config.springJumpVelocity };
    if (!rules.isStranded(state.platforms, standing, standing.type === 'spring' ? springHop : hop)) return;
    if (!profile.helpingHand || !rules.helpingHandApplies(state.mode)) {
      if (state.mode === 'challenge' || state.mode === 'hard') {
        state.stuckBanner = true;
        return;
      }
      // No help here: say so, then end the run rather than bounce forever.
      if (state.stallTimer >= config.stallEndSeconds) return finish(false, 'fall');
      if (state.messageId !== 'game.message.stuck') { setRunMessage('game.message.stuck'); state.messageTimer = config.stallEndSeconds - config.stallRescueSeconds; }
      return;
    }
    if (standing.type !== 'spring' && !rules.isStranded(state.platforms, standing, springHop)) {
      standing.type = 'spring'; standing.speed = 0;
      setRunMessage('game.message.springAssist'); sound('spring'); burst(standing.x + standing.w / 2, standing.y, '#d5a5ff', 26);
    } else {
      const above = rules.nearestRowAbove(state.platforms, standing);
      if (!above) return;
      const rungs = rules.rescueRungs(standing, above, hop, W);
      state.platforms.push(...rungs);
      for (const rung of rungs) burst(rung.x + rung.w / 2, rung.y, '#f7efd7', 12);
      setRunMessage('game.message.helperPlatforms'); sound('land');
    }
    state.stallTimer = 0; state.messageTimer = 1.5;
  }
  function updateBackdrop(dt) {
    // Passing a zone threshold starts a cross-fade from the previous image.
    // Reduced Motion switches instantly; the fade only advances on active
    // time so a paused game keeps its half-faded sky.
    const zone = rules.backdropZone(state.heightScore);
    if (zone !== state.backdropZone) { state.backdropFade = profile.reducedMotion ? null : { from: state.backdropZone, elapsed: 0 }; state.backdropZone = zone; }
    if (state.backdropFade && (state.backdropFade.elapsed += dt * 1000) >= config.backdropFadeMs) state.backdropFade = null;
  }
  function update(dt) {
    if (state.paused || (!state.running && !state.ending)) return;
    updateBackdrop(dt);
    if (state.upgradeEffect) {
      state.upgradeEffect.elapsed += dt * 1000;
      if (state.upgradeEffect.elapsed >= state.upgradeEffect.duration) state.upgradeEffect = null;
    }
    if (!state.running) return;
    if (state.falconRescue && updateFalconRescue(dt)) return;
    if (state.hitStop) { if (resolveBirdHit(dt)) return; if (state.hitStop) return; }
    const p = state.player;
    p.pushPoseRemaining = Math.max(0, (p.pushPoseRemaining || 0) - dt);
    if (state.invincibleTimer > 0) { state.invincibleTimer = Math.max(0, state.invincibleTimer - dt); if (!state.invincibleTimer) state.invincibleSource = null; }
    if (state.shieldVisualTimer > 0) state.shieldVisualTimer = Math.max(0, state.shieldVisualTimer - dt);
    const keyboard = (keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0);
    const steering = keyboard || gamepadSteer;
    if (pointerX !== null && !gamepadSteer) {
      const desiredVelocity = Math.max(-config.pointerMaxHorizontalSpeed, Math.min(config.pointerMaxHorizontalSpeed, (pointerX - p.x) * config.pointerSteeringGain));
      p.vx += (desiredVelocity - p.vx) * Math.min(1, config.pointerSteeringResponse * dt);
    } else {
      p.vx += steering * config.keyboardAcceleration * dt;
      p.vx *= Math.pow(.0007, dt);
    }
    p.vx = Math.max(-config.maxHorizontalSpeed, Math.min(config.maxHorizontalSpeed, p.vx));
    if (Math.abs(p.vx) > 22) p.facing = Math.sign(p.vx);
    const previousX = p.x;
    p.x += p.vx * dt;
    const previousBottom = p.y + p.h / 2;
    p.x = Math.max(p.w / 2, Math.min(W - p.w / 2, p.x));
    // A Nishan flight holds a steady climb with gravity off; it only advances
    // here, so a pause or a bird hit-stop freezes it and it resumes after.
    // Once it ends the climb speed simply decays under normal gravity.
    if (state.flight) { p.vy = -config.nishanFlightSpeed; state.flight.remaining -= dt; if (state.flight.remaining <= 0) state.flight = null; }
    else p.vy += config.gravity * dt;
    p.y += p.vy * dt;
    for (const plat of state.platforms) {
      if (plat.broken) { plat.breakElapsed += dt; continue; }
      const previousPlatformX = plat.x;
      if (plat.type === 'moving') { plat.x += plat.dir * plat.speed * dt; if (plat.x < 6 || plat.x + plat.w > W - 6) plat.dir *= -1; }
      const top = plat.y;
      if (rules.landsOnPlatform(p, { x: previousX, bottom: previousBottom }, plat, previousPlatformX)) {
        const jumpMultiplier = rules.powerJumpMultiplier(runUpgrade('powerJump'));
        p.y = top - p.h / 2; p.vy = -(plat.type === 'spring' ? config.springJumpVelocity : config.baseJumpVelocity) * jumpMultiplier;
        p.pushPoseRemaining = .075;
        profile.stats.jumps++; state.lastLanding = plat;
        sound(plat.type === 'break' ? 'break' : plat.type === 'spring' ? 'spring' : 'land');
        const landingColor = plat.type === 'spring' ? '#d5a5ff' : plat.type === 'break' ? '#c49464' : '#f7efd7';
        burst(p.x, top, landingColor, plat.type === 'spring' ? 26 : plat.type === 'break' ? 20 : 16);
        burst(p.x, top, '#fff9e8', plat.type === 'spring' ? 9 : 6);
        if (plat.type === 'break') { plat.broken = true; plat.breakElapsed = 0; }
      }
    }
    const targetCamera = Math.min(state.cameraY, p.y - H * .38);
    state.cameraY += (targetCamera - state.cameraY) * Math.min(1, dt * 4);
    const currentHeight = Math.max(0, Math.floor((650 - p.y) / 18));
    state.stallTimer += dt;
    if (currentHeight > state.heightScore) { state.heightScore = currentHeight; state.score = currentHeight + state.parshad * 3; state.stallTimer = 0; }
    updateStallRescue();
    if (state.score >= 100) awardBadge('sky-starter');
    if (state.mode === 'endless' && state.score >= 1000) awardBadge('endless-1000');
    if (state.mode === 'endless' && state.score >= 2000) awardBadge('endless-2000');
    if (rules.isArcadeLike(state.mode)) {
      // A Challenge run with missed bowls reaches its course end directly,
      // rather than showing a victory banner that the player cannot earn.
      if (rules.shouldEndIncompleteChallenge(state.mode, state.score, state.parshad)) {
        finish(false, 'challenge-incomplete');
        return;
      }
      if (!state.finishGate && state.score >= config.arcadeTargetScore - config.finishBannerLeadScore) {
        if (addFinishRunway()) { setRunMessage('game.message.finishAhead'); state.messageTimer = 2; }
      }
      if (state.finishGate && p.y <= state.finishGate.y) {
        state.finishGate.broken = true;
        state.score = Math.max(state.score, config.arcadeTargetScore);
        finish(rules.didWin(state.mode, state.parshad), 'finish');
        return;
      }
    }
    while (state.nextY > state.cameraY - 900 && (!state.finishGate || state.nextY > state.finishGate.y)) addPlatform();
    state.platforms = state.platforms.filter(o => o.y < state.cameraY + H + 100 && (!o.broken || o.breakElapsed < config.breakCrumbleDuration));
    for (const c of state.collectibles) if (!c.taken && collide(p, c, c.challengeBowl ? 86 : 27)) { c.taken = true; if (c.type === 'token') { state.tokens++; profile.stats.tokens++; burst(c.x, c.y, '#f5cd57', 9); sound('token'); if (profile.stats.tokens >= 10) awardBadge('tokens-10'); } else { state.parshad++; profile.stats.parshad++; state.score += 3; burst(c.x, c.y, '#fff1a5', 8); sound('collect'); if (profile.stats.parshad >= 50) awardBadge('parshad-50'); } }
    if (state.mode === 'challenge') {
      // Keep missed bowl identities after offscreen culling; recovering one
      // must not erase a different bowl that is still missing.
      for (const bowl of state.missedBowls) if (bowl.taken) state.missedBowls.delete(bowl);
      for (const bowl of state.collectibles) if (bowl.challengeBowl && !bowl.taken && bowl.y > state.cameraY + H + config.challengeMissedBowlMargin) state.missedBowls.add(bowl);
      state.challengeMissed = state.missedBowls.size > 0;
      if (!state.challengeMissed && isMissedBowlMessage()) state.messageTimer = 0;
      if (state.challengeMissed && !state.challengeWarningShown) {
        state.challengeWarningShown = true;
        setRunMessage('game.message.missedBowl', { target: config.challengeParshadTarget });
        state.messageTimer = config.challengeMissedMessageDuration;
        sound('loss');
      }
    }
    if (state.mode === 'arcade' && state.collectibles.some(c => c.type === 'parshad' && !c.taken && c.y >= state.cameraY + H + 100)) state.arcadeMissedParshad = true;
    state.collectibles = state.collectibles.filter(c => !c.taken && c.y < state.cameraY + H + 100);
    for (const power of state.powerups) if (!power.taken && collide(p, power, 30)) { power.taken = true; profile.stats.powerups++; burst(power.x, power.y, power.type === 'kara' ? '#f5cb58' : '#f1815a', 14); if (profile.stats.powerups >= 5) awardBadge('power-seeker'); if (profile.stats.powerups >= 25) awardBadge('boost-master'); sound('boost'); if (power.type === 'nishan') { state.invincibleTimer = 5; state.invincibleSource = 'nishan'; state.flight = { remaining: config.nishanFlightSeconds }; p.vy = -config.nishanFlightSpeed; } else if (state.flight) state.flight.remaining += config.karaFlightExtensionSeconds; else p.vy = rules.boostVelocity(power.type, runUpgrade('powerJump')); setRunMessage(power.type === 'nishan' ? 'game.message.nishanFlight' : state.flight ? 'game.message.karaExtended' : 'game.message.karaJump'); state.messageTimer = 2; }
    state.powerups = state.powerups.filter(o => !o.taken && o.y < state.cameraY + H + 100);
    for (const bird of state.enemies) {
      if (bird.hit) continue;
      bird.x += bird.vx * dt;
      // Turn only outward travel: after an overshoot, shorter frames may
      // leave the bird outside the edge while it is already flying inward.
      if (bird.x < 20) bird.vx = Math.abs(bird.vx);
      else if (bird.x > W - 20) bird.vx = -Math.abs(bird.vx);
      if (rules.birdTouchesPlayer(p, bird)) triggerBirdHit(bird);
    }
    state.enemies = state.enemies.filter(o => o.y < state.cameraY + H + 100 && !o.hit);
    for (const particle of state.particles) { particle.x += particle.vx * dt; particle.y += particle.vy * dt; particle.vy += 360 * dt; particle.life -= dt; }
    state.particles = state.particles.filter(particle => particle.life > 0);
    // End the run as the character reaches the visible net, rather than after
    // they have already disappeared below the frame.
    if (p.y > state.cameraY + H - 52) {
      if (rules.canUseFalconSave(runUpgrade('falcon'), state.falconUsed)) triggerFalconSave();
      else finish(false, 'fall');
    }
    state.messageTimer -= dt;
  }
  // The starting zone still varies per run; each later zone steps one image on.
  function backdropIndex(zone) { return (state.background + zone) % backgroundImages.length; }
  function drawBackdropImage(backgroundImage) {
    if (!backgroundImage.complete || !backgroundImage.naturalWidth) return false;
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
    return true;
  }
  function drawBackdrop() {
    const fade = state.backdropFade, index = backdropIndex(fade ? fade.from : state.backdropZone);
    if (!drawBackdropImage(backgroundImages[index])) {
      ctx.fillStyle = palette[index]; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff7df'; ctx.beginPath(); ctx.arc(365, 92, 42, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7cb296'; ctx.fillRect(0, H - 100, W, 100);
      // A distant gurdwara-inspired silhouette belongs only to the background.
      ctx.fillStyle = '#f6e3bb'; ctx.fillRect(50, H - 185, 92, 88); ctx.fillRect(310, H - 166, 92, 69);
      ctx.fillStyle = '#e2aa65'; [96, 356].forEach(x => { ctx.beginPath(); ctx.arc(x, H - 186, 30, Math.PI, 0); ctx.fill(); });
    }
    // Mid-fade the next image is layered on top, so only fade frames cost a second draw.
    if (fade) { ctx.save(); ctx.globalAlpha = Math.min(1, fade.elapsed / config.backdropFadeMs); drawBackdropImage(backgroundImages[backdropIndex(state.backdropZone)]); ctx.restore(); }
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
      { icon: falconSaveSprite, value: consumableLabel('falcon'), active: runUpgrade('falcon') > 0 && !state.falconUsed },
      { icon: dhalShieldSprite, value: consumableLabel('shield'), active: (runUpgrade('shield') > 0 && !state.shieldUsed) },
      { icon: powerJumpSprite, value: profile.runUpgrades.powerJump ? `${profile.powerJump}` : t('game.upgrade.off'), active: runUpgrade('powerJump') > 0 },
    ];
    let x = 17;
    for (const entry of entries) {
      ctx.font = canvasFont(12);
      const entryWidth = Math.max(61, Math.ceil(ctx.measureText(entry.value).width) + 34);
      ctx.fillStyle = entry.active ? '#fff9e8e8' : '#e7ded1cc'; ctx.fillRect(x, 64, entryWidth, 30);
      ctx.strokeStyle = entry.active ? '#a85e30' : '#9b9387'; ctx.lineWidth = 1.5; ctx.strokeRect(x, 64, entryWidth, 30);
      if (entry.icon?.complete && entry.icon.naturalWidth) ctx.drawImage(entry.icon, x + 3, 68, 21, 21);
      else { ctx.fillStyle = entry.active ? '#a85e30' : '#8d857b'; ctx.font = canvasFont(17, 'bold'); ctx.textAlign = 'center'; ctx.fillText(entry.icon ? '✦' : '↑', x + 14, 84); }
      ctx.fillStyle = entry.active ? '#24483f' : '#756f67'; ctx.font = canvasFont(12, 'bold'); ctx.textAlign = 'left'; ctx.fillText(entry.value, x + 27, 83);
      x += entryWidth + 5;
    }
  }
  // Native tablets can report mouse-like pointer capabilities even though they
  // use the same full-screen HUD as phones.
  const coarsePointerQuery = window.matchMedia?.('(hover: none) and (pointer: coarse)');
  const usesMobileHud = () => Boolean(nativePlatform) || Boolean(coarsePointerQuery?.matches);
  // The HUD refreshes every frame, so only write to the DOM when a value changes.
  const hudText = new Map();
  function setHudText(element, value) { const text = String(value); if (hudText.get(element) === text) return; hudText.set(element, text); element.textContent = text; }
  function updateMobileHud() { if (!usesMobileHud() || !state?.running) { if (!ui.mobileHud.classList.contains('hidden')) ui.mobileHud.classList.add('hidden'); return; } const name = state.mode === 'arcade' ? t('game.mode.short.arcade') : state.mode === 'challenge' ? t('game.mode.short.challenge') : state.mode === 'hard' ? t('game.mode.short.hard') : t('game.mode.short.endless'); const detail = state.mode === 'challenge' ? `${state.parshad}/${config.challengeParshadTarget}${state.challengeMissed ? t('game.mode.missed') : ""}` : state.mode === 'arcade' ? `${Math.floor(state.score)}/${config.arcadeTargetScore}` : t('game.mode.climb'); setHudText(ui.mobileScore, t('game.score', { score: Math.floor(state.score) })); setHudText(ui.mobileItems, t('game.hud.items', { parshad: state.parshad, tokens: state.tokens })); setHudText(ui.mobileFalcon, consumableLabel('falcon')); setHudText(ui.mobileShield, consumableLabel('shield')); setHudText(ui.mobilePower, profile.runUpgrades.powerJump ? profile.powerJump : t('game.upgrade.off')); setHudText(ui.mobileMode, `${name} · ${detail}`); if (ui.mobileHud.classList.contains('hidden')) ui.mobileHud.classList.remove('hidden'); }
  function drawUpgradeEffect() {
    const effect = state.upgradeEffect;
    if (!effect) return;
    const alpha = Math.max(0, 1 - effect.elapsed / effect.duration);
    const icon = effect.type === 'falcon' ? falconSaveSprite : dhalShieldSprite;
    const title = effect.type === 'falcon' ? t('game.message.falconSave') : t('game.effect.shield');
    ctx.save(); ctx.globalAlpha = alpha * .26; ctx.fillStyle = effect.type === 'falcon' ? '#f3b84e' : '#6ca0b5'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = alpha;
    if (icon.complete && icon.naturalWidth) ctx.drawImage(icon, W / 2 - 45, 136, 90, 90);
    ctx.fillStyle = '#fff9e8'; ctx.strokeStyle = '#24483f'; ctx.lineWidth = 4; ctx.font = canvasFont(22, '900'); ctx.textAlign = 'center'; ctx.strokeText(title, W / 2, 244); ctx.fillText(title, W / 2, 244); ctx.restore();
  }
  function drawFalconRescue() {
    const rescue = state.falconRescue;
    if (!rescue) return;
    const progress = Math.min(1, rescue.elapsed / rescue.duration), pickupScreenY = worldToScreen(rescue.pickupY), targetX = rescue.platform.x + rescue.platform.w / 2, targetY = worldToScreen(rescue.platform.y - 48);
    let x, y;
    if (progress < .55) { const t = progress / .55; x = W + 68 + (rescue.pickupX - (W + 68)) * t; y = 54 + (pickupScreenY - 54) * t; }
    else { const t = (progress - .55) / .45; x = rescue.pickupX + (targetX - rescue.pickupX) * t; y = pickupScreenY + (targetY - pickupScreenY) * t; }
    const destinationX = progress < .55 ? rescue.pickupX : targetX;
    ctx.save(); ctx.translate(x, y); if (x > destinationX) ctx.scale(-1, 1); if (falconSaveSprite.complete && falconSaveSprite.naturalWidth) ctx.drawImage(falconSaveSprite, -64, -57, 128, 114); else { ctx.fillStyle = '#c88932'; ctx.beginPath(); ctx.ellipse(0, 0, 42, 22, 0, 0, Math.PI * 2); ctx.fill(); } ctx.restore();
  }
  function drawNetStars() {
    const centerX = W / 2, centerY = H - 164;
    ctx.save(); ctx.font = canvasFont(20, 'bold'); ctx.textAlign = 'center';
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
    if (state.finishGate && !state.finishGate.broken) { const gateY = worldToScreen(state.finishGate.y) + (profile.reducedMotion ? 0 : Math.sin(lastTime / 220) * 3); if (finishBannerSprite.complete && finishBannerSprite.naturalWidth) ctx.drawImage(finishBannerSprite, -16, gateY - 72, W + 32, 185); ctx.fillStyle = '#fff9e8'; ctx.font = canvasFont(16, 'bold'); ctx.textAlign = 'center'; ctx.fillText(t('game.canvas.finish'), W / 2, gateY + 2); }
    for (const plat of state.platforms) { const y = worldToScreen(plat.y); if (y < -30 || y > H + 40) continue;
      ctx.save();
      if (plat.broken) {
        const progress = Math.min(1, plat.breakElapsed / config.breakCrumbleDuration);
        ctx.globalAlpha = 1 - progress;
        if (!profile.reducedMotion) ctx.translate(0, progress * progress * config.breakCrumbleFallDistance);
      }
      const sprite = platformSprites[plat.type] || platformSprite;
      if (sprite.complete && sprite.naturalWidth) ctx.drawImage(sprite, plat.x, y - 22, plat.w, 50);
      else { ctx.fillStyle = plat.type === 'break' ? '#b48d66' : plat.type === 'spring' ? '#7c5c9c' : '#477e55'; ctx.fillRect(plat.x, y, plat.w, 13); }
      ctx.restore();
    }
    for (const particle of state.particles) { const alpha = Math.max(0, particle.life / particle.maxLife); ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = particle.color; ctx.fillRect(Math.round(particle.x - particle.size / 2), Math.round(worldToScreen(particle.y) - particle.size / 2), particle.size, particle.size); ctx.restore(); }
    for (const c of state.collectibles) {
      const y = worldToScreen(c.y); ctx.save(); ctx.translate(c.x, y);
      const frames = collectibleGlows[c.type];
      const glow = c.type === 'token' && frames
        ? frames[profile.reducedMotion ? 0 : Math.floor(lastTime / 100) % frames.length]
        : frames;
      if (glow) ctx.drawImage(glow, -glow.width / 2, -glow.height / 2);
      else if (c.type === 'token' && khandaTokenSprite.complete && khandaTokenSprite.naturalWidth) ctx.drawImage(khandaTokenSprite, -19, -19, 38, 38);
      else if (c.type === 'token') { ctx.fillStyle = '#e3a721'; ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff4b2'; ctx.font = canvasFont(14, 'bold'); ctx.textAlign = 'center'; ctx.fillText('✦', 0, 5); }
      else if (parshadSprite.complete && parshadSprite.naturalWidth) ctx.drawImage(parshadSprite, -27, -19, 54, 38);
      else { ctx.fillStyle = '#f6c879'; ctx.beginPath(); ctx.ellipse(0, 4, 15, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff0ae'; ctx.beginPath(); ctx.arc(-5, -4, 5, 0, Math.PI * 2); ctx.arc(4, -4, 5, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    for (const o of state.powerups) { const y = worldToScreen(o.y); const sprite = powerupSprites[o.type]; if (sprite.complete && sprite.naturalWidth) ctx.drawImage(sprite, o.x - 25, y - 25, 50, 50); else { ctx.fillStyle = o.type === 'kara' ? '#d6a740' : '#ed7353'; ctx.beginPath(); ctx.arc(o.x, y, 15, 0, Math.PI * 2); ctx.fill(); } }
    for (const b of state.enemies) { const y = worldToScreen(b.y); if (y < -28 || y > H + 28) continue; if (!b.seen && state.running && !state.paused && !menuVisible) { b.seen = true; profile.stats.birdsSeen++; } const birdSprite = birdSprites[b.type] || birdSprites.pigeon; const frame = profile.reducedMotion ? 1 : Math.floor((lastTime / 100 + b.flapOffset) % 3); const isHit = state.hitStop?.bird === b; if (birdSprite.complete && birdSprite.naturalWidth) { const frameWidth = birdSprite.naturalWidth / 3; ctx.save(); ctx.translate(b.x, y); if (isHit && !profile.reducedMotion) ctx.globalAlpha = Math.floor(lastTime / 85) % 2 ? .34 : 1; if (b.vx < 0) ctx.scale(-1, 1); ctx.drawImage(birdSprite, frame * frameWidth, 0, frameWidth, birdSprite.naturalHeight, -35, -28, 70, 56); ctx.restore(); } else { ctx.fillStyle = '#42546c'; ctx.beginPath(); ctx.ellipse(b.x, y, 19, 11, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#1f344a'; ctx.beginPath(); ctx.moveTo(b.x - 4, y); ctx.lineTo(b.x - 31, y - 15); ctx.lineTo(b.x - 19, y + 9); ctx.fill(); ctx.fillStyle = '#f2ba4a'; ctx.beginPath(); ctx.moveTo(b.x + 18, y); ctx.lineTo(b.x + 30, y + 3); ctx.lineTo(b.x + 18, y + 6); ctx.fill(); } if (isHit) { ctx.save(); ctx.fillStyle = state.hitStop.type === 'loss' ? '#e45d43' : '#f4ca4a'; ctx.font = canvasFont(28, '900'); ctx.textAlign = 'center'; ctx.fillText('✦', b.x - 24, y - 28); ctx.fillText('✦', b.x + 25, y - 17); ctx.restore(); } }
    drawCatchNet();
    const p = state.player, py = worldToScreen(p.y);
    const isNetLanding = state.ending && !state.completed && (state.endReason === 'fall' || state.endReason === 'bird');
    if (isNetLanding) {
      if (drawPlayerPose(ctx, p.character, 'net', W / 2, H - 32, .26)) { /* Seated pose shares the airborne character design. */ }
      else { ctx.fillStyle = '#24483f'; ctx.font = canvasFont(18, 'bold'); ctx.textAlign = 'center'; ctx.fillText(t('game.canvas.ohMan'), W / 2, H - 98); }
      drawNetStars();
    } else {
    const isFalling = p.vy > 30 || state.ending;
    const pose = state.ending ? 'fall' : !profile.reducedMotion && p.pushPoseRemaining > 0 ? 'push' : !profile.reducedMotion && Math.abs(p.vy) < 95 ? 'apex' : isFalling ? 'fall' : 'jump';
    const tilt = isFalling ? Math.max(-.12, Math.min(.12, p.vx / 1300)) : Math.max(-.055, Math.min(.055, p.vx / 4200));
    const bob = isFalling || profile.reducedMotion ? 0 : Math.sin(lastTime / 85) * 1.25;
    ctx.save(); ctx.translate(p.x, py + bob); ctx.rotate(tilt); ctx.scale(p.facing, 1); if (state.invincibleTimer > 0 && !profile.reducedMotion && Math.floor(lastTime / 105) % 2) ctx.globalAlpha = .48;
    if (!drawPlayerPose(ctx, p.character, pose, 0, 32, .165)) {
      ctx.fillStyle = p.character === 'girl' ? '#d46686' : '#477e55'; ctx.beginPath(); ctx.arc(0, -15, 16, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#a96942'; ctx.beginPath(); ctx.arc(0, -8, 12, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#324e3d'; ctx.fillRect(-11, 1, 22, 26); ctx.fillStyle = '#f6d4b0'; ctx.fillRect(-18, 5, 8, 20); ctx.fillRect(10, 5, 8, 20);
    }
    if (((runUpgrade('shield') > 0 && !state.shieldUsed) || state.shieldVisualTimer > 0) && dhalShieldSprite.complete && dhalShieldSprite.naturalWidth) ctx.drawImage(dhalShieldSprite, 6, -14, 39, 39);
    ctx.restore();
    }
    drawFalconRescue();
    if (state.running || state.ending) {
      updateMobileHud(); if (usesMobileHud()) { if (state.stuckBanner || isMissedBowlMessage() || state.messageId === 'game.message.stuck') drawRunMessage(); drawUpgradeEffect(); drawLossTransition(); drawWinTransition(); return; }
      ctx.fillStyle = '#24483f'; ctx.font = canvasFont(18, 'bold'); ctx.textAlign = 'left'; ctx.fillText(t('game.score', { score: Math.floor(state.score) }), 18, 31); ctx.font = canvasFont(13, 'bold'); ctx.fillText(t('game.hud.items', { parshad: state.parshad, tokens: state.tokens }), 18, 52);
      drawUpgradeStatus();
      const modeName = state.mode === 'arcade' ? t('game.mode.title.arcade') : state.mode === 'challenge' ? t('game.mode.title.challenge') : state.mode === 'hard' ? t('game.mode.title.hard') : t('game.mode.title.endless');
      const modeDetail = state.mode === 'arcade' ? `${Math.floor(state.score)} / ${config.arcadeTargetScore}` : state.mode === 'challenge' ? `${state.parshad} / ${config.challengeParshadTarget}${state.challengeMissed ? t('game.mode.missed') : t('game.mode.bowls')}` : t('game.mode.keepClimbing');
      ctx.font = canvasFont(11);
      const modeWidth = Math.min(W - 24, Math.max(160, ctx.measureText(`${modeName} · ${modeDetail}`).width + 28));
      ctx.fillStyle = '#fff8e9e8'; ctx.fillRect((W - modeWidth) / 2, H - 55, modeWidth, 38);
      ctx.strokeStyle = state.mode === 'challenge' ? '#b56b2e' : state.mode === 'arcade' ? '#d56d39' : state.mode === 'hard' ? '#9c4825' : '#527165'; ctx.lineWidth = 2;
      ctx.strokeRect((W - modeWidth) / 2, H - 55, modeWidth, 38);
      ctx.textAlign = 'center'; ctx.fillStyle = '#24483f'; ctx.font = canvasFont(11, 'bold'); drawWrappedText(`${modeName} · ${modeDetail}`, W / 2, H - 31, modeWidth - 16, 17);
      drawRunMessage();
    }
    drawUpgradeEffect();
    drawLossTransition();
    drawWinTransition();
  }
  function setRunMessage(id, params = {}) { state.messageId = id; state.messageParams = params; state.message = t(id, params); }
  function isMissedBowlMessage() { return state.messageId === 'game.message.missedBowl'; }
  // Break only at whitespace so Indic conjuncts and combining marks stay together.
  // Catalog words fit the minimum canvas width; line height leaves room for marks.
  function wrappedLines(text, width) {
    const lines = [];
    let line = '';
    for (const word of String(text).split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(next).width > width) { lines.push(line); line = word; }
      else line = next;
    }
    if (line) lines.push(line);
    return lines;
  }
  function drawWrappedText(text, x, y, width, lineHeight) {
    const lines = wrappedLines(text, width);
    lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
    return lines.length * lineHeight;
  }
  function drawRunMessage() {
    if (state.stuckBanner && state.running && !state.ending) {
      const width = Math.min(W - 24, 390), left = (W - width) / 2;
      ctx.font = canvasFont(18);
      const titleLines = wrappedLines(t('game.stuck.title'), width - 24);
      ctx.font = canvasFont(14, 'normal');
      const detailLines = wrappedLines(t('game.stuck.detail'), width - 24);
      const actionLines = wrappedLines(t('game.stuck.action'), width - 24);
      const boxHeight = 22 + titleLines.length * 29 + (detailLines.length + actionLines.length) * 25;
      ctx.fillStyle = '#fff4df'; ctx.fillRect(left, 96, width, boxHeight);
      ctx.strokeStyle = '#9c4825'; ctx.lineWidth = 3; ctx.strokeRect(left, 96, width, boxHeight);
      ctx.textAlign = 'center'; ctx.fillStyle = '#603015'; ctx.font = canvasFont(18, 'bold');
      let y = 122;
      titleLines.forEach(line => { ctx.fillText(line, W / 2, y); y += 29; });
      ctx.font = canvasFont(14, 'normal');
      [...detailLines, ...actionLines].forEach(line => { ctx.fillText(line, W / 2, y); y += 25; });
      return;
    }
    if (state.messageTimer > 0) { ctx.textAlign = 'center'; ctx.fillStyle = '#24483f'; ctx.font = canvasFont(15, 'bold'); drawWrappedText(state.message, W / 2, isMissedBowlMessage() ? 180 : 120, W - 32, 25); }
  }
  function loop(time) {
    const dt = Math.min(config.maxFrameSeconds, (time - lastTime) / 1000 || 0); lastTime = time;
    pollGamepad();
    const active = !menuVisible && !state?.paused && (state?.running || state?.ending || state?.falconRescue);
    if (active) update(dt);
    if (active || menuDirty) { draw(); menuDirty = false; }
    requestAnimationFrame(loop);
  }
  function setSelectedCharacter(character, persist = true) {
    selectedCharacter = character;
    profile.character = character;
    if (persist) saveProfile();
    ui.choices.forEach(button => button.classList.toggle('selected', button.dataset.character === character));
    ui.choices.forEach(button => button.setAttribute('aria-pressed', button.dataset.character === character));
    ui.sceneGirl.classList.toggle('selected', character === 'girl');
    ui.sceneBoy.classList.toggle('selected', character === 'boy');
  }
  ui.choices.forEach(button => button.addEventListener('click', () => { setSelectedCharacter(button.dataset.character); sound('ui'); }));
  const TUTORIAL_STEPS = [
    { icon: '↔', title: 'game.tutorial.guide.title', copy: 'game.tutorial.guide.copy' },
    { icon: '✦', title: 'game.tutorial.collect.title', copy: 'game.tutorial.collect.copy' },
    { icon: '☂', title: 'game.tutorial.birds.title', copy: 'game.tutorial.birds.copy' },
  ];
  function renderTutorial() {
    const step = TUTORIAL_STEPS[tutorialIndex];
    ui.tutorialKeyboard.hidden = tutorialIndex !== 0;
    ui.tutorialIcon.textContent = step.icon; ui.tutorialHeading.textContent = t(step.title); ui.tutorialCopy.textContent = t(step.copy);
    ui.tutorialStep.textContent = t('game.tutorial.step', { step: tutorialIndex + 1, total: TUTORIAL_STEPS.length });
    ui.tutorialDots.querySelectorAll('span').forEach((dot, index) => dot.classList.toggle('active', index === tutorialIndex));
    ui.tutorialNext.textContent = tutorialIndex === TUTORIAL_STEPS.length - 1 ? t('game.tutorial.jump') : t('game.tutorial.next');
  }
  // Same order as the overlays in index.html: the later visible dialog is on top.
  const modalScreens = [ui.runUpgrades, ui.end, ui.tutorial, ui.pause, ui.settings, ui.infoScreen, ui.resetConfirm, ui.badges, ui.stats, ui.upgrades, ui.about, ui.privacy, ui.exitConfirm];
  const gameFrame = document.querySelector('.game-frame');
  const fullscreenButton = document.querySelector('#fullscreen-button');
  if (!nativePlatform && gameFrame.requestFullscreen && document.fullscreenEnabled) fullscreenButton.classList.remove('hidden');
  fullscreenButton.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await gameFrame.requestFullscreen();
      canvas.focus();
    } catch { fullscreenButton.title = t('game.fullscreen.unavailable'); }
  });
  document.addEventListener('fullscreenchange', () => {
    const label = document.fullscreenElement ? t('game.fullscreen.exit') : t('game.fullscreen.enter');
    fullscreenButton.setAttribute('aria-label', label); fullscreenButton.title = label;
  });
  const studioHomeLink = document.querySelector('.studio-home-link');
  const focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let activeModal = null, modalReturnFocus = null;
  const modalFocusOrigins = new WeakMap();
  function syncModalAccessibility() {
    const nextModal = [...modalScreens].reverse().find(screen => screen && !screen.classList.contains('hidden')) || null;
    if (nextModal !== activeModal) {
      const closingModal = activeModal;
      if (nextModal && !activeModal) modalReturnFocus = document.activeElement;
      if (nextModal && document.activeElement && !nextModal.contains(document.activeElement)) modalFocusOrigins.set(nextModal, document.activeElement);
      activeModal = nextModal;
      const nestedReturn = closingModal && modalFocusOrigins.get(closingModal);
      if (activeModal) {
        const openingModal = activeModal;
        queueMicrotask(() => {
          if (activeModal !== openingModal) return;
          if (nestedReturn && openingModal.contains(nestedReturn)) nestedReturn.focus();
          else {
            openingModal.setAttribute('tabindex', '-1');
            openingModal.scrollTop = 0;
            openingModal.focus({ preventScroll: true });
          }
        });
      }
      else {
        const returnTarget = modalReturnFocus; modalReturnFocus = null;
        if (state?.running && !state.paused) queueMicrotask(() => canvas.focus());
        else if (returnTarget?.isConnected && !returnTarget.inert && !returnTarget.closest?.('.hidden')) queueMicrotask(() => returnTarget.focus());
      }
    }
    if (gameFrame) Array.from(gameFrame.children).forEach(child => { if (child.id !== 'storage-warning') child.inert = Boolean(activeModal && child !== activeModal); });
    if (studioHomeLink) studioHomeLink.inert = Boolean(activeModal);
    if (!activeModal && state?.running && !state.paused && document.activeElement !== canvas) canvas.focus();
  }
  function showTutorial() { menuVisible = true; menuDirty = true;
    tutorialReturn = ui.settings.classList.contains('hidden') ? 'home' : 'settings';
    setNativeGameplayActive(false);
    tutorialIndex = 0; tutorialResumesRun = Boolean(state?.running); if (state?.running) state.paused = true;
    ui.home.classList.add('hidden'); ui.end.classList.add('hidden'); ui.upgrades.classList.add('hidden'); ui.about.classList.add('hidden'); ui.badges.classList.add('hidden'); ui.stats.classList.add('hidden'); ui.settings.classList.add('hidden'); ui.pause.classList.add('hidden'); ui.gameTools.classList.add('hidden');
    renderTutorial(); ui.tutorial.classList.remove('hidden'); syncModalAccessibility();
  }
  function finishTutorial() {
    profile.tutorialComplete = true;
    saveProfile(); ui.tutorial.classList.add('hidden');
    if (tutorialResumesRun && state) { menuVisible = false; menuDirty = true; state.paused = false; setNativeGameplayActive(true); startAudio(); ui.gameTools.classList.remove('hidden'); }
    else showHome();
    syncModalAccessibility();
  }
  function updateHomeFit() {
    const content = ui.home.querySelector('.home-content');
    ui.home.classList.remove('home-scroll');
    if (ui.home.classList.contains('hidden') || !window.matchMedia('(hover: none) and (pointer: coarse) and (min-height: 721px), (max-width: 599px) and (min-height: 721px)').matches) return;
    const contentEnd = content.lastElementChild.getBoundingClientRect().bottom;
    const contentBottom = content.getBoundingClientRect().bottom;
    ui.home.classList.toggle('home-scroll', contentEnd > contentBottom + 1 || ui.home.scrollHeight > ui.home.clientHeight + 1);
  }
  function openSettings(from) { menuVisible = true; menuDirty = true; setNativeGameplayActive(false); settingsReturn = from; if (from === 'pause') ui.pause.classList.add('hidden'); else ui.home.classList.add('hidden'); ui.settings.classList.remove('hidden'); syncModalAccessibility(); }
  function closeSettings() { menuDirty = true; ui.settings.classList.add('hidden'); if (settingsReturn === 'pause' && state?.paused) ui.pause.classList.remove('hidden'); else ui.home.classList.remove('hidden'); syncModalAccessibility(); updateHomeFit(); }
  function leaveRunEarly() { if (state?.running && state.paused && !state.ending) { profile.stats.leftEarly++; saveProfile(); } showHome(); }
  function restartPausedRun() { const mode = state?.mode || 'endless'; leaveRunEarly(); start(mode); }
  function start(mode, confirmed = false) {
    if (!confirmed && ['falcon', 'shield', 'powerJump'].some(key => profile[key] > 0)) {
      showHome(); pendingRunMode = mode; ui.home.classList.add('hidden');
      for (const key of ['falcon', 'shield', 'powerJump']) {
        document.querySelector(`#run-${key}-row`).classList.toggle('hidden', profile[key] <= 0);
        document.querySelector(`#run-${key}-toggle`).checked = profile.runUpgrades[key];
        document.querySelector(`#run-${key}-owned`).textContent = key === 'powerJump' ? t('game.upgrade.runLevel', { level: profile[key] }) : t('game.upgrade.runOwned', { count: profile[key] });
      }
      ui.runUpgrades.classList.remove('hidden'); syncModalAccessibility(); return;
    }
    ui.runUpgrades.classList.add('hidden'); menuVisible = false; menuDirty = true; getAudio(); reset(mode); ui.home.classList.add('hidden'); ui.end.classList.add('hidden'); ui.end.classList.remove('visible'); ui.upgrades.classList.add('hidden'); ui.about.classList.add('hidden'); ui.privacy.classList.add('hidden'); ui.badges.classList.add('hidden'); ui.stats.classList.add('hidden'); ui.settings.classList.add('hidden'); ui.resetConfirm.classList.add('hidden'); ui.infoScreen.classList.add('hidden'); ui.exitConfirm.classList.add('hidden'); ui.pause.classList.add('hidden'); if (!profile.tutorialComplete) return showTutorial(); setNativeGameplayActive(true); startAudio(); ui.tutorial.classList.add('hidden'); ui.gameTools.classList.remove('hidden'); syncModalAccessibility(); }
  function showHome() { ui.runUpgrades.classList.add('hidden'); menuVisible = true; menuDirty = true; setNativeGameplayActive(false); clearInput(); if (state) state.running = false; stopMusic(); ui.mobileHud.classList.add('hidden'); updateRecordsUI(); ui.home.classList.remove('hidden'); ui.end.classList.add('hidden'); ui.end.classList.remove('visible'); ui.upgrades.classList.add('hidden'); ui.about.classList.add('hidden'); ui.privacy.classList.add('hidden'); ui.badges.classList.add('hidden'); ui.stats.classList.add('hidden'); ui.tutorial.classList.add('hidden'); ui.settings.classList.add('hidden'); ui.resetConfirm.classList.add('hidden'); ui.infoScreen.classList.add('hidden'); ui.exitConfirm.classList.add('hidden'); ui.pause.classList.add('hidden'); ui.gameTools.classList.add('hidden'); syncModalAccessibility(); updateHomeFit(); }
  function showUpgrades() { menuVisible = true; menuDirty = true; setNativeGameplayActive(false); clearInput(); if (state) state.running = false; stopMusic(); updateUpgradeUI(); ui.home.classList.add('hidden'); ui.end.classList.add('hidden'); ui.upgrades.classList.remove('hidden'); ui.about.classList.add('hidden'); ui.badges.classList.add('hidden'); ui.stats.classList.add('hidden'); ui.settings.classList.add('hidden'); ui.pause.classList.add('hidden'); ui.gameTools.classList.add('hidden'); syncModalAccessibility(); }
  function showAbout() { menuVisible = true; menuDirty = true; setNativeGameplayActive(false); clearInput(); if (state) state.running = false; stopMusic(); ui.home.classList.add('hidden'); ui.end.classList.add('hidden'); ui.upgrades.classList.add('hidden'); ui.about.classList.remove('hidden'); ui.privacy.classList.add('hidden'); ui.badges.classList.add('hidden'); ui.stats.classList.add('hidden'); ui.settings.classList.add('hidden'); ui.pause.classList.add('hidden'); ui.gameTools.classList.add('hidden'); syncModalAccessibility(); }
  function showPrivacy() { menuVisible = true; menuDirty = true; setNativeGameplayActive(false); ui.about.classList.add('hidden'); ui.privacy.classList.remove('hidden'); syncModalAccessibility(); }
  function openExitConfirm() { ui.exitConfirm.classList.remove('hidden'); syncModalAccessibility(); }
  function closeExitConfirm() { ui.exitConfirm.classList.add('hidden'); syncModalAccessibility(); }
  function handleNativeBack() {
    if (!ui.runUpgrades.classList.contains('hidden')) return showHome();
    if (!ui.exitConfirm.classList.contains('hidden')) return closeExitConfirm();
    if (!ui.infoScreen.classList.contains('hidden')) return closeInfo();
    if (!ui.resetConfirm.classList.contains('hidden')) return cancelResetProgress();
    if (!ui.privacy.classList.contains('hidden')) return showAbout();
    if (!ui.tutorial.classList.contains('hidden')) {
      if (tutorialIndex > 0) { tutorialIndex--; renderTutorial(); return; }
      ui.tutorial.classList.add('hidden');
      if (tutorialReturn === 'settings') { ui.settings.classList.remove('hidden'); syncModalAccessibility(); }
      else showHome();
      return;
    }
    if (!ui.settings.classList.contains('hidden')) return closeSettings();
    if ([ui.about, ui.upgrades, ui.badges, ui.stats, ui.end].some(screen => !screen.classList.contains('hidden'))) return showHome();
    if (!ui.pause.classList.contains('hidden')) return resumeGame();
    if (state?.running) { if (!state.ending) pauseGame(); return; }
    if (!ui.home.classList.contains('hidden')) {
      const app = window.Capacitor?.Plugins?.App;
      if (app?.minimizeApp) app.minimizeApp();
      else exitNativeApp();
    }
  }
  function exitNativeApp() { const app = window.Capacitor?.Plugins?.App; if (app?.exitApp) app.exitApp(); else window.close(); }
  function showBadges() { menuVisible = true; menuDirty = true; setNativeGameplayActive(false); renderBadges(); ui.home.classList.add('hidden'); ui.badges.classList.remove('hidden'); ui.stats.classList.add('hidden'); syncModalAccessibility(); }
  function showStats() { menuVisible = true; menuDirty = true; setNativeGameplayActive(false); renderStats(); ui.home.classList.add('hidden'); ui.badges.classList.add('hidden'); ui.stats.classList.remove('hidden'); syncModalAccessibility(); }
  function pauseGame() { if (!state?.running || state.ending) return; menuDirty = true; setNativeGameplayActive(false); clearInput(); state.paused = true; stopMusic(); ui.pause.classList.remove('hidden'); syncModalAccessibility(); }
  function resumeGame() { if (!state?.paused || state.ending || ui.pause.classList.contains('hidden')) return; menuVisible = false; menuDirty = true; state.paused = false; setNativeGameplayActive(true); ui.pause.classList.add('hidden'); syncModalAccessibility(); getAudio(); if (profile.music) setMusic(); }
  function buyUpgrade(type) {
    const costs = { falcon: config.falconCost, shield: config.shieldCost, powerJump: config.powerJumpCosts[profile.powerJump] };
    if (type === 'powerJump' && profile.powerJump >= 5) return updateUpgradeUI('game.upgrade.maxNotice');
    const cost = costs[type];
    if (profile.tokens < cost) return updateUpgradeUI('game.upgrade.needTokens', { count: cost - profile.tokens });
    profile.tokens -= cost; profile[type]++; saveProfile(); sound('purchase'); updateUpgradeUI('game.upgrade.purchased');
  }
  function confirmRunUpgrades() {
    for (const key of ['falcon', 'shield', 'powerJump']) if (profile[key] > 0) profile.runUpgrades[key] = document.querySelector(`#run-${key}-toggle`).checked;
    saveProfile(); start(pendingRunMode, true);
  }
  document.querySelector('#confirm-run-button').addEventListener('click', confirmRunUpgrades);
  document.querySelector('#cancel-run-button').addEventListener('click', showHome);
  ui.modeChoices.forEach(button => button.addEventListener('click', () => start(button.dataset.mode)));
  ui.restart.addEventListener('click', () => start(state?.mode || 'endless'));
  ui.openUpgrades.addEventListener('click', showUpgrades); ui.endUpgrades.addEventListener('click', showUpgrades); ui.endHome.addEventListener('click', showHome); ui.closeUpgrades.addEventListener('click', showHome); ui.openAbout.addEventListener('click', showAbout); ui.closeAbout.addEventListener('click', showHome); ui.openPrivacy.addEventListener('click', showPrivacy); ui.closePrivacy.addEventListener('click', showAbout); ui.confirmExit.addEventListener('click', exitNativeApp); ui.cancelExit.addEventListener('click', closeExitConfirm); ui.openBadges.addEventListener('click', showBadges); ui.closeBadges.addEventListener('click', showHome); ui.openStats.addEventListener('click', showStats); ui.closeStats.addEventListener('click', showHome); ui.openSettings.addEventListener('click', () => openSettings('home')); ui.pauseSettings.addEventListener('click', () => openSettings('pause')); ui.closeSettings.addEventListener('click', closeSettings); ui.replayTutorial.addEventListener('click', showTutorial); ui.resetProgress.addEventListener('click', requestResetProgress); ui.confirmReset.addEventListener('click', resetAllProgress); ui.cancelReset.addEventListener('click', cancelResetProgress);
  ui.buyFalcon.addEventListener('click', () => buyUpgrade('falcon')); ui.buyShield.addEventListener('click', () => buyUpgrade('shield')); ui.buyPower.addEventListener('click', () => buyUpgrade('powerJump'));
  ui.pauseButton.addEventListener('click', pauseGame); ui.resume.addEventListener('click', resumeGame); ui.pauseRestart.addEventListener('click', restartPausedRun); ui.pauseHome.addEventListener('click', leaveRunEarly);
  ui.musicToggle.addEventListener('change', () => { profile.music = ui.musicToggle.checked; saveProfile(); if (profile.music && !state?.paused) startAudio(); else setMusic(); });
  ui.soundToggle.addEventListener('change', () => { profile.sound = ui.soundToggle.checked; saveProfile(); });
  ui.musicStyleSelect.addEventListener('change', () => { profile.musicStyle = ui.musicStyleSelect.value === 'classic' ? 'classic' : 'varied'; saveProfile(); });
  // The info and play buttons sit inside their setting's label; stop the
  // click from reaching the control and open the dialog or sample instead.
  for (const [button, title, note] of [[ui.helpingHandInfo, 'game.settings.helpingHand', ui.helpingHandNote], [ui.reducedMotionInfo, 'game.settings.reducedMotion', ui.reducedMotionNote]]) button.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); openInfo(title, note); });
  ui.musicPreview.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); previewMusic(); });
  ui.closeInfo.addEventListener('click', closeInfo);
  ui.helpingHandToggle.addEventListener('change', () => { menuDirty = true; profile.helpingHand = ui.helpingHandToggle.checked; saveProfile(); });
  ui.reducedMotionToggle.addEventListener('change', () => { menuDirty = true; profile.reducedMotion = ui.reducedMotionToggle.checked; document.documentElement.classList.toggle('reduced-motion', profile.reducedMotion); saveProfile(); });
  ui.tutorialNext.addEventListener('click', () => { if (tutorialIndex < TUTORIAL_STEPS.length - 1) { tutorialIndex++; renderTutorial(); sound('ui'); } else finishTutorial(); });
  ui.tutorialSkip.addEventListener('click', finishTutorial);
  function canvasPointerX(event) {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(rect.width / W, rect.height / H);
    const contentWidth = W * scale, contentLeft = rect.left + (rect.width - contentWidth) / 2;
    return Math.max(0, Math.min(W, (event.clientX - contentLeft) / scale));
  }
  let activePointerId = null, touchAnchor = null;
  function clearInput() { pointerX = null; activePointerId = null; touchAnchor = null; keys.clear(); gamepadSteer = 0; }
  function steeringKey(key) { return key.toLowerCase() === 'a' ? 'ArrowLeft' : key.toLowerCase() === 'd' ? 'ArrowRight' : key; }
  function pollGamepad() {
    let pads;
    try { pads = navigator.getGamepads?.() || []; }
    catch { gamepadSteer = 0; return; } // Some embeds deny the gamepad permission.
    const pad = Array.from(pads).find(pad => pad?.connected && pad.mapping === 'standard');
    const a = Boolean(pad?.buttons[0]?.pressed);
    const pause = Boolean(pad?.buttons[1]?.pressed || pad?.buttons[9]?.pressed);
    const previous = gamepadButtons;
    gamepadButtons = { a, pause };
    gamepadSteer = 0;
    if (!gamepadFocused || document.hidden || !pad) return;
    if (pause && !previous.pause && activeModal === ui.runUpgrades) showHome();
    else if (pause && !previous.pause && state?.running && !state.paused) pauseGame();
    else if (a && !previous.a) {
      if (activeModal === ui.runUpgrades) confirmRunUpgrades();
      else if (activeModal === ui.pause) resumeGame();
      else if (!activeModal && !ui.home.classList.contains('hidden') && !document.activeElement?.closest?.('select, input, textarea')) start('endless');
    }
    if (state?.running && !state.paused && !menuVisible) gamepadSteer = rules.gamepadSteering(pad.axes[0], pad.buttons[14]?.pressed, pad.buttons[15]?.pressed);
  }
  canvas.addEventListener('pointerdown', e => {
    if (activePointerId !== null || !state?.running || state.paused) return;
    activePointerId = e.pointerId;
    const x = canvasPointerX(e);
    touchAnchor = e.pointerType === 'touch' ? { finger: x, player: state.player.x } : null;
    pointerX = touchAnchor ? state.player.x : x;
    canvas.setPointerCapture?.(e.pointerId);
  });
  canvas.addEventListener('pointermove', e => {
    if (e.pointerId !== activePointerId || !e.buttons) return;
    const x = canvasPointerX(e);
    pointerX = touchAnchor ? Math.max(state.player.w / 2, Math.min(W - state.player.w / 2, touchAnchor.player + x - touchAnchor.finger)) : x;
  });
  const releasePointer = e => { if (!e || e.pointerId === activePointerId) clearInput(); };
  canvas.addEventListener('pointerup', releasePointer);
  canvas.addEventListener('pointercancel', releasePointer);
  canvas.addEventListener('lostpointercapture', releasePointer);
  document.addEventListener('keydown', e => {
    if (e.key === 'Tab' && activeModal) {
      const focusable = Array.from(activeModal.querySelectorAll(focusableSelector)).filter(element => !element.closest('.hidden'));
      if (focusable.length) {
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && (document.activeElement === activeModal || document.activeElement === first || !activeModal.contains(document.activeElement))) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
      }
      return;
    }
    if (e.key === 'Escape') { if (!ui.runUpgrades.classList.contains('hidden')) { showHome(); e.preventDefault(); return; } if (!ui.pause.classList.contains('hidden')) resumeGame(); else if (state?.running && !state.paused) pauseGame(); e.preventDefault(); return; }
    if (['Enter', ' '].includes(e.key) && !e.repeat && !activeModal && !ui.home.classList.contains('hidden') && !e.target?.closest?.('button, a, input, select, textarea')) { e.preventDefault(); start('endless'); return; }
    const key = steeringKey(e.key);
    if (['ArrowLeft', 'ArrowRight'].includes(key) && state?.running && !state.paused) { keys.add(key); e.preventDefault(); }
  });
  document.addEventListener('keyup', e => keys.delete(steeringKey(e.key)));
  window.addEventListener('resize', updateHomeFit);
  window.addEventListener('load', updateHomeFit, { once: true });
  window.addEventListener('blur', () => { gamepadFocused = false; const wasActive = state?.running && !state.paused; clearInput(); if (wasActive) pauseGame(); });
  window.addEventListener('focus', () => { gamepadFocused = true; });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { const wasActive = state?.running && !state.paused; clearInput(); if (wasActive) pauseGame(); } });
  i18n.onChange(() => {
    // Refresh presentation only: changing language must never reset a paused run,
    // award results twice, write the profile, or move keyboard focus.
    if (state?.messageId) state.message = t(state.messageId, state.messageParams);
    updateUpgradeUI(upgradeMessageId, upgradeMessageParams);
    updateRecordsUI(); renderBadges(); renderStats(); renderTutorial(); renderResult();
    if (activeBadge) ui.badgeToastName.textContent = t(activeBadge.title);
    if (infoContent) { ui.infoHeading.textContent = t(infoContent.title); ui.infoBody.textContent = infoContent.note.textContent; }
    const storageWarning = document.querySelector('#storage-warning');
    if (storageWarning && !storageAvailable) storageWarning.textContent = t(storageWarningId);
    for (const key of ['falcon', 'shield', 'powerJump']) {
      document.querySelector(`#run-${key}-owned`).textContent = key === 'powerJump' ? t('game.upgrade.runLevel', { level: profile[key] }) : t('game.upgrade.runOwned', { count: profile[key] });
    }
    const fullscreenLabel = t(document.fullscreenElement ? 'game.fullscreen.exit' : 'game.fullscreen.enter');
    fullscreenButton.setAttribute('aria-label', fullscreenLabel); fullscreenButton.title = fullscreenLabel;
    hudText.clear(); updateMobileHud(); menuDirty = true; updateHomeFit();
  });
  window.sevaJumpNativeBack = handleNativeBack; window.Capacitor?.Plugins?.App?.addListener?.('backButton', handleNativeBack); setNativeGameplayActive(false); applyPreferences(); setSelectedCharacter(selectedCharacter); reset(); state.running = false; updateUpgradeUI(); updateRecordsUI(); renderBadges(); renderStats(); requestAnimationFrame(loop);
  // The native apps package every file, and a worker would replay the previous
  // release after an app update. Remove one left by an earlier build there.
  const capacitorApp = Boolean(window.Capacitor?.isNativePlatform?.() || window.SevaJumpAndroid);
  if (capacitorApp) {
    navigator.serviceWorker?.getRegistrations?.().then(registrations => registrations.forEach(registration => registration.unregister())).catch(() => {});
    window.caches?.keys?.().then(keys => keys.filter(key => key.startsWith('seva-jump-')).forEach(key => caches.delete(key))).catch(() => {});
  } else if ('serviceWorker' in navigator && location.protocol !== 'file:') window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
})();
