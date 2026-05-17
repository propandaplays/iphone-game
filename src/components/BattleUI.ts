/**
 * BattleUI Component
 * 
 * Touch-friendly battle interface with action menus and HP bars.
 */

import { MakkoEngine } from '@makko/engine';
import { Button } from '../ui/ui-elements';
import { MonsterInstance } from '../systems/MonsterSystem';
import { getMoveDefinition } from '../data/moves';
import { getMonsterDefinition } from '../data/monsters';

export type BattleUIMode = 'action' | 'moves' | 'capture' | 'switch' | 'item' | 'result';

export interface BattleUIAction {
  type: 'attack' | 'capture' | 'item' | 'switch' | 'defend' | 'flee';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

export class BattleUI {
  // UI Elements
  private actionButtons: Button[] = [];
  private moveButtons: Button[] = [];
  private cancelButton: Button | null = null;
  
  // State
  private mode: BattleUIMode = 'action';
  private onAction: ((action: BattleUIAction) => void) | null = null;
  
  // Player monster reference for move display
  private playerMonster: MonsterInstance | null = null;
  private partyMonsters: MonsterInstance[] = [];
  private inventory: { id: string; quantity: number }[] = [];
  private captureBalls: { id: string; quantity: number }[] = [];
  
  // Layout
  private panelY: number = 0;
  private panelHeight: number = 0;

  constructor() {
    this.panelY = MakkoEngine.display.height - 200;
    this.panelHeight = 200;
  }

  setCallbacks(onAction: (action: BattleUIAction) => void): void {
    this.onAction = onAction;
  }

  setPlayerMonster(monster: MonsterInstance): void {
    this.playerMonster = monster;
  }

  setPartyMonsters(monsters: MonsterInstance[]): void {
    this.partyMonsters = monsters;
  }

  setInventory(inventory: { id: string; quantity: number }[], captureBalls: { id: string; quantity: number }[]): void {
    this.inventory = inventory;
    this.captureBalls = captureBalls;
  }

  setMode(mode: BattleUIMode): void {
    this.mode = mode;
    this.createButtons();
  }

  private createButtons(): void {
    this.actionButtons = [];
    this.moveButtons = [];
    this.cancelButton = null;

    const buttonWidth = 150;
    const buttonHeight = 50;
    const startX = 50;
    const startY = this.panelY + 30;
    const spacing = 10;

    switch (this.mode) {
      case 'action':
        this.createActionButtons(startX, startY, buttonWidth, buttonHeight, spacing);
        break;
      case 'moves':
        this.createMoveButtons(startX, startY, buttonWidth, buttonHeight, spacing);
        break;
      case 'capture':
        this.createCaptureButtons(startX, startY, buttonWidth, buttonHeight, spacing);
        break;
      case 'switch':
        this.createSwitchButtons(startX, startY, buttonWidth, buttonHeight, spacing);
        break;
      case 'item':
        this.createItemButtons(startX, startY, buttonWidth, buttonHeight, spacing);
        break;
    }
  }

  private createActionButtons(startX: number, startY: number, bw: number, bh: number, spacing: number): void {
    interface ActionItem {
      label: string;
      type?: BattleUIMode;
      action?: BattleUIAction;
    }
    
    const actions: ActionItem[] = [
      { label: '⚔️ Fight', type: 'moves' },
      { label: '🪣 Capture', type: 'capture' },
      { label: '🎒 Item', type: 'item' },
      { label: '🔄 Switch', type: 'switch' },
      { label: '🛡️ Defend', action: { type: 'defend' } },
      { label: '🏃 Flee', action: { type: 'flee' } }
    ];

    actions.forEach((act, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = startX + col * (bw + spacing);
      const y = startY + row * (bh + spacing);

      const btn = new Button(x, y, bw, bh, act.label, { variant: 'primary' });
      
      if (act.action) {
        btn.onClick = () => {
          if (this.onAction) this.onAction(act.action);
        };
      } else if (act.type) {
        btn.onClick = () => {
          this.setMode(act.type);
        };
      }
      
      this.actionButtons.push(btn);
    });
  }

