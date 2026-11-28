// farmer.js — Farmer Bram's AI state machine: chasing, searching,
// cornering, lunging, stunned and retreating. The HUD shows the state.
var FARMER_STATES = ['CHASING', 'SEARCHING', 'CORNERING', 'LUNGING', 'STUNNED', 'RETREAT'];

// Farmer — Bram's state: gap in metres behind Pipkin, current AI state,
// timers, and the telegraph the player sees before a lunge or a corner.
function Farmer(mode) {
  this.gap = mode.farmerGap;
  this.state = 'CHASING';
  this.stateT = 0;
  this.lungeCooldown = 4;
  this.lungeTelegraph = 0;
  this.cornerTelegraph = 0;
  this.searchSpot = 0;
  this.x = 0;
  this.y = 0;
}

// farmerSetState — switch Bram's state and reset its timer.
function farmerSetState(f, state) {
  if (f.state === state) return;
  f.state = state;
  f.stateT = 0;
}

// stepFarmerAI — one frame of Bram's brain: close the gap while chasing,
// pause and look around while searching, cut across at choke points,
// telegraph and fire a lunge, reel after a dodged lunge, and back off
// after Pipkin takes a hit so the escape stays fair.
function stepFarmerAI(f, dt, G) {
  f.stateT += dt;
  f.lungeCooldown = Math.max(0, f.lungeCooldown - dt);
  var turkey = G.turkey;
  // Bram creeps in slowly; good play (dodges, dashes, near misses)
  // pushes him back, so the gap is a skill meter, not a timer.
  var baseClose = 0.8;

  if (f.state === 'CHASING') {
    f.gap -= baseClose * dt * (G.mode.id === 'dash' ? 1.25 : 1);
    if (turkey.hidden) { farmerSetState(f, 'SEARCHING'); f.searchSpot = G.distance; }
    else if (G.cornerAhead && f.gap < 55) { farmerSetState(f, 'CORNERING'); f.cornerTelegraph = CFG.CORNER_TELEGRAPH; }
    else if (f.gap <= CFG.LUNGE_RANGE_M && f.lungeCooldown <= 0) {
      farmerSetState(f, 'LUNGING'); f.lungeTelegraph = CFG.LUNGE_TELEGRAPH;
    }
  } else if (f.state === 'SEARCHING') {
    f.gap -= 0.6 * dt;
    if (f.stateT > CFG.SEARCH_PAUSE) {
      if (turkey.hidden) {
        // Bram gives up: Pipkin stays hidden, gap grows.
        f.gap += 30;
        G.events.push('HIDDEN');
        farmerSetState(f, 'CHASING');
      } else {
        G.events.push('SPOTTED');
        farmerSetState(f, 'CHASING');
      }
    }
  } else if (f.state === 'CORNERING') {
    f.cornerTelegraph -= dt;
    f.gap -= 3.5 * dt;
    if (f.cornerTelegraph <= 0) {
      if (turkey.hidden || turkey.dashing) {
        f.gap += 18;
        G.events.push('CUT OFF DODGED');
      } else {
        G.events.push('CUT OFF');
        f.gap = Math.max(8, f.gap - 6);
      }
      farmerSetState(f, 'CHASING');
    }
  } else if (f.state === 'LUNGING') {
    f.lungeTelegraph -= dt;
    if (f.lungeTelegraph <= 0) {
      if (turkey.dashing || turkey.y < CFG.GROUND_Y - 60) {
        // Dodged the lunge: bonus, Bram reels.
        G.events.push('LUNGE DODGE');
        f.gap += 25;
        farmerSetState(f, 'STUNNED');
        f.lungeCooldown = CFG.LUNGE_COOLDOWN;
      } else if (turkey.hidden) {
        farmerSetState(f, 'SEARCHING');
        f.lungeCooldown = CFG.LUNGE_COOLDOWN;
      } else {
        G.events.push('LUNGE HIT');
        farmerSetState(f, 'CHASING');
        f.lungeCooldown = CFG.LUNGE_COOLDOWN;
      }
    }
  } else if (f.state === 'STUNNED') {
    f.gap += 6 * dt;
    if (f.stateT > CFG.LUNGE_STUN) farmerSetState(f, 'CHASING');
  } else if (f.state === 'RETREAT') {
    f.gap += 26 * dt;
    if (f.gap >= CFG.RETREAT_M || f.stateT > CFG.GRACE_AFTER_HIT) farmerSetState(f, 'CHASING');
  }

  // Dashing makes noise: Bram lunges sooner.
  if (turkey.dashing) f.lungeCooldown = Math.max(0, f.lungeCooldown - dt * 2);
  // A slow, tired turkey lets Bram close in.
  if (G.speedM < G.mode.speed * 0.7) f.gap -= 1.5 * dt;
  f.gap = Math.max(0, Math.min(160, f.gap));
}

// checkFarmerCatch — true when Bram finally grabs Pipkin.
function checkFarmerCatch(f, turkey) {
  if (turkey.hidden) return false;
  return f.gap <= 0;
}

// farmerScreenX — Bram's screen x from his gap in metres.
function farmerScreenX(f) {
  return CFG.TURKEY_X - f.gap * CFG.PX_PER_M * 0.55;
}
