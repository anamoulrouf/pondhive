// PondHive capture + parity tool.
//   node tools/capture.mjs shots  [--out captures/phase0] [--file pondhive.html] [--tier high]
//   node tools/capture.mjs parity [--steps 3600] [--arena 1]
//   node tools/capture.mjs perf   [--file pondhive.html]
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2);
const mode = args[0] || 'shots';
const opt = (name, def) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : def; };

function findChrome() {
  const base = path.join(os.homedir(), 'Library/Caches/ms-playwright');
  const dirs = fs.readdirSync(base).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse();
  for (const d of dirs) {
    const p = path.join(base, d, 'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing');
    if (fs.existsSync(p)) return p;
  }
  throw new Error('No cached Chromium found');
}

async function openGame(browser, file, extra = '') {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const url = 'file://' + path.join(ROOT, file) + '?debug' + extra;
  await page.goto(url);
  await page.waitForFunction(() => window.__ph && window.__ph.version >= 1, null, { timeout: 20000 });
  return { page, errors };
}

const launch = () => chromium.launch({ executablePath: findChrome(), headless: true,
  args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });

// ---------------------------------------------------------------- parity
async function parity() {
  const steps = +opt('steps', 3600), arena = +opt('arena', 1), seed = +opt('seed', 42);
  const scenario = opt('scenario', 'arena');
  const browser = await launch();
  const runs = [];
  for (const file of ['baseline/game-turn-22.html', opt('file', 'pondhive.html')]) {
    const { page, errors } = await openGame(browser, file);
    const trace = await page.evaluate(({ steps, arena, seed, scenario }) => {
      const ph = window.__ph;
      ph.stepMode(true);
      ph.seed(seed);
      if (scenario === 'boss') ph.gotoBoss(); else ph.goto('play', arena);
      ph.stepCount = 0;
      const out = [];
      for (let i = 0; i < steps; i += 60) { ph.step(60, { script: true }); out.push(ph.snapshot()); }
      return out;
    }, { steps, arena, seed, scenario });
    runs.push({ file, trace, errors });
    await page.close();
  }
  await browser.close();
  const [a, b] = runs;
  let firstDiff = -1;
  for (let i = 0; i < a.trace.length; i++) {
    if (JSON.stringify(a.trace[i]) !== JSON.stringify(b.trace[i])) { firstDiff = i; break; }
  }
  const last = a.trace[a.trace.length - 1];
  console.log(`parity scenario=${scenario} arena=${arena} steps=${steps} seed=${seed}`);
  console.log(`  baseline end: state=${last.state} wave=${last.wave} hp=${last.health} pearls=${last.pearls} eshots=${last.eshots.length}`);
  for (const r of runs) if (r.errors.length) console.log(`  ERRORS in ${r.file}:\n    ` + r.errors.slice(0, 5).join('\n    '));
  if (firstDiff < 0 && !runs.some((r) => r.errors.length)) { console.log('  PARITY OK: all', a.trace.length, 'snapshots identical'); return 0; }
  if (firstDiff >= 0) {
    console.log(`  PARITY FAIL at snapshot ${firstDiff} (step ${(firstDiff + 1) * 60})`);
    console.log('  baseline:', JSON.stringify(a.trace[firstDiff]).slice(0, 600));
    console.log('  pondhive:', JSON.stringify(b.trace[firstDiff]).slice(0, 600));
  }
  return 1;
}

