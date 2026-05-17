/**
 * Battle Scene
 * 
 * Turn-based combat scene for wild encounters and PvP.
 */

import { MakkoEngine } from '@makko/engine';
import { BaseScene } from '../scene/base-scene';
import { CombatSystem, CombatEvent } from '../systems/CombatSystem';
import { MonsterSystem, MonsterInstance } from '../systems/MonsterSystem';
import { CaptureSystem, CaptureResult } from '../systems/CaptureSystem';
import { BattleUI, DamageNumber, renderMonsterInfo, BattleUIAction } from '../components/BattleUI';
import { MonsterSprite } from '../components/MonsterSprite';
import { getMonsterDefinition } from '../data/monsters';
import type { Game } from '../game/game';

export class BattleScene extends BaseScene {
  readonly id = 'battle';

  private game: Game;
  private combatSystem: CombatSystem;
  private captureSystem: CaptureSystem;
  private battleUI: BattleUI;
  
  // Combat state
  private playerMonsters: MonsterInstance[] = [];
  private enemyMonsters: MonsterInstance[] = [];
  private isWild: boolean = true;
  private pendingWildMonster: MonsterInstance | null = null;
  
  // Sprites
  private playerSprite: MonsterSprite | null = null;
  private enemySprite: MonsterSprite | null = null;
  
  // Effects
  private damageNumbers: DamageNumber[] = [];
  private messageText: string = '';
  private messageTimer: number = 0;
  
  // Animation state
  private isAnimating: boolean = false;
  private resultState: 'none' | 'victory' | 'defeat' | 'captured' = 'none';

  constructor(game: Game) {
    super();
    this.game = game;
    this.combatSystem = new CombatSystem();
    this.captureSystem = new CaptureSystem();
    this.battleUI = new BattleUI();
  }

  init(): void {
    // Set up UI callbacks
    this.battleUI.setCallbacks((action) => this.handleBattleAction(action));
  }

  enter(previousScene?: string): void {
    // Check for pending wild encounter
    this.pendingWildMonster = this.game.getPendingWildEncounter();
    
    if (this.pendingWildMonster) {
      // Wild encounter
      this.isWild = true;
      this.playerMonsters = [...this.game.getPartySystem().getParty()];
      this.enemyMonsters = [this.pendingWildMonster];
    } else {
      // PvP battle - would be set up separately
      this.isWild = false;
      this.playerMonsters = [...this.game.getPartySystem().getParty()];
      this.enemyMonsters = this.createAIParty();
    }

    // Initialize combat
    this.combatSystem.init(
      this.playerMonsters,
      this.enemyMonsters,
      this.isWild,
      (event) => this.handleCombatEvent(event)
    );

    // Set up UI
    this.battleUI.setPlayerMonster(this.combatSystem.getCurrentPlayerMonster());
    this.battleUI.setPartyMonsters(this.playerMonsters);
    this.updateInventoryUI();

    // Create sprites
    this.createSprites();

    // Reset state
    this.damageNumbers = [];
    this.messageText = '';
    this.isAnimating = false;
    this.resultState = 'none';
    this.battleUI.setMode('action');
  }

  private createSprites(): void {
    const display = MakkoEngine.display;
    const playerMonster = this.combatSystem.getCurrentPlayerMonster();
    const enemyMonster = this.combatSystem.getCurrentEnemyMonster();

    if (playerMonster) {
      this.playerSprite = new MonsterSprite(playerMonster, {
        x: display.width * 0.25,
        y: display.height * 0.65,
        scale: 1.2,
        facingRight: true
      });
    }

    if (enemyMonster) {
      this.enemySprite = new MonsterSprite(enemyMonster, {
        x: display.width * 0.75,
        y: display.height * 0.35,
        scale: 1.0,
        isEnemy: true
      });
    }
  }

  private updateInventoryUI(): void {
    const economy = this.game.getEconomySystem();
    const inventory = economy.getInventory();
    const captureBalls = inventory
      .filter(item => item.id.includes('ball'))
      .map(item => ({ id: item.id, quantity: item.quantity }));
    
    this.battleUI.setInventory(inventory, captureBalls);
  }

