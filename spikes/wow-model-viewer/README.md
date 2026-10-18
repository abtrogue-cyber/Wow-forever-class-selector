# Spike A — `wow-model-viewer` in Vite + React

**Verdict: ❌ not clean.** Don't ship it in M1/M2. Backlog alternative: an outbound "see this race on Wowhead" link (no hosting, no proxy).

Time spent: ~45 min (time box 2 h). Tested 2026-10-18 with `wow-model-viewer@1.5.3`, `jquery@3.7.1`, React 19.3, Vite 8.3, Node 24.

## Run it

```bash
npm install
npm run dev        # http://localhost:5180 (?env=live | ?env=classic, &hd=0, &race=1..8, &gender=0|1)
```

## How it has to be wired

1. `window.jQuery` must exist (the library calls a global `jQuery(selector)`). It declares no npm dependencies.
2. Wowhead's `viewer.min.js` must be loaded as a classic `<script>` **before** importing the library. `wow_model_viewer.js` runs `class … extends ZamModelViewer` at import time.
3. All model data is fetched from `window.CONTENT_PATH`. Wowhead's CDN has no CORS headers, so it must be **same-origin**:
   - dev: Vite proxy `/modelviewer → https://wow.zamimg.com` (`vite.config.ts`)
   - prod: a Vercel external rewrite (`{"source":"/modelviewer/:path*","destination":"https://wow.zamimg.com/modelviewer/:path*"}`). This works, but every byte counts toward **our** Vercel bandwidth.

See `src/loadZam.ts` for the load order.

## Findings

| Check | Result |
|---|---|
| Works in Vite/React | ✅ with the wiring above (lazy, one env per page load) |
| jQuery | Required as a global. jQuery 4 untested, README targets 3.x → pin 3.7.1 |
| CORS / proxy | Required (dev proxy works). Prod needs a Vercel rewrite → we'd re-serve Wowhead/Blizzard files from our domain |
| **Classic env** | ❌ **Broken.** Wowhead's classic viewer asks for `mo3/<id>.mo3` → 404. The CDN now has those files under `m2/`. Nothing renders. |
| **Live env** (retail models) | ✅ Renders. Race/gender switch works. `updateItemViewer` swaps gear without a reload (chest ✅; the README's helm id showed nothing). |
| **Old (2004) vs HD models** | Only **HD (retail)**. `hd: false` with the live viewer still loads HD meshes, so there's no original-model look for an SD/HD riff. (The old `.m2` files are on the CDN, but the character metadata points to HD meshes.) |
| **Skyborne** | ❌ Not available. It's a Forever-only race with no player model in the retail data set. |
| Performance | ❌ **~12–13 MB per character** (the HD human `.m2` alone is 12 MB, served uncompressed) + 800 KB viewer script. Every race/gender switch downloads another ~12 MB mesh. Unusable on mobile data. |
| Stability | ⚠️ Built on Wowhead's *minified* viewer. Internal property chains (`renderer.actors[0].h.P.Q`) break whenever Wowhead redeploys, and the README says so. The classic env is already broken. The README's gender mapping is inverted (`0` = male here). The library logs heavily to the console. |
| Terms / IP | ⚠️ Models and textures are Blizzard's; hosting and tooling are Wowhead's (ZAM Network). We found no public permission for third-party embedding or proxying, and the library author recommends "personal or small-scale" use only. Proxying conflicts with our IP-hygiene rule (§14). |

## Recommendation

- **Drop A** as a feature. Keep **B (original stylized heroes)** as the only 3D path.
- Backlog: "View this race in-game" as an **outbound link** to Wowhead's dressing room/race page (zero hosting, zero legal risk). Revisit only if Wowhead adds Forever/Skyborne data *and* grants permission.
