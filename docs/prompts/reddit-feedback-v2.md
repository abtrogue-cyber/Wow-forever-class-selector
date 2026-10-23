# Prompt: Reddit feedback round (quiz V2)

You're continuing work on **Forever Main**, the fan-made class / spec / race finder for WoW: Forever (live at https://wow-forever-class-selector.vercel.app, launch Nov 4, 2026). Today is Oct 23. This round turns the first real player feedback into fixes, and it must be live before the launch-week Reddit post (target: everything merged by **Oct 31**, so Phase 4 launch hardening on Nov 2–3 stays as planned).

**Read first:** `CLAUDE.md` (working rules — they all apply), `docs/DECISIONS.md` (especially D23 share codes, D25 races, D30 person-first quiz, D40 compass, D43/D44 icons, D45 honest wording), `docs/OPEN_QUESTIONS.md`, `src/engine/` (`profile → filters → score → races → explain → dualSpec`, tuning in `config.ts`), `src/share/` (codec + frozen layouts), `src/data/questions.json`.

---

## What players told us

Post on r/wowforever: ~6.6K views, 30+ comments, 52% upvote ratio. About 18 of ~26 commenters said it got their main, class or plan right; several called it fun and "not the usual do-you-want-to-tank quiz". One said it's the best of the quizzes they've seen. One explicitly said **don't make it longer**.

The complaints, by weight:

