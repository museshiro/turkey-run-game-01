// hud.js — HUD, title overlay, touch buttons and end screen:
// draw the HUD, draw lives, draw the combo, draw the score,
// draw the touch buttons, draw the attract overlay, draw the title
// logo, draw the mode select, draw the end screen, draw the farmer
// gap meter.
function drawPanel(ctx, x, y, w, h, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha == null ? 0.72 : alpha;
  ctx.fillStyle = '#2a1a12';
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(255,220,150,0.5)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, x, y, w, h, 10);
  ctx.stroke();
  ctx.restore();
}

// drawScore — the big score number, top left.
function drawScore(ctx, G) {
  var sk = G.score;
  drawPanel(ctx, 12, 10, 190, 58, 0.72);
  ctx.fillStyle = '#ffd23a';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('SCORE', 24, 26);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(String(Math.floor(sk.score)), 24, 54);
  ctx.fillStyle = '#ffb020';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('CORN ' + sk.corn, 192, 26);
}

// drawCombo — combo multiplier with its thin timer ring, top left.
// The ring sits left of the label so it never covers the text.
function drawCombo(ctx, G) {
  var sk = G.score;
  drawPanel(ctx, 210, 10, 118, 58, 0.72);
  var cx = 228, cy = 30;
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, 11, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#ffd23a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, 11, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (sk.comboTimer / CFG.COMBO_WINDOW));
  ctx.stroke();
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffb020';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('COMBO', 246, 26);
  ctx.fillStyle = sk.combo > 1 ? '#ff6a3a' : '#fff';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('x' + sk.combo, 246, 48);
  ctx.fillStyle = '#ffd23a';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FEATHERS ' + sk.feathers + '/' + CFG.FEATHERS_PER_SHIELD, 269, 62);
}

// drawLives — the three hearts, top right, with a cracked heart on hit.
function drawLives(ctx, G) {
  var x0 = CFG.W - 220;
  drawPanel(ctx, x0, 10, 208, 58, 0.72);
  for (var i = 0; i < 3; i++) {
    var hx = x0 + 26 + i * 30, hy = 34;
    ctx.save();
    ctx.translate(hx, hy);
    if (i < G.hearts) {
      ctx.fillStyle = '#e02030';
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.bezierCurveTo(-12, -2, -9, -12, 0, -5);
      ctx.bezierCurveTo(9, -12, 12, -2, 0, 8);
      ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.bezierCurveTo(-12, -2, -9, -12, 0, -5);
      ctx.bezierCurveTo(9, -12, 12, -2, 0, 8);
      ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-6, -8); ctx.lineTo(6, 8); ctx.stroke();
    }
    ctx.restore();
  }
  // dash stamina pips
  ctx.fillStyle = '#ffd23a';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('DASH', x0 + 118, 26);
  for (var p = 0; p < CFG.DASH_PIPS; p++) {
    ctx.fillStyle = p < Math.floor(G.dashPips) ? '#4ad0ff' : 'rgba(255,255,255,0.25)';
    roundRect(ctx, x0 + 118 + p * 26, 32, 22, 12, 4);
    ctx.fill();
  }
  if (G.shield) {
    ctx.fillStyle = '#7ad0ff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('GRAVY SHIELD', x0 + 118, 60);
  }
}

// drawZoneBar — zone name and distance, top centre.
function drawZoneBar(ctx, G) {
  var zone = zoneForDistance(G.distance);
  drawPanel(ctx, 348, 10, 264, 58, 0.72);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd23a';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('ZONE ' + zone.n + '/5  ' + zone.name, 480, 30);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(Math.floor(G.distance) + ' m / ' + CFG.ESCAPE_M + ' m', 480, 56);
  // zone progress bar
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(368, 62, 224, 4);
  ctx.fillStyle = '#7ad05a';
  ctx.fillRect(368, 62, 224 * (G.distance / CFG.ESCAPE_M), 4);
}

