/**
 * Shop Scene
 * 
 * Gold shop for items + Gem IAP store.
 */

import { MakkoEngine } from '@makko/engine';
import { BaseScene } from '../scene/base-scene';
import { Button } from '../ui/ui-elements';
import { SHOP_ITEMS, IAP_BUNDLES } from '../systems/EconomySystem';
import type { Game } from '../game/game';

export class ShopScene extends BaseScene {
  readonly id = 'shop';

  private game: Game;
  private backButton: Button;
  private itemsTabButton: Button;
  private gemsTabButton: Button;
  
  // State
  private currentTab: 'items' | 'gems' = 'items';
  private itemButtons: Button[] = [];
  private iapButtons: Button[] = [];

  constructor(game: Game) {
    super();
    this.game = game;
    
    this.backButton = new Button(20, 20, 120, 45, '← Back', { variant: 'ghost' });
    this.backButton.onClick = () => this.game.switchScene('menu');
    
    this.itemsTabButton = new Button(80, 130, 150, 50, '🛍️ Items', { variant: 'primary' });
    this.gemsTabButton = new Button(250, 130, 150, 50, '💎 Gems', { variant: 'primary' });
    
    this.itemsTabButton.onClick = () => { this.currentTab = 'items'; this.createButtons(); };
    this.gemsTabButton.onClick = () => { this.currentTab = 'gems'; this.createButtons(); };
  }

  init(): void {
    this.currentTab = 'items';
    this.createButtons();
  }

  enter(_previousScene?: string): void {
    this.init();
  }

  private createButtons(): void {
    const display = MakkoEngine.display;
    this.itemButtons = [];
    this.iapButtons = [];

    if (this.currentTab === 'items') {
      const startX = 80;
      const startY = 200;
      const itemWidth = 200;
      const itemHeight = 140;
      const spacing = 20;

      SHOP_ITEMS.forEach((item, index) => {
        const col = index % 3;
        const row = Math.floor(index / 3);
        const x = startX + col * (itemWidth + spacing);
        const y = startY + row * (itemHeight + spacing);

        const btn = new Button(x, y, itemWidth, itemHeight, '', { variant: 'primary' });
        btn.onClick = () => this.purchaseItem(item);
        this.itemButtons.push(btn);
      });
    } else {
      const startX = (display.width - 350) / 2;
      const startY = 220;
      const bundleWidth = 400;
      const bundleHeight = 120;
      const spacing = 20;

      IAP_BUNDLES.forEach((bundle, index) => {
        const y = startY + index * (bundleHeight + spacing);

        const btn = new Button(startX, y, bundleWidth, bundleHeight, '', { variant: 'primary' });
        btn.onClick = () => this.purchaseGemBundle(bundle);
        this.iapButtons.push(btn);
      });
    }
  }

