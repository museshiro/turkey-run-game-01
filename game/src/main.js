// main.js — boot, game loop, screen state machine (title, playing,
// pause, end), and dispatch to screenshot mode.
var canvas = null;
var ctx = null;
var G = null;
var shotParams = null;

// newGame — a fresh run state for a mode id.
function newGame(modeId, seed) {
  var mode = MODES[modeId] || MODES.escape;
  var st = {
    screen: 'title',
    mode: mode,
    score: new ScoreKeeper(),
    farmer: new Farmer(mode),
    turkey: new Turkey(),
    hazards: [],
    props: [],
    floaters: new FloaterLayer(),
    world: buildWorld(seed || 20261128),
    distance: 0,
    speedM: mode.speed,
    hearts: mode.hearts,
    dashPips: CFG.DASH_PIPS,
    shield: false,
    magnetT: 0,
    hint: null,
    zoneBannerT: 0,
    zoneIdx: 0,
    time: 0,
    events: [],
    end: null,
    frozen: false,
    cornerAhead: false,
    best: 0,
    prevRun: '',
    demo: false
  };
  try {
    st.best = parseInt(window.localStorage.getItem('pipkin_best') || '0', 10) || 0;
    st.prevRun = window.localStorage.getItem('pipkin_prev') || '';
  } catch (e) {}
  return st;
}

// applyHit — Pipkin takes a hit: shield blocks it, otherwise a heart
// breaks, the combo resets, and Bram backs off to keep it fair.
function applyHit(G) {
  var t = G.turkey;
  if (G.shield) {
    G.shield = false;
    t.iframes = CFG.HIT_IFRAMES;
    spawnFloatText(G.floaters, 'SHIELD BLOCK!', t.x, t.y - 80, '#7ad0ff', true);
    spawnSparkBurst(G.floaters, t.x, t.y, '#7ad0ff', 14);
    AudioSys.playShield();
    farmerSetState(G.farmer, 'STUNNED');
    return;
  }
  G.hearts -= 1;
  t.iframes = CFG.HIT_IFRAMES;
  resetCombo(G.score);
  G.farmer.gap = Math.min(160, G.farmer.gap + CFG.RETREAT_M);
  farmerSetState(G.farmer, 'RETREAT');
  spawnFloatText(G.floaters, 'HIT!', t.x, t.y - 80, '#ff6a5a', true);
  spawnSparkBurst(G.floaters, t.x, t.y, '#ff6a5a', 12);
  AudioSys.playHit();
  if (G.hearts <= 0) G.events.push('CAUGHT');
}

// processEvents — turn farmer and collision events into score,
// floating text and sound.
function processEvents(G) {
  var sk = G.score;
  var t = G.turkey;
  while (G.events.length) {
    var ev = G.events.shift();
    if (ev === 'LUNGE DODGE') {
      var pts = addScore(sk, 25, G.mode.scoreMult);
      comboList(sk);
      sk.lungeDodges++;
      spawnFloatText(G.floaters, 'LUNGE DODGE +' + pts, t.x + 60, t.y - 80, '#7ad05a', true);
      spawnSparkBurst(G.floaters, t.x, t.y - 20, '#7ad05a', 10);
    } else if (ev === 'LUNGE HIT') {
      applyHit(G);
    } else if (ev === 'SPOTTED') {
      resetCombo(sk);
      G.farmer.gap = Math.max(4, G.farmer.gap - 10);
      spawnFloatText(G.floaters, 'SPOTTED!', t.x, t.y - 80, '#ff6a5a', true);
      AudioSys.playSpotted();
    } else if (ev === 'HIDDEN') {
      var hp = addScore(sk, G.mode.id === 'hide' ? 40 : 20, G.mode.scoreMult);
      spawnFloatText(G.floaters, 'HIDDEN! +' + hp, t.x, t.y - 80, '#7ad05a', true);
    } else if (ev === 'CUT OFF') {
      spawnFloatText(G.floaters, 'CUT OFF!', t.x + 80, t.y - 90, '#ff6a5a', true);
    } else if (ev === 'CUT OFF DODGED') {
      var cp = addScore(sk, 10, G.mode.scoreMult);
      spawnFloatText(G.floaters, 'CUT OFF DODGED +' + cp, t.x + 60, t.y - 80, '#ffd23a');
    } else if (ev === 'CAUGHT') {
      endGame(G, false);
    }
  }
}

