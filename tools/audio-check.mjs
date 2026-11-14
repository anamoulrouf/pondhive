// Loudness check: plays each SFX and each music state in a build and reports peak / RMS (dBFS) at the output.
//   node tools/audio-check.mjs [file]
import { chromium } from 'playwright-core';
import path from 'node:path'; import os from 'node:os'; import fs from 'node:fs';
const base = path.join(os.homedir(), 'Library/Caches/ms-playwright');
const d = fs.readdirSync(base).filter((x) => /^chromium-\d+$/.test(x)).sort().reverse()[0];
const exe = path.join(base, d, 'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing');
const file = process.argv[2] || 'index.html';
const b = await chromium.launch({ executablePath: exe, args: ['--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage();
const errors = []; p.on('pageerror', (e) => errors.push(e.message));
await p.goto('file://' + path.resolve(file) + '?debug');
await p.waitForFunction(() => window.__ph);
const res = await p.evaluate(async () => {
  GameAudio.unlock(); await GameAudio.ctx.resume();
  const ctx = GameAudio.ctx, an = ctx.createAnalyser(); an.fftSize = 2048;
  (GameAudio.outNode || GameAudio.master).connect(an);
  const buf = new Float32Array(an.fftSize), sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  async function measure(ms) {
    let peak = 0, sum = 0, n = 0; const t0 = performance.now();
    while (performance.now() - t0 < ms) { an.getFloatTimeDomainData(buf); for (const v of buf) { peak = Math.max(peak, Math.abs(v)); sum += v * v; n++; } await sleep(20); }
    const db = (x) => (x > 0 ? (20 * Math.log10(x)).toFixed(1) : '-inf');
    return { peak: db(peak), rms: db(Math.sqrt(sum / Math.max(1, n))) };
  }
  const out = { state: ctx.state, sfx: {}, music: {} };
  gameState = 'paused'; Music.setTrack(null, true); await sleep(1500);   // silence the music for SFX
  const names = ['pew', 'eshot', 'hit', 'hurt', 'whoosh', 'chargeWarn', 'chargeRush', 'chargerPop', 'spreadWarn', 'spreadBurst', 'spreaderPop', 'pop', 'ting', 'hatchPop', 'eggChime', 'cleared', 'roar', 'bossExplode', 'buy'];
  GameAudio.fxMuted = false;
  for (const nm of names) { if (typeof GameAudio[nm] !== 'function') continue; GameAudio.lastPlay = {}; GameAudio[nm](); out.sfx[nm] = await measure(700); await sleep(150); }
  // rapid fire: 4.5 shots/s with berries flying, for 2 s
  let k = 0; const iv = setInterval(() => { GameAudio.pew(); if (k++ % 2) GameAudio.eshot(); }, 220);
  out.sfx.rapidFire = await measure(2000); clearInterval(iv);
  for (const st of [['menu', 0], ['play', 1], ['ending', 0]]) {
    gameState = st[0]; arenaIndex = st[1]; Music.schedule(); await sleep(1800); out.music[st[0]] = await measure(3500);
  }
  return out;
});
console.log(file, JSON.stringify(res, null, 1));
if (errors.length) console.log('ERRORS', errors);
await b.close();
