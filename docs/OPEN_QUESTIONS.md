# Open Questions

Things we can't verify yet, plus product questions that need a decision. Data items listed here ship with
`verified: false` until resolved. Update this file whenever a source answers one of them.

Status key: 🔴 blocks a feature · 🟡 affects data quality · 🟢 nice to know

## A. Game data (checked against Blizzard's launch notes on Nov 4; re-check after the first hotfixes)

| # | Question | Why it matters | Current handling | Status |
|---|---|---|---|---|
| A1 | Are the Forever client's class colors the modern `RAID_CLASS_COLORS` values? | Brand colors for every card/glow | Use modern values, `verified: false` | 🟡 |
| A2 | Cooldowns of most racials (Will to Survive, Perception, Stoneform, Escape Artist, Eureka!, Elune's Light, Shadowmeld, Berserking, Rapid Regeneration, Cannibalize, Will of the Forsaken, Shatter Curse) | Racial-synergy weighting (burst vs utility) | Effects only, no cooldown-based weighting. The Oct 26 notes add Blood Fury's cooldown (2 min) and Berserking's duration (15 s), but none of the cooldowns listed here | 🟡 |
| A3 | Tauren Endurance after Oct 15: is the +5% health still there next to +2% crit damage/healing? | Tank/HC race picks | ✅ **Answered Oct 26** (BLZ-NOTES-OCT26): only the +5% health is left; the crit part is gone. `verified: true` | ✅ |
| A4 | Undead: "Touch of the Grave" vs "Touch of the Dead" — same racial (passive) and its proc? | Racial text | Treat as one passive + its proc | 🟢 |
| A5 | Does Shadowmeld work in combat in Forever (classic: out of combat only)? | World PvP / HC escape value | Assume classic behaviour (out of combat) | 🟢 |
| A6 | Elemental Shaman tree was "restructured" on Oct 15 — what moved? | Elemental strengths text | ✅ **Answered** (BLZ-NOTES, BLZ-NOTES-NOV2): Oct 15 made Earthbound 16, Lava Burst 21 and a returning Elemental Mastery 31. At launch Lava Burst is gone (Call of Thunder takes its slot), Elemental Mastery is renamed Lightning Mastery, and Lightning Overload is 10/20/30%. Texts updated (D54); scores keep low confidence on burst and complexity | ✅ |
| A7 | Final Arcane Blast design (redesigned Oct 15) | Arcane complexity/burst scores | ✅ **Answered** (BLZ-NOTES, BLZ-NOTES-NOV2): a 1.5 s cast whose stacks (up to 4) each add 12% of Intellect as spell damage and +100% mana cost, for 18 s. Burst and complexity stay low confidence until raids open | ✅ |
| A8 | Warrior rage bugs — fixed by launch? | Warrior leveling/sustain scores | ✅ **Answered Oct 8** (BLZ-NOTES-OCT8): the rage-from-damage bugs were fixed and rage gains rebalanced for questing warriors. Scores unchanged; warriors get their sourced review after launch (D48) | ✅ |
| A9 | Is Enhancement small-group tanking practical in 5-man dungeons? | Whether Enh may ever pass "must be able to tank" | No (Blizzard says "temporary"); mention as a strength only | 🟡 |
| A10 | Survival Hunter petless via an MM dip into Lone Wolf (31/11) — is it real or a trap? | `petStyle` for Survival → "no pets" filter | `optional`, low confidence | 🟡 |
| A11 | Is Destruction (Demonic Sacrifice) petless play common in Forever? | `petStyle` for Destruction | `optional`, low confidence | 🟡 |
| A12 | Any raid composition / performance data | Raid axis is speculative until Dec 9 | Raid scores = low confidence, labelled "speculative" in UI | 🟡 |
| A13 | Hardcore ruleset rules (deaths, trading, dungeons?) and date | HC modifiers, HC copy | Generic "permadeath" modifiers only | 🟢 |
| A14 | Does Wowhead's model viewer carry Forever data (Skyborne models, SD models)? | Spike A | See spike A notes | 🟢 |
| A15 | SD/HD toggle details (does SD = original 2004 models?) | Copy/feature riff only | Riff on the idea, no claims | 🟢 |
| A16 | Skyborne pack pricing per region/currency | Only shown as "paid pack" | Don't show prices | 🟢 |
| A17 | Build 1.60.1.70425 is reported by community sites — is it the build behind the Oct 15 notes? | Data version label | Cite the Blizzard post date, not the build | 🟢 |
| A18 | Exact launch instant: Blizzard says "3:00 p.m. PDT", but Nov 4 is after US DST ends (PST). 23:00 UTC or 22:00 UTC? | Any launch countdown / copy | Say "Nov 4, 3 pm Pacific" and avoid a live countdown until confirmed | 🟢 |
| A19 | Which racials matter for which role (the racial need-tags and weights in `src/engine/config.ts`) | Race ranking per build | Editorial judgment; review via /debug "All allowed races". Launch (D54): new tags `hitChance` (counts like crit for damage, a little for tanks) and `petDamage` (scaled by the build's pet reliance); changed racials keep their tags in proportion to the change | 🟡 |
| A20 | Effects of the "unchanged from Classic" priest racial spells (Feedback, Desperate Prayer, Hex of Weakness, Shadowguard, Touch of Weakness) | Priest race reasons | Blizzard only says "unchanged"; we describe them minimally | 🟢 |
| A21 | Does Holy Paladin solo and level well in Forever? A Reddit player (Oct 2026) says yes: Holy Strike is baseline at 6, Holy Shock comes at 21 and Light's Vigil at 31, and some players debate deep Holy against deep Ret for damage. | Holy Paladin's `soloLeveling` (2.5) and `goldFarming` (2), so how often it ranks for solo-minded players | Keep 2.5, the Classic-era healer baseline (an assumption). BLZ-PAL confirms the tools, but no source rates Holy's solo speed. Re-check with launch-week leveling reports; change the score only with a source in `sources.json`. The launch notes (BLZ-NOTES-NOV2) point the other way: Light's Vigil lost its damage, Holy Power no longer adds crit to Holy Shock or Holy Strike, and the new Holy talents (Oath of Light, Boundless Light) are healing ones | 🟡 |
| A22 | Launch warlock changes: demons get 2 health per point of your Stamina (was 7.5), Wrack's damage roughly doubles (about 36 → 86 per second at 60), Drain Soul gives fewer shards. How much safer or less safe is warlock leveling, and how good is Voidwalker tanking now? | Warlock `survivability`, `soloLeveling`, `sustain` and the HC notes | Scores unchanged; noted in each warlock's score basis. Part of the post-launch warlock review (D48) | 🟡 |
| A23 | Read Ley Line and Skysight after Oct 26: do the old "15 minutes near a ley line / Elemental Convergence" durations still exist next to the new Attuned and Charged buffs? And their cooldowns (2 min in beta)? | Skyborne racial text and tags | Describe only what the Oct 26 notes say (15 s; doubled for an hour after using it at the spot) | 🟢 |
| A24 | Talent positions the launch notes don't restate, kept from the deep dives: e.g. Holy Shock 21, Cold Blood 16, Raging Blows 16, Arcane Blast 11, Sacred Arbiter 16 | "N-point" mentions in build texts | Keep the deep-dive positions; fix when a tooltip or the talent calculator shows otherwise | 🟢 |

## C. Waiting on your review

- **`docs/SCORES_REVIEW.md`**: every build's 14 editorial scores, the extremes per axis and what each test persona gets. Tell me any number that looks wrong (e.g. "Frost Mage gold 4 → 3") or edit `src/data/builds.json`, then `npm run scores:review`.

## B. Product decisions — answered 2026-10-18

| # | Question | Decision |
|---|---|---|
| B1 | Show **Hardcore** in setup before it launches? | ✅ Yes, as "Hardcore (planning ahead — launches this winter)". |
| B2 | Skyborne "Not sure" handling | ✅ Show Skyborne races with a "needs Skyborne pack" badge and a small penalty, so a no-purchase race leads when it's close. |
| B3 | Should "must be able to heal/tank" accept a class whose **second spec** covers it (e.g. Shadow Priest + Holy dual spec)? | ✅ Yes, it's class-level. The dual-spec partner then *must* be the healer/tank build. |
| B4 | Add variant builds (Shockadin, Enhancement off-tank, petless MM) as separate stars? | ✅ No. Keep 28 builds, variants become notes/flags. Revisit after launch. |
| B5 | Old share links after a data update: recompute with new data (and say so), or freeze old data? | ✅ Recompute with current data and show "results updated since this link was made". Keep every decoder forever. |
| B6 | Popular builds for "Why not…?" — community perception is opinion. OK to hand-pick ~10 and label them "popular picks"? | ✅ Yes: a hand-picked `popular` flag in the data, no claims about balance. |
| B7 | Name: keep "Forever Main"? Domain idea? | ✅ Keep it. Vercel subdomain first (`forever-main.vercel.app`), custom domain optional. |
