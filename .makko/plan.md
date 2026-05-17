# Monster Taming JRPG — Plan

## Concept

Touch-first, turn-based monster taming JRPG in the vein of classic Pokémon. Players explore a world, encounter wild creatures, capture them, build a team, and battle other players in PvP. The tone is bright and accessible — friendly monster designs, clear UI, satisfying capture moments. Designed for mobile play sessions: battles are snappy, captures are exciting, progression is clear.

**Player identity:** A tamer building a competitive team. The loop is catch → level → team-build → PvP → earn rewards → catch more.

---

## Core Loop

1. **Explore** — Tap to move around a simple world map; touch encounters trigger wild monster spawns.
2. **Encounter** — Wild monster appears; player chooses to fight or capture.
3. **Battle** — Turn-based combat: pick moves, use items, or attempt capture. Reduce enemy HP to raise capture odds.
4. **Capture** — Spend capture items (balls) to catch the monster. Success adds it to your party/box.
5. **PvP** — Enter the battle arena, match against an opponent, use your team to win. Wins earn rewards.
6. **Progress** — Earn in-game currency, level up monsters, evolve them, unlock new creatures, buy items from the shop.
7. **Monetize** — Real-money purchases for premium currency, rare monsters, cosmetics. Simulated in HTML; real IAP wired via platform (Capacitor/Cordova).

---

## Player Input

**Touch primary** — every interaction is tap-based:
- **Tap** — Select menu options, confirm actions, interact with world
- **Tap monster** (in battle) — Select as target
- **Swipe** (optional) — Navigate party/box lists

**No keyboard required** — full mobile support from day one.

**Control mapping:**
| Action | Input |
|--------|-------|
| Navigate menus | Tap button |
| Confirm selection | Tap button |
| Cancel / back | Tap "Back" or "Cancel" button |
| Target enemy | Tap enemy sprite |
| Target ally | Tap ally portrait |
| Use item | Tap item slot → tap target |
| Open menu | Tap "Menu" button (top-right) |

---

## Game Systems

### Monster System

**Stats:** HP, Attack, Defense, Speed, Level, XP
**Types:** Fire, Water, Grass, Electric, Normal (5 base types; type chart for effectiveness)
**Moves:** Each monster has 4 moves max. Moves have type, power, PP, and effect.
**Evolution:** Monsters evolve at certain levels (e.g., Level 16 → evolved form).

**Example monster data:**

| Name | Type | Base HP | Base Atk | Base Def | Base Spd | Evolution Level | Catch Rate |
|------|------|---------|----------|----------|----------|-----------------|------------|
| Flamepup | Fire | 45 | 60 | 40 | 55 | 16 | 0.40 |
| Aquaslime | Water | 50 | 45 | 50 | 45 | 16 | 0.45 |
| Sproutling | Grass | 55 | 45 | 55 | 40 | 16 | 0.50 |
| Sparkrat | Electric | 40 | 55 | 35 | 70 | 16 | 0.35 |
| Fluffling | Normal | 50 | 50 | 50 | 50 | None | 0.60 |

**Type effectiveness chart:**
- Fire → Grass (2x), Water (0.5x)
- Water → Fire (2x), Grass (0.5x)
- Grass → Water (2x), Fire (0.5x)
- Electric → Water (2x), Grass (0.5x)
- Normal → no strengths/weaknesses

### Capture System

- Capture chance = base_rate × (1 - hp_percent/100) × item_multiplier
- Base rate from monster table (0.35–0.60)
- Lower enemy HP = higher capture chance (min 5%)
- Capture items: Monster Ball (×1), Great Ball (×1.5), Ultra Ball (×2), Master Ball (×3)

### Battle System

**Turn-based, speed-determines-order.**

Each combatant has a team of up to 3 monsters. Battles are 1v1 (one monster per side active at a time) or 2v2 (tag partners) — **start with 1v1** for scope.

**Actions available:**
| Action | Effect |
|--------|--------|
| Fight → Move | Deal damage based on move power and type effectiveness |
| Fight → Special | Use a powerful move with extra effect (burn, poison, etc.) |
| Capture | Attempt to catch enemy (消耗道具) |
| Item | Use healing/status item on active monster |
| Switch | Swap to another monster in your team |
| Defend | Reduce incoming damage by 50% this turn |
| Flee | Attempt to escape (50% base chance; fail in PvP) |

