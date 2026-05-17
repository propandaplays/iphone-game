/**
 * PvP Arena Scene
 * 
 * PvP matchmaking and battles.
 */

import { MakkoEngine } from '@makko/engine';
import { BaseScene } from '../scene/base-scene';
import { Button } from '../ui/ui-elements';
import type { Game } from '../game/game';

export class PvPArenaScene extends BaseScene {
  readonly id = 'pvp';

  private game: Game;
  private backButton: Button;
  private matchButton: Button;
  
  // State
  private isSearching: boolean = false;
  private searchTime: number = 0;
  private matchFound: boolean = false;

  constructor(game: Game) {
    super();
    this.game = game;
    
    this.backButton = new Button(20, 20, 120, 45, '← Back', { variant: 'ghost' });
    this.backButton.onClick = () => this.game.switchScene('menu');
    
    this.matchButton = new Button(0, 0, 250, 70, '⚔️ Find Match', { variant: 'primary' });
    this.matchButton.onClick = () => this.startMatchmaking();
  }

  init(): void {
    this.isSearching = false;
    this.searchTime = 0;
    this.matchFound = false;
  }

  enter(_previousScene?: string): void {
    this.init();
  }

  private startMatchmaking(): void {
    if (this.isSearching) return;
    
    const party = this.game.getPartySystem().getParty();
    if (party.length === 0 || !this.game.getPartySystem().hasAliveMembers()) {
      console.log('No monsters to battle with!');
      return;
    }

    this.isSearching = true;
    this.searchTime = 0;
  }

  private cancelMatchmaking(): void {
    this.isSearching = false;
    this.searchTime = 0;
  }

  private matchFoundAndStart(): void {
    this.isSearching = false;
    this.matchFound = true;
    
    // Start PvP battle
    setTimeout(() => {
      this.game.switchScene('battle');
    }, 500);
  }

  handleInput(): void {
    this.backButton.update(0);
    this.matchButton.update(0);
    
    if (this.backButton.isClicked()) {
      if (this.isSearching) {
        this.cancelMatchmaking();
      } else {
        this.backButton.onClick?.();
      }
    }
    
    if (this.matchButton.isClicked()) {
      this.matchButton.onClick?.();
    }
  }

  update(dt: number): void {
    this.backButton.update(dt);
    this.matchButton.update(dt);
    
    if (this.isSearching) {
      this.searchTime += dt / 1000;
      
      // Simulate matchmaking (2-3 seconds)
      if (this.searchTime >= 2 + Math.random() * 1) {
        this.matchFoundAndStart();
      }
    }
  }

  render(): void {
    const display = MakkoEngine.display;
    const centerX = display.width / 2;
    const centerY = display.height / 2;
    
    // Draw background
    display.clear('#1a1a2e');
    
    // Draw arena decoration
    display.drawRect(0, 0, display.width, display.height, { fill: '#1a1a2e' });
    
    // Draw arena circle
    display.drawCircle(centerX, centerY + 50, 200, {
      fill: 'transparent',
      stroke: '#e94560',
      lineWidth: 4
    });
    display.drawCircle(centerX, centerY + 50, 180, {
      fill: 'transparent',
      stroke: '#3b82f6',
      lineWidth: 2
    });

    // Draw header
    display.drawRect(0, 0, display.width, 100, { fill: '#16213e' });
    display.drawRect(0, 98, display.width, 4, { fill: '#e94560' });
    
    display.drawText('⚔️ PvP Arena', 30, 40, {
      font: 'bold 36px system-ui', fill: '#ffffff'
    });
    
    // Draw player info
    const economy = this.game.getEconomySystem();
    display.drawText(`💎 ${economy.getGems()}`, display.width - 120, 40, {
      font: '24px system-ui', fill: '#e94560'
    });
    
    // Draw rank badge
    display.drawText('🏆 Bronze', display.width / 2 - 50, 40, {
      font: '20px system-ui', fill: '#cd7f32'
    });

    // Draw matchmaking UI
    if (this.isSearching) {
      this.renderMatchmaking();
    } else if (this.matchFound) {
      this.renderMatchFound();
    } else {
      this.renderMainUI();
    }

    // Render buttons
    this.backButton.render();
    
    if (!this.isSearching && !this.matchFound) {
      this.matchButton.x = centerX - 125;
      this.matchButton.y = centerY + 100;
      this.matchButton.render();
    }
  }

  private renderMainUI(): void {
    const display = MakkoEngine.display;
    const centerX = display.width / 2;
    
    // Instructions
    display.drawText('Test your team against other tamers!', centerX - 200, display.height / 2 - 50, {
      font: '24px system-ui', fill: '#888888'
    });
    
    // Rewards info
    display.drawRoundRect(centerX - 200, display.height / 2 + 180, 400, 120, 12, {
      fill: '#16213e',
      stroke: '#3b82f6',
      lineWidth: 2
    });
    
    display.drawText('🏆 Battle Rewards', centerX - 80, display.height / 2 + 195, {
      font: 'bold 20px system-ui', fill: '#ffffff'
    });
    
    display.drawText('Win: 50 💎 + Gold', centerX - 70, display.height / 2 + 240, {
      font: '18px system-ui', fill: '#22c55e'
    });
    
    display.drawText('Lose: 10 💎 consolation', centerX - 80, display.height / 2 + 265, {
      font: '16px system-ui', fill: '#888888'
    });
    
    // Team preview
    const party = this.game.getPartySystem().getParty();
    display.drawText('Your Team:', 50, 150, {
      font: 'bold 20px system-ui', fill: '#888888'
    });
    
    party.forEach((monster, i) => {
      display.drawText(`• ${monster.id} Lv${monster.level}`, 50, 180 + i * 30, {
        font: '16px system-ui', fill: '#ffffff'
      });
    });
  }

  private renderMatchmaking(): void {
    const display = MakkoEngine.display;
    const centerX = display.width / 2;
    const centerY = display.height / 2;
    
    // Searching animation
    const spinAngle = (this.searchTime * 2) % (Math.PI * 2);
    
    display.drawArc(centerX, centerY, 80, spinAngle, spinAngle + Math.PI * 1.5, {
      stroke: '#e94560',
      lineWidth: 6
    });
    
    display.drawText('🔍 Searching for opponent...', centerX - 150, centerY + 120, {
      font: '24px system-ui', fill: '#ffffff'
    });
    
    display.drawText(`${Math.floor(this.searchTime)}s`, centerX - 20, centerY + 160, {
      font: '18px system-ui', fill: '#888888'
    });
    
    // Cancel button
    const cancelBtn = new Button(centerX - 80, centerY + 200, 160, 50, 'Cancel', { variant: 'ghost' });
    cancelBtn.update(0);
    if (cancelBtn.isClicked()) {
      this.cancelMatchmaking();
    }
    cancelBtn.render();
  }

  private renderMatchFound(): void {
    const display = MakkoEngine.display;
    const centerX = display.width / 2;
    const centerY = display.height / 2;
    
    display.drawText('⚔️ Match Found!', centerX - 100, centerY, {
      font: 'bold 36px system-ui', fill: '#22c55e'
    });
    
    display.drawText('Preparing battle...', centerX - 80, centerY + 50, {
      font: '20px system-ui', fill: '#888888'
    });
  }
}