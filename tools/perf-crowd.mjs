// Crowd benchmark at 1440p: chapter CH (default 4) with N froglets (default 10) and 4 eggs.
import { chromium } from 'playwright-core';
import path from 'node:path'; import os from 'node:os'; import fs from 'node:fs';
const base = path.join(os.homedir(), 'Library/Caches/ms-playwright');
const d = fs.readdirSync(base).filter((x) => /^chromium-\d+$/.test(x)).sort().reverse()[0];
const exe = path.join(base, d, 'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing');
const b = await chromium.launch({ executablePath: exe, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 2560, height: 1440 } });
await p.goto('file://' + path.resolve('pondhive.html') + '?debug&tier=high');
await p.waitForFunction(() => window.__ph);
console.log(await p.evaluate((args) => { const N = args.n; const ph = window.__ph; ph.stepMode(true); ph.seed(3); ph.goto('play', args.ch); for (let i = 0; i < N; i++) spawnCompanion(-3 + i * 0.6, 3); for (let i = 0; i < 4; i++) spawnEggAt(-4 + i * 2, -3); ph.step(240, { script: true }); return JSON.stringify(ph.bench(120)); }, { n: +(process.env.N || 10), ch: +(process.env.CH || 4) - 1 }));
await b.close();