**AI behavior (wild encounters):** Random move selection weighted by move power.

### Economy

**In-game currency:** Gold (g)
- Earned from winning battles, selling items, completing encounters
- Spent on healing items, capture balls, monster food

**Premium currency:** Gems 💎
- Earned in tiny amounts through achievements (not pay-to-win; ~100 gems/month via play)
- Spent on: rare monster spawns, premium capture balls, cosmetics, convenience items

**In-app purchases (simulated):**
| Bundle | Gems | Price (displayed) |
|--------|------|-------------------|
| Starter Pack | 100 | $0.99 |
| Battle Bundle | 500 | $4.99 |
| Collector Bundle | 1200 | $9.99 |
| Ultimate Bundle | 3000 | $19.99 |

Real IAP integration happens when wrapped in Capacitor/Cordova — the UI and currency system will be wired; the payment call just needs a platform shim.

---

## Progression

**Leveling:** Monsters gain XP from battles. XP to level = level × 100. Stats scale +10% per level.

**Evolution:** At evolution level, monster automatically evolves at end of battle.

**Wild monster roster:** 5 base monsters + evolved forms (5 more) = 10 total in v1.

**PvP ranks:** Unranked → Bronze → Silver → Gold → Platinum. Rank shown on profile. Matchmaking by rank bracket (simple bucket).

---

## State & Flow

```
Title Screen
    ↓
Main Menu (Play | PvP | Shop | Party | Settings)
    ↓
┌─────────────────────────────────────────────┐
│  World Map (tap to explore)                  │
│    ↓ [random encounter]                      │
│  Wild Battle: 1v1 turn-based                 │
│    ↓ [win/flee/capture]                      │
│  Post-battle: XP awarded, return to map      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  PvP Arena (tap to enter)                    │
│    ↓ [matchmaking]                           │
│  PvP Battle: 1v1 turn-based                  │
│    ↓ [win/lose]                              │
│  Results: reward Gems, rank up if applicable │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Party Screen (tap monsters to view/manage)  │
│    - View stats, moves, level                │
│    - Rearrange team                          │
│    - Heal all (costs Gems or visit healer)   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Shop Screen                                 │
│    - Buy items with Gold                     │
│    - Buy Gems with real money (IAP)          │
│    - Buy rare monsters                       │
└─────────────────────────────────────────────┘
```

**Save/Load:** Auto-save after every battle and key action. LocalStorage via `SaveManager` (inject `save-load` template). Save data: party, inventory, gold, gems, monster box, rank.

---

## Presentation

**Art style:** Clean, colorful, flat 2D. Monster sprites drawn with canvas shapes (circles, arcs) — no external images needed. UI panels with rounded corners, soft shadows.

**Color palette:**
- Background: `#1a1a2e` (deep navy)
- Panel: `#16213e` (dark blue)
- Accent: `#e94560` (bright red)
- Text: `#eaeaea` (off-white)
- Gold highlight: `#ffc947`

**Touch UI:** Large tap targets (min 44×44px). Buttons clearly labeled. Selected state = bright border + slight scale. Disabled state = dimmed.

**Layout (mobile-first):**
- Canvas fills viewport, 16:9 max width, centered
- Battle UI: bottom panel (actions), top panel (enemy stats), side (party preview)
- Menus: full-screen overlay with vertical button stack

**Animations:**
- Monster idle bounce (subtle sine wave)
- Attack flash (white overlay 100ms)
- Damage numbers float up and fade
- Capture: ball shake animation (3 wobbles), then pop open on success / break on fail
- Victory/defeat screen fade-in

**Audio:**
- BGM: simple looping track per scene (menu, battle, world)
- SFX: tap click, attack hit, capture ball shake, victory fanfare, purchase chime

---

## Narrative

Minimal story in v1 — the systems ARE the content. Brief intro on title screen:
*"Explore the world, tame creatures, build your team, and become the ultimate monster tamer!"*

No dialogue trees or cutscenes in v1. Scope is pure gameplay.

---

## Build Needs

**Canvas:** 800×600 base, scaled to fit mobile viewport. Touch input via `MakkoEngine.input` pointer events.

**Sprites:** Canvas-drawn monsters using geometric shapes. Monster defined by: body shape, eye style, type color. Example:

```typescript
// Flamepup: orange body (circle), pointed ears, flame tail (arc), big eyes
// Sproutling: green body (oval), leaf on head, vine details
```

