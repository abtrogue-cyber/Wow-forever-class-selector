# Decision Log

Short entries, newest at the bottom. **Status:** ✅ decided · ⏳ open. "Bn" refers to `OPEN_QUESTIONS.md` §B.

| # | Date | Decision | Why | Status |
|---|---|---|---|---|
| D1 | 2026-10-18 | **3D = our own R3F heroes only.** Drop `wow-model-viewer`. | Spike A: classic models 404, no old models, no Skyborne, ~12 MB per character, depends on Wowhead's minified internals, needs a proxy re-serving Wowhead/Blizzard files without permission. Spike B hit the look at 60 fps with a 271 KB gzip lazy chunk. | ✅ |
| D2 | 2026-10-18 | Keep the **28 builds**. Shockadin, Enhancement off-tank, Lone Wolf and Voidwalker tanking become flags/notes, not builds. | The beta adds no new dedicated role; variants would need data we don't have yet. | ✅ B4 |
| D3 | 2026-10-18 | **14 axes:** add `burst` + `armor`, drop `gearDependence`, fold mobility into survivability/range. Modes `closeness` vs `atLeast`. Raid weight × 0.7 until Dec 9. | Every axis is fed by a question; no unsupported axis. | ✅ |
| D4 | 2026-10-18 | Skyborne = **two race entries**: High Order (Alliance, Mage) and Windshaper (Horde, Shaman). | Official race article; their racials and class lists differ. | ✅ |
| D5 | 2026-10-18 | Racials use the **Oct 15 beta values**. `meta.gameState = "Beta"` until the launch re-check. | Latest official numbers (Blizzard dev notes). | ✅ |
| D6 | 2026-10-18 | Class colors = modern `RAID_CLASS_COLORS`, `verified: false`. | No Forever-specific source yet. | ✅ provisional |
| D7 | 2026-10-18 | One **`sources.json` registry**; records reference source ids. | Avoids 100+ duplicated URLs; one place to update access dates. | ✅ |
| D8 | 2026-10-18 | Match % = logistic calibration of an absolute weighted-fit score, constants fitted on persona fixtures in Phase 1. Ties: raw score, then build order. | Great fits 85–97%, no wall of 70s, deterministic. | ✅ |
| D9 | 2026-10-18 | Share code `v1.<base64url>` (bit-packed answers). Old codes always decode; results use current data plus an "updated" notice. | Keeps links working without shipping old data snapshots. | ✅ B5 |
| D10 | 2026-10-18 | "Must be able to heal/tank" is **class-level** and forces the dual-spec partner. | Dual spec at 40 is a Forever-native answer to "I want to heal sometimes". | ✅ B3 |
| D11 | 2026-10-18 | Spikes live in `/spikes` as standalone apps, excluded from the app build. | Keeps evidence reproducible without polluting the app. | ✅ |
| D12 | 2026-10-18 | Routing with **wouter**. Fonts: **Cinzel** (display) + **Alegreya Sans** (body). | Tiny router for 6 routes. Engraved caps fit the mood without copying game fonts. | ✅ |
| D13 | 2026-10-18 | Pin **TypeScript 7.0.2** (npm `latest`, native compiler), Vite 8.3.4, Vitest 5.0.5. Typecheck with `tsc -p` per project. | Vitest doesn't need tsc, and we use no typescript-eslint, so nothing depends on the old TS API. Typecheck takes about a second. | ✅ |
| D14 | 2026-10-18 | Show Hardcore in setup as "planning ahead (launches this winter)". | Players are picking HC mains now. | ✅ B1 |
| D15 | 2026-10-18 | Skyborne "Not sure": show Skyborne races with a "needs Skyborne pack" badge and a small penalty. | Unsure players still see Skyborne but know it costs extra; a no-purchase race wins close calls. | ✅ B2 |
| D16 | 2026-10-18 | "Why not…?" uses a hand-picked `popular` flag in the data, labelled "popular picks", with no balance claims. | Community perception is opinion, so we label it as such. | ✅ B6 |
| D17 | 2026-10-18 | Name stays **Forever Main**. Vercel subdomain first, custom domain optional. | Ship fast; a domain can come later. | ✅ B7 |
| D18 | 2026-10-18 | `tsx` (dev dependency) runs node scripts such as `scores:review`. | Runs TS + JSON imports directly; tiny and dev-only. | ✅ |
| D19 | 2026-10-18 | Calibration: `match = 100·σ(14.5·(S − 0.72))`, clamped to 5–97. | Fitted on 10 personas: #1 lands at 89–97%, the median build at ~40–60%, #1 − #10 ≥ 15 points. | ✅ |
| D20 | 2026-10-18 | "Why not…?" shows the #1 class's popular spec first (e.g. BM for a Marksmanship result), then the nearest popular misses (one per class), excluded builds last. | Reading of brief §4.5: the "popular picks you'd expect" are more useful than the obviously-wrong lowest ranks. | ✅ |
| D21 | 2026-10-18 | Dual-spec partner for priority #2 = same-class build with the highest score on that priority's axis, tie-break by overall fit. Must-heal/tank still wins first. | Brief §7.7. Otherwise the main role preference made healers pick another healer "for solo play". | ✅ |
| D22 | 2026-10-18 | Production trusts the JSON; Zod validation runs in tests and dev only. | Keeps ~20 KB of Zod out of the user's bundle; CI tests fail on invalid data. | ✅ |
| D23 | 2026-10-18 | Share codes carry engine (mod 16) and data (mod 64) versions; each code version has a frozen answer layout. | Old links decode forever and can show "results updated". | ✅ |
| D24 | 2026-10-18 | Explanations: role reasons go last on DPS cards, the tag that just restates the role is skipped, watch-out templates are relative ("than other picks"). | Found in persona review: generic or overstated sentences. | ✅ |
| D25 | 2026-10-18 | Race ranking: racial need-tags × a needs vector from role + player priorities; look weight 1.5 (a full look match ≈ a strong racial edge); ★ novelty bonus; "not sure" Skyborne −1 + badge. | Look matters to most players unless the racial gap is big. | ✅ |
| D26 | 2026-10-18 | Routes are lazy except the landing page; the landing prefetches the quiz chunk when idle. Id lists live in Zod-free `vocab.ts`; dev validates data at startup via a dynamic import. | Landing JS 191 → 120 KB gzip; data (27 KB) and engine load with the quiz. | ✅ |
| D27 | 2026-10-18 | Result #1 opens fully; #2 and #3 start compact (match, 3 reasons, 1 caveat, best race) with a Details toggle for radar, all races, dual spec and Forever notes. | Full cards were ~1,300 px each on phones. | ✅ |
| D28 | 2026-10-18 | M1 ships without swipe gestures on this-or-that cards (tap + keys 1/2/3 instead) and without the `/galaxy` route. | Both belong to the Phase 3 "wow" work; nothing in M1 depends on them. | ✅ backlog |
| D29 | 2026-10-18 | Quiz progress persists in sessionStorage (Zustand), falling back to memory when storage is blocked. Result pages work from the URL alone. | Refresh-safe quiz; shared links need nothing but the code. | ✅ |

