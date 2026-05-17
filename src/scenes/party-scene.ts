/**
 * Party Scene
 * 
 * Monster party management - view stats, moves, manage team.
 */

import { MakkoEngine } from '@makko/engine';
import { BaseScene } from '../scene/base-scene';
import { Button } from '../ui/ui-elements';
import { getMonsterDefinition } from '../data/monsters';
import { getMoveDefinition } from '../data/moves';
import type { Game } from '../game/game';
import type { MonsterInstance } from '../systems/MonsterSystem';

export class PartyScene extends BaseScene {
  readonly id = 'party';

  private game: Game;
  private backButton: Button;
  private healButton: Button;
  
  // State
  private selectedMonster: MonsterInstance | null = null;
  private viewMode: 'party' | 'box' | 'detail' = 'party';
  private detailBackButton: Button | null = null;

  constructor(game: Game) {
    super();
    this.game = game;
    
    this.backButton = new Button(20, 20, 120, 45, '← Back', { variant: 'ghost' });
    this.backButton.onClick = () => this.game.switchScene('menu');
    
    this.healButton = new Button(MakkoEngine.display.width - 170, 20, 150, 45, '💚 Heal All', { variant: 'primary' });
    this.healButton.onClick = () => this.healParty();
  }

  init(): void {
    this.selectedMonster = null;
    this.viewMode = 'party';
    this.detailBackButton = new Button(20, 20, 150, 45, '← Back to Party', { variant: 'ghost' });
    this.detailBackButton.onClick = () => {
      this.viewMode = 'party';
      this.selectedMonster = null;
    };
  }

  enter(_previousScene?: string): void {
    this.init();
  }

  private healParty(): void {
    this.game.getPartySystem().healAll();
    this.game.getPartySystem().save();
  }

  handleInput(): void {
    this.backButton.update(0);
    this.healButton.update(0);
    this.detailBackButton?.update(0);
    
    if (this.backButton.isClicked()) {
      this.backButton.onClick?.();
    }
    if (this.healButton.isClicked()) {
      this.healButton.onClick?.();
    }
    if (this.detailBackButton?.isClicked()) {
      this.detailBackButton.onClick?.();
    }
  }

  update(dt: number): void {
    this.backButton.update(dt);
    this.healButton.update(dt);
  }

  render(): void {
    const display = MakkoEngine.display;
    
    // Draw background
    display.clear('#1a1a2e');
    
    // Draw header
    display.drawRect(0, 0, display.width, 100, { fill: '#16213e' });
    display.drawRect(0, 98, display.width, 4, { fill: '#e94560' });
    
    // Draw title
    const titleFont = 'bold 36px system-ui';
    display.drawText('Party', 30, 35, { font: titleFont, fill: '#ffffff' });
    
    // Draw gold/gems
    const economy = this.game.getEconomySystem();
    display.drawText(`💰 ${economy.getGold()}`, display.width - 350, 35, {
      font: '18px system-ui', fill: '#ffc947'
    });
    display.drawText(`💎 ${economy.getGems()}`, display.width - 200, 35, {
      font: '18px system-ui', fill: '#e94560'
    });

    // Render party or detail view
    if (this.viewMode === 'detail' && this.selectedMonster) {
      this.renderMonsterDetail(this.selectedMonster);
    } else {
      this.renderPartyList();
    }

    // Render buttons
    this.backButton.render();
    this.healButton.render();
  }

  private renderPartyList(): void {
    const display = MakkoEngine.display;
    const party = this.game.getPartySystem().getParty();
    const box = this.game.getPartySystem().getBox();
    
    const startY = 130;
    const cardWidth = 350;
    const cardHeight = 120;
    const spacing = 15;
    const startX = (display.width - cardWidth) / 2;

    // Party section title
    display.drawText('Team (3 slots)', startX, startY, {
      font: 'bold 20px system-ui', fill: '#888888'
    });

    // Draw party cards
    party.forEach((monster, index) => {
      const y = startY + 30 + index * (cardHeight + spacing);
      this.renderMonsterCard(monster, startX, y, cardWidth, cardHeight, index + 1, true);
    });

    // Box section
    const boxY = startY + 30 + 3 * (cardHeight + spacing) + 30;
    display.drawText(`Box (${box.length}/50)`, startX, boxY, {
      font: 'bold 20px system-ui', fill: '#888888'
    });

    // Draw box cards (up to 6)
    const visibleBox = box.slice(0, 6);
    visibleBox.forEach((monster, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = startX + col * (cardWidth / 2 + 10);
      const y = boxY + 30 + row * (cardHeight / 2 + 10);
      this.renderSmallMonsterCard(monster, x, y, cardWidth / 2, cardHeight / 2);
    });

    if (box.length > 6) {
      display.drawText(`+ ${box.length - 6} more in box`, startX, boxY + 30 + 2 * (cardHeight / 2 + 10), {
        font: '16px system-ui', fill: '#666666'
      });
    }
  }

