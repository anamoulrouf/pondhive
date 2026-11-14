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
| World | Water `#9ad8e2`→`#5aaecb`, pad `#97c460` centre → `#70aa4c` edge, lip `#b2db7c`, grass `#9fd27a`, moss `#8cbf5a`, sand `#e8d3a8`, rock `#bab4aa`, bark `#8a6446`, blossom `#f6b8c8`, willow `#8fc46a` | Rounded, pressed, soft |
| UI | Paper `#fbf4e4`, ink `#4a3b2a`, button `#7cc36a`, accent `#f7d55a` | Storybook cards, puffy clay buttons |

Rules: orange-red with a dark ring is danger and nothing else. Gold is gone (pearls are cream). Mint is friendly.
The pad sits at mid luminance so light droplets and dark-ringed berries both stand out. The pad never blurs.

## Materials (renderer 2.0)
- **clay**: half-Lambert, warm key / cool fill, fresnel rim, warm light-to-shadow edge, two-scale thumbprint texture and a gentle normal wobble, contact darkening near the ground.
- **gloss**: eyes, watering can. **jelly**: Perch helmet, eggs (fresnel transparency). **pearl**: view-angle sheen.
- **pad**: real lily-pad leaf — yellow-green clay with a brighter centre, a V-notch and midrib slit at the back (`PAD_NOTCH`, cosmetic only: a narrow wedge about 1.3 units deep and 1.5 wide at the rim; the playable circle is unchanged, so a frog hugging the back edge can overlap the wedge slightly), 14 softly curved main veins plus fine secondaries, low-frequency mottling, and a wavy rolled rim with a light lip that marks the edge.
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

## World (Phase 3)
- **Water** is a polar grid whose vertex colour stores *shallowness* (near the pad, the banks, rocks and lily pads). The shader maps it to a turquoise deep→shallow gradient, with drifting ripple contour lines that ring every shore and soft shore foam. In the dusk look it adds sparse rain rings.
- **Banks** carry shoreline rocks, flowering bushes, tall flower patches, toadstools, a wooden **PondHive** sign (its letters are rasterised from a canvas at load time and pressed in as geometry, with no textures or fonts fetched), a mossy log with a ladder, and a birdhouse.
- **Per-arena props.** Only the current arena's set shows (`showArenaProps`):

  | Arena | Look | Props |
  |---|---|---|
  | 1 | meadow | tulip bed, picket fence, watering can |
  | 2 | noon | dock, extra reeds |
  | 3 | golden | picnic blanket, tea set, cake, basket |
  | 4 | sunset | waterfall |
  | 5 | dusk | paper lanterns, drizzle |

- **Pond life**:
  - five fish cruise at the surface, and one leaps now and then
  - three dragonflies
  - three butterflies (hidden at dusk, when the fireflies come out)
- **Determinism.** The new decor uses its own seeded generator (`drand`), and all animation runs on `ambientTime`. Gameplay never sees any of it.
- **Budget.** Small decor (grass, flowers, toadstools) lives in a separate mesh that casts no shadow. The boss fight is about 372k triangles across both passes and 178 draws.
- **Boss dimming.** It now goes only part of the way (`dimK`), so the daylight looks never go murky.

## Frogs, eggs and pickups (Phase 4)
- **Hero actions** are all cosmetic and read existing timers:
  - **Hop:** squash and stretch, as before.
  - **Dash:** a belly-slide lean (`heroRig.slideK`) with a translucent clay afterimage.
  - **Hurt:** squeezed > < eyes while `hurtT > 0.2`.
  - **Defeat:** the frog flops onto its back with X eyes and a tear.
  - **Cleared:** a cheer, with the watering can raised and the bandana fluttering.
- **Froglets** use the hero's frog model (`buildFrogModel('froglet')`): mint palette, half size, a lighter level of detail, with the bandana tails baked in. That is two draws each.
  - **Goodbye:** a wiggle, then a leap-and-dive while fading.
  - All of this is a visual offset only. `c.x` and `c.z` are never changed, so parity holds.
- **Eggs** are clear jelly frogspawn with a tadpole circling inside, over a soft mint ring. Hatch shards are mint jelly.
- **Pickups and shots:**
  - **Pearls:** cream, using the pearl material.
  - **Sparkles:** cream; the old gold is gone.
  - **Hero shots:** water droplets (round nose, tapered tail, pale with an aqua edge) with a mist trail.
  - **Froglet shots:** mint bubbles.

### Budgets
- The **hero's shadow** is drawn from the froglet mesh (`item.shadowMesh`), which has the same silhouette at a fifth of the triangles.
- **Low decor** (banks, rocks, moss, lily pads) casts no shadow.
- **`tools/perf-crowd.mjs`** benchmarks Arena 4 mid-fight with N froglets and 4 eggs. With 10 froglets it measures 281 draws, 395k triangles and a p90 of about 14 ms on High at 1440p.
- **`tools/tri-report.mjs`** lists triangles by item group.
