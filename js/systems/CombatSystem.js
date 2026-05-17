// Combat System - handles turn-based battle logic
import { MonsterSystem } from './MonsterSystem.js';
import { getMoveDefinition } from '../data/moves.js';
import { getMonsterDefinition } from '../data/monsters.js';
import { DamageCalc } from '../util/DamageCalc.js';
import { TypeChart } from '../util/TypeChart.js';

export class CombatSystem {
  constructor() {
    this.playerParty = [];
    this.enemyParty = [];
    this.currentPlayerIndex = 0;
    this.currentEnemyIndex = 0;
    this.state = 'idle';
    this.isWild = true;
    this.eventCallback = null;
  }

  init(playerParty, enemyParty, isWild = true, eventCallback = null) {
    this.playerParty = [...playerParty];
    this.enemyParty = [...enemyParty];
    this.currentPlayerIndex = 0;
    this.currentEnemyIndex = 0;
    this.isWild = isWild;
    this.eventCallback = eventCallback;
    this.state = 'player_turn';
    
    // Order by speed
    const playerSpeed = MonsterSystem.getEffectiveSpeed(this.getCurrentPlayerMonster());
    const enemySpeed = MonsterSystem.getEffectiveSpeed(this.getCurrentEnemyMonster());
    this.playerFirst = playerSpeed >= enemySpeed;
  }

  getCurrentPlayerMonster() { return this.playerParty[this.currentPlayerIndex]; }
  getCurrentEnemyMonster() { return this.enemyParty[this.currentEnemyIndex]; }
  getState() { return this.state; }
  isPlayerTurn() { return this.state === 'player_turn'; }
  isBattleOver() { return this.state === 'victory' || this.state === 'defeat'; }

  performAction(action) {
    if (this.state !== 'player_turn' && this.state !== 'enemy_turn') return;

    switch (action.type) {
      case 'attack':
        this.executeAttack(action.moveIndex);
        break;
      case 'defend':
        this.executeDefend();
        break;
      case 'flee':
        this.attemptFlee();
        break;
      case 'switch':
        this.currentPlayerIndex = action.partyIndex;
        this.finishTurn();
        break;
    }
  }

  executeAttack(moveIndex) {
    const attacker = this.isPlayerTurn() ? this.getCurrentPlayerMonster() : this.getCurrentEnemyMonster();
    const defender = this.isPlayerTurn() ? this.getCurrentEnemyMonster() : this.getCurrentPlayerMonster();

    if (!MonsterSystem.canAct(attacker)) {
      this.emitEvent({ type: 'turn_end', data: {} });
      this.finishTurn();
      return;
    }

    if (!MonsterSystem.useMove(attacker, moveIndex)) {
      this.emitEvent({ type: 'turn_end', data: { reason: 'no_pp' } });
      this.finishTurn();
      return;
    }

    const moveDef = getMoveDefinition(attacker.moves[moveIndex].moveId);
    if (!moveDef) {
      this.finishTurn();
      return;
    }

    const attackerDef = MonsterSystem.getDefinition(attacker);
    const defenderDef = MonsterSystem.getDefinition(defender);
    
    const result = DamageCalc.calculate(
      attacker.level, moveDef.power, attacker.attack, defender.defense,
      moveDef.type, attackerDef?.type || 'Normal', defenderDef?.type || 'Normal',
      defender.isDefending
    );

    MonsterSystem.takeDamage(defender, result.damage);

    this.emitEvent({
      type: 'damage',
      data: {
        attacker: attacker.instanceId,
        defender: defender.instanceId,
        damage: result.damage,
        currentHp: defender.currentHp,
        maxHp: defender.maxHp,
        effectivenessText: result.effectivenessText,
        isCritical: result.isCritical,
        isStab: result.isStab,
        moveName: moveDef.name
      }
    });

    if (moveDef.effect !== 'none' && Math.random() < moveDef.effectChance) {
      MonsterSystem.applyStatus(defender, moveDef.effect);
      this.emitEvent({ type: 'status_apply', data: { target: defender.instanceId, status: moveDef.effect } });
    }

    if (defender.currentHp <= 0) {
      this.handleFaint(!this.isPlayerTurn());
    } else {
      this.finishTurn();
    }
  }

