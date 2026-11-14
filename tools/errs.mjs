// Load a build with ?debug and print every page error with its stack (quick diagnosis).
import { chromium } from 'playwright-core';
import path from 'node:path'; import os from 'node:os'; import fs from 'node:fs';
const base = path.join(os.homedir(), 'Library/Caches/ms-playwright');
const d = fs.readdirSync(base).filter((x) => /^chromium-\d+$/.test(x)).sort().reverse()[0];
const exe = path.join(base, d, 'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing');
const b = await chromium.launch({ executablePath: exe, args: ['--use-angle=metal', '--enable-gpu'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
p.on('pageerror', (e) => console.log('PAGEERROR', e.stack || e.message));
p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log(m.type(), m.text()); });
await p.goto('file://' + path.resolve(process.argv[2] || 'index.html') + '?debug');
await p.waitForTimeout(1500);
if (process.argv[3]) console.log(await p.evaluate(process.argv[3]));
await b.close();