  private createAIParty(): MonsterInstance[] {
    // Create AI opponent party for PvP
    const aiMonsters: MonsterInstance[] = [];
    const baseTypes = ['flamepup', 'aquaslime', 'sproutling', 'sparkrat', 'fluffling'];
    
    for (let i = 0; i < 3; i++) {
      const randomType = baseTypes[Math.floor(Math.random() * baseTypes.length)];
      const monster = MonsterSystem.createMonster(randomType, 8 + Math.floor(Math.random() * 5));
      if (monster) aiMonsters.push(monster);
    }
    
    return aiMonsters;
  }

  private handleBattleAction(action: BattleUIAction): void {
    if (this.isAnimating || this.resultState !== 'none') return;

    switch (action.type) {
      case 'attack':
        this.combatSystem.performAction({
          type: 'attack',
          moveIndex: action.data.moveIndex,
          targetIndex: 0
        });
        break;
        
      case 'capture':
        this.attemptCapture(action.data.ballType);
        break;
        
      case 'defend':
        this.combatSystem.performAction({ type: 'defend' });
        break;
        
      case 'flee':
        this.combatSystem.performAction({ type: 'flee' });
        break;
        
      case 'switch':
        this.combatSystem.performAction({
          type: 'switch',
          partyIndex: action.data.partyIndex
        });
        // Update sprites and UI after switch
        this.updateAfterSwitch();
        break;
        
      case 'item':
        this.useHealingItem(action.data.itemId);
        break;
    }
  }

  private attemptCapture(ballType: string): void {
    const economy = this.game.getEconomySystem();
    const ballCount = economy.getItemCount(ballType);
    
    if (ballCount <= 0) {
      this.showMessage('No capture balls left!');
      return;
    }

    // Consume ball
    economy.useItem(ballType);
    economy.save();

    const enemyMonster = this.combatSystem.getCurrentEnemyMonster();
    
    this.showMessage(`${ballType.replace('_', ' ')} thrown!`);
    
    // Trigger flash animation
    this.enemySprite?.setFlash();

    // Attempt capture
    setTimeout(() => {
      this.captureSystem.initiateCapture(
        enemyMonster,
        ballType as import('../systems/EconomySystem').CaptureBall, // eslint-disable-line
        (result) => this.handleCaptureResult(result)
      );
    }, 500);
  }

  private handleCaptureResult(result: CaptureResult): void {
    if (result.success) {
      this.resultState = 'captured';
      this.showMessage(`Caught ${getMonsterDefinition(result.monster.id)?.name}!`);
      
      // Add to party
      this.game.getPartySystem().addMonster(result.monster);
      this.game.getPartySystem().save();
      
      // Return to world after delay
      setTimeout(() => {
        this.game.switchScene(this.isWild ? 'world' : 'pvp');
      }, 2000);
    } else {
      this.showMessage('It broke free!');
      // Enemy attacks back
      setTimeout(() => {
        this.combatSystem.performAction({ type: 'flee' }); // Placeholder to trigger enemy turn
      }, 500);
    }
    
    this.updateInventoryUI();
  }

  private useHealingItem(itemId: string): void {
    const economy = this.game.getEconomySystem();
    const monster = this.combatSystem.getCurrentPlayerMonster();
    
    if (!economy.useItem(itemId)) return;
    economy.save();

    let healAmount = 0;
    switch (itemId) {
      case 'potion':
        healAmount = Math.min(20, monster.maxHp - monster.currentHp);
        MonsterSystem.heal(monster, 20);
        break;
      case 'super_potion':
        healAmount = Math.min(50, monster.maxHp - monster.currentHp);
        MonsterSystem.heal(monster, 50);
        break;
      case 'full_heal':
        healAmount = monster.maxHp - monster.currentHp;
        MonsterSystem.fullHeal(monster);
        break;
    }

    this.showMessage(`Restored ${healAmount} HP!`);
    economy.save();
    this.updateInventoryUI();
    
    // End turn
    setTimeout(() => {
      this.combatSystem.performAction({ type: 'flee' });
    }, 500);
  }

