/**
 * Monster System
 * 
 * Handles monster instances, stats, moves, and evolution.
 */

import { MonsterData, getMonsterDefinition } from '../data/monsters';
import { getMoveDefinition, getDefaultMoves } from '../data/moves';
import type { MoveSlot } from '../data/moves';
import { DamageCalc } from '../util/DamageCalc';

export interface MonsterInstance {
  id: string;
  instanceId: string;
  level: number;
  currentHp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  xp: number;
  xpToNextLevel: number;
  status: StatusEffect;
  isDefending: boolean;
  moves: MoveSlot[];
}

export type StatusEffect = 'none' | 'burn' | 'poison' | 'paralyze' | 'sleep';

let instanceCounter = 0;

export class MonsterSystem {
  /**
   * Create a new monster instance from a monster definition.
   */
  static createMonster(monsterId: string, level: number = 5): MonsterInstance | null {
    const def = getMonsterDefinition(monsterId);
    if (!def) return null;

    const maxHp = DamageCalc.calcStat(def.baseHp, level);
    
    return {
      id: monsterId,
      instanceId: `${monsterId}_${++instanceCounter}`,
      level,
      currentHp: maxHp,
      maxHp,
      attack: DamageCalc.calcStat(def.baseAtk, level),
      defense: DamageCalc.calcStat(def.baseDef, level),
      speed: DamageCalc.calcStat(def.baseSpd, level),
      xp: 0,
      xpToNextLevel: DamageCalc.xpToNextLevel(level),
      status: 'none',
      isDefending: false,
      moves: this.createMoves(monsterId)
    };
  }

  /**
   * Create moves for a monster based on its default moveset.
   */
  private static createMoves(monsterId: string): MoveSlot[] {
    const moveIds = getDefaultMoves(monsterId);
    return moveIds.map(moveId => {
      const moveDef = getMoveDefinition(moveId);
      return {
        moveId,
        pp: moveDef?.maxPp ?? 10,
        maxPp: moveDef?.maxPp ?? 10
      };
    });
  }

  /**
   * Get the monster definition for an instance.
   */
  static getDefinition(monster: MonsterInstance): MonsterData | undefined {
    return getMonsterDefinition(monster.id);
  }

  /**
   * Take damage and return remaining HP.
   */
  static takeDamage(monster: MonsterInstance, damage: number): number {
    monster.currentHp = Math.max(0, monster.currentHp - damage);
    return monster.currentHp;
  }

  /**
   * Heal the monster.
   */
  static heal(monster: MonsterInstance, amount: number): number {
    monster.currentHp = Math.min(monster.maxHp, monster.currentHp + amount);
    return monster.currentHp;
  }

  /**
   * Full heal - restore all HP and clear status.
   */
  static fullHeal(monster: MonsterInstance): void {
    monster.currentHp = monster.maxHp;
    monster.status = 'none';
    monster.isDefending = false;
    // Restore all PP
    monster.moves.forEach(move => {
      const def = getMoveDefinition(move.moveId);
      move.pp = def?.maxPp ?? move.maxPp;
    });
  }

  /**
   * Apply XP and check for level up.
   * Returns true if the monster leveled up.
   */
  static addXp(monster: MonsterInstance, xpAmount: number): boolean {
    monster.xp += xpAmount;
    
    if (monster.xp >= monster.xpToNextLevel) {
      this.levelUp(monster);
      return true;
    }
    return false;
  }

  /**
   * Level up the monster and update stats.
   */
  static levelUp(monster: MonsterInstance): void {
    monster.level++;
    monster.xp -= monster.xpToNextLevel;
    monster.xpToNextLevel = DamageCalc.xpToNextLevel(monster.level);
    
    // Recalculate stats
    const def = getMonsterDefinition(monster.id);
    if (def) {
      const hpIncrease = Math.floor(def.baseHp * 0.1);
      const otherIncrease = Math.floor(def.baseAtk * 0.1);
      
      monster.maxHp += hpIncrease;
      monster.currentHp = Math.min(monster.currentHp + hpIncrease, monster.maxHp);
      monster.attack += otherIncrease;
      monster.defense += otherIncrease;
      monster.speed += Math.floor(def.baseSpd * 0.1);
    }
    
    // Check for evolution
    const evolution = this.getEvolution(monster.id);
    if (evolution && monster.level >= evolution.level) {
      this.evolve(monster);
    }
  }

  /**
   * Get evolution data for a monster.
   */
  static getEvolution(monsterId: string): { id: string; level: number } | null {
    const def = getMonsterDefinition(monsterId);
    if (!def || !def.evolutionId || !def.evolutionLevel) return null;
    return { id: def.evolutionId, level: def.evolutionLevel };
  }

  /**
   * Evolve a monster to its next form.
   */
  static evolve(monster: MonsterInstance): boolean {
    const evolution = this.getEvolution(monster.id);
    if (!evolution) return false;

    const newDef = getMonsterDefinition(evolution.id);
    if (!newDef) return false;

    // Update monster to new form
    monster.id = evolution.id;
    monster.instanceId = `${evolution.id}_${++instanceCounter}`;
    
    // Boost stats on evolution
    const newMaxHp = DamageCalc.calcStat(newDef.baseHp, monster.level);
    const hpIncrease = newMaxHp - monster.maxHp;
    monster.maxHp = newMaxHp;
    monster.currentHp += hpIncrease;
    monster.attack = DamageCalc.calcStat(newDef.baseAtk, monster.level);
    monster.defense = DamageCalc.calcStat(newDef.baseDef, monster.level);
    monster.speed = DamageCalc.calcStat(newDef.baseSpd, monster.level);

    return true;
  }

  /**
   * Apply a status effect to a monster.
   */
  static applyStatus(monster: MonsterInstance, status: StatusEffect): void {
    if (monster.status === 'none') {
      monster.status = status;
    }
  }

  /**
   * Tick status effects at end of turn (e.g., poison damage).
   */
  static tickStatus(monster: MonsterInstance): number {
    let damage = 0;
    switch (monster.status) {
      case 'burn':
        damage = Math.floor(monster.maxHp * 0.0625);
        monster.currentHp = Math.max(1, monster.currentHp - damage);
        break;
      case 'poison':
        damage = Math.floor(monster.maxHp * 0.0625);
        monster.currentHp = Math.max(1, monster.currentHp - damage);
        break;
      case 'paralyze':
        // Speed reduced by 50% is handled in turn order
        break;
    }
    return damage;
  }

  /**
   * Clear status effect.
   */
  static clearStatus(monster: MonsterInstance): void {
    monster.status = 'none';
  }

  /**
   * Get the effective speed (accounting for paralyze).
   */
  static getEffectiveSpeed(monster: MonsterInstance): number {
    if (monster.status === 'paralyze') {
      return Math.floor(monster.speed * 0.5);
    }
    return monster.speed;
  }

  /**
   * Check if the monster can act (not sleeping).
   */
  static canAct(monster: MonsterInstance): boolean {
    return monster.status !== 'sleep';
  }

  /**
   * Use a move and reduce PP.
   */
  static useMove(monster: MonsterInstance, moveIndex: number): boolean {
    if (moveIndex < 0 || moveIndex >= monster.moves.length) return false;
    if (monster.moves[moveIndex].pp <= 0) return false;
    monster.moves[moveIndex].pp--;
    return true;
  }

  /**
   * Set defending state for the turn.
   */
  static setDefending(monster: MonsterInstance, defending: boolean): void {
    monster.isDefending = defending;
  }
}