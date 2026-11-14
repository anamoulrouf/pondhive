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

## Critters (Phase 5)
- **Snapjaw Crab** (Charger):
  - **Model:** a chunky red shell with cheeks and a grin, eye-stalks with googly eyes and cheeky brows, two pincer arms and six legs.
  - **Animation** (`crabPartLocal`, driven by the charger's `state` and `bob`):
    - `shake`: claws up and clacking, feet stamping
    - `rush`: claws snapping
    - `dizzy`: claws droop and stars circle its head
- **Puffle the Puffer** (Spreader):
  - **Model:** a peach balloon fish with freckles, blush, googly eyes and a little "o" mouth.
  - **Animation:** 18 spikes sit just under the skin and pop out as `swell` rises; the fins flap and the tail wags.
- **Old Grumblegill** (Great Pike):
  - **Model:**
    - a steel-blue pike with spots and an underbite jaw with upward teeth (the jaw opens on the existing burst warning)
    - heavy grumpy brows and a reed crown with two cattails
  - **Animation:**
    - four body segments and a tail swim on a travelling wave
    - the side fins flare with `warnT`
    - on defeat it rolls belly-up and sinks before the burst
- **Bonks** (`spawnBonk`): when a critter is beaten, a cosmetic copy squashes and wobbles under dizzy stars, then tumbles off with a splash. The puffer zips away spinning instead. The game state (removal, pearls, eggs) is untouched.
- **Spawn telegraph**: an amber dashed ring turns on the pad while bubbles rise where the critter will pop up.
- **Berries** are round, with a soft amber halo instead of the old streak (the "carrots"). They cast no shadow.
- **Debug**: with `?debug`, setting `window.__phHitboxes = true` draws every hit radius as a magenta ring (capture `59-hitbox`).
- **Budgets**: the pad uses a low-poly disc as its shadow proxy. The crowd test (10 froglets, 4 eggs) is 248 draws and 394k triangles; the boss fight is 134 draws and 283k triangles.

## UI (Phase 6)
- **Override layer.** A storybook theme sits on top of the original CSS (the block marked `PondHive storybook theme` at the end of `<style>`), so every id and class the game uses still works.
- **Look**:
  - cream paper cards (`--paper #fbf4e4`) with a dashed stitched edge
  - ink text (`#4a3b2a`) in a rounded type stack (`ui-rounded`, then SF Pro Rounded, then Arial Rounded MT Bold, with fallbacks)
  - puffy clay buttons (deep leaf green, or cream for secondary) that press down on click
  - a sun-yellow focus ring for keyboard use
- **Logo**: puffy clay "PondHive" lettering (layered shadows plus a text stroke), a frog face in inline SVG peeking over the **H**, and frogspawn on a dotless **ı**. It's built once in JavaScript and shared by the begin screen, the menu and the intro title.
- **HUD**:
  - a paper card holding the frog-face health bar, a water-drop dash icon, and the froglet face with its count and timer
  - a paper pearl counter
  - a wooden chapter sign: **Chapter n · Name** with **Critters left**
  - a reed-wrapped boss bar for **Old Grumblegill**
- **Copy**:
  - "Companions" becomes **Froglets**, "Enemies" becomes **Critters**, "Enemy shots" becomes **berries**, and eggs become **frogspawn**
  - "Arena Cleared!" becomes **Chapter Complete!**
  - Upgrade names are unchanged.
- **Contrast**: every body text and button pair is at least 4.5:1 (white on the button at its centre is about 4.5–4.8; ink on paper is 9.8). Large headings are at least 3:1; the fail heading is 4.2.
