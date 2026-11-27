// Pipkin's Great Escape — all sound is synthesized with WebAudio, no audio
// files. Created lazily on the first user gesture; screenshot mode never
// touches it, so headless renders stay silent and error-free.
'use strict';

const SoundBank = {
  ctx: null,
  muted: false,
  enabled: true,

  ensure() {
    if (!this.enabled || this.ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { this.enabled = false; return; }
      this.ctx = new AC();
    } catch (e) {
      this.enabled = false;
    }
  },

  resume() {
    this.ensure();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  tone(freq, dur, type, vol, slideTo) {
    if (!this.ctx || this.muted) return;
    try {
      const t0 = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
      gain.gain.setValueAtTime(vol || 0.12, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } catch (e) { /* sound is decoration; never break the game */ }
  },

  gobble() {
    // Two quick descending clucks, like a nervous turkey.
    this.tone(420, 0.09, 'square', 0.08, 240);
    setTimeout(() => this.tone(360, 0.12, 'square', 0.08, 200), 90);
  },

  jump() { this.tone(300, 0.16, 'sine', 0.10, 620); },

  thud() { this.tone(140, 0.18, 'triangle', 0.16, 60); },

  // A soft hay rustle when Pipkin ducks into a bale to hide.
  rustle() { this.tone(900, 0.1, 'sine', 0.05, 500); },

  corn() {
    this.tone(880, 0.08, 'sine', 0.10);
    setTimeout(() => this.tone(1320, 0.12, 'sine', 0.10), 70);
  },

  alarm() {
    // Farmer spots you: a rising two-note warning.
    this.tone(520, 0.12, 'sawtooth', 0.09, 780);
    setTimeout(() => this.tone(780, 0.16, 'sawtooth', 0.09, 520), 130);
  },

  fanfare() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((n, i) => setTimeout(() => this.tone(n, 0.22, 'triangle', 0.12), i * 120));
  },

  caught() {
    this.tone(320, 0.5, 'sawtooth', 0.12, 90);
  },
};
