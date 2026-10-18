# Research — WoW: Forever (Phase 0)

> Checked **2026-10-18** (all sources accessed that day). The game is in **beta** until Oct 21 PT, and most class and racial
> details below come from beta-era posts. Re-verify everything against the launch patch notes (Nov 4).
> Everything here is in our own words; follow the links for the originals.

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
| BLZ-NOTES | Blizzard forums (Kaivax) — WoW Forever Beta Development Notes, updated Oct 15 | posted 2026-10-16 | https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-15/2360696/6 |
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

## 5. Racials (current as of the Oct 15 beta notes)

Effects are in our own words. Values from **BLZ-RACE** (the original article), with changes from **BLZ-NOTES** (Oct 15) applied on top.
"—" = not stated in any source we found (→ OPEN_QUESTIONS).

| Race | Racial | Type | Effect (current) | Cooldown | Changed Oct 15? |
|---|---|---|---|---|---|
| Human | Will to Survive | active | Breaks stuns | — | |
| Human | Perception | active | Detect stealthed enemies for 20 s | — | |
| Human | Ruthless | passive | +2% crit chance, any weapon | — | **new** (replaced Sword Specialization) |
| Human | The Human Spirit | passive | +5% Spirit | — | |
| Dwarf | Stoneform | active | 8 s: immune to bleeds, poisons, diseases; less physical damage taken | — | |
| Dwarf | Find Treasure | active | Tracks treasure chests; chance of extra loot from most chests | — | buffed |
| Dwarf | Earth Fury | passive | +2% critical damage and critical healing | — | **new** (replaced Mace Specialization) |
| Dwarf | Big Game Hunter | passive | +5% damage vs Beasts | — | |
| Gnome | Escape Artist | active | Short immunity to roots and snares | — | |
| Gnome | Eureka! | active | 8 s buff: cheaper spells/abilities and +10% damage/healing; also boosts Power Word: Shield; not usable in stealth | — | **nerfed** (was "next 3 casts") |
| Gnome | Expansive Mind | passive | +5% max mana, rage or energy | — | |
| Gnome | Engineering Specialization | passive | Engineering gadgets are more reliable | — | |
| Night Elf | Elune's Light | active | +10% crit chance for 15 s | — | |
| Night Elf | Shadowmeld | active | Stealth while standing still | — | |
| Night Elf | Quickness | passive | +1% dodge, +2% run speed (now stacks with other speed boosts) | — | buffed |
| Night Elf | Wisp Spirit | passive | +75% run speed while dead | — | |
| Orc | Blood Fury | active | +10% attack power and spell power for 15 s | **3 min** | nerfed (was 2 min) |
| Orc | Shatter Curse | active | Removes curses and banes; 8 s of 5% less magic damage taken | — | **reworked** (was immunity + 15%) |
| Orc | Savage | passive | +1% crit chance | — | **new** (replaced Axe Specialization) |
| Orc | Hardiness | passive | Stuns on you last 20% shorter | — | |
| Undead | Will of the Forsaken | active | Breaks charm, fear and sleep (not usable while Scatter Shot'd) | — | |
| Undead | Cannibalize | active | Eat a corpse to regenerate 35% health and mana over time | — | |
| Undead | Underwater Breathing | passive | Breath lasts 300% longer | — | |
| Undead | Touch of the Grave | passive | Attacks/spells sometimes drain health from the target (proc ~30% casters / 20% Paladin, Rogue, Warrior; 25 s internal cooldown) | — | retuned (the proc is called "Touch of the Dead" in the notes) |
| Tauren | War Stomp | active | 2 s area stun around you | **90 s** | buffed (was 2 min) |
| Tauren | Cultivation | active | Grow bonus herbs, no Herbalism needed | **15 min** | buffed (was 60 min) |
| Tauren | Plainsrunning | passive | Run speed ramps up while you keep moving; +3% mounted speed | — | buffed; stutter-step no longer keeps it |
| Tauren | Endurance | passive | +5% max health and +2% critical damage/healing | — | changed (was +1% hit) — the HP part is **[assumption]** unchanged |
| Troll | Berserking | active | +10% attack and casting speed for 10 s | — | |
| Troll | Rapid Regeneration | active | Regenerate 50% of max health over time | — | |
| Troll | Beast Slaying | passive | +5% damage vs Beasts | — | |
| Troll | Regeneration | passive | 20% of health regen continues in combat | — | buffed (was 10%) |
| Skyborne (both) | Walk on Air | active | Slow fall you can steer | **90 s** | buffed (was 2 min) |
| Skyborne (both) | Wind Blessed | passive | **+3% haste** (melee, ranged, spells) | — | buffed (was 1%) |
| Skyborne (both) | Elemental Insight | passive | +5% damage vs Elementals | — | |
| Skyborne — High Order (A) | Read Ley Line | active | +100% health and mana regen: 30 s, or 15 min near a ley line; castable while moving | 2 min | buffed (minimum 20 → 30 s) |
| Skyborne — Windshaper (H) | Skysight | active | +10% run and mounted speed (doesn't stack with other speed boosts): 30 s, or 15 min near an Elemental Convergence; castable while moving | 2 min | castable while moving |

Sources: BLZ-RACE, BLZ-NOTES, TAV-RAC, TAV-SKY, ZOK-RACE. Druids can use racials in forms (incl. Shadowmeld, War Stomp, Walk on Air) **[beta]** (BLZ-HD).

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
- **Engine note:** Wind Blessed (+3% haste) is the strongest passive DPS racial on paper **[assumption]**, so Skyborne will often rank high on "racial synergy". The setup's pack question must filter reliably, and "Not sure" gets a pack badge plus a small penalty (DECISIONS D15).

---

## 7. Classes — what changed (beta deep dives)

All **[beta]** — Blizzard repeats that "abilities and talents may change during the beta". "Gold" = a one-point milestone talent at 11/16/21/31 points in the tree.

### Warrior (BLZ-PW, BLZ-NOTES)
- **Official role:** melee, tank or damage; great sustained multi-target melee; poor at recovering from heavy damage.
- **Baseline:** Tactical Mastery at 14 (keep 10 rage on stance swap). **Victory Rush at 20** (heals 10% on kill). Recklessness/Shield Wall/Retaliation no longer share a cooldown (the latter two are 15 min). Rage from taking damage is no longer cut by armor. Thunder Clap works in Defensive Stance. Battle Shout is raid-wide (Oct 15).
- **Arms:** 16 Spearing Strike (dismount; bonus vs mounted/dragons/giants). New Bloodthrill and **Weaponmaster** (weapon specs merged). 31 Mortal Strike.
- **Fury:** 16 Raging Blows (Whirlwind hits with both weapons). New Boundless Rage and Precision. Bloodthirst no longer heals, gives +10% move speed instead. Death Wish now raises damage taken.
- **Protection:** 16 Vanguard (Charge in Defensive Stance). New Master of Defense, Bastion, Focused Rage. Improved Shield Wall gets a big cooldown cut. 31 Shield Slam.
- **Watch:** rage-generation bugs in beta (Blizzard: "may take a few weeks").

### Paladin (BLZ-PAL, BLZ-NOTES)
- **Official role:** tank, damage or healer; very strong vs Undead/Demons; strong single-target healer; limited range, no interrupts, no slows.
- **Baseline:** **Holy Strike** at 6 (instant Holy damage, weapon-based). **Seal of Fury** at 10 (tank seal: Holy damage per swing, small absorb, judgement taunts at 10 yd). Consecration for all at 20 (threat capped to 4 targets). Lay on Hands cooldown 20 min. Judgement no longer eats the seal. Salvation is no longer a Blessing.
- **Holy:** 11 Voice of Truth (silence/interrupt immunity). 16 Divine Favor. **21 Holy Shock** (10 s cooldown) → "Shockadin" hybrids are officially supported. 31 **Light's Vigil** (group heal / setup damage).
- **Protection:** 11 Improved Seal of Fury. 16 Swift Judgement. **21 Templar's Bulwark** (8 s absorb = 100% max HP). 31 Holy Shield. New Sacred Duty, Iron Creed.
- **Retribution:** 16 Sacred Arbiter. 21 Repentance. **31 Twist of Light** (seal twisting made approachable). New Holy Conduit, Sanctified Judgement, Champion of the Light (Intellect → spell damage, nerfed Oct 15), Instrument of Law.

### Hunter (BLZ-HD, TAV-HD, BLZ-NOTES)
- **Official role:** damage only; longest range of any class but no shots within 8 yd; no stun, no interrupt; **pet can tank in solo and small-group play**; talents allow pet-focused, ranged, trap/melee **or petless** play.
- **Baseline:** Aimed Shot at 20. Traps usable in combat (30 s cooldown, placed at your feet). **Fox** pet family. Every pet family has Bite/Claw + Dive/Dash + one unique skill. Pets scale with your gear. Trueshot Aura is raid-wide (Oct 15). Auto Shot needs 0.5 s standing still (Oct 15).
- **Beast Mastery:** 16 Summon Hawk. New Focused Fire.
- **Marksmanship:** **11 Lone Wolf** (+20% damage without a pet). 21 Trueshot Aura. 31 Sniper Shot. New Careful Aim, Rapid Killing, Rapid Recuperation.
- **Survival:** 16 Counterattack. 21 Strider Kick. 31 Lacerating Strikes (Mongoose Bite bleed). New Predator's Edge (dual-wield), Resourcefulness, Expose Prey. Wyvern Sting removed.

### Rogue (BLZ-RW)
- **Official role:** stealth and control specialist; the only class with poisons; high single-target melee damage.
- **Baseline:** More poison charges, and poisons stack with sharpening/weight stones. Sap no longer breaks stealth. **One-handed axes** usable. Expose Armor ≈ 5 Sunders.
- **Assassination:** 16 Cold Blood. **21 Mutilate** (daggers). **31 Venom** (finisher, +30% poison damage). Malice/Precision now cover poisons (poison crits).
- **Combat:** 16 Flawless Execution. **Hack and Slash** (row 5) replaces all weapon specs.
- **Subtlety:** 16 Premeditation. 31 Thousand Cuts. New Quietus and **Cutthroat** (Ambush without stealth after a Backstab).

### Priest (BLZ-PW, BLZ-NOTES)
- **Official role:** the most versatile healer (HoTs, direct heals, shields); Shadow = DoTs; fragile, few escapes; Shadow's utility is weaker than a Warlock's.
- **Baseline:** **Fear Ward + Devouring Plague for all at 20.** Divine Spirit at 30. Shadow Word: Death at 32. Fade threat doubled. Prayer of Healing heals the *target's* party. Several Renews can sit on one target.
- **Discipline:** 16 Soul Warding. **21 Penance**. New Twin Disciplines, Power in Light, Renewed Hope, Divine Aegis.
- **Holy:** 16 **Binding Heal**. 31 **Prayer of Mending**. Lightwell removed.
- **Shadow:** 16 Vampiric Embrace. New Improved Mind Flay, Devouring Contagion (spreads on death), Early Demise. Shadowform allows all non-healing spells.

### Shaman (BLZ-MS, BLZ-NOTES, ZOK-SHA)
- **Official role:** totems, party/raid buffs, healing, flexible melee or spell damage, mail + shield; no real crowd control; leans on allies for control and survival. **Enhancement can be a "temporary tank in small group gameplay".**
- **Baseline:** Totem GCD 1.0 s, buff totems last 5 min. **Call of the Elements** (20, plus two more presets at 30/40) drops a saved set of 4 totems. Totemic Recall/Projection. Weapon imbues last 60 min and stack with stones/oils. Fire Nova is now a spell at your fire totem. Several totems are raid-wide (Oct 15).
- **Elemental:** 16 Call of Thunder. 21 Earthbound. **31 Lava Burst**. Lightning Overload new. Elemental Mastery removed. ⚠️ The tree was "restructured" again on Oct 15, details unverified.
- **Enhancement:** 11 Shamanistic Focus. 16 Stormstrike (8 s cooldown). **21 Spirit Weapons** (more threat with Rockbiter → off-tanking). 31 Rage of the Farseer. New **Maelstrom Weapon**.
- **Restoration:** 11 Water Shield. 16 Mana Tide Totem. **31 Riptide**.

### Mage (BLZ-MS, BLZ-NOTES)
- **Official role:** strong ranged single-target and AoE damage, CC (Polymorph), raid buffs, food and water; very fragile, weak in melee.
- **Baseline:** **Frostfire Bolt** at 40 (counts as Fire and Frost). **Frost Blast** at 24 (Oct 15). Comprehension (new minor tradeskill for reading scrolls). Shorter Cone of Cold (anti-kite-farming). Better Mage Armor regen.
- **Arcane:** **11 Arcane Blast** (redesigned Oct 15: stacking spell-damage buff). 16 Missile Barrage. New Arcane Geometry.
- **Fire:** New Heating Up (crits speed up Pyroblast). Ignite is per-mage. Wake of Fire.
- **Frost:** **11 Ice Lance**. 16 Ice Block. 21 Cold Snap (10 min). New **Fingers of Frost**. Improved Blizzard slow capped at 40%.

### Warlock (BLZ-RW, BLZ-NOTES, ZOK-WLK)
- **Official role:** competitive caster damage in three styles; physically weak, relies on demons for protection.
- **Baseline:** Curse of Agony/Doom become **Banes** (one Bane + one Curse per target). Curse of the Elements covers all magic. Curse of Shadows removed. Firestone/Spellstone are weapon imbues. Life Tap scales with Spirit. Drain Soul can give shards mid-channel. **Pets scale with your stats**. DoTs and drains can crit.
- **Affliction:** 16 Curse of Exhaustion. **31 Wrack** (drain-DoT). New Improved Drains, Pandemic, Soul Siphon. Malediction → Grim Reach (Oct 15).
- **Demonology:** **11 Demonic Sacrifice** (2 h buff). 16 Fel Domination. **31 Demonic Pact** (keep the sacrifice buff with another demon out). **Demonic Brand** (row 4) gives pet attacks high threat, a good fit for Voidwalker tanking (official wording).
- **Destruction:** 16 Conflagrate. **21 Bane of Havoc**. **31 Incinerate**. New Shadow and Flame, Molten Skin, Cataclysm.

### Druid (BLZ-HD, TAV-HD, BLZ-NOTES)
- **Official role:** can fill any role; strong healers; fully capable tanks and damage dealers; no snares, silences or interrupts; weaker CC; HoT healing needs planning.
- **Baseline / forms:** Most potions and consumables work in form. Weapon enchants and procs work in form. Doors usable in form. Racials usable in form. Revive (out-of-combat rez) at 12. Nature's Grasp at 10. Omen of Clarity at 20. Lacerate at 42. Hurricane has no cooldown. Tiger's Fury removed. Leader of the Pack and Moonkin Aura raid-wide (Oct 15).
- **Balance:** 11 Nature's Splendor. 16 Insect Swarm. Moonkin Form (all non-healing spells castable). New Genesis, Nature's Majesty, Eclipse, Overgrowth.
- **Feral:** 11 Feral Charge (+ a Cat version). 16 **Shifting Power** (Cat: instant 40 energy — "powershifting made approachable") / **Primal Bite** (Bear, replaces Mangle). 21 Leader of the Pack (exclusive with Moonkin Form). 31 **Berserk**. Thick Hide redesigned for tanks.
- **Restoration:** 11 Gift of the Earthmother. 16 Swiftmend. **31 Wild Growth**. Furor gives Cat energy regen outside Cat Form (blocks old bear-weaving).

---

## 8. New roles? (conclusion)

**No brand-new dedicated role exists.** The roles stay classic: Warrior/Paladin/Druid tank; Priest/Paladin/Druid/Shaman heal. The beta adds these **role-adjacent options** (all [beta], official wording unless noted):

| Option | What Blizzard says | Proposal (see PLAN.md) |
|---|---|---|
| Enhancement Shaman tanking | "temporary tank in small group gameplay" (Rockbiter + Spirit Weapons) | Not a tank build. Flag `offTank: smallGroup` and mention it as a strength. |
| Warlock Voidwalker tanking | Demonic Brand gives pet attacks high threat, "suits tanking pets like the Voidwalker" | A trait for Demonology (solo/small-group safety). |
| Hunter pet tanking | pet can tank in solo and small-group play | Feeds solo/HC survivability scores. |
| Petless Hunter | Lone Wolf (MM 11) | `petStyle: optional` for MM (and SV via an MM dip **[assumption]**), so the "no pets" filter doesn't drop them. |
| Shockadin | Holy Shock (21) as the alternative to Twist of Light for hybrid Holy builds | Keep out of the build list for M1. Mention as a variant note on Holy/Ret. |

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
**Plan:** keep `meta.json` `gameState: "Beta"` until we re-check against the launch patch notes (Phase 4, Nov 2–3, and again on Nov 4).
