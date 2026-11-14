// PondHive debug harness (identical in pondhive.html and baseline/game-turn-22.html).
// Active only with ?debug in the URL. Lets tools/capture.mjs jump to any state, step the
// fixed-timestep loop deterministically, and read a gameplay snapshot for parity checks.
(function () {
  if (!/[?&]debug\b/.test(location.search)) return;
  var PH = window.__ph = { version: 1 };
  var stepping = false, fakeNow = 0, aimOverride = null;
  var realDraw = draw;
  draw = function (t) { if (stepping) { requestAnimationFrame(draw); return; } realDraw(t); };
  var realComputeAim = computeAim;
  computeAim = function () {
    if (aimOverride) { aimPoint = [aimOverride[0], aimOverride[1]]; return; }
    realComputeAim();
  };
  // mulberry32: deterministic stand-in for Math.random during parity runs.
  PH.seed = function (n) {
    var s = (n >>> 0) || 1;
    Math.random = function () {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  PH.stepMode = function (on) { stepping = PH.stepping = !!on; fakeNow = 0; lastMs = 0; accumulator = 0; };
  PH.aim = function (p) { aimOverride = p ? [p[0], p[1]] : null; };
  function frame(render) {
    var raf = window.requestAnimationFrame;
    window.requestAnimationFrame = function () { return 0; };
    window.__phSkipRender = !render;
    fakeNow += 1000 / 60;
    try { realDraw(fakeNow); } finally { window.requestAnimationFrame = raf; window.__phSkipRender = false; }
  }
  // Built-in scripted player so both builds receive byte-identical input.
  var DIRS = [['KeyW'], ['KeyW', 'KeyD'], ['KeyD'], ['KeyS', 'KeyD'], ['KeyS'], ['KeyS', 'KeyA'], ['KeyA'], ['KeyW', 'KeyA']];
  PH.scriptInput = function (i) {
    var k = {}; DIRS[Math.floor(i / 40) % 8].forEach(function (c) { k[c] = true; });
    var target = (typeof nearestEnemyTo === 'function') ? nearestEnemyTo(frog.x, frog.z) : null;
    var a = i * 0.05;
    var aim = target ? [target.x, target.z] : [frog.x + Math.cos(a) * 4, frog.z + Math.sin(a) * 4];
    return { keys: k, aim: aim, fire: true, dash: i % 120 === 60 };
  };
  PH.step = function (n, opts) {
    opts = opts || {};
    for (var i = 0; i < n; i++) {
      if (opts.script) {
        var inp = PH.scriptInput(PH.stepCount || 0);
        keys = inp.keys; aimOverride = inp.aim;
        if (gameState === 'play') { mouse.down = inp.fire; if (inp.dash) dashQueued = true; }
      }
      PH.stepCount = (PH.stepCount || 0) + 1;
      frame(!!opts.render && i === n - 1);
    }
  };
  PH.render = function () { frame(true); fakeNow -= 1000 / 60; };
  function r6(v) { return Math.round(v * 1e6) / 1e6; }
  function live(list) {
    return list.filter(function (e) { return e.active; }).map(function (e) { return [r6(e.x), r6(e.z), r6(e.hp)]; });
  }
  PH.snapshot = function () {
    return {
      state: gameState, arena: arenaIndex, wave: waveIndex, health: r6(health), pearls: pearlsTotal,
      arenaTime: r6(arenaTime), frog: [r6(frog.x), r6(frog.z), r6(frog.aimHeading), r6(frog.dashCooldown)],
      shooters: live(shooters), chargers: live(chargers), spreaders: live(spreaders),
      boss: boss.active ? [r6(boss.x), r6(boss.z), r6(boss.hp), boss.state] : null,
      eshots: enemyShots.filter(function (s) { return s.active; }).map(function (s) { return [r6(s.x), r6(s.z)]; }),
      pshots: projectiles.filter(function (p) { return p.active; }).length,
      eggs: eggs.filter(function (e) { return e.active; }).length,
      comps: companions.filter(function (c) { return c.active; }).map(function (c) { return [r6(c.x), r6(c.z)]; }),
      pearlsOnPad: pearls.filter(function (p) { return p.active; }).length
    };
  };
  function leaveIntro() {
    document.getElementById('beginScreen').classList.add('hide');
    if (gameState === 'intro') cleanupIntro();
    if (gameState === 'ending') finishEnding();
  }
  PH.goto = function (state, arena) {
    leaveIntro();
    if (state === 'begin') { document.getElementById('beginScreen').classList.remove('hide'); gameState = 'begin'; return; }
    if (state === 'intro') { startIntro(); return; }
    if (state === 'ending') { hideAllScreens(); startEnding(true); return; }
    if (state === 'menu' || state === 'howto' || state === 'settings') {
      resetArena(true);
      if (state === 'howto') document.getElementById('howBtn').click();
      if (state === 'settings') document.getElementById('settingsBtn').click();
      return;
    }
    // Arena states.
    arenaIndex = arena || 0;
    if (arenaIndex > 0) tutorial.done = { 1: true, 2: true, 3: true, 4: true, 5: true };
    hideAllScreens();
    clearCompanions(true);
    resetArena(false, true);
    if (state === 'pause') pauseGame();
    if (state === 'upgrade') { gameState = 'upgrade'; showUpgradeScreen(); }
    if (state === 'fail') { health = 0; startDefeat(); }
  };
  PH.spawn = function (kind, x, z) { return spawnEnemyKind(kind, x === undefined ? 0 : x, z === undefined ? -5 : z); };
  // Arena 5 with its waves skipped: the Great Pike rises straight away.
  PH.gotoBoss = function () {
    PH.goto('play', 4);
    pendingSpawns.forEach(function (p) { if (p.ring) p.ring.alpha = 0; if (p.orb) p.orb.alpha = 0; });
    pendingSpawns.length = 0; deactivateAllEnemies();
    waveIndex = ARENAS[4].waves.length - 1; wavesScheduled = true;
    startBossEntrance();
  };
  // GPU-synced render cost: render n frames, forcing completion with a 1-pixel readback each time.
  PH.bench = function (n) {
    var px = new Uint8Array(4), t = [];
    for (var i = 0; i < n; i++) {
      var t0 = performance.now(); PH.step(1, { script: true, render: true });
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); t.push(performance.now() - t0);
    }
    t.sort(function (a, b) { return a - b; });
    return { p50: t[t.length >> 1], p90: t[Math.floor(t.length * 0.9)],
      draws: typeof gfx !== 'undefined' ? gfx.draws : null, tris: typeof gfx !== 'undefined' ? Math.round(gfx.tris) : null,
      tier: typeof gfx !== 'undefined' ? gfx.tier : 'n/a' };
  };
  PH.cam = function (eye, at) { window.__phCam = eye ? [eye, at || [0, 0, 0]] : null; };
  PH.info = function () { return { items: items.length, w: canvas.width, h: canvas.height, state: gameState }; };
})();
