# Forever Main — Kickoff Brief

> **Working title:** Forever Main — *"Find your Forever Main."*
> A fan-made, highly visual class / spec / race finder for **World of Warcraft: Forever**.
> This file is the project's source of truth. Read all of it before doing anything.

---

## 0. How we work

- I'm building this solo with you. Keep explanations short and practical. Whenever I have to do something by hand (accounts, env vars, deploys), tell me exactly what to do.
- We work in **phases** (section 11). At the end of each phase: summarize what you did, list decisions and assumptions, commit, then **stop and wait for my go**.
- **Phase 0 = research, planning, spikes. No feature code yet.**
- **Never invent game facts.** Forever is brand new and still changing. All game data lives in JSON with a `sources` array and a `verified` flag. If you're unsure, set `verified: false` and log it in `docs/OPEN_QUESTIONS.md`. Don't silently fill gaps with WoW Classic or retail knowledge — if you use it, label it as an assumption.
- Be opinionated: when there are options, recommend one and say why in 1–2 sentences.
- Ask before adding heavy dependencies or changing the stack.
- Small, reviewable commits with clear messages.
- Keep `CLAUDE.md` (commands, conventions, these rules) and `docs/DECISIONS.md` (short decision log) up to date.

---

## 1. The game — what we know (checked Oct 18, 2026 — re-verify, things are still moving)

**World of Warcraft: Forever** ("Classic+") was announced at BlizzCon 2026 and launches **Nov 4, 2026** worldwide (3 pm PT — midnight Nov 4→5 in Central Europe). It's a permanent level-60 branch of original WoW with new zones, quests, dungeons and raids. No expansions, no level-cap increases, no flying, no level scaling.

**Classes (9):** Druid, Hunter, Mage, Paladin, Priest, Rogue, Shaman, Warlock, Warrior — each keeps its three familiar talent trees (verify).

**Talents:** reworked; Blizzard's stated intent is to make every class viable. Talents start at level 10 with the familiar structure: one-point milestone talents at 11/21/31 points, plus a new 16-point milestone. Still changing.

**Dual spec:** unlocks at level 40 for 10g; swap freely outside combat.

**Races:** Alliance — Human, Dwarf, Gnome, Night Elf · Horde — Orc, Undead, Tauren, Troll · Both factions — **Skyborne** (new; requires a paid pack: Skyborne Heroic/Epic Pack or Warcraft Forever Collection). No races from TBC onward.

**Race/class matrix** (★ = new in Forever):

| Race | Classes |
|---|---|
| Human | Hunter★, Mage, Paladin, Priest, Rogue, Warlock, Warrior |
| Dwarf | Hunter, Paladin, Priest, Rogue, Shaman★, Warrior |
| Gnome | Mage, Priest★, Rogue, Warlock, Warrior |
| Night Elf | Druid, Hunter, Priest, Rogue, Warrior |
| Orc | Hunter, Mage★, Rogue, Shaman, Warlock, Warrior |
| Undead | Mage, Paladin★, Priest, Rogue, Warlock, Warrior |
| Tauren | Druid, Hunter, Shaman, Warrior |
| Troll | Hunter, Mage, Priest, Rogue, Shaman, Warlock★, Warrior |
| Skyborne★ | Druid, Hunter, Mage (Alliance only), Rogue, Shaman (Horde only), Warrior |

**Racials are reworked:** every race has 2 active + 2 passive racials. Names below — research the effects, don't assume the Classic versions:
- Human: Perception, Ruthless, The Human Spirit, Will to Survive
- Dwarf: Big Game Hunter, Earth Fury, Find Treasure, Stoneform
- Gnome: Engineering Specialization, Escape Artist, Eureka!, Expansive Mind
- Night Elf: Elune's Light, Quickness, Shadowmeld, Wisp Spirit
- Orc: Blood Fury, Hardiness, Savage, Shatter Curse
- Undead: Cannibalize, Touch of the Grave, Underwater Breathing, Will of the Forsaken
- Tauren: Cultivation, Endurance, Plainsrunning, War Stomp
- Troll: Beast Slaying, Berserking, Rapid Regeneration, Regeneration
- Skyborne has two variants: High Order (Elemental Insight, Read Ley Line, Walk on Air, Wind Blessed) and Windshaper (Elemental Insight, Skysight, Walk on Air, Wind Blessed). Find out which variant belongs to which faction.

