/**
 * Start Scene
 * 
 * Title screen with main menu entry.
 */

import { MakkoEngine } from '@makko/engine';
import { BaseScene } from '../scene/base-scene';
import { Button } from '../ui/ui-elements';
import type { Game } from '../game/game';

/**
 * Title screen scene with start button.
 */
export class StartScene extends BaseScene {
  readonly id = 'start';

  private game: Game;
  private startButton: Button;
  private titleY: number = 0;

  constructor(game: Game) {
    super();
    this.game = game;
    
    this.startButton = new Button(0, 0, 250, 70, '▶ Start Game', { variant: 'primary' });
    this.startButton.onClick = () => this.game.switchScene('menu');
  }

  init(): void {}

  enter(_previousScene?: string): void {
    this.startButton.onClick = () => this.game.switchScene('menu');
  }

  handleInput(): void {
    this.startButton.update(0);
    if (this.startButton.isClicked()) {
      this.startButton.onClick?.();
    }
    
    // Also allow Enter/Space to start
    if (MakkoEngine.input.isKeyPressed('Enter') || MakkoEngine.input.isKeyPressed('Space')) {
      this.game.switchScene('menu');
    }
  }

  update(dt: number): void {
    this.startButton.update(dt);
  }

  render(): void {
    const display = MakkoEngine.display;
    const centerX = display.width / 2;
    this.titleY = display.height * 0.3;

    // Draw background
    display.clear('#1a1a2e');

    // Draw decorative background elements
    display.drawCircle(centerX, this.titleY + 80, 250, {
      fill: '#16213e',
      stroke: '#e94560',
      lineWidth: 3
    });
    display.drawCircle(centerX, this.titleY + 80, 220, {
      fill: 'transparent',
      stroke: '#3b82f6',
      lineWidth: 2
    });

    // Draw title
    const titleFont = 'bold 72px system-ui, sans-serif';
    const title = 'Monster Tamer';
    const titleMetrics = display.measureText(title, { font: titleFont });
    display.drawText(title, centerX - titleMetrics.width / 2, this.titleY, {
      font: titleFont,
      fill: '#e94560',
      align: 'center'
    });

    // Draw subtitle
    const subtitleFont = '24px system-ui, sans-serif';
    const subtitle = 'Build your team. Catch them all!';
    const subtitleMetrics = display.measureText(subtitle, { font: subtitleFont });
    display.drawText(subtitle, centerX - subtitleMetrics.width / 2, this.titleY + 60, {
      font: subtitleFont,
      fill: '#888888',
      align: 'center'
    });

    // Draw monster icons
    const iconY = this.titleY + 150;
    const icons = ['🔥', '💧', '🌿', '⚡', '🐾'];
    icons.forEach((icon, i) => {
      const x = centerX - 100 + i * 50;
      display.drawText(icon, x - 15, iconY, {
        font: '32px system-ui',
        fill: '#ffffff'
      });
    });

    // Draw start button
    this.startButton.x = centerX - 125;
    this.startButton.y = display.height * 0.65;
    this.startButton.render();

    // Draw footer hint
    const hintFont = '16px system-ui, sans-serif';
    const hint = 'Press ENTER or tap to start';
    const hintMetrics = display.measureText(hint, { font: hintFont });
    display.drawText(hint, centerX - hintMetrics.width / 2, display.height - 60, {
      font: hintFont,
      fill: '#555555',
      align: 'center'
    });
  }
}