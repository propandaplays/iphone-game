// Party Scene
// MakkoEngine is a global
import { getMonsterDefinition } from '../data/monsters.js';

export class PartyScene {
  constructor(game) {
    this.game = game;
    this.id = 'party';
  }

  enter() {}

  handleInput() {
    if (MakkoEngine.input.isKeyPressed('Escape')) {
      this.game.switchScene('menu');
    }
  }

  update(dt) {}

  render() {
    const display = MakkoEngine.display;
    display.clear('#1a1a2e');

    // Header
    display.drawRect(0, 0, display.width, 100, { fill: '#16213e' });
    display.drawRect(0, 98, display.width, 4, { fill: '#e94560' });
    display.drawText('Party', 30, 35, { font: 'bold 36px system-ui', fill: '#ffffff' });

    // Gold/gems
    display.drawText(`💰 ${this.game.getEconomySystem().getGold()}`, display.width - 350, 35, { font: '18px system-ui', fill: '#ffc947' });
    display.drawText(`💎 ${this.game.getEconomySystem().getGems()}`, display.width - 200, 35, { font: '18px system-ui', fill: '#e94560' });

    // Party cards
    const party = this.game.getPartySystem().getParty();
    const startY = 150;
    
    display.drawText('Your Team:', 50, startY, { font: 'bold 24px system-ui', fill: '#888888' });

    party.forEach((monster, i) => {
      const def = getMonsterDefinition(monster.id);
      const y = startY + 50 + i * 100;
      
      // Card background
      display.drawRoundRect(50, y, 400, 80, 12, {
        fill: '#16213e',
        stroke: monster.currentHp > 0 ? '#3b82f6' : '#666666',
        lineWidth: 2
      });

      // Name and level
      display.drawText(`${def?.name || monster.id}`, 70, y + 15, { font: 'bold 22px system-ui', fill: '#ffffff' });
      display.drawText(`Lv. ${monster.level}`, 70, y + 45, { font: '16px system-ui', fill: '#888888' });

      // HP bar
      const hpPct = monster.currentHp / monster.maxHp;
      display.drawRoundRect(70, y + 60, 200, 12, 4, { fill: '#333333' });
      display.drawRoundRect(70, y + 60, 200 * hpPct, 12, 4, { fill: hpPct > 0.5 ? '#22c55e' : '#ef4444' });

      if (monster.currentHp <= 0) {
        display.drawText('💀 FAINTED', 300, y + 50, { font: '14px system-ui', fill: '#ef4444' });
      }
    });

    // Box info
    const box = this.game.getPartySystem().getBox();
    display.drawText(`Box: ${box.length}/50 monsters`, 500, startY, { font: '20px system-ui', fill: '#888888' });

    // Back button
    display.drawRoundRect(20, 20, 120, 45, 8, { fill: '#333333' });
    display.drawText('← Back', 45, 35, { font: '18px system-ui', fill: '#ffffff' });

    // Heal hint
    display.drawText('💚 Party healed!', display.width / 2 - 60, display.height - 50, { font: '16px system-ui', fill: '#22c55e' });
  }
}