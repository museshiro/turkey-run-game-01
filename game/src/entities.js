// Pipkin's Great Escape — the living parts: Pipkin's run/jump/slide physics,
// Farmer Bram's chase/search/sprint AI, hazards, pickups, collisions and
// the score. Pure logic; Art draws it, main.js drives it.
'use strict';

const TURKEY_X = 210;
const GRAVITY = 2300;
const JUMP_V = 820;

function makeTurkey() {
  return {
    y: GROUND_Y, vy: 0, grounded: true, sliding: false, slideT: 0,
    runPhase: 0, invulnT: 0, blink: 0, hidden: false, shield: false,
    width: 52, height: 62,
  };
}

function makeFarmer(cfg) {
  return {
    x: TURKEY_X - cfg.farmerGapStart, gap: cfg.farmerGapStart,
    runPhase: 0, state: 'chase', searchT: 0, searchClock: 0,
    spotted: false, sprintT: 0,
  };
}

function makeRun(cfg, seed) {
  return {
    cfg, seed,
    rng: makeRng(seed),
    turkey: makeTurkey(),
    farmer: makeFarmer(cfg),
    obstacles: [], pickups: [],
    distance: 0, score: 0, corn: 0, lives: cfg.lives,
    speed: cfg.baseSpeed,
    nextSpawnAt: 420,
    stageIdx: 0, stageBannerT: 0, stageBanner: '',
    shakeT: 0, flashT: 0, time: 0,
    caught: false, escaped: false, gateX: -1,
    message: '', messageT: 0,
  };
}

function turkeyHitbox(t) {
  if (t.sliding) return { x: TURKEY_X - 26, y: t.y - 34, w: 56, h: 34 };
  return { x: TURKEY_X - 24, y: t.y - 62, w: 48, h: 62 };
}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function spawnCluster(run) {
  const { cluster, gap } = World.nextCluster(run.rng, run.cfg, run.distance);
  for (const s of cluster) {
    if (s.type === 'corn' || s.type === 'gravy') run.pickups.push({ ...s, taken: false, bob: 0 });
    else run.obstacles.push({ ...s, hit: false, passed: false });
  }
  run.nextSpawnAt = run.distance + gap;
}

function hurtTurkey(run, cause) {
  const t = run.turkey;
  if (t.invulnT > 0 || run.caught || run.escaped) return;
  if (t.shield) {
    t.shield = false;
    t.invulnT = 1.2;
    run.message = 'GRAVY SHIELD SAVED YOU!';
    run.messageT = 1.4;
    SoundBank.thud();
    return;
  }
  run.lives -= 1;
  t.invulnT = 1.6;
  run.shakeT = 0.35;
  run.flashT = 0.25;
  // The farmer lunges closer on every stumble.
  run.farmer.gap = Math.max(40, run.farmer.gap - run.cfg.farmerCatchUp * 2.2);
  run.message = cause === 'oven' ? 'TOO HOT! The oven singed your tail!' : 'OUCH! The carving knife nicked you!';
  run.messageT = 1.4;
  SoundBank.thud();
  if (run.lives <= 0) {
    run.caught = true;
    SoundBank.caught();
  }
}