  private renderMonsterCard(monster: MonsterInstance, x: number, y: number, width: number, height: number, slot: number, clickable: boolean): void {
    const display = MakkoEngine.display;
    const def = getMonsterDefinition(monster.id);
    
    // Card background
    display.drawRoundRect(x, y, width, height, 12, {
      fill: '#16213e',
      stroke: monster.currentHp <= 0 ? '#666666' : '#3b82f6',
      lineWidth: 2
    });
    
    // Slot number
    display.drawText(`#${slot}`, x + 15, y + 20, {
      font: 'bold 16px system-ui', fill: '#888888'
    });
    
    // Monster name and level
    display.drawText(`${def?.name || monster.id}`, x + 60, y + 20, {
      font: 'bold 24px system-ui', fill: '#ffffff'
    });
    display.drawText(`Lv. ${monster.level}`, x + 60, y + 50, {
      font: '18px system-ui', fill: '#888888'
    });
    
    // Type badge
    const typeColor = this.getTypeColor(def?.type);
    display.drawRoundRect(x + width - 100, y + 20, 80, 30, 6, {
      fill: typeColor
    });
    display.drawText(def?.type || 'Normal', x + width - 90, y + 27, {
      font: 'bold 14px system-ui', fill: '#ffffff'
    });
    
    // HP bar
    const hpPercent = monster.currentHp / monster.maxHp;
    const barColor = hpPercent > 0.5 ? '#22c55e' : hpPercent > 0.25 ? '#eab308' : '#ef4444';
    
    display.drawRoundRect(x + 15, y + height - 35, width - 30, 20, 4, { fill: '#333333' });
    display.drawRoundRect(x + 17, y + height - 33, (width - 34) * hpPercent, 16, 2, { fill: barColor });
    
    display.drawText(`HP: ${monster.currentHp}/${monster.maxHp}`, x + 20, y + height - 30, {
      font: '14px system-ui', fill: '#ffffff'
    });
    
    // XP bar (if not max level)
    if (monster.xpToNextLevel > 0) {
      const xpPercent = monster.xp / monster.xpToNextLevel;
      display.drawRoundRect(x + 15, y + height - 15, (width - 30) * 0.5, 10, 2, { fill: '#333333' });
      display.drawRoundRect(x + 15, y + height - 15, (width - 30) * 0.5 * xpPercent, 10, 2, { fill: '#a855f7' });
    }

    // Dead indicator
    if (monster.currentHp <= 0) {
      display.drawText('💀 FAINTED', x + width - 130, y + height - 25, {
        font: 'bold 16px system-ui', fill: '#ef4444'
      });
    }
  }

  private renderSmallMonsterCard(monster: MonsterInstance, x: number, y: number, width: number, height: number): void {
    const display = MakkoEngine.display;
    const def = getMonsterDefinition(monster.id);
    
    display.drawRoundRect(x, y, width, height, 8, {
      fill: '#16213e',
      stroke: '#555555',
      lineWidth: 1
    });
    
    display.drawText(`${def?.name || monster.id}`, x + 10, y + 10, {
      font: 'bold 14px system-ui', fill: '#ffffff'
    });
    display.drawText(`Lv${monster.level}`, x + 10, y + 30, {
      font: '12px system-ui', fill: '#888888'
    });
    
    // Mini HP bar
    const hpPercent = monster.currentHp / monster.maxHp;
    display.drawRoundRect(x + 10, y + height - 20, width - 20, 10, 2, { fill: '#333333' });
    display.drawRoundRect(x + 10, y + height - 20, (width - 20) * hpPercent, 10, 2, { 
      fill: hpPercent > 0.5 ? '#22c55e' : hpPercent > 0.25 ? '#eab308' : '#ef4444'
    });
  }

