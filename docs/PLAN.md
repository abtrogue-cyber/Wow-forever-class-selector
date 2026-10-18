# Plan — Forever Main (Phase 0 proposal)

> Status: **proposal for review** (2026-10-18). Decisions that need your OK are marked **[OK?]** and are also listed in
> `OPEN_QUESTIONS.md` §B. Game facts come from `RESEARCH.md`. Nothing here is final until Phase 1 data + persona tests confirm it.

---

## 1. Axes (final proposal — 14)

All scores are on a 0–5 scale. **Mode** controls how a player's target is compared:

- `closeness` — both directions matter (too complex is as bad as too simple)
- `atLeast` — only falling short hurts (more sustain than asked for is fine)

| id | Label | 0 = | 5 = | Mode | Fed by |
|---|---|---|---|---|---|
| `range` | Melee ↔ Ranged | always in someone's face | always at range | closeness | Q1, Q2, deal-breakers |
| `complexity` | Complexity | few buttons, forgiving | many buttons, timing, juggling | closeness | Q7, experience |
| `soloLeveling` | Solo leveling | slow and awkward alone | fast and smooth alone | atLeast | Q11 priorities, Hardcore |
| `sustain` | Low downtime | eat/drink after every pull | rarely stops | atLeast | Q9 slider |
| `survivability` | Survival & escapes | dies when a pull goes wrong | escapes or outlasts trouble | atLeast | Q10, Hardcore, PvP ruleset |
| `dungeon` | Dungeon fit | rarely wanted in 5-mans | always welcome, easy groups | atLeast | Q11 |
| `raid` | Raid fit *(speculative until Dec 9)* | hard to get a spot | always wanted | atLeast | Q11 |
| `worldPvp` | World PvP | easy prey | apex predator | atLeast | Q11, PvP ruleset |
| `battlegrounds` | Battlegrounds | little impact | game-changer | atLeast | Q11 |
| `goldFarming` | Gold farming | struggles to farm | farms efficiently solo | atLeast | Q11 |
| `groupUtility` | Group utility | brings only damage | buffs, CC, rez, cleanses | atLeast | Q2, Q10 |
| `petReliance` | Pet reliance | no pet | the pet is half your power | closeness | Q1, Q6 |
| `burst` | Damage rhythm | slow burn (DoTs, HoTs, attrition) | big hits (burst, big heals) | closeness | Q8, Q10 |
| `armor` | Armor weight | cloth robes | heavy plate | closeness | Q5 (+ the hero visual) |

**Changes vs the brief's draft:**
- **Added `burst` and `armor`.** The brief's this-or-that questions ("Big hits vs DoT", "Plate vs Robes") need axes to land on, and `armor` drives the forming hero.
- **Dropped `gearDependence`.** No source supports Forever values for it, and no question asks about it.
- **Merged `mobility/kiting` into `survivability`** (escapes) and `range`. Kiting fantasy shows up through Frost Mage and Hunter scores.
- `raid` gets a **confidence multiplier of 0.7** on its weight until real raid data exists after Dec 9. The UI labels it "speculative".

---

## 2. Builds — 28, no new dedicated roles

Research (RESEARCH.md §8) found **no brand-new dedicated role**. I recommend keeping the brief's 28 builds. Forever's role-adjacent options become **flags and notes**, not extra stars **[OK?] (B4)**.

