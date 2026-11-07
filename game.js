(() => {
  "use strict";

  // ------------------------------------------------------------------ config

  const VIEW = 720;
  const RENDER_SCALE = 2;
  const TILE = 40;
  const COLS = 18;
  const ROWS = 18;
  const TANK_HALF = 15;
  const BULLET_LIFE = 3.2;
  const SPAWN_TIME = 1.15;
  const PLAYER_SPEED = 150;
  const PLAYER_COOLDOWN = 0.36;
  const PLAYER_RAPID_COOLDOWN = 0.15;
  const RESPAWN_DELAY = 1.65;
  const PLAYER_SPAWN = { x: 220, y: 660 };
  const ENEMY_SPAWNS = [
    { x: 60, y: 22 },
    { x: 360, y: 22 },
    { x: 660, y: 22 },
  ];
  const BASE = { x: 320, y: 640, w: 80, h: 80 };
  const BASE_CENTER = { x: 360, y: 680 };
  const STORAGE_HIGH = "steelFront.highScore.v1";
  const STORAGE_MUTED = "steelFront.muted.v1";

  const T = Object.freeze({
    EMPTY: 0,
    BRICK: 1,
    STEEL: 2,
    WATER: 3,
    BUSH: 4,
  });

  const DIR_LIST = ["up", "right", "down", "left"];
  const DIRS = Object.freeze({
    up: { x: 0, y: -1, angle: 0 },
    right: { x: 1, y: 0, angle: Math.PI / 2 },
    down: { x: 0, y: 1, angle: Math.PI },
    left: { x: -1, y: 0, angle: -Math.PI / 2 },
  });
  const OPPOSITE = Object.freeze({ up: "down", right: "left", down: "up", left: "right" });

  const THEMES = [
    {
      name: "moss",
      accent: "#7dffbc",
      accentDeep: "#33d68e",
      accentGlow: "rgba(86, 255, 175, 0.26)",
      floorTop: "#07130d",
      floorBottom: "#030806",
      floorGlow: "rgba(87, 255, 175, 0.08)",
      grid: "rgba(143, 255, 198, 0.045)",
      dust: "rgba(136, 255, 191, 0.22)",
      brickMortar: "#2a120b",
      brickColors: ["#8d4226", "#a14f2d", "#76361f"],
      brickHighlight: "#e58b57",
      steelDark: "#202d33",
      steelMid: "#54666e",
      steelLight: "#a9bdc4",
      steelEdge: "#d4e3e7",
      steelRivet: "#2e3d42",
      waterDeep: "#041d29",
      waterMid: "#093b4e",
      waterLine: "rgba(75, 216, 255, 0.5)",
      waterGlint: "#7deaff",
      treeDark: "#0a2112",
      treeMid: "#12391c",
      treeLight: "#1e5b2a",
      treeHighlight: "#2f7a3d",
      baseGold: "#d49a33",
      baseGoldLight: "#ffe4a0",
      baseGoldDark: "#6e460d",
      baseGlow: "rgba(255, 201, 88, 0.34)",
      baseCore: "#7dffbc",
      bulletPlayer: "#9affd0",
      bulletEnemy: "#ffb268",
    },
    {
      name: "steel",
      accent: "#78ddff",
      accentDeep: "#2fb1db",
      accentGlow: "rgba(89, 205, 255, 0.24)",
      floorTop: "#071219",
      floorBottom: "#03080c",
      floorGlow: "rgba(76, 187, 255, 0.08)",
      grid: "rgba(139, 218, 255, 0.05)",
      dust: "rgba(133, 222, 255, 0.2)",
      brickMortar: "#23171a",
      brickColors: ["#7c4937", "#8c5640", "#673a2d"],
      brickHighlight: "#d28c67",
      steelDark: "#1b2c35",
      steelMid: "#4e6875",
      steelLight: "#a8c6d3",
      steelEdge: "#dcf3fa",
      steelRivet: "#263e49",
      waterDeep: "#032231",
      waterMid: "#07465e",
      waterLine: "rgba(89, 223, 255, 0.56)",
      waterGlint: "#a3f1ff",
      treeDark: "#082026",
      treeMid: "#0e3640",
      treeLight: "#185262",
      treeHighlight: "#257287",
      baseGold: "#d9a74a",
      baseGoldLight: "#ffecb2",
      baseGoldDark: "#705018",
      baseGlow: "rgba(126, 214, 255, 0.3)",
      baseCore: "#78ddff",
      bulletPlayer: "#9ff4ff",
      bulletEnemy: "#ffc173",
    },
    {
      name: "ember",
      accent: "#ffad7a",
      accentDeep: "#e66d40",
      accentGlow: "rgba(255, 137, 92, 0.22)",
      floorTop: "#150c08",
      floorBottom: "#080403",
      floorGlow: "rgba(255, 119, 66, 0.07)",
      grid: "rgba(255, 179, 132, 0.045)",
      dust: "rgba(255, 155, 102, 0.22)",
      brickMortar: "#24100d",
      brickColors: ["#7d3128", "#933d2f", "#68251f"],
      brickHighlight: "#e1775c",
      steelDark: "#342420",
      steelMid: "#71594b",
      steelLight: "#c0a389",
      steelEdge: "#f0d2b3",
      steelRivet: "#3b2c25",
      waterDeep: "#2b0d08",
      waterMid: "#5b1c10",
      waterLine: "rgba(255, 126, 75, 0.55)",
      waterGlint: "#ffb16f",
      treeDark: "#27130b",
      treeMid: "#3f2111",
      treeLight: "#61331a",
      treeHighlight: "#874925",
      baseGold: "#e0a249",
      baseGoldLight: "#ffe7a8",
      baseGoldDark: "#764515",
      baseGlow: "rgba(255, 155, 95, 0.34)",
      baseCore: "#ffad7a",
      bulletPlayer: "#ffd8af",
      bulletEnemy: "#ff8d62",
    },
  ];

  const PLAYER_COLORS = {
    body: "#39cf9d",
    light: "#c9ffea",
    dark: "#0a4938",
    turret: "#77f1c2",
    barrel: "#173d31",
    track: "#081a14",
    accent: "#ffd166",
  };

  const ENEMY_TYPES = {
    basic: {
      label: "轻型巡逻车",
      hp: 1,
      speed: 64,
      cooldown: 1.55,
      score: 100,
      bulletSpeed: 230,
      colors: {
        body: "#d9a33c",
        light: "#ffe3a0",
        dark: "#61400f",
        turret: "#f0c45f",
        barrel: "#3e2b0b",
        track: "#231c0d",
        accent: "#ffcf6c",
      },
    },
    swift: {
      label: "高速侦察车",
      hp: 1,
      speed: 113,
      cooldown: 1.65,
      score: 200,
      bulletSpeed: 245,
      colors: {
        body: "#d95c50",
        light: "#ffc2b2",
        dark: "#5e211d",
        turret: "#ff8e79",
        barrel: "#411616",
        track: "#211011",
        accent: "#ffb19d",
      },
    },
    gunner: {
      label: "重炮突击车",
      hp: 1,
      speed: 73,
      cooldown: 0.76,
      score: 300,
      bulletSpeed: 260,
      colors: {
        body: "#a773d5",
        light: "#edceff",
        dark: "#432b58",
        turret: "#c797f0",
        barrel: "#311d42",
        track: "#18121f",
        accent: "#e5bdff",
      },
    },
    armored: {
      label: "重装攻城车",
      hp: 3,
      speed: 52,
      cooldown: 1.35,
      score: 500,
      bulletSpeed: 240,
      colors: {
        body: "#7d986e",
        light: "#ddecce",
        dark: "#34452c",
        turret: "#9db98e",
        barrel: "#26351e",
        track: "#141b11",
        accent: "#c7e3ad",
      },
    },
  };

  const PICKUP_DEFS = {
    shield: { label: "量子护盾", short: "护盾", color: "#7dffbc", duration: 8 },
    rapid: { label: "高能速射", short: "速射", color: "#ffd166", duration: 10 },
    life: { label: "装甲修复", short: "修复", color: "#ff8e86" },
    freeze: { label: "时间冻结", short: "冻结", color: "#75d9ff", duration: 6 },
    bomb: { label: "轨道轰炸", short: "轰炸", color: "#ffad68" },
  };

  const LEVELS = [
    {
      name: "青苔防线",
      code: "MOSS LINE",
      desc: "保持阵线，摧毁所有入侵单位，保护南侧指挥核心。",
      half: [
        ".........",
        "..#...#..",
        "..#...#..",
        ".........",
        ".##...##.",
        ".........",
        "..#.SS...",
        "..#...T..",
        "....WW...",
        "....WW...",
        "..#...#..",
        ".........",
        ".##...##.",
        ".........",
        "..#....#.",
        ".......##",
        ".....P.#B",
        ".......#B",
      ],
      roster: ["basic", "basic", "swift", "basic", "gunner", "swift", "basic", "armored", "basic"],
      maxAlive: 4,
      spawnEvery: [1.35, 1.9],
    },
    {
      name: "钢铁回廊",
      code: "STEELWORKS",
      desc: "穿过钢铁回廊，在狭窄火力网中寻找敌军防线的缺口。",
      half: [
        ".........",
        "..#....#.",
        "..#....#.",
        "...S.....",
        "......##.",
        "..WW.....",
        "..WW..#..",
        ".......T.",
        ".S..SS...",
        ".......T.",
        "..WW..#..",
        "..WW.....",
        "......##.",
        "...S.....",
        "..#....#.",
        ".......##",
        ".....P.#B",
        ".......#B",
      ],
      roster: [
        "basic",
        "swift",
        "gunner",
        "basic",
        "armored",
        "swift",
        "basic",
        "gunner",
        "armored",
        "swift",
        "basic",
      ],
      maxAlive: 4,
      spawnEvery: [1.15, 1.7],
    },
    {
      name: "赤色要塞",
      code: "RED CITADEL",
      desc: "敌军发动总攻。死守指挥核心，完成最后一次反攻。",
      half: [
        ".........",
        "..#...#..",
        "..#..S...",
        ".....#...",
        ".##..#...",
        "...SS....",
        ".........",
        ".#..S#.T.",
        ".#....#..",
        ".....#...",
        ".#..S#...",
        ".........",
        "...WW..#.",
        "..#...#..",
        "..#....#.",
        ".......##",
        ".....P.#B",
        ".......#B",
      ],
      roster: [
        "swift",
        "gunner",
        "armored",
        "basic",
        "basic",
        "gunner",
        "swift",
        "armored",
        "gunner",
        "basic",
        "swift",
        "gunner",
        "armored",
        "swift",
      ],
      maxAlive: 5,
      spawnEvery: [0.95, 1.45],
    },
  ];

  const CHAR_TO_TILE = {
    ".": T.EMPTY,
    "#": T.BRICK,
    S: T.STEEL,
    W: T.WATER,
    T: T.BUSH,
    P: T.EMPTY,
    B: T.EMPTY,
  };

  const LIFE_ICON = `
    <svg viewBox="0 0 26 20" aria-hidden="true">
      <path d="M3 5h20v3H3z" fill="currentColor" opacity=".72"/>
      <path d="M1 9h24v7H1z" fill="currentColor"/>
      <path d="M11.5 0h3v6h-3z" fill="#ffd166"/>
      <path d="M5 16h4v2H5zm6 0h4v2h-4zm6 0h4v2h-4z" fill="currentColor" opacity=".46"/>
    </svg>`;

  // ------------------------------------------------------------------- utils

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const rand = (min, max) => min + Math.random() * (max - min);
  const randInt = (min, max) => Math.floor(rand(min, max + 1));
  const choose = (items) => items[Math.floor(Math.random() * items.length)];
  const padScore = (value) => String(Math.max(0, Math.round(value))).padStart(6, "0");
  const distance = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
  const rectsOverlap = (a, b) =>
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const pointInRect = (x, y, rect) =>
    x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
  const formatTime = (seconds) => {
    const total = Math.max(0, Math.floor(seconds));
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  };
  const hash2 = (x, y) => {
    const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return value - Math.floor(value);
  };
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const storageGet = (key, fallback) => {
    try {
      const value = window.localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch {
      return fallback;
    }
  };
  const storageSet = (key, value) => {
    try {
      window.localStorage.setItem(key, String(value));
    } catch {
      // Storage can be unavailable in private or sandboxed contexts.
    }
  };

  // ------------------------------------------------------------------- audio

  const Sound = (() => {
    let audio = null;
    let master = null;
    let noiseBuffer = null;
    let muted = storageGet(STORAGE_MUTED, "0") === "1";

    function ensure() {
      if (audio) {
        if (audio.state === "suspended") audio.resume().catch(() => {});
        return audio;
      }
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return null;
      try {
        audio = new AudioCtor();
        master = audio.createGain();
        master.gain.value = muted ? 0 : 0.2;
        master.connect(audio.destination);
        const frames = Math.floor(audio.sampleRate * 1.5);
        noiseBuffer = audio.createBuffer(1, frames, audio.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < frames; i += 1) data[i] = Math.random() * 2 - 1;
      } catch {
        audio = null;
      }
      return audio;
    }

    function guard(callback) {
      if (muted) return;
      const context = ensure();
      if (!context) return;
      try {
        callback(context);
      } catch {
        // Never let audio break the game loop.
      }
    }

    function tone(context, { frequency, endFrequency = frequency, duration = 0.1, volume = 0.05, type = "square", delay = 0 }) {
      const start = context.currentTime + delay;
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(1, frequency), start);
      if (endFrequency !== frequency) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), start + duration);
      }
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + 0.007);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(start + duration + 0.03);
    }

    function noise(context, { duration = 0.2, volume = 0.08, cutoff = 1200, delay = 0 }) {
      if (!noiseBuffer) return;
      const start = context.currentTime + delay;
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      source.buffer = noiseBuffer;
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(cutoff, start);
      filter.frequency.exponentialRampToValueAtTime(Math.max(80, cutoff * 0.3), start + duration);
      gain.gain.setValueAtTime(Math.max(0.0002, volume), start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      source.start(start);
      source.stop(start + duration + 0.02);
    }

    function melody(context, notes, waveform = "square", volume = 0.034, step = 0.08) {
      notes.forEach((frequency, index) => {
        tone(context, {
          frequency,
          endFrequency: frequency,
          duration: 0.1,
          volume,
          type: waveform,
          delay: index * step,
        });
      });
    }

    return {
      unlock() {
        if (!muted) ensure();
      },
      isMuted() {
        return muted;
      },
      setMuted(nextMuted) {
        muted = Boolean(nextMuted);
        storageSet(STORAGE_MUTED, muted ? "1" : "0");
        if (!muted) ensure();
        if (master && audio) {
          master.gain.cancelScheduledValues(audio.currentTime);
          master.gain.setTargetAtTime(muted ? 0 : 0.2, audio.currentTime, 0.02);
        }
      },
      ui() {
        guard((c) => tone(c, { frequency: 640, endFrequency: 800, duration: 0.045, volume: 0.018, type: "square" }));
      },
      stageStart() {
        guard((c) => {
          melody(c, [392, 523, 659], "square", 0.028, 0.09);
          tone(c, { frequency: 98, endFrequency: 70, duration: 0.3, volume: 0.025, type: "triangle" });
        });
      },
      levelClear() {
        guard((c) => {
          melody(c, [523, 659, 784, 1047], "triangle", 0.038, 0.1);
          tone(c, { frequency: 131, endFrequency: 98, duration: 0.45, volume: 0.026, type: "triangle", delay: 0.1 });
        });
      },
      victory() {
        guard((c) => {
          melody(c, [523, 659, 784, 1047, 1319, 1568], "triangle", 0.038, 0.11);
          noise(c, { duration: 0.8, volume: 0.025, cutoff: 1800, delay: 0.1 });
        });
      },
      shoot() {
        guard((c) => {
          tone(c, { frequency: 250, endFrequency: 100, duration: 0.075, volume: 0.036, type: "square" });
          noise(c, { duration: 0.05, volume: 0.018, cutoff: 2200 });
        });
      },
      enemyShoot() {
        guard((c) => {
          tone(c, { frequency: 165, endFrequency: 75, duration: 0.09, volume: 0.022, type: "sawtooth" });
        });
      },
      brick() {
        guard((c) => {
          noise(c, { duration: 0.1, volume: 0.045, cutoff: 800 });
          tone(c, { frequency: 120, endFrequency: 65, duration: 0.08, volume: 0.022, type: "square" });
        });
      },
      steel() {
        guard((c) => {
          tone(c, { frequency: 1350, endFrequency: 760, duration: 0.08, volume: 0.027, type: "triangle" });
          tone(c, { frequency: 2100, duration: 0.035, volume: 0.012, type: "sine" });
        });
      },
      explosion(scale = 1) {
        guard((c) => {
          noise(c, { duration: 0.4 * scale, volume: 0.085, cutoff: 900 + 350 * scale });
          tone(c, { frequency: 110, endFrequency: 36, duration: 0.44 * scale, volume: 0.05, type: "triangle" });
        });
      },
      playerHit() {
        guard((c) => {
          noise(c, { duration: 0.48, volume: 0.1, cutoff: 1200 });
          tone(c, { frequency: 170, endFrequency: 42, duration: 0.48, volume: 0.06, type: "sawtooth" });
        });
      },
      shieldBlock() {
        guard((c) => {
          tone(c, { frequency: 1100, endFrequency: 620, duration: 0.15, volume: 0.032, type: "triangle" });
          tone(c, { frequency: 1600, endFrequency: 900, duration: 0.1, volume: 0.016, type: "sine", delay: 0.02 });
        });
      },
      pickup() {
        guard((c) => melody(c, [523, 659, 784, 1047], "square", 0.026, 0.065));
      },
      extraLife() {
        guard((c) => {
          melody(c, [392, 523, 659, 784, 1047], "triangle", 0.032, 0.08);
        });
      },
      freeze() {
        guard((c) => {
          melody(c, [880, 740, 587, 440], "sine", 0.03, 0.075);
          noise(c, { duration: 0.35, volume: 0.02, cutoff: 2600 });
        });
      },
      bomb() {
        guard((c) => {
          noise(c, { duration: 1.1, volume: 0.13, cutoff: 1400 });
          tone(c, { frequency: 90, endFrequency: 28, duration: 1, volume: 0.08, type: "sawtooth" });
          melody(c, [196, 147, 98], "triangle", 0.035, 0.13);
        });
      },
      bulletClash() {
        guard((c) => tone(c, { frequency: 980, endFrequency: 500, duration: 0.06, volume: 0.018, type: "square" }));
      },
      itemDrop() {
        guard((c) => {
          tone(c, { frequency: 660, endFrequency: 880, duration: 0.12, volume: 0.022, type: "sine" });
          tone(c, { frequency: 990, endFrequency: 1320, duration: 0.12, volume: 0.016, type: "sine", delay: 0.08 });
        });
      },
      gameOver() {
        guard((c) => {
          melody(c, [392, 311, 247, 196], "triangle", 0.04, 0.14);
          noise(c, { duration: 0.65, volume: 0.035, cutoff: 600, delay: 0.1 });
        });
      },
      baseLost() {
        guard((c) => {
          noise(c, { duration: 1.15, volume: 0.14, cutoff: 1000 });
          tone(c, { frequency: 72, endFrequency: 25, duration: 1.2, volume: 0.09, type: "sawtooth" });
        });
      },
    };
  })();

  // ------------------------------------------------------------------- state

  const game = {
    state: "menu",
    levelIndex: 0,
    levelDef: LEVELS[0],
    theme: THEMES[0],
    map: [],
    base: null,
    player: null,
    previewActors: [],
    enemies: [],
    bullets: [],
    pickups: [],
    particles: [],
    shockwaves: [],
    floaters: [],
    queue: [],
    totalEnemies: 0,
    kills: 0,
    totalKills: 0,
    score: 0,
    highScore: Number(storageGet(STORAGE_HIGH, "0")) || 0,
    lives: 3,
    elapsed: 0,
    spawnTimer: 0,
    spawnIndex: 0,
    freezeTimer: 0,
    respawnTimer: 0,
    shake: 0,
    flash: 0,
    endTimer: 0,
    endReason: "base",
    clearTimer: 0,
    isFinalClear: false,
    lastBonus: 0,
    stageDelay: 0,
    visualTime: 0,
    nextEntityId: 1,
    lastScoreDisplay: -1,
  };

  const AMBIENT_MOTES = Array.from({ length: 28 }, () => ({
    x: rand(0, VIEW),
    y: rand(0, VIEW),
    radius: rand(0.55, 1.7),
    speed: rand(2, 8),
    drift: rand(-3, 3),
    alpha: rand(0.04, 0.17),
    phase: rand(0, Math.PI * 2),
  }));

  // --------------------------------------------------------------------- dom

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const dom = {
    overlay: document.getElementById("overlay"),
    stageBanner: document.getElementById("stageBanner"),
    bannerTitle: document.getElementById("bannerTitle"),
    bannerSub: document.getElementById("bannerSub"),
    toast: document.getElementById("toast"),
    soundBtn: document.getElementById("soundBtn"),
    soundLabel: document.getElementById("soundLabel"),
    pauseBtn: document.getElementById("pauseBtn"),
    pauseLabel: document.getElementById("pauseLabel"),
    scoreValue: document.getElementById("scoreValue"),
    highScoreValue: document.getElementById("highScoreValue"),
    lifeIcons: document.getElementById("lifeIcons"),
    enemyCount: document.getElementById("enemyCount"),
    enemyTotal: document.getElementById("enemyTotal"),
    enemyPips: document.getElementById("enemyPips"),
    baseStatus: document.getElementById("baseStatus"),
    threatLevel: document.getElementById("threatLevel"),
    missionName: document.getElementById("missionName"),
    missionDesc: document.getElementById("missionDesc"),
    metaSector: document.getElementById("metaSector"),
    metaMission: document.getElementById("metaMission"),
    metaClock: document.getElementById("metaClock"),
    mobileScore: document.getElementById("mobileScore"),
    mobileLives: document.getElementById("mobileLives"),
    mobileEnemies: document.getElementById("mobileEnemies"),
    buffList: document.getElementById("buffList"),
    radarCanvas: document.getElementById("radarCanvas"),
    radarCtx: document.getElementById("radarCanvas")?.getContext("2d") || null,
    radarEnemies: document.getElementById("radarEnemies"),
    radarCore: document.getElementById("radarCore"),
    controlButtons: Array.from(document.querySelectorAll("[data-control]")),
  };

  let bannerTimeout = 0;
  let toastTimeout = 0;
  let lastClock = "";
  let lastBuffSignature = "";

  // ------------------------------------------------------------------- input

  const input = (() => {
    const sources = new Map();
    const lastPressed = Object.fromEntries(DIR_LIST.map((dir) => [dir, 0]));

    function getSet(action) {
      if (!sources.has(action)) sources.set(action, new Set());
      return sources.get(action);
    }

    return {
      press(action, source) {
        const set = getSet(action);
        const wasActive = set.size > 0;
        set.add(source);
        if (!wasActive && Object.prototype.hasOwnProperty.call(lastPressed, action)) {
          lastPressed[action] = performance.now();
        }
      },
      release(action, source) {
        const set = sources.get(action);
        if (!set) return;
        set.delete(source);
      },
      releaseAll() {
        sources.forEach((set) => set.clear());
      },
      isHeld(action) {
        return (sources.get(action)?.size || 0) > 0;
      },
      getDirection() {
        let best = null;
        let bestTime = -1;
        for (const dir of DIR_LIST) {
          if (this.isHeld(dir) && lastPressed[dir] > bestTime) {
            best = dir;
            bestTime = lastPressed[dir];
          }
        }
        return best;
      },
    };
  })();

  // --------------------------------------------------------------- map / maths

  function buildMap(halfRows) {
    if (!Array.isArray(halfRows) || halfRows.length !== ROWS) {
      throw new Error("Invalid map height");
    }
    const map = [];
    for (let row = 0; row < ROWS; row += 1) {
      const half = halfRows[row];
      if (typeof half !== "string" || half.length !== COLS / 2) {
        throw new Error(`Invalid map row ${row}`);
      }
      const full = half + [...half].reverse().join("");
      const parsed = [];
      for (let col = 0; col < COLS; col += 1) {
        const tile = CHAR_TO_TILE[full[col]];
        if (tile === undefined) throw new Error(`Unknown map tile "${full[col]}"`);
        parsed.push(tile);
      }
      map.push(parsed);
    }
    return map;
  }

  function tileAt(col, row) {
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return T.STEEL;
    return game.map[row][col];
  }

  function tileBlocksTank(tile) {
    return tile === T.BRICK || tile === T.STEEL || tile === T.WATER;
  }

  function rectHitsSolidTiles(rect) {
    const left = Math.floor((rect.x + 0.01) / TILE);
    const right = Math.floor((rect.x + rect.w - 0.01) / TILE);
    const top = Math.floor((rect.y + 0.01) / TILE);
    const bottom = Math.floor((rect.y + rect.h - 0.01) / TILE);
    for (let row = top; row <= bottom; row += 1) {
      for (let col = left; col <= right; col += 1) {
        const tile = tileAt(col, row);
        if (tileBlocksTank(tile)) return true;
      }
    }
    return false;
  }

  function tankRect(tank) {
    return { x: tank.x - TANK_HALF, y: tank.y - TANK_HALF, w: TANK_HALF * 2, h: TANK_HALF * 2 };
  }

  function cellTouchesBase(col, row) {
    if (!game.base || !game.base.alive) return false;
    return (
      col * TILE < game.base.x + game.base.w &&
      (col + 1) * TILE > game.base.x &&
      row * TILE < game.base.y + game.base.h &&
      (row + 1) * TILE > game.base.y
    );
  }

  function tankCollides(tank, nextX, nextY) {
    const rect = {
      x: nextX - TANK_HALF,
      y: nextY - TANK_HALF,
      w: TANK_HALF * 2,
      h: TANK_HALF * 2,
    };
    if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > VIEW || rect.y + rect.h > VIEW) return true;
    if (rectHitsSolidTiles(rect)) return true;
    if (game.base && game.base.alive && rectsOverlap(rect, game.base)) return true;

    const others = game.player ? game.enemies.concat(game.player) : game.enemies;
    for (const other of others) {
      if (other === tank || other.dead) continue;
      if (rectsOverlap(rect, tankRect(other))) return true;
    }
    return false;
  }

  function moveTank(tank, dir, amount) {
    const delta = DIRS[dir];
    tank.dir = dir;
    const nextX = tank.x + delta.x * amount;
    const nextY = tank.y + delta.y * amount;
    if (tankCollides(tank, nextX, nextY)) {
      tank.moving = false;
      return false;
    }
    tank.x = nextX;
    tank.y = nextY;
    tank.moving = true;
    tank.odometer += amount;
    return true;
  }

  function isAiPassable(col, row) {
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return false;
    const tile = game.map[row][col];
    if (tile === T.STEEL || tile === T.WATER) return false;
    if (cellTouchesBase(col, row)) return false;
    return true;
  }

  function tileOf(entity) {
    return {
      col: clamp(Math.floor(entity.x / TILE), 0, COLS - 1),
      row: clamp(Math.floor(entity.y / TILE), 0, ROWS - 1),
    };
  }

  function bfsDirection(tank, targetCol, targetRow) {
    const start = tileOf(tank);
    if (start.col === targetCol && start.row === targetRow) return null;
    const total = COLS * ROWS;
    const dist = new Int16Array(total);
    dist.fill(-1);
    const queue = new Int32Array(total);
    let head = 0;
    let tail = 0;
    const startIndex = targetRow * COLS + targetCol;
    dist[startIndex] = 0;
    queue[tail++] = startIndex;

    while (head < tail) {
      const index = queue[head++];
      const col = index % COLS;
      const row = Math.floor(index / COLS);
      for (const dir of DIR_LIST) {
        const step = DIRS[dir];
        const nc = col + step.x;
        const nr = row + step.y;
        if (!isAiPassable(nc, nr)) continue;
        const nextIndex = nr * COLS + nc;
        if (dist[nextIndex] !== -1) continue;
        dist[nextIndex] = dist[index] + 1;
        queue[tail++] = nextIndex;
      }
    }

    const currentIndex = start.row * COLS + start.col;
    if (dist[currentIndex] < 0) return null;
    let bestDir = null;
    let bestDist = Number.POSITIVE_INFINITY;
    for (const dir of DIR_LIST) {
      const step = DIRS[dir];
      const nc = start.col + step.x;
      const nr = start.row + step.y;
      if (!isAiPassable(nc, nr)) continue;
      const candidate = dist[nr * COLS + nc];
      if (candidate >= 0 && candidate < bestDist) {
        bestDist = candidate;
        bestDir = dir;
      }
    }
    return bestDir;
  }

  function isFacing(tank, targetX, targetY, tolerance = 18) {
    const dx = targetX - tank.x;
    const dy = targetY - tank.y;
    switch (tank.dir) {
      case "up":
        return dy < -8 && Math.abs(dx) <= tolerance;
      case "down":
        return dy > 8 && Math.abs(dx) <= tolerance;
      case "left":
        return dx < -8 && Math.abs(dy) <= tolerance;
      case "right":
        return dx > 8 && Math.abs(dy) <= tolerance;
      default:
        return false;
    }
  }

  // ---------------------------------------------------------------- entities

  function createPlayer() {
    return {
      id: `player-${game.nextEntityId++}`,
      isPlayer: true,
      isPreview: false,
      x: PLAYER_SPAWN.x,
      y: PLAYER_SPAWN.y,
      dir: "up",
      speed: PLAYER_SPEED,
      odometer: 0,
      moving: false,
      fireTimer: 0,
      shieldTimer: 2.8,
      rapidTimer: 0,
      hitFlash: 0,
      hp: 1,
      maxHp: 1,
      dead: false,
    };
  }

  function createEnemy(type, spawnPoint, options = {}) {
    const stats = ENEMY_TYPES[type];
    const spawnTimer = options.preview ? 0 : SPAWN_TIME;
    return {
      id: `enemy-${game.nextEntityId++}`,
      kind: type,
      isPlayer: false,
      isPreview: Boolean(options.preview),
      stats,
      x: options.x ?? spawnPoint.x,
      y: options.y ?? spawnPoint.y,
      dir: options.dir || "down",
      speed: stats.speed,
      odometer: rand(0, 24),
      moving: false,
      fireTimer: options.preview ? 99 : rand(0.6, 1.5),
      thinkTimer: options.preview ? 99 : rand(0.25, 0.8),
      blockedTime: 0,
      spawnTimer,
      hitFlash: 0,
      hp: stats.hp,
      maxHp: stats.hp,
      dead: false,
      aiSeed: randInt(0, 999),
      targetKind: "base",
    };
  }

  function makeBase() {
    return { x: BASE.x, y: BASE.y, w: BASE.w, h: BASE.h, alive: true };
  }

  function applyTheme(theme) {
    game.theme = theme;
    const root = document.documentElement;
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--accent-deep", theme.accentDeep);
    root.style.setProperty("--accent-glow", theme.accentGlow);
    document.body.dataset.theme = theme.name;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme.floorTop);
  }

  function createPreviewScene() {
    const def = LEVELS[0];
    const playerPreview = createPlayer();
    playerPreview.shieldTimer = 0;
    playerPreview.isPreview = true;
    playerPreview.odometer = 11;

    const firstEnemy = createEnemy("swift", ENEMY_SPAWNS[0], {
      preview: true,
      x: 540,
      y: 420,
      dir: "left",
    });
    const secondEnemy = createEnemy("armored", ENEMY_SPAWNS[1], {
      preview: true,
      x: 240,
      y: 320,
      dir: "down",
    });
    const thirdEnemy = createEnemy("gunner", ENEMY_SPAWNS[2], {
      preview: true,
      x: 580,
      y: 220,
      dir: "left",
    });
    return [playerPreview, firstEnemy, secondEnemy, thirdEnemy];
  }

  function setupMenuScene() {
    game.state = "menu";
    game.levelIndex = 0;
    game.levelDef = LEVELS[0];
    game.map = buildMap(LEVELS[0].half);
    game.base = makeBase();
    game.player = null;
    game.enemies = [];
    game.bullets = [];
    game.pickups = [];
    game.particles = [];
    game.shockwaves = [];
    game.floaters = [];
    game.previewActors = createPreviewScene();
    game.queue = [];
    game.totalEnemies = LEVELS[0].roster.length;
    game.kills = 0;
    game.totalKills = 0;
    game.score = 0;
    game.lives = 3;
    game.elapsed = 0;
    game.spawnTimer = 0;
    game.spawnIndex = 0;
    game.freezeTimer = 0;
    game.respawnTimer = 0;
    game.shake = 0;
    game.flash = 0;
    game.endTimer = 0;
    game.clearTimer = 0;
    game.stageDelay = 0;
    game.isFinalClear = false;
    game.lastBonus = 0;
    game.newRecord = false;
    game.nextEntityId = 1;
    applyTheme(THEMES[0]);
    refreshHud();
    updateBuffHud(true);
    updateClock(true);
    syncControls();
  }

  // ---------------------------------------------------------------- overlays

  let overlayFocusToken = 0;

  function setOverlay(content) {
    dom.overlay.innerHTML = content;
    dom.overlay.classList.remove("is-hidden");
    dom.overlay.setAttribute("aria-hidden", "false");
    dom.overlay.inert = false;
    dom.overlay.scrollTop = 0;
    const token = ++overlayFocusToken;
    requestAnimationFrame(() => {
      if (token !== overlayFocusToken || dom.overlay.classList.contains("is-hidden")) return;
      const primary = dom.overlay.querySelector("[data-primary]");
      if (primary) primary.focus({ preventScroll: true });
    });
  }

  function hideOverlay() {
    overlayFocusToken += 1;
    dom.overlay.classList.add("is-hidden");
    dom.overlay.setAttribute("aria-hidden", "true");
    dom.overlay.inert = true;
    if (dom.overlay.contains(document.activeElement)) document.activeElement.blur();
  }

  function statsGrid(items) {
    return `<div class="overlay-stats">${items
      .map(
        (item) => `
          <div class="overlay-stat${item.accent ? " is-accent" : ""}">
            <span>${item.label}</span>
            <strong>${item.value}</strong>
          </div>`,
      )
      .join("")}</div>`;
  }

  function showMenuOverlay() {
    setOverlay(`
      <div class="overlay-card menu-card">
        <span class="overlay-eyebrow">DEFENSE PROTOCOL // ONLINE</span>
        <h2 class="overlay-title">坦克大战</h2>
        <p class="overlay-en">STEEL FRONT</p>
        <p class="overlay-desc">敌军装甲集群正在逼近。<br>守住南侧指挥核心，击退所有入侵者。</p>
        ${statsGrid([
          { label: "防区 / SECTORS", value: "03" },
          { label: "装甲 / ARMOR", value: "×3" },
          { label: "最高 / BEST", value: padScore(game.highScore), accent: true },
        ])}
        <div class="overlay-actions">
          <button class="btn btn-primary" type="button" data-action="start" data-primary>
            <span>开始战斗</span><kbd>ENTER</kbd>
          </button>
        </div>
        <div class="menu-controls">
          <span><kbd>WASD</kbd> / <kbd>方向键</kbd> 移动 <kbd>SPACE</kbd> 开火</span>
          <span><kbd>P</kbd> 暂停 <kbd>M</kbd> 静音</span>
        </div>
      </div>`);
  }

  function showPauseOverlay() {
    const remaining = Math.max(0, game.totalEnemies - game.kills);
    setOverlay(`
      <div class="overlay-card pause-card">
        <span class="overlay-eyebrow">TACTICAL HOLD</span>
        <h2 class="overlay-title small-title">战术暂停</h2>
        <p class="overlay-hint">战场已冻结。重新评估敌军位置，然后继续推进。</p>
        ${statsGrid([
          { label: "当前积分", value: padScore(game.score) },
          { label: "剩余装甲", value: `×${game.lives}` },
          { label: "敌军信号", value: String(remaining).padStart(2, "0") },
        ])}
        <div class="overlay-actions row">
          <button class="btn btn-primary" type="button" data-action="resume" data-primary>继续战斗</button>
          <button class="btn btn-ghost" type="button" data-action="restart">重新开始</button>
        </div>
        <p class="overlay-note">按 <strong>P</strong> 或 <strong>ESC</strong> 返回战场</p>
      </div>`);
  }

  function showGameOverOverlay() {
    const reason =
      game.endReason === "base"
        ? "指挥核心已被摧毁，阵地沦陷。"
        : "全部装甲单位损失，防线正式失守。";
    setOverlay(`
      <div class="overlay-card danger-card">
        <span class="overlay-eyebrow">SIGNAL LOST // ${game.levelDef.code}</span>
        <h2 class="overlay-title small-title">防线失守</h2>
        <p class="overlay-desc">${reason}</p>
        ${statsGrid([
          { label: "最终积分", value: padScore(game.score) },
          { label: "历史最高", value: padScore(game.highScore), accent: true },
          { label: "总击毁", value: String(game.totalKills).padStart(2, "0") },
        ])}
        <div class="overlay-actions row">
          <button class="btn btn-danger" type="button" data-action="retry" data-primary>
            再次部署 <kbd>ENTER</kbd>
          </button>
          <button class="btn btn-ghost" type="button" data-action="menu">返回主菜单</button>
        </div>
        ${game.newRecord ? '<p class="overlay-note"><strong>NEW RECORD</strong> · 新纪录已写入战术终端</p>' : ""}
      </div>`);
  }

  function showLevelClearOverlay() {
    const next = LEVELS[game.levelIndex + 1];
    setOverlay(`
      <div class="overlay-card">
        <span class="overlay-eyebrow">SECTOR SECURED // ${game.levelDef.code}</span>
        <h2 class="overlay-title small-title">防线稳固</h2>
        <p class="overlay-desc">区域肃清完毕。维修无人机已补充一台装甲单位，准备进入下一战区。</p>
        ${statsGrid([
          { label: "当前积分", value: padScore(game.score) },
          { label: "肃清奖励", value: `+${game.lastBonus}` },
          { label: "装甲单位", value: `×${game.lives}` },
        ])}
        <div class="overlay-actions">
          <button class="btn btn-primary" type="button" data-action="next" data-primary>
            <span>进入下一关</span><kbd>ENTER</kbd>
          </button>
        </div>
        <p class="overlay-note">NEXT SECTOR // ${String(game.levelIndex + 2).padStart(2, "0")} · <strong>${next.name}</strong></p>
      </div>`);
  }

  function showVictoryOverlay() {
    setOverlay(`
      <div class="overlay-card">
        <span class="overlay-eyebrow">ALL SECTORS SECURED</span>
        <h2 class="overlay-title small-title">全线胜利</h2>
        <p class="overlay-desc">敌军装甲集群已被彻底击退。指挥核心安全，防线重新升起。</p>
        ${statsGrid([
          { label: "最终积分", value: padScore(game.score), accent: true },
          { label: "历史最高", value: padScore(game.highScore) },
          { label: "总击毁", value: String(game.totalKills).padStart(2, "0") },
        ])}
        <div class="overlay-actions row">
          <button class="btn btn-primary" type="button" data-action="retry" data-primary>
            再战一次 <kbd>ENTER</kbd>
          </button>
          <button class="btn btn-ghost" type="button" data-action="menu">返回主菜单</button>
        </div>
        ${game.newRecord ? '<p class="overlay-note"><strong>NEW RECORD</strong> · 新的最高战功已记录</p>' : ""}
      </div>`);
  }

  function showStageBanner(title, subtitle) {
    if (!dom.stageBanner) return;
    window.clearTimeout(bannerTimeout);
    dom.bannerTitle.textContent = title;
    dom.bannerSub.textContent = subtitle;
    dom.stageBanner.classList.remove("is-visible");
    void dom.stageBanner.offsetWidth;
    dom.stageBanner.classList.add("is-visible");
    bannerTimeout = window.setTimeout(() => {
      dom.stageBanner.classList.remove("is-visible");
    }, 2250);
  }

  function hideStageBanner() {
    window.clearTimeout(bannerTimeout);
    dom.stageBanner.classList.remove("is-visible");
  }

  function showToast(message, duration = 1800) {
    window.clearTimeout(toastTimeout);
    dom.toast.textContent = message;
    dom.toast.classList.add("is-visible");
    toastTimeout = window.setTimeout(() => {
      dom.toast.classList.remove("is-visible");
    }, duration);
  }

  function hideToast() {
    window.clearTimeout(toastTimeout);
    dom.toast.classList.remove("is-visible");
  }

  // --------------------------------------------------------------------- hud

  function refreshHud() {
    const def = game.levelDef || LEVELS[0];
    const remaining = Math.max(0, game.totalEnemies - game.kills);
    game.highScore = Math.max(game.highScore, game.score);

    dom.metaSector.textContent = String(game.levelIndex + 1).padStart(2, "0");
    dom.metaMission.textContent = def.name;
    dom.missionName.textContent = def.name;
    dom.missionDesc.textContent = def.desc;
    dom.scoreValue.textContent = padScore(game.score);
    dom.highScoreValue.textContent = padScore(game.highScore);
    dom.enemyCount.textContent = String(remaining).padStart(2, "0");
    dom.enemyTotal.textContent = String(game.totalEnemies).padStart(2, "0");
    dom.mobileScore.textContent = padScore(game.score);
    dom.mobileLives.textContent = `×${game.lives}`;
    dom.mobileEnemies.textContent = String(remaining).padStart(2, "0");

    dom.lifeIcons.innerHTML =
      game.lives > 0
        ? Array.from({ length: Math.min(5, game.lives) }, () => `<span class="life-icon">${LIFE_ICON}</span>`).join("")
        : '<span class="buff-empty">--</span>';
    dom.lifeIcons.setAttribute("aria-label", `剩余生命 ${game.lives}`);

    dom.enemyPips.innerHTML = Array.from({ length: game.totalEnemies }, (_, index) => {
      return `<span class="enemy-pip ${index < remaining ? "is-live" : "is-empty"}"></span>`;
    }).join("");

    const baseSafe = Boolean(game.base && game.base.alive);
    dom.baseStatus.className = `base-status ${baseSafe ? "is-ok" : "is-lost"}`;
    dom.baseStatus.innerHTML = `<i aria-hidden="true"></i> ${baseSafe ? "安全" : "已失守"}`;

    const threat = ["低", "中", "高"][clamp(game.levelIndex, 0, 2)];
    dom.threatLevel.textContent = threat;
    dom.threatLevel.className = `threat ${["level-low", "level-mid", "level-high"][clamp(game.levelIndex, 0, 2)]}`;

    dom.enemyCount.setAttribute("aria-label", `剩余敌军 ${remaining}`);
    if (dom.radarEnemies) {
      dom.radarEnemies.textContent = String(remaining).padStart(2, "0");
    }
    if (dom.radarCore) {
      dom.radarCore.textContent = baseSafe ? "在线" : "离线";
      dom.radarCore.className = baseSafe ? "is-online" : "is-offline";
    }
    game.lastScoreDisplay = game.score;
  }

  function updateBuffHud(force = false) {
    const chips = [];
    const player = game.player;
    if (player && player.shieldTimer > 0) {
      chips.push({
        key: "shield",
        label: "护盾",
        time: Math.ceil(player.shieldTimer),
        icon: "◇",
        ice: false,
      });
    }
    if (player && player.rapidTimer > 0) {
      chips.push({
        key: "rapid",
        label: "速射",
        time: Math.ceil(player.rapidTimer),
        icon: "ϟ",
        ice: false,
      });
    }
    if (game.freezeTimer > 0) {
      chips.push({
        key: "freeze",
        label: "冻结",
        time: Math.ceil(game.freezeTimer),
        icon: "❄",
        ice: true,
      });
    }

    const signature = chips.map((chip) => `${chip.key}:${chip.time}`).join("|");
    if (!force && signature === lastBuffSignature) return;
    lastBuffSignature = signature;

    if (chips.length === 0) {
      dom.buffList.innerHTML = '<span class="buff-empty">暂无增益</span>';
    } else {
      dom.buffList.innerHTML = chips
        .map(
          (chip) => `
            <span class="buff-chip${chip.ice ? " is-ice" : ""}">
              <span aria-hidden="true">${chip.icon}</span>${chip.label}<b>${chip.time}s</b>
            </span>`,
        )
        .join("");
    }
  }

  function updateClock(force = false) {
    const text = formatTime(game.elapsed);
    if (!force && text === lastClock) return;
    lastClock = text;
    dom.metaClock.textContent = text;
  }

  function updateSoundButton() {
    const muted = Sound.isMuted();
    dom.soundBtn.classList.toggle("is-muted", muted);
    dom.soundBtn.setAttribute("aria-pressed", String(muted));
    dom.soundBtn.setAttribute("aria-label", muted ? "开启音效" : "关闭音效");
    dom.soundLabel.textContent = muted ? "音效 关" : "音效 开";
  }

  function syncControls() {
    const canPause = game.state === "playing" || game.state === "paused";
    const isPaused = game.state === "paused";
    dom.pauseBtn.disabled = !canPause;
    dom.pauseBtn.classList.toggle("is-paused", isPaused);
    dom.pauseBtn.setAttribute(
      "aria-label",
      isPaused ? "继续游戏" : canPause ? "暂停游戏" : "游戏未开始",
    );
    dom.pauseLabel.textContent = isPaused ? "继续" : "暂停";
  }

  function toggleMute() {
    const nextMuted = !Sound.isMuted();
    Sound.unlock();
    Sound.setMuted(nextMuted);
    updateSoundButton();
    if (!nextMuted) Sound.ui();
  }

  // -------------------------------------------------------------- transitions

  function startGame() {
    if (!["menu", "paused", "gameover", "victory"].includes(game.state)) return;
    Sound.unlock();
    game.score = 0;
    game.lives = 3;
    game.totalKills = 0;
    game.newRecord = false;
    game.state = "menu";
    beginStage(0);
  }

  function beginStage(index) {
    if (index < 0 || index >= LEVELS.length) return;
    const def = LEVELS[index];
    game.state = "playing";
    game.levelIndex = index;
    game.levelDef = def;
    game.map = buildMap(def.half);
    game.base = makeBase();
    game.player = createPlayer();
    game.previewActors = [];
    game.enemies = [];
    game.bullets = [];
    game.pickups = [];
    game.particles = [];
    game.shockwaves = [];
    game.floaters = [];
    game.queue = [...def.roster];
    game.totalEnemies = def.roster.length;
    game.kills = 0;
    game.elapsed = 0;
    game.spawnTimer = 0.5;
    game.spawnIndex = randInt(0, ENEMY_SPAWNS.length - 1);
    game.freezeTimer = 0;
    game.respawnTimer = 0;
    game.shake = 0;
    game.flash = 0;
    game.endTimer = 0;
    game.clearTimer = 0;
    game.stageDelay = 1.25;
    game.isFinalClear = false;
    game.lastBonus = 0;
    game.baseSmokeTimer = 0;
    input.releaseAll();
    applyTheme(THEMES[index]);
    hideOverlay();
    hideToast();
    hideStageBanner();
    refreshHud();
    updateBuffHud(true);
    updateClock(true);
    syncControls();
    showStageBanner(`STAGE ${String(index + 1).padStart(2, "0")}`, `${def.name} // ${def.code}`);
    Sound.stageStart();
  }

  function pauseGame() {
    if (game.state !== "playing") return;
    game.state = "paused";
    input.releaseAll();
    refreshHud();
    updateBuffHud(true);
    syncControls();
    showPauseOverlay();
    Sound.ui();
  }

  function resumeGame() {
    if (game.state !== "paused") return;
    game.state = "playing";
    input.releaseAll();
    hideOverlay();
    syncControls();
    Sound.ui();
  }

  function togglePause() {
    if (game.state === "playing") pauseGame();
    else if (game.state === "paused") resumeGame();
  }

  function returnToMenu() {
    Sound.ui();
    hideOverlay();
    hideToast();
    hideStageBanner();
    input.releaseAll();
    setupMenuScene();
    game.state = "menu";
    refreshHud();
    syncControls();
    showMenuOverlay();
  }

  function beginEnding(reason, delay = 1.5) {
    if (game.state !== "playing") return;
    game.state = "ending";
    game.endReason = reason;
    game.endTimer = delay;
    input.releaseAll();
    hideStageBanner();
    refreshHud();
    updateBuffHud(true);
    syncControls();
  }

  function finishGameOver() {
    if (game.state !== "ending") return;
    game.state = "gameover";
    game.highScore = Math.max(game.highScore, game.score);
    storageSet(STORAGE_HIGH, game.highScore);
    refreshHud();
    syncControls();
    updateBuffHud(true);
    showGameOverOverlay();
    Sound.gameOver();
  }

  function checkStageClear() {
    if (game.state !== "playing") return;
    if (game.queue.length > 0 || game.enemies.length > 0 || game.kills < game.totalEnemies) return;
    if (game.base && !game.base.alive) return;

    game.state = "clearing";
    game.clearTimer = 1.25;
    game.isFinalClear = game.levelIndex >= LEVELS.length - 1;
    game.lastBonus = 1000 * (game.levelIndex + 1) + Math.max(0, game.lives) * 100;
    addScore(game.lastBonus);
    game.lives = Math.min(5, game.lives + 1);
    game.bullets = [];
    game.pickups = [];
    game.freezeTimer = 0;
    game.respawnTimer = 0;
    input.releaseAll();
    hideStageBanner();
    refreshHud();
    updateBuffHud(true);
    syncControls();
    if (game.isFinalClear) Sound.victory();
    else Sound.levelClear();
  }

  function finishClearing() {
    if (game.state !== "clearing") return;
    game.highScore = Math.max(game.highScore, game.score);
    storageSet(STORAGE_HIGH, game.highScore);
    if (game.isFinalClear) {
      game.state = "victory";
      refreshHud();
      syncControls();
      updateBuffHud(true);
      showVictoryOverlay();
    } else {
      game.state = "levelclear";
      refreshHud();
      syncControls();
      updateBuffHud(true);
      showLevelClearOverlay();
    }
  }

  // ------------------------------------------------------------------ effects

  function addParticle(options) {
    if (game.particles.length > 500) game.particles.splice(0, game.particles.length - 500);
    const maxLife = options.life ?? rand(0.25, 0.7);
    game.particles.push({
      x: options.x,
      y: options.y,
      vx: options.vx ?? 0,
      vy: options.vy ?? 0,
      life: maxLife,
      maxLife,
      size: options.size ?? rand(1.5, 3.5),
      color: options.color || "#ffffff",
      type: options.type || "spark",
      drag: options.drag ?? 0.92,
      rotation: options.rotation ?? 0,
      spin: options.spin ?? 0,
      alpha: options.alpha ?? 1,
    });
  }

  function addShockwave(x, y, options = {}) {
    const life = options.life ?? 0.4;
    game.shockwaves.push({
      x,
      y,
      life,
      maxLife: life,
      radius: options.radius ?? 8,
      maxRadius: options.maxRadius ?? 36,
      color: options.color || game.theme.bulletEnemy,
      width: options.width ?? 2,
    });
  }

  function addShake(amount) {
    game.shake = Math.min(20, Math.max(game.shake, amount));
  }

  function addFloatingText(x, y, text, color = "#ffffff", size = 11) {
    if (game.floaters.length > 28) game.floaters.shift();
    game.floaters.push({
      x,
      y,
      text,
      color,
      size,
      life: 0.85,
      maxLife: 0.85,
    });
  }

  function addMuzzleFlash(x, y, dir, color) {
    const step = DIRS[dir];
    for (let i = 0; i < 4; i += 1) {
      addParticle({
        x: x + rand(-2, 2),
        y: y + rand(-2, 2),
        vx: step.x * rand(22, 65) + rand(-28, 28),
        vy: step.y * rand(22, 65) + rand(-28, 28),
        life: rand(0.08, 0.2),
        size: rand(1, 2.4),
        color: i === 0 ? "#ffffff" : color,
        type: "spark",
        drag: 0.86,
      });
    }
    addShockwave(x, y, {
      radius: 2,
      maxRadius: 11,
      life: 0.16,
      color,
      width: 1.5,
    });
  }

  function addImpactSparks(x, y, color, count = 6) {
    for (let i = 0; i < count; i += 1) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(25, 120);
      addParticle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: rand(0.12, 0.32),
        size: rand(1, 2.5),
        color,
        type: "spark",
      });
    }
  }

  function addBrickDebris(x, y) {
    const colors = game.theme.brickColors;
    for (let i = 0; i < 11; i += 1) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(20, 110);
      addParticle({
        x: x + rand(-10, 10),
        y: y + rand(-10, 10),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: rand(0.28, 0.7),
        size: rand(2, 5),
        color: choose(colors),
        type: "debris",
        rotation: rand(0, Math.PI),
        spin: rand(-9, 9),
        drag: 0.9,
      });
    }
    for (let i = 0; i < 4; i += 1) {
      addParticle({
        x: x + rand(-8, 8),
        y: y + rand(-8, 8),
        vx: rand(-18, 18),
        vy: rand(-18, 18),
        life: rand(0.3, 0.65),
        size: rand(4, 8),
        color: "rgba(159, 126, 94, 0.35)",
        type: "smoke",
        drag: 0.88,
      });
    }
  }

  function explode(x, y, scale = 1, color = game.theme.bulletEnemy, withSound = true) {
    if (withSound) Sound.explosion(scale);
    const sparkCount = Math.round(13 * scale + 6);
    for (let i = 0; i < sparkCount; i += 1) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(25, 180) * scale;
      addParticle({
        x: x + rand(-4, 4),
        y: y + rand(-4, 4),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: rand(0.18, 0.55) * Math.min(1.6, scale),
        size: rand(1.4, 4) * Math.min(1.4, scale),
        color: i % 4 === 0 ? "#fff4ce" : i % 3 === 0 ? game.theme.bulletEnemy : color,
        type: "spark",
        drag: 0.91,
      });
    }
    for (let i = 0; i < 4 + scale * 3; i += 1) {
      addParticle({
        x: x + rand(-8, 8),
        y: y + rand(-8, 8),
        vx: rand(-25, 25) * scale,
        vy: rand(-25, 25) * scale,
        life: rand(0.4, 1) * Math.min(1.5, scale),
        size: rand(6, 13) * Math.min(1.4, scale),
        color: "rgba(42, 37, 30, 0.32)",
        type: "smoke",
        drag: 0.9,
      });
    }
    for (let i = 0; i < Math.round(scale * 4); i += 1) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(20, 80) * scale;
      addParticle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: rand(0.3, 0.8),
        size: rand(2, 4.5),
        color: color,
        type: "debris",
        rotation: rand(0, Math.PI),
        spin: rand(-7, 7),
        drag: 0.9,
      });
    }
    addShockwave(x, y, {
      radius: 5,
      maxRadius: 28 + scale * 19,
      life: 0.26 + scale * 0.1,
      color,
      width: 1.5 + scale * 0.8,
    });
    addShockwave(x, y, {
      radius: 2,
      maxRadius: 14 + scale * 10,
      life: 0.18 + scale * 0.05,
      color: "#fff3c4",
      width: 1,
    });
    addShake(4 + scale * 3);
    game.flash = Math.max(game.flash, 0.06 * scale);
  }

  function updateEffects(dt) {
    for (let i = game.particles.length - 1; i >= 0; i -= 1) {
      const particle = game.particles[i];
      particle.life -= dt;
      if (particle.life <= 0) {
        game.particles.splice(i, 1);
        continue;
      }
      const damping = Math.pow(particle.drag, dt * 60);
      particle.vx *= damping;
      particle.vy *= damping;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.rotation += particle.spin * dt;
      if (particle.type === "smoke") particle.size += dt * 9;
    }

    for (let i = game.shockwaves.length - 1; i >= 0; i -= 1) {
      const wave = game.shockwaves[i];
      wave.life -= dt;
      if (wave.life <= 0) {
        game.shockwaves.splice(i, 1);
        continue;
      }
      const progress = 1 - wave.life / wave.maxLife;
      wave.currentRadius = wave.radius + (wave.maxRadius - wave.radius) * easeOutCubic(progress);
    }

    for (let i = game.floaters.length - 1; i >= 0; i -= 1) {
      const floater = game.floaters[i];
      floater.life -= dt;
      floater.y -= dt * 24;
      if (floater.life <= 0) game.floaters.splice(i, 1);
    }

    if (game.base && !game.base.alive) {
      game.baseSmokeTimer = (game.baseSmokeTimer || 0) - dt;
      if (game.baseSmokeTimer <= 0) {
        game.baseSmokeTimer = rand(0.08, 0.2);
        addParticle({
          x: BASE_CENTER.x + rand(-22, 22),
          y: BASE_CENTER.y + rand(-20, 18),
          vx: rand(-8, 8),
          vy: rand(-28, -8),
          life: rand(0.55, 1.2),
          size: rand(7, 15),
          color: "rgba(35, 30, 24, 0.36)",
          type: "smoke",
          drag: 0.95,
        });
        if (Math.random() < 0.35) {
          addParticle({
            x: BASE_CENTER.x + rand(-24, 24),
            y: BASE_CENTER.y + rand(-16, 20),
            vx: rand(-12, 12),
            vy: rand(-36, -12),
            life: rand(0.3, 0.7),
            size: rand(1, 2.5),
            color: "#ff8d58",
            type: "spark",
          });
        }
      }
    }
  }

  function addScore(amount, x = null, y = null, color = null) {
    if (!Number.isFinite(amount) || amount <= 0) return;
    const previousHigh = game.highScore;
    game.score += Math.round(amount);
    if (game.score > previousHigh) {
      game.highScore = game.score;
      game.newRecord = true;
      storageSet(STORAGE_HIGH, game.highScore);
    }
    refreshHud();
    if (x !== null && y !== null) {
      addFloatingText(x, y, `+${Math.round(amount)}`, color || game.theme.accent);
    }
  }

  // ---------------------------------------------------------------- spawning

  function findEnemySpawnPoint() {
    for (let offset = 0; offset < ENEMY_SPAWNS.length; offset += 1) {
      const index = (game.spawnIndex + offset) % ENEMY_SPAWNS.length;
      const point = ENEMY_SPAWNS[index];
      const rect = {
        x: point.x - TANK_HALF,
        y: point.y - TANK_HALF,
        w: TANK_HALF * 2,
        h: TANK_HALF * 2,
      };
      const occupied =
        (game.player && rectsOverlap(rect, tankRect(game.player))) ||
        game.enemies.some((enemy) => !enemy.dead && rectsOverlap(rect, tankRect(enemy)));
      if (!occupied) {
        game.spawnIndex = (index + 1) % ENEMY_SPAWNS.length;
        return point;
      }
    }
    return null;
  }

  function updateSpawner(dt) {
    if (game.stageDelay > 0) return;
    if (game.queue.length === 0) return;
    if (game.enemies.length >= game.levelDef.maxAlive) return;
    game.spawnTimer -= dt;
    if (game.spawnTimer > 0) return;
    const point = findEnemySpawnPoint();
    if (!point) {
      game.spawnTimer = 0.4;
      return;
    }
    const type = game.queue.shift();
    const enemy = createEnemy(type, point);
    game.enemies.push(enemy);
    const [min, max] = game.levelDef.spawnEvery;
    game.spawnTimer = rand(min, max);
    addShockwave(point.x, point.y, {
      radius: 8,
      maxRadius: 26,
      life: 0.45,
      color: game.theme.accent,
      width: 1.5,
    });
  }

  // -------------------------------------------------------------- player logic

  function trySpawnPlayer() {
    const candidate = createPlayer();
    const rect = tankRect(candidate);
    if (rectHitsSolidTiles(rect)) return false;
    if (game.base && game.base.alive && rectsOverlap(rect, game.base)) return false;
    if (game.enemies.some((enemy) => !enemy.dead && rectsOverlap(rect, tankRect(enemy)))) return false;
    game.player = candidate;
    addShockwave(candidate.x, candidate.y, {
      radius: 4,
      maxRadius: 28,
      life: 0.5,
      color: game.theme.accent,
      width: 2,
    });
    updateBuffHud(true);
    return true;
  }

  function playerBulletCount() {
    return game.bullets.filter((bullet) => !bullet.dead && bullet.side === "player").length;
  }

  function fireBullet(source, side) {
    const step = DIRS[source.dir];
    const muzzleDistance = 24;
    const x = source.x + step.x * muzzleDistance;
    const y = source.y + step.y * muzzleDistance;
    const speed = side === "player" ? 385 : source.stats?.bulletSpeed || 235;
    const bullet = {
      x,
      y,
      dir: source.dir,
      dx: step.x,
      dy: step.y,
      speed,
      side,
      ownerId: source.id,
      life: BULLET_LIFE,
      dead: false,
    };
    game.bullets.push(bullet);
    addMuzzleFlash(x, y, source.dir, side === "player" ? game.theme.bulletPlayer : game.theme.bulletEnemy);
    return bullet;
  }

  function tryPlayerFire() {
    const player = game.player;
    if (!player || game.state !== "playing") return;
    const limit = player.rapidTimer > 0 ? 3 : 2;
    if (player.fireTimer > 0 || playerBulletCount() >= limit) return;
    fireBullet(player, "player");
    player.fireTimer = player.rapidTimer > 0 ? PLAYER_RAPID_COOLDOWN : PLAYER_COOLDOWN;
    addShake(0.4);
    Sound.shoot();
  }

  function updatePlayer(dt) {
    if (!game.player) {
      if (
        game.state === "playing" &&
        game.lives > 0 &&
        game.respawnTimer > 0 &&
        game.base &&
        game.base.alive
      ) {
        game.respawnTimer -= dt;
        if (game.respawnTimer <= 0) {
          if (!trySpawnPlayer()) game.respawnTimer = 0.35;
        }
      }
      return;
    }

    const player = game.player;
    player.fireTimer = Math.max(0, player.fireTimer - dt);
    player.shieldTimer = Math.max(0, player.shieldTimer - dt);
    player.rapidTimer = Math.max(0, player.rapidTimer - dt);
    player.hitFlash = Math.max(0, player.hitFlash - dt);

    const dir = input.getDirection();
    if (dir) {
      moveTank(player, dir, player.speed * dt);
    } else {
      player.moving = false;
    }

    if (input.isHeld("fire")) tryPlayerFire();
  }

  function hitPlayer() {
    if (!game.player || game.state !== "playing") return;
    const player = game.player;
    game.player = null;
    explode(player.x, player.y, 1.35, PLAYER_COLORS.light, false);
    Sound.playerHit();
    game.lives = Math.max(0, game.lives - 1);
    game.shake = 12;
    game.flash = Math.max(game.flash, 0.45);
    showToast("装甲单位损失 // UNIT LOST", 1500);
    updateBuffHud(true);
    refreshHud();
    if (game.lives <= 0) {
      beginEnding("armor", 1.35);
    } else {
      game.respawnTimer = RESPAWN_DELAY;
    }
  }

  function destroyBase() {
    if (!game.base || !game.base.alive || game.state !== "playing") return;
    game.base.alive = false;
    for (let i = 0; i < 4; i += 1) {
      explode(
        BASE_CENTER.x + rand(-24, 24),
        BASE_CENTER.y + rand(-24, 20),
        rand(1.2, 1.9),
        i % 2 === 0 ? game.theme.baseGoldLight : game.theme.bulletEnemy,
        false,
      );
    }
    Sound.baseLost();
    game.shake = 20;
    game.flash = 0.9;
    beginEnding("base", 1.8);
    refreshHud();
  }

  // --------------------------------------------------------------- enemy logic

  function chooseEnemyTarget(enemy) {
    const player = game.player;
    if (player) {
      const playerDistance = distance(enemy.x, enemy.y, player.x, player.y);
      if (playerDistance < 210 || Math.random() < 0.28) {
        const cell = tileOf(player);
        return {
          kind: "player",
          x: player.x,
          y: player.y,
          col: cell.col,
          row: cell.row,
        };
      }
    }
    const approachCol = 8 + (enemy.aiSeed % 2);
    return {
      kind: "base",
      x: BASE_CENTER.x,
      y: BASE_CENTER.y,
      col: approachCol,
      row: 14,
    };
  }

  function fallbackDirection(enemy, target) {
    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    const horizontal = dx > 0 ? "right" : "left";
    const vertical = dy > 0 ? "down" : "up";
    const candidates =
      Math.abs(dx) > Math.abs(dy) ? [horizontal, vertical] : [vertical, horizontal];
    for (const dir of candidates) {
      const step = DIRS[dir];
      const col = Math.floor((enemy.x + step.x * 9) / TILE);
      const row = Math.floor((enemy.y + step.y * 9) / TILE);
      if (isAiPassable(col, row)) return dir;
    }
    return enemy.dir;
  }

  function chooseEnemyDirection(enemy) {
    const target = chooseEnemyTarget(enemy);
    enemy.targetKind = target.kind;
    let direction = bfsDirection(enemy, target.col, target.row);
    if (!direction) direction = fallbackDirection(enemy, target);
    if (direction) enemy.dir = direction;
    enemy.thinkTimer = rand(0.42, 0.95);
  }

  function chooseEscapeDirection(enemy) {
    const options = DIR_LIST.filter((dir) => {
      if (dir === OPPOSITE[enemy.dir]) return false;
      const step = DIRS[dir];
      const col = Math.floor((enemy.x + step.x * 10) / TILE);
      const row = Math.floor((enemy.y + step.y * 10) / TILE);
      return isAiPassable(col, row);
    });
    if (options.length > 0) enemy.dir = choose(options);
    else enemy.dir = OPPOSITE[enemy.dir];
  }

  function frontTile(enemy) {
    const step = DIRS[enemy.dir];
    const x = enemy.x + step.x * 24;
    const y = enemy.y + step.y * 24;
    const col = Math.floor(x / TILE);
    const row = Math.floor(y / TILE);
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return T.EMPTY;
    return game.map[row][col];
  }

  function tryEnemyShoot(enemy, dt) {
    if (enemy.fireTimer > 0 || enemy.spawnTimer > 0 || game.freezeTimer > 0) return;
    const maxBullets = enemy.kind === "gunner" ? 2 : 1;
    const active = game.bullets.filter(
      (bullet) => !bullet.dead && bullet.side === "enemy" && bullet.ownerId === enemy.id,
    ).length;
    if (active >= maxBullets) return;

    let shouldFire = false;
    if (game.player && isFacing(enemy, game.player.x, game.player.y, 18)) shouldFire = true;
    if (game.base && game.base.alive && isFacing(enemy, BASE_CENTER.x, BASE_CENTER.y, 40)) {
      shouldFire = true;
    }
    if (frontTile(enemy) === T.BRICK) shouldFire = true;
    if (!shouldFire && Math.random() < dt * 0.2) shouldFire = true;
    if (!shouldFire) return;

    fireBullet(enemy, "enemy");
    enemy.fireTimer = enemy.stats.cooldown * rand(0.84, 1.2);
    Sound.enemyShoot();
  }

  function updateEnemies(dt) {
    for (const enemy of [...game.enemies]) {
      if (enemy.dead) continue;
      enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);

      if (enemy.spawnTimer > 0) {
        enemy.spawnTimer = Math.max(0, enemy.spawnTimer - dt);
        continue;
      }

      if (game.freezeTimer > 0) {
        enemy.moving = false;
        continue;
      }

      enemy.fireTimer = Math.max(0, enemy.fireTimer - dt);
      enemy.thinkTimer -= dt;
      if (enemy.thinkTimer <= 0) chooseEnemyDirection(enemy);

      const moved = moveTank(enemy, enemy.dir, enemy.speed * dt);
      if (moved) {
        enemy.blockedTime = 0;
      } else {
        enemy.blockedTime += dt;
        if (enemy.blockedTime > 0.42) enemy.thinkTimer = 0;
        if (enemy.blockedTime > 1.15) {
          chooseEscapeDirection(enemy);
          enemy.blockedTime = 0;
          enemy.thinkTimer = 0.35;
        }
      }

      tryEnemyShoot(enemy, dt);
    }
  }

  function damageEnemy(enemy, amount) {
    if (!enemy || enemy.dead) return;
    enemy.hp -= amount;
    enemy.hitFlash = 0.12;
    addImpactSparks(enemy.x, enemy.y - 2, enemy.stats.colors.light, 5);
    if (enemy.hp > 0) {
      Sound.steel();
      return;
    }
    destroyEnemy(enemy);
  }

  function destroyEnemy(enemy, options = {}) {
    if (!enemy || enemy.dead) return;
    enemy.dead = true;
    const index = game.enemies.indexOf(enemy);
    if (index >= 0) game.enemies.splice(index, 1);
    game.kills += 1;
    game.totalKills += 1;
    explode(
      enemy.x,
      enemy.y,
      enemy.kind === "armored" ? 1.45 : enemy.kind === "swift" ? 0.9 : 1.1,
      enemy.stats.colors.light,
      !options.silent,
    );
    addScore(enemy.stats.score, enemy.x, enemy.y - 12, enemy.stats.colors.accent);
    if (!options.noDrop) maybeDropPickup(enemy.x, enemy.y);
    game.flash = Math.max(game.flash, 0.06);
    refreshHud();
  }

  function maybeDropPickup(x, y) {
    if (game.pickups.length >= 2) return;
    if (Math.random() > 0.24) return;
    const roll = Math.random();
    let kind = "bomb";
    if (roll < 0.24) kind = "shield";
    else if (roll < 0.48) kind = "rapid";
    else if (roll < 0.64) kind = "life";
    else if (roll < 0.83) kind = "freeze";
    game.pickups.push({
      id: `pickup-${game.nextEntityId++}`,
      kind,
      x,
      y,
      life: 12,
      maxLife: 12,
      phase: rand(0, Math.PI * 2),
    });
    addShockwave(x, y, {
      radius: 4,
      maxRadius: 25,
      life: 0.5,
      color: PICKUP_DEFS[kind].color,
      width: 1.5,
    });
    Sound.itemDrop();
  }

  function activatePickup(kind) {
    const def = PICKUP_DEFS[kind];
    const player = game.player;
    if (!def || !player) return;

    switch (kind) {
      case "shield":
        player.shieldTimer = Math.max(player.shieldTimer, def.duration);
        Sound.pickup();
        showToast(`${def.label} // SHIELD ${def.duration}s`, 1700);
        break;
      case "rapid":
        player.rapidTimer = Math.max(player.rapidTimer, def.duration);
        Sound.pickup();
        showToast(`${def.label} // RAPID FIRE ${def.duration}s`, 1700);
        break;
      case "life":
        if (game.lives < 5) {
          game.lives += 1;
          Sound.extraLife();
          showToast(`${def.label} // ARMOR +1`, 1700);
        } else {
          addScore(500);
          Sound.pickup();
          showToast(`${def.label} // 装甲已满 +500`, 1700);
        }
        break;
      case "freeze":
        game.freezeTimer = Math.max(game.freezeTimer, def.duration);
        Sound.freeze();
        showToast(`${def.label} // TIME FREEZE ${def.duration}s`, 1700);
        break;
      case "bomb": {
        Sound.bomb();
        game.flash = Math.max(game.flash, 0.72);
        for (const enemy of [...game.enemies]) {
          destroyEnemy(enemy, { silent: true, noDrop: true });
        }
        showToast(`${def.label} // 敌军信号清除`, 1900);
        break;
      }
      default:
        break;
    }

    addShockwave(player.x, player.y, {
      radius: 6,
      maxRadius: 45,
      life: 0.5,
      color: def.color,
      width: 2,
    });
    for (let i = 0; i < 12; i += 1) {
      const angle = rand(0, Math.PI * 2);
      addParticle({
        x: player.x,
        y: player.y,
        vx: Math.cos(angle) * rand(30, 100),
        vy: Math.sin(angle) * rand(30, 100),
        life: rand(0.2, 0.55),
        size: rand(1.2, 2.8),
        color: def.color,
      });
    }
    refreshHud();
    updateBuffHud(true);
  }

  function updatePickups(dt) {
    for (let i = game.pickups.length - 1; i >= 0; i -= 1) {
      const pickup = game.pickups[i];
      pickup.life -= dt;
      if (pickup.life <= 0) {
        game.pickups.splice(i, 1);
        continue;
      }
      const player = game.player;
      if (player && distance(player.x, player.y, pickup.x, pickup.y) < 23) {
        const kind = pickup.kind;
        game.pickups.splice(i, 1);
        activatePickup(kind);
      }
    }
  }

  // ---------------------------------------------------------------- bullets

  function bulletHitsBase(bullet) {
    if (!game.base || !game.base.alive) return false;
    return pointInRect(bullet.x, bullet.y, game.base);
  }

  function updateBullets(dt) {
    for (const bullet of [...game.bullets]) {
      if (bullet.dead || game.state !== "playing") continue;
      bullet.life -= dt;
      if (bullet.life <= 0) {
        bullet.dead = true;
        continue;
      }
      const travel = bullet.speed * dt;
      const steps = Math.max(1, Math.ceil(travel / 6));
      const stepX = (bullet.dx * travel) / steps;
      const stepY = (bullet.dy * travel) / steps;

      for (let step = 0; step < steps; step += 1) {
        bullet.x += stepX;
        bullet.y += stepY;

        if (bullet.x < 0 || bullet.x > VIEW || bullet.y < 0 || bullet.y > VIEW) {
          bullet.dead = true;
          addImpactSparks(
            clamp(bullet.x, 1, VIEW - 1),
            clamp(bullet.y, 1, VIEW - 1),
            bullet.side === "player" ? game.theme.bulletPlayer : game.theme.bulletEnemy,
            4,
          );
          break;
        }

        if (bulletHitsBase(bullet)) {
          bullet.dead = true;
          if (bullet.side === "enemy") {
            destroyBase();
          } else {
            addImpactSparks(bullet.x, bullet.y, "#fff0b8", 8);
            Sound.steel();
          }
          break;
        }

        const col = Math.floor(bullet.x / TILE);
        const row = Math.floor(bullet.y / TILE);
        const tile = tileAt(col, row);
        if (tile === T.BRICK) {
          game.map[row][col] = T.EMPTY;
          bullet.dead = true;
          addBrickDebris(col * TILE + TILE / 2, row * TILE + TILE / 2);
          addShake(1.1);
          Sound.brick();
          break;
        }
        if (tile === T.STEEL) {
          bullet.dead = true;
          addImpactSparks(bullet.x, bullet.y, game.theme.steelEdge, 8);
          Sound.steel();
          break;
        }

        if (bullet.side === "enemy") {
          const player = game.player;
          if (player) {
            const rect = tankRect(player);
            if (
              bullet.x > rect.x &&
              bullet.x < rect.x + rect.w &&
              bullet.y > rect.y &&
              bullet.y < rect.y + rect.h
            ) {
              bullet.dead = true;
              if (player.shieldTimer > 0) {
                addImpactSparks(bullet.x, bullet.y, "#b8ffe0", 10);
                addShockwave(player.x, player.y, {
                  radius: 15,
                  maxRadius: 30,
                  life: 0.25,
                  color: "#b8ffe0",
                  width: 1.5,
                });
                Sound.shieldBlock();
              } else {
                hitPlayer();
              }
              break;
            }
          }
        } else {
          let hit = false;
          for (const enemy of game.enemies) {
            if (enemy.dead) continue;
            const rect = tankRect(enemy);
            if (
              bullet.x > rect.x &&
              bullet.x < rect.x + rect.w &&
              bullet.y > rect.y &&
              bullet.y < rect.y + rect.h
            ) {
              bullet.dead = true;
              hit = true;
              if (enemy.spawnTimer <= 0) {
                damageEnemy(enemy, 1);
              } else {
                addImpactSparks(bullet.x, bullet.y, game.theme.accent, 8);
                Sound.steel();
              }
              break;
            }
          }
          if (hit) break;
        }
      }
    }

    game.bullets = game.bullets.filter((bullet) => !bullet.dead);
    resolveBulletClashes();
  }

  function resolveBulletClashes() {
    if (game.bullets.length < 2) return;
    for (let i = 0; i < game.bullets.length; i += 1) {
      const first = game.bullets[i];
      if (first.dead) continue;
      for (let j = i + 1; j < game.bullets.length; j += 1) {
        const second = game.bullets[j];
        if (second.dead || first.side === second.side) continue;
        if (distance(first.x, first.y, second.x, second.y) < 9) {
          first.dead = true;
          second.dead = true;
          addImpactSparks(
            (first.x + second.x) / 2,
            (first.y + second.y) / 2,
            "#fff4cc",
            9,
          );
          addShockwave((first.x + second.x) / 2, (first.y + second.y) / 2, {
            radius: 2,
            maxRadius: 14,
            life: 0.2,
            color: "#fff4cc",
            width: 1.2,
          });
          Sound.bulletClash();
          break;
        }
      }
    }
    game.bullets = game.bullets.filter((bullet) => !bullet.dead);
  }

  // ------------------------------------------------------------------- update

  function update(dt) {
    game.visualTime += dt;
    game.shake = Math.max(0, game.shake - dt * 26);
    game.flash = Math.max(0, game.flash - dt * 2.8);

    if (game.state === "menu" || game.state === "paused") return;

    if (game.state === "playing") {
      game.elapsed += dt;
      if (game.stageDelay > 0) game.stageDelay = Math.max(0, game.stageDelay - dt);
      if (game.freezeTimer > 0) game.freezeTimer = Math.max(0, game.freezeTimer - dt);

      updatePlayer(dt);
      if (game.state === "playing") updateEnemies(dt);
      if (game.state === "playing") updateSpawner(dt);
      if (game.state === "playing") updateBullets(dt);
      if (game.state === "playing") updatePickups(dt);
      if (game.state === "playing") checkStageClear();

      updateEffects(dt);
      updateBuffHud();
      updateClock();
      return;
    }

    if (game.state === "ending") {
      updateEffects(dt);
      updateBuffHud();
      game.endTimer -= dt;
      if (game.endTimer <= 0) finishGameOver();
      return;
    }

    if (game.state === "clearing") {
      updateEffects(dt);
      updateBuffHud();
      game.clearTimer -= dt;
      if (game.clearTimer <= 0) finishClearing();
      return;
    }

    updateEffects(dt);
    updateBuffHud();
  }

  // -------------------------------------------------------------- event wiring

  function isButtonFocused() {
    const active = document.activeElement;
    return active && (active.tagName === "BUTTON" || active.tagName === "A");
  }

  const KEY_ACTIONS = {
    ArrowUp: "up",
    KeyW: "up",
    ArrowLeft: "left",
    KeyA: "left",
    ArrowDown: "down",
    KeyS: "down",
    ArrowRight: "right",
    KeyD: "right",
    Space: "fire",
    KeyJ: "fire",
  };

  function handleEnterKey() {
    if (isButtonFocused()) return;
    if (game.state === "menu") startGame();
    else if (game.state === "paused") resumeGame();
    else if (game.state === "levelclear") beginStage(game.levelIndex + 1);
    else if (game.state === "gameover" || game.state === "victory") startGame();
  }

  function handleAction(action) {
    switch (action) {
      case "start":
        if (game.state === "menu") startGame();
        break;
      case "resume":
        resumeGame();
        break;
      case "restart":
        if (game.state === "paused") startGame();
        break;
      case "retry":
        if (game.state === "gameover" || game.state === "victory") startGame();
        break;
      case "next":
        if (game.state === "levelclear") beginStage(game.levelIndex + 1);
        break;
      case "menu":
        if (game.state === "gameover" || game.state === "victory") returnToMenu();
        break;
      default:
        break;
    }
  }

  function bindEvents() {
    window.addEventListener("keydown", (event) => {
      const action = KEY_ACTIONS[event.code];
      if (action) {
        if (action === "fire") {
          if (game.state === "playing") event.preventDefault();
        } else {
          event.preventDefault();
        }
        input.press(action, `key:${event.code}`);
        return;
      }

      if (event.repeat) return;

      if (event.code === "Enter") {
        handleEnterKey();
        return;
      }
      if (event.code === "KeyP" || event.code === "Escape") {
        if (game.state === "playing" || game.state === "paused") {
          event.preventDefault();
          togglePause();
        }
        return;
      }
      if (event.code === "KeyM") {
        toggleMute();
      }
    });

    window.addEventListener("keyup", (event) => {
      const action = KEY_ACTIONS[event.code];
      if (action) input.release(action, `key:${event.code}`);
    });

    window.addEventListener("blur", () => {
      input.releaseAll();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        input.releaseAll();
        if (game.state === "playing") pauseGame();
      }
    });

    dom.overlay.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action]");
      if (!button) return;
      Sound.unlock();
      Sound.ui();
      handleAction(button.dataset.action);
    });

    dom.soundBtn.addEventListener("click", () => {
      Sound.unlock();
      toggleMute();
    });

    dom.pauseBtn.addEventListener("click", () => {
      togglePause();
    });

    for (const button of dom.controlButtons) {
      const action = button.dataset.control;
      const pointers = new Set();

      const releasePointer = (event) => {
        if (!pointers.has(event.pointerId)) return;
        pointers.delete(event.pointerId);
        input.release(action, `pointer:${event.pointerId}`);
        if (pointers.size === 0) button.classList.remove("is-held");
      };

      button.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        event.preventDefault();
        Sound.unlock();
        try {
          button.setPointerCapture(event.pointerId);
        } catch {
          // Pointer capture is best-effort.
        }
        pointers.add(event.pointerId);
        input.press(action, `pointer:${event.pointerId}`);
        button.classList.add("is-held");
      });
      button.addEventListener("pointerup", releasePointer);
      button.addEventListener("pointercancel", releasePointer);
      button.addEventListener("lostpointercapture", releasePointer);
      button.addEventListener("contextmenu", (event) => event.preventDefault());
    }

    window.addEventListener("resize", () => {
      // CSS handles responsive sizing; the canvas backing store is fixed for crisp pixels.
      render();
    });
  }

  // ---------------------------------------------------------------- rendering

  function roundedRectPath(x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawFloor() {
    const theme = game.theme;
    const gradient = ctx.createLinearGradient(0, 0, 0, VIEW);
    gradient.addColorStop(0, theme.floorTop);
    gradient.addColorStop(0.58, theme.floorBottom);
    gradient.addColorStop(1, theme.floorTop);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, VIEW, VIEW);

    const glow = ctx.createRadialGradient(360, 480, 40, 360, 480, 470);
    glow.addColorStop(0, theme.floorGlow);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, VIEW, VIEW);

    ctx.lineWidth = 1;
    ctx.strokeStyle = theme.grid;
    ctx.beginPath();
    for (let i = 0; i <= COLS; i += 1) {
      const pos = i * TILE + 0.5;
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, VIEW);
      ctx.moveTo(0, pos);
      ctx.lineTo(VIEW, pos);
    }
    ctx.stroke();

    ctx.globalAlpha = 0.24;
    ctx.strokeStyle = theme.grid;
    ctx.beginPath();
    for (let i = 0; i <= COLS * 2; i += 1) {
      const pos = i * (TILE / 2) + 0.5;
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, VIEW);
      ctx.moveTo(0, pos);
      ctx.lineTo(VIEW, pos);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.fillStyle = theme.accent;
    for (const mote of AMBIENT_MOTES) {
      const y = ((mote.y - game.visualTime * mote.speed) % VIEW + VIEW) % VIEW;
      const x =
        ((mote.x + Math.sin(game.visualTime * 0.45 + mote.phase) * mote.drift * 4) % VIEW + VIEW) %
        VIEW;
      ctx.globalAlpha = mote.alpha * (0.6 + 0.4 * Math.sin(game.visualTime * 1.4 + mote.phase));
      ctx.fillRect(x, y, mote.radius, mote.radius);
    }
    ctx.globalAlpha = 1;

    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.strokeRect(0.5, 0.5, VIEW - 1, VIEW - 1);
  }

  function drawSpawnZones() {
    const theme = game.theme;
    const pulse = 0.1 + (Math.sin(game.visualTime * 2.1) + 1) * 0.035;
    ctx.save();
    ctx.strokeStyle = theme.accent;
    ctx.fillStyle = theme.accent;
    for (const point of ENEMY_SPAWNS) {
      ctx.globalAlpha = pulse + 0.08;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.moveTo(point.x - 24, 10);
      ctx.lineTo(point.x - 24, 2);
      ctx.lineTo(point.x - 16, 2);
      ctx.moveTo(point.x + 24, 10);
      ctx.lineTo(point.x + 24, 2);
      ctx.lineTo(point.x + 16, 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(point.x - 5, 5);
      ctx.lineTo(point.x + 5, 5);
      ctx.lineTo(point.x, 11);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawWaterTile(x, y, col, row) {
    const theme = game.theme;
    ctx.fillStyle = theme.waterDeep;
    ctx.fillRect(x, y, TILE, TILE);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, TILE, TILE);
    ctx.clip();

    ctx.globalAlpha = 0.4;
    ctx.fillStyle = theme.waterMid;
    ctx.fillRect(x, y + 2, TILE, TILE - 4);
    ctx.globalAlpha = 1;

    ctx.lineWidth = 1;
    for (let line = 0; line < 4; line += 1) {
      const baseY = y + 8 + line * 9;
      ctx.beginPath();
      for (let px = 0; px <= TILE; px += 4) {
        const wave =
          Math.sin(
            px * 0.16 +
              game.visualTime * 2.2 +
              line * 1.55 +
              col * 0.65 +
              row * 0.4,
          ) * 1.45;
        if (px === 0) ctx.moveTo(x + px, baseY + wave);
        else ctx.lineTo(x + px, baseY + wave);
      }
      ctx.strokeStyle = theme.waterLine;
      ctx.globalAlpha = 0.35 + 0.15 * Math.sin(game.visualTime * 1.5 + line);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const glintX = x + 9 + ((game.visualTime * 12 + col * 11 + row * 7) % 22);
    ctx.fillStyle = theme.waterGlint;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(glintX, y + 7, 5, 1);
    ctx.fillRect(x + 25 - glintX % 7, y + 27, 3, 1);
    ctx.globalAlpha = 1;
    ctx.restore();

    ctx.strokeStyle = "rgba(0,0,0,0.22)";
    ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
  }

  function drawBrickTile(x, y, col, row) {
    const theme = game.theme;
    ctx.save();
    roundedRectPath(x + 1.5, y + 1.5, TILE - 3, TILE - 3, 2.5);
    ctx.clip();
    ctx.fillStyle = theme.brickMortar;
    ctx.fillRect(x, y, TILE, TILE);

    for (let brickRow = 0; brickRow < 4; brickRow += 1) {
      const rowY = y + 2 + brickRow * 9;
      const offset = brickRow % 2 === 0 ? -8 : 0;
      for (let bx = -16; bx < TILE + 16; bx += 16) {
        const brickX = x + bx + offset;
        const colorIndex = Math.floor(hash2(col * 9 + brickRow, row * 7 + bx) * 3);
        ctx.fillStyle = theme.brickColors[colorIndex];
        ctx.fillRect(brickX + 1, rowY, 14, 7);
        ctx.fillStyle = theme.brickHighlight;
        ctx.globalAlpha = 0.16;
        ctx.fillRect(brickX + 1, rowY, 14, 1);
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = "#1a0905";
        ctx.fillRect(brickX + 1, rowY + 6, 14, 1);
        ctx.globalAlpha = 1;
      }
    }
    ctx.restore();

    ctx.strokeStyle = "rgba(20, 8, 4, 0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.8, y + 0.8, TILE - 1.6, TILE - 1.6);
    ctx.strokeStyle = theme.brickHighlight;
    ctx.globalAlpha = 0.1;
    ctx.strokeRect(x + 2, y + 2, TILE - 4, TILE - 4);
    ctx.globalAlpha = 1;
  }

  function drawSteelTile(x, y) {
    const theme = game.theme;
    ctx.fillStyle = "rgba(0,0,0,0.38)";
    ctx.fillRect(x + 1, y + 2, TILE - 2, TILE - 2);
    roundedRectPath(x + 2, y + 2, TILE - 4, TILE - 4, 3);
    ctx.fillStyle = theme.steelDark;
    ctx.fill();

    roundedRectPath(x + 4, y + 4, TILE - 8, TILE - 8, 2);
    ctx.fillStyle = theme.steelMid;
    ctx.fill();

    ctx.fillStyle = theme.steelLight;
    ctx.fillRect(x + 6, y + 6, TILE - 12, 2);
    ctx.fillRect(x + 6, y + 6, 2, TILE - 12);
    ctx.fillStyle = "rgba(0,0,0,0.32)";
    ctx.fillRect(x + 6, y + TILE - 8, TILE - 12, 2);
    ctx.fillRect(x + TILE - 8, y + 6, 2, TILE - 12);

    ctx.strokeStyle = "rgba(0,0,0,0.34)";
    ctx.lineWidth = 1;
    roundedRectPath(x + 10, y + 10, TILE - 20, TILE - 20, 1);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 12);
    ctx.lineTo(x + TILE - 12, y + TILE - 12);
    ctx.stroke();

    ctx.fillStyle = theme.steelRivet;
    for (const [rx, ry] of [
      [8, 8],
      [TILE - 8, 8],
      [8, TILE - 8],
      [TILE - 8, TILE - 8],
    ]) {
      ctx.beginPath();
      ctx.arc(x + rx, y + ry, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
  }

  function drawBushTile(x, y, col, row) {
    const theme = game.theme;
    const variation = hash2(col, row);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, TILE, TILE);
    ctx.clip();

    ctx.fillStyle = theme.treeDark;
    const clusters = [
      [x + 9 + variation * 4, y + 13, 14],
      [x + 30 - variation * 3, y + 11, 13],
      [x + 17, y + 28, 15],
      [x + 35, y + 28, 11],
    ];
    for (const [cx, cy, radius] of clusters) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = theme.treeMid;
    for (const [cx, cy, radius] of [
      [x + 10, y + 16, 10],
      [x + 26, y + 12, 9],
      [x + 22, y + 27, 11],
      [x + 34, y + 29, 7],
    ]) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = theme.treeLight;
    for (const [cx, cy, radius] of [
      [x + 9, y + 13, 5],
      [x + 24, y + 9, 4],
      [x + 18, y + 24, 5.5],
    ]) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = theme.treeHighlight;
    for (let i = 0; i < 7; i += 1) {
      const px = x + 4 + hash2(col * 31 + i, row * 17 + i * 3) * 32;
      const py = y + 4 + hash2(col * 17 + i * 5, row * 41 + i) * 32;
      ctx.fillRect(px, py, 1.5, 1.5);
    }
    ctx.restore();
  }

  function drawTerrain() {
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        const tile = game.map[row][col];
        const x = col * TILE;
        const y = row * TILE;
        if (tile === T.WATER) drawWaterTile(x, y, col, row);
        else if (tile === T.BRICK) drawBrickTile(x, y, col, row);
        else if (tile === T.STEEL) drawSteelTile(x, y);
      }
    }
  }

  function drawBushes() {
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        if (game.map[row][col] === T.BUSH) drawBushTile(col * TILE, row * TILE, col, row);
      }
    }
  }

  function drawBase() {
    if (!game.base) return;
    const theme = game.theme;
    const { x, y, w, h, alive } = game.base;
    const cx = x + w / 2;
    const cy = y + h / 2;

    const glowRadius = 96;
    const glow = ctx.createRadialGradient(cx, cy, 6, cx, cy, glowRadius);
    if (alive) {
      const pulse = 0.34 + 0.12 * Math.sin(game.visualTime * 2.2);
      glow.addColorStop(0, theme.baseGlow);
      glow.addColorStop(0.55, `rgba(255, 189, 78, ${pulse * 0.25})`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
    } else {
      glow.addColorStop(0, "rgba(255, 88, 52, 0.17)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
    }
    ctx.fillStyle = glow;
    ctx.fillRect(cx - glowRadius, cy - glowRadius, glowRadius * 2, glowRadius * 2);

    ctx.save();
    roundedRectPath(x + 2, y + 2, w - 4, h - 4, 5);
    ctx.fillStyle = alive ? "#0a1b14" : "#140b08";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = alive ? theme.baseGold : "rgba(111, 72, 51, 0.7)";
    ctx.stroke();

    roundedRectPath(x + 7, y + 7, w - 14, h - 14, 3);
    ctx.fillStyle = alive ? "rgba(16, 40, 29, 0.88)" : "rgba(20, 11, 8, 0.9)";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = alive ? "rgba(255, 219, 137, 0.18)" : "rgba(255, 106, 70, 0.13)";
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 8, y + 8, w - 16, 8);
    ctx.clip();
    for (let i = -10; i < w + 20; i += 12) {
      ctx.fillStyle = alive ? theme.baseGold : "#4a2b20";
      ctx.globalAlpha = alive ? 0.42 : 0.25;
      ctx.beginPath();
      ctx.moveTo(x + i, y + 8);
      ctx.lineTo(x + i + 6, y + 8);
      ctx.lineTo(x + i, y + 16);
      ctx.lineTo(x + i - 6, y + 16);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    ctx.globalAlpha = 1;

    if (alive) {
      ctx.save();
      ctx.translate(cx, cy + 1);
      ctx.shadowColor = theme.baseGlow;
      ctx.shadowBlur = 14;

      ctx.fillStyle = theme.baseGoldDark;
      ctx.strokeStyle = "rgba(39, 24, 5, 0.85)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-4, -14);
      ctx.lineTo(-26, -5);
      ctx.lineTo(-23, 5);
      ctx.lineTo(-8, 12);
      ctx.lineTo(-4, 3);
      ctx.closePath();
      ctx.moveTo(4, -14);
      ctx.lineTo(26, -5);
      ctx.lineTo(23, 5);
      ctx.lineTo(8, 12);
      ctx.lineTo(4, 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = theme.baseGold;
      ctx.beginPath();
      ctx.moveTo(-3, -11);
      ctx.lineTo(-20, -5);
      ctx.lineTo(-17, 2);
      ctx.lineTo(-6, 7);
      ctx.lineTo(-3, -1);
      ctx.closePath();
      ctx.moveTo(3, -11);
      ctx.lineTo(20, -5);
      ctx.lineTo(17, 2);
      ctx.lineTo(6, 7);
      ctx.lineTo(3, -1);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = theme.baseGoldLight;
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.lineTo(9, -11);
      ctx.lineTo(7, 11);
      ctx.lineTo(0, 20);
      ctx.lineTo(-7, 11);
      ctx.lineTo(-9, -11);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(85, 53, 12, 0.7)";
      ctx.stroke();

      ctx.fillStyle = theme.baseGoldDark;
      ctx.beginPath();
      ctx.moveTo(0, -27);
      ctx.lineTo(4, -21);
      ctx.lineTo(1, -18);
      ctx.lineTo(-4, -20);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(122, 79, 17, 0.75)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(0, 13);
      ctx.moveTo(-4, -8);
      ctx.lineTo(4, -8);
      ctx.moveTo(-5, 0);
      ctx.lineTo(5, 0);
      ctx.stroke();

      const coreAlpha = 0.72 + Math.sin(game.visualTime * 3.1) * 0.24;
      ctx.globalAlpha = coreAlpha;
      ctx.fillStyle = theme.baseCore;
      ctx.shadowColor = theme.baseCore;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 3, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();

      ctx.fillStyle = "rgba(255, 227, 164, 0.46)";
      ctx.font = '600 6px "Cascadia Mono", monospace';
      ctx.textAlign = "center";
      ctx.fillText("COMMAND CORE", cx, y + h - 7);
    } else {
      ctx.save();
      ctx.translate(cx, cy + 2);
      ctx.fillStyle = "rgba(0,0,0,0.48)";
      ctx.beginPath();
      ctx.moveTo(-25, -13);
      ctx.lineTo(-8, -19);
      ctx.lineTo(13, -11);
      ctx.lineTo(24, 4);
      ctx.lineTo(10, 16);
      ctx.lineTo(-10, 19);
      ctx.lineTo(-22, 7);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 116, 71, 0.6)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-5, -17);
      ctx.lineTo(4, -4);
      ctx.lineTo(-7, 3);
      ctx.lineTo(2, 15);
      ctx.moveTo(7, -10);
      ctx.lineTo(1, 0);
      ctx.lineTo(14, 8);
      ctx.stroke();

      const ember = 0.2 + 0.16 * Math.sin(game.visualTime * 3.8);
      ctx.fillStyle = `rgba(255, 116, 71, ${ember})`;
      ctx.beginPath();
      ctx.arc(6, 2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = "rgba(255, 110, 77, 0.42)";
      ctx.font = '600 6px "Cascadia Mono", monospace';
      ctx.textAlign = "center";
      ctx.fillText("CORE OFFLINE", cx, y + h - 7);
    }

    ctx.fillStyle = alive ? theme.baseGold : "rgba(111, 72, 51, 0.65)";
    for (const [bx, by] of [
      [x + 10, y + 10],
      [x + w - 10, y + 10],
      [x + 10, y + h - 10],
      [x + w - 10, y + h - 10],
    ]) {
      ctx.beginPath();
      ctx.arc(bx, by, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawTreads(colors, tank) {
    const phase = ((tank.odometer || 0) * 0.68) % 5;
    ctx.fillStyle = colors.track;
    roundedRectPath(-16, -16, 9, 32, 2);
    ctx.fill();
    roundedRectPath(7, -16, 9, 32, 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.13)";
    ctx.lineWidth = 0.8;
    roundedRectPath(-16, -16, 9, 32, 2);
    ctx.stroke();
    roundedRectPath(7, -16, 9, 32, 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.14)";
    for (let i = 0; i < 6; i += 1) {
      const yy = -14 + ((i * 5 + phase) % 29);
      ctx.fillRect(-15, yy, 7, 1);
      ctx.fillRect(8, yy, 7, 1);
    }
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(-15, -2, 7, 1.3);
    ctx.fillRect(8, -2, 7, 1.3);
  }

  function drawTankBarrel(colors, kind) {
    const barrels = kind === "gunner" ? [-5.2, 1.8] : [-2.7];
    const width = kind === "gunner" ? 3.4 : 5.4;
    for (const x of barrels) {
      ctx.fillStyle = colors.dark;
      ctx.fillRect(x - 0.7, -27, width + 1.4, 21);
      ctx.fillStyle = colors.barrel;
      ctx.fillRect(x, -26, width, 19);
      ctx.fillStyle = colors.light;
      ctx.fillRect(x - 1.5, -28.5, width + 3, 3.2);
      ctx.fillStyle = "rgba(0,0,0,0.52)";
      ctx.fillRect(x - 1.5, -25.6, width + 3, 1.1);
      ctx.fillStyle = colors.light;
      ctx.globalAlpha = 0.36;
      ctx.fillRect(x + 0.5, -23, 0.9, 12);
      ctx.globalAlpha = 1;
    }
  }

  function drawTankSprite(tank) {
    const colors = tank.isPlayer ? PLAYER_COLORS : tank.stats.colors;
    const isArmored = !tank.isPlayer && tank.kind === "armored";
    const isGunner = !tank.isPlayer && tank.kind === "gunner";

    drawTreads(colors, tank);

    ctx.fillStyle = "rgba(0,0,0,0.44)";
    roundedRectPath(-12.5, -14.5, 25, 30, 3);
    ctx.fill();

    const gradient = ctx.createLinearGradient(0, -15, 0, 15);
    gradient.addColorStop(0, colors.light);
    gradient.addColorStop(0.18, colors.body);
    gradient.addColorStop(0.82, colors.body);
    gradient.addColorStop(1, colors.dark);
    ctx.beginPath();
    ctx.moveTo(-9.5, -14);
    ctx.lineTo(9.5, -14);
    ctx.lineTo(12, -9);
    ctx.lineTo(11.5, 13);
    ctx.lineTo(-11.5, 13);
    ctx.lineTo(-12, -9);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.62)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = colors.dark;
    ctx.beginPath();
    ctx.moveTo(-8.5, -14);
    ctx.lineTo(8.5, -14);
    ctx.lineTo(6, -17.5);
    ctx.lineTo(-6, -17.5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = colors.light;
    ctx.globalAlpha = 0.32;
    ctx.fillRect(-8, -12.2, 16, 1.8);
    ctx.globalAlpha = 1;

    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(-11, 10.5, 22, 2.2);

    if (isArmored) {
      ctx.fillStyle = colors.light;
      ctx.globalAlpha = 0.32;
      ctx.fillRect(-14.2, -9, 3.4, 18);
      ctx.fillRect(10.8, -9, 3.4, 18);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "rgba(0,0,0,0.62)";
      ctx.lineWidth = 1;
      ctx.strokeRect(-14.2, -9, 3.4, 18);
      ctx.strokeRect(10.8, -9, 3.4, 18);
      ctx.fillStyle = colors.accent;
      for (const yy of [-7, 0, 7]) {
        ctx.fillRect(-13.2, yy, 1.3, 1.3);
        ctx.fillRect(11.9, yy, 1.3, 1.3);
      }
    }

    ctx.fillStyle = colors.accent;
    ctx.globalAlpha = 0.72;
    ctx.fillRect(-6, 10, 12, 1.5);
    ctx.globalAlpha = 1;

    drawTankBarrel(colors, isGunner ? "gunner" : "basic");

    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.beginPath();
    ctx.moveTo(-7.6, -7.8);
    ctx.lineTo(7.6, -7.8);
    ctx.lineTo(8.5, -2);
    ctx.lineTo(6.5, 5.8);
    ctx.lineTo(-6.5, 5.8);
    ctx.lineTo(-8.5, -2);
    ctx.closePath();
    ctx.fill();

    const turretGradient = ctx.createLinearGradient(0, -7, 0, 7);
    turretGradient.addColorStop(0, colors.light);
    turretGradient.addColorStop(0.35, colors.turret);
    turretGradient.addColorStop(1, colors.dark);
    ctx.beginPath();
    ctx.moveTo(-6.4, -7.2);
    ctx.lineTo(6.4, -7.2);
    ctx.lineTo(7.6, -1.5);
    ctx.lineTo(5.8, 5.5);
    ctx.lineTo(-5.8, 5.5);
    ctx.lineTo(-7.6, -1.5);
    ctx.closePath();
    ctx.fillStyle = turretGradient;
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.64)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.32)";
    ctx.fillRect(-4.5, -5.7, 6.5, 1.2);

    ctx.fillStyle = colors.dark;
    roundedRectPath(-2.6, -0.7, 5.2, 4.8, 1);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 0.7;
    ctx.stroke();

    ctx.fillStyle = colors.light;
    for (const [bx, by] of [
      [-5.4, 3.8],
      [4.2, 3.8],
      [-5.4, -4.8],
      [4.2, -4.8],
    ]) {
      ctx.globalAlpha = 0.55;
      ctx.fillRect(bx, by, 1.2, 1.2);
    }
    ctx.globalAlpha = 1;

    if (tank.isPlayer) {
      ctx.fillStyle = PLAYER_COLORS.accent;
      ctx.beginPath();
      ctx.moveTo(0, 8.5);
      ctx.lineTo(2.5, 5.7);
      ctx.lineTo(0, 6.6);
      ctx.lineTo(-2.5, 5.7);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = colors.accent;
      ctx.globalAlpha = 0.6;
      ctx.fillRect(-5.5, 8, 11, 1.1);
      ctx.globalAlpha = 1;
      if (tank.kind === "swift") {
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-6, 6.9);
        ctx.lineTo(-3, 6.9);
        ctx.moveTo(3, 6.9);
        ctx.lineTo(6, 6.9);
        ctx.stroke();
      }
    }

    if (tank.hitFlash > 0) {
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = Math.min(0.62, tank.hitFlash * 5);
      ctx.fillStyle = "#fff5d8";
      ctx.beginPath();
      ctx.moveTo(-9.5, -14);
      ctx.lineTo(9.5, -14);
      ctx.lineTo(12, -9);
      ctx.lineTo(11.5, 13);
      ctx.lineTo(-11.5, 13);
      ctx.lineTo(-12, -9);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }
  }

  function drawSpawnEffect(tank, color) {
    if (tank.spawnTimer <= 0) return;
    const progress = clamp(1 - tank.spawnTimer / SPAWN_TIME, 0, 1);
    const alpha = 0.3 + progress * 0.5;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 5]);
    ctx.rotate(game.visualTime * 1.8);
    ctx.beginPath();
    ctx.arc(0, 0, 27, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.rotate(-game.visualTime * 1.8);

    ctx.strokeStyle = color;
    for (let i = 0; i < 4; i += 1) {
      const angle = (Math.PI / 2) * i + game.visualTime * 2.5;
      const inner = 22;
      const outer = 29;
      ctx.beginPath();
      ctx.arc(
        0,
        0,
        outer,
        angle - 0.18,
        angle + 0.16,
      );
      ctx.stroke();
      ctx.globalAlpha = alpha * 0.5;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
      ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
      ctx.stroke();
      ctx.globalAlpha = alpha;
    }

    const beamHeight = 42 * (1 - progress);
    const beam = ctx.createLinearGradient(0, -beamHeight, 0, beamHeight);
    beam.addColorStop(0, "rgba(255,255,255,0)");
    beam.addColorStop(0.5, color);
    beam.addColorStop(1, "rgba(255,255,255,0)");
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = beam;
    ctx.fillRect(-1, -beamHeight, 2, beamHeight * 2);
    ctx.restore();
  }

  function drawShield(player) {
    const remaining = player.shieldTimer;
    if (remaining <= 0) return;
    const blink = remaining < 0.9 && Math.sin(game.visualTime * 34) < 0 ? 0.22 : 1;
    ctx.save();
    ctx.translate(player.x, player.y - 1);
    ctx.rotate(game.visualTime * 0.75);
    ctx.globalAlpha = 0.72 * blink;
    ctx.strokeStyle = game.theme.accent;
    ctx.lineWidth = 1.3;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, 27 + Math.sin(game.visualTime * 4) * 1.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.45 * blink;
    ctx.beginPath();
    ctx.arc(0, 0, 21, game.visualTime * 1.4, game.visualTime * 1.4 + Math.PI * 0.7);
    ctx.arc(0, 0, 21, game.visualTime * 1.4 + Math.PI, game.visualTime * 1.4 + Math.PI * 1.55);
    ctx.stroke();
    ctx.globalAlpha = 0.06 * blink;
    ctx.fillStyle = game.theme.accent;
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawFrozenEffect(tank) {
    if (tank.isPlayer || game.freezeTimer <= 0) return;
    ctx.save();
    ctx.translate(tank.x, tank.y);
    ctx.globalAlpha = 0.42;
    ctx.strokeStyle = "#82e9ff";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.arc(0, 0, 23, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = "#82e9ff";
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawEnemyHealth(enemy) {
    if (enemy.maxHp <= 1 || enemy.isPreview) return;
    const pipWidth = 5;
    const gap = 2;
    const total = enemy.maxHp * pipWidth + (enemy.maxHp - 1) * gap;
    const startX = enemy.x - total / 2;
    const y = enemy.y - 29;
    for (let i = 0; i < enemy.maxHp; i += 1) {
      ctx.fillStyle = i < enemy.hp ? enemy.stats.colors.light : "rgba(0,0,0,0.45)";
      ctx.fillRect(startX + i * (pipWidth + gap), y, pipWidth, 2.4);
    }
  }

  function drawTank(tank) {
    const colors = tank.isPlayer ? PLAYER_COLORS : tank.stats.colors;
    const spawnAlpha = tank.spawnTimer > 0 ? 0.3 + (1 - tank.spawnTimer / SPAWN_TIME) * 0.7 : 1;
    const spawnScale = tank.spawnTimer > 0 ? 0.62 + (1 - tank.spawnTimer / SPAWN_TIME) * 0.38 : 1;

    ctx.save();
    ctx.translate(tank.x, tank.y);
    ctx.fillStyle = "rgba(0,0,0,0.38)";
    ctx.beginPath();
    ctx.ellipse(0, 4, 18, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    if (tank.spawnTimer > 0) drawSpawnEffect(tank, colors.light);

    ctx.save();
    ctx.rotate(DIRS[tank.dir].angle);
    ctx.scale(spawnScale * 1.1, spawnScale * 1.1);
    ctx.globalAlpha = spawnAlpha;
    drawTankSprite(tank);
    ctx.restore();

    if (tank.isPlayer && !tank.isPreview) drawShield(tank);
    if (!tank.isPlayer) drawFrozenEffect(tank);
    ctx.restore();

    drawEnemyHealth(tank);
  }

  function drawBullets() {
    for (const bullet of game.bullets) {
      if (bullet.dead) continue;
      const color = bullet.side === "player" ? game.theme.bulletPlayer : game.theme.bulletEnemy;
      const angle = Math.atan2(bullet.dy, bullet.dx);
      ctx.save();
      ctx.translate(bullet.x, bullet.y);
      ctx.rotate(angle);
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.44;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-13, 0);
      ctx.lineTo(-2, 0);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.shadowColor = color;
      ctx.shadowBlur = 9;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0.4, 0, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawPickupIcon(kind, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (kind === "shield") {
      ctx.beginPath();
      ctx.moveTo(0, -8.5);
      ctx.lineTo(7, -5.5);
      ctx.lineTo(6, 2);
      ctx.quadraticCurveTo(3.5, 7.5, 0, 9);
      ctx.quadraticCurveTo(-3.5, 7.5, -6, 2);
      ctx.lineTo(-7, -5.5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(3, 15, 9, 0.75)";
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(0, 5);
      ctx.stroke();
    } else if (kind === "rapid") {
      ctx.beginPath();
      ctx.moveTo(1, -9);
      ctx.lineTo(-5, 1);
      ctx.lineTo(-1, 1);
      ctx.lineTo(-2, 9);
      ctx.lineTo(6, -2);
      ctx.lineTo(2, -2);
      ctx.closePath();
      ctx.fill();
    } else if (kind === "life") {
      ctx.beginPath();
      ctx.moveTo(0, 7.5);
      ctx.bezierCurveTo(-11, -1, -7, -9, 0, -4);
      ctx.bezierCurveTo(7, -9, 11, -1, 0, 7.5);
      ctx.closePath();
      ctx.fill();
    } else if (kind === "freeze") {
      for (let i = 0; i < 3; i += 1) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * 8, Math.sin(angle) * 8);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === "bomb") {
      ctx.beginPath();
      ctx.arc(0, 1.5, 5.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(3.5, -3);
      ctx.quadraticCurveTo(7, -8, 8, -4);
      ctx.stroke();
      ctx.fillStyle = "#fff1bd";
      ctx.beginPath();
      ctx.arc(8, -4.5, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawPickups() {
    for (const pickup of game.pickups) {
      if (pickup.life < 3 && Math.floor(pickup.life * 8) % 2 === 0) continue;
      const def = PICKUP_DEFS[pickup.kind];
      const bob = Math.sin(game.visualTime * 3 + pickup.phase) * 2.4;
      const lifeRatio = clamp(pickup.life / pickup.maxLife, 0, 1);
      const x = pickup.x;
      const y = pickup.y + bob;

      ctx.save();
      ctx.translate(x, y);
      const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 26);
      glow.addColorStop(0, def.color);
      glow.addColorStop(0.32, def.color);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = 0.17 + Math.sin(game.visualTime * 3 + pickup.phase) * 0.04;
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.ellipse(0, 12 - bob, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.rotate(game.visualTime * 0.65 + pickup.phase);
      ctx.strokeStyle = def.color;
      ctx.globalAlpha = 0.52;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -17);
      ctx.lineTo(14, 0);
      ctx.lineTo(0, 17);
      ctx.lineTo(-14, 0);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = "rgba(5, 15, 10, 0.94)";
      ctx.strokeStyle = def.color;
      ctx.lineWidth = 1.2;
      roundedRectPath(-10, -10, 20, 20, 3);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-7, -7, 14, 14);

      drawPickupIcon(pickup.kind, def.color);

      ctx.strokeStyle = def.color;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, 20, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lifeRatio);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawParticles() {
    for (const particle of game.particles) {
      const alpha = clamp(particle.life / particle.maxLife, 0, 1) * particle.alpha;
      if (particle.type === "smoke") {
        ctx.globalAlpha = alpha * 0.72;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (particle.type === "debris") {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.size / 2, -particle.size / 3, particle.size, particle.size * 0.65);
        ctx.restore();
      } else {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        const size = particle.size;
        ctx.fillRect(particle.x - size / 2, particle.y - size / 2, size, size);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawShockwaves() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const wave of game.shockwaves) {
      const alpha = clamp(wave.life / wave.maxLife, 0, 1);
      ctx.globalAlpha = alpha * 0.56;
      ctx.strokeStyle = wave.color;
      ctx.lineWidth = Math.max(0.5, wave.width * alpha);
      ctx.beginPath();
      ctx.arc(wave.x, wave.y, wave.currentRadius || wave.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawFloatingTexts() {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const floater of game.floaters) {
      const alpha = clamp(floater.life / floater.maxLife, 0, 1);
      ctx.globalAlpha = alpha;
      ctx.font = `600 ${floater.size}px "Cascadia Mono", "Courier New", monospace`;
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "rgba(2, 8, 5, 0.8)";
      ctx.strokeText(floater.text, floater.x, floater.y);
      ctx.fillStyle = floater.color;
      ctx.fillText(floater.text, floater.x, floater.y);
    }
    ctx.restore();
  }

  function drawFreezeOverlay() {
    if (game.freezeTimer <= 0) return;
    const pulse = 0.6 + Math.sin(game.visualTime * 2.6) * 0.16;
    ctx.save();
    ctx.fillStyle = "rgba(89, 201, 255, 0.035)";
    ctx.fillRect(0, 0, VIEW, VIEW);
    ctx.strokeStyle = `rgba(117, 217, 255, ${0.1 * pulse})`;
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, VIEW - 6, VIEW - 6);
    ctx.strokeStyle = "rgba(158, 236, 255, 0.26)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 11; i += 1) {
      const x = ((i * 83.7 + game.visualTime * 7) % (VIEW - 40)) + 20;
      const y = ((i * 57.3 + game.visualTime * 11) % (VIEW - 40)) + 20;
      ctx.globalAlpha = 0.18 + 0.12 * Math.sin(game.visualTime + i);
      ctx.beginPath();
      ctx.moveTo(x - 3, y);
      ctx.lineTo(x + 3, y);
      ctx.moveTo(x, y - 3);
      ctx.lineTo(x, y + 3);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawFlashOverlay() {
    if (game.flash <= 0.005) return;
    ctx.save();
    ctx.fillStyle = `rgba(255, 245, 219, ${Math.min(0.3, game.flash * 0.3)})`;
    ctx.fillRect(0, 0, VIEW, VIEW);
    ctx.restore();
  }

  function drawVisibleTanks() {
    const actors = [];
    if (game.player) actors.push(game.player);
    actors.push(...game.enemies);
    if (game.state === "menu") actors.push(...game.previewActors);
    actors.sort((a, b) => a.y - b.y);
    for (const tank of actors) drawTank(tank);
  }

  function drawRadar() {
    const radar = dom.radarCtx;
    if (!radar) return;
    const size = 260;
    const scale = size / VIEW;
    radar.setTransform(1, 0, 0, 1, 0, 0);
    radar.clearRect(0, 0, size, size);
    radar.fillStyle = "#03100a";
    radar.fillRect(0, 0, size, size);

    const background = radar.createRadialGradient(
      size / 2,
      size * 0.8,
      8,
      size / 2,
      size * 0.8,
      size * 0.85,
    );
    background.addColorStop(0, "rgba(67, 160, 111, 0.14)");
    background.addColorStop(1, "rgba(0,0,0,0)");
    radar.fillStyle = background;
    radar.fillRect(0, 0, size, size);

    radar.strokeStyle = "rgba(125, 255, 188, 0.055)";
    radar.lineWidth = 1;
    radar.beginPath();
    for (let i = 1; i < 6; i += 1) {
      const pos = (size / 6) * i + 0.5;
      radar.moveTo(pos, 0);
      radar.lineTo(pos, size);
      radar.moveTo(0, pos);
      radar.lineTo(size, pos);
    }
    radar.stroke();

    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        const tile = game.map[row][col];
        const x = col * TILE * scale;
        const y = row * TILE * scale;
        const tileSize = TILE * scale + 0.5;
        if (tile === T.BRICK) {
          radar.fillStyle = "rgba(232, 126, 78, 0.3)";
          radar.fillRect(x, y, tileSize, tileSize);
        } else if (tile === T.STEEL) {
          radar.fillStyle = "rgba(174, 205, 216, 0.28)";
          radar.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
        } else if (tile === T.WATER) {
          radar.fillStyle = "rgba(68, 183, 228, 0.2)";
          radar.fillRect(x, y, tileSize, tileSize);
        } else if (tile === T.BUSH) {
          radar.fillStyle = "rgba(88, 181, 112, 0.16)";
          radar.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
        }
      }
    }

    if (game.base) {
      const bx = game.base.x * scale;
      const by = game.base.y * scale;
      const bw = game.base.w * scale;
      const bh = game.base.h * scale;
      radar.save();
      radar.shadowColor = game.theme.baseGold;
      radar.shadowBlur = 9;
      radar.strokeStyle = game.base.alive ? game.theme.baseGoldLight : "#ff6f56";
      radar.fillStyle = game.base.alive ? "rgba(255, 205, 101, 0.34)" : "rgba(255, 91, 69, 0.2)";
      radar.lineWidth = 1.2;
      radar.fillRect(bx, by, bw, bh);
      radar.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
      radar.restore();
      const pulse = 0.5 + Math.sin(game.visualTime * 3) * 0.25;
      radar.globalAlpha = pulse;
      radar.fillStyle = game.base.alive ? game.theme.baseCore : "#ff7058";
      radar.beginPath();
      radar.arc(bx + bw / 2, by + bh / 2, 2.4, 0, Math.PI * 2);
      radar.fill();
      radar.globalAlpha = 1;
    }

    const enemies =
      game.state === "menu"
        ? game.previewActors.filter((actor) => !actor.isPlayer)
        : game.enemies;
    const player =
      game.state === "menu"
        ? game.previewActors.find((actor) => actor.isPlayer)
        : game.player;

    for (const pickup of game.pickups) {
      const color = PICKUP_DEFS[pickup.kind]?.color || game.theme.accent;
      const px = pickup.x * scale;
      const py = pickup.y * scale;
      radar.save();
      radar.translate(px, py);
      radar.rotate(Math.PI / 4);
      radar.strokeStyle = color;
      radar.lineWidth = 1;
      radar.strokeRect(-2.5, -2.5, 5, 5);
      radar.restore();
    }

    for (const enemy of enemies) {
      const ex = enemy.x * scale;
      const ey = enemy.y * scale;
      const pulse = 0.62 + Math.sin(game.visualTime * 4 + enemy.aiSeed) * 0.28;
      radar.globalAlpha = enemy.spawnTimer > 0 ? 0.45 : pulse;
      radar.fillStyle = enemy.stats?.colors?.light || "#ffb06e";
      radar.shadowColor = radar.fillStyle;
      radar.shadowBlur = enemy.kind === "armored" ? 9 : 5;
      radar.beginPath();
      radar.arc(ex, ey, enemy.kind === "armored" ? 3.3 : 2.4, 0, Math.PI * 2);
      radar.fill();
      if (enemy.kind === "gunner" && enemy.spawnTimer <= 0) {
        radar.strokeStyle = radar.fillStyle;
        radar.globalAlpha *= 0.45;
        radar.lineWidth = 0.8;
        radar.beginPath();
        radar.arc(ex, ey, 5, 0, Math.PI * 2);
        radar.stroke();
      }
    }
    radar.shadowBlur = 0;
    radar.globalAlpha = 1;

    if (player) {
      const px = player.x * scale;
      const py = player.y * scale;
      radar.save();
      radar.translate(px, py);
      radar.rotate(DIRS[player.dir].angle);
      radar.shadowColor = game.theme.accent;
      radar.shadowBlur = 9;
      radar.fillStyle = game.theme.bulletPlayer;
      radar.beginPath();
      radar.moveTo(0, -5.6);
      radar.lineTo(4, 4);
      radar.lineTo(0, 2.2);
      radar.lineTo(-4, 4);
      radar.closePath();
      radar.fill();
      radar.restore();
    }

    const sweepY = (game.visualTime * 56) % size;
    const sweep = radar.createLinearGradient(0, sweepY - 28, 0, sweepY);
    sweep.addColorStop(0, "rgba(125, 255, 188, 0)");
    sweep.addColorStop(0.82, "rgba(125, 255, 188, 0.055)");
    sweep.addColorStop(1, "rgba(125, 255, 188, 0.18)");
    radar.fillStyle = sweep;
    radar.fillRect(0, Math.max(0, sweepY - 28), size, Math.min(28, sweepY));
    radar.strokeStyle = "rgba(125, 255, 188, 0.16)";
    radar.lineWidth = 0.8;
    radar.beginPath();
    radar.moveTo(0, sweepY);
    radar.lineTo(size, sweepY);
    radar.stroke();

    radar.strokeStyle = "rgba(125, 255, 188, 0.16)";
    radar.strokeRect(0.5, 0.5, size - 1, size - 1);
    radar.strokeStyle = game.theme.accent;
    radar.globalAlpha = 0.32;
    radar.beginPath();
    radar.moveTo(0.5, 12);
    radar.lineTo(0.5, 0.5);
    radar.lineTo(12, 0.5);
    radar.moveTo(size - 12, 0.5);
    radar.lineTo(size - 0.5, 0.5);
    radar.lineTo(size - 0.5, 12);
    radar.moveTo(0.5, size - 12);
    radar.lineTo(0.5, size - 0.5);
    radar.lineTo(12, size - 0.5);
    radar.moveTo(size - 12, size - 0.5);
    radar.lineTo(size - 0.5, size - 0.5);
    radar.lineTo(size - 0.5, size - 12);
    radar.stroke();
    radar.globalAlpha = 1;
  }

  function render() {
    if (!game.map.length) return;
    ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = game.theme.floorBottom;
    ctx.fillRect(0, 0, VIEW, VIEW);

    const shakeMagnitude = Math.min(8, game.shake * 0.45);
    const shakeX = shakeMagnitude > 0 ? rand(-shakeMagnitude, shakeMagnitude) : 0;
    const shakeY = shakeMagnitude > 0 ? rand(-shakeMagnitude, shakeMagnitude) : 0;

    ctx.save();
    ctx.translate(shakeX, shakeY);
    drawFloor();
    drawSpawnZones();
    drawTerrain();
    drawBase();
    drawVisibleTanks();
    drawBullets();
    drawBushes();
    drawPickups();
    drawParticles();
    drawShockwaves();
    drawFloatingTexts();
    ctx.restore();

    drawFreezeOverlay();
    drawFlashOverlay();
    drawRadar();
  }

  // --------------------------------------------------------------- lifecycle

  let lastFrameTime = 0;

  function frame(now) {
    if (!lastFrameTime) lastFrameTime = now;
    const dt = Math.min(0.05, (now - lastFrameTime) / 1000);
    lastFrameTime = now;
    update(dt);
    render();
    window.requestAnimationFrame(frame);
  }

  function init() {
    setupMenuScene();
    updateSoundButton();
    bindEvents();
    showMenuOverlay();
    lastFrameTime = performance.now();
    window.requestAnimationFrame(frame);
  }

  if (new URLSearchParams(window.location.search).has("dev")) {
    window.__STEEL_FRONT__ = {
      get game() {
        return game;
      },
      startGame,
      beginStage,
      pauseGame,
      resumeGame,
      finishClearing,
      finishGameOver,
      destroyBase,
      checkStageClear,
      refreshHud,
      activatePickup,
      beginEnding,
      spawnPickup(kind) {
        game.pickups.push({
          id: `dev-pickup-${game.nextEntityId++}`,
          kind,
          x: game.player?.x || PLAYER_SPAWN.x,
          y: game.player?.y || PLAYER_SPAWN.y,
          life: 12,
          maxLife: 12,
          phase: 0,
        });
      },
    };
  }

  init();
})();
