/**
 * Combat System
 * 
 * Handles turn-based battle logic, damage calculation, and AI.
 */

import { MonsterSystem, MonsterInstance, StatusEffect } from './MonsterSystem';
import { getMoveDefinition } from '../data/moves';
import { MonsterType } from '../data/monsters';
import { DamageCalc } from '../util/DamageCalc';
import { TurnManager } from '../turn/turn-manager';

export type CombatState = 
  | 'idle'
  | 'player_turn'
  | 'enemy_turn'
  | 'animating'
  | 'victory'
  | 'defeat';

export type BattleAction = 
  | { type: 'attack'; moveIndex: number; targetIndex: number }
  | { type: 'capture'; ballType: string }
  | { type: 'use_item'; itemId: string; targetIndex: number }
  | { type: 'switch'; partyIndex: number }
  | { type: 'defend' }
  | { type: 'flee' };

export interface CombatEvent {
  type: 'damage' | 'capture_attempt' | 'capture_success' | 'capture_fail' | 
        'status_apply' | 'level_up' | 'evolve' | 'flee_success' | 'flee_fail' |
        'victory' | 'defeat' | 'turn_end';
  data: Record<string, unknown>;
}

export type CombatEventCallback = (event: CombatEvent) => void;

// Note: Combatant interface reserved for future 2v2 support
// interface Combatant { ... }

export class CombatSystem {
  private playerParty: MonsterInstance[] = [];
  private enemyParty: MonsterInstance[] = [];
  private currentPlayerIndex: number = 0;
  private currentEnemyIndex: number = 0;
  private state: CombatState = 'idle';
  private round: number = 1;
  private isWild: boolean = true;
  private turnManager: TurnManager | null = null;
  
  private eventCallback: CombatEventCallback | null = null;
  private animationQueue: CombatEvent[] = [];
  private isAnimating: boolean = false;

  /**
   * Initialize a battle.
   */
  init(
    playerParty: MonsterInstance[],
    enemyParty: MonsterInstance[],
    isWild: boolean = true,
    eventCallback?: CombatEventCallback
  ): void {
    this.playerParty = [...playerParty];
    this.enemyParty = [...enemyParty];
    this.currentPlayerIndex = 0;
    this.currentEnemyIndex = 0;
    this.isWild = isWild;
    this.state = 'player_turn';
    this.round = 1;
    this.eventCallback = eventCallback ?? null;
    this.animationQueue = [];
    this.isAnimating = false;

    // Create turn manager ordered by speed
    const playerSpeed = MonsterSystem.getEffectiveSpeed(this.getCurrentPlayerMonster());
    const enemySpeed = MonsterSystem.getEffectiveSpeed(this.getCurrentEnemyMonster());
    
    const playerFirst = playerSpeed >= enemySpeed;

    this.turnManager = new TurnManager(
      playerFirst ? ['player', 'enemy'] : ['enemy', 'player'],
      {
        phases: [{ id: 'action' }],
        onRoundStart: (round) => {
          this.round = round;
        },
        onTurnStart: (playerId) => {
          // Clear defending state at start of new turn
          const monster = playerId === 'player' 
            ? this.getCurrentPlayerMonster()
            : this.getCurrentEnemyMonster();
          MonsterSystem.setDefending(monster, false);
        },
        onTurnEnd: (playerId) => {
          this.advanceTurn(playerId);
        }
      }
    );
    this.turnManager.startGame();
  }

  /**
   * Get current player monster.
   */
  getCurrentPlayerMonster(): MonsterInstance {
    return this.playerParty[this.currentPlayerIndex];
  }

  /**
   * Get current enemy monster.
   */
  getCurrentEnemyMonster(): MonsterInstance {
    return this.enemyParty[this.currentEnemyIndex];
  }

  /**
   * Get current combat state.
   */
  getState(): CombatState {
    return this.state;
  }

  /**
   * Get current round.
   */
  getRound(): number {
    return this.round;
  }

