# PondHive art bible

**Look in one line:** hand-pressed clay miniatures in a sunny storybook pond, photographed with a soft tilt-shift lens.
Style references: `references/style/1.webp` (sticker sheet), `2.webp` and `3.webp` (storybook pond spreads).

## Colour = role
| Role | Colour | Shape language |
|---|---|---|
| Hero frog | Leaf green `#76c656`, belly `#d3eb9e`, cheeks `#f0849a`, bandana `#f7d55a` with cream dots `#fff3c4` | Biggest frog, pear body, blue watering can, faint cream ring underfoot |
| Froglets | Mint `#72dcc2`, belly `#d6f7ea`, tiny yellow bandana | Small and round |
| Player shots | Droplet `#eefcff`, aqua edge `#7fd6f0` | Teardrop, light |
| Eggs | Clear jelly, mint glow `#bff5e2` | Wobbly sphere, pulse ring |
| Pearls | Cream `#fff6df`, pink-blue sheen | Shiny sphere |
| Critters | Coral `#f2795f`, crab red `#e5574a`, puffer peach `#f4a46b` | Grumpy brows, cheeky faces |
| **Enemy shots (danger only)** | Orange `#ff6a3d` core in a plum ring `#5a1e2e`, amber halo/telegraph `#ffb347` | Round "sour berry" with a dark ring |
| World | Water `#9ad8e2`→`#5aaecb`, pad `#63ab55`, grass `#9fd27a`, moss `#8cbf5a`, sand `#e8d3a8`, rock `#bab4aa`, bark `#8a6446`, blossom `#f6b8c8`, willow `#8fc46a` | Rounded, pressed, soft |
| UI | Paper `#fbf4e4`, ink `#4a3b2a`, button `#7cc36a`, accent `#f7d55a` | Storybook cards, puffy clay buttons |

Rules: orange-red with a dark ring is danger and nothing else. Gold is gone (pearls are cream). Mint is friendly.
The pad sits at mid luminance so light droplets and dark-ringed berries both stand out. The pad never blurs.

## Materials (renderer 2.0)
- **clay**: half-Lambert, warm key / cool fill, fresnel rim, warm light-to-shadow edge, two-scale thumbprint texture and a gentle normal wobble, contact darkening near the ground.
- **gloss**: eyes, watering can. **jelly**: Perch helmet, eggs (fresnel transparency). **pearl**: view-angle sheen.
- **pad**: clay ground + per-pixel radial veins, lighter centre, cream inner edge line.
- **water**: shallow→deep gradient, caustics, ripple rings, foam ring at the pad, sun glint.

## Lighting looks
| Arena | Look | Light |
|---|---|---|
| 1 Lily Meadow | `meadow` | spring morning (tuned in Phase 2) |
| 2 Reed Hollow | `noon` | bright noon |
| 3 Willow Bend | `golden` | golden afternoon |
| 4 Blossom Falls | `sunset` | pink sunset |
| 5 Pike's Deep | `dusk` | overcast dusk, fireflies |
Looks 2–5 get their full pass in Phase 3.

## Style scorecard (0–2 each, target ≥ 13/14)
| | Phase 2 slice |
|---|---|
| Shape: chubby, rounded, no neck | 2 |
| Face: glossy eyes + catchlights, blush, smile | 2 |
| Material: soft clay, matte sheen | 2 |
| Light: warm key, soft shadows | 2 |
| Palette: pastel, on-bible | 2 |
| Composition: reads as a miniature diorama | 1: gameplay view still sparser than the storybook spreads (Phase 3: sign, log, stream, denser flowers) |
| Charm: props and activities | 1: activities (reading, tea, picnic, photos) arrive with the menu and ending in Phase 7 |
| **Total** | **12 / 14** |
