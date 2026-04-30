const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const boot = document.getElementById("boot");
const bootKicker = document.getElementById("bootKicker");
const bootTitle = document.getElementById("bootTitle");
const bootSubtitle = document.getElementById("bootSubtitle");
const bootHint = document.getElementById("bootHint");
const sceneOverlay = document.getElementById("sceneOverlay");
const sceneCard = sceneOverlay?.querySelector(".scene-card") ?? null;
const sceneFigure = document.getElementById("sceneFigure");
const scenePortrait = document.getElementById("scenePortrait");
const sceneKicker = document.getElementById("sceneKicker");
const sceneTitle = document.getElementById("sceneTitle");
const sceneBody = document.getElementById("sceneBody");
const sceneActions = document.getElementById("sceneActions");
const playButton = document.getElementById("playButton");
const singleModeButton = document.getElementById("singleModeButton");
const coopModeButton = document.getElementById("coopModeButton");
const settingsButton = document.getElementById("settingsButton");
const settingsPanel = document.getElementById("settingsPanel");
const soundToggleButton = document.getElementById("soundToggleButton");
const effectsToggleButton = document.getElementById("effectsToggleButton");
const lifelineButton = document.getElementById("lifelineButton");
const moveLeftButton = document.getElementById("moveLeftButton");
const moveRightButton = document.getElementById("moveRightButton");
const jumpButton = document.getElementById("jumpButton");
const attackButton = document.getElementById("attackButton");
const gameplayUi = Array.from(document.querySelectorAll(".gameplay-ui"));
const scoreValue = document.getElementById("scoreValue");
const highScoreValue = document.getElementById("highScoreValue");
const weaponValue = document.getElementById("weaponValue");
const modeValue = document.getElementById("modeValue");
const phaseValue = document.getElementById("phaseValue");
const healthValue = document.getElementById("healthValue");
const healthFill = document.getElementById("healthFill");

const DPR = Math.min(window.devicePixelRatio || 1, 2);
const TAU = Math.PI * 2;
const STORAGE_KEY = "problematic-silence-high-score";
const MAX_PARTICLES = 220;
const MAX_PROJECTILES = 18;
const MAX_ENEMIES_SOLO = 8;
const MAX_ENEMIES_MULTI = 10;
const MAX_COLOSSI = 1;
const WORLD = {
  groundY: 0,
  skyHeight: 0,
  left: -2800,
  right: 2800,
};
const STORY_SCENES = {
  level1: "level1",
  warning: "warning",
  doors: "doors",
  scream: "scream",
  dogIntro: "dogIntro",
  boneHunt: "boneHunt",
  puzzle: "puzzle",
  complete: "complete",
  level3Intro: "level3Intro",
  level3Battle: "level3Battle",
  level3Farewell: "level3Farewell",
  level3Trophy: "level3Trophy",
  level3Cliffhanger: "level3Cliffhanger",
};
const STORY_POINTS = {
  levelOneStartX: -1760,
  levelOneExitX: 1580,
  doorApproachX: 140,
  doorStartX: 0,
  doorGap: 250,
  afterDoorX: 1020,
  boneShrineX: 760,
  boneY: 92,
  dogWaitX: 1420,
  dogSpawnX: 1580,
  runeStartX: 1240,
  runeGap: 210,
  plateStartX: 2060,
  plateGap: 220,
  puzzleExitX: 2720,
  levelThreeStartX: -120,
  levelThreeBossX: 980,
};
const DOOR_COUNT = 3;
const LEVEL3_GUIDE_LINES = [
  "YAAR: This silence is alive. Do not trust what copies you.",
  "YAAR: Those shadows are memories wearing your shape.",
  "YAAR: The true Colossus feeds on everything left unsaid.",
  "YAAR: Keep moving. Keep hearing me. You are not alone here.",
];
const LEVEL3_END_QUOTE = '"Silence was never empty... it was waiting for you to hear it."';
const LEVEL3_TROPHY_DURATION = 7.2;
const LEVEL3_CLIFFHANGER_DURATION = 9.4;
const PROBLEMATIC_SILENCE_EXPLANATION =
  "Problematic Silence is what happens when fear, anger, boredom, and swallowed words stop being quiet and start becoming a place. This arena is built from every feeling you tried not to say out loud.";

const PLAYER_PROFILES = [
  {
    id: "p1",
    name: "P1",
    accent: "#86d7ff",
    accentGlow: "rgba(134, 215, 255, 0.88)",
    secondary: "#f0c883",
    primaryControls: "A / D Move  W Jump  Space Defend",
  },
  {
    id: "p2",
    name: "P2",
    accent: "#ff8d72",
    accentGlow: "rgba(255, 141, 114, 0.88)",
    secondary: "#ffe3b2",
    primaryControls: "J / L Move  I Jump  Enter Defend",
  },
];

const CONTROL_MAP = {
  p1: {
    left: ["KeyA", "ArrowLeft"],
    right: ["KeyD", "ArrowRight"],
    jump: ["KeyW", "ArrowUp"],
    attack: ["Space"],
  },
  p2: {
    left: ["KeyJ"],
    right: ["KeyL"],
    jump: ["KeyI"],
    attack: ["Enter", "NumpadEnter"],
  },
};

const WEAPON_TYPES = [
  {
    kind: "blade",
    ammo: 1,
    tint: "#f0c883",
    glow: "rgba(240, 200, 131, 0.34)",
  },
  {
    kind: "spear",
    ammo: 2,
    tint: "#86d7ff",
    glow: "rgba(134, 215, 255, 0.34)",
  },
  {
    kind: "axe",
    ammo: 1,
    tint: "#ff8d72",
    glow: "rgba(255, 141, 114, 0.34)",
  },
];

const ENEMY_TEMPLATES = {
  wisp: {
    label: "Wisp",
    category: "ghost",
    style: "hover",
    width: [24, 32],
    height: [34, 44],
    speed: [120, 170],
    damage: [7, 11],
    health: 1,
    score: 90,
    tintA: "#b8f3ff",
    tintB: "#3a6c7c",
  },
  specter: {
    label: "Specter",
    category: "ghost",
    style: "dash",
    width: [30, 40],
    height: [48, 60],
    speed: [150, 210],
    damage: [10, 14],
    health: 2,
    score: 150,
    tintA: "#a4d7ff",
    tintB: "#203d63",
  },
  crawler: {
    label: "Crawler",
    category: "monster",
    style: "ground",
    width: [38, 48],
    height: [24, 34],
    speed: [150, 210],
    damage: [10, 15],
    health: 1,
    score: 120,
    tintA: "#f0c883",
    tintB: "#6a4d27",
  },
  brute: {
    label: "Brute",
    category: "monster",
    style: "heavy",
    width: [54, 66],
    height: [56, 72],
    speed: [95, 130],
    damage: [16, 22],
    health: 4,
    score: 240,
    tintA: "#ff8d72",
    tintB: "#5e2622",
  },
  colossus: {
    label: "Syntax Colossus",
    category: "monster",
    style: "giant",
    width: [92, 112],
    height: [98, 126],
    speed: [215, 280],
    damage: [24, 32],
    health: 9,
    score: 700,
    tintA: "#ecff8d",
    tintB: "#305237",
  },
};

const state = createState();

function createState() {
  return {
    mode: "boot",
    selectedMode: "single",
    time: 0,
    delta: 0,
    lastTick: 0,
    elapsed: 0,
    score: 0,
    highScore: loadHighScore(),
    phase: 1,
    phaseEnergy: 0,
    phaseFlash: 0,
    settingsOpen: false,
    overlayVisible: false,
    endingMood: "thankYou",
    gameoverType: "standard",
    lastPickupFxAt: -100,
    cameraX: 0,
    screenShake: 0,
    pointerActive: false,
    pointerId: null,
    pointerMove: 0,
    backdrop: createBackdrop(),
    arena: createArenaFeatures(),
    players: createPlayers("single"),
    story: createStoryState(),
    enemies: [],
    weaponDrops: [],
    projectiles: [],
    particles: [],
    input: createInputState(),
    spawnEnemyTimer: 0.9,
    spawnWeaponTimer: 0.6,
    giantSpawnTimer: 8,
    notice: {
      text: "",
      color: "rgba(217, 221, 227, 0.92)",
      timer: 0,
    },
    ui: {
      score: null,
      highScore: null,
      weapons: null,
      mode: null,
      phase: null,
      health: null,
      healthText: null,
    },
    settings: {
      soundEnabled: true,
      effectsMode: "high",
    },
    audio: null,
  };
}

function createInputState() {
  return {
    p1: {
      left: false,
      right: false,
      lastDirection: 1,
      jumpQueued: 0,
      attackQueued: 0,
    },
    p2: {
      left: false,
      right: false,
      lastDirection: 1,
      jumpQueued: 0,
      attackQueued: 0,
    },
  };
}

function createLevel3State() {
  return {
    active: false,
    guideIndex: 0,
    guideTimer: 4.5,
    echoSpawnTimer: 1.5,
    glitch: 0,
    calm: 0,
    dogFade: 1,
    finaleFade: 0,
    trophyGlow: 0,
    cutsceneBeat: 0,
    shadows: [],
    echoes: [],
    boss: {
      active: false,
      x: STORY_POINTS.levelThreeBossX,
      y: 54,
      vx: 0,
      width: 148,
      height: 168,
      health: 44,
      maxHealth: 44,
      opacity: 0,
      pulse: 0,
      surgeTimer: 2.2,
      impactPulse: 0,
      finalStrike: false,
      finalStrikeTimer: 0,
      defeated: false,
      damage: 16,
    },
  };
}

function createStoryState() {
  return {
    level: 1,
    scene: STORY_SCENES.level1,
    sceneTimer: 0,
    levelStartX: STORY_POINTS.levelOneStartX,
    levelExitX: STORY_POINTS.levelOneExitX,
    correctDoorIndex: Math.floor(Math.random() * DOOR_COUNT),
    lastDoorChoice: -1,
    wrongDoorPulse: 0,
    bone: {
      x: STORY_POINTS.boneShrineX,
      y: STORY_POINTS.boneY,
      found: false,
      returned: false,
      carrierId: null,
      reveal: 0,
    },
    puzzles: {
      rune: {
        solved: false,
        progress: 0,
        order: [1, 0, 2],
        positions: [0, 1, 2].map((index) => STORY_POINTS.runeStartX + index * STORY_POINTS.runeGap),
        activated: [false, false, false],
        wrongPulse: 0,
      },
      plates: {
        solved: false,
        progress: 0,
        order: [2, 0, 1],
        positions: [0, 1, 2].map((index) => STORY_POINTS.plateStartX + index * STORY_POINTS.plateGap),
        colors: ["Azure", "Gold", "Crimson"],
        activated: [false, false, false],
        cooldown: 0,
        wrongPulse: 0,
      },
    },
    dog: {
      active: false,
      tamed: false,
      trust: 0,
      x: STORY_POINTS.dogSpawnX,
      y: 0,
      vx: 0,
      name: "SyntaxYaaR",
      nickname: "YAAR",
    },
    level3: createLevel3State(),
  };
}

function createPlayers(mode = "single") {
  if (mode === "coop") {
    return [
      createPlayer(PLAYER_PROFILES[0], -124),
      createPlayer(PLAYER_PROFILES[1], -52),
    ];
  }

  return [createPlayer(PLAYER_PROFILES[0], -92)];
}

function createPlayer(profile, startX) {
  return {
    id: profile.id,
    name: profile.name,
    accent: profile.accent,
    accentGlow: profile.accentGlow,
    secondary: profile.secondary,
    x: startX,
    y: 0,
    vx: 0,
    vy: 0,
    width: 28,
    height: 58,
    speed: 500,
    jumpPower: 620,
    gravity: 1540,
    facing: profile.id === "p1" ? 1 : -1,
    onGround: true,
    alive: true,
    health: 140,
    maxHealth: 140,
    attackCooldown: 0,
    invulnerability: 0,
    attackPulse: 0,
    jumpPulse: 0,
    runCycle: 0,
    glow: 0,
    weaponCharges: 6,
    hasBone: false,
    shortcutCooldown: 0,
  };
}

function createArenaFeatures() {
  return {
    traps: [
      { type: "spike", x: -2140, width: 130, damage: 8, label: "Spike Rail" },
      { type: "mine", x: -860, width: 96, damage: 9, rate: 1.8, offset: 0.4, label: "Pulse Mine" },
      { type: "spike", x: 460, width: 118, damage: 8, label: "Spine Teeth" },
      { type: "mine", x: 1970, width: 108, damage: 10, rate: 2.15, offset: 1.2, label: "Shock Well" },
    ],
    shortcuts: [
      {
        id: "west-rift",
        x: -2510,
        width: 74,
        height: 152,
        exitX: -980,
        exitY: 92,
        hint: "Shadow Rift",
      },
      {
        id: "east-rift",
        x: 980,
        width: 72,
        height: 152,
        exitX: 2480,
        exitY: 108,
        hint: "Syntax Tunnel",
      },
    ],
  };
}

function createBackdrop() {
  const span = WORLD.right - WORLD.left;
  const monuments = [];
  const markers = [];
  const stars = [];
  const towers = [];

  for (let i = 0; i < 78; i += 1) {
    stars.push({
      x: Math.random(),
      y: rand(0.04, 0.56),
      radius: rand(0.8, 2.2),
      alpha: rand(0.2, 0.9),
      twinkle: rand(0.5, 2),
    });
  }

  for (let i = 0; i < 18; i += 1) {
    const ratio = i / 17;
    monuments.push({
      x: WORLD.left + 120 + ratio * (span - 240) + rand(-64, 64),
      width: rand(24, 48),
      height: rand(120, 280),
      cap: rand(0.18, 0.52),
      parallax: rand(0.2, 0.5),
    });
  }

  for (let i = 0; i < 24; i += 1) {
    const ratio = i / 23;
    towers.push({
      x: WORLD.left + 140 + ratio * (span - 280) + rand(-58, 58),
      width: rand(18, 32),
      height: rand(180, 330),
      parallax: rand(0.1, 0.24),
    });
  }

  for (let i = 0; i < 50; i += 1) {
    const ratio = i / 49;
    markers.push({
      x: WORLD.left + ratio * span + rand(-28, 28),
      height: rand(24, 58),
      width: rand(6, 16),
      tilt: rand(-0.16, 0.16),
    });
  }

  return { stars, monuments, towers, markers };
}

function loadHighScore() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? Math.max(0, Number.parseInt(raw, 10) || 0) : 0;
  } catch {
    return 0;
  }
}

function saveHighScore(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // Keep the game playable even when storage is unavailable.
  }
}

function resize() {
  canvas.width = Math.floor(window.innerWidth * DPR);
  canvas.height = Math.floor(window.innerHeight * DPR);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  WORLD.groundY = window.innerHeight * 0.8;
  WORLD.skyHeight = Math.max(400, window.innerHeight * 0.92);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function ease(current, target, speed, dt) {
  return lerp(current, target, 1 - Math.exp(-speed * dt));
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function sign(value) {
  if (value > 0) return 1;
  if (value < 0) return -1;
  return 0;
}

function worldToScreenX(x) {
  return window.innerWidth * 0.5 + (x - state.cameraX);
}

function setBootContent(kicker, title, subtitle, hint) {
  bootKicker.textContent = kicker;
  bootTitle.textContent = title;
  bootSubtitle.textContent = subtitle;
  bootHint.textContent = hint;
}

function setPlayButtonLabel(label) {
  if (playButton) {
    playButton.textContent = label;
  }
}

function setOverlayVisible(visible, theme = "default", figure = "") {
  state.overlayVisible = visible;

  if (!sceneOverlay) return;

  sceneOverlay.classList.toggle("is-visible", visible);
  sceneOverlay.classList.toggle("blackout", theme === "blackout");
  sceneOverlay.setAttribute("aria-hidden", String(!visible));

  if (sceneFigure) {
    sceneFigure.className = "scene-figure";
    if (scenePortrait?.classList.contains("is-visible")) {
      sceneFigure.classList.add("is-visible");
    } else if (figure) {
      sceneFigure.classList.add("is-visible", figure);
    }
  }

  if (!visible && sceneCard) {
    sceneCard.classList.remove("frameless");
  }

  if (!visible && scenePortrait) {
    scenePortrait.classList.remove("is-visible");
    scenePortrait.removeAttribute("src");
    scenePortrait.alt = "";
  }
}

function releaseSceneActions() {
  if (!sceneActions) return;
  sceneActions.replaceChildren();
}

function showSceneOverlay({
  kicker = "Unknown Signal",
  title = "...",
  body = "",
  theme = "default",
  figure = "",
  frameless = false,
  portraitSrc = "",
  portraitAlt = "",
  actions = [],
}) {
  if (sceneKicker) {
    sceneKicker.textContent = kicker;
  }

  if (sceneTitle) {
    sceneTitle.textContent = title;
  }

  if (sceneBody) {
    sceneBody.textContent = body;
  }

  releaseSceneActions();

  if (sceneCard) {
    sceneCard.classList.toggle("frameless", frameless);
  }

  if (scenePortrait) {
    if (portraitSrc) {
      scenePortrait.src = portraitSrc;
      scenePortrait.alt = portraitAlt;
      scenePortrait.classList.add("is-visible");
    } else {
      scenePortrait.classList.remove("is-visible");
      scenePortrait.removeAttribute("src");
      scenePortrait.alt = "";
    }
  }

  for (const action of actions) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `scene-action${action.variant ? ` ${action.variant}` : ""}`;
    button.textContent = action.label;
    button.addEventListener("click", (event) => {
      event.preventDefault();
      action.onSelect?.();
      releaseControlFocus(button);
    });
    sceneActions?.appendChild(button);
  }

  setOverlayVisible(true, theme, figure);
}

function hideSceneOverlay() {
  releaseSceneActions();
  setOverlayVisible(false);
}

function getSelectedModeLabel() {
  return state.selectedMode === "coop" ? "Co-op" : "Solo";
}

function getDefaultModeSubtitle() {
  return state.selectedMode === "coop"
    ? "Founded by Rudra. Take two hunters through level 1, survive the forbidden doors, solve YAAR's puzzles, and face the silence together in level 3."
    : "Founded by Rudra. Cross level 1, survive the forbidden doors, solve YAAR's puzzles, and face the silence in level 3.";
}

function getDefaultModeHint() {
  return state.selectedMode === "coop"
    ? "Co-op: P1 uses A / D or Left / Right, W or Up, Space. P2 uses J / L move, I jump, Enter defend. Touch controls remain mapped to P1."
    : "Single Player: A / D or Left / Right move, W or Up jump, Space defend. Reach each gate to uncover the full story.";
}

function updateDashboardModeLabel() {
  if (state.mode === "gameover") {
    if (state.gameoverType === "ending") {
      setEndingBootContent();
    } else {
      setGameOverBootContent();
    }
    return;
  }

  setDefaultBootContent();
}

function updateSettingsButtons() {
  if (soundToggleButton) {
    soundToggleButton.textContent = state.settings.soundEnabled ? "Sound On" : "Sound Off";
    soundToggleButton.classList.toggle("active", state.settings.soundEnabled);
  }

  if (effectsToggleButton) {
    effectsToggleButton.textContent =
      state.settings.effectsMode === "high" ? "High FX" : "Low FX";
    effectsToggleButton.classList.toggle("active", state.settings.effectsMode === "high");
  }
}

function setSettingsOpen(open) {
  state.settingsOpen = open;

  if (settingsPanel) {
    settingsPanel.setAttribute("aria-hidden", String(!open));
  }

  if (settingsButton) {
    settingsButton.classList.toggle("active", open);
  }
}

function setDefaultBootContent() {
  setPlayButtonLabel("Play");
  setBootContent(
    "SyntaxShell Company",
    "Problematic Silence",
    getDefaultModeSubtitle(),
    getDefaultModeHint()
  );
}

function setGameOverBootContent() {
  const finalScore = Math.floor(state.score);
  setPlayButtonLabel("Play Again");
  setBootContent(
    "SyntaxShell Company",
    "Run Ended",
    `${getSelectedModeLabel()} score ${finalScore}. High score ${state.highScore}.`,
    "Adjust settings if you want, then press Play to launch another run."
  );
}

function setSelectedMode(mode = "single") {
  state.selectedMode = mode === "coop" ? "coop" : "single";
  updateModeButtons();
  updateDashboardModeLabel();
  syncHud(true);
}

function updateModeButtons() {
  const singleActive = state.selectedMode !== "coop";
  const coopActive = state.selectedMode === "coop";

  if (singleModeButton) {
    singleModeButton.classList.toggle("active", singleActive);
    singleModeButton.setAttribute("aria-pressed", String(singleActive));
  }

  if (coopModeButton) {
    coopModeButton.classList.toggle("active", coopActive);
    coopModeButton.setAttribute("aria-pressed", String(coopActive));
  }
}

function startIntroFlow() {
  ensureAudio();
  clearMovementState();
  hideBoot();
  setGameplayUiVisible(false);
  state.mode = "intro";

  showSceneOverlay({
    kicker: "Unknown Signal",
    title: "So You Want Play?",
    body: "Pause again. One second.",
    theme: "blackout",
    frameless: true,
    portraitSrc: "watermark.jpeg",
    portraitAlt: "SyntaxShell talking entity watermark",
    actions: [
      {
        label: "Yeah, fine.",
        variant: "primary",
        onSelect: showIntroHmmScene,
      },
    ],
  });
}

function showIntroHmmScene() {
  showSceneOverlay({
    kicker: "Unknown Signal",
    title: "hmmm...",
    body: "You walked all the way here, so the corridor wants a reason.",
    theme: "blackout",
    frameless: true,
    portraitSrc: "watermark.jpeg",
    portraitAlt: "SyntaxShell talking entity watermark",
    actions: [
      {
        label: "Keep Listening",
        variant: "primary",
        onSelect: showIntroMotivationScene,
      },
    ],
  });
}

function showIntroMotivationScene() {
  showSceneOverlay({
    kicker: "Unknown Signal",
    title: "Why You Want To Play",
    body: "Choose carefully. The silence is nosy and a little dramatic.",
    theme: "blackout",
    frameless: true,
    portraitSrc: "watermark.jpeg",
    portraitAlt: "SyntaxShell talking entity watermark",
    actions: [
      {
        label: "I'm bored",
        onSelect: () =>
          showIntroResponseScene(
            "Excellent. Boredom is just danger yawning before it starts running."
          ),
      },
      {
        label: "I'm angry",
        onSelect: () =>
          showIntroResponseScene(
            "Perfect. We converted your rage into renewable haunted electricity."
          ),
      },
      {
        label: "Why should I tell you",
        onSelect: () =>
          showIntroResponseScene(
            "Suspicious. Rude. Honestly? That's exactly the correct attitude for this place."
          ),
      },
    ],
  });
}

function showIntroResponseScene(reply) {
  showSceneOverlay({
    kicker: "Corridor Response",
    title: "Accepted",
    body: reply,
    theme: "blackout",
    frameless: true,
    portraitSrc: "watermark.jpeg",
    portraitAlt: "SyntaxShell talking entity watermark",
    actions: [
      {
        label: "What Is Problematic Silence?",
        variant: "primary",
        onSelect: showProblematicSilenceReveal,
      },
    ],
  });
}

function showProblematicSilenceReveal() {
  showSceneOverlay({
    kicker: "Black Scene",
    title: "Problematic Silence",
    body: PROBLEMATIC_SILENCE_EXPLANATION,
    theme: "blackout",
    frameless: true,
    portraitSrc: "watermark.jpeg",
    portraitAlt: "SyntaxShell talking entity watermark",
    actions: [
      {
        label: "Start Level 1",
        variant: "primary",
        onSelect: () => {
          hideSceneOverlay();
          beginRound();
        },
      },
    ],
  });
}

function resumeGameplay() {
  hideSceneOverlay();
  state.mode = "playing";
}

function openLifelineMenu() {
  if (state.mode !== "playing" && state.mode !== "paused") return;

  state.mode = "paused";
  clearMovementState();

  showSceneOverlay({
    kicker: "Lifeline",
    title: "Breathing Room",
    body: "Take a second. Tune the run, jump back in, or restart from the top.",
    actions: [
      {
        label: "Resume",
        variant: "primary",
        onSelect: resumeGameplay,
      },
      {
        label: "Play Again",
        onSelect: () => {
          hideSceneOverlay();
          beginRound();
        },
      },
      {
        label: state.settings.soundEnabled ? "Sound On" : "Sound Off",
        onSelect: () => {
          state.settings.soundEnabled = !state.settings.soundEnabled;
          if (state.settings.soundEnabled) {
            ensureAudio();
          }
          updateSettingsButtons();
          openLifelineMenu();
        },
      },
      {
        label: state.settings.effectsMode === "high" ? "High FX" : "Low FX",
        onSelect: () => {
          state.settings.effectsMode =
            state.settings.effectsMode === "high" ? "low" : "high";
          updateSettingsButtons();
          openLifelineMenu();
        },
      },
    ],
  });
}

function showBoot() {
  hideSceneOverlay();
  updateDashboardModeLabel();
  updateSettingsButtons();
  boot.classList.remove("hidden");
  setGameplayUiVisible(false);
}

function hideBoot() {
  boot.classList.add("hidden");
  setSettingsOpen(false);
  setGameplayUiVisible(true);
}

function setGameplayUiVisible(visible) {
  for (const element of gameplayUi) {
    element.classList.toggle("is-active", visible);
    element.setAttribute("aria-hidden", visible ? "false" : "true");
  }
}

function releaseControlFocus(element) {
  if (typeof element?.blur === "function") {
    element.blur();
  }
}

function clearMovementState() {
  state.pointerActive = false;
  state.pointerId = null;
  state.pointerMove = 0;
  state.input = createInputState();
}

function ensureAudio() {
  if (!state.settings.soundEnabled) {
    return;
  }

  if (state.audio) {
    if (state.audio.ctx.state === "suspended") {
      state.audio.ctx.resume().catch(() => {});
    }
    return;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  const audioCtx = new AudioContextClass();
  const master = audioCtx.createGain();
  const humGain = audioCtx.createGain();
  const pulseGain = audioCtx.createGain();
  const hum = audioCtx.createOscillator();
  const pulse = audioCtx.createOscillator();
  const filter = audioCtx.createBiquadFilter();

  master.gain.value = 0.22;
  humGain.gain.value = 0.015;
  pulseGain.gain.value = 0.0025;
  filter.type = "lowpass";
  filter.frequency.value = 620;

  hum.type = "triangle";
  hum.frequency.value = 62;
  pulse.type = "sine";
  pulse.frequency.value = 172;

  hum.connect(humGain);
  pulse.connect(pulseGain);
  humGain.connect(filter);
  pulseGain.connect(filter);
  filter.connect(master);
  master.connect(audioCtx.destination);

  hum.start();
  pulse.start();

  state.audio = {
    ctx: audioCtx,
    master,
    hum,
    humGain,
    pulse,
    pulseGain,
    filter,
  };

  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
}

function playSound(kind) {
  if (!state.audio || !state.settings.soundEnabled) return;

  try {
    const { ctx: audioCtx, master } = state.audio;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(master);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };

    switch (kind) {
      case "jump":
        osc.type = "triangle";
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.08);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
        osc.stop(now + 0.16);
        break;
      case "pickup":
        osc.type = "square";
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(760, now + 0.08);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.045, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
        osc.stop(now + 0.16);
        break;
      case "attack":
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.07, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
        osc.stop(now + 0.18);
        break;
      case "empty":
        osc.type = "square";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.05, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        osc.stop(now + 0.14);
        break;
      case "hit":
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(82, now + 0.18);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.09, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
        osc.stop(now + 0.24);
        break;
      case "kill":
        osc.type = "triangle";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.16);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.07, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
        osc.stop(now + 0.24);
        break;
      case "phase":
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.26);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.11, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        osc.stop(now + 0.45);
        break;
      case "warp":
        osc.type = "triangle";
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(680, now + 0.16);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.085, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
        osc.stop(now + 0.26);
        break;
      case "scream":
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(780, now);
        osc.frequency.exponentialRampToValueAtTime(190, now + 0.26);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.1, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
        osc.stop(now + 0.34);
        break;
      case "friend":
        osc.type = "triangle";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.12);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.06, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
        osc.stop(now + 0.22);
        break;
      case "gameover":
        osc.type = "triangle";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.45);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        osc.stop(now + 0.52);
        break;
      case "stomp":
        osc.type = "square";
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
        osc.stop(now + 0.2);
        break;
      default:
        osc.type = "sine";
        osc.frequency.setValueAtTime(220, now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.04, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
        osc.stop(now + 0.18);
        break;
    }

    osc.start(now);
  } catch (error) {
    console.error("Sound playback failed:", kind, error);
    state.settings.soundEnabled = false;
    updateSettingsButtons();
  }
}