// One fixed step of the run. Returns 'caught' | 'escaped' | 'playing'.
function stepRun(run, dt, input) {
  const cfg = run.cfg;
  const t = run.turkey;
  const f = run.farmer;
  run.time += dt;

  // Speed ramps with distance, capped per variant.
  run.speed = Math.min(cfg.topSpeed, cfg.baseSpeed + run.distance * cfg.accel * 0.01);
  run.distance += (run.speed * dt) / 10;
  run.score += run.speed * dt * 0.02 * cfg.scoreMult;

  // Stage changes announce themselves.
  const si = stageIndexAt(run.distance);
  if (si !== run.stageIdx) {
    run.stageIdx = si;
    run.stageBanner = stageAt(run.distance).name;
    run.stageBannerT = 2.2;
    run.message = 'STAGE: ' + run.stageBanner;
    run.messageT = 2.2;
    SoundBank.gobble();
  }
  if (run.stageBannerT > 0) run.stageBannerT -= dt;
  if (run.messageT > 0) run.messageT -= dt;
  if (run.shakeT > 0) run.shakeT -= dt;
  if (run.flashT > 0) run.flashT -= dt;
  if (t.invulnT > 0) t.invulnT -= dt;

  // --- Turkey controls ---
  const wantJump = input.wasPressed(' ', 'ArrowUp', 'w', 'W');
  const wantSlide = input.isDown('ArrowDown', 's', 'S');
  if (wantJump && t.grounded && !t.sliding) {
    t.vy = -JUMP_V;
    t.grounded = false;
    t.sliding = false;
    SoundBank.jump();
  }
  if (!t.grounded) {
    t.vy += GRAVITY * dt;
    t.y += t.vy * dt;
    if (t.y >= GROUND_Y) { t.y = GROUND_Y; t.vy = 0; t.grounded = true; }
  }
  if (wantSlide && t.grounded) {
    if (!t.sliding) t.slideT = 0;
    t.sliding = true;
    t.slideT += dt;
  } else if (t.sliding) {
    t.sliding = false;
  }
  t.runPhase += dt * (run.speed / 40);
  t.blink = f.gap < 90 ? (Math.sin(run.time * 14) > 0 ? 1 : 0) : 0;

  // Hiding (variant B): hold Down while overlapping a hay bale.
  const wasHidden = t.hidden;
  t.hidden = false;
  if (cfg.hideEnabled && t.sliding) {
    const box = turkeyHitbox(t);
    for (const o of run.obstacles) {
      if (o.type === 'hay' && overlaps(box, { x: o.x - 6, y: GROUND_Y - o.h - 6, w: o.w + 12, h: o.h + 6 })) {
        t.hidden = true;
        break;
      }
    }
  }
  if (t.hidden && !wasHidden) SoundBank.rustle();
  if (t.hidden) run.score += 6 * dt * cfg.scoreMult; // sneaking pays a little

  // --- Farmer AI ---
  f.runPhase += dt * (run.speed / 38);
  f.searchClock += dt;
  if (f.state === 'search') {
    f.searchT -= dt;
    // He scans the field; if Pipkin is out in the open and close, he spots him.
    if (!t.hidden && t.grounded && !t.sliding) {
      f.spotted = true;
      f.state = 'sprint';
      f.sprintT = 1.6;
      SoundBank.alarm();
      run.message = 'SPOTTED! RUN!';
      run.messageT = 1.2;
    } else if (f.searchT <= 0) {
      f.state = 'chase';
      f.spotted = false;
      run.message = 'He lost your trail...';
      run.messageT = 1.2;
    }
  } else if (f.state === 'sprint') {
    f.sprintT -= dt;
    f.gap = Math.max(46, f.gap - 190 * dt);
    if (f.sprintT <= 0) { f.state = 'chase'; f.spotted = false; }
  } else {
    // Chase: the gap breathes — it grows when you run clean, shrinks when
    // you stumble. Near the end he corners you and pushes harder.
    const endgame = run.distance > ESCAPE_DISTANCE - 260;
    const drift = endgame ? -14 : 9;
    f.gap = Math.min(cfg.farmerGapStart + 60, Math.max(46, f.gap + drift * dt));
    if (cfg.farmerSearchEvery > 0 && f.searchClock >= cfg.farmerSearchEvery) {
      f.searchClock = 0;
      f.state = 'search';
      f.searchT = 2.4;
      run.message = 'Bram is searching... HIDE!';
      run.messageT = 1.6;
      SoundBank.alarm();
    }
  }
  f.x = TURKEY_X - f.gap;
  if (f.gap <= 46 && !run.caught) {
    run.lives = 0;
    run.caught = true;
    SoundBank.caught();
  }

  // --- Spawning ---
  if (run.distance >= run.nextSpawnAt && run.distance < ESCAPE_DISTANCE - 120) spawnCluster(run);
  if (run.distance >= ESCAPE_DISTANCE - 120 && run.gateX < 0) run.gateX = GAME_W + 120;

  // --- Move + collide obstacles ---
  const tb = turkeyHitbox(t);
  for (const o of run.obstacles) {
    if (o.type === 'knifeFall') {
      o.y += o.vy * dt;
      o.x -= run.speed * dt * 0.55;
    } else {
      o.x -= run.speed * dt;
    }
    if (o.x < -120 || o.y > GAME_H + 40) continue;
    if (!o.passed && o.x + (o.w || 60) < TURKEY_X - 30) {
      o.passed = true;
      run.score += 15 * cfg.scoreMult;
    }
    if (o.hit || t.invulnT > 0) continue;
    let box;
    if (o.type === 'oven') box = { x: o.x + 4, y: GROUND_Y - o.h, w: o.w - 8, h: o.h };
    else if (o.type === 'hay') box = { x: o.x + 4, y: GROUND_Y - o.h, w: o.w - 8, h: o.h };
    else if (o.type === 'knifeSlide') box = { x: o.x - 40, y: GROUND_Y - 16, w: 80, h: 16 };
    else box = { x: o.x - 26, y: o.y - 6, w: 52, h: 12 };
    if (overlaps(tb, box)) {
      o.hit = true;
      // A sliding turkey ducks clean under a low knife.
      if (o.type === 'knifeSlide' && t.sliding) { run.score += 25 * cfg.scoreMult; continue; }
      hurtTurkey(run, o.type === 'oven' ? 'oven' : 'knife');
    }
  }
  run.obstacles = run.obstacles.filter((o) => o.x > -160 && o.y < GAME_H + 60);

  // --- Pickups ---
  for (const p of run.pickups) {
    p.x -= run.speed * dt;
    p.bob = Math.sin(run.time * 5 + p.x * 0.02) * 4;
    if (p.taken || p.x < -40) continue;
    const pb = { x: p.x - 16, y: p.y - 18, w: 32, h: 36 };
    if (overlaps(tb, pb)) {
      p.taken = true;
      if (p.type === 'corn') {
        run.corn += 1;
        run.score += 50 * cfg.scoreMult;
        SoundBank.corn();
      } else {
        t.shield = true;
        run.message = 'GRAVY SHIELD! One free hit.';
        run.messageT = 1.4;
        SoundBank.corn();
      }
    }
  }
  run.pickups = run.pickups.filter((p) => !p.taken && p.x > -60);

  // --- The freedom gate ---
  if (run.gateX >= 0) {
    run.gateX -= run.speed * dt;
    if (run.gateX <= TURKEY_X + 30 && !run.escaped) {
      run.escaped = true;
      run.score += 1000;
      SoundBank.fanfare();
    }
  }

  if (run.caught) return 'caught';
  if (run.escaped) return 'escaped';
  return 'playing';
}
