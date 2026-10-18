# Spike B — forming hero in React Three Fiber

**Verdict: ✅ go.** This is the baseline for the forming hero, the card reveal backdrop and (later) the Spec Galaxy.

Time spent: ~60 min (time box 2 h). Tested 2026-10-18 with three 0.186.1, @react-three/fiber 9.8.2, drei 10.7.9,
@react-three/postprocessing 3.2.0 (postprocessing 6.39.5), React 19.3.1, Vite 8.3.4.

## Run it

```bash
npm install
npm run dev     # http://localhost:5181   (?no3d forces the 2D fallback)
npm run build   # prints chunk sizes
```

## What's in it

| Piece | How | File |
|---|---|---|
| Fogged silhouette | Our own figure built from primitives (no models). Custom shader: near-black body + **fresnel rim** in the class color (HDR, so Bloom catches it) | `scene/Hero.tsx`, `scene/materials.ts` |
| Forming effect | Progress 0→1 reveals body → armor → cape → weapon (scale + fade, easeOutBack). Fog thins and the rim brightens | `scene/Hero.tsx`, `scene/HeroScene.tsx` (`Driver`) |
| Class color shift | One shared uniform. The rim, pedestal ring and light lerp toward the leading class color | `scene/HeroScene.tsx` |
| Pedestal + night sky | Stacked cylinders + glowing rune ring; gradient sky sphere; exp² fog | `scene/HeroScene.tsx` |
| Fog | Procedural canvas texture (no image assets) on billboarded planes. Wisps in front of the hero stay at ankle height | `scene/FogWisps.tsx` |
| Particle preset "holy" | 480 GPU points (160 on low quality), soft round sprites, additive, twinkle, rising; deterministic seed | `scene/HolyMotes.tsx` |
| Post | Bloom (mipmap blur) + vignette + film grain + ACES tone mapping | `scene/HeroScene.tsx` |
| **SD/HD toggle** | SD = 6-segment geometry + derivative (flat) normals → chunky faceted "2004" look. HD = 32 segments, smooth | `Hero.tsx`, `materials.ts` |
| Scaling down | drei `PerformanceMonitor` → DPR 1, fewer motes, no grain. `prefers-reduced-motion` stops camera sway and fog drift, slows motes | `HeroScene.tsx` |
| No WebGL | WebGL check + `React.lazy` → an SVG silhouette with a CSS glow, shown both as the Suspense fallback and when WebGL is missing | `App.tsx` |

## Numbers

| Metric | Result |
|---|---|
| Entry chunk (React + UI, no 3D) | 224 KB min / **70.6 KB gzip** |
| Lazy 3D chunk (three + R3F + drei + postprocessing) | 1,019 KB min / **271 KB gzip** |
| Time from chunk eval to first frame | ~130–175 ms (dev, desktop) |
| Frame rate | **60 fps** at DPR 1 in the app's browser pane while visible. Throttled to 30 fps while the pane was hidden, which also made PerformanceMonitor drop to low quality. **Not yet measured on a mid-range laptop or phone.** |
| Draw calls | ~25 meshes + 1 points + 14 fog planes + 4 post passes. Light. |

## Learnings for Phase 3

- **Rim shader + bloom is the look.** Keep HDR only on what should glow (rim, ring, motes) with `luminanceThreshold ≈ 1`.
- Transparent fog planes between the camera and the hero wash out the silhouette. Keep front fog low.
- The figure reads as a "mannequin" for now. Phase 3 needs a few silhouette archetypes (robe/caster, plate/shield, leather/dual-wield, mail/bow) plus weapon variants. Our own simple designs.
- 271 KB gzip is OK for a lazy chunk after first paint. If we need to trim: drop drei (we only use `Billboard` and `PerformanceMonitor`, ~30 lines to replace) and consider three's own bloom pass instead of `postprocessing`.
- Load the 3D chunk on `requestIdleCallback` after the landing renders, with the 2D silhouette shown meanwhile. The 2D fallback is also the reduced-data/low-power path.
- TypeScript 7 got installed by default. The spike skips `tsc` (Vite only transpiles). Pick the TS version deliberately in Phase 1.
