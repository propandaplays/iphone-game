// Capture System
import { getMonsterDefinition } from '../data/monsters.js';
import { BALL_MULTIPLIERS } from './EconomySystem.js';

export class CaptureSystem {
  static calculateCaptureChance(monster, ballType) {
    const def = getMonsterDefinition(monster.id);
    if (!def) return 0;

    const baseRate = def.catchRate;
    const hpPercent = (monster.currentHp / monster.maxHp) * 100;
    const multiplier = BALL_MULTIPLIERS[ballType] || 1.0;

    let chance = baseRate * (1 - hpPercent / 100) * multiplier;
    if (ballType === 'master_ball') return 1.0;
    return Math.max(0.05, Math.min(0.95, chance));
  }
}