// spawnTick — hazard, corn, feather and power-up spawning.
function spawnTick(G, dt) {
  var w = G.world;
  var zoneIdx = zoneIndexForDistance(G.distance);
  var density = ZONE_TABLE[zoneIdx].density * G.mode.density;
  w.spawnTimer -= dt;
  if (w.spawnTimer <= 0) {
    var kind = pickSpawnKind(w, spawnTableForZone(zoneIdx, G.mode.id));
    G.hazards.push(makeHazard(kind, CFG.W + 80, w.rng));
    w.spawnTimer = rngRange(w.rng, 1.0, 1.9) / density;
  }
  w.cornArcTimer -= dt;
  if (w.cornArcTimer <= 0) {
    var bx = CFG.W + 60;
    for (var i = 0; i < 4; i++) {
      var c = makeHazard('corn', bx + i * 34, w.rng);
      c.y = CFG.GROUND_Y - 60 - Math.sin(i / 3 * Math.PI) * 46;
      G.hazards.push(c);
    }
    w.cornArcTimer = rngRange(w.rng, 3.5, 6);
  }
  w.featherTimer -= dt;
  if (w.featherTimer <= 0) {
    G.hazards.push(makeHazard('feather', CFG.W + 60, w.rng));
    w.featherTimer = rngRange(w.rng, 8, 13);
  }
  w.powerTimer -= dt;
  if (w.powerTimer <= 0) {
    var pk = rngPick(w.rng, ['boat', 'magnet', 'decoy']);
    G.hazards.push(makeHazard(pk, CFG.W + 60, w.rng));
    w.powerTimer = rngRange(w.rng, 20, 28);
  }
}

// stepGame — one fixed update step of the run.
function stepGame(G, dt, input) {
  if (G.screen !== 'playing' && G.screen !== 'attract') return;
  G.time += dt;
  var mode = G.mode;
  // speed recovers toward the mode's base speed
  G.speedM += (mode.speed - G.speedM) * dt * 1.2;
  G.dashPips = Math.min(CFG.DASH_PIPS, G.dashPips + dt / CFG.DASH_RECHARGE);
  G.magnetT = Math.max(0, G.magnetT - dt);
  var scrollPx = worldScrollSpeed(G);
  G.world.scrollX += scrollPx * dt;
  var runSpeed = G.speedM * (G.turkey.dashing ? CFG.DASH_BOOST : 1);
  G.distance += runSpeed * dt;
  G.score.distanceScore = Math.floor(G.distance);
  G.score.score += runSpeed * dt;
  stepTurkey(G.turkey, dt, input, G);
  stepHazards(G, dt, scrollPx);
  checkCollisions(G);
  stepFarmerAI(G.farmer, dt, G);
  comboCountdown(G.score, dt);
  stepFloaters(G.floaters, dt);
  G.zoneBannerT = Math.max(0, G.zoneBannerT - dt);
  var zi = zoneIndexForDistance(G.distance);
  if (zi !== G.zoneIdx) {
    G.zoneIdx = zi;
    G.zoneBannerT = 2.2;
    AudioSys.playGobble();
  }
  G.cornerAhead = (zi === 2 || zi === 4) && zoneProgress(G.distance) > 0.8;
  // contextual hint
  G.hint = null;
  if (G.turkey.nearHay) G.hint = 'HOLD DUCK to hide';
  else {
    for (var i = 0; i < G.hazards.length; i++) {
      var h = G.hazards[i];
      if (h.kind === 'slider' && h.x > G.turkey.x && h.x < G.turkey.x + 200) { G.hint = 'JUMP the knife!'; break; }
      if (h.kind === 'faller' && h.x > G.turkey.x - 40 && h.x < G.turkey.x + 160) { G.hint = 'DUCK under it!'; break; }
      if (h.kind === 'oven' && h.x > G.turkey.x && h.x < G.turkey.x + 260) { G.hint = '350° OVEN — JUMP!'; break; }
    }
  }
  if (!G.demo) spawnTick(G, dt);
  processEvents(G);
  if (G.screen === 'playing' || G.screen === 'attract') {
    if (G.distance >= CFG.ESCAPE_M) { endGame(G, true); return; }
    if (checkFarmerCatch(G.farmer, G.turkey)) { endGame(G, false); return; }
  }
}

