// audio.js — WebAudio synthesis only. No audio files, no network.
'use strict';

const AudioSys = {
  ctx: null,
  muted: false,
  _step: 0,

  ensure() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      } catch (e) { this.ctx = null; }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  },

  _tone(freq, dur, type, vol, slideTo, delay) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + (delay || 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol || 0.18, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  },

  _noise(dur, vol, delay, lowpass) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + (delay || 0);
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.value = vol || 0.12;
    let node = src;
    if (lowpass) {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = lowpass;
      src.connect(f); node = f;
    }
    node.connect(gain); gain.connect(ctx.destination);
    src.start(t0);
  },

  // Tilly's gobble: three fast descending clucks.
  gobble() {
    this._tone(420, 0.09, 'square', 0.14, 260);
    this._tone(380, 0.09, 'square', 0.14, 240, 0.1);
    this._tone(500, 0.14, 'square', 0.16, 180, 0.2);
  },

  pickup() {
    this._tone(660, 0.09, 'sine', 0.16, 990);
    this._tone(990, 0.12, 'sine', 0.14, 1320, 0.08);
  },

  feather() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((n, i) => this._tone(n, 0.14, 'triangle', 0.15, null, i * 0.07));
  },

  jump() {
    this._tone(300, 0.16, 'sine', 0.12, 620);
  },

  step() {
    this._step++;
    if (this._step % 2 === 0) this._noise(0.05, 0.05, 0, 800);
  },

  // Alarm sting when the farmer spots Tilly.
  alarm() {
    this._tone(880, 0.12, 'sawtooth', 0.16, 880);
    this._tone(660, 0.12, 'sawtooth', 0.16, 660, 0.13);
    this._tone(880, 0.12, 'sawtooth', 0.16, 880, 0.26);
    this._tone(660, 0.2, 'sawtooth', 0.18, 660, 0.39);
  },

  hurt() {
    this._tone(220, 0.25, 'sawtooth', 0.2, 90);
    this._noise(0.2, 0.14, 0, 500);
  },

  hide() {
    this._noise(0.18, 0.08, 0, 1200);
    this._tone(180, 0.15, 'sine', 0.1, 140);
  },

  // Victory jingle: a little Thanksgiving fanfare.
  jingle() {
    const notes = [523, 659, 784, 1047, 784, 1047, 1319];
    notes.forEach((n, i) => this._tone(n, 0.22, 'triangle', 0.17, null, i * 0.13));
    this._tone(262, 0.9, 'sine', 0.1, null, 0);
  },

  // Sad trombone for getting caught.
  caught() {
    const notes = [392, 370, 349, 330];
    notes.forEach((n, i) => this._tone(n, 0.3, 'sawtooth', 0.12, n * 0.97, i * 0.28));
  },
};
