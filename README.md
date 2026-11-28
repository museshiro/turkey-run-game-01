# Pipkin's Great Escape

[![Turkey Run Game](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01)
[![Rank](https://make.fun/badge/turkey-run-game-01/museshiro/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01)
[![Reward](https://make.fun/badge/turkey-run-game-01/museshiro/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01)

**One turkey. One farmer. Zero stuffing.**

Pipkin the turkey runs 1,500 metres from the farmyard to the kitchen door — past pumpkins, hay bales, falling carving knives and a 350° oven — while Farmer Bram chases, searches, corners and lunges. Reach the Freedom Gate and no stuffing happens today.

Built for the [Turkey Run Game bounty on make.fun](https://make.fun/bounty/turkey-run-game-01).

## How to play

| Input | Action |
| --- | --- |
| SPACE / ↑ | Jump |
| ↓ (hold) | Duck — hold beside hay to hide |
| SHIFT / D | Dash (uses one stamina pip, makes noise) |
| H | Hide |
| 1 / 2 / 3 | Pick a mode on the title screen |
| P | Pause |
| M | Mute |

The on-screen JUMP / DUCK / DASH / HIDE buttons work with mouse or touch too. Pick up corn (+25), feathers (20 feathers earn a Gravy Shield), and rare power-ups: Gravy Shield, Corn Magnet, Pumpkin Decoy. Near misses (+15), clean dodges (+10) and dodged lunges (+25) build your combo up to x10 — but a hit or a spotting resets it. Bram lunges when he is within 30 m: dodge it and he is stunned for 1.5 s. Lose all three hearts, or let Bram close the gap to zero, and you are caught.

## Three modes

- **Great Escape** — the full 1,500 m run through all five zones, every mechanic, three hearts.
- **Fowl Dash** — faster scroll, tighter hazards, score x2. A high-score chase.
- **Hide & Seek Harvest** — slower and tenser: Bram stops to search, hay matters, stealth earns bonus points.

## Five zones (300 m each)

1. **The Farmyard** (0–300 m) — hay, rolling pumpkins, mud puddles. Learn to jump, duck and dash.
2. **The Pumpkin Patch** (300–600 m) — pumpkin carts, the scarecrow's arms, the first sliding knife. Bram starts searching.
3. **The Old Barn** (600–900 m) — carving knives fall from above, hay corridors, the barn door where Bram corners you.
4. **The Farmhouse Hall** (900–1200 m) — gravy spills, furniture, oven glow from the kitchen, faster knives. Bram lunges more.
5. **The Carving Room** (1200–1500 m) — the 350° oven, falling and sliding carving knives, the carving table, and the final sprint to the Freedom Gate.

## Scoring

- 1 point per metre (max 1,500), corn +25, feather +5, near miss +15, clean dodge +10, dodged lunge +25 — all multiplied by your current combo (x1–x10).
- End bonuses: +250 per heart left, +100 per best-combo step, +1,500 for escaping.
- Medals per run: Escaped, No-Hit, Combo x8. Best score is saved between runs.

## How to run

Serve the `game/` directory with any static server and open `game/index.html` in desktop Chrome. No build step, no network — all art is drawn in code and all sound is synthesised.

```sh
cd game && python3 -m http.server 8080
# open http://localhost:8080/
```

## Files

- `main.ts` — hands the game in: copies `game/` and `screenshots/` to the output directory and writes `dossier.json` with `buildDossier`.
- `game/index.html` — page shell: one 960×540 canvas and the classic script chain.
- `game/style.css` — dark full-bleed page, centred canvas, control hints.
- `game/src/config.js` — all tuning constants, the five-zone table and the three mode parameters.
- `game/src/random.js` — seeded RNG so screenshot runs are deterministic.
- `game/src/audio.js` — synthetic WebAudio sounds (banjo music, gobble, knife whoosh, oven roar, shield clang, fanfare); never starts in screenshot mode.
- `game/src/input.js` — keyboard and pointer input, including hit-testing the on-screen touch buttons.
- `game/src/art.js` — all vector art drawn in code: turkey, farmer, oven, knife, hay, pumpkin, backgrounds and ground.
- `game/src/zones.js` — the five zones and zone transitions.
- `game/src/farmer.js` — Farmer Bram's AI state machine (chasing, searching, cornering, lunging, stunned, retreating).
- `game/src/scoring.js` — score and combo: the score keeper, adding score, the combo ladder, the combo countdown.
- `game/src/feedback.js` — floating feedback text and particles.
- `game/src/hud.js` — HUD, title overlay, touch buttons and end screen, including the farmer gap meter.
- `game/src/world.js` — terrain, parallax and the spawn tables.
- `game/src/entities.js` — the turkey, hazards and spawn points; turkey movement and basic collision.
- `game/src/shots.js` — screenshot mode: read URL parameters, simulate a run to the target distance, freeze the frame, build the end frame.
- `game/src/main.js` — boot, game loop, screen state machine (title, playing, pause, end), dispatch to screenshot mode.
- `vendor/makefun-game.ts` — the kit's dossier library, copied unchanged.

## Screenshots

All four are real renders of the game's own code, captured from the canvas in headless Chromium (960×540 JPEG). Reproduce any of them by opening the game with the matching URL parameters:

- `01-cover.jpg` — attract mode: title logo and three mode chips over a frozen live run in the Carving Room (1,320 m, score 8,940, combo x7, Bram LUNGING 18 m away) — `?shot=cover&mode=escape&seed=1337`
- `02-play-pumpkin.jpg` — gameplay in the Pumpkin Patch (420 m, score 1,840, combo x3, Bram CHASING 62 m away) — `?shot=pumpkin&mode=escape&seed=4242`
- `03-play-kitchen.jpg` — gameplay in the Carving Room with no overlay (1,380 m, score 10,200, combo x8, Gravy Shield active, Bram LUNGING 22 m away) — `?shot=kitchen&mode=escape&seed=777`
- `04-end-escaped.jpg` — the ESCAPED end screen with the score breakdown, best score and the previous run's history ("Previous run: CAUGHT at 1.180 m — score 8.210") — `?shot=end&mode=escape&seed=99`

## License

MIT — see [LICENSE](LICENSE).
