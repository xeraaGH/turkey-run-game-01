// hud.js — score, distance, lives, stage name and the SPOTTED alert.
'use strict';

const HUD = {
  draw(ctx, game) {
    const st = World.stage();
    // top bar
    ctx.fillStyle = 'rgba(30,18,8,0.55)';
    ctx.fillRect(0, 0, W, 64);
    ctx.fillStyle = '#fff3d0';
    ctx.font = 'bold 26px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('SCORE  ' + game.score, 24, 40);
    ctx.font = '22px Georgia, serif';
    ctx.fillText(Math.floor(game.distance) + ' m', 300, 38);
    // stage name, centred
    ctx.textAlign = 'center';
    ctx.font = 'bold 26px Georgia, serif';
    ctx.fillStyle = '#ffd23a';
    ctx.fillText(st.name, W / 2, 40);
    ctx.font = '15px Georgia, serif';
    ctx.fillStyle = '#fff3d0';
    ctx.fillText(st.sub, W / 2, 58);
    // lives as golden feathers
    ctx.textAlign = 'right';
    ctx.font = 'bold 20px Georgia, serif';
    ctx.fillStyle = '#fff3d0';
    ctx.fillText('LIVES', W - 150, 40);
    for (let i = 0; i < 3; i++) {
      const lx = W - 128 + i * 40;
      if (i < Turkey.lives) {
        drawGoldenFeather(ctx, lx, 40, 0.9, 0);
      } else {
        ctx.save();
        ctx.globalAlpha = 0.3;
        drawGoldenFeather(ctx, lx, 40, 0.9, 0);
        ctx.restore();
      }
    }
    // mute indicator, bottom-right (kept clear of the lives feathers)
    ctx.textAlign = 'right';
    ctx.font = '15px Georgia, serif';
    ctx.fillStyle = AudioSys.muted ? '#ff8a8a' : 'rgba(255,243,208,0.85)';
    ctx.fillText(AudioSys.muted ? 'MUTED (M)' : 'M: sound', W - 16, H - 14);
    // progress bar to freedom
    const barW = 420, barX = (W - barW) / 2, barY = 70;
    ctx.fillStyle = 'rgba(30,18,8,0.55)';
    ctx.fillRect(barX - 4, barY - 4, barW + 8, 14);
    ctx.fillStyle = '#5a3a1e';
    ctx.fillRect(barX, barY, barW, 6);
    ctx.fillStyle = '#ffd23a';
    ctx.fillRect(barX, barY, barW * Math.min(1, game.distance / ESCAPE_DISTANCE), 6);
    ctx.fillStyle = '#fff3d0';
    ctx.font = '13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('ESCAPE', barX + barW + 42, barY + 6);
    // SPOTTED alert (always on in screenshot mode so the staged shot shows it)
    if (Farmer.state === 'chase' || Farmer.spottedFlash > 0) {
      const blink = Game.shot ? true : Math.floor(Date.now() / 220) % 2 === 0;
      if (blink) {
        ctx.save();
        ctx.font = 'bold 40px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ff2a2a';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 7;
        ctx.strokeText('SPOTTED!', W / 2, 150);
        ctx.fillText('SPOTTED!', W / 2, 150);
        ctx.font = '20px Georgia, serif';
        ctx.fillStyle = '#fff';
        ctx.fillText('Run! Hide in a haystack (H) or outrun him!', W / 2, 182);
        ctx.restore();
      }
    }
    // hide hint when near a haystack
    if (game.state === 'play' && !Turkey.hidden && Turkey.nearHaystack()) {
      ctx.save();
      ctx.font = 'bold 20px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#3a2a18'; ctx.lineWidth = 4;
      ctx.strokeText('Press H to hide in the haystack!', W / 2, H - 30);
      ctx.fillText('Press H to hide in the haystack!', W / 2, H - 30);
      ctx.restore();
    }
    // controls reminder, bottom-left
    ctx.textAlign = 'left';
    ctx.font = '15px Georgia, serif';
    ctx.fillStyle = 'rgba(255,243,208,0.85)';
    ctx.fillText('Arrows/WASD move  •  Space jump  •  H hide  •  E gobble corn  •  M mute', 16, H - 14);
  },

  drawTitle(ctx, t) {
    drawSky(ctx, W, H, 0, t * 20, t);
    drawGround(ctx, W, H, 0, 0, GROUND_Y);
    drawBarnBackdrop(ctx, W, GROUND_Y, 0);
    drawHaystack(ctx, 180, GROUND_Y, 1.2);
    drawPumpkin(ctx, 1080, GROUND_Y, 1.1);
    drawPumpkin(ctx, 1140, GROUND_Y, 0.8);
    drawTree(ctx, 1200, GROUND_Y, 1.4);
    // hero turkey + farmer facing off
    drawTurkey(ctx, 480, GROUND_Y, 1.9, { runPhase: Math.sin(t * 2) * 0.4, facing: 1 });
    drawFarmer(ctx, 830, GROUND_Y, 1.5, { runPhase: 0, facing: -1, angry: true });
    ctx.font = 'bold 30px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#5a2a10'; ctx.lineWidth = 6;
    ctx.strokeText('!', 830, GROUND_Y - 250);
    ctx.fillText('!', 830, GROUND_Y - 250);
    // title banner
    ctx.fillStyle = 'rgba(30,18,8,0.72)';
    ctx.fillRect(190, 84, 900, 150);
    ctx.strokeStyle = '#ffd23a'; ctx.lineWidth = 4;
    ctx.strokeRect(190, 84, 900, 150);
    ctx.fillStyle = '#ffd23a';
    ctx.font = 'bold 64px Georgia, serif';
    ctx.fillText('GOBBLE & GONE', W / 2, 150);
    ctx.fillStyle = '#fff3d0';
    ctx.font = 'italic 28px Georgia, serif';
    ctx.fillText('The Great Thanksgiving Breakout', W / 2, 196);
    ctx.font = '20px Georgia, serif';
    ctx.fillText('You are Tilly the turkey. Dinner is at six. Be somewhere else.', W / 2, 224);
    // play prompt
    if (Math.floor(t * 1.6) % 2 === 0) {
      ctx.font = 'bold 30px Georgia, serif';
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#3a2a18'; ctx.lineWidth = 5;
      ctx.strokeText('Press ENTER or CLICK to Play', W / 2, 300);
      ctx.fillText('Press ENTER or CLICK to Play', W / 2, 300);
    }
    ctx.font = '18px Georgia, serif';
    ctx.fillStyle = '#fff3d0';
    ctx.fillText('Arrows / WASD move  •  Space jump  •  H hide in haystacks  •  E gobble corn  •  M mute', W / 2, 668);
    ctx.fillText('Escape the farmyard, the barn and the kitchen — 3 lives, one very hungry farmer.', W / 2, 694);
  },

  drawEnd(ctx, game, escaped) {
    ctx.fillStyle = escaped ? 'rgba(20,60,20,0.82)' : 'rgba(60,16,8,0.85)';
    ctx.fillRect(0, 0, W, H);
    if (escaped) {
      drawSky(ctx, W, H, 0, 0, 1);
      ctx.fillStyle = 'rgba(20,60,20,0.55)';
      ctx.fillRect(0, 0, W, H);
      drawGround(ctx, W, H, 0, 0, GROUND_Y);
      drawTree(ctx, 180, GROUND_Y, 1.6);
      drawTree(ctx, 1080, GROUND_Y, 1.8);
      drawTurkey(ctx, W / 2, GROUND_Y, 2.0, { runPhase: 0.6, facing: 1 });
    } else {
      drawFarmer(ctx, W / 2 - 130, GROUND_Y, 1.8, { runPhase: 0, facing: 1, angry: false });
      drawTurkey(ctx, W / 2 + 90, GROUND_Y, 1.4, { runPhase: 0, facing: -1 });
    }
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd23a';
    ctx.font = 'bold 72px Georgia, serif';
    ctx.strokeStyle = '#3a2a18'; ctx.lineWidth = 8;
    const title = escaped ? 'ESCAPED!' : 'CAUGHT!';
    ctx.strokeText(title, W / 2, 180);
    ctx.fillText(title, W / 2, 180);
    ctx.fillStyle = '#fff3d0';
    ctx.font = 'italic 26px Georgia, serif';
    ctx.fillText(
      escaped ? 'Tilly hops the fence and vanishes into the autumn woods. Dinner is cancelled!'
              : 'The farmer scoops up Tilly. "Well, well — dinner came to me."',
      W / 2, 240);
    ctx.font = 'bold 34px Georgia, serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('FINAL SCORE  ' + game.score, W / 2, 330);
    ctx.font = '22px Georgia, serif';
    ctx.fillStyle = '#fff3d0';
    ctx.fillText('Distance: ' + Math.floor(game.distance) + ' m   •   Corn gobbled: ' + game.cornEaten +
      '   •   Golden feathers: ' + game.feathers, W / 2, 372);
    if (Math.floor(performance.now() / 600) % 2 === 0) {
      ctx.font = 'bold 28px Georgia, serif';
      ctx.fillStyle = '#fff';
      ctx.fillText('Press ENTER or CLICK to play again', W / 2, 470);
    }
  },
};
