/**
 * Settings Scene
 * 
 * Game settings and options.
 */

import { MakkoEngine } from '@makko/engine';
import { BaseScene } from '../scene/base-scene';
import { Button } from '../ui/ui-elements';
import type { Game } from '../game/game';

export class SettingsScene extends BaseScene {
  readonly id = 'settings';

  private game: Game;
  private backButton: Button;
  private resetButton: Button;

  constructor(game: Game) {
    super();
    this.game = game;
    
    this.backButton = new Button(20, 20, 120, 45, '← Back', { variant: 'ghost' });
    this.backButton.onClick = () => this.game.switchScene('menu');
    
    this.resetButton = new Button(0, 0, 200, 50, '🗑️ Reset Game', { variant: 'danger' });
    this.resetButton.onClick = () => this.resetGame();
  }

  init(): void {}

  enter(_previousScene?: string): void {}

  private resetGame(): void {
    // Reset all save data
    this.game.getPartySystem().deleteSave();
    this.game.getEconomySystem().deleteSave();
    
    // Reinitialize
    this.game.getPartySystem().initWithStarter('flamepup');
    this.game.getPartySystem().save();
    
    this.game.getEconomySystem().reset();
    this.game.getEconomySystem().addItem('monster_ball', 5);
    this.game.getEconomySystem().save();
    
    console.log('Game reset!');
  }

  handleInput(): void {
    this.backButton.update(0);
    this.resetButton.update(0);
    
    if (this.backButton.isClicked()) {
      this.backButton.onClick?.();
    }
    if (this.resetButton.isClicked()) {
      this.resetButton.onClick?.();
    }
  }

  update(dt: number): void {
    this.backButton.update(dt);
    this.resetButton.update(dt);
  }

  render(): void {
    const display = MakkoEngine.display;
    const centerX = display.width / 2;
    
    // Draw background
    display.clear('#1a1a2e');
    
    // Draw header
    display.drawRect(0, 0, display.width, 100, { fill: '#16213e' });
    display.drawRect(0, 98, display.width, 4, { fill: '#e94560' });
    
    display.drawText('⚙️ Settings', 30, 40, {
      font: 'bold 36px system-ui', fill: '#ffffff'
    });

    // Settings panel
    const panelX = centerX - 250;
    const panelY = 150;
    const panelWidth = 500;
    const panelHeight = 400;
    
    display.drawRoundRect(panelX, panelY, panelWidth, panelHeight, 16, {
      fill: '#16213e',
      stroke: '#3b82f6',
      lineWidth: 2
    });

    // Sound settings (placeholder)
    display.drawText('🔊 Sound', panelX + 30, panelY + 40, {
      font: 'bold 24px system-ui', fill: '#ffffff'
    });
    
    display.drawText('Music: On', panelX + 50, panelY + 80, {
      font: '18px system-ui', fill: '#888888'
    });
    
    display.drawText('SFX: On', panelX + 50, panelY + 110, {
      font: '18px system-ui', fill: '#888888'
    });

    // Display settings (placeholder)
    display.drawText('🖥️ Display', panelX + 30, panelY + 170, {
      font: 'bold 24px system-ui', fill: '#ffffff'
    });
    
    display.drawText('Canvas Size: 800×600', panelX + 50, panelY + 210, {
      font: '18px system-ui', fill: '#888888'
    });
    
    display.drawText('Touch Controls: Enabled', panelX + 50, panelY + 240, {
      font: '18px system-ui', fill: '#888888'
    });

    // Data section
    display.drawText('💾 Save Data', panelX + 30, panelY + 300, {
      font: 'bold 24px system-ui', fill: '#ffffff'
    });
    
    const party = this.game.getPartySystem();
    const economy = this.game.getEconomySystem();
    
    display.drawText(`Party: ${party.getParty().length} monsters`, panelX + 50, panelY + 340, {
      font: '18px system-ui', fill: '#888888'
    });
    
    display.drawText(`Gold: ${economy.getGold()} | Gems: ${economy.getGems()}`, panelX + 50, panelY + 370, {
      font: '18px system-ui', fill: '#888888'
    });

    // Position reset button
    this.resetButton.x = centerX - 100;
    this.resetButton.y = panelY + panelHeight + 30;
    this.resetButton.render();

    // Render buttons
    this.backButton.render();
  }
}