function updateAudio(dt) {
  if (!state.audio) return;

  if (!state.settings.soundEnabled) {
    state.audio.master.gain.setTargetAtTime(0.0001, state.audio.ctx.currentTime, 0.08);
    state.audio.humGain.gain.setTargetAtTime(0.0001, state.audio.ctx.currentTime, 0.08);
    state.audio.pulseGain.gain.setTargetAtTime(0.0001, state.audio.ctx.currentTime, 0.08);
    return;
  }

  state.audio.master.gain.setTargetAtTime(0.22, state.audio.ctx.currentTime, 0.12);

  const activePlayers = getLivingPlayers().length;
  const intensity =
    clamp(
      0.018 +
        state.phaseEnergy * 0.024 +
        (state.mode === "playing" ? 0.008 : 0) +
        state.enemies.length * 0.0012,
      0.014,
      0.06
    );
  const pulseLevel = clamp(
    0.002 + state.phaseEnergy * 0.012 + (state.mode === "playing" ? activePlayers * 0.0015 : 0),
    0.001,
    0.028
  );

  state.audio.humGain.gain.setTargetAtTime(intensity, state.audio.ctx.currentTime, 0.8);
  state.audio.pulseGain.gain.setTargetAtTime(pulseLevel, state.audio.ctx.currentTime, 0.18);
  state.audio.filter.frequency.setTargetAtTime(
    520 + state.phaseEnergy * 760,
    state.audio.ctx.currentTime,
    0.45
  );
  state.audio.hum.frequency.setTargetAtTime(
    62 + state.phaseEnergy * 18,
    state.audio.ctx.currentTime,
    0.7
  );
  state.audio.pulse.frequency.setTargetAtTime(
    172 + Math.sin(state.time * 2.1) * 12 + state.phaseEnergy * 86,
    state.audio.ctx.currentTime,
    0.12
  );
}

function beginRound() {
  ensureAudio();
  clearMovementState();
  updateModeButtons();
  hideSceneOverlay();

  state.mode = "playing";
  state.endingMood = "thankYou";
  state.gameoverType = "standard";
  state.elapsed = 0;
  state.score = 0;
  state.phase = 1;
  state.phaseEnergy = 0;
  state.phaseFlash = 0;
  state.cameraX = 0;
  state.screenShake = 0;
  state.notice.text = "";
  state.notice.timer = 0;
  state.players = createPlayers(state.selectedMode);
  state.story = createStoryState();
  state.arena = createArenaFeatures();
  state.enemies = [];
  state.weaponDrops = [];
  state.projectiles = [];
  state.particles = [];
  state.spawnEnemyTimer = 1.4;
  state.spawnWeaponTimer = 0.35;
  state.giantSpawnTimer = 14;
  placePlayersAt(state.story.levelStartX);

  hideBoot();
  seedOpeningDrops();
  showNotice("Reach the glowing end gate to enter level 2.", "rgba(240, 200, 131, 0.92)");
  syncHud(true);
}

function endRound() {
  const finalScore = Math.floor(state.score);
  if (finalScore > state.highScore) {
    state.highScore = finalScore;
    saveHighScore(state.highScore);
  }

  state.mode = "gameover";
  state.gameoverType = "standard";
  clearMovementState();
  state.screenShake = 0;
  setGameOverBootContent();
  showBoot();
  playSound("gameover");
  syncHud(true);
}

function seedOpeningDrops() {
  spawnWeaponDrop(-180, WORLD.skyHeight * 0.84, -120);
  spawnWeaponDrop(10, WORLD.skyHeight * 0.88, -100);
  spawnWeaponDrop(160, WORLD.skyHeight * 0.74, -90);
}

function queueAction(playerId, type) {
  const input = state.input[playerId];
  if (!input) return;

  if (type === "jump") {
    input.jumpQueued = Math.max(input.jumpQueued, 0.18);
  }

  if (type === "attack") {
    input.attackQueued = Math.max(input.attackQueued, 0.18);
  }
}

function consumeAction(playerId, type) {
  const input = state.input[playerId];
  if (!input) return false;

  if (type === "jump" && input.jumpQueued > 0) {
    input.jumpQueued = 0;
    return true;
  }

  if (type === "attack" && input.attackQueued > 0) {
    input.attackQueued = 0;
    return true;
  }

  return false;
}

function decayInputBuffers(dt) {
  for (const input of Object.values(state.input)) {
    input.jumpQueued = Math.max(0, input.jumpQueued - dt);
    input.attackQueued = Math.max(0, input.attackQueued - dt);
  }
}

function setPointerDirection(clientX) {
  const normalized = clientX / window.innerWidth;

  if (Math.abs(normalized - 0.5) < 0.08) {
    state.pointerMove = 0;
  } else {
    state.pointerMove = normalized < 0.5 ? -1 : 1;
  }
}

function clearPointer(pointerId = null) {
  if (pointerId !== null && state.pointerId !== pointerId) return;
  state.pointerActive = false;
  state.pointerId = null;
  state.pointerMove = 0;
}

function setMovementKey(playerId, direction, value) {
  const input = state.input[playerId];
  if (!input) return;

  if (direction === "left") {
    input.left = value;
    if (value) input.lastDirection = -1;
  }

  if (direction === "right") {
    input.right = value;
    if (value) input.lastDirection = 1;
  }
}

function handleKeyChange(code, value, repeat = false) {
  let handled = false;

  for (const [playerId, map] of Object.entries(CONTROL_MAP)) {
    if (map.left.includes(code)) {
      setMovementKey(playerId, "left", value);
      handled = true;
    }

    if (map.right.includes(code)) {
      setMovementKey(playerId, "right", value);
      handled = true;
    }

    if (value && !repeat && map.jump.includes(code)) {
      queueAction(playerId, "jump");
      handled = true;
    }

    if (value && !repeat && map.attack.includes(code)) {
      queueAction(playerId, "attack");
      handled = true;
    }
  }

  return handled;
}

function isModeKey(code) {
  return code === "Digit1" || code === "Numpad1" || code === "Digit2" || code === "Numpad2";
}

function getMovementIntent(player) {
  const input = state.input[player.id];
  if (!input) return 0;

  let keyboardDirection = 0;

  if (input.left && input.right) {
    keyboardDirection = input.lastDirection;
  } else if (input.left) {
    keyboardDirection = -1;
  } else if (input.right) {
    keyboardDirection = 1;
  }

  return keyboardDirection;
}

function showNotice(text, color = "rgba(217, 221, 227, 0.92)") {
  state.notice.text = text;
  state.notice.color = color;
  state.notice.timer = 1.7;
}

function addScore(amount) {
  state.score += amount;
}

function getLivingPlayers() {
  return state.players.filter((player) => player.alive);
}

function getClosestLivingPlayer(x) {
  return getClosestPlayerFromList(getLivingPlayers(), x);
}

function getClosestPlayerFromList(players, x) {
  const livingPlayers = players;
  if (livingPlayers.length === 0) return null;

  let best = livingPlayers[0];
  let bestDistance = Math.abs(best.x - x);

  for (let i = 1; i < livingPlayers.length; i += 1) {
    const candidate = livingPlayers[i];
    const distance = Math.abs(candidate.x - x);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }

  return best;
}

function getLeadPlayer() {
  const livingPlayers = getLivingPlayers();
  if (livingPlayers.length === 0) return null;

  return livingPlayers.reduce((lead, player) => (player.x > lead.x ? player : lead));
}

function getDoorWorldX(index) {
  return STORY_POINTS.doorStartX + index * STORY_POINTS.doorGap;
}

function placePlayersAt(anchorX) {
  const offsets = state.players.length > 1 ? [-40, 40] : [0];

  for (let i = 0; i < state.players.length; i += 1) {
    const player = state.players[i];
    player.x = clamp(anchorX + (offsets[i] ?? i * 60), WORLD.left + 36, WORLD.right - 36);
    player.y = 0;
    player.vx = 0;
    player.vy = 0;
    player.onGround = true;
    player.attackCooldown = 0;
    player.jumpPulse = 0;
    player.attackPulse = 0;
  }

  state.cameraX = clampCameraTarget(anchorX);
}

function isLevelOneActive() {
  return state.story.scene === STORY_SCENES.level1;
}

function isLevel3Scene() {
  return (
    state.story.scene === STORY_SCENES.level3Intro ||
    state.story.scene === STORY_SCENES.level3Battle ||
    state.story.scene === STORY_SCENES.level3Farewell ||
    state.story.scene === STORY_SCENES.level3Trophy ||
    state.story.scene === STORY_SCENES.level3Cliffhanger
  );
}

function isStoryFreezeActive() {
  return (
    state.story.scene === STORY_SCENES.warning ||
    state.story.scene === STORY_SCENES.scream ||
    state.story.scene === STORY_SCENES.dogIntro ||
    state.story.scene === STORY_SCENES.level3Intro ||
    state.story.scene === STORY_SCENES.level3Farewell ||
    state.story.scene === STORY_SCENES.level3Trophy ||
    state.story.scene === STORY_SCENES.level3Cliffhanger
  );
}

function resetCombatField() {
  state.enemies = [];
  state.weaponDrops = [];
  state.projectiles = [];
}

function commitHighScore() {
  const finalScore = Math.floor(state.score);
  if (finalScore > state.highScore) {
    state.highScore = finalScore;
    saveHighScore(state.highScore);
  }
}

function setEndingBootContent() {
  commitHighScore();
  setPlayButtonLabel("Play Again");
  setBootContent(
    "SyntaxShell Company",
    "Part 2 Coming Soon",
    "Two figures watched from the silence, YAAR fell to a reality-torn weapon, and your hero walked away carrying a vow instead of peace.",
    "Problematic Silence will continue. The hunt for the watchers has already begun."
  );
}

function finishLevel3Ending() {
  state.mode = "gameover";
  state.gameoverType = "ending";
  clearMovementState();
  state.screenShake = 0;
  setEndingBootContent();
  showBoot();
  syncHud(true);
}

function getBoneCarrier() {
  return state.players.find((player) => player.hasBone) || null;
}

function startBoneHunt() {
  state.story.scene = STORY_SCENES.boneHunt;
  state.story.sceneTimer = 0;
  showNotice(
    `${state.story.dog.nickname}: Find my hidden bone near the cracked shrine behind you.`,
    "rgba(255, 248, 223, 0.96)"
  );
}

function partnerWithDog(player) {
  const dog = state.story.dog;
  dog.active = true;
  dog.tamed = true;
  dog.trust = 1;
  state.story.bone.returned = true;
  state.story.bone.carrierId = null;
  player.hasBone = false;
  state.story.scene = STORY_SCENES.puzzle;
  state.story.sceneTimer = 0;
  addScore(1800);
  showNotice(
    `${dog.nickname}: Good. I am with you now. Solve the rune locks to move ahead.`,
    player.secondary
  );
  playSound("friend");

  for (let i = 0; i < 14; i += 1) {
    pushParticle({
      x: dog.x + rand(-18, 18),
      y: dog.y + rand(16, 48),
      vx: rand(-110, 110),
      vy: rand(26, 150),
      size: rand(1.8, 4.2),
      life: rand(0.24, 0.6),
      color: i % 2 === 0 ? "rgba(255, 248, 223, 0.9)" : player.secondary,
      gravity: -180,
    });
  }
}

function resetRunePuzzle() {
  state.story.puzzles.rune.progress = 0;
  state.story.puzzles.rune.activated = [false, false, false];
  state.story.puzzles.rune.wrongPulse = 1;
}

function resetPlatePuzzle() {
  state.story.puzzles.plates.progress = 0;
  state.story.puzzles.plates.activated = [false, false, false];
  state.story.puzzles.plates.cooldown = 0.45;
  state.story.puzzles.plates.wrongPulse = 1;
}

function completePuzzleCorridor() {
  state.story.scene = STORY_SCENES.complete;
  addScore(2400);
  showNotice(
    `${state.story.dog.nickname}: The corridor is solved. I stay by your side now.`,
    "rgba(240, 200, 131, 0.96)"
  );
  playSound("friend");
}

function startLevelThree() {
  state.story.level = 3;
  state.story.scene = STORY_SCENES.level3Intro;
  state.story.sceneTimer = 3.3;
  state.story.level3 = createLevel3State();
  state.story.level3.active = true;
  state.story.dog.active = true;
  state.story.dog.tamed = true;
  state.story.dog.x = STORY_POINTS.levelThreeStartX + 84;
  state.story.dog.vx = 0;
  state.phase = 3;
  state.phaseFlash = 1;
  state.screenShake = 12;
  state.notice.text = "";
  state.notice.timer = 0;
  clearMovementState();
  resetCombatField();
  placePlayersAt(STORY_POINTS.levelThreeStartX);
  for (const player of state.players) {
    player.weaponCharges = clamp(player.weaponCharges + 5, 0, 12);
  }
  addScore(1200);
  showNotice(
    "The corridor ruptured into a broken silent dimension. Fresh relics answered the call.",
    "rgba(214, 95, 111, 0.96)"
  );
  playSound("phase");
}

function beginLevelThreeBattle() {
  state.story.scene = STORY_SCENES.level3Battle;
  state.story.sceneTimer = 0;
  state.story.level3.boss.active = true;
  state.story.level3.guideIndex = 0;
  state.story.level3.guideTimer = 2.2;
  showNotice(
    "YAAR: Keep close. The silence is watching and wearing your shape.",
    "rgba(255, 248, 223, 0.96)"
  );
  playSound("scream");
}

function updateLevel3Shadows(dt) {
  const shadows = state.story.level3.shadows;

  while (shadows.length < state.players.length) {
    shadows.push({
      x: state.players[shadows.length]?.x ?? 0,
      y: state.players[shadows.length]?.y ?? 0,
      facing: -1,
      jitter: Math.random() * TAU,
    });
  }

  for (let i = 0; i < state.players.length; i += 1) {
    const player = state.players[i];
    const shadow = shadows[i];
    const targetX = player.x - player.facing * 46 + Math.sin(state.time * 2.6 + shadow.jitter) * 18;
    const targetY = player.y + Math.sin(state.time * 3.4 + shadow.jitter) * 6;
    shadow.x = ease(shadow.x, targetX, 4.2, dt);
    shadow.y = ease(shadow.y, targetY, 4.2, dt);
    shadow.facing = -player.facing || -1;
  }
}

function spawnLevel3Echo() {
  const players = getLivingPlayers();
  if (players.length === 0) return;

  const source = players[Math.floor(Math.random() * players.length)];
  const side = Math.random() > 0.5 ? 1 : -1;

  state.story.level3.echoes.push({
    x: clamp(source.x + side * rand(180, 320), WORLD.left + 40, WORLD.right - 40),
    y: rand(24, 96),
    vx: 0,
    vy: 0,
    width: 32,
    height: 58,
    health: 2,
    opacity: 0,
    phase: rand(0, TAU),
    damage: 9,
    linger: rand(7, 10),
    label: "Memory Echo",
  });
}

function level3EntityIntersectsPlayer(entity, player) {
  const horizontal = Math.abs(entity.x - player.x) < entity.width * 0.5 + player.width * 0.4;
  const verticalBottom = entity.y - 10;
  const verticalTop = entity.y + entity.height;
  const playerBottom = player.y;
  const playerTop = player.y + player.height;
  return horizontal && playerTop > verticalBottom && playerBottom < verticalTop;
}

function damageLevel3Boss(amount, player, source = "attack") {
  const boss = state.story.level3.boss;
  if (!boss.active || boss.defeated || boss.finalStrike) return false;

  boss.health = Math.max(0, boss.health - amount);
  boss.impactPulse = 0.9;
  state.screenShake = Math.max(state.screenShake, source === "projectile" ? 5 : 8);

  for (let i = 0; i < 14; i += 1) {
    pushParticle({
      x: boss.x + rand(-48, 48),
      y: boss.y + rand(24, boss.height),
      vx: rand(-220, 220),
      vy: rand(24, 220),
      size: rand(1.8, 5),
      life: rand(0.22, 0.6),
      color: i % 2 === 0 ? "rgba(134, 215, 255, 0.76)" : "rgba(214, 95, 111, 0.74)",
      gravity: -220,
    });
  }

  if (player) {
    showNotice(`${player.name} wounded the true Colossus.`, player.accentGlow);
  }

  if (boss.health <= 5 && state.story.dog.tamed) {
    triggerYaarFinalBlow(player);
  }

  return true;
}

