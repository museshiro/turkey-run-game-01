// feedback.js — floating feedback text and particles: the floating
// text layer, spawning text, spawning spark bursts, drawing floaters.
function FloaterLayer() {
  this.items = [];
  this.sparks = [];
}

// spawnFloatText — float a message up from a point, then fade it out.
function spawnFloatText(layer, text, x, y, color, big) {
  layer.items.push({ text: text, x: x, y: y, color: color || '#fff', t: 0, life: 1.4, big: !!big });
  if (layer.items.length > 8) layer.items.shift();
}

// spawnSparkBurst — a burst of coloured sparks at a point.
function spawnSparkBurst(layer, x, y, color, n) {
  for (var i = 0; i < (n || 10); i++) {
    var a = Math.random() * Math.PI * 2;
    var sp = 40 + Math.random() * 90;
    layer.sparks.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 30, t: 0, life: 0.6, color: color || '#ffd23a' });
  }
}

// stepFloaters — age the floating text and sparks by dt.
function stepFloaters(layer, dt) {
  for (var i = layer.items.length - 1; i >= 0; i--) {
    var it = layer.items[i];
    it.t += dt;
    it.y -= 34 * dt;
    if (it.t >= it.life) layer.items.splice(i, 1);
  }
  for (var j = layer.sparks.length - 1; j >= 0; j--) {
    var s = layer.sparks[j];
    s.t += dt;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.vy += 220 * dt;
    if (s.t >= s.life) layer.sparks.splice(j, 1);
  }
}

// drawFloaters — draw the floating text and sparks on the canvas.
function drawFloaters(ctx, layer) {
  ctx.save();
  ctx.textAlign = 'center';
  for (var i = 0; i < layer.items.length; i++) {
    var it = layer.items[i];
    var a = it.t < 0.2 ? it.t / 0.2 : 1 - Math.max(0, (it.t - 0.8) / 0.6);
    ctx.globalAlpha = Math.max(0, Math.min(1, a));
    ctx.font = it.big ? 'bold 30px sans-serif' : 'bold 22px sans-serif';
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#3a2020';
    ctx.strokeText(it.text, it.x, it.y);
    ctx.fillStyle = it.color;
    ctx.fillText(it.text, it.x, it.y);
  }
  ctx.globalAlpha = 1;
  for (var j = 0; j < layer.sparks.length; j++) {
    var s = layer.sparks[j];
    ctx.globalAlpha = 1 - s.t / s.life;
    ctx.fillStyle = s.color;
    ctx.fillRect(s.x - 2, s.y - 2, 4, 4);
  }
  ctx.restore();
}
