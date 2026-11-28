// shots.js — screenshot mode: read the URL parameters, simulate a
// run forward to the target distance, freeze the frame, and build the
// end frame. Attract mode added for the cover.
function readShotParams() {
  var p = {};
  try {
    var q = new URLSearchParams(window.location.search);
    p.shot = q.get('shot') || '';
    p.mode = q.get('mode') || 'escape';
    p.seed = parseInt(q.get('seed') || '1337', 10);
    p.result = q.get('result') || '';
  } catch (e) { p = { shot: '', mode: 'escape', seed: 1337, result: '' }; }
  return p;
}

// SHOT_SPECS — the four frozen frames, each with its exact HUD numbers.
var SHOT_SPECS = {
  cover: {
    mode: 'escape', seed: 1337, target: 1320,
    score: 8940, combo: 7, feathers: 16, hearts: 2, dashPips: 1,
    gap: 18, farmerState: 'LUNGING', shield: false, hint: null,
    overlay: 'attract',
    floaters: [
      { text: 'CUT OFF!', x: 130, y: 340, color: '#ff6a5a', big: true },
      { text: 'NEAR MISS +15', x: 840, y: 380, color: '#ffd23a', big: false }
    ],
    hazards: [
      { kind: 'oven', x: 730 },
      { kind: 'faller', x: 560, y: 150, falling: true },
      { kind: 'slider', x: 380 },
      { kind: 'corn', x: 300, y: 360 },
      { kind: 'corn', x: 330, y: 330 },
      { kind: 'corn', x: 360, y: 330 }
    ],
    props: [{ kind: 'table', x: 860 }]
  },
  pumpkin: {
    mode: 'escape', seed: 4242, target: 420,
    score: 1840, combo: 3, feathers: 7, hearts: 3, dashPips: 2,
    gap: 62, farmerState: 'CHASING', shield: false, hint: 'HOLD DUCK to hide',
    overlay: null,
    floaters: [
      { text: 'NEAR MISS +15', x: 520, y: 240, color: '#ffd23a', big: false }
    ],
    hazards: [
      { kind: 'cart', x: 700 },
      { kind: 'slider', x: 470 },
      { kind: 'hay', x: 300 },
      { kind: 'pumpkin', x: 840 },
      { kind: 'corn', x: 380, y: 360 },
      { kind: 'corn', x: 410, y: 330 },
      { kind: 'corn', x: 440, y: 330 },
      { kind: 'feather', x: 620, y: 300 }
    ],
    props: [{ kind: 'scarecrow', x: 900 }]
  },
  kitchen: {
    mode: 'escape', seed: 777, target: 1380,
    score: 10200, combo: 8, feathers: 19, hearts: 2, dashPips: 1,
    gap: 22, farmerState: 'LUNGING', shield: true, hint: null,
    overlay: null,
    floaters: [
      { text: 'LUNGE DODGE +25', x: 480, y: 190, color: '#7ad05a', big: true },
      { text: '350°!', x: 720, y: 180, color: '#ff9a3a', big: false }
    ],
    hazards: [
      { kind: 'oven', x: 730 },
      { kind: 'faller', x: 560, y: 150, falling: true },
      { kind: 'slider', x: 400 },
      { kind: 'corn', x: 300, y: 360 },
      { kind: 'corn', x: 330, y: 330 }
    ],
    props: [{ kind: 'table', x: 860 }]
  },
  end: {
    mode: 'escape', seed: 99, target: 1500,
    score: 9680, combo: 8, feathers: 0, hearts: 2, dashPips: 3,
    gap: 0, farmerState: 'STUNNED', shield: false, hint: null,
    overlay: 'end',
    floaters: [],
    hazards: [],
    props: []
  }
};

// autopilotInput — the tiny autopilot: jump over ground hazards and
// falling knives, dash when Bram gets close.
function autopilotInput(G) {
  var input = { jumpHeld: false, duckHeld: false, dashQueued: false, hideHeld: false };
  var t = G.turkey;
  var nearest = null;
  for (var i = 0; i < G.hazards.length; i++) {
    var h = G.hazards[i];
    if (h.pickup) continue;
    if (h.x > t.x - 10 && h.x < t.x + 260) {
      if (!nearest || h.x < nearest.x) nearest = h;
    }
  }
  if (nearest) {
    var dx = nearest.x - t.x;
    if (nearest.kind === 'faller') {
      if (dx < 120 && t.onGround) input.jumpHeld = true;
    } else if (nearest.kind === 'mud' || nearest.kind === 'gravy') {
      if (dx < 130 && t.onGround) input.jumpHeld = true;
    } else {
      if (dx < 150 && t.onGround) input.jumpHeld = true;
    }
  }
  if (G.farmer.gap < 22 && G.dashPips >= 1 && !t.dashing) input.dashQueued = true;
  return input;
}

