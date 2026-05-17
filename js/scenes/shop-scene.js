// Shop Scene
// MakkoEngine is a global
import { SHOP_ITEMS } from '../systems/EconomySystem.js';

export class ShopScene {
  constructor(game) {
    this.game = game;
    this.id = 'shop';
    this.currentTab = 'items';
  }

  enter() {}

  handleInput() {
    if (MakkoEngine.input.isKeyPressed('Escape')) {
      this.game.switchScene('menu');
    }
  }

  update(dt) {}

  buyItem(item) {
    const economy = this.game.getEconomySystem();
    if (economy.getGold() < item.price) {
      console.log('Not enough gold!');
      return;
    }
    if (economy.buyItem(item)) {
      economy.save();
      console.log(`Purchased ${item.name}!`);
    }
  }

  render() {
    const display = MakkoEngine.display;
    display.clear('#1a1a2e');

    // Header
    display.drawRect(0, 0, display.width, 120, { fill: '#16213e' });
    display.drawRect(0, 118, display.width, 4, { fill: '#e94560' });
    display.drawText('🛒 Shop', 30, 40, { font: 'bold 36px system-ui', fill: '#ffffff' });

    // Currency
    display.drawText(`💰 ${this.game.getEconomySystem().getGold()} Gold`, display.width - 250, 40, { font: '24px system-ui', fill: '#ffc947' });
    display.drawText(`💎 ${this.game.getEconomySystem().getGems()} Gems`, display.width - 120, 40, { font: '24px system-ui', fill: '#e94560' });

    // Tabs
    display.drawRoundRect(80, 150, 150, 50, 8, { fill: this.currentTab === 'items' ? '#3b82f6' : '#333333' });
    display.drawText('🛍️ Items', 95, 165, { font: 'bold 20px system-ui', fill: '#ffffff' });
    display.drawRoundRect(250, 150, 150, 50, 8, { fill: this.currentTab === 'gems' ? '#e94560' : '#333333' });
    display.drawText('💎 Gems', 265, 165, { font: 'bold 20px system-ui', fill: '#ffffff' });

    // Item grid
    const economy = this.game.getEconomySystem();
    SHOP_ITEMS.forEach((item, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 80 + col * 220;
      const y = 230 + row * 140;

      const canAfford = economy.getGold() >= item.price;
      display.drawRoundRect(x, y, 200, 120, 12, {
        fill: '#16213e',
        stroke: canAfford ? '#3b82f6' : '#666666',
        lineWidth: 2
      });

      // Icon
      const icon = item.type === 'ball' ? '🪣' : '💊';
      display.drawText(icon, x + 20, y + 15, { font: '40px system-ui', fill: '#ffffff' });

      // Name
      display.drawText(item.name, x + 80, y + 20, { font: 'bold 18px system-ui', fill: '#ffffff' });

      // Effect
      display.drawText(item.effect || '', x + 80, y + 45, { font: '14px system-ui', fill: '#888888' });

      // Price
      display.drawText(`${item.price} 💰`, x + 20, y + 85, {
        font: 'bold 20px system-ui',
        fill: canAfford ? '#ffc947' : '#ef4444'
      });

      // Owned
      const owned = economy.getItemCount(item.id);
      if (owned > 0) {
        display.drawText(`Owned: ${owned}`, x + 120, y + 85, { font: '14px system-ui', fill: '#888888' });
      }
    });

    // Back button
    display.drawRoundRect(20, 20, 120, 45, 8, { fill: '#333333' });
    display.drawText('← Back', 45, 35, { font: '18px system-ui', fill: '#ffffff' });

    // IAP note
    display.drawText('💎 IAP Stub: Implement with @capacitor/purchases', 80, display.height - 40, { font: '14px system-ui', fill: '#666666' });
  }
}