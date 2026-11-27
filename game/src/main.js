// main.js — boot, game loop, state machine: title / play / caught / escaped.
// Input: arrows/WASD move, Space jump, H hide, E gobble, M mute, Enter start/restart.
'use strict';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const Game = {
  state: 'title',   // title | play | caught | escaped
  score: 0,
  distance: 0,
  cornEaten: 0,
  feathers: 0,
  t: 0,
  seed: 1,
  shot: null,
  overTimer: 0,
};

const input = { left: false, right: false, jump: false };

function resetRun(seed) {
  Game.score = 0;
  Game.cornEaten = 0;
  Game.feathers = 0;
  Game.distance = 0;
  Game.overTimer = 0;
  World.reset(seed || 1);
  Hazards.reset();
  Turkey.reset();
  Farmer.reset();
}

function startGame() {
  resetRun(Game.seed);
  Game.state = 'play';
  AudioSys.ensure();
  AudioSys.gobble();
}

function endGame(escaped) {
  Game.state = escaped ? 'escaped' : 'caught';
  Game.overTimer = 0;
  if (escaped) AudioSys.jingle(); else AudioSys.caught();
}

function loseLife(reason) {
  if (Turkey.hurt()) {
    Game.score = Math.max(0, Game.score - 100);
    if (Turkey.lives <= 0) {
      endGame(false);
    } else {
      // knocked back to safety, farmer loses the trail
      Turkey.x = 200;
      Farmer.reset();
      Farmer.x = 1000;
    }
  }
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function turkeyRect() {
  return { x: Turkey.x - 22, y: Turkey.y - 56, w: 44, h: 56 };
}

function update(dt) {
  Game.t += dt / 60;
  if (Game.state !== 'play') return;

  const boost = Turkey.boost > 0;
  World.update(dt, boost);
  Game.distance = World.distance;
  Game.score += Math.floor(World.speed * dt * 0.25);
  Hazards.update(dt, World.scroll);

  Turkey.update(input, dt);
  const grab = Farmer.update(dt, Turkey);
  if (grab === 'grab') loseLife('grab');
  if (Game.state !== 'play') return;

  const tr = turkeyRect();

  // Obstacles: fences and crates block the ground — jump them or stumble.
  for (const ob of World.plan.obstacles) {
    const sx = ob.x - World.scroll;
    if (sx < -120 || sx > W + 120) continue;
    const or = { x: sx - ob.w / 2, y: GROUND_Y - ob.h, w: ob.w, h: ob.h };
    if (ob.kind === 'knife') continue; // handled by Hazards below
    if (!ob.passed && rectsOverlap(tr, or)) {
      if (Turkey.onGround) {
        // stumble: lose a little score and get shoved back
        ob.passed = true;
        Game.score = Math.max(0, Game.score - 25);
        Turkey.x = Math.max(60, Turkey.x - 60);
        AudioSys.hurt();
      }
    }
    if (sx < Turkey.x - 100) ob.passed = true;
  }

  // Pickups
  for (const p of World.plan.pickups) {
    if (p.taken) continue;
    const sx = p.x - World.scroll;
    if (sx < -80 || sx > W + 80) continue;
    const pr = { x: sx - 22, y: p.y - 22, w: 44, h: 44 };
    if (rectsOverlap(tr, pr)) {
      p.taken = true;
      if (p.kind === 'corn') {
        Game.score += 25; Game.cornEaten += 1;
        AudioSys.pickup();
      } else if (p.kind === 'feather') {
        Game.score += 150; Game.feathers += 1;
        AudioSys.feather();
      } else if (p.kind === 'pie') {
        Game.score += 75;
        Turkey.boost = 240;
        AudioSys.feather();
      }
    }
  }

  // Kitchen hazards
  if (World.stage().id === 2) {
    if (Hazards.oven.active) {
      const z = Hazards.ovenZone(World.scroll);
      if (rectsOverlap(tr, z)) loseLife('oven');
    }
    if (Hazards.knife.active) {
      const b = Hazards.knifeBlade(World.scroll);
      if (rectsOverlap(tr, b)) loseLife('knife');
    }
  }
  if (Game.state !== 'play') return;

  // Escaped!
  if (Game.distance >= ESCAPE_DISTANCE) {
    Game.score += 500;
    endGame(true);
  }

  // Stage change fanfare
  const st = World.stage();
  if (st.id !== Game._stageId) {
    Game._stageId = st.id;
    if (Game.distance > 10) AudioSys.feather();
  }
}

function draw() {
  const st = World.stage();
  if (Game.state === 'title') {
    HUD.drawTitle(ctx, Game.t);
    return;
  }
  if (Game.state === 'caught' || Game.state === 'escaped') {
    HUD.drawEnd(ctx, Game, Game.state === 'escaped');
    return;
  }

  // play
  if (st.id === 2) {
    drawSky(ctx, W, H, 2, World.scroll, Game.t);
    drawKitchenBackdrop(ctx, W, GROUND_Y, World.scroll);
  } else {
    drawSky(ctx, W, H, st.id, World.scroll, Game.t);
    if (st.id === 0) drawBarnBackdrop(ctx, W, GROUND_Y, World.scroll);
  }
  drawGround(ctx, W, H, st.id, World.scroll, GROUND_Y);

  // haystacks
  for (const hs of World.plan.haystacks) {
    const sx = hs.x - World.scroll;
    if (sx < -100 || sx > W + 100) continue;
    const hidingHere = Turkey.hidden && Turkey.nearHaystack() === hs;
    if (!hidingHere) drawHaystack(ctx, sx, GROUND_Y, 1.0);
  }

  // obstacles
  for (const ob of World.plan.obstacles) {
    const sx = ob.x - World.scroll;
    if (sx < -120 || sx > W + 120) continue;
    if (ob.kind === 'fence') drawFence(ctx, sx, GROUND_Y, 1.0);
    else if (ob.kind === 'crate') drawCrate(ctx, sx, GROUND_Y, 1.0);
  }

  // pickups
  for (const p of World.plan.pickups) {
    if (p.taken) continue;
    const sx = p.x - World.scroll;
    if (sx < -80 || sx > W + 80) continue;
    const bob = Math.sin(Game.t * 3 + p.x) * 5;
    if (p.kind === 'corn') drawCorn(ctx, sx, p.y, 1.0, bob);
    else if (p.kind === 'feather') drawGoldenFeather(ctx, sx, p.y, 1.0, bob);
    else drawPie(ctx, sx, p.y, 1.0, bob);
  }

  Hazards.draw(ctx, World.scroll, Game.t);
  Farmer.drawVisionCone(ctx);
  Turkey.draw(ctx);
  Farmer.draw(ctx);
  HUD.draw(ctx, Game);
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(3, (now - last) / 16.666);
  last = now;
  if (Game.shot) {
    // Screenshot mode: freeze gameplay so the staged scene never changes,
    // but keep the clock running so idle animation still renders.
    Game.t += dt / 60;
  } else {
    update(dt);
  }
  draw();
  requestAnimationFrame(loop);
}

// ---------- input ----------
const KEYMAP = {
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'jump', KeyW: 'jump', Space: 'jump',
};

window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyM') { AudioSys.toggleMute(); return; }
  if (e.code === 'Enter') {
    if (Game.state === 'title' || Game.state === 'caught' || Game.state === 'escaped') startGame();
    return;
  }
  if (Game.state !== 'play') return;
  if (e.code === 'KeyH') { Turkey.hide(); return; }
  if (e.code === 'KeyE') {
    const bonus = Turkey.gobble();
    if (bonus > 0) { Game.score += bonus; Game.cornEaten += 1; }
    return;
  }
  const k = KEYMAP[e.code];
  if (k === 'jump') { if (!e.repeat) Turkey.jump(); input.jump = true; }
  else if (k) { input[k] = true; }
  if (KEYMAP[e.code] || e.code === 'Space') e.preventDefault();
});