| id | Role | Armor | Range | Pet | Forever hooks (for explanations) |
|---|---|---|---|---|---|
| `warrior-arms` | dps | plate | melee | none | Weaponmaster, Spearing Strike (dismount), Victory Rush |
| `warrior-fury` | dps | plate | melee | none | Raging Blows, Boundless Rage |
| `warrior-protection` | **tank** | plate | melee | none | Vanguard, Bastion, shorter Shield Wall |
| `paladin-holy` | **healer** | plate | ranged | none | Holy Shock at 21, Light's Vigil · *variant: Shockadin* |
| `paladin-protection` | **tank** | plate | melee | none | Seal of Fury (taunting judgement), Templar's Bulwark |
| `paladin-retribution` | dps | plate | melee | none | Twist of Light (seal twisting), Holy Strike, Sacred Arbiter |
| `hunter-beast-mastery` | dps | mail | ranged | required | Summon Hawk, pets scale with your gear, pet tanks solo |
| `hunter-marksmanship` | dps | mail | ranged | **optional** | **Lone Wolf** (petless), Sniper Shot |
| `hunter-survival` | dps | mail | **melee** | optional* | Lacerating Strikes, traps in combat, dual-wield |
| `rogue-assassination` | dps | leather | melee | none | Mutilate, **Venom**, poison crits |
| `rogue-combat` | dps | leather | melee | none | **Hack and Slash**, Flawless Execution |
| `rogue-subtlety` | dps | leather | melee | none | Thousand Cuts, Cutthroat |
| `priest-discipline` | **healer** | cloth | ranged | none | Penance, Divine Aegis |
| `priest-holy` | **healer** | cloth | ranged | none | Binding Heal, Prayer of Mending |
| `priest-shadow` | dps | cloth | ranged | none | Devouring Plague for all, Devouring Contagion |
| `shaman-elemental` | dps | mail | ranged | none | Lava Burst, Lightning Overload |
| `shaman-enhancement` | dps | mail | melee | none | Maelstrom Weapon, Rage of the Farseer · *flag: small-group off-tank* |
| `shaman-restoration` | **healer** | mail | ranged | none | Riptide, Call of the Elements |
| `mage-arcane` | dps | cloth | ranged | none | Arcane Blast, Missile Barrage |
| `mage-fire` | dps | cloth | ranged | none | Heating Up, Frostfire Bolt |
| `mage-frost` | dps | cloth | ranged | none | Ice Lance, Fingers of Frost |
| `warlock-affliction` | dps | cloth | ranged | required* | Wrack, drains, DoT crits |
| `warlock-demonology` | dps | cloth | ranged | required | Demonic Pact · *flag: Voidwalker tanking (Demonic Brand)* |
| `warlock-destruction` | dps | cloth | ranged | **optional*** | Incinerate, Bane of Havoc (Demonic Sacrifice → petless) |
| `druid-balance` | dps | leather | ranged | none | Eclipse, Moonkin aura raid-wide |
| `druid-feral-cat` | dps | leather | melee | none | Shifting Power (powershifting), Berserk |
| `druid-feral-bear` | **tank** | leather | melee | none | Primal Bite, Lacerate, Thick Hide rework |
| `druid-restoration` | **healer** | leather | ranged | none | Wild Growth, Swiftmend |

\* low confidence → OPEN_QUESTIONS A10/A11. Plate/mail are worn from level 40; the armor axis uses the endgame armor type.

**Build fields** (extends brief §6): `petStyle: none|optional|required`, `stealth: 0–3`, `offTank?: "smallGroup"`, `variants[]` (name + note), `popular` (for "Why not…?", hand-picked, **[OK?] (B6)**), `strengths[]`/`weaknesses[]` each tagged with the axes they explain, and optional per-axis `confidence`.

---

## 3. Tags (fantasy vocabulary)

Keep the brief's 16: `holy, shadow, nature, elements, arcane, fire, frost, fel, beast, stealth, berserker, shapeshifter, protector, healer, sharpshooter, trickster`.
Builds carry strengths 1–3 per tag (e.g. Holy Paladin: holy 3, healer 3, protector 1). Answers add affinities from −3 to +3.

---

## 4. Quiz (draft wording)

**Setup (one screen)**

