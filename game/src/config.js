// Pipkin's Great Escape — tuning knobs and the two play variants.
// Variant A ("Fowl Dash") is a fast, dense chase. Variant B ("Hide & Seek
// Harvest") is slower, stealthier, and leans on hiding and power-ups.
'use strict';

const GAME_W = 960;
const GAME_H = 540;
const GROUND_Y = 452;
const ESCAPE_DISTANCE = 1500;

const STAGES = [
  { from: 0,    name: 'THE FARMYARD', sky: '#f7c873', far: '#c98a3d', near: '#8a5a24', ground: '#b98a3e', grass: '#7fae4c' },
  { from: 500,  name: 'THE OLD BARN', sky: '#e8a35c', far: '#7a4a28', near: '#5a3a22', ground: '#8a6a3a', grass: '#6d8f3e' },
  { from: 1000, name: 'THE FARMHOUSE KITCHEN', sky: '#d98a6a', far: '#6a3a3a', near: '#4a2a2a', ground: '#7a5a44', grass: '#5d7f3a' },
];

const VARIANTS = {
  a: {
    key: 'a',
    label: 'FOWL DASH',
    tagline: 'Fast feet, faster farmer. Outrun Bram or end up as dinner.',
    baseSpeed: 430,
    topSpeed: 640,
    accel: 14,
    hazardGapMin: 300,
    hazardGapMax: 560,
    knifeChance: 0.42,
    ovenChance: 0.34,
    hayChance: 0.24,
    cornChance: 0.55,
    lives: 3,
    scoreMult: 2,
    farmerGapStart: 150,
    farmerCatchUp: 34,
    farmerSearchEvery: 0,
    shieldChance: 0,
    hideEnabled: false,
  },
  b: {
    key: 'b',
    label: 'HIDE & SEEK HARVEST',
    tagline: 'Slow down, hide in the hay, and let the farmer lose your trail.',
    baseSpeed: 300,
    topSpeed: 470,
    accel: 9,
    hazardGapMin: 380,
    hazardGapMax: 720,
    knifeChance: 0.30,
    ovenChance: 0.26,
    hayChance: 0.44,
    cornChance: 0.5,
    lives: 3,
    scoreMult: 1,
    farmerGapStart: 210,
    farmerCatchUp: 22,
    farmerSearchEvery: 11,
    shieldChance: 0.16,
    hideEnabled: true,
  },
};

function stageAt(distance) {
  let stage = STAGES[0];
  for (const s of STAGES) if (distance >= s.from) stage = s;
  return stage;
}

function stageIndexAt(distance) {
  let idx = 0;
  for (let i = 0; i < STAGES.length; i++) if (distance >= STAGES[i].from) idx = i;
  return idx;
}