  executeDefend() {
    const monster = this.isPlayerTurn() ? this.getCurrentPlayerMonster() : this.getCurrentEnemyMonster();
    MonsterSystem.setDefending(monster, true);
    this.emitEvent({ type: 'turn_end', data: { action: 'defend' } });
    this.finishTurn();
  }

  attemptFlee() {
    if (!this.isWild) {
      this.emitEvent({ type: 'flee_fail', data: { reason: 'PvP' } });
      this.finishTurn();
      return;
    }

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

  handleFaint(wasPlayerMonster) {
    if (wasPlayerMonster) {
      const aliveIndex = this.playerParty.findIndex(m => m.currentHp > 0);
      if (aliveIndex !== -1) {
        this.currentPlayerIndex = aliveIndex;
        this.state = 'player_turn';
        this.emitEvent({ type: 'turn_end', data: { newMonster: true } });
      } else {
        this.state = 'defeat';
        this.emitEvent({ type: 'defeat', data: {} });
      }
    } else {
      this.state = 'victory';
      this.emitEvent({ type: 'victory', data: {} });
    }
  }

  finishTurn() {
    // Tick status effects for both
    const player = this.getCurrentPlayerMonster();
    const enemy = this.getCurrentEnemyMonster();

    if (enemy.status !== 'none') {
      const dmg = MonsterSystem.tickStatus(enemy);
      if (dmg > 0) {
        this.emitEvent({ type: 'damage', data: { attacker: enemy.instanceId, defender: enemy.instanceId, damage: dmg, currentHp: enemy.currentHp, maxHp: enemy.maxHp, moveName: `${enemy.status} damage` } });
        if (enemy.currentHp <= 0) { this.handleFaint(false); return; }
      }
    }
    if (player.status !== 'none') {
      const dmg = MonsterSystem.tickStatus(player);
      if (dmg > 0) {
        this.emitEvent({ type: 'damage', data: { attacker: player.instanceId, defender: player.instanceId, damage: dmg, currentHp: player.currentHp, maxHp: player.maxHp, moveName: `${player.status} damage` } });
        if (player.currentHp <= 0) { this.handleFaint(true); return; }
      }
    }

    // Enemy turn
    this.state = 'enemy_turn';
    setTimeout(() => this.executeAITurn(), 500);
  }

  executeAITurn() {
    if (this.state !== 'enemy_turn') return;

    const enemy = this.getCurrentEnemyMonster();
    if (!MonsterSystem.canAct(enemy)) {
      this.emitEvent({ type: 'turn_end', data: { reason: 'sleep' } });
      this.finishTurnPlayer();
      return;
    }

    const availableMoves = enemy.moves.map((m, i) => ({ ...m, index: i })).filter(m => m.pp > 0);
    if (availableMoves.length === 0) {
      this.finishTurnPlayer();
      return;
    }

    const weighted = availableMoves.map(m => {
      const def = getMoveDefinition(m.moveId);
      return { ...m, weight: (def?.power ?? 40) + Math.random() * 10 };
    }).sort((a, b) => b.weight - a.weight);

    const chosen = weighted[Math.floor(Math.random() * Math.min(2, weighted.length))];
    this.executeAttack(chosen.index);
  }

  finishTurnPlayer() {
    this.state = 'player_turn';
  }

  getXpReward() {
    const def = MonsterSystem.getDefinition(this.getCurrentEnemyMonster());
    return def?.xpYield ?? 50;
  }

  emitEvent(event) {
    if (this.eventCallback) this.eventCallback(event);
  }
}