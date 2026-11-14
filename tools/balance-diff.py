# Text-diffs the gameplay tuning between Turn 22 and PondHive: BALANCE, arena waves, hit radii, speeds, timers.
#   python3 tools/balance-diff.py   (exit 1 on any difference)
import re, sys
b = open('baseline/game-turn-22.html').read(); n = open('pondhive.html').read()
bad = 0
def block(src, start, end): i = src.index(start); return src[i:src.index(end, i)]
for name, a, e in [("BALANCE", "var BALANCE = {", "\n};"), ("ARENAS", "var ARENAS = [", "\n];")]:
    bb, nn = block(b, a, e), block(n, a, e)
    if name == "ARENAS": bb, nn = re.findall(r"waves: (\[.*?\]\]),", bb), re.findall(r"waves: (\[.*?\]\]),", nn)[:5]   # chapters 1-5 must match Turn 22
    if name == "BALANCE": bb, nn = re.sub(r"pearlMulPerArena: \[[^\]]*\]", "", bb), re.sub(r"pearlMulPerArena: \[[^\]]*\]", "", nn)
    ok = bb == nn; bad += not ok; print(f"{name:16s} {'IDENTICAL' if ok else 'DIFFERENT'}")
for c in ["FROG_HIT_R","SHOOTER_R","CHARGER_R","SPREADER_R","BOSS_R","PAD_R","PAD_TOP","FROG_RADIUS","IFRAME_TIME","EGG_COLLECT_R",
          "PEARL_COLLECT_R","PEARL_MAGNET_R","HOP_SPEED","HOP_HEIGHT","SHOT_SPEED","FIRE_INTERVAL","DASH_TIME","DASH_COOLDOWN","DASH_SPEED"]:
    pb = re.findall(r"\b" + c + r"\s*=\s*([^,;]+)", b)[:1]; pn = re.findall(r"\b" + c + r"\s*=\s*([^,;]+)", n)[:1]
    ok = pb == pn; bad += not ok; print(f"{c:16s} {'OK' if ok else 'DIFF'} {pb[0] if pb else '-'}")
for t in ["warnDur(0.55)", "warnDur(0.8)", "warnDur(0.65)", "timer = 0.85", "timer = 0.9"]:
    ok = b.count(t) == n.count(t); bad += not ok; print(f"{t:16s} {'OK' if ok else 'DIFF'} x{n.count(t)}")
gb = b.count("Math.random()"); ga = b[b.index("var GameAudio = {"):b.index("\n};", b.index("var Music = {"))].count("Math.random()")
print(f"gameplay Math.random calls: Turn 22 {gb - ga}, PondHive {n.count('Math.random()')}")
bad += (gb - ga) != n.count("Math.random()")


# pearl multipliers for chapters 1-5 must match too
pb = re.findall(r"pearlMulPerArena: \[([^\]]*)\]", b)[0].split(","); pn = re.findall(r"pearlMulPerArena: \[([^\]]*)\]", n)[0].split(",")
ok = [x.strip() for x in pb] == [x.strip() for x in pn[:5]]; bad += not ok; print(f"{'pearl mult 1-5':16s} {'OK' if ok else 'DIFF'}")
sys.exit(1 if bad else 0)