| Field | Newcomer wording | Options |
|---|---|---|
| experience | "How well do you know World of Warcraft?" | New to WoW · I've played WoW (Classic or retail) · Vanilla veteran |
| faction | "Pick a side" (+ one-line flavor per faction) | Alliance · Horde · No preference |
| ruleset | "Where will you play?" | Normal · PvP · Roleplay · Hardcore *(launches this winter)* **[OK?] (B1)** |
| skyborne | "Do you own the Skyborne pack? (the new sky-elf race needs a paid upgrade)" | Yes · No · Not sure **[OK?] (B2)** |

Veteran wording only changes jargon (e.g. "Ruleset?" instead of "Where will you play?"). Option 1 → newcomer texts, options 2–3 → veteran texts.

**Questions (14, ≈ 2.5 min).** Each this-or-that has a small "No preference" option (key `3`).

| # | Type | Newcomer | Veteran | Options → main effects |
|---|---|---|---|---|
| Q1 | scenario | "A pack of gnolls charges at you. What do you do?" | "Three gnolls aggro at once. Instinct?" | Charge in swinging → range 0, berserker · Blast them from a distance → range 5, arcane/fire/frost, sharpshooter · Send my companion in first → pet 5, beast · Vanish and strike first → stealth, trickster · Raise my shield and hold → tank, protector, armor 4+ |
| Q2 | scenario | "Your group faces its first big boss. Where do you want to be?" | "Dungeon boss pull. Your seat?" | In front, taking the hits → tank · Behind everyone, keeping them alive → healer · Right at the boss, dealing damage → dps + melee · At a distance, dealing damage → dps + ranged · Wherever the group needs me → hybrid bonus, utility 4 |
| Q3 | this-or-that | "Which power calls to you?" | same | Light (radiant, righteous) → holy, healer · Shadow (dark, forbidden) → shadow, fel, trickster |
| Q4 | this-or-that | "Which kind of magic?" | "Nature or arcane?" | Wild nature (beasts, storms) → nature, beast, elements, shapeshifter · Raw magic (arcane, fire, frost) → arcane, fire, frost |
| Q5 | this-or-that | "How do you want to look?" | "Armor fantasy?" | Heavy plate → armor 5 · Flowing robes → armor 0 |
| Q6 | this-or-that | "Do you want an animal friend fighting with you?" | "Pet or solo?" | A loyal companion → pet 5, beast · Just me → pet 0 |
| Q7 | this-or-that | "How do you like to play?" | "Rotation preference?" | Simple & steady → complexity 1 · Complex & rewarding → complexity 5 (+ flag `wantsComplexity`) |
| Q8 | this-or-that | "How do you like to win a fight?" | "Burst or attrition?" | One huge blow → burst 5 · Slow, relentless pressure → burst 0 |
| Q9 | slider | "Stopping to eat and drink between fights is…" totally fine ↔ unbearable | "Downtime between pulls:" fine ↔ unacceptable | sustain target 5, weight 0 → 2.5 |
| Q10 | scenario | "A fight goes wrong: three more enemies join. You'd rather…" | "Bad pull, two adds. Your out?" | Escape button → survivability 4 · Outlast it, heal myself → survivability 5 · Lock one down → utility, survivability 3.5 · Burn them first → burst · "I'll run back from the graveyard" → survivability weight 0 *(on Hardcore: "…there is no graveyard.")* |
| Q11 | priorities (top 3, ordered) | "What will you spend most of your time doing?" | "Rank your top 3." | Solo leveling · Dungeons · Raids *(Dec 9+)* · World PvP · Battlegrounds · Making gold → rank weights 3 / 2 / 1.2 |
| Q12 | deal-breakers (multi, optional) | "Anything you definitely don't want?" | "Hard no's?" | No pets · Must be able to heal · Must be able to tank · Ranged only · Melee only · No stealth gameplay |
| Q13 | pick one | "Which look feels most like you?" | same | Noble & shining · Rugged & bearded · Small & clever · Graceful & elven · Wild & tribal · Eerie & undying → race aesthetics only |
| Q14 | this-or-that | "Do you want something brand-new?" | "Classic comfort or Forever novelty?" | Tried and true → novelty −1 · New in Forever → novelty +2 (★ combos, Skyborne) |

