/**
 * World Scene
 * 
 * Simple tap-to-walk exploration with random encounters.
 */

import { MakkoEngine } from '@makko/engine';
import { BaseScene } from '../scene/base-scene';
import { Button } from '../ui/ui-elements';
import { MonsterSystem } from '../systems/MonsterSystem';
import { getAllBaseMonsters } from '../data/monsters';
import type { Game } from '../game/game';

export class WorldScene extends BaseScene {
  readonly id = 'world';

  private game: Game;
  private backButton: Button;
  
  // Player position
  private playerX: number = 0;
  private playerY: number = 0;
  private stepCount: number = 0;
  private encounterThreshold: number = 8;
  
  // Animation
  private playerBounce: number = 0;
  private idleTime: number = 0;

  constructor(game: Game) {
    super();
    this.game = game;
    
    this.backButton = new Button(20, 20, 120, 45, '← Back', { variant: 'ghost' });
    this.backButton.onClick = () => this.game.switchScene('menu');
  }

  init(): void {
    // Reset player position
    const display = MakkoEngine.display;
    this.playerX = display.width / 2;
    this.playerY = display.height / 2 + 50;
    this.stepCount = 0;
    this.idleTime = 0;
  }

  enter(_previousScene?: string): void {
    this.init();
  }

  handleInput(): void {
    this.backButton.update(0);
    if (this.backButton.isClicked()) {
      this.backButton.onClick?.();
      return;
    }

    // Check for tap to move (mouse click)
    const input = MakkoEngine.input;
    
    if (input.isKeyPressed('Space') && input.mouseX > 0 && input.mouseY > 0) {
      this.handleTap(input.mouseX, input.mouseY);
    }
  }

  private handleTap(x: number, y: number): void {
    // Don't process if clicking back button
    if (this.backButton.isPointInside(x, y)) return;
    
    // Move towards tap position (click-based movement - intentionally not framerate dependent)
    const dx = x - this.playerX;
    const dy = y - this.playerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 30) {
      // game-analysis-disable-next-line: movement-without-dt
      // Click-based movement: fixed step per click for responsive feel (not continuous)
      this.playerX += (dx / dist) * 40;
      this.playerY += (dy / dist) * 40;
      
      // Keep within bounds
      const display = MakkoEngine.display;
      this.playerX = Math.max(100, Math.min(display.width - 100, this.playerX));
      this.playerY = Math.max(150, Math.min(display.height - 100, this.playerY));
      
      // Count steps
      this.stepCount++;
      
      // Check for encounter
      if (this.stepCount >= this.encounterThreshold) {
        this.triggerEncounter();
      }
    }
  }

  private triggerEncounter(): void {
    this.stepCount = 0;
    
    // Select random wild monster
    const baseMonsters = getAllBaseMonsters();
    const randomIndex = Math.floor(Math.random() * baseMonsters.length);
    const wildMonsterDef = baseMonsters[randomIndex];
    
    // Create wild monster at random level (5-10)
    const wildLevel = 5 + Math.floor(Math.random() * 6);
    const wildMonster = MonsterSystem.createMonster(wildMonsterDef.id, wildLevel);
    
    if (wildMonster) {
      // Get player party
      const playerParty = this.game.getPartySystem().getParty();
      
      if (playerParty.length > 0 && playerParty.some(m => m.currentHp > 0)) {
        // Store wild monster info for battle scene
        this.game.setPendingWildEncounter(wildMonster);
        this.game.switchScene('battle');
      }
    }
  }

  update(dt: number): void {
    this.backButton.update(dt);
    
    // Player idle animation
    this.idleTime += dt / 1000;
    this.playerBounce = Math.sin(this.idleTime * 3) * 3;
  }

  render(): void {
    const display = MakkoEngine.display;
    
    // Draw background
    display.clear('#1a1a2e');
    
    // Draw grass pattern
    for (let gx = 0; gx < display.width; gx += 60) {
      for (let gy = 100; gy < display.height; gy += 60) {
        const shade = (Math.floor(gx / 60) + Math.floor(gy / 60)) % 2 === 0 ? '#1e3a1e' : '#1a321a';
        display.drawRect(gx, gy, 60, 60, { fill: shade });
      }
    }
    
    // Draw path hints
    display.drawCircle(this.playerX, this.playerY + 150, 20, { fill: '#2d4a2d' });
    display.drawCircle(this.playerX, this.playerY - 100, 20, { fill: '#2d4a2d' });
    display.drawCircle(this.playerX - 100, this.playerY, 20, { fill: '#2d4a2d' });
    display.drawCircle(this.playerX + 100, this.playerY, 20, { fill: '#2d4a2d' });
    
    // Draw player character (simple circle with bounce)
    const bounceOffset = this.playerBounce;
    display.drawCircle(this.playerX, this.playerY + bounceOffset, 30, { fill: '#e94560' });
    display.drawCircle(this.playerX - 8, this.playerY - 8 + bounceOffset, 6, { fill: '#ffffff' });
    display.drawCircle(this.playerX + 8, this.playerY - 8 + bounceOffset, 6, { fill: '#ffffff' });
    
    // Draw direction indicator
    display.drawText('↑', this.playerX - 10, this.playerY - 60 + bounceOffset, {
      font: '24px system-ui',
      fill: '#e94560'
    });
    
    // Draw step counter
    const stepFont = '18px system-ui';
    const stepsText = `Steps: ${this.stepCount}/${this.encounterThreshold}`;
    const stepsMetrics = display.measureText(stepsText, { font: stepFont });
    display.drawText(stepsText, display.width / 2 - stepsMetrics.width / 2, 50, {
      font: stepFont,
      fill: '#888888'
    });
    
    // Draw hint
    display.drawText('Click to move • Random encounters!', display.width / 2 - 150, display.height - 30, {
      font: '16px system-ui',
      fill: '#555555'
    });
    
    // Draw back button
    this.backButton.render();
  }
}