// Menu benchmark at 1440p: the hive-at-rest diorama (auto-tier samples here on first load).
import { chromium } from 'playwright-core';
import path from 'node:path'; import os from 'node:os'; import fs from 'node:fs';
const base = path.join(os.homedir(), 'Library/Caches/ms-playwright');
const d = fs.readdirSync(base).filter((x) => /^chromium-\d+$/.test(x)).sort().reverse()[0];
const exe = path.join(base, d, 'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing');
const b = await chromium.launch({ executablePath: exe, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 2560, height: 1440 } });
await p.goto('file://' + path.resolve('index.html') + '?debug&tier=high');
await p.waitForFunction(() => window.__ph);
console.log(await p.evaluate(() => { const ph = window.__ph; ph.stepMode(true); ph.seed(3); ph.goto('menu'); ph.step(60); return 'menu ' + JSON.stringify(ph.bench(120)); }));
await b.close();
