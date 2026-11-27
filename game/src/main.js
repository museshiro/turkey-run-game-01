// Pipkin's Great Escape — the game loop, screens and HUD.
// States: title -> playing -> (paused) -> caught | escaped -> title.
// Title screen lets the player pick a variant (click, or press 1 / 2).
// The HUD shows score, distance, lives and the farmer gap meter.
'use strict';

const Game = {
  canvas: null,
  ctx: null,
  state: 'title',
  variant: 'b',
  run: null,
  seed: 7,
  last: 0,
  shot: null,
  paused: false,
  best: 0,
  titleT: 0,

  init() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    Input.init(this.canvas);
    World.reset(20261127);
    try { this.best = Number(localStorage.getItem('pipkin-best') || 0) || 0; } catch (e) { this.best = 0; }

    this.shot = Shots.read();
    if (this.shot) {
      SoundBank.enabled = false;
      this.variant = this.shot.variant;
      this.seed = this.shot.seed;
      if (this.shot.shot === 'play') {
        this.run = Shots.buildPlayFrame(VARIANTS[this.variant], this.seed);
        this.state = 'playing';
      } else if (this.shot.shot === 'end') {
        this.run = Shots.buildEndFrame(VARIANTS[this.variant], this.seed);
        this.state = 'escaped';
      } else {
        this.state = 'title';
      }
      this.drawFrame(0.5);
      return;
    }

    this.last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.update(dt);
      this.drawFrame(now / 1000);
      Input.endFrame();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  },

  startRun(variant) {
    this.variant = variant || this.variant;
    this.seed = (Math.random() * 1e9) | 0;
    this.run = makeRun(VARIANTS[this.variant], this.seed);
    this.state = 'playing';
    this.paused = false;
    SoundBank.resume();
    SoundBank.gobble();
  },

  update(dt) {
    this.titleT += dt;
    if (this.state === 'title') {
      if (Input.wasPressed('Enter', ' ')) this.startRun(this.variant);
      if (Input.wasPressed('1')) this.variant = 'a';
      if (Input.wasPressed('2')) this.variant = 'b';
      if (Input.clickedIn(230, 400, 200, 56)) this.startRun('a');
      if (Input.clickedIn(530, 400, 200, 56)) this.startRun('b');
      return;
    }
    if (this.state === 'playing') {
      if (Input.wasPressed('p', 'P', 'Escape')) { this.paused = !this.paused; return; }
      if (this.paused) return;
      const result = stepRun(this.run, dt, Input);
      if (result === 'caught') {
        this.state = 'caught';
        this.saveBest();
      } else if (result === 'escaped') {
        this.state = 'escaped';
        this.saveBest();
      }
      return;
    }
    if (this.state === 'caught' || this.state === 'escaped') {
      if (Input.wasPressed('Enter', ' ', 'r', 'R')) this.startRun(this.variant);
      if (Input.clickedIn(330, 432, 300, 52)) this.startRun(this.variant);
      if (Input.clickedIn(330, 494, 300, 34)) this.state = 'title';
      return;
    }
  },

  saveBest() {
    const s = Math.floor(this.run.score);
    if (s > this.best) {
      this.best = s;
      try { localStorage.setItem('pipkin-best', String(s)); } catch (e) { /* storage is a bonus */ }
    }
  },

  drawFrame(time) {
    const ctx = this.ctx;
    ctx.save();
    if (this.run && this.run.shakeT > 0) {
      ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
    }
    const dist = this.run ? this.run.distance : 0;
    const stage = stageAt(dist);
    World.draw(ctx, dist, stage, time);

    if (this.state === 'title') this.drawTitle(ctx, time);
    else if (this.run) {
      this.drawRun(ctx, time);
      if (this.state === 'playing') this.drawHud(ctx);
      if (this.state === 'caught') this.drawCaught(ctx);
      if (this.state === 'escaped') this.drawEscaped(ctx);
      if (this.paused && this.state === 'playing') this.drawPaused(ctx);
    }
    if (this.run && this.run.flashT > 0) {
      ctx.fillStyle = `rgba(200,40,30,${this.run.flashT * 1.2})`;
      ctx.fillRect(0, 0, GAME_W, GAME_H);
    }
    ctx.restore();
  },

  drawRun(ctx, time) {
    const run = this.run;
    // Freedom gate.
    if (run.gateX >= 0) Art.drawGate(ctx, run.gateX, GROUND_Y);
    // Pickups.
    for (const p of run.pickups) {
      if (p.type === 'corn') Art.drawCorn(ctx, p.x, p.y, p.bob);
      else Art.drawGravy(ctx, p.x, p.y, p.bob);
    }
    // Obstacles.
    for (const o of run.obstacles) {
      if (o.type === 'oven') Art.drawOven(ctx, o.x, GROUND_Y, o.w, o.h, time);
      else if (o.type === 'hay') Art.drawHay(ctx, o.x, GROUND_Y, o.w, o.h);
      else if (o.type === 'knifeFall') Art.drawKnife(ctx, o.x, o.y, 0.5, 'fall');
      else if (o.type === 'knifeSlide') Art.drawKnife(ctx, o.x, o.y, 0, 'slide');
    }
    // Farmer, then Pipkin (turkey in front).
    const f = run.farmer;
    Art.drawFarmer(ctx, f.x, GROUND_Y, f.runPhase, f.state === 'sprint' ? 'sprint' : f.state === 'search' ? 'spotted' : 'chase');
    const t = run.turkey;
    const blink = t.invulnT > 0 && Math.floor(time * 12) % 2 === 0;
    if (!blink) {
      Art.drawTurkey(ctx, TURKEY_X, t.y, t.runPhase, { sliding: t.sliding, hidden: t.hidden, blink: t.blink, shield: t.shield });
    }
    // Distance markers every 250m.
    const nextMark = Math.ceil(run.distance / 250) * 250;
    const markX = GAME_W - ((nextMark - run.distance) * 10);
    if (nextMark <= ESCAPE_DISTANCE && markX > 0 && markX < GAME_W) {
      ctx.fillStyle = 'rgba(60,30,10,0.75)';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(nextMark + 'm', markX, GROUND_Y + 26);
      ctx.fillRect(markX - 1, GROUND_Y, 2, 14);
    }
    // Stage banner / message toast.
    if (run.stageBannerT > 0) {
      ctx.fillStyle = 'rgba(60,30,10,0.85)';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(run.stageBanner, GAME_W / 2, 150);
    } else if (run.messageT > 0) {
      ctx.fillStyle = 'rgba(60,30,10,0.85)';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(run.message, GAME_W / 2, 150);
    }
  },

  drawHud(ctx) {
    const run = this.run;
    // Top bar.
    ctx.fillStyle = 'rgba(40,20,8,0.72)';
    ctx.beginPath();
    ctx.roundRect(10, 10, GAME_W - 20, 56, 10);
    ctx.fill();
    ctx.fillStyle = '#ffe9b0';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SCORE ' + Math.floor(run.score), 26, 36);
    ctx.fillText('🌽 ' + run.corn, 26, 58);
    ctx.textAlign = 'center';
    ctx.fillText(Math.floor(run.distance) + 'm / ' + ESCAPE_DISTANCE + 'm', GAME_W / 2, 36);
    // Progress bar to freedom.
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(GAME_W / 2 - 130, 46, 260, 8);
    ctx.fillStyle = '#7fd04a';
    ctx.fillRect(GAME_W / 2 - 130, 46, 260 * Math.min(1, run.distance / ESCAPE_DISTANCE), 8);
    // Lives as hearts, right side.
    ctx.textAlign = 'right';
    let hearts = '';
    for (let i = 0; i < run.cfg.lives; i++) hearts += i < run.lives ? '♥ ' : '♡ ';
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(hearts.trim(), GAME_W - 26, 40);
    // Farmer gap meter: how close Bram is.
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = run.farmer.gap < 90 ? '#ff8a7a' : '#ffe9b0';
    ctx.fillText('FARMER ' + (run.farmer.gap < 90 ? 'RIGHT BEHIND YOU!' : '— ' + Math.round(run.farmer.gap) + ' steps back'), GAME_W - 26, 58);
    // Variant tag.
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,233,176,0.8)';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(VARIANTS[run.cfg.key].label, 26, 84);
  },

  drawTitle(ctx, time) {
    // Big title card.
    ctx.fillStyle = 'rgba(40,20,8,0.55)';
    ctx.fillRect(0, 0, GAME_W, GAME_H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffe9b0';
    ctx.font = 'bold 64px Georgia, serif';
    ctx.fillText("PIPKIN'S", GAME_W / 2, 130);
    ctx.fillText('GREAT ESCAPE', GAME_W / 2, 196);
    ctx.fillStyle = '#ffb347';
    ctx.font = 'italic bold 22px Georgia, serif';
    ctx.fillText('One turkey. One farmer. Zero stuffing.', GAME_W / 2, 232);
    ctx.fillStyle = '#fff';
    ctx.font = '16px sans-serif';
    ctx.fillText('Thanksgiving is coming. Farmer Bram has the oven preheated and the carving', GAME_W / 2, 268);
    ctx.fillText('knife sharpened. Run 1,500 metres from the farmyard to the woods — and live.', GAME_W / 2, 290);

    // The turkey, mid-strut, under the title; Bram lurks at the far left.
    Art.drawTurkey(ctx, GAME_W / 2, 372, time * 3, {});
    Art.drawFarmer(ctx, 118, 405, time * 3, 'chase');

    // Two variant buttons.
    this.variantButton(ctx, 230, 400, 200, 56, 'a', '1 · FOWL DASH', 'Fast · dense hazards · x2 score');
    this.variantButton(ctx, 530, 400, 200, 56, 'b', '2 · HIDE & SEEK', 'Slow · hide in hay · shields');
    ctx.fillStyle = '#ffe9b0';
    ctx.font = '15px sans-serif';
    ctx.fillText('SPACE / ↑ jump · ↓ slide & hide · P pause · click a mode to start', GAME_W / 2, 486);
    ctx.fillStyle = 'rgba(255,233,176,0.75)';
    ctx.font = '13px sans-serif';
    ctx.fillText('Dodge the oven and the carving knife. Grab corn. Do not let Bram catch you.', GAME_W / 2, 510);
    if (this.best > 0) {
      ctx.fillStyle = '#ffd76a';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('Best score: ' + this.best, GAME_W / 2, 530);
    }
  },

  variantButton(ctx, x, y, w, h, key, label, sub) {
    const active = this.variant === key;
    ctx.fillStyle = active ? '#e8862a' : 'rgba(40,20,8,0.8)';
    ctx.strokeStyle = active ? '#ffe9b0' : '#c98a3d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 17px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, y + 24);
    ctx.fillStyle = active ? '#fff' : '#ffd76a';
    ctx.font = '12px sans-serif';
    ctx.fillText(sub, x + w / 2, y + 43);
    if (active) {
      ctx.fillStyle = '#ffe9b0';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('▶ SELECTED', x + w / 2, y - 8);
    }
  },

  drawPaused(ctx) {
    ctx.fillStyle = 'rgba(40,20,8,0.6)';
    ctx.fillRect(0, 0, GAME_W, GAME_H);
    ctx.fillStyle = '#ffe9b0';
    ctx.font = 'bold 44px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', GAME_W / 2, GAME_H / 2);
    ctx.font = '16px sans-serif';
    ctx.fillText('Press P to keep running — Bram is catching his breath too.', GAME_W / 2, GAME_H / 2 + 32);
  },

  drawCaught(ctx) {
    const run = this.run;
    ctx.fillStyle = 'rgba(60,10,5,0.72)';
    ctx.fillRect(0, 0, GAME_W, GAME_H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff8a7a';
    ctx.font = 'bold 56px Georgia, serif';
    ctx.fillText('CAUGHT!', GAME_W / 2, 150);
    ctx.fillStyle = '#fff';
    ctx.font = '20px Georgia, serif';
    ctx.fillText('Farmer Bram got you at ' + Math.floor(run.distance) + ' metres.', GAME_W / 2, 192);
    ctx.font = 'italic 17px Georgia, serif';
    ctx.fillText('The oven was already warm. The knife was already sharp.', GAME_W / 2, 222);
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#ffe9b0';
    ctx.fillText('SCORE ' + Math.floor(run.score) + '   ·   CORN ' + run.corn + '   ·   BEST ' + this.best, GAME_W / 2, 268);
    Art.drawFarmer(ctx, GAME_W / 2 - 130, 380, 0, 'chase');
    Art.drawTurkey(ctx, GAME_W / 2 + 60, 380, 0, { sliding: true });
    ctx.fillStyle = '#e8862a';
    ctx.beginPath();
    ctx.roundRect(330, 432, 300, 52, 10);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('↻ RUN AGAIN  (Enter)', GAME_W / 2, 465);
    ctx.fillStyle = '#ffe9b0';
    ctx.font = '15px sans-serif';
    ctx.fillText('or click here for the title screen', GAME_W / 2, 510);
  },

  drawEscaped(ctx) {
    const run = this.run;
    ctx.fillStyle = 'rgba(20,50,15,0.62)';
    ctx.fillRect(0, 0, GAME_W, GAME_H);
    // Confetti-ish autumn leaves.
    for (let i = 0; i < 26; i++) {
      const lx = (i * 173 + Math.floor(this.titleT * 30)) % GAME_W;
      const ly = (i * 97 + Math.floor(this.titleT * 60)) % 300 + 40;
      ctx.fillStyle = ['#e8862a', '#c65d21', '#d9a441', '#7fae4c'][i % 4];
      ctx.beginPath();
      ctx.ellipse(lx, ly, 7, 4, (i % 5) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.textAlign = 'center';
    ctx.fillStyle = '#a5e08a';
    ctx.font = 'bold 56px Georgia, serif';
    ctx.fillText('ESCAPED!', GAME_W / 2, 150);
    ctx.fillStyle = '#fff';
    ctx.font = '20px Georgia, serif';
    ctx.fillText('Pipkin reached the woods. No stuffing today.', GAME_W / 2, 192);
    ctx.font = 'italic 17px Georgia, serif';
    ctx.fillText('Farmer Bram is still out there, staring at an empty oven.', GAME_W / 2, 222);
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#ffe9b0';
    ctx.fillText('SCORE ' + Math.floor(run.score) + '   ·   CORN ' + run.corn + '   ·   LIVES LEFT ' + run.lives + '   ·   BEST ' + this.best, GAME_W / 2, 268);
    Art.drawTurkey(ctx, GAME_W / 2, 380, this.titleT * 3, {});
    ctx.fillStyle = '#e8862a';
    ctx.beginPath();
    ctx.roundRect(330, 432, 300, 52, 10);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('↻ RUN AGAIN  (Enter)', GAME_W / 2, 465);
    ctx.fillStyle = '#ffe9b0';
    ctx.font = '15px sans-serif';
    ctx.fillText('or click here for the title screen', GAME_W / 2, 510);
  },
};

window.addEventListener('DOMContentLoaded', () => Game.init());