function damageLevel3Echo(echo, amount, player = null) {
  echo.health = Math.max(0, echo.health - amount);

  for (let i = 0; i < 8; i += 1) {
    pushParticle({
      x: echo.x + rand(-18, 18),
      y: echo.y + rand(16, echo.height),
      vx: rand(-160, 160),
      vy: rand(24, 150),
      size: rand(1.4, 3.6),
      life: rand(0.18, 0.4),
      color: i % 2 === 0 ? "rgba(134, 215, 255, 0.44)" : "rgba(12, 16, 20, 0.72)",
      gravity: -180,
    });
  }

  if (echo.health <= 0) {
    addScore(140);
    if (player) {
      showNotice(`${player.name} cut through a memory echo.`, player.secondary);
    }
  }
}

function triggerYaarFinalBlow(player = null) {
  const level3 = state.story.level3;
  const boss = level3.boss;
  if (boss.finalStrike || boss.defeated) return;

  boss.finalStrike = true;
  boss.finalStrikeTimer = 1.8;
  boss.health = Math.max(1, boss.health);
  state.screenShake = 16;
  showNotice(
    `${state.story.dog.nickname} lunged through the silence to finish the Colossus.`,
    player?.secondary ?? "rgba(240, 200, 131, 0.96)"
  );
  playSound("friend");
}

function startLevel3Farewell() {
  const level3 = state.story.level3;
  level3.boss.defeated = true;
  level3.boss.active = false;
  level3.echoes = [];
  state.story.scene = STORY_SCENES.level3Farewell;
  state.story.sceneTimer = 4.4;
  state.phaseFlash = 0.84;
  clearMovementState();
  resetCombatField();
  showNotice(
    "The dimension fell quiet. YAAR stayed only long enough to be heard.",
    "rgba(255, 248, 223, 0.96)"
  );
  playSound("phase");
}

function startLevel3TrophyScene() {
  state.story.scene = STORY_SCENES.level3Trophy;
  state.story.sceneTimer = LEVEL3_TROPHY_DURATION;
  state.story.level3.trophyGlow = 0;
  state.story.level3.cutsceneBeat = 0;
  clearMovementState();
  showNotice(
    "A female entity stepped fully into view and approached with the trophy.",
    "rgba(255, 248, 223, 0.96)"
  );
  playSound("friend");
}

function startLevel3Cliffhanger() {
  state.story.scene = STORY_SCENES.level3Cliffhanger;
  state.story.sceneTimer = LEVEL3_CLIFFHANGER_DURATION;
  state.story.dog.active = false;
  state.story.level3.trophyGlow = 1;
  state.story.level3.cutsceneBeat = 0;
  clearMovementState();
  state.screenShake = 4;
  showNotice(
    "Time slowed. Something impossible started falling toward YAAR.",
    "rgba(214, 95, 111, 0.96)"
  );
  playSound("phase");
}

function updateLevel3Echoes(dt) {
  const echoes = state.story.level3.echoes;
  const players = getLivingPlayers();

  for (let i = echoes.length - 1; i >= 0; i -= 1) {
    const echo = echoes[i];
    echo.opacity = ease(echo.opacity, 0.92, 3.5, dt);
    echo.linger -= dt;
    const target = getClosestPlayerFromList(players, echo.x);
    if (!target) {
      continue;
    }

    const hoverY = 34 + Math.sin(state.time * 3 + echo.phase) * 18;
    echo.vx = ease(echo.vx, sign(target.x - echo.x || 1) * 140, 3.1, dt);
    echo.x = clamp(echo.x + echo.vx * dt, WORLD.left + 32, WORLD.right - 32);
    echo.y = ease(echo.y, target.y * 0.18 + hoverY, 3.4, dt);

    for (const player of players) {
      if (level3EntityIntersectsPlayer(echo, player)) {
        damagePlayer(player, echo.damage, echo);
        echo.health = 0;
        break;
      }
    }

    if (echo.health <= 0 || echo.linger <= 0) {
      echoes.splice(i, 1);
    }
  }
}

function updateTrueColossus(dt) {
  const boss = state.story.level3.boss;
  if (!boss.active) return;

  boss.opacity = ease(boss.opacity, 1, 2.5, dt);
  boss.impactPulse = Math.max(0, boss.impactPulse - dt * 2.2);
  boss.pulse = 0.5 + Math.sin(state.time * 1.8) * 0.5;

  if (boss.finalStrike) {
    boss.finalStrikeTimer -= dt;
    const dogTargetX = boss.x - 18;
    state.story.dog.x = ease(state.story.dog.x, dogTargetX, 7.4, dt);
    if (boss.finalStrikeTimer <= 0) {
      startLevel3Farewell();
    }
    return;
  }

  const target = getClosestLivingPlayer(boss.x);
  if (!target) return;

  boss.surgeTimer -= dt;
  const desiredX = target.x + Math.sin(state.time * 0.9) * 110;
  boss.vx = ease(boss.vx, sign(desiredX - boss.x || 1) * 170, 1.8, dt);
  boss.x = clamp(boss.x + boss.vx * dt, WORLD.left + 80, WORLD.right - 80);
  boss.y = 56 + Math.sin(state.time * 1.9) * 18;

  if (boss.surgeTimer <= 0) {
    boss.surgeTimer = rand(1.8, 3.1);
    state.screenShake = Math.max(state.screenShake, 10);
    showNotice("YAAR: The silence sees you. Move through it.", "rgba(255, 248, 223, 0.96)");

    for (const player of getLivingPlayers()) {
      if (Math.abs(player.x - boss.x) < 190) {
        damagePlayer(player, boss.damage, boss);
      }
    }

    for (let i = 0; i < 18; i += 1) {
      pushParticle({
        x: boss.x + rand(-58, 58),
        y: boss.y + rand(24, boss.height),
        vx: rand(-280, 280),
        vy: rand(20, 220),
        size: rand(2, 4.8),
        life: rand(0.22, 0.56),
        color: i % 2 === 0 ? "rgba(214, 95, 111, 0.72)" : "rgba(134, 215, 255, 0.62)",
        gravity: -160,
      });
    }
  }

  for (const player of getLivingPlayers()) {
    if (level3EntityIntersectsPlayer(boss, player)) {
      damagePlayer(player, boss.damage * 0.72, boss);
    }
  }
}

function updateLevel3State(dt) {
  const level3 = state.story.level3;
  level3.glitch = ease(level3.glitch, state.story.scene === STORY_SCENES.level3Farewell ? 0 : 1, 0.8, dt);
  level3.calm = ease(level3.calm, state.story.scene === STORY_SCENES.level3Farewell ? 1 : 0, 0.7, dt);
  updateLevel3Shadows(dt);

  if (state.story.scene === STORY_SCENES.level3Intro) {
    updateDogState(dt);
    if (state.story.sceneTimer <= 0) {
      beginLevelThreeBattle();
    }
    return;
  }

  if (state.story.scene === STORY_SCENES.level3Battle) {
    updateDogState(dt);
    level3.guideTimer -= dt;
    if (level3.guideTimer <= 0) {
      showNotice(
        LEVEL3_GUIDE_LINES[level3.guideIndex % LEVEL3_GUIDE_LINES.length],
        "rgba(255, 248, 223, 0.96)"
      );
      level3.guideIndex += 1;
      level3.guideTimer = rand(5.8, 8.4);
    }

    level3.echoSpawnTimer -= dt;
    if (level3.echoSpawnTimer <= 0 && level3.echoes.length < 4) {
      spawnLevel3Echo();
      level3.echoSpawnTimer = rand(1.6, 2.9);
    }

    updateLevel3Echoes(dt);
    updateTrueColossus(dt);
    return;
  }

  if (state.story.scene === STORY_SCENES.level3Farewell) {
    updateDogState(dt);
    level3.dogFade = clamp(level3.dogFade - dt * 0.18, 0, 1);
    level3.finaleFade = clamp(level3.finaleFade + dt * 0.18, 0, 1);
    if (state.story.sceneTimer <= 0) {
      startLevel3TrophyScene();
    }
    return;
  }

  if (state.story.scene === STORY_SCENES.level3Trophy) {
    level3.trophyGlow = ease(level3.trophyGlow, 1, 1.6, dt);
    const progress = 1 - state.story.sceneTimer / LEVEL3_TROPHY_DURATION;
    if (progress > 0.58 && level3.cutsceneBeat < 1) {
      level3.cutsceneBeat = 1;
      showNotice(
        "The trophy passed between them while the whole arena held its breath.",
        "rgba(255, 248, 223, 0.96)"
      );
      playSound("friend");
    }
    if (state.story.sceneTimer <= 0) {
      startLevel3Cliffhanger();
    }
    return;
  }

  if (state.story.scene === STORY_SCENES.level3Cliffhanger) {
    level3.trophyGlow = ease(level3.trophyGlow, 0.8, 2.2, dt);
    const progress = 1 - state.story.sceneTimer / LEVEL3_CLIFFHANGER_DURATION;
    const strikeWindow = clamp((progress - 0.34) / 0.18, 0, 1);
    const afterShock = clamp((progress - 0.52) / 0.2, 0, 1);
    state.screenShake = Math.max(state.screenShake, 3 + strikeWindow * 18 - afterShock * 10);
    state.phaseFlash = Math.max(state.phaseFlash, strikeWindow * 0.8);

    if (progress > 0.18 && level3.cutsceneBeat < 1) {
      level3.cutsceneBeat = 1;
      showNotice(
        `${state.story.dog.nickname}: ...you finally heard me...`,
        "rgba(255, 248, 223, 0.96)"
      );
    }

    if (progress > 0.34 && level3.cutsceneBeat < 2) {
      level3.cutsceneBeat = 2;
      showNotice(
        "A reality-torn blade answered from nowhere.",
        "rgba(214, 95, 111, 0.96)"
      );
      playSound("scream");
    }

    if (progress > 0.52 && level3.cutsceneBeat < 3) {
      level3.cutsceneBeat = 3;
      showNotice(
        "Two figures emerged from the broken silence and watched.",
        "rgba(205, 214, 224, 0.96)"
      );
      playSound("phase");
    }

    if (progress > 0.74 && level3.cutsceneBeat < 4) {
      level3.cutsceneBeat = 4;
      showNotice(
        "Your grief stopped shaking and turned into rage.",
        "rgba(255, 236, 214, 0.96)"
      );
      playSound("hit");
    }

    if (state.story.sceneTimer <= 0) {
      finishLevel3Ending();
    }
  }
}

function attemptLevelThreeAttack(player) {
  if (!player.alive || player.attackCooldown > 0) return;

  player.attackCooldown = 0.18;
  player.attackPulse = 0.34;
  player.glow = 1;
  state.screenShake = Math.max(state.screenShake, 5);

  const slashX = player.x + player.facing * 36;
  const level3 = state.story.level3;
  let hits = 0;

  for (const echo of level3.echoes) {
    const closeX = Math.abs(echo.x - slashX) < 46;
    const verticalRange = player.y + player.height > echo.y + 8 && player.y < echo.y + echo.height;
    if (closeX && verticalRange) {
      damageLevel3Echo(echo, 2.4, player);
      hits += 1;
    }
  }

  const boss = level3.boss;
  const bossCloseX = Math.abs(boss.x - slashX) < boss.width * 0.42 + 38;
  const bossVertical = player.y + player.height > boss.y + 8 && player.y < boss.y + boss.height;

  if (player.weaponCharges <= 0) {
    if (boss.active && bossCloseX && bossVertical) {
      damageLevel3Boss(1.4, player, "slash");
      hits += 1;
      playSound("attack");
    } else if (hits > 0) {
      playSound("attack");
    } else {
      showNotice("YAAR: Your ward is empty. Stay close and strike carefully.", player.secondary);
      playSound("empty");
    }

    return;
  }

  player.weaponCharges -= 1;
  showNotice(`${player.name} cut through the silent fracture.`, player.accentGlow);
  playSound("attack");

  if (boss.active && bossCloseX && bossVertical) {
    damageLevel3Boss(3.8, player, "slash");
    hits += 1;
  }

  state.projectiles.push({
    ownerId: player.id,
    x: player.x + player.facing * 28,
    y: player.y + 28,
    vx: player.facing * 920,
    vy: rand(-18, 60) + player.vy * 0.08,
    rotation: player.facing > 0 ? 0.18 : Math.PI - 0.18,
    spin: player.facing * 11,
    power: 2.8,
    life: 0.9,
    tint: player.accent,
    kind: WEAPON_TYPES[Math.floor(Math.random() * WEAPON_TYPES.length)].kind,
  });

  for (let i = 0; i < 12; i += 1) {
    pushParticle({
      x: slashX,
      y: player.y + rand(16, 42),
      vx: rand(120, 260) * player.facing,
      vy: rand(-30, 180),
      size: rand(1.6, 4.2),
      life: rand(0.2, 0.44),
      color: i % 2 === 0 ? "rgba(134, 215, 255, 0.78)" : "rgba(255, 248, 223, 0.88)",
      gravity: -260,
    });
  }

  if (hits > 0) {
    addScore(hits * 40);
  }
}

function updateBoneState(dt) {
  const bone = state.story.bone;
  if (bone.found || bone.returned) {
    bone.reveal = 1;
    return;
  }

  const nearBone = getLivingPlayers().some(
    (player) => Math.abs(player.x - bone.x) < 220 || (Math.abs(player.x - bone.x) < 120 && player.y > 34)
  );
  bone.reveal = clamp(bone.reveal + (nearBone ? dt * 2.4 : -dt * 0.5), 0.08, 1);

  for (const player of getLivingPlayers()) {
    const horizontal = Math.abs(player.x - bone.x) < 42;
    const vertical = Math.abs(player.y - bone.y) < 46;
    if (horizontal && vertical) {
      bone.found = true;
      bone.carrierId = player.id;
      player.hasBone = true;
      addScore(450);
      showNotice(
        `${player.name} found the hidden bone. Bring it back to ${state.story.dog.nickname}.`,
        player.secondary
      );
      playSound("pickup");
      break;
    }
  }
}

function tryRunePuzzle(player) {
  const rune = state.story.puzzles.rune;
  if (rune.solved) return false;

  for (let i = 0; i < rune.positions.length; i += 1) {
    if (Math.abs(player.x - rune.positions[i]) > 58 || player.y > 26) {
      continue;
    }

    const expectedIndex = rune.order[rune.progress];
    if (i === expectedIndex) {
      rune.activated[i] = true;
      rune.progress += 1;
      showNotice(`${state.story.dog.nickname}: Good. Keep listening.`, player.accentGlow);
      playSound("pickup");

      if (rune.progress >= rune.order.length) {
        rune.solved = true;
        rune.activated = [true, true, true];
        showNotice(
          `${state.story.dog.nickname}: First lock open. Now step on the plates in Crimson, Azure, then Gold.`,
          "rgba(240, 200, 131, 0.96)"
        );
        playSound("friend");
      }

      return true;
    }

    resetRunePuzzle();
    showNotice(`${state.story.dog.nickname}: Wrong rune. Begin again.`, "rgba(255, 141, 114, 0.94)");
    playSound("empty");
    return true;
  }

  return false;
}

function updatePlatePuzzle(dt) {
  const plates = state.story.puzzles.plates;
  if (plates.solved) return;

  plates.cooldown = Math.max(0, plates.cooldown - dt);
  if (plates.cooldown > 0) return;

  for (const player of getLivingPlayers()) {
    if (player.y > 22) {
      continue;
    }

    for (let i = 0; i < plates.positions.length; i += 1) {
      if (Math.abs(player.x - plates.positions[i]) > 46) {
        continue;
      }

      const expectedIndex = plates.order[plates.progress];
      if (i === expectedIndex) {
        plates.activated[i] = true;
        plates.progress += 1;
        plates.cooldown = 0.45;
        showNotice(
          `${state.story.dog.nickname}: ${plates.colors[i]} answered.`,
          player.secondary
        );
        playSound("pickup");

        if (plates.progress >= plates.order.length) {
          plates.solved = true;
          plates.activated = [true, true, true];
          completePuzzleCorridor();
        }

        return;
      }

      resetPlatePuzzle();
      showNotice(`${state.story.dog.nickname}: The order broke. Start again.`, "rgba(255, 141, 114, 0.94)");
      playSound("empty");
      return;
    }
  }
}

function tryStoryInteraction(player) {
  if (state.story.scene === STORY_SCENES.dogIntro) {
    showNotice(
      `${state.story.dog.name}: Call me ${state.story.dog.nickname}. Find my hidden bone and I will help you.`,
      player.secondary
    );
    playSound("friend");
    return true;
  }

  if (state.story.scene === STORY_SCENES.boneHunt) {
    if (player.hasBone && Math.abs(player.x - state.story.dog.x) < 82 && player.y < 32) {
      partnerWithDog(player);
      return true;
    }

    if (player.hasBone) {
      showNotice(`Bring the hidden bone back to ${state.story.dog.nickname}.`, player.secondary);
      playSound("pickup");
      return true;
    }

    if (Math.abs(player.x - state.story.dog.x) < 90 && player.y < 32) {
      const hint = state.story.bone.found
        ? `${state.story.dog.nickname}: Bring me the bone and I will join you.`
        : `${state.story.dog.nickname}: My bone is hidden at the cracked shrine behind you.`;
      showNotice(hint, player.secondary);
      playSound("friend");
      return true;
    }

    showNotice(`${state.story.dog.nickname} still wants the hidden bone.`, player.secondary);
    playSound("empty");
    return true;
  }

  if (state.story.scene === STORY_SCENES.puzzle) {
    if (!state.story.puzzles.rune.solved && tryRunePuzzle(player)) {
      return true;
    }

    if (Math.abs(player.x - state.story.dog.x) < 92 && player.y < 32) {
      const hint = state.story.puzzles.rune.solved
        ? `${state.story.dog.nickname}: Walk the plates in Crimson, Azure, then Gold.`
        : `${state.story.dog.nickname}: Touch the runes in Middle, Left, then Right.`;
      showNotice(hint, player.secondary);
      playSound("friend");
      return true;
    }

    const roamingHint = state.story.puzzles.rune.solved
      ? `${state.story.dog.nickname}: The floor plates answer in Crimson, Azure, then Gold.`
      : `${state.story.dog.nickname}: Search the standing runes ahead.`;
    showNotice(roamingHint, player.secondary);
    playSound("empty");
    return true;
  }

  if (state.story.scene === STORY_SCENES.complete) {
    showNotice(`${state.story.dog.nickname} is already with you.`, player.secondary);
    playSound("friend");
    return true;
  }

  return false;
}

function getTeamHealthRatio() {
  const max = state.players.reduce((sum, player) => sum + player.maxHealth, 0) || 1;
  const current = state.players.reduce((sum, player) => sum + player.health, 0);
  return current / max;
}

function getTotalRelics() {
  return state.players.reduce((sum, player) => sum + player.weaponCharges, 0);
}

function clampCameraTarget(x) {
  const half = window.innerWidth * 0.5;
  const minCamera = WORLD.left + half;
  const maxCamera = WORLD.right - half;

  if (minCamera > maxCamera) {
    return 0;
  }

  return clamp(x, minCamera, maxCamera);
}

function getTrapPulse(trap) {
  if (trap.type !== "mine") {
    return 1;
  }

  return 0.5 + Math.sin(state.time * trap.rate + trap.offset) * 0.5;
}

function getShortcutVerticalWorldY(shortcut) {
  return shortcut.height * 0.5 + 14;
}

function triggerTrap(player, trap) {
  damagePlayer(player, trap.damage, null);
  player.vy = Math.max(player.vy, 220);
  player.onGround = false;
  showNotice(`${trap.label} hit ${player.name}.`, "rgba(255, 141, 114, 0.94)");

  for (let i = 0; i < 10; i += 1) {
    pushParticle({
      x: player.x + rand(-26, 26),
      y: player.y + rand(8, 34),
      vx: rand(-150, 150),
      vy: rand(24, 180),
      size: rand(1.8, 4.4),
      life: rand(0.2, 0.46),
      color: trap.type === "mine" ? "rgba(236, 255, 141, 0.78)" : "rgba(255, 141, 114, 0.78)",
      gravity: -240,
    });
  }
}

function useShortcut(player, shortcut) {
  player.x = clamp(shortcut.exitX, WORLD.left + 40, WORLD.right - 40);
  player.y = shortcut.exitY;
  player.vy = Math.max(player.vy, 260);
  player.shortcutCooldown = 1.1;
  player.glow = 1;
  player.jumpPulse = 0.8;

  state.cameraX = clampCameraTarget(player.x);

  addScore(55);
  showNotice(`${player.name} found the ${shortcut.hint}.`, player.accentGlow);
  playSound("warp");

  for (let i = 0; i < 16; i += 1) {
    pushParticle({
      x: player.x + rand(-18, 18),
      y: player.y + rand(18, 88),
      vx: rand(-180, 180),
      vy: rand(16, 210),
      size: rand(1.8, 4.6),
      life: rand(0.24, 0.62),
      color: i % 2 === 0 ? player.accentGlow : "rgba(255, 248, 223, 0.9)",
      gravity: -210,
    });
  }
}

function applyArenaInteractions(player) {
  if (!player.alive) return;
  if (!isLevelOneActive()) return;

  player.shortcutCooldown = Math.max(0, player.shortcutCooldown - state.delta);

  for (const trap of state.arena.traps) {
    const withinTrap = Math.abs(player.x - trap.x) < trap.width * 0.5;
    const groundedEnough = player.y < 20;

    if (!withinTrap || !groundedEnough || player.invulnerability > 0) {
      continue;
    }

    if (trap.type === "mine") {
      const pulse = getTrapPulse(trap);
      if (pulse < 0.72) {
        continue;
      }
    }

    triggerTrap(player, trap);
    break;
  }

  if (player.shortcutCooldown > 0) {
    return;
  }

  for (const shortcut of state.arena.shortcuts) {
    const withinShortcut = Math.abs(player.x - shortcut.x) < shortcut.width * 0.5;
    const highEnough = player.y > 54;
    const closeToCenter = Math.abs(player.y - getShortcutVerticalWorldY(shortcut)) < shortcut.height * 0.55;

    if (withinShortcut && highEnough && closeToCenter) {
      useShortcut(player, shortcut);
      break;
    }
  }
}