**No external image assets required** — all visuals drawn via `Display.drawRect`, `Display.drawCircle`, `Display.drawArc`.

**Performance:** Cap at 60fps. Object pooling for damage numbers. Minimal allocations in game loop.

---

## Scope

### In v1:
- ✅ 5 base monster types + 5 evolved forms
- ✅ 1v1 turn-based wild battles
- ✅ Capture system with 4 ball types
- ✅ Team of 3 monsters
- ✅ Monster leveling and basic evolution
- ✅ PvP arena with simple matchmaking
- ✅ Shop (Gold shop + Gem IAP UI)
- ✅ Touch controls throughout
- ✅ Auto-save to LocalStorage

### Out of v1 scope (future):
- ❌ Multiplayer real-time PvP (async only in v1)
- ❌ Monster breeding
- ❌ Leaderboards
- ❌ Friends list
- ❌ 2v2 battles
- ❌ Full story mode
- ❌ Map exploration with obstacles
- ❌ Native IAP integration (UI wired, payment call stubbed)

---

## Architecture Sketch

```
src/
├── main.ts                    # Entry: initEngine(), start game
├── game.ts                    # Game class: scene switching, top-level state
├── scenes/
│   ├── TitleScene.ts          # Title screen, main menu
│   ├── WorldScene.ts          # Map exploration, triggers encounters
│   ├── BattleScene.ts         # Turn-based combat (wild + PvP)
│   ├── PartyScene.ts          # Monster party management
│   └── ShopScene.ts           # Gold shop + Gem IAP store
├── systems/
│   ├── MonsterSystem.ts       # Monster data, stats, evolution
│   ├── CaptureSystem.ts       # Capture chance calculation, ball mechanics
│   ├── CombatSystem.ts        # Battle logic, action resolution (uses TurnManager)
│   ├── PartySystem.ts         # Team management, box storage
│   ├── EconomySystem.ts       # Gold, Gems, transactions
│   └── IAPSystem.ts           # Simulated in-app purchases (stub for real integration)
├── data/
│   ├── monsters.ts            # Monster definitions (type, stats, moves, evolution)
│   └── moves.ts               # Move definitions (power, type, effect)
├── components/
│   ├── BattleUI.ts            # Touch action menu, target selection, HP bars
│   ├── MonsterCard.ts         # Monster display panel (stats, portrait, moves)
│   ├── ShopUI.ts              # Item grid, purchase confirmation modal
│   ├── PartyUI.ts             # Party list, monster detail view
│   └── CaptureBall.ts         # Capture animation (shake, wobble, result)
└── util/
    ├── TypeChart.ts           # Type effectiveness calculator
    ├── DamageCalc.ts          # Damage formula
    └── SaveMigrations.ts      # Versioned save migration
```

**Engine hook points:**
- `MakkoEngine.display` — all rendering
- `MakkoEngine.input.onPointerDown` — touch input
- `MakkoEngine.scenes.switch()` — scene transitions
- `SaveManager` (from `save-load`) — persistence

---

## Template Plan

Inject templates in this order:

1. **`new-project`** — Scaffold: MakkoEngine boot, GameLoop, Display, SceneManager, StartScene (title screen), GameScene (empty shell). Auto-injects `scene-manager` + `menu-system`.
2. **`ui-layer`** — Touch-friendly UI toolkit: buttons, panels, modals, status bars. All battle menus, shop UI, party screens built on this.
3. **`turn-manager`** — Tracks turn order in combat (who acts when based on speed). Used by `CombatSystem`.
4. **`save-load`** — Persists party, inventory, currency, rank. `SaveManager` used by `EconomySystem` and `PartySystem`.
5. **`weighted-random`** — Used by `CaptureSystem` for capture chance and by `IAPSystem` / shop for loot box mechanics.
6. **`audio-manager`** — BGM and SFX for battle, menus, purchase confirmations.

---

## Task List

### Phase 1: Foundation

**Task 1 — Inject `new-project`**
- What: Scaffold MakkoEngine project with scene manager, title screen, and empty game scene.
- Files: `src/main.ts`, `src/game.ts`, `src/scenes/StartScene.ts`, `src/scenes/GameScene.ts`
- Verify: Build passes, game loads in browser, title screen shows.