Cut candidates if testing shows > 3 min: Q8, then Q4 (their tag signals overlap with Q1/Q3).
"Don't ask what the data can't support": we don't ask about meta/performance, professions or specific raids.

**Effects live in `questions.json`:**

```jsonc
{ "axes": { "range": { "target": 5, "weight": 1.5 } },
  "tags": { "arcane": 2, "fire": 1 },
  "roles": { "dps": 1 }, "flags": ["wantsComplexity"], "filters": ["noPets"],
  "aesthetic": { "noble": 2 }, "novelty": 2 }
```

---

## 5. Scoring

### 5.1 answers → PlayerProfile
- **Axis targets** are weight-averaged across answers, and **weights add up**.
- **Tag affinities** add up, clamped to ±3. **Role preferences** add up, clamped to ±2.
- `hardFilters` is the union of all filters. `flags`, `aesthetic` and `novelty` come straight from their answers.

**Context modifiers** (applied in this order):
| Context | Effect |
|---|---|
| Hardcore | survivability target ≥ 4, weight +2; soloLeveling target ≥ 4, weight +1; "graveyard" answer ignored |
| PvP ruleset | worldPvp target ≥ 3.5, weight +1.2; survivability weight +0.5 |
| RP ruleset | tag weight × 1.3; race aesthetic weight × 1.5 |
| Newcomer (unless `wantsComplexity`) | complexity target ≤ 2, weight +1; soloLeveling weight +0.5 |

### 5.2 Filters
- A build is dropped if it breaks any hard filter, **or** if it has no allowed race for the chosen faction + Skyborne ownership. Every class has a non-Skyborne race on both sides, so in practice this only matters for race lists.
- `noPets` drops `petStyle: required`. `rangedOnly` keeps range ≥ 3.5. `meleeOnly` keeps range ≤ 1.5. `noStealth` drops stealth ≥ 2.
- **`mustHeal` / `mustTank` are class-level:** the class must have a healer/tank build, and that build then becomes the dual-spec partner **[OK?] (B3)**.
- If nothing survives, show "No build matches every deal-breaker" and suggest which filter to relax.

### 5.3 Score
For each component *c* — the 14 axes, plus `tags`, `role` and `novelty` as pseudo-axes — compute a fit *f* in [0, 1]:

- **Axis, closeness:** f = 1 − (|x − t| / 5)^1.5 (1 off → 0.91, 2 off → 0.75, 3 off → 0.54)
- **Axis, atLeast:** same curve on max(0, t − x)
- **Tags:** T = Σ α_t · s_t / 3, normalized by max(1, Σ|α|) → f = (T + 1) / 2
- **Role:** f = 0.5 + 0.25 · rolePref[role]; plus a hybrid bonus when "wherever the group needs me" was picked (classes with 2–3 roles)
- **Novelty:** ★ share of the build's best races, only when novelty ≠ 0

**S = Σ w_c · f_c / Σ w_c** — weights from the profile; tags default to 1.5 (× 1.3 on RP), role to 2 when expressed.

**Match %:** **match = clamp(round(100 · σ(k · (S − s0))), 5, 98)**, with *k* and *s0* fitted in Phase 1 on the persona fixtures. Targets:
- a coherent persona's #1 lands at 85–97
- the median build lands at 40–65
- #1 minus #10 is at least 15 points

It's absolute, so a build shows the same % no matter what else is listed. If the top S is low, we say so honestly: "your answers pull in different directions — best compromises". Constants live in `engine/calibration.ts` and are tied to `ENGINE_VERSION`.

**Ties:** match ↓, then raw S ↓, then build order in `builds.json` (stable, deterministic). Raw scores are rounded to 1e-9 before comparing.