window.addEventListener('keyup', (e) => {
  const k = KEYMAP[e.code];
  if (k === 'jump') input.jump = false;
  else if (k) input[k] = false;
});

canvas.addEventListener('click', () => {
  if (Game.state === 'title' || Game.state === 'caught' || Game.state === 'escaped') startGame();
});

// ---------- screenshot states (?shot= + ?seed=) ----------
function applyShot() {
  const params = new URLSearchParams(window.location.search);
  Game.seed = parseInt(params.get('seed') || '1', 10) || 1;
  Game.shot = params.get('shot');
  resetRun(Game.seed);
  if (Game.shot === 'play') {
    Game.state = 'play';
    World.scroll = 400 * 4; World.distance = 400; Game.distance = 400;
    Turkey.x = 300; Turkey.y = GROUND_Y;
    Farmer.x = 640; Farmer.facing = -1;
    Farmer.state = 'chase'; Farmer.spottedFlash = 90;
    Game.score = 1240; Game.cornEaten = 6;
  } else if (Game.shot === 'kitchen') {
    Game.state = 'play';
    World.scroll = 2050 * 4; World.distance = 2050; Game.distance = 2050;
    Turkey.x = 380; Turkey.y = GROUND_Y;
    Farmer.x = 950; Farmer.facing = -1; Farmer.state = 'patrol';
    Game.score = 3850; Game.cornEaten = 18; Game.feathers = 2;
  } else if (Game.shot === 'end') {
    Game.state = 'escaped';
    Game.score = 6420; Game.distance = 2700;
    Game.cornEaten = 31; Game.feathers = 4;
  } else {
    Game.state = 'title';
  }
  // Freeze the loop's randomness for screenshots: keep the world still.
  if (Game.shot) {
    const help = document.getElementById('help');
    if (help) help.style.display = 'none';
    // One deterministic frame: run a few fixed updates so entities settle.
    for (let i = 0; i < 5; i++) { Game.t += 1 / 60; Hazards.update(1, World.scroll); }
  }
}

applyShot();
requestAnimationFrame(loop);

// Test hook for headless play-testing (not part of the game UI).
window.__game = { Game, World, Turkey, Farmer, Hazards, startGame, endGame, input };
