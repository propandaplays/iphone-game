/**
 * Damage Calculator
 * 
 * Handles damage calculation for combat.
 */

import { MonsterType } from '../data/monsters';
import { TypeChart } from './TypeChart';

export interface DamageResult {
  damage: number;
  effectivenessText: string;
  isCritical: boolean;
  isStab: boolean;
}

export class DamageCalc {
  /**
   * Calculate damage dealt by an attacker to a defender.
   * 
   * Formula: ((2 * level / 5 + 2) * power * attack / defense / 50 + 2) * modifiers
   * 
   * @param level - Attacker's level
   * @param power - Move's base power
   * @param attackerAtk - Attacker's Attack stat (or Sp. Atk for special moves)
   * @param defenderDef - Defender's Defense stat (or Sp. Def for special moves)
   * @param moveType - The type of the move being used
   * @param attackerType - The attacker's monster type (for STAB)
   * @param defenderType - The defender's monster type (for type effectiveness)
   * @param isDefending - Whether defender used Defend action (50% damage reduction)
   */
  static calculate(
    level: number,
    power: number,
    attackerAtk: number,
    defenderDef: number,
    moveType: MonsterType,
    attackerType: MonsterType,
    defenderType: MonsterType,
    isDefending: boolean = false
  ): DamageResult {
    // Base damage formula
    let damage = ((2 * level / 5 + 2) * power * attackerAtk / defenderDef / 50 + 2);
    
    // Type effectiveness (before STAB)
    const effectiveness = TypeChart.getMultiplier(moveType, defenderType);
    let effectivenessText = TypeChart.getEffectivenessText(moveType, defenderType);
    
    // Apply type effectiveness
    damage *= effectiveness;
    
    // STAB bonus
    const isStab = moveType === attackerType;
    if (isStab) {
      damage *= 1.5;
    }
    
    // Critical hit (8% chance, deals 1.5x damage)
    const isCritical = Math.random() < 0.08;
    if (isCritical) {
      damage *= 1.5;
    }
    
    // Random factor (0.85 - 1.0)
    const randomFactor = 0.85 + Math.random() * 0.15;
    damage *= randomFactor;
    
    // Defend action reduces damage by 50%
    if (isDefending) {
      damage *= 0.5;
    }
    
    // Ensure minimum 1 damage
    damage = Math.max(1, Math.floor(damage));
    
    return {
      damage,
      effectivenessText,
      isCritical,
      isStab
    };
  }

  /**
   * Calculate a monster's stat at a given level.
   * Stats increase by ~10% per level.
   * 
   * @param baseStat - Base stat value
   * @param level - Current level
   * @returns Calculated stat value
   */
  static calcStat(baseStat: number, level: number): number {
    return Math.floor(baseStat * (1 + (level - 1) * 0.1));
  }

  /**
   * Calculate XP required to reach the next level.
   * XP needed = level × 100
   */
  static xpToNextLevel(level: number): number {
    return level * 100;
  }
}