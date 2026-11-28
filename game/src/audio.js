// audio.js — synthetic WebAudio sounds (banjo music, gobble, knife
// whoosh, oven roar, shield clang, escape fanfare). Audio never starts
// in screenshot mode. No audio files, no network.
var AudioSys = {
  ctx: null,
  muted: false,
  musicTimer: null,
  musicStep: 0,
  enabled: true,

  init: function () {
    if (this.ctx || !this.enabled) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
    } catch (e) { this.ctx = null; }
  },

  toggleMute: function () {
    this.muted = !this.muted;
    return this.muted;
  },

  tone: function (freq, dur, type, vol, slideTo) {
    if (!this.ctx || this.muted) return;
    try {
      var t = this.ctx.currentTime;
      var o = this.ctx.createOscillator();
      var g = this.ctx.createGain();
      o.type = type || 'square';
      o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
      g.gain.setValueAtTime(vol || 0.08, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(this.ctx.destination);
      o.start(t); o.stop(t + dur + 0.02);
    } catch (e) {}
  },

  noise: function (dur, vol, low) {
    if (!this.ctx || this.muted) return;
    try {
      var t = this.ctx.currentTime;
      var len = Math.floor(this.ctx.sampleRate * dur);
      var buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      var src = this.ctx.createBufferSource();
      src.buffer = buf;
      var f = this.ctx.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = low || 1200;
      var g = this.ctx.createGain();
      g.gain.setValueAtTime(vol || 0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      src.connect(f); f.connect(g); g.connect(this.ctx.destination);
      src.start(t);
    } catch (e) {}
  },

  playGobble: function () {
    this.tone(320, 0.09, 'sawtooth', 0.09, 180);
    var self = this;
    setTimeout(function () { self.tone(280, 0.09, 'sawtooth', 0.09, 150); }, 90);
    setTimeout(function () { self.tone(360, 0.14, 'sawtooth', 0.1, 200); }, 180);
  },

  playJump: function () { this.tone(300, 0.16, 'sine', 0.07, 620); },
  playKnife: function () { this.noise(0.22, 0.14, 3200); this.tone(900, 0.18, 'sine', 0.05, 300); },
  playOven: function () { this.noise(0.5, 0.1, 500); },
  playShield: function () { this.tone(520, 0.12, 'triangle', 0.12); this.tone(780, 0.2, 'triangle', 0.1); },
  playHit: function () { this.tone(180, 0.3, 'sawtooth', 0.14, 60); this.noise(0.2, 0.12, 800); },
  playSpotted: function () { this.tone(880, 0.1, 'square', 0.1); this.tone(660, 0.16, 'square', 0.1); },
  playPickup: function () { this.tone(660, 0.08, 'sine', 0.08, 990); },
  playHidden: function () { this.tone(440, 0.2, 'sine', 0.06, 330); },
  playFanfare: function () {
    var self = this;
    var notes = [523, 659, 784, 1047, 784, 1047];
    notes.forEach(function (n, i) {
      setTimeout(function () { self.tone(n, 0.22, 'triangle', 0.12); }, i * 130);
    });
  },
  playCaught: function () {
    var self = this;
    [392, 330, 262, 196].forEach(function (n, i) {
      setTimeout(function () { self.tone(n, 0.3, 'sawtooth', 0.1); }, i * 160);
    });
  },

  // startMusic — a simple banjo-ish hoedown loop; tempo rises per zone.
  startMusic: function (zoneN) {
    if (!this.ctx || this.muted || this.musicTimer) return;
    var self = this;
    var riff = [262, 330, 392, 330, 294, 330, 392, 494, 392, 330, 294, 262];
    var stepMs = Math.max(120, 210 - (zoneN - 1) * 22);
    this.musicTimer = setInterval(function () {
      if (self.muted || !self.ctx) return;
      var n = riff[self.musicStep % riff.length];
      self.tone(n, 0.12, 'triangle', 0.035);
      if (self.musicStep % 4 === 0) self.tone(n / 2, 0.16, 'sine', 0.05);
      self.musicStep++;
    }, stepMs);
  },

  stopMusic: function () {
    if (this.musicTimer) { clearInterval(this.musicTimer); this.musicTimer = null; }
  }
};