function triggerPhaseTwo() {
  if (state.story.scene !== STORY_SCENES.level1) return;

  state.story.level = 2;
  state.story.scene = STORY_SCENES.warning;
  state.story.sceneTimer = 2.2;
  state.story.correctDoorIndex = Math.floor(Math.random() * DOOR_COUNT);
  state.story.lastDoorChoice = -1;
  state.story.wrongDoorPulse = 0;
  state.story.dog.active = false;
  state.story.dog.tamed = false;
  state.story.dog.trust = 0;
  state.story.dog.x = STORY_POINTS.dogSpawnX;
  state.story.dog.vx = 0;
  state.story.bone.found = false;
  state.story.bone.returned = false;
  state.story.bone.carrierId = null;
  state.story.bone.reveal = 0.08;
  state.story.puzzles.rune.solved = false;
  state.story.puzzles.rune.progress = 0;
  state.story.puzzles.rune.activated = [false, false, false];
  state.story.puzzles.rune.wrongPulse = 0;
  state.story.puzzles.plates.solved = false;
  state.story.puzzles.plates.progress = 0;
  state.story.puzzles.plates.activated = [false, false, false];
  state.story.puzzles.plates.cooldown = 0;
  state.story.puzzles.plates.wrongPulse = 0;
  state.phase = 2;
  state.phaseFlash = 1;
  state.screenShake = 10;
  state.notice.text = "";
  state.notice.timer = 0;
  clearMovementState();
  resetCombatField();
  placePlayersAt(STORY_POINTS.doorApproachX);
  addScore(850);
  playSound("phase");
}

function startDoorChallenge() {
  state.story.scene = STORY_SCENES.doors;
  state.story.sceneTimer = 0;
  showNotice("Three doors wait ahead. Choose one and cross.", "rgba(240, 200, 131, 0.94)");
}

function handleDoorChoice(player, doorIndex) {
  state.story.lastDoorChoice = doorIndex;
  clearMovementState();

  if (doorIndex === state.story.correctDoorIndex) {
    state.story.scene = STORY_SCENES.scream;
    state.story.sceneTimer = 1.5;
    state.phaseFlash = 0.56;
    state.screenShake = 14;
    placePlayersAt(STORY_POINTS.afterDoorX);
    addScore(1200);
    showNotice("A scream tears through the corridor.", "rgba(214, 95, 111, 0.96)");
    playSound("scream");
    return;
  }

  state.story.sceneTimer = 0.8;
  state.story.wrongDoorPulse = 1;
  state.screenShake = 6;
  placePlayersAt(STORY_POINTS.doorApproachX);
  showNotice(`${player.name} chose the wrong door. Try again.`, "rgba(255, 141, 114, 0.94)");
  playSound("warp");
}

function beginDogScene() {
  state.story.scene = STORY_SCENES.dogIntro;
  state.story.sceneTimer = 2.4;
  state.story.dog.active = true;
  state.story.dog.tamed = false;
  state.story.dog.trust = 0;
  state.story.dog.x = STORY_POINTS.dogSpawnX;
  state.story.dog.vx = 0;
  showNotice(
    `${state.story.dog.name}: I am ${state.story.dog.nickname}. Bring me my hidden bone and I will help you.`,
    "rgba(255, 248, 223, 0.96)"
  );
  playSound("friend");
}

function updateDogState(dt) {
  if (!state.story.dog.active) return;

  const dog = state.story.dog;
  const leader = getClosestLivingPlayer(dog.x) || state.players[0] || null;
  if (!leader) return;

  const targetX = dog.tamed ? leader.x - leader.facing * 54 : STORY_POINTS.dogWaitX;
  const desiredVx = clamp((targetX - dog.x) * (dog.tamed ? 3 : 2.2), -180, 180);
  dog.vx = ease(dog.vx, desiredVx, 4.2, dt);
  dog.x = clamp(dog.x + dog.vx * dt, WORLD.left + 30, WORLD.right - 30);
}

function updateStoryState(dt) {
  state.story.wrongDoorPulse = Math.max(0, state.story.wrongDoorPulse - dt * 1.9);
  state.story.sceneTimer = Math.max(0, state.story.sceneTimer - dt);
  state.story.puzzles.rune.wrongPulse = Math.max(0, state.story.puzzles.rune.wrongPulse - dt * 1.8);
  state.story.puzzles.plates.wrongPulse = Math.max(0, state.story.puzzles.plates.wrongPulse - dt * 1.8);

  if (state.story.scene === STORY_SCENES.level1) {
    const leadPlayer = getLeadPlayer();
    if (leadPlayer && leadPlayer.x >= state.story.levelExitX - 48) {
      triggerPhaseTwo();
    }
    return;
  }

  if (state.story.scene === STORY_SCENES.warning && state.story.sceneTimer <= 0) {
    startDoorChallenge();
    return;
  }

  if (state.story.scene === STORY_SCENES.doors) {
    if (state.story.sceneTimer > 0) {
      return;
    }

    for (const player of getLivingPlayers()) {
      for (let i = 0; i < DOOR_COUNT; i += 1) {
        const doorX = getDoorWorldX(i);
        const withinDoor = Math.abs(player.x - doorX) < 48;
        if (withinDoor && player.y < 28) {
          handleDoorChoice(player, i);
          return;
        }
      }
    }

    return;
  }

  if (state.story.scene === STORY_SCENES.scream && state.story.sceneTimer <= 0) {
    beginDogScene();
    return;
  }

  if (state.story.scene === STORY_SCENES.dogIntro && state.story.sceneTimer <= 0) {
    startBoneHunt();
    return;
  }

  if (state.story.scene === STORY_SCENES.boneHunt) {
    updateDogState(dt);
    updateBoneState(dt);
    return;
  }

  if (state.story.scene === STORY_SCENES.puzzle) {
    updateDogState(dt);
    if (state.story.puzzles.rune.solved) {
      updatePlatePuzzle(dt);
    }
    return;
  }

  if (state.story.scene === STORY_SCENES.complete) {
    updateDogState(dt);
    const leadPlayer = getLeadPlayer();
    if (leadPlayer && leadPlayer.x >= STORY_POINTS.puzzleExitX - 48) {
      startLevelThree();
    }
    return;
  }

  if (isLevel3Scene()) {
    updateLevel3State(dt);
  }
}

function updatePlayers(dt) {
  for (const player of state.players) {
    player.attackCooldown = Math.max(0, player.attackCooldown - dt);
    player.invulnerability = Math.max(0, player.invulnerability - dt);
    player.attackPulse = Math.max(0, player.attackPulse - dt * 3.2);
    player.jumpPulse = Math.max(0, player.jumpPulse - dt * 3);
    player.glow = Math.max(0, player.glow - dt * 2.6);
    player.shortcutCooldown = Math.max(0, player.shortcutCooldown - dt);

    const wantsJump = consumeAction(player.id, "jump");
    const wantsAttack = consumeAction(player.id, "attack");

    if (!player.alive) {
      player.vx = ease(player.vx, 0, 8, dt);
      continue;
    }

    const movement = isStoryFreezeActive() ? 0 : getMovementIntent(player);
    const speedBoost = state.phase === 2 ? 1.08 : 1;
    const targetVx = movement * player.speed * speedBoost;
    const response = movement === 0 ? 11 : 19;
    player.vx = ease(player.vx, targetVx, response, dt);
    player.x = clamp(player.x + player.vx * dt, WORLD.left + 28, WORLD.right - 28);

    if (Math.abs(movement) > 0.001) {
      player.facing = movement;
    }

    if (wantsJump && player.onGround) {
      player.vy = player.jumpPower;
      player.onGround = false;
      player.jumpPulse = 0.85;
      player.glow = 0.6;
      playSound("jump");

      for (let i = 0; i < 10; i += 1) {
        pushParticle({
          x: player.x,
          y: rand(0, 10),
          vx: rand(-90, 90),
          vy: rand(30, 160),
          size: rand(1.4, 3.8),
          life: rand(0.22, 0.44),
          color: "rgba(255, 248, 223, 0.5)",
          gravity: -320,
        });
      }
    }

    if (wantsAttack && !isStoryFreezeActive()) {
      attemptAttack(player);
    }

    player.vy -= player.gravity * dt;
    player.y += player.vy * dt;
    if (player.y <= 0) {
      if (!player.onGround && player.vy < -240) {
        for (let i = 0; i < 8; i += 1) {
          pushParticle({
            x: player.x,
            y: rand(0, 8),
            vx: rand(-110, 110),
            vy: rand(22, 98),
            size: rand(1.6, 3.6),
            life: rand(0.18, 0.34),
            color: "rgba(205, 214, 224, 0.26)",
            gravity: -240,
          });
        }
      }

      player.y = 0;
      player.vy = 0;
      player.onGround = true;
    } else {
      player.onGround = false;
    }

    applyArenaInteractions(player);

    player.runCycle += Math.abs(player.vx) * dt * 0.02;

    if (Math.abs(player.vx) > 150 && player.onGround && Math.random() < dt * 16) {
      pushParticle({
        x: player.x - player.facing * rand(8, 18),
        y: rand(2, 8),
        vx: rand(-70, 70) - player.vx * 0.12,
        vy: rand(20, 60),
        size: rand(1.6, 3.2),
        life: rand(0.2, 0.4),
        color: "rgba(200, 208, 216, 0.22)",
        gravity: -160,
      });
    }
  }
}

function attemptAttack(player) {
  if (!player.alive || player.attackCooldown > 0) return;

  if (state.story.scene === STORY_SCENES.level3Battle) {
    attemptLevelThreeAttack(player);
    return;
  }

  if (state.story.scene !== STORY_SCENES.level1 && tryStoryInteraction(player)) {
    player.attackCooldown = 0.3;
    player.attackPulse = 0.12;
    player.glow = 0.45;
    return;
  }

  player.attackCooldown = 0.18;
  player.attackPulse = 0.32;
  player.glow = 1;
  state.screenShake = Math.max(state.screenShake, 4);

  const slashX = player.x + player.facing * 34;
  let hits = 0;

  if (player.weaponCharges <= 0) {
    player.attackCooldown = 0.24;

    for (const enemy of state.enemies) {
      if (enemy.health <= 0) continue;

      const closeX = Math.abs(enemy.x - slashX) < enemy.width * 0.62 + 46;
      const verticalRange = player.y + player.height > enemy.y + 8 && player.y < enemy.y + enemy.height;
      const frontCheck = sign(enemy.x - player.x || player.facing) === player.facing;

      if (closeX && verticalRange && frontCheck) {
        damageEnemy(enemy, enemy.type === "colossus" ? 1 : 1.5, player, "slash");
        hits += 1;
      }
    }

    if (hits > 0) {
      addScore(hits * 18);
      playSound("attack");
    } else {
      showNotice(`${player.name} needs relics for ranged wards.`, player.secondary);
      playSound("empty");
    }

    return;
  }

  player.weaponCharges -= 1;
  showNotice(`${player.name} released a SyntaxShell ward.`, player.accentGlow);
  playSound("attack");

  for (const enemy of state.enemies) {
    if (enemy.health <= 0) continue;

    const closeX = Math.abs(enemy.x - slashX) < enemy.width * 0.62 + 50;
    const verticalRange = player.y + player.height > enemy.y + 8 && player.y < enemy.y + enemy.height;
    const frontCheck = sign(enemy.x - player.x || player.facing) === player.facing;

    if (closeX && verticalRange && frontCheck) {
      damageEnemy(enemy, enemy.type === "colossus" ? 3 : 4, player, "slash");
      hits += 1;
    }
  }

  if (state.projectiles.length >= MAX_PROJECTILES) {
    state.projectiles.shift();
  }

  state.projectiles.push({
    ownerId: player.id,
    x: player.x + player.facing * 28,
    y: player.y + 28,
    vx: player.facing * (state.phase === 2 ? 980 : 860),
    vy: rand(-24, 70) + player.vy * 0.08,
    rotation: player.facing > 0 ? 0.18 : Math.PI - 0.18,
    spin: player.facing * 11,
    power: state.phase === 2 ? 2.8 : 2.2,
    life: 0.86,
    tint: player.accent,
    kind: WEAPON_TYPES[Math.floor(Math.random() * WEAPON_TYPES.length)].kind,
  });

  for (let i = 0; i < 12; i += 1) {
    pushParticle({
      x: slashX,
      y: player.y + rand(16, 42),
      vx: rand(120, 260) * player.facing,
      vy: rand(-30, 180),
      size: rand(1.6, 4.2),
      life: rand(0.2, 0.44),
      color: i % 2 === 0 ? `${player.accentGlow.replace("0.88", "0.7")}` : "rgba(255, 248, 223, 0.88)",
      gravity: -260,
    });
  }

  if (hits > 0) {
    addScore(hits * 35);
  }
}

function updatePhaseState(dt) {
  state.phaseEnergy = ease(state.phaseEnergy, state.phase >= 2 ? 1 : 0, 1.2, dt);
  state.phaseFlash = Math.max(0, state.phaseFlash - dt * 1.4);
}

function chooseEnemyType() {
  const roll = Math.random();

  if (state.phase === 1) {
    if (state.elapsed < 14) {
      if (roll < 0.56) return "wisp";
      if (roll < 0.84) return "crawler";
      if (roll < 0.96) return "specter";
      return "brute";
    }

    if (roll < 0.4) return "wisp";
    if (roll < 0.72) return "crawler";
    if (roll < 0.92) return "specter";
    return "brute";
  }

  if (roll < 0.24) return "wisp";
  if (roll < 0.54) return "specter";
  if (roll < 0.82) return "crawler";
  if (roll < 0.96) return "brute";
  return "colossus";
}

function spawnEnemy(forcedType = null) {
  let type = forcedType || chooseEnemyType();
  const colossusCount = state.enemies.filter((enemy) => enemy.type === "colossus").length;
  if (type === "colossus" && colossusCount >= MAX_COLOSSI) {
    type = Math.random() > 0.5 ? "brute" : "specter";
  }
  const template = ENEMY_TEMPLATES[type];
  const side = Math.random() > 0.5 ? 1 : -1;
  const spawnX = clamp(
    state.cameraX + side * (window.innerWidth * 0.62 + rand(80, 240)),
    WORLD.left + 40,
    WORLD.right - 40
  );
  const width = rand(template.width[0], template.width[1]);
  const height = rand(template.height[0], template.height[1]);

  state.enemies.push({
    type,
    label: template.label,
    category: template.category,
    style: template.style,
    x: spawnX,
    y: template.style === "hover" || template.style === "dash" ? rand(14, 46) : 0,
    vx: 0,
    vy: 0,
    width,
    height,
    speed: rand(template.speed[0], template.speed[1]) * (state.phase === 2 ? 1.06 : 0.92),
    damage: rand(template.damage[0], template.damage[1]) * 0.72,
    health: type === "brute" ? 3 : type === "colossus" ? 7 : template.health,
    maxHealth: type === "brute" ? 3 : type === "colossus" ? 7 : template.health,
    score: template.score,
    tintA: template.tintA,
    tintB: template.tintB,
    opacity: 0,
    phase: rand(0, TAU),
    floatBase: rand(18, 52),
    floatAmp: rand(10, 22),
    orbit: rand(46, 140),
    roamTimer: rand(0.7, 1.8),
    chargeTimer: 0,
    chargeCooldown: rand(0.8, 1.6),
    pounceCooldown: rand(1.1, 2.2),
    impactPulse: 0,
  });
}

function spawnWeaponDrop(forcedX = null, forcedY = null, forcedVelocityY = null) {
  const weapon = WEAPON_TYPES[Math.floor(Math.random() * WEAPON_TYPES.length)];
  const x =
    forcedX ??
    clamp(
      state.cameraX + rand(-window.innerWidth * 0.44, window.innerWidth * 0.44),
      WORLD.left + 60,
      WORLD.right - 60
    );

  state.weaponDrops.push({
    ...weapon,
    x,
    y: forcedY ?? WORLD.skyHeight + rand(40, 260),
    vx: rand(-40, 40),
    vy: forcedVelocityY ?? -rand(80, 180),
    rotation: rand(-0.7, 0.7),
    spin: rand(-5, 5),
    grounded: false,
    age: 0,
  });
}

function updateSpawners(dt) {
  state.spawnEnemyTimer -= dt;
  state.spawnWeaponTimer -= dt;
  state.giantSpawnTimer -= dt;

  const livingPlayers = getLivingPlayers().length;
  const coopMode = state.selectedMode === "coop";
  const baseEnemyCap = state.phase === 1 ? (coopMode ? 5 : 4) : coopMode ? 7 : 6;
  const hardCap = coopMode ? MAX_ENEMIES_MULTI : MAX_ENEMIES_SOLO;
  const enemyCap = Math.min(hardCap, baseEnemyCap + Math.floor(state.elapsed / 44));
  const totalRelics = getTotalRelics();
  const lowRelicsMultiplier = totalRelics <= livingPlayers * 3 ? 0.52 : 1;

  if (state.spawnEnemyTimer <= 0 && state.enemies.length < enemyCap) {
    spawnEnemy();
    const phaseMultiplier = state.phase === 2 ? 1.18 : 1;
    state.spawnEnemyTimer =
      rand(1.1, 1.85) / phaseMultiplier / (livingPlayers > 1 ? 1.12 : 1);
  }

  if (state.spawnWeaponTimer <= 0 && state.weaponDrops.length < 6) {
    spawnWeaponDrop();
    state.spawnWeaponTimer =
      rand(0.95, 1.65) * lowRelicsMultiplier / (state.phase === 2 ? 1.04 : 1);
  }

  const colossusCount = state.enemies.filter((enemy) => enemy.type === "colossus").length;
  if (state.phase === 2 && state.giantSpawnTimer <= 0 && colossusCount < MAX_COLOSSI) {
    spawnEnemy("colossus");
    state.giantSpawnTimer = rand(12, 15.5);
  }
}

function canPickupDrop(player, drop) {
  if (!drop.grounded) {
    return false;
  }

  const horizontal = Math.abs(player.x - drop.x) < 38;
  const vertical = drop.y <= player.y + player.height + 18 && drop.y >= player.y - 12;
  return horizontal && vertical;
}

function collectWeaponDrop(receiver, drop) {
  receiver.weaponCharges = clamp(receiver.weaponCharges + drop.ammo, 0, 12);
  receiver.glow = 0.8;
  addScore(18);

  if (state.time - state.lastPickupFxAt > 0.18) {
    showNotice(`${receiver.name} collected ${drop.kind} +${drop.ammo}`, receiver.secondary);
    playSound("pickup");
    state.lastPickupFxAt = state.time;
  }

  if (state.settings.effectsMode === "high") {
    for (let j = 0; j < 2; j += 1) {
      pushParticle({
        x: drop.x,
        y: drop.y + rand(8, 24),
        vx: rand(-50, 50),
        vy: rand(16, 80),
        size: rand(1.2, 2.8),
        life: rand(0.14, 0.24),
        color: j === 0 ? receiver.secondary : receiver.accentGlow,
        gravity: -220,
      });
    }
  }
}

function updateWeaponDrops(dt) {
  const livingPlayers = getLivingPlayers();
  let processedPickup = false;

  for (let i = state.weaponDrops.length - 1; i >= 0; i -= 1) {
    const drop = state.weaponDrops[i];

    try {
      drop.age += dt;
      drop.rotation += drop.spin * dt;

      if (!drop.grounded) {
        drop.vy -= 720 * dt;
        drop.y += drop.vy * dt;
        drop.x += drop.vx * dt;
        drop.vx = ease(drop.vx, 0, 1.6, dt);

        if (drop.y <= 0) {
          drop.y = 0;
          drop.vy = 0;
          drop.grounded = true;
          drop.spin *= 0.12;
        }
      }

      const receiver =
        processedPickup ? null : livingPlayers.find((player) => canPickupDrop(player, drop));
      if (receiver) {
        processedPickup = true;
        collectWeaponDrop(receiver, drop);
        state.weaponDrops.splice(i, 1);
        continue;
      }

      if ((drop.grounded && drop.age > 12) || (!drop.grounded && drop.age > 14)) {
        state.weaponDrops.splice(i, 1);
      }
    } catch (error) {
      console.error("Weapon drop update failed:", error, drop);
      state.weaponDrops.splice(i, 1);
      state.settings.soundEnabled = false;
      updateSettingsButtons();
      showNotice("Relic field stabilized.", "rgba(240, 200, 131, 0.92)");
    }
  }
}

function updateProjectiles(dt) {
  for (let i = state.projectiles.length - 1; i >= 0; i -= 1) {
    const projectile = state.projectiles[i];
    projectile.life -= dt;
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    projectile.vy -= 140 * dt;
    projectile.rotation += projectile.spin * dt;

    if (Math.random() < dt * 28) {
      pushParticle({
        x: projectile.x,
        y: projectile.y,
        vx: rand(-90, 90),
        vy: rand(-10, 60),
        size: rand(1.2, 2.8),
        life: rand(0.18, 0.32),
        color: projectile.tint,
        gravity: -140,
      });
    }

    let removeProjectile = false;
    for (const enemy of state.enemies) {
      if (enemy.health <= 0) continue;

      const hitX = Math.abs(enemy.x - projectile.x) < enemy.width * 0.6 + 10;
      const hitY = projectile.y > enemy.y - 6 && projectile.y < enemy.y + enemy.height + 6;

      if (hitX && hitY) {
        const owner = state.players.find((player) => player.id === projectile.ownerId) || null;
        damageEnemy(enemy, projectile.power, owner, "projectile");
        removeProjectile = true;
        break;
      }
    }

    if (!removeProjectile && state.story.scene === STORY_SCENES.level3Battle) {
      for (const echo of state.story.level3.echoes) {
        if (echo.health <= 0) continue;

        const hitX = Math.abs(echo.x - projectile.x) < echo.width * 0.6 + 10;
        const hitY = projectile.y > echo.y - 6 && projectile.y < echo.y + echo.height + 6;

        if (hitX && hitY) {
          const owner = state.players.find((player) => player.id === projectile.ownerId) || null;
          damageLevel3Echo(echo, projectile.power, owner);
          removeProjectile = true;
          break;
        }
      }
    }

    if (!removeProjectile && state.story.scene === STORY_SCENES.level3Battle) {
      const boss = state.story.level3.boss;
      const hitX = Math.abs(boss.x - projectile.x) < boss.width * 0.46 + 12;
      const hitY = projectile.y > boss.y - 10 && projectile.y < boss.y + boss.height + 10;

      if (boss.active && hitX && hitY) {
        const owner = state.players.find((player) => player.id === projectile.ownerId) || null;
        damageLevel3Boss(projectile.power, owner, "projectile");
        removeProjectile = true;
      }
    }

    if (
      removeProjectile ||
      projectile.life <= 0 ||
      projectile.x < WORLD.left - 180 ||
      projectile.x > WORLD.right + 180
    ) {
      state.projectiles.splice(i, 1);
    }
  }
}

