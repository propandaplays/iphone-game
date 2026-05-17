// PvP Arena Scene
// MakkoEngine is a global

export class PvPArenaScene {
  constructor(game) {
    this.game = game;
    this.id = 'pvp';
    this.isSearching = false;
    this.searchTime = 0;
  }

  enter() {
    this.isSearching = false;
    this.searchTime = 0;
  }

  handleInput() {
    if (MakkoEngine.input.isKeyPressed('Escape')) {
      this.game.switchScene('menu');
    }
  }

  update(dt) {
    if (this.isSearching) {
      this.searchTime += dt / 1000;
      if (this.searchTime >= 2.5) {
        this.isSearching = false;
        this.game.switchScene('battle');
      }
    }
  }

  render() {
    const display = MakkoEngine.display;
    const centerX = display.width / 2;
    const centerY = display.height / 2;

    display.clear('#1a1a2e');

    // Arena decoration
    display.drawCircle(centerX, centerY + 50, 200, { fill: 'transparent', stroke: '#e94560', lineWidth: 4 });
    display.drawCircle(centerX, centerY + 50, 180, { fill: 'transparent', stroke: '#3b82f6', lineWidth: 2 });

    // Header
    display.drawRect(0, 0, display.width, 100, { fill: '#16213e' });
    display.drawRect(0, 98, display.width, 4, { fill: '#e94560' });
    display.drawText('⚔️ PvP Arena', 30, 40, { font: 'bold 36px system-ui', fill: '#ffffff' });
    display.drawText(`💎 ${this.game.getEconomySystem().getGems()}`, display.width - 120, 40, { font: '24px system-ui', fill: '#e94560' });
    display.drawText('🏆 Bronze', centerX - 50, 40, { font: '20px system-ui', fill: '#cd7f32' });

    if (this.isSearching) {
      // Searching animation
      const angle = (this.searchTime * 2) % (Math.PI * 2);
      display.drawArc(centerX, centerY, 80, angle, angle + Math.PI * 1.5, { stroke: '#e94560', lineWidth: 6 });
      
      display.drawText('🔍 Searching for opponent...', centerX - 150, centerY + 120, { font: '24px system-ui', fill: '#ffffff' });
      display.drawText(`${Math.floor(this.searchTime)}s`, centerX - 20, centerY + 160, { font: '18px system-ui', fill: '#888888' });

      // Cancel button
      display.drawRoundRect(centerX - 80, centerY + 200, 160, 50, 8, { fill: '#333333' });
      display.drawText('Cancel', centerX - 30, centerY + 215, { font: '18px system-ui', fill: '#ffffff' });

      if (MakkoEngine.input.isKeyPressed('Escape')) {
        this.isSearching = false;
      }
    } else {
      display.drawText('Test your team against other tamers!', centerX - 200, centerY - 50, { font: '24px system-ui', fill: '#888888' });

      // Rewards panel
      display.drawRoundRect(centerX - 200, centerY + 180, 400, 120, 12, { fill: '#16213e', stroke: '#3b82f6', lineWidth: 2 });
      display.drawText('🏆 Battle Rewards', centerX - 80, centerY + 195, { font: 'bold 20px system-ui', fill: '#ffffff' });
      display.drawText('Win: 50 💎 + Gold', centerX - 70, centerY + 240, { font: '18px system-ui', fill: '#22c55e' });
      display.drawText('Lose: 10 💎 consolation', centerX - 80, centerY + 265, { font: '16px system-ui', fill: '#888888' });

      // Team preview
      const party = this.game.getPartySystem().getParty();
      display.drawText('Your Team:', 50, 150, { font: 'bold 20px system-ui', fill: '#888888' });
      party.forEach((monster, i) => {
        display.drawText(`• ${monster.id} Lv${monster.level}`, 50, 180 + i * 30, { font: '16px system-ui', fill: '#ffffff' });
      });

      // Find Match button
      display.drawRoundRect(centerX - 125, centerY + 100, 250, 70, 8, { fill: '#3b82f6' });
      display.drawText('⚔️ Find Match', centerX - 60, centerY + 120, { font: 'bold 24px system-ui', fill: '#ffffff' });

      if (MakkoEngine.input.isKeyPressed('Space')) {
        if (party.length > 0 && this.game.getPartySystem().hasAliveMembers()) {
          this.isSearching = true;
          this.searchTime = 0;
        }
      }
    }

    // Back button
    display.drawRoundRect(20, 20, 120, 45, 8, { fill: '#333333' });
    display.drawText('← Back', 45, 35, { font: '18px system-ui', fill: '#ffffff' });
  }
}