// drawFarmerGapMeter — the horizontal track with Pipkin and Bram icons,
// the gap in metres, and Bram's AI state. Turns red under 25 m.
function drawFarmerGapMeter(ctx, G) {
  var f = G.farmer;
  var y = CFG.H - 78;
  drawPanel(ctx, 240, y - 14, 480, 52, 0.78);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffd23a';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('FARMER GAP', 254, y + 2);
  var trackX = 254, trackW = 452;
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  roundRect(ctx, trackX, y + 8, trackW, 8, 4); ctx.fill();
  var danger = f.gap < 25;
  ctx.fillStyle = danger ? '#e02020' : '#7ad05a';
  roundRect(ctx, trackX, y + 8, trackW * Math.min(1, f.gap / 100), 8, 4); ctx.fill();
  // Pipkin dot at the right end, Bram dot behind him
  var px = trackX + trackW - 10;
  var bx = trackX + trackW - 10 - (f.gap / 100) * (trackW - 20);
  ctx.fillStyle = '#e02020';
  ctx.beginPath(); ctx.arc(Math.max(trackX + 8, bx), y + 12, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('B', Math.max(trackX + 8, bx), y + 15);
  ctx.fillStyle = '#ffd23a';
  ctx.beginPath(); ctx.arc(px, y + 12, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3a2020';
  ctx.fillText('P', px, y + 15);
  ctx.textAlign = 'right';
  ctx.fillStyle = danger ? '#ff8080' : '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(Math.floor(f.gap) + ' m', trackX + trackW, y + 2);
  ctx.textAlign = 'center';
  ctx.fillStyle = danger ? '#ff8080' : '#ffd23a';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('BRAM: ' + f.state, 480, y + 34);
}

// drawTouchButtons — JUMP / DUCK / DASH / HIDE with keyboard hints.
function drawTouchButtons(ctx, G) {
  var defs = [
    { id: 'jump', label: 'JUMP', key: 'SPACE', x: CFG.W - 268, y: CFG.H - 128 },
    { id: 'duck', label: 'DUCK', key: 'DOWN', x: CFG.W - 188, y: CFG.H - 128 },
    { id: 'dash', label: 'DASH', key: 'SHIFT', x: CFG.W - 108, y: CFG.H - 128 },
    { id: 'hide', label: 'HIDE', key: 'H', x: CFG.W - 268, y: CFG.H - 66 }
  ];
  for (var i = 0; i < defs.length; i++) {
    var d = defs[i];
    var w = 72, h = 52;
    if (d.id === 'hide') w = 152;
    TouchButtons[d.id] = { x: d.x, y: d.y, w: w, h: h };
    var held = (d.id === 'duck' && Input.duckHeld) || (d.id === 'hide' && Input.hideHeld);
    ctx.save();
    ctx.globalAlpha = held ? 0.95 : 0.75;
    ctx.fillStyle = held ? '#ffd23a' : '#2a1a12';
    roundRect(ctx, d.x, d.y, w, h, 10);
    ctx.fill();
    ctx.strokeStyle = '#ffd23a'; ctx.lineWidth = 2;
    roundRect(ctx, d.x, d.y, w, h, 10); ctx.stroke();
    ctx.fillStyle = held ? '#3a2020' : '#fff';
    ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(d.label, d.x + w / 2, d.y + 24);
    ctx.fillStyle = held ? '#3a2020' : '#ffd23a';
    ctx.font = '10px sans-serif';
    ctx.fillText(d.key, d.x + w / 2, d.y + 40);
    ctx.restore();
  }
  // pause + mute icons, top right corner under the hearts panel
  PauseButton = { x: CFG.W - 44, y: 76, w: 32, h: 32 };
  MuteButton = { x: CFG.W - 84, y: 76, w: 32, h: 32 };
  drawPanel(ctx, MuteButton.x, MuteButton.y, 32, 32, 0.7);
  drawPanel(ctx, PauseButton.x, PauseButton.y, 32, 32, 0.7);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(AudioSys.muted ? 'X' : '♪', MuteButton.x + 16, MuteButton.y + 22);
  ctx.fillText('II', PauseButton.x + 16, PauseButton.y + 22);
}

// drawContextHint — the contextual hint near hazards or hay, bottom
// left. Kept narrow so it never covers Pipkin at x=210.
function drawContextHint(ctx, G) {
  if (!G.hint) return;
  drawPanel(ctx, 12, CFG.H - 128, 168, 52, 0.78);
  ctx.fillStyle = '#ffd23a';
  ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(G.hint, 96, CFG.H - 108);
  ctx.fillStyle = '#fff';
  ctx.font = '11px sans-serif';
  ctx.fillText(G.hint.indexOf('hide') >= 0 ? 'hold to stay hidden' : 'time it right!', 96, CFG.H - 90);
}

// drawHUD — the whole HUD in one call.
function drawHUD(ctx, G) {
  drawScore(ctx, G);
  drawCombo(ctx, G);
  drawZoneBar(ctx, G);
  drawLives(ctx, G);
  drawFarmerGapMeter(ctx, G);
  drawContextHint(ctx, G);
  drawTouchButtons(ctx, G);
  if (G.zoneBannerT > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, G.zoneBannerT);
    ctx.fillStyle = '#2a1a12';
    ctx.fillRect(0, 120, CFG.W, 54);
    ctx.fillStyle = '#ffd23a';
    ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(zoneBannerText(zoneForDistance(G.distance)), CFG.W / 2, 156);
    ctx.restore();
  }
}

// drawTitleLogo — the big title logo for the attract overlay.
function drawTitleLogo(ctx, y) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#ffd23a';
  ctx.font = 'bold 54px sans-serif';
  ctx.fillText("PIPKIN'S", CFG.W / 2, y);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 54px sans-serif';
  ctx.fillText('GREAT ESCAPE', CFG.W / 2, y + 56);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffe9b0';
  ctx.font = 'italic bold 18px sans-serif';
  ctx.fillText('One turkey. One farmer. Zero stuffing.', CFG.W / 2, y + 88);
  ctx.restore();
}