  private createMoveButtons(startX: number, startY: number, bw: number, bh: number, spacing: number): void {
    if (!this.playerMonster) return;

    // Back button
    this.cancelButton = new Button(startX, startY, bw, bh, '← Back', { variant: 'ghost' });
    this.cancelButton.onClick = () => this.setMode('action');

    // Move buttons
    const startY2 = startY + bh + spacing;
    this.playerMonster.moves.forEach((moveSlot, index) => {
      const moveDef = getMoveDefinition(moveSlot.moveId);
      if (!moveDef) return;

      const label = `${moveDef.name} (${moveSlot.pp}/${moveSlot.maxPp})`;
      const disabled = moveSlot.pp <= 0;
      
      const btn = new Button(
        startX + (index % 2) * (bw + spacing),
        startY2 + Math.floor(index / 2) * (bh + spacing),
        bw * 2 + spacing,
        bh,
        label,
        { variant: 'primary', disabled }
      );
      
      btn.onClick = () => {
        if (this.onAction) {
          this.onAction({ type: 'attack', data: { moveIndex: index } });
        }
      };
      
      this.moveButtons.push(btn);
    });
  }

  private createCaptureButtons(startX: number, startY: number, bw: number, bh: number, spacing: number): void {
    // Back button
    this.cancelButton = new Button(startX, startY, bw, bh, '← Back', { variant: 'ghost' });
    this.cancelButton.onClick = () => this.setMode('action');

    // Capture ball buttons
    const startY2 = startY + bh + spacing;
    const ballNames: Record<string, string> = {
      'monster_ball': '🪣 Monster Ball',
      'great_ball': '🔵 Great Ball',
      'ultra_ball': '🟣 Ultra Ball',
      'master_ball': '⭐ Master Ball'
    };

    this.captureBalls.forEach((ball, index) => {
      const label = `${ballNames[ball.id] || ball.id} (${ball.quantity})`;
      const disabled = ball.quantity <= 0;
      
      const btn = new Button(
        startX + (index % 2) * (bw + spacing),
        startY2 + Math.floor(index / 2) * (bh + spacing),
        bw,
        bh,
        label,
        { variant: 'primary', disabled }
      );
      
      btn.onClick = () => {
        if (this.onAction && ball.quantity > 0) {
          this.onAction({ type: 'capture', data: { ballType: ball.id } });
        }
      };
      
      this.moveButtons.push(btn);
    });

    // If no balls, show message
    if (this.captureBalls.length === 0 || this.captureBalls.every(b => b.quantity <= 0)) {
      const btn = new Button(startX, startY2, bw * 2, bh, 'No capture balls!', { variant: 'ghost', disabled: true });
      this.moveButtons.push(btn);
    }
  }

  private createSwitchButtons(startX: number, startY: number, bw: number, bh: number, spacing: number): void {
    // Back button
    this.cancelButton = new Button(startX, startY, bw, bh, '← Back', { variant: 'ghost' });
    this.cancelButton.onClick = () => this.setMode('action');

    // Party member buttons
    const startY2 = startY + bh + spacing;
    this.partyMonsters.forEach((monster, index) => {
      const def = getMonsterDefinition(monster.id);
      const label = `${def?.name || monster.id} Lv${monster.level} HP:${monster.currentHp}/${monster.maxHp}`;
      const disabled = monster.currentHp <= 0 || monster === this.playerMonster;
      
      const btn = new Button(
        startX + (index % 2) * (bw + spacing),
        startY2 + Math.floor(index / 2) * (bh + spacing),
        bw * 2 + spacing,
        bh,
        label,
        { variant: 'primary', disabled }
      );
      
      btn.onClick = () => {
        if (this.onAction) {
          this.onAction({ type: 'switch', data: { partyIndex: index } });
        }
      };
      
      this.moveButtons.push(btn);
    });
  }

  private createItemButtons(startX: number, startY: number, bw: number, bh: number, spacing: number): void {
    // Back button
    this.cancelButton = new Button(startX, startY, bw, bh, '← Back', { variant: 'ghost' });
    this.cancelButton.onClick = () => this.setMode('action');

    // Healing item buttons
    const startY2 = startY + bh + spacing;
    const healingItems = this.inventory.filter(item => 
      item.id === 'potion' || item.id === 'super_potion' || item.id === 'full_heal'
    );

    const itemNames: Record<string, string> = {
      'potion': '💊 Potion (+20 HP)',
      'super_potion': '💊 Super Potion (+50 HP)',
      'full_heal': '💊 Full Heal (All HP)'
    };

    if (healingItems.length === 0) {
      const btn = new Button(startX, startY2, bw * 2, bh, 'No healing items!', { variant: 'ghost', disabled: true });
      this.moveButtons.push(btn);
    } else {
      healingItems.forEach((item, index) => {
        const label = `${itemNames[item.id] || item.id} (${item.quantity})`;
        
        const btn = new Button(
          startX + (index % 2) * (bw + spacing),
          startY2 + Math.floor(index / 2) * (bh + spacing),
          bw * 2 + spacing,
          bh,
          label,
          { variant: 'primary' }
        );
        
        btn.onClick = () => {
          if (this.onAction) {
            this.onAction({ type: 'item', data: { itemId: item.id } });
          }
        };
        
        this.moveButtons.push(btn);
      });
    }
  }

