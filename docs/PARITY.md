# Gameplay parity

PondHive must play exactly like Pondswarm Turn 22. This is checked by running both builds
side by side, frame by frame, with the same seed and the same scripted player.

## How it works
- `tools/harness.js` is injected identically into `pondhive.html` and `baseline/game-turn-22.html`
  (`node tools/inject-harness.mjs pondhive.html baseline/game-turn-22.html`). It is inert unless the URL has `?debug`.
- `__ph.seed(n)` replaces `Math.random` with mulberry32; `__ph.stepMode(true)` pauses the real-time loop and
  starts a fake clock at 0, so every build sees identical frame times.
- A built-in scripted player (`__ph.scriptInput`) moves in 8 directions, aims at the nearest enemy, fires
  constantly and dashes every 2 s.
- `__ph.snapshot()` records state, arena, wave, health, pearls, frog, every live enemy (x, z, hp), the boss,
  enemy shots, player shot count, eggs, companions and pearls on the pad, rounded to 1e-6.

## Commands
```
node tools/capture.mjs parity --arena 1 --steps 3600            # Arena 2, 60 s
node tools/capture.mjs parity --arena 3 --steps 3600 --seed 9   # Arena 4
node tools/capture.mjs parity --scenario boss --steps 3600      # the Great Pike
```
All must print `PARITY OK`.

## Rules for new code
- Cosmetic randomness uses `vfxRand()`, never `Math.random`.
- Nothing in `BALANCE`, `ARENAS[].waves`, hit radii or timers changes.
- Animation reads gameplay timers; it never writes gameplay state.

## Proof the check is sensitive
Changing `frogSpeed` from 4.2 to 4.25 fails at the first snapshot (step 60).