### 5.4 Races per build
`raceScore = Σ racial synergy + aesthetic + novelty − Skyborne-unsure penalty`:
- **Racial synergy:** each racial carries need-tags such as `critChance 2`, `haste 3`, `stunBreak 3`, `fearBreak 3`, `escape 2`, `downtime 2`, `defensiveCD 2`, `burstCD 3`, `health 2`, `manaRegen 2`, `beastDamage 2`, `gold 1`, … Each build has a **needs vector**:
  - from its role: DPS → crit/haste/burstCD; healer → manaRegen/critPower/haste; tank → health/defensiveCD/avoidance
  - from the profile: PvP → stun/fear/root breaks, escape, stealthDetect; Hardcore → escape, defensiveCD, downtime; leveling → downtime, beastDamage, mobility; gold → gold, herbalism
  - from class spells: Priest racial spells, e.g. Human Divine Grace for healers
- **Aesthetic** comes from Q13 (× 1.5 on RP). **Novelty** adds a bonus to ★ combos only if Q14 = new.
- **Skyborne:** "No" → excluded; "Yes" → normal; "Not sure" → allowed with a small penalty and a "needs Skyborne pack" badge.
- **Output:** the top 3 races, each with 1–2 reasons from its biggest racial contributions, in our own words ("Ruthless — +2% crit chance on everything").

**Skyborne is modelled as two race entries:** `skyborne-high-order` (Alliance) and `skyborne-windshaper` (Horde), grouped as "Skyborne". Their racials and class lists differ.

### 5.5 Explanations
- For each component: **rel_c = w_c · (f_c(build) − mean f_c over all eligible builds)**. This measures "what makes *this* build stand out for *you*".
- **Why it fits** = the top 3 positive rel. Text comes from the build's own `strengths[]` entry tagged with that axis when one exists (specific: "Life Tap + drains = almost no downtime"). Otherwise it comes from a generic axis template (newcomer/veteran).
- **Watch out** = the 1–2 most negative rel; otherwise the build's top `weaknesses[]` entry, so there's always ≥ 1 caveat.
- **Why not X?** = 2–3 `popular` builds outside the top 5. Each gives its filter reason ("You said no pets — Beast Mastery is built around one") or its single most negative rel.

### 5.6 Dual-spec partner
- If `mustHeal`/`mustTank` isn't met by the main build, the partner is the best healer/tank build of the class.
- Otherwise: re-weight the profile so priority #2 becomes #1, then pick the best other build of the same class among its curated `dualSpecPartners` (fallback: any same-class build).
- Text: "Unlock dual spec at 40 (10 g) and keep **Protection** for dungeons — your #2 priority."

### 5.7 Determinism, versions, share links
- The engine is pure: no clock, no randomness, stable sorts. `ENGINE_VERSION` (int) and `meta.dataVersion` travel with every result.
- **Share code:** `/result/v1.<base64url>`. The payload is bit-packed:

  | Field | Bits |
  |---|---|
  | setup | 8 |
  | 3 scenarios × 3 | 9 |
  | 7 this-or-that × 2 | 14 |
  | slider | 3 |
  | priorities (3 × 3) | 9 |
  | deal-breaker mask | 6 |
  | look | 3 |
  | tweak sliders (4 × 3) | 12 |
  | **total** | **≈ 64 bits → ~11 chars** |

- Old codes must always decode (keep every decoder). Results are recomputed with the current data. If `dataVersion` changed, show "Results updated since this link was made" **[OK?] (B5)**.