// runShotSimulation — step the run forward at a fixed 1/60 s step
// with a seeded RNG and the autopilot until the target distance.
function runShotSimulation(G, targetM, seed) {
  var dt = 1 / 60;
  var guard = 0;
  while (G.distance < targetM && guard < 60000) {
    stepGame(G, dt, autopilotInput(G));
    guard++;
    if (G.screen === 'end') break;
  }
  return G.distance >= targetM;
}

// stageFrame — put the staged hazards, pickups, farmer state and
// floating text at their fixed positions and freeze the frame.
function stageFrame(G, spec) {
  var sk = G.score;
  sk.score = spec.score;
  sk.combo = spec.combo;
  sk.comboTimer = 2.5;
  if (sk.combo > sk.maxCombo) sk.maxCombo = spec.combo;
  sk.feathers = spec.feathers;
  G.hearts = spec.hearts;
  G.dashPips = spec.dashPips;
  G.shield = spec.shield;
  G.hint = spec.hint;
  G.zoneBannerT = 0;
  G.time = 12.5;
  G.farmer.gap = spec.gap;
  farmerSetState(G.farmer, spec.farmerState);
  G.farmer.stateT = 0.5;
  G.hazards = [];
  for (var i = 0; i < spec.hazards.length; i++) {
    var s = spec.hazards[i];
    var h = makeHazard(s.kind, s.x, G.world.rng);
    if (s.y != null) h.y = s.y;
    if (s.falling) { h.falling = true; h.telegraph = 0; h.vy = 260; }
    G.hazards.push(h);
  }
  G.props = spec.props || [];
  G.floaters = new FloaterLayer();
  for (var j = 0; j < spec.floaters.length; j++) {
    var f = spec.floaters[j];
    spawnFloatText(G.floaters, f.text, f.x, f.y, f.color, f.big);
    // Freeze mid-life so the text is fully opaque in the still frame
    // (it fades in over its first 0.2 s when played live).
    G.floaters.items[G.floaters.items.length - 1].t = 0.35;
  }
  G.turkey.hidden = false;
  G.turkey.ducking = false;
  G.turkey.iframes = 0;
  G.turkey.dashT = 0;
  G.turkey.vy = 0;
  G.turkey.y = CFG.GROUND_Y - 26;
  G.turkey.onGround = true;
  G.frozen = true;
}

// buildEndFrame — build the predetermined end state without playing
// a run: ESCAPED at 1,500 m with the score breakdown and the previous
// run's history line.
function buildEndFrame(G, spec) {
  var sk = G.score;
  sk.score = spec.score;
  sk.distanceScore = 1500;
  sk.corn = 40;
  sk.maxCombo = 8;
  sk.combo = 8;
  G.distance = 1500;
  G.hearts = spec.hearts;
  G.time = 12.5;
  G.frozen = true;
  var bonuses = endBonuses(sk, spec.hearts, true);
  G.end = {
    escaped: true,
    distance: 1500,
    heartsLeft: spec.hearts,
    best: bonuses.total,
    prevRun: 'Previous run: CAUGHT at 1.180 m — score 8.210',
    bonuses: bonuses
  };
  G.screen = 'end';
}

// initShotMode — run the screenshot for the URL parameters and mark
// the frame frozen after one full render, so the capture tool knows
// the frame is ready.
function initShotMode(G, params) {
  AudioSys.enabled = false;
  var spec = SHOT_SPECS[params.shot];
  if (!spec) return false;
  if (params.shot === 'end') {
    buildEndFrame(G, spec);
  } else {
    var ok = runShotSimulation(G, spec.target, spec.seed);
    if (!ok) return false;
    stageFrame(G, spec);
    if (spec.overlay === 'attract') G.screen = 'attract';
    else G.screen = 'playing';
  }
  renderFrame(G);
  window.__SHOT_FROZEN = true;
  return true;
}
