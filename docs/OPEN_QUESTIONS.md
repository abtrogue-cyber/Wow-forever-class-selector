# Open Questions

Things we can't verify yet, plus product questions that need a decision. Data items listed here ship with
`verified: false` until resolved. Update this file whenever a source answers one of them.

Status key: 🔴 blocks a feature · 🟡 affects data quality · 🟢 nice to know

## A. Game data (re-check at launch, Nov 4)

| # | Question | Why it matters | Current handling | Status |
|---|---|---|---|---|
| A1 | Are the Forever client's class colors the modern `RAID_CLASS_COLORS` values? | Brand colors for every card/glow | Use modern values, `verified: false` | 🟡 |
| A2 | Cooldowns of most racials (Will to Survive, Perception, Stoneform, Escape Artist, Eureka!, Elune's Light, Shadowmeld, Berserking, Rapid Regeneration, Cannibalize, Will of the Forsaken, Shatter Curse) | Racial-synergy weighting (burst vs utility) | Effects only, no cooldown-based weighting | 🟡 |
| A3 | Tauren Endurance after Oct 15: is the +5% health still there next to +2% crit damage/healing? | Tank/HC race picks | Assume yes, label as assumption | 🟡 |
| A4 | Undead: "Touch of the Grave" vs "Touch of the Dead" — same racial (passive) and its proc? | Racial text | Treat as one passive + its proc | 🟢 |
| A5 | Does Shadowmeld work in combat in Forever (classic: out of combat only)? | World PvP / HC escape value | Assume classic behaviour (out of combat) | 🟢 |
| A6 | Elemental Shaman tree was "restructured" on Oct 15 — what moved? | Elemental strengths text | Use the Oct 7 deep dive, low confidence | 🟡 |
| A7 | Final Arcane Blast design (redesigned Oct 15) | Arcane complexity/burst scores | Low confidence | 🟡 |
| A8 | Warrior rage bugs — fixed by launch? | Warrior leveling/sustain scores | Score from intent, flag as beta | 🟡 |
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

## B. Product decisions — answered 2026-10-18

| # | Question | Decision |
|---|---|---|
| B1 | Show **Hardcore** in setup before it launches? | ✅ Yes, as "Hardcore (planning ahead — launches this winter)". |
| B2 | Skyborne "Not sure" handling | ✅ Show Skyborne races with a small penalty, so a no-purchase race leads when it's close. **No "needs pack" badge.** |
| B3 | Should "must be able to heal/tank" accept a class whose **second spec** covers it (e.g. Shadow Priest + Holy dual spec)? | ✅ Yes, it's class-level. The dual-spec partner then *must* be the healer/tank build. |
| B4 | Add variant builds (Shockadin, Enhancement off-tank, petless MM) as separate stars? | ✅ No. Keep 28 builds, variants become notes/flags. Revisit after launch. |
| B5 | Old share links after a data update: recompute with new data (and say so), or freeze old data? | ✅ Recompute with current data and show "results updated since this link was made". Keep every decoder forever. |
| B6 | Popular builds for "Why not…?" — community perception is opinion. OK to hand-pick ~10 and label them "popular picks"? | ✅ Yes: a hand-picked `popular` flag in the data, no claims about balance. |
| B7 | Name: keep "Forever Main"? Domain idea? | ✅ Keep it. Vercel subdomain first (`forever-main.vercel.app`), custom domain optional. |
