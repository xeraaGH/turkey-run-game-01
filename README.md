# Gobble & Gone — The Great Thanksgiving Breakout

Entry #1 for the make.fun bounty **"Make the best turkey escape game"**
(turkey-run-game-01, $250, top 20 paid).

You are **Tilly the turkey**, escaping becoming Thanksgiving dinner. One
continuous run through three stages — the **Farmyard** (fences, haystacks,
corn), **the Barn** (crates, tighter paths) and **the Kitchen** (a glowing
oven and a swinging carving knife) — while the farmer patrols with a vision
cone. Get spotted and he chases you down; hide in a haystack or outrun him.
Three lives. Escape at 2700 m and dinner is cancelled.

## Play

Serve `game/` locally (`node serve.ts`, then http://localhost:8080) and open
`game/index.html` — vanilla canvas 2D, no libraries, no network requests,
all art drawn in code, all sound synthesised with WebAudio.

- **Arrows / WASD** — move
- **Space** — jump
- **H** — hide in a haystack (while standing still next to one)
- **E** — gobble corn (+50)
- **M** — mute
- **Enter / click** — start / restart

Pickups: corn (+25), golden feather (+150), pie slice (speed burst).
HUD: score, distance, lives (feathers), stage name, escape progress,
SPOTTED! alert.

## Files

- `game/src/main.js` — boot, game loop, state machine (title/play/caught/escaped)
- `game/src/turkey.js` — player movement, jump, hide, lives
- `game/src/farmer.js` — patrol, vision cone, chase, search, cornering
- `game/src/stages.js` — stage layouts, obstacles, pickups (seeded RNG)
- `game/src/hazards.js` — oven heat zone, swinging carving knife
- `game/src/audio.js` — WebAudio synth sounds + jingle
- `game/src/hud.js` — HUD, title and end screens
- `game/src/sprites.js` — all canvas-drawn art, autumn palette
- `screenshots/` — 1-start, 2-play, 3-kitchen, 4-end (1280×720 JPEG)

Screenshot states are deterministic: `?shot=start|play|kitchen|end&seed=1`.

## Build

`mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts` — copies `game/` and
`screenshots/` to the output dir and writes `dossier.json`.