// drawModeSelect — the three mode chips with short descriptions.
function drawModeSelect(ctx, y, selected) {
  ModeChips = [];
  var w = 264, h = 92, gap = 20;
  var x0 = (CFG.W - (w * 3 + gap * 2)) / 2;
  for (var i = 0; i < MODE_ORDER.length; i++) {
    var m = MODES[MODE_ORDER[i]];
    var x = x0 + i * (w + gap);
    var sel = MODE_ORDER[i] === selected;
    ctx.save();
    ctx.globalAlpha = sel ? 0.96 : 0.82;
    ctx.fillStyle = sel ? '#7a2a10' : '#2a1a12';
    roundRect(ctx, x, y, w, h, 12);
    ctx.fill();
    ctx.strokeStyle = sel ? '#ffd23a' : 'rgba(255,220,150,0.5)';
    ctx.lineWidth = sel ? 3 : 1.5;
    roundRect(ctx, x, y, w, h, 12);
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd23a';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(m.name, x + w / 2, y + 26);
    ctx.fillStyle = '#ffb020';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(m.tag, x + w / 2, y + 44);
    ctx.fillStyle = '#fff';
    ctx.font = '11px sans-serif';
    var words = m.desc.split(' ');
    var line = '', ly = y + 62;
    for (var k = 0; k < words.length; k++) {
      if ((line + ' ' + words[k]).trim().length > 34) {
        ctx.fillText(line.trim(), x + w / 2, ly); ly += 13; line = words[k];
      } else line += ' ' + words[k];
    }
    ctx.fillText(line.trim(), x + w / 2, ly);
    ctx.restore();
    ModeChips.push({ id: MODE_ORDER[i], x: x, y: y, w: w, h: h });
  }
}

