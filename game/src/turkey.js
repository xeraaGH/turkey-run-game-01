// turkey.js — Tilly the turkey: movement, jump, hide, lives.
'use strict';

const Turkey = {
  x: 300, y: GROUND_Y, vy: 0,
  w: 46, h: 56,
  speed: 5.2,
  facing: 1,
  onGround: true,
  runPhase: 0,
  hidden: false,
  lives: 3,
  invuln: 0,        // frames of post-hit invulnerability
  boost: 0,         // frames of pie speed burst
  gobbleCooldown: 0,

  reset() {
    this.x = 300; this.y = GROUND_Y; this.vy = 0;
    this.facing = 1; this.onGround = true; this.runPhase = 0;
    this.hidden = false; this.lives = 3; this.invuln = 0; this.boost = 0;
    this.gobbleCooldown = 0;
  },

  // Is Tilly standing still next to a haystack? Then she may hide.
  nearHaystack() {
    if (!World.plan) return null;
    for (const hs of World.plan.haystacks) {
      const sx = hs.x - World.scroll;
      if (Math.abs(sx - this.x) < 70) return hs;
    }
    return null;
  },

  hide() {
    if (this.hidden) { this.hidden = false; return false; }
    if (this.nearHaystack() && this.onGround) {
      this.hidden = true;
      AudioSys.hide();
      return true;
    }
    return false;
  },

  // Gobble corn with E: nearest uneaten corn within reach gives a bonus.
  gobble() {
    if (this.gobbleCooldown > 0 || !World.plan) return 0;
    let best = null, bestD = 110;
    for (const p of World.plan.pickups) {
      if (p.kind !== 'corn' || p.taken) continue;
      const sx = p.x - World.scroll;
      const d = Math.hypot(sx - this.x, (p.y + 20) - (this.y - 20));
      if (d < bestD) { best = p; bestD = d; }
    }
    if (best) {
      best.taken = true;
      this.gobbleCooldown = 20;
      AudioSys.gobble();
      return 50;
    }
    AudioSys.gobble();
    return 0;
  },

  jump() {
    if (this.onGround && !this.hidden) {
      this.vy = -13.5;
      this.onGround = false;
      AudioSys.jump();
    }
  },

  hurt() {
    if (this.invuln > 0) return false;
    this.lives -= 1;
    this.invuln = 120;
    this.hidden = false;
    AudioSys.hurt();
    return true;
  },

  update(input, dt) {
    if (this.invuln > 0) this.invuln -= dt;
    if (this.gobbleCooldown > 0) this.gobbleCooldown -= dt;
    if (this.boost > 0) this.boost -= dt;

    if (this.hidden) {
      // Hidden turkeys don't move; any movement key breaks cover.
      if (input.left || input.right || input.jump) this.hidden = false;
      return;
    }

    let move = 0;
    if (input.left) move -= 1;
    if (input.right) move += 1;
    const spd = this.speed * (this.boost > 0 ? 1.7 : 1);
    if (move !== 0) {
      this.facing = move;
      this.x += move * spd * dt;
      this.runPhase += 0.22 * dt;
      if (Math.floor(this.runPhase) % 6 === 0) AudioSys.step();
    }
    this.x = Math.max(60, Math.min(W - 60, this.x));

    // gravity
    this.vy += 0.75 * dt;
    this.y += this.vy * dt;
    if (this.y >= GROUND_Y) {
      this.y = GROUND_Y;
      this.vy = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }
  },

  draw(ctx) {
    if (this.invuln > 0 && Math.floor(this.invuln / 6) % 2 === 0) return; // blink
    const hs = this.hidden ? this.nearHaystack() : null;
    if (hs) {
      // tucked inside the haystack: draw the stack over the turkey
      drawTurkey(ctx, this.x, this.y, 0.9, { runPhase: 0, hidden: true, facing: this.facing });
      drawHaystack(ctx, hs.x - World.scroll, GROUND_Y, 1.0);
      return;
    }
    drawTurkey(ctx, this.x, this.y, 1.0, {
      runPhase: this.runPhase,
      facing: this.facing,
      flapping: !this.onGround,
    });
  },
};
