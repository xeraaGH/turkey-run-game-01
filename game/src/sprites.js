// sprites.js — all canvas-drawn art for Gobble & Gone. No external assets.
// Autumn palette: burnt orange, harvest gold, deep brown, crimson, cream.
'use strict';

const PALETTE = {
  skyTop: '#f7c873', skyMid: '#f2a65e', skyLow: '#e07840',
  barnSkyTop: '#d98a4a', barnSkyMid: '#b96a3a', barnSkyLow: '#8a4a28',
  kitSkyTop: '#e8b06a', kitSkyMid: '#d98a4a', kitSkyLow: '#a85a30',
  groundFarm: '#7a9a4a', groundDirt: '#8a5a2e', groundBarn: '#6e4a26',
  groundKit: '#7a5a40', wood: '#8a5a2e', woodDark: '#6e4520',
  turkeyBody: '#8a5a2e', turkeyBelly: '#c98a4a', turkeyHead: '#d98a5a',
  feather: '#5a3a1e', featherTip: '#c98a4a', wattle: '#c0392b',
  farmerShirt: '#3a6ea5', farmerPants: '#4a3a28', farmerHat: '#d9a83a',
  hay: '#e8c85a', corn: '#f2d13a', gold: '#ffd700', pie: '#e07840',
};

function mulberry(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}

