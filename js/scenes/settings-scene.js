// Settings Scene
// MakkoEngine is a global

export class SettingsScene {
  constructor(game) {
    this.game = game;
    this.id = 'settings';
  }

  enter() {}

  handleInput() {
    if (MakkoEngine.input.isKeyPressed('Escape')) {
      this.game.switchScene('menu');
    }
  }

  update(dt) {}

  resetGame() {
    this.game.getPartySystem().deleteSave();
    this.game.getEconomySystem().deleteSave();
    this.game.getPartySystem().initWithStarter('flamepup');
    this.game.getPartySystem().save();
    this.game.getEconomySystem().reset();
    this.game.getEconomySystem().addItem('monster_ball', 5);
    this.game.getEconomySystem().save();
    console.log('Game reset!');
  }

  render() {
    const display = MakkoEngine.display;
    const centerX = display.width / 2;

    display.clear('#1a1a2e');

    // Header
    display.drawRect(0, 0, display.width, 100, { fill: '#16213e' });
    display.drawRect(0, 98, display.width, 4, { fill: '#e94560' });
    display.drawText('⚙️ Settings', 30, 40, { font: 'bold 36px system-ui', fill: '#ffffff' });

    // Settings panel
    display.drawRoundRect(centerX - 250, 150, 500, 400, 16, { fill: '#16213e', stroke: '#3b82f6', lineWidth: 2 });

    // Sound settings
    display.drawText('🔊 Sound', centerX - 200, 180, { font: 'bold 24px system-ui', fill: '#ffffff' });
    display.drawText('Music: On', centerX - 170, 220, { font: '18px system-ui', fill: '#888888' });
    display.drawText('SFX: On', centerX - 170, 250, { font: '18px system-ui', fill: '#888888' });

    // Display settings
    display.drawText('🖥️ Display', centerX - 200, 300, { font: 'bold 24px system-ui', fill: '#ffffff' });
    display.drawText('Canvas Size: 800×600', centerX - 170, 340, { font: '18px system-ui', fill: '#888888' });
    display.drawText('Touch Controls: Enabled', centerX - 170, 370, { font: '18px system-ui', fill: '#888888' });

    // Data section
    display.drawText('💾 Save Data', centerX - 200, 420, { font: 'bold 24px system-ui', fill: '#ffffff' });
    const party = this.game.getPartySystem();
    const economy = this.game.getEconomySystem();
    display.drawText(`Party: ${party.getParty().length} monsters`, centerX - 170, 460, { font: '18px system-ui', fill: '#888888' });
    display.drawText(`Gold: ${economy.getGold()} | Gems: ${economy.getGems()}`, centerX - 170, 490, { font: '18px system-ui', fill: '#888888' });

    // Reset button
    display.drawRoundRect(centerX - 100, 560, 200, 50, 8, { fill: '#dc2626' });
    display.drawText('🗑️ Reset Game', centerX - 50, 575, { font: 'bold 18px system-ui', fill: '#ffffff' });

    // Back button
    display.drawRoundRect(20, 20, 120, 45, 8, { fill: '#333333' });
    display.drawText('← Back', 45, 35, { font: '18px system-ui', fill: '#ffffff' });
  }
}