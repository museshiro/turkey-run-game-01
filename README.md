# Pipkin's Great Escape

[![Make the best turkey escape game](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01)
[![Rank](https://make.fun/badge/turkey-run-game-01/museshiro/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01)
[![Reward](https://make.fun/badge/turkey-run-game-01/museshiro/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01)

[Turkey Run Game bounty on make.fun](https://make.fun/bounty/turkey-run-game-01)

**One turkey. One farmer. Zero stuffing.**

Thanksgiving is coming. Farmer Bram has the oven preheated and the carving
knife sharpened — and Pipkin the turkey has other plans. Run 1,500 metres
from the farmyard, through the old barn and into the farmhouse kitchen, and
reach the woods before Bram catches you.

## How to play

- **SPACE / ↑** — jump (over ovens, hay bales and low knives)
- **↓** — slide under low carving knives; in Hide & Seek mode, hold it behind
  a hay bale to hide while Bram searches
- **P** — pause · **Enter** — start / run again · **1 / 2** — pick a mode
- Mouse: click the mode buttons on the title screen, or the run-again button
  on the end screens.

Dodge the glowing oven and the falling carving knife. Grab corn for points.
Every stumble lets Bram close in — three hits and you're dinner. Reach the
FREEDOM gate at 1,500 m to escape.

## Two ways to run

- **Hide & Seek Harvest** (default) — slower and tenser: Bram stops to search every few seconds, hay bales hide you, and gravy boats grant a one-hit shield.
- **Fowl Dash** — fast, dense hazards, double score. Pure chase.

Pick a mode on the title screen (or `?variant=a|b` in the URL).

## Run it

Static files, no network, no build step. Serve `game/` with any static
server and open `game/index.html` in desktop Chrome:

```sh
cd game && python3 -m http.server 8080
```

## Files

- `game/` — the game: `index.html`, `style.css`, `src/config.js` (variants +
  stages), `src/random.js`, `src/audio.js` (synthesized sound), `src/input.js`,
  `src/art.js` (all art drawn in code), `src/world.js` (scenery + spawns),
  `src/entities.js` (turkey, farmer AI, collisions), `src/shots.js`
  (deterministic screenshot states), `src/main.js` (loop, HUD, screens)
- `screenshots/` — real renders of the game's own code
- `main.ts` — hand-in program: copies `game/` + `screenshots/` to `/output`
  and writes `dossier.json` via `vendor/makefun-game.ts`
- `vendor/makefun-game.ts` — the kit's dossier library, copied unchanged

## License

MIT — see [LICENSE](LICENSE).
