# CLAUDE.md — Forever Main

Fan-made, very visual class / spec / race finder for **World of Warcraft: Forever** (launch Nov 4, 2026).
Source of truth: [forever-main-kickoff.md](forever-main-kickoff.md). Current plan: [docs/PLAN.md](docs/PLAN.md).

**Status:** Phase 2 (playable MVP, person-first quiz) is merged into `main` and live at https://wow-forever-class-selector.vercel.app (M1 shipped ahead of Mon Oct 26). Next: Phase 3.

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
npm run test:e2e       # Playwright smoke test of the full quiz flow on the production build (mobile + desktop)
npm run typecheck      # tsc for the app (src) and the node scripts
npm run build          # production build
npm run scores:review  # regenerate docs/SCORES_REVIEW.md after editing builds.json
npx vitest run -u      # update persona snapshots — only after reviewing the diff
```

Spikes (standalone, not part of the app): `spikes/r3f-hero` (port 5181) and `spikes/wow-model-viewer` (port 5180, dropped).
The desktop app's browser pane starts servers via `.claude/launch.json` (`app`, `spike-a-…`, `spike-b-…`).

Environment: Windows 10, Node 24.14, npm 11.13, Git Bash + PowerShell. Pinned: TypeScript 7.0.2, Vite 8.3.4, Vitest 5.0.5, React 19.3.1, Zod 4.6.7, Tailwind 4.3.3.

## Project map

- `src/data/` — game data JSON + `schemas.ts` (Zod, typed vocabularies) + `validate.ts` (cross-reference checks) + `index.ts` (`gameData`)
- `src/engine/` — pure TS engine: `profile` → `filters` → `score` (+ calibration) → `races` → `explain` → `dualSpec`, orchestrated by `rank.ts`. **All tuning constants live in `config.ts`.** `personas.ts` holds the test players.
- `src/share/` — share codes (`codec.ts`) with frozen answer layouts per code version (`layout.ts`)
- `src/data/vocab.ts` — plain id lists (no Zod). App and engine code import ids from here, never runtime values from `schemas.ts`, so Zod stays out of the bundle.
- `src/pages/` — routes: `/` (eager), `/quiz`, `/result/:code`, `/about` (lazy), dev-only `/debug`, 404
- `src/components/` — `quiz/` (setup + question types + hotkeys), `results/` (cards, radar, reveal, tweaks, share), `hero/Hero2D`, `icons/Glyphs`, `layout/Site`
- `src/state/quizStore.ts` — Zustand quiz progress (sessionStorage, falls back to memory)
- `src/i18n/en.ts` — every UI string
- `tests/e2e/` — Playwright smoke test; `vercel.json` — SPA rewrites + asset caching
- `scripts/` — node scripts run with `tsx`
- `docs/` — RESEARCH, OPEN_QUESTIONS, PLAN, DECISIONS, SCORES_REVIEW (generated)

## Conventions

- TypeScript strict (+ `noUncheckedIndexedAccess`). The engine is pure: no React, no clock, no randomness, stable tie-breaks.
- **Versioning:** bump `ENGINE_VERSION` (`src/engine/config.ts`) when engine logic or constants change results; bump `meta.dataVersion` when data changes results. Share links carry both.
- **Never edit a published share layout.** If `questions.json` changes, add `LAYOUT_V2` + decoder and keep V1 (a test enforces this). V1 was rewritten once, before the first deploy (D32).
- **Quiz questions are about the person, not WoW** (D30): no class words, every option must boost builds from ≥3 classes. Only setup and the final hard-preferences screen ask directly.
- Game data in `src/data/*.json`, validated by Zod in tests and dev. Production trusts the JSON to keep Zod out of the bundle. Answer effects live in data, not code. Sources are ids into `sources.json` (ids match `docs/RESEARCH.md` §1).
- Ids are kebab-case (`warrior-protection`, `skyborne-high-order`). Every player-facing sentence has `newcomer` and `veteran` wording.
- After changing scores or weights: `npm run scores:review`, `npm test`, review the snapshot diff, then `npx vitest run -u`.
- 3D only in `src/three/` (lazy chunk). Everything must work without WebGL. Respect `prefers-reduced-motion`.
- Line endings: LF (`.gitattributes`).

## IP / legal hygiene

- Footer: "Not affiliated with or endorsed by Blizzard Entertainment. World of Warcraft and Warcraft are trademarks or registered trademarks of Blizzard Entertainment, Inc."
- No Blizzard assets (models, textures, icons, art, music, logos) in the repo, and none proxied through our domain. Our own SVG glyphs and our own 3D designs only.
- Write descriptions in our own words and link the sources. Never copy wiki or guide text.