// drawAttractOverlay — title logo + mode chips stacked over a live run.
function drawAttractOverlay(ctx, G) {
  ctx.save();
  ctx.fillStyle = 'rgba(20,10,6,0.45)';
  ctx.fillRect(0, 0, CFG.W, CFG.H);
  drawTitleLogo(ctx, 108);
  drawModeSelect(ctx, 218, G.mode.id);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 17px sans-serif';
  ctx.fillText('PRESS ENTER / CLICK A MODE TO START', CFG.W / 2, 348);
  ctx.fillStyle = '#ffe9b0';
  ctx.font = '13px sans-serif';
  ctx.fillText('SPACE jump  •  DOWN duck & hide  •  SHIFT dash  •  H hide  •  P pause  •  M mute', CFG.W / 2, 372);
  ctx.restore();
}

// drawEndScreen — ESCAPED or CAUGHT, score breakdown, best score,
// previous-run history, restart and title buttons.
function drawEndScreen(ctx, G) {
  var e = G.end;
  ctx.save();
  ctx.fillStyle = e.escaped ? 'rgba(30,70,25,0.55)' : 'rgba(70,20,15,0.6)';
  ctx.fillRect(0, 0, CFG.W, CFG.H);
  ctx.textAlign = 'center';
  ctx.fillStyle = e.escaped ? '#7ad05a' : '#ff6a5a';
  ctx.font = 'bold 58px sans-serif';
  ctx.fillText(e.escaped ? 'ESCAPED!' : 'CAUGHT!', CFG.W / 2, 96);
  ctx.fillStyle = '#fff';
  ctx.font = 'italic 17px sans-serif';
  ctx.fillText(e.escaped
    ? 'Pipkin reached the woods. No stuffing today.'
    : 'The farmer got you at ' + Math.floor(e.distance) + ' m. So close to the gate!',
    CFG.W / 2, 126);
  // score breakdown panel
  var b = e.bonuses;
  drawPanel(ctx, 300, 150, 360, 168, 0.85);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffd23a';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('FINAL SCORE', 322, 176);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(String(Math.floor(b.total)), 638, 178);
  var rows = [
    ['Distance ' + Math.floor(e.distance) + ' m', b.distance],
    ['Corn x' + G.score.corn, b.corn],
    ['Best combo x' + G.score.maxCombo, b.comboBonus],
    ['Hearts left x' + e.heartsLeft, b.heartBonus],
    ['Escape bonus', b.escapeBonus]
  ];
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'left';
  for (var i = 0; i < rows.length; i++) {
    var ry = 204 + i * 22;
    ctx.fillStyle = '#e8e0d0';
    ctx.fillText(rows[i][0], 322, ry);
    ctx.fillStyle = '#ffd23a';
    ctx.textAlign = 'right';
    ctx.fillText('+' + Math.floor(rows[i][1]), 638, ry);
    ctx.textAlign = 'left';
  }
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffe9b0';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('BEST SCORE: ' + Math.floor(e.best), CFG.W / 2, 344);
  ctx.fillStyle = '#ffb020';
  ctx.font = '13px sans-serif';
  ctx.fillText(e.prevRun, CFG.W / 2, 368);
  // medals
  var medals = [];
  if (e.escaped) medals.push('ESCAPED');
  if (e.heartsLeft === 3) medals.push('NO-HIT');
  if (G.score.maxCombo >= 8) medals.push('COMBO x8');
  if (medals.length) {
    ctx.fillStyle = '#ffd23a';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('MEDALS: ' + medals.join('  •  '), CFG.W / 2, 392);
  }
  // buttons
  EndButtons.again = { x: 330, y: 414, w: 300, h: 52 };
  EndButtons.title = { x: 330, y: 474, w: 300, h: 40 };
  ctx.fillStyle = '#ffd23a';
  roundRect(ctx, EndButtons.again.x, EndButtons.again.y, 300, 52, 10); ctx.fill();
  ctx.fillStyle = '#3a2020';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('RUN AGAIN (Enter)', CFG.W / 2, 447);
  ctx.fillStyle = '#fff';
  ctx.font = '14px sans-serif';
  ctx.fillText('or click here for the title screen', CFG.W / 2, 500);
  ctx.restore();
}
