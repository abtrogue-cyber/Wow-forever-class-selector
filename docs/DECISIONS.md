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
| D13 | 2026-10-18 | TypeScript/tooling versions for the main app. | `npm install` now gives TS 7.0 (native) + Vite 8. Check Vitest/ESLint support before choosing, or pin TS 5.x/6.x. | ⏳ Phase 1 |
| D14 | 2026-10-18 | Show Hardcore in setup as "planning ahead (launches this winter)". | Players are picking HC mains now. | ✅ B1 |
| D15 | 2026-10-18 | Skyborne "Not sure": show Skyborne races with a small penalty, **no "needs pack" badge**. | Your call. The setup question already explains the pack. | ✅ B2 |
| D16 | 2026-10-18 | "Why not…?" uses a hand-picked `popular` flag in the data, labelled "popular picks", with no balance claims. | Community perception is opinion, so we label it as such. | ✅ B6 |
| D17 | 2026-10-18 | Name stays **Forever Main**. Vercel subdomain first, custom domain optional. | Ship fast; a domain can come later. | ✅ B7 |