  private handleCombatEvent(event: CombatEvent): void {
    switch (event.type) {
      case 'damage':
        this.handleDamageEvent(event.data);
        break;
      case 'status_apply':
        this.showMessage(`${event.data.target} is now ${event.data.status}!`);
        break;
      case 'flee_success':
        this.showMessage('Got away safely!');
        setTimeout(() => this.game.switchScene('world'), 1500);
        break;
      case 'flee_fail':
        this.showMessage("Couldn't escape!");
        break;
      case 'victory':
        this.handleVictory();
        break;
      case 'defeat':
        this.handleDefeat();
        break;
      case 'turn_end':
        this.updateUIAfterTurn();
        break;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleDamageEvent(data: any): void {
    // Determine which monster took damage (the defender)
    const defenderId = data.defender;
    const playerMonster = this.combatSystem.getCurrentPlayerMonster();
    // const enemyMonster = this.combatSystem.getCurrentEnemyMonster(); // Reserved for future multi-monster battles
    
    const targetIsPlayer = defenderId === playerMonster?.instanceId;
    
    // Show damage on the correct sprite (the one that got hit)
    if (targetIsPlayer && this.playerSprite) {
      this.playerSprite.setFlash();
      this.damageNumbers.push(new DamageNumber(
        this.playerSprite['x'] as number,
        (this.playerSprite['y'] as number) - 50,
        data.damage,
        data.isCritical
      ));
    } else if (!targetIsPlayer && this.enemySprite) {
      this.enemySprite.setFlash();
      this.damageNumbers.push(new DamageNumber(
        this.enemySprite['x'] as number,
        (this.enemySprite['y'] as number) - 50,
        data.damage,
        data.isCritical
      ));
    }

    // Show effectiveness text
    if (data.effectivenessText) {
      this.showMessage(data.effectivenessText);
    }

    // Show move name
    this.showMessage(`${data.moveName}!`);

    this.updateUIAfterTurn();
  }

  private handleVictory(): void {
    this.resultState = 'victory';
    this.showMessage('Victory!');
    
    // Award XP
    const xpReward = this.combatSystem.getXpReward();
    const playerMonster = this.combatSystem.getCurrentPlayerMonster();
    const leveledUp = MonsterSystem.addXp(playerMonster, xpReward);
    
    setTimeout(() => {
      this.showMessage(`${playerMonster.id} gained ${xpReward} XP!`);
      
      if (leveledUp) {
        setTimeout(() => {
          this.showMessage(`${playerMonster.id} leveled up to ${playerMonster.level}!`);
        }, 1000);
      }
    }, 1000);

    // Save party
    this.game.getPartySystem().save();
    
    // Award gold for wild encounters
    if (this.isWild) {
      const goldReward = 50 + Math.floor(Math.random() * 50);
      this.game.getEconomySystem().addGold(goldReward);
      this.game.getEconomySystem().save();
      
      setTimeout(() => {
        this.showMessage(`Earned ${goldReward} gold!`);
      }, 2000);
    }

    // Return to world after delay
    setTimeout(() => {
      this.game.switchScene(this.isWild ? 'world' : 'menu');
    }, 3500);
  }

  private handleDefeat(): void {
    this.resultState = 'defeat';
    this.showMessage('Defeated...');
    
    // Heal party and return
    setTimeout(() => {
      this.showMessage('Your monsters have been healed!');
      this.game.getPartySystem().healAll();
      this.game.getPartySystem().save();
      this.game.switchScene(this.isWild ? 'world' : 'menu');
    }, 2000);
  }

  private updateUIAfterTurn(): void {
    this.battleUI.setPlayerMonster(this.combatSystem.getCurrentPlayerMonster());
  }

  private updateAfterSwitch(): void {
    this.battleUI.setPlayerMonster(this.combatSystem.getCurrentPlayerMonster());
    
    const display = MakkoEngine.display;
    const playerMonster = this.combatSystem.getCurrentPlayerMonster();
    
    this.playerSprite = new MonsterSprite(playerMonster, {
      x: display.width * 0.25,
      y: display.height * 0.65,
      scale: 1.2,
      facingRight: true
    });
  }

  private showMessage(text: string): void {
    this.messageText = text;
    this.messageTimer = 2000;
  }

  handleInput(): void {
    if (this.resultState !== 'none') return;
    this.battleUI.handleInput();
  }

  update(dt: number): void {
    // Update sprites
    this.playerSprite?.update(dt);
    this.enemySprite?.update(dt);

    // Update damage numbers
    this.damageNumbers = this.damageNumbers.filter(dn => dn.update(dt));

    // Update UI
    this.battleUI.update(dt);

    // Update message timer
    if (this.messageTimer > 0) {
      this.messageTimer -= dt;
    }
  }

  render(): void {
    const display = MakkoEngine.display;

    // Draw battle background
    display.clear('#1a1a2e');
    
    // Draw arena
    display.drawRect(0, 0, display.width, display.height * 0.4, {
      fill: '#16213e'
    });
    
    // Draw ground
    display.drawRect(0, display.height * 0.4, display.width, display.height * 0.2, {
      fill: '#1e3a1e'
    });

    // Draw enemy monster (top)
    this.enemySprite?.render();
    
    // Draw player monster (bottom)
    this.playerSprite?.render();

    // Draw VS text
    const vsFont = 'bold 36px system-ui';
    display.drawText('VS', display.width / 2, display.height * 0.45, {
      font: vsFont,
      fill: '#e94560'
    });

    // Draw enemy info (top)
    const enemyMonster = this.combatSystem.getCurrentEnemyMonster();
    if (enemyMonster) {
      renderMonsterInfo(
        enemyMonster,
        display.width - 280,
        30,
        250,
        false
      );
    }

    // Draw player info (bottom left)
    const playerMonster = this.combatSystem.getCurrentPlayerMonster();
    if (playerMonster) {
      renderMonsterInfo(
        playerMonster,
        30,
        display.height - 250,
        200,
        true
      );
    }

    // Draw damage numbers
    for (const dn of this.damageNumbers) {
      dn.render();
    }

    // Draw message
    if (this.messageTimer > 0) {
      const msgFont = 'bold 24px system-ui';
      const metrics = display.measureText(this.messageText, { font: msgFont });
      
      // Message background
      display.drawRoundRect(
        display.width / 2 - metrics.width / 2 - 20,
        display.height * 0.45 - 30,
        metrics.width + 40,
        50,
        8,
        { fill: 'rgba(0, 0, 0, 0.7)' }
      );
      
      display.drawText(
        this.messageText,
        display.width / 2 - metrics.width / 2,
        display.height * 0.45 - 15,
        { font: msgFont, fill: '#ffffff', align: 'center' }
      );
    }

    // Draw result overlay
    if (this.resultState !== 'none') {
      this.renderResultOverlay();
    }

    // Draw battle UI
    this.battleUI.render();
  }

  private renderResultOverlay(): void {
    const display = MakkoEngine.display;
    
    // Semi-transparent overlay
    display.drawRect(0, 0, display.width, display.height, {
      fill: 'rgba(0, 0, 0, 0.5)'
    });

    // Result text
    const resultFont = 'bold 64px system-ui';
    const resultText = this.resultState === 'victory' ? 'VICTORY!' :
                       this.resultState === 'captured' ? 'CAUGHT!' : 'DEFEAT';
    const color = this.resultState === 'defeat' ? '#ef4444' : '#22c55e';
    
    const metrics = display.measureText(resultText, { font: resultFont });
    display.drawText(
      resultText,
      display.width / 2 - metrics.width / 2,
      display.height / 2 - 50,
      { font: resultFont, fill: color }
    );
  }

  exit(_nextScene?: string): void {
    // Clean up
    this.game.clearPendingWildEncounter();
    this.playerSprite = null;
    this.enemySprite = null;
    this.damageNumbers = [];
  }
}