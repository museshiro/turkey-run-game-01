// world.js — terrain, parallax and the spawn tables; slimmer now
// that the zones live in zones.js.
function buildWorld(seed) {
  return {
    seed: seed,
    rng: makeRng(seed),
    scrollX: 0,
    spawnTimer: 1.2,
    cornArcTimer: 3,
    featherTimer: 9,
    powerTimer: 22,
    cornerTimer: 14,
    lastSpawnKind: ''
  };
}

// spawnTableForZone — hazard kinds a zone may spawn, with weights.
function spawnTableForZone(zoneIdx, modeId) {
  var base = [
    { kind: 'pumpkin', w: 3 },
    { kind: 'mud', w: 2 },
    { kind: 'hay', w: 2 },
    { kind: 'slider', w: 2 },
    { kind: 'faller', w: 1 }
  ];
  if (zoneIdx >= 1) base.push({ kind: 'cart', w: 2 });
  if (zoneIdx >= 2) base.push({ kind: 'faller', w: 2 }, { kind: 'hay', w: 1 });
  if (zoneIdx >= 3) base.push({ kind: 'gravy', w: 2 });
  if (zoneIdx >= 4) base.push({ kind: 'oven', w: 3 }, { kind: 'faller', w: 2 });
  if (modeId === 'dash') base.push({ kind: 'slider', w: 2 }, { kind: 'faller', w: 1 });
  return base;
}

// pickSpawnKind — weighted pick from a spawn table using the world RNG.
function pickSpawnKind(world, table) {
  var total = 0;
  for (var i = 0; i < table.length; i++) total += table[i].w;
  var r = world.rng() * total;
  for (var j = 0; j < table.length; j++) {
    r -= table[j].w;
    if (r <= 0) return table[j].kind;
  }
  return table[0].kind;
}

// worldScrollSpeed — pixels per second for the current speed.
function worldScrollSpeed(G) {
  return G.speedM * CFG.PX_PER_M * (G.turkey.dashing ? CFG.DASH_BOOST : 1);
}