  /**
   * Check if it's the player's turn.
   */
  isPlayerTurn(): boolean {
    return this.turnManager?.getCurrentPlayerId() === 'player';
  }

  /**
   * Perform a battle action.
   */
  performAction(action: BattleAction): void {
    if (this.state !== 'player_turn' && this.state !== 'enemy_turn') return;
    if (this.isAnimating) return;

    this.state = 'animating';

    switch (action.type) {
      case 'attack':
        this.executeAttack(action.moveIndex, action.targetIndex);
        break;
      case 'capture':
        // Handled by CaptureSystem
        break;
      case 'use_item':
        // Handled by item system
        break;
      case 'switch':
        this.switchMonster(action.partyIndex);
        break;
      case 'defend':
        this.executeDefend();
        break;
      case 'flee':
        this.attemptFlee();
        break;
    }
  }

  /**
   * Execute an attack action.
   */
  private executeAttack(moveIndex: number, _targetIndex: number): void {
    const attacker = this.isPlayerTurn() ? this.getCurrentPlayerMonster() : this.getCurrentEnemyMonster();
    const defender = this.isPlayerTurn() ? this.getCurrentEnemyMonster() : this.getCurrentPlayerMonster();
    
    if (!MonsterSystem.canAct(attacker)) {
      // Monster is asleep, skip turn
      this.emitEvent({ type: 'turn_end', data: { reason: 'status' } });
      return;
    }

    // Use the move
    if (!MonsterSystem.useMove(attacker, moveIndex)) {
      // Out of PP, use struggle
      this.struggle(attacker, defender);
      return;
    }

    const moveDef = getMoveDefinition(attacker.moves[moveIndex].moveId);
    if (!moveDef) {
      this.struggle(attacker, defender);
      return;
    }

    // Calculate damage
    const isSpecial = moveDef.isSpecial;
    const damageResult = DamageCalc.calculate(
      attacker.level,
      moveDef.power,
      isSpecial ? attacker.attack : attacker.attack,
      isSpecial ? defender.defense : defender.defense,
      moveDef.type,
      MonsterSystem.getDefinition(attacker)?.type ?? MonsterType.Normal,
      MonsterSystem.getDefinition(defender)?.type ?? MonsterType.Normal,
      defender.isDefending
    );

    // Apply damage
    const finalDamage = MonsterSystem.takeDamage(defender, damageResult.damage);

    this.emitEvent({
      type: 'damage',
      data: {
        attacker: attacker.instanceId,
        defender: defender.instanceId,
        damage: finalDamage,
        currentHp: defender.currentHp,
        maxHp: defender.maxHp,
        effectivenessText: damageResult.effectivenessText,
        isCritical: damageResult.isCritical,
        isStab: damageResult.isStab,
        moveName: moveDef.name
      }
    });

    // Apply status effect
    if (moveDef.effect !== 'none' && Math.random() < moveDef.effectChance) {
      MonsterSystem.applyStatus(defender, moveDef.effect as StatusEffect);
      this.emitEvent({
        type: 'status_apply',
        data: {
          target: defender.instanceId,
          status: moveDef.effect
        }
      });
    }

    // Check if defender fainted
    if (defender.currentHp <= 0) {
      this.handleFaint(!this.isPlayerTurn());
    } else {
      this.finishTurn();
    }
  }

  /**
   * Struggle - used when out of PP.
   */
  private struggle(attacker: MonsterInstance, defender: MonsterInstance): void {
    // Struggle deals 50% of normal, no type effectiveness, can hit self
    const damage = Math.max(1, Math.floor(attacker.attack / 4));
    MonsterSystem.takeDamage(attacker, damage);
    
    this.emitEvent({
      type: 'damage',
      data: {
        attacker: attacker.instanceId,
        defender: attacker.instanceId,
        damage: damage,
        currentHp: attacker.currentHp,
        maxHp: attacker.maxHp,
        effectivenessText: '',
        isCritical: false,
        isStab: false,
        moveName: 'Struggle'
      }
    });

    if (attacker.currentHp <= 0) {
      this.handleFaint(this.isPlayerTurn());
    } else {
      this.finishTurn();
    }
  }