function updateHoverEnemy(enemy, target, dt) {
  enemy.roamTimer -= dt;
  if (enemy.roamTimer <= 0) {
    enemy.orbit = rand(42, 132);
    enemy.floatBase = rand(18, 54);
    enemy.roamTimer = rand(0.8, 1.6);
  }

  const desiredX = target.x + Math.sin(state.time * 0.9 + enemy.phase) * enemy.orbit;
  const desired = sign(desiredX - enemy.x);
  enemy.vx = ease(enemy.vx, desired * enemy.speed, 2.8, dt);
  enemy.x = clamp(enemy.x + enemy.vx * dt, WORLD.left + 20, WORLD.right - 20);
  const targetY = target.y * 0.18 + enemy.floatBase + Math.sin(state.time * 2.3 + enemy.phase) * enemy.floatAmp;
  enemy.y = ease(enemy.y, targetY, 3.4, dt);
}

function updateDashEnemy(enemy, target, dt) {
  enemy.chargeCooldown = Math.max(0, enemy.chargeCooldown - dt);

  if (enemy.chargeTimer > 0) {
    enemy.chargeTimer -= dt;
    enemy.x = clamp(enemy.x + enemy.vx * dt, WORLD.left + 20, WORLD.right - 20);
    enemy.y = ease(enemy.y, target.y + 20, 4.2, dt);
    return;
  }

  updateHoverEnemy(enemy, target, dt);

  if (Math.abs(enemy.x - target.x) < 300 && enemy.chargeCooldown <= 0) {
    enemy.chargeTimer = 0.34;
    enemy.chargeCooldown = rand(1.5, 2.3);
    enemy.vx = sign(target.x - enemy.x || 1) * enemy.speed * (state.phase === 2 ? 2.6 : 2.2);
  }
}

function updateGroundEnemy(enemy, target, dt, heavy = false, giant = false) {
  enemy.pounceCooldown = Math.max(0, enemy.pounceCooldown - dt);
  const chaseDirection = sign(target.x - enemy.x || 1);
  const groundResponse = heavy ? 4.5 : 6.5;
  const extraSpeed = giant ? 1.08 : 0.94;
  enemy.vx = ease(enemy.vx, chaseDirection * enemy.speed * extraSpeed, groundResponse, dt);

  if (enemy.pounceCooldown <= 0 && Math.abs(target.x - enemy.x) < (giant ? 300 : 145)) {
    enemy.pounceCooldown = giant ? rand(1.8, 2.7) : rand(1.5, 2.5);
    enemy.vy = giant ? 380 : heavy ? 280 : 220;
  }

  enemy.vy -= (giant ? 1100 : 1340) * dt;
  enemy.x = clamp(enemy.x + enemy.vx * dt, WORLD.left + 20, WORLD.right - 20);
  enemy.y += enemy.vy * dt;

  if (enemy.y <= 0) {
    if (enemy.vy < -360) {
      enemy.impactPulse = 0.5;
      if (giant) {
        state.screenShake = Math.max(state.screenShake, 12);
      }
    }

    enemy.y = 0;
    enemy.vy = 0;
  }
}

function enemyIntersectsPlayer(enemy, player) {
  const playerLeft = player.x - player.width * 0.5;
  const playerRight = player.x + player.width * 0.5;
  const enemyLeft = enemy.x - enemy.width * 0.5;
  const enemyRight = enemy.x + enemy.width * 0.5;

  const horizontal = playerRight > enemyLeft && playerLeft < enemyRight;
  const playerBottom = player.y;
  const playerTop = player.y + player.height;
  const enemyBottom = enemy.y;
  const enemyTop = enemy.y + enemy.height;
  const vertical = playerTop > enemyBottom && playerBottom < enemyTop;

  return horizontal && vertical;
}

function tryPlayerStomp(player, enemy) {
  if (enemy.style !== "ground" && enemy.style !== "heavy") return false;
  if (enemy.type === "colossus") return false;
  if (player.vy >= -180) return false;
  if (!enemyIntersectsPlayer(enemy, player)) return false;
  if (player.y < enemy.y + enemy.height * 0.55) return false;

  player.vy = player.jumpPower * 0.58;
  player.onGround = false;
  addScore(80);
  damageEnemy(enemy, enemy.type === "brute" ? 2 : 99, player, "stomp");
  playSound("stomp");
  return true;
}

function updateEnemies(dt) {
  const livingPlayers = getLivingPlayers();

  for (let i = state.enemies.length - 1; i >= 0; i -= 1) {
    const enemy = state.enemies[i];
    const target = getClosestPlayerFromList(livingPlayers, enemy.x);

    enemy.opacity = ease(enemy.opacity, 1, 4.6, dt);
    enemy.impactPulse = Math.max(0, enemy.impactPulse - dt * 1.8);

    if (!target) {
      enemy.vx = ease(enemy.vx, 0, 6, dt);
      continue;
    }

    if (enemy.style === "hover") {
      updateHoverEnemy(enemy, target, dt);
    } else if (enemy.style === "dash") {
      updateDashEnemy(enemy, target, dt);
    } else if (enemy.style === "ground") {
      updateGroundEnemy(enemy, target, dt, false, false);
    } else if (enemy.style === "heavy") {
      updateGroundEnemy(enemy, target, dt, true, false);
    } else if (enemy.style === "giant") {
      updateGroundEnemy(enemy, target, dt, true, true);
    }

    for (const player of livingPlayers) {
      if (tryPlayerStomp(player, enemy)) {
        break;
      }

      if (enemyIntersectsPlayer(enemy, player)) {
        damagePlayer(player, enemy.damage, enemy);
      }
    }
  }

  for (let i = state.enemies.length - 1; i >= 0; i -= 1) {
    if (state.enemies[i].health <= 0) {
      state.enemies.splice(i, 1);
    }
  }
}

function damagePlayer(player, amount, enemy) {
  if (!player.alive || player.invulnerability > 0) return;

  player.health = Math.max(0, player.health - amount * 0.72);
  player.invulnerability = 1.18;
  player.glow = 1;
  state.screenShake = Math.max(state.screenShake, 6);
  showNotice(`${player.name} took damage.`, "rgba(255, 141, 114, 0.94)");
  playSound("hit");

  if (enemy) {
    enemy.vx *= -0.2;
    enemy.x += sign(enemy.x - player.x || 1) * 22;
    enemy.chargeCooldown = Math.max(enemy.chargeCooldown || 0, 0.7);
  }

  for (let i = 0; i < 14; i += 1) {
    pushParticle({
      x: player.x,
      y: player.y + rand(12, 44),
      vx: rand(-170, 170),
      vy: rand(24, 180),
      size: rand(1.8, 4.6),
      life: rand(0.22, 0.48),
      color: i % 2 === 0 ? "rgba(255, 141, 114, 0.72)" : "rgba(255, 248, 223, 0.62)",
      gravity: -260,
    });
  }

  if (player.health <= 0) {
    player.alive = false;
    player.vx = 0;
    player.weaponCharges = 0;
    showNotice(`${player.name} has fallen.`, player.secondary);

    if (getLivingPlayers().length === 0) {
      endRound();
    }
  }
}

function damageEnemy(enemy, amount, player = null, source = "slash") {
  if (!enemy || enemy.health <= 0) return;

  enemy.health = Math.max(0, enemy.health - amount);
  enemy.impactPulse = 0.66;
  state.screenShake = Math.max(state.screenShake, source === "projectile" ? 3 : 5);

  for (let i = 0; i < 12; i += 1) {
    pushParticle({
      x: enemy.x,
      y: enemy.y + rand(18, enemy.height),
      vx: rand(-180, 180),
      vy: rand(20, 220),
      size: rand(1.8, 4.8),
      life: rand(0.22, 0.58),
      color: i % 2 === 0 ? enemy.tintA : enemy.tintB,
      gravity: -240,
    });
  }

  if (enemy.health <= 0) {
    addScore(enemy.score);
    playSound("kill");

    for (let i = 0; i < 10; i += 1) {
      pushParticle({
        x: enemy.x,
        y: enemy.y + rand(14, enemy.height + 10),
        vx: rand(-220, 220),
        vy: rand(40, 240),
        size: rand(2, 5.4),
        life: rand(0.34, 0.8),
        color: i % 2 === 0 ? "rgba(255, 248, 223, 0.9)" : enemy.tintA,
        gravity: -220,
      });
    }

    if (player) {
      showNotice(`${player.name} erased ${enemy.label}.`, player.accentGlow);
    }
  }
}

function pushParticle(particle) {
  const particleCap =
    state.settings.effectsMode === "low" ? Math.floor(MAX_PARTICLES * 0.45) : MAX_PARTICLES;

  if (state.settings.effectsMode === "low" && Math.random() > 0.55) {
    return;
  }

  if (state.particles.length >= particleCap) {
    return;
  }

  state.particles.push({
    gravity: -180,
    alpha: 1,
    ...particle,
  });
}

function updateParticles(dt) {
  for (let i = state.particles.length - 1; i >= 0; i -= 1) {
    const particle = state.particles[i];
    particle.life -= dt;
    particle.vy += particle.gravity * dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;

    if (particle.life <= 0) {
      state.particles.splice(i, 1);
    }
  }
}

function updateNotices(dt) {
  state.notice.timer = Math.max(0, state.notice.timer - dt);
}

function updateScore(dt) {
  if (state.story.scene === STORY_SCENES.level1) {
    addScore(dt * (8 + getLivingPlayers().length * 2 + state.elapsed * 0.18));
  } else if (state.story.scene === STORY_SCENES.complete) {
    addScore(dt * 2.5);
  } else if (state.story.scene === STORY_SCENES.level3Battle) {
    addScore(dt * 3.6);
  }
}

function updateCamera(dt) {
  const livingPlayers = getLivingPlayers();
  if (livingPlayers.length === 0) {
    state.cameraX = ease(state.cameraX, 0, 1.8, dt);
    return;
  }

  const averageX =
    livingPlayers.reduce((sum, player) => sum + player.x, 0) / livingPlayers.length;
  state.cameraX = ease(state.cameraX, clampCameraTarget(averageX), 4.2, dt);
}

function syncHud(force = false) {
  const score = Math.floor(state.score);
  const visibleHighScore = Math.max(state.highScore, score);
  const teamHealthRatio = getTeamHealthRatio();
  const teamHealthPercent = Math.round(teamHealthRatio * 100);
  const relicText = String(getTotalRelics());
  const healthText = `${teamHealthPercent}%`;
  const modeText = getSelectedModeLabel();
  const phaseText = state.phase === 3 ? "III" : state.phase === 2 ? "II" : "I";

  if (force || state.ui.score !== score) {
    state.ui.score = score;
    scoreValue.textContent = score.toString().padStart(6, "0");
  }

  if (force || state.ui.highScore !== visibleHighScore) {
    state.ui.highScore = visibleHighScore;
    highScoreValue.textContent = visibleHighScore.toString().padStart(6, "0");
  }

  if (force || state.ui.weapons !== relicText) {
    state.ui.weapons = relicText;
    weaponValue.textContent = relicText;
  }

  if (force || state.ui.mode !== modeText) {
    state.ui.mode = modeText;
    modeValue.textContent = modeText;
  }

  if (force || state.ui.phase !== phaseText) {
    state.ui.phase = phaseText;
    phaseValue.textContent = phaseText;
  }

  if (force || state.ui.health !== teamHealthPercent || state.ui.healthText !== healthText) {
    state.ui.health = teamHealthPercent;
    state.ui.healthText = healthText;
    healthValue.textContent = healthText;
    healthFill.style.width = `${teamHealthPercent}%`;
    healthFill.style.filter =
      teamHealthPercent < 35 ? "saturate(1.45) brightness(1.15)" : "none";
  }
}

function updateGame(dt) {
  state.elapsed += dt;
  state.screenShake = Math.max(0, state.screenShake - dt * 22);
  decayInputBuffers(dt);
  updateNotices(dt);
  updatePhaseState(dt);
  updatePlayers(dt);
  updateStoryState(dt);

  if (isLevelOneActive()) {
    updateSpawners(dt);
    updateWeaponDrops(dt);
    updateProjectiles(dt);
    updateEnemies(dt);
  } else if (state.story.scene === STORY_SCENES.level3Battle) {
    updateProjectiles(dt);
  }

  updateParticles(dt);
  updateScore(dt);
  updateCamera(dt);
  updateAudio(dt);
  syncHud();
}

function drawBackground() {
  if (isLevel3Scene()) {
    drawLevel3Background();
    return;
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const overdrive = state.phaseEnergy;

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, `rgba(${Math.round(8 + overdrive * 42)}, ${Math.round(18 + overdrive * 26)}, ${Math.round(30 - overdrive * 4)}, 1)`);
  gradient.addColorStop(0.5, `rgba(${Math.round(7 + overdrive * 18)}, ${Math.round(13 + overdrive * 10)}, ${Math.round(20 + overdrive * 20)}, 1)`);
  gradient.addColorStop(1, `rgba(${Math.round(2 + overdrive * 20)}, ${Math.round(4 + overdrive * 8)}, ${Math.round(7 + overdrive * 12)}, 1)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  for (const star of state.backdrop.stars) {
    const flicker = 0.66 + Math.sin(state.time * star.twinkle + star.x * 24) * 0.34;
    ctx.fillStyle = overdrive > 0.2
      ? `rgba(236, 255, 141, ${star.alpha * 0.4 * flicker})`
      : `rgba(226, 232, 240, ${star.alpha * flicker})`;
    ctx.beginPath();
    ctx.arc(width * star.x, height * star.y, star.radius, 0, TAU);
    ctx.fill();
  }

  const moonX = width * (0.78 - overdrive * 0.08) + Math.sin(state.time * 0.08) * 16;
  const moonY = height * (0.2 + overdrive * 0.03) + Math.cos(state.time * 0.06) * 10;
  const halo = ctx.createRadialGradient(moonX, moonY, 24, moonX, moonY, 170 + overdrive * 120);
  halo.addColorStop(0, overdrive > 0.35 ? "rgba(236, 255, 141, 0.34)" : "rgba(245, 240, 214, 0.26)");
  halo.addColorStop(0.4, overdrive > 0.35 ? "rgba(255, 141, 114, 0.12)" : "rgba(134, 215, 255, 0.08)");
  halo.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = halo;
  ctx.fillRect(moonX - 260, moonY - 260, 520, 520);

  ctx.fillStyle = overdrive > 0.35 ? "rgba(236, 255, 141, 0.9)" : "rgba(235, 238, 241, 0.82)";
  ctx.beginPath();
  ctx.arc(moonX, moonY, 26 + overdrive * 10, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "rgba(8, 12, 18, 0.95)";
  ctx.beginPath();
  ctx.arc(moonX + 8 + overdrive * 12, moonY - 2, 26 + overdrive * 8, 0, TAU);
  ctx.fill();

  const wash = ctx.createLinearGradient(0, WORLD.groundY - 150, 0, WORLD.groundY + 50);
  wash.addColorStop(0, overdrive > 0.35 ? "rgba(255, 141, 114, 0.08)" : "rgba(134, 215, 255, 0.04)");
  wash.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = wash;
  ctx.fillRect(0, WORLD.groundY - 160, width, 220);
}

function drawLevel3Background() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const level3 = state.story.level3;
  const calm = level3.calm;

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, `rgba(${Math.round(6 + calm * 12)}, ${Math.round(8 + calm * 14)}, ${Math.round(14 + calm * 20)}, 1)`);
  gradient.addColorStop(0.55, `rgba(${Math.round(12 + level3.glitch * 18)}, ${Math.round(8 + calm * 12)}, ${Math.round(18 + calm * 24)}, 1)`);
  gradient.addColorStop(1, `rgba(${Math.round(2 + calm * 16)}, ${Math.round(3 + calm * 16)}, ${Math.round(6 + calm * 30)}, 1)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 26; i += 1) {
    const y = (i / 25) * height;
    const wave = Math.sin(state.time * 1.4 + i * 0.8) * 18;
    ctx.fillStyle =
      i % 3 === 0
        ? `rgba(214, 95, 111, ${0.035 + level3.glitch * 0.03})`
        : `rgba(134, 215, 255, ${0.025 + level3.glitch * 0.02})`;
    ctx.fillRect(-40, y + wave, width + 80, 3);
  }

  for (const star of state.backdrop.stars) {
    const flicker = 0.48 + Math.sin(state.time * star.twinkle * 1.8 + star.x * 32) * 0.42;
    ctx.fillStyle = `rgba(255, 248, 223, ${star.alpha * 0.22 * flicker * (1 - calm * 0.4)})`;
    ctx.fillRect(width * star.x, height * star.y, Math.max(1, star.radius * 0.9), Math.max(1, star.radius * 0.9));
  }
}

function drawBackdrop() {
  if (isLevel3Scene()) {
    drawLevel3Backdrop();
    return;
  }

  const overdrive = state.phaseEnergy;

  for (const tower of state.backdrop.towers) {
    const x = window.innerWidth * 0.5 + tower.x - state.cameraX * tower.parallax;
    const y = WORLD.groundY - tower.height;
    ctx.fillStyle = overdrive > 0.3 ? "rgba(44, 54, 32, 0.5)" : "rgba(16, 24, 34, 0.58)";
    ctx.fillRect(x - tower.width * 0.5, y, tower.width, tower.height);
    ctx.fillRect(x - tower.width, y + 24, tower.width * 2, 3);
  }

  for (const monument of state.backdrop.monuments) {
    const x = window.innerWidth * 0.5 + monument.x - state.cameraX * monument.parallax;
    const y = WORLD.groundY - monument.height;
    const roofHeight = monument.height * monument.cap;
    ctx.fillStyle = overdrive > 0.3 ? "rgba(74, 40, 28, 0.72)" : "rgba(14, 20, 28, 0.76)";
    ctx.fillRect(x - monument.width * 0.5, y, monument.width, monument.height);
    ctx.beginPath();
    ctx.moveTo(x - monument.width * 0.66, y + roofHeight);
    ctx.lineTo(x, y);
    ctx.lineTo(x + monument.width * 0.66, y + roofHeight);
    ctx.closePath();
    ctx.fill();
  }

  for (const marker of state.backdrop.markers) {
    const x = worldToScreenX(marker.x);
    if (x < -50 || x > window.innerWidth + 50) continue;

    ctx.save();
    ctx.translate(x, WORLD.groundY);
    ctx.rotate(marker.tilt);
    ctx.fillStyle = overdrive > 0.3 ? "rgba(72, 46, 31, 0.82)" : "rgba(22, 27, 33, 0.82)";
    ctx.fillRect(-marker.width * 0.5, -marker.height, marker.width, marker.height);
    ctx.fillRect(-marker.width, -2, marker.width * 2, 2);
    ctx.restore();
  }

  ctx.save();
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.font = '700 20px "Palatino Linotype", Georgia, serif';
  ctx.fillStyle = overdrive > 0.35 ? "rgba(236, 255, 141, 0.4)" : "rgba(134, 215, 255, 0.24)";
  ctx.fillText(">_ SyntaxShell Arena", window.innerWidth - 48, WORLD.groundY - 132);
  ctx.font = '11px "Palatino Linotype", Georgia, serif';
  ctx.fillStyle = "rgba(205, 214, 224, 0.3)";
  ctx.fillText("Founded by Rudra", window.innerWidth - 48, WORLD.groundY - 108);
  ctx.restore();
}

function drawLevel3Backdrop() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const calm = state.story.level3.calm;

  for (let i = 0; i < 12; i += 1) {
    const x = ((i / 11) * width + Math.sin(state.time * 0.8 + i) * 40) % (width + 140) - 70;
    const top = height * 0.14 + Math.cos(state.time * 0.7 + i * 0.6) * 34;
    const pillarHeight = 180 + i * 18;
    ctx.fillStyle =
      i % 2 === 0
        ? `rgba(18, 24, 32, ${0.52 - calm * 0.12})`
        : `rgba(36, 18, 24, ${0.42 - calm * 0.1})`;
    ctx.fillRect(x, top, 20 + (i % 3) * 10, pillarHeight);
  }

  ctx.save();
  ctx.textAlign = "center";
  ctx.font = '700 18px "Palatino Linotype", Georgia, serif';
  ctx.fillStyle = `rgba(255, 248, 223, ${0.28 - calm * 0.12})`;
  ctx.fillText("Broken Silent Dimension", width * 0.5, height * 0.13);
  ctx.restore();
}

function drawGround() {
  if (isLevel3Scene()) {
    drawLevel3Ground();
    return;
  }

  const width = window.innerWidth;
  const overdrive = state.phaseEnergy;
  const groundGradient = ctx.createLinearGradient(0, WORLD.groundY - 12, 0, window.innerHeight);
  groundGradient.addColorStop(0, overdrive > 0.35 ? "rgba(46, 36, 20, 0.98)" : "rgba(20, 25, 31, 0.98)");
  groundGradient.addColorStop(1, overdrive > 0.35 ? "rgba(10, 7, 6, 1)" : "rgba(5, 7, 10, 1)");
  ctx.fillStyle = groundGradient;
  ctx.fillRect(0, WORLD.groundY, width, window.innerHeight - WORLD.groundY + 64);

  ctx.strokeStyle = overdrive > 0.35 ? "rgba(236, 255, 141, 0.22)" : "rgba(178, 189, 198, 0.16)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, WORLD.groundY);
  ctx.lineTo(width, WORLD.groundY);
  ctx.stroke();

  const startX = Math.floor((state.cameraX - width * 0.7) / 110) * 110;
  ctx.strokeStyle = overdrive > 0.35 ? "rgba(255, 141, 114, 0.12)" : "rgba(134, 215, 255, 0.06)";
  ctx.lineWidth = 1;
  for (let worldX = startX; worldX < state.cameraX + width * 0.7; worldX += 110) {
    const x = worldToScreenX(worldX);
    const rise = 16 + Math.sin(worldX * 0.03 + state.time * 0.8) * (4 + overdrive * 6);
    ctx.beginPath();
    ctx.moveTo(x, WORLD.groundY);
    ctx.lineTo(x + 34, WORLD.groundY + rise);
    ctx.stroke();
  }
}

