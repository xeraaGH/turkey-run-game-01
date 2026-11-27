// hazards.js — the kitchen's oven heat zone and the swinging carving knife.
'use strict';

const Hazards = {
  // Oven: a fixed hazard at the far end of the kitchen stretch. Standing in
  // the glowing heat zone in front of its open door burns Tilly.
  oven: { worldX: 0, width: 200, active: false },

  // Carving knife: swings like a pendulum from a hook above the counter.
  knife: { pivotX: 0, pivotY: 0, angle: 0, t: 0, active: false },

  reset() {
    // Oven sits mid-kitchen (2250m), knife just before it (2150m).
    this.oven.worldX = 2250 * 4;
    this.oven.active = false;
    this.knife.pivotX = 2150 * 4;
    this.knife.pivotY = GROUND_Y - 170;
    this.knife.t = 0;
    this.knife.active = false;
  },

  update(dt, scroll) {
    const ovenScreenX = this.oven.worldX - scroll;
    this.oven.active = ovenScreenX > -260 && ovenScreenX < W + 260;
    const knifeScreenX = this.knife.pivotX - scroll;
    this.knife.active = knifeScreenX > -200 && knifeScreenX < W + 200;
    this.knife.t += dt;
    // Pendulum swing: -0.9 .. +0.9 rad, period ~2.2s.
    this.knife.angle = Math.sin(this.knife.t * 2.85) * 0.9;
  },

  // Screen-space rects for collision checks.
  ovenZone(scroll) {
    const sx = this.oven.worldX - scroll;
    return { x: sx - 70, y: GROUND_Y - 120, w: 150, h: 120 };
  },

  knifeBlade(scroll) {
    const sx = this.knife.pivotX - scroll;
    const len = 120;
    const tipX = sx + Math.sin(this.knife.angle) * len;
    const tipY = this.knife.pivotY + Math.cos(this.knife.angle) * len;
    return { x: Math.min(sx, tipX) - 14, y: Math.min(this.knife.pivotY, tipY) - 10,
             w: Math.abs(tipX - sx) + 28, h: Math.abs(tipY - this.knife.pivotY) + 20,
             tipX: tipX, tipY: tipY, pivotX: sx, pivotY: this.knife.pivotY };
  },

  draw(ctx, scroll, t) {
    if (this.oven.active) {
      drawOven(ctx, this.oven.worldX - scroll + 70, GROUND_Y, 1.0, t);
      // heat glow on the floor in front of the oven
      const z = this.ovenZone(scroll);
      const g = ctx.createRadialGradient(z.x + z.w / 2, z.y + z.h, 10, z.x + z.w / 2, z.y + z.h, 110);
      g.addColorStop(0, 'rgba(255,120,20,0.22)');
      g.addColorStop(1, 'rgba(255,120,20,0)');
      ctx.fillStyle = g;
      ctx.fillRect(z.x - 40, z.y - 20, z.w + 80, z.h + 40);
    }
    if (this.knife.active) {
      const b = this.knifeBlade(scroll);
      // hook + chain
      ctx.strokeStyle = '#3a2a18'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(b.pivotX, b.pivotY - 60); ctx.lineTo(b.pivotX, b.pivotY); ctx.stroke();
      drawKnife(ctx, b.pivotX, b.pivotY, this.knife.angle, 1.8);
    }
  },
};
