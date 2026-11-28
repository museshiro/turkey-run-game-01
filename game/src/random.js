// random.js — seeded random number generator so screenshot runs
// are deterministic: the same seed always builds the same frame.
function makeRng(seed) {
  var s = (seed >>> 0) || 1;
  return function () {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    var t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// rngRange — a random float between a and b from the given RNG.
function rngRange(rng, a, b) {
  return a + rng() * (b - a);
}

// rngInt — a random integer between a and b inclusive from the given RNG.
function rngInt(rng, a, b) {
  return a + Math.floor(rng() * (b - a + 1));
}

// rngPick — a random element of an array from the given RNG.
function rngPick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

// rngChance — true with the given probability from the given RNG.
function rngChance(rng, p) {
  return rng() < p;
}