// ---------------------------------------------------------------- screenshots
const SHOTS = [
  ['01-begin', (ph) => ph.goto('begin'), 30],
  ['02-intro', (ph) => ph.goto('intro'), 420],
  ['03-menu', (ph) => ph.goto('menu'), 90],
  ['04-howto', (ph) => ph.goto('howto'), 30],
  ['05-settings', (ph) => ph.goto('settings'), 30],
  ['06-arena1', (ph) => ph.goto('play', 0), 240, true],
  ['07-arena2', (ph) => ph.goto('play', 1), 420, true],
  ['08-arena3', (ph) => ph.goto('play', 2), 420, true],
  ['09-arena4', (ph) => ph.goto('play', 3), 420, true],
  ['10-arena5', (ph) => ph.goto('play', 4), 420, true],
  ['11-boss', (ph) => ph.gotoBoss(), 600, true],
  ['12-pause', (ph) => ph.goto('pause', 1), 1],
  ['13-upgrade', (ph) => ph.goto('upgrade', 1), 1],
  ['14-fail', (ph) => ph.goto('fail', 1), 120],
  ['15-ending', (ph) => ph.goto('ending'), 600],
  ['20-hero-close', (ph) => { ph.goto('play', 1); setLook('meadow'); ph.cam([frog.x + 1.6, 3.1, frog.z + 4.6], [frog.x, 0.95, frog.z]); }, 2],
  ['21-hero-side', (ph) => { ph.goto('play', 1); setLook('meadow'); frog.heading = frog.aimHeading = 0.9; ph.cam([frog.x + 4.2, 2.4, frog.z + 1.2], [frog.x, 0.9, frog.z]); }, 2],
  ['22-perch-close', (ph) => { ph.goto('play', 1); setLook('meadow'); deactivateAllEnemies(); pendingSpawns.length = 0; var e = ph.spawn('S', 0, -4); frog.x = 0; frog.z = 0; ph.cam([1.8, 2.8, -0.6], [0, 1.0, -4]); }, 30],
  ['23-perch-warn', (ph) => { ph.goto('play', 1); setLook('meadow'); deactivateAllEnemies(); pendingSpawns.length = 0; var e = ph.spawn('S', 0, -4); e.state = 'warn'; e.warnDur = 0.55; e.timer = 0.2; ph.cam([1.8, 2.8, -0.6], [0, 1.0, -4]); }, 12],
  ['24-diorama-low', (ph) => { ph.goto('play', 0); ph.cam([0, 7, 19], [0, 0.5, -2]); }, 30],
  ['25-face-on', (ph) => { ph.goto('play', 1); setLook('meadow'); deactivateAllEnemies(); pendingSpawns.length = 0; frog.x = 0; frog.z = 2; frog.heading = frog.aimHeading = 0; ph.cam([0.4, 2.2, 6.2], [0, 0.85, 2]); }, 2],
  ['26-hero-and-perch', (ph) => { ph.goto('play', 1); setLook('meadow'); deactivateAllEnemies(); pendingSpawns.length = 0; ph.spawn('S', 2.4, -1.5); frog.x = -1.2; frog.z = 1.2; ph.cam([-0.5, 4.2, 8.2], [0.4, 0.8, 0]); }, 20],
  ['30-sign', (ph) => { ph.goto('play', 0); ph.cam([-10.8, 2.6, 13.2], [-13.9, 1.0, 8.6]); }, 30],
  ['31-log', (ph) => { ph.goto('play', 0); ph.cam([11.2, 3.0, 13.6], [15.0, 0.6, 9.4]); }, 30],
  ['32-garden', (ph) => { ph.goto('play', 0); ph.cam([12.4, 3.2, 2.6], [16.6, 0.5, -1.2]); }, 30],
  ['33-dock', (ph) => { ph.goto('play', 1); ph.cam([-12.0, 3.6, 2.0], [-16.0, 0.5, -3.0]); }, 30],
  ['34-picnic', (ph) => { ph.goto('play', 2); ph.cam([3.4, 3.4, -10.4], [3.0, 0.5, -14.6]); }, 30],
  ['35-falls', (ph) => { ph.goto('play', 3); ph.cam([6.2, 3.2, -5.6], [10.8, 1.2, -11.0]); }, 30],
  ['36-lanterns', (ph) => { ph.goto('play', 4); ph.cam([0, 6.5, 15], [0, 0.5, -2]); }, 30],
  ['37-life', (ph) => { ph.goto('play', 0); ph.cam([-6, 4.5, -4], [-11.5, 0.5, -10.5]); }, 30],
];
async function shots() {
  const file = opt('file', 'pondhive.html');
  const out = path.join(ROOT, opt('out', 'captures/latest'));
  const only = opt('only', null);
  const tier = opt('tier', null);
  fs.mkdirSync(out, { recursive: true });
  const browser = await launch();
  const { page, errors } = await openGame(browser, file, tier ? '&tier=' + tier : '');
  for (const [name, go, steps, script] of SHOTS) {
    if (only && !name.includes(only)) continue;
    await page.evaluate(({ src, steps, script }) => {
      const ph = window.__ph;
      ph.stepMode(true); ph.seed(7); ph.stepCount = 0; ph.cam(null); ph.aim(null);
      (0, eval)('(' + src + ')')(ph);
      ph.step(steps, { script, render: true });
    }, { src: go.toString(), steps, script: !!script });
    await page.waitForTimeout(450);
    await page.screenshot({ path: path.join(out, name + '.png') });
    process.stdout.write(name + ' ');
  }
  console.log('\nsaved to', path.relative(ROOT, out));
  if (errors.length) { console.log('ERRORS:\n  ' + errors.join('\n  ')); }
  await browser.close();
  return errors.length ? 1 : 0;
}

// ---------------------------------------------------------------- perf (real-time frames)
async function perf() {
  const file = opt('file', 'pondhive.html'), tier = opt('tier', null);
  const vw = +opt('w', 2560), vh = +opt('h', 1440);
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: vw, height: vh }, deviceScaleFactor: 1 });
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('file://' + path.join(ROOT, file) + '?debug' + (tier ? '&tier=' + tier : ''));
  await page.waitForFunction(() => window.__ph && window.__ph.version >= 1);
  const t0 = Date.now();
  const res = await page.evaluate(() => {
    const ph = window.__ph; ph.stepMode(true); ph.seed(3); ph.gotoBoss(); ph.stepCount = 0;
    ph.step(600, { script: true });
    return ph.bench(120);
  });
  console.log(`perf ${file} ${vw}x${vh} tier=${res.tier}: render p50=${res.p50.toFixed(2)}ms p90=${res.p90.toFixed(2)}ms draws=${res.draws} tris=${res.tris}`);
  if (errors.length) console.log('ERRORS:\n  ' + errors.join('\n  '));
  await browser.close();
  return 0;
}

const code = await ({ parity, shots, perf }[mode] || shots)();
process.exit(code);