function drawLevel3Ground() {
  const width = window.innerWidth;
  const calm = state.story.level3.calm;

  const groundGradient = ctx.createLinearGradient(0, WORLD.groundY - 20, 0, window.innerHeight);
  groundGradient.addColorStop(0, `rgba(${Math.round(20 + calm * 16)}, ${Math.round(22 + calm * 20)}, ${Math.round(30 + calm * 28)}, 0.98)`);
  groundGradient.addColorStop(1, `rgba(${Math.round(4 + calm * 18)}, ${Math.round(5 + calm * 20)}, ${Math.round(10 + calm * 34)}, 1)`);
  ctx.fillStyle = groundGradient;
  ctx.fillRect(0, WORLD.groundY, width, window.innerHeight - WORLD.groundY + 80);

  ctx.strokeStyle = `rgba(134, 215, 255, ${0.24 - calm * 0.08})`;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, WORLD.groundY);
  ctx.lineTo(width, WORLD.groundY);
  ctx.stroke();

  const startX = Math.floor((state.cameraX - width * 0.8) / 120) * 120;
  for (let worldX = startX; worldX < state.cameraX + width * 0.8; worldX += 120) {
    const x = worldToScreenX(worldX);
    ctx.strokeStyle =
      worldX % 240 === 0
        ? `rgba(214, 95, 111, ${0.18 - calm * 0.06})`
        : `rgba(255, 248, 223, ${0.08 - calm * 0.03})`;
    ctx.beginPath();
    ctx.moveTo(x - 30, WORLD.groundY);
    ctx.lineTo(x + Math.sin(worldX * 0.01 + state.time) * 24, WORLD.groundY + 24 + Math.cos(worldX * 0.02) * 16);
    ctx.stroke();
  }
}

function drawLevelMarkers() {
  if (!isLevelOneActive()) return;

  const startX = worldToScreenX(state.story.levelStartX);
  const exitX = worldToScreenX(state.story.levelExitX);
  const markerTop = WORLD.groundY - 132;

  ctx.save();

  const startGlow = ctx.createLinearGradient(startX, markerTop, startX, WORLD.groundY);
  startGlow.addColorStop(0, "rgba(134, 215, 255, 0.2)");
  startGlow.addColorStop(1, "rgba(134, 215, 255, 0)");
  ctx.fillStyle = startGlow;
  ctx.fillRect(startX - 44, markerTop - 24, 88, 170);
  ctx.fillStyle = "rgba(134, 215, 255, 0.82)";
  ctx.fillRect(startX - 10, WORLD.groundY - 92, 20, 92);
  ctx.fillRect(startX - 26, WORLD.groundY - 12, 52, 10);
  ctx.fillStyle = "rgba(255, 248, 223, 0.82)";
  ctx.font = '12px "Palatino Linotype", Georgia, serif';
  ctx.textAlign = "center";
  ctx.fillText("Start Point", startX, markerTop - 8);

  const exitGlow = ctx.createLinearGradient(exitX, markerTop - 16, exitX, WORLD.groundY);
  exitGlow.addColorStop(0, "rgba(214, 95, 111, 0.34)");
  exitGlow.addColorStop(1, "rgba(214, 95, 111, 0)");
  ctx.fillStyle = exitGlow;
  ctx.fillRect(exitX - 60, markerTop - 36, 120, 194);
  ctx.strokeStyle = "rgba(255, 141, 114, 0.94)";
  ctx.lineWidth = 4;
  ctx.strokeRect(exitX - 36, WORLD.groundY - 124, 72, 124);
  ctx.fillStyle = "rgba(255, 141, 114, 0.18)";
  ctx.fillRect(exitX - 32, WORLD.groundY - 120, 64, 120);
  ctx.fillStyle = "rgba(255, 248, 223, 0.92)";
  ctx.fillText("End Gate", exitX, markerTop - 24);
  ctx.fillStyle = "rgba(255, 141, 114, 0.88)";
  ctx.fillText("Level 2", exitX, markerTop - 8);
  ctx.restore();
}

function drawDoorChallenge() {
  if (state.story.scene !== STORY_SCENES.doors) return;

  ctx.save();
  ctx.textAlign = "center";
  ctx.font = '12px "Palatino Linotype", Georgia, serif';

  for (let i = 0; i < DOOR_COUNT; i += 1) {
    const doorX = worldToScreenX(getDoorWorldX(i));
    const doorY = WORLD.groundY - 152;
    const wrongDoor = state.story.lastDoorChoice === i && state.story.wrongDoorPulse > 0.02;
    const fill = wrongDoor ? "rgba(214, 95, 111, 0.38)" : "rgba(19, 26, 34, 0.92)";
    const stroke = wrongDoor ? "rgba(255, 141, 114, 0.96)" : "rgba(240, 200, 131, 0.78)";

    ctx.shadowBlur = wrongDoor ? 22 : 12;
    ctx.shadowColor = wrongDoor ? "rgba(214, 95, 111, 0.72)" : "rgba(240, 200, 131, 0.34)";
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(doorX - 42, WORLD.groundY);
    ctx.lineTo(doorX - 42, doorY + 24);
    ctx.quadraticCurveTo(doorX - 42, doorY - 24, doorX, doorY - 24);
    ctx.quadraticCurveTo(doorX + 42, doorY - 24, doorX + 42, doorY + 24);
    ctx.lineTo(doorX + 42, WORLD.groundY);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 248, 223, 0.9)";
    ctx.fillText(`Door ${i + 1}`, doorX, doorY - 42);
  }

  ctx.restore();
}

function drawBoneQuest() {
  if (
    state.story.scene !== STORY_SCENES.dogIntro &&
    state.story.scene !== STORY_SCENES.boneHunt &&
    state.story.scene !== STORY_SCENES.puzzle &&
    state.story.scene !== STORY_SCENES.complete
  ) {
    return;
  }

  const bone = state.story.bone;
  const shrineX = worldToScreenX(STORY_POINTS.boneShrineX);
  const shrineTop = WORLD.groundY - 86;

  ctx.save();
  ctx.fillStyle = "rgba(18, 22, 28, 0.92)";
  ctx.fillRect(shrineX - 34, shrineTop + 26, 68, 60);
  ctx.fillStyle = "rgba(62, 68, 76, 0.84)";
  ctx.beginPath();
  ctx.moveTo(shrineX - 42, WORLD.groundY);
  ctx.lineTo(shrineX - 18, shrineTop + 10);
  ctx.lineTo(shrineX + 18, shrineTop + 10);
  ctx.lineTo(shrineX + 42, WORLD.groundY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(214, 95, 111, 0.42)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(shrineX - 4, shrineTop + 8);
  ctx.lineTo(shrineX + 8, shrineTop + 28);
  ctx.lineTo(shrineX - 2, shrineTop + 42);
  ctx.stroke();

  if (!bone.returned) {
    let boneX = bone.x;
    let boneY = bone.y;
    const carrier = getBoneCarrier();
    if (carrier) {
      boneX = carrier.x + carrier.facing * 18;
      boneY = carrier.y + 76;
    }

    const x = worldToScreenX(boneX);
    const y = WORLD.groundY - boneY;
    const alpha = bone.found ? 1 : bone.reveal;

    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 14;
    ctx.shadowColor = "rgba(255, 248, 223, 0.5)";
    ctx.strokeStyle = "rgba(255, 248, 223, 0.96)";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - 12, y);
    ctx.lineTo(x + 12, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x - 14, y - 4, 5, 0, TAU);
    ctx.arc(x - 14, y + 4, 5, 0, TAU);
    ctx.arc(x + 14, y - 4, 5, 0, TAU);
    ctx.arc(x + 14, y + 4, 5, 0, TAU);
    ctx.fillStyle = "rgba(255, 248, 223, 0.94)";
    ctx.fill();
  }

  ctx.restore();
}

function drawPuzzleCorridor() {
  if (
    state.story.scene !== STORY_SCENES.puzzle &&
    state.story.scene !== STORY_SCENES.complete
  ) {
    return;
  }

  const rune = state.story.puzzles.rune;
  const plates = state.story.puzzles.plates;

  ctx.save();
  ctx.textAlign = "center";
  ctx.font = '12px "Palatino Linotype", Georgia, serif';

  for (let i = 0; i < rune.positions.length; i += 1) {
    const x = worldToScreenX(rune.positions[i]);
    const y = WORLD.groundY - 120;
    const active = rune.activated[i] || rune.solved;
    const wrongGlow = rune.wrongPulse > 0.02 && !active;
    ctx.shadowBlur = active ? 18 : wrongGlow ? 14 : 8;
    ctx.shadowColor = active ? "rgba(134, 215, 255, 0.62)" : "rgba(214, 95, 111, 0.28)";
    ctx.fillStyle = active ? "rgba(34, 72, 98, 0.9)" : "rgba(20, 24, 31, 0.92)";
    ctx.fillRect(x - 28, y, 56, 120);
    ctx.strokeStyle = active ? "rgba(134, 215, 255, 0.92)" : "rgba(240, 200, 131, 0.74)";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(x - 28, y, 56, 120);
    ctx.fillStyle = active ? "rgba(255, 248, 223, 0.94)" : "rgba(240, 200, 131, 0.88)";
    ctx.fillText(["L", "M", "R"][i], x, y + 66);
  }

  if (rune.solved) {
    for (let i = 0; i < plates.positions.length; i += 1) {
      const x = worldToScreenX(plates.positions[i]);
      const active = plates.activated[i] || plates.solved;
      const wrongGlow = plates.wrongPulse > 0.02 && !active;
      const colors = [
        "rgba(134, 215, 255, 0.86)",
        "rgba(240, 200, 131, 0.86)",
        "rgba(214, 95, 111, 0.86)",
      ];

      ctx.shadowBlur = active ? 18 : wrongGlow ? 14 : 8;
      ctx.shadowColor = active ? colors[i] : "rgba(255, 255, 255, 0.08)";
      ctx.fillStyle = active ? colors[i] : "rgba(24, 30, 38, 0.88)";
      ctx.fillRect(x - 48, WORLD.groundY - 10, 96, 10);
      ctx.fillStyle = active ? "rgba(255, 248, 223, 0.94)" : "rgba(205, 214, 224, 0.72)";
      ctx.fillText(plates.colors[i], x, WORLD.groundY - 26);
    }
  }

  if (state.story.scene === STORY_SCENES.complete) {
    const exitX = worldToScreenX(STORY_POINTS.puzzleExitX);
    ctx.shadowBlur = 22;
    ctx.shadowColor = "rgba(134, 215, 255, 0.56)";
    ctx.strokeStyle = "rgba(134, 215, 255, 0.9)";
    ctx.lineWidth = 4;
    ctx.strokeRect(exitX - 34, WORLD.groundY - 124, 68, 124);
    ctx.fillStyle = "rgba(134, 215, 255, 0.16)";
    ctx.fillRect(exitX - 30, WORLD.groundY - 120, 60, 120);
    ctx.fillStyle = "rgba(255, 248, 223, 0.9)";
    ctx.fillText("Partner Gate", exitX, WORLD.groundY - 138);
  }

  ctx.restore();
}

function drawLevel3Shadows() {
  if (!isLevel3Scene()) return;

  ctx.save();
  const shadowAlpha =
    state.story.scene === STORY_SCENES.level3Farewell
      ? Math.max(0, 0.22 * (1 - state.story.level3.finaleFade * 1.2))
      : 0.22;
  for (const shadow of state.story.level3.shadows) {
    const x = worldToScreenX(shadow.x);
    const y = WORLD.groundY - 58 - shadow.y;
    const sway = Math.sin(state.time * 8 + shadow.jitter) * 4;

    ctx.globalAlpha = shadowAlpha;
    ctx.shadowBlur = 18;
    ctx.shadowColor = "rgba(214, 95, 111, 0.34)";
    ctx.fillStyle = "rgba(6, 8, 12, 0.92)";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 12, y + 16);
    ctx.lineTo(x + 10, y + 54);
    ctx.lineTo(x - 10, y + 54);
    ctx.lineTo(x - 12, y + 16);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(x - 7, y + 54, 5, 14 + sway * 0.2);
    ctx.fillRect(x + 2, y + 54, 5, 14 - sway * 0.2);
    ctx.fillRect(x - 12, y + 18, 24, 3);
  }
  ctx.restore();
}

function drawLevel3Echoes() {
  if (state.story.scene !== STORY_SCENES.level3Battle) return;

  for (const echo of state.story.level3.echoes) {
    const x = worldToScreenX(echo.x);
    const y = WORLD.groundY - echo.height - echo.y;

    ctx.save();
    ctx.globalAlpha = echo.opacity;
    ctx.shadowBlur = 20;
    ctx.shadowColor = "rgba(134, 215, 255, 0.34)";
    ctx.fillStyle = "rgba(8, 10, 14, 0.88)";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + echo.width * 0.4, y + 8, x + echo.width * 0.34, y + echo.height * 0.46);
    ctx.quadraticCurveTo(x + echo.width * 0.2, y + echo.height * 0.9, x, y + echo.height * 0.8);
    ctx.quadraticCurveTo(x - echo.width * 0.2, y + echo.height * 0.9, x - echo.width * 0.34, y + echo.height * 0.46);
    ctx.quadraticCurveTo(x - echo.width * 0.4, y + 8, x, y);
    ctx.fill();
    ctx.fillStyle = "rgba(214, 95, 111, 0.86)";
    ctx.fillRect(x - 6, y + echo.height * 0.3, 3, 2);
    ctx.fillRect(x + 3, y + echo.height * 0.3, 3, 2);
    ctx.restore();
  }
}

function drawTrueColossus() {
  if (!isLevel3Scene()) return;

  const boss = state.story.level3.boss;
  if (!boss.active && !boss.defeated && !boss.finalStrike) return;

  const x = worldToScreenX(boss.x);
  const y = WORLD.groundY - boss.height - boss.y;
  const pulseScale = 1 + boss.pulse * 0.04;
  const farewellAlpha =
    state.story.scene === STORY_SCENES.level3Farewell
      ? Math.max(0, 0.55 * (1 - state.story.level3.finaleFade * 1.15))
      : 1;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(pulseScale, 1);
  ctx.globalAlpha = Math.max(boss.opacity, boss.defeated ? 0.2 : 0.6) * farewellAlpha;
  ctx.shadowBlur = 30 + boss.impactPulse * 22;
  ctx.shadowColor = "rgba(214, 95, 111, 0.54)";

  const body = ctx.createLinearGradient(0, 0, 0, boss.height);
  body.addColorStop(0, "rgba(12, 16, 22, 0.98)");
  body.addColorStop(0.5, "rgba(32, 18, 30, 0.92)");
  body.addColorStop(1, "rgba(8, 10, 14, 0.98)");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(boss.width * 0.34, 18);
  ctx.lineTo(boss.width * 0.46, boss.height * 0.34);
  ctx.lineTo(boss.width * 0.38, boss.height);
  ctx.lineTo(0, boss.height * 0.86);
  ctx.lineTo(-boss.width * 0.38, boss.height);
  ctx.lineTo(-boss.width * 0.46, boss.height * 0.34);
  ctx.lineTo(-boss.width * 0.34, 18);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(134, 215, 255, 0.54)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-boss.width * 0.2, boss.height * 0.24);
  ctx.lineTo(0, boss.height * 0.14);
  ctx.lineTo(boss.width * 0.2, boss.height * 0.24);
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 141, 114, 0.9)";
  ctx.fillRect(-14, boss.height * 0.28, 8, 3);
  ctx.fillRect(6, boss.height * 0.28, 8, 3);

  for (let i = 0; i < 4; i += 1) {
    const armOffset = -boss.width * 0.36 + i * (boss.width * 0.24);
    ctx.strokeStyle = i % 2 === 0 ? "rgba(214, 95, 111, 0.36)" : "rgba(134, 215, 255, 0.28)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(armOffset, boss.height * 0.42);
    ctx.lineTo(armOffset + Math.sin(state.time * 3 + i) * 18, boss.height * 0.88);
    ctx.stroke();
  }

  if (boss.active && !boss.defeated) {
    const width = 170;
    ctx.fillStyle = "rgba(0, 0, 0, 0.26)";
    ctx.fillRect(-width * 0.5, -18, width, 7);
    ctx.fillStyle = "rgba(214, 95, 111, 0.92)";
    ctx.fillRect(-width * 0.5, -18, width * (boss.health / boss.maxHealth), 7);
  }

  ctx.restore();
}

