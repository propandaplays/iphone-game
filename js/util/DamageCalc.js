// Damage calculator
import { TypeChart } from './TypeChart.js';

export class DamageCalc {
  static calculate(level, power, attackerAtk, defenderDef, moveType, attackerType, defenderType, isDefending = false) {
    let damage = ((2 * level / 5 + 2) * power * attackerAtk / defenderDef / 50 + 2);
    const effectiveness = TypeChart.getMultiplier(moveType, defenderType);
    let effectivenessText = TypeChart.getEffectivenessText(moveType, defenderType);
    damage *= effectiveness;
    
    const isStab = moveType === attackerType;
    if (isStab) damage *= 1.5;
    
    const isCritical = Math.random() < 0.08;
    if (isCritical) damage *= 1.5;
    
    damage *= (0.85 + Math.random() * 0.15);
    if (isDefending) damage *= 0.5;
    
    damage = Math.max(1, Math.floor(damage));
    
    return { damage, effectivenessText, isCritical, isStab };
  }

  static calcStat(baseStat, level) {
    return Math.floor(baseStat * (1 + (level - 1) * 0.1));
  }

  static xpToNextLevel(level) {
    return level * 100;
  }
}