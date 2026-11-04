# Research — WoW: Forever (Phase 0)

> Checked **2026-10-18** (all sources accessed that day). The game is in **beta** until Oct 21 PT, and most class and racial
> details below come from beta-era posts. Re-verify everything against the launch patch notes (Nov 4).
> Everything here is in our own words; follow the links for the originals.
>
> **Re-checked 2026-11-04 against Blizzard's launch notes** (Nov 2, which include the Oct 26 racial pass) and the
> Oct 1 / Oct 8 builds the first pass had missed. §5 shows the launch racials; §12 lists every launch change that
> touches our data. Where §7 disagrees with §12, §12 wins.

**Labels used below**

| Label | Meaning |
|---|---|
| **[official]** | Blizzard post (news site, forums) |
| **[beta]** | official, but explicitly beta-stage / "may change" |
| **[community]** | fan wiki or guide site, not confirmed by Blizzard |
| **[assumption]** | our inference — not stated by any source |

---

## 1. Sources

| ID | Source | Date shown | URL |
|---|---|---|---|
| WIKI | warcraft.wiki.gg — World of Warcraft: Forever (rev. 6922679) | edited 2026-10-18 | https://warcraft.wiki.gg/wiki/World_of_Warcraft:_Forever |
| WIKI-CLS | warcraft.wiki.gg — per-class pages, e.g. Warrior/Paladin/Hunter abilities (Forever) | edited 2026-10-16…18 | https://warcraft.wiki.gg/wiki/Warrior_abilities_(Forever) (same pattern for all 9) |
| WIKI-SKY | warcraft.wiki.gg — Skyborne (lore) | — | https://warcraft.wiki.gg/wiki/Skyborne |
| WIKI-COL | warcraft.wiki.gg — Class colors | edited 2024-09-03 | https://warcraft.wiki.gg/wiki/Class_colors |
| BLZ-RACE | Blizzard — "Create the Hero You Want to Be in World of Warcraft: Forever" | not shown (BlizzCon era) | https://news.blizzard.com/en-us/article/24304075 |
| BLZ-HD | Blizzard — Forever Class Deep Dives: Hunter and Druid | Sep 30 | https://worldofwarcraft.blizzard.com/en-us/news/24301515 |
| BLZ-PW | Blizzard — Forever Class Deep Dives: Priest and Warrior | Sep 30 (per page) | https://worldofwarcraft.blizzard.com/en-us/news/24301514 |
| BLZ-RW | Blizzard — Forever Class Deep Dives: Rogue and Warlock | Oct 7 | https://worldofwarcraft.blizzard.com/en-us/news/24310968 |
| BLZ-MS | Blizzard — Forever Class Deep Dives: Mage and Shaman | Oct 7 | https://worldofwarcraft.blizzard.com/en-us/news/24302097 |
| BLZ-PAL | Blizzard — Forever Class Deep Dives: Paladin | Oct 15 | https://worldofwarcraft.blizzard.com/en-us/news/24302099 |
| BLZ-NOTES-OCT1 | Blizzard forums (Kaivax) — dev notes for the Oct 1 beta build (post #4 of the thread) | 2026-10-01 | https://us.forums.blizzard.com/en/wow/t/2360696/4 |
| BLZ-NOTES-OCT8 | Blizzard forums (Kaivax) — dev notes for the Oct 8 beta build (post #5) | 2026-10-08 | https://us.forums.blizzard.com/en/wow/t/2360696/5 |
| BLZ-NOTES | Blizzard forums (Kaivax) — WoW Forever Beta Development Notes, updated Oct 15 | posted 2026-10-16 | https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-15/2360696/6 |
| BLZ-NOTES-OCT26 | Blizzard forums (Kaivax) — final racial pass for launch (posts #7 and #8) | 2026-10-26, additions 10-27 | https://us.forums.blizzard.com/en/wow/t/2360696/7 |
| BLZ-NOTES-NOV2 | Blizzard forums (Kaivax) — "Updated November 2": every change since the Oct 15 build, for launch (post #9) | 2026-11-02, edited 11-03 | https://us.forums.blizzard.com/en/wow/t/2360696/9 |
| BLZ-LAUNCH | Blizzard (mirrored by Wowhead) — "Carve a New Path with World of Warcraft: Forever" | — | https://www.wowhead.com/forever/blue-tracker/news/eu/24302093 |
| TAV-HD | Warcraft Tavern — Hunter & Druid deep-dive summary (Luxrah) | 2026-09-30 | https://www.warcrafttavern.com/forever/news/powershifting-is-back-sort-of-hunter-druid-deep-dive-for-wow-forever/ |
| TAV-CLS | Warcraft Tavern — Classes & Specializations | undated | https://www.warcrafttavern.com/forever/guides/classes/ |
| TAV-SKY | Warcraft Tavern — Skyborne Racial Abilities | undated (Oct) | https://www.warcrafttavern.com/forever/guides/skyborne-racials/ |
| TAV-RAC | Warcraft Tavern — Racial & Class Ability Changes in the Beta | 2026-10-16 | https://www.warcrafttavern.com/forever/news/racial-class-ability-changes-in-the-wow-forever-beta/ |
| ZOK | Zockify — WoW Forever hub | — | https://www.zockify.com/forever/ |
| ZOK-RACE | Zockify — Racials and Class Combos (changelog Oct 16, build 1.60.1.70425) | 2026-10-16 | https://www.zockify.com/forever/races/ |
| ZOK-SKY | Zockify — Skyborne | 2026-09-17 | https://www.zockify.com/forever/skyborne/ |
| ZOK-SHA / ZOK-WLK | Zockify — Shaman / Warlock guides | 2026-10-17 | https://www.zockify.com/forever/shaman/ · https://www.zockify.com/forever/warlock/ |
| ZOK-LEG | Zockify — Legacy System & Talents | — | https://www.zockify.com/forever/legacy-system/ |

The official landing page (https://worldofwarcraft.blizzard.com/forever) renders with JavaScript, and a fetch returns no content.
Icy Veins and Massively OP returned HTTP 403, so they aren't used.

---

## 2. Checking brief §1, claim by claim

| Brief claim | Status | Notes | Sources |
|---|---|---|---|
| Launch Nov 4, 2026, 3 pm PT; midnight Nov 4→5 CET | ✅ (time label ⚠️) | 3 pm Pacific. Blizzard's post labels it "PDT", but US DST ends Nov 1, so Pacific time on Nov 4 is PST. Most likely **23:00 UTC = 00:00 CET Nov 5** (Zockify agrees). If "PDT" were literal it would be 23:00 CET Nov 4 → OPEN_QUESTIONS A18. | BLZ-LAUNCH, ZOK |
| Permanent level 60, new zones/quests/dungeons/raids; no flying, no level scaling | ✅ | 1,000+ quests, 9 new dungeons, new zones (Mount Hyjal, Shen'dralas, Riverglades, Zephras Isle). "No expansions" isn't stated in those words, but the roadmap is content patches. | WIKI, ZOK |
| 9 classes, each keeps 3 trees | ✅ | Every class page lists the classic three trees. | WIKI-CLS |
| Talents from level 10; 1-point milestones at 11/21/31 + new 16-point milestone | ✅ **[beta]** | Same row count as classic (7 tiers). Talents are changed at a class trainer. The milestones are "gold" talents. | BLZ-HD, BLZ-PW, BLZ-MS |
| Dual spec at 40 for 10 g; swap freely outside combat | ✅ | Also blocked inside battlegrounds. Each spec has its own respec fee, which decays to 1 g. | WIKI |
| Races + Skyborne needs a paid pack | ✅ | Skyborne Heroic Pack, Skyborne Epic Pack, or Warcraft Forever Collection (WIKI). Community-reported prices: $29.99 / $59.99 / $79.99, plus a $150 Collector's Edition **[community]**. No TBC+ races. | WIKI, ZOK-SKY |
| Race/class matrix (incl. ★ combos and Skyborne restrictions) | ✅ | Matches Blizzard's per-race counts (Human 7, Dwarf 6, Gnome 5, NE 5, Orc 6, UD 6, Tauren 4, Troll 7, Skyborne 5 per faction). Six new combos: Human Hunter, Dwarf Shaman, Gnome Priest, Orc Mage, Undead Paladin, Troll Warlock. | BLZ-RACE, WIKI, ZOK-RACE |
| Racials: 2 active + 2 passive, names as listed | ✅ with update | The brief's names match the **Oct 15 build**. Blizzard's original race article still shows Sword/Mace/Axe Specialization. Those were replaced by **Ruthless / Earth Fury / Savage** on Oct 15. | BLZ-RACE, BLZ-NOTES |
| Skyborne variants ↔ faction | ✅ resolved | **High Order = Alliance** (can be Mage). **Windshaper = Horde** (can be Shaman). | BLZ-RACE, WIKI-SKY, TAV-SKY |
| Hunter: Aimed Shot baseline 20, traps in combat, Fox pets, stronger melee Survival, petless option | ✅ **[beta]** | Petless = Marksmanship 11-point talent **Lone Wolf**. | BLZ-HD, TAV-HD |
| Paladin: Holy Strike; Ret supports seal twisting | ✅ **[beta]** | Seal twisting is no longer baseline. It returns as the Ret 31-point talent **Twist of Light**. | BLZ-PAL |
| Priest: Fear Ward + Devouring Plague for all at 20 | ✅ **[beta]** | | BLZ-PW |
| Warlock: drain-focused Affliction | ✅ **[beta]** | Improved Drains, Soul Siphon, and **Wrack** (31). | BLZ-RW |
| Warrior: rage tuning, shorter big cooldowns, more Prot options | ✅ **[beta]** | Blizzard is still fixing rage bugs ("may take a few weeks"). | BLZ-PW |
| Rogue: Hack and Slash, Venom, poison crits | ✅ **[beta]** | | BLZ-RW |
| Druid: shapeshifting changes | ✅ **[beta]** | See §6. | BLZ-HD, TAV-HD |
| Rulesets Normal/PvP/RP/Hardcore, one mega-realm per ruleset per region; Hardcore Winter 26/27 | ✅ | Grouping is limited to the same ruleset and faction **[community]**. | WIKI, ZOK |
| Raids Dec 9: Barrow Deeps (10), Hyjal Summit (20), Onyxia (40) | ✅ | Spring/Summer 2027 bring more raids and dungeons. | WIKI, ZOK |
| SD/HD model toggle | ✅ (feature only) | No further details anywhere. | WIKI |
| Beta ends Oct 22 | ⚠️ minor | The wiki lists Sep 17 – Oct 22. Zockify reports "through Oct 21 PT", which is the same night in Europe. | ZOK, WIKI |

---

## 3. Timeline

| Date | Event | Source |
|---|---|---|
| Sep 17 – Oct 21 PT | Beta | WIKI, ZOK |
| Oct 27 – Nov 3 | Early name reservation, up to 3 characters | WIKI |
| **Nov 4, 15:00 PST** (Nov 5 00:00 CET) | Launch | BLZ-LAUNCH |
| Dec 9 | Raids unlock: Barrow Deeps (10), Hyjal Summit (20), Onyxia's Lair (40) | WIKI |
| Winter 2026/27 | Hardcore ruleset | WIKI |
| Spring 2027 | 2 raids, 2 dungeons, new zone/quests, legendary questline, PvP season refresh | WIKI |
| Summer 2027 | Revamped iconic raid + 1 new raid, 2 dungeons, world content, PvP refresh | WIKI |

---

## 4. Races and the race/class matrix

**Factions:** Alliance = Human, Dwarf, Gnome, Night Elf, Skyborne (High Order). Horde = Orc, Undead, Tauren, Troll, Skyborne (Windshaper).

| Race | Classes (★ = new in Forever) |
|---|---|
| Human | Hunter★, Mage, Paladin, Priest, Rogue, Warlock, Warrior |
| Dwarf | Hunter, Paladin, Priest, Rogue, Shaman★, Warrior |
| Gnome | Mage, Priest★, Rogue, Warlock, Warrior |
| Night Elf | Druid, Hunter, Priest, Rogue, Warrior |
| Orc | Hunter, Mage★, Rogue, Shaman, Warlock, Warrior |
| Undead | Mage, Paladin★, Priest, Rogue, Warlock, Warrior |
| Tauren | Druid, Hunter, Shaman, Warrior |
| Troll | Hunter, Mage, Priest, Rogue, Shaman, Warlock★, Warrior |
| Skyborne★ (both) | Druid, Hunter, Rogue, Warrior + **Mage (Alliance/High Order only)** or **Shaman (Horde/Windshaper only)** |

**Engine implications** (our analysis):
- **Every class is available to both factions without Skyborne.** Alliance Shaman = Dwarf only; Horde Paladin = Undead only. The faction filter never removes a class, it only changes the race pool.
- Some classes have thin race pools on one side: Alliance Shaman (Dwarf, or Skyborne is impossible), Horde Paladin (Undead only), Alliance Druid (Night Elf + Skyborne), Horde Druid (Tauren + Skyborne).
- All Skyborne combos count as new, since the race itself is new.

---

## 5. Racials (launch: the Oct 15 beta notes plus the Oct 26 racial pass)

Effects are in our own words. Values from **BLZ-RACE** (the original article), with changes from **BLZ-NOTES** (Oct 15) and **BLZ-NOTES-OCT26** (Oct 26, repeated in BLZ-NOTES-NOV2) applied on top.
"—" = not stated in any source we found (→ OPEN_QUESTIONS).

| Race | Racial | Type | Effect (launch) | Cooldown | Changes (Oct 15 · Oct 26) |
|---|---|---|---|---|---|
| Human | Will to Survive | active | Breaks stuns | — | |
| Human | Perception | active | Detect stealthed enemies for 20 s | — | |
| Human | Ruthless | passive | +1% crit chance, any weapon | — | **new** Oct 15 (replaced Sword Specialization) · **nerfed** Oct 26 (was 2%) |
| Human | The Human Spirit | passive | +10% Spirit | — | **buffed** Oct 26 (was 5%) |
| Dwarf | Stoneform | active | 8 s: immune to bleeds, poisons, diseases; less physical damage taken | — | |
| Dwarf | Find Treasure | active | Tracks treasure chests; chance of extra loot from most chests | — | buffed |
| Dwarf | Artisan's Precision | passive | +1% hit chance with spells and attacks | — | **new** Oct 26 (replaced Earth Fury, +2% crit damage/healing, which had replaced Mace Specialization on Oct 15) |
| Dwarf | Big Game Hunter | passive | +5% damage vs Beasts | — | |
| Gnome | Escape Artist | active | Short immunity to roots and snares | — | |
| Gnome | Eureka! | active | 8 s buff: cheaper spells/abilities and +10% damage/healing; also boosts Power Word: Shield; not usable in stealth | — | **nerfed** (was "next 3 casts") |
| Gnome | Expansive Mind | passive | +5% max mana, rage or energy | — | |
| Gnome | Engineering Specialization | passive | Engineering gadgets are more reliable | — | |
| Night Elf | Elune's Light | active | +10% crit chance for 15 s | — | |
| Night Elf | Shadowmeld | active | Stealth while standing still | — | |
| Night Elf | Quickness | passive | +1% dodge, +2% run speed (now stacks with other speed boosts) | — | buffed |
| Night Elf | Wisp Spirit | passive | +75% run speed while dead | — | |
| Orc | Blood Fury | active | +10% attack power and spell power for 15 s | **2 min** | nerfed Oct 15 (2 → 3 min) · back to 2 min Oct 26 |
| Orc | Shatter Curse | active | Removes curses and banes; 8 s of 5% less magic damage taken | — | **reworked** (was immunity + 15%) |
| Orc | Command | passive | Hunter and Warlock pets deal 5% more damage | — | **back** Oct 26 (replaced Savage, +1% crit, which had replaced Axe Specialization on Oct 15) |
| Orc | Hardiness | passive | Stuns on you last 20% shorter | — | |
| Undead | Will of the Forsaken | active | Breaks charm, fear and sleep (not usable while Scatter Shot'd) | — | |
| Undead | Cannibalize | active | Eat a corpse to regenerate 35% health and mana over time | — | Nov 2: usable again while immune to physical damage |
| Undead | Underwater Breathing | passive | Breath lasts 300% longer | — | |
| Undead | Touch of the Grave | passive | Attacks/spells sometimes drain health from the target (proc ~30% casters / 20% Paladin, Rogue, Warrior; 15 s internal cooldown) | — | retuned Oct 15 (the proc is called "Touch of the Dead" in the notes) · internal cooldown 25 → 15 s Oct 26 · Nov 2: fixed to trigger as often as intended |
| Tauren | War Stomp | active | 2 s area stun around you | **90 s** | buffed (was 2 min) |
| Tauren | Cultivation | active | Grow bonus herbs, no Herbalism needed | **15 min** | buffed (was 60 min) |
| Tauren | Plainsrunning | passive | Run speed ramps up while you keep moving: 2% per stack, up to +60%; nothing while mounted | — | Oct 15: +3% mounted speed, stutter-step no longer keeps it · Oct 26: 2% per stack up to 60% (was 1% / 30%), mounted bonus removed |
| Tauren | Endurance | passive | +5% max health | — | Oct 15: +1% hit → +2% crit damage/healing · Oct 26: only the +5% health is left (A3 answered) |
| Troll | Berserking | active | +10% attack and casting speed for 15 s | — | **buffed** Oct 26 (was 10 s) |
| Troll | Rapid Regeneration | active | Regenerate 50% of max health over time | — | |
| Troll | Beast Slaying | passive | +5% damage vs Beasts | — | |
| Troll | Regeneration | passive | 20% of health regen continues in combat | — | buffed (was 10%) |
| Skyborne (both) | Walk on Air | active | Slow fall you can steer | **90 s** | buffed (was 2 min) |
| Skyborne (both) | Wind Blessed | passive | **+2% haste** (melee, ranged, spells) | — | buffed Oct 15 (1 → 3%) · **nerfed** Oct 26 (3 → 2%) |
| Skyborne (both) | Elemental Insight | passive | +5% damage vs Elementals | — | |
| Skyborne — High Order (A) | Read Ley Line | active | +50% health and mana regen for 15 s; castable while moving; not usable while Innervate is on you. Using it at a ley line grants **Attuned** for 1 h (kept through death, lost on entering a raid): +100% while Attuned | 2 min (beta) | Oct 15: minimum 20 → 30 s · **nerfed** Oct 26 (was +100% for 30 s, or 15 min near a ley line; A23) |
| Skyborne — Windshaper (H) | Skysight | active | +15% movement speed for 15 s; castable while moving. Using it at an Elemental Convergence grants **Charged** for 1 h (kept through death, lost on entering a raid): +30% while Charged | 2 min (beta) | Oct 15: castable while moving · Oct 26: was +10% for 30 s, or 15 min near a Convergence (A23) |

Sources: BLZ-RACE, BLZ-NOTES, BLZ-NOTES-OCT26, BLZ-NOTES-NOV2, TAV-RAC, TAV-SKY, ZOK-RACE. Blizzard's stated goal for the Oct 26 pass: more racial identity, so some races are a bit better at certain roles, but no weapon specializations (loot tables). Druids can use racials in forms (incl. Shadowmeld, War Stomp, Walk on Air) **[beta]** (BLZ-HD).

**Priest racial spells** (matter for Priest race picks) **[beta]**, from BLZ-PW:

| Race | Spells (own words) |
|---|---|
| Human | Divine Grace — instant heal on an ally below 50% (not self); Feedback (unchanged) |
| Dwarf | Desperate Prayer (unchanged); Chastise — 2 s root on a humanoid |
| Gnome | Confounding Flash — 3 s confuse on up to 5 nearby enemies; Contingency Plan — ward that shields + heals the target below 35% |
| Night Elf | Starshards — much stronger, 30 s cooldown; Elune's Grace — 50% chance for attacks to miss you (15 s / 3 misses) |
| Troll | Hex of Weakness, Shadowguard (both unchanged) |
| Undead | Touch of Weakness (unchanged); Dark Sacrifice — turn health into mana over time (Spirit-scaled) |

---

## 6. Skyborne

- New playable race for both factions. Lore: high elves descended from the people of Eldre'Thalas, living on Zephras Isle, which wind spirits lifted into the sky. This lore exists only in Forever. (WIKI-SKY)
- **High Order** = Alliance, an arcane-leaning variant that can be a Mage. **Windshaper** = Horde, a shamanic variant that can be a Shaman. (BLZ-RACE, WIKI-SKY)
- Classes on both sides: Druid, Hunter, Rogue, Warrior. Skyborne druids get race-specific forms (Bear, Cat, Travel, Moonkin shown). (ZOK-SKY)
- Start on Zephras Isle, levels 1–12. Requires a Skyborne pack or the Forever Collection. (WIKI, ZOK-SKY)
- **Engine note:** Wind Blessed (+3% haste in beta) was the strongest passive DPS racial on paper **[assumption]**, so Skyborne often ranked high on "racial synergy". The Oct 26 pass cut it to +2% and halved Read Ley Line, so Skyborne leads fewer race lists at launch (D54). The setup's pack question must filter reliably, and "Not sure" gets a pack badge plus a small penalty (DECISIONS D15).

---

## 7. Classes — what changed (beta deep dives)

All **[beta]** — Blizzard repeats that "abilities and talents may change during the beta". "Gold" = a one-point milestone talent at 11/16/21/31 points in the tree.
Lines marked **→ §12** changed before launch; §12 has the launch version.

### Warrior (BLZ-PW, BLZ-NOTES)
- **Official role:** melee, tank or damage; great sustained multi-target melee; poor at recovering from heavy damage.
- **Baseline:** Tactical Mastery at 14 (keep 10 rage on stance swap). **Victory Rush at 20** (heals 10% on kill). Recklessness/Shield Wall/Retaliation no longer share a cooldown (the latter two are 15 min). Rage from taking damage is no longer cut by armor. Thunder Clap works in Defensive Stance. Battle Shout is raid-wide (Oct 15).
- **Arms:** 16 Spearing Strike (dismount; bonus vs mounted/dragons/giants). New Bloodthrill and **Weaponmaster** (weapon specs merged). 31 Mortal Strike.
- **Fury:** 16 Raging Blows (Whirlwind hits with both weapons). New Boundless Rage and Precision **→ §12** (Oct 1: Whirlwind always hits with both weapons, Raging Blows makes it cheaper, Boundless Rage removed). Bloodthirst no longer heals, gives +10% move speed instead. Death Wish now raises damage taken.
- **Protection:** 16 Vanguard (Charge in Defensive Stance). New Master of Defense, Bastion, Focused Rage. Improved Shield Wall gets a big cooldown cut. 31 Shield Slam.
- **Watch:** rage-generation bugs in beta (Blizzard: "may take a few weeks"). **→ fixed Oct 8 (§12).**

### Paladin (BLZ-PAL, BLZ-NOTES)
- **Official role:** tank, damage or healer; very strong vs Undead/Demons; strong single-target healer; limited range, no interrupts, no slows.
- **Baseline:** **Holy Strike** at 6 (instant Holy damage, weapon-based). **Seal of Fury** at 10 (tank seal: Holy damage per swing, small absorb, judgement taunts at 10 yd). Consecration for all at 20 (threat capped to 4 targets). Lay on Hands cooldown 20 min. Judgement no longer eats the seal. Salvation is no longer a Blessing.
- **Holy:** 11 Voice of Truth (silence/interrupt immunity). 16 Divine Favor. **21 Holy Shock** (10 s cooldown) → "Shockadin" hybrids are officially supported. 31 **Light's Vigil** (group heal / setup damage). **→ §12**
- **Protection:** 11 Improved Seal of Fury. 16 Swift Judgement. **21 Templar's Bulwark** (8 s absorb = 100% max HP). 31 Holy Shield. New Sacred Duty, Iron Creed. **→ §12**
- **Retribution:** 16 Sacred Arbiter. 21 Repentance. **31 Twist of Light** (seal twisting made approachable). New Holy Conduit, Sanctified Judgement, Champion of the Light (Intellect → spell damage, nerfed Oct 15), Instrument of Law. **→ §12**

### Hunter (BLZ-HD, TAV-HD, BLZ-NOTES)
- **Official role:** damage only; longest range of any class but no shots within 8 yd; no stun, no interrupt; **pet can tank in solo and small-group play**; talents allow pet-focused, ranged, trap/melee **or petless** play.
- **Baseline:** Aimed Shot at 20. Traps usable in combat (30 s cooldown, placed at your feet). **Fox** pet family. Every pet family has Bite/Claw + Dive/Dash + one unique skill. Pets scale with your gear. Trueshot Aura is raid-wide (Oct 15). Auto Shot needs 0.5 s standing still (Oct 15).
- **Beast Mastery:** 16 Summon Hawk. New Focused Fire.
- **Marksmanship:** **11 Lone Wolf** (+20% damage without a pet). 21 Trueshot Aura. 31 Sniper Shot. New Careful Aim, Rapid Killing, Rapid Recuperation.
- **Survival:** 16 Counterattack. 21 Strider Kick. 31 Lacerating Strikes (Mongoose Bite bleed). New Predator's Edge (dual-wield), Resourcefulness, Expose Prey. Wyvern Sting removed.

### Rogue (BLZ-RW)
- **Official role:** stealth and control specialist; the only class with poisons; high single-target melee damage.
- **Baseline:** More poison charges, and poisons stack with sharpening/weight stones. Sap no longer breaks stealth. **One-handed axes** usable. Expose Armor ≈ 5 Sunders.
- **Assassination:** 16 Cold Blood. **21 Mutilate** (daggers). **31 Venom** (finisher, +30% poison damage). Malice/Precision now cover poisons (poison crits). **→ §12**
- **Combat:** 16 Flawless Execution. **Hack and Slash** (row 5) replaces all weapon specs.
- **Subtlety:** 16 Premeditation. 31 Thousand Cuts. New Quietus and **Cutthroat** (Ambush without stealth after a Backstab). **→ §12**

### Priest (BLZ-PW, BLZ-NOTES)
- **Official role:** the most versatile healer (HoTs, direct heals, shields); Shadow = DoTs; fragile, few escapes; Shadow's utility is weaker than a Warlock's.
- **Baseline:** **Fear Ward + Devouring Plague for all at 20.** Divine Spirit at 30. Shadow Word: Death at 32. Fade threat doubled. Prayer of Healing heals the *target's* party. Several Renews can sit on one target.
- **Discipline:** 16 Soul Warding. **21 Penance**. New Twin Disciplines, Power in Light, Renewed Hope, Divine Aegis.
- **Holy:** 16 **Binding Heal**. 31 **Prayer of Mending**. Lightwell removed. **→ §12**
- **Shadow:** 16 Vampiric Embrace. New Improved Mind Flay, Devouring Contagion (spreads on death), Early Demise. Shadowform allows all non-healing spells.

### Shaman (BLZ-MS, BLZ-NOTES, ZOK-SHA)
- **Official role:** totems, party/raid buffs, healing, flexible melee or spell damage, mail + shield; no real crowd control; leans on allies for control and survival. **Enhancement can be a "temporary tank in small group gameplay".**
- **Baseline:** Totem GCD 1.0 s, buff totems last 5 min. **Call of the Elements** (20, plus two more presets at 30/40) drops a saved set of 4 totems. Totemic Recall/Projection. Weapon imbues last 60 min and stack with stones/oils. Fire Nova is now a spell at your fire totem. Several totems are raid-wide (Oct 15).
- **Elemental:** 16 Call of Thunder. 21 Earthbound. **31 Lava Burst**. Lightning Overload new. Elemental Mastery removed. ⚠️ The tree was "restructured" again on Oct 15, details unverified. **→ §12** (the Oct 15 notes did list the moves; A6)
- **Enhancement:** 11 Shamanistic Focus. 16 Stormstrike (8 s cooldown; **6 s at launch**). **21 Spirit Weapons** (more threat with Rockbiter → off-tanking). 31 Rage of the Farseer. New **Maelstrom Weapon**.
- **Restoration:** 11 Water Shield. 16 Mana Tide Totem. **31 Riptide**.

### Mage (BLZ-MS, BLZ-NOTES)
- **Official role:** strong ranged single-target and AoE damage, CC (Polymorph), raid buffs, food and water; very fragile, weak in melee.
- **Baseline:** **Frostfire Bolt** at 40 (counts as Fire and Frost). **Frost Blast** at 24 (Oct 15; **removed at launch**). Comprehension (new minor tradeskill for reading scrolls). Shorter Cone of Cold (anti-kite-farming). Better Mage Armor regen.
- **Arcane:** **11 Arcane Blast** (redesigned Oct 15: stacking spell-damage buff). 16 Missile Barrage. New Arcane Geometry. **→ §12**
- **Fire:** New Heating Up (crits speed up Pyroblast). Ignite is per-mage. Wake of Fire.
- **Frost:** **11 Ice Lance**. 16 Ice Block. 21 Cold Snap (10 min). New **Fingers of Frost**. Improved Blizzard slow capped at 40%.

### Warlock (BLZ-RW, BLZ-NOTES, ZOK-WLK)
- **Official role:** competitive caster damage in three styles; physically weak, relies on demons for protection.
- **Baseline:** Curse of Agony/Doom become **Banes** (one Bane + one Curse per target). Curse of the Elements covers all magic. Curse of Shadows removed. Firestone/Spellstone are weapon imbues. Life Tap scales with Spirit. Drain Soul can give shards mid-channel. **Pets scale with your stats**. DoTs and drains can crit.
- **Affliction:** 16 Curse of Exhaustion. **31 Wrack** (drain-DoT). New Improved Drains, Pandemic, Soul Siphon. Malediction → Grim Reach (Oct 15).
- **Demonology:** **11 Demonic Sacrifice** (2 h buff). 16 Fel Domination. **31 Demonic Pact** (keep the sacrifice buff with another demon out). **Demonic Brand** (row 4) gives pet attacks high threat, a good fit for Voidwalker tanking (official wording). **→ Oct 8: only its Shadow damage draws high threat (§12).**
- **Destruction:** 16 Conflagrate. **21 Bane of Havoc**. **31 Incinerate**. New Shadow and Flame, Molten Skin, Cataclysm.

### Druid (BLZ-HD, TAV-HD, BLZ-NOTES)
- **Official role:** can fill any role; strong healers; fully capable tanks and damage dealers; no snares, silences or interrupts; weaker CC; HoT healing needs planning.
- **Baseline / forms:** Most potions and consumables work in form. Weapon enchants and procs work in form. Doors usable in form. Racials usable in form. Revive (out-of-combat rez) at 12. Nature's Grasp at 10. Omen of Clarity at 20. Lacerate at 42 (**a Feral talent at launch**). Hurricane has no cooldown. Tiger's Fury removed. Leader of the Pack and Moonkin Aura raid-wide (Oct 15).
- **Balance:** 11 Nature's Splendor. 16 Insect Swarm. Moonkin Form (all non-healing spells castable). New Genesis, Nature's Majesty, Eclipse, Overgrowth.
- **Feral:** 11 Feral Charge (+ a Cat version). 16 **Shifting Power** (Cat: instant 40 energy — "powershifting made approachable") / **Primal Bite** (Bear, replaces Mangle). 21 Leader of the Pack (exclusive with Moonkin Form). 31 **Berserk**. Thick Hide redesigned for tanks. **→ §12**
- **Restoration:** 11 Gift of the Earthmother **→ §12**. 16 Swiftmend. **31 Wild Growth**. Furor gives Cat energy regen outside Cat Form (blocks old bear-weaving).

---

## 8. New roles? (conclusion)

**No brand-new dedicated role exists.** The roles stay classic: Warrior/Paladin/Druid tank; Priest/Paladin/Druid/Shaman heal. The beta adds these **role-adjacent options** (all [beta], official wording unless noted):

| Option | What Blizzard says | Proposal (see PLAN.md) |
|---|---|---|
| Enhancement Shaman tanking | "temporary tank in small group gameplay" (Rockbiter + Spirit Weapons) | Not a tank build. Flag `offTank: smallGroup` and mention it as a strength. |
| Warlock Voidwalker tanking | Demonic Brand gives pet attacks high threat, "suits tanking pets like the Voidwalker" | A trait for Demonology (solo/small-group safety). |
| Hunter pet tanking | pet can tank in solo and small-group play | Feeds solo/HC survivability scores. |
| Petless Hunter | Lone Wolf (MM 11) | `petStyle: optional` for MM (and SV via an MM dip **[assumption]**), so the "no pets" filter doesn't drop them. |
| Shockadin | Holy Shock (21) as the alternative to Twist of Light for hybrid Holy builds (launch: Twist of Light is gone and Light's Vigil lost its damage, §12) | Keep out of the build list for M1. Mention as a variant note on Holy/Ret. |

---

## 9. Class colors

The wiki's current `RAID_CLASS_COLORS` table (retail values) is below. **Not verified for the Forever client** → `verified: false` until we can check in-game (OPEN_QUESTIONS).

| Class | Hex | Class | Hex |
|---|---|---|---|
| Druid | `#FF7C0A` | Rogue | `#FFF468` |
| Hunter | `#AAD372` | Shaman | `#0070DD` |
| Mage | `#3FC7EB` | Warlock | `#8788EE` |
| Paladin | `#F48CBA` | Warrior | `#C69B6D` |
| Priest | `#FFFFFF` | | |

History (WIKI-COL): in vanilla 1.x, Shaman used the same pink as Paladin (`#F58CBA`). Mage `#69CCF0` and Warlock `#9482C9` were the pre-7.0 values. Classic Era uses the modern blue Shaman **[assumption]**.
Priest white needs special care on our light/parchment surfaces (outline or a dark pill).

---

## 10. Other systems that affect "which main?"

- **Dual spec** (40, 10 g) → the dual-spec partner suggestion is very relevant. "Must be able to heal/tank" can be satisfied through the second spec. (WIKI)
- **Rulesets:** one mega-realm per ruleset/region, and you can only group within your ruleset + faction **[community]** → ruleset is a real choice, not a server pick. (WIKI, ZOK)
- **Hardcore** launches Winter 26/27. For now it's "plan ahead" only.
- **Legacy system:** account-wide Legacy Points (e.g. for leveling each class to 25/45/60) spent per character on Legacy talents. It isn't class-specific → no effect on rankings. Maybe a fun "alts are rewarded" line. (ZOK-LEG) **[community]**
- **Camping / campsites** exist in the open world (could affect downtime; unknown). (WIKI)
- **Oct 15 global change:** wands and Auto Shot need 0.5 s standing still → slightly worse for kiting/wand play. (BLZ-NOTES)
- **No WoW Token / boosts planned** **[community]** (ZOK).

## 11. What will still move before launch

Elemental Shaman tree (restructured Oct 15), Arcane Blast (redesigned Oct 15), Warrior rage bugs, Touch of the Grave numbers, racial cooldowns (mostly unknown), Champion of the Light, Paladin Reckoning fixes, Salvation/Mass Salvation.
**Plan:** keep `meta.json` `gameState: "Beta"` until we re-check against the launch patch notes, as soon as Blizzard posts them (likely Nov 2–4), and again on Nov 4.

**Checked Oct 24 (Phase 4, D50):** Blizzard hasn't posted anything newer than the Oct 15 notes (BLZ-NOTES): the last post in the
dev-notes thread is from Oct 16, and no launch notes are out yet. The fan sites we found (conquestcapped's patch notes page,
updated Oct 18; Massively OP, Oct 17) cover the Oct 15 build or older ones. Nothing to change, so `lastVerified` stays
2026-10-18, the day of the full check.

**Checked Nov 4 (Phase 6, D54):** Blizzard posted the final racial pass on Oct 26 (BLZ-NOTES-OCT26) and every class change
since the Oct 15 build on Nov 2 (BLZ-NOTES-NOV2, edited Nov 3; it repeats the racials "for completeness"). Kaivax's posts
were read straight from the forum thread (posts #4–#9); there is no newer post and no launch hotfix thread yet. Blizzard says
it plans no big tuning before raids open next month, apart from bugs and outliers. `gameState` is now `"Launch"`,
`lastVerified` 2026-11-04. Resolved: Elemental (A6), Arcane Blast (A7), warrior rage (A8), Tauren Endurance (A3).

---

## 12. Launch changes that touch our data (Nov 2 notes, plus the Oct 1 / Oct 8 builds)

Our own words. **[official]** unless marked. "Row 3" = an 11-point talent, row 4 = 16, row 5 = 21, row 7 = 31.

**Everyone:** Blizzard raised damage for every class and raised the health of higher-level creatures to match, aiming for
classes that each feel valuable rather than equal. Proc talents no longer lose chance on low spell ranks (except on the
Blizzard spell). Learning a spell no longer puts it on your bars. Training 1–60 costs about 206–207 g for every class. Roots from procs
now have diminishing returns. Respawns are faster in low-level zones for the launch rush. (BLZ-NOTES-NOV2)

**Racials:** see §5 (Oct 26 pass). Blizzard's goal: more racial identity, so some races are a bit better at certain roles,
and some role or class racials (like Orc Command) come back, but not the weapon specializations.

| Class | What changed (and where it shows in our data) | Source |
|---|---|---|
| Warrior | Oct 1: Whirlwind always hits with both weapons (no talent needed); Raging Blows makes Whirlwind and Cleave cheaper; Boundless Rage removed. Oct 8: the rage-from-damage bugs are fixed and rage is rebalanced for questing warriors (A8). Launch: Defensive Stance threat +30% → +80%, Slam cooldown 15 s; Arms: Two-Handed Weapon Specialization 2/4/6%, Bloodthrill 2 points; Fury: Flurry 10/20/30% over 3 points, new Reckless Swings (spend health for rage) and Improved Whirlwind, Bloodthirst now needs Death Wish; Prot: Defiance up to 20% threat. | BLZ-NOTES-OCT1, BLZ-NOTES-OCT8, BLZ-NOTES-NOV2 |
| Paladin | Righteous Fury at 10, with more threat; Salvation, Mass Salvation, Revoke and Blessing of Light removed. **Holy:** Voice of Truth removed; new Oath of Light (row 4: an oath on one ally boosts your Holy Light, Flash of Light and Holy Shock on them) and Boundless Light (row 5: more Holy Shock crit on everyone else); Holy Power now raises crit *healing* only; **Light's Vigil heals only** (its damage is gone). **Prot:** Improved Seal of Fury and One-Handed Weapon Specialization removed; **Templar's Bulwark moves to row 3** (11) and can be dispelled; Holy Shield moves to row 5 (21); new **Shieldsworn** at 31 (Holy Strike hits with your shield, triggers block talents and lets you block spells for 6 s), Stoicism; Swift Judgement now unleashes your seal; Shield Specialization still returns mana. **Ret:** **Twist of Light removed**; the new 31 is **Unsealed Wrath** (swings store copies of your seal, up to 3; hitting with a different seal gives each copy its normal chance to trigger); Instrument of Law removed; Champion of the Light 12–60% of Intellect as spell damage; Conviction 2/4/6% crit on everything; new Turn Evil. | BLZ-NOTES-NOV2 |
| Hunter | All traps share one 30 s cooldown. Aimed Shot, Arcane Shot, Serpent Sting, Aspect of the Hawk, Trueshot Aura and Sniper Shot hit much harder; Barrage and Lightning Reflexes are stronger. | BLZ-NOTES-NOV2 |
| Rogue | New baseline **Shank** (24: cheap off-hand strike that restores energy) and **Poised** (18: a cheaper first energy ability after resting at full energy); poisons scale twice as much with attack power. **Assassination:** **Mutilate moves to 31** and hits harder; **Venom moves to row 5 (21) and becomes passive**: Shank then boosts poison damage and poison chance for 6 s; Murder removed; new Blood Splatter; Relentless Strikes and Seal Fate reworked. **Combat:** Coup de Grace (was Improved Eviscerate), Composure, Flash of Steel (Shank), Dual Wield Specialization 25/50% off-hand damage. **Subtlety:** **Thousand Cuts, Cutthroat and Quietus removed**; new **Death Mark** at 31 (a finisher that banks part of your damage and releases it 6 s later), Boot Knife (Shank adds combo points), Quick Getaway (Sap a second target, speed after a Sap); Ghostly Strike lets your next Ambush or Garrote skip stealth; **Premeditation moves to row 3** (11). | BLZ-NOTES-NOV2 |
| Priest | Shadow Word: Death backfires for 30% of your health if it doesn't kill (was 10%). **Holy:** **Binding Heal removed**; **Holy Binding** takes its slot (16): your Flash Heals on others also heal you for half. Shadow: Vampiric Embrace healing can't crit. | BLZ-NOTES-NOV2 |
| Shaman | Lightning Bolt much stronger; Chain Lightning slower (2.5 s) but stronger; shocks back to Classic damage; Totemic Projection is now Totemic Call (pulls your totems to you, 30 s). **Elemental:** Oct 15 had made Earthbound 16, Lava Burst 21 and a returning Elemental Mastery 31 (A6); at launch **Lava Burst is removed** and **Call of Thunder** (+5% Lightning Bolt and Chain Lightning crit) takes its slot, **Elemental Mastery is renamed Lightning Mastery**, and **Lightning Overload** gives a 10/20/30% chance to duplicate a spell. **Enhancement:** Stormstrike every **6 s** for 150% weapon damage, Maelstrom Weapon procs twice as often, Mental Dexterity and Flurry stronger. **Restoration:** **Riptide** is a cheaper heal over time only, on a 12 s cooldown. | BLZ-NOTES, BLZ-NOTES-NOV2 |
| Mage | **Frost Blast removed.** **Arcane:** Oct 15 made **Arcane Blast** a 1.5 s cast that stacks spell damage from Intellect (up to 4), added **Arcane Wrath** at 16 (a 3.5 s nuke that scales with max mana) and moved **Missile Barrage** to row 1; launch: Arcane Blast stacks give 12% of Intellect and +100% mana cost each, for 18 s (A7); Missile Barrage moves to row 2; Arcane Focus folded into Frost's Precision. **Fire:** Critical Mass back to 3 points (6%), Incineration 5 points, Improved Fireball renamed Accelerant (also speeds up Arcane Wrath). **Frost:** Piercing Ice removed; **Ice Lance** gets an 8 s cooldown shared with Fire Blast, and its bonus on frozen targets is back to 300%; **Ice Barrier** now also raises Frost damage; Frost Warding negates spells instead of reflecting them; Precision 2/4/6% spell hit. | BLZ-NOTES, BLZ-NOTES-NOV2 |
| Warlock | Oct 8: Demonic Brand's bonus pet damage only draws high threat when it is Shadow damage. Launch: **demons get 2 health per point of your Stamina (was 7.5)**; Drain Soul gives shards from damage much less often; Spellstones boost Shadow only; **Wrack's** damage roughly doubles (about 36 → 86 per second at 60) and Improved Drains no longer boosts it; Shadow and Flame 4–20%. (A22) | BLZ-NOTES-OCT8, BLZ-NOTES-NOV2 |
| Druid | Bear forms threat +115%; new Poised (32); cat attacks and Starfire hit much harder; **Lacerate is a Feral talent** now, not a level-42 spell. **Feral:** **Berserk removed**; row 4 is now Lacerate (bear) and Predatory Discipline (cat: Ferocious Bite's bonus from excess energy without spending it); row 7 has two 31s: **Primal Bite** (bear) and **Shifting Power** (cat); Leader of the Pack and Moonkin Form are exclusive again and boost every kind of crit. **Restoration:** **Gift of the Earthmother removed**; new **Bloom** (Rejuvenation and Regrowth end with an instant heal based on Spirit); Swiftmend needs your own HoT and doesn't eat it; **Wild Growth gets a 3 s cast**; Naturalist shortens it. | BLZ-NOTES-NOV2 |

Not used in our data: gamepad support, quest and respawn tweaks, bag changes, the Darkspear Islands flag fix.
