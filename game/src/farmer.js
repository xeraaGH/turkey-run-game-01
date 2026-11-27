// farmer.js — the farmer: patrol, vision cone, chase, search, cornering.
'use strict';

const Farmer = {
  x: 900, y: GROUND_Y,
  w: 44, h: 100,
  facing: -1,
  state: 'patrol',   // patrol | chase | search | cornered
  patrolSpeed: 1.6,
  chaseSpeed: 4.6,
  runPhase: 0,
  patrolMin: 700, patrolMax: 1150,
  searchTimer: 0,
  lastSeenX: 0, lastSeenY: 0,
  spottedFlash: 0,
  visionRange: 340,
  visionHalfAngle: 0.42,

  reset() {
    this.x = 900; this.y = GROUND_Y;
    this.facing = -1;
    this.state = 'patrol';
    this.searchTimer = 0;
    this.spottedFlash = 0;
    this.runPhase = 0;
  },

  // Can the farmer see Tilly right now? Needs line of sight in his cone,
  // Tilly on the ground level, not hidden, and not behind a haystack.
  canSee(turkey) {
    if (turkey.hidden) return false;
    const dx = turkey.x - this.x;
    const dy = (turkey.y - 30) - (this.y - 70);
    if (Math.abs(dx) > this.visionRange) return false;
    if (Math.sign(dx) !== this.facing && Math.abs(dx) > 30) return false;
    const angle = Math.atan2(dy, dx * this.facing);
    if (Math.abs(angle) > this.visionHalfAngle && Math.abs(dx) > 60) return false;
    return true;
  },

  spot(turkey) {
    if (this.state !== 'chase') {
      this.state = 'chase';
      this.spottedFlash = 90;
      AudioSys.alarm();
    }
    this.lastSeenX = turkey.x;
    this.lastSeenY = turkey.y;
  },

  update(dt, turkey) {
    if (this.spottedFlash > 0) this.spottedFlash -= dt;

    if (this.state === 'patrol') {
      this.x += this.facing * this.patrolSpeed * dt;
      this.runPhase += 0.08 * dt;
      if (this.x < this.patrolMin) { this.x = this.patrolMin; this.facing = 1; }
      if (this.x > this.patrolMax) { this.x = this.patrolMax; this.facing = -1; }
      if (this.canSee(turkey)) this.spot(turkey);
    } else if (this.state === 'chase') {
      // Chase: faster than Tilly's walk, slower than her pie burst.
      const dir = Math.sign(turkey.x - this.x) || 1;
      this.facing = dir;
      this.x += dir * this.chaseSpeed * dt;
      this.runPhase += 0.2 * dt;
      if (this.canSee(turkey)) {
        this.lastSeenX = turkey.x; this.lastSeenY = turkey.y;
      } else if (Math.abs(turkey.x - this.x) > this.visionRange * 1.4) {
        // Lost her: go search the last place she was seen.
        this.state = 'search';
        this.searchTimer = 200;
      }
      // Cornering: if Tilly is backed against the left edge, he closes in.
      if (turkey.x <= 70 && Math.abs(turkey.x - this.x) < 120) {
        this.chaseSpeed = 5.4;
      } else {
        this.chaseSpeed = 4.6;
      }
      // Grab!
      if (Math.abs(turkey.x - this.x) < 42 && Math.abs(turkey.y - this.y) < 60) {
        return 'grab';
      }
    } else if (this.state === 'search') {
      // Walk to the last-seen spot, look around, then give up and patrol.
      const dx = this.lastSeenX - this.x;
      if (Math.abs(dx) > 8) {
        this.facing = Math.sign(dx);
        this.x += this.facing * this.patrolSpeed * 1.4 * dt;
        this.runPhase += 0.1 * dt;
      } else {
        this.searchTimer -= dt;
        // look left, then right
        this.facing = Math.floor(this.searchTimer / 50) % 2 === 0 ? 1 : -1;
        if (this.searchTimer <= 0) {
          this.state = 'patrol';
          this.patrolMin = Math.max(80, this.x - 200);
          this.patrolMax = Math.min(W - 80, this.x + 200);
        }
      }
      if (this.canSee(turkey)) this.spot(turkey);
    }
    return null;
  },

  drawVisionCone(ctx) {
    if (this.state !== 'patrol' && this.state !== 'search') return;
    const ox = this.x, oy = this.y - 70;
    ctx.save();
    ctx.fillStyle = 'rgba(255,220,80,0.13)';
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    const dir = this.facing;
    const a = this.visionHalfAngle;
    ctx.lineTo(ox + dir * this.visionRange * Math.cos(a), oy + this.visionRange * Math.sin(a) * 0.9);
    ctx.lineTo(ox + dir * this.visionRange, oy);
    ctx.lineTo(ox + dir * this.visionRange * Math.cos(a), oy - this.visionRange * Math.sin(a) * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  },

  draw(ctx) {
    drawFarmer(ctx, this.x, this.y, 1.0, {
      runPhase: this.runPhase,
      facing: this.facing,
      angry: this.state === 'chase',
      searching: this.state === 'search',
    });
    // "!" over his head while chasing, "?" while searching
    if (this.state === 'chase' || this.state === 'search') {
      const mark = this.state === 'chase' ? '!' : '?';
      ctx.save();
      ctx.font = 'bold 44px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = this.state === 'chase' ? '#e02424' : '#d9a83a';
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 5;
      const my = this.y - 150 + Math.sin(Date.now() / 180) * 4;
      ctx.strokeText(mark, this.x, my);
      ctx.fillText(mark, this.x, my);
      ctx.restore();
    }
  },
};
