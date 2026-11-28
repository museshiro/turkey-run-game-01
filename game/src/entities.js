// entities.js — the turkey, hazards and spawn points; turkey
// movement and basic collision.
function Turkey() {
  this.x = CFG.TURKEY_X;
  this.y = CFG.GROUND_Y - 26;
  this.vy = 0;
  this.onGround = true;
  this.ducking = false;
  this.hidden = false;
  this.dashing = false;
  this.dashT = 0;
  this.iframes = 0;
  this.hideT = 0;
  this.nearHay = null;
}

function makeHazard(kind, x, rng) {
  var h = { kind: kind, x: x, y: CFG.GROUND_Y, vx: 0, vy: 0, passed: false, nearMissed: false, w: 40, h: 40, t: 0, telegraph: 0 };
  if (kind === 'pumpkin') { h.w = 44; h.h = 36; h.y = CFG.GROUND_Y - 18; }
  else if (kind === 'mud') { h.w = 90; h.h = 10; h.y = CFG.GROUND_Y - 2; }
  else if (kind === 'hay') { h.w = 60; h.h = 36; h.y = CFG.GROUND_Y - 18; h.hideSpot = true; }
  else if (kind === 'slider') { h.w = 46; h.h = 16; h.y = CFG.GROUND_Y - 8; h.vx = -60; }
  else if (kind === 'faller') { h.w = 20; h.h = 46; h.x = x; h.y = 40; h.vy = 0; h.telegraph = 0.55; h.falling = false; }
  else if (kind === 'oven') { h.w = 68; h.h = 64; h.y = CFG.GROUND_Y - 32; }
  else if (kind === 'cart') { h.w = 76; h.h = 46; h.y = CFG.GROUND_Y - 24; }
  else if (kind === 'gravy') { h.w = 80; h.h = 8; h.y = CFG.GROUND_Y - 4; }
  else if (kind === 'corn') { h.w = 18; h.h = 26; h.y = CFG.GROUND_Y - 60; h.pickup = true; }
  else if (kind === 'feather') { h.w = 16; h.h = 26; h.y = CFG.GROUND_Y - 90; h.pickup = true; }
  else if (kind === 'boat') { h.w = 34; h.h = 20; h.y = CFG.GROUND_Y - 60; h.pickup = true; h.power = 'shield'; }
  else if (kind === 'magnet') { h.w = 30; h.h = 30; h.y = CFG.GROUND_Y - 70; h.pickup = true; h.power = 'magnet'; }
  else if (kind === 'decoy') { h.w = 40; h.h = 34; h.y = CFG.GROUND_Y - 18; h.pickup = true; h.power = 'decoy'; }
  return h;
}

// stepTurkey — jump, duck, dash and hide from the current input.
function stepTurkey(t, dt, input, G) {
  t.iframes = Math.max(0, t.iframes - dt);
  t.dashT = Math.max(0, t.dashT - dt);
  t.dashing = t.dashT > 0;
  if (input.dashQueued && G.dashPips >= 1 && !t.dashing) {
    G.dashPips -= 1;
    t.dashT = CFG.DASH_TIME;
    t.dashing = true;
    // A dash buys distance from Bram as well as speed.
    G.farmer.gap = Math.min(160, G.farmer.gap + 8);
    spawnSparkBurst(G.floaters, t.x, t.y + 10, '#4ad0ff', 8);
  }
  input.dashQueued = false;
  if (input.jumpHeld && t.onGround && !t.ducking) {
    t.vy = -CFG.JUMP_V;
    t.onGround = false;
    AudioSys.playJump();
  }
  t.ducking = input.duckHeld && t.onGround;
  if (!t.onGround) {
    t.vy += CFG.GRAVITY * dt;
    t.y += t.vy * dt;
    if (t.y >= CFG.GROUND_Y - 26) {
      t.y = CFG.GROUND_Y - 26;
      t.vy = 0;
      t.onGround = true;
    }
  }
  // hiding: hold duck beside hay
  if (t.ducking && t.nearHay && !t.hidden) {
    t.hideT += dt;
    if (t.hideT > 0.35) {
      t.hidden = true;
      spawnFloatText(G.floaters, 'HIDDEN!', t.x, t.y - 70, '#7ad05a', true);
      AudioSys.playHidden();
    }
  } else if (!t.ducking || !t.nearHay) {
    t.hidden = false;
    t.hideT = 0;
  }
}

