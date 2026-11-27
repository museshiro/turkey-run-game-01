// Pipkin's Great Escape — screenshot mode. The page reads ?shot= and
// ?variant= and ?seed= from the URL and freezes the game in a lively,
// readable frame so the maker's screenshots are real renders of the game:
//   ?shot=start  title screen (variant A or B)
//   ?shot=play   mid-run gameplay with HUD, farmer close, hazards on screen
//   ?shot=end    the ESCAPED end screen with final stats
// Shot mode never starts audio and never needs input.
'use strict';

const Shots = {
  params: null,

  read() {
    const q = new URLSearchParams(window.location.search);
    const shot = q.get('shot');
    if (!shot) return null;
    const variant = q.get('variant') === 'b' ? 'b' : 'a';
    const seed = Number(q.get('seed') || '7') || 7;
    this.params = { shot, variant, seed };
    return this.params;
  },

  // Build a frozen mid-run frame: run the simulation forward with the
  // seeded RNG until the turkey is ~620m in, with the farmer breathing
  // down its neck and a knife in the air. A tiny autopilot jumps ovens and
  // hay, slides under low knives and crouches while Bram searches, so the
  // frame shows a lively run instead of a caught turkey. Deterministic.
  buildPlayFrame(cfg, seed) {
    const run = makeRun(cfg, seed);
    const pilot = {
      wasPressed: () => {
        if (!run.turkey.grounded || run.turkey.sliding) return false;
        for (const o of run.obstacles) {
          if (o.type === 'knifeFall') continue;
          const ahead = o.x - TURKEY_X;
          if (ahead > 30 && ahead < 200) return true;
        }
        return false;
      },
      isDown: () => {
        if (run.farmer.state === 'search') return true;
        for (const o of run.obstacles) {
          if (o.type !== 'knifeSlide') continue;
          const ahead = o.x - TURKEY_X;
          if (ahead > -20 && ahead < 190) return true;
        }
        return false;
      },
    };
    let guard = 0;
    while (run.distance < 620 && guard < 6000) {
      const r = stepRun(run, 1 / 60, pilot);
      if (r !== 'playing') break;
      guard++;
    }
    // Hand-place a falling knife and a corn arc so the frame reads at a glance.
    run.obstacles.push({ type: 'knifeFall', x: 700, y: 150, vy: 300, hit: false, passed: false });
    run.obstacles.push({ type: 'oven', x: 790, w: 58, h: 84, hit: false, passed: false });
    run.pickups.push({ type: 'corn', x: 560, y: GROUND_Y - 150, taken: false, bob: 0 });
    run.pickups.push({ type: 'corn', x: 596, y: GROUND_Y - 165, taken: false, bob: 0 });
    run.pickups.push({ type: 'corn', x: 632, y: GROUND_Y - 150, taken: false, bob: 0 });
    run.farmer.gap = 86;
    run.farmer.x = TURKEY_X - 86;
    run.farmer.state = 'chase';
    run.message = '';
    run.messageT = 0;
    run.stageBanner = '';
    run.stageBannerT = 0;
    return run;
  },

  // Build a frozen ESCAPED end frame with believable final stats.
  buildEndFrame(cfg, seed) {
    const run = makeRun(cfg, seed);
    run.distance = ESCAPE_DISTANCE;
    run.score = 2840 * cfg.scoreMult;
    run.corn = 23;
    run.lives = 2;
    run.escaped = true;
    run.time = 62.4;
    return run;
  },
};
