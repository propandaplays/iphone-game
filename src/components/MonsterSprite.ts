/**
 * Monster Sprite Component
 * 
 * Canvas-drawn monster sprites using geometric shapes.
 */

import { MakkoEngine } from '@makko/engine';
import type { MonsterInstance } from '../systems/MonsterSystem';
import { getMonsterDefinition } from '../data/monsters';
import type { MonsterSpriteConfig } from '../data/monsters';

export interface SpriteOptions {
  x: number;
  y: number;
  scale?: number;
  facingRight?: boolean;
  isEnemy?: boolean;
}

export class MonsterSprite {
  private monster: MonsterInstance;
  private x: number;
  private y: number;
  private scale: number;
  private facingRight: boolean;
  private isEnemy: boolean;
  
  // Animation
  private bounceTime: number = 0;
  private flashTime: number = 0;
  private flashColor: string = 'rgba(255, 255, 255, 0.8)';
  
  // Sprite config cache
  private spriteConfig: MonsterSpriteConfig | null = null;

  constructor(monster: MonsterInstance, options: SpriteOptions) {
    this.monster = monster;
    this.x = options.x;
    this.y = options.y;
    this.scale = options.scale ?? 1;
    this.facingRight = options.facingRight ?? true;
    this.isEnemy = options.isEnemy ?? false;
    
    // Cache sprite config
    const def = getMonsterDefinition(monster.id);
    this.spriteConfig = def?.sprite ?? null;
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  setFlash(duration: number = 100): void {
    this.flashTime = duration;
    this.flashColor = 'rgba(255, 255, 255, 0.8)';
  }

  update(dt: number): void {
    this.bounceTime += dt / 1000;
    if (this.flashTime > 0) {
      this.flashTime -= dt;
    }
  }

  render(): void {
    const display = MakkoEngine.display;
    const bounce = Math.sin(this.bounceTime * 4) * 5 * this.scale;
    const baseY = this.y + bounce;
    
    if (!this.spriteConfig) {
      // Fallback: simple circle
      display.drawCircle(this.x, baseY, 40 * this.scale, {
        fill: '#888888'
      });
      return;
    }

    const config = this.spriteConfig;
    const bodyRadius = 35 * this.scale;
    
    // Draw shadow
    display.drawEllipse(this.x, this.y + 40 * this.scale, bodyRadius * 0.8, 10 * this.scale, {
      fill: 'rgba(0, 0, 0, 0.3)'
    });

    // Draw based on body shape
    if (config.bodyShape === 'circle') {
      display.drawCircle(this.x, baseY, bodyRadius, { fill: config.bodyColor });
    } else if (config.bodyShape === 'oval') {
      display.drawEllipse(this.x, baseY, bodyRadius * 0.7, bodyRadius, { fill: config.bodyColor });
    } else {
      // blob - irregular shape
      this.drawBlob(this.x, baseY, bodyRadius, config.bodyColor);
    }

    // Draw type-specific features
    if (config.hasFlame) {
      this.drawFlame(baseY, bodyRadius);
    }
    if (config.hasSpark) {
      this.drawSparks(baseY, bodyRadius);
    }
    if (config.hasLeaf) {
      this.drawLeaf(baseY, bodyRadius);
    }
    if (config.hasSlime) {
      this.drawSlime(baseY, bodyRadius, config.bodyColor);
    }
    if (config.isFluffy) {
      this.drawFluff(baseY, bodyRadius, config.bodyColor);
    }

    // Draw eyes
    this.drawEyes(baseY, bodyRadius);

    // Draw flash overlay
    if (this.flashTime > 0) {
      const alpha = this.flashTime / 100;
      display.drawCircle(this.x, baseY, bodyRadius + 5 * this.scale, {
        fill: `rgba(255, 255, 255, ${alpha * 0.5})`
      });
    }
  }

  private drawBlob(x: number, y: number, radius: number, color: string): void {
    const display = MakkoEngine.display;
    // Draw a slightly irregular blob shape
    display.drawCircle(x, y, radius, { fill: color });
    display.drawCircle(x - radius * 0.3, y - radius * 0.2, radius * 0.6, { fill: color });
    display.drawCircle(x + radius * 0.3, y + radius * 0.2, radius * 0.7, { fill: color });
  }

  private drawFlame(baseY: number, bodyRadius: number): void {
    const display = MakkoEngine.display;
    const flameY = baseY - bodyRadius - 5 * this.scale;
    
    // Flame tail on top
    display.drawArc(flameY, baseY - bodyRadius, 15 * this.scale, -Math.PI * 0.8, -Math.PI * 0.2, {
      stroke: '#ff4500',
      lineWidth: 8 * this.scale
    });
    display.drawArc(flameY + 10, baseY - bodyRadius - 5, 10 * this.scale, -Math.PI * 0.7, -Math.PI * 0.3, {
      stroke: '#ffcc00',
      lineWidth: 5 * this.scale
    });
  }

  private drawSparks(baseY: number, bodyRadius: number): void {
    const display = MakkoEngine.display;
    const sparkY = baseY - bodyRadius - 10 * this.scale;
    
    // Electric sparks
    for (let i = 0; i < 3; i++) {
      const angle = -Math.PI / 2 + (i - 1) * 0.5;
      const sx = this.x + Math.cos(angle) * 25 * this.scale;
      const sy = sparkY + Math.sin(angle) * 15 * this.scale;
      
      display.drawLine(
        this.x, sparkY,
        sx, sy,
        { stroke: '#ffcc00', lineWidth: 3 * this.scale }
      );
    }
  }

  private drawLeaf(baseY: number, bodyRadius: number): void {
    const display = MakkoEngine.display;
    const leafY = baseY - bodyRadius - 5 * this.scale;
    
    // Leaf on top
    display.drawEllipse(this.x, leafY, 12 * this.scale, 20 * this.scale, {
      fill: '#228b22'
    });
    // Leaf vein
    display.drawLine(
      this.x, leafY - 15 * this.scale,
      this.x, leafY + 15 * this.scale,
      { stroke: '#1a6b1a', lineWidth: 2 * this.scale }
    );
  }

  private drawSlime(baseY: number, bodyRadius: number, bodyColor: string): void {
    const display = MakkoEngine.display;
    
    // Slime drips
    const darkerColor = this.darkenColor(bodyColor, 20);
    display.drawEllipse(this.x - bodyRadius * 0.5, baseY + bodyRadius * 0.8, 8 * this.scale, 12 * this.scale, {
      fill: darkerColor
    });
    display.drawEllipse(this.x + bodyRadius * 0.4, baseY + bodyRadius * 0.9, 6 * this.scale, 10 * this.scale, {
      fill: darkerColor
    });
  }

  private drawFluff(baseY: number, bodyRadius: number, bodyColor: string): void {
    const display = MakkoEngine.display;
    
    // Fluffy cloud puffs
    const lighterColor = this.lightenColor(bodyColor, 30);
    for (let i = 0; i < 5; i++) {
      const angle = (i - 2) * 0.4;
      const px = this.x + Math.cos(angle) * bodyRadius * 0.9;
      const py = baseY - bodyRadius * 0.3 + Math.sin(i) * 5;
      display.drawCircle(px, py, 15 * this.scale, { fill: lighterColor });
    }
  }

  private drawEyes(baseY: number, bodyRadius: number): void {
    const display = MakkoEngine.display;
    const eyeY = baseY - bodyRadius * 0.15;
    const eyeSpacing = bodyRadius * 0.4;
    
    if (this.spriteConfig?.eyeStyle === 'angry') {
      // Angry eyes - angled brows
      display.drawCircle(this.x - eyeSpacing, eyeY, 8 * this.scale, { fill: '#ffffff' });
      display.drawCircle(this.x + eyeSpacing, eyeY, 8 * this.scale, { fill: '#ffffff' });
      display.drawCircle(this.x - eyeSpacing, eyeY + 2, 4 * this.scale, { fill: '#000000' });
      display.drawCircle(this.x + eyeSpacing, eyeY + 2, 4 * this.scale, { fill: '#000000' });
      
      // Angry eyebrows
      display.drawLine(
        this.x - eyeSpacing - 10, eyeY - 12,
        this.x - eyeSpacing + 5, eyeY - 8,
        { stroke: '#000000', lineWidth: 3 * this.scale }
      );
      display.drawLine(
        this.x + eyeSpacing + 10, eyeY - 12,
        this.x + eyeSpacing - 5, eyeY - 8,
        { stroke: '#000000', lineWidth: 3 * this.scale }
      );
    } else if (this.spriteConfig?.eyeStyle === 'cute') {
      // Cute eyes - big and sparkly
      display.drawCircle(this.x - eyeSpacing, eyeY, 10 * this.scale, { fill: '#ffffff' });
      display.drawCircle(this.x + eyeSpacing, eyeY, 10 * this.scale, { fill: '#ffffff' });
      display.drawCircle(this.x - eyeSpacing, eyeY + 2, 5 * this.scale, { fill: '#333333' });
      display.drawCircle(this.x + eyeSpacing, eyeY + 2, 5 * this.scale, { fill: '#333333' });
      
      // Sparkle highlights
      display.drawCircle(this.x - eyeSpacing - 2, eyeY - 2, 2 * this.scale, { fill: '#ffffff' });
      display.drawCircle(this.x + eyeSpacing - 2, eyeY - 2, 2 * this.scale, { fill: '#ffffff' });
    } else {
      // Round eyes - default
      display.drawCircle(this.x - eyeSpacing, eyeY, 8 * this.scale, { fill: '#ffffff' });
      display.drawCircle(this.x + eyeSpacing, eyeY, 8 * this.scale, { fill: '#ffffff' });
      display.drawCircle(this.x - eyeSpacing, eyeY + 1, 4 * this.scale, { fill: '#000000' });
      display.drawCircle(this.x + eyeSpacing, eyeY + 1, 4 * this.scale, { fill: '#000000' });
    }
  }

  private darkenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  }

  private lightenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  }
}