**Class changes reported so far** (beta / BlizzCon demo — may still change):
- Hunter: Aimed Shot baseline at 20, traps usable in combat, new Fox pet family, much stronger melee Survival, an option to play without a pet.
- Paladin: new Holy Strike; Retribution talents support seal twisting.
- Priest: every priest gets Fear Ward and Devouring Plague at 20.
- Warlock: drain-focused Affliction.
- Warrior: rage tuning, shorter major cooldowns, more Protection options.
- Rogue: weapon specializations merged into "Hack and Slash", new Venom talent, talents that let poisons crit.
- Druid: shapeshifting changes (see Blizzard's Hunter & Druid deep dive).

**Rulesets:** Normal, PvP, RP and Hardcore — one mega-realm per ruleset per region. **Hardcore launches Winter 2026/27.**

**Raids:** unlock Dec 9 — Barrow Deeps (10), Hyjal Summit (20), Onyxia's Lair (40). More raids and dungeons planned for 2027.

**Fun fact to riff on:** the game has an SD/HD character model toggle.

**Start your research here** (cite these in the data files):
- https://warcraft.wiki.gg/wiki/World_of_Warcraft:_Forever — race/class table, racials, roadmap, dual spec; links to per-class pages like https://warcraft.wiki.gg/wiki/Druid_abilities_(Forever)
- https://worldofwarcraft.blizzard.com/forever — official site; Blizzard's class deep dives on news.blizzard.com
- https://www.warcrafttavern.com/forever/news/powershifting-is-back-sort-of-hunter-druid-deep-dive-for-wow-forever/ (and the other class deep dives there)
- https://www.zockify.com/forever/ — per-class change overviews

---

## 2. Timeline — why speed matters

Written on **Sunday, Oct 18, 2026**.

| Date | Game event |
|---|---|
| Oct 22 | Beta ends |
| **Oct 27 – Nov 3** | **Early name reservation (up to 3 characters)** — players start committing to race + class here |
| **Nov 4** | **Launch** |
| Dec 9 | Raids unlock |
| Winter 26/27 | Hardcore launches |

Our milestones:
- **M1 "Playable" — Mon Oct 26:** quiz → engine → results → share link, live on Vercel. Clean 2D design with light motion. Good enough to post on Reddit and Discord.
- **M2 "Wow" — Sun Nov 1:** forming-hero 3D scene, card reveal, Spec Galaxy, share images, polish.
- **Launch hardening — Nov 2–3.**
- **After launch:** data updates from the live game, Hardcore update before HC launches, backlog (section 13).

**Scope rule:** anything that threatens M1 goes to the backlog.

---

## 3. Product vision

**One-liner:** Answer ~12 fun questions, watch your hero take shape, and get a ranked, explained shortlist of class + spec + race — your Forever Main.

**Audience:** vanilla veterans, current Classic players, retail players trying Forever, and complete newcomers.

**Pillars**
1. **Character creation, not a form.** Every answer visibly changes the hero.
2. **Explainable.** Every result says why it fits — and why the popular picks didn't make it.
3. **Forever-native.** New combos, Skyborne, reworked talents, dual spec, rulesets, Hardcore. Not a reskinned Classic tier list.
4. **Shareable.** Results are made to be posted in guild Discords.
5. **Honest.** Sourced data; anything beta-dependent is labeled.

---

## 4. User flow

1. **Landing** — dark cinematic scene: fog, a silhouette on a pedestal, tagline, CTA "Find your Forever Main".
2. **Quick setup (one screen):** experience (New to WoW / Played Classic / Vanilla veteran — changes wording and depth), faction (Alliance / Horde / No preference), ruleset (Normal / PvP / RP / Hardcore once it launches), "Do you own the Skyborne pack?" (Yes / No / Not sure).
3. **Quiz** — 10–14 questions, ~3 minutes, one per screen. Progress = the hero forming. Back button, keyboard shortcuts (1–5, arrow keys).
4. **Reveal** — the #1 result flips like a collectible card (class color, build, race, match %).
5. **Results**
   - Top 3 as large cards, ranks 4–10 compact, "show all" for the rest.
   - Each card: match %, radar chart (you vs. the build), 3 "why it fits", 1–2 "watch out", best 2–3 races with racial reasons, ★ badges for new-in-Forever combos, a dual-spec partner suggestion.
   - "Why not…?" — 2–3 popular builds that ranked low, each with its main reason.
6. **Tweak** — sliders for the biggest weights; live re-ranking with smooth reorder animation.
7. **Spec Galaxy** — every build as a star in 3D; your star among them; nearest stars = alt picks.
8. **Share** — a link that reproduces the exact result + downloadable result card (PNG).

---

## 5. Quiz design

**Question types**
- **Scenario** (pick one): e.g. "A pack of gnolls charges you. You…" → wade in swinging / blast them from range / send your pet / vanish and strike first / raise your shield and hold.
- **This-or-that** (two big cards, swipeable on mobile): Light vs Shadow · Nature vs Arcane · Plate vs Robes · Pet vs Solo · Simple & steady vs Complex & rewarding · Big hits vs Damage over time.
- **Slider:** e.g. "Stopping to eat and drink between pulls is…" (fine ↔ unbearable).
- **Priorities** (pick top 3): smooth solo leveling, dungeons, raids, world PvP, battlegrounds, gold farming.
- **Deal-breakers** (multi-select, hard filters): no pets, must be able to heal, must be able to tank, ranged only, melee only, no stealth gameplay.

**Rules**
- Every option maps to explicit effects (axis targets/weights, tag affinities, hard filters). Effects live in data, not in code.
- Two wordings per question: newcomer (no jargon) and veteran (jargon is fine).
- Don't ask about things the data can't support yet.

---

## 6. Data model

Everything in `src/data/`, typed and validated with Zod (tests fail on invalid data).

- `meta.json` — data version, game state label ("Beta" / "Launch"), lastVerified date.
- `classes.json` — id, name, colorHex (official in-game class color — verify), armor type, possible roles, resource, short pitch (own words), sources, verified.
- `builds.json` — **the ranking unit = class + talent tree + role.** Draft list (28):
  - Warrior: Arms, Fury, Protection (tank)
  - Paladin: Holy (heal), Protection (tank), Retribution
  - Hunter: Beast Mastery, Marksmanship, Survival
  - Rogue: Assassination, Combat, Subtlety
  - Priest: Discipline (heal), Holy (heal), Shadow
  - Shaman: Elemental, Enhancement, Restoration (heal)
  - Mage: Arcane, Fire, Frost
  - Warlock: Affliction, Demonology, Destruction
  - Druid: Balance, Feral Cat, Feral Bear (tank), Restoration (heal)

  Check whether Forever's reworked talents create new roles (e.g. new tank or healer options) and adjust the list.
  Fields: id, classId, tree, role, name, pitch, axis scores (0–5), tags, strengths[], weaknesses[], hardcoreNotes, newInForever notes, dualSpecPartners[], confidence (low/med/high), sources, verified.
- `races.json` — id, name, factions, requiresPurchase, variants (Skyborne), racials [{ name, type: active|passive, effect (own words), tags }], aesthetic tags, sources, verified.
- `raceClass.json` — allowed combos, `newInForever` flag, faction restrictions (e.g. Skyborne Mage = Alliance only).
- `axes.json` — id, label, description, what 0 and 5 mean.
- `tags.json` — fantasy/playstyle vocabulary: holy, shadow, nature, elements, arcane, fire, frost, fel, beast companion, stealth, berserker, shapeshifter, protector, healer, sharpshooter, trickster.
- `questions.json` — id, type, text { newcomer, veteran }, options with effects.

**Axes (draft — finalize in Phase 0):** range (melee ↔ ranged) · complexity · solo leveling ease · sustain (low downtime) · survivability & escapes · raid demand · dungeon demand · world PvP · battlegrounds · gold farming · gear dependence · group utility (buffs, CC, rez, cleanses) · pet reliance · mobility/kiting.

**Scores:** draft every build's axis scores from sourced research, mark confidence, and put them all in one table in `docs/SCORES_REVIEW.md` so I can review and adjust them before we build UI on top.

---

## 7. Scoring engine

`src/engine/` — pure TypeScript, no React, fully unit tested.

1. **answers → PlayerProfile** { axisTargets, axisWeights, tagAffinities, hardFilters, context: faction, ruleset, experience, ownsSkyborne }.
2. **Filter:** drop builds that violate hard filters or have no allowed race for the chosen faction / purchase status.
3. **Score:** weighted closeness on axes + tag affinity bonus − soft penalties. Context modifiers: Hardcore boosts survivability and solo safety; PvP ruleset boosts world PvP; newcomers get lower complexity tolerance unless they explicitly asked for complexity.
4. **Match %:** calibrate so a great fit lands around 85–97% and mediocre fits are clearly lower — no wall of 70%s.
5. **Races per build:** allowed by matrix + faction + purchase → racial synergy for that build/role + aesthetic preference (+ a novelty bonus for ★ combos only if the player likes new things). Return the top 3 with reasons.
6. **Explanations:** biggest positive and negative contributions → template sentences in our own words. "Why not X" = the single biggest negative factor.
7. **Dual-spec partner:** best second build of the same class for the player's secondary priority.

- Deterministic, stable tie-breaks, versioned (`engineVersion`) so old share links keep working.
- **Persona snapshot tests**, e.g.: cozy healer · Hardcore survivor · world-PvP ganker · pet lover who hates downtime · raid logger · total newcomer. Results must look sane to a WoW player — flag anything that seems off.

---

## 8. Visual direction

**Mood:** cinematic dark fantasy — "the torch-lit night before launch". Deep blue-black backgrounds, warm gold accents, subtle stone/parchment texture made with CSS/noise (no copied art), class colors as glows and accents.

- **Typography:** a characterful display serif for headings + a clean, readable body font (Google Fonts). No generic defaults.
- **Motion:** purposeful — page transitions, card flips, staggered reveals, animated re-ranking. Respect `prefers-reduced-motion`.
- **Icons:** our own simple SVG glyphs for classes, roles and tags — no Blizzard icons.
- **Mobile first:** the whole quiz must feel great on a phone.

**Signature moments (priority order)**
1. **Forming hero** — silhouette in fog; each answer reveals armor weight and weapon and shifts the glow toward the currently leading class color; at 100% → reveal.
2. **Card reveal** — #1 flips like a collectible card, with class-colored particles.
3. **Spec Galaxy** — every build as a star, positioned by similarity (PCA of the axis vectors, computed at build time), colored by class; your star sits among them; hover for details; nearest neighbors linked as alt picks.
4. **SD/HD toggle** — a nod to the game: switch the hero between a chunky low-poly "2004" look and a smooth HD look.

**Particle presets per fantasy:** holy (gold motes), shadow (dark wisps), fel (green embers), frost (shards), fire (embers), nature (leaves/fireflies), arcane (sparkles), elements (crackling sparks).

---

## 9. 3D strategy — decide in Phase 0

Time-boxed spikes (≤ 2 h each):

- **A — Real WoW models** via `wow-model-viewer` (npm; github.com/Miorey/wow-model-viewer). Renders WoW characters with customization and gear through Wowhead's ZamModelViewer and can swap items/appearance without reloading. Check: jQuery dependency, CORS/proxy needs on Vercel, which model era is available (old vs HD), Skyborne availability, performance, Wowhead's terms. The models and data belong to Blizzard/Wowhead.
- **B — Original stylized heroes** in React Three Fiber: low-poly figures assembled from parts (body archetype, armor weight, weapon, cape) plus class-colored effects. Our own designs — don't recreate Blizzard models.

**Default plan:** B is the baseline (we need it for the forming effect and the galaxy anyway). A becomes an optional "view in-game model" extra on the results page, only if the spike is clean.

**Always:** 3D is lazy-loaded; the full experience works without WebGL (2D fallback); target 60 fps on a mid-range laptop; scale effects down on mobile and low-power devices.

---

## 10. Tech stack & quality bar

- Vite + React + TypeScript (strict) + Tailwind, deployed on Vercel.
- 3D: three, @react-three/fiber, @react-three/drei, @react-three/postprocessing.
- Motion: Motion (Framer Motion). State: Zustand. Validation: Zod. Radar charts: a small custom SVG component (no heavy chart library).
- Tests: Vitest + Testing Library; one Playwright smoke test for the full quiz flow before M1.
- Routes: `/`, `/quiz`, `/result/:code`, `/galaxy`, `/about`.
- Share links: compact, versioned encoding of the answers (e.g. `v1` + base64url); opening a link re-runs the engine.
- Performance: landing loads fast on mobile; 3D lives in its own lazy chunk.
- Accessibility: full keyboard support, visible focus, ARIA labels, AA contrast, reduced motion.
- i18n-ready: all UI strings in one place (English first, German later).
- No backend and no tracking for the MVP.

---

## 11. Phases

**Phase 0 — Research, plan, spikes (no feature code)**
1. Restate the project in ≤ 10 bullets and list anything that truly blocks you.
2. Verify section 1 and fill the gaps: racial effects, Skyborne variant ↔ faction, notable new talents per class, any new roles, official class colors. Write `docs/RESEARCH.md` with sources and access dates; label beta-only info.
3. Propose: final axes, build list, question list (draft wording for both audiences), scoring formula, folder structure, component tree.
4. Spikes: (a) `wow-model-viewer` inside Vite/React; (b) minimal R3F scene — fogged silhouette on a pedestal, bloom, one particle preset.
5. Create `CLAUDE.md`, `docs/DECISIONS.md`, `docs/OPEN_QUESTIONS.md`.

→ **Stop.** Summary + recommendations.

**Phase 1 — Data + engine**
- All JSON data with Zod schemas; `docs/SCORES_REVIEW.md` for my review.
- Engine + explanations + unit tests + persona snapshots.
- `/debug` page (dev only): answer questions, see raw scores and contributions.

→ **Stop.**

**Phase 2 — Playable MVP (M1, Mon Oct 26)**
- Landing, setup, quiz (all question types), 2D reveal, results, tweak sliders, share link, about/disclaimer page. Mobile first. Deploy to Vercel.

→ **Stop.**

**Phase 3 — The wow (M2, Sun Nov 1)**
- Forming hero, 3D card reveal, Spec Galaxy, particles, SD/HD toggle, transitions, result-card PNG + Open Graph tags.

→ **Stop.**

**Phase 4 — Launch hardening (Nov 2–3)**
- Performance and accessibility pass, mobile + cross-browser test, error boundaries, 404 page, final data check against the latest patch notes.

---

## 12. Definition of done (MVP)

- A newcomer finishes the quiz in ≤ 3 minutes on phone and desktop.
- Every top result shows match %, ≥ 3 reasons, ≥ 1 caveat, best races with reasons, ★ badges for new combos.
- Never recommends an impossible race/class/faction combo; hard filters and Skyborne ownership are always respected.
- Same answers → same result; share links reproduce it exactly.
- All game data is sourced; unverified items are listed in `docs/OPEN_QUESTIONS.md`.
- Works without WebGL; tests green; live on Vercel.

---

## 13. Backlog (not MVP)

- Meta slider ("pure vibes ↔ min-max") once real performance data exists after raids open (Dec 9)
- Duo/group mode: leveling partner, balanced 5-man
- German version
- Hardcore-specific update before Hardcore launches
- Profession suggestions per build
- "This result feels wrong" feedback button
- Real in-game model viewer (if spike A works)

---

## 14. Legal / IP hygiene

- Unofficial, non-commercial fan project. Footer: "Not affiliated with or endorsed by Blizzard Entertainment. World of Warcraft and Warcraft are trademarks or registered trademarks of Blizzard Entertainment, Inc."
- Don't commit Blizzard assets (models, textures, icons, art, music, logos) to the repo.
- Write all descriptions in our own words; link to sources instead of copying text from wikis or guides.

---

## 15. Start

Begin **Phase 0** now. Open with the ≤ 10-bullet restatement and any blocking questions; if nothing truly blocks you, go straight on into research and spikes.