1. **Healers and tanks get pushed, and you can't opt out.** Five people (baroqueout, h1ghtek, TimiNax, Morke1, BloodSyndicate) got healers or tanks they don't want; several asked for "no healing / no tanking / DPS only".
2. **Some classes almost never win.** A rogue main found every rogue spec in the bottom five ("1/10"); another got Druid, "the one class I don't want to play". See the measurements below — this is real, not bad luck.
3. **Explanations that don't fit.** "Heavily armored, as requested" on Resto Druid (fixed in D45). Still open: "Excellent BG healer with forms" shown to someone whose bottom priority is PvP — filler strengths ignore what the player cares about.
4. **The hard-preferences screen is misread.** One player thought only one box can be ticked and that skipping it down-ranks things. Neither is true (it's a multi-select; their melee results came from earlier answers), but the screen doesn't say so.
5. **Missing direct choices:** pick your race ("I know I'll be playing Tauren"; "right class, wrong race") and skip classes you never want.
6. **Some questions are see-through.** Q9 ("What feeling do you want more of") reads like class fantasy ("dark, sharp" = rogue, "calm focus" = caster). Q10 ("Pick a place you'd love to live") is obviously the capital cities. Also flagged: the festival answer weighs a lot, and "pack light → robes" felt odd.
7. **Disputed game fact:** a player argues Holy Paladin solos very well in Forever (Holy Strike, Holy Shock at 21, Light's Vigil at 31) and that some debate deep Holy vs deep Ret for damage. Our data gives Holy Paladin `soloLeveling: 2.5`, like the other healers.

## Baseline measurements (engine v2, Oct 23)

2,000 seeded `randomAnswers` players with hard preferences cleared:

- **#1 role:** DPS 46%, tank 28%, healer 27% — while the 28 builds are 71% DPS, 11% tank, 18% healer.
- **#1 class:** paladin 30% (11% of builds), druid 23% (14%), hunter 13%, shaman 12%, mage 9%, priest 6%, rogue 4%, warlock 2%, **warrior 1%** (each 11%).

Random answers aren't real players (role options are spread evenly across roles by design, which alone lifts tanks/healers above their build share), but paladin + druid taking 53% of #1s and warrior at 1% is a structural skew, and it matches the comments.

**Q10 (`home`) never changes the #1 build** (0.0% over 1,000 players × 7 answers). It changes the #1 race 22% of the time and tints the compass sky. That's all it does.

Hypotheses to check (not facts): `CONFIG.role.hybridBonus × roleFlex × (classRoles − 1)` doubles for three-role classes (paladin, druid); `atLeast` axes (survivability, dungeon, groupUtility, battlegrounds…) reward all-rounders, which D30 already noted as a trade-off; plate + high survivability; "virtuous" answers (takes-charge, nobody-behind, counted-on, unnoticed, last-line) pushing support roles.

## Already done — don't redo

D45 (live): axis reasons describe the build (`CONFIG.explain.fitBands`, `midFit` texts), and role/range/armor texts say "in line with your answers" instead of "as requested".

---

## The work: three phases

Each phase gets its own branch off `main`, small commits, a DECISIONS entry (D46+), and ends with: summary, decisions and assumptions, commit, **stop and wait for the go** before merging. Don't merge or push without the user's go.

### Phase A — quick fixes, no layout change (branch `feedback-a`, target Oct 24)

1. **Q9 rewording.** Same option ids, same order, same effects; only the labels change (newcomer and veteran can share the text, as today):

   | id | New label |
   |---|---|
   | `calm` | A quiet morning with nowhere to be |
   | `close-call` | The first drop on a rollercoaster |
   | `wonder` | Getting lost in a museum of odd things |
   | `counted-on` | A friend calling because they need you |
   | `edge` | A late-night thriller you can't put down |
   | `freedom` | A road trip with no fixed plan |

2. **Hard-preferences copy.** Make it unmistakable that you can tick any number of boxes and that skipping means no limits (question text in `questions.json`, newcomer + veteran). Check that the options visibly look like checkboxes (they're `role="checkbox"` already) on phone and desktop.
3. **Filler strengths respect the player** (`explainBuild` in `src/engine/explain.ts`, the `build.strengths.forEach` filler). A filler strength must not name an axis the player turned down (tweak below neutral) or clearly doesn't care about. Keep "always 3 reasons" (invariant test) — propose the fallback if a build runs out; ask before relaxing the invariant. Add a test for the Reddit case: a player with no PvP priority and battlegrounds tweaked down never sees a battlegrounds strength under "why it fits".
4. **Holy Paladin solo question** → new row in `docs/OPEN_QUESTIONS.md` section A (next id), with the player's claim and our current default. Change the data only with a source in `sources.json` (Blizzard notes or similar); otherwise leave it at 2.5.

Versioning: text-only and explain-only changes don't change rankings → no version bump (as D45). Prove it: persona snapshots unchanged.

### Phase B — quiz V2 (branch `feedback-b`, target Oct 28)

This changes `questions.json`, so it needs **`LAYOUT_V2`**. Never edit `LAYOUT_V1`.

1. **Remove Q10 (`home`).** 13 → 12 questions.
2. **"No healing" and "No tanking"** on the hard-preferences screen (option ids `no-healing`, `no-tanking`; filters e.g. `noHeal`, `noTank` in `HARD_FILTERS`). These are **build-level** (drop healer / tank specs, keep the class), unlike `mustHeal`/`mustTank`, which are class-level (OPEN_QUESTIONS B3). Exclusive with `must-heal` / `must-tank`. The dual-spec partner must respect them too (`dualSpec.ts`), and the "hybrid class, flexible roles" reason shouldn't sell healing to someone who said no healing.
3. **"Got a race in mind?"** — optional single pick, default "Surprise me" (= today's behavior, racials decide). List only races the setup allows (faction, Skyborne pack). Recommended semantics, since this screen is "taken literally": classes that race can't be are excluded with a clear reason, and the chosen race is shown first on every card. Use `raceClass.json` combos only — no invented combos.
4. **"Classes to skip"** — optional multi-select of the 9 classes; skipped classes are excluded with a reason. The existing "nothing left" note must still trigger.
5. **One final screen, not three.** Hard preferences, race and classes to skip live on the same last screen (each its own question id in data and layout), so the quiz stays 12 screens. Propose the layout (compact chips; phone-friendly). Class and race words are allowed here only (D30). **Use our own glyphs in the quiz** — Blizzard icons are allowed only on results pages and the Spec Galaxy (D43/D44).
6. **Compass.** `HOME_TINT` / `LOOK_IDS.home` go away. Recommendation: the feeling answer (Q9) tints the sky; propose what the star does (today the feeling colors it). Update `compass.test.ts`.
7. **Share codes.** `CODE_VERSION = 2`, `LAYOUT_V2` + decoder, `LAYOUTS = {1: V1, 2: V2}`. The "frozen layout matches questions.json" test now pins V2; V1 keeps a decode test. Fixture: `v1.IFhACAAjAAQA` (made Oct 20: practical packer, nobody-left-behind, backstage, must heal) must still decode, rank without errors and show "results updated". Old V1 `home` picks are simply ignored (OPEN_QUESTIONS B5: recompute with current data).
8. **Texts and counts.** Exclusion texts for the new filters (newcomer + veteran) in `explanations.json`; `validate.ts` cross-checks; "Answer 13 quick questions" in `src/i18n/en.ts`; anything else that says 13; personas or tests that pick `home`; the Playwright smoke test (`tests/e2e/smoke.spec.ts`: question count and flow).
9. **Leave the look machinery alone.** With Q10 gone, `profile.aesthetic` is always empty, so the race "look" contribution (and the RP look multiplier) goes inert. Don't refactor it out 10 days before launch — note it in the backlog.

Versioning: bump `meta.dataVersion` and `ENGINE_VERSION`.

### Phase C — balance (branch `feedback-c`, target Oct 31)

1. **Make balance measurable.** Add `scripts/balance.ts` + `npm run balance` (tsx, no new dependencies) that reports, for 2,000 seeded random players with preferences cleared: #1 role and class shares next to build shares, and for each quiz option how often choosing it (vs skipping that question) changes the #1 build. Write the report to `docs/BALANCE.md` (generated, like `SCORES_REVIEW.md`).
2. **Diagnose before tuning.** Use component contributions (`rel`) to show *why* paladin and druid win and warrior, warlock and rogue don't. Check the hypotheses above. **Stop and show the user the findings and the proposed changes before tuning.**
3. **Tune** (`config.ts`; data scores only with sources). Proposed targets, to confirm with the user: every class between ~5% and ~20% of #1s for random players; tank #1 ≤ ~18%, healer #1 ≤ ~22%; no single answer flips the #1 build for more than ~40% of players (look at `festival` and `packing` → armor first).
4. **Keep what works.** Persona archetypes still land where they should (D30: all 9 class archetypes in the top 3 — find how that was measured and re-run it), the 300-player invariants pass, and spot-check a few Reddit-like players.
5. **New personas from the feedback:** "doesn't want to heal" (DPS-leaning answers + no healing → no healer anywhere, including dual spec) and "solo DPS player with one caring answer" (→ DPS #1).

Versioning: bump `ENGINE_VERSION`. Then `npm run scores:review`, `npm test`, review the snapshot diff with the user, and only then `npx vitest run -u`.

---

## Definition of done (every phase)

- `npm test`, `npm run typecheck`, `npm run build` green; Phase B also `npm run test:e2e`.
- Checked in the browser preview: the quiz screens you touched (phone and desktop width) and a result page opened from a share code.
- Works without WebGL and with `prefers-reduced-motion`.
- Every new player-facing sentence has `newcomer` and `veteran` wording, written in our own words.
- `docs/DECISIONS.md` entries; `CLAUDE.md` status line and project map updated where they changed.

## Out of scope

More quiz questions (players said the length is right); rewriting other questions unless the Phase C report flags them; analytics (a new dependency — ask first); per-result link previews (D38).
