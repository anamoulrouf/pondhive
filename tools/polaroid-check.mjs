// Plays the ending in step mode to the polaroid, waits for CSS transitions, and saves a screenshot.
import { chromium } from 'playwright-core';
import path from 'node:path'; import os from 'node:os'; import fs from 'node:fs';
const base = path.join(os.homedir(), 'Library/Caches/ms-playwright');
const d = fs.readdirSync(base).filter((x) => /^chromium-\d+$/.test(x)).sort().reverse()[0];
const exe = path.join(base, d, 'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing');
const b = await chromium.launch({ executablePath: exe, args: ['--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
await p.goto('file://' + path.resolve('pondhive.html') + '?debug');
await p.waitForFunction(() => window.__ph);
await p.evaluate(() => { const ph = window.__ph; ph.stepMode(true); ph.seed(7); ph.goto('ending'); for (let i = 0; i < 905; i++) ph.step(1, { render: true }); });
await p.waitForTimeout(1800);
await p.screenshot({ path: process.argv[2] || 'captures/final/77-polaroid-settled.png' });
await b.close();
