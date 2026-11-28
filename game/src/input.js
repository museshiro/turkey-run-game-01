// input.js — keyboard and pointer input, including hit-testing the
// on-screen touch buttons drawn by hud.js.
var Input = {
  jumpHeld: false,
  duckHeld: false,
  dashQueued: false,
  hideHeld: false,
  anyKey: false,
  pointerX: 0,
  pointerY: 0,
  pointerDown: false
};

// TouchButtons — rects of the on-screen buttons; hud.js rewrites them
// every frame it draws the buttons. Input reads them for hit tests.
var TouchButtons = {
  jump: { x: 0, y: 0, w: 0, h: 0 },
  duck: { x: 0, y: 0, w: 0, h: 0 },
  dash: { x: 0, y: 0, w: 0, h: 0 },
  hide: { x: 0, y: 0, w: 0, h: 0 }
};

// ModeChips — rects of the three mode chips on the title screen.
var ModeChips = [];
// PauseButton / MuteButton — small icon rects in the screen corners.
var PauseButton = { x: 0, y: 0, w: 0, h: 0 };
var MuteButton = { x: 0, y: 0, w: 0, h: 0 };
// EndButtons — restart / title rects on the end screen.
var EndButtons = { again: { x: 0, y: 0, w: 0, h: 0 }, title: { x: 0, y: 0, w: 0, h: 0 } };

function hitRect(r, x, y) {
  return r && r.w > 0 && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

// buttonAt — which touch button (if any) sits under a pointer position.
function buttonAt(x, y) {
  var names = ['jump', 'duck', 'dash', 'hide'];
  for (var i = 0; i < names.length; i++) {
    if (hitRect(TouchButtons[names[i]], x, y)) return names[i];
  }
  return null;
}

function initInput(canvas, onKey, onTap) {
  window.addEventListener('keydown', function (e) {
    if (e.repeat) return;
    Input.anyKey = true;
    var k = e.key;
    if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') { Input.jumpHeld = true; onKey('jump'); e.preventDefault(); }
    else if (k === 'ArrowDown' || k === 's' || k === 'S') { Input.duckHeld = true; Input.hideHeld = true; onKey('duck'); e.preventDefault(); }
    else if (k === 'Shift' || k === 'd' || k === 'D') { Input.dashQueued = true; onKey('dash'); }
    else if (k === 'Enter') onKey('enter');
    else if (k === 'Escape' || k === 'p' || k === 'P') onKey('pause');
    else if (k === 'm' || k === 'M') onKey('mute');
    else if (k === 'h' || k === 'H') { Input.hideHeld = true; onKey('hide'); }
    else if (k === '1') onKey('mode0');
    else if (k === '2') onKey('mode1');
    else if (k === '3') onKey('mode2');
  });
  window.addEventListener('keyup', function (e) {
    var k = e.key;
    if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') Input.jumpHeld = false;
    else if (k === 'ArrowDown' || k === 's' || k === 'S') { Input.duckHeld = false; Input.hideHeld = false; }
    else if (k === 'h' || k === 'H') Input.hideHeld = false;
  });

  function pos(e) {
    var r = canvas.getBoundingClientRect();
    var cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    var cy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
    return { x: cx * (canvas.width / r.width), y: cy * (canvas.height / r.height) };
  }
  canvas.addEventListener('pointerdown', function (e) {
    var p = pos(e);
    Input.pointerX = p.x; Input.pointerY = p.y; Input.pointerDown = true;
    onTap(p.x, p.y, true);
  });
  canvas.addEventListener('pointerup', function (e) {
    var p = pos(e);
    Input.pointerDown = false;
    onTap(p.x, p.y, false);
  });
  canvas.addEventListener('pointermove', function (e) {
    var p = pos(e);
    Input.pointerX = p.x; Input.pointerY = p.y;
  });
}
