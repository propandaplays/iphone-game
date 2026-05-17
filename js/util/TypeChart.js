// Type chart utility
export class TypeChart {
  static getMultiplier(attackType, defenseType) {
    const chart = {
      Fire: { Grass: 2.0, Water: 0.5, Fire: 1.0, Electric: 1.0, Normal: 1.0 },
      Water: { Fire: 2.0, Grass: 0.5, Water: 1.0, Electric: 0.5, Normal: 1.0 },
      Grass: { Water: 2.0, Fire: 0.5, Grass: 1.0, Electric: 1.0, Normal: 1.0 },
      Electric: { Water: 2.0, Grass: 0.5, Fire: 1.0, Electric: 1.0, Normal: 1.0 },
      Normal: { Fire: 1.0, Water: 1.0, Grass: 1.0, Electric: 1.0, Normal: 1.0 }
    };
    return (chart[attackType]?.[defenseType]) ?? 1.0;
  }

  static calculateEffectiveness(attackType, defenderType, hasStab) {
    let mult = this.getMultiplier(attackType, defenderType);
    if (hasStab) mult *= 1.5;
    return mult;
  }

  static getEffectivenessText(attackType, defenderType) {
    const mult = this.getMultiplier(attackType, defenderType);
    if (mult > 1) return "It's super effective!";
    if (mult < 1) return "It's not very effective...";
    return '';
  }
}