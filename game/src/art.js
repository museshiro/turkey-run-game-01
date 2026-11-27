// Pipkin's Great Escape — all art is drawn in code on the canvas: the
// turkey Pipkin, Farmer Bram, the oven, the carving knife, corn, hay bales
// and the gravy-boat shield. No image files, no borrowed art.
'use strict';

const Art = {
  // Pipkin the turkey. x,y = feet position. runPhase drives leg/wing swing.
  // hidden: drawn half-sunk into a hay bale. sliding: low duck pose.
  drawTurkey(ctx, x, y, runPhase, opts) {
    const o = opts || {};
    const slide = !!o.sliding;
    const hidden = !!o.hidden;
    const blink = o.blink || 0;
    ctx.save();
    ctx.translate(x, y);
    if (hidden) ctx.globalAlpha = 0.92;

    // Soft ground shadow so Pipkin sits on the dirt, not above it.
    ctx.fillStyle = 'rgba(40,20,8,0.18)';
    ctx.beginPath();
    ctx.ellipse(0, -2, 34, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    const bodyR = slide ? 26 : 30;
    const bodyY = slide ? -22 : -34;
    const bob = slide ? 0 : Math.sin(runPhase * 2) * 2;

    // Tail fan: five autumn feathers fanning behind.
    const featherCols = ['#c65d21', '#e08a2e', '#a63d1e', '#d9a441', '#8a4b1d'];
    ctx.save();
    ctx.translate(-bodyR * 0.8, bodyY - 6 + bob);
    ctx.rotate(slide ? -0.9 : -0.5);
    for (let i = 0; i < 5; i++) {
      const a = -0.9 + i * 0.45;
      ctx.save();
      ctx.rotate(a);
      ctx.fillStyle = featherCols[i];
      ctx.beginPath();
      ctx.ellipse(-26, 0, 24, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,235,180,0.85)';
      ctx.beginPath();
      ctx.ellipse(-40, 0, 7, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // Legs: two orange sticks scissoring while running.
    const legSwing = slide ? 0 : Math.sin(runPhase * 2) * 10;
    ctx.strokeStyle = '#e8862a';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-6, bodyY + bodyR - 4);
    ctx.lineTo(-6 + legSwing, 0);
    ctx.moveTo(8, bodyY + bodyR - 4);
    ctx.lineTo(8 - legSwing, 0);
    ctx.stroke();

    // Body: a plump brown oval.
    ctx.fillStyle = '#7a4a21';
    ctx.beginPath();
    ctx.ellipse(0, bodyY + bob, bodyR, bodyR * 0.92, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#9c6234';
    ctx.beginPath();
    ctx.ellipse(4, bodyY + 4 + bob, bodyR * 0.72, bodyR * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wing: darker flap that flutters when running.
    const wingFlap = slide ? 0.5 : Math.sin(runPhase * 2 + 1.2) * 0.35;
    ctx.save();
    ctx.translate(-2, bodyY + bob);
    ctx.rotate(wingFlap);
    ctx.fillStyle = '#5d3517';
    ctx.beginPath();
    ctx.ellipse(-6, 2, 18, 10, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (!hidden) {
      // Head + beak + wattle + snood, all up front.
      const hx = bodyR * 0.72;
      const hy = bodyY - bodyR * 0.72 + bob;
      ctx.fillStyle = '#8a5a2e';
      ctx.beginPath();
      ctx.arc(hx, hy, 13, 0, Math.PI * 2);
      ctx.fill();
      // Snood (the dangly red bit over the beak).
      ctx.fillStyle = '#c22e2e';
      ctx.beginPath();
      ctx.ellipse(hx + 8, hy + 6, 4, 8, 0.3, 0, Math.PI * 2);
      ctx.fill();
      // Beak.
      ctx.fillStyle = '#f2a93b';
      ctx.beginPath();
      ctx.moveTo(hx + 8, hy - 2);
      ctx.lineTo(hx + 24, hy + 3);
      ctx.lineTo(hx + 8, hy + 8);
      ctx.closePath();
      ctx.fill();
      // Wattle under the beak.
      ctx.fillStyle = '#d93838';
      ctx.beginPath();
      ctx.ellipse(hx + 10, hy + 12, 4, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Eye (blinks when the farmer is close: pure panic).
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(hx + 3, hy - 4, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(hx + 4, hy - 4, blink > 0 ? 0.8 : 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shield bubble from a gravy boat.
    if (o.shield) {
      ctx.strokeStyle = 'rgba(255,220,120,0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, bodyY, 52, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,220,120,0.12)';
      ctx.fill();
    }
    ctx.restore();
  },

  // Farmer Bram: tall, flat cap, red shirt, dungarees, and a very
  // determined expression. x,y = feet position.
  drawFarmer(ctx, x, y, runPhase, state) {
    ctx.save();
    ctx.translate(x, y);
    const legSwing = Math.sin(runPhase * 2) * 12;
    const lean = state === 'sprint' ? 0.22 : 0.1;

    // Legs (dark trousers).
    ctx.strokeStyle = '#3a2e22';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-8, -58);
    ctx.lineTo(-8 + legSwing, 0);
    ctx.moveTo(8, -58);
    ctx.lineTo(8 - legSwing, 0);
    ctx.stroke();

    // Body: red flannel shirt + dungaree straps.
    ctx.save();
    ctx.rotate(lean);
    ctx.fillStyle = '#b8322a';
    ctx.beginPath();
    ctx.roundRect(-20, -118, 40, 64, 10);
    ctx.fill();
    ctx.fillStyle = '#7a2a24';
    ctx.fillRect(-20, -118, 40, 8);
    ctx.fillStyle = '#2e4a7a';
    ctx.fillRect(-14, -116, 7, 40);
    ctx.fillRect(7, -116, 7, 40);
    // Arms pumping.
    ctx.strokeStyle = '#b8322a';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-18, -104);
    ctx.lineTo(-30, -78 + legSwing * 0.6);
    ctx.moveTo(18, -104);
    ctx.lineTo(30, -78 - legSwing * 0.6);
    ctx.stroke();
    // Head.
    ctx.fillStyle = '#e8b98a';
    ctx.beginPath();
    ctx.arc(0, -132, 15, 0, Math.PI * 2);
    ctx.fill();
    // Flat cap.
    ctx.fillStyle = '#4a5a2a';
    ctx.beginPath();
    ctx.arc(0, -138, 15, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(-16, -140, 32, 4);
    // Moustache + angry eyes.
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(-8, -128, 16, 4);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-9, -136, 5, 3);
    ctx.fillRect(4, -136, 5, 3);
    // A carving knife in one hand when sprinting.
    if (state === 'sprint' || state === 'chase') {
      ctx.strokeStyle = '#d8d8d8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(30, -78 - legSwing * 0.6);
      ctx.lineTo(48, -96 - legSwing * 0.6);
      ctx.stroke();
      ctx.strokeStyle = '#3a2a1a';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(30, -78 - legSwing * 0.6);
      ctx.lineTo(38, -86 - legSwing * 0.6);
      ctx.stroke();
    }
    ctx.restore();

    // "!" bubble when he has spotted Pipkin.
    if (state === 'spotted' || state === 'sprint') {
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#b8322a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(34, -168, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#b8322a';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', 34, -161);
    }
    ctx.restore();
  },

  // A farmhouse oven, door glowing, standing on the ground. w/h in px.
  drawOven(ctx, x, y, w, h, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#4a4a52';
    ctx.beginPath();
    ctx.roundRect(0, -h, w, h, 6);
    ctx.fill();
    ctx.fillStyle = '#2e2e34';
    ctx.beginPath();
    ctx.roundRect(6, -h + 10, w - 12, h - 20, 4);
    ctx.fill();
    // Glowing door window: it pulses, hungry.
    const glow = 0.55 + Math.sin(t * 4) * 0.25;
    ctx.fillStyle = `rgba(255,${Math.floor(120 + glow * 60)},30,${glow})`;
    ctx.beginPath();
    ctx.roundRect(12, -h + 26, w - 24, h * 0.42, 4);
    ctx.fill();
    ctx.strokeStyle = '#c8c8c8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(12, -h + 26, w - 24, h * 0.42, 4);
    ctx.stroke();
    // Chimney + heat shimmer lines.
    ctx.fillStyle = '#3a3a42';
    ctx.fillRect(w * 0.62, -h - 18, 14, 20);
    ctx.strokeStyle = 'rgba(255,180,80,0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.3, -h - 6);
    ctx.quadraticCurveTo(w * 0.3 + 6, -h - 18, w * 0.3, -h - 28);
    ctx.moveTo(w * 0.55, -h - 6);
    ctx.quadraticCurveTo(w * 0.55 - 6, -h - 20, w * 0.55, -h - 30);
    ctx.stroke();
    // Danger sign.
    ctx.fillStyle = '#f2c230';
    ctx.beginPath();
    ctx.moveTo(w / 2, -h + h * 0.62);
    ctx.lineTo(w / 2 + 12, -h + h * 0.62 + 20);
    ctx.lineTo(w / 2 - 12, -h + h * 0.62 + 20);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', w / 2, -h + h * 0.62 + 17);
    ctx.restore();
  },

  // A carving knife. kind 'fall' = drops from the sky; 'slide' = skims the
  // ground (duck under it). Drawn at its own x,y with a rotation.
  drawKnife(ctx, x, y, rot, kind) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    // Blade.
    ctx.fillStyle = '#e8e8ec';
    ctx.beginPath();
    ctx.moveTo(-34, -5);
    ctx.lineTo(18, -5);
    ctx.lineTo(34, 0);
    ctx.lineTo(18, 5);
    ctx.lineTo(-34, 5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#9a9aa2';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Handle.
    ctx.fillStyle = '#5a2e1a';
    ctx.beginPath();
    ctx.roundRect(-52, -6, 20, 12, 4);
    ctx.fill();
    // Motion streaks.
    ctx.strokeStyle = kind === 'fall' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-58, -12);
    ctx.lineTo(-72, -12);
    ctx.moveTo(-58, 0);
    ctx.lineTo(-74, 0);
    ctx.moveTo(-58, 12);
    ctx.lineTo(-72, 12);
    ctx.stroke();
    ctx.restore();
  },

  // A corn cob, golden and worth points.
  drawCorn(ctx, x, y, bob) {
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.fillStyle = '#f2c230';
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d9a41e';
    for (let r = -1; r <= 1; r++) {
      ctx.beginPath();
      ctx.ellipse(r * 6, 0, 2, 13, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#5d8f3a';
    ctx.beginPath();
    ctx.moveTo(-8, 14);
    ctx.lineTo(0, 26);
    ctx.lineTo(8, 14);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  },

  // A hay bale to jump over — or hide behind (variant B).
  drawHay(ctx, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#d9a441';
    ctx.beginPath();
    ctx.roundRect(0, -h, w, h, 8);
    ctx.fill();
    ctx.strokeStyle = '#b8862e';
    ctx.lineWidth = 2;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(4, -h + (h / 4) * i);
      ctx.lineTo(w - 4, -h + (h / 4) * i);
      ctx.stroke();
    }
    ctx.strokeStyle = '#e8c86a';
    ctx.beginPath();
    ctx.moveTo(6, -h + 6);
    ctx.lineTo(w - 6, -h + 6);
    ctx.stroke();
    ctx.restore();
  },

  // A gravy boat: pick it up for a one-hit shield (variant B).
  drawGravy(ctx, x, y, bob) {
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.fillStyle = '#f5f0e0';
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c98a3d';
    ctx.beginPath();
    ctx.ellipse(0, -2, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f5f0e0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(18, -2, 7, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.restore();
  },

  // The freedom gate at the end of the run: two posts, a pumpkin banner.
  drawGate(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#6a4a2a';
    ctx.fillRect(-8, -150, 14, 150);
    ctx.fillRect(72, -150, 14, 150);
    ctx.fillStyle = '#e8862a';
    ctx.beginPath();
    ctx.roundRect(-14, -158, 106, 34, 8);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FREEDOM!', 39, -136);
    // Pumpkin on top.
    ctx.fillStyle = '#e8862a';
    ctx.beginPath();
    ctx.ellipse(39, -168, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a7a2a';
    ctx.fillRect(36, -184, 6, 8);
    ctx.restore();
  },
};