  /**
   * Execute defend action.
   */
  private executeDefend(): void {
    const monster = this.isPlayerTurn() ? this.getCurrentPlayerMonster() : this.getCurrentEnemyMonster();
    MonsterSystem.setDefending(monster, true);
    
    this.emitEvent({
      type: 'turn_end',
      data: { action: 'defend' }
    });

    this.finishTurn();
  }

  /**
   * Attempt to flee from battle.
   */
  private attemptFlee(): void {
    if (!this.isWild) {
      this.emitEvent({ type: 'flee_fail', data: { reason: 'PvP' } });
      this.finishTurn();
      return;
    }

    // 50% base flee chance + speed bonus
    const playerMonster = this.getCurrentPlayerMonster();
    const enemyMonster = this.getCurrentEnemyMonster();
    const speedRatio = playerMonster.speed / Math.max(enemyMonster.speed, 1);
    const fleeChance = Math.min(0.95, 0.5 + (speedRatio - 1) * 0.1);

    if (Math.random() < fleeChance) {
      this.emitEvent({ type: 'flee_success', data: {} });
      this.state = 'idle';
    } else {
      this.emitEvent({ type: 'flee_fail', data: {} });
      this.finishTurn();
    }
  }

  /**
   * Switch to a different monster.
   */
  private switchMonster(partyIndex: number): void {
    if (this.isPlayerTurn()) {
      if (partyIndex < 0 || partyIndex >= this.playerParty.length) return;
      if (this.playerParty[partyIndex].currentHp <= 0) return;
      
      this.currentPlayerIndex = partyIndex;
      
      this.emitEvent({
        type: 'turn_end',
        data: { action: 'switch', newMonster: this.playerParty[partyIndex].instanceId }
      });

      this.finishTurn();
    }
  }

  /**
   * Handle a monster fainting.
   */
  private handleFaint(wasPlayerMonster: boolean): void {
    if (wasPlayerMonster) {
      // Check if player has more monsters
      const aliveIndex = this.playerParty.findIndex(m => m.currentHp > 0);
      if (aliveIndex !== -1 && aliveIndex !== this.currentPlayerIndex) {
        this.currentPlayerIndex = aliveIndex;
        this.state = 'player_turn';
      } else {
        this.state = 'defeat';
        this.emitEvent({ type: 'defeat', data: {} });
      }
    } else {
      // Check if enemy has more monsters
      const aliveIndex = this.enemyParty.findIndex(m => m.currentHp > 0);
      if (aliveIndex !== -1 && aliveIndex !== this.currentEnemyIndex) {
        this.currentEnemyIndex = aliveIndex;
        this.state = 'player_turn';
        this.emitEvent({ type: 'turn_end', data: { newEnemy: this.enemyParty[aliveIndex].instanceId } });
      } else {
        this.state = 'victory';
        this.emitEvent({ type: 'victory', data: {} });
      }
    }
  }