  private purchaseItem(item: typeof SHOP_ITEMS[0]): void {
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

  private purchaseGemBundle(bundle: typeof IAP_BUNDLES[0]): void {
    const iapSystem = this.game.getIAPSystem();
    
    iapSystem.purchase(bundle.id, {
      onSuccess: (gems) => {
        console.log(`Purchase successful! Added ${gems} gems.`);
      },
      onFailure: (error) => {
        console.log(`Purchase failed: ${error}`);
      }
    });
  }

  handleInput(): void {
    this.backButton.update(0);
    this.itemsTabButton.update(0);
    this.gemsTabButton.update(0);
    
    if (this.backButton.isClicked()) {
      this.backButton.onClick?.();
    }
    if (this.itemsTabButton.isClicked()) {
      this.itemsTabButton.onClick?.();
    }
    if (this.gemsTabButton.isClicked()) {
      this.gemsTabButton.onClick?.();
    }
    
    // Update item buttons
    for (const btn of this.itemButtons) {
      btn.update(0);
      if (btn.isClicked()) btn.onClick?.();
    }
    for (const btn of this.iapButtons) {
      btn.update(0);
      if (btn.isClicked()) btn.onClick?.();
    }
  }

  update(dt: number): void {
    this.backButton.update(dt);
    this.itemsTabButton.update(dt);
    this.gemsTabButton.update(dt);
    for (const btn of this.itemButtons) btn.update(dt);
    for (const btn of this.iapButtons) btn.update(dt);
  }

  render(): void {
    const display = MakkoEngine.display;
    
    // Draw background
    display.clear('#1a1a2e');
    
    // Draw header
    display.drawRect(0, 0, display.width, 120, { fill: '#16213e' });
    display.drawRect(0, 118, display.width, 4, { fill: '#e94560' });
    
    // Draw title
    display.drawText('🛒 Shop', 30, 40, {
      font: 'bold 36px system-ui', fill: '#ffffff'
    });
    
    // Draw currency
    const economy = this.game.getEconomySystem();
    display.drawText(`💰 ${economy.getGold()} Gold`, display.width - 250, 40, {
      font: '24px system-ui', fill: '#ffc947'
    });
    display.drawText(`💎 ${economy.getGems()} Gems`, display.width - 120, 40, {
      font: '24px system-ui', fill: '#e94560'
    });

    // Draw tabs
    this.itemsTabButton.variant = this.currentTab === 'items' ? 'primary' : 'ghost';
    this.gemsTabButton.variant = this.currentTab === 'gems' ? 'primary' : 'ghost';
    this.itemsTabButton.render();
    this.gemsTabButton.render();
    
    // Draw items
    if (this.currentTab === 'items') {
      this.renderItemShop();
    } else {
      this.renderGemStore();
    }

    // Render buttons
    this.backButton.render();
    for (const btn of this.itemButtons) btn.render();
    for (const btn of this.iapButtons) btn.render();
  }

  private renderItemShop(): void {
    const display = MakkoEngine.display;
    const economy = this.game.getEconomySystem();
    const startX = 80;
    const startY = 200;
    const itemWidth = 200;
    const itemHeight = 140;
    const spacing = 20;

    display.drawText('Buy items with Gold', startX, startY - 40, {
      font: '20px system-ui', fill: '#888888'
    });

    SHOP_ITEMS.forEach((item, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = startX + col * (itemWidth + spacing);
      const y = startY + row * (itemHeight + spacing);

      // Item card
      const canAfford = economy.getGold() >= item.price;
      display.drawRoundRect(x, y, itemWidth, itemHeight, 12, {
        fill: '#16213e',
        stroke: canAfford ? '#3b82f6' : '#666666',
        lineWidth: 2
      });

      // Item icon
      const icon = item.type === 'ball' ? '🪣' : '💊';
      display.drawText(icon, x + 20, y + 20, {
        font: '48px system-ui', fill: '#ffffff'
      });

      // Item name
      display.drawText(item.name, x + 80, y + 25, {
        font: 'bold 18px system-ui', fill: '#ffffff'
      });

      // Effect
      display.drawText(item.effect || '', x + 80, y + 50, {
        font: '14px system-ui', fill: '#888888'
      });

      // Price
      display.drawText(`${item.price} 💰`, x + 20, y + itemHeight - 40, {
        font: 'bold 20px system-ui', fill: canAfford ? '#ffc947' : '#ef4444'
      });

      // Owned count
      const owned = economy.getItemCount(item.id);
      if (owned > 0) {
        display.drawText(`Owned: ${owned}`, x + itemWidth - 80, y + itemHeight - 40, {
          font: '14px system-ui', fill: '#888888'
        });
      }
    });
  }

  private renderGemStore(): void {
    const display = MakkoEngine.display;
    const startX = (display.width - 400) / 2;
    const startY = 220;
    const bundleWidth = 400;
    const bundleHeight = 120;
    const spacing = 20;

    display.drawText('Buy Gems with Real Money', startX, startY - 40, {
      font: '20px system-ui', fill: '#888888'
    });

    display.drawText('💎 Gems can be used for premium items and rare monsters', startX, startY - 10, {
      font: '16px system-ui', fill: '#666666'
    });

    IAP_BUNDLES.forEach((bundle, index) => {
      const y = startY + 30 + index * (bundleHeight + spacing);

      // Bundle card
      display.drawRoundRect(startX, y, bundleWidth, bundleHeight, 12, {
        fill: '#16213e',
        stroke: '#e94560',
        lineWidth: 2
      });

      // Bundle name
      display.drawText(bundle.displayName, startX + 30, y + 20, {
        font: 'bold 24px system-ui', fill: '#ffffff'
      });

      // Gem amount
      display.drawText(`💎 ${bundle.gems} Gems`, startX + 30, y + 55, {
        font: 'bold 28px system-ui', fill: '#ffc107'
      });

      // Price button
      display.drawRoundRect(startX + bundleWidth - 120, y + 35, 100, 50, 8, {
        fill: '#22c55e'
      });
      display.drawText(bundle.price, startX + bundleWidth - 110, y + 50, {
        font: 'bold 24px system-ui', fill: '#ffffff'
      });
    });

    // IAP note
    display.drawText('IAP Stub: Implement with @capacitor/purchases for real payments', startX, display.height - 50, {
      font: '14px system-ui', fill: '#666666'
    });
  }
}