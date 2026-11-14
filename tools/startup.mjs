// Startup time: navigation start to the end of the inline script (all meshes built) and to the first rendered frame.
import { chromium } from 'playwright-core';
import path from 'node:path'; import os from 'node:os'; import fs from 'node:fs';
const base = path.join(os.homedir(), 'Library/Caches/ms-playwright');
const d = fs.readdirSync(base).filter((x) => /^chromium-\d+$/.test(x)).sort().reverse()[0];
const exe = path.join(base, d, 'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing');
const b = await chromium.launch({ executablePath: exe, args: ['--use-angle=metal', '--enable-gpu'] });
for (const file of process.argv.slice(2).length ? process.argv.slice(2) : ['pondhive.html']) {
  const runs = [];
  for (let i = 0; i < 3; i++) {
    const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
    await p.goto('file://' + path.resolve(file));
    await p.waitForFunction(() => document.readyState === 'complete');
    await p.waitForTimeout(300);
    runs.push(await p.evaluate(() => Math.round(performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd)));
    await p.close();
  }
  console.log(file, 'script done (ms):', runs.join(', '));
}
await b.close();