function drawDog() {
  if (!state.story.dog.active) return;

  const dog = state.story.dog;
  const x = worldToScreenX(dog.x);
  const bounce = Math.sin(state.time * 5.2) * 1.6;
  const y = WORLD.groundY - 30 - bounce;
  const wag = Math.sin(state.time * (dog.tamed ? 12 : 8)) * (dog.tamed ? 0.7 : 0.35);

  ctx.save();
  ctx.translate(x, y);
  if (isLevel3Scene()) {
    ctx.globalAlpha = state.story.level3.dogFade;
  }
  ctx.shadowBlur = dog.tamed ? 16 : 8;
  ctx.shadowColor = dog.tamed ? "rgba(240, 200, 131, 0.52)" : "rgba(255, 248, 223, 0.26)";
  ctx.fillStyle = "rgba(249, 223, 180, 0.98)";
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 16, 0, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(18, -10, 13, 11, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(209, 164, 118, 0.98)";
  ctx.beginPath();
  ctx.moveTo(11, -14);
  ctx.lineTo(18, -28);
  ctx.lineTo(24, -12);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(24, -14);
  ctx.lineTo(30, -28);
  ctx.lineTo(34, -12);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(84, 58, 38, 0.94)";
  ctx.fillRect(10, 10, 5, 16);
  ctx.fillRect(-8, 10, 5, 16);
  ctx.fillRect(2, 10, 5, 16);
  ctx.fillRect(20, 10, 5, 16);
  ctx.save();
  ctx.translate(-24, -6);
  ctx.rotate(-0.65 + wag);
  ctx.fillStyle = "rgba(209, 164, 118, 0.98)";
  ctx.fillRect(-3, -2, 22, 5);
  ctx.restore();
  ctx.fillStyle = "rgba(64, 44, 30, 0.96)";
  ctx.fillRect(20, -12, 3, 3);
  ctx.fillRect(27, -12, 3, 3);
  ctx.fillRect(30, -5, 4, 3);

  if (dog.tamed) {
    ctx.strokeStyle = "rgba(134, 215, 255, 0.92)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(18, -8, 9, 0.2, 2.8);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255, 248, 223, 0.82)";
  ctx.font = '11px "Palatino Linotype", Georgia, serif';
  ctx.textAlign = "center";
  ctx.fillText(dog.nickname, 0, -26);

  ctx.restore();
}

function drawSpikeTrap(trap) {
  const x = worldToScreenX(trap.x);
  const left = x - trap.width * 0.5;
  const baseY = WORLD.groundY;
  const teeth = Math.max(6, Math.floor(trap.width / 18));

  ctx.save();
  ctx.fillStyle = "rgba(92, 38, 34, 0.86)";
  ctx.fillRect(left, baseY - 6, trap.width, 8);
  ctx.fillStyle = "rgba(255, 141, 114, 0.88)";

  for (let i = 0; i < teeth; i += 1) {
    const toothLeft = left + (i / teeth) * trap.width;
    const toothWidth = trap.width / teeth;
    ctx.beginPath();
    ctx.moveTo(toothLeft, baseY - 2);
    ctx.lineTo(toothLeft + toothWidth * 0.5, baseY - 18);
    ctx.lineTo(toothLeft + toothWidth, baseY - 2);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function drawMineTrap(trap) {
  const x = worldToScreenX(trap.x);
  const pulse = getTrapPulse(trap);
  const active = pulse > 0.72;
  const glow = 14 + pulse * 18;

  ctx.save();
  ctx.shadowBlur = glow;
  ctx.shadowColor = active ? "rgba(236, 255, 141, 0.72)" : "rgba(134, 215, 255, 0.28)";
  ctx.fillStyle = active ? "rgba(236, 255, 141, 0.9)" : "rgba(70, 90, 102, 0.88)";
  ctx.beginPath();
  ctx.arc(x, WORLD.groundY - 12, 12 + pulse * 3, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(14, 18, 20, 0.92)";
  ctx.beginPath();
  ctx.arc(x, WORLD.groundY - 12, 5 + pulse * 1.5, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawShortcut(shortcut) {
  const x = worldToScreenX(shortcut.x);
  const top = WORLD.groundY - shortcut.height;
  const shimmer = 0.3 + Math.sin(state.time * 2 + shortcut.x * 0.003) * 0.18;
  const nearPlayer = getLivingPlayers().some(
    (player) => Math.abs(player.x - shortcut.x) < 180 && player.y > 12
  );

  ctx.save();
  ctx.globalAlpha = nearPlayer ? 0.86 : 0.34;
  const portal = ctx.createLinearGradient(x, top, x, WORLD.groundY);
  portal.addColorStop(0, `rgba(134, 215, 255, ${0.08 + shimmer * 0.22})`);
  portal.addColorStop(0.5, `rgba(255, 248, 223, ${0.14 + shimmer * 0.16})`);
  portal.addColorStop(1, `rgba(255, 141, 114, ${0.08 + shimmer * 0.22})`);
  ctx.fillStyle = portal;
  ctx.fillRect(x - shortcut.width * 0.5, top, shortcut.width, shortcut.height);
  ctx.strokeStyle = nearPlayer ? "rgba(240, 200, 131, 0.62)" : "rgba(134, 215, 255, 0.34)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x - shortcut.width * 0.5, top, shortcut.width, shortcut.height);

  if (nearPlayer) {
    ctx.fillStyle = "rgba(255, 247, 228, 0.74)";
    ctx.font = '11px "Palatino Linotype", Georgia, serif';
    ctx.textAlign = "center";
    ctx.fillText(shortcut.hint, x, top - 12);
  }

  ctx.restore();
}

function drawArenaFeatures() {
  if (!isLevelOneActive()) return;

  for (const trap of state.arena.traps) {
    if (trap.type === "spike") {
      drawSpikeTrap(trap);
    } else {
      drawMineTrap(trap);
    }
  }

  for (const shortcut of state.arena.shortcuts) {
    drawShortcut(shortcut);
  }
}

function drawWeaponShape(kind, tint) {
  const handle = "rgba(193, 172, 142, 0.98)";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

  if (kind === "blade") {
    ctx.fillStyle = tint;
    ctx.beginPath();
    ctx.moveTo(-12, -2);
    ctx.lineTo(16, 0);
    ctx.lineTo(-12, 2);
    ctx.lineTo(-18, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = handle;
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.lineTo(-26, 0);
    ctx.stroke();
    return;
  }

  if (kind === "spear") {
    ctx.strokeStyle = handle;
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(12, 0);
    ctx.stroke();
    ctx.fillStyle = tint;
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(8, -6);
    ctx.lineTo(10, 0);
    ctx.lineTo(8, 6);
    ctx.closePath();
    ctx.fill();
    return;
  }

  ctx.strokeStyle = handle;
  ctx.beginPath();
  ctx.moveTo(-22, 0);
  ctx.lineTo(8, 0);
  ctx.stroke();
  ctx.fillStyle = tint;
  ctx.beginPath();
  ctx.moveTo(4, -10);
  ctx.quadraticCurveTo(18, -8, 18, 0);
  ctx.quadraticCurveTo(18, 8, 4, 10);
  ctx.quadraticCurveTo(8, 2, 8, 0);
  ctx.quadraticCurveTo(8, -2, 4, -10);
  ctx.fill();
}

function drawWeaponDrops() {
  for (const drop of state.weaponDrops) {
    const x = worldToScreenX(drop.x);
    const y = WORLD.groundY - drop.y - 18;
    const fade = drop.grounded && drop.age > 10 ? 1 - clamp((drop.age - 10) / 2, 0, 1) : 1;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(drop.rotation);
    ctx.globalAlpha = fade;
    ctx.shadowBlur = 18;
    ctx.shadowColor = drop.glow;
    drawWeaponShape(drop.kind, drop.tint);
    ctx.restore();
  }
}

function drawProjectiles() {
  for (const projectile of state.projectiles) {
    const x = worldToScreenX(projectile.x);
    const y = WORLD.groundY - projectile.y - 18;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(projectile.rotation);
    ctx.shadowBlur = 18;
    ctx.shadowColor = projectile.tint;
    drawWeaponShape(projectile.kind, projectile.tint);
    ctx.restore();
  }
}

function drawEnemyHealth(enemy, x, y) {
  if (enemy.maxHealth <= 1) return;
  const width = Math.max(24, enemy.width * 0.62);
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillRect(x - width * 0.5, y, width, 4);
  ctx.fillStyle = enemy.type === "colossus" ? "rgba(236, 255, 141, 0.92)" : "rgba(255, 141, 114, 0.86)";
  ctx.fillRect(x - width * 0.5, y, width * (enemy.health / enemy.maxHealth), 4);
}

function drawWisp(enemy, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowBlur = 20 + enemy.impactPulse * 14;
  ctx.shadowColor = enemy.tintA;
  const body = ctx.createLinearGradient(0, 0, 0, enemy.height);
  body.addColorStop(0, enemy.tintA);
  body.addColorStop(0.4, "rgba(143, 223, 255, 0.66)");
  body.addColorStop(1, "rgba(18, 32, 42, 0.08)");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(enemy.width * 0.62, 3, enemy.width * 0.54, enemy.height * 0.48);
  ctx.quadraticCurveTo(enemy.width * 0.4, enemy.height * 0.94, 0, enemy.height * 0.78);
  ctx.quadraticCurveTo(-enemy.width * 0.4, enemy.height * 0.94, -enemy.width * 0.54, enemy.height * 0.48);
  ctx.quadraticCurveTo(-enemy.width * 0.62, 3, 0, 0);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 250, 236, 0.9)";
  ctx.fillRect(-6, enemy.height * 0.26, 3, 2);
  ctx.fillRect(3, enemy.height * 0.26, 3, 2);
  ctx.restore();
}

function drawSpecter(enemy, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowBlur = 22 + enemy.impactPulse * 16;
  ctx.shadowColor = enemy.tintA;
  ctx.fillStyle = enemy.tintB;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(enemy.width * 0.46, enemy.height * 0.24);
  ctx.lineTo(enemy.width * 0.28, enemy.height * 0.86);
  ctx.lineTo(0, enemy.height);
  ctx.lineTo(-enemy.width * 0.28, enemy.height * 0.86);
  ctx.lineTo(-enemy.width * 0.46, enemy.height * 0.24);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = enemy.tintA;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-enemy.width * 0.18, enemy.height * 0.32);
  ctx.lineTo(enemy.width * 0.18, enemy.height * 0.32);
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 141, 114, 0.92)";
  ctx.fillRect(-5, enemy.height * 0.3, 3, 2);
  ctx.fillRect(2, enemy.height * 0.3, 3, 2);
  ctx.restore();
}

function drawCrawler(enemy, x, y) {
  ctx.save();
  ctx.translate(x, y + enemy.height);
  ctx.shadowBlur = 14 + enemy.impactPulse * 12;
  ctx.shadowColor = enemy.tintA;
  ctx.fillStyle = enemy.tintB;
  ctx.beginPath();
  ctx.moveTo(-enemy.width * 0.5, 0);
  ctx.lineTo(-enemy.width * 0.2, -enemy.height * 0.9);
  ctx.lineTo(enemy.width * 0.38, -enemy.height * 0.72);
  ctx.lineTo(enemy.width * 0.5, -enemy.height * 0.2);
  ctx.lineTo(enemy.width * 0.22, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = enemy.tintA;
  ctx.fillRect(-enemy.width * 0.08, -enemy.height * 0.66, 8, 4);
  ctx.fillRect(enemy.width * 0.14, -enemy.height * 0.48, 8, 4);
  ctx.restore();
}

function drawBrute(enemy, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowBlur = 16 + enemy.impactPulse * 16;
  ctx.shadowColor = enemy.tintA;
  ctx.fillStyle = enemy.tintB;
  ctx.fillRect(-enemy.width * 0.42, enemy.height * 0.14, enemy.width * 0.84, enemy.height * 0.76);
  ctx.beginPath();
  ctx.moveTo(-enemy.width * 0.4, enemy.height * 0.18);
  ctx.lineTo(0, 0);
  ctx.lineTo(enemy.width * 0.4, enemy.height * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = enemy.tintA;
  ctx.fillRect(-enemy.width * 0.12, enemy.height * 0.3, enemy.width * 0.24, 6);
  ctx.fillRect(-enemy.width * 0.2, enemy.height * 0.18, 10, 4);
  ctx.fillRect(enemy.width * 0.1, enemy.height * 0.18, 10, 4);
  ctx.restore();
}

function drawColossus(enemy, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowBlur = 24 + enemy.impactPulse * 20;
  ctx.shadowColor = enemy.tintA;
  ctx.fillStyle = enemy.tintB;
  ctx.fillRect(-enemy.width * 0.46, enemy.height * 0.18, enemy.width * 0.92, enemy.height * 0.8);
  ctx.beginPath();
  ctx.moveTo(-enemy.width * 0.5, enemy.height * 0.22);
  ctx.lineTo(-enemy.width * 0.18, 0);
  ctx.lineTo(enemy.width * 0.18, 0);
  ctx.lineTo(enemy.width * 0.5, enemy.height * 0.22);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = enemy.tintA;
  ctx.fillRect(-enemy.width * 0.18, enemy.height * 0.32, enemy.width * 0.36, 8);
  ctx.fillRect(-enemy.width * 0.28, enemy.height * 0.18, 12, 4);
  ctx.fillRect(enemy.width * 0.16, enemy.height * 0.18, 12, 4);
  ctx.restore();
}

function drawEnemies() {
  for (const enemy of state.enemies) {
    const x = worldToScreenX(enemy.x);
    const y = WORLD.groundY - enemy.height - enemy.y;

    ctx.save();
    ctx.globalAlpha = enemy.opacity;
    ctx.fillStyle = enemy.type === "colossus" ? "rgba(8, 12, 12, 0.56)" : "rgba(9, 14, 18, 0.34)";
    ctx.beginPath();
    ctx.ellipse(
      x,
      WORLD.groundY + 5,
      enemy.width * (enemy.type === "colossus" ? 0.66 : 0.5),
      enemy.type === "colossus" ? 10 : 7,
      0,
      0,
      TAU
    );
    ctx.fill();

    if (enemy.type === "wisp") {
      drawWisp(enemy, x, y);
    } else if (enemy.type === "specter") {
      drawSpecter(enemy, x, y);
    } else if (enemy.type === "crawler") {
      drawCrawler(enemy, x, y);
    } else if (enemy.type === "brute") {
      drawBrute(enemy, x, y);
    } else {
      drawColossus(enemy, x, y);
    }

    drawEnemyHealth(enemy, x, y - 12);
    ctx.restore();
  }
}

function drawPlayer(player) {
  const x = worldToScreenX(player.x);
  const runBob = Math.sin(player.runCycle) * Math.min(4, Math.abs(player.vx) * 0.012);
  const y = WORLD.groundY - player.height - player.y - runBob;
  const lean = clamp(player.vx * 0.00115, -0.18, 0.18);

  ctx.save();
  ctx.fillStyle = "rgba(6, 10, 14, 0.44)";
  ctx.beginPath();
  ctx.ellipse(x, WORLD.groundY + 5, 22, 8, 0, 0, TAU);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  ctx.globalAlpha = !player.alive ? 0.28 : player.invulnerability > 0 && Math.sin(state.time * 30) > 0 ? 0.58 : 1;

  if (player.glow > 0.02) {
    ctx.shadowBlur = 18 + player.attackPulse * 18 + player.jumpPulse * 6;
    ctx.shadowColor = player.attackPulse > 0.02 ? player.accentGlow : `${player.secondary}88`;
  }

  const hood = ctx.createLinearGradient(0, 0, 0, player.height);
  hood.addColorStop(0, "rgba(227, 231, 236, 0.98)");
  hood.addColorStop(1, "rgba(125, 139, 152, 0.98)");
  ctx.fillStyle = hood;
  ctx.fillRect(-10, 12, 20, 34);
  ctx.fillRect(-6, 4, 12, 10);

  ctx.fillStyle = player.accent;
  ctx.fillRect(-3, 9, 6, 3);
  ctx.fillRect(-9, 18, 18, 3);

  const legStep = Math.sin(player.runCycle * 1.3) * Math.min(6, Math.abs(player.vx) * 0.015);
  ctx.fillStyle = "rgba(195, 204, 214, 0.94)";
  ctx.fillRect(-8, 44, 6, 14 + legStep * 0.18);
  ctx.fillRect(2, 44, 6, 14 - legStep * 0.18);

  ctx.fillStyle = "rgba(68, 86, 98, 0.92)";
  ctx.beginPath();
  ctx.moveTo(-12, 12);
  ctx.lineTo(0, -2);
  ctx.lineTo(12, 12);
  ctx.closePath();
  ctx.fill();

  for (let i = 0; i < Math.min(player.weaponCharges, 5); i += 1) {
    const shardAngle = -1.05 + i * 0.38 + Math.sin(state.time * 2.4 + i) * 0.05;
    const shardX = Math.cos(shardAngle) * (18 + i * 2);
    const shardY = 18 + Math.sin(shardAngle) * 12;
    ctx.fillStyle = i % 2 === 0 ? player.secondary : player.accent;
    ctx.fillRect(shardX, shardY, 5, 2);
  }

  if (player.attackPulse > 0.02) {
    ctx.save();
    ctx.globalAlpha = player.attackPulse;
    ctx.strokeStyle = player.accent;
    ctx.lineWidth = 6;
    ctx.beginPath();
    if (player.facing > 0) {
      ctx.arc(8, 24, 28, -0.8, 0.8);
    } else {
      ctx.arc(-8, 24, 28, Math.PI - 0.8, Math.PI + 0.8);
    }
    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle = "rgba(255, 250, 236, 0.84)";
  ctx.font = '11px "Palatino Linotype", Georgia, serif';
  ctx.textAlign = "center";
  ctx.fillText(player.name, 0, -8);
  ctx.restore();
}

function drawPlayers() {
  for (const player of state.players) {
    drawPlayer(player);
  }
}

function drawEndingFigure(x, y, options = {}) {
  const {
    scale = 1,
    body = "rgba(12, 14, 20, 0.98)",
    trim = "rgba(240, 200, 131, 0.92)",
    head = "rgba(255, 238, 220, 0.96)",
    glow = "rgba(134, 215, 255, 0.16)",
    opacity = 1,
    lean = 0,
    pose = "hero",
  } = options;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  ctx.scale(scale, scale);
  ctx.globalAlpha = opacity;
  ctx.shadowBlur = 22;
  ctx.shadowColor = glow;

  if (pose === "fallen") {
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(0, 12, 28, 11, 0, 0, TAU);
    ctx.fill();
    ctx.rotate(-1.08);
    ctx.fillStyle = body;
    ctx.fillRect(-24, -8, 48, 16);
    ctx.fillStyle = head;
    ctx.beginPath();
    ctx.arc(27, 0, 8, 0, TAU);
    ctx.fill();
    ctx.fillStyle = trim;
    ctx.fillRect(-10, -3, 18, 6);
    ctx.restore();
    return;
  }

  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(0, 6, 26, 12, 0, 0, TAU);
  ctx.fill();

  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-24, 46);
  ctx.lineTo(-10, -4);
  ctx.lineTo(10, -4);
  ctx.lineTo(24, 46);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = head;
  ctx.beginPath();
  ctx.arc(0, -18, 10, 0, TAU);
  ctx.fill();

  ctx.fillStyle = trim;
  ctx.fillRect(-4, -2, 8, 18);
  ctx.fillRect(-16, 16, 32, 4);

  if (pose === "female") {
    ctx.fillStyle = "rgba(214, 95, 111, 0.84)";
    ctx.beginPath();
    ctx.moveTo(-20, 42);
    ctx.lineTo(0, -8);
    ctx.lineTo(20, 42);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 236, 244, 0.38)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-10, -8);
    ctx.quadraticCurveTo(0, -28, 10, -8);
    ctx.stroke();
  }

  ctx.restore();
}

function drawEndingTrophy(x, y, scale = 1, opacity = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = opacity;
  ctx.shadowBlur = 24;
  ctx.shadowColor = "rgba(240, 200, 131, 0.34)";
  ctx.fillStyle = "rgba(240, 200, 131, 0.98)";
  ctx.beginPath();
  ctx.moveTo(-18, -28);
  ctx.lineTo(18, -28);
  ctx.lineTo(12, 2);
  ctx.lineTo(4, 14);
  ctx.lineTo(4, 30);
  ctx.lineTo(20, 30);
  ctx.lineTo(20, 38);
  ctx.lineTo(-20, 38);
  ctx.lineTo(-20, 30);
  ctx.lineTo(-4, 30);
  ctx.lineTo(-4, 14);
  ctx.lineTo(-12, 2);
  ctx.closePath();
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(240, 200, 131, 0.82)";
  ctx.beginPath();
  ctx.arc(-18, -14, 11, Math.PI * 0.5, Math.PI * 1.42);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(18, -14, 11, -Math.PI * 0.42, Math.PI * 0.5);
  ctx.stroke();
  ctx.restore();
}

function drawMysteriousWeapon(x, y, rotation, glow = 1, opacity = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = opacity;
  ctx.shadowBlur = 28;
  ctx.shadowColor = `rgba(134, 215, 255, ${0.24 + glow * 0.32})`;
  ctx.fillStyle = "rgba(220, 232, 246, 0.98)";
  ctx.fillRect(-92, -5, 184, 10);
  ctx.fillStyle = "rgba(134, 215, 255, 0.98)";
  ctx.beginPath();
  ctx.moveTo(92, 0);
  ctx.lineTo(122, -12);
  ctx.lineTo(122, 12);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(214, 95, 111, 0.96)";
  ctx.fillRect(-114, -2, 20, 4);
  ctx.restore();
}

function drawImpaledYaar(x, y, strikePulse = 1) {
  const bodyAngle = -1.04;
  const weaponAngle = -0.62;
  const glowAlpha = 0.16 + strikePulse * 0.22;

  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = "rgba(240, 200, 131, 0.12)";
  ctx.beginPath();
  ctx.ellipse(0, 18, 40, 14, 0, 0, TAU);
  ctx.fill();

  ctx.save();
  ctx.rotate(weaponAngle);
  ctx.shadowBlur = 22;
  ctx.shadowColor = `rgba(134, 215, 255, ${0.24 + strikePulse * 0.24})`;
  ctx.fillStyle = "rgba(220, 232, 246, 0.94)";
  ctx.fillRect(-118, -4, 86, 8);
  ctx.fillStyle = "rgba(214, 95, 111, 0.94)";
  ctx.fillRect(-132, -2, 18, 4);
  ctx.restore();

  ctx.save();
  ctx.rotate(bodyAngle);
  ctx.shadowBlur = 16;
  ctx.shadowColor = "rgba(240, 200, 131, 0.14)";
  ctx.fillStyle = "rgba(14, 16, 20, 0.98)";
  ctx.fillRect(-28, -10, 56, 20);
  ctx.fillStyle = "rgba(255, 238, 220, 0.9)";
  ctx.beginPath();
  ctx.arc(33, -1, 8, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(240, 200, 131, 0.9)";
  ctx.fillRect(-12, -3, 22, 6);
  ctx.restore();

  ctx.save();
  ctx.rotate(weaponAngle);
  ctx.shadowBlur = 30;
  ctx.shadowColor = `rgba(214, 95, 111, ${0.26 + strikePulse * 0.28})`;
  ctx.fillStyle = `rgba(214, 95, 111, ${0.2 + strikePulse * 0.25})`;
  ctx.beginPath();
  ctx.arc(0, 0, 20 + strikePulse * 12, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(220, 232, 246, 0.98)";
  ctx.fillRect(10, -4, 86, 8);
  ctx.fillStyle = "rgba(134, 215, 255, 0.98)";
  ctx.beginPath();
  ctx.moveTo(96, 0);
  ctx.lineTo(126, -12);
  ctx.lineTo(126, 12);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = `rgba(255, 244, 214, ${0.35 + strikePulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(4, 0, 7 + strikePulse * 5, 0, TAU);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

function drawEndingYaar(x, y, options = {}) {
  const {
    scale = 1,
    opacity = 1,
    glow = "rgba(240, 200, 131, 0.16)",
    calm = 0,
  } = options;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = opacity;
  ctx.shadowBlur = 18;
  ctx.shadowColor = glow;

  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(0, 18, 26, 10, 0, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "rgba(18, 18, 22, 0.98)";
  ctx.beginPath();
  ctx.moveTo(-24, 16);
  ctx.lineTo(-12, -8);
  ctx.lineTo(12, -8);
  ctx.lineTo(24, 14);
  ctx.lineTo(10, 22);
  ctx.lineTo(-18, 22);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(255, 245, 224, 0.94)";
  ctx.beginPath();
  ctx.arc(-2, -10, 10, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "rgba(240, 200, 131, 0.94)";
  ctx.beginPath();
  ctx.moveTo(-10, -12);
  ctx.lineTo(-4, -26);
  ctx.lineTo(2, -12);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(4, -12);
  ctx.lineTo(10, -26);
  ctx.lineTo(14, -10);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = calm > 0 ? "rgba(255, 248, 223, 0.96)" : "rgba(134, 215, 255, 0.92)";
  ctx.fillRect(-8, 0, 16, 4);
  ctx.fillRect(-16, 8, 10, 4);

  ctx.strokeStyle = "rgba(18, 18, 22, 0.98)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(18, 8);
  ctx.quadraticCurveTo(34, 0, 38, -10);
  ctx.stroke();

  ctx.restore();
}

function drawParticles() {
  ctx.save();
  for (const particle of state.particles) {
    const x = worldToScreenX(particle.x);
    const y = WORLD.groundY - particle.y;
    ctx.globalAlpha = clamp(particle.life / 0.9, 0, 1) * particle.alpha;
    ctx.fillStyle = particle.color;
    ctx.fillRect(x, y, particle.size, particle.size);
  }
  ctx.restore();
}

function drawArenaEdgeGlow() {
  const leftEdge = worldToScreenX(WORLD.left);
  const rightEdge = worldToScreenX(WORLD.right);
  const overdrive = state.phaseEnergy;

  const leftGradient = ctx.createLinearGradient(leftEdge, 0, leftEdge + 70, 0);
  leftGradient.addColorStop(0, overdrive > 0.35 ? "rgba(236, 255, 141, 0.34)" : "rgba(255, 141, 114, 0.24)");
  leftGradient.addColorStop(1, "rgba(255, 141, 114, 0)");
  ctx.fillStyle = leftGradient;
  ctx.fillRect(leftEdge, 0, 70, window.innerHeight);

  const rightGradient = ctx.createLinearGradient(rightEdge - 70, 0, rightEdge, 0);
  rightGradient.addColorStop(0, "rgba(255, 141, 114, 0)");
  rightGradient.addColorStop(1, overdrive > 0.35 ? "rgba(236, 255, 141, 0.34)" : "rgba(255, 141, 114, 0.24)");
  ctx.fillStyle = rightGradient;
  ctx.fillRect(rightEdge - 70, 0, 70, window.innerHeight);
}

function drawPrompt() {
  if (state.mode !== "playing") return;

  let baseHint;
  if (state.story.scene === STORY_SCENES.level1) {
    baseHint = "Reach the glowing end gate to begin level 2.";
  } else if (state.story.scene === STORY_SCENES.doors) {
    baseHint = "Try the three doors. Only one door lets you pass.";
  } else if (state.story.scene === STORY_SCENES.dogIntro) {
    baseHint = `${state.story.dog.name} is speaking. Listen to YAAR.`;
  } else if (state.story.scene === STORY_SCENES.boneHunt) {
    baseHint = state.story.bone.found
      ? `Take the hidden bone back to ${state.story.dog.nickname} and press Defend near him.`
      : `${state.story.dog.nickname} wants his hidden bone from the cracked shrine behind you.`;
  } else if (state.story.scene === STORY_SCENES.puzzle) {
    baseHint = !state.story.puzzles.rune.solved
      ? `${state.story.dog.nickname}: Touch the rune doors in Middle, Left, then Right.`
      : `${state.story.dog.nickname}: Walk the floor plates in Crimson, Azure, then Gold.`;
  } else if (state.story.scene === STORY_SCENES.complete) {
    baseHint = `${state.story.dog.nickname} follows you as your partner now.`;
  } else if (state.story.scene === STORY_SCENES.level3Intro) {
    baseHint = "Reality is breaking. Fresh relics answered the call. Hold still and listen to YAAR.";
  } else if (state.story.scene === STORY_SCENES.level3Battle) {
    baseHint = "Fight through the mimic shadows and strike the true Colossus.";
  } else if (state.story.scene === STORY_SCENES.level3Farewell) {
    baseHint = "The silence is finally calm.";
  } else if (state.story.scene === STORY_SCENES.level3Trophy) {
    baseHint = "The female entity is walking the trophy toward your hero.";
  } else if (state.story.scene === STORY_SCENES.level3Cliffhanger) {
    baseHint = "Time slowed around YAAR. Revenge is the only thing left speaking.";
  } else {
    baseHint = "The corridor feels wrong.";
  }

  if (state.notice.timer > 0.02) {
    ctx.save();
    ctx.globalAlpha = clamp(state.notice.timer / 1.7, 0, 1);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = '16px "Palatino Linotype", Georgia, serif';
    ctx.fillStyle = state.notice.color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = "rgba(0, 0, 0, 0.46)";
    ctx.fillText(state.notice.text, window.innerWidth * 0.5, window.innerHeight * 0.14);
    ctx.restore();
    return;
  }

  if (state.elapsed < 8.5) {
    ctx.save();
    ctx.globalAlpha = clamp(1 - state.elapsed / 8.5, 0, 1) * 0.9;
    ctx.textAlign = "center";
    ctx.font = '14px "Palatino Linotype", Georgia, serif';
    ctx.fillStyle = "rgba(217, 221, 227, 0.84)";
    ctx.fillText(baseHint, window.innerWidth * 0.5, window.innerHeight * 0.14);
    ctx.restore();
  }
}

function drawStoryOverlay() {
  if (state.mode !== "playing") return;

  if (state.story.scene === STORY_SCENES.warning) {
    const pulse = 0.75 + Math.sin(state.time * 11) * 0.18;
    const warningFontSize = Math.max(30, Math.min(56, Math.round(window.innerWidth * 0.052)));
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 ${warningFontSize}px "Palatino Linotype", Georgia, serif`;
    ctx.fillStyle = `rgba(214, 95, 111, ${pulse})`;
    ctx.shadowBlur = 28;
    ctx.shadowColor = "rgba(214, 95, 111, 0.56)";
    ctx.fillText("YOU SHOULD NOT BE HERE", window.innerWidth * 0.5, window.innerHeight * 0.34);
    ctx.restore();
  }

  if (state.story.scene === STORY_SCENES.dogIntro || state.story.scene === STORY_SCENES.boneHunt) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = '700 20px "Palatino Linotype", Georgia, serif';
    ctx.fillStyle = "rgba(255, 248, 223, 0.92)";
    ctx.fillText("SyntaxYaaR", window.innerWidth * 0.5, window.innerHeight * 0.18);
    ctx.font = '14px "Palatino Linotype", Georgia, serif';
    ctx.fillStyle = "rgba(240, 200, 131, 0.86)";
    ctx.fillText('"Call me YAAR. Bring me my bone and I will guide you."', window.innerWidth * 0.5, window.innerHeight * 0.22);
    ctx.restore();
  }

  if (state.story.scene === STORY_SCENES.puzzle) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = '700 20px "Palatino Linotype", Georgia, serif';
    ctx.fillStyle = "rgba(255, 248, 223, 0.88)";
    ctx.fillText("Level 2: Puzzle Corridor", window.innerWidth * 0.5, window.innerHeight * 0.18);
    ctx.font = '14px "Palatino Linotype", Georgia, serif';
    ctx.fillStyle = "rgba(134, 215, 255, 0.84)";
    ctx.fillText("YAAR is your partner now.", window.innerWidth * 0.5, window.innerHeight * 0.22);
    ctx.restore();
  }

  if (state.story.scene === STORY_SCENES.complete) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = '700 26px "Palatino Linotype", Georgia, serif';
    ctx.fillStyle = "rgba(255, 248, 223, 0.88)";
    ctx.fillText("SyntaxYaaR Joined You", window.innerWidth * 0.5, window.innerHeight * 0.2);
    ctx.font = '14px "Palatino Linotype", Georgia, serif';
    ctx.fillStyle = "rgba(240, 200, 131, 0.84)";
    ctx.fillText("YAAR is now your partner for the journey.", window.innerWidth * 0.5, window.innerHeight * 0.24);
    ctx.restore();
  }

  if (state.story.scene === STORY_SCENES.level3Intro) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = '700 22px "Palatino Linotype", Georgia, serif';
    ctx.fillStyle = "rgba(255, 248, 223, 0.92)";
    ctx.fillText("Level 3: The Broken Silence", window.innerWidth * 0.5, window.innerHeight * 0.18);
    ctx.font = '14px "Palatino Linotype", Georgia, serif';
    ctx.fillStyle = "rgba(214, 95, 111, 0.84)";
    ctx.fillText("The shadows are watching and copying everything.", window.innerWidth * 0.5, window.innerHeight * 0.22);
    ctx.restore();
  }

  if (state.story.scene === STORY_SCENES.level3Battle) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = '700 22px "Palatino Linotype", Georgia, serif';
    ctx.fillStyle = "rgba(255, 248, 223, 0.9)";
    ctx.fillText("True Form Of The Syntax Colossus", window.innerWidth * 0.5, window.innerHeight * 0.18);
    ctx.font = '14px "Palatino Linotype", Georgia, serif';
    ctx.fillStyle = "rgba(134, 215, 255, 0.84)";
    ctx.fillText("Ignored silence has taken shape.", window.innerWidth * 0.5, window.innerHeight * 0.22);
    ctx.restore();
  }

  if (state.story.scene === STORY_SCENES.level3Farewell) {
    const alpha = clamp(state.story.level3.finaleFade + 0.2, 0, 1);
    ctx.save();
    ctx.fillStyle = `rgba(228, 232, 238, ${alpha * 0.08})`;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = '700 22px "Palatino Linotype", Georgia, serif';
    ctx.fillStyle = `rgba(255, 248, 223, ${alpha * 0.92})`;
    ctx.fillText("The Battle Ended In Quiet", window.innerWidth * 0.5, window.innerHeight * 0.18);
    ctx.font = '14px "Palatino Linotype", Georgia, serif';
    ctx.fillStyle = `rgba(205, 214, 224, ${alpha * 0.88})`;
    ctx.fillText(LEVEL3_END_QUOTE, window.innerWidth * 0.5, window.innerHeight * 0.24);
    ctx.restore();
  }

  if (state.story.scene === STORY_SCENES.level3Trophy) {
    const progress = 1 - state.story.sceneTimer / LEVEL3_TROPHY_DURATION;
    const glow = 0.45 + state.story.level3.trophyGlow * 0.55;
    const womanX = lerp(window.innerWidth * 0.26, window.innerWidth * 0.42, clamp(progress / 0.72, 0, 1));
    const heroX = window.innerWidth * 0.62;
    const yBase = window.innerHeight * 0.64;
    const yaarX = heroX - 92;
    const trophyX = progress < 0.55
      ? womanX + 42
      : lerp(womanX + 42, heroX - 32, clamp((progress - 0.55) / 0.35, 0, 1));
    const trophyY = yBase - 78 - Math.sin(progress * Math.PI) * 10;
    const subtitle =
      progress < 0.45
        ? "She finally became visible, stepping out of the black with impossible calm."
        : "The whole arena fell into slow motion as the trophy passed from her hands to yours.";

    ctx.save();
    const beam = ctx.createRadialGradient(
      lerp(womanX, heroX, 0.45),
      yBase - 120,
      20,
      lerp(womanX, heroX, 0.45),
      yBase - 120,
      260
    );
    beam.addColorStop(0, `rgba(255, 247, 223, ${0.18 + glow * 0.12})`);
    beam.addColorStop(0.45, `rgba(240, 200, 131, ${0.08 + glow * 0.08})`);
    beam.addColorStop(1, "rgba(240, 200, 131, 0)");
    ctx.fillStyle = beam;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    ctx.fillStyle = `rgba(255, 255, 255, ${0.018 + glow * 0.02})`;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowBlur = 26;
    ctx.shadowColor = "rgba(240, 200, 131, 0.34)";
    ctx.fillStyle = "rgba(255, 248, 223, 0.96)";
    ctx.font = '700 22px "Palatino Linotype", Georgia, serif';
    ctx.fillText("The Female Entity Revealed Herself", window.innerWidth * 0.5, window.innerHeight * 0.16);
    ctx.font = '14px "Palatino Linotype", Georgia, serif';
    ctx.fillStyle = "rgba(205, 214, 224, 0.9)";
    ctx.fillText(subtitle, window.innerWidth * 0.5, window.innerHeight * 0.22);

    ctx.fillStyle = `rgba(10, 14, 18, ${0.18 + glow * 0.08})`;
    ctx.beginPath();
    ctx.ellipse(lerp(womanX, heroX, 0.5), yBase + 28, 220, 34, 0, 0, TAU);
    ctx.fill();

    drawEndingFigure(womanX, yBase, {
      scale: 1.34,
      pose: "female",
      body: "rgba(11, 12, 18, 0.98)",
      trim: "rgba(214, 95, 111, 0.9)",
      head: "rgba(246, 226, 236, 0.96)",
      glow: "rgba(214, 95, 111, 0.22)",
      lean: -0.06,
    });
    drawEndingFigure(heroX, yBase + 2, {
      scale: 1.3,
      pose: "hero",
      body: "rgba(12, 16, 22, 0.98)",
      trim: "rgba(134, 215, 255, 0.9)",
      head: "rgba(255, 238, 220, 0.96)",
      glow: "rgba(134, 215, 255, 0.2)",
      lean: 0.04,
    });
    drawEndingYaar(yaarX, yBase + 30, {
      scale: 0.86,
      glow: "rgba(240, 200, 131, 0.14)",
      calm: 1,
    });
    drawEndingTrophy(trophyX, trophyY, 1, 0.96);
    ctx.restore();
  }

  if (state.story.scene === STORY_SCENES.level3Cliffhanger) {
    const progress = 1 - state.story.sceneTimer / LEVEL3_CLIFFHANGER_DURATION;
    const weaponEntry = clamp((progress - 0.08) / 0.28, 0, 1);
    const strikePulse = clamp((progress - 0.34) / 0.12, 0, 1);
    const grief = clamp((progress - 0.5) / 0.18, 0, 1);
    const vow = clamp((progress - 0.62) / 0.18, 0, 1);
    const sequel = clamp((progress - 0.8) / 0.14, 0, 1);
    const watchers = clamp((progress - 0.48) / 0.18, 0, 1);
    const collapse = clamp((progress - 0.28) / 0.18, 0, 1);
    const alpha = 0.84 + Math.sin(state.time * 9) * 0.04;
    const heroX = window.innerWidth * 0.64;
    const yaarX = window.innerWidth * 0.46;
    const yBase = window.innerHeight * 0.66;
    const weaponX = lerp(window.innerWidth * 0.88, yaarX + 8, weaponEntry);
    const weaponY = lerp(window.innerHeight * 0.12, yBase + 2, weaponEntry);
    const title =
      progress < 0.32
        ? "The Moment Broke Open"
        : progress < 0.56
          ? "The Weapon Chose YAAR"
          : "Your Hero Spoke Revenge";

    ctx.save();
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    const collapseLight = ctx.createRadialGradient(yaarX, yBase + 8, 10, yaarX, yBase + 8, 220);
    collapseLight.addColorStop(0, `rgba(255, 246, 214, ${0.18 + collapse * 0.18})`);
    collapseLight.addColorStop(0.35, `rgba(134, 215, 255, ${0.12 + collapse * 0.14})`);
    collapseLight.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = collapseLight;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowBlur = 26;
    ctx.shadowColor = "rgba(214, 95, 111, 0.52)";
    ctx.font = '700 24px "Palatino Linotype", Georgia, serif';
    ctx.fillStyle = "rgba(255, 236, 214, 0.96)";
    ctx.fillText(title, window.innerWidth * 0.5, window.innerHeight * 0.17);
    ctx.font = '14px "Palatino Linotype", Georgia, serif';
    ctx.fillStyle = "rgba(205, 214, 224, 0.92)";
    ctx.fillText("The trophy had barely touched your hands when the world slowed into a nightmare.", window.innerWidth * 0.5, window.innerHeight * 0.23);

    for (let i = 0; i < 5; i += 1) {
      const barY = window.innerHeight * (0.24 + i * 0.12);
      const barAlpha = (0.02 + strikePulse * 0.06) * (i % 2 === 0 ? 1 : 0.7);
      ctx.fillStyle = `rgba(214, 95, 111, ${barAlpha})`;
      ctx.fillRect(0, barY, window.innerWidth, 3 + i);
    }

    drawEndingFigure(window.innerWidth * 0.28, yBase - 2, {
      scale: 1.12,
      pose: "female",
      body: "rgba(10, 11, 16, 0.94)",
      trim: "rgba(214, 95, 111, 0.72)",
      head: "rgba(246, 226, 236, 0.84)",
      glow: "rgba(214, 95, 111, 0.16)",
      opacity: clamp(1 - strikePulse * 1.15, 0, 1),
    });
    drawEndingFigure(heroX, yBase, {
      scale: 1.3,
      pose: "hero",
      body: "rgba(12, 16, 22, 0.98)",
      trim: "rgba(134, 215, 255, 0.92)",
      head: "rgba(255, 238, 220, 0.96)",
      glow: "rgba(134, 215, 255, 0.22)",
      lean: -grief * 0.12,
    });
    if (strikePulse < 0.22) {
      drawEndingYaar(yaarX, yBase + 30, {
        scale: 0.94,
        glow: "rgba(240, 200, 131, 0.16)",
        calm: 1,
      });
    } else {
      drawImpaledYaar(yaarX, yBase + 48, strikePulse);
    }
    drawEndingTrophy(heroX - 42, yBase - 74 + Math.sin(state.time * 2.6) * 2, 0.86, 0.95);

    if (weaponEntry > 0.01 && strikePulse < 0.96) {
      drawMysteriousWeapon(weaponX, weaponY, lerp(-1.08, -0.72, weaponEntry), strikePulse + 0.3, 0.94);
    }

    if (strikePulse > 0.02) {
      ctx.fillStyle = `rgba(214, 95, 111, ${0.16 + strikePulse * 0.34})`;
      ctx.beginPath();
      ctx.arc(yaarX + 2, yBase + 46, 24 + strikePulse * 30, 0, TAU);
      ctx.fill();
    }

    if (watchers > 0.02) {
      drawEndingFigure(window.innerWidth * 0.16, yBase - 14, {
        scale: 1.46,
        pose: "hero",
        body: "rgba(4, 5, 8, 0.98)",
        trim: "rgba(214, 95, 111, 0.42)",
        head: "rgba(10, 12, 16, 0.98)",
        glow: "rgba(214, 95, 111, 0.18)",
        opacity: watchers,
        lean: -0.05,
      });
      drawEndingFigure(window.innerWidth * 0.84, yBase - 18, {
        scale: 1.4,
        pose: "hero",
        body: "rgba(222, 232, 242, 0.26)",
        trim: "rgba(240, 200, 131, 0.5)",
        head: "rgba(248, 244, 236, 0.3)",
        glow: "rgba(236, 255, 141, 0.16)",
        opacity: watchers,
        lean: 0.04,
      });
    }

    if (watchers > 0.18) {
      ctx.globalAlpha = watchers;
      ctx.font = '700 13px "Palatino Linotype", Georgia, serif';
      ctx.fillStyle = "rgba(214, 95, 111, 0.92)";
      ctx.fillText('"Attachment... detected."', window.innerWidth * 0.22, window.innerHeight * 0.4);
      ctx.fillStyle = "rgba(236, 244, 230, 0.9)";
      ctx.fillText('"Now he will listen."', window.innerWidth * 0.78, window.innerHeight * 0.36);
    }

    if (vow > 0.02) {
      ctx.globalAlpha = vow;
      ctx.font = '700 17px "Palatino Linotype", Georgia, serif';
      ctx.fillStyle = "rgba(255, 236, 214, 0.98)";
      ctx.fillText('"You didn\'t kill him... you gave me a reason."', window.innerWidth * 0.5, window.innerHeight * 0.54);
    }

    if (sequel > 0.02) {
      ctx.globalAlpha = sequel;
      ctx.fillStyle = "rgba(240, 200, 131, 0.96)";
      ctx.font = '700 22px "Palatino Linotype", Georgia, serif';
      ctx.fillText("PART 2 COMING SOON", window.innerWidth * 0.5, window.innerHeight * 0.74);
      ctx.font = '14px "Palatino Linotype", Georgia, serif';
      ctx.fillStyle = "rgba(205, 214, 224, 0.88)";
      ctx.fillText("The next answer waits beyond the weapon that chose the dark.", window.innerWidth * 0.5, window.innerHeight * 0.8);
    }
    ctx.restore();
  }
}

function drawPhaseFlash() {
  if (state.phaseFlash <= 0.01) return;
  ctx.fillStyle = `rgba(236, 255, 141, ${state.phaseFlash * 0.18})`;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

function drawGameOverVeil() {
  if (state.mode !== "gameover") return;
  ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

function draw() {
  const shakeX = state.screenShake > 0 ? rand(-state.screenShake, state.screenShake) : 0;
  const shakeY = state.screenShake > 0 ? rand(-state.screenShake, state.screenShake) * 0.45 : 0;

  drawBackground();
  ctx.save();
  ctx.translate(shakeX, shakeY);
  drawBackdrop();
  drawGround();
  drawLevelMarkers();
  drawDoorChallenge();
  drawBoneQuest();
  drawPuzzleCorridor();
  drawArenaFeatures();
  drawArenaEdgeGlow();
  drawWeaponDrops();
  drawProjectiles();
  drawLevel3Shadows();
  drawEnemies();
  drawLevel3Echoes();
  drawTrueColossus();
  drawParticles();
  drawPlayers();
  drawDog();
  ctx.restore();
  drawPrompt();
  drawStoryOverlay();
  drawPhaseFlash();
  drawGameOverVeil();
}

function loop(timestamp) {
  if (!state.lastTick) {
    state.lastTick = timestamp;
  }

  const dt = clamp((timestamp - state.lastTick) / 1000, 0.001, 0.033);
  state.lastTick = timestamp;
  state.delta = dt;
  state.time += dt;

  try {
    if (state.mode === "playing") {
      updateGame(dt);
    } else if (state.mode === "paused" || state.mode === "intro" || state.mode === "ending") {
      syncHud();
    } else {
      decayInputBuffers(dt);
      updateNotices(dt);
      updateParticles(dt);
      state.phaseEnergy = ease(state.phaseEnergy, state.phase === 2 ? 1 : 0, 0.9, dt);
      state.phaseFlash = Math.max(0, state.phaseFlash - dt * 1.2);
      updateCamera(dt);
      updateAudio(dt);
      syncHud();
    }

    draw();
  } catch (error) {
    console.error("Game loop recovered from error:", error);
    showNotice("System recovered from a runtime fault.", "rgba(255, 141, 114, 0.94)");
    state.settings.soundEnabled = false;
    updateSettingsButtons();
  }
  requestAnimationFrame(loop);
}

window.addEventListener("resize", resize);

window.addEventListener("keydown", (event) => {
  if (state.mode === "playing" && event.code === "Escape") {
    openLifelineMenu();
    event.preventDefault();
    return;
  }

  if (state.mode !== "playing") {
    if (state.mode === "paused" && event.code === "Escape") {
      resumeGameplay();
      event.preventDefault();
      return;
    }

    if (isModeKey(event.code)) {
      setSelectedMode(event.code === "Digit2" || event.code === "Numpad2" ? "coop" : "single");
      event.preventDefault();
      return;
    }

    if (event.code === "Escape" && state.settingsOpen) {
      setSettingsOpen(false);
      event.preventDefault();
    }
    return;
  }

  const handled = handleKeyChange(event.code, true, event.repeat);

  if (handled) {
    ensureAudio();
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  if (state.mode !== "playing") {
    return;
  }

  const handled = handleKeyChange(event.code, false, event.repeat);
  if (handled) {
    event.preventDefault();
  }
});

window.addEventListener("blur", () => {
  if (document.visibilityState === "hidden") {
    clearMovementState();
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    clearMovementState();
  }
});

if (playButton) {
  playButton.addEventListener("click", (event) => {
    event.preventDefault();
    ensureAudio();
    startIntroFlow();
    releaseControlFocus(event.currentTarget);
  });
}

if (singleModeButton) {
  singleModeButton.addEventListener("click", (event) => {
    event.preventDefault();
    setSelectedMode("single");
    releaseControlFocus(event.currentTarget);
  });
}

if (coopModeButton) {
  coopModeButton.addEventListener("click", (event) => {
    event.preventDefault();
    setSelectedMode("coop");
    releaseControlFocus(event.currentTarget);
  });
}

if (settingsButton) {
  settingsButton.addEventListener("click", (event) => {
    event.preventDefault();
    setSettingsOpen(!state.settingsOpen);
    releaseControlFocus(event.currentTarget);
  });
}

if (soundToggleButton) {
  soundToggleButton.addEventListener("click", (event) => {
    event.preventDefault();
    state.settings.soundEnabled = !state.settings.soundEnabled;
    if (state.settings.soundEnabled) {
      ensureAudio();
    }
    updateSettingsButtons();
    releaseControlFocus(event.currentTarget);
  });
}

if (effectsToggleButton) {
  effectsToggleButton.addEventListener("click", (event) => {
    event.preventDefault();
    state.settings.effectsMode =
      state.settings.effectsMode === "high" ? "low" : "high";
    updateSettingsButtons();
    releaseControlFocus(event.currentTarget);
  });
}

if (lifelineButton) {
  lifelineButton.addEventListener("click", (event) => {
    event.preventDefault();
    openLifelineMenu();
    releaseControlFocus(event.currentTarget);
  });
}

function bindActionButton(button, action) {
  if (!button) return;

  let ignoreClickUntil = 0;

  const fireAction = (event, fromPointer) => {
    if (state.mode !== "playing") {
      event.preventDefault();
      event.stopPropagation();
      releaseControlFocus(button);
      return;
    }

    if (fromPointer) {
      ignoreClickUntil = performance.now() + 420;
    } else if (performance.now() < ignoreClickUntil) {
      event.preventDefault();
      event.stopPropagation();
      releaseControlFocus(button);
      return;
    }

    ensureAudio();
    queueAction("p1", action);
    event.preventDefault();
    event.stopPropagation();
    releaseControlFocus(button);
  };

  button.addEventListener("pointerdown", (event) => {
    fireAction(event, true);
  });

  button.addEventListener("click", (event) => {
    fireAction(event, false);
  });
}

function bindMoveButton(button, direction) {
  if (!button) return;

  let activePointerId = null;

  button.addEventListener("pointerdown", (event) => {
    if (state.mode !== "playing") {
      event.preventDefault();
      event.stopPropagation();
      releaseControlFocus(button);
      return;
    }
    activePointerId = event.pointerId;
    if (typeof button.setPointerCapture === "function" && event.pointerId != null) {
      try {
        button.setPointerCapture(event.pointerId);
      } catch (_error) {
        // Ignore capture failures and keep the button usable.
      }
    }
    setMovementKey("p1", direction, true);
    event.preventDefault();
    event.stopPropagation();
    releaseControlFocus(button);
  });

  const release = (event) => {
    if (activePointerId !== null && event.pointerId != null && event.pointerId !== activePointerId) {
      return;
    }

    activePointerId = null;
    setMovementKey("p1", direction, false);
    event.preventDefault();
    event.stopPropagation();
    releaseControlFocus(button);
  };

  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    releaseControlFocus(button);
  });
}

bindMoveButton(moveLeftButton, "left");
bindMoveButton(moveRightButton, "right");
bindActionButton(jumpButton, "jump");
bindActionButton(attackButton, "attack");

resize();
setDefaultBootContent();
setSelectedMode("single");
setSettingsOpen(false);
updateSettingsButtons();
showBoot();
syncHud(true);
requestAnimationFrame(loop);
