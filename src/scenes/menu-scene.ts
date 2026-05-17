/**
 * Menu Scene
 * 
 * Main menu with navigation to all game modes.
 * Play, PvP, Shop, Party, Settings
 */

import { MakkoEngine } from '@makko/engine';
import { BaseScene } from '../scene/base-scene';
import { Button } from '../ui/ui-elements';
import type { Game } from '../game/game';

export class MenuScene extends BaseScene {
  readonly id = 'menu';

  private game: Game;
  private buttons: Button[] = [];
  private titleY: number = 0;

  constructor(game: Game) {
    super();
    this.game = game;
  }

  init(): void {
    this.buttons = [];
  }

  enter(_previousScene?: string): void {
    this.createButtons();
  }

  exit(_nextScene?: string): void {
    this.buttons = [];
  }

  private createButtons(): void {
    const display = MakkoEngine.display;
    const centerX = display.width / 2;
    
    this.titleY = display.height * 0.22;
    const startY = display.height * 0.38;
    const spacing = 85;
    const buttonWidth = 320;
    const buttonHeight = 65;

    const menuItems = [
      { label: '🌍  Explore', scene: 'world' },
      { label: '⚔️  PvP Arena', scene: 'pvp' },
      { label: '🛒  Shop', scene: 'shop' },
      { label: '🐾  Party', scene: 'party' },
      { label: '⚙️  Settings', scene: 'settings' }
    ];

    menuItems.forEach((item, index) => {
      const y = startY + index * spacing;
      const btn = new Button(
        centerX - buttonWidth / 2,
        y,
        buttonWidth,
        buttonHeight,
        item.label,
        { variant: 'primary' }
      );
      btn.onClick = () => {
        this.game.switchScene(item.scene);
      };
      this.buttons.push(btn);
    });
  }

  handleInput(): void {
    // Update and check buttons for clicks
    for (const btn of this.buttons) {
      btn.update(0);
      if (btn.isClicked()) {
        btn.onClick?.();
      }
    }
  }

  update(dt: number): void {
    for (const btn of this.buttons) {
      btn.update(dt);
    }
  }

  render(): void {
    const display = MakkoEngine.display;
    const centerX = display.width / 2;

    // Draw background
    display.clear('#1a1a2e');

    // Draw header panel
    display.drawRect(0, 0, display.width, 220, {
      fill: '#16213e'
    });

    // Draw accent line
    display.drawRect(0, 218, display.width, 4, {
      fill: '#e94560'
    });

    // Draw title
    const titleFont = 'bold 56px system-ui, sans-serif';
    const title = 'Monster Tamer';
    const titleMetrics = display.measureText(title, { font: titleFont });
    display.drawText(title, centerX - titleMetrics.width / 2, this.titleY, {
      font: titleFont,
      fill: '#e94560',
      align: 'center'
    });

    // Draw subtitle
    const subFont = '20px system-ui, sans-serif';
    const subtitle = 'Build your team. Catch them all!';
    const subMetrics = display.measureText(subtitle, { font: subFont });
    display.drawText(subtitle, centerX - subMetrics.width / 2, this.titleY + 70, {
      font: subFont,
      fill: '#888888',
      align: 'center'
    });

    // Draw buttons
    for (const btn of this.buttons) {
      btn.render();
    }

    // Draw version
    const footerFont = '14px system-ui, sans-serif';
    const version = 'v1.0';
    const versionMetrics = display.measureText(version, { font: footerFont });
    display.drawText(version, centerX - versionMetrics.width / 2, display.height - 40, {
      font: footerFont,
      fill: '#444444',
      align: 'center'
    });
  }
}