/**
 * Capture System
 * 
 * Handles capture mechanics and ball shake animations.
 */

import { MonsterInstance } from './MonsterSystem';
import { CaptureBall, BALL_MULTIPLIERS, BALL_NAMES } from './EconomySystem';
import { getMonsterDefinition } from '../data/monsters';

export interface CaptureResult {
  success: boolean;
  wobbles: number; // 0-3 wobbles before result
  escaped: boolean;
  monster: MonsterInstance;
}

export type CaptureCallback = (result: CaptureResult) => void;

export class CaptureSystem {
  private pendingCapture: {
    monster: MonsterInstance;
    ballType: CaptureBall;
    callback: CaptureCallback;
  } | null = null;

  /**
   * Attempt to capture a monster.
   * 
   * Capture chance = base_rate × (1 - hp_percent/100) × item_multiplier
   * Minimum 5% chance.
   * 
   * @param monster - The monster to capture
   * @param ballType - Type of capture ball
   * @returns Capture result
   */
  static calculateCaptureChance(monster: MonsterInstance, ballType: CaptureBall): number {
    const def = getMonsterDefinition(monster.id);
    if (!def) return 0;

    const baseRate = def.catchRate;
    const hpPercent = (monster.currentHp / monster.maxHp) * 100;
    const itemMultiplier = BALL_MULTIPLIERS[ballType];

    let chance = baseRate * (1 - hpPercent / 100) * itemMultiplier;
    
    // Master Ball always succeeds
    if (ballType === CaptureBall.MasterBall) {
      return 1.0;
    }

    // Minimum 5% chance
    return Math.max(0.05, Math.min(0.95, chance));
  }

  /**
   * Get the ball name.
   */
  static getBallName(ballType: CaptureBall): string {
    return BALL_NAMES[ballType];
  }

  /**
   * Initiate a capture attempt.
   * Returns the initial capture chance - actual result is delivered via callback.
   */
  initiateCapture(
    monster: MonsterInstance,
    ballType: CaptureBall,
    callback: CaptureCallback
  ): number {
    const chance = CaptureSystem.calculateCaptureChance(monster, ballType);
    
    this.pendingCapture = { monster, ballType, callback };
    
    // Animate shake sequence, then resolve
    this.animateCaptureSequence(chance, callback);
    
    return chance;
  }

  /**
   * Animate the capture ball shake sequence.
   * Each wobble happens with decreasing probability based on capture chance.
   */
  private animateCaptureSequence(chance: number, callback: CaptureCallback): void {
    // If no pending capture, report failure
    if (!this.pendingCapture || !this.pendingCapture.monster) {
      callback({ success: false, wobbles: 0, escaped: true, monster: this.pendingCapture?.monster! });
      return;
    }

    const monster = this.pendingCapture.monster;
    
    // Simulate wobble sequence
    // Higher capture chance = more wobbles before escaping
    let wobbles = 0;
    let success = Math.random() < chance;

    // Calculate wobble thresholds based on chance
    // Each wobble has decreasing probability
    const thresholds = [
      0.5 + (chance * 0.3), // First wobble
      0.3 + (chance * 0.3), // Second wobble
      0.1 + (chance * 0.3)  // Third wobble
    ];

    if (Math.random() < thresholds[0]) {
      wobbles++;
      if (Math.random() < thresholds[1]) {
        wobbles++;
        if (Math.random() < thresholds[2]) {
          wobbles++;
        }
      }
    }

    // If we got 3 wobbles, check for success
    if (wobbles === 3) {
      success = Math.random() < chance * 2; // Better odds with more wobbles
    }

    // Add slight delay for dramatic effect
    setTimeout(() => {
      const result: CaptureResult = {
        success,
        wobbles,
        escaped: !success,
        monster
      };
      
      callback(result);
      this.pendingCapture = null;
    }, 1000 + wobbles * 400); // 1-2.2 seconds for animation
  }

  /**
   * Get pending capture monster.
   */
  getPendingMonster(): MonsterInstance | null {
    return this.pendingCapture?.monster ?? null;
  }

  /**
   * Cancel pending capture.
   */
  cancelCapture(): void {
    this.pendingCapture = null;
  }
}