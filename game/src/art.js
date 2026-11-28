// art.js — all vector art, drawn in code: turkey, farmer, oven,
// carving knife, hay, pumpkin, backgrounds and ground. No image files.
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

// drawTurkey — Pipkin, the plump turkey: brown body, red wattle,
// fanned tail, expressive eye. pose: 'run' | 'duck' | 'jump' | 'hide' | 'caught'.
function drawTurkey(ctx, x, y, s, pose, t, hidden) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  var bob = pose === 'run' ? Math.sin(t * 14) * 2 : 0;
  if (pose === 'duck' || pose === 'hide') ctx.scale(1.25, 0.62);
  if (hidden) ctx.globalAlpha = 0.85;
  // tail fan
  ctx.fillStyle = '#a34d1e';
  for (var i = -2; i <= 2; i++) {
    ctx.save();
    ctx.translate(-14, -6 + bob);
    ctx.rotate(i * 0.42);
    ctx.beginPath();
    ctx.ellipse(-8, -14, 5, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = i % 2 ? '#c96a2e' : '#a34d1e';
    ctx.restore();
  }
  ctx.fillStyle = '#a34d1e';
  ctx.beginPath(); ctx.ellipse(-16, -8 + bob, 5, 15, -0.5, 0, Math.PI * 2); ctx.fill();
  // body
  ctx.fillStyle = '#7a4a22';
  ctx.strokeStyle = '#3a2020'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.ellipse(0, 0, 20, 17, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // wing
  ctx.fillStyle = '#5e3418';
  ctx.beginPath(); ctx.ellipse(-2, -2, 11, 8, -0.4, 0, Math.PI * 2); ctx.fill();
  // head
  ctx.fillStyle = '#7a4a22';
  ctx.beginPath(); ctx.arc(16, -20 + bob, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // beak
  ctx.fillStyle = '#e8a020';
  ctx.beginPath(); ctx.moveTo(23, -22 + bob); ctx.lineTo(32, -18 + bob); ctx.lineTo(23, -16 + bob); ctx.closePath(); ctx.fill();
  // wattle
  ctx.fillStyle = '#c0392b';
  ctx.beginPath(); ctx.ellipse(22, -12 + bob, 3, 6, 0.3, 0, Math.PI * 2); ctx.fill();
  // eye
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(18, -23 + bob, 3.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.arc(19, -23 + bob, 1.8, 0, Math.PI * 2); ctx.fill();
  // legs
  ctx.strokeStyle = '#e8a020'; ctx.lineWidth = 3;
  var legSwing = pose === 'run' ? Math.sin(t * 14) * 6 : 0;
  ctx.beginPath(); ctx.moveTo(-6, 14); ctx.lineTo(-6 + legSwing, 26); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(6, 14); ctx.lineTo(6 - legSwing, 26); ctx.stroke();
  ctx.restore();
}

// drawFarmer — Farmer Bram: straw hat, overalls, pitchfork, comic anger.
function drawFarmer(ctx, x, y, s, state, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  var lean = state === 'LUNGING' ? 0.35 : state === 'STUNNED' ? -0.15 : 0.12;
  ctx.rotate(lean);
  var wob = state === 'STUNNED' ? Math.sin(t * 20) * 3 : 0;
  // legs
  ctx.strokeStyle = '#3a3a5e'; ctx.lineWidth = 6;
  var run = Math.sin(t * 12) * 7;
  ctx.beginPath(); ctx.moveTo(-4, 10); ctx.lineTo(-8 + run, 34); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(6, 10); ctx.lineTo(10 - run, 34); ctx.stroke();
  // overalls
  ctx.fillStyle = '#3a5a8a';
  ctx.strokeStyle = '#22223a'; ctx.lineWidth = 2.5;
  roundRect(ctx, -13, -14, 26, 28, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#c0392b';
  ctx.fillRect(-13, -14, 26, 6);
  // arms + pitchfork
  ctx.strokeStyle = '#e8b88a'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(10, -8); ctx.lineTo(24, 2 + wob); ctx.stroke();
  ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(20, 22); ctx.lineTo(30, -26 + wob); ctx.stroke();
  ctx.strokeStyle = '#c0c0c0'; ctx.lineWidth = 2;
  for (var i = -1; i <= 1; i++) {
    ctx.beginPath(); ctx.moveTo(30 + i * 4, -26 + wob); ctx.lineTo(32 + i * 4, -36 + wob); ctx.stroke();
  }
  // head
  ctx.fillStyle = '#e8b88a';
  ctx.beginPath(); ctx.arc(0, -26, 11, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#22223a'; ctx.lineWidth = 2; ctx.stroke();
  // angry eyes + moustache
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.arc(-4, -28, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(5, -28, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-7, -33); ctx.lineTo(-1, -31); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(3, -31); ctx.lineTo(9, -33); ctx.stroke();
  ctx.strokeStyle = '#7a4a22'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-6, -20); ctx.quadraticCurveTo(0, -16, 7, -20); ctx.stroke();
  // straw hat
  ctx.fillStyle = '#e8c85a';
  ctx.beginPath(); ctx.ellipse(0, -34, 17, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -35, 9, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = '#8a6a2a'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();
  // state telegraph
  if (state === 'LUNGING' || state === 'CORNERING') {
    ctx.save();
    ctx.fillStyle = '#e02020';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', x, y - 62 - Math.sin(t * 10) * 4);
    ctx.restore();
  }
}

// drawOven — the glowing oven, labelled 350 degrees.
function drawOven(ctx, x, y, s, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = '#5a5a66';
  ctx.strokeStyle = '#22222a'; ctx.lineWidth = 3;
  roundRect(ctx, -34, -64, 68, 64, 6); ctx.fill(); ctx.stroke();
  var glow = 0.6 + Math.sin(t * 6) * 0.25;
  ctx.fillStyle = 'rgba(255,110,20,' + glow.toFixed(2) + ')';
  roundRect(ctx, -24, -48, 48, 30, 4); ctx.fill();
  ctx.fillStyle = '#ffb020';
  ctx.beginPath();
  ctx.moveTo(-18, -20); ctx.quadraticCurveTo(-14, -38, -8, -20);
  ctx.quadraticCurveTo(-2, -36, 4, -20); ctx.quadraticCurveTo(10, -34, 16, -20);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#22222a';
  ctx.fillRect(-24, -58, 48, 6);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('350°', 0, -52);
  ctx.fillStyle = '#888';
  ctx.beginPath(); ctx.arc(24, -48, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// drawKnife — the carving knife; falling ones tilt and wobble.
function drawKnife(ctx, x, y, s, angle, wobble) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + (wobble || 0));
  ctx.scale(s, s);
  ctx.fillStyle = '#d8d8e0';
  ctx.strokeStyle = '#33333a'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-4, -26); ctx.lineTo(4, -26); ctx.lineTo(7, 4); ctx.lineTo(0, 12); ctx.lineTo(-7, 4);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#5a2c18';
  roundRect(ctx, -4, 12, 8, 18, 3); ctx.fill(); ctx.stroke();
  ctx.restore();
}

// drawHay — a hay bale to hide behind.
function drawHay(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#d8a83c';
  ctx.strokeStyle = '#8a6a1a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, 30, 18, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#b8892a'; ctx.lineWidth = 1.5;
  for (var i = -2; i <= 2; i++) {
    ctx.beginPath(); ctx.ellipse(0, 0, 26 - Math.abs(i) * 3, 14 - Math.abs(i) * 2.5, 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.strokeStyle = '#e8c85a'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-24, -6); ctx.lineTo(-14, -14); ctx.moveTo(10, -10); ctx.lineTo(20, -16); ctx.stroke();
  ctx.restore();
}

// drawPumpkin — a round pumpkin with a face or plain.
function drawPumpkin(ctx, x, y, s, face) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#e8721e';
  ctx.strokeStyle = '#8a3a08'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, 22, 18, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#c85a10'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(0, 0, 12, 18, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 0, 4, 18, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#3a6a1a';
  ctx.fillRect(-2, -22, 5, 8);
  if (face) {
    ctx.fillStyle = '#3a2008';
    ctx.beginPath(); ctx.moveTo(-10, -4); ctx.lineTo(-5, -4); ctx.lineTo(-7.5, 1); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(5, -4); ctx.lineTo(10, -4); ctx.lineTo(7.5, 1); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-8, 8); ctx.quadraticCurveTo(0, 13, 8, 8); ctx.lineTo(8, 10); ctx.quadraticCurveTo(0, 15, -8, 10); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

// drawCorn — a corn pickup.
function drawCorn(ctx, x, y, s, t) {
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 5 + x) * 2);
  ctx.scale(s, s);
  ctx.fillStyle = '#f2c020';
  ctx.strokeStyle = '#8a6a10'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(0, 0, 8, 13, 0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#3a8a2a';
  ctx.beginPath(); ctx.moveTo(-6, 10); ctx.lineTo(-12, 20); ctx.lineTo(-2, 14); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(6, 10); ctx.lineTo(12, 20); ctx.lineTo(2, 14); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// drawFeather — a feather pickup.
function drawFeather(ctx, x, y, s, t) {
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 4 + x) * 3);
  ctx.rotate(Math.sin(t * 3) * 0.2);
  ctx.scale(s, s);
  ctx.fillStyle = '#e8e0d0';
  ctx.strokeStyle = '#8a7a5a'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(0, 0, 6, 13, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#8a7a5a'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(4, 12); ctx.stroke();
  ctx.restore();
}

// drawGravyBoat — the shield power-up pickup.
function drawGravyBoat(ctx, x, y, s, t) {
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 4) * 2);
  ctx.scale(s, s);
  ctx.fillStyle = '#f2f2f2';
  ctx.strokeStyle = '#555'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 2, 16, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-14, 0); ctx.quadraticCurveTo(-22, -10, -12, -8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(14, 0); ctx.quadraticCurveTo(22, -8, 18, -14); ctx.stroke();
  ctx.fillStyle = '#c98a3a';
  ctx.beginPath(); ctx.ellipse(0, -1, 11, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// drawScarecrow — pumpkin-patch scarecrow with waving arms.
function drawScarecrow(ctx, x, y, s, t) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#6a4a22'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -58); ctx.stroke();
  var wave = Math.sin(t * 2 + x) * 0.12;
  ctx.beginPath(); ctx.moveTo(-26, -46 + wave * 20); ctx.lineTo(26, -46 - wave * 20); ctx.stroke();
  ctx.fillStyle = '#3a6a8a';
  ctx.beginPath(); ctx.moveTo(-16, -44); ctx.lineTo(16, -44); ctx.lineTo(10, -10); ctx.lineTo(-10, -10); ctx.closePath(); ctx.fill();
  drawPumpkin(ctx, 0, -58, 0.8, true);
  ctx.fillStyle = '#e8c85a';
  ctx.beginPath(); ctx.ellipse(0, -66, 16, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// drawCart — a pumpkin cart.
function drawCart(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#8a5a2b';
  ctx.strokeStyle = '#4a2c10'; ctx.lineWidth = 2;
  ctx.fillRect(-34, -22, 68, 20);
  ctx.strokeRect(-34, -22, 68, 20);
  ctx.fillStyle = '#5a3a1a';
  ctx.beginPath(); ctx.arc(-18, 2, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(18, 2, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  drawPumpkin(ctx, -14, -28, 0.7, false);
  drawPumpkin(ctx, 8, -28, 0.8, true);
  drawPumpkin(ctx, 22, -26, 0.55, false);
  ctx.restore();
}

// drawTable — the carving table in the kitchen.
function drawTable(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#6a4a2a';
  ctx.strokeStyle = '#3a2410'; ctx.lineWidth = 2;
  ctx.fillRect(-46, -34, 92, 10);
  ctx.strokeRect(-46, -34, 92, 10);
  ctx.fillRect(-40, -24, 8, 24);
  ctx.fillRect(32, -24, 8, 24);
  ctx.fillStyle = '#e8e0d0';
  ctx.beginPath(); ctx.ellipse(0, -36, 20, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#c0392b';
  ctx.beginPath(); ctx.ellipse(-6, -38, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// drawGate — the Freedom Gate at 1,500 m.
function drawGate(ctx, x, y, s, t) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#6a4a2a';
  ctx.fillRect(-8, -110, 10, 110);
  ctx.fillRect(58, -110, 10, 110);
  ctx.fillStyle = '#3a8a3a';
  ctx.beginPath(); ctx.arc(-3, -112, 14, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(63, -112, 14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f2e0a0';
  ctx.strokeStyle = '#8a6a1a'; ctx.lineWidth = 2;
  roundRect(ctx, -14, -104, 88, 26, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#3a5a1a';
  ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('FREEDOM', 30, -86);
  ctx.restore();
}

// drawBackground — zone sky, sun, hills, fences and silhouettes.
function drawBackground(ctx, zone, scrollX, t) {
  var W = CFG.W, H = CFG.H;
  var g = ctx.createLinearGradient(0, 0, 0, CFG.GROUND_Y);
  g.addColorStop(0, zone.skyTop);
  g.addColorStop(1, zone.skyBot);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, CFG.GROUND_Y + 2);
  // sun
  ctx.fillStyle = 'rgba(255,236,170,0.9)';
  ctx.beginPath(); ctx.arc(820, 66, 30, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,236,170,0.35)';
  ctx.beginPath(); ctx.arc(820, 66, 44, 0, Math.PI * 2); ctx.fill();
  // far hills
  ctx.fillStyle = zone.accent;
  ctx.globalAlpha = 0.35;
  for (var i = -1; i < 4; i++) {
    var hx = ((i * 420 - scrollX * 0.15) % 1260 + 1260) % 1260 - 150;
    ctx.beginPath();
    ctx.ellipse(hx, CFG.GROUND_Y, 260, 70, 0, Math.PI, 0);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // fence posts
  ctx.fillStyle = '#6a4a22';
  for (var fx = -((scrollX * 0.35) % 90); fx < W + 90; fx += 90) {
    ctx.fillRect(fx, CFG.GROUND_Y - 46, 7, 46);
  }
  ctx.fillRect(0, CFG.GROUND_Y - 40, W, 5);
  ctx.fillRect(0, CFG.GROUND_Y - 24, W, 4);
}

// drawGround — dirt strip with grass tufts and autumn leaves.
function drawGround(ctx, zone, scrollX, t) {
  var W = CFG.W;
  ctx.fillStyle = zone.ground;
  ctx.fillRect(0, CFG.GROUND_Y, W, CFG.H - CFG.GROUND_Y);
  ctx.fillStyle = zone.grass;
  ctx.fillRect(0, CFG.GROUND_Y, W, 10);
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  for (var i = 0; i < 24; i++) {
    var lx = ((i * 173 - scrollX * 0.9) % 1000 + 1000) % 1000 - 20;
    ctx.beginPath(); ctx.ellipse(lx, CFG.GROUND_Y + 30 + (i % 5) * 11, 9, 3, 0.3, 0, Math.PI * 2); ctx.fill();
  }
  // drifting leaves
  ctx.fillStyle = '#e88a1e';
  for (var j = 0; j < 8; j++) {
    var px = ((j * 211 + t * 30 - scrollX * 0.5) % 1000 + 1000) % 1000 - 20;
    var py = 60 + ((j * 67) % 300) + Math.sin(t * 2 + j) * 12;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(t + j);
    ctx.fillRect(-4, -2, 8, 4);
    ctx.restore();
  }
}
