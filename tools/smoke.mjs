// End-to-end smoke test through the real UI (clicks and keys), in real time, then step mode for the long parts.
// Fails on any page error or an unexpected game state.  node tools/smoke.mjs [file]
import { chromium } from 'playwright-core';
import path from 'node:path'; import os from 'node:os'; import fs from 'node:fs';
const base = path.join(os.homedir(), 'Library/Caches/ms-playwright');
const d = fs.readdirSync(base).filter((x) => /^chromium-\d+$/.test(x)).sort().reverse()[0];
const exe = path.join(base, d, 'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing');
const file = process.argv[2] || 'index.html';
const b = await chromium.launch({ executablePath: exe, args: ['--use-angle=metal', '--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errors = []; p.on('pageerror', (e) => errors.push(e.message));
await p.goto('file://' + path.resolve(file) + '?debug');
await p.waitForFunction(() => window.__ph);
const log = []; let fails = 0;
const state = () => p.evaluate(() => gameState);
async function expect(label, want) { const s = await state(); const ok = Array.isArray(want) ? want.includes(s) : s === want; if (!ok) fails++; log.push(`${ok ? 'ok  ' : 'FAIL'} ${label}: ${s}`); }
const wait = (ms) => p.waitForTimeout(ms);

await expect('opens on the begin gate', 'begin');
await p.mouse.click(640, 360); await wait(600);
await expect('click starts the intro', 'intro');
log.push('     HUD hidden in intro: ' + await p.evaluate(() => getComputedStyle(document.getElementById('hud')).display));
await p.click('#skipBtn'); await wait(500);
await expect('Skip goes to the menu', 'menu');
log.push('     intro critters left behind: ' + await p.evaluate(() => shooters.concat(chargers, spreaders).filter((e) => e.active).length));
await p.click('#howBtn'); await wait(300); await expect('How to play', 'howto');
await p.click('#howBackBtn'); await wait(300); await expect('back to menu', 'menu');
await p.click('#settingsBtn'); await wait(300); await expect('Settings', 'settings');
const g0 = await p.textContent('#gfxBtn'); await p.click('#gfxBtn'); const g1 = await p.textContent('#gfxBtn');
log.push(`     graphics button: "${g0}" -> "${g1}"`);
await p.click('#gfxBtn'); await p.click('#gfxBtn'); await p.click('#gfxBtn');
await p.click('#soundToggleBtn'); const snd = await p.evaluate(() => localStorage.getItem('pondhive.sound'));
log.push('     sound toggle saved: pondhive.sound=' + snd); await p.click('#soundToggleBtn');
await p.click('#settingsBackBtn'); await wait(300);
// keyboard-only start: Start has focus in the menu
await p.evaluate(() => document.getElementById('startBtn').focus()); await p.keyboard.press('Enter'); await wait(400);
await expect('Enter on Start begins Chapter 1', 'play');
log.push('     tutorial active in Chapter 1: ' + await p.evaluate(() => !!(tutorial && tutorial.active)));
log.push('     chapter sign: ' + await p.textContent('#arenaName'));
await p.keyboard.press('Escape'); await wait(300); await expect('Esc pauses', 'paused');
await p.click('#resumeBtn'); await wait(300); await expect('Resume', 'play');
// each chapter for 15 s of scripted play in step mode
for (let a = 0; a < 13; a++) {
  const r = await p.evaluate((a) => { const ph = window.__ph; ph.stepMode(true); ph.seed(11 + a); ph.goto('play', a); ph.step(900, { script: true, render: true }); return gameState + ' hp=' + Math.round(health) + ' wave=' + waveIndex; }, a);
  log.push(`     chapter ${a + 1} after 15 s: ${r}`);
}
// fail and retry through the real button
await p.evaluate(() => { const ph = window.__ph; ph.goto('play', 1); health = 0; startDefeat(); ph.step(240, { render: true }); });
await expect('defeat leads to the fail card', 'failed');
await p.evaluate(() => window.__ph.stepMode(false)); await p.click('#retryBtn'); await wait(400);
await expect('Retry restarts the chapter', 'play');
// boss to ending
const bossRes = await p.evaluate(() => {
  const ph = window.__ph; ph.stepMode(true); ph.gotoBoss(); ph.step(200, { render: true });
  hurtBoss(boss.x, boss.z, boss.hp + 1); ph.step(150, { render: true });
  const afterBoss = gameState;
  for (let i = 0; i < 12 && gameState !== 'ending'; i++) { if (gameState === 'cleared') clearedT = 99; ph.step(60, { script: false, render: true }); if (gameState === 'upgrade') document.getElementById('continueBtn').click(); }
  return afterBoss + ' -> ' + gameState;
});
log.push('     boss defeated: ' + bossRes);
await p.evaluate(() => { if (gameState !== 'ending') { window.__ph.goto('ending'); } window.__ph.step(950, { render: true }); });
log.push('     polaroid shown: ' + await p.evaluate(() => document.getElementById('victoryScreen').classList.contains('show')));
await p.evaluate(() => window.__ph.stepMode(false)); await p.click('#victoryMenuBtn'); await wait(500);
await expect('Main Menu from the polaroid', ['menu', 'begin']);
// Chapter 13 rematch -> ending -> polaroid Continue -> the twist -> Round 2 on the menu
const loop = await p.evaluate(() => {
  const ph = window.__ph; ph.stepMode(true); ph.goto('play', 12); waveIndex = ARENAS[12].waves.length - 1; wavesScheduled = true;
  pendingSpawns.length = 0; deactivateAllEnemies(); startBossEntrance(); ph.step(150, { render: true });
  const hp = boss.hp; hurtBoss(boss.x, boss.z, boss.hp + 1); ph.step(150, { render: true });
  for (let i = 0; i < 8 && gameState !== 'ending'; i++) { if (gameState === 'cleared') clearedT = 99; ph.step(60, { render: true }); }
  const s1 = gameState; ph.step(900, { render: true });
  const pol = document.getElementById('victoryScreen').classList.contains('show');
  document.getElementById('victoryMenuBtn').click(); ph.step(560, { render: true });
  ph.step(200, { render: true });
  return { rematchHp: Math.round(hp), chapter5Hp: BOSS_HP, afterBoss: s1, polaroid: pol, after: gameState, round: storyRound,
    start: document.getElementById('startBtn').textContent, upgradesKept: JSON.stringify(upgrades) };
});
log.push('     chapter 13 -> loop: ' + JSON.stringify(loop));
if (loop.afterBoss !== 'ending' || loop.after !== 'menu' || loop.round !== 2) fails++;
console.log(log.join('\n'));
console.log(errors.length ? 'PAGE ERRORS:\n  ' + errors.join('\n  ') : 'no page errors');
await b.close();
process.exit(fails || errors.length ? 1 : 0);
