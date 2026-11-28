// scoring.js — score and combo: the score keeper, adding score,
// the combo ladder, and the combo countdown.
function ScoreKeeper() {
  this.score = 0;
  this.combo = 1;
  this.comboTimer = 0;
  this.maxCombo = 1;
  this.corn = 0;
  this.feathers = 0;
  this.shieldsEarned = 0;
  this.nearMisses = 0;
  this.dodges = 0;
  this.lungeDodges = 0;
  this.distanceScore = 0;
}

// addScore — add a base amount times the current combo; refreshes the
// combo timer and returns the points actually added.
function addScore(sk, base, mult) {
  var pts = Math.round(base * sk.combo * (mult || 1));
  sk.score += pts;
  sk.comboTimer = CFG.COMBO_WINDOW;
  return pts;
}

// comboList — the combo ladder: combo grows one step per scoring event.
function comboList(sk) {
  sk.combo = Math.min(CFG.COMBO_MAX, sk.combo + 1);
  if (sk.combo > sk.maxCombo) sk.maxCombo = sk.combo;
}

// comboCountdown — tick the combo timer down; it resets at zero.
function comboCountdown(sk, dt) {
  if (sk.comboTimer > 0) {
    sk.comboTimer -= dt;
    if (sk.comboTimer <= 0) {
      sk.combo = 1;
      sk.comboTimer = 0;
    }
  }
}

// resetCombo — a hit or a spotting wipes the combo back to x1.
function resetCombo(sk) {
  sk.combo = 1;
  sk.comboTimer = 0;
}

// endBonuses — the end-of-run bonus breakdown for the end screen.
function endBonuses(sk, heartsLeft, escaped) {
  var heartBonus = heartsLeft * 250;
  var comboBonus = sk.maxCombo * 100;
  var escapeBonus = escaped ? 1500 : 0;
  return {
    distance: sk.distanceScore,
    corn: sk.corn * 25,
    heartBonus: heartBonus,
    comboBonus: comboBonus,
    escapeBonus: escapeBonus,
    total: sk.score + heartBonus + comboBonus + escapeBonus
  };
}