  /**
   * End the current turn.
   */
  private finishTurn(): void {
    // Tick status effects for both combatants at end of turn
    const player = this.getCurrentPlayerMonster();
    const enemy = this.getCurrentEnemyMonster();
    
    // Tick enemy status if player attacked (poison/burn on enemy)
    if (enemy.status !== 'none') {
      const statusDamage = MonsterSystem.tickStatus(enemy);
      if (statusDamage > 0) {
        this.emitEvent({
          type: 'damage',
          data: {
            attacker: enemy.instanceId,
            defender: enemy.instanceId,
            damage: statusDamage,
            currentHp: enemy.currentHp,
            maxHp: enemy.maxHp,
            effectivenessText: '',
            isCritical: false,
            isStab: false,
            moveName: `${enemy.status} damage`
          }
        });
        if (enemy.currentHp <= 0) {
          this.handleFaint(false);
          return;
        }
      }
    }
    
    // Tick player status if enemy attacked (poison/burn on player)
    if (player.status !== 'none') {
      const statusDamage = MonsterSystem.tickStatus(player);
      if (statusDamage > 0) {
        this.emitEvent({
          type: 'damage',
          data: {
            attacker: player.instanceId,
            defender: player.instanceId,
            damage: statusDamage,
            currentHp: player.currentHp,
            maxHp: player.maxHp,
            effectivenessText: '',
            isCritical: false,
            isStab: false,
            moveName: `${player.status} damage`
          }
        });
        if (player.currentHp <= 0) {
          this.handleFaint(true);
          return;
        }
      }
    }

    this.turnManager?.endTurn();
    
    // Check whose turn it is now
    if (this.turnManager?.getCurrentPlayerId() === 'player') {
      this.state = 'player_turn';
    } else {
      this.state = 'enemy_turn';
      // AI takes action after brief delay
      setTimeout(() => this.executeAITurn(), 500);
    }
  }

  /**
   * Advance to the next turn.
   */
  private advanceTurn(_currentPlayerId: string): void {
    this.round = this.turnManager?.getRound() ?? this.round;
  }

  /**
   * Execute AI turn.
   */
  private executeAITurn(): void {
    if (this.state !== 'enemy_turn') return;

    const enemy = this.getCurrentEnemyMonster();
    
    if (!MonsterSystem.canAct(enemy)) {
      this.emitEvent({ type: 'turn_end', data: { reason: 'sleep' } });
      this.finishTurn();
      return;
    }

    // Simple AI: pick random move
    const availableMoves = enemy.moves
      .map((m, i) => ({ ...m, index: i }))
      .filter(m => m.pp > 0);
    
    if (availableMoves.length === 0) {
      this.struggle(enemy, this.getCurrentPlayerMonster());
      return;
    }

    // Weight by power
    const weightedMoves = availableMoves.map(m => {
      const def = getMoveDefinition(m.moveId);
      return { ...m, weight: (def?.power ?? 40) + Math.random() * 10 };
    });
    weightedMoves.sort((a, b) => b.weight - a.weight);

    // Pick from top moves
    const topMoves = weightedMoves.slice(0, Math.min(2, weightedMoves.length));
    const chosen = topMoves[Math.floor(Math.random() * topMoves.length)];

    this.performAction({ type: 'attack', moveIndex: chosen.index, targetIndex: 0 });
  }

  /**
   * Tick status effects for player at end of round.
   */
  tickPlayerStatus(): void {
    const player = this.getCurrentPlayerMonster();
    if (player.status !== 'none') {
      const statusDamage = MonsterSystem.tickStatus(player);
      if (statusDamage > 0) {
        this.emitEvent({
          type: 'damage',
          data: {
            attacker: player.instanceId,
            defender: player.instanceId,
            damage: statusDamage,
            currentHp: player.currentHp,
            maxHp: player.maxHp,
            effectivenessText: '',
            isCritical: false,
            isStab: false,
            moveName: `${player.status} damage`
          }
        });
        if (player.currentHp <= 0) {
          this.handleFaint(true);
        }
      }
    }
  }

  /**
   * Get player party for rewards.
   */
  getPlayerParty(): MonsterInstance[] {
    return this.playerParty;
  }

  /**
   * Get XP reward for defeating enemy.
   */
  getXpReward(): number {
    const enemyDef = MonsterSystem.getDefinition(this.getCurrentEnemyMonster());
    return enemyDef?.xpYield ?? 50;
  }

  /**
   * Emit a combat event.
   */
  private emitEvent(event: CombatEvent): void {
    this.eventCallback?.(event);
  }

  /**
   * Check if battle is over.
   */
  isBattleOver(): boolean {
    return this.state === 'victory' || this.state === 'defeat';
  }
}