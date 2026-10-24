# CLAUDE.md — Forever Main

Fan-made, very visual class / spec / race finder for **World of Warcraft: Forever** (launch Nov 4, 2026).
Source of truth: [forever-main-kickoff.md](forever-main-kickoff.md). Current plan: [docs/PLAN.md](docs/PLAN.md).

**Status:** Phases 2 and 3 are merged into `main` and live at https://wow-forever-class-selector.vercel.app: the playable MVP with the person-first quiz (M1), plus the quiz compass (D40, replaced the 3D hero), card reveal, Spec Galaxy, result image and link previews (M2, ahead of Sun Nov 1). Share layouts V1 and V2 are published: question changes need `LAYOUT_V3`. The Reddit feedback round ([docs/prompts/reddit-feedback-v2.md](docs/prompts/reddit-feedback-v2.md)) is merged and live: honest reasons (D46), quiz V2 with 12 screens, no healing / no tanking, a race in mind and classes to skip (D47), and balance tuning with `npm run balance` (D48). Warrior and warlock scores get a sourced review after launch. Phase 4, launch hardening (D50), is done: axe accessibility scans, a keyboard fix, Safari (WebKit) e2e runs, a performance check and a data check. Still to do before launch: re-check the data against Blizzard's launch patch notes as soon as they're out (likely Nov 2–4).

