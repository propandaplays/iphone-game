# Fix Touch Controls — Monster Tamer

## Spec

### Problem

Touch screen controls don't work on iPhone. Tapping buttons has no effect.

### Root Cause

The input system receives touch events and updates mouse position correctly, but every scene's `handleInput()` activates buttons only when the **Space key** is pressed. Touch users have no keyboard, so Space never fires, and buttons never activate.

### Fix

Add `isPointerDown()` to `MakkoEngineInput` returning `this._mouseDown` (same value touch already sets). Update all `handleInput()` methods to activate buttons on tap/click — i.e., when pointer is over the button AND either Space is pressed **OR** the pointer is currently down.

---

## Build Plan

### Task 1 — Add `isPointerDown()` to input system

- **What:** Add `isPointerDown()` method to `MakkoEngineInput` that returns `this._mouseDown`.
- **Files:** `js/main.js`
- **Verify:** Build passes, touch events set `_mouseDown` already, new method exposes it.

### Task 2 — Fix StartScene button activation

- **What:** Update `StartScene.handleInput()` to activate the Start button when tapping directly (pointer over button + pointer down). Keep Space/Enter as fallback for keyboard users.
- **Files:** `js/main.js` — `StartScene` class
- **Verify:** Tap start button → scene switches to menu.

### Task 3 — Fix MenuScene button activation

- **What:** Update `MenuScene.handleInput()` to activate buttons when tapping directly.
- **Files:** `js/main.js` — `MenuScene` class
- **Verify:** Tap Explore → world scene, tap Shop → shop scene, etc.

### Task 4 — Fix WorldScene back button activation

- **What:** Update `WorldScene.handleInput()` to activate the back button on tap.
- **Files:** `js/main.js` — `WorldScene` class
- **Verify:** Tap ← Back area → returns to menu.

### Task 5 — Fix BattleScene action button activation

- **What:** Update `BattleScene.handleInput()` to activate Attack / Capture / Defend / Flee buttons on tap.
- **Files:** `js/main.js` — `BattleScene` class
- **Verify:** Tap Attack button → attack triggers.

### Task 6 — Fix remaining scenes

- **What:** Update `PartyScene`, `ShopScene`, `PvPArenaScene`, `SettingsScene` to activate back button on tap.
- **Files:** `js/main.js` — each scene class
- **Verify:** Back buttons work on tap in all scenes.

### Task 7 — Add touchmove tracking for dragged pointer

- **What:** Add `touchmove` handler to update `mouseX`/`mouseY` during drag so movement feels responsive.
- **Files:** `js/main.js` — `MakkoEngineInput.init()`
- **Verify:** Moving finger while holding updates cursor position.

---

## Engine Primitives Used

- `MakkoEngine.input.isPointerDown()` — new method, returns `_mouseDown`
- `MakkoEngine.input.getPointerPosition()` — already exists, returns `{x, y}`
- `MakkoEngine.input.isKeyPressed('Space')` — keyboard fallback, unchanged