### 5.8 Persona fixtures (Phase 1 snapshot tests)
| Persona | Expected top picks (sanity, not exact) |
|---|---|
| Cozy healer (newcomer, Normal, heal + dungeons) | Resto Druid, Holy Priest, Resto Shaman, Holy Paladin |
| Hardcore survivor (HC, solo leveling, escapes) | BM Hunter, Affliction/Demo Warlock, Prot/Ret Paladin, Frost Mage |
| World-PvP ganker (PvP ruleset, stealth, burst) | Subtlety/Assassination Rogue, Feral Cat, Frost Mage, Arms Warrior |
| Pet lover who hates downtime | BM Hunter, Demonology/Affliction Warlock |
| Raid logger (raids #1, complex OK) | wide spread, low confidence — must not look silly |
| Total newcomer (simple, solo) | BM Hunter, Ret Paladin, Affliction Warlock, Fury/Arms Warrior |
| Petless hunter fan (no pets + ranged + nature) | MM Hunter (Lone Wolf) must survive the filter |
| Horde Paladin / Alliance Shaman | Undead Paladin / Dwarf Shaman races, never an impossible combo |

---

## 6. Data files (Phase 1)

As in brief §6, plus:
- **`sources.json`** — a registry of `{ id, title, url, publisher, published, accessed }`. Records hold `sources: ["BLZ-PW", …]` (ids from RESEARCH.md §1). This avoids repeating URLs in 100+ records.
- **`races.json`** — each racial has `tags` (the need-vector above), `effect: { newcomer, veteran }` in our own words, and optional `beta: "changed Oct 15"`.
- **`builds.json`** — the fields from §2, plus `racialNeeds` overrides where the defaults don't fit.
- **Zod** validates on test and at dev start: every id referenced exists, every combo is in the matrix, every source id resolves, every record has `verified` + `sources`.

---

## 7. Folder structure

```
/
├─ index.html · package.json · vite.config.ts · tsconfig*.json · vercel.json (SPA rewrites)
├─ public/                      favicon, default OG image
├─ scripts/
│  └─ build-galaxy.ts           PCA of build axis vectors → src/data/generated/galaxy.json
├─ src/
│  ├─ main.tsx · App.tsx · routes.tsx
│  ├─ data/                     *.json + schemas.ts (Zod) + index.ts (typed, validated exports)
│  │  └─ generated/             galaxy.json (build-time output, committed)
│  ├─ engine/                   pure TS: profile, filters, score, calibration, races, explain,
│  │  │                         dualSpec, rank (orchestrator), version
│  │  └─ __tests__/             unit + personas.test.ts (+ snapshots)
│  ├─ share/                    encode/decode (bit-packing, base64url) + tests
│  ├─ state/                    Zustand: quiz store (answers, step), tweak store
│  ├─ i18n/                     en.ts (every UI string), t() helper
│  ├─ pages/                    Landing, Quiz, Result, Galaxy, About, Debug (dev only), NotFound
│  ├─ components/
│  │  ├─ ui/                    Button, Card, Slider, Toggle, Badge, Progress, Dialog
│  │  ├─ quiz/                  SetupScreen, QuestionScreen + one component per question type, QuizNav
│  │  ├─ results/               RevealCard, ResultCard, ResultRow, RadarChart (SVG), Reasons, RaceList,
│  │  │                         DualSpecHint, WhyNot, TweakPanel, SharePanel
│  │  ├─ hero/                  HeroStage (2D/3D switch), Hero2D (SVG fallback)
│  │  └─ icons/                 our own SVG glyphs: classes, roles, tags
│  ├─ three/                    lazy chunk: HeroScene, Hero parts, materials, FogWisps,
│  │                            particles/{holy,shadow,fel,frost,fire,nature,arcane,elements}, Galaxy
│  ├─ lib/                      webgl/lowPower detection, reducedMotion, base64url, format
│  └─ styles/                   index.css (Tailwind v4 @theme tokens, noise/parchment textures)
├─ tests/e2e/                   Playwright smoke (full quiz flow)
├─ docs/                        RESEARCH, OPEN_QUESTIONS, DECISIONS, PLAN, SCORES_REVIEW (Phase 1)
└─ spikes/                      Phase 0 spikes (standalone, not part of the app build)
```

## 8. Component tree

```
<App>                                   MotionConfig(reducedMotion="user"), router, RootLayout
├─ RootLayout                           night background + noise, skip link, footer disclaimer
│  ├─ /            LandingPage          HeroStage(mode="idle") · tagline · CTA
│  ├─ /quiz        QuizPage
│  │  └─ QuizShell                      progress = hero forming · Back · keys 1–9, ←/→
│  │     ├─ HeroStage(mode="forming", progress, leadingClassColor)
│  │     ├─ SetupScreen | QuestionScreen
│  │     │   └─ Scenario | ThisOrThat | SliderQ | Priorities | DealBreakers | PickOne
│  │     └─ QuizNav
│  ├─ /result/:code ResultPage          decode → engine.rank() (memoized)
│  │  ├─ RevealCard                     first visit only: card flip + class particles
│  │  ├─ TopResults → ResultCard ×3     MatchBadge · RadarChart · Reasons(fit/watch) · RaceList · DualSpecHint · ★ badges
│  │  ├─ MoreResults → ResultRow ×7     + "Show all"
│  │  ├─ WhyNot                         2–3 popular builds with their main reason
│  │  ├─ TweakPanel                     sliders → live re-rank (layout animation)
│  │  └─ SharePanel                     copy link · download PNG (lazy)
│  ├─ /galaxy      GalaxyPage           lazy Galaxy3D | Galaxy2D (SVG scatter fallback)
│  ├─ /about       AboutPage            method, sources, beta label, disclaimer
│  ├─ /debug       DebugPage            dev only: answers → profile → raw scores & contributions
│  └─ *            NotFound
└─ HeroStage                            WebGL + not low-power → lazy <HeroScene/> (Suspense → Hero2D), else Hero2D
```

**Libraries to confirm** (small, inside the brief's stack spirit) **[OK?]**:
- **wouter** (~2 KB) for routing, instead of React Router.
- `vercel.json` SPA rewrites.
- Fonts (Google Fonts): **Cinzel** (engraved display caps, close to the in-game title feel) + **Alegreya Sans** (readable humanist body). Alternatives: Cormorant SC / Marcellus + Source Sans 3.

---

## 9. 3D decision (from the spikes)

- **B (our own R3F heroes) = the only 3D path.** Spike B hit the look (rim-lit silhouette, fog, bloom, gold motes) at 60 fps in the app pane. The SD/HD toggle is nearly free (low-segment flat-shaded vs smooth). The lazy chunk is 271 KB gzip.
- **A (`wow-model-viewer`) is dropped.**
  - The classic models are broken (404s), and there are no old models and no Skyborne.
  - It costs ~12 MB per character.
  - It depends on Wowhead's minified internals.
  - It needs a proxy that re-serves Wowhead/Blizzard files, with no permission to do so.
  - Backlog: an outbound "see this race on Wowhead" link only.

## 10. Road to M1 (Mon Oct 26)

| Day | Work |
|---|---|
| Mon 19 | Phase 1a: scaffold app (Vite, TS strict, Tailwind v4, Vitest, Zod), data schemas + JSON, **SCORES_REVIEW.md** → your review |
| Tue 20 | Phase 1b: engine + explanations + share codec + persona snapshots + /debug → **stop** |
| Wed 21 | Phase 2: Vercel project live (empty shell), landing + setup + quiz shell |
| Thu 22 | All question types, keyboard, mobile |
| Fri 23 | Results (cards, radar, reasons, races, dual spec, Why not), share link |
| Sat 24 | Tweak sliders + re-rank animation, 2D reveal, About/disclaimer |
| Sun 25 | Playwright smoke, a11y/mobile pass, copy pass |
| **Mon 26** | **M1 live** → Reddit/Discord |

**Things you'll do by hand** (I'll give exact steps at the time):
- Create an empty GitHub repo and push.
- Connect it to Vercel (Hobby plan, no env vars needed).
- Review SCORES_REVIEW.md.
- Answer OPEN_QUESTIONS §B.