  private renderMonsterDetail(monster: MonsterInstance): void {
    const display = MakkoEngine.display;
    const def = getMonsterDefinition(monster.id);
    
    // Back to list button (persistent, created in init)
    if (this.detailBackButton) {
      this.detailBackButton.update(0);
      if (this.detailBackButton.isClicked()) {
        this.detailBackButton.onClick?.();
      }
      this.detailBackButton.render();
    }
    
    // Detail panel
    const panelX = 50;
    const panelY = 120;
    const panelWidth = display.width - 100;
    const panelHeight = display.height - 200;
    
    display.drawRoundRect(panelX, panelY, panelWidth, panelHeight, 16, {
      fill: '#16213e',
      stroke: '#3b82f6',
      lineWidth: 2
    });
    
    // Monster name and type
    display.drawText(`${def?.name || monster.id}`, panelX + 30, panelY + 30, {
      font: 'bold 36px system-ui', fill: '#ffffff'
    });
    
    const typeColor = this.getTypeColor(def?.type);
    display.drawRoundRect(panelX + 250, panelY + 30, 100, 35, 8, { fill: typeColor });
    display.drawText(def?.type || 'Normal', panelX + 260, panelY + 38, {
      font: 'bold 18px system-ui', fill: '#ffffff'
    });
    
    // Level and XP
    display.drawText(`Level ${monster.level}`, panelX + 30, panelY + 80, {
      font: '24px system-ui', fill: '#888888'
    });
    
    // XP bar
    const xpPercent = monster.xp / monster.xpToNextLevel;
    display.drawRoundRect(panelX + 30, panelY + 110, 300, 20, 4, { fill: '#333333' });
    display.drawRoundRect(panelX + 32, panelY + 112, 296 * xpPercent, 16, 2, { fill: '#a855f7' });
    display.drawText(`XP: ${monster.xp}/${monster.xpToNextLevel}`, panelX + 35, panelY + 115, {
      font: '14px system-ui', fill: '#ffffff'
    });
    
    // Stats
    const statsY = panelY + 160;
    display.drawText('Stats', panelX + 30, statsY, {
      font: 'bold 24px system-ui', fill: '#ffffff'
    });
    
    const stats = [
      { name: 'HP', value: `${monster.currentHp}/${monster.maxHp}`, color: '#22c55e' },
      { name: 'Attack', value: String(monster.attack), color: '#ef4444' },
      { name: 'Defense', value: String(monster.defense), color: '#3b82f6' },
      { name: 'Speed', value: String(monster.speed), color: '#eab308' }
    ];
    
    stats.forEach((stat, i) => {
      const statY = statsY + 40 + i * 45;
      display.drawText(stat.name, panelX + 30, statY, {
        font: '18px system-ui', fill: '#888888'
      });
      display.drawText(stat.value, panelX + 150, statY, {
        font: 'bold 20px system-ui', fill: stat.color
      });
      
      // Stat bar
      const maxStat = 150;
      const barWidth = 200;
      const barFill = Math.min(1, parseInt(stat.value) / maxStat) * barWidth;
      display.drawRoundRect(panelX + 200, statY + 5, barWidth, 15, 4, { fill: '#333333' });
      display.drawRoundRect(panelX + 200, statY + 5, barFill, 15, 4, { fill: stat.color });
    });
    
    // Moves
    const movesY = statsY + 220;
    display.drawText('Moves', panelX + 30, movesY, {
      font: 'bold 24px system-ui', fill: '#ffffff'
    });
    
    monster.moves.forEach((moveSlot, i) => {
      const moveDef = getMoveDefinition(moveSlot.moveId);
      if (!moveDef) return;
      
      const moveY = movesY + 40 + i * 50;
      const moveColor = this.getTypeColor(moveDef.type);
      
      display.drawRoundRect(panelX + 30, moveY, 400, 40, 8, { fill: moveColor + '40' });
      
      display.drawText(moveDef.name, panelX + 45, moveY + 10, {
        font: 'bold 18px system-ui', fill: '#ffffff'
      });
      display.drawText(`${moveDef.type}`, panelX + 200, moveY + 10, {
        font: '14px system-ui', fill: moveColor
      });
      display.drawText(`PP: ${moveSlot.pp}/${moveSlot.maxPp}`, panelX + 280, moveY + 10, {
        font: '16px system-ui', fill: '#888888'
      });
      display.drawText(`Power: ${moveDef.power}`, panelX + 380, moveY + 10, {
        font: '16px system-ui', fill: '#888888'
      });
    });
    
    // Evolution info
    if (def?.evolutionId && def?.evolutionLevel) {
      const evoDef = getMonsterDefinition(def.evolutionId);
      display.drawText(`Evolves into ${evoDef?.name} at Lv${def.evolutionLevel}`, panelX + 30, movesY + 260, {
        font: '18px system-ui', fill: '#888888'
      });
    }
  }

  private getTypeColor(type: string | undefined): string {
    const colors: Record<string, string> = {
      Fire: '#ff6b35',
      Water: '#4fc3f7',
      Grass: '#7cb342',
      Electric: '#ffc107',
      Normal: '#9e9e9e'
    };
    return colors[type || 'Normal'] || '#9e9e9e';
  }
}