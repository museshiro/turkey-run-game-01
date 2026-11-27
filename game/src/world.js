// Pipkin's Great Escape — the world: parallax farm scenery, stage banners,
// ground, and the spawn director that lays out ovens, knives, hay bales,
// corn and gravy boats ahead of the turkey as it runs.
'use strict';

const World = {
  clouds: [],
  trees: [],
  fences: [],

  reset(seed) {
    const rng = makeRng(seed);
    this.clouds = [];
    for (let i = 0; i < 7; i++) {
      this.clouds.push({ x: rng.range(0, 2400), y: rng.range(30, 130), s: rng.range(0.7, 1.4), v: rng.range(6, 16) });
    }
    this.trees = [];
    for (let i = 0; i < 12; i++) {
      this.trees.push({ x: rng.range(0, 3200), h: rng.range(60, 110), kind: rng.pick(['oak', 'pine', 'pumpkin']) });
    }
    this.fences = [];
    for (let i = 0; i < 40; i++) this.fences.push({ x: i * 90 });
  },

  // Draw sky, sun, clouds, far hills, barn silhouette, trees, ground.
  draw(ctx, dist, stage, time) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, GAME_H);
    skyGrad.addColorStop(0, stage.sky);
    skyGrad.addColorStop(0.7, '#f2d8a0');
    skyGrad.addColorStop(1, '#e8c98a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, GAME_W, GAME_H);

    // Sun.
    ctx.fillStyle = '#fff3c0';
    ctx.beginPath();
    ctx.arc(830, 74, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,243,192,0.4)';
    ctx.beginPath();
    ctx.arc(830, 74, 48, 0, Math.PI * 2);
    ctx.fill();

    // Clouds drift slowly.
    ctx.fillStyle = 'rgba(255,250,235,0.9)';
    for (const c of this.clouds) {
      const cx = (((c.x - dist * 0.08 - time * c.v) % 1200) + 1200) % 1200 - 120;
      ctx.beginPath();
      ctx.ellipse(cx, c.y, 46 * c.s, 16 * c.s, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 30 * c.s, c.y + 4, 32 * c.s, 13 * c.s, 0, 0, Math.PI * 2);
      ctx.ellipse(cx - 32 * c.s, c.y + 5, 28 * c.s, 12 * c.s, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Drifting autumn leaves for a little life in the air.
    ctx.fillStyle = 'rgba(198,93,33,0.8)';
    for (let i = 0; i < 6; i++) {
      const lx = ((i * 211 + 60 - dist * 0.6 - time * 24) % 1100 + 1100) % 1100 - 70;
      const ly = 90 + ((i * 67) % 220) + Math.sin(time * 1.4 + i) * 12;
      ctx.beginPath();
      ctx.ellipse(lx, ly, 6, 3.5, (i % 3) * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Far hills.
    ctx.fillStyle = stage.far;
    ctx.beginPath();
    ctx.moveTo(0, 380);
    for (let x = 0; x <= GAME_W; x += 60) {
      ctx.lineTo(x, 340 + Math.sin((x + dist * 0.15) * 0.008) * 26);
    }
    ctx.lineTo(GAME_W, GAME_H);
    ctx.lineTo(0, GAME_H);
    ctx.closePath();
    ctx.fill();

    // Barn silhouette on the horizon (farmyard + barn stages).
    const barnX = 700 - ((dist * 0.3) % 1400);
    if (stageIndexAt(dist) < 2) {
      ctx.fillStyle = '#8a3a24';
      ctx.fillRect(barnX, 300, 110, 80);
      ctx.beginPath();
      ctx.moveTo(barnX - 8, 302);
      ctx.lineTo(barnX + 55, 252);
      ctx.lineTo(barnX + 118, 302);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f2d8a0';
      ctx.fillRect(barnX + 42, 330, 26, 50);
    }

    // Trees / pumpkins at mid distance.
    for (const t of this.trees) {
      const tx = (((t.x - dist * 0.45) % 3200) + 3200) % 3200 - 100;
      if (t.kind === 'pumpkin') {
        ctx.fillStyle = '#e8862a';
        ctx.beginPath();
        ctx.ellipse(tx, GROUND_Y - 12, 18, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3a7a2a';
        ctx.fillRect(tx - 2, GROUND_Y - 30, 4, 6);
      } else {
        ctx.fillStyle = '#5a3a1a';
        ctx.fillRect(tx - 4, GROUND_Y - t.h * 0.55, 8, t.h * 0.55);
        ctx.fillStyle = t.kind === 'oak' ? '#c65d21' : '#4a7a2e';
        ctx.beginPath();
        ctx.arc(tx, GROUND_Y - t.h * 0.7, t.h * 0.42, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Ground.
    ctx.fillStyle = stage.ground;
    ctx.fillRect(0, GROUND_Y, GAME_W, GAME_H - GROUND_Y);
    ctx.fillStyle = stage.grass;
    ctx.fillRect(0, GROUND_Y, GAME_W, 10);
    // Fence posts scrolling past.
    ctx.fillStyle = '#7a5a30';
    for (const f of this.fences) {
      const fx = (((f.x - dist) % 1800) + 1800) % 1800 - 90;
      ctx.fillRect(fx, GROUND_Y - 34, 8, 34);
    }
    ctx.fillRect(0, GROUND_Y - 30, GAME_W, 5);
    // Dirt speckles.
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    for (let i = 0; i < 24; i++) {
      const sx = ((i * 173 + 40 - dist * 1.0) % 1000 + 1000) % 1000 - 20;
      ctx.fillRect(sx, GROUND_Y + 22 + (i % 5) * 12, 10, 3);
    }
  },

  // Decide the next obstacle cluster ahead of the run. Returns an array of
  // spawn descriptors the entity layer turns into live objects.
  nextCluster(rng, cfg, dist) {
    const gap = rng.range(cfg.hazardGapMin, cfg.hazardGapMax);
    const roll = rng.next();
    const cluster = [];
    let kind;
    if (roll < cfg.ovenChance) kind = 'oven';
    else if (roll < cfg.ovenChance + cfg.knifeChance) kind = 'knife';
    else kind = 'hay';
    const x = GAME_W + 80;
    if (kind === 'oven') {
      cluster.push({ type: 'oven', x, w: rng.range(52, 66), h: rng.range(72, 96) });
    } else if (kind === 'knife') {
      // Half the knives fall from the sky (jump timing), half skim the
      // ground (duck or jump over the low ones).
      if (rng.chance(0.5)) cluster.push({ type: 'knifeFall', x, y: -30, vy: rng.range(260, 380) });
      else cluster.push({ type: 'knifeSlide', x, y: GROUND_Y - 8 });
    } else {
      cluster.push({ type: 'hay', x, w: rng.range(64, 84), h: rng.range(52, 64) });
    }
    // Corn trails: sometimes above a hazard (reward the jump), sometimes low.
    if (rng.chance(cfg.cornChance)) {
      const n = rng.int(2, 4);
      const arc = kind === 'oven' || kind === 'hay';
      for (let i = 0; i < n; i++) {
        cluster.push({
          type: 'corn',
          x: x + 10 + i * 34,
          y: arc ? GROUND_Y - 150 - Math.sin((i / Math.max(1, n - 1)) * Math.PI) * 40 : GROUND_Y - rng.range(50, 90),
        });
      }
    }
    // Gravy-boat shield, variant B only, rare.
    if (cfg.shieldChance > 0 && rng.chance(cfg.shieldChance)) {
      cluster.push({ type: 'gravy', x: x + 140, y: GROUND_Y - 80 });
    }
    return { cluster, gap };
  },
};