// ---------- Turkey (Tilly) ----------
function drawTurkey(ctx, x, y, s, opts) {
  opts = opts || {};
  const run = opts.runPhase || 0;      // leg swing phase
  const hidden = !!opts.hidden;        // crouched inside a haystack
  const facing = opts.facing || 1;     // 1 right, -1 left
  const flapping = !!opts.flapping;    // jump flap
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing * s, s);
  if (hidden) ctx.globalAlpha = 0.85;
  const bob = Math.sin(run) * 2;
  // tail fan
  ctx.fillStyle = PALETTE.feather;
  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.translate(-16, -22 + bob);
    ctx.rotate(i * 0.35);
    ctx.beginPath();
    ctx.ellipse(0, -16, 7, 17, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.featherTip;
    ctx.beginPath(); ctx.ellipse(0, -30, 5, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PALETTE.feather;
    ctx.restore();
  }
  // legs
  const legSwing = Math.sin(run) * 8;
  ctx.strokeStyle = '#e8a83a'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-4, 2); ctx.lineTo(-4 + legSwing, 16); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(6, 2); ctx.lineTo(6 - legSwing, 16); ctx.stroke();
  // body
  ctx.fillStyle = PALETTE.turkeyBody;
  ctx.beginPath(); ctx.ellipse(0, -12 + bob, 22, 18, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = PALETTE.turkeyBelly;
  ctx.beginPath(); ctx.ellipse(4, -8 + bob, 13, 11, 0, 0, Math.PI * 2); ctx.fill();
  // wing
  const flap = flapping ? -0.9 : Math.sin(run) * 0.25;
  ctx.save();
  ctx.translate(-2, -14 + bob); ctx.rotate(flap);
  ctx.fillStyle = PALETTE.feather;
  ctx.beginPath(); ctx.ellipse(-8, 0, 13, 8, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // neck + head
  ctx.fillStyle = PALETTE.turkeyHead;
  ctx.beginPath(); ctx.ellipse(16, -30 + bob, 7, 13, 0.25, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(20, -42 + bob, 10, 0, Math.PI * 2); ctx.fill();
  // beak
  ctx.fillStyle = '#e8a83a';
  ctx.beginPath(); ctx.moveTo(28, -44 + bob); ctx.lineTo(38, -40 + bob); ctx.lineTo(28, -38 + bob); ctx.closePath(); ctx.fill();
  // wattle
  ctx.fillStyle = PALETTE.wattle;
  ctx.beginPath(); ctx.ellipse(27, -34 + bob, 3, 6, 0.3, 0, Math.PI * 2); ctx.fill();
  // eye
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(23, -45 + bob, 3.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.arc(24, -45 + bob, 1.8, 0, Math.PI * 2); ctx.fill();
  // little red snood
  ctx.strokeStyle = PALETTE.wattle; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(22, -50 + bob); ctx.quadraticCurveTo(26, -56 + bob, 24, -60 + bob); ctx.stroke();
  ctx.restore();
}

// ---------- Farmer ----------
function drawFarmer(ctx, x, y, s, opts) {
  opts = opts || {};
  const run = opts.runPhase || 0;
  const facing = opts.facing || 1;
  const angry = !!opts.angry;
  const searching = !!opts.searching;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing * s, s);
  const legSwing = Math.sin(run) * 10;
  const bob = Math.abs(Math.sin(run)) * -2;
  // legs
  ctx.strokeStyle = PALETTE.farmerPants; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-6, -34 + bob); ctx.lineTo(-6 + legSwing, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(6, -34 + bob); ctx.lineTo(6 - legSwing, 0); ctx.stroke();
  // boots
  ctx.fillStyle = '#3a2a18';
  ctx.fillRect(-12 + legSwing, -6, 14, 7);
  ctx.fillRect(0 - legSwing, -6, 14, 7);
  // body / overalls
  ctx.fillStyle = PALETTE.farmerShirt;
  ctx.fillRect(-16, -72 + bob, 32, 40);
  ctx.fillStyle = '#2a4a6a';
  ctx.fillRect(-16, -52 + bob, 32, 20);
  // arms (one holds a pitchfork when angry/searching)
  ctx.strokeStyle = PALETTE.farmerShirt; ctx.lineWidth = 8;
  const armSwing = Math.sin(run) * 7;
  ctx.beginPath(); ctx.moveTo(-14, -66 + bob); ctx.lineTo(-24, -40 + bob + armSwing); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(14, -66 + bob); ctx.lineTo(24, -42 + bob - armSwing); ctx.stroke();
  // pitchfork in right hand
  if (angry || searching) {
    ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(24, -42 + bob); ctx.lineTo(34, -92 + bob); ctx.stroke();
    ctx.strokeStyle = '#c0c0c0'; ctx.lineWidth = 3;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath(); ctx.moveTo(34 + i * 5, -92 + bob); ctx.lineTo(34 + i * 5, -106 + bob); ctx.stroke();
    }
  }
  // head
  ctx.fillStyle = '#e8b88a';
  ctx.beginPath(); ctx.arc(0, -84 + bob, 13, 0, Math.PI * 2); ctx.fill();
  // beard
  ctx.fillStyle = '#d9d9d9';
  ctx.beginPath(); ctx.ellipse(2, -74 + bob, 10, 7, 0, 0, Math.PI); ctx.fill();
  // eyes (angry brows when chasing)
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.arc(5, -86 + bob, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(11, -86 + bob, 2, 0, Math.PI * 2); ctx.fill();
  if (angry) {
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(2, -92 + bob); ctx.lineTo(8, -89 + bob); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(14, -92 + bob); ctx.lineTo(8, -89 + bob); ctx.stroke();
  }
  // straw hat
  ctx.fillStyle = PALETTE.farmerHat;
  ctx.beginPath(); ctx.ellipse(0, -94 + bob, 22, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -98 + bob, 12, 7, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#8a5a2e';
  ctx.fillRect(-12, -97 + bob, 24, 3);
  ctx.restore();
}

// ---------- Scenery & pickups ----------
function drawHaystack(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = PALETTE.hay;
  ctx.beginPath(); ctx.moveTo(-34, 0); ctx.quadraticCurveTo(-30, -42, 0, -46);
  ctx.quadraticCurveTo(30, -42, 34, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#c9a83a'; ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath(); ctx.moveTo(i * 12, -40 + Math.abs(i) * 6);
    ctx.quadraticCurveTo(i * 14, -20, i * 12, -2); ctx.stroke();
  }
  ctx.restore();
}

function drawCorn(ctx, x, y, s, bob) {
  ctx.save(); ctx.translate(x, y + (bob || 0)); ctx.scale(s, s);
  ctx.fillStyle = '#4a7a2a';
  ctx.beginPath(); ctx.ellipse(-8, 2, 5, 14, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(8, 2, 5, 14, 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = PALETTE.corn;
  ctx.beginPath(); ctx.ellipse(0, -6, 8, 15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#d9b82a';
  for (let r = -2; r <= 2; r++) for (let c = -1; c <= 1; c++) {
    ctx.beginPath(); ctx.arc(c * 4, r * 5 - 6, 1.6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawGoldenFeather(ctx, x, y, s, bob) {
  ctx.save(); ctx.translate(x, y + (bob || 0)); ctx.rotate(Math.sin(bob * 0.1) * 0.2); ctx.scale(s, s);
  ctx.fillStyle = PALETTE.gold;
  ctx.beginPath(); ctx.ellipse(0, -8, 7, 16, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff3a0';
  ctx.beginPath(); ctx.ellipse(-1, -8, 3, 12, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(4, 8); ctx.lineTo(8, 18); ctx.stroke();
  ctx.restore();
}

function drawPie(ctx, x, y, s, bob) {
  ctx.save(); ctx.translate(x, y + (bob || 0)); ctx.scale(s, s);
  ctx.fillStyle = '#d9a83a';
  ctx.beginPath(); ctx.moveTo(-14, 6); ctx.lineTo(14, 6); ctx.lineTo(8, -10); ctx.lineTo(-8, -10); ctx.closePath(); ctx.fill();
  ctx.fillStyle = PALETTE.pie;
  ctx.beginPath(); ctx.moveTo(-8, -10); ctx.lineTo(8, -10); ctx.lineTo(12, -2); ctx.lineTo(-12, -2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(0, -12, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawFence(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = PALETTE.wood;
  ctx.fillRect(-30, -34, 7, 34); ctx.fillRect(23, -34, 7, 34);
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(-34, -30, 68, 6); ctx.fillRect(-34, -14, 68, 6);
  ctx.restore();
}

function drawCrate(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = PALETTE.wood;
  ctx.fillRect(-22, -44, 44, 44);
  ctx.strokeStyle = PALETTE.woodDark; ctx.lineWidth = 3;
  ctx.strokeRect(-22, -44, 44, 44);
  ctx.beginPath(); ctx.moveTo(-22, -44); ctx.lineTo(22, 0); ctx.moveTo(22, -44); ctx.lineTo(-22, 0); ctx.stroke();
  ctx.restore();
}

function drawOven(ctx, x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // body
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(-70, -150, 140, 150);
  ctx.fillStyle = '#555';
  ctx.fillRect(-70, -150, 140, 14);
  // open door glowing
  const flick = 0.75 + Math.sin(t * 9) * 0.25;
  ctx.fillStyle = 'rgba(255,' + Math.floor(120 * flick + 60) + ',20,0.95)';
  ctx.fillRect(-56, -110, 112, 78);
  ctx.fillStyle = '#ff8a2a';
  ctx.beginPath(); ctx.ellipse(0, -72, 46, 30, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffd23a';
  ctx.beginPath(); ctx.ellipse(0, -72, 28, 18, 0, 0, Math.PI * 2); ctx.fill();
  // door swung open (bottom)
  ctx.fillStyle = '#222';
  ctx.fillRect(-60, -32, 120, 10);
  // knobs
  ctx.fillStyle = '#ddd';
  for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(i * 30, -132, 6, 0, Math.PI * 2); ctx.fill(); }
  // heat shimmer waves above the door
  ctx.strokeStyle = 'rgba(255,140,40,0.55)'; ctx.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    const wx = -40 + i * 40 + Math.sin(t * 5 + i * 2) * 6;
    ctx.beginPath(); ctx.moveTo(wx, -118);
    ctx.quadraticCurveTo(wx + 8, -132, wx, -146); ctx.stroke();
  }
  ctx.restore();
}

function drawKnife(ctx, x, y, angle, s) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.scale(s, s);
  // handle
  ctx.fillStyle = '#2a1a0e';
  ctx.fillRect(-8, -58, 16, 34);
  ctx.fillStyle = '#c0392b';
  ctx.fillRect(-8, -58, 16, 6);
  // blade
  ctx.fillStyle = '#e8e8e8';
  ctx.beginPath(); ctx.moveTo(-9, -24); ctx.lineTo(9, -24); ctx.lineTo(9, 52);
  ctx.quadraticCurveTo(0, 66, -9, 52); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#999'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(0, 50); ctx.stroke();
  ctx.restore();
}

function drawTree(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#5a3a1e';
  ctx.fillRect(-6, -40, 12, 40);
  const cols = ['#c0392b', '#e07840', '#d9a83a'];
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = cols[i % 3];
    ctx.beginPath(); ctx.arc(-16 + i * 16, -52 - (i % 2) * 10, 20, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawPumpkin(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#e07840';
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath(); ctx.ellipse(i * 8, 0, 10, 13, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#4a7a2a';
  ctx.fillRect(-2, -16, 4, 8);
  ctx.restore();
}

// ---------- Backgrounds ----------
function drawSky(ctx, w, h, stage, scroll, t) {
  let top, mid, low;
  if (stage === 1) { top = PALETTE.barnSkyTop; mid = PALETTE.barnSkyMid; low = PALETTE.barnSkyLow; }
  else if (stage === 2) { top = PALETTE.kitSkyTop; mid = PALETTE.kitSkyMid; low = PALETTE.kitSkyLow; }
  else { top = PALETTE.skyTop; mid = PALETTE.skyMid; low = PALETTE.skyLow; }
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, top); g.addColorStop(0.55, mid); g.addColorStop(1, low);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  // sun
  ctx.fillStyle = 'rgba(255,240,180,0.9)';
  ctx.beginPath(); ctx.arc(w - 180, 110, 46, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,240,180,0.35)';
  ctx.beginPath(); ctx.arc(w - 180, 110, 66, 0, Math.PI * 2); ctx.fill();
  // drifting clouds
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  for (let i = 0; i < 4; i++) {
    const cx = ((i * 340 - scroll * 0.15) % (w + 300) + w + 300) % (w + 300) - 150;
    const cy = 70 + i * 42;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 60, 16, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 34, cy + 6, 44, 13, 0, 0, Math.PI * 2);
    ctx.ellipse(cx - 36, cy + 7, 40, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // falling leaves
  ctx.fillStyle = 'rgba(200,60,30,0.8)';
  for (let i = 0; i < 10; i++) {
    const lx = ((i * 173 + t * 30) % (w + 40)) - 20;
    const ly = ((i * 97 + t * 55) % (h * 0.7)) + 20;
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(t + i);
    ctx.beginPath(); ctx.ellipse(0, 0, 6, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

function drawGround(ctx, w, h, stage, scroll, groundY) {
  if (stage === 2) {
    // kitchen floor: checkered tiles
    ctx.fillStyle = '#c9a882'; ctx.fillRect(0, groundY, w, h - groundY);
    ctx.fillStyle = '#8a6a4a';
    const tile = 64;
    const off = Math.floor(scroll) % (tile * 2);
    for (let x = -off; x < w; x += tile) {
      for (let y = groundY; y < h; y += tile) {
        if (((x / tile) + (y / tile)) % 2 === 0) ctx.fillRect(x, y, tile, tile);
      }
    }
    ctx.fillStyle = '#5a3a1e'; ctx.fillRect(0, groundY, w, 6);
  } else if (stage === 1) {
    ctx.fillStyle = PALETTE.groundBarn; ctx.fillRect(0, groundY, w, h - groundY);
    ctx.fillStyle = '#5a3a1e';
    for (let x = -((scroll * 1) % 90); x < w; x += 90) ctx.fillRect(x, groundY + 30, 60, 4);
    ctx.fillStyle = '#3a2a18'; ctx.fillRect(0, groundY, w, 6);
  } else {
    ctx.fillStyle = PALETTE.groundFarm; ctx.fillRect(0, groundY, w, h - groundY);
    ctx.fillStyle = PALETTE.groundDirt; ctx.fillRect(0, groundY, w, 14);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    for (let x = -((scroll * 1) % 70); x < w; x += 70) {
      ctx.beginPath(); ctx.ellipse(x, groundY + 60, 26, 5, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
}

function drawBarnBackdrop(ctx, w, groundY, scroll) {
  // big red barn silhouette on the horizon
  const bx = 900 - (scroll * 0.3 % 1600);
  ctx.fillStyle = '#8a2a1e';
  ctx.fillRect(bx, groundY - 190, 220, 190);
  ctx.beginPath(); ctx.moveTo(bx - 12, groundY - 190); ctx.lineTo(bx + 110, groundY - 260); ctx.lineTo(bx + 232, groundY - 190); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#5a1a10';
  ctx.fillRect(bx + 85, groundY - 110, 50, 110);
  ctx.strokeStyle = '#d9d9d9'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(bx + 85, groundY - 110); ctx.lineTo(bx + 135, groundY); ctx.moveTo(bx + 135, groundY - 110); ctx.lineTo(bx + 85, groundY); ctx.stroke();
  // fence line on the horizon
  ctx.fillStyle = PALETTE.woodDark;
  for (let x = -((scroll * 0.5) % 120); x < w; x += 120) ctx.fillRect(x, groundY - 34, 8, 34);
  ctx.fillRect(0, groundY - 30, w, 5);
}

function drawKitchenBackdrop(ctx, w, groundY, scroll) {
  // wall + window + table silhouette
  ctx.fillStyle = '#a8845e'; ctx.fillRect(0, 0, w, groundY);
  ctx.fillStyle = '#c9a882'; ctx.fillRect(0, groundY - 8, w, 8);
  // window with evening sky
  ctx.fillStyle = '#7a5a40'; ctx.fillRect(90, 90, 220, 170);
  ctx.fillStyle = '#f2a65e'; ctx.fillRect(104, 104, 192, 142);
  ctx.fillStyle = '#fff3c0'; ctx.beginPath(); ctx.arc(240, 150, 26, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7a5a40'; ctx.fillRect(194, 104, 12, 142); ctx.fillRect(104, 168, 192, 12);
  // hanging pots
  ctx.strokeStyle = '#3a2a18'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(600, 0); ctx.lineTo(600, 60); ctx.stroke();
  ctx.fillStyle = '#555'; ctx.beginPath(); ctx.arc(600, 84, 26, 0, Math.PI); ctx.fill();
  ctx.fillRect(574, 84, 52, 6);
  // table
  ctx.fillStyle = '#6e4520'; ctx.fillRect(760, groundY - 120, 420, 18);
  ctx.fillRect(780, groundY - 102, 16, 102); ctx.fillRect(1140, groundY - 102, 16, 102);
  // fruit bowl on table
  ctx.fillStyle = '#3a6ea5'; ctx.beginPath(); ctx.ellipse(880, groundY - 128, 46, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.arc(862, -0 + groundY - 140, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e8a83a'; ctx.beginPath(); ctx.arc(884, groundY - 142, 10, 0, Math.PI * 2); ctx.fill();
}
