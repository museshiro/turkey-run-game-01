// Pipkin's Great Escape — keyboard + mouse input. The game exposes one
// shared Input object: held keys, pressed-this-frame edges, and mouse clicks
// with canvas coordinates. Buttons on the title/end screens are plain
// rectangles the game tests against the last click.
'use strict';

const Input = {
  keys: {},
  pressed: {},
  clickX: -1,
  clickY: -1,
  clicked: false,
  touchY: -1,

  init(canvas) {
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      this.keys[k] = true;
      this.pressed[k] = true;
      if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
      SoundBank.resume();
    });
    window.addEventListener('keyup', (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      this.keys[k] = false;
    });
    canvas.addEventListener('mousedown', (e) => this.registerClick(e, canvas));
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      this.registerClick({ clientX: t.clientX, clientY: t.clientY }, canvas);
      e.preventDefault();
    }, { passive: false });
    window.addEventListener('blur', () => { this.keys = {}; });
  },

  registerClick(e, canvas) {
    const r = canvas.getBoundingClientRect();
    const sx = GAME_W / r.width;
    const sy = GAME_H / r.height;
    this.clickX = (e.clientX - r.left) * sx;
    this.clickY = (e.clientY - r.top) * sy;
    this.clicked = true;
    SoundBank.resume();
  },

  // True only on the frame the key went down; cleared by endFrame().
  wasPressed(...names) {
    return names.some((n) => this.pressed[n]);
  },

  isDown(...names) {
    return names.some((n) => !!this.keys[n]);
  },

  // True only on the frame a click landed inside the given rectangle.
  clickedIn(x, y, w, h) {
    return this.clicked && this.clickX >= x && this.clickX <= x + w && this.clickY >= y && this.clickY <= y + h;
  },

  endFrame() {
    this.pressed = {};
    this.clicked = false;
  },
};
