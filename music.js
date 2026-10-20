// Background music. Plays assets/music.mp3 when present; otherwise a soft music-box
// melody (Beethoven, public domain) is synthesized so the page works with no extra file.
(() => {
  'use strict';

  const PREF_KEY = 'flower.music.20-10.v1';
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const NOTE = { C4: 60, E4: 64, G4: 67, A4: 69, B4: 71, C5: 72, D5: 74, E5: 76, G5: 79, 'G#4': 68, 'D#5': 75 };
  const midi = n => 440 * Math.pow(2, (NOTE[n] - 69) / 12);
  // [note, length in beats]; null is a rest.
  const THEME = [['E5', .5], ['D#5', .5], ['E5', .5], ['D#5', .5], ['E5', .5], ['B4', .5], ['D5', .5], ['C5', .5], ['A4', 1.5],
    ['C4', .5], ['E4', .5], ['A4', .5], ['B4', 1.5], ['E4', .5], ['G#4', .5], ['B4', .5], ['C5', 1.5], ['E4', .5],
    ['E5', .5], ['D#5', .5], ['E5', .5], ['D#5', .5], ['E5', .5], ['B4', .5], ['D5', .5], ['C5', .5], ['A4', 1.5],
    ['C4', .5], ['E4', .5], ['A4', .5], ['B4', 1.5], ['E4', .5], ['C5', .5], ['B4', .5], ['A4', 2.5], [null, 2]];
  const BEAT = .42;
  const LOOP = THEME.reduce((sum, [, beats]) => sum + beats, 0) * BEAT;

  let preference;
  try { preference = localStorage.getItem(PREF_KEY); } catch { preference = null; }
  let wantPlaying = preference !== 'off';
  let playing = false;
  let fileFailed = false;
  let ctx, master, nextLoop = 0, timer = 0;

  const audio = new Audio('./assets/music.mp3');
  audio.loop = true;
  audio.volume = .55;
  audio.addEventListener('error', () => { fileFailed = true; if (wantPlaying) start(); });

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'music-toggle';
  button.innerHTML = '<span aria-hidden="true">♪</span>';
  const style = document.createElement('style');
  style.textContent = `.music-toggle{position:fixed;z-index:20;left:max(14px,env(safe-area-inset-left));bottom:max(14px,env(safe-area-inset-bottom));width:44px;height:44px;border-radius:50%;border:1px solid #dcb9c8;background:#fffdfcf2;color:#b4527a;font-size:20px;line-height:1;cursor:pointer;box-shadow:0 3px 16px #76364d14;display:grid;place-items:center;padding:0}
.music-toggle:hover{background:#fae7ef}.music-toggle[aria-pressed="false"]{color:#a99aa3}.music-toggle[aria-pressed="false"]::after{content:"";position:absolute;width:26px;height:2px;background:#a99aa3;transform:rotate(-45deg);border-radius:2px}
.music-toggle[aria-pressed="true"] span{animation:music-bob 1.6s ease-in-out infinite}@keyframes music-bob{50%{transform:translateY(-3px) rotate(-8deg)}}`;
  document.head.append(style);

  function render() {
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? 'Tắt nhạc' : 'Bật nhạc');
  }

  function scheduleLoop() {
    const t0 = Math.max(nextLoop, ctx.currentTime + .05);
    let t = t0;
    THEME.forEach(([name, beats]) => {
      if (name) {
        const freq = midi(name);
        [[1, .2], [2, .06], [3, .02]].forEach(([mult, gain]) => {
          const osc = ctx.createOscillator();
          const env = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq * mult;
          env.gain.setValueAtTime(0, t);
          env.gain.linearRampToValueAtTime(gain, t + .01);
          env.gain.exponentialRampToValueAtTime(.0001, t + 1.6);
          osc.connect(env).connect(master);
          osc.start(t);
          osc.stop(t + 1.7);
        });
      }
      t += beats * BEAT;
    });
    nextLoop = t0 + LOOP;
  }

  function startSynth() {
    if (!AudioCtx) return false;
    if (!ctx) {
      ctx = new AudioCtx();
      master = ctx.createGain();
      master.gain.value = .8;
      master.connect(ctx.destination);
    }
    ctx.resume().then(() => { playing = true; render(); });
    scheduleLoop();
    clearInterval(timer);
    timer = setInterval(() => { if (ctx.currentTime > nextLoop - 3) scheduleLoop(); }, 500);
    return true;
  }

  function start() {
    wantPlaying = true;
    if (!fileFailed) {
      audio.play().then(() => { playing = true; render(); }).catch(err => {
        // NotAllowedError means no user gesture yet; anything else means the file is unusable.
        if (err && err.name !== 'NotAllowedError') { fileFailed = true; start(); }
      });
      return;
    }
    startSynth();
  }

  function stop() {
    playing = false;
    audio.pause();
    if (ctx) { ctx.suspend(); clearInterval(timer); }
    render();
  }

  button.addEventListener('click', event => {
    event.stopPropagation();
    if (playing) { wantPlaying = false; stop(); } else { start(); }
    try { localStorage.setItem(PREF_KEY, wantPlaying ? 'on' : 'off'); } catch { /* storage unavailable */ }
  });

  // Browsers block sound until the first touch or key press, so start on that gesture.
  function firstGesture(event) {
    if (event.target === button) return;
    document.removeEventListener('pointerdown', firstGesture, true);
    document.removeEventListener('keydown', firstGesture, true);
    if (ctx && wantPlaying) ctx.resume();
    if (wantPlaying && !playing) start();
  }
  document.addEventListener('pointerdown', firstGesture, true);
  document.addEventListener('keydown', firstGesture, true);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (playing) { audio.pause(); if (ctx) ctx.suspend(); } }
    else if (playing) { if (fileFailed) { if (ctx) ctx.resume(); } else audio.play().catch(() => {}); }
  });

  render();
  document.body ? document.body.append(button) : document.addEventListener('DOMContentLoaded', () => document.body.append(button));
  if (wantPlaying) start();
})();
