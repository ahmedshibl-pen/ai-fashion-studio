# Basic Studio production assets

The Basic Studio interface renders production reference assets from stable,
typed catalogs. Replace an asset without changing its stable ID or public path
unless the corresponding catalog and tests are updated in the same change.

## Retained production assets

Omar's lighting presets (`male-model-01`) live in:

`/public/images/basic-studio/models/male-model-01/lighting/`

| Stable preset ID | File | Current dimensions | Purpose |
| --- | --- | --- | --- |
| `clean-softbox` | `clean-softbox.webp` | 1792 × 2400 px | Evenly diffused commercial softbox light |
| `top-spotlight` | `top-spotlight.webp` | 1792 × 2400 px | Focused overhead cinematic spotlight |
| `golden-diagonal-beam` | `golden-diagonal-beam.webp` | 1792 × 2400 px | Warm theatrical diagonal beam |
| `cinematic-softbox` | `cinematic-softbox.webp` | 1792 × 2400 px | Warm and cool cinematic softbox light |
| `window-sunlight` | `window-sunlight.webp` | 1792 × 2400 px | Natural light with graphic window shadows |
| `warm-side-beam` | `warm-side-beam.webp` | 1792 × 2400 px | Warm side light on a dark background |
| `digicam-flash` | `digicam-flash.webp` | 1792 × 2400 px | Direct early-2000s editorial flash |
| `hard-fashion-flash` | `hard-fashion-flash.webp` | 1792 × 2400 px | Crisp fashion flash with sharp shadows |

Preset metadata, image paths, thumbnail paths, focal positions, image scales,
translations, transition directions, and accessibility labels are centralized
in `src/features/basic-studio/lighting-presets.ts`.

Every lighting preset declares its compatible model IDs. The current eight
lighting images above belong only to `male-model-01`.

The eight Darla lighting previews (`female-model-01`) live in:

`/public/images/basic-studio/models/female-model-01/lighting/`

| Stable preset ID | File | Current dimensions | Purpose |
| --- | --- | --- | --- |
| `female-clean-softbox` | `clean-softbox.webp` | 1792 × 2400 px | Evenly diffused commercial softbox light |
| `female-top-spotlight` | `top-spotlight.webp` | 1792 × 2400 px | Focused overhead cinematic spotlight |
| `female-golden-diagonal-beam` | `golden-diagonal-beam.webp` | 1792 × 2400 px | Warm theatrical diagonal beam |
| `female-cinematic-softbox` | `cinematic-softbox.webp` | 1792 × 2400 px | Warm and cool cinematic softbox light |
| `female-window-sunlight` | `window-sunlight.webp` | 1792 × 2400 px | Natural light with graphic window shadows |
| `female-warm-side-beam` | `warm-side-beam.webp` | 1792 × 2400 px | Warm side light on a dark background |
| `female-digicam-flash` | `digicam-flash.webp` | 1792 × 2400 px | Direct early-2000s editorial flash |
| `female-hard-fashion-flash` | `hard-fashion-flash.webp` | 1792 × 2400 px | Crisp fashion flash with sharp shadows |

These presets support only `female-model-01`. Male and female presets retain
separate stable IDs, defaults, stored selections, and filtered catalog views.

The typed metadata retains image paths, thumbnail paths, accessibility labels,
and framing values used by the studio workspace.

Future replacement images should:

- use the same model pose, wardrobe, camera, crop, and studio geometry;
- keep the model's head and torso in precisely the same pixel position;
- change only the authored lighting treatment;
- use consistent color management and export quality;
- preserve detail in both the white garment and black trousers;
- avoid baked text, controls, watermarks, or branding.

If framing must change, recalibrate only the corresponding `focalPosition`,
`imageScale`, and `imageTranslation` values in the typed preset configuration.
Do not compensate by stretching an image.

Keep replacements at the same stable paths when possible. A future frontend
can consume higher-resolution replacements without changing the catalog IDs.

## Male pose assets

The six pose previews for `male-model-01` live in:

`/public/images/basic-studio/models/male-model-01/poses/`

| Stable pose ID | File | Dimensions | Purpose |
| --- | --- | --- | --- |
| `male-relaxed-front` | `relaxed-front.webp` | 1792 × 2400 px | Relaxed full-length front pose |
| `male-asymmetric-arm-hold` | `asymmetric-arm-hold.webp` | 1792 × 2400 px | Crossed-leg editorial arm hold |
| `male-hands-clasped-close-up` | `hands-clasped-close-up.webp` | 1792 × 2400 px | Waist-up clasped-hands portrait |
| `male-hands-clasped-full-length` | `hands-clasped-full-length.webp` | 1792 × 2400 px | Full-length clasped-hands pose |
| `male-folded-arms` | `folded-arms.webp` | 1792 × 2400 px | Relaxed folded-arms pose |
| `male-back-turn` | `back-turn.webp` | 1792 × 2400 px | Rear garment view |

Pose metadata, compatibility, paths, descriptions, accessible labels, and
desktop/mobile framing values are centralized in
`src/features/basic-studio/pose-presets.ts`. These WebP files are metadata-free
and remain below 400 KB.

The current six male poses belong only to `male-model-01`.

## Female pose assets

The nine pose previews for `female-model-01` live in:

`/public/images/basic-studio/models/female-model-01/poses/`

| Stable pose ID | File | Dimensions | Purpose |
| --- | --- | --- | --- |
| `female-neutral-front` | `neutral-front-v2.webp` | 1792 × 2400 px | Default full-length front pose |
| `female-crouched-editorial` | `crouched-editorial-v2.webp` | 1792 × 2400 px | Low editorial crouch |
| `female-portrait-hand-detail` | `portrait-hand-detail.webp` | 1792 × 2400 px | Waist-up hand-detail portrait |
| `female-back-view` | `back-view.webp` | 1792 × 2400 px | Rear garment view |
| `female-relaxed-hands` | `relaxed-hands.webp` | 1792 × 2400 px | Relaxed front stance |
| `female-crossed-leg-neck-touch` | `crossed-leg-neck-touch.webp` | 1792 × 2400 px | Crossed-leg neck-touch pose |
| `female-hair-touch-three-quarter` | `hair-touch-three-quarter.webp` | 1792 × 2400 px | Three-quarter hair-touch pose |
| `female-dynamic-hair-turn` | `dynamic-hair-turn.webp` | 1792 × 2400 px | Dynamic hair-turn pose |
| `female-seated-floor` | `seated-floor.webp` | 1792 × 2400 px | Seated floor pose |

All nine files are metadata-free WebP exports below 400 KB and support only
`female-model-01`. The crouched, portrait, and seated images use their own typed
desktop/mobile framing values.

## Future compatibility

The stable lighting, pose, model, and camera IDs already map to trusted prompt
and reference definitions at the server boundary. Preserve those IDs when they
later map to database records or paid workflows. Future desktop/mobile image
variants should be added to the typed preset configuration without changing the
existing selection contract.