// endGame — build the end screen state and save best / previous run.
function endGame(G, escaped) {
  if (G.screen === 'end') return;
  var bonuses = endBonuses(G.score, Math.max(0, G.hearts), escaped);
  var total = bonuses.total;
  var best = Math.max(G.best, total);
  var prev = (escaped ? 'ESCAPED' : 'CAUGHT') + ' at ' + Math.floor(G.distance) + ' m — score ' + Math.floor(total);
  try {
    window.localStorage.setItem('pipkin_best', String(Math.floor(best)));
    window.localStorage.setItem('pipkin_prev', 'Previous run: ' + prev);
  } catch (e) {}
  G.end = {
    escaped: escaped,
    distance: G.distance,
    heartsLeft: Math.max(0, G.hearts),
    best: best,
    prevRun: G.prevRun ? G.prevRun : '',
    bonuses: bonuses
  };
  G.screen = 'end';
  AudioSys.stopMusic();
  if (escaped) AudioSys.playFanfare(); else AudioSys.playCaught();
}

// drawHazard — one hazard or pickup on the canvas.
function drawHazard(ctx, h, t) {
  switch (h.kind) {
    case 'pumpkin': drawPumpkin(ctx, h.x, h.y, 1, true); break;
    case 'mud':
      ctx.fillStyle = '#6a4a22';
      ctx.beginPath(); ctx.ellipse(h.x, CFG.GROUND_Y + 2, 46, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#8a5a2b';
      ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('MUD', h.x, CFG.GROUND_Y + 5);
      break;
    case 'gravy':
      ctx.fillStyle = '#c98a3a';
      ctx.beginPath(); ctx.ellipse(h.x, CFG.GROUND_Y + 2, 42, 5, 0, 0, Math.PI * 2); ctx.fill();
      break;
    case 'hay': drawHay(ctx, h.x, h.y, 1); break;
    case 'slider': drawKnife(ctx, h.x, h.y, 1, Math.PI / 2, 0); break;
    case 'faller':
      if (h.telegraph > 0) {
        ctx.fillStyle = '#e02020';
        ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('!', h.x, h.y - 30);
        drawKnife(ctx, h.x, h.y, 1, 0, Math.sin(t * 30) * 0.15);
      } else {
        drawKnife(ctx, h.x, h.y, 1, 0, 0);
      }
      break;
    case 'oven': drawOven(ctx, h.x, h.y, 1, t); break;
    case 'cart': drawCart(ctx, h.x, h.y, 1); break;
    case 'corn': drawCorn(ctx, h.x, h.y, 1, t); break;
    case 'feather': drawFeather(ctx, h.x, h.y, 1, t); break;
    case 'boat': drawGravyBoat(ctx, h.x, h.y, 1, t); break;
    case 'magnet':
      ctx.fillStyle = '#e02020';
      ctx.beginPath(); ctx.arc(h.x, h.y, 12, Math.PI, 0); ctx.fill();
      ctx.fillRect(h.x - 12, h.y, 6, 12);
      ctx.fillRect(h.x + 6, h.y, 6, 12);
      ctx.fillStyle = '#fff';
      ctx.fillRect(h.x - 12, h.y + 8, 6, 4);
      ctx.fillRect(h.x + 6, h.y + 8, 6, 4);
      break;
    case 'decoy': drawPumpkin(ctx, h.x, h.y, 1, true); break;
  }
}

// renderFrame — draw one full frame for the current screen.
function renderFrame(G) {
  var zone = zoneForDistance(G.distance);
  drawBackground(ctx, zone, G.world.scrollX, G.time);
  drawGround(ctx, zone, G.world.scrollX, G.time);
  // props (table, scarecrow) and the Freedom Gate
  for (var i = 0; i < G.props.length; i++) {
    var p = G.props[i];
    if (p.kind === 'table') drawTable(ctx, p.x, CFG.GROUND_Y, 1);
    else if (p.kind === 'scarecrow') drawScarecrow(ctx, p.x, CFG.GROUND_Y, 1, G.time);
  }
  if (G.distance > 1420) {
    var gx = CFG.TURKEY_X + (CFG.ESCAPE_M - G.distance) * CFG.PX_PER_M;
    drawGate(ctx, gx, CFG.GROUND_Y, 1, G.time);
  }
  for (var j = 0; j < G.hazards.length; j++) drawHazard(ctx, G.hazards[j], G.time);
  // farmer
  var fx = farmerScreenX(G.farmer);
  if (fx > -80 && G.screen !== 'end') {
    drawFarmer(ctx, fx, CFG.GROUND_Y - 34, 1, G.farmer.state, G.time);
  }
  // turkey
  var tk = G.turkey;
  var pose = tk.hidden ? 'hide' : tk.ducking ? 'duck' : !tk.onGround ? 'jump' : 'run';
  if (!(tk.iframes > 0 && Math.floor(G.time * 12) % 2 === 0)) {
    drawTurkey(ctx, tk.x, tk.y, 1, pose, G.time, tk.hidden);
  }
  if (G.shield) {
    ctx.save();
    ctx.strokeStyle = 'rgba(122,208,255,0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(tk.x, tk.y - 6, 42, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  if (G.screen === 'end') {
    drawEndBackdrop(ctx, G);
    drawEndScreen(ctx, G);
  } else {
    drawHUD(ctx, G);
    if (G.screen === 'attract') drawAttractOverlay(ctx, G);
    if (G.screen === 'paused') {
      ctx.save();
      ctx.fillStyle = 'rgba(20,10,6,0.6)';
      ctx.fillRect(0, 0, CFG.W, CFG.H);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 44px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('PAUSED', CFG.W / 2, 250);
      ctx.font = '16px sans-serif';
      ctx.fillText('Press P or click II to resume', CFG.W / 2, 284);
      ctx.restore();
    }
  }
  // Floating feedback draws last so it stays readable over the HUD
  // and, on the attract screen, over the title overlay.
  drawFloaters(ctx, G.floaters);
}

// drawEndBackdrop — woods, confetti leaves, Pipkin and Bram in the
// distance behind the end screen panel.
function drawEndBackdrop(ctx, G) {
  var g = ctx.createLinearGradient(0, 0, 0, CFG.H);
  g.addColorStop(0, '#2a5a2a');
  g.addColorStop(1, '#7a8a3a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CFG.W, CFG.H);
  // trees
  for (var i = 0; i < 7; i++) {
    var tx = 40 + i * 140;
    ctx.fillStyle = '#4a3a22';
    ctx.fillRect(tx - 6, 300, 12, 152);
    ctx.fillStyle = i % 2 ? '#3a6a2a' : '#2a5a22';
    ctx.beginPath(); ctx.moveTo(tx - 55, 310); ctx.lineTo(tx, 180); ctx.lineTo(tx + 55, 310); ctx.closePath(); ctx.fill();
  }
  drawGround(ctx, ZONE_TABLE[0], 0, G.time);
  // Pipkin safe in the woods, Bram far away staring at an empty oven
  drawTurkey(ctx, 130, CFG.GROUND_Y - 26, 1.1, 'run', G.time, false);
  drawFarmer(ctx, 850, CFG.GROUND_Y - 34, 0.9, 'STUNNED', G.time);
  drawOven(ctx, 800, CFG.GROUND_Y, 0.7, G.time);
  // autumn confetti
  var rng = makeRng(4242);
  var cols = ['#e8721e', '#ffd23a', '#c0392b', '#e8a020'];
  for (var j = 0; j < 26; j++) {
    ctx.fillStyle = cols[j % 4];
    ctx.save();
    ctx.translate(rng() * CFG.W, 60 + rng() * 300);
    ctx.rotate(rng() * Math.PI);
    ctx.fillRect(-4, -2, 9, 5);
    ctx.restore();
  }
}

// startRun — begin a fresh run in the chosen mode.
function startRun(modeId) {
  var seed = (Date.now() % 100000) | 0;
  var keepBest = G ? G.best : 0;
  var keepPrev = G ? G.prevRun : '';
  G = newGame(modeId, seed);
  G.best = keepBest;
  G.prevRun = keepPrev;
  G.screen = 'playing';
  AudioSys.init();
  AudioSys.startMusic(1);
}

// onKeyAction — one named key action from keyboard or touch.
function onKeyAction(action) {
  if (!G) return;
  if (action === 'mute') { AudioSys.init(); AudioSys.toggleMute(); return; }
  if (G.screen === 'title' || G.screen === 'attract') {
    if (action === 'enter') startRun(G.mode.id);
    else if (action === 'mode0') G.mode = MODES.escape;
    else if (action === 'mode1') G.mode = MODES.dash;
    else if (action === 'mode2') G.mode = MODES.hide;
    return;
  }
  if (G.screen === 'playing') {
    if (action === 'jump') { Input.jumpHeld = true; setTimeout(function () { Input.jumpHeld = false; }, 120); }
    else if (action === 'dash') Input.dashQueued = true;
    else if (action === 'pause') { G.screen = 'paused'; AudioSys.stopMusic(); }
    return;
  }
  if (G.screen === 'paused') {
    if (action === 'pause' || action === 'enter') { G.screen = 'playing'; AudioSys.startMusic(G.zoneIdx + 1); }
    return;
  }
  if (G.screen === 'end') {
    if (action === 'enter') startRun(G.mode.id);
    return;
  }
}

// onTapAction — pointer down/up on the canvas.
function onTapAction(x, y, down) {
  if (!G) return;
  if (!down) {
    if (G.screen === 'playing') { Input.duckHeld = false; Input.hideHeld = false; }
    return;
  }
  if (hitRect(MuteButton, x, y)) { AudioSys.init(); AudioSys.toggleMute(); return; }
  if (hitRect(PauseButton, x, y)) {
    if (G.screen === 'playing') { G.screen = 'paused'; AudioSys.stopMusic(); }
    else if (G.screen === 'paused') { G.screen = 'playing'; AudioSys.startMusic(G.zoneIdx + 1); }
    return;
  }
  if (G.screen === 'title' || G.screen === 'attract') {
    for (var i = 0; i < ModeChips.length; i++) {
      if (hitRect(ModeChips[i], x, y)) { startRun(ModeChips[i].id); return; }
    }
    return;
  }
  if (G.screen === 'playing') {
    var b = buttonAt(x, y);
    if (b === 'jump') { Input.jumpHeld = true; setTimeout(function () { Input.jumpHeld = false; }, 120); }
    else if (b === 'duck') { Input.duckHeld = true; }
    else if (b === 'dash') Input.dashQueued = true;
    else if (b === 'hide') { Input.hideHeld = true; Input.duckHeld = true; }
    return;
  }
  if (G.screen === 'end') {
    if (hitRect(EndButtons.again, x, y)) { startRun(G.mode.id); return; }
    if (hitRect(EndButtons.title, x, y)) {
      var keepBest = G.best;
      var keepPrev = G.prevRun;
      G = newGame(G.mode.id, 20261128);
      G.best = keepBest;
      G.prevRun = keepPrev;
      G.screen = 'attract';
      return;
    }
  }
}

// gameLoop — requestAnimationFrame loop; the attract demo runs an
// autopilot behind the title screen.
function gameLoop(ts) {
  requestAnimationFrame(gameLoop);
  if (!G || G.frozen) return;
  var dt = Math.min(0.05, 1 / 60);
  if (G.screen === 'attract') {
    stepGame(G, dt, autopilotInput(G));
    if (G.screen === 'end' || checkFarmerCatch(G.farmer, G.turkey)) {
      var keepBest = G.best, keepPrev = G.prevRun;
      var demoMode = G.mode.id;
      G = newGame(demoMode, (Math.random() * 100000) | 0);
      G.best = keepBest; G.prevRun = keepPrev;
      G.screen = 'attract';
      G.demo = true;
    }
  } else if (G.screen === 'playing') {
    var input = {
      jumpHeld: Input.jumpHeld,
      duckHeld: Input.duckHeld,
      dashQueued: Input.dashQueued,
      hideHeld: Input.hideHeld
    };
    Input.dashQueued = false;
    stepGame(G, dt, input);
  }
  renderFrame(G);
}

// boot — wire the canvas, build the attract demo, dispatch to
// screenshot mode when the URL asks for a shot.
function boot() {
  canvas = document.getElementById('game');
  ctx = canvas.getContext('2d');
  shotParams = readShotParams();
  if (shotParams.shot) {
    G = newGame(shotParams.mode, shotParams.seed);
    G.screen = 'playing';
    G.demo = true;
    var ok = initShotMode(G, shotParams);
    if (!ok) {
      document.title = 'SHOT FAILED';
      window.__SHOT_FAILED = true;
    }
    return;
  }
  G = newGame('escape', 20261128);
  G.screen = 'attract';
  G.demo = true;
  initInput(canvas, onKeyAction, onTapAction);
  requestAnimationFrame(gameLoop);
}

window.addEventListener('load', boot);
