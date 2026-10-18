# CLAUDE.md — Forever Main

Fan-made, very visual class / spec / race finder for **World of Warcraft: Forever** (launch Nov 4, 2026).
Source of truth: [forever-main-kickoff.md](forever-main-kickoff.md). Current plan: [docs/PLAN.md](docs/PLAN.md).

**Status:** Phase 0 (research, plan, spikes) done. The plan was accepted on 2026-10-18 (see `docs/DECISIONS.md`). Waiting for the go for Phase 1 (data + engine).

## Working rules (from the brief §0 — always apply)

- Work in **phases**. At the end of each phase: summarize, list decisions and assumptions, commit, then **stop and wait for the go**.
- **Never invent game facts.** All game data lives in JSON with `sources` and `verified`. If unsure → `verified: false` + an entry in `docs/OPEN_QUESTIONS.md`. Classic/retail knowledge only as a labelled assumption.
- Be opinionated: recommend one option and say why in 1–2 sentences.
- **Ask before** adding heavy dependencies or changing the stack.
- Small, reviewable commits with clear messages. Keep this file and `docs/DECISIONS.md` up to date.
- Keep explanations short and practical. When the user must do something by hand (accounts, env vars, deploys), give exact steps.
- Scope rule: anything that threatens M1 (Mon Oct 26) goes to the backlog.

## Commands

Main app: **not scaffolded yet** (Phase 1). Planned scripts: `npm run dev`, `build`, `test` (Vitest), `test:e2e` (Playwright), `typecheck`, `lint`.

Spikes (standalone apps, not part of the app build):

```bash
cd spikes/r3f-hero && npm install && npm run dev          # http://localhost:5181 (?no3d = 2D fallback)
cd spikes/wow-model-viewer && npm install && npm run dev  # http://localhost:5180 (dropped, see DECISIONS D1)
```

The desktop app's browser pane starts these via `.claude/launch.json`.

Environment: Windows 10, Node 24.14, npm 11.13, Git Bash + PowerShell. `npm install` currently resolves TypeScript 7 and Vite 8 (see DECISIONS D13).

## Conventions

- TypeScript strict. `src/engine/` is pure TS: no React, deterministic, fully unit-tested. Bump `ENGINE_VERSION` whenever the same answers would give a different result.
- Game data in `src/data/*.json`, validated with Zod (tests fail on invalid data). Answer effects live in data, not code. Sources are ids into `src/data/sources.json` (ids match `docs/RESEARCH.md` §1).
- Ids are kebab-case: `warrior-protection`, `skyborne-high-order`.
- Every question and explanation has two wordings: `newcomer` and `veteran`.
- All UI strings live in `src/i18n/en.ts` (German later).
- 3D only in `src/three/` (lazy chunk). Everything must work without WebGL. Respect `prefers-reduced-motion`.
- Line endings: LF (`.gitattributes`).

## IP / legal hygiene

- Footer: "Not affiliated with or endorsed by Blizzard Entertainment. World of Warcraft and Warcraft are trademarks or registered trademarks of Blizzard Entertainment, Inc."
- No Blizzard assets (models, textures, icons, art, music, logos) in the repo, and none proxied through our domain. Our own SVG glyphs and our own 3D designs only.
- Write descriptions in our own words and link the sources. Never copy wiki or guide text.

## Docs

- `docs/RESEARCH.md` — verified facts, sources, beta labels
- `docs/OPEN_QUESTIONS.md` — unverified data + product questions for the user
- `docs/PLAN.md` — axes, builds, quiz, scoring, structure, component tree, road to M1
- `docs/DECISIONS.md` — short decision log
- `spikes/*/README.md` — spike findings
