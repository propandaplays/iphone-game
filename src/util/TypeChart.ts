/**
 * Type Chart
 * 
 * Handles type effectiveness calculations for combat.
 */

import { MonsterType } from '../data/monsters';

// Type effectiveness multiplier chart
const TYPE_CHART: Record<string, Record<string, number>> = {
  Fire: {
    Grass: 2.0,
    Water: 0.5,
    Fire: 1.0,
    Electric: 1.0,
    Normal: 1.0
  },
  Water: {
    Fire: 2.0,
    Grass: 0.5,
    Water: 1.0,
    Electric: 0.5,
    Normal: 1.0
  },
  Grass: {
    Water: 2.0,
    Fire: 0.5,
    Grass: 1.0,
    Electric: 1.0,
    Normal: 1.0
  },
  Electric: {
    Water: 2.0,
    Grass: 0.5,
    Fire: 1.0,
    Electric: 1.0,
    Normal: 1.0
  },
  Normal: {
    Fire: 1.0,
    Water: 1.0,
    Grass: 1.0,
    Electric: 1.0,
    Normal: 1.0
  }
};

export class TypeChart {
  /**
   * Get the effectiveness multiplier of an attack type against a defense type.
   * @param attackType - The type of the attacking move
   * @param defenseType - The type of the defending monster
   * @returns Multiplier (0.5, 1.0, 2.0, etc.)
   */
  static getMultiplier(attackType: MonsterType, defenseType: MonsterType): number {
    const attackChart = TYPE_CHART[attackType];
    if (!attackChart) return 1.0;
    return attackChart[defenseType] ?? 1.0;
  }

  /**
   * Calculate the full type effectiveness including STAB (Same Type Attack Bonus).
   * STAB gives 1.5x multiplier if the move type matches the monster's type.
   * 
   * @param attackType - The type of the attacking move
   * @param defenderType - The type of the defending monster
   * @param hasStab - Whether the attacker has STAB (move type matches monster type)
   * @returns Total multiplier
   */
  static calculateEffectiveness(attackType: MonsterType, defenderType: MonsterType, hasStab: boolean): number {
    let multiplier = this.getMultiplier(attackType, defenderType);
    if (hasStab) {
      multiplier *= 1.5;
    }
    return multiplier;
  }

  /**
   * Get a text description of the type effectiveness.
   */
  static getEffectivenessText(attackType: MonsterType, defenderType: MonsterType): string {
    const multiplier = this.getMultiplier(attackType, defenderType);
    if (multiplier > 1) return "It's super effective!";
    if (multiplier < 1) return "It's not very effective...";
    return '';
  }
}