// config.js — all tuning constants: canvas size, escape distance,
// the five zones, and the parameters of each play mode.
var CFG = {
  W: 960,
  H: 540,
  GROUND_Y: 452,
  ESCAPE_M: 1500,
  TURKEY_X: 210,
  PX_PER_M: 11,
  GRAVITY: 2600,
  JUMP_V: 980,
  DUCK_H: 34,
  STAND_H: 58,
  COMBO_WINDOW: 4,
  COMBO_MAX: 10,
  FEATHERS_PER_SHIELD: 20,
  DASH_PIPS: 3,
  DASH_RECHARGE: 2.2,
  DASH_TIME: 0.9,
  DASH_BOOST: 1.6,
  HIT_IFRAMES: 1.2,
  LUNGE_RANGE_M: 30,
  LUNGE_COOLDOWN: 6,
  LUNGE_TELEGRAPH: 0.7,
  LUNGE_STUN: 1.5,
  RETREAT_M: 80,
  GRACE_AFTER_HIT: 3,
  SEARCH_PAUSE: 2,
  CORNER_TELEGRAPH: 0.8
};

// ZONE_TABLE — the five Thanksgiving zones, 300 m each, farmyard to kitchen.
var ZONE_TABLE = [
  { n: 1, name: 'THE FARMYARD', short: 'FARMYARD', from: 0, to: 300,
    skyTop: '#f2b25c', skyBot: '#f7d9a0', ground: '#b98a4a', grass: '#7fae4e',
    hazard: '#8a5a2b', accent: '#e2723a', density: 0.55, speed: 1.0 },
  { n: 2, name: 'THE PUMPKIN PATCH', short: 'PUMPKIN PATCH', from: 300, to: 600,
    skyTop: '#e07840', skyBot: '#f2a65e', ground: '#9c6a33', grass: '#c97b2e',
    hazard: '#7a3f16', accent: '#e88a1e', density: 0.75, speed: 1.08 },
  { n: 3, name: 'THE OLD BARN', short: 'OLD BARN', from: 600, to: 900,
    skyTop: '#7a4a30', skyBot: '#c98a56', ground: '#6e4a2c', grass: '#8a6a3a',
    hazard: '#4a2c18', accent: '#b03a2a', density: 0.95, speed: 1.16 },
  { n: 4, name: 'THE FARMHOUSE HALL', short: 'FARMHOUSE HALL', from: 900, to: 1200,
    skyTop: '#c98a5e', skyBot: '#f2c98a', ground: '#8a5a34', grass: '#a03a30',
    hazard: '#5e2c20', accent: '#c0392b', density: 1.1, speed: 1.24 },
  { n: 5, name: 'THE CARVING ROOM', short: 'CARVING ROOM', from: 1200, to: 1500,
    skyTop: '#8a3a26', skyBot: '#e07840', ground: '#5e3a2a', grass: '#b03a2a',
    hazard: '#3a2020', accent: '#e25822', density: 1.3, speed: 1.32 }
];

// MODES — the three play modes shown on the title screen.
var MODES = {
  escape: { id: 'escape', name: 'Great Escape', tag: 'THE FULL 1,500 m RUN',
    desc: 'All five zones, every trick, three hearts.',
    speed: 8.2, density: 1.0, scoreMult: 1, hearts: 3, farmerGap: 70 },
  dash: { id: 'dash', name: 'Fowl Dash', tag: 'FAST • DOUBLE SCORE',
    desc: 'Faster scroll, tighter hazards, score x2.',
    speed: 11.5, density: 1.45, scoreMult: 2, hearts: 3, farmerGap: 55 },
  hide: { id: 'hide', name: 'Hide & Seek Harvest', tag: 'SLOW • STEALTH',
    desc: 'Bram stops to search. Hide in the hay, earn stealth points.',
    speed: 6.4, density: 0.8, scoreMult: 1, hearts: 3, farmerGap: 85 }
};
var MODE_ORDER = ['escape', 'dash', 'hide'];