**Hosting:** GitHub `abtrogue-cyber/Wow-forever-class-selector` (`origin`). Vercel deploys every push to `main` automatically. Commits use the GitHub noreply email (set in this repo's local git config).

## Working rules (from the brief §0 — always apply)

- Work in **phases**. At the end of each phase: summarize, list decisions and assumptions, commit, then **stop and wait for the go**.
- **Never invent game facts.** All game data lives in JSON with `sources` and `verified`. If unsure → `verified: false` + an entry in `docs/OPEN_QUESTIONS.md`. Classic/retail knowledge only as a labelled assumption.
- Be opinionated: recommend one option and say why in 1–2 sentences.
- **Ask before** adding heavy dependencies or changing the stack.
- Small, reviewable commits with clear messages. Keep this file and `docs/DECISIONS.md` up to date.
- Keep explanations short and practical. When the user must do something by hand (accounts, env vars, deploys), give exact steps.
- Scope rule: anything that threatens M1 (Mon Oct 26) goes to the backlog.
- Each phase gets its own branch (`phase-N`), merged into `main` on the user's go.

## Commands

```bash
npm install
npm run dev            # http://localhost:5173 — /debug is the dev-only engine inspector
npm test               # Vitest: data validation, engine unit tests, 300 random-player invariants, persona snapshots, share codec, components (jsdom)
npm run test:e2e       # Playwright on the production build: quiz smoke test in Chromium and WebKit (phone + desktop), axe scans, keyboard-only run
E2E_FIREFOX=1 npm run test:e2e   # also Firefox (Playwright's Firefox build doesn't start on this Windows 10 machine)
npm run typecheck      # tsc for the app (src) and the node scripts
npm run build          # production build
npm run scores:review  # regenerate docs/SCORES_REVIEW.md after editing builds.json
npm run balance        # regenerate docs/BALANCE.md: #1 role/class shares, per-answer flips, why classes win (2,000 players)
npm run og:image       # regenerate public/og-image.png (link-preview image) with the app's drawing code
npx vitest run -u      # update persona snapshots — only after reviewing the diff
```

Spikes (standalone, not part of the app): `spikes/r3f-hero` (port 5181) and `spikes/wow-model-viewer` (port 5180, dropped).
The desktop app's browser pane starts servers via `.claude/launch.json` (`app`, `spike-a-…`, `spike-b-…`).

Environment: Windows 10, Node 24.14, npm 11.13, Git Bash + PowerShell. Pinned: TypeScript 7.0.2, Vite 8.3.4, Vitest 5.0.5, React 19.3.1, Zod 4.6.7, Tailwind 4.3.3, Playwright 1.64.1 with `@axe-core/playwright` 4.13.0 (dev, D50).

## Project map

- `src/data/` — game data JSON + `schemas.ts` (Zod, typed vocabularies) + `validate.ts` (cross-reference checks) + `index.ts` (`gameData`)
- `src/engine/` — pure TS engine: `profile` → `filters` → `score` (+ calibration) → `races` → `explain` → `dualSpec`, orchestrated by `rank.ts`. **All tuning constants live in `config.ts`.** `personas.ts` holds the test players.
- `src/share/` — share codes (`codec.ts`) with frozen answer layouts per code version (`layout.ts`)
- `src/data/vocab.ts` — plain id lists (no Zod). App and engine code import ids from here, never runtime values from `schemas.ts`, so Zod stays out of the bundle.
- `src/pages/` — routes: `/` (eager), `/quiz`, `/result/:code`, `/galaxy`, `/galaxy/:code`, `/about` (lazy), dev-only `/debug`, 404
- `src/components/` — `quiz/` (setup, question types, the grouped last screen, `screens.ts` grouping + allowed races, hotkeys), `results/` (cards, radar, reveal, tweaks, share), `compass/` (quiz compass: `compass.ts` math and looks, `CompassStage` picks 3D or the flat `CompassMap2D`), `webgl.tsx` (WebGL checks + 3D error fallback), `galaxy/GalaxyMap2D` (flat Spec Galaxy), `icons/Glyphs` (our SVG glyphs) and `icons/GameIcons` (Blizzard icons, D43/D44), `layout/Site`
- `src/three/` — lazy 3D scenes (R3F): `CompassScene` (quiz compass) and `GalaxyScene`, sharing the sky, textures and gold armillary in `shared.tsx`. Only these files import three.
- `src/galaxy/` — Spec Galaxy math: `pca.ts` (layout, nearest builds, player position), `constellations.ts` (class lines), `declutter.ts` (nudges overlapping flat-map icons apart)
- `src/state/quizStore.ts` — Zustand quiz progress (sessionStorage, falls back to memory)
- `src/i18n/en.ts` — every UI string
- `tests/e2e/` — Playwright: `smoke.spec.ts` (full quiz flow, 404) and `a11y.spec.ts` (axe scans of every page and kind of quiz screen, keyboard-only run, reduced motion); `vercel.json` — SPA rewrites; build files live in `/static/` and revalidate on every load (D49)
- `scripts/` — node scripts run with `tsx`
- `docs/` — RESEARCH, OPEN_QUESTIONS, PLAN, DECISIONS, SCORES_REVIEW and BALANCE (both generated)

## Conventions

- TypeScript strict (+ `noUncheckedIndexedAccess`). The engine is pure: no React, no clock, no randomness, stable tie-breaks.
- **Versioning:** bump `ENGINE_VERSION` (`src/engine/config.ts`) when engine logic or constants change results; bump `meta.dataVersion` when data changes results. Share links carry both.
- **Never edit a published share layout.** If `questions.json` changes, add the next `LAYOUT_Vn`, register it in `codec.ts` and keep the older ones (a test pins the newest layout to the data; older ones keep decode tests). V1 was rewritten once, before the first deploy (D32); V2 came with quiz V2 (D47).
- **Quiz questions are about the person, not WoW** (D30): no class words, every option must boost builds from ≥3 classes. Only setup and the final hard-preferences screen ask directly.
- Game data in `src/data/*.json`, validated by Zod in tests and dev. Production trusts the JSON to keep Zod out of the bundle. Answer effects live in data, not code. Sources are ids into `sources.json` (ids match `docs/RESEARCH.md` §1).
- Ids are kebab-case (`warrior-protection`, `skyborne-high-order`). Every player-facing sentence has `newcomer` and `veteran` wording.
- After changing scores or weights: `npm run scores:review`, `npm run balance`, `npm test`, review the snapshot diff, then `npx vitest run -u`.
- 3D only in `src/three/` (lazy chunk). Everything must work without WebGL. Respect `prefers-reduced-motion`.
- Accessibility target: WCAG 2.1 AA. New pages and new kinds of quiz screen get an axe scan in `tests/e2e/a11y.spec.ts`. Quiz hotkeys leave Enter on a focused button or link to that control (D50).
- Line endings: LF (`.gitattributes`).

## IP / legal hygiene

- The notice "Not affiliated with or endorsed by Blizzard Entertainment. World of Warcraft and Warcraft are trademarks or registered trademarks of Blizzard Entertainment, Inc." lives on the About page (Legal). No site-wide footer (user's call, D42). The shareable result image keeps its short "Fan-made. Not affiliated…" line.
- No Blizzard assets (models, textures, icons, art, music, logos) in the repo, and none proxied through our domain. Our own SVG glyphs and our own 3D designs, with one owner-approved exception (D43, extended to the Spec Galaxy by D44): on the results pages and the Spec Galaxy, each class's Hearthstone icon and each spec's WoW Classic talent-tree icon, loaded from Blizzard's and Wowhead's image servers (links in `src/data/icons.json`), without a referrer, falling back to our glyphs, credited on the About page. Don't extend this to other Blizzard art without asking.
- Write descriptions in our own words and link the sources. Never copy wiki or guide text.