// turkeyRect — the turkey's collision box (smaller while ducking).
function turkeyRect(t) {
  var h = t.ducking || t.hidden ? CFG.DUCK_H : CFG.STAND_H;
  return { x: t.x - 18, y: t.y - h + 26, w: 36, h: h };
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// stepHazards — scroll hazards, drop falling knives, expire off-screen.
function stepHazards(G, dt, scrollPx) {
  var list = G.hazards;
  for (var i = list.length - 1; i >= 0; i--) {
    var h = list[i];
    h.t += dt;
    h.x -= scrollPx * dt;
    if (h.kind === 'slider') h.x += h.vx * dt;
    if (h.kind === 'faller') {
      if (h.telegraph > 0) {
        h.telegraph -= dt;
        if (h.telegraph <= 0) { h.falling = true; AudioSys.playKnife(); }
      } else if (h.falling) {
        h.vy += 1400 * dt;
        h.y += h.vy * dt;
        if (h.y > CFG.GROUND_Y - 20) { h.y = CFG.GROUND_Y - 20; h.falling = false; h.stuck = true; }
      }
    }
    if (h.x < -120) list.splice(i, 1);
  }
}

// checkCollisions — pickups, hits, near misses and clean dodges.
function checkCollisions(G) {
  var t = G.turkey;
  var tr = turkeyRect(t);
  var sk = G.score;
  t.nearHay = null;
  for (var i = G.hazards.length - 1; i >= 0; i--) {
    var h = G.hazards[i];
    if (h.kind === 'hay' && Math.abs(h.x - t.x) < 70) t.nearHay = h;
    var hr = { x: h.x - h.w / 2, y: h.y - h.h / 2, w: h.w, h: h.h };
    if (h.pickup) {
      if (rectsOverlap(tr, hr)) {
        if (h.kind === 'corn') { sk.corn++; addScore(sk, 25, G.mode.scoreMult); spawnFloatText(G.floaters, '+25 CORN', h.x, h.y - 30, '#ffd23a'); }
        else if (h.kind === 'feather') {
          sk.feathers++;
          addScore(sk, 5, G.mode.scoreMult);
          if (sk.feathers >= CFG.FEATHERS_PER_SHIELD) {
            sk.feathers = 0; G.shield = true; sk.shieldsEarned++;
            spawnFloatText(G.floaters, 'GRAVY SHIELD!', t.x, t.y - 80, '#7ad0ff', true);
            AudioSys.playShield();
          }
        } else if (h.power === 'shield') { G.shield = true; spawnFloatText(G.floaters, 'GRAVY SHIELD!', t.x, t.y - 80, '#7ad0ff', true); AudioSys.playShield(); }
        else if (h.power === 'magnet') { G.magnetT = 6; spawnFloatText(G.floaters, 'CORN MAGNET!', t.x, t.y - 80, '#ff9ad0'); }
        else if (h.power === 'decoy') {
          G.farmer.gap += 20;
          spawnFloatText(G.floaters, 'PUMPKIN DECOY!', t.x, t.y - 80, '#e88a1e');
          farmerSetState(G.farmer, 'SEARCHING');
        }
        AudioSys.playPickup();
        G.hazards.splice(i, 1);
        continue;
      }
      if (G.magnetT > 0 && h.kind === 'corn' && Math.abs(h.x - t.x) < 160) h.x += (t.x - h.x) * 0.08;
      continue;
    }
    if (h.kind === 'mud' || h.kind === 'gravy') {
      if (rectsOverlap(tr, hr)) G.speedM = Math.max(G.mode.speed * 0.45, G.speedM - 6 * 0.016);
      continue;
    }
    if (rectsOverlap(tr, hr) && t.iframes <= 0 && !t.hidden) {
      if (G.shield) {
        G.shield = false;
        t.iframes = CFG.HIT_IFRAMES;
        spawnFloatText(G.floaters, 'SHIELD BLOCK!', t.x, t.y - 80, '#7ad0ff', true);
        spawnSparkBurst(G.floaters, t.x, t.y, '#7ad0ff', 14);
        AudioSys.playShield();
        farmerSetState(G.farmer, 'STUNNED');
        G.hazards.splice(i, 1);
        continue;
      }
      G.hearts -= 1;
      t.iframes = CFG.HIT_IFRAMES;
      resetCombo(sk);
      G.farmer.gap = Math.min(160, G.farmer.gap + CFG.RETREAT_M);
      farmerSetState(G.farmer, 'RETREAT');
      spawnFloatText(G.floaters, 'HIT!', t.x, t.y - 80, '#ff6a5a', true);
      spawnSparkBurst(G.floaters, t.x, t.y, '#ff6a5a', 12);
      AudioSys.playHit();
      G.hazards.splice(i, 1);
      if (G.hearts <= 0) { G.events.push('CAUGHT'); }
      continue;
    }
    // near miss / clean dodge: hazard just passed the turkey untouched
    if (!h.passed && h.x + h.w / 2 < t.x - 20) {
      h.passed = true;
      var dy = Math.abs((h.y) - (t.y - 10));
      if (dy < 70 && !h.nearMissed) {
        h.nearMissed = true;
        sk.nearMisses++;
        var pts = addScore(sk, 15, G.mode.scoreMult);
        comboList(sk);
        // A near miss buys a little breathing room from Bram.
        G.farmer.gap = Math.min(160, G.farmer.gap + 4);
        spawnFloatText(G.floaters, 'NEAR MISS +' + pts, t.x + 40, t.y - 80, '#ffd23a');
      } else {
        sk.dodges++;
        addScore(sk, 10, G.mode.scoreMult);
        comboList(sk);
        G.farmer.gap = Math.min(160, G.farmer.gap + 2);
      }
    }
  }
}
