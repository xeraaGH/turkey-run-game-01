// stages.js — stage definitions, layouts, obstacles and pickups.
// The run is one continuous escape: farmyard -> barn -> kitchen -> the woods.
// Distances in metres; the world scrolls and entities spawn ahead of the player.
'use strict';

const STAGE_LEN = 900;          // metres per stage
const ESCAPE_DISTANCE = 2700;   // metres to freedom
const GROUND_Y = 600;
const W = 1280, H = 720;

const STAGES = [
  { id: 0, name: 'FARMYARD', sub: 'Dawn on the farm — run, Tilly, run!',
    obstacle: 'fence', ground: 'farm', speed: 3.0 },
  { id: 1, name: 'THE BARN', sub: 'Crates, pitchforks and nowhere to turn',
    obstacle: 'crate', ground: 'barn', speed: 3.6 },
  { id: 2, name: 'THE KITCHEN', sub: 'The oven is hot and the knife is out',
    obstacle: 'knife', ground: 'kitchen', speed: 4.2 },
];

function stageFor(distance) {
  if (distance < STAGE_LEN) return STAGES[0];
  if (distance < STAGE_LEN * 2) return STAGES[1];
  return STAGES[2];
}

// Deterministic seeded RNG so ?shot= renders are identical every load.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// One spawn plan per stage segment, built once per run from the seed.
function buildPlan(seed) {
  const rng = mulberry32(seed);
  const plan = { obstacles: [], pickups: [], haystacks: [] };
  // Obstacles: spaced 260-520 px apart along the whole run (in scroll px).
  let x = 900;
  const totalPx = ESCAPE_DISTANCE * 4; // 1m = 4 scroll px
  while (x < totalPx - 300) {
    const d = x / 4;
    const st = stageFor(d);
    const kind = st.obstacle;
    plan.obstacles.push({ x: x, kind: kind, w: kind === 'knife' ? 40 : 60, h: kind === 'fence' ? 40 : 48, passed: false });
    x += 280 + rng() * 260;
  }
  // Haystacks (farmyard + barn only) — hiding spots.
  for (let i = 0; i < 14; i++) {
    const hx = 700 + rng() * (totalPx * 0.62);
    plan.haystacks.push({ x: hx, w: 70 });
  }
  // Corn lines, golden feathers and pie slices.
  let px = 500;
  while (px < totalPx - 200) {
    const roll = rng();
    if (roll < 0.62) {
      // a little row of corn
      for (let i = 0; i < 3; i++) plan.pickups.push({ x: px + i * 46, y: GROUND_Y - 46, kind: 'corn', taken: false });
      px += 200 + rng() * 240;
    } else if (roll < 0.82) {
      plan.pickups.push({ x: px, y: GROUND_Y - 150, kind: 'feather', taken: false });
      px += 260 + rng() * 260;
    } else {
      plan.pickups.push({ x: px, y: GROUND_Y - 46, kind: 'pie', taken: false });
      px += 320 + rng() * 300;
    }
  }
  return plan;
}

// World state: scroll position (px), distance (m), spawned entities.
const World = {
  scroll: 0,
  distance: 0,
  speed: 3.0,
  plan: null,
  seed: 1,

  reset(seed) {
    this.seed = seed || 1;
    this.scroll = 0;
    this.distance = 0;
    this.plan = buildPlan(this.seed);
  },

  stage() { return stageFor(this.distance); },

  // screenX = entity world x - scroll
  onScreen(wx) { return wx - this.scroll; },

  update(dt, boost) {
    const st = this.stage();
    const target = st.speed * (boost ? 1.6 : 1);
    this.speed += (target - this.speed) * 0.05;
    this.scroll += this.speed * dt;
    this.distance = this.scroll / 4;
  },
};