**Task 2 — Inject `ui-layer`**
- What: Full UI toolkit for touch buttons, panels, modals, status bars.
- Files: `src/ui/UILayer.ts`, `src/ui/Button.ts`, `src/ui/Panel.ts`, `src/ui/StatusBar.ts`, `src/ui/theme.ts`
- Verify: UI elements render, tap works (confirm with pointer input test).

**Task 3 — Add monster data and TypeChart**
- What: Define 5 base monsters + 5 evolved forms, type chart, move data. `MonsterSystem` with stat calculation and type effectiveness.
- Files: `src/data/monsters.ts`, `src/data/moves.ts`, `src/systems/MonsterSystem.ts`, `src/util/TypeChart.ts`
- Verify: `TypeChart.getMultiplier(Fire, Grass)` returns 2. Monster creation works.

**Task 4 — Build basic touch UI for menus**
- What: `MenuScene` with Play, PvP, Shop, Party, Settings buttons. Touch navigation via `ui-layer` components. Hook into scene switching.
- Files: `src/scenes/MenuScene.ts`
- Verify: All 5 buttons navigate to their respective scenes.

### Phase 2: Battle Core

**Task 5 — Inject `turn-manager`**
- What: `TurnManager` integrated into combat. Orders combatants by Speed stat. Handles round tracking.
- Files: `src/turn/turn-types.ts`, `src/turn/turn-manager.ts`
- Verify: Turn order reflects speed stats; round number increments correctly.

**Task 6 — Build CombatSystem**
- What: Full battle logic: `CombatSystem` with `CombatState` (idle, player_turn, enemy_turn, animating, victory, defeat). Damage calculation with type effectiveness. Status effects (burn, poison, defend). AI enemy move selection.
- Files: `src/systems/CombatSystem.ts`, `src/util/DamageCalc.ts`
- Verify: Battle runs end-to-end: player attacks, enemy attacks, one side reaches 0 HP, victory/defeat fires.

**Task 7 — Build BattleUI (touch combat interface)**
- What: `BattleUI` with action menu (Fight, Capture, Item, Switch, Defend, Flee). Target selection for moves. HP bars for both combatants. Damage numbers floating up. Turn indicator.
- Files: `src/components/BattleUI.ts`
- Verify: Tapping "Fight" opens move list; tapping a move targets enemy; damage resolves; HP bar updates.

**Task 8 — Build capture system**
- What: `CaptureSystem` with capture chance formula (base_rate × hp_factor × item_multiplier). Capture ball animation (shake wobble). Success = monster added to party. Fail = enemy can act.
- Files: `src/systems/CaptureSystem.ts`, `src/components/CaptureBall.ts`
- Verify: Low HP monster has higher capture rate than full HP. Master Ball always succeeds.

### Phase 3: World & Encounters

**Task 9 — Build WorldScene**
- What: `WorldScene` with simple tap-to-walk map. Tap a direction to move. Random encounter trigger every ~10 steps. Wild monster spawns based on weighted random (common/rare).
- Files: `src/scenes/WorldScene.ts`
- Verify: Player moves on tap; encounter triggers after steps; battle starts.

**Task 10 — Hook up wild encounters**
- What: `WorldScene` spawns a random wild monster. Battle uses same `CombatSystem` but with `isWild = true` (allows flee, no XP for enemy). Win/capture/flee returns to map.
- Files: `src/scenes/WorldScene.ts` (integrate with BattleScene)
- Verify: Encounters trigger, battle plays, return to map after resolution.

### Phase 4: Party & Progression

**Task 11 — Build PartyScene**
- What: `PartyScene` shows team of 3 monsters. View stats, moves, level. Rearrange team order. View monster box (captured monsters beyond team of 3).
- Files: `src/scenes/PartyScene.ts`, `src/components/MonsterCard.ts`
- Verify: All 3 team slots display monster data. Tap monster for detail view.

**Task 12 — Implement leveling and evolution**
- What: Monsters gain XP from winning battles. Level up formula (+10% stats per level). Evolution check at end of battle. `PartySystem` handles XP and level-up events.
- Files: `src/systems/PartySystem.ts`, `src/systems/MonsterSystem.ts` (add evolve logic)
- Verify: Monster gains XP, levels up, stats increase. Monster evolves at correct level.

### Phase 5: PvP & Economy