  update(dt: number): void {
    // Update all buttons
    for (const btn of this.actionButtons) btn.update(dt);
    for (const btn of this.moveButtons) btn.update(dt);
    this.cancelButton?.update(dt);
  }

  render(): void {
    const display = MakkoEngine.display;

    // Draw bottom panel background
    display.drawRect(0, this.panelY, display.width, this.panelHeight, {
      fill: 'rgba(22, 33, 62, 0.95)'
    });
    
    // Draw panel border
    display.drawRect(0, this.panelY, display.width, 4, {
      fill: '#e94560'
    });

    // Render buttons based on mode
    switch (this.mode) {
      case 'action':
        for (const btn of this.actionButtons) btn.render();
        break;
      case 'moves':
      case 'capture':
      case 'switch':
      case 'item':
        this.cancelButton?.render();
        for (const btn of this.moveButtons) btn.render();
        break;
    }
  }

  handleInput(): void {
    // Check for button clicks
    for (const btn of this.actionButtons) {
      btn.update(0);
      if (btn.isClicked()) btn.onClick?.();
    }
    for (const btn of this.moveButtons) {
      btn.update(0);
      if (btn.isClicked()) btn.onClick?.();
    }
    if (this.cancelButton) {
      this.cancelButton.update(0);
      if (this.cancelButton.isClicked()) this.cancelButton.onClick?.();
    }
  }
}

/**
 * Render HP bars and monster info for battle.
 */
export function renderMonsterInfo(
  monster: MonsterInstance,
  x: number,
  y: number,
  width: number,
  isPlayer: boolean
): void {
  const display = MakkoEngine.display;
  const def = getMonsterDefinition(monster.id);
  
  // Name and level
  const nameFont = 'bold 18px system-ui';
  const name = `${def?.name || monster.id}  Lv${monster.level}`;
  display.drawText(name, x, y, { font: nameFont, fill: '#ffffff' });
  
  // HP text
  const hpFont = '14px system-ui';
  const hpText = `HP: ${monster.currentHp}/${monster.maxHp}`;
  display.drawText(hpText, x, y + 25, { font: hpFont, fill: '#888888' });
  
  // HP bar
  const barY = y + 45;
  const barWidth = width;
  const barHeight = 16;
  
  // Bar background
  display.drawRoundRect(x, barY, barWidth, barHeight, 4, {
    fill: '#333333',
    stroke: '#555555',
    lineWidth: 1
  });
  
  // HP fill
  const hpPercent = monster.currentHp / monster.maxHp;
  const fillColor = hpPercent > 0.5 ? '#22c55e' : hpPercent > 0.25 ? '#eab308' : '#ef4444';
  const fillWidth = barWidth * hpPercent;
  
  if (fillWidth > 0) {
    display.drawRoundRect(x + 2, barY + 2, fillWidth - 4, barHeight - 4, 2, {
      fill: fillColor
    });
  }
  
  // Status indicator
  if (monster.status !== 'none') {
    const statusColors: Record<string, string> = {
      burn: '#ff6b35',
      poison: '#9333ea',
      paralyze: '#ffc107',
      sleep: '#3b82f6'
    };
    const statusText = `💫 ${monster.status}`;
    display.drawText(statusText, x + width + 10, y, {
      font: '14px system-ui',
      fill: statusColors[monster.status] || '#ffffff'
    });
  }
}

/**
 * Render floating damage numbers.
 */
export class DamageNumber {
  private x: number;
  private y: number;
  private text: string;
  private color: string;
  private lifetime: number = 1000;
  private age: number = 0;

  constructor(x: number, y: number, damage: number, isCritical: boolean = false) {
    this.x = x;
    this.y = y;
    this.text = isCritical ? `${damage}! CRIT!` : `-${damage}`;
    this.color = isCritical ? '#ffcc00' : '#ff4444';
  }

  update(dt: number): boolean {
    this.age += dt;
    this.y -= dt * 0.05; // Float up
    return this.age < this.lifetime;
  }

  render(): void {
    const display = MakkoEngine.display;
    const scale = 1 + (this.age / this.lifetime) * 0.3;
    
    display.drawText(this.text, this.x, this.y, {
      font: `bold ${Math.floor(24 * scale)}px system-ui`,
      fill: this.color
    });
  }
}