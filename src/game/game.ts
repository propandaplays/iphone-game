/**
 * Game — main class with scene-based architecture.
 *
 * Manages all game systems, scenes, and persistence.
 */

import { MakkoEngine } from '@makko/engine';
import { SceneManager } from '../scene/scene-manager';
import { StartScene } from '../scenes/start-scene';
import { MenuScene } from '../scenes/menu-scene';
import { WorldScene } from '../scenes/world-scene';
import { BattleScene } from '../scenes/battle-scene';
import { PartyScene } from '../scenes/party-scene';
import { ShopScene } from '../scenes/shop-scene';
import { PvPArenaScene } from '../scenes/pvp-arena-scene';
import { SettingsScene } from '../scenes/settings-scene';
import { PartySystem } from '../systems/PartySystem';
import { EconomySystem } from '../systems/EconomySystem';
import { IAPSystem } from '../systems/IAPSystem';
import type { MonsterInstance } from '../systems/MonsterSystem';

/**
 * Main Game class.
 *
 * Manages the game loop, scenes, and game systems (Party, Economy, etc.)
 */
export class Game {
  private scenes = new SceneManager();
  private lastTime = 0;
  private running = false;

  // Game systems
  private partySystem: PartySystem;
  private economySystem: EconomySystem;
  private iapSystem: IAPSystem;

  // Temporary state for scene communication
  private pendingWildEncounter: MonsterInstance | null = null;

  constructor() {
    this.partySystem = new PartySystem();
    this.economySystem = new EconomySystem();
    this.iapSystem = new IAPSystem(this.economySystem);
  }

  /**
   * Initialize game and register scenes.
   */
  async init(): Promise<void> {
    // Load saved data
    this.loadGameData();

    // Register all scenes
    await this.scenes.register(new StartScene(this));
    await this.scenes.register(new MenuScene(this));
    await this.scenes.register(new WorldScene(this));
    await this.scenes.register(new BattleScene(this));
    await this.scenes.register(new PartyScene(this));
    await this.scenes.register(new ShopScene(this));
    await this.scenes.register(new PvPArenaScene(this));
    await this.scenes.register(new SettingsScene(this));
  }

  /**
   * Load game data from save files.
   */
  private loadGameData(): void {
    // Load party data
    if (this.partySystem.hasSave()) {
      this.partySystem.load();
    } else {
      // New game - give starter monster
      this.partySystem.initWithStarter('flamepup');
      this.partySystem.save();
    }

    // Load economy data
    if (this.economySystem.hasSave()) {
      this.economySystem.load();
    } else {
      // New game - start with some gold and balls
      this.economySystem.addItem('monster_ball', 5);
      this.economySystem.save();
    }
  }

  /**
   * Start the game loop.
   */
  start(): void {
    this.running = true;
    this.lastTime = performance.now();

    // Start at the title screen
    this.scenes.switchTo('start');

    this.gameLoop();
  }

  /**
   * Stop the game loop.
   */
  stop(): void {
    this.running = false;
  }

  private gameLoop(): void {
    if (!this.running) return;

    const currentTime = performance.now();
    const dt = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Delegate to scene manager
    this.scenes.handleInput();
    this.scenes.update(dt);
    this.render();

    requestAnimationFrame(() => this.gameLoop());
  }

  private render(): void {
    const display = MakkoEngine.display;

    display.beginFrame();
    display.clear('#1a1a2e');

    // Render all scenes in stack
    this.scenes.render();

    display.endFrame();

    // CRITICAL: Must call at end of each frame for input state tracking
    MakkoEngine.input.endFrame();
  }

  // ============================================================================
  // Public API - Scene Management
  // ============================================================================

  /**
   * Switch to a scene by ID.
   */
  switchScene(sceneId: string): void {
    this.scenes.switchTo(sceneId);
  }

  /**
   * Get the scene manager for advanced control.
   */
  getSceneManager(): SceneManager {
    return this.scenes;
  }

  // ============================================================================
  // Public API - System Access
  // ============================================================================

  /**
   * Get the Party System.
   */
  getPartySystem(): PartySystem {
    return this.partySystem;
  }

  /**
   * Get the Economy System.
   */
  getEconomySystem(): EconomySystem {
    return this.economySystem;
  }

  /**
   * Get the IAP System.
   */
  getIAPSystem(): IAPSystem {
    return this.iapSystem;
  }

  // ============================================================================
  // Public API - Wild Encounter Management
  // ============================================================================

  /**
   * Set pending wild encounter monster.
   */
  setPendingWildEncounter(monster: MonsterInstance): void {
    this.pendingWildEncounter = monster;
  }

  /**
   * Get pending wild encounter monster.
   */
  getPendingWildEncounter(): MonsterInstance | null {
    return this.pendingWildEncounter;
  }

  /**
   * Clear pending wild encounter.
   */
  clearPendingWildEncounter(): void {
    this.pendingWildEncounter = null;
  }
}