**Task 13 — Build PvPArena**
- What: `PvPArenaScene` with matchmaking queue. Simple: tap "Find Match" → wait 2s → opponent appears (AI). Same `CombatSystem` but `isWild = false` (no flee). Win rewards Gems.
- Files: `src/scenes/PvPArenaScene.ts`, `src/systems/PvPSystem.ts`
- Verify: Matchmaking queue works. AI opponent battles. Win grants Gems.

**Task 14 — Inject `save-load`**
- What: Auto-save after battles and key actions. `SaveManager` persists party, inventory, gold, gems, rank. Load on game start.
- Files: `src/save/save-manager.ts`, `src/util/SaveMigrations.ts`, integration in `PartySystem`, `EconomySystem`
- Verify: Close/reopen game, party and currency restored.

**Task 15 — Build ShopScene with Gold shop**
- What: `ShopScene` with item grid (capture balls, healing items). Buy with Gold. Deduct Gold, add item to inventory.
- Files: `src/scenes/ShopScene.ts`, `src/systems/EconomySystem.ts`
- Verify: Purchase works, Gold decreases, item added to inventory.

**Task 16 — Build IAP UI (simulated)**
- What: `IAPSystem` with gem bundles (100/500/1200/3000). Tap bundle → confirmation modal → "Purchase" → Gems added. Real payment call is stubbed (console.log + callback). Note in code where native IAP hooks in.
- Files: `src/systems/IAPSystem.ts`, `src/components/IAPModal.ts`
- Verify: Purchase modal opens, simulated purchase succeeds, Gems increase. Log shows "IAP stub — implement with platform plugin."

### Phase 6: Polish

**Task 17 — Inject `audio-manager`**
- What: BGM for title, battle, world. SFX for attacks, captures, purchases, level-up.
- Files: `src/audio/AudioManager.ts`
- Verify: Music plays, SFX triggers on correct events.

**Task 18 — Monster sprite rendering**
- What: Canvas-drawn monster sprites using geometric shapes (body, eyes, type features). Animated idle bounce. Damage flash overlay. Evolved forms have larger/more detailed shapes.
- Files: `src/components/MonsterSprite.ts`
- Verify: Monsters render with distinct shapes per type. Idle animation plays.

**Task 19 — Battle animations & juice**
- What: Attack flash, damage numbers float up and fade, capture ball shake sequence, victory/defeat screen transition. HP bar animated drain.
- Files: `src/components/BattleEffects.ts`
- Verify: Every battle action has visual feedback. Capture is exciting.

**Task 20 — Inject `weighted-random` for IAP loot**
- What: `WeightedPicker` used in IAP "rare monster" purchase (10% rare, 90% common). Also for wild encounter rarity weighting.
- Files: `src/random/weighted-picker.ts` integration in `IAPSystem` and `WorldScene`
- Verify: Rare monster appears ~10% of time in IAP spawns.

---

## Verification Milestones

| Milestone | What's confirmed |
|-----------|-----------------|
| After Task 1 | Project builds, title screen renders |
| After Task 4 | Touch menu navigates all 5 screens |
| After Task 7 | Battle runs end-to-end with working UI |
| After Task 9 | World map and wild encounters work |
| After Task 12 | Party management + leveling + evolution |
| After Task 16 | Full game loop: explore → battle → capture → level → PvP → shop → IAP |
| After Task 20 | Polish: audio, sprites, animations |

---

## Known Risks & Gotchas

- **Touch input on desktop:** Test with mouse clicks (pointer events map cleanly). Don't assume only mobile.
- **Capture animation blocking:** Make capture animation async so enemy turn isn't blocked during result.
- **Save migration:** When monster data changes (new stats, new fields), `SaveMigrations` must migrate old saves. Version the save format.
- **Gems overflow:** Cap Gems at 999,999. Catch overflow on IAP purchases.
- **Monster box limit:** Start with 50-slot box. Warn player when full.
- **AI move selection:** Simple random is fine for v1 — don't over-engineer AI until player feedback demands it.

---

## IAP Integration Note (for future iOS wrap)

When wrapping in Capacitor/Cordova:

```typescript
// src/systems/IAPSystem.ts — replace stub with:
async function processPurchase(bundleId: string): Promise<boolean> {
  // Using @capacitor/purchases or cordova-plugin-inapppurchase
  const { result } = await Plugins.InAppPurchase.purchase({ id: bundleId });
  if (result.status === 'approved') {
    grantGems(bundleId);
    return true;
  }
  return false;
}
```

The UI, currency, and purchase confirmation flow are all built — only the payment call needs